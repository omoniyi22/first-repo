
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.1.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configure Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Configure Gemini client
const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || ''
const genAI = new GoogleGenerativeAI(geminiApiKey)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { documentId } = await req.json()
    console.log(`Processing document with ID: ${documentId}`)
    
    if (!documentId) {
      return new Response(
        JSON.stringify({ error: 'Document ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Update status to processing
    const { error: updateError } = await supabase
      .from('document_analysis')
      .update({ status: 'processing' })
      .eq('id', documentId)

    if (updateError) {
      console.error('Error updating status:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update document status' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get document details
    const { data: document, error: docError } = await supabase
      .from('document_analysis')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      console.error('Error fetching document:', docError)
      return new Response(
        JSON.stringify({ error: 'Document not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get file from storage
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('analysis')
      .download(document.document_url.split('/').pop() || '')

    if (fileError || !fileData) {
      console.error('Error fetching file:', fileError)
      return new Response(
        JSON.stringify({ error: 'File not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Convert file to base64
    const reader = new FileReader()
    const base64Promise = new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(fileData)
    })
    const base64Data = await base64Promise

    // Prepare prompt based on discipline
    let prompt = ''
    if (document.discipline === 'dressage') {
      prompt = `Analyze this dressage test sheet. Extract all scores for each movement, judge comments, and provide an overall analysis. 
      Format your response as a JSON object with the following structure:
      {
        "scores": [
          {"movement": "Entry at A", "score": 7, "maxScore": 10, "comment": "Straight entry, halt could be more square"},
          ...
        ],
        "totalScore": 180,
        "percentage": 65.5,
        "comments": ["Good flow throughout test", "Needs more engagement in collected work"],
        "strengths": ["Trot extensions", "Centerlines"],
        "weaknesses": ["Half-passes", "Transitions"],
        "recommendations": ["Focus on improving half-pass flexibility", "Practice more balanced transitions"]
      }
      Ensure all scores are numeric, movement names match the test sheet exactly, and comments capture the judge's feedback.`
    } else {
      prompt = `Analyze this jumping scorecard/result sheet. Extract the course information, faults, times, and overall performance. 
      Format your response as a JSON object with the following structure:
      {
        "time": 65.4,
        "timeFaults": 0,
        "knockDowns": 1,
        "refusals": 0,
        "fallsOrElimination": false,
        "coursePattern": "Standard 10 jump course with one combination",
        "faults": [
          {"jumpNumber": 4, "faultType": "Knockdown", "description": "Caught top rail with hind legs"}
        ],
        "commonErrors": ["Approached jump 7 at a poor angle", "Rushed last three fences"],
        "recommendations": ["Work on maintaining rhythm before combinations", "Focus on approach angles"]
      }
      Ensure all numeric values are numbers, not strings. Be specific in recommendations.`
    }

    // Send to Gemini for analysis
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })
      
      const result = await model.generateContent([
        { text: prompt },
        { inlineData: { data: String(base64Data), mimeType: document.file_type } }
      ])

      const response = await result.response
      const textResult = response.text()

      console.log('Received analysis from Gemini')
      
      // Extract JSON from the response
      const jsonMatch = textResult.match(/```json\s*([\s\S]*?)\s*```/) || 
                        textResult.match(/\{[\s\S]*\}/)
      
      if (!jsonMatch) {
        throw new Error('Could not parse JSON response from Gemini')
      }
      
      const jsonText = jsonMatch[1] || jsonMatch[0]
      const analysisResult = JSON.parse(jsonText)

      // Store analysis result
      const { data: resultData, error: resultError } = await supabase
        .from('analysis_results')
        .insert({
          document_id: documentId,
          result_json: analysisResult
        })
        .select()
        .single()

      if (resultError) {
        throw resultError
      }

      // Store recommendations if available
      if (analysisResult.recommendations && Array.isArray(analysisResult.recommendations)) {
        const recommendations = analysisResult.recommendations.map((rec, index) => ({
          analysis_id: resultData.id,
          recommendation_text: rec,
          focus_area: document.discipline === 'dressage' ? 
            (analysisResult.weaknesses && index < analysisResult.weaknesses.length ? 
              analysisResult.weaknesses[index] : 'General') : 
            'Technical',
          priority: index + 1
        }))

        const { error: recError } = await supabase
          .from('recommendations')
          .insert(recommendations)

        if (recError) {
          console.error('Error storing recommendations:', recError)
        }
      }

      // Update document status to completed
      const { error: completeError } = await supabase
        .from('document_analysis')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)

      if (completeError) {
        console.error('Error updating status:', completeError)
      }

      return new Response(
        JSON.stringify({ success: true, resultId: resultData.id }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } catch (e) {
      console.error('Error processing with Gemini:', e)
      
      // Update document status to error
      await supabase
        .from('document_analysis')
        .update({ 
          status: 'error',
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)

      return new Response(
        JSON.stringify({ error: 'Analysis processing failed', details: e.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  } catch (error) {
    console.error('Unhandled error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
