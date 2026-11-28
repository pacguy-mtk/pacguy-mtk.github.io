const ALLOWED_ORIGINS = [
  'https://pacguy-mtk.github.io',
  'http://localhost',
  'http://127.0.0.1'
];

function corsHeaders(origin) {
  const allow = origin && ALLOWED_ORIGINS.some(o => origin === o || origin.startsWith(o + ':'))
    ? origin
    : 'https://pacguy-mtk.github.io';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: cors });
    }

    try {
      const body = await request.json();
      const text = typeof body?.text === 'string' ? body.text.trim().slice(0, 2000) : '';
      const voiceId = typeof body?.voice_id === 'string' && body.voice_id.trim()
        ? body.voice_id.trim()
        : 'RrBVfXatVwccQ1SY';

      if (!text) {
        return new Response(JSON.stringify({ error: 'Missing text' }), {
          status: 400,
          headers: { ...cors, 'Content-Type': 'application/json' }
        });
      }

      const apiKey = env.TAROT_VAPI_KEY || env.GRADIUM_API_KEY || request.headers.get('x-api-key') || '';
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'Missing API key' }), {
          status: 401,
          headers: { ...cors, 'Content-Type': 'application/json' }
        });
      }

      const upstream = await fetch('https://api.gradium.ai/api/speech/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          text,
          voice_id: voiceId,
          output_format: 'wav',
          only_audio: true
        })
      });

      if (!upstream.ok) {
        const errText = await upstream.text().catch(() => '');
        return new Response(errText || 'Upstream error', {
          status: upstream.status,
          headers: { ...cors, 'Content-Type': 'text/plain' }
        });
      }

      const audioBuf = await upstream.arrayBuffer();
      return new Response(audioBuf, {
        status: 200,
        headers: {
          ...cors,
          'Content-Type': upstream.headers.get('Content-Type') || 'audio/wav',
          'Cache-Control': 'no-store'
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err?.message || 'Proxy error' }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }
  }
};
