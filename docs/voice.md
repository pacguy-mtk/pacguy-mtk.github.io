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
