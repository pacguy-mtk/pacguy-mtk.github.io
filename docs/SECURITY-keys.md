# WARNING: API keys can be read by visitors (open, not fixed)

Noted 2026-11-27. The owner will come back to this. **Never write a key value in this file or anywhere in the repo.**

## What happens
`.github/workflows/build.yml` replaces placeholders with the real GitHub Secrets inside files that are then published:
`script.js`, `room.html` (`GROQ_API_KEY`, `OPENROUTER_API_KEY`, `LUMIE_VAPI_KEY`) and `tarot/config.js`
(`TAROT_API_KEY_1`, `TAROT_API_KEY_2`). The browser downloads them, so anyone can read them.
GitHub Secrets only keeps them out of the repository. Blocking right-click or DevTools does not protect them.

## Until it is fixed
- Set spending or quota caps on every provider account, and check usage now and then.
- Do not use a key that can spend real money without a cap.
- If usage looks strange, revoke the key at the provider.

## The fix
1. A small server-side proxy (Cloudflare Worker) holds the keys. `tarot/owner-proxy/` and `tarot/gradium-tts-proxy/`
   are starting points. Limit allowed origin and rate.
2. Pages call the proxy; remove the key placeholders from the pages and from `build.yml`.
3. Create new keys and revoke the old ones.
