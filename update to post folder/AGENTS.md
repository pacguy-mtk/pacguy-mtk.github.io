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
- **Gallery data**: `BENTO_ITEMS` array in `script.js` (line ~1492 / ~1781)
- **Room 3D data**: `DATA` object in `room.html` (line ~482)
  - `DATA.items`: mirror of gallery items for 3D room PC view
  - `DATA.ost`: playlist of OST radio tracks (`post/<filename>.webm`)
- **Media files**: `post/` folder (images + videos)
- **Deploy**: `git push` to `main` branch → GitHub Pages auto-deploys

## Item Structure
```javascript
{
  title: 'Item Title',
  context: 'Short description',
  src: 'post/filename.jpg',     // or .mp4 for videos
  type: 'image',                 // or 'video'
  category: 'ai-generated',     // ai-generated | mockups | case-study
  date: '2026-09'               // YYYY-MM for sorting
}
```

## Categories
- `ai-generated` - AI art, ComfyUI, video generation
- `mockups` - Website mockups, brand designs, flyers
- `case-study` - Tools, extensions, project breakdowns

## Rules
1. Items sorted by `date` descending (newest first)
2. All media files must exist in `post/` folder
3. Use relative paths: `post/filename.ext`
4. Videos auto-generate first-frame thumbnails (classic site). `room.html` uses `post/thumbs/`: after adding media to its `DATA.items`, run `python tools/make-thumbs.py` (needs ffmpeg) and commit `post/thumbs/` with `room.html`
5. Max 3 columns desktop, 2 mobile (CSS handled)
6. **OST Requirement**: If the user mentions that an item is an OST (or if updating an OST track):
   - In `room.html`: prepend the item to `DATA.items`
   - In `room.html`: append its media path (`post/<filename>.webm`) to `DATA.ost`

## Workflow
1. **Auto-detect new files**: Check "update to post folder" for files WITHOUT `(p)_` prefix
2. Read current `BENTO_ITEMS` in `script.js`
3. Add/edit/remove items as requested in `script.js`
4. **Update Room OST (if applicable)**: If the item is an OST (or user specifies it as an OST):
   - Prepend to `DATA.items` in `room.html`
   - Append to `DATA.ost` in `room.html` (becomes OST N)
5. Verify media files exist in `post/`
6. Git commit + push to deploy
7. Rename processed files with `(p)_` prefix

## Auto-Detect Command
```powershell
# Find files without (p)_ prefix
Get-ChildItem "update to post folder" -File | Where-Object { $_.Name -notmatch '^\(p\)_' } | Select-Object Name
```

## Commands
```bash
# Check current items
grep -A 2 "title:" script.js | head -60

# List post/ files
ls post/

# Deploy changes
git add -A && git commit -m "gallery: update items" && git push
```

## Session Log
### 2026-09-18
- Replaced `onemin.mp4` with `onemin.webm` in post/
- Updated `script.js` to reference `.webm` file
- Committed and pushed: "gallery: replace onemin.mp4 with onemin.webm"
- Renamed files in "update to post folder" with `(p)_` prefix
- Added auto-detect workflow to AGENTS.md
- Auto-detected `202609150053(2).webm` (no (p)_ prefix)
- Copied to `post/202609150053.webm` and added to BENTO_ITEMS
- Committed and pushed: "gallery: add 202609150053 video"

### 2026-11-19
- Auto-detected `202611191927.webm` (no (p)_ prefix)
- Copied to `post/202611191927.webm` and added as first item in `BENTO_ITEMS` (script.js)
- `room.html` DATA.items — new first entry; DATA.ost — appended as OST 28
- Committed and pushed: "gallery: add 202611191927 video (OST 28)"
- Renamed source → `(p)_202611191927.webm`

### 2026-11-20
- Auto-detected `202611201834.webm` (no (p)_ prefix)
- Copied to `post/202611201834.webm` and added as first item in `BENTO_ITEMS` (script.js)
- `room.html` DATA.items — new first entry; DATA.ost — appended as OST 29
- Updated AGENTS.md workflow & rules with Room OST requirement instructions
- Committed and pushed: "gallery: add 202611201834 video (OST 29) + update AGENTS.md"
- Renamed source → `(p)_202611201834.webm`

### 2026-11-21
- Auto-detected `202611210223.webm` (no (p)_ prefix)
- Copied to `post/202611210223.webm` and added as first item in `BENTO_ITEMS` (script.js)
- `room.html` DATA.items — new first entry; DATA.ost — appended as OST 30
- Committed and pushed: "gallery: add 202611210223 video (OST 30)"
- Renamed source → `(p)_202611210223.webm`

### 2026-11-22
- Auto-detected `202611220407.webm` & `202611220432.webm` (no (p)_ prefix)
- Copied both to `post/` and added to `BENTO_ITEMS` (script.js) in date descending order
- `room.html` DATA.items — prepended both entries; DATA.ost — appended as OST 31 & OST 32
- Committed and pushed: "gallery: add 202611220407 and 202611220432 videos (OST 31 & 32)"
- Renamed sources → `(p)_202611220407.webm` & `(p)_202611220432.webm`
