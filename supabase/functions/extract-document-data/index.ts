// Supabase Edge Function for data extraction with enhanced debugging
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

// Enhanced logger with timestamps and structured output
class DebugLogger {
  private requestId: string;
  private startTime: number;
  private logs: any[] = [];

  constructor(requestId: string) {
    this.requestId = requestId;
    this.startTime = Date.now();
    this.log('START', 'Extraction request started', { requestId });
  }

  log(level: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const elapsed = Date.now() - this.startTime;
    const logEntry = {
      timestamp,
      level,
      elapsed: `${elapsed}ms`,
      requestId: this.requestId,
      message,
      data: data || null
    };

    // Console output
    console.log(JSON.stringify(logEntry));

    // Store for final response
    this.logs.push(logEntry);
  }

  info(message: string, data?: any) {
    this.log('INFO', message, data);
  }

  warn(message: string, data?: any) {
    this.log('WARN', message, data);
  }

  error(message: string, error?: any) {
    const errorData = {
      message: error?.message || error,
      stack: error?.stack,
      name: error?.name
    };
    this.log('ERROR', message, errorData);
  }

  success(message: string, data?: any) {
    this.log('SUCCESS', message, data);
  }

  debug(message: string, data?: any) {
    this.log('DEBUG', message, data);
  }

