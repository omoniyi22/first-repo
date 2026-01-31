// Supabase Edge Function with manual JWT authentication for Gemini Pro Vision 
// WITH AI INTERPRETATION (judge feedback) added - FULL VERSION
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { encode as base64Encode } from 'https://deno.land/std@0.192.0/encoding/base64.ts';
import { crypto } from 'https://deno.land/std@0.192.0/crypto/mod.ts';
import { decode as base64Decode } from 'https://deno.land/std@0.192.0/encoding/base64.ts';

import {
  getSkillsByDifficulty,
  generateLevelRestrictionsPrompt
} from './dressageSkillsByDifficulty.ts';

import { getLevelsByCountry } from './countriesData.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '', 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\\n/g, '')
    .replace(/\r?\n/g, '')
    .trim();
  return base64Decode(base64).buffer;
}

async function getGoogleAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  
  const encoder = new TextEncoder();
  const encodedHeader = base64Encode(encoder.encode(JSON.stringify(header)));
  const encodedPayload = base64Encode(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  
  const keyData = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(serviceAccount.private_key),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    keyData,
    encoder.encode(unsignedToken)
  );
  
  const signedJWT = `${unsignedToken}.${base64Encode(new Uint8Array(signature))}`;
  
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signedJWT
    })
  });
  
  const json = await res.json();
  if (!json.access_token) throw new Error('Failed to get access token');
  return json.access_token;
}

// Helper function to generate fallback AI interpretation for document analysis
function generateFallbackDocumentFeedback(documentAnalysis: any) {
  const complaints: string[] = [];
  const interpretations: string[] = [];
  const areas: Array<{name: string, fix: string}> = [];

  // Extract complaints from generalComments
  if (documentAnalysis.generalComments && typeof documentAnalysis.generalComments === 'object') {
    Object.entries(documentAnalysis.generalComments).forEach(([judge, comment]) => {
      if (comment && typeof comment === 'string' && comment.trim()) {
        complaints.push(`${judge}: ${comment}`);
        
        if (comment.toLowerCase().includes('forward') || comment.toLowerCase().includes('energy')) {
          interpretations.push("The horse needs more impulsion and engagement from behind");
          if (!areas.some(a => a.name === "Forward Energy")) {
            areas.push({
              name: "Forward Energy",
              fix: "Practice transitions with more leg aid and maintain forward thinking"
            });
          }
        } else if (comment.toLowerCase().includes('rhythm') || comment.toLowerCase().includes('tempo')) {
          interpretations.push("Tempo fluctuations affecting balance and geometry");
          if (!areas.some(a => a.name === "Rhythm Consistency")) {
            areas.push({
              name: "Rhythm Consistency",
              fix: "Use counting out loud to maintain steady tempo throughout exercises"
            });
          }
        } else if (comment.toLowerCase().includes('balance') || comment.toLowerCase().includes('straight')) {
          interpretations.push("Alignment issues affecting movement quality");
          if (!areas.some(a => a.name === "Balance & Straightness")) {
            areas.push({
              name: "Balance & Straightness",
              fix: "Focus on equal rein contact and leg pressure for better alignment"
            });
          }
        } else if (comment.toLowerCase().includes('contact') || comment.toLowerCase().includes('connection')) {
          interpretations.push("Rein contact and connection needs improvement");
          if (!areas.some(a => a.name === "Contact Quality")) {
            areas.push({
              name: "Contact Quality",
              fix: "Work on consistent, elastic contact with soft, following hands"
            });
          }
        }
      }
    });
  }

  // Extract from weaknesses
  if (documentAnalysis.weaknesses && Array.isArray(documentAnalysis.weaknesses)) {
    documentAnalysis.weaknesses.slice(0, 2).forEach((weakness: string) => {
      if (weakness && typeof weakness === 'string') {
        if (!areas.some(a => a.name.toLowerCase().includes(weakness.toLowerCase().slice(0, 10)))) {
          areas.push({
            name: weakness,
            fix: `Practice targeted exercises to improve ${weakness.toLowerCase()}`
          });
        }
      }
    });
  }

  // Fallback if no specific complaints found
  if (complaints.length === 0 && documentAnalysis.weaknesses && documentAnalysis.weaknesses.length > 0) {
    complaints.push(`Analysis identified weaknesses in: ${documentAnalysis.weaknesses.slice(0, 3).join(', ')}`);
    interpretations.push("Specific technical areas need focused attention");
  }

  if (complaints.length === 0) {
    const percentage = documentAnalysis.percentage || "unknown";
    complaints.push(`Document analysis scored ${percentage}%`);
    interpretations.push("Overall performance needs refinement");
  }

  if (areas.length === 0) {
    areas.push({
      name: "Overall Execution",
      fix: "Practice targeted exercises focusing on consistency and quality"
    });
  }

  return {
    complaints: complaints.slice(0, 5),
    interpretations: interpretations.slice(0, 5),
    areas: areas.slice(0, 3)
  };
}

// Helper function to generate fallback judge feedback
function generateFallbackJudgeFeedback(analysisResult: any) {
  const complaints: string[] = [];
  const interpretations: string[] = [];
  const areas: Array<{name: string, fix: string}> = [];

  if (analysisResult.generalComments) {
    Object.entries(analysisResult.generalComments).forEach(([judge, comment]) => {
      if (comment && typeof comment === 'string' && comment.trim()) {
        complaints.push(`${judge}: ${comment}`);
        
        if (comment.toLowerCase().includes('forward') || comment.toLowerCase().includes('energy')) {
          interpretations.push("The horse needs more impulsion and engagement from behind");
          if (!areas.some(a => a.name === "Forward Energy")) {
            areas.push({
              name: "Forward Energy",
              fix: "Practice transitions with more leg aid and maintain forward thinking"
            });
          }
        } else if (comment.toLowerCase().includes('rhythm') || comment.toLowerCase().includes('tempo')) {
          interpretations.push("Tempo fluctuations affecting balance and geometry");
          if (!areas.some(a => a.name === "Rhythm Consistency")) {
            areas.push({
              name: "Rhythm Consistency",
              fix: "Use counting out loud to maintain steady tempo throughout exercises"
            });
          }
        } else if (comment.toLowerCase().includes('balance') || comment.toLowerCase().includes('straight')) {
          interpretations.push("Alignment issues affecting movement quality");
          if (!areas.some(a => a.name === "Balance & Straightness")) {
            areas.push({
              name: "Balance & Straightness",
              fix: "Focus on equal rein contact and leg pressure for better alignment"
            });
          }
        } else if (comment.toLowerCase().includes('contact') || comment.toLowerCase().includes('connection')) {
          interpretations.push("Rein contact and connection needs improvement");
          if (!areas.some(a => a.name === "Contact Quality")) {
            areas.push({
              name: "Contact Quality",
              fix: "Work on consistent, elastic contact with soft, following hands"
            });
          }
        }
      }
    });
  }

  if (analysisResult.weaknesses && Array.isArray(analysisResult.weaknesses)) {
    analysisResult.weaknesses.slice(0, 2).forEach((weakness: string) => {
      if (!areas.some(a => a.name.toLowerCase().includes(weakness.toLowerCase().slice(0, 10)))) {
        areas.push({
          name: weakness,
          fix: `Practice targeted exercises to improve ${weakness.toLowerCase()}`
        });
      }
    });
  }

  return {
    complaints: complaints.length > 0 ? complaints.slice(0, 5) : ["No specific complaints recorded"],
    interpretations: interpretations.length > 0 ? interpretations.slice(0, 5) : ["General execution needs improvement"],
    areas: areas.length > 0 ? areas.slice(0, 3) : [
      {
        name: "Overall Execution",
        fix: "Practice targeted exercises focusing on consistency and quality"
      }
    ]
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const raw = Deno.env.get('GEMINI_SERVICE_ACCOUNT_JSON');
    if (!raw) throw new Error('GEMINI_SERVICE_ACCOUNT_JSON is not set');
    
    const serviceAccount = JSON.parse(raw);
    console.log("Using project:", serviceAccount.project_id);

    const { documentId, base64Image, extractionId, useVerifiedData } = await req.json();

    if (!documentId) {
      return new Response(
        JSON.stringify({ error: 'Missing documentId' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!useVerifiedData && !base64Image) {
      return new Response(
        JSON.stringify({ error: 'Missing base64Image for fresh extraction' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // === START: ANALYSIS LIMIT CHECK ===
    const { data: documentData, error: docError } = await supabase
      .from("document_analysis")
      .select("user_id, horse_id, horse_name, test_level, discipline, document_date, competition_type, user_country, health_status, health_details")
      .eq("id", documentId)
      .single();

    if (docError || !documentData) {
      return new Response(JSON.stringify({
        error: 'Document not found'
      }), {
        status: 404,
        headers: corsHeaders
      });
    }

    const userId = documentData.user_id;

    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('plan_id, pricing_plans(analysis_limit, name)')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (subscriptionError) {
      return new Response(JSON.stringify({
        error: 'Failed to fetch user subscription'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    const analysisLimit = subscriptionData?.pricing_plans?.analysis_limit || 0;
    const currentMonth = new Date().toISOString().substring(0, 7);

    const { data: usageData } = await supabase
      .from('analysis_usage')
      .select('analysis_count')
      .eq('user_id', userId)
      .eq('month_year', currentMonth)
      .maybeSingle();

    const currentCount = usageData?.analysis_count || 0;

    if (analysisLimit !== -1 && currentCount >= analysisLimit) {
      await supabase
        .from('document_analysis')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      return new Response(JSON.stringify({
        error: 'Analysis limit reached',
        message: `You have reached your monthly analysis limit of ${analysisLimit}. Please upgrade your plan.`,
        current_count: currentCount,
        limit: analysisLimit
      }), {
        status: 403,
        headers: corsHeaders
      });
    }
    // === END: ANALYSIS LIMIT CHECK ===

    // === START: CHECK FOR VERIFIED DATA ===
    let verifiedDataGuide = null;
    let hasVerifiedData = false;

    if (useVerifiedData && extractionId) {
      console.log("🔍 Loading verified data to use as guidance:", extractionId);

      const { data: extractionData, error: extractionError } = await supabase
        .from('document_extractions')
        .select('verified_data, extracted_data')
        .eq('id', extractionId)
        .single();

      if (!extractionError && extractionData) {
        verifiedDataGuide = extractionData.verified_data || extractionData.extracted_data;
        hasVerifiedData = true;
        console.log("✅ Verified data loaded - will use as guidance for AI");
      } else {
        console.warn("⚠️ Failed to load extraction data, will analyze fresh:", extractionError);
      }
    }
    // === END: CHECK FOR VERIFIED DATA ===

    // Update status to processing
    await supabase.from('document_analysis').update({
      status: 'processing',
      updated_at: new Date().toISOString()
    }).eq('id', documentId);

    const accessToken = await getGoogleAccessToken(serviceAccount);
    const model = "gemini-2.0-flash";
    const geminiUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${serviceAccount.project_id}/locations/us-central1/publishers/google/models/${model}:generateContent`;

    // =====================================================
    // BUILD PROMPT WITH OPTIONAL VERIFIED DATA GUIDANCE
    // =====================================================

    let promptPrefix = "";
    if (hasVerifiedData) {
      promptPrefix = `
      IMPORTANT CONTEXT - USER-VERIFIED EXTRACTION DATA:
      The user has already reviewed and verified the following extracted data from this document:
      ${JSON.stringify(verifiedDataGuide, null, 2)}

      This verified data should be used as a REFERENCE and GUIDE when analyzing the document.
      If the document is difficult to read, use these verified values.
      If you can clearly read the document and the values match, use high confidence.
      If you can clearly read the document and values differ from verified data, trust the document.

      Now proceed with the full analysis as normal:
      ---
      `;
    }

    // === FIND DIFFICULTY LEVEL ===
    const userCountry = documentData.user_country || "United Kingdom";
    const testLevel = documentData.test_level;
    let difficulty = 5;
    let levelRestrictionsPrompt = "";

    if (testLevel && userCountry) {
      try {
        const countryLevels = getLevelsByCountry(userCountry);

        if (!countryLevels || countryLevels.length === 0) {
          console.warn(`⚠️ No levels found for country: ${userCountry}`);
        } else {
          const levelInfo = countryLevels.find(l => l.name === testLevel);

          if (levelInfo) {
            difficulty = levelInfo.difficulty;
            levelRestrictionsPrompt = generateLevelRestrictionsPrompt(difficulty);
            console.log(`✅ Test Level: ${testLevel} → Difficulty: ${difficulty}/10`);
          } else {
            console.warn(`⚠️ Test level "${testLevel}" not found for ${userCountry}, using default difficulty 5`);
          }
        }
      } catch (error) {
        console.error("Error finding difficulty level:", error);
        console.log("Will proceed with default difficulty 5");
      }
    }

    // === BUILD HEALTH SAFETY PROMPT ===
    let healthSafetyPrompt = "";
    const healthStatus = documentData.health_status || "healthy";
    const healthDetails = documentData.health_details || {};

    if (healthStatus !== "healthy") {
      console.log(`⚕️ Health issue detected: ${healthStatus}`);
      console.log(`📋 Health details:`, healthDetails);

      const affectedAreas = healthDetails.affected_areas || [];
      const fitnessLevel = healthDetails.fitness_level || "good";
      const restrictions = healthDetails.restrictions || [];

      healthSafetyPrompt = `
            ⚠️ CRITICAL HORSE HEALTH & SAFETY INFORMATION ⚠️

            The rider has indicated their horse has health concerns:
            - Health Status: ${healthStatus}
            ${affectedAreas.length > 0 ? `- Affected Areas: ${affectedAreas.join(", ")}` : ""}
            - Fitness Level: ${fitnessLevel}
            ${restrictions.length > 0 ? `- Restrictions: ${restrictions.join(", ")}` : ""}

            🚨 MANDATORY SAFETY RULES - YOU MUST FOLLOW THESE 🚨

            ${healthStatus === "lameness" ? `
            LAMENESS DETECTED - EXTREMELY RESTRICTIVE:
            1. ❌ DO NOT suggest ANY high-intensity exercises
            2. ❌ DO NOT suggest flying changes, collection, extended gaits, pirouettes
            3. ❌ DO NOT suggest lateral work beyond very gentle leg yield
            4. ❌ DO NOT suggest small circles (under 20m)
            5. ✅ ONLY suggest gentle walk work and relaxation exercises
            6. ✅ ALL recommendations must include safety warning: "⚕️ Only attempt with veterinary clearance"
            7. ✅ Add to each recommendation: "This exercise should only be done if horse is comfortable and shows no pain"

            ALLOWED EXERCISES (lameness):
            - Walk on loose rein (relaxation)
            - Gentle forward walk work
            - Partnership building exercises (no physical demands)
            - Stretching at walk

            BLOCKED EXERCISES (lameness):
            - ANY trot or canter work
            - Collection work
            - Lateral work (except very gentle walk leg yield)
            - Transitions beyond walk-halt
            - Circles smaller than 20m
            - Extended gaits
            - Flying changes
            - Any jumping or intense work

            ` : healthStatus === "minor_issues" ? `
            MINOR HEALTH ISSUES - MODERATELY RESTRICTIVE:
            1. ❌ Avoid high-intensity exercises (flying changes, extended gaits, pirouettes)
            2. ⚠️ Use caution with collection and lateral work
            3. ✅ Focus on exercises that improve suppleness and relaxation
            4. ✅ Include warnings about monitoring horse comfort
            5. ✅ Suggest gradual progression only

            ALLOWED EXERCISES (minor issues):
            - Walk and trot work (gentle)
            - Large circles (20m)
            - Basic transitions
            - Gentle leg yield
            - Simple changes (with caution)
            - Suppling exercises

            BLOCKED EXERCISES (minor issues):
            - Flying changes
            - Extended gaits
            - Pirouettes
            - Piaffe/passage
            - Heavy collection work
            - Half-pass (unless very gentle)

            ` : healthStatus === "recovering" ? `
            RECOVERING FROM INJURY - GRADUAL RETURN:
            1. ✅ Focus on rebuilding fitness gradually
            2. ✅ Low to medium intensity exercises only
            3. ⚠️ Monitor for signs of discomfort
            4. ✅ Include "return to work" progression in recommendations
            5. ❌ NO advanced movements until fully recovered

            PROGRESSION APPROACH (recovering):
            - Weeks 1-2: Walk work only
            - Weeks 3-4: Add light trot if sound
            - Week 5+: Gradual increase if sound

            ALLOWED EXERCISES (recovering):
            - Progressive walk work
            - Light trot work (after week 3)
            - Basic transitions
            - Large circles (20m+)
            - Gentle suppling

            BLOCKED EXERCISES (recovering):
            - Flying changes
            - Collection work
            - Extended gaits
            - Lateral work (until week 5+)
            - Intense work

            ` : ""}

            ${affectedAreas.includes("hind_left") || affectedAreas.includes("hind_right") ? `
            ⚠️ HIND LEG ISSUE NOTED:
            - Avoid exercises requiring strong hind leg engagement
            - No collection work (requires hind strength)
            - No flying changes (requires hind push)
            - Focus on forward, relaxed work

            ` : ""}

            ${affectedAreas.includes("back") ? `
            ⚠️ BACK ISSUE NOTED:
            - Avoid deep collection (compresses back)
            - Focus on stretching and suppling
            - Long and low work recommended
            - No advanced movements requiring back strength

            ` : ""}

            ${affectedAreas.includes("neck") ? `
            ⚠️ NECK ISSUE NOTED:
            - Avoid strong flexion work
            - Focus on relaxation and stretching
            - Allow horse to carry head naturally
            - No strong collection

            ` : ""}

            ${restrictions.includes("walk_work_only") ? `
            🛑 WALK WORK ONLY RESTRICTION:
            You MUST ONLY suggest walk exercises.
            NO trot or canter recommendations allowed.
            ALL exercises must be at walk pace.

            ` : ""}

            ${restrictions.includes("no_intense_work") ? `
            ⚠️ NO INTENSE WORK:
            Avoid all high-intensity exercises.
            Focus on relaxation and gentle work.

            ` : ""}

            ${restrictions.includes("no_lateral_work") ? `
            ⚠️ NO LATERAL WORK:
            Do not suggest shoulder-in, half-pass, or advanced lateral movements.
            Basic leg yield may be acceptable if very gentle.

            ` : ""}

            ${restrictions.includes("no_collection") ? `
            ⚠️ NO COLLECTION WORK:
            Do not suggest collection development or exercises requiring collection.
            Keep horse in working or lengthened frames.

            ` : ""}

            END OF HEALTH SAFETY INFORMATION
            ---

            `;
    }

    const mainPrompt = `

      This is the test score sheet of one rider's jumping or dressage movement.
      You should get the name of horse from document like Frapp, Varadero, Pagasus, Han, Lolo and so on.
      If the document is in Spanish or partially contains Spanish text, you must translate all extracted terms, movement labels, and judge comments into English before using them.
      
      ${levelRestrictionsPrompt ? `
      ⚠️ CRITICAL LEVEL-APPROPRIATE RECOMMENDATIONS ⚠️

      The rider competed at: ${testLevel} (${userCountry})
      This corresponds to Difficulty Level: ${difficulty}/10

      ${levelRestrictionsPrompt}

      🚨 CRITICAL RULES - YOU MUST FOLLOW THESE 🚨

      1. ONLY recommend exercises from the "ALLOWED EXERCISES" list above
      2. NEVER suggest movements from the "FORBIDDEN MOVEMENTS" list above
      3. NEVER suggest exercises from the "FORBIDDEN EXERCISES" list above
      4. Focus recommendations on the "FOCUS AREAS" listed above
      5. If you suggest a forbidden movement or exercise, the recommendation will be REJECTED

      Example of CORRECT recommendation for this level:
      ${difficulty <= 2 ? `
      - ✅ "Rhythm Stabilization - Practice consistent tempo on long sides"
      - ✅ "Forward Drive Development - Build energy through transitions"
      - ❌ WRONG: "Flying Change Training" (too advanced for this level!)
      ` : difficulty === 3 ? `
      - ✅ "Leg Yield Training - Develop lateral flexibility"
      - ✅ "Simple Change Practice - Balance through transitions"
      - ❌ WRONG: "Half-Pass Development" (too advanced for this level!)
      ` : difficulty >= 4 && difficulty <= 5 ? `
      - ✅ "Shoulder-in Precision Training - Improve lateral control"
      - ✅ "Flying Change Training - Practice single changes"
      - ❌ WRONG: "Pirouette Training" (too advanced for this level!)
      ` : `
      - ✅ All advanced movements appropriate for this level
      `}

      ---
      ` : ''}

      ${healthSafetyPrompt}
      
      You can get that in the first part of PDF, normally it is next of the rider name.
      Each movement is evaluated by several judges.
      Extract JSON with movement, all the highest and lowest scores, comments, patterns and percentage.
      Translate all movement names and judge comments from Spanish to English before inserting them into the JSON. For example, "Parada en X" should be "Halt at X", and "Paso Medio" should be "Medium Trot".
      Every individual movement should include all judge's score and comment.
      JSON format should be like follow.
      All formats must be followed like an example and if there are no contents, fill the field with null.
      Once analyze the document, you should give your recommend to improve skill based on analyzed results with strengths and weakness.
      Recommendations should include all key elements including size, type, and gait to help tailor the training plan.
      Keep recommendations practical and actionable while maintaining concise format like follow

      Extract these **8 variables** for each recommendation.
      const horseName = "Varadero";
      const riderName = "Jenny";
      const overallScore = "65.9";
      const lowestScore = "5.5";
      const lowestMovement = "2";
      const highestScore = "7.5";
      const commonIssue = "BOCA ABIERTA";
      const issueCount = "7";  // How many times it appears
      const judgeQuote = "CONTACTO MAS ARMONICO";  // Any judge comment
      const specificMovements = "1,5,6,10,22";  // The number of movements detail sheet with issues
      In each recommendation, you should give 2 exercises with real value instead of {value} - horse name, lowest score, lowest movement.

      ## 🐎 Arena Size Detection Rule:
      When analyzing the document:
      - If any arena positions contain the letters "S", "V", "R", "P", "I", or "L" (even inside combined terms like "PM"), set "size": "large".
      - Ignore case and spaces when checking arena positions. Even if the arena letter is separated from the rest (e.g., "M V" instead of "MV"), still detect it as containing "V".
      - Otherwise, use "size": "small".
      - The arena size must remain the same across all recommendations for the same document.

      ---

     1. CONTACT/CONNECTION ISSUES
      Exercise 1A: Rhythm Stabilization
      Focus: Improving inconsistent rhythm and tempo
       Setup: Use long sides A-K-E-H and K-A-F-B for rhythm work
       Method:
      Step 1: Establish counting rhythm on long sides - consistent 1-2-3-4 beat pattern
      Step 2: Practice tempo transitions within gait - maintain rhythm while adjusting speed
      Step 3: Test rhythm consistency through corners and turns Key Points: {horseName} needs       metronome-like consistency - judge noted tempo fluctuations
       Watch For: Avoid rushing through corners or slowing on straightaways
       Goal: Achieve consistent rhythm that scores 7.0+ in future tests
       Quick Fix: Count out loud to maintain steady tempo throughout movement
      Exercise 1B: Forward Drive Development
      Focus: Improving insufficient forward movement
       Setup: Practice on straight lines A-C and C-A with clear forward intention
       Method:
      Step 1: Build forward desire through leg aid acceptance - create willingness to move forward
      Step 2: Practice maintaining forward through transitions - prevent backward thinking
      Step 3: Develop sustained forward energy without rushing Key Points: {horseName} needs clear      forward impulse - judge specifically noted lack of energy
       Watch For: Distinguish between forward energy and rushing - maintain quality of gait
       Goal: Transform {lowestMovement} from {lowestScore} to 7.0+ with proper forward drive
       Quick Fix: Use leg aid before every movement to ensure forward preparation
      Exercise 1C: Straightness Correction
      Focus: Improving crookedness and alignment issues
       Setup: Use center line X-G and G-X for straightness training
       Method:
      Step 1: Practice tracking straight on center line - equal weight on both sides
      Step 2: Develop even rein contact and leg pressure - eliminate one-sided dominance
      Step 3: Test straightness through transitions and halts Key Points: {horseName} needs equal       engagement from both sides - judge noted deviation
       Watch For: Avoid over-correcting to one side - maintain neutral alignment
       Goal: Achieve straight tracking that improves overall test harmony
       Quick Fix: Check shoulder alignment matches hip alignment before each movement
        
      2. LATERAL WORK
      Exercise 2A: Shoulder-in Precision Training
      Focus: Improving shoulder-in angle and bend consistency
       Setup: Practice shoulder-in on M-B and H-E tracks where movement lost points
       Method:
      Step 1: Establish correct bend through preparatory transitions - create flexion judges expect
      Step 2: Practice 20° angle M-B track maintaining forward - address "insufficient angle"       criticism
      Step 3: Develop 30° competition angle H-E track - exact test requirements Key Points:       {horseName} needs clear 3-track pattern with sustained forward movement
       Watch For: Avoid over-bending neck which creates 4-track not 3-track pattern
       Goal: Transform movement from {lowestScore} to 7.0+ by achieving proper angle and bend
       Quick Fix: Check 3-track pattern is visible from judge C position before executing
      Exercise 2B: Leg-yield Clarity Training
      Focus: Improving leg-yield crossing and angle
       Setup: Practice leg-yield from quarter-line to K-E-H rail and F-B-M rail
       Method:
      Step 1: Establish sideways thinking through ground poles - create lateral awareness
      Step 2: Practice maintaining forward-sideways balance - prevent loss of forward momentum
      Step 3: Develop clear crossing pattern with consistent angle Key Points: {horseName} needs      visible crossing steps - judge noted insufficient lateral movement
       Watch For: Maintain forward energy while moving sideways - avoid backward steps
       Goal: Achieve clear leg-yield that demonstrates proper lateral education
       Quick Fix: Use inside leg to outside rein connection for better lateral response
      Exercise 2C: Half-pass Development
      Focus: Improving half-pass collection and crossing
       Setup: Practice half-pass from quarter-line: H-quarter to B, then H-quarter to F; and      M-quarter to E, then M-quarter to K
       Method:
      Step 1: Build collection through shoulder-fore preparation - create engagement for half-pass
      Step 2: Practice maintaining bend direction while moving sideways
      Step 3: Develop expressive crossing steps with sustained forward energy Key Points: {horseName}       needs clear crossing with maintained collection
       Watch For: Avoid leading with quarters - maintain shoulder-leading position
       Goal: Transform half-pass quality from basic to competition level
       Quick Fix: Think shoulder-fore angle before beginning half-pass movement
        
      3. CONFIDENCE BUILDER (Adaptive Exercises - No Fixed Diagrams)
      Exercise 3A: Simple Success Pattern
      Focus: Building confidence through achievable movements
       Setup: Use familiar movements on comfortable tracks (Based on individual test results)
       Method:
      Step 1: Practice best-scoring movements from recent tests - reinforce success patterns
      Step 2: Build on strengths before addressing weaknesses - maintain positive attitude
      Step 3: Gradually increase difficulty while maintaining success rate Key Points: {horseName}      needs confidence boost after difficult test experience
       Watch For: Keep sessions positive and end on successful note
       Goal: Restore confidence and willingness to attempt new movements
       Quick Fix: Return to basic movements if tension appears
      Exercise 3B: Relaxation and Suppleness
      Focus: Reducing tension and improving suppleness
       Setup: Use flowing patterns that encourage relaxation (Personalized based on horse's needs)
       Method:
      Step 1: Begin with loose rein walk to establish calm mental state
      Step 2: Practice rhythmic transitions that promote relaxation
      Step 3: Build suppleness through gentle bending exercises Key Points: {horseName} needs mental      relaxation before technical work
       Watch For: Signs of tension - halt exercise if stress appears
       Goal: Achieve relaxed, supple horse ready for productive training
       Quick Fix: Return to walk on loose rein whenever tension builds
      Exercise 3C: Partnership Building
      Focus: Improving rider-horse communication and trust
       Setup: Practice communication exercises that build partnership (Adapted to relationship needs)
       Method:
      Step 1: Work on clear aid application and consistent responses
      Step 2: Practice reward timing to reinforce positive responses
      Step 3: Build trust through consistent, fair training approach Key Points: {horseName} needs      clear communication to build confidence
       Watch For: Avoid conflicting aids or unclear signals
       Goal: Establish solid partnership foundation for advanced training
       Quick Fix: Simplify aids and be generous with praise for correct responses
        
      4. CIRCLE EXERCISES
      Exercise 4A: Circle Bend Development
      Focus: Improving bend consistency and circle accuracy
       Setup: Practice 20m circles at A and C, 15m circles at B and E, and 10m circles at A, C, B, E      (X for advanced work)
       Method:
      Step 1: Establish correct bend on 20m circle - create foundation flexion
      Step 2: Maintain bend quality on 15m circle - test bend consistency
      Step 3: Develop precise bend on 10m circle - achieve competition requirements Key Points:       {horseName} needs uniform bend from poll to tail throughout circle
       Watch For: Avoid motorcycle lean or falling in/out of circle
       Goal: Achieve accurate circles with consistent bend quality
       Quick Fix: Use outside aids to maintain circle size and inside aids for bend
      Exercise 4B: Circle Suppling Work (Progressive Circles - Use Dotted Lines)
      Focus: Improving suppleness and flexibility through circles
       Setup: Use circles at A, B, E, and C positions for comprehensive suppling
       Method:
      Step 1: Practice large circles (20m) for basic suppling - establish flexibility
      Step 2: Gradually decrease circle size (15m) while maintaining suppleness
      Step 3: Change direction frequently to develop equal suppleness both ways Key Points:       {horseName} needs equal suppleness in both directions
       Watch For: Resistance to bending - work gradually to improve flexibility
       Goal: Develop equal suppleness that improves overall test performance
       Quick Fix: Return to larger circles if resistance appears
       Visual: Show progressive circle sizes with solid/dashed/dotted lines
      Exercise 4C: Circle Precision Training (Generic Version)
      Focus: Improving circle geometry and accuracy
       Setup: Practice 20m circles at A and C, 15m circles at B and E, 10m circles at A, C, B, E with       precise entry/exit points
       Method:
      Step 1: Use arena markers to check circle accuracy - maintain proper geometry
      Step 2: Practice different circle sizes at same location - develop size control
      Step 3: Execute circles with precise entry and exit points Key Points: {horseName} needs      accurate circle geometry for test success
       Watch For: Egg-shaped or square circles - maintain round geometry
       Goal: Achieve precise circles that score 7.0+ in tests
       Quick Fix: Use arena markers as reference points for circle accuracy
        
      5. TRANSITION EXERCISES
      Exercise 5A: Upward Transition Quality
      Focus: Improving upward transition smoothness and preparation
       Setup: Practice upward transitions in two patterns: at corners K, E, H, M, B, F (approach and      transition through the turn) and on centerline A-C, C-A (transition at marked points for      straightness)
       Method:
      Step 1: Prepare horse mentally and physically before each transition
      Step 2: Apply aids gradually for smooth upward transitions
      Step 3: Maintain quality of new gait immediately after transition Key Points: {horseName} needs       smooth, prepared upward transitions
       Watch For: Rushing or resistance during transitions
       Goal: Achieve fluid upward transitions that enhance test flow
       Quick Fix: Use half-halts to prepare horse before transition aids
      Exercise 5B: Downward Transition Balance
      Focus: Improving downward transition balance and engagement
       Setup: Practice downward transitions in two patterns: at corners K, E, H, M, B, F (approach      and transition through the turn) and on centerline A-C, C-A (transition at marked points for      straightness)
       Method:
      Step 1: Maintain forward thinking while slowing gait
      Step 2: Use seat and breathing to encourage downward transitions
      Step 3: Keep horse engaged and balanced throughout transition Key Points: {horseName} needs to      maintain balance during downward transitions
       Watch For: Falling on forehand or losing forward momentum
       Goal: Achieve balanced downward transitions that maintain engagement
       Quick Fix: Use core engagement to support horse through transition
      Exercise 5C: Within-Gait Transitions (Both Directions with Line Styles)
      Focus: Improving collection and extension within gaits
       Setup:
      Direction 1 (Clockwise): Working A-K-E, collect E-H-C, extend C-M-B, working B-F-A
      Direction 2 (Counter-clockwise): Working A-F-B, collect B-M-C, extend C-H-E, working E-K-A
      Method:
      Step 1: Establish clear difference between working and collected gaits
      Step 2: Practice smooth transitions between collection levels
      Step 3: Develop expression in extended gaits while maintaining balance Key Points: {horseName}      needs clear differences between gait variations
       Watch For: Loss of rhythm during gait transitions
       Goal: Achieve clear gait variations that demonstrate training level
       Quick Fix: Focus on rhythm consistency during all gait changes
       Visual: Use solid lines (working), dashed lines (collection), dotted lines (extension)


      AI SELECTION CRITERIA
      Use Contact/Connection Issues (1A-1C) when:
        - Test comments mention rhythm, tempo, or forward issues
        - Horse shows tension or resistance to contact
        - Straightness or basic connection needs improvement

      Use Lateral Work (2A-2C) when:
        - Test includes shoulder-in, leg-yield, or half-pass movements
        - Comments mention need for better lateral response
        - Horse needs improved suppleness and bend

      Use Circle Exercises (4A-4C) when:
        - Test includes circle movements
        - Comments mention bend or suppleness issues
        - Horse needs improved balance and geometry

      Use Transition Exercises (5A-5C) when:
         - Test comments focus on transition quality
         - Horse needs improved balance or preparation
         - Collection and extension need development
      
      While extracting exercise name, you should remove exercise keys like 1A, 2B and so on.

      This is total output result sample.
      {
        "percentage": 68.5,
        "horse": "Han",
        "strengths": [
          "Good rhythm",
          "Nice energy throughout",
          "Attentive to aids"
        ],
        "weaknesses": [
          "Tension in transitions",
          "Balance in halts needs work"
        ],
        "generalComments": {
          "judgeA": "Work on balanced halts",
          "judgeB": "Work on balanced halts",
          "judgeC": "Good Rider"
        },
        "recommendations": [
          {
            "exercise": [Exercise Name],
            "focus": [Focus],
            "setup": [Brief requirements],
            "method": [3 progressive steps],
            "keyPoints": [Critical success factors],
            "watchFor": [Main pitfall to avoid],
            "goal": [Specific target],
            "quickFix": [Immediate action item],
            "size": "Small || Large",
            "gait": "Walk" || "Trot" || "Canter" || "Walk/Trot" || "Trot/Canter" || etc.
            "type": "Contact-A",
            "reasoning": "Why this exercise was selected - mention specific movements (e.g., 'Movements 2, 5, 8 scored below 6.0') and judge comments (e.g., 'Judge A noted: needs more forward'). Explain how this addresses the weakness."
          },
          {
            "exercise": [Exercise Name],
            "focus": [Focus],
            "setup": [Brief requirements],
            "method": [3 progressive steps],
            "keyPoints": [Critical success factors],
            "watchFor": [Main pitfall to avoid],
            "goal": [Specific target],
            "quickFix": [Immediate action item],
            "size": "Small || Large",
            "gait": "Walk" || "Trot" || "Canter" || "Walk/Trot" || "Trot/Canter" || etc.
            "type": "Lateral-A",
            "reasoning": "Selected to improve lateral alignment and bend. Movements 6 and 9 scored below 6.0, with Judge A noting "loss of alignment" and "insufficient bend." This exercise develops correct bend, straightness, and control, helping maintain balance and rhythm during lateral movements."
          },
          {
            "exercise": [Exercise Name],
            "focus": [Focus],
            "setup": [Brief requirements],
            "method": [3 progressive steps],
            "keyPoints": [Critical success factors],
            "watchFor": [Main pitfall to avoid],
            "goal": [Specific target],
            "quickFix": [Immediate action item],
            "size": "Small || Large",
            "gait": "Walk" || "Trot" || "Canter" || "Walk/Trot" || "Trot/Canter" || etc.
            "type": "Transition-A",
             "reasoning": "Chosen to improve transition quality and responsiveness. Movements 3, 7, and 11 scored below 6.0, with Judge A commenting "late reaction to aids." This exercise sharpens the response to aids, improves balance, and creates clearer, more controlled transitions."
          }, // Note: Size for each exercise should be consistant in one document.
        ],
        "focusArea": [
          {
            "area": "Right Center Quality (5.0)",
            "tip": {
              "quickFix": "Try breathing out as you apply right leg aid",
              "Exercise": "10m circle with gradual spiral in and out"
            }
          },
          {
            "area": "Medium Trot Expression (5.5)",
            "tip": {
              "quickFix": "Think 'up' not 'forward' in transitions.",
              "Exercise": "Trot poles with varied spacing to encourage suspension"
            }
          }
        ],
        "highestScore": {
          "score": 8,
          "movement": ["Halt at X", "Halt at Y"] 
          // All movement names (like in "highestScore.movement" and "lowestScore.movement") must be fully translated to English, even if the source document includes them in Spanish. For example, return "Halt at X" instead of "Parada en X".
        },
        "lowestScore": {
          "score": 6,
          "movement": ["Halt at X", "Halt at Y"]
          // All movement names (like in "highestScore.movement" and "lowestScore.movement") must be fully translated to English, even if the source document includes them in Spanish. For example, return "Halt at X" instead of "Parada en X".
          },
        "personalInsight": "You seem to be a rider who excels at precise technical elements, especially halts and geometry. However, if you focus more on relaxation and expression during transitions and medium gaits, you could significantly improve your overall performance."

      ===========================================
      CRITICAL: ADD AI INTERPRETATION SECTION
      ===========================================
      
      "aiInterpretation": {
        "complaints": [
          "Extract specific complaints from judge comments",
          "Focus on critical feedback that needs addressing",
          "Be specific about issues mentioned by judges"
        ],
        "interpretations": [
          "Explain what each complaint means in practical terms",
          "Provide clear interpretation for improvement",
          "Connect judge feedback to technical improvements"
        ],
        "areas": [
          {
            "name": "Specific area that needs work based on judge comments",
            "fix": "Actionable, practical fix for this area"
          },
          {
            "name": "Another area needing attention", 
            "fix": "Clear, actionable fix with specific exercises"
          }
        ]
      }
      }
      Percentage, strengths (at least 2 strengths), weaknesses (at least 2 weaknesses), recommendations, focus area and personal insight(Your personal thoughts) must be required in results.
      And also you should extract the highest and lowest scores and extract all movements of that.
      If percentage is null, you should calculate percentage with each judges' scores, max scores and coefficiente. Percentage can be a simple average of all judges' scores relative to their max scores (normally 10). This average must fall between the lowest and highest individual scores. However, accuracy in representation and extraction is the top priority
      At least 3 Recommendations are needed and all recommendations should be deep, meaningful, useful, correct and in detail (More specific exercise recommendations as well such as: "Try shoulder - in exercises" rather than just "focus on relaxtion").
      
      🎯 CRITICAL REQUIREMENT FOR REASONING FIELD - SOURCE TRANSPARENCY 🎯

      Each recommendation's "reasoning" field is MANDATORY and MUST include ALL of the following:

      1. SPECIFIC MOVEMENT NUMBERS AND SCORES:
        ✅ List exact movement numbers that scored low
        ✅ Include the actual scores for each movement
        ✅ Compare to target score (usually 7.0+)
        
        Example: "Movements 2, 5, and 8 scored 5.5, 5.0, and 6.0 respectively (target: 7.0+)"
        
        ❌ WRONG: "Some movements scored low"
        ❌ WRONG: "Several movements need work"

      2. ACTUAL JUDGE QUOTES (WORD-FOR-WORD):
        ✅ Quote exact judge comments from the test
        ✅ Attribute to specific judge (A, B, or C)
        ✅ Use quotation marks around judge's words
        
        Example: "Judge A stated: 'Needs more forward energy'. Judge B noted: 'Lacks impulsion in transitions'"
        
        ❌ WRONG: "Judges mentioned forward issues"
        ❌ WRONG: "Comments suggest improvement needed"

      3. SCORE IMPACT ANALYSIS:
        ✅ Calculate how many points were lost
        ✅ Estimate potential improvement
        ✅ Show percentage impact
        
        Example: "These movements cost approximately 4.5 points total. Improving them could raise overall score by 1.5 points (from 65% to 66.5%)"
        
        ❌ WRONG: "This could improve your score"
        ❌ WRONG: "You'll get better scores"

      4. CONNECTION TO IDENTIFIED WEAKNESS:
        ✅ Link to specific weakness from analysis
        ✅ Explain exactly how exercise addresses it
        ✅ Be specific about what will improve
        
        Example: "This directly addresses your main weakness: 'Insufficient forward movement', which appeared in 3 movements and was mentioned by 2 judges"
        
        ❌ WRONG: "This helps with your weakness"
        ❌ WRONG: "This is good for improvement"

      5. LEVEL AND HEALTH APPROPRIATENESS:
        ✅ Confirm exercise matches rider's test level
        ✅ Confirm exercise is safe for horse's health status
        ✅ Mention any modifications for health issues
        
        Example: "Appropriate for ${testLevel} level as it focuses on fundamental rhythm work. Safe for horse's current health status (${healthStatus})"
        
        ${healthStatus !== "healthy" ? `
        Example with health issue: "Modified for ${healthStatus} - using only walk work and large circles to protect affected areas while addressing the weakness"
        ` : ""}

      6. SOURCE TRACEABILITY:
        ✅ Make it clear this is based on THEIR specific test
        ✅ Reference their test date if available
        ✅ Personalize to their horse
        
        Example: "Based on ${documentData.horse_name || 'your horse'}'s ${testLevel} test${documentData.document_date ? ` on ${documentData.document_date}` : ''}"

      ---

      COMPLETE REASONING EXAMPLE (USE THIS AS TEMPLATE):

      "Selected because movements 2, 5, and 8 scored significantly below target (5.5, 5.0, and 6.0 respectively, with target 7.0+). Judge A specifically noted 'needs more forward energy' on movement 2, and Judge B commented 'lacks impulsion' on movement 5, while Judge C mentioned 'forward thinking needed' on movement 8. These rhythm issues cost approximately 4.5 points across these movements. This exercise directly addresses your main weakness: 'Insufficient forward movement', which was identified in 3 out of 15 movements and mentioned by all three judges. Improving forward drive could raise your overall percentage from ${documentData.percentage || 'current score'} to approximately ${(parseFloat(documentData.percentage) + 1.5).toFixed(1)}%. This exercise is appropriate for ${testLevel} level as it focuses on fundamental forward movement without requiring advanced skills. Safe for horse's current health status (${healthStatus})${healthStatus !== "healthy" ? " - modified to use gentle progressive work suitable for recovery" : ""}. Based on ${documentData.horse_name || 'your horse'}'s performance in this ${testLevel} test."

      ---

      REASONING QUALITY CHECKLIST - EVERY REASONING MUST PASS ALL:

      □ Includes at least 2-3 specific movement numbers
      □ Includes at least 1-2 direct judge quotes with attribution
      □ Includes score comparison (actual vs. target)
      □ Calculates points lost and potential improvement
      □ Links to specific identified weakness
      □ Confirms level appropriateness
      □ Confirms health safety
      □ References their specific test/horse
      □ Is at least 100 words long (detailed!)
      □ Reads like a personal coach explaining to the rider

      ---

      ❌ REJECT THESE TYPES OF REASONING:

      "This exercise helps with rhythm" - TOO GENERIC
      "You need to work on forward movement" - NOT SPECIFIC
      "Based on your test results" - NO MOVEMENT NUMBERS
      "This will improve your score" - NO SCORE DATA
      "Good exercise for your level" - NO JUDGE QUOTES

      ---

      ✅ EVERY REASONING MUST:
      - Be SPECIFIC to their exact test
      - Include REAL data (numbers, scores, quotes)
      - Show CLEAR traceability to source
      - Calculate IMPACT of improvement
      - Confirm SAFETY for their situation

      Each recommendation must also include the primary gait type involved in that exercise, such as "Walk", "Trot", or "Canter". If more than one gait is used, use "Walk/Trot", "Trot/Canter", etc. Analyze the setup and method steps to determine which gait(s) the rider should use during the exercise.
      Ensure recommendations are specific, actionable, and progressive while remaining concise.
      Ensure no mixed-language elements appear, All contents should be English.
      And only return the full JSON not truncated without any comment like "Here is the analyzed result of the document.".
      And should choose professional riding words like "flying changes" instead of "changes of leg" and your personal insight content pattern should be written to the person like "You seem to be ... if you ..." with 3-5 sentences and must be richful and helpful for riders.
      In other words, riders can get the attractive recommendations, focus area and personal insight from your analysis - you should make them to love this tool.
      REMINDER:
      * All contents of the JSON — including generalComments, strengths, weaknesses, instructions, recommendations, movement names (in highestScore, lowestScore, and detailed movements), and any other fields — must be fully in English. If any part of the document is in Spanish (such as "Parada en X" or "Trote Medio"), you must translate it into accurate, fluent English before including it in the result.
    `;

    const fullPrompt = promptPrefix + mainPrompt;

    // =====================================================
    // CALL GEMINI WITH FULL PROMPT + PDF
    // =====================================================

    console.log("🔍 Analyzing document with Gemini AI...");
    console.log(hasVerifiedData ? "📋 Using verified data as guidance" : "📄 Fresh analysis");

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { text: fullPrompt },
            { inlineData: { mimeType: 'application/pdf', data: base64Image } }
          ]
        }]
      })
    });

    const result_en = await geminiResponse.text();

    if (!geminiResponse.ok) {
      console.error('Gemini error response:', result_en);
      throw new Error(`Gemini API Error: ${geminiResponse.status}`);
    }

    const geminiResult_en = JSON.parse(result_en);
    let resultText = geminiResult_en.candidates[0].content.parts[0].text;
    resultText = resultText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

    let finalResult;
    try {
      finalResult = JSON.parse(resultText);
      
      // Ensure aiInterpretation exists in the result
      if (!finalResult.aiInterpretation) {
        console.warn("⚠️ AI didn't include aiInterpretation, generating fallback...");
        finalResult.aiInterpretation = generateFallbackDocumentFeedback(finalResult);
      }
      
      console.log("✅ Analysis completed successfully with AI interpretation");
    } catch (err) {
      console.error("❌ Failed to parse JSON:", resultText);
      throw new Error("Gemini returned invalid JSON format");
    }

    // =====================================================
    // SPANISH LOCALIZATION (ALWAYS)
    // =====================================================

    console.log("🌍 Translating to Spanish...");

    const localizationPrompt = `
You will be given a JSON object. Translate all text content to Spanish, preserving keys and structure.
IMPORTANT: Also translate the "aiInterpretation" section.
Return only the updated JSON, nothing else.
JSON:
${JSON.stringify(finalResult, null, 2)}
`;

    const localizationResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: localizationPrompt }]
        }]
      })
    });

    const localizationResultRaw = await localizationResponse.text();
    if (!localizationResponse.ok) {
      console.error('Gemini localization error response:', localizationResultRaw);
      throw new Error(`Gemini API Error: ${localizationResponse.status}`);
    }

    const parsed = JSON.parse(localizationResultRaw);
    let localizedText = parsed.candidates[0].content.parts[0].text;
    localizedText = localizedText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

    let localizedResult;
    try {
      localizedResult = JSON.parse(localizedText);
      
      // Ensure Spanish version has aiInterpretation
      if (!localizedResult.aiInterpretation && finalResult.aiInterpretation) {
        console.warn("⚠️ Spanish translation missing aiInterpretation, creating placeholder...");
        localizedResult.aiInterpretation = {
          complaints: ["Interpretación IA no disponible en español"],
          interpretations: ["Los detalles están disponibles en la versión en inglés"],
          areas: [{
            name: "Análisis Completo",
            fix: "Consulte la versión en inglés para la interpretación detallada"
          }]
        };
      }
      
      console.log("✅ Spanish translation completed with AI interpretation");
    } catch (err) {
      console.error("❌ Failed to parse localized JSON:", localizedText);
      throw new Error("Gemini returned invalid localized JSON format");
    }

    // =====================================================
    // SAVE TO DATABASE (BOTH LANGUAGES)
    // =====================================================

    console.log("💾 Saving analysis results...");

    const { error: resultsError } = await supabase
      .from('analysis_results')
      .upsert({
        document_id: documentId,
        result_json: {
          en: finalResult,
          es: localizedResult
        },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'document_id'
      });

    if (resultsError) {
      console.error('Failed to save analysis results:', resultsError);
      throw new Error('Failed to save analysis results');
    }

    await supabase.from('document_analysis').update({
      status: 'completed',
      updated_at: new Date().toISOString()
    }).eq('id', documentId);

    // Insert goals
    if (finalResult.recommendations && finalResult.recommendations.length > 0) {
      await Promise.all(finalResult.recommendations.slice(0, 2).map(async (recommendation: any) => {
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        const targetDate = oneMonthLater.toISOString().split("T")[0];
        await supabase.from('goals').insert({
          user_id: userId,
          goal_text: recommendation.goal,
          goal_type: 'short-term',
          progress: 0,
          target_date: targetDate
        });
      }));
    }

    // Update usage count
    const { error: updateError } = await supabase
      .from('analysis_usage')
      .upsert({
        user_id: userId,
        month_year: currentMonth,
        plan_id: subscriptionData.plan_id,
        analysis_count: currentCount + 1,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,month_year'
      });

    if (updateError) {
      console.error('Failed to update usage count:', updateError);
    }

    console.log("✅ Analysis completed and saved successfully");

    return new Response(JSON.stringify({
      success: true,
      result: finalResult,
      remaining_analyses: analysisLimit === -1 ? -1 : (analysisLimit - (currentCount + 1))
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (err) {
    console.error('❌ Edge Function error:', err);
    
    // Update document status to failed
    try {
      await supabase.from('document_analysis').update({
        status: 'failed',
        updated_at: new Date().toISOString()
      }).eq('id', documentId);
    } catch (updateErr) {
      console.error('Failed to update document status:', updateErr);
    }

    return new Response(JSON.stringify({
      error: err.message,
      success: false
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});