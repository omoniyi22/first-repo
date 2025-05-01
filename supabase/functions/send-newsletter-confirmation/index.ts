
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
const SENDER_EMAIL = 'info@aidressagetrainer.com';
const SENDER_NAME = 'AI Equestrian';

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
    const { email } = await req.json() as EmailRequest;

    if (!email) {
      throw new Error('Email is required');
    }

    console.log('Sending newsletter confirmation email to:', email);
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY || '',
      },
      body: JSON.stringify({
        sender: {
          name: SENDER_NAME,
          email: SENDER_EMAIL,
        },
        to: [{
          email: email,
        }],
        subject: 'Newsletter Subscription Confirmation',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Newsletter Subscription Confirmed</title>
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
                <h1>AI Equestrian Newsletter</h1>
              </div>
              <div class="email-body">
                <p class="greeting">Thank you for subscribing!</p>
                <p class="message">You are now subscribed to our newsletter. You'll be the first to hear about new features, training tips, and special offers.</p>
                <p class="message">Stay tuned for expert advice on improving your equestrian skills with the help of AI technology.</p>
                <div style="text-align: center;">
                  <a href="https://intelligent-dressage-mentor.lovable.site/blog" class="cta-button">Read Our Latest Articles</a>
                </div>
              </div>
              <div class="email-footer">
                <p>If you have any questions, please don't hesitate to contact us.</p>
                <p>&copy; ${new Date().getFullYear()} AI Equestrian. All rights reserved.</p>
                <div class="social-links">
                  <a href="#">Facebook</a> | <a href="#">Instagram</a> | <a href="#">Twitter</a>
                </div>
                <p style="margin-top: 20px; font-size: 12px;">
                  If you didn't subscribe to this newsletter, you can safely ignore this email.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Email sending error:', data);
      throw new Error(data.message || 'Failed to send email');
    }

    console.log('Newsletter confirmation email sent successfully');
    
    return new Response(JSON.stringify({ success: true, message: 'Newsletter confirmation email sent successfully' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Newsletter confirmation email error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