  getLogs() {
    return this.logs;
  }
}

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
async function getGoogleAccessToken(serviceAccount: any, logger: DebugLogger): Promise<string> {
  logger.debug('Getting Google access token', {
    serviceAccountEmail: serviceAccount.client_email,
    projectId: serviceAccount.project_id
  });

  try {
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

    logger.debug('Creating JWT token', {
      tokenLength: unsignedToken.length,
      expiry: new Date((now + 3600) * 1000).toISOString()
    });

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

    logger.debug('Requesting access token from Google');
    const tokenStart = Date.now();

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: signedJWT
      })
    });

    const tokenDuration = Date.now() - tokenStart;
    const responseText = await res.text();

    logger.debug('Google token response received', {
      status: res.status,
      duration: `${tokenDuration}ms`,
      responseLength: responseText.length
    });

    let json;
    try {
      json = JSON.parse(responseText);
    } catch (e) {
      logger.error('Failed to parse Google token response', {
        responseText: responseText.substring(0, 500)
      });
      throw new Error(`Invalid token response: ${responseText.substring(0, 200)}`);
    }

    if (!json.access_token) {
      logger.error('No access token in response', { json });
      throw new Error('Failed to get access token');
    }

    logger.success('Google access token obtained', {
      tokenLength: json.access_token.length,
      expiresIn: json.expires_in
    });

    return json.access_token;
  } catch (error) {
    logger.error('Failed to get Google access token', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = `extract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const logger = new DebugLogger(requestId);

  let documentId: string | null = null;
  let requestBody: any = null;

  try {
    logger.info('Received extraction request', {
      method: req.method,
      url: req.url,
      contentType: req.headers.get('content-type')
    });

    // Parse request body
    try {
      requestBody = await req.json();
      logger.debug('Raw request body received', {
        keys: Object.keys(requestBody),
        bodyPreview: JSON.stringify(requestBody).substring(0, 200)
      });
      
      // FOLLOWING ORIGINAL SCHEMA: documentId and base64Image
      documentId = requestBody.documentId;
      const base64Image = requestBody.base64Image;

      logger.info('Request body parsed', {
        hasDocumentId: !!documentId,
        hasBase64Image: !!base64Image,
        base64ImageLength: base64Image?.length || 0,
        base64ImageStart: base64Image ? base64Image.substring(0, 50) : 'none'
      });

      if (!documentId || !base64Image) {
        const error = 'Missing documentId or base64Image';
        logger.error('Invalid request', { 
          documentId, 
          hasBase64Image: !!base64Image,
          requestBodyKeys: Object.keys(requestBody)
        });
        return new Response(
          JSON.stringify({
            success: false,
            error,
            requestId,
            logs: logger.getLogs()
          }),
          { status: 400, headers: corsHeaders }
        );
      }
    } catch (parseError) {
      logger.error('Failed to parse request body', parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid JSON request body',
          requestId,
          logs: logger.getLogs()
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    logger.info('🔍 Starting extraction process', { documentId });

    // STEP 1: Get document info from database - FOLLOWING ORIGINAL SCHEMA
    logger.info('STEP 1: Fetching document info from database');
    const { data: documentData, error: docError } = await supabase
      .from("document_analysis")
      .select("user_id, horse_id, horse_name, test_level, discipline, document_date, competition_type")
      .eq("id", documentId)
      .single();

    if (docError || !documentData) {
      logger.error('Document not found in database', {
        error: docError?.message,
        documentId
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Document not found',
          requestId,
          logs: logger.getLogs()
        }),
        { status: 404, headers: corsHeaders }
      );
    }

    logger.info('Document info retrieved', {
      filename: documentData.file_name,
      horse: documentData.horse_name,
      level: documentData.test_level,
      discipline: documentData.discipline,
      userId: documentData.user_id
    });

    // STEP 2: Update document status to 'extracting' - FOLLOWING ORIGINAL SCHEMA
    logger.info('STEP 2: Updating document status to extracting');
    try {
      const updateResult = await supabase
        .from('document_analysis')
        .update({
          status: 'extracting',
          extraction_started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (updateResult.error) {
        logger.error('Failed to update document status', updateResult.error);
      } else {
        logger.success('Document status updated to extracting');
      }
    } catch (updateError) {
      logger.warn('Document status update failed (non-critical)', updateError);
    }

    // STEP 3: Get Google service account and access token
    logger.info('STEP 3: Getting Google service account credentials');
    const raw = Deno.env.get('GEMINI_SERVICE_ACCOUNT_JSON');
    if (!raw) {
      const error = 'GEMINI_SERVICE_ACCOUNT_JSON is not set in environment';
      logger.error('Missing service account configuration', { error });
      throw new Error(error);
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(raw);
      logger.info('Service account parsed successfully', {
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email
      });
    } catch (parseError) {
      logger.error('Failed to parse service account JSON', parseError);
      throw new Error('Invalid service account JSON');
    }

    const accessToken = await getGoogleAccessToken(serviceAccount, logger);

    // STEP 4: Prepare Gemini API request
    const model = 'gemini-2.0-flash';
    const geminiUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${serviceAccount.project_id}/locations/us-central1/publishers/google/models/${model}:generateContent`;

    logger.info('STEP 4: Preparing Gemini API request', {
      model,
      url: geminiUrl,
      base64ImageLength: requestBody.base64Image.length
    });

    // USING ORIGINAL EXTRACTION PROMPT
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

    logger.debug('Extraction prompt prepared', {
      promptLength: extractionPrompt.length,
      promptPreview: extractionPrompt.substring(0, 200)
    });

    // STEP 5: Call Gemini API
    logger.info('STEP 5: Calling Gemini API');
    const startTime = Date.now();

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
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: requestBody.base64Image
              }
            }
          ]
        }]
      })
    });

    const extractionDuration = Date.now() - startTime;

    logger.info('Gemini API response received', {
      status: geminiResponse.status,
      duration: `${extractionDuration}ms`,
      ok: geminiResponse.ok
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      logger.error('Gemini API error response', {
        status: geminiResponse.status,
        statusText: geminiResponse.statusText,
        errorText: errorText.substring(0, 500)
      });
      throw new Error(`Gemini API Error: ${geminiResponse.status} - ${geminiResponse.statusText}`);
    }

    const geminiResult = await geminiResponse.json();
    let resultText = geminiResult.candidates[0]?.content?.parts[0]?.text || '';

    // ALWAYS LOG THE RAW RESPONSE
    console.log('🔵🔵🔵 RAW GEMINI RESPONSE START 🔵🔵🔵');
    console.log(resultText);
    console.log('🔵🔵🔵 RAW GEMINI RESPONSE END 🔵🔵🔵');

    logger.info('Gemini response parsed', {
      responseLength: resultText.length,
      responsePreview: resultText.substring(0, 200),
      hasCandidates: geminiResult.candidates?.length > 0
    });

    // ========== FUNCTIONS THAT NEED ACCESS TO LOGGER ==========
    
    // Parse Gemini response - SIMPLIFIED VERSION
    function parseGeminiResponse(resultText: string): any {
      logger.debug('Parsing Gemini response', {
        responseLength: resultText.length,
        first200Chars: resultText.substring(0, 200)
      });

      try {
        // Clean JSON response - FOLLOWING ORIGINAL SCHEMA
        const cleanText = resultText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
        
        logger.debug('Cleaned response for JSON parsing', {
          cleanedLength: cleanText.length,
          startsWith: cleanText.substring(0, 50)
        });

        // Try to parse JSON
        const extractedData = JSON.parse(cleanText);
        
        logger.info('Successfully parsed JSON response', {
          hasHorse: !!extractedData.horse,
          hasMovements: !!extractedData.movements,
          hasPercentage: extractedData.percentage !== undefined
        });

        return {
          success: true,
          data: extractedData,
          error: null
        };
        
      } catch (jsonError) {
        logger.error('Failed to parse JSON', {
          error: jsonError.message,
          responseStart: resultText.substring(0, 100)
        });
        
        return {
          success: false,
          data: null,
          error: 'Gemini returned invalid JSON format'
        };
      }
    }

    // Calculate confidence scores - FOLLOWING ORIGINAL SCHEMA
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
      confidenceScores.overall = fieldCount > 0 ? parseFloat((totalConfidence / fieldCount).toFixed(3)) : 0;
      confidenceScores.lowConfidenceFields = lowConfidenceFields;
      confidenceScores.lowConfidenceCount = lowConfidenceFields.length;

      logger.debug('Confidence scores calculated', {
        overall: confidenceScores.overall,
        totalFields: fieldCount,
        lowConfidenceFields: lowConfidenceFields.length
      });

      return confidenceScores;
    }

    // ========== END OF FUNCTIONS ==========

    // STEP 6: Parse Gemini response
    logger.info('STEP 6: Parsing Gemini response');
    const parseResult = parseGeminiResponse(resultText);

    if (!parseResult.success) {
      logger.error('Failed to parse Gemini response', parseResult.error);
      throw new Error(parseResult.error);
    }

    let extractedData = parseResult.data;
    const extractionSuccess = parseResult.success;

    logger.info('Parsing result', {
      success: extractionSuccess,
      hasHorse: !!extractedData.horse,
      hasMovements: !!extractedData.movements,
      hasPercentage: extractedData.percentage !== undefined
    });

    // STEP 7: Calculate confidence scores
    logger.info('STEP 7: Calculating confidence scores');
    const confidenceScores = calculateConfidenceScores(extractedData);

    // STEP 8: Merge with user-provided data - FOLLOWING ORIGINAL SCHEMA
    logger.info('STEP 8: Merging extracted data with user context');
    const mergedData = {
      ...extractedData,
      horse: extractedData.horse || documentData.horse_name,
      testDate: extractedData.testDate || (documentData.document_date ? new Date(documentData.document_date).toISOString().split('T')[0] : null),
      testLevel: extractedData.testLevel || documentData.test_level || documentData.competition_type,
    };

    // Update confidence scores for pre-filled fields - FOLLOWING ORIGINAL SCHEMA
    if (mergedData.horse === documentData.horse_name) {
      confidenceScores.fields.horseName = 0.99; // High confidence for user-provided
    }
    if (mergedData.testDate && documentData.document_date) {
      confidenceScores.fields.testDate = 0.99;
    }
    if (mergedData.testLevel === (documentData.test_level || documentData.competition_type)) {
      confidenceScores.fields.testLevel = 0.99;
    }

    // STEP 9: Save extraction to database - FOLLOWING ORIGINAL SCHEMA STRICTLY
    logger.info('STEP 9: Saving extraction to database');
    const { data: extractionRecord, error: extractionErrorDb } = await supabase
      .from('document_extractions')
      .insert({
        document_id: documentId,           // ORIGINAL: document_id
        user_id: documentData.user_id,     // ORIGINAL: user_id
        extraction_status: 'extracted',    // ORIGINAL: extraction_status
        extracted_data: mergedData,        // ORIGINAL: extracted_data
        confidence_scores: confidenceScores, // ORIGINAL: confidence_scores
        // NO extraction_error column
        // NO raw_gemini_response column
        // NO created_at column (auto-generated)
        // NO updated_at column (auto-generated)
      })
      .select()
      .single();

    if (extractionErrorDb) {
      logger.error('Failed to save extraction to database', extractionErrorDb);
      throw new Error(`Database save failed: ${extractionErrorDb.message}`);
    }

    logger.success('Extraction saved to database', {
      extractionId: extractionRecord.id,
      extractionStatus: 'extracted'
    });

    // STEP 10: Update document status - FOLLOWING ORIGINAL SCHEMA
    logger.info('STEP 10: Updating document status');
    const { data: updateResult, error: docUpdateError } = await supabase
      .from('document_analysis')
      .update({
        extraction_id: extractionRecord.id,
        status: 'awaiting_verification',
        extraction_confidence: confidenceScores.overall,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select();

    logger.debug('Update result', { updateResult, docUpdateError });

    if (docUpdateError) {
      logger.error('Failed to update document status', docUpdateError);
      throw new Error(`Failed to update document: ${docUpdateError.message}`);
    }

    if (!updateResult || updateResult.length === 0) {
      logger.error('No rows were updated!');
      throw new Error('Document update returned no rows');
    }

    logger.success('Document status updated', { status: 'awaiting_verification' });

    // STEP 11: Prepare final response - FOLLOWING ORIGINAL SCHEMA
    logger.success('Extraction process completed', {
      success: true,
      totalDuration: `${Date.now() - logger.startTime}ms`
    });

    return new Response(
      JSON.stringify({
        success: true,
        extractionId: extractionRecord.id,
        data: extractedData,
        confidence: confidenceScores,
        message: 'Data extracted successfully - ready for verification',
        requestId,
        logs: logger.getLogs()
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error: any) {
    logger.error('❌ CRITICAL: Extraction process failed', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    // Try to update document status if we have documentId - FOLLOWING ORIGINAL SCHEMA
    if (documentId) {
      try {
        await supabase
          .from('document_analysis')
          .update({
            status: 'error',
            updated_at: new Date().toISOString()
          })
          .eq('id', documentId);
        logger.info('Document status updated to error');
      } catch (e: any) {
        logger.error('Failed to update document status after error', {
          message: e.message,
          name: e.name
        });
      }
    }

    const errorResponse = {
      success: false,
      error: error.message || 'Extraction failed',
      requestId,
      logs: logger.getLogs(),
      userMessage: 'An unexpected error occurred during extraction. Please try again or contact support.'
    };

    // Don't log the full errorResponse with logs included
    logger.error('Sending error response', {
      success: false,
      error: error.message,
      requestId
    });

    return new Response(
      JSON.stringify(errorResponse),
      { status: 500, headers: corsHeaders }
    );
  }
});