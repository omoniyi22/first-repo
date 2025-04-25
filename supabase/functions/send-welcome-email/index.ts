import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const BREVO_API_KEY = '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'
const SENDER_EMAIL = 'jenny@appetitecreative.com'
const SENDER_NAME = 'Jenny at Appetite Creative'

interface EmailRequest {
  email: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { email } = await req.json() as EmailRequest

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: SENDER_NAME,
          email: SENDER_EMAIL,
        },
        to: [{
          email: email,
        }],
        subject: 'Welcome to Appetite Creative!',
        htmlContent: `
          <h1>Welcome to Appetite Creative!</h1>
          <p>Thank you for your interest! We're excited to have you join us.</p>
          <p>We'll keep you updated about our launch and send you exclusive offers.</p>
          <p>Best regards,<br>Jenny</p>
        `,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email')
    }

    return new Response(JSON.stringify({ message: 'Welcome email sent successfully' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
