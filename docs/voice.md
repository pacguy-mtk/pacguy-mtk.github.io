# Lumie Push-to-Talk

`lumie-ptt.js` provides hold-to-talk input for both `room.html` and the classic chat (`index.html` + `script.js`). It is plain browser JavaScript and is loaded before the page code that mounts it.

## Pipeline

1. The first hold requests microphone permission. Later holds record with `MediaRecorder`; release submits. A short press, silence, Escape, hidden tab, pointer cancellation, or closing the chat cancels or skips submission. Recording is capped at 30 seconds.
2. The recording is sent to Groq Whisper (`whisper-large-v3`) using the existing injected Groq key. The module auto-detects language, filters known silence hallucinations, and estimates transcript confidence.
3. Non-English, uncertain, corrected, or context-dependent text goes through a short Groq chat normalization call. It translates to English and can use recent chat context. The normalizer does not answer the user.
4. Confident English text enters the existing Lumie chat. Uncertain text is placed in the input with Send/Edit controls. User bubbles retain the original transcript and show the English text when it differs.

The public API is `window.LumiePTT.mount({ button, statusEl, groqKey, getHistory, onResult, onNeedsConfirm, onState, onBeforeRecord })`; `cancel()` stops an active recording and aborts the current request. Pure helpers are exposed under `_test` for browser-console inspection.

## Tuning and constraints

- Keep `lumie-ptt.js` free of build placeholders and secrets. Both pages pass the already injected `GROQ_API_KEY` at runtime.
- Keep Whisper's glossary to proper-name spelling hints; avoid English instructions that bias multilingual transcription.
- `MAX_RECORD_MS`, `MIN_RECORD_MS`, `SILENCE_THRESHOLD`, `COOLDOWN_MS`, and `STAGE2_TIMEOUT_MS` tune the recording and request behavior near the top of the module.
- Stage 2 uses the previous four chat turns (trimmed) for pronoun and fragment cleanup. Keep transcripts and model output as untrusted text.
- Client-side rate limits reduce accidental use but cannot protect a browser-shipped key from deliberate reuse. A worker-side Groq proxy with origin checks and per-IP limits is a separate hardening phase.

## Regression checks

When changing PTT, preserve the room's scene, bubble, camera/zoom, and voice-toggle behavior. Keep room moods to the existing `thinking` and `idle` states for PTT status. Confirm ordinary typed chat still works when the mic is hidden or denied, and verify the exact build placeholders remain in both page scripts.

See `LUMIE_PUSH_TO_TALK_SPEC.md` supplied with the implementation request for the full behavior and manual/browser test plan.

## Tarot English Voice (v0.9.3 beta)

Tarot voice is separate from Lumie's push-to-talk and uses two playback sources:

- `tarot/assets/voices/welcome.ogg` is the Oracle's opening greeting and is attempted as soon as the Tarot game opens. Since browsers may block autoplay, the controller also retries on the first pointer or keyboard interaction.
- When **English - voice (beta)** is selected, only a successful AI reading (`source === 'ai'`) is sent to the Tarot TTS Worker. The overlay keeps the finished reading hidden until audio playback starts, then begins revealing the text three seconds later. If speech fails or takes more than 20 seconds to start, the text still appears. Non-English selections and basic/local fallbacks do not request speech. The **Read the Revelation Again** action reuses the audio cached in memory.
- Major Arcana cards (IDs 0–21) play their bundled name clip after the card flips, independent of the reading-language selection. This lets the first card speak before the question prompt opens. Minor Arcana have no voice clip.
- No separate "Listen to voice" button is used. The English selector controls only API-generated final-reading speech; the opening greeting and Major Arcana name clips are bundled audio and play independently.

### Major Arcana OGG files

The clips from `lumie_eon_ogg.zip` are stored as `tarot/assets/voices/major/<card-id>.ogg`. The numeric file name matches `id` in `tarot/tarot-data.js`:

| ID | Card | File |
|---:|---|---|
| 0 | The Fool | `0.ogg` |
| 1 | The Magician | `1.ogg` |
| 2 | The High Priestess | `2.ogg` |
| 3 | The Empress | `3.ogg` |
| 4 | The Emperor | `4.ogg` |
| 5 | The Hierophant | `5.ogg` |
| 6 | The Lovers | `6.ogg` |
| 7 | The Chariot | `7.ogg` |
| 8 | Strength | `8.ogg` |
| 9 | The Hermit | `9.ogg` |
| 10 | Wheel of Fortune | `10.ogg` |
| 11 | Justice | `11.ogg` |
| 12 | The Hanged Man | `12.ogg` |
| 13 | Death | `13.ogg` |
| 14 | Temperance | `14.ogg` |
| 15 | The Devil | `15.ogg` |
| 16 | The Tower | `16.ogg` |
| 17 | The Star | `17.ogg` |
| 18 | The Moon | `18.ogg` |
| 19 | The Sun | `19.ogg` |
| 20 | Judgement | `20.ogg` |
| 21 | The World | `21.ogg` |

To reduce clipped or delayed audio starts, the controller begins fetching and decoding a major-card clip before the flip, then plays its `AudioBuffer` through Web Audio with a short scheduled start. Final-reading WAV audio is cached as a Blob and played through an `HTMLAudioElement`, following the working Lumie playback path; it stays cached only in the current page session and is discarded on reset. See [the voice playback study case](voice.md) for the implementation comparison and audio audit.

### Tarot TTS Worker and Gradium API

- Cloudflare Worker: `tarotgemini-tts-proxy`
- Production endpoint: `https://tarotgemini-tts-proxy.backbackbacktrowtow.workers.dev/tts`
- Local source: `tarot/gradium-tts-proxy/worker.js`; Wrangler config: `tarot/gradium-tts-proxy/wrangler.toml`
- The Worker accepts `POST /tts` JSON `{"text":"..."}`, sends the text to Gradium's speech TTS endpoint, defaults the voice to `RrBVfXatVwccQ1SY` (or accepts custom `voice_id`), and returns WAV audio. It allows the published site origin and local HTTP origins, limits text to 2,000 characters, and applies a best-effort isolate-local per-IP request limit.
- Worker runtime secret: `TAROT_VAPI_KEY`. The deploy workflow supplies it from the GitHub Actions repository secret with the same name. Existing manual Worker setups using `GRADIUM_API_KEY` remain supported as a fallback. Never put either key in source files.
- The CORS check and in-memory limit reduce accidental/external use but are not strong authentication. Add a Cloudflare rate-limiting rule if stronger edge-enforced limits are needed.

### Connect Worker deployment to GitHub

The Pages workflow and Worker deployment are separate. `.github/workflows/build.yml` deploys GitHub Pages; `.github/workflows/deploy-tarot-tts-worker.yml` uses Cloudflare's Wrangler Action to deploy the Worker when `tarot/gradium-tts-proxy/**` changes on `main` (or when manually run from Actions). The worker folder includes `wrangler.toml`, so Wrangler deploys the right script and Worker name.

Before the GitHub Action can deploy, add these repository **Actions secrets** in GitHub Settings → Secrets and variables → Actions:

1. `CLOUDFLARE_ACCOUNT_ID` — the Cloudflare account ID that owns the Worker.
2. `CLOUDFLARE_API_TOKEN` — an API token scoped to that account with the **Edit Cloudflare Workers** permission.

Pushing a change to the Worker folder on `main` starts the deployment workflow. It requires GitHub Actions secrets `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, and `TAROT_VAPI_KEY`; if any are missing, it warns and skips Worker deployment rather than failing the site's separate Pages deploy. Wrangler uploads `TAROT_VAPI_KEY` as an encrypted Worker runtime secret. Existing manual Worker deployments may use the legacy `GRADIUM_API_KEY` binding as a fallback. The official setup is documented at [Cloudflare Workers GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/) and uses [Cloudflare's Wrangler Action](https://github.com/cloudflare/wrangler-action).

---

# Voice playback study case

## What was failing

Tarot's English reading text could be generated successfully by the Oracle, while the separate speech request failed with messages such as “audio file is empty” or “Unable to decode audio data.” The bundled Major Arcana OGG clips and Tarot sound effects are a separate path and were not the source of those API-reading failures.

The user asked the agent to inspect Lumie's already-working voice implementation before changing Tarot. The user then supplied the actual Cloudflare code for both Workers, which corrected the first diagnosis: both deployed Workers request WAV. The more important difference is **the response MIME type**. Lumie wraps returned bytes in a Blob explicitly labeled `audio/wav`; the supplied Tarot Worker forwards Gradium's `Content-Type` unchanged (using `audio/wav` only when that header is absent). Tarot's page branches on that header: it plays `audio/wav` through `HTMLAudioElement`, but treats every other content type as raw PCM. If Gradium labels its WAV bytes `application/octet-stream`, Tarot sends the complete RIFF/WAVE file to the PCM decoder. That can produce the decode/empty-audio failures even though the bytes are a WAV file. This is the key implementation difference identified by comparing the working version, as the user requested.

The earlier repository revision also requested PCM, but that does not describe the Cloudflare Tarot code the user pasted, which already requests WAV. The repository Worker now buffers the full response and always labels the bytes `audio/wav`.

The follow-up screenshot exposed a false positive in that validation: Tarot returned HTTP 502 with `empty_audio` because the hand-written RIFF chunk parser rejected Gradium's WAV layout. That error came from the Worker check, not proof that Gradium returned zero bytes. To stay close to Lumie's tolerant playback path, the Worker now rejects only a truly zero-byte body, then passes the buffered bytes through as `audio/wav`.

## The working reference: Lumie

The browser code in `room.html` and `script.js` follows the same simple sequence:

1. POST JSON containing the text and `output_format: 'wav'` to Lumie's Worker.
2. Read the successful response as an `ArrayBuffer`.
3. Wrap it in a `Blob` with MIME type `audio/wav`, create an object URL, and assign that URL to an `Audio` element. This explicitly marks the bytes as WAV regardless of the upstream response header.
4. Start playback with `audio.play()` and revoke the object URL when playback ends.

This lets the browser's normal media decoder handle the WAV container. The page does not try to reinterpret the response as PCM samples.

## Tarot changes

- The Tarot Worker requests WAV, buffers the full upstream body before the timeout is cleared, rejects only a zero-byte response, and always returns bytes as `audio/wav`. This prevents upstream MIME metadata from routing WAV bytes into the PCM decoder while avoiding a brittle WAV chunk parser.
- Tarot keeps the completed AI reading in memory and starts the speech request first. It waits for `audio.play()` to successfully start, then waits three seconds before beginning the typewriter reveal. If speech fails, the text still appears after a short three-second minimum; if speech takes over 20 seconds to start, the request is aborted and the text is shown rather than leaving the Oracle stuck.
- Only a successful AI reading (`source === 'ai'`) uses the speech Worker. A basic/local fallback does not consume a speech request. The reread action can reuse the cached audio.
- The local Major Arcana OGG clips, welcome OGG, and SFX remain on their existing Web Audio paths and do not depend on the English-reading setting.

## Audio asset audit

On 2026-11-26, all 26 checked audio files were fully decoded with PyAV/FFmpeg:

- 23 OGG voice clips: the welcome clip and all 22 Major Arcana clips (`0.ogg` through `21.ogg`).
- 3 MP3 sound effects: card flip, card place, and reveal.

All 26 had audio streams and decoded samples; no corrupt or zero-sample file was found. This verifies the files themselves decode, but it is not a substitute for listening on each target browser/device. A browser playback pass for the local page could not be completed in this environment because the local test server did not load in the available browser.

## Scope and remaining verification

The updated controller and Worker source are pushed to GitHub. GitHub Actions built the Pages site, but the Worker deployment workflow skipped its deploy step because this repository does not have Cloudflare deployment credentials; the user's Cloudflare dashboard code must be updated separately (as Lumie's was). Deploy the current `tarot/gradium-tts-proxy/worker.js` from the Cloudflare dashboard. A successful local asset decode does not prove the live Cloudflare secret, Gradium account, quota, or network path is configured correctly. Confirm one English AI reading on the published site: the audio should begin first, text should start about three seconds later, and card-flip/welcome sounds should remain available independently.

No API key or secret value belongs in this document or in source control.

## Current incident: live English-reading voice still fails

The user reports that successful AI readings sometimes show an empty-audio `HTTP 502`, fail to decode audio, or produce no voice. Screenshots establish that the text-reading API can succeed while voice playback fails separately. The browser should only invoke speech for a successful AI reading in English; Basic/local readings intentionally do not invoke speech.

### GitHub client logic restored to Lumie's WAV path

The Tarot client previously selected its decoder from the response `Content-Type`: `audio/wav` used an HTML audio element, while any other MIME type was treated as raw 48 kHz PCM. That is unsafe because the Tarot Worker may forward a generic MIME type even when Gradium returned WAV bytes. The client now always wraps a successful response as a Blob labeled `audio/wav` and plays it through `HTMLAudioElement`, matching Lumie's working client behavior. The checked-in Tarot Worker already requests WAV and labels its response `audio/wav`. This corrects the MIME/decoder mismatch; it cannot turn a truly empty upstream body into audio.

### Cloudflare inspection still required

The dashboard probes previously made from Quick Edit did not reach the speech upstream: a root GET was rejected with `origin_not_allowed`, and a root POST returned `not_found`; Tarot calls `/tts`. Separately, the user's reading screenshot reported `HTTP 502` with `empty_audio`, which indicates the Worker returned an error response after receiving an empty upstream body (or the deployed Worker has different code). That cannot be diagnosed from the GitHub source alone.

There is no Cloudflare MCP connection/tool available in the current Codex session, and plugin discovery returned no Cloudflare plugin. Do not describe the production Worker as verified. Once Cloudflare MCP is connected, inspect the active `tarotgemini-tts-proxy` deployment and its source, confirm only that the `GRADIUM_API_KEY` secret binding exists (never read or expose its value), and inspect request logs for a single successful AI reading: path, HTTP status, upstream status/request ID, response content type and byte count. Compare the deployed code with `tarot/gradium-tts-proxy/worker.js`; update and deploy only the Tarot Worker if they differ or logs show a specific defect. Then verify the browser receives non-empty WAV bytes and plays them. Keep Lumie's Worker untouched.

The repository's Worker deployment workflow requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` Actions secrets; the prior workflow skipped automatic Worker deployment when they were absent. This is separate from the encrypted runtime `GRADIUM_API_KEY` secret shown in Cloudflare. A GitHub Pages push updates the client, but does not by itself prove that Cloudflare is running the matching Worker source.

