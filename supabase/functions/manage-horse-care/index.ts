// supabase/functions/manage-horse-care/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CareSchedule {
  enabled: boolean;
  frequency_months: number;
  last_visit_date: string;
  notes: string;
}

interface RequestBody {
  action: 'create_care_schedules' | 'update_care_schedules';
  horse_id: string;
  horse_name: string;
  care_schedules: {
    farrier: CareSchedule;
    vaccination: CareSchedule;
    dentist: CareSchedule;
    worming: CareSchedule;
  };
  user_id: string;
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
    const { action, horse_id, horse_name, care_schedules, user_id, user_email } = body

    console.log(`Processing ${action} for horse:`, horse_id)

    if (action === 'create_care_schedules') {
      return await createCareSchedules(supabase, horse_id, horse_name, care_schedules, user_id, user_email)
    } else if (action === 'update_care_schedules') {
      return await updateCareSchedules(supabase, horse_id, horse_name, care_schedules, user_id, user_email)
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
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

// Create care schedules for new horse
async function createCareSchedules(
  supabase: any, 
  horseId: string, 
  horseName: string, 
  careSchedules: any, 
  userId: string, 
  userEmail: string
) {
  const results = {
    schedules_created: 0,
    events_created: 0,
    notifications_created: 0,
    errors: []
  }

  try {
    // Create care schedules
    const careSchedulesToCreate = []
    
    Object.entries(careSchedules).forEach(([careType, careData]: [string, any]) => {
      if (careData.enabled && careData.last_visit_date) {
        const nextDueDate = calculateNextDueDate(careData.last_visit_date, careData.frequency_months)

        careSchedulesToCreate.push({
          horse_id: horseId,
          care_type: careType,
          frequency_months: careData.frequency_months,
          last_visit_date: careData.last_visit_date,
          next_due_date: nextDueDate,
          notes: careData.notes,
          created_by: userId,
        })
      }
    })

    if (careSchedulesToCreate.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No care schedules to create',
          results 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Insert care schedules
    const { data: createdSchedules, error: scheduleError } = await supabase
      .from('horse_care_schedules')
      .insert(careSchedulesToCreate)
      .select()

    if (scheduleError) {
      console.error('Error creating care schedules:', scheduleError)
      results.errors.push(`Failed to create care schedules: ${scheduleError.message}`)
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          results,
          error: 'Failed to create care schedules' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    results.schedules_created = createdSchedules.length

    // Create events and notifications for each schedule
    for (const schedule of createdSchedules) {
      try {
        // Create event
        const eventDateTime = new Date(schedule.next_due_date)
        eventDateTime.setHours(9, 0, 0, 0)

        const { data: event, error: eventError } = await supabase
          .from('events')
          .insert({
            horse_id: horseId,
            user_id: userId,
            title: `${horseName} - ${schedule.care_type.charAt(0).toUpperCase() + schedule.care_type.slice(1)} Visit`,
            description: `Scheduled ${schedule.care_type} appointment for ${horseName}`,
            event_date: eventDateTime.toISOString(),
            event_type: schedule.care_type,
            discipline: 'Both',
            location: '',
            care_schedule_id: schedule.id,
            is_recurring: true,
            is_completed: false,
          })
          .select()
          .single()

        if (eventError) {
          console.error('Error creating event:', eventError)
          results.errors.push(`Failed to create event for ${schedule.care_type}: ${eventError.message}`)
          continue
        }

        results.events_created++

        // Create email notifications
        const notificationsCreated = await createEmailNotifications(
          supabase, 
          event, 
          horseId, 
          userId, 
          userEmail, 
          horseName
        )

        results.notifications_created += notificationsCreated

      } catch (error) {
        console.error(`Error processing schedule ${schedule.id}:`, error)
        results.errors.push(`Error processing ${schedule.care_type}: ${error.message}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Created ${results.schedules_created} schedules, ${results.events_created} events, and ${results.notifications_created} notifications`,
        results 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in createCareSchedules:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to create care schedules',
        details: error.message,
        results 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

// Update care schedules for existing horse
async function updateCareSchedules(
  supabase: any, 
  horseId: string, 
  horseName: string, 
  careSchedules: any, 
  userId: string, 
  userEmail: string
) {
  const results = {
    schedules_updated: 0,
    schedules_created: 0,
    schedules_deleted: 0,
    events_updated: 0,
    events_created: 0,
    events_deleted: 0,
    notifications_created: 0,
    notifications_deleted: 0,
    errors: []
  }

  try {
    // Get existing care schedules
    const { data: existingSchedules, error: fetchError } = await supabase
      .from('horse_care_schedules')
      .select('*')
      .eq('horse_id', horseId)

    if (fetchError) {
      throw new Error(`Failed to fetch existing schedules: ${fetchError.message}`)
    }

    const existingScheduleMap = new Map(
      existingSchedules?.map((s: any) => [s.care_type, s]) || []
    )

    // Process each care type
    for (const [careType, careData] of Object.entries(careSchedules) as [string, any][]) {
      const existingSchedule = existingScheduleMap.get(careType)

      try {
        if (careData.enabled && careData.last_visit_date) {
          const nextDueDate = calculateNextDueDate(careData.last_visit_date, careData.frequency_months)

          const scheduleData = {
            frequency_months: careData.frequency_months,
            last_visit_date: careData.last_visit_date,
            next_due_date: nextDueDate,
            notes: careData.notes,
          }

          if (existingSchedule) {
            // Update existing schedule
            const { error: updateError } = await supabase
              .from('horse_care_schedules')
              .update(scheduleData)
              .eq('id', existingSchedule.id)

            if (updateError) {
              results.errors.push(`Failed to update ${careType} schedule: ${updateError.message}`)
              continue
            }

            results.schedules_updated++

            // Update related incomplete events if date changed
            if (existingSchedule.next_due_date !== nextDueDate) {
              const eventDateTime = new Date(nextDueDate)
              eventDateTime.setHours(9, 0, 0, 0)

              const { data: updatedEvents, error: eventUpdateError } = await supabase
                .from('events')
                .update({
                  event_date: eventDateTime.toISOString(),
                  title: `${horseName} - ${careType.charAt(0).toUpperCase() + careType.slice(1)} Visit`,
                  description: `Scheduled ${careType} appointment for ${horseName}`
                })
                .eq('care_schedule_id', existingSchedule.id)
                .eq('is_completed', false)
                .select()

              if (!eventUpdateError) {
                results.events_updated += (updatedEvents?.length || 0)
              } else {
                results.errors.push(`Failed to update events for ${careType}: ${eventUpdateError.message}`)
              }
            }

          } else {
            // Create new schedule
            const { data: newSchedule, error: createError } = await supabase
              .from('horse_care_schedules')
              .insert({
                horse_id: horseId,
                care_type: careType,
                created_by: userId,
                ...scheduleData,
              })
              .select()
              .single()

            if (createError) {
              results.errors.push(`Failed to create ${careType} schedule: ${createError.message}`)
              continue
            }

            results.schedules_created++

            // Create event for new schedule
            const eventDateTime = new Date(nextDueDate)
            eventDateTime.setHours(9, 0, 0, 0)

            const { data: newEvent, error: eventError } = await supabase
              .from('events')
              .insert({
                horse_id: horseId,
                user_id: userId,
                title: `${horseName} - ${careType.charAt(0).toUpperCase() + careType.slice(1)} Visit`,
                description: `Scheduled ${careType} appointment for ${horseName}`,
                event_date: eventDateTime.toISOString(),
                event_type: careType,
                discipline: 'Both',
                location: '',
                care_schedule_id: newSchedule.id,
                is_recurring: true,
                is_completed: false,
              })
              .select()
              .single()

            if (eventError) {
              results.errors.push(`Failed to create event for ${careType}: ${eventError.message}`)
            } else {
              results.events_created++

              // Create notifications
              const notificationsCreated = await createEmailNotifications(
                supabase, 
                newEvent, 
                horseId, 
                userId, 
                userEmail, 
                horseName
              )
              results.notifications_created += notificationsCreated
            }
          }

        } else if (existingSchedule) {
          // Care type disabled - delete schedule and related data
          console.log(`Deleting care schedule for ${careType}`)
          
          // 1. First, get all incomplete events linked to this schedule
          const { data: eventsToDelete, error: fetchEventsError } = await supabase
            .from('events')
            .select('id')
            .eq('care_schedule_id', existingSchedule.id)
            .eq('is_completed', false)

          if (fetchEventsError) {
            results.errors.push(`Failed to fetch events for ${careType}: ${fetchEventsError.message}`)
            continue
          }

          // 2. Delete email notifications first (if any events exist)
          if (eventsToDelete && eventsToDelete.length > 0) {
            const eventIds = eventsToDelete.map(event => event.id)
            
            const { data: deletedNotifications, error: deleteNotificationsError } = await supabase
              .from('email_notifications')
              .delete()
              .in('event_id', eventIds)
              .select()

            if (deleteNotificationsError) {
              console.error('Error deleting notifications:', deleteNotificationsError)
              results.errors.push(`Failed to delete notifications for ${careType}: ${deleteNotificationsError.message}`)
            } else {
              results.notifications_deleted += (deletedNotifications?.length || 0)
              console.log(`Deleted ${deletedNotifications?.length || 0} notifications for ${careType}`)
            }
          }

          // 3. Delete related incomplete events
          const { data: deletedEvents, error: deleteEventsError } = await supabase
            .from('events')
            .delete()
            .eq('care_schedule_id', existingSchedule.id)
            .eq('is_completed', false)
            .select()

          if (deleteEventsError) {
            results.errors.push(`Failed to delete events for ${careType}: ${deleteEventsError.message}`)
            continue
          } else {
            results.events_deleted += (deletedEvents?.length || 0)
            console.log(`Deleted ${deletedEvents?.length || 0} events for ${careType}`)
          }

          // 4. Finally, delete the care schedule
          const { error: deleteScheduleError } = await supabase
            .from('horse_care_schedules')
            .delete()
            .eq('id', existingSchedule.id)

          if (deleteScheduleError) {
            results.errors.push(`Failed to delete schedule for ${careType}: ${deleteScheduleError.message}`)
            continue
          }

          results.schedules_deleted++
          console.log(`Successfully deleted ${careType} care schedule and related data`)
        }

      } catch (error) {
        console.error(`Error processing ${careType}:`, error)
        results.errors.push(`Error processing ${careType}: ${error.message}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Care schedules updated successfully. Updated: ${results.schedules_updated}, Created: ${results.schedules_created}, Deleted: ${results.schedules_deleted}`,
        results 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in updateCareSchedules:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to update care schedules',
        details: error.message,
        results 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

// Helper function to calculate next due date
function calculateNextDueDate(lastVisitDate: string, frequencyMonths: number): string {
  const lastVisit = new Date(lastVisitDate)
  const nextDue = new Date(lastVisit)
  nextDue.setMonth(nextDue.getMonth() + frequencyMonths)
  return nextDue.toISOString().split('T')[0]
}

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