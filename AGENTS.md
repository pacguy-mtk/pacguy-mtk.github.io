# ZiJun Hub: start here

Static site on GitHub Pages. **Pushing to `main` publishes it.**

| Task | Read |
|------|------|
| Continue the tidy-up | `docs/HANDOVER.md` |
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
