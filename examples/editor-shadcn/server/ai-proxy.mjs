/**
 * Proxy AI minimale (zero dipendenze).
 *
 * Il token resta SOLO qui, lato server: il frontend non lo vede mai.
 * Configurazione in server/.env (vedi server/.env.example). Avvio: npm run ai-proxy
 */
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const env = { ...process.env };
  try {
    const raw = readFileSync(join(__dirname, '.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (m && !(m[1] in process.env)) {
        env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    // nessun .env: si usano solo le variabili d'ambiente
  }
  return env;
}

const env = loadEnv();
const AI_BASE_URL = (env.AI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, '');
const AI_MODEL = env.AI_MODEL ?? 'gpt-4o-mini';
const AI_API_KEY = env.AI_API_KEY ?? '';
const PORT = Number(env.AI_PROXY_PORT ?? 8787);
const ALLOWED_ORIGIN = env.ALLOWED_ORIGIN ?? 'http://localhost:5173';

if (!AI_API_KEY) {
  console.warn('[ai-proxy] ATTENZIONE: AI_API_KEY non configurata (server/.env). Le richieste falliranno.');
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res, status, body) {
  cors(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    cors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/ai/health') {
    json(res, 200, { ok: true, model: AI_MODEL, configured: AI_API_KEY.length > 0 });
    return;
  }

  if (req.method === 'POST' && req.url === '/ai/chat') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        // whitelisting dei campi inoltrati: niente passthrough cieco
        const upstreamBody = {
          model: AI_MODEL,
          messages: payload.messages ?? [],
          temperature: typeof payload.temperature === 'number' ? payload.temperature : 0.4,
        };
        if (payload.response_format) {
          upstreamBody.response_format = payload.response_format;
        }
        const upstream = await fetch(`${AI_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AI_API_KEY}`,
          },
          body: JSON.stringify(upstreamBody),
        });
        const data = await upstream.json();
        json(res, upstream.status, data);
      } catch (err) {
        json(res, 502, { error: { message: `Upstream error: ${err?.message ?? 'unknown'}` } });
      }
    });
    return;
  }

  json(res, 404, { error: { message: 'Not found' } });
});

server.listen(PORT, () => {
  console.log(`[ai-proxy] in ascolto su http://localhost:${PORT} → ${AI_BASE_URL} (model: ${AI_MODEL})`);
});
