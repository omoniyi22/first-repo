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

// Calculate confidence scores based on extraction quality
function calculateConfidenceScores(extractedData: any, logger: DebugLogger): any {
  logger.debug('Calculating confidence scores', {
    dataFields: Object.keys(extractedData),
    hasMovements: !!extractedData.movements,
    movementCount: extractedData.movements?.length || 0
  });

  const confidenceScores: any = {
    overall: 0,
    fields: {},
    fieldStats: {
      totalFields: 0,
      highConfidence: 0,
      mediumConfidence: 0,
      lowConfidence: 0
    }
  };

  let totalConfidence = 0;
  let fieldCount = 0;
  const lowConfidenceFields: string[] = [];

  // Helper to add field confidence
  const addFieldConfidence = (fieldName: string, value: any, baseConfidence: number, reason?: string) => {
    let confidence = baseConfidence;
    let adjustmentReason = reason || 'base';

    if (!value || value === '' || value === 'null' || value === null) {
      confidence = 0.3;
      adjustmentReason = 'empty_or_null';
    } else if (typeof value === 'string' && value.length < 2) {
      confidence = confidence * 0.7;
      adjustmentReason = 'short_string';
    } else if (typeof value === 'number' && (value < 0 || value > 10)) {
      confidence = confidence * 0.6;
      adjustmentReason = 'invalid_score_range';
    }

    confidenceScores.fields[fieldName] = {
      confidence,
      value: typeof value === 'string' ? value.substring(0, 50) : value,
      baseConfidence,
      adjustmentReason
    };
    
    totalConfidence += confidence;
    fieldCount++;

    // Track confidence levels
    if (confidence >= 0.8) {
      confidenceScores.fieldStats.highConfidence++;
    } else if (confidence >= 0.5) {
      confidenceScores.fieldStats.mediumConfidence++;
    } else {
      confidenceScores.fieldStats.lowConfidence++;
      lowConfidenceFields.push(fieldName);
    }
  };

  // Check horse name
  addFieldConfidence('horseName', extractedData.horse, 0.90, 'primary_field');

  // Check percentage (critical field)
  if (extractedData.percentage !== undefined && extractedData.percentage !== null) {
    if (!isNaN(extractedData.percentage) && extractedData.percentage >= 0 && extractedData.percentage <= 100) {
      addFieldConfidence('percentage', extractedData.percentage, 0.85, 'valid_percentage');
    } else {
      addFieldConfidence('percentage', extractedData.percentage, 0.50, 'invalid_percentage');
    }
  } else {
    addFieldConfidence('percentage', extractedData.percentage, 0.30, 'missing_percentage');
  }

  // Check movements
  if (extractedData.movements && Array.isArray(extractedData.movements)) {
    extractedData.movements.forEach((movement: any, index: number) => {
      const movementKey = `movement${index + 1}`;
      
      addFieldConfidence(
        `${movementKey}_name`,
        movement.name,
        movement.name ? 0.85 : 0.60,
        movement.name ? 'has_name' : 'missing_name'
      );

      if (movement.scores) {
        ['judgeA', 'judgeB', 'judgeC'].forEach(judge => {
          const score = movement.scores[judge];
          const isValidScore = score !== null && score !== undefined && score >= 0 && score <= 10;
          
          addFieldConfidence(
            `${movementKey}_score_${judge.toUpperCase()}`,
            score,
            isValidScore ? 0.90 : 0.50,
            isValidScore ? 'valid_score' : 'invalid_score'
          );
        });
      }
    });
  }

  // Check judge comments (lower confidence, harder to OCR)
  ['judgeA', 'judgeB', 'judgeC'].forEach(judge => {
    const comment = extractedData.generalComments?.[judge];
    const hasComment = comment && comment.trim().length > 0;
    
    addFieldConfidence(
      `${judge}_comment`,
      comment,
      hasComment ? 0.70 : 0.50,
      hasComment ? 'has_comment' : 'no_comment'
    );
  });

  // Calculate overall confidence
  confidenceScores.overall = fieldCount > 0 ? parseFloat((totalConfidence / fieldCount).toFixed(3)) : 0;
  confidenceScores.lowConfidenceFields = lowConfidenceFields;
  confidenceScores.lowConfidenceCount = lowConfidenceFields.length;
  confidenceScores.fieldStats.totalFields = fieldCount;

  logger.debug('Confidence scores calculated', {
    overall: confidenceScores.overall,
    totalFields: fieldCount,
    lowConfidenceFields: lowConfidenceFields.length,
    fieldStats: confidenceScores.fieldStats
  });

  return confidenceScores;
}

// Create fallback data when extraction fails or no dressage sheet is found
function createFallbackData(documentData: any, errorMessage?: string, rawResponse?: string) {
  logger.info('Creating fallback data due to extraction failure', {
    errorMessage,
    rawResponseLength: rawResponse?.length,
    documentData: {
      horse: documentData.horse_name,
      filename: documentData.file_name
    }
  });

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
    extractionError: errorMessage || "No dressage score sheet detected",
    rawResponseSample: rawResponse ? rawResponse.substring(0, 500) : null,
    isFallback: true
  };
}

