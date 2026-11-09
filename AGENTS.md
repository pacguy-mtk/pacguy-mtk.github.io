---
name: gallery-update
description: >
  Update the bento gallery on ZiJun Hub. Add, remove, or reorder items in the
  BENTO_ITEMS array in script.js. All content lives in the post/ folder.
  Deploy via git push to GitHub Pages.
---

# Gallery Update Agent

## Role
Maintain the bento gallery on https://pacguy-mtk.github.io/

## Architecture
- **Gallery data**: `BENTO_ITEMS` array in `script.js` (search for `var BENTO_ITEMS`)
- **Media files**: `post/` folder (images + videos)
- **Deploy**: `git push` to `main` branch → GitHub Pages auto-deploys

## Item Structure
```javascript
{
  title: 'Item Title',
  context: 'Short description',
  src: 'post/filename.jpg',     // or .mp4 for videos
  type: 'image',                 // or 'video'
  category: 'ai-generated',     // ai-generated | mockups | open-source
  date: '2026-09'               // YYYY-MM for sorting
}
```

## Categories
- `mockups` - Website mockups, brand designs, flyers
- `open-source` - Tools, extensions, project breakdowns
- Image / Video chips are automatic from `type: 'image' | 'video'`. No `ai-generated` category any more (leave existing values in data; they show under All/Image/Video).

## Rules
1. Items sorted by `date` descending (newest first)
2. All media files must exist in `post/` folder
3. Use relative paths: `post/filename.ext`
4. Videos auto-generate first-frame thumbnails
5. Max 3 columns desktop, 2 mobile (CSS handled)

## Workflow
1. Read current `BENTO_ITEMS` in `script.js`
2. Add/edit/remove items as requested
3. Verify media files exist in `post/`
4. Git commit + push to deploy

## Commands
```bash
# Check current items
grep -A 2 "title:" script.js | head -60

# List post/ files
ls post/

# Deploy changes
git add -A && git commit -m "gallery: update items" && git push
```


## Layout v3.0 (sections)
Order in `index.html`: `#hub` (ask bar) -> `#tarot` -> `#gallery` -> `#contact` (Systems rack + Contact) -> footer.
- **Ask bar**: `initHubAsk()` at the end of `script.js`. Typing ghost prompts live in the `PROMPTS` array. Submits go to Lumie via `sendChatMessage(text)`.
- **Tarot**: lives in `tarot/` and is embedded as a lazy iframe (`initTarot()`); it only loads after the user clicks "Draw your cards". To upgrade the tarot, replace the contents of `tarot/` (keep `tarot/index.html` as the entry). Never paste tarot HTML/JS into the hub files.
- **Systems rack**: edit the `SYSTEMS` array near the top of `script.js` to add/rename drawer options. Lumie's `get_projects` / `search_site` tools read the same array.
- **Gallery rules above are unchanged.**
- Do not touch or clone `post/` unless adding media (it is ~800 MB). Code-only clone: `git clone --depth 1 --filter=blob:none --no-checkout <repo>; git sparse-checkout set '/*' '!/post/'; git checkout main`.


## v2.1 notes
- **Secrets** (GitHub repo > Settings > Secrets and variables > Actions): `GROQ_API_KEY`, `OPENROUTER_API_KEY` (Lumie, injected into `script.js`) and `TAROT_API_KEY_1`, `TAROT_API_KEY_2` (tarot house Oracle, injected into `tarot/config.js`, tried in order). Placeholders in the files: `__GROQ_API_KEY__`, `__OPENROUTER_API_KEY__`, `__TAROT_API_KEY_1__`, `__TAROT_API_KEY_2__`. Never commit a real key. Pages must be deployed with **Source: GitHub Actions**.
- **Credits:** the hero chips and short keyword questions never call the AI. Only longer free-text questions, the welcome popup "Ask AI" row and the chat panel do.
- **Tarot debug menu** is hidden for visitors (kept in `tarot/debug-menu.js`). Show it on your own browser with `localStorage.tarot_debug='1'` in the tarot page console, or on localhost.
- **Version history:** v2.1 online (text card), v2.0 screenshot at `version/v2.0.png`. For the next version add `version/vX.Y.png` and a clickable `.ver-card`.
