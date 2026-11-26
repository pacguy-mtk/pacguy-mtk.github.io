# History

Old entries, kept as written. File names in them may no longer exist.

# ZiJun Hub v2.2 - Completion Log

v2.1 = tarot implemented. **v2.2 = the layered picture room** (owner's verdict: a good update).

## What changed
- `room.html` replaced: the procedural 3D room (shapes and real-time lighting) became a pre-rendered ComfyUI artwork split into depth layers with parallax.
- New assets in `room-layers/`: mid, depth, monitor, radio, lumie, mug, steam, lamp (all 2112 x 1168, aligned).
- Radio and monitor cut out as rigid layers (they looked flat and wobbly inside the depth-warped midground).
- The picture's painted steam lifted onto its own layer so it moves with the mug, plus extra animated puffs.
- Monitor hotspot is a green hollow ring (a white ring vanishes on the white screen); other hotspots are white glowing rings.
- Ko-fi card rewritten in a warm, cozy voice (cream postcard, smiling cup, "Buy Me a Coffee" Ko-fi style button). Patch 2.2.2, still part of v2.2.
- Cafe-style welcome card on a pre-blurred picture of the room (the live blur caused a dark band when hovering other browser tabs). Patch 2.2.1, still part of v2.2.
- Landscape only on phones (automatic lock on Android, "turn your phone" card elsewhere).
- Top-left brand is only the ZJ logo.
- Effects: fairy-light twinkle, rain on the window, bokeh shimmer, lamp glow, server LEDs, radio glow with music, dust.
- Same UI as before: gallery, radio/OST, Systems, Lumie chat, tarot overlay, Ko-fi, contact.

## Removed
- The temporary test page `room2.html`, `room2/` and `docs/room2-HANDOFF.md`.

## Sections
| Section | Status |
|---------|--------|
| Room scene | Replaced (layered picture) |
| UI layer (drawers, chat, gallery, OST) | Unchanged |
| Classic hub (`index.html`) | Unchanged except the version history card |
| Tarot | Unchanged |

## Notes
- Needs a browser with WebGL (same fallback to the classic site as before).
- For the best visuals with true 3D three.js, Blender is required (see README).

---

# ZiJun Hub v2.0 - Completion Log

## Architecture
- **Files**: `index.html` + `style.css` + `script.js` (flat root)
- **Deploy**: GitHub Pages

## Sections
| Section | Status |
|---------|--------|
| Nav bar | Kept, updated (removed Feed/Showreel links) |
| Hero + System Map | Kept as-is |
| Background video/overlay | Kept as-is |
| Bento Gallery | New - replaces gallery/feed/showreel |
| Contact | Kept as-is |
| Footer | New - version badge |
| Pet sprite | Kept as-is, untouched |
| Chatbot | Kept as-is, untouched |

## New Features
1. **Welcome popup** - First visit overlay, blur bg, 3 buttons (HUB/Gallery/Contact), "Don't ask again" checkbox
2. **Scroll nav** - Left side fixed circles (01/02/03), IntersectionObserver highlights active section
3. **Bento gallery** - 3-column masonry, 14 items from `post/` folder, 4 filters (All/AI Generated/Mockups/Case Study), lazy loading, video first-frame thumbnails
4. **Lightbox viewer** - `<` `>` `X` text buttons, keyboard nav (arrows/escape)
5. **Security** - F12/Ctrl+Shift+I/Ctrl+U blocked, right-click disabled, drag disabled, DevTools size detection
6. **Version footer** - v2.0 "Online" badge with preview thumbnails for v1.0-v1.4

## Content
- 14 items loaded from `post/` folder
- 8 images, 6 videos
- Sorted by date (newest first)
- Categories: ai-generated, mockups, case-study

## Navigation
- Hub, Gallery, Contact, Page (dropdown with external links)
- Removed: Feed, AI Showreel

## Design Decisions
- Pinterest-style masonry layout
- 3 columns max desktop, 2 mobile
- Solid 50% black overlay on hover for text
- Cyan accent color (#42e8d4)
- Grid background extends from gallery to contact
- Video plays on hover (tap toggle mobile)

## File Sizes
| File | Size |
|------|------|
| index.html | ~12KB |
| style.css | ~63KB |
| script.js | ~69KB |

---

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