// Parse Gemini response and handle non-JSON responses
function parseGeminiResponse(resultText: string, documentData: any, logger: DebugLogger) {
  logger.debug('Parsing Gemini response', {
    responseLength: resultText.length,
    first200Chars: resultText.substring(0, 200),
    last200Chars: resultText.substring(Math.max(0, resultText.length - 200))
  });

  // First, try to parse as JSON
  try {
    // Clean the response
    const cleanText = resultText
      .replace(/^```(?:json)?\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    logger.debug('Cleaned response for JSON parsing', {
      cleanedLength: cleanText.length,
      startsWith: cleanText.substring(0, 50)
    });

    // Try to parse JSON
    const extractedData = JSON.parse(cleanText);
    
    logger.info('Successfully parsed JSON response', {
      documentType: extractedData.documentType,
      hasHorse: !!extractedData.horse,
      hasMovements: !!extractedData.movements,
      hasPercentage: extractedData.percentage !== undefined
    });

    // Validate it has at least some dressage-like structure
    const hasDressageStructure = extractedData.horse || 
                                 extractedData.movements || 
                                 extractedData.percentage ||
                                 extractedData.documentType === 'dressage_test';

    if (hasDressageStructure) {
      logger.success('Valid dressage-like structure found');
      return {
        success: true,
        data: extractedData,
        error: null,
        parsingMethod: 'json_success'
      };
    } else {
      logger.warn('JSON parsed but no dressage structure found', {
        extractedKeys: Object.keys(extractedData),
        documentType: extractedData.documentType
      });
      
      return {
        success: false,
        data: createFallbackData(documentData, "Document parsed but no dressage score data found", resultText),
        error: "No dressage score data in parsed JSON",
        parsingMethod: 'json_no_structure'
      };
    }
    
  } catch (jsonError) {
    logger.warn('JSON parsing failed', {
      error: jsonError.message,
      responseStart: resultText.substring(0, 100)
    });

    // JSON parsing failed, analyze the response text
    const lowerText = resultText.toLowerCase();
    
    // Check for specific error patterns
    const errorPatterns = [
      { pattern: 'dressage.*not present', type: 'no_dressage_sheet' },
      { pattern: 'unable.*perform.*task', type: 'unable_to_perform' },
      { pattern: 'sorry', type: 'apology_response' },
      { pattern: 'no dressage', type: 'no_dressage' },
      { pattern: 'cannot.*extract', type: 'cannot_extract' },
      { pattern: 'invalid.*document', type: 'invalid_document' }
    ];

    let detectedErrorType = 'unknown';
    for (const { pattern, type } of errorPatterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(lowerText)) {
        detectedErrorType = type;
        break;
      }
    }

    logger.info('Analyzed non-JSON response', {
      errorType: detectedErrorType,
      containsDressage: lowerText.includes('dressage'),
      containsSorry: lowerText.includes('sorry'),
      containsUnable: lowerText.includes('unable')
    });

    if (detectedErrorType !== 'unknown') {
      return {
        success: false,
        data: createFallbackData(documentData, `AI could not process document: ${detectedErrorType}`, resultText),
        error: `Gemini error: ${detectedErrorType}`,
        parsingMethod: 'error_pattern'
      };
    } else {
      // Some other error or non-JSON response
      return {
        success: false,
        data: createFallbackData(documentData, "Could not parse document as a dressage test score sheet", resultText),
        error: "Invalid JSON response from AI",
        parsingMethod: 'invalid_json'
      };
    }
  }
}

// Global logger reference
let logger: DebugLogger;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = `extract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  logger = new DebugLogger(requestId);

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
        logger.error('Invalid request', { documentId, hasBase64Image: !!base64Image });
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

    // STEP 1: Get document info from database
    logger.info('STEP 1: Fetching document info from database');
    const { data: documentData, error: docError } = await supabase
      .from("document_analysis")
      .select("user_id, horse_id, horse_name, test_level, discipline, document_date, competition_type, file_name, status")
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
      status: documentData.status,
      userId: documentData.user_id
    });

    // STEP 2: Update document status to 'extracting'
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
            { inlineData: { 
              mimeType: 'application/pdf', 
              data: requestBody.base64Image 
            } }
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
    let resultText = geminiResult.candidates[0].content.parts[0].text;

    logger.info('Gemini response parsed', {
      responseLength: resultText.length,
      responsePreview: resultText.substring(0, 200),
      hasCandidates: geminiResult.candidates?.length > 0
    });

    // STEP 6: Parse Gemini response
    logger.info('STEP 6: Parsing Gemini response');
    const parseResult = parseGeminiResponse(resultText, documentData, logger);
    
    let extractedData = parseResult.data;
    const extractionError = parseResult.error;
    const extractionSuccess = parseResult.success;

    logger.info('Parsing result', {
      success: extractionSuccess,
      documentType: extractedData.documentType || 'unknown',
      error: extractionError,
      parsingMethod: parseResult.parsingMethod,
      isFallback: extractedData.isFallback || false
    });

    // STEP 7: Calculate confidence scores
    logger.info('STEP 7: Calculating confidence scores');
    let confidenceScores;
    if (extractionSuccess) {
      confidenceScores = calculateConfidenceScores(extractedData, logger);
    } else {
      // Low confidence for failed extractions
      confidenceScores = {
        overall: 0.2,
        fields: {},
        lowConfidenceFields: ['all_fields'],
        lowConfidenceCount: 1,
        extractionError: extractionError,
        isFallback: true
      };
      logger.warn('Using fallback confidence scores due to extraction failure');
    }

    // STEP 8: Merge with user-provided data
    logger.info('STEP 8: Merging extracted data with user context');
    const mergedData = {
      ...extractedData,
      horse: extractedData.horse || documentData.horse_name,
      testDate: extractedData.testDate || (documentData.document_date ? new Date(documentData.document_date).toISOString().split('T')[0] : null),
      testLevel: extractedData.testLevel || documentData.test_level || documentData.competition_type,
      extractionMetadata: {
        success: extractionSuccess,
        error: extractionError,
        durationMs: extractionDuration,
        documentType: extractedData.documentType || 'unknown',
        parsingMethod: parseResult.parsingMethod,
        requestId,
        timestamp: new Date().toISOString()
      }
    };

    logger.debug('Merged data prepared', {
      mergedKeys: Object.keys(mergedData),
      finalHorse: mergedData.horse,
      finalTestLevel: mergedData.testLevel
    });

    // STEP 9: Save extraction to database
    logger.info('STEP 9: Saving extraction to database');
    const { data: extractionRecord, error: extractionErrorDb } = await supabase
      .from('document_extractions')
      .insert({
        document_id: documentId,
        user_id: documentData.user_id,
        extraction_status: extractionSuccess ? 'extracted' : 'failed',
        extracted_data: mergedData,
        confidence_scores: confidenceScores,
        extraction_error: extractionError,
        raw_gemini_response: resultText.substring(0, 10000), // Save first 10k chars
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (extractionErrorDb) {
      logger.error('Failed to save extraction to database', extractionErrorDb);
      throw new Error(`Database save failed: ${extractionErrorDb.message}`);
    }

    logger.success('Extraction saved to database', {
      extractionId: extractionRecord.id,
      extractionStatus: extractionSuccess ? 'extracted' : 'failed'
    });

    // STEP 10: Update document status
    logger.info('STEP 10: Updating document status');
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
      logger.error('Failed to update document status', docUpdateError);
    } else {
      logger.success('Document status updated', { status: documentStatus });
    }

    // STEP 11: Prepare final response
    const finalResponse = extractionSuccess ? {
      success: true,
      extractionId: extractionRecord.id,
      data: extractedData,
      confidence: confidenceScores,
      message: 'Data extracted successfully - ready for verification',
      documentType: extractedData.documentType || 'dressage_test',
      requestId,
      logs: logger.getLogs()
    } : {
      success: false,
      extractionId: extractionRecord.id,
      data: extractedData,
      confidence: confidenceScores,
      error: extractionError,
      message: 'Could not extract dressage score data from this document',
      documentType: extractedData.documentType || 'unknown',
      userMessage: 'This document does not appear to be a dressage test score sheet. Please verify your upload.',
      requestId,
      logs: logger.getLogs()
    };

    logger.success('Extraction process completed', {
      success: extractionSuccess,
      responseType: extractionSuccess ? 'success' : 'failure',
      totalDuration: `${Date.now() - logger.startTime}ms`
    });

    return new Response(
      JSON.stringify(finalResponse),
      { status: 200, headers: corsHeaders }
    );

  } catch (error: any) {
    logger.error('❌ CRITICAL: Extraction process failed', error);

    // Try to update document status if we have documentId
    if (documentId) {
      try {
        await supabase
          .from('document_analysis')
          .update({
            status: 'error',
            extraction_error: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', documentId);
        logger.info('Document status updated to error');
      } catch (e) {
        logger.error('Failed to update document status after error', e);
      }
    }

    const errorResponse = {
      success: false,
      error: error.message || 'Extraction failed',
      errorDetails: {
        name: error.name,
        stack: error.stack
      },
      requestId,
      logs: logger.getLogs(),
      userMessage: 'An unexpected error occurred during extraction. Please try again or contact support.'
    };

    logger.error('Sending error response', errorResponse);

    return new Response(
      JSON.stringify(errorResponse),
      { status: 500, headers: corsHeaders }
    );
  }
});