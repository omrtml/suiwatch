// Vercel Serverless function: proxies AI requests to Cloudflare Workers AI using server-side env vars
// Set CF_ACCOUNT_ID, CF_MODEL, and CF_API_TOKEN in your Vercel project settings (Environment Variables).

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Load Cloudflare AI configuration from environment variables.
  // For local testing you can set these in a .env.local file or export them in your shell.
  // WARNING: Do NOT commit real secret tokens to source control. Use Vercel env vars for production.
const CF_ACCOUNT_ID = "568525424c1d0ac88c8baa71f52d3e45";
const CF_MODEL = "@cf/meta/llama-3-8b-instruct";
const CF_API_TOKEN = "debXIsihVBoDISc5zz_PAN6bCpMTABDApyfpsoyU";

  if (!CF_ACCOUNT_ID || !CF_MODEL || !CF_API_TOKEN || CF_ACCOUNT_ID.startsWith('REPLACE')) {
    return res.status(500).json({ error: 'Cloudflare AI env vars missing or placeholder values present (CF_ACCOUNT_ID, CF_MODEL, CF_API_TOKEN). Set them in Vercel or locally.' });
  }

  try {
    const { prompt } = req.body || {};
    const finalPrompt = prompt || 'Write a short story about a llama that goes on a journey to find an orange cloud';

    const body = {
      messages: [
        { role: 'system', content: 'You are a friendly assistant that helps write stories' },
        { role: 'user', content: finalPrompt },
      ],
    };

    const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_MODEL}`;

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CF_API_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    const json = await r.json().catch(() => null);

    // If Cloudflare returns a non-2xx, surface a friendly error with details.
    if (!r.ok) {
      console.error('Cloudflare AI error:', r.status, json);
      const message = json?.errors || json?.message || json || `Status ${r.status}`;
      return res.status(502).json({ success: false, status: r.status, error: message, raw: json });
    }

    // Try to extract a useful text response from common Cloudflare shapes
    let text = null;
    try {
      // newer Cloudflare shapes may include result -> output -> content
      text = json?.result?.[0]?.content?.[0]?.text || json?.result?.[0]?.output?.[0]?.content?.[0]?.text;
    } catch (e) {
      // ignore
    }
    // fallback to other common fields
    text = text || json?.text || json?.output?.[0]?.content?.[0]?.text || null;

    return res.status(200).json({ success: true, text, raw: json });
  } catch (err) {
    console.error('api/ai error:', err);
    return res.status(500).json({ success: false, error: String(err) });
  }
}
