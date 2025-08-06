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
serve(async (req) => {
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
      In each recommendation, you should give 3 exercises with real value instead of {value} - horse name, lowest score, lowest movement.

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
          Step 3: Test rhythm consistency through corners and turns
        Key Points: {horseName} needs metronome-like consistency - judge noted tempo fluctuations
        Watch For: Avoid rushing through corners or slowing on straightaways
        Goal: Achieve consistent rhythm that scores 7.0+ in future tests
        Quick Fix: Count out loud to maintain steady tempo throughout movement
        Size: Small || Large
        Type: Contact-A

        Exercise 1B: Forward Drive Development
        Focus: Improving insufficient forward movement
        Setup: Practice on straight lines A-C and C-A with clear forward intention
        Method:
          Step 1: Build forward desire through leg aid acceptance - create willingness to move forward
          Step 2: Practice maintaining forward through transitions - prevent backward thinking
          Step 3: Develop sustained forward energy without rushing
        Key Points: {horseName} needs clear forward impulse - judge specifically noted lack of energy
        Watch For: Distinguish between forward energy and rushing - maintain quality of gait
        Goal: Transform {lowestMovement} from {lowestScore} to 7.0+ with proper forward drive
        Quick Fix: Use leg aid before every movement to ensure forward preparation
        Size: Small || Large
        Type: Contact-B

        Exercise 1C: Straightness Correction
        Focus: Improving crookedness and alignment issues
        Setup: Use center line X-G and G-X for straightness training
        Method:
          Step 1: Practice tracking straight on center line - equal weight on both sides
          Step 2: Develop even rein contact and leg pressure - eliminate one-sided dominance
          Step 3: Test straightness through transitions and halts
        Key Points: {horseName} needs equal engagement from both sides - judge noted deviation
        Watch For: Avoid over-correcting to one side - maintain neutral alignment
        Goal: Achieve straight tracking that improves overall test harmony
        Quick Fix: Check shoulder alignment matches hip alignment before each movement
        Size: Small || Large
        Type: Contact-C

      2. LATERAL WORK:

      Exercise 2A: Shoulder-in Precision Training
      Focus: Improving shoulder-in angle and bend consistency
      Setup: Practice exact test track M-B and H-E where movement lost points
      Method:
        Step 1: Establish correct bend through preparatory transitions - create flexion judges expect
        Step 2: Practice 20° angle M-B track maintaining forward - address "insufficient angle" criticism
        Step 3: Develop 30° competition angle H-E track - exact test requirements
      Key Points: {horseName} needs clear 3-track pattern with sustained forward movement
      Watch For: Avoid over-bending neck which creates 4-track not 3-track pattern
      Goal: Transform movement from {lowestScore} to 7.0+ by achieving proper angle and bend
      Quick Fix: Check 3-track pattern is visible from judge C position before executing
      Size: Small || Large
      Type: Lateral-A

      Exercise 2B: Leg-yield Clarity Training
      Focus: Improving leg-yield crossing and angle
      Setup: Practice quarter-line to rail and rail to quarter-line patterns
      Method:
        Step 1: Establish sideways thinking through ground poles - create lateral awareness
        Step 2: Practice maintaining forward-sideways balance - prevent loss of forward momentum
        Step 3: Develop clear crossing pattern with consistent angle
      Key Points: {horseName} needs visible crossing steps - judge noted insufficient lateral movement
      Watch For: Maintain forward energy while moving sideways - avoid backward steps
      Goal: Achieve clear leg-yield that demonstrates proper lateral education
      Quick Fix: Use inside leg to outside rein connection for better lateral response
      Size: Small || Large
      Type: Lateral-B

      Exercise 2C: Half-pass Development
      Focus: Improving half-pass collection and crossing
      Setup: Practice diagonal lines from quarter-line to rail
      Method:
        Step 1: Build collection through shoulder-fore preparation - create engagement for half-pass
        Step 2: Practice maintaining bend direction while moving sideways
        Step 3: Develop expressive crossing steps with sustained forward energy
      Key Points: {horseName} needs clear crossing with maintained collection
      Watch For: Avoid leading with quarters - maintain shoulder-leading position
      Goal: Transform half-pass quality from basic to competition level
      Quick Fix: Think shoulder-fore angle before beginning half-pass movement
      Size: Small || Large
      Type: Lateral-C

      4. CIRCLE EXERCISES
      Exercise 4A: Circle Bend Development
      Focus: Improving bend consistency and circle accuracy
      Setup: Practice 20m, 15m, and 10m circles at designated points
      Method:
        Step 1: Establish correct bend on 20m circle - create foundation flexion
        Step 2: Maintain bend quality on 15m circle - test bend consistency
        Step 3: Develop precise bend on 10m circle - achieve competition requirements
      Key Points: {horseName} needs uniform bend from poll to tail throughout circle
      Watch For: Avoid motorcycle lean or falling in/out of circle
      Goal: Achieve accurate circles with consistent bend quality
      Quick Fix: Use outside aids to maintain circle size and inside aids for bend
      Size: Small || Large
      Type: Circle-A

      Exercise 4B: Circle Suppling Work
      Focus: Improving suppleness and flexibility through circles
      Setup: Use circles at A, B, E, and C positions for comprehensive suppling
      Method:
        Step 1: Practice large circles for basic suppling - establish flexibility
        Step 2: Gradually decrease circle size while maintaining suppleness
        Step 3: Change direction frequently to develop equal suppleness both ways
      Key Points: {horseName} needs equal suppleness in both directions
      Watch For: Resistance to bending - work gradually to improve flexibility
      Goal: Develop equal suppleness that improves overall test performance
      Quick Fix: Return to larger circles if resistance appears
      Size: Small || Large
      Type: Circle-B

      Exercise 4C: Circle Precision Training
      Focus: Improving circle geometry and accuracy
      Setup: Practice exact circle positions required in dressage tests
      Method:
        Step 1: Use arena markers to check circle accuracy - maintain proper geometry
        Step 2: Practice different circle sizes at same location - develop size control
        Step 3: Execute circles with precise entry and exit points
      Key Points: {horseName} needs accurate circle geometry for test success
      Watch For: Egg-shaped or square circles - maintain round geometry
      Goal: Achieve precise circles that score 7.0+ in tests
      Quick Fix: Use arena markers as reference points for circle accuracy
      Size: Small || Large
      Type: Circle-C

      // 5. TRANSITION EXERCISES
      // Exercise 5A: Upward Transition Quality
      // Focus: Improving upward transition smoothness and preparation
      // Setup: Practice transitions on straight lines and through corners
      // Method:
      //   Step 1: Prepare horse mentally and physically before each transition
      //   Step 2: Apply aids gradually for smooth upward transitions
      //   Step 3: Maintain quality of new gait immediately after transition
      // Key Points: {horseName} needs smooth, prepared upward transitions
      // Watch For: Rushing or resistance during transitions
      // Goal: Achieve fluid upward transitions that enhance test flow
      // Quick Fix: Use half-halts to prepare horse before transition aids
      // Size: Small || Large
      // Type: Transition-A

      // Exercise 5B: Downward Transition Balance
      // Focus: Improving downward transition balance and engagement
      // Setup: Practice downward transitions maintaining forward energy
      // Method:
      //   Step 1: Maintain forward thinking while slowing gait
      //   Step 2: Use seat and breathing to encourage downward transitions
      //   Step 3: Keep horse engaged and balanced throughout transition
      // Key Points: {horseName} needs to maintain balance during downward transitions
      // Watch For: Falling on forehand or losing forward momentum
      // Goal: Achieve balanced downward transitions that maintain engagement
      // Quick Fix: Use core engagement to support horse through transition
      // Size: Small || Large
      // Type: Transition-B

      // Exercise 5C: Within-Gait Transitions
      // Focus: Improving collection and extension within gaits
      // Setup: Practice lengthening and collecting on long sides
      // Method:
      //   Step 1: Establish clear difference between working and collected gaits
      //   Step 2: Practice smooth transitions between collection levels
      //   Step 3: Develop expression in extended gaits while maintaining balance
      // Key Points: {horseName} needs clear differences between gait variations
      // Watch For: Loss of rhythm during gait transitions
      // Goal: Achieve clear gait variations that demonstrate training level
      // Quick Fix: Focus on rhythm consistency during all gait changes
      // Size: Small || Large
      // Type: Transition-C

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

      // Use Transition Exercises (5A-5C) when:
      //   - Test comments focus on transition quality
      //   - Horse needs improved balance or preparation
      //   - Collection and extension need development
      
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
            "type": "Contact-A",
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
            "type": "Lateral-A",
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
            "type": "Transition-A",
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
    await Promise.all(localizedResult.en.recommendations.slice(0, 2).map(async (recommendation) => {
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
