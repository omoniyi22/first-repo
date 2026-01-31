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

    if (!value || value === '' || value === 'null' || value === null) {
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

// Create fallback data when extraction fails or no dressage sheet is found
function createFallbackData(documentData: any, errorMessage?: string) {
  return {
    horse: documentData.horse_name || "Unknown",
    rider: "Not Found",
    testDate: documentData.document_date ? new Date(documentData.document_date).toISOString().split('T')[0] : "Unknown",
    testLevel: documentData.test_level || documentData.competition_type || "Unknown",
    percentage: null,
    movements: [],
    collectiveMarks: {
      paces: { judgeA: null, judgeB: null, judgeC: null },
      impulsion: { judgeA: null, judgeB: null, judgeC: null },
      submission: { judgeA: null, judgeB: null, judgeC: null },
      riderPosition: { judgeA: null, judgeB: null, judgeC: null }
    },
    generalComments: {
      judgeA: errorMessage || "No dressage test score sheet detected in the document.",
      judgeB: "Please verify you have uploaded a dressage test score sheet.",
      judgeC: "Supported formats: FEI, British Dressage, USDF, or other standard dressage tests."
    },
    highestScore: {
      score: null,
      movement: ["Not available"]
    },
    lowestScore: {
      score: null,
      movement: ["Not available"]
    },
    extractionError: errorMessage || "No dressage score sheet detected"
  };
}

// Parse Gemini response and handle non-JSON responses
function parseGeminiResponse(resultText: string, documentData: any) {
  // First, try to parse as JSON
  try {
    // Clean the response
    const cleanText = resultText
      .replace(/^```(?:json)?\n?/, '')
      .replace(/\n?```$/, '')
      .trim();
    
    // Try to parse JSON
    const extractedData = JSON.parse(cleanText);
    
    // Validate it has at least some dressage-like structure
    if (extractedData.horse || extractedData.movements || extractedData.percentage) {
      return {
        success: true,
        data: extractedData,
        error: null
      };
    } else {
      // JSON is valid but doesn't have expected structure
      return {
        success: false,
        data: createFallbackData(documentData, "Document parsed but no dressage score data found"),
        error: "No dressage score data in parsed JSON"
      };
    }
    
  } catch (jsonError) {
    // JSON parsing failed, check if it's the "no dressage sheet" message
    const lowerText = resultText.toLowerCase();
    
    if (lowerText.includes('dressage') && 
        (lowerText.includes('not present') || 
         lowerText.includes('unable') || 
         lowerText.includes('sorry') ||
         lowerText.includes('no dressage'))) {
      
      // It's the specific error about no dressage sheet
      return {
        success: false,
        data: createFallbackData(documentData, "No dressage test score sheet detected in the document"),
        error: "No dressage sheet detected"
      };
    } else {
      // Some other error or non-JSON response
      console.log("Non-JSON response from Gemini:", resultText.substring(0, 200));
      return {
        success: false,
        data: createFallbackData(documentData, "Could not parse document as a dressage test score sheet"),
        error: "Invalid JSON response from AI"
      };
    }
  }
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
      .select("user_id, horse_id, horse_name, test_level, discipline, document_date, competition_type, file_name")
      .eq("id", documentId)
      .single();

    if (docError || !documentData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Document not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    console.log('📄 Document info:', {
      filename: documentData.file_name,
      horse: documentData.horse_name,
      level: documentData.test_level
    });

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

    // UPDATED: More flexible extraction prompt
    const extractionPrompt = `
ANALYSIS INSTRUCTIONS:
You are analyzing an equestrian competition document. This could be a dressage test score sheet, show jumping results, or other equestrian competition paperwork.

TASK: Extract ALL visible competition data from this document.

USER HAS PROVIDED THIS CONTEXT:
- Horse name: ${documentData.horse_name || 'Unknown'}
- File name: ${documentData.file_name || 'Unknown'}
- Test date: ${documentData.document_date ? new Date(documentData.document_date).toISOString().split('T')[0] : 'Unknown'}
- Test level: ${documentData.test_level || documentData.competition_type || 'Unknown'}
- Discipline: ${documentData.discipline || 'dressage'}

USE THIS CONTEXT AS GUIDANCE but extract EXACT values from the document when visible.

DOCUMENT TYPES TO LOOK FOR:
1. Dressage test score sheets (with movements, judge scores, percentages)
2. Show jumping results (with jump-by-jump scores, faults, times)
3. Competition entry forms
4. Training session notes
5. Veterinary or health records

IF THIS IS A DRESSAGE TEST SCORE SHEET, extract in this format:
{
  "documentType": "dressage_test",
  "horse": "Horse name from document",
  "rider": "Rider name if visible",
  "testDate": "Date from document (YYYY-MM-DD)",
  "testLevel": "Test level from document",
  "percentage": "Overall percentage score (number)",
  "movements": [
    {
      "number": 1,
      "name": "Movement name",
      "scores": {
        "judgeA": 7.0,
        "judgeB": 6.5,
        "judgeC": 7.5
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
    "judgeA": "Comment if visible",
    "judgeB": "Comment if visible",
    "judgeC": "Comment if visible"
  }
}

IF THIS IS A JUMPING COMPETITION RESULT, extract:
{
  "documentType": "jumping_results",
  "horse": "Horse name",
  "rider": "Rider name",
  "competitionDate": "Date",
  "roundNumber": 1,
  "totalFaults": 4,
  "timeFaults": 1,
  "clearRound": false,
  "placing": "5th",
  "jumps": [
    {
      "number": 1,
      "result": "clear",
      "faults": 0
    }
  ]
}

IF THIS IS A DIFFERENT TYPE OF DOCUMENT, extract:
{
  "documentType": "other",
  "extractedText": "Key text from document",
  "confidence": "Document does not appear to be a competition score sheet"
}

CRITICAL RULES:
1. First identify what type of document this is
2. Extract only what you can actually see in the document
3. If something isn't visible, use null or empty values
4. Translate Spanish terms to English if needed
5. Return ONLY valid JSON, no additional commentary
6. If you cannot identify this as a competition document, set documentType to "unknown"

Return the JSON now.
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
      console.error('❌ Gemini API error:', errorText);
      throw new Error(`Gemini API Error: ${geminiResponse.status}`);
    }

    const geminiResult = await geminiResponse.json();
    let resultText = geminiResult.candidates[0].content.parts[0].text;

    console.log('📋 Gemini response (first 500 chars):', resultText.substring(0, 500));

    // Parse the response (handles both JSON and error cases)
    const parseResult = parseGeminiResponse(resultText, documentData);
    
    let extractedData = parseResult.data;
    const extractionError = parseResult.error;
    const extractionSuccess = parseResult.success;

    console.log('✅ Extraction result:', {
      success: extractionSuccess,
      documentType: extractedData.documentType || 'unknown',
      error: extractionError
    });

    // Calculate confidence scores (lower for failed extractions)
    let confidenceScores;
    if (extractionSuccess) {
      confidenceScores = calculateConfidenceScores(extractedData);
    } else {
      // Low confidence for failed extractions
      confidenceScores = {
        overall: 0.2,
        fields: {},
        lowConfidenceFields: ['all_fields'],
        lowConfidenceCount: 1,
        extractionError: extractionError
      };
    }

    // Merge with user-provided data if available
    const mergedData = {
      ...extractedData,
      horse: extractedData.horse || documentData.horse_name,
      testDate: extractedData.testDate || (documentData.document_date ? new Date(documentData.document_date).toISOString().split('T')[0] : null),
      testLevel: extractedData.testLevel || documentData.test_level || documentData.competition_type,
      extractionMetadata: {
        success: extractionSuccess,
        error: extractionError,
        durationMs: extractionDuration,
        documentType: extractedData.documentType || 'unknown'
      }
    };

    // Create extraction record
    const { data: extractionRecord, error: extractionErrorDb } = await supabase
      .from('document_extractions')
      .insert({
        document_id: documentId,
        user_id: documentData.user_id,
        extraction_status: extractionSuccess ? 'extracted' : 'failed',
        extracted_data: mergedData,
        confidence_scores: confidenceScores,
        extraction_error: extractionError,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (extractionErrorDb) {
      console.error('❌ Failed to save extraction:', extractionErrorDb);
      throw new Error('Failed to save extraction data');
    }

    console.log('💾 Extraction saved with ID:', extractionRecord.id);

    // Update document status based on extraction success
    const documentStatus = extractionSuccess ? 'awaiting_verification' : 'extraction_failed';
    
    const { error: docUpdateError } = await supabase
      .from('document_analysis')
      .update({
        extraction_id: extractionRecord.id,
        status: documentStatus,
        extraction_confidence: confidenceScores.overall,
        extraction_error: extractionError,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (docUpdateError) {
      console.error('❌ Failed to update document status:', docUpdateError);
      throw new Error(`Failed to update document: ${docUpdateError.message}`);
    }

    console.log(`✅ Document updated to status: ${documentStatus}`);

    // Return appropriate response based on success
    if (extractionSuccess) {
      return new Response(
        JSON.stringify({
          success: true,
          extractionId: extractionRecord.id,
          data: extractedData,
          confidence: confidenceScores,
          message: 'Data extracted successfully - ready for verification',
          documentType: extractedData.documentType || 'dressage_test'
        }),
        { status: 200, headers: corsHeaders }
      );
    } else {
      // Still return success to frontend but with error info
      return new Response(
        JSON.stringify({
          success: false,
          extractionId: extractionRecord.id,
          data: extractedData,
          confidence: confidenceScores,
          error: extractionError,
          message: 'Could not extract dressage score data from this document',
          documentType: extractedData.documentType || 'unknown',
          userMessage: 'This document does not appear to be a dressage test score sheet. Please verify your upload.'
        }),
        { status: 200, headers: corsHeaders } // Still 200 so frontend can handle it
      );
    }

  } catch (error: any) {
    console.error('❌ Extraction function error:', error);

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
        error: error.message || 'Extraction failed',
        userMessage: 'An unexpected error occurred during extraction.'
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});