// Supabase Edge Function with manual JWT authentication for Gemini Pro Vision 
// WITH AI INTERPRETATION saved ONLY to analysis_results
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

// Helper function to generate fallback AI interpretation if AI doesn't provide it
function generateFallbackVideoFeedback(videoAnalysis: any) {
  const complaints: string[] = [];
  const interpretations: string[] = [];
  const areas: Array<{name: string, fix: string}> = [];

  // Extract complaints from fault patterns
  if (videoAnalysis.fault_patterns && Array.isArray(videoAnalysis.fault_patterns)) {
    videoAnalysis.fault_patterns.forEach((pattern: any) => {
      if (pattern.content && typeof pattern.content === 'string') {
        complaints.push(`Pattern: ${pattern.content}`);
        
        if (pattern.content.toLowerCase().includes('rail') || pattern.content.toLowerCase().includes('knock')) {
          interpretations.push("Jump technique needs refinement - focus on timing and approach");
          if (!areas.some(a => a.name === "Jump Technique")) {
            areas.push({
              name: "Jump Technique",
              fix: "Practice grid work to improve timing and take-off point"
            });
          }
        } else if (pattern.content.toLowerCase().includes('refusal')) {
          interpretations.push("Confidence and approach to fences needs improvement");
          if (!areas.some(a => a.name === "Confidence to Fences")) {
            areas.push({
              name: "Confidence to Fences",
              fix: "Build confidence with smaller, straightforward fences before progressing"
            });
          }
        } else if (pattern.content.toLowerCase().includes('time fault')) {
          interpretations.push("Pace and rhythm management needs attention");
          if (!areas.some(a => a.name === "Pace Management")) {
            areas.push({
              name: "Pace Management",
              fix: "Practice maintaining consistent rhythm around the course"
            });
          }
        }
      }
    });
  }

  // Extract from jump analysis
  if (videoAnalysis.jump_analysis) {
    if (videoAnalysis.jump_analysis.pattern_recognition) {
      complaints.push(`Pattern: ${videoAnalysis.jump_analysis.pattern_recognition}`);
      interpretations.push("Consistent technical errors affecting performance");
    }
    
    if (videoAnalysis.jump_analysis.technical_recommendations && 
        !areas.some(a => a.name === "Technical Skills")) {
      areas.push({
        name: "Technical Skills",
        fix: videoAnalysis.jump_analysis.technical_recommendations
      });
    }
  }

  // Fallback if no specific complaints found
  if (complaints.length === 0) {
    const totalFaults = videoAnalysis.round_summary?.["Total faults"] || "unknown";
    complaints.push(`Video analysis detected ${totalFaults} in the round`);
    interpretations.push("General jumping performance needs refinement");
  }

  if (areas.length === 0) {
    areas.push({
      name: "Overall Jumping Performance",
      fix: "Practice course work focusing on rhythm, straightness, and confidence"
    });
  }

  return {
    complaints: complaints.slice(0, 5),
    interpretations: interpretations.slice(0, 5),
    areas: areas.slice(0, 3)
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

    const { documentId, base64Video } = await req.json();

    if (!documentId || !base64Video) {
      return new Response(JSON.stringify({
        error: 'Missing documentId or base64Video'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Update status to processing
    await supabase.from('document_analysis').update({
      status: 'processing',
      updated_at: new Date().toISOString()
    }).eq('id', documentId);

    const accessToken = await getGoogleAccessToken(serviceAccount);
    const model = "gemini-2.0-flash";
    const geminiUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${serviceAccount.project_id}/locations/us-central1/publishers/google/models/${model}:generateContent`;

    // =====================================================
    // PROMPT WITH AI INTERPRETATION SECTION
    // =====================================================
    const prompt = `
      Please analyze the uploaded rider video and return a JSON structured summary with the following sections:

      1. **Round Summary**
        - Total faults (include type: rail, refusal, time fault)
        - Number of clear jumps vs total (total faults + clear jumps should equal total jumps)
        - Time (video duration in seconds)

      2. **Course Analysis**
        - Basic digitized course map (jump layout representation)
        - Jump types and counts (e.g., verticals, oxers, combinations)
        - General course difficulty (based on spacing, turn difficulty)
        Example format:
        {"Course Map": "Simple digitized version showing jump layout", "Jump types identified": "6 verticals, 4 oxers, 1 triple combination, 2 water jumps", "Course difficulty": "3 difficult jumps but easy to turn"}
        Total count of jumps should match jump-by-jump results.

      3. **Jump-by-Jump Results**
        For each jump:
        - Jump number
        - Jump type
        - Result (e.g., clear, rail, refusal, time fault)

      4. **Performance Highlights**
        - Best Jump: Identify one standout jump with explanation
        - Area for Improvement: All problematic jumps or patterns with context
        - Include 3-4 specific training recommendations based on fault patterns
        - Include approach/technique observations
        - Suggest specific exercises or course types to practice

      5. **Jump Analysis**
        - Pattern recognition (e.g., "You had rails at jumps 3,7, and 11 - all verticals after turns")
        - Approach analysis (e.g., "Your best jump was #3 - consistent approach")
        - Technical recommendations (e.g., "Practice gymnastic exercises to improve takeoff timing")
        - Course Strategy insights (e.g., "You tend to rush combinations")

      6. **Simple Fault Patterns**
        - Most common fault type
        - Course location trends (first half vs second half)
        - Jump type trends (e.g., combination faults, water jump issues)

      7. **Progress Tracking**
        - Show recent trend in clear round rate (if previous data available)
        - Identify consistent strengths
        - Highlight focus area for improvement

      ===========================================
      CRITICAL: ADD AI INTERPRETATION (JUDGE FEEDBACK)
      ===========================================
      
      After the main analysis above, you MUST include this "aiInterpretation" section in BOTH English and Spanish:

      "aiInterpretation": {
        "complaints": [
          "Extract specific performance complaints from the video analysis",
          "Focus on critical issues that need addressing",
          "Be specific about faults and patterns observed"
        ],
        "interpretations": [
          "Explain what each complaint means in practical terms",
          "Provide clear interpretation for improvement",
          "Connect complaints to underlying technical issues"
        ],
        "areas": [
          {
            "name": "Specific area that needs work (e.g., 'Approach to Vertical Fences')",
            "fix": "Actionable, practical fix for this area"
          },
          {
            "name": "Another area needing attention (e.g., 'Combination Riding')", 
            "fix": "Clear, actionable fix with specific exercises"
          }
        ]
      }

      RULES for aiInterpretation:
      - Complaints should be based on actual faults observed in video
      - Interpretations must explain the "why" behind each complaint
      - Areas must be specific and actionable
      - Provide practical, exercise-based fixes
      - Focus on issues mentioned in the analysis above
      - Include BOTH English and Spanish versions (en and es must each have aiInterpretation)

      ===========================================
      FINAL OUTPUT STRUCTURE
      ===========================================
      {
        "en": {
          "personalInsight": "Based on your riding patterns, you appear to be...",
          "round_summary": {"Total faults": "2(1 rail, 1 time fault)", "Clear jumps": "11 out of 13", "Time": 79},
          "course_analysis": {"Course Map": "...", "Jump types identified": "...", "Course difficulty": "..."},
          "jump_by_jump_results": [...],
          "performance_highlights": {...},
          "jump_analysis": {...},
          "fault_patterns": [...],
          "recommendations": [...],
          "aiInterpretation": {
            "complaints": ["Multiple rails at vertical fences after turns"],
            "interpretations": ["Turn management affects approach quality"],
            "areas": [{"name": "Turn Management", "fix": "Practice turning exercises"}]
          }
        },
        "es": {
          "personalInsight": "...",
          "round_summary": {...},
          "course_analysis": {...},
          "jump_by_jump_results": [...],
          "performance_highlights": {...},
          "jump_analysis": {...},
          "fault_patterns": [...],
          "recommendations": [...],
          "aiInterpretation": {
            "complaints": ["Múltiples rails en vallas verticales después de giros"],
            "interpretations": ["La gestión de giros afecta la calidad del enfoque"],
            "areas": [{"name": "Gestión de Giros", "fix": "Practicar ejercicios de giro"}]
          }
        }
      }

      IMPORTANT REQUIREMENTS:
      - aiInterpretation MUST be included in both English and Spanish sections
      - At least 3 Recommendations are needed
      - Return ONLY valid JSON without any additional text
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
    
    console.log("Video analysis result received");

    let finalResult;
    try {
      finalResult = JSON.parse(resultText);
      
      // Ensure aiInterpretation exists in English
      if (!finalResult.en?.aiInterpretation) {
        console.warn("⚠️ AI didn't include aiInterpretation in English, generating fallback...");
        if (!finalResult.en) finalResult.en = {};
        finalResult.en.aiInterpretation = generateFallbackVideoFeedback(finalResult.en);
      }
      
      // Ensure aiInterpretation exists in Spanish (create if missing)
      if (!finalResult.es?.aiInterpretation) {
        console.warn("⚠️ AI didn't include aiInterpretation in Spanish, creating placeholder...");
        if (!finalResult.es) finalResult.es = {};
        finalResult.es.aiInterpretation = {
          complaints: ["Interpretación IA no disponible en español"],
          interpretations: ["Los detalles están disponibles en la versión en inglés"],
          areas: [{
            name: "Análisis Completo",
            fix: "Consulte la versión en inglés para la interpretación detallada"
          }]
        };
      }
      
      console.log("✅ Video analysis with AI interpretation generated");
      
    } catch (err) {
      console.error("❌ Failed to parse JSON:", err);
      console.log("Raw text sample:", resultText.substring(0, 500));
      throw new Error("Gemini returned invalid JSON format");
    }

    // =====================================================
    // SAVE TO DATABASE (ONLY analysis_results)
    // =====================================================

    console.log("💾 Saving complete analysis to analysis_results...");
    
    const { error: resultsError } = await supabase
      .from('analysis_results')
      .insert({
        document_id: documentId,
        result_json: finalResult,  // Contains everything including aiInterpretation
        created_at: new Date().toISOString()
      });

    if (resultsError) {
      console.error('Failed to save analysis results:', resultsError);
      throw new Error('Failed to save analysis results');
    }

    // Update document status
    await supabase.from('document_analysis').update({
      status: 'completed',
      updated_at: new Date().toISOString()
    }).eq('id', documentId);

    console.log("✅ Video analysis completed and saved successfully");

    // Return complete result (frontend handles old/new formats)
    return new Response(JSON.stringify({
      success: true,
      result: finalResult  // Return FULL bilingual result
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