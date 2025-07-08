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
      When providing training recommendations, structure each
      recommendation as follows:
      **Exercise: [Name]**
      **Focus:** [Specific issue being addressed]
      **Setup:** [Brief arena/equipment requirements]
      **Method:** [3-step progressive approach]
      **Key Points:** [2-3 critical success factors]
      **Watch For:** [Main mistake to avoid]
      **Goal:** [Specific improvement target]
      Keep recommendations practical and actionable while maintaining concise format like follow
      1. CONTACT/CONNECTION ISSUES
      Based on contact tension issues (low scores in [movements]),
      provide this recommendation:
      **Exercise: Progressive Contact Development**
      **Focus:** Establishing consistent, elastic connection
      **Setup:** 20m circle, start on long rein
      **Method:**
      - Step 1: Walk 5 minutes allowing horse to stretch down naturally
      - Step 2: Gradually shorten reins while maintaining horse's
      forward reach
      - Step 3: Practice gentle give-and-take exercises in trot
      **Key Points:** Horse should seek the contact, never pull
      backward to create it
      **Watch For:** Avoid pulling or restricting - ride leg to hand,
      not hand to leg
      **Goal:** Achieve steady, light contact that feels "alive" in
      your hands
      **Quick Fix:** Before each movement, ensure horse is reaching
      forward into soft hands
      2. TRANSITION QUALITY
      Based on poor transition scores in [specific transitions], provide this recommendation:
      Unset
      **Exercise: Three-Phase Transition Training**
      **Focus:** Clean, balanced transitions at precise markers
      **Setup:** Use dressage letters as transition points, count
      strides
      **Method:**
      - Step 1: Practice walk-halt transitions - prepare 3 strides
      before letter
      - Step 2: Add trot transitions using same 3-stride preparation
      rule
      - Step 3: Practice test-specific transitions with exact timing
      **Key Points:** Preparation is everything - half-halt before
      asking, maintain rhythm after
      **Watch For:** Don't rush the ask - horse should be balanced
      before transition request
      **Goal:** Execute transitions exactly at the letter with
      maintained balance
      **Quick Fix:** Count "prepare-half halt-ask" for every transition

      3. MOVEMENT ACCURACY (e.g., LEG YIELD)
      Based on leg yield execution issues (score [X]), provide this
      recommendation:
      **Exercise: Progressive Leg Yield Development**
      **Focus:** Forward-sideways movement with rhythm maintenance
      **Setup:** Start quarterline to centerline, use ground markers
      every 5m
      **Method:**
      - Step 1: Walk leg yield along wall for safety and understanding
      - Step 2: Trot shallow angle (minimal bend) focusing on rhythm
      Unset
      - Step 3: Gradually increase angle while checking straightness
      after
      **Key Points:** Think forward-sideways, not just sideways -
      maintain impulsion throughout
      **Watch For:** Avoid over-bending neck - movement comes from
      body, not just head
      **Goal:** Cross legs cleanly while staying parallel to long side
      **Quick Fix:** Keep outside rein steady to prevent neck
      over-bend, inside leg at girth

      4. RHYTHM/TEMPO ISSUES
      Based on rhythm irregularities in [gait], provide this
      recommendation:
      **Exercise: Rhythm Stabilization Program**
      **Focus:** Establishing and maintaining consistent tempo
      **Setup:** Large circles and straight lines, avoid corners
      initially
      **Method:**
      - Step 1: Find horse's natural rhythm on 20m circle in [gait]
      - Step 2: Practice maintaining this rhythm through simple changes
      of direction
      - Step 3: Gradually add more complex movements while checking
      rhythm
      **Key Points:** Count the beat out loud - 1-2-1-2 for trot,
      1-2-3-1-2-3 for canter
      **Watch For:** Don't push for "more" if rhythm suffers -
      establish beat first, energy second
      **Goal:** Consistent rhythm that you can count throughout entire
      test
      Unset
      **Quick Fix:** When rhythm falters, return to 20m circle and
      re-establish beat
      5. IMPULSION/ENERGY ISSUES
      Based on low impulsion scores in [movements], provide this
      recommendation:
      **Exercise: Forward Energy Development**
      **Focus:** Creating active hindquarters and engagement
      **Setup:** Straight lines and large circles, dressage whip
      available
      **Method:**
      - Step 1: Establish clear forward response to light leg aid in
      walk
      - Step 2: Practice immediate trot transitions from light leg cue
      - Step 3: Maintain energy through movements using half-halts, not
      pulling
      **Key Points:** Impulsion comes from behind - active hindlegs,
      not faster frontlegs
      **Watch For:** Don't confuse speed with impulsion - horse can be
      slow but engaged
      **Goal:** Horse responds immediately to light leg aid and
      maintains energy independently
      **Quick Fix:** Before each movement, check horse's immediate
      response to leg aid
      6.  For weaknesses analysis, provide structured data from weakness (counts should be same - if you extract 3 weaknesses, you should draw 3 diagrams) including:
      - Arena size detection 
      While analyzing the document, if there is "S", "V", "R", "P", "I" or "L" positions, arena size is large, otherwise small.
      (large if positions include "S","V","R","P","I" or "L" else small)
      And also some positions are combined like "PM", and in that case you should analyze by character.
      for example, if document contains "PM", it will be large.
      - Specific weakness description
      - Movement positions (like S, M, H, etc.) Positions can be only letters not number.
      - Movement speed can be "Walk", "Trot", "Canter", "Halt", "Transition", "Free Walk":
      - Recommended exercises with exact positions - exact positions are essential!
      If the weakness type is accuracy, the recommendation must be: "Practise 10m circles at [exact positions]," followed by a short reason or coaching instruction. 
      For other types of weaknesses, suggest appropriate exercises with positions and a relevant coaching sentence, but do not mention circle excercies. You must not mention kind of circle exercises in weaknesses except for Accuracy

      Required weakness format:
      {
        "title": "Exercise title matching weakness type",
        "weakness": "Specific description from judges' comments",
        "type": "accuracy"|"transitions"|"straightness"|"rhythm",
        "positions": ["A", "C"],
        "speed": "Walk",
        "size": "large"|"small",
        "instruction": "Specific practice instruction with positions"
      }

      This is total output result sample.
      {
        "en": {
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
              "weakness": "Inconsistent 20m circle shape at S",
              "type": "accuracy",
              "positions": ["S", "M"],
              "size": "large",
              "speed": "Trot",
              "instruction": "Practice 20m circles at S, maintaining exact shape through M"
            },
            {
              "title": "Circle Accuracy Exercise",
              "weakness": "Inconsistent 20m circle shape at S",
              "type": "accuracy",
              "positions": ["S", "M"],
              "size": "large",
              "speed": "Free Walk",
              "instruction": "Practice 20m circles at S, maintaining exact shape through M"
            }
          ]
          "generalComments": {
            "judgeA": "Work on balanced halts - 6.5",
            "judgeB": "Work on balanced halts - 7",
            "judgeC": "Good Rider - 8"
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
                "Exercise": "20m circle with gradual spiral in and out"
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
          },
          "lowestScore": {
            "score": 6,
            "movement": ["Halt at X", "Halt at Y"]
          },
          "personalInsight": "You seem to be a rider who excels at precise technical elements, especially halts and geometry. However, if you focus more on relaxation and expression during transitions and medium gaits, you could significantly improve your overall performance."
        },
        "es": {...}        
      }
      Percentage, strengths (at least 2 strengths), weaknesses (at least 2 weaknesses), recommendations, focus area and personal insight(Your personal thoughts) must be required in results.
      And also you should extract the highest and lowest scores and extract all movements of that.
      If percentage is null, you should calculate percentage with each judges' scores, max scores and coefficiente. Percentage can be a simple average of all judges' scores relative to their max scores (normally 10). This average must fall between the lowest and highest individual scores. However, accuracy in representation and extraction is the top priority
      At least 3 Recommendations are needed and all recommendations should be deep, meaningful, useful, correct and in detail (More specific exercise recommendations as well such as: "Try shoulder - in exercises" rather than just "focus on relaxtion").
      Ensure recommendations are specific, actionable, and progressive while remaining concise.
      I need the results with both Spanish and English - (en, es).
      In en version, all content (including highest scores movements and so on.) should be English, otherwise, all content should be Spanish. So all contents language should be consistent in one mode
      And in general comments, after writing the judge's comment, you should write the average score of each judge like "Work on balanced halts - 6.5".
      And only return the full JSON not truncated without any comment like "Here is the analyzed result of the document.".
      And should choose professional riding words like "flying changes" instead of "changes of leg" and your personal insight content pattern should be written to the person like "You seem to be ... if you ..." with 3-5 sentences and must be richful and helpful for riders.
      In other words, riders can get the attractive recommendations, focus area and personal insight from your analysis - you should make them to love this tool.
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
    const result = await geminiResponse.text();
    if (!geminiResponse.ok) {
      console.error('Gemini error response:', result);
      throw new Error(`Gemini API Error: ${geminiResponse.status}`);
    }
    const geminiResult = JSON.parse(result);
    let resultText = geminiResult.candidates[0].content.parts[0].text;
    console.log("resultText:", resultText);
    resultText = resultText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    let finalResult;
    try {
      finalResult = JSON.parse(resultText);
    } catch (err) {
      console.error("❌ Failed to parse JSON:", resultText);
      throw new Error("Gemini returned invalid JSON format");
    }
    await supabase.from('analysis_results').insert({
      document_id: documentId,
      result_json: finalResult
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
    await Promise.all(finalResult.en.recommendations.slice(0, 2).map(async (recommendation)=>{
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
