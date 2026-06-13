/**
 * template-server.mjs — Backend REST per template con versioning
 *
 * Zero dipendenze esterne: solo moduli Node.js built-in.
 * Persistenza: file JSON su disco (templates-db.json nella stessa cartella).
 *
 * Endpoints:
 *   GET    /health
 *   GET    /templates
 *   POST   /templates                  body: {name, document}
 *   GET    /templates/:id
 *   PUT    /templates/:id              body: {name?, document?}
 *   DELETE /templates/:id
 *   POST   /templates/:id/duplicate    body: {suffix?}
 *   GET    /templates/:id/versions
 *   GET    /templates/:id/versions/:versionId
 *
 * Configurazione (file server/.env — stesso meccanismo del proxy AI):
 *   TEMPLATE_SERVER_PORT=8788
 *   ALLOWED_ORIGIN=http://localhost:5173
 *   DB_FILE=./server/templates-db.json    (path relativo dalla root del progetto)
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Configurazione ──────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

const PORT = parseInt(process.env.TEMPLATE_SERVER_PORT ?? '8788', 10);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173';
const DB_FILE = path.resolve(
  process.cwd(),
  process.env.DB_FILE ?? path.join(__dirname, 'templates-db.json'),
);
const MAX_VERSIONS = 50;

console.log(`[template-server] DB: ${DB_FILE}`);
console.log(`[template-server] CORS: ${ALLOWED_ORIGIN}`);

// ─── Database JSON ────────────────────────────────────────────────────────────

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    return { templates: [], versions: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch {
    return { templates: [], versions: [] };
  }
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uuid() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

function addVersion(db, template) {
  const forThis = db.versions.filter((v) => v.templateId === template.id);
  const nextNum = (forThis.at(-1)?.versionNumber ?? 0) + 1;
  const version = {
    versionId: uuid(),
    templateId: template.id,
    name: template.name,
    document: template.document,
    savedAt: now(),
    versionNumber: nextNum,
  };
  // FIFO: mantieni solo le ultime MAX_VERSIONS per questo template
  const kept = forThis.slice(-(MAX_VERSIONS - 1));
  db.versions = [...db.versions.filter((v) => v.templateId !== template.id), ...kept, version];
  return version;
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function noContent(res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end();
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf-8')));
      } catch {
        resolve({});
      }
    });
  });
}

// ─── Router ───────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const method = req.method ?? 'GET';
  const parts = url.pathname.replace(/^\//, '').split('/');

  // CORS preflight
  if (method === 'OPTIONS') {
    noContent(res);
    return;
  }

  // GET /health
  if (method === 'GET' && parts[0] === 'health') {
    json(res, 200, { status: 'ok', db: DB_FILE });
    return;
  }

  // /templates
  if (parts[0] !== 'templates') {
    json(res, 404, { error: 'Not found' });
    return;
  }

  const templateId = parts[1] ?? null;
  const sub = parts[2] ?? null; // 'versions' o 'duplicate'
  const versionId = parts[3] ?? null;

  // GET /templates
  if (!templateId && method === 'GET') {
    const db = readDb();
    json(res, 200, db.templates);
    return;
  }

  // POST /templates
  if (!templateId && method === 'POST') {
    const body = await readBody(req);
    if (!body.name || !body.document) {
      json(res, 400, { error: 'name e document sono obbligatori' });
      return;
    }
    const db = readDb();
    const t = { id: uuid(), name: body.name, document: body.document, createdAt: now(), updatedAt: now() };
    db.templates.push(t);
    writeDb(db);
    json(res, 201, t);
    return;
  }

  // POST /templates/:id/duplicate
  if (templateId && sub === 'duplicate' && method === 'POST') {
    const body = await readBody(req);
    const db = readDb();
    const source = db.templates.find((t) => t.id === templateId);
    if (!source) { json(res, 404, { error: 'Template non trovato' }); return; }
    const suffix = body.suffix ?? 'copia';
    const copy = { id: uuid(), name: `${source.name} ${suffix}`, document: source.document, createdAt: now(), updatedAt: now() };
    db.templates.push(copy);
    writeDb(db);
    json(res, 201, copy);
    return;
  }

  // GET /templates/:id/versions
  if (templateId && sub === 'versions' && !versionId && method === 'GET') {
    const db = readDb();
    const versions = db.versions
      .filter((v) => v.templateId === templateId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
    json(res, 200, versions);
    return;
  }

  // GET /templates/:id/versions/:versionId
  if (templateId && sub === 'versions' && versionId && method === 'GET') {
    const db = readDb();
    const v = db.versions.find((v) => v.templateId === templateId && v.versionId === versionId);
    if (!v) { json(res, 404, { error: 'Versione non trovata' }); return; }
    json(res, 200, v);
    return;
  }

  // GET /templates/:id
  if (templateId && !sub && method === 'GET') {
    const db = readDb();
    const t = db.templates.find((t) => t.id === templateId);
    if (!t) { json(res, 404, { error: 'Template non trovato' }); return; }
    json(res, 200, t);
    return;
  }

  // PUT /templates/:id
  if (templateId && !sub && method === 'PUT') {
    const body = await readBody(req);
    const db = readDb();
    const idx = db.templates.findIndex((t) => t.id === templateId);
    if (idx === -1) { json(res, 404, { error: 'Template non trovato' }); return; }
    const prev = db.templates[idx];
    // Snapshot prima di aggiornare (solo se il documento cambia)
    if (body.document) addVersion(db, prev);
    const updated = {
      ...prev,
      name: body.name ?? prev.name,
      document: body.document ?? prev.document,
      updatedAt: now(),
    };
    db.templates[idx] = updated;
    writeDb(db);
    json(res, 200, updated);
    return;
  }

  // DELETE /templates/:id
  if (templateId && !sub && method === 'DELETE') {
    const db = readDb();
    const before = db.templates.length;
    db.templates = db.templates.filter((t) => t.id !== templateId);
    db.versions = db.versions.filter((v) => v.templateId !== templateId);
    if (db.templates.length === before) { json(res, 404, { error: 'Template non trovato' }); return; }
    writeDb(db);
    noContent(res);
    return;
  }

  json(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`[template-server] in ascolto su http://localhost:${PORT}`);
  console.log(`[template-server] premi Ctrl+C per fermare`);
});
