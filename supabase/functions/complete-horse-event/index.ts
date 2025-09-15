// supabase/functions/complete-horse-event/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  event_id: string;
  completed_by: string;
  actual_completion_date?: string;
  notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const body: RequestBody = await req.json()
    const { event_id, completed_by, actual_completion_date, notes } = body

    console.log('Processing event completion:', event_id)

    // Get event with related care schedule and horse details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        horse_care_schedules (*),
        horses (name, user_id)
      `)
      .eq('id', event_id)
      .single()

    if (eventError) {
      throw new Error(`Failed to fetch event: ${eventError.message}`)
    }

    if (!event.care_schedule_id) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Event is not linked to a care schedule' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (event.is_completed) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Event is already completed' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const schedule = event.horse_care_schedules
    const horse = event.horses

    // Use actual completion date or current date
    const completionDate = actual_completion_date ? new Date(actual_completion_date) : new Date()

    // 1. Mark current event as completed
    const { error: updateEventError } = await supabase
      .from('events')
      .update({
        is_completed: true,
        completed_at: completionDate.toISOString(),
        completed_by: completed_by
      })
      .eq('id', event_id)

    if (updateEventError) {
      throw new Error(`Failed to mark event as completed: ${updateEventError.message}`)
    }

    // 2. Calculate next due date from actual completion date
    const nextDueDate = new Date(completionDate)
    nextDueDate.setMonth(nextDueDate.getMonth() + schedule.frequency_months)

    // 3. Update care schedule with new dates
    const { error: updateScheduleError } = await supabase
      .from('horse_care_schedules')
      .update({
        last_visit_date: completionDate.toISOString().split('T')[0],
        next_due_date: nextDueDate.toISOString().split('T')[0]
      })
      .eq('id', schedule.id)

    if (updateScheduleError) {
      throw new Error(`Failed to update care schedule: ${updateScheduleError.message}`)
    }

    // 4. Get user details for notifications
    const { data: user, error: userError } = await supabase
      .from('auth.users')
      .select('email')
      .eq('id', horse.user_id)
      .single()

    if (userError) {
      console.error('Failed to fetch user details:', userError)
    }

    // 5. Create next recurring event
    const nextEventDateTime = new Date(nextDueDate)
    nextEventDateTime.setHours(9, 0, 0, 0) // Set to 9:00 AM

    const { data: nextEvent, error: nextEventError } = await supabase
      .from('events')
      .insert({
        horse_id: event.horse_id,
        user_id: horse.user_id,
        title: `${horse.name} - ${schedule.care_type.charAt(0).toUpperCase() + schedule.care_type.slice(1)} Visit`,
        description: `Scheduled ${schedule.care_type} appointment for ${horse.name}`,
        event_date: nextEventDateTime.toISOString(),
        event_type: schedule.care_type,
        discipline: 'Both',
        location: '',
        care_schedule_id: schedule.id,
        is_recurring: true,
        is_completed: false
      })
      .select()
      .single()

    if (nextEventError) {
      throw new Error(`Failed to create next recurring event: ${nextEventError.message}`)
    }

    // 6. Schedule email notifications for new event (only if we have user email)
    let notificationsCreated = 0
    if (user?.email) {
      notificationsCreated = await createEmailNotifications(
        supabase,
        nextEvent,
        event.horse_id,
        horse.user_id,
        user.email,
        horse.name
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Event completed and next appointment scheduled',
        data: {
          completed_event_id: event_id,
          next_event: {
            id: nextEvent.id,
            title: nextEvent.title,
            event_date: nextEvent.event_date,
            care_type: schedule.care_type
          },
          next_due_date: nextDueDate.toISOString().split('T')[0],
          notifications_scheduled: notificationsCreated,
          care_schedule_updated: {
            last_visit_date: completionDate.toISOString().split('T')[0],
            next_due_date: nextDueDate.toISOString().split('T')[0],
            frequency_months: schedule.frequency_months
          }
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to complete event',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Helper function to create email notifications
async function createEmailNotifications(
  supabase: any,
  event: any,
  horseId: string,
  userId: string,
  userEmail: string,
  horseName: string
): Promise<number> {
  const notificationsToCreate = []
  const dueDate = new Date(event.event_date)

  // Calculate notification dates
  const threeWeeksBefore = new Date(dueDate)
  threeWeeksBefore.setDate(threeWeeksBefore.getDate() - 21)

  const oneWeekBefore = new Date(dueDate)
  oneWeekBefore.setDate(oneWeekBefore.getDate() - 7)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Only schedule future notifications
  if (threeWeeksBefore >= today) {
    notificationsToCreate.push({
      event_id: event.id,
      user_id: userId,
      horse_id: horseId,
      notification_type: '3_weeks',
      scheduled_for: threeWeeksBefore.toISOString().split('T')[0],
      email_address: userEmail,
      email_subject: `${horseName} - ${event.event_type} appointment in 3 weeks`,
      is_sent: false,
      delivery_status: 'pending'
    })
  }

  if (oneWeekBefore >= today) {
    notificationsToCreate.push({
      event_id: event.id,
      user_id: userId,
      horse_id: horseId,
      notification_type: '1_week',
      scheduled_for: oneWeekBefore.toISOString().split('T')[0],
      email_address: userEmail,
      email_subject: `${horseName} - ${event.event_type} appointment in 1 week`,
      is_sent: false,
      delivery_status: 'pending'
    })
  }

  // Always schedule same day notification
  notificationsToCreate.push({
    event_id: event.id,
    user_id: userId,
    horse_id: horseId,
    notification_type: 'same_day',
    scheduled_for: dueDate.toISOString().split('T')[0],
    email_address: userEmail,
    email_subject: `${horseName} - ${event.event_type} appointment today`,
    is_sent: false,
    delivery_status: 'pending'
  })

  if (notificationsToCreate.length > 0) {
    const { data, error } = await supabase
      .from('email_notifications')
      .insert(notificationsToCreate)
      .select()

    if (error) {
      console.error('Failed to create email notifications:', error)
      return 0
    }

    return data.length
  }

  return 0
}