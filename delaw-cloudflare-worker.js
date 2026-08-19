/**
 * DELAW AI – Cloudflare Worker
 * ============================
 * This Worker keeps your API key SECRET (as an environment variable).
 * The frontend only talks to this Worker – customers never see any key.
 *
 * HOW TO DEPLOY:
 * 1. Go to https://dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Paste this entire code
 * 3. Click "Save and Deploy"
 * 4. Go to Settings → Variables → Add the following secrets:
 *
 *    Name: GROQ_API_KEY
 *    Value: your real Groq key (gsk_...)
 *
 *    (Optional) Name: MODEL
 *    Value: llama-3.3-70b-versatile
 *
 * 5. Copy your Worker URL (https://xxxx.workers.dev)
 * 6. Paste that URL into the HTML file (search for WORKER_URL)
 */

export default {
  async fetch(request, env, ctx) {
    // CORS headers so the HTML page can call this Worker
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Only POST allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const body = await request.json();
      const messages = body.messages || [];

      if (!messages.length) {
        return new Response(JSON.stringify({ error: "messages array required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ===== Secret key from Cloudflare Environment Variable =====
      const apiKey = env.GROQ_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "GROQ_API_KEY not configured on Worker" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const model = env.MODEL || "llama-3.3-70b-versatile";

      // Call Groq (or any OpenAI-compatible API)
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      const data = await response.json();

      // Forward the response (including errors) to the frontend
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || "Worker error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
