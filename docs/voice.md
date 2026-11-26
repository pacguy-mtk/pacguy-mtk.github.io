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
