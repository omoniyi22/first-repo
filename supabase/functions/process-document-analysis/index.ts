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
    const prompt = `This is the test score sheet of one rider's jumping or dressage movement. Each movement is evaluated by several judges. Extract JSON with rider, movement, score, comments, patterns, totall scores and percentage. Every individual movement should include all judge's score and comment. JSON format should be like follow. All formats must be followed like an example and if there are no contents, fill the field with - {"totalScore":68,"percentage":68.5,"scores":[{"movement":"Halt at X","judgeA":6,"judgeB":6,"judgeC":6,"maxScore":10,"commentA":"Slightly unbalanced","commentB":"Slightly unbalanced","commentC":"Slightly unbalanced"},{"movement":"Halt at X","judgeA":6,"judgeB":6,"judgeC":6,"maxScore":10,"commentA":"Slightly unbalanced","commentB":"Slightly unbalanced","commentC":"Slightly unbalanced"},],"strengths":["Good rhythm","Nice energy throughout","Attentive to aids"],"weaknesses":["Tension in transitions","Balance in halts needs work"],"generalComments":{"judgeA":"Work on balanced halts","judgeB":"Work on balanced halts","judgeC":"",},"faults":[{"jumpNumber":1,"faultType":"Knockdown","faults":4,"description":"Back rail"},{"jumpNumber":5,"faultType":"Refusal","faults":4,"description":"First refusal"}],"totalFaults":8,"courseTime":82.4,"optimumTime":80,"timePenalties":1,"jumpTypes":["Vertical","Oxer","Combination","Water jump"],"commonErrors":["Coming too fast to verticals","Rushing combinations"]}`;
    const cleanBase64 = base64Image.replace(/^data:image\/png;base64,/, '');
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
    console.log("geminiResult", geminiResult.candidates[0].content.parts[0]);
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
