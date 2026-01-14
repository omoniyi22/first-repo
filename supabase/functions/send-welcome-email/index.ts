
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const BREVO_API_KEY = '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'
const SENDER_EMAIL = 'info@aidressagetrainer.com'
const SENDER_NAME = 'AI Dressage Trainer'

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
        subject: 'Welcome to AI Dressage Trainer!',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to AI Dressage Trainer</title>
            <style>
              body {
                font-family: 'Helvetica', Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                margin: 0;
                padding: 0;
                background-color: #f9f7fd;
              }
              .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 10px rgba(0,0,0,0.05);
              }
              .email-header {
                background: linear-gradient(135deg, #9b87f5, #6942d7);
                color: #ffffff;
                padding: 30px;
                text-align: center;
              }
              .email-header h1 {
                margin: 0;
                font-family: 'Georgia', serif;
                font-size: 28px;
                font-weight: 700;
              }
              .email-body {
                padding: 30px;
              }
              .greeting {
                font-size: 22px;
                font-weight: 600;
                color: #6942d7;
                margin-bottom: 15px;
              }
              .message {
                margin-bottom: 25px;
                font-size: 16px;
              }
              .cta-button {
                display: inline-block;
                background-color: #6942d7;
                color: #ffffff !important;
                text-decoration: none;
                padding: 12px 25px;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
                text-align: center;
              }
              .cta-button:hover {
                background-color: #5835b0;
              }
              .feature-list {
                padding-left: 20px;
                margin: 20px 0;
              }
              .feature-list li {
                margin-bottom: 10px;
              }
              .email-footer {
                background-color: #f0f5ff;
                padding: 20px 30px;
                text-align: center;
                font-size: 14px;
                color: #737787;
              }
              .social-links {
                margin-top: 15px;
              }
              .social-links a {
                display: inline-block;
                margin: 0 8px;
                color: #6942d7;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="email-header">
                <h1>AI Dressage Trainer</h1>
              </div>
              <div class="email-body">
                <p class="greeting">Welcome to AI Dressage Trainer!</p>
                <p class="message">Thank you for signing up! We're excited to have you join our community of passionate equestrians and dressage enthusiasts.</p>
                <p class="message">With AI Dressage Trainer, you'll gain valuable insights into your riding performance and receive personalized recommendations to improve your dressage skills.</p>
                <div style="text-align: center;">
                  <a href="https://intelligent-dressage-mentor.lovable.site/dashboard" class="cta-button">Get Started Now</a>
                </div>
                <p class="message">Here's what you can look forward to:</p>
                <ul class="feature-list">
                  <li>Personalized dressage test analysis</li>
                  <li>AI-powered performance tracking</li>
                  <li>Custom training recommendations</li>
                  <li>Progress tracking and goal setting</li>
                  <li>Connect with coaches and fellow riders</li>
                </ul>
                <p class="message">To get the most out of our platform, we recommend completing your rider profile and uploading your first dressage test for analysis.</p>
              </div>
              <div class="email-footer">
                <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
                <p>&copy; 2025 AI Dressage Trainer. All rights reserved.</p>
                <div class="social-links">
                  <a href="#">Facebook</a> | <a href="#">Instagram</a> | <a href="#">YouTube</a>
                </div>
              </div>
            </div>
          </body>
          </html>
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
