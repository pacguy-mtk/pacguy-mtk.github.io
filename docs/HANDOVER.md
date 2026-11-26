# Handover for the next AI agent

Written 2026-11-27. The owner is not an engineer: explain changes in plain words and say how to check them.

## Apply this update
The patch was made against `main` at commit `076ca57` ("gallery: fix room bento gallery").
1. `git checkout main && git pull`
2. `git checkout -b tidy-up`
3. `git apply --index --3way tidy-up.patch`
4. Gallery items added after `076ca57` conflict or end up in the old places. Move them into `data/gallery.js`
   (see `docs/gallery.md`), then run `python tools/make-thumbs.py`.
5. Test (below), commit. Ask the owner before merging into `main`, because that publishes the site.

## What the patch changes
- One gallery list: `data/gallery.js` feeds `index.html`, `script.js` and `room.html`.
- Room styles moved from `room.html` to `css/room.css`.
- Notes gathered in `docs/`; `AGENTS.md` is now a short index.
- Key warning: `docs/SECURITY-keys.md`.

## Test
Serve locally (`python -m http.server`) and check:
- `index.html?mode=classic`: gallery shows, filters and lightbox work.
- `room.html?mode=room`: room looks the same, gallery panel and thumbnails work, radio plays and lists all OSTs.
- No errors in the browser console. After publishing, hard-refresh once.

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
