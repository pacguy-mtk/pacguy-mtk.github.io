# ZiJun Hub: start here

Static site on GitHub Pages. **Pushing to `main` publishes it.**

| Task | Read |
|------|------|
| Current status and next tasks | `docs/HANDOVER.md` |
| Add or change gallery items and OST | `docs/gallery.md` |
| Page layout, secrets, modes | `docs/site.md` |
| 3D room | `docs/room.md` |
| Tarot | `docs/tarot.md` |
| Lumie & Tarot voice / TTS API expiry | `docs/voice.md` |
| **Open security warning** | `docs/SECURITY-keys.md` |
| Ideas, history | `docs/ideas.md`, `docs/history.md` |

Rules: never commit a real API key. Do not clone or touch `post/` unless adding media (it is large).
Keep new notes in `docs/`.

## What's new (required for big updates)
Before pushing a **big update**, add it to `data/whats-new.js` in the same commit.
- **Big:** something visitors will notice as new or changed: a new feature or game (like Tarot), a redesign, a new page
  or mode, a major change to how something works.
- **Not big:** adding images, videos or OST tracks, small bug fixes, tidying, compression, docs.
- Unsure? Ask the owner.
- **Same version or new one?** Ask the owner. Until told otherwise, add a line to the current entry and update its
  end date. A new version goes at the TOP of the list.
- Write short, plain words. No technical or provider names (say "API", not the company's API).
- For a new version, also add the previous version's screenshot as `version/vX.Y.webp` (ask the owner for it), set
  `image` on that entry, and update the version cards in the footer of `index.html`.


## Working unattended
- Pull the latest `main` first. Work on a new branch, never directly on `main`.
- Do one task at a time. Don't start "Not done yet" items unless asked.
- Merge or push to `main` only when the owner says so. Exception: adding gallery/OST media, after the checks pass.
- Checks before any push: run `python -m http.server`, open `room.html?mode=room` and `index.html?mode=classic`,
  and confirm no new console errors and that what you changed works. Run `node --check` on edited `.js` files.
- Never without asking: delete media, force-push or rewrite history, change `.github/`, secrets or Worker settings,
  or add a paid service.
- If you need the owner and they are away: leave the work on its branch, write the question in
  `docs/HANDOVER.md`, and stop. Don't guess.
- If something fails twice, stop and report. Don't say it works unless you tested it.
- Finish by updating `docs/HANDOVER.md`: what changed, how it was tested, what is left.
