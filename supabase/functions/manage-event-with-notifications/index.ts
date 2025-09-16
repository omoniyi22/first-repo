// supabase/functions/manage-event-with-notifications/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPreferences {
  threeWeeks: boolean;
  oneWeek: boolean;
  sameDay: boolean;
}

interface RequestBody {
  action: 'create' | 'update';
  event_id?: string; // Required for update
  title: string;
  eventType: string;
  eventDate: string; // ISO string
  location?: string;
  description?: string;
  discipline: 'Jumping' | 'Dressage' | 'Both';
  imageUrl?: string;
  userId: string;
  notification_preferences?: NotificationPreferences; // Only for create
  user_email: string;
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
    const { action } = body

    console.log(`Processing ${action} operation for event`)

    if (action === 'create') {
      return await createEventWithNotifications(supabase, body)
    } else if (action === 'update') {
      return await updateEventWithNotifications(supabase, body)
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use "create" or "update"' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Handle create operation
async function createEventWithNotifications(supabase: any, body: RequestBody) {
  const { 
    title, 
    eventType, 
    eventDate, 
    location, 
    description, 
    discipline, 
    imageUrl, 
    userId, 
    notification_preferences, 
    user_email 
  } = body

  // Validate required fields for create
  if (!title || !eventType || !eventDate || !userId || !user_email) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields for create' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const results = {
    event_created: false,
    event_id: null as string | null,
    notifications_created: 0,
    errors: [] as string[]
  }

  // 1. Create the event
  const eventData = {
    user_id: userId,
    title,
    event_type: eventType,
    event_date: eventDate,
    location: location || '',
    description: description || '',
    discipline,
    image_url: imageUrl || '',
    is_recurring: false, // Manual events are not recurring
    is_completed: false,
    care_schedule_id: null // No care schedule for manual events
  }

  const { data: newEvent, error: eventError } = await supabase
    .from('events')
    .insert([eventData])
    .select()
    .single()

  if (eventError) {
    console.error('Error creating event:', eventError)
    results.errors.push(`Failed to create event: ${eventError.message}`)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to create event',
        details: eventError.message,
        results 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  results.event_created = true
  results.event_id = newEvent.id
  console.log(`Event created successfully: ${newEvent.id}`)

  // 2. Create email notifications based on preferences
  if (notification_preferences && (notification_preferences.threeWeeks || notification_preferences.oneWeek || notification_preferences.sameDay)) {
    try {
      const notificationsCreated = await createEmailNotifications(
        supabase,
        newEvent,
        userId,
        user_email,
        notification_preferences
      )
      
      results.notifications_created = notificationsCreated
      console.log(`Created ${notificationsCreated} email notifications`)
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError)
      results.errors.push(`Failed to create notifications: ${notificationError.message}`)
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      message: `Event created successfully${results.notifications_created > 0 ? ` with ${results.notifications_created} notifications scheduled` : ''}`,
      data: {
        event_id: newEvent.id,
        event_title: newEvent.title,
        event_date: newEvent.event_date,
        notifications_created: results.notifications_created
      },
      results
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

// FIXED: Handle update operation for BOTH manual and recurring events
async function updateEventWithNotifications(supabase: any, body: RequestBody) {
  const { 
    event_id,
    title, 
    eventType, 
    eventDate, 
    location, 
    description, 
    discipline, 
    imageUrl, 
    userId,
    user_email
  } = body

  // Validate required fields for update
  if (!event_id || !title || !eventType || !eventDate || !userId) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields for update' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const results = {
    event_updated: false,
    notifications_updated: 0,
    notifications_deleted: 0,
    errors: [] as string[]
  }

  // 1. Get existing event to compare dates and check if it's completed
  const { data: existingEvent, error: fetchError } = await supabase
    .from('events')
    .select('event_date, care_schedule_id, is_completed')
    .eq('id', event_id)
    .eq('user_id', userId)
    .single()

  if (fetchError) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Event not found or access denied',
        details: fetchError.message
      }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // 2. Check if event is already completed
  if (existingEvent.is_completed) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Cannot update completed events',
        message: 'This event has already been completed and cannot be modified.'
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // 3. Update the event
  const eventData = {
    title,
    event_type: eventType,
    event_date: eventDate,
    location: location || '',
    description: description || '',
    discipline,
    image_url: imageUrl || ''
  }

  const { error: updateError } = await supabase
    .from('events')
    .update(eventData)
    .eq('id', event_id)
    .eq('user_id', userId)

  if (updateError) {
    console.error('Error updating event:', updateError)
    results.errors.push(`Failed to update event: ${updateError.message}`)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to update event',
        details: updateError.message,
        results 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  results.event_updated = true
  console.log(`Event updated successfully: ${event_id}`)

  // 4. FIXED: Update notifications for ALL events when date changes (not just manual ones)
  const dateChanged = existingEvent.event_date !== eventDate
  const isManualEvent = !existingEvent.care_schedule_id
  const isRecurringEvent = !!existingEvent.care_schedule_id

  console.log('Event type check:', { dateChanged, isManualEvent, isRecurringEvent })

  if (dateChanged && user_email) {
    console.log('Date changed - updating notifications for both manual and recurring events')
    
    try {
      // Delete existing unsent notifications for ANY event type
      const { data: deletedNotifications, error: deleteError } = await supabase
        .from('email_notifications')
        .delete()
        .eq('event_id', event_id)
        .eq('is_sent', false)
        .select()

      if (deleteError) {
        console.error('Error deleting old notifications:', deleteError)
        results.errors.push(`Failed to delete old notifications: ${deleteError.message}`)
      } else {
        results.notifications_deleted = deletedNotifications?.length || 0
        console.log(`Deleted ${results.notifications_deleted} old notifications`)
      }

      // Create new notifications with standard pattern for ANY event type
      const newNotificationsCount = await createStandardNotifications(
        supabase,
        event_id,
        eventDate,
        title,
        userId,
        user_email
      )
      
      results.notifications_updated = newNotificationsCount
      console.log(`Created ${newNotificationsCount} updated notifications`)

      // 5. ADDITIONAL: Update care schedule if this is a recurring event
      if (isRecurringEvent) {
        console.log('Updating care schedule for recurring event')
        try {
          const { error: scheduleUpdateError } = await supabase
            .from('horse_care_schedules')
            .update({
              next_due_date: new Date(eventDate).toISOString().split('T')[0]
            })
            .eq('id', existingEvent.care_schedule_id)

          if (scheduleUpdateError) {
            console.error('Error updating care schedule:', scheduleUpdateError)
            results.errors.push(`Failed to update care schedule: ${scheduleUpdateError.message}`)
          } else {
            console.log('Care schedule updated successfully')
          }
        } catch (scheduleError) {
          console.error('Care schedule update failed:', scheduleError)
          results.errors.push(`Care schedule update failed: ${scheduleError.message}`)
        }
      }

    } catch (notificationError) {
      console.error('Error updating notifications:', notificationError)
      results.errors.push(`Failed to update notifications: ${notificationError.message}`)
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      message: `Event updated successfully${results.notifications_updated > 0 ? ` with ${results.notifications_updated} notifications updated` : ''}`,
      data: {
        event_id,
        event_title: title,
        event_date: eventDate,
        date_changed: dateChanged,
        is_recurring_event: isRecurringEvent,
        notifications_updated: results.notifications_updated,
        notifications_deleted: results.notifications_deleted
      },
      results
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

// Helper function to create email notifications with preferences
async function createEmailNotifications(
  supabase: any,
  event: any,
  userId: string,
  userEmail: string,
  preferences: NotificationPreferences
): Promise<number> {
  const notificationsToCreate = []
  const eventDate = new Date(event.event_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Create notifications based on preferences
  if (preferences.threeWeeks) {
    const threeWeeksBefore = new Date(eventDate)
    threeWeeksBefore.setDate(threeWeeksBefore.getDate() - 21)
    
    if (threeWeeksBefore >= today) {
      notificationsToCreate.push({
        event_id: event.id,
        user_id: userId,
        notification_type: '3_weeks',
        scheduled_for: threeWeeksBefore.toISOString().split('T')[0],
        email_address: userEmail,
        email_subject: `${event.title} - Reminder: Event in 3 weeks`,
        is_sent: false,
        delivery_status: 'pending'
      })
    }
  }

  if (preferences.oneWeek) {
    const oneWeekBefore = new Date(eventDate)
    oneWeekBefore.setDate(oneWeekBefore.getDate() - 7)
    
    if (oneWeekBefore >= today) {
      notificationsToCreate.push({
        event_id: event.id,
        user_id: userId,
        notification_type: '1_week',
        scheduled_for: oneWeekBefore.toISOString().split('T')[0],
        email_address: userEmail,
        email_subject: `${event.title} - Reminder: Event in 1 week`,
        is_sent: false,
        delivery_status: 'pending'
      })
    }
  }

  if (preferences.sameDay) {
    const sameDay = new Date(eventDate)
    sameDay.setHours(0, 0, 0, 0)
    
    if (sameDay >= today) {
      notificationsToCreate.push({
        event_id: event.id,
        user_id: userId,
        notification_type: 'same_day',
        scheduled_for: sameDay.toISOString().split('T')[0],
        email_address: userEmail,
        email_subject: `${event.title} - Reminder: Event today`,
        is_sent: false,
        delivery_status: 'pending'
      })
    }
  }

  return await insertNotifications(supabase, notificationsToCreate)
}

// Helper function to create standard notifications (for updates)
async function createStandardNotifications(
  supabase: any,
  eventId: string,
  eventDate: string,
  eventTitle: string,
  userId: string,
  userEmail: string
): Promise<number> {
  const notificationsToCreate = []
  const eventDateTime = new Date(eventDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Create standard notification pattern (3 weeks, 1 week, same day)
  const threeWeeksBefore = new Date(eventDateTime)
  threeWeeksBefore.setDate(threeWeeksBefore.getDate() - 21)
  
  if (threeWeeksBefore >= today) {
    notificationsToCreate.push({
      event_id: eventId,
      user_id: userId,
      notification_type: '3_weeks',
      scheduled_for: threeWeeksBefore.toISOString().split('T')[0],
      email_address: userEmail,
      email_subject: `${eventTitle} - Reminder: Event in 3 weeks`,
      is_sent: false,
      delivery_status: 'pending'
    })
  }

  const oneWeekBefore = new Date(eventDateTime)
  oneWeekBefore.setDate(oneWeekBefore.getDate() - 7)
  
  if (oneWeekBefore >= today) {
    notificationsToCreate.push({
      event_id: eventId,
      user_id: userId,
      notification_type: '1_week',
      scheduled_for: oneWeekBefore.toISOString().split('T')[0],
      email_address: userEmail,
      email_subject: `${eventTitle} - Reminder: Event in 1 week`,
      is_sent: false,
      delivery_status: 'pending'
    })
  }

  const sameDay = new Date(eventDateTime)
  sameDay.setHours(0, 0, 0, 0)
  
  if (sameDay >= today) {
    notificationsToCreate.push({
      event_id: eventId,
      user_id: userId,
      notification_type: 'same_day',
      scheduled_for: sameDay.toISOString().split('T')[0],
      email_address: userEmail,
      email_subject: `${eventTitle} - Reminder: Event today`,
      is_sent: false,
      delivery_status: 'pending'
    })
  }

  return await insertNotifications(supabase, notificationsToCreate)
}

// Helper function to insert notifications
async function insertNotifications(supabase: any, notificationsToCreate: any[]): Promise<number> {
  if (notificationsToCreate.length > 0) {
    const { data: createdNotifications, error: notificationError } = await supabase
      .from('email_notifications')
      .insert(notificationsToCreate)
      .select()

    if (notificationError) {
      console.error('Failed to create notifications:', notificationError)
      throw new Error(`Failed to create notifications: ${notificationError.message}`)
    }

    return createdNotifications.length
  }

  return 0
}