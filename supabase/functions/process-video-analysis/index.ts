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
    const { documentId, base64Video } = await req.json();
    if (!documentId || !base64Video) {
      return new Response(JSON.stringify({
        error: 'Missing documentId or base64Video'
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
      Please analyze the uploaded rider video and return a JSON structured summary with the following sections:

      1. **Round Summary**
        - Total faults (include type: rail, refusal, time fault)
        - Number of clear jumps vs total (total faults + clear jumps should be same with total jumps)
        - Time (it will be length of video but you can adjust this as seconds)

      2. **Course Analysis**
        - Basic digitized course map (jump layout representation)
        - Jump types and counts (e.g., verticals, oxers, combinations)
        - General course difficulty (based on spacing, turn difficulty)
        You should extract all infos like follow:
        {"Course Map": "Simple digitized version showing jump layout", "Jump types identified": "6 verticals, 4 oxers, 1 triple combination, 2 water jumps", "Course difficulty": "3 difficult jumps but easy to turn"},
        Here, Total count of jumps (6 + 4 + 1 + 2 = 13) in Jump types identified should be same with follow Jump Number
         
      3. **Jump-by-Jump Results**
        For each jump:
        - Jump number
        - Jump type
        - Result (e.g., clear, rail, refusal, time fault)

      4. **Performance Highlights**
        - Best Jump: Identify one standout jump with explanation
        - Area for Improvement: All problematic jumps or pattern with context and history (if available)
        Add 3-4 specific training recommendations based on fault patterns.
        Include approach/technique observations beyond just "naturally athletic".
        Suggest specific exercises or course types to practice.

      5. **Jump Analysis**
        - Peattern recognition
        e.g,.: "You had rails at jumps 3,7, and 11 - all verticals after turns. Focus on maintaining rhythm through corners"
        - Approach analysis
        e.g,.: "Your best jump was #3 - consistent approach to the vertical. Try replicating this rhythm on other verticals."
        - Technical recommendations
        e.g,.: "Practice gymnastic exercises to improve your takeoff timing" / "Work on maintaining leg position over oxers." and so on...
        - Course Strategy insights
        e.g,.: "You tend to rush combinations - practice counting strides between elements" (Maybe identify the rider's strongest type of jump - verticals vs oxers vs combinations)

      6. **Simple Fault Patterns**
        - Most common fault type
        - Course location trends (first half vs second half)
        - Jump type trends (e.g., combination faults, water jump issues)

      7. **Progress Tracking**
        - Show recent trend in clear round rate (if previous data is available)
        - Identify consistent strengths
        - Highlight focus area for improvement

      Output the final analysis in the following JSON structure (this is sample data, just follow the structure no content!!):
      {
        "en": {
          "personalInsight": "Based on your riding patterns, you appear to be a rider who excels at precise technical elements but may benefit from developing more expression and freedom in movements."
          "round_summary": {"Total faults": "2(1 rail, 1 time fault)", "Clear jumps": "11 out of 13", "Time": 79},
          "course_analysis": {"Course Map": "...", "Jump types identified": "6 verticals, 4 oxers, 1 triple combination, 2 water jumps", "Course difficulty": "... (You should get the difficulty based on jump spacing and turn requirements)"},
          "jump_by_jump_results": [...],
          "performance_highlights": {
            "best_jump": {jump_number: 11, strengths: ['Consistently clear across recent rounds', 'Strong, confident approach maintained', 'Good rhythm and balance']},
            "area_for_improvement": [{jump_number: 7, weakness: ['Pattern shows difficulty with related distances in combinations', 'Pattern shows difficulty with related distances in combinations'], tip: ['exercise more' ...]}]
          },
          "jump_analysis": {
            "pattern_recognition": "You had rails at jumps 3,7, and 11 - all verticals after turns. Focus on maintaining rhythm through corners",
            "approach_analysis": "Your best jump was #3 - consistent approach to the vertical. Try replicating this rhythm on other verticals.",
            "technical_recommendations": "Practice gymnastic exercises to improve your takeoff timing",
            "course_strategy_insight": "You tend to rush combinations - practice counting strides between elements" 
          },
          "fault_patterns": [{area: 'Most common fault type', content: 'Rails (75% of total faults)'}, {area: 'Fault location pattern', content: '80% of faults occur in second half of course'}],
          "recommendations": [{tip: "Practicse more balanced halts", "reason": "Weak of Balanced Halts"}, {tip: "Practicse more balanced halts", "reason": "Weak of Balanced Halts"}]
        },
        "es": {...}
      }
      You should extract the helpful, meaninful, and also correct performance highlights and faults from the video.
      Your personal insight content pattern should be written to the person like "You seem to be ... if you ..." with 3-5 sentences and must be richful and helpful for riders.
      At least 3 Recommendations are needed and all recommendations should be deep, meaningful, useful, correct and in detail to improve rider's skill based on analysis.
      Only return the JSON without any comment like "Here is the analyzed result of the video.". Keep explanations short, objective, and specific.
      I need the results with both Spanish and English - (en, es).
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
                  mimeType: 'video/mp4',
                  data: base64Video
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
    resultText = resultText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    console.log("resultText:", resultText);
    let finalResult;
    try {
      finalResult = JSON.parse(resultText);
    } catch (err) {
      console.error("❌ Failed to parse JSON:", resultText);
      throw new Error("Gemini returned invalid JSON format");
    }
    console.log("geminiVideoResult", finalResult);
    await supabase.from('analysis_results').insert({
      document_id: documentId,
      result_json: finalResult
    });
    await supabase.from('document_analysis').update({
      status: 'completed',
      updated_at: new Date().toISOString()
    }).eq('id', documentId);
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
