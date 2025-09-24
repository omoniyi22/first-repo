// supabase/functions/daily-email-processor/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Allow GET requests without authentication for cron jobs
  console.log('Processing daily email cron job request')

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

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

    console.log(`Processing daily emails for: ${today}`)

    // Get all email notifications scheduled for today that haven't been sent
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from('email_notifications')
      .select(`
        *,
        events (
          title,
          event_date,
          event_type,
          care_schedule_id,
          horses (name, user_id)
        )
      `)
      .eq('scheduled_for', today)
      .eq('is_sent', false)
      .eq('delivery_status', 'pending')

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError)
      throw new Error(`Failed to fetch notifications: ${fetchError.message}`)
    }

    console.log(`Found ${pendingNotifications?.length || 0} pending notifications`)

    const results = {
      total_processed: 0,
      emails_sent: 0,
      emails_failed: 0,
      errors: [] as string[]
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No emails to process today',
          results,
          date_processed: today
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Process each notification
    for (const notification of pendingNotifications) {
      results.total_processed++
      
      try {
        const event = notification.events

        if (!event) {
          results.errors.push(`Missing event data for notification ${notification.id}`)
          await supabase
            .from('email_notifications')
            .update({
              delivery_status: 'failed',
              failure_reason: 'Missing event data'
            })
            .eq('id', notification.id)
          results.emails_failed++
          continue
        }

        // Determine if this is a horse care event or manual event
        const isHorseCareEvent = !!event.care_schedule_id
        const horse = event?.horses

        // For horse care events, we need horse data
        if (isHorseCareEvent && !horse) {
          results.errors.push(`Missing horse data for horse care notification ${notification.id}`)
          await supabase
            .from('email_notifications')
            .update({
              delivery_status: 'failed',
              failure_reason: 'Missing horse data for horse care event'
            })
            .eq('id', notification.id)
          results.emails_failed++
          continue
        }

        // Generate email content based on event type
        const emailContent = isHorseCareEvent 
          ? generateHorseCareEmailContent(notification, event, horse.name)
          : generateManualEventEmailContent(notification, event)

        // Send email
        const emailSent = await sendEmail({
          to: notification.email_address,
          subject: notification.email_subject,
          html: emailContent.html,
          text: emailContent.text
        })

        if (emailSent.success) {
          // Mark as sent
          const { error: updateError } = await supabase
            .from('email_notifications')
            .update({
              is_sent: true,
              sent_at: new Date().toISOString(),
              delivery_status: 'sent'
            })
            .eq('id', notification.id)

          if (updateError) {
            console.error('Error updating notification status:', updateError)
            results.errors.push(`Failed to update notification ${notification.id}: ${updateError.message}`)
          } else {
            results.emails_sent++
            console.log(`Email sent successfully for notification ${notification.id} to ${notification.email_address}`)
          }
        } else {
          // Mark as failed
          const { error: updateError } = await supabase
            .from('email_notifications')
            .update({
              delivery_status: 'failed',
              failure_reason: emailSent.error || 'Unknown error',
              retry_count: notification.retry_count + 1
            })
            .eq('id', notification.id)

          results.emails_failed++
          results.errors.push(`Failed to send email for notification ${notification.id}: ${emailSent.error}`)
          console.error(`Email failed for notification ${notification.id}:`, emailSent.error)
        }

      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error)
        results.errors.push(`Error processing notification ${notification.id}: ${error.message}`)
        results.emails_failed++

        // Mark as failed in database
        await supabase
          .from('email_notifications')
          .update({
            delivery_status: 'failed',
            failure_reason: error.message,
            retry_count: notification.retry_count + 1
          })
          .eq('id', notification.id)
      }
    }

    // Log summary
    console.log(`Daily email processing complete for ${today}:`, results)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${results.total_processed} notifications. Sent: ${results.emails_sent}, Failed: ${results.emails_failed}`,
        results,
        date_processed: today
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Daily email processor error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to process daily emails',
        details: error.message,
        date_processed: new Date().toISOString().split('T')[0]
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Updated helper function to get proper care type display names and descriptions
function getCareTypeInfo(eventType: string) {
  switch (eventType) {
    case 'farrier':
      return {
        displayName: 'Farrier',
        description: 'hoof trimming and shoeing',
        icon: '🔨'
      }
    case 'vaccination':
      return {
        displayName: 'Annual Vaccination',
        description: 'yearly flu vaccination',
        icon: '💉'
      }
    case 'boosters':
      return {
        displayName: 'Booster Shot',
        description: 'bi-annual booster vaccination',
        icon: '🛡️'
      }
    case 'dentist':
      return {
        displayName: 'Dental Care',
        description: 'dental checkup and floating',
        icon: '🦷'
      }
    case 'worming':
      return {
        displayName: 'Worming Treatment',
        description: 'parasite prevention treatment',
        icon: '💊'
      }
    default:
      return {
        displayName: eventType.charAt(0).toUpperCase() + eventType.slice(1),
        description: 'care appointment',
        icon: '📋'
      }
  }
}

// Generate email content for horse care events - Updated with new branding and logo
function generateHorseCareEmailContent(notification: any, event: any, horseName: string) {
  const eventDate = new Date(event.event_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const careInfo = getCareTypeInfo(event.event_type)
  
  let timeframe = ''
  let urgency = ''
  let emoji = ''
  
  switch (notification.notification_type) {
    case '3_weeks':
      timeframe = 'in 3 weeks'
      urgency = 'plenty of time to schedule'
      emoji = '📅'
      break
    case '1_week':
      timeframe = 'in 1 week'
      urgency = 'time to confirm your appointment'
      emoji = '⏰'
      break
    case 'same_day':
      timeframe = 'today'
      urgency = 'don\'t forget!'
      emoji = '🔔'
      break
    default:
      timeframe = 'soon'
      urgency = 'please check your schedule'
      emoji = '📋'
  }

  // Customize messaging based on care type
  let customMessage = ''
  let actionText = ''
  
  switch (event.event_type) {
    case 'farrier':
      customMessage = `${horseName}'s hooves need regular care to maintain their health and performance. Regular farrier visits help prevent lameness and ensure proper hoof balance.`
      actionText = 'Book your farrier appointment'
      break
    case 'vaccination':
      customMessage = `Annual vaccinations are crucial for protecting ${horseName} against serious diseases like influenza and tetanus.`
      actionText = 'Schedule vaccination appointment'
      break
    case 'boosters':
      customMessage = `Booster shots help maintain ${horseName}'s immunity between annual vaccinations, providing ongoing protection against disease.`
      actionText = 'Book booster appointment'
      break
    case 'dentist':
      customMessage = `Regular dental care ensures ${horseName} can eat comfortably and perform at their best. Dental issues can affect performance and overall health.`
      actionText = 'Schedule dental appointment'
      break
    case 'worming':
      customMessage = `Regular worming treatments help keep ${horseName} healthy by preventing parasitic infections that can affect their condition and performance.`
      actionText = 'Arrange worming treatment'
      break
    default:
      customMessage = `Regular care helps ensure ${horseName} stays healthy and performs at their best.`
      actionText = 'Book your appointment'
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Horse Care Reminder</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #a28bfb 0%, #7759eb 100%); color: white; padding: 32px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 8px 0 0 0; opacity: 0.9; font-size: 16px; }
        .content { padding: 32px 20px; }
        .greeting { font-size: 18px; margin-bottom: 24px; }
        .highlight { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 24px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #667eea; }
        .highlight h3 { margin: 0 0 16px 0; color: #1a202c; font-size: 18px; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
        .detail-item { padding: 12px; background: white; border-radius: 6px; border: 1px solid #e2e8f0; }
        .detail-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 4px; }
        .detail-value { font-weight: 600; color: #1a202c; }
        .urgency-banner { background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 16px; border-radius: 8px; margin: 24px 0; text-align: center; font-weight: 500; }
        .info-box { background: #f0f9ff; border: 1px solid #0ea5e9; color: #0c4a6e; padding: 16px; border-radius: 8px; margin: 24px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #a28bfb 0%, #7759eb 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; transition: transform 0.2s; }
        .button:hover { transform: translateY(-1px); }
        .footer { background-color: #f8fafc; color: #64748b; font-size: 14px; padding: 24px 20px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 8px 0; }
        @media (max-width: 600px) {
          .detail-grid { grid-template-columns: 1fr; }
          .content { padding: 24px 16px; }
          .header { padding: 24px 16px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="margin-bottom: 16px;">
            <img src="https://equineaintelligence.com/lovable-uploads/ddb7f47e-072a-4346-9fd3-a8a055f13bba.png" alt="AI Equestrian Logo" style="height: 60px; width: auto;">
          </div>
          <h1>${emoji} ${careInfo.displayName} Reminder</h1>
          <p>Keep your horse healthy and happy</p>
        </div>
        <div class="content">
          <div class="greeting">Hello!</div>
          <p>This is a friendly reminder that <strong>${horseName}</strong> has a <strong>${careInfo.displayName}</strong> appointment due <strong>${timeframe}</strong>.</p>
          
          <div class="highlight">
            <h3>${careInfo.icon} Appointment Details</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <div class="detail-label">Horse Name</div>
                <div class="detail-value">${horseName}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Service Type</div>
                <div class="detail-value">${careInfo.displayName}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Due Date</div>
                <div class="detail-value">${eventDate}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Timeline</div>
                <div class="detail-value">${timeframe}</div>
              </div>
            </div>
          </div>
          
          <div class="info-box">
            <p><strong>Why this matters:</strong> ${customMessage}</p>
          </div>
          
          <div class="urgency-banner">
            ${emoji} ${urgency.charAt(0).toUpperCase() + urgency.slice(1)}
          </div>
          
          <p><strong>${actionText}</strong> if you haven't already! Regular care appointments help ensure ${horseName} stays healthy and performs at their best.</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://equineaintelligence.com/profile-setup" style="color: white;" class="button">Manage My Horses</a>
          </div>
          
          <p>Best regards,<br><strong>Your Horse Management Team</strong></p>
          
          <div style="margin: 16px 0;">
            <img src="https://equineaintelligence.com/lovable-uploads/ddb7f47e-072a-4346-9fd3-a8a055f13bba.png" alt="AI Equestrian Logo" style="height: 40px; width: auto;">
          </div>
        </div>
        <div class="footer">
          <div style="margin-bottom: 16px;">
            <a href="https://instagram.com/ai_equestrian" style="color: #64748b; text-decoration: none; font-size: 14px;">
              📷 Follow us on Instagram @ai_equestrian
            </a>
          </div>
          <p>This is an automated reminder from your horse care management system.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p style="margin-top: 16px; font-size: 12px;">© 2025 AI Equestrian. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
${emoji} ${careInfo.displayName.toUpperCase()} REMINDER

Hello!

This is a friendly reminder that ${horseName} has a ${careInfo.displayName} appointment due ${timeframe}.

APPOINTMENT DETAILS:
- Horse: ${horseName}
- Service: ${careInfo.displayName}
- Due Date: ${eventDate}
- Timeline: ${timeframe}
- Status: ${urgency}

WHY THIS MATTERS:
${customMessage}

${actionText.toUpperCase()} if you haven't already! Regular care appointments help ensure ${horseName} stays healthy and performs at their best.

Visit your dashboard: https://equineaintelligence.com/dashboard

Best regards,
Your Horse Management Team

Follow us on Instagram: https://instagram.com/ai_equestrian

---
This is an automated reminder from your horse care management system.
If you have any questions, please contact our support team.
© 2025 AI Equestrian. All rights reserved.
  `

  return { html, text }
}

// Generate email content for manual events (no horse data) - Updated with new branding and logo
function generateManualEventEmailContent(notification: any, event: any) {
  const eventDate = new Date(event.event_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const eventTime = new Date(event.event_date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  const eventType = event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)
  
  let timeframe = ''
  let urgency = ''
  let emoji = ''
  
  switch (notification.notification_type) {
    case '3_weeks':
      timeframe = 'in 3 weeks'
      urgency = 'plenty of time to prepare'
      emoji = '📅'
      break
    case '1_week':
      timeframe = 'in 1 week'
      urgency = 'time to prepare'
      emoji = '⏰'
      break
    case 'same_day':
      timeframe = 'today'
      urgency = 'don\'t forget!'
      emoji = '🔔'
      break
    default:
      timeframe = 'soon'
      urgency = 'please check your schedule'
      emoji = '📋'
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Reminder</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #a28bfb 0%, #7759eb 100%); color: white; padding: 32px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 8px 0 0 0; opacity: 0.9; font-size: 16px; }
        .content { padding: 32px 20px; }
        .greeting { font-size: 18px; margin-bottom: 24px; }
        .highlight { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 24px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #667eea; }
        .highlight h3 { margin: 0 0 16px 0; color: #1a202c; font-size: 18px; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
        .detail-item { padding: 12px; background: white; border-radius: 6px; border: 1px solid #e2e8f0; }
        .detail-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 4px; }
        .detail-value { font-weight: 600; color: #1a202c; }
        .urgency-banner { background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 16px; border-radius: 8px; margin: 24px 0; text-align: center; font-weight: 500; }
        .button { display: inline-block; background: linear-gradient(135deg, #a28bfb 0%, #7759eb 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; transition: transform 0.2s; }
        .button:hover { transform: translateY(-1px); }
        .footer { background-color: #f8fafc; color: #64748b; font-size: 14px; padding: 24px 20px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 8px 0; }
        @media (max-width: 600px) {
          .detail-grid { grid-template-columns: 1fr; }
          .content { padding: 24px 16px; }
          .header { padding: 24px 16px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="margin-bottom: 16px;">
            <img src="https://equineaintelligence.com/lovable-uploads/ddb7f47e-072a-4346-9fd3-a8a055f13bba.png" alt="AI Equestrian Logo" style="height: 60px; width: auto;">
          </div>
          <h1>${emoji} Event Reminder</h1>
          <p>Stay organized and never miss an event</p>
        </div>
        <div class="content">
          <div class="greeting">Hello!</div>
          <p>This is a friendly reminder that you have <strong>${event.title}</strong> scheduled <strong>${timeframe}</strong>.</p>
          
          <div class="highlight">
            <h3>📋 Event Details</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <div class="detail-label">Event</div>
                <div class="detail-value">${event.title}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Type</div>
                <div class="detail-value">${eventType}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Date</div>
                <div class="detail-value">${eventDate}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Time</div>
                <div class="detail-value">${eventTime}</div>
              </div>
            </div>
          </div>
          
          <div class="urgency-banner">
            ${emoji} ${urgency.charAt(0).toUpperCase() + urgency.slice(1)}
          </div>
          
          <p>Make sure you're prepared and don't forget to check any additional details or requirements for this event.</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://equineaintelligence.com/events" style="color: white;" class="button">View My Events</a>
          </div>
          
          <p>Best regards,<br><strong>Your Event Management Team</strong></p>
          
          <div style="margin: 16px 0;">
            <img src="https://equineaintelligence.com/lovable-uploads/ddb7f47e-072a-4346-9fd3-a8a055f13bba.png" alt="AI Equestrian Logo" style="height: 40px; width: auto;">
          </div>
        </div>
        <div class="footer">
          <div style="margin-bottom: 16px;">
            <a href="https://instagram.com/ai_equestrian" style="color: #64748b; text-decoration: none; font-size: 14px;">
              📷 Follow us on Instagram @ai_equestrian
            </a>
          </div>
          <p>This is an automated reminder from your event management system.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p style="margin-top: 16px; font-size: 12px;">© 2025 AI Equestrian. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
${emoji} EVENT REMINDER

Hello!

This is a friendly reminder that you have ${event.title} scheduled ${timeframe}.

EVENT DETAILS:
- Event: ${event.title}
- Type: ${eventType}
- Date: ${eventDate}
- Time: ${eventTime}
- Status: ${urgency}

Make sure you're prepared and don't forget to check any additional details or requirements for this event.

Visit your dashboard: https://equineaintelligence.com/dashboard

Best regards,
Your Event Management Team

Follow us on Instagram: https://instagram.com/ai_equestrian

---
This is an automated reminder from your event management system.
If you have any questions, please contact our support team.
© 2025 AI Equestrian. All rights reserved.
  `

  return { html, text }
}

// Email sending function using Resend
async function sendEmail(emailData: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.log('No RESEND_API_KEY found - simulating email send for testing')
      console.log(`Would send email to: ${emailData.to}`)
      console.log(`Subject: ${emailData.subject}`)
      console.log('Email content preview:', emailData.text.substring(0, 200) + '...')
      return { success: true }
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Event Reminders <noreply@equineaintelligence.com>',
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        headers: {
          'X-Entity-Ref-ID': `event-reminder-${Date.now()}`
        }
      })
    })

    const responseData = await response.json()

    if (response.ok) {
      console.log('Email sent successfully via Resend:', responseData.id)
      return { success: true }
    } else {
      console.error('Resend API error:', responseData)
      return { success: false, error: `Resend API error: ${responseData.message || 'Unknown error'}` }
    }

  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error: error.message }
  }
}