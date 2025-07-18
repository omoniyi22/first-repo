// Supabase Edge Function with manual JWT authentication for Gemini Pro Vision (fixed base64 key handling)
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { encode as base64Encode } from 'https://deno.land/std@0.192.0/encoding/base64.ts';
import { crypto } from 'https://deno.land/std@0.192.0/crypto/mod.ts';
import { decode as base64Decode } from 'https://deno.land/std@0.192.0/encoding/base64.ts';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};
const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
function pemToArrayBuffer(pem) {
  const base64 = pem.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\\n/g, '') // escape newline characters
  .replace(/\r?\n/g, '') // strip real line breaks
  .trim();
  return base64Decode(base64).buffer;
}
async function getGoogleAccessToken(serviceAccount) {
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
  const keyData = await crypto.subtle.importKey('pkcs8', pemToArrayBuffer(serviceAccount.private_key), {
    name: 'RSASSA-PKCS1-v1_5',
    hash: 'SHA-256'
  }, false, [
    'sign'
  ]);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keyData, encoder.encode(unsignedToken));
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
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const raw = Deno.env.get('GEMINI_SERVICE_ACCOUNT_JSON');
    if (!raw) throw new Error('GEMINI_SERVICE_ACCOUNT_JSON is not set');
    const serviceAccount = JSON.parse(raw);
    console.log("Using project:", serviceAccount.project_id);
    const { documentId, base64Image } = await req.json();
    if (!documentId || !base64Image) {
      return new Response(JSON.stringify({
        error: 'Missing documentId or base64Image'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    await supabase.from('document_analysis').update({
      status: 'processing',
      updated_at: new Date().toISOString()
    }).eq('id', documentId);
    const accessToken = await getGoogleAccessToken(serviceAccount);
    const model = "gemini-2.0-flash"; // or gemini-1.5-flash
    const geminiUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${serviceAccount.project_id}/locations/us-central1/publishers/google/models/${model}:generateContent`;
    const prompt = `
      This is the test score sheet of one rider's jumping or dressage movement.
      You should get the name of horse from document like Frapp, Varadero, Pagasus, Han, Lolo and so on.
      You can get that in the first part of PDF, normally it is next of the rider name.
      Each movement is evaluated by several judges.
      Extract JSON with movement, all the highest and lowest scores, comments, patterns and percentage.
      Every individual movement should include all judge's score and comment.
      JSON format should be like follow.
      All formats must be followed like an example and if there are no contents, fill the field with null.
      Once analyze the document, you should give your recommend to improve skill based on analyzed results with strengths and weakness.
      
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
      
        When providing training recommendations, you should extract structured data to draw the diagram for each recommendation. 

        For it, you must provide:

        1. A detailed, natural-language training recommendation that includes specific movement instructions.
        2. A structured JSON object named weaknesses-svg, which contains exact, extractable data for drawing a diagram. This JSON must reflect the content of the recommendation exactly.

        The explanation and the diagram JSON must always match — positions, speed, size, and instruction must come directly from the recommendation. Do not add anything to the JSON that wasn't stated clearly in the recommendation.

        ---

        ## 🐎 Arena Size Detection Rule:
        When analyzing the document:
        - If any arena positions contain the letters "S", "V", "R", "P", "I", or "L" (even inside combined terms like "PM"), set "size": "large".
        - Otherwise, use "size": "small".
        - The arena size must remain the same across all recommendations for the same document.

        ---

        ## 🧭 Required JSON format (weaknesses-svg):

        After each explanation, include a weaknesses-svg JSON block like this:

        {
          "title": "Short title that matches the recommendation",
          "weakness": "Judges' feedback or issue being corrected (in English and optionally Spanish)",
          "type": "contact" | "lateral" | "flyingChanges" | "transitions" | "circleExercise",
          "positions": ['Perimeter'], // if type is contact and size is large
                        // ['M', 'B', 'H', 'E'] if type is lateral
                        // ['Serpentine'] if type is flyingChanges
                        // ['A', 'X', 'C'] if type is transition
                        // ['A', 'X'] if type is circleExercise, extract all positions which is mentioned in recommendation methods.
          "speed": "Walk" | "Trot" | "Canter" | "Halt" | "Transition" | "Free Walk",
          "size": "large" | "small",      // Based on arena size detection rule
          "instruction": "Exact instruction text using the same positions and speed as in the explanation"
        }
      Note: Size should be consistant in one document and if type is transistions, you must not mention about circle exercise!
      Structure of each recommendation as follows:

      1. CONTACT/CONNECTION ISSUES
      Exercise: {horseName} Contact Consistency Development
      Focus: Addressing "{commonIssue}" mentioned {issueCount} times in movements {specificMovements}
      Setup: Arena perimeter work, start with {horseName} on loose rein to address test tension pattern
      Method:
      - Step 1: Walk {horseName} 5 minutes on loose rein - specifically release jaw tension noted by judges
      - Step 2: Establish light trot contact while {horseName} reaches forward - opposite of "{commonIssue}" pattern  
      - Step 3: Practice movements {specificMovements} that showed contact issues with improved elastic connection
      Key Points: {horseName} must seek contact naturally - judge noted "{judgeQuote}" for improvement
      Watch For: Avoid recreating the mouth opening pattern that affected {issueCount} movements in your test
      Goal: Eliminate {commonIssue} issues, improve contact scores from current range to 7.0+ target
      Quick Fix: Before each movement, ensure {horseName} reaches into soft hands not restrictive contact

      2. LATERAL WORK:
      Exercise: {horseName} Shoulder-in Precision Training
      Focus: Improving Movement {lowestMovement} that scored {lowestScore} (lowest in {riderName}’s test)
      Setup: Practice exact test track M-B and H-E where Movement {lowestMovement} lost points
      Method:

      Step 1: Establish correct bend through preparatory transitions - create flexion judges expect for Movement {lowestMovement}
      Step 2: Practice 20° angle M-B track maintaining forward - address “insufficient angle” criticism
      Step 3: Develop 30° competition angle H-E track - exact Movement {lowestMovement} requirements
      Key Points: {horseName} needs clear 3-track pattern with sustained forward movement - judge specifically noted this
      Watch For: Avoid over-bending neck which creates 4-track not 3-track pattern that judges penalize
      Goal: Transform Movement {lowestMovement} from {lowestScore} to 7.0+ by achieving proper angle and bend
      Quick Fix: Check 3-track pattern is visible from judge C position before executing full movement

      3. CONFIDENCE BUILDER
      Exercise: {horseName} Flying Change Integration Training
      Focus: Build on Movement with {highestScore} score while addressing {commonIssue} for overall improvement
      Setup: Use canter serpentine pattern, integrate {horseName}'s strength with improvement areas
      Method:
      - Step 1: Canter serpentine without changes (3 min) - establish the rhythm that earned {highestScore} score
      - Step 2: Single perfect changes with soft contact (5 min) - combine strength with {commonIssue} improvement
      - Step 3: Execute test serpentine pattern (4 min) - maintain {highestScore} quality while improving contact
      Key Points: Use {horseName}'s natural change ability to build confidence while addressing test weaknesses
      Watch For: Don't lose the quality that earned {highestScore} score when focusing on {commonIssue} improvement
      Goal: Maintain {highestScore}+ change quality while eliminating {commonIssue} throughout test
      Quick Fix: Return to confident change feeling when {commonIssue} patterns start to appear
      PERSONALIZATION REQUIREMENTS:
          •    Every recommendation must feel like it was written specifically for this rider and horse
          •    Reference their exact test results, not generic advice
          •    Use their actual scores and judge comments
          •    Target their specific movements that need improvement
          •    Build on their actual strengths from the test
      IMPACT ANALYSIS:
          •    Calculate how much each improvement could affect overall score
          •    Prioritize issues by frequency and impact
          •    Connect individual movements to overall test performance
          •    Show the relationship between fixing specific issues and score improvement
      Include horse name in instruction when possible

      4. CIRCLE EXERCISES
      Exercise: {horseName} Circle Precision Training
      Focus: Improving circle accuracy and bend consistency for {lowestMovement} that scored {lowestScore}
      Setup: Practice circles at key positions to develop bend and balance
      Method:
      - Step 1: Establish {horseName} rhythm on 10m circle at A - create natural bend baseline
      - Step 2: Practice 10m circle at X maintaining consistent contact - develop collection
      - Step 3: Execute 10m circle at B with clear inside flexion - competition precision
      Key Points: {horseName} needs consistent bend throughout entire circle - maintain rhythm while developing flexion
      Watch For: Avoid square corners or egg-shaped patterns that judges penalize
      Goal: Achieve perfect round circles with sustained bend and rhythm
      Quick Fix: Focus on outside rein control to maintain shape while inside leg creates bend

      Add this into the beginning 
      You are a Grand Prix level expert trainer and need to provide excersises to help your students improve their scores  based on their test sheets. 

      CRITICAL: Use actual data from the test sheet for personalized recommendations.
      Before generating recommendations, you MUST:
          
      Count specific issues - If “BOCA ABIERTA” appears 7 times, use that exact number
      Reference exact movements - Use specific movement numbers that had problems
      Quote actual judges - Use real judge comments in original language
      Target specific scores - Reference the actual lowest and highest scores
      Use horse’s name throughout - Never use generic “horse” or “rider”
      Example Analysis:
          •    If Movement 2 scored 5.5 (lowest), target that specific movement
          •    If “BOCA ABIERTA” mentioned 7 times, focus on contact as primary issue
          •    If Judge H said “MAS ANGULO”, use that exact quote
          •    If movements 1,5,6,10,22 had contact issues, reference those specific numbers
          For each weakness-svg entry, you MUST:

      Extract exact positions from the recommendation text - if it mentions "M-B track", use positions ["M", "B"]
      Use precise speed mentioned in the recommendation - if it says "trot", use "Trot"
      Match instruction text exactly to what's written in the recommendation
      Reference specific movements - if targeting Movement 2, mention this in the instruction
      Include horse name in instruction when possible
      Note: If type is "transitions", you should not mention about circle exercises and ensure size is consist.
      
      Example Enhanced weakness-svg:
      json{
        "title": "Varadero Shoulder-in Development",
        "weakness": "Movement 2 scored 5.5 - insufficient angle (MAS ANGULO)",
        "type": "lateral",
        "positions": ["M", "B", "H", "E"],
        "speed": "Trot",
        "size": "small",
        "instruction": "Practice Varadero shoulder-in M-B and H-E tracks with 30° angle to improve Movement 2 from 5.5 to 7.0+"
      }

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
        "weaknesses-svg": [
          {
            "title": "Circle Accuracy Exercise",
            "weakness": "Inconsistent 10m circle shape at S",
            "type": "accuracy",
            "positions": ["S", "M"],
            "size": "large",
            "speed": "Trot",
            "instruction": "Practice 10m circles at S, maintaining exact shape through M"
          },
          {
            "title": "Circle Accuracy Exercise",
            "weakness": "Inconsistent 10m circle shape at S",
            "type": "accuracy",
            "positions": ["S", "M"],
            "size": "large",
            "speed": "Free Walk",
            "instruction": "Practice 10m circles at S, maintaining exact shape through M"
          }
        ]
        "generalComments": {
          "judgeA": "Work on balanced halts",
          "judgeB": "Work on balanced halts",
          "judgeC": "Good Rider"
        },
        "recommendations": [
          {
            "exercise": [Exercise Name],
            "setup": [Brief requirements],
            "method": [3 progressive steps],
            "keyPoints": [Critical success factors],
            "watchFor": [Main pitfall to avoid],
            "goal": [Specific target],
            "quickFix": [Immediate action item],
            "tip": "Practice more balanced halts",
            "reason": "Weakness in balanced halts"
          },
          {
            "exercise": [Exercise Name],
            "setup": [Brief requirements],
            "method": [3 progressive steps],
            "keyPoints": [Critical success factors],
            "watchFor": [Main pitfall to avoid],
            "goal": [Specific target],
            "quickFix": [Immediate action item],
            "tip": "Practice more balanced halts",
            "reason": "Weakness in balanced halts"
          },
          {
            "exercise": [Exercise Name],
            "setup": [Brief requirements],
            "method": [3 progressive steps],
            "keyPoints": [Critical success factors],
            "watchFor": [Main pitfall to avoid],
            "goal": [Specific target],
            "quickFix": [Immediate action item],
            "tip": "Practice more balanced halts",
            "reason": "Weakness in balanced halts"
          },
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
          // if the current version is English ("en"), provied the English contents; otherwise, provide the Spanish equivalents ["Alto en X", "Alto en Y"].
        }
        "lowestScore": {
          "score": 6,
          "movement": ["Halt at X", "Halt at Y"]
          // if the current version is English ("en"), provied the English contents; otherwise, provide the Spanish equivalents ["Alto en X", "Alto en Y"].
        },
        "personalInsight": "You seem to be a rider who excels at precise technical elements, especially halts and geometry. However, if you focus more on relaxation and expression during transitions and medium gaits, you could significantly improve your overall performance."
           
      }
      Percentage, strengths (at least 2 strengths), weaknesses (at least 2 weaknesses), recommendations, focus area and personal insight(Your personal thoughts) must be required in results.
      And also you should extract the highest and lowest scores and extract all movements of that.
      If percentage is null, you should calculate percentage with each judges' scores, max scores and coefficiente. Percentage can be a simple average of all judges' scores relative to their max scores (normally 10). This average must fall between the lowest and highest individual scores. However, accuracy in representation and extraction is the top priority
      At least 3 Recommendations are needed and all recommendations should be deep, meaningful, useful, correct and in detail (More specific exercise recommendations as well such as: "Try shoulder - in exercises" rather than just "focus on relaxtion").
      Ensure recommendations are specific, actionable, and progressive while remaining concise.
      Ensure no mixed-language elements appear, All contents should be English.
      And only return the full JSON not truncated without any comment like "Here is the analyzed result of the document.".
      And should choose professional riding words like "flying changes" instead of "changes of leg" and your personal insight content pattern should be written to the person like "You seem to be ... if you ..." with 3-5 sentences and must be richful and helpful for riders.
      In other words, riders can get the attractive recommendations, focus area and personal insight from your analysis - you should make them to love this tool.
      REMINDER:
      * All Contents of Json like generalComments, strengths, weaknesses, instructions, prompts, and validation should enforce 100% English, If there's Spanish content, you must translate it to English
    `;
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt
              },
              {
                inlineData: {
                  mimeType: 'application/pdf',
                  data: base64Image
                }
              }
            ]
          }
        ]
      })
    });
    const result_en = await geminiResponse.text();
    if (!geminiResponse.ok) {
      console.error('Gemini error response:', result_en);
      throw new Error(`Gemini API Error: ${geminiResponse.status}`);
    }
    const geminiResult_en = JSON.parse(result_en);
    let resultText = geminiResult_en.candidates[0].content.parts[0].text;
    console.log("resultText:", resultText);
    resultText = resultText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    let finalResult;
    try {
      finalResult = JSON.parse(resultText);
    } catch (err) {
      console.error("❌ Failed to parse JSON:", resultText);
      throw new Error("Gemini returned invalid JSON format");
    }
    const localizationPrompt = `
      You will be given a JSON object. Translate all text content to Spanish, preserving keys and structure.
      In case of weakness-svg, translate only title, instruction and weakness
      Return only the updated JSON, nothing else.
      JSON:
      ${JSON.stringify(finalResult, null, 2)}
      `;
    // 2. Send the updated prompt back to Gemini
    const localizationResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: localizationPrompt
              }
            ]
          }
        ]
      })
    });
    const localizationResultRaw = await localizationResponse.text();
    if (!localizationResponse.ok) {
      console.error('Gemini localization error response:', localizationResultRaw);
      throw new Error(`Gemini API Error: ${localizationResponse.status}`);
    }
    const parsed = JSON.parse(localizationResultRaw);
    let localizedText = parsed.candidates[0].content.parts[0].text;
    // Strip markdown formatting if present
    localizedText = localizedText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    let localizedResult;
    try {
      localizedResult = JSON.parse(localizedText);
    } catch (err) {
      console.error("❌ Failed to parse localized JSON:", localizedText);
      throw new Error("Gemini returned invalid localized JSON format");
    }
    await supabase.from('analysis_results').insert({
      document_id: documentId,
      result_json: {
        en: finalResult,
        es: localizedResult
      }
    });
    await supabase.from('document_analysis').update({
      status: 'completed',
      updated_at: new Date().toISOString()
    }).eq('id', documentId);
    const { data: analysisRows, error: analysisError } = await supabase.from('document_analysis').select('user_id').eq('id', documentId).single();
    if (analysisError) {
      console.error("Error fetching document_analysis:", analysisError);
      return;
    }
    // Insert only the first 2 recommendations
    await Promise.all(localizedResult.en.recommendations.slice(0, 2).map(async (recommendation)=>{
      // Calculate target date after one month
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      const targetDate = oneMonthLater.toISOString().split("T")[0];
      await supabase.from('goals').insert({
        user_id: analysisRows.user_id,
        goal_text: recommendation.goal,
        goal_type: 'short-term',
        progress: 0,
        target_date: targetDate
      });
    }));
    return new Response(JSON.stringify({
      success: true,
      result: finalResult
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    console.error('❌ Edge Function error:', err);
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
