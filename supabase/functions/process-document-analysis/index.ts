
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

    // In a real implementation, you would:
    // 1. Get document from storage
    // 2. Process it with AI
    // 3. Store the results
    // For now, we'll just simulate it being processed

    // Simulate a delay for processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    
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
      JSON.stringify({ success: true }),
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
