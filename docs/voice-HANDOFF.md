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
- When **English - voice (beta)** is selected, the final Tarot reading is sent to the Tarot TTS Worker and spoken automatically after the full reading text appears. Non-English selections do not request English speech. The **Read the Revelation Again** action reuses the decoded reading audio in memory.
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

To reduce clipped or delayed audio starts, the controller begins fetching and decoding a major-card clip before the flip, then plays its `AudioBuffer` through Web Audio with a short scheduled start. The final WAV response is also decoded and played through Web Audio instead of an HTML media element. Decoded final-reading audio stays cached only in the current page session and is discarded on reset.

### Tarot TTS Worker and Gradium API

- Cloudflare Worker: `tarotgemini-tts-proxy`
- Production endpoint: `https://tarotgemini-tts-proxy.backbackbacktrowtow.workers.dev/tts`
- Local source: `tarot/gradium-tts-proxy/worker.js`; Wrangler config: `tarot/gradium-tts-proxy/wrangler.toml`
- The Worker accepts `POST` JSON `{"text":"..."}`, sends the reading to Gradium's speech TTS endpoint, fixes the voice to `Wouc5gcfN4vTyYo2`, and returns WAV audio. It allows the published site origin and local HTTP origins, limits text to 4,000 characters, and has a best-effort isolate-local per-IP request limit.
- Cloudflare production secret: `GRADIUM_API_KEY`, set under the Worker **Settings → Variables and Secrets** as a Secret. Do not copy this key into source files or GitHub Actions.
- The CORS check and in-memory limit reduce accidental/external use but are not strong authentication. Add a Cloudflare rate-limiting rule if stronger edge-enforced limits are needed.

### Connect Worker deployment to GitHub

The Pages workflow and Worker deployment are separate. `.github/workflows/build.yml` deploys GitHub Pages; `.github/workflows/deploy-tarot-tts-worker.yml` uses Cloudflare's Wrangler Action to deploy the Worker when `tarot/gradium-tts-proxy/**` changes on `main` (or when manually run from Actions). The worker folder includes `wrangler.toml`, so Wrangler deploys the right script and Worker name.

Before the GitHub Action can deploy, add these repository **Actions secrets** in GitHub Settings → Secrets and variables → Actions:

1. `CLOUDFLARE_ACCOUNT_ID` — the Cloudflare account ID that owns the Worker.
2. `CLOUDFLARE_API_TOKEN` — an API token scoped to that account with the **Edit Cloudflare Workers** permission.

Pushing a change to the Worker folder on `main` starts the deployment workflow. If either Cloudflare deployment secret is missing, the workflow warns and skips the Worker deploy rather than failing the site's separate Pages deploy. After both secrets exist, Worker-folder pushes deploy it automatically. The existing `GRADIUM_API_KEY` remains a runtime Secret on the Cloudflare Worker; it is not a GitHub secret and is not sent to the deployment workflow. The official setup is documented at [Cloudflare Workers GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/) and uses [Cloudflare's Wrangler Action](https://github.com/cloudflare/wrangler-action).
