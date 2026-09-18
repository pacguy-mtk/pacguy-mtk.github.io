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
- **Gallery data**: `BENTO_ITEMS` array in `script.js` (line ~1492)
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
