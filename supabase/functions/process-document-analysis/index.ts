
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

    // Get document information
    const { data: documentData, error: documentError } = await supabase
      .from('document_analysis')
      .select('*')
      .eq('id', documentId)
      .single()

    if (documentError || !documentData) {
      console.error('Error fetching document:', documentError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch document data', details: documentError?.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Retrieved document data:', documentData)

    // Update status to processing
    const { error: updateError } = await supabase
      .from('document_analysis')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
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

    // In a real implementation, you would:
    // 1. Get document from storage
    // 2. Process it with AI
    // 3. Store the results
    // For now, we'll just simulate it being processed

    // Simulate a delay for processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Generate mock analysis results based on the document type and discipline
    const mockAnalysisResult = generateMockAnalysisResult(documentData)
    
    // Store the analysis results
    const { error: analysisInsertError } = await supabase
      .from('analysis_results')
      .insert({
        document_id: documentId,
        result_json: mockAnalysisResult
      })
    
    if (analysisInsertError) {
      console.error('Error storing analysis results:', analysisInsertError)
      // Continue anyway, we'll just update the status
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
      return new Response(
        JSON.stringify({ error: 'Failed to complete document processing' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Document processed successfully',
        documentId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
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

// Helper function to generate mock analysis results
function generateMockAnalysisResult(documentData: any) {
  if (documentData.file_type.includes('video')) {
    // For video analysis
    if (documentData.discipline === 'dressage') {
      return {
        overallScore: 68.5,
        movements: [
          {
            name: "Entry and Halt",
            score: 7,
            comments: "Straight approach, square halt but could be more immobile"
          },
          {
            name: "Working Trot",
            score: 6.5,
            comments: "Rhythm is consistent but needs more engagement from behind"
          },
          {
            name: "20m Circle",
            score: 7,
            comments: "Good shape, could show more bend"
          }
        ],
        generalRemarks: "Horse shows good potential. Work on maintaining consistent contact and developing more engagement from hindquarters.",
        strongPoints: ["Rhythm", "Straightness"],
        improvementAreas: ["Engagement", "Collection"]
      };
    } else {
      // Jumping analysis
      return {
        overallPerformance: "Good",
        jumpingStyle: 7.5,
        approach: {
          score: 7,
          comments: "Generally straight approaches but occasional drift to the right"
        },
        takeoff: {
          score: 8,
          comments: "Good impulsion and timing"
        },
        bascule: {
          score: 7,
          comments: "Horse shows a good shape over fences but could use more scope"
        },
        landing: {
          score: 6.5,
          comments: "Sometimes lands heavy, work on balance"
        },
        generalRemarks: "Promising jumping style. Work on maintaining rhythm between fences and straightness on landing.",
        strongPoints: ["Bravery", "Takeoff timing"],
        improvementAreas: ["Balance after landing", "Maintaining consistent pace"]
      };
    }
  } else {
    // For document analysis (scoring sheets, etc.)
    return {
      competitionResults: {
        eventName: "Regional Championship",
        date: documentData.document_date,
        level: documentData.test_level || "Unknown",
        totalScore: 67.8,
        place: 3,
        judge: "Jane Smith"
      },
      movementScores: [
        { movement: "Entry and halt", score: 7.0, comments: "Straight entry, square halt" },
        { movement: "Medium walk", score: 6.5, comments: "Could show more overstep" },
        { movement: "Working trot", score: 7.5, comments: "Good rhythm and energy" }
      ],
      collectiveMarks: {
        gaits: 7.0,
        impulsion: 6.5,
        submission: 7.0,
        riderPosition: 7.5
      },
      analysis: "Good overall performance with particular strength in transitions and rider position. Work on developing more engagement in collected work."
    };
  }
}
