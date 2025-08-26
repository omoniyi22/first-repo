import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
    const { to, subject, html } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: "mail@equineaintelligence.com", // replace with verified sender if available
            to, // e.g. "user@example.com"
            subject, // e.g. "Welcome!"
            html, // e.g. "<p>Hello 👋</p>"
        }),
    });

    const data = await res.json();

    if (!res.ok) {
        return new Response(JSON.stringify({ error: data }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, data }), {
        headers: { "Content-Type": "application/json" },
    });
});
