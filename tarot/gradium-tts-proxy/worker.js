const ALLOWED_ORIGINS = new Set([
  'https://pacguy-mtk.github.io',
  'http://localhost',
  'http://127.0.0.1'
]);

const VOICE_ID = 'Wouc5gcfN4vTyYo2';
const MAX_TEXT_CHARS = 4000;
const MAX_REQUESTS_PER_MINUTE = 5;
const RATE_WINDOW_MS = 60_000;
const recentRequests = new Map();

function allowedOrigin(origin) {
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const url = new URL(origin);
    return url.protocol === 'http:' &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1');
  } catch {
    return false;
  }
}

function corsHeaders(origin) {
  return {
    ...(allowedOrigin(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function json(status, body, cors) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}

function isRateLimited(ip) {
  const now = Date.now();
  const previous = recentRequests.get(ip) || [];
  const recent = previous.filter(time => now - time < RATE_WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_MINUTE) {
    recentRequests.set(ip, recent);
    return true;
  }
  recent.push(now);
  recentRequests.set(ip, recent);
  // Prevent this isolate-local map from growing indefinitely.
  if (recentRequests.size > 1000) {
    for (const [key, times] of recentRequests) {
      if (!times.some(time => now - time < RATE_WINDOW_MS)) recentRequests.delete(key);
    }
  }
  return false;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);
    const url = new URL(request.url);

    if (!allowedOrigin(origin)) return json(403, { error: 'origin_not_allowed' }, cors);
    if (url.pathname !== '/tts') return json(404, { error: 'not_found' }, cors);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' }, cors);
    if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
      return json(415, { error: 'content_type_must_be_json' }, cors);
    }
    if (Number(request.headers.get('Content-Length') || 0) > 16_384) {
      return json(413, { error: 'request_too_large' }, cors);
    }
    const apiKey = env.TAROT_VAPI_KEY || env.GRADIUM_API_KEY;
    if (!apiKey) return json(503, { error: 'tts_not_configured' }, cors);

    let body;
    try {
      body = await request.json();
    } catch {
      return json(400, { error: 'invalid_json' }, cors);
    }

    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    if (!text) return json(400, { error: 'missing_text' }, cors);
    if (text.length > MAX_TEXT_CHARS) return json(413, { error: 'text_too_long' }, cors);

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (isRateLimited(ip)) {
      return json(429, { error: 'rate_limited' }, {
        ...cors,
        'Retry-After': '60'
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);
    let upstream;
    try {
      upstream = await fetch('https://api.gradium.ai/api/speech/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          text,
          voice_id: VOICE_ID,
          output_format: 'wav',
          only_audio: true
        }),
        signal: controller.signal
      });
    } catch (error) {
      const timedOut = error?.name === 'AbortError';
      return json(timedOut ? 504 : 502, {
        error: timedOut ? 'tts_timeout' : 'tts_unavailable'
      }, cors);
    } finally {
      clearTimeout(timeout);
    }

    if (!upstream.ok) {
      console.error('[Tarot TTS] Gradium returned HTTP', upstream.status);
      return json(502, { error: 'tts_upstream_error', upstream_status: upstream.status }, cors);
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...cors,
        'Content-Type': upstream.headers.get('Content-Type') || 'audio/wav',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }
};
