// supabase/functions/check-document-limits/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Use service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    // Get user's active subscription with plan details
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        id,
        user_id,
        is_active,
        plan_id,
        pricing_plans!inner (
          name,
          max_documents_monthly,
          document_limit_type,
          max_horses
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (subError || !subscription) {
      // Default to free plan if no subscription found
      const response = {
        canUploadDocument: false,
        currentDocuments: 0,
        maxDocuments: 0,
        planName: 'No plan subscribed',
        remainingDocuments: 0,
        limitType: 'monthly',
        limitPeriod: 'No active subscription'
      }
      
      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const planLimits = subscription.pricing_plans
    const limitType = planLimits.document_limit_type || 'monthly'

    let documentsCount = 0
    let limitPeriod = ''

    // Count documents based on limit type
    if (limitType === 'one_time') {
      // One-time limit: Count ALL documents ever uploaded
      const { count, error: docError } = await supabase
        .from('document_analysis')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (docError) {
        throw docError
      }

      documentsCount = count || 0
      limitPeriod = 'lifetime'

    } else {
      // Monthly limit: Count only this month's documents
      const currentMonth = new Date()
      currentMonth.setDate(1)
      currentMonth.setHours(0, 0, 0, 0)

      const { count, error: docError } = await supabase
        .from('document_analysis')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', currentMonth.toISOString())

      if (docError) {
        throw docError
      }

      documentsCount = count || 0
      
      // Calculate next reset date (first day of next month)
      const nextMonth = new Date(currentMonth)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      limitPeriod = `monthly (resets ${nextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
    }

    const currentDocuments = documentsCount

    // Handle unlimited plans (max_documents_monthly = -1)
    const isUnlimited = planLimits.max_documents_monthly === -1
    const maxDocuments = isUnlimited ? 'unlimited' : planLimits.max_documents_monthly
    const remainingDocuments = isUnlimited 
      ? 'unlimited' 
      : Math.max(0, planLimits.max_documents_monthly - currentDocuments)
    
    // User can upload if plan is unlimited OR they haven't reached their limit
    const canUploadDocument = isUnlimited || currentDocuments < planLimits.max_documents_monthly

    const response = {
      canUploadDocument,
      currentDocuments,
      maxDocuments,
      planName: planLimits.name,
      remainingDocuments,
      limitType,
      limitPeriod
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in check-document-limits:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})