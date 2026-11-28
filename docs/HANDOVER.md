# Handover for the next AI agent

Updated 2026-11-28. The owner is not an engineer: explain changes in plain words and say how to check them.

## Status (v2.2.1 & Tarot v0.9.4)
- **What's new:** `whats-new.patch` has been applied and merged. A `v2.2 What's new` button sits beside the ZJ logo in `room.html`, showing updates from v2.2.1 down to v1.0.
- **Tarot TTS Voice (v0.9.4):** Voice synthesis is fully working and verified. The Cloudflare Worker `tarotgemini-tts-proxy` (`backbackbacktrowtow`) mirrors Lumie's logic, uses voice `nplGtNEYtTnNcqR9`, and has an active Gradium service key (30-day window starting 28/11/2026). Client-side race timeouts, markdown syntax cleaning, and autoplay unlock fallbacks were resolved.
- **Human vibe coding & multi-agent learning:** Fixes were guided by human direction to use Lumie as the study model, working collaboratively across AI agent sessions.

## What changed in this update
- `room.html`: a `v2.2 What's new` button beside the ZJ logo (only `v2.2` on very narrow screens).
- `data/whats-new.js` (the text), `js/room/whats-new.js` (the window), styles at the end of `css/room.css`.
- `tarot/whats-new.js`: v0.9.4 live voice synthesis release note.
- `docs/voice.md`: comprehensive resolution and study case.
- `AGENTS.md`: big updates must be added to What's new.

## Test
Serve locally (`python -m http.server`), open `room.html?mode=room`:
- The button sits beside ZJ, with a dot until opened once.
- The window lists v2.2 down to v1.0; each older entry shows its screenshot.
- Close button, Escape and clicking outside all close it. Check desktop and a landscape phone.
- Gallery, radio and Lumie still work; no new console errors.

## For the owner to check
Dates and wording for v1.0 to v1.4 were estimated from the activity log and the screenshots in `version/`.

## Not done yet, in order
1. API keys (`docs/SECURITY-keys.md`). Owner has postponed it.
2. Split the room's JavaScript into `js/room/`, one part per commit (gallery, then radio, then chat), testing each.
   The key placeholder lines must stay in `room.html`, or `build.yml` must change in the same commit
   (it fails the deploy if a placeholder is missing).
3. Split `script.js` into `js/classic/` the same way, with the same rule for its placeholders.
4. Lumie's `search_site` tool checks `typeof BENTO_ITEMS`, but that variable is local to `initBento`,
   so gallery items are probably never searched. Using `window.GALLERY.items` there should fix it; test it.
5. Media size (`docs/gallery.md`). Later: host videos outside the repo.
6. `room.html` and `index.html` request `css/fa-subset.css`, which is not in the repo (already so before this update). Icons load from the
   CDN fallback after a 404. Either add the file or link the CDN directly.

## Decided against, for now
Moving `room-layers/`, `voice/`, `pet/`, `version/` into `assets/`: many paths to change for little benefit.
`post/` and `tarot/` stay where they are. The two READMEs inside `tarot/*-proxy/` stay beside their code
(changing anything in `gradium-tts-proxy/` triggers a Worker redeploy).
