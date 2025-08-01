import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";
import "https://deno.land/std@0.168.0/dotenv/load.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
    subject: string;
    text: string;
    html: string;
    email: string;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { subject, text, html, email, }: EmailRequest = await req.json();


        const smtpClient = new SmtpClient();

        await smtpClient.connectTLS({
            hostname: "smtp.gmail.com",
            port: 465,
            username: "aliahmed.dev1@gmail.com",
            password: "ubuc zglz mdvv nhxc",
            // username: Deno.env.get("SMTP_EMAIL")!,
            // password: Deno.env.get("SMTP_PASSWORD")!,
        });

        await smtpClient.send({
            from: `AI Dressage <${Deno.env.get("SMTP_EMAIL")}>`,
            to: email,
            subject,
            content: text,
            html,
        });

        await smtpClient.close();

        return new Response(
            JSON.stringify({ success: true, message: "Email sent successfully" }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            },
        );
    } catch (error) {
        console.error("Error sending email:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            },
        );
    }
});
