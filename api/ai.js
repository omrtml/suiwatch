// Vercel Serverless function: proxies AI requests to OpenAI using server-side env var
// Set OPENAI_KEY in your Vercel project settings (Environment Variables).

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

  const OPENAI_KEY = process.env.OPENAI_KEY;
  if (!OPENAI_KEY) {
    return res.status(500).json({ error: 'OPENAI_KEY not configured on server' });
  }

  try {
    const { prompt, model = 'gpt-4o-mini', max_tokens = 400, temperature = 0.6 } = req.body || {};
    const finalPrompt = prompt || 'Give short actionable portfolio advice for a crypto investor.';

    const payload = {
      model,
      messages: [{ role: 'user', content: finalPrompt }],
      max_tokens,
      temperature,
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await r.json();
    const text = json?.choices?.[0]?.message?.content || json?.choices?.[0]?.text || null;

    return res.status(200).json({ success: true, text, raw: json });
  } catch (err) {
    console.error('api/ai error:', err);
    return res.status(500).json({ success: false, error: String(err) });
  }
}
