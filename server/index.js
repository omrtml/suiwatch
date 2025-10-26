// Minimal server-side proxy for OpenAI requests.
// Usage: set OPENAI_KEY in the environment (do NOT check this into git) and run:
//   node server/index.js
// The server listens on port 5174 and exposes POST /api/ai

const http = require('http');
const { URL } = require('url');

const PORT = process.env.PORT || 5174;
const OPENAI_KEY = process.env.OPENAI_KEY;

if (!OPENAI_KEY) {
  console.warn('Warning: OPENAI_KEY env var is not set. Requests will fail with 401.');
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); } catch (err) { reject(err); }
    });
    req.on('error', reject);
  });
}

async function proxyOpenAI(payload) {
  // Forward to OpenAI Chat Completions endpoint
  const url = 'https://api.openai.com/v1/chat/completions';

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await resp.json();
  return json;
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`);

  // Basic CORS for local dev; tighten for production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (u.pathname === '/api/ai' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);

      // Accept a simple shape from the client and create a Chat request.
      const prompt = body.prompt || 'Give short actionable portfolio advice for a crypto investor.';
      const model = body.model || 'gpt-4o-mini';
      const max_tokens = body.max_tokens || 400;

      const payload = {
        model,
        messages: [ { role: 'user', content: prompt } ],
        max_tokens,
        temperature: body.temperature ?? 0.6,
      };

      const openaiResp = await proxyOpenAI(payload);

      // Try to extract assistant text
      const text = openaiResp?.choices?.[0]?.message?.content || openaiResp?.choices?.[0]?.text || null;

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, text, raw: openaiResp }));
    } catch (err) {
      console.error('Error in /api/ai:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: String(err) }));
    }

    return;
  }

  // Fallback
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`AI proxy server listening on http://localhost:${PORT}`);
});
