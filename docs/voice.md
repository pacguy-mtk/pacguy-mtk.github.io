# Voice playback study case

## What was failing

Tarot's English reading text could be generated successfully by the Oracle, while the separate speech request failed with messages such as “audio file is empty” or “Unable to decode audio data.” The bundled Major Arcana OGG clips and Tarot sound effects are a separate path and were not the source of those API-reading failures.

The user asked the agent to inspect Lumie's already-working voice implementation before changing Tarot. That comparison exposed the important difference: **Lumie asks its speech Worker for WAV and lets the browser's `HTMLAudioElement` play it; Tarot's Worker had been asking for raw PCM and its page had to interpret and decode those bytes itself.** The frontend had recently gained a WAV/HTML-audio path, but the deployed Tarot Worker still returned PCM. This format mismatch left two playback protocols in the Tarot flow and made failures harder to identify.

## The working reference: Lumie

The browser code in `room.html` and `script.js` follows the same simple sequence:

1. POST JSON containing the text and `output_format: 'wav'` to Lumie's Worker.
2. Read the successful response as an `ArrayBuffer`.
3. Wrap it in a `Blob` with MIME type `audio/wav`, create an object URL, and assign that URL to an `Audio` element.
4. Start playback with `audio.play()` and revoke the object URL when playback ends.

This lets the browser's normal media decoder handle the WAV container. The page does not try to reinterpret the response as PCM samples.

## Tarot changes

- The Tarot Worker now requests WAV, checks that the response has a RIFF/WAVE header and audio payload, and returns it as `audio/wav`. Invalid or empty responses become a clear upstream error instead of a successful empty audio response.
- Tarot keeps the completed AI reading in memory and starts the speech request first. It waits for `audio.play()` to successfully start, then waits three seconds before beginning the typewriter reveal. If speech fails, the text still appears after a short three-second minimum; if speech takes over 20 seconds to start, the request is aborted and the text is shown rather than leaving the Oracle stuck.
- Only a successful AI reading (`source === 'ai'`) uses the speech Worker. A basic/local fallback does not consume a speech request. The reread action can reuse the cached audio.
- The local Major Arcana OGG clips, welcome OGG, and SFX remain on their existing Web Audio paths and do not depend on the English-reading setting.

## Audio asset audit

On 2026-11-26, all 26 checked audio files were fully decoded with PyAV/FFmpeg:

- 23 OGG voice clips: the welcome clip and all 22 Major Arcana clips (`0.ogg` through `21.ogg`).
- 3 MP3 sound effects: card flip, card place, and reveal.

All 26 had audio streams and decoded samples; no corrupt or zero-sample file was found. This verifies the files themselves decode, but it is not a substitute for listening on each target browser/device. A browser playback pass for the local page could not be completed in this environment because the local test server did not load in the available browser.

## Scope and remaining verification

The Tarot worker deployment must receive this repository's Worker change through its GitHub Actions deployment workflow, and the Pages site must receive the updated controller. A successful local asset decode does not prove the live Cloudflare secret, Gradium account, quota, or network path is configured correctly. Confirm one English AI reading on the published site: the audio should begin first, text should start about three seconds later, and card-flip/welcome sounds should remain available independently.

No API key or secret value belongs in this document or in source control.
