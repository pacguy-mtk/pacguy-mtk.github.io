# Tarot Gradium TTS Worker

This Worker converts the Tarot Oracle's finished reading text to WAV audio with Gradium. It is separate from the Gemini reading request and from Lumie's voice worker.

## Cloudflare setup

- Worker name: `tarotgemini-tts-proxy`
- Entry file: `worker.js`
- Runtime secret: `TAROT_VAPI_KEY` (the GitHub Actions deploy workflow copies the repository Actions secret of the same name into the Worker; never put the key in this file or Git). Existing manual deployments may continue using `GRADIUM_API_KEY` as a fallback.
- No Gemini API key is needed here.
- The voice ID is fixed to `Wouc5gcfN4vTyYo2` in `worker.js`.
- Endpoint: `https://tarotgemini-tts-proxy.backbackbacktrowtow.workers.dev/tts`

The Tarot game also plays a bundled opening greeting (`assets/voices/welcome.ogg`), with a first-interaction retry for browsers that block autoplay. When **English - voice (beta)** is selected, only a successful AI reading is sent to this Worker. The text remains hidden until the WAV begins playing, then starts its typewriter reveal three seconds later. If speech fails or takes more than 20 seconds to start, the text still appears. Non-English and basic/local readings do not request speech. The WAV is cached for the in-page "Read the Revelation Again" action. Major Arcana name clips are bundled locally as OGG assets and do not use this Worker. The Worker allows browser requests from `https://pacguy-mtk.github.io` and local HTTP development origins, caps input at 4,000 characters, applies a best-effort isolate-local limit of five requests per minute per IP, waits up to 120 seconds for Gradium, and forwards the Gradium API key only from the Worker secret.

## Request

```http
POST /tts
Content-Type: application/json

{"text":"The Oracle's completed reading..."}
```

Success returns the buffered Gradium audio bytes with `Content-Type: audio/wav`; only a zero-byte body is rejected. The Tarot frontend plays its Blob through an `HTMLAudioElement`, matching Lumie's working path. Raw PCM is no longer the expected Worker response.

The CORS origin check and in-memory rate limit are abuse-reduction measures, not strong authentication. For stricter production limits, add a Cloudflare rate-limiting rule for this Worker route.
