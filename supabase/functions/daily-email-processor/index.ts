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
        const horse = event?.horses

        if (!event || !horse) {
          results.errors.push(`Missing event or horse data for notification ${notification.id}`)
          await supabase
            .from('email_notifications')
            .update({
              delivery_status: 'failed',
              failure_reason: 'Missing event or horse data'
            })
            .eq('id', notification.id)
          results.emails_failed++
          continue
        }

        // Generate email content
        const emailContent = generateEmailContent(notification, event, horse.name)

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

// Generate email content based on notification type
function generateEmailContent(notification: any, event: any, horseName: string) {
  const eventDate = new Date(event.event_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const careType = event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)
  
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
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 32px 20px; text-align: center; }
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
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; transition: transform 0.2s; }
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
          <h1>${emoji} Horse Care Reminder</h1>
          <p>Keep your horse healthy and happy</p>
        </div>
        <div class="content">
          <div class="greeting">Hello!</div>
          <p>This is a friendly reminder that <strong>${horseName}</strong> has a <strong>${careType}</strong> appointment due <strong>${timeframe}</strong>.</p>
          
          <div class="highlight">
            <h3>📋 Appointment Details</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <div class="detail-label">Horse Name</div>
                <div class="detail-value">${horseName}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Service Type</div>
                <div class="detail-value">${careType}</div>
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
          
          <div class="urgency-banner">
            ${emoji} ${urgency.charAt(0).toUpperCase() + urgency.slice(1)}
          </div>
          
          <p>Don't forget to book your appointment if you haven't already! Keeping up with regular care helps ensure your horse stays healthy and performs at their best.</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://your-app-domain.com/horses" class="button">Manage My Horses</a>
          </div>
          
          <p>Best regards,<br><strong>Your Horse Management Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated reminder from your horse care management system.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p style="margin-top: 16px; font-size: 12px;">© 2024 Horse Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
${emoji} HORSE CARE REMINDER

Hello!

This is a friendly reminder that ${horseName} has a ${careType} appointment due ${timeframe}.

APPOINTMENT DETAILS:
- Horse: ${horseName}
- Service: ${careType}
- Due Date: ${eventDate}
- Timeline: ${timeframe}
- Status: ${urgency}

Don't forget to book your appointment if you haven't already! Keeping up with regular care helps ensure your horse stays healthy and performs at their best.

Visit your dashboard: https://your-app-domain.com/horses

Best regards,
Your Horse Management Team

---
This is an automated reminder from your horse care management system.
If you have any questions, please contact our support team.
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
        from: 'Horse Care Reminders <noreply@equineaintelligence.com>',
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        headers: {
          'X-Entity-Ref-ID': `horse-care-${Date.now()}`
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