# HANDOFF: ZiJun Hub v3.0 deploy and follow-up

For the AI agent that applies this package to https://github.com/pacguy-mtk/pacguy-mtk.github.io (branch `main`).
The renovation is **already built and browser-tested** (desktop 1440 and mobile 390). Your job is to apply it, verify it live, and do the follow-ups in section 4.

## 1. What is in the zip

| Path | Action | Notes |
|---|---|---|
| `index.html` | replace | New order: 01 Hub (ask bar), 02 Tarot, 03 Gallery, 04 Systems+Contact, footer |
| `style.css` | replace | Old CSS kept; v3 styles appended at the end under `v3.0 ASK BAR / TAROT / SYSTEMS RACK` |
| `script.js` | replace | Keeps `__GROQ_API_KEY__` / `__OPENROUTER_API_KEY__` placeholders so `build.yml` still works |
| `tarot/` | add (new folder) | Tarot Divination v0.5, self-contained, loaded as a lazy iframe |
| `docs/` | add | This file + `tarot-HANDOFF.md` (original tarot dev handoff) |
| `AGENTS.md`, `README.md` | replace | Updated for v3 layout |

The zip deliberately does **not** contain `post/`, `pet/`, `version/`, `.github/`, `.gitignore`. Those stay as they are in the repo.

## 2. How to apply (do NOT clone the whole repo: `post/` is about 807 MB)

```bash
git clone --depth 1 --filter=blob:none --no-checkout https://github.com/pacguy-mtk/pacguy-mtk.github.io hub
cd hub
git sparse-checkout init --no-cone
git sparse-checkout set '/*' '!/post/'
git checkout main
# overlay the zip contents on top (never delete or rename anything in post/)
unzip -o ../hub-v3.zip -d .
git add -A
git status          # expect: modified index.html style.css script.js AGENTS.md README.md; new tarot/ docs/
git commit -m "v3.0: ask bar, tarot, systems rack"
git push
```
GitHub Pages deploys through `.github/workflows/build.yml` (it injects the API keys into `script.js`). Watch the Actions run go green. The workflow fails by design if the `GROQ_API_KEY` / `OPENROUTER_API_KEY` secrets are empty.

## 3. Verify on the live site (https://pacguy-mtk.github.io/)

1. Hard refresh. No console errors other than any pre-existing ones listed in 5.
2. 01: the greyed text types and erases in a loop; it hides when you click in the box. Type "show me tarot" + Enter: result buttons appear under the bar and Lumie's chat opens with a reply.
3. 02: DevTools Network shows **no** `/tarot/` requests on first load; clicking "Draw your cards" loads the iframe. Fullscreen / New tab / Close work.
4. 03: gallery filters, lightbox and video thumbnails unchanged.
5. 04: four server units; clicking one slides its drawer open (one at a time); contact column beside it; stacked on phones.
6. Icons are visible (Font Awesome). `index.html` loads `css/fa-subset.css` and, if that file 404s, automatically falls back to the cdnjs Font Awesome. If icons are still missing, check this first.
7. Footer shows v3.0 "Online" and v2.0 "Archive".

## 4. Follow-ups (in priority order)

1. **Exposed keys (security)**: `build.yml` writes the Groq and OpenRouter keys into the public `script.js`. Tell the owner to rotate both keys. Proper fix: a Cloudflare Worker proxy (copy the pattern of `tarot/owner-proxy/worker.js`: key stored as a Worker secret, per-IP daily limit, CORS limited to `https://pacguy-mtk.github.io`), then point `sendChatMessage()` at the Worker and remove the `sed` steps and key constants. This needs the owner's Cloudflare login. Ask first; do not change the workflow without agreement.
2. **Tarot house Oracle**: `tarot/config.js` has `OWNER_PROXY_URL: ''` and `OWNER_API_KEY: ''` (correct for a public repo). Until the owner deploys `tarot/owner-proxy/` (steps in its README) the "Skip: use the house Oracle" button cannot work; visitors can still paste their own Google Gemini key. Never put a real key in `config.js`.
3. **Tarot v0.9**: when ready, replace the contents of `tarot/` with the new build (keep `tarot/index.html` as the entry). Nothing in the hub depends on tarot internals. Optionally update the "v0.5 beta" text in `index.html` (`.tarot-note`).
4. **Version history**: add `version/v3.0.png` (screenshot) and `version/v2.0.png`, then make those cards clickable like v1.x (`class="ver-card clickable" data-src="version/v2.0.png"` plus an `<img>` preview, copy the v1.4 markup).
5. **Drawer content**: AI Tools and Calculator drawers each have a single link. Add more by editing the `SYSTEMS` array at the top of `script.js` (each entry: `links: [{label, icon, url}]`). The rack and Lumie's tools both read it.
6. **Dead CSS/JS cleanup (optional)**: the old `.page-card*`, `.page-menu`, `.page-dropdown*`, `.system-map`, `.contact-shell`, `.contact-title` rules in `style.css` are no longer used. Remove them in a separate commit after visual confirmation.

## 5. Known / pre-existing items (not caused by v3)

- `script.js` calls `api.github.com/repos/.../contents/images/gallery` somewhere in the gallery code (CORS-blocked when run from localhost). It was there before v3. Gallery still renders from `BENTO_ITEMS`.
- When running locally, the chat key check passes on the unreplaced placeholders, so Lumie shows the "connection is flickering" fallback. On the deployed site the real keys are injected.
- The Lumie chat panel can overlap the hero on wide screens because it anchors to the pet. Unchanged.
- Tarot: Minor Arcana (ids 22-77) are in `tarot-data.js` but only `assets/0-21.png` exist, and they are placeholders. `assets/icon-tarot.png` is referenced but missing (a fallback emoji is shown).

## 6. Where things are in the code

- Ask bar: end of `script.js`, `initHubAsk()`; prompts in `PROMPTS`. Chat entry point `sendChatMessage(text)`.
- Tarot launcher: `initTarot()`; iframe markup in `#tarot` of `index.html`.
- Rack: `SYSTEMS` array + `initRack()` near the top of `script.js`; styles `.rack`, `.srv*` in `style.css`.
- Lumie: `SYSTEM_PROMPT`, `NAV_CARDS` (now includes `tarot`, `systems`), `TOOL_DEFS` (new `search_site`), `runTool()`, `extractCards()`.
- Scroll-nav sections: `initScrollNav()` (hub, tarot, gallery, contact).
