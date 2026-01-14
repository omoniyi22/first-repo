// Supabase Edge Function for data extraction with confidence scoring
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { encode as base64Encode } from 'https://deno.land/std@0.192.0/encoding/base64.ts';
import { decode as base64Decode } from 'https://deno.land/std@0.192.0/encoding/base64.ts';
import { crypto } from 'https://deno.land/std@0.192.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// Helper function to convert PEM to ArrayBuffer
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\\n/g, '')
    .replace(/\r?\n/g, '')
    .trim();
  return base64Decode(base64).buffer;
}

// Get Google Access Token using service account
async function getGoogleAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
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
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
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
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signedJWT
    })
  });

  const json = await res.json();
  if (!json.access_token) throw new Error('Failed to get access token');
  return json.access_token;
}

// Calculate confidence scores based on extraction quality
function calculateConfidenceScores(extractedData: any): any {
  const confidenceScores: any = {
    overall: 0,
    fields: {}
  };

  let totalConfidence = 0;
  let fieldCount = 0;
  const lowConfidenceFields: string[] = [];

  // Helper to add field confidence
  const addFieldConfidence = (fieldName: string, value: any, baseConfidence: number) => {
    let confidence = baseConfidence;

    if (!value || value === '' || value === 'null') {
      confidence = 0.3;
    } else if (typeof value === 'string' && value.length < 2) {
      confidence = confidence * 0.7;
    }

    confidenceScores.fields[fieldName] = confidence;
    totalConfidence += confidence;
    fieldCount++;

    if (confidence < 0.80) {
      lowConfidenceFields.push(fieldName);
    }
  };

  // Check horse name
  addFieldConfidence('horseName', extractedData.horse, 0.90);

  // Check percentage (critical field)
  if (extractedData.percentage && !isNaN(extractedData.percentage)) {
    addFieldConfidence('percentage', extractedData.percentage, 0.85);
  } else {
    addFieldConfidence('percentage', extractedData.percentage, 0.50);
  }

  // Check movements
  if (extractedData.movements && Array.isArray(extractedData.movements)) {
    extractedData.movements.forEach((movement: any, index: number) => {
      addFieldConfidence(
        `movement${index + 1}Name`,
        movement.name,
        movement.name ? 0.85 : 0.60
      );

      if (movement.scores) {
        ['judgeA', 'judgeB', 'judgeC'].forEach(judge => {
          const score = movement.scores[judge];
          addFieldConfidence(
            `movement${index + 1}Score${judge.toUpperCase()}`,
            score,
            (score >= 0 && score <= 10) ? 0.90 : 0.50
          );
        });
      }
    });
  }

  // Check judge comments (lower confidence, harder to OCR)
  ['judgeA', 'judgeB', 'judgeC'].forEach(judge => {
    const comment = extractedData.generalComments?.[judge];
    addFieldConfidence(`${judge}Comment`, comment, comment ? 0.70 : 0.50);
  });

  // Calculate overall confidence
  confidenceScores.overall = fieldCount > 0 ? totalConfidence / fieldCount : 0;
  confidenceScores.lowConfidenceFields = lowConfidenceFields;
  confidenceScores.lowConfidenceCount = lowConfidenceFields.length;

  return confidenceScores;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let documentId: string | null = null;

  try {
    // Parse request body
    const requestBody = await req.json();
    documentId = requestBody.documentId;
    const base64Image = requestBody.base64Image;

    if (!documentId || !base64Image) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing documentId or base64Image' }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('🔍 Starting extraction for document:', documentId);

    // Get document info
    const { data: documentData, error: docError } = await supabase
      .from("document_analysis")
      .select("user_id, horse_id, horse_name, test_level, discipline, document_date, competition_type")
      .eq("id", documentId)
      .single();

    if (docError || !documentData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Document not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Update document status to 'extracting'
    await supabase
      .from('document_analysis')
      .update({
        status: 'extracting',
        extraction_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    // Get Google service account
    const raw = Deno.env.get('GEMINI_SERVICE_ACCOUNT_JSON');
    if (!raw) throw new Error('GEMINI_SERVICE_ACCOUNT_JSON is not set');
    const serviceAccount = JSON.parse(raw);

    const accessToken = await getGoogleAccessToken(serviceAccount);
    const model = 'gemini-2.0-flash';
    const geminiUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${serviceAccount.project_id}/locations/us-central1/publishers/google/models/${model}:generateContent`;

    // EXTRACTION-FOCUSED PROMPT
    const extractionPrompt = `
You are a data extraction specialist for equestrian dressage test score sheets.

Your ONLY job is to extract ALL visible data from this document with high accuracy. Do NOT provide coaching or recommendations yet.

IMPORTANT: The user has already provided some information about this document:
- Horse name: ${documentData.horse_name || 'Unknown'}
- Test date: ${documentData.document_date ? new Date(documentData.document_date).toISOString().split('T')[0] : 'Unknown'}
- Test level: ${documentData.test_level || documentData.competition_type || 'Unknown'}
- Discipline: ${documentData.discipline || 'dressage'}

Use this information as a STARTING POINT. If you can read these values from the document and they match, use high confidence. If they differ, use the document's values but flag with lower confidence.

Extract the following fields in JSON format:

{
  "horse": "${documentData.horse_name || 'Horse name from document'}",
  "rider": "Rider name (string)",
  "testDate": "${documentData.document_date ? new Date(documentData.document_date).toISOString().split('T')[0] : 'Test date from document (YYYY-MM-DD)'}",
  "testLevel": "${documentData.test_level || documentData.competition_type || 'Test level from document'}",
  "percentage": "Overall percentage score (number, e.g., 68.5)",
  "movements": [
    {
      "number": 1,
      "name": "Movement name (e.g., 'Halt at X', 'Medium Trot')",
      "scores": {
        "judgeA": 7.0,
        "judgeB": 6.5,
        "judgeC": 7.5
      },
      "comments": {
        "judgeA": "Judge A comment if visible",
        "judgeB": "Judge B comment if visible",
        "judgeC": "Judge C comment if visible"
      }
    }
  ],
  "collectiveMarks": {
    "paces": { "judgeA": 7.0, "judgeB": 6.5, "judgeC": 7.0 },
    "impulsion": { "judgeA": 7.0, "judgeB": 7.0, "judgeC": 6.5 },
    "submission": { "judgeA": 6.5, "judgeB": 6.5, "judgeC": 7.0 },
    "riderPosition": { "judgeA": 7.0, "judgeB": 7.5, "judgeC": 7.0 }
  },
  "generalComments": {
    "judgeA": "General comment from Judge A",
    "judgeB": "General comment from Judge B",
    "judgeC": "General comment from Judge C"
  },
  "highestScore": {
    "score": 8.0,
    "movement": ["Movement name(s) with highest score"]
  },
  "lowestScore": {
    "score": 5.5,
    "movement": ["Movement name(s) with lowest score"]
  }
}

CRITICAL RULES:
1. Use the pre-filled information above as defaults
2. Extract EXACTLY what you see from the document
3. If a field is unclear or missing, use the pre-filled value if available
4. If the document is in Spanish, translate movement names to English
5. Extract ALL movements - do not skip any
6. Preserve original judge comments exactly as written
7. Return ONLY valid JSON, no additional text
8. Ensure all scores are numbers (0-10 range)
9. If percentage is missing, calculate it from scores if possible

Return the complete JSON structure with all extracted data.
`;

    const startTime = Date.now();

    // Call Gemini API for extraction
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
            { text: extractionPrompt },
            { inlineData: { mimeType: 'application/pdf', data: base64Image } }
          ]
        }]
      })
    });

    const extractionDuration = Date.now() - startTime;

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('❌ Gemini extraction error:', errorText);
      throw new Error(`Gemini API Error: ${geminiResponse.status}`);
    }

    const geminiResult = await geminiResponse.json();
    let resultText = geminiResult.candidates[0].content.parts[0].text;

    // Clean JSON response
    resultText = resultText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

    let extractedData;
    try {
      extractedData = JSON.parse(resultText);
    } catch (err) {
      console.error('❌ Failed to parse JSON:', resultText);
      throw new Error('Gemini returned invalid JSON format');
    }

    console.log('✅ Data extracted successfully');

    // Calculate confidence scores
    const confidenceScores = calculateConfidenceScores(extractedData);

    // Count total fields
    let totalFields = 0;
    if (extractedData.movements) {
      totalFields = extractedData.movements.length * 4;
    }
    totalFields += 10;

    // Create extraction record
    // After extraction, merge with user-provided data
    const mergedData = {
      ...extractedData,
      horse: extractedData.horse || documentData.horse_name,
      testDate: extractedData.testDate || (documentData.document_date ? new Date(documentData.document_date).toISOString().split('T')[0] : null),
      testLevel: extractedData.testLevel || documentData.test_level || documentData.competition_type,
    };

    // Update confidence scores for pre-filled fields
    if (mergedData.horse === documentData.horse_name) {
      confidenceScores.fields.horseName = 0.99; // High confidence for user-provided
    }
    if (mergedData.testDate && documentData.document_date) {
      confidenceScores.fields.testDate = 0.99;
    }
    if (mergedData.testLevel ===`` (documentData.test_level || documentData.competition_type)) {
      confidenceScores.fields.testLevel = 0.99;
    }

    // Use merged data instead of extractedData
    const { data: extractionRecord, error: extractionError } = await supabase
      .from('document_extractions')
      .insert({
        document_id: documentId,
        user_id: documentData.user_id,
        extraction_status: 'extracted',
        extracted_data: mergedData, // Use merged data
        confidence_scores: confidenceScores,
        // ... rest of the fields
      })
      .select()
      .single();

    if (extractionError) {
      console.error('❌ Failed to save extraction:', extractionError);
      throw new Error('Failed to save extraction data');
    }

    console.log('💾 Extraction saved with ID:', extractionRecord.id);

    // Update document with extraction_id and status
    console.log('📝 Attempting to update document:', documentId);
    console.log('Update payload:', {
      extraction_id: extractionRecord.id,
      status: 'awaiting_verification',
      extraction_confidence: confidenceScores.overall
    });

    const { data: updateResult, error: docUpdateError } = await supabase
      .from('document_analysis')
      .update({
        extraction_id: extractionRecord.id,
        status: 'awaiting_verification',
        extraction_confidence: confidenceScores.overall,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select(); // ADD .select() to see what was updated

    console.log('Update result:', updateResult);
    console.log('Update error:', docUpdateError);

    if (docUpdateError) {
      console.error('❌ Failed to update document status:', docUpdateError);
      throw new Error(`Failed to update document: ${docUpdateError.message}`);
    }

    if (!updateResult || updateResult.length === 0) {
      console.error('❌ No rows were updated!');
      throw new Error('Document update returned no rows');
    }

    console.log('✅ Document updated successfully:', updateResult[0]);

    // Return extraction data to frontend
    return new Response(
      JSON.stringify({
        success: true,
        extractionId: extractionRecord.id,
        data: extractedData,
        confidence: confidenceScores,
        message: 'Data extracted successfully - ready for verification'
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('❌ Extraction error:', error);

    // Try to update document status if we have documentId
    if (documentId) {
      try {
        await supabase
          .from('document_analysis')
          .update({
            status: 'error',
            updated_at: new Date().toISOString()
          })
          .eq('id', documentId);
      } catch (e) {
        console.error('Failed to update document status:', e);
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Extraction failed'
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});