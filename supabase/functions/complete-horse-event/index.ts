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
      console.error('Event fetch error:', eventError)
      throw new Error(`Failed to fetch event: ${eventError.message}`)
    }

    console.log('Event data:', JSON.stringify(event, null, 2))

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

    if (!schedule || !horse) {
      throw new Error('Missing schedule or horse data')
    }

    console.log('Schedule data:', JSON.stringify(schedule, null, 2))

    // Use actual completion date or current date
    const completionDate = actual_completion_date ? new Date(actual_completion_date) : new Date()
    console.log('Completion date:', completionDate.toISOString())

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
      console.error('Event update error:', updateEventError)
      throw new Error(`Failed to mark event as completed: ${updateEventError.message}`)
    }

    console.log('Event marked as completed successfully')

    // 2. Calculate next due date from actual completion date with NEW frequency system
    const frequency = schedule.frequency || schedule.frequency_months || 6
    const frequencyUnit = schedule.frequency_unit || 'months'
    
    console.log('Frequency calculation:', { frequency, frequencyUnit, completionDate: completionDate.toISOString().split('T')[0] })

    const nextDueDate = calculateNextDueDate(
      completionDate.toISOString().split('T')[0], 
      frequency,
      frequencyUnit
    )

    console.log('Calculated next due date:', nextDueDate)

    // 3. Update care schedule with new dates
    const { error: updateScheduleError } = await supabase
      .from('horse_care_schedules')
      .update({
        last_visit_date: completionDate.toISOString().split('T')[0],
        next_due_date: nextDueDate
      })
      .eq('id', schedule.id)

    if (updateScheduleError) {
      console.error('Schedule update error:', updateScheduleError)
      throw new Error(`Failed to update care schedule: ${updateScheduleError.message}`)
    }

    console.log('Care schedule updated successfully')

    // 4. Get user email for notifications - FIXED: Use correct auth table query
    const { data: userData, error: userError } = await supabase
      .from('profiles') // Try profiles table first
      .select('email')
      .eq('id', horse.user_id)
      .single()

    let userEmail = userData?.email

    // Fallback: try auth.users if profiles doesn't work
    if (userError || !userEmail) {
      console.log('Trying auth.users table for email')
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(horse.user_id)
      userEmail = authUser?.user?.email
      
      if (authError || !userEmail) {
        console.error('Failed to fetch user email:', authError || 'No email found')
      }
    }

    console.log('User email found:', userEmail ? 'Yes' : 'No')

    // 5. Create next recurring event with proper title
    const nextEventDateTime = new Date(nextDueDate)
    nextEventDateTime.setHours(9, 0, 0, 0) // Set to 9:00 AM

    const eventTitle = getCareTypeTitle(schedule.care_type, horse.name)

    console.log('Creating next event:', {
      title: eventTitle,
      date: nextEventDateTime.toISOString(),
      care_type: schedule.care_type
    })

    const { data: nextEvent, error: nextEventError } = await supabase
      .from('events')
      .insert({
        horse_id: event.horse_id,
        user_id: horse.user_id,
        title: eventTitle,
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
      console.error('Next event creation error:', nextEventError)
      throw new Error(`Failed to create next recurring event: ${nextEventError.message}`)
    }

    console.log('Next event created successfully:', nextEvent.id)

    // 6. Schedule email notifications for new event (only if we have user email)
    let notificationsCreated = 0
    if (userEmail) {
      console.log('Creating email notifications')
      notificationsCreated = await createEmailNotifications(
        supabase,
        nextEvent,
        event.horse_id,
        horse.user_id,
        userEmail,
        horse.name
      )
      console.log('Notifications created:', notificationsCreated)
    } else {
      console.log('No user email available - skipping notifications')
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
          next_due_date: nextDueDate,
          notifications_scheduled: notificationsCreated,
          care_schedule_updated: {
            last_visit_date: completionDate.toISOString().split('T')[0],
            next_due_date: nextDueDate,
            frequency: frequency,
            frequency_unit: frequencyUnit
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

// FIXED: Updated helper function to calculate next due date with proper debugging
function calculateNextDueDate(
  lastVisitDate: string, 
  frequency: number, 
  frequencyUnit: 'weeks' | 'months'
): string {
  const lastVisit = new Date(lastVisitDate)
  const nextDue = new Date(lastVisit)
  
  console.log('Calculate next due date:', {
    lastVisitDate,
    frequency,
    frequencyUnit,
    lastVisit: lastVisit.toISOString()
  })
  
  if (frequencyUnit === 'weeks') {
    nextDue.setDate(nextDue.getDate() + (frequency * 7))
    console.log('Added weeks:', frequency * 7, 'days')
  } else {
    nextDue.setMonth(nextDue.getMonth() + frequency)
    console.log('Added months:', frequency)
  }
  
  const result = nextDue.toISOString().split('T')[0]
  console.log('Next due date result:', result)
  return result
}

// Updated helper function to get proper title for different care types including boosters
function getCareTypeTitle(careType: string, horseName: string): string {
  switch (careType) {
    case 'farrier':
      return `${horseName} - Farrier Visit`
    case 'vaccination':
      return `${horseName} - Annual Vaccination`
    case 'boosters':
      return `${horseName} - Booster Shot`
    case 'dentist':
      return `${horseName} - Dental Care`
    case 'worming':
      return `${horseName} - Worming Treatment`
    default:
      return `${horseName} - ${careType.charAt(0).toUpperCase() + careType.slice(1)} Visit`
  }
}

// IMPROVED: Helper function to create email notifications with better error handling
async function createEmailNotifications(
  supabase: any,
  event: any,
  horseId: string,
  userId: string,
  userEmail: string,
  horseName: string
): Promise<number> {
  try {
    const notificationsToCreate = []
    const dueDate = new Date(event.event_date)

    // Calculate notification dates
    const threeWeeksBefore = new Date(dueDate)
    threeWeeksBefore.setDate(threeWeeksBefore.getDate() - 21)

    const oneWeekBefore = new Date(dueDate)
    oneWeekBefore.setDate(oneWeekBefore.getDate() - 7)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    console.log('Notification dates:', {
      dueDate: dueDate.toISOString(),
      threeWeeksBefore: threeWeeksBefore.toISOString(),
      oneWeekBefore: oneWeekBefore.toISOString(),
      today: today.toISOString()
    })

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

    console.log('Notifications to create:', notificationsToCreate.length)

    if (notificationsToCreate.length > 0) {
      const { data, error } = await supabase
        .from('email_notifications')
        .insert(notificationsToCreate)
        .select()

      if (error) {
        console.error('Failed to create email notifications:', error)
        return 0
      }

      console.log('Created notifications:', data.length)
      return data.length
    }

    return 0
  } catch (error) {
    console.error('Error in createEmailNotifications:', error)
    return 0
  }
}