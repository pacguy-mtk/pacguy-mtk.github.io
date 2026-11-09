# House-Oracle proxy (optional, recommended before the site goes public)

Why: if your Gemini key sits in `config.js`, anyone can open "View source" and copy it,
and the 3/3 counter in the browser can be reset by clearing site data.
This Worker holds the key on the server and counts readings per visitor (IP) per day.

1. Make a free Cloudflare account, then install Wrangler: `npm i -g wrangler` and `wrangler login`.
2. In this folder create `wrangler.toml`:

       name = "tarot-oracle"
       main = "worker.js"
       compatibility_date = "2025-01-01"
       [[kv_namespaces]]
       binding = "QUOTA"
       id = "<paste id from the next command>"
       [vars]
       ALLOWED_ORIGIN = "https://your-site-address"   # use "*" only while testing
       DAILY_TOKENS = "3"
       RESET_OFFSET_HOURS = "8"

3. `wrangler kv namespace create QUOTA` (copy the id into wrangler.toml)
4. `wrangler secret put GEMINI_API_KEY` (paste your Google key)
5. `wrangler deploy` — it prints a URL like `https://tarot-oracle.<you>.workers.dev`
6. Put that URL in `config.js` as `OWNER_PROXY_URL` and leave `OWNER_API_KEY` empty.

Keep `DAILY_TOKENS` / `RESET_OFFSET_HOURS` equal to the values in `config.js`.
Also set a quota cap on your key in Google AI Studio / Cloud Console as a safety net.
