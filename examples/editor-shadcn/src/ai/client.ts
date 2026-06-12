/**
 * Client AI: parla SOLO con il proxy locale (server/ai-proxy.mjs).
 * Nessun token nel frontend. In produzione VITE_AI_PROXY_URL punta al proxy della piattaforma.
 */

export const AI_PROXY_URL = (import.meta.env.VITE_AI_PROXY_URL as string | undefined) ?? 'http://localhost:8787';

export class AiUnavailableError extends Error {}

type TChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

type TChatOptions = {
  jsonResponse?: boolean;
  temperature?: number;
};

export async function aiChat(messages: TChatMessage[], options: TChatOptions = {}): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${AI_PROXY_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        temperature: options.temperature,
        ...(options.jsonResponse ? { response_format: { type: 'json_object' } } : {}),
      }),
    });
  } catch {
    throw new AiUnavailableError('AI proxy unreachable');
  }
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message ?? `AI error ${response.status}`);
  }
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('Empty AI response');
  }
  return content;
}

export async function checkAiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${AI_PROXY_URL}/ai/health`);
    const data = await res.json();
    return res.ok && data?.ok === true;
  } catch {
    return false;
  }
}