## Follow-up case: why the speech API was not called

During the Nov 26, 2026 troubleshooting session, the live Tarot page showed **Basic readings**. This is the local, no-AI mode. The controller correctly calls the speech Worker only when the narrator returns `source: 'ai'`; a local/basic reading has no LLM output to speak, so it must not call speech. The UI now states this in the reading note when English voice is selected but the result came from a basic/local path.

The Cloudflare dashboard's Quick Edit HTTP panel was also tested with POST, but its request log showed the request arriving at `/` and the Worker returned `not_found`. Earlier preview requests were GETs without the allowed site Origin and returned `origin_not_allowed`. Neither response indicates a Gradium/API-key failure: both were rejected before the upstream call. To exercise the speech path, use the published app with an actual successful AI reading, or send `POST https://tarotgemini-tts-proxy.backbackbacktrowtow.workers.dev/tts` with `Origin: https://pacguy-mtk.github.io`, `Content-Type: application/json`, and a JSON body such as `{"text":"A short voice test."}`. Do not use the dashboard's root Preview URL as an API health check.

The Cloudflare Worker settings showed an encrypted `GRADIUM_API_KEY` secret. This matches the checked-in Worker because it reads `TAROT_VAPI_KEY || GRADIUM_API_KEY`; no plaintext key or Cloudflare deployment token is needed in the website source. The Tarot Worker GitHub Actions workflow is separate from the Pages build and will skip deployment if the repository lacks its Cloudflare deployment secrets. Lumie's Worker and its configuration were left untouched.

---

## Resolution & Study Case: Learning from Lumie's Working Model (Nov 28, 2026)

### The Human Insight: "Copy Lumie Logic"
When Tarot's speech synthesis continued to fail across debugging iterations, the user provided the decisive breakthrough: **directing the AI to inspect and replicate Lumie's already-working Cloudflare Worker logic directly**.

As the user aptly observed:
> *"Is it me to tell you to learn from Lumie logic right? That is the study case: AI requires a study model for a better study, or it's just randomly drawing a card like how I as a human being birth."*

Without anchoring to a working reference implementation, AI agents independently generated speculative theories, adjusted parsers, or tested in isolation. Establishing Lumie's deployed, verified Worker as the ground truth "study model" immediately exposed the real discrepancies.

### Root Causes Discovered and Fixed
1. **Invalid Voice ID (`Wouc5gcfN4vTyYo2` → `nplGtNEYtTnNcqR9`):**
   Tarot was hardcoded to `Wouc5gcfN4vTyYo2`. Calling Gradium directly revealed `HTTP 400 {"detail":"Embeddings not found for Wouc5gcfN4vTyYo2"}` because that voice ID did not exist on the user's Gradium account. Lumie's verified voice `nplGtNEYtTnNcqR9` was substituted as the default, with support for custom `body.voice_id`.
2. **Cloudflare Worker Alignment & Secret Sync:**
   The active Gradium key (valid for a 30-day service window starting Nov 28, 2026) was synchronized into Cloudflare secrets `GRADIUM_API_KEY` and `TAROT_VAPI_KEY` on `tarotgemini-tts-proxy` (`backbackbacktrowtow`). The Worker also copied Lumie's resilient dual fallback: `env.TAROT_VAPI_KEY || env.GRADIUM_API_KEY || request.headers.get('x-api-key')`.
3. **Premature 20-Second Race Abort on Long Texts:**
   Full 3-card readings (700–1,000 characters) take ~15–22 seconds on Gradium. The client's `Promise.race` had a 20-second cutoff that aborted the in-flight fetch right before Gradium finished responding. The client now cleans raw markdown formatting, caps prompt length for quick ~8–12 second synthesis, extends the wait window to 35 seconds, and never aborts background downloads.
4. **Browser Autoplay Protection & Pre-Unlocking:**
   Because TTS requests resolve 15+ seconds after user clicks have stopped, browsers frequently blocked `new Audio().play()`. The frontend now pre-unlocks a shared `HTMLAudioElement` on card selection and interaction taps (Lumie's pattern) and adds a Web Audio `decodeAudioData` buffer fallback.
5. **Live Verification:**
   `https://tarotgemini-tts-proxy.backbackbacktrowtow.workers.dev/tts` tested live, returning `HTTP 200` with 460KB+ of valid RIFF/WAV audio. Fixes committed and deployed to `main`.

