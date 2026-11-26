# Gallery

## Where things are
| What | Where |
|------|-------|
| Gallery list and OST playlist (both pages) | `data/gallery.js` |
| Media | `post/` |
| Room thumbnails | `post/thumbs/` and `data/thumbs.js`, made by `tools/make-thumbs.py` |

## Add an item
1. New files wait in `update to post folder/`; names without the `(p)_` prefix are not processed yet.
   `Get-ChildItem "update to post folder" -File | Where-Object { $_.Name -notmatch '^\(p\)_' }`
2. Copy the file into `post/`.
3. Add one line at the TOP of `items` in `data/gallery.js`:
   `{"title": "...", "context": "...", "src": "post/file.webm", "type": "video", "category": "ai-generated", "date": "2026-11"}`
4. OST only: also append `"post/file.webm"` to the END of `ost` (it becomes the next OST number).
5. Run `python tools/make-thumbs.py` (needs ffmpeg).
6. Check that `src` matches the file you added. Open both pages.
7. Commit `data/`, `post/` and push to `main` (this publishes the site).
8. Rename the source file with the `(p)_` prefix.

## Fields
- `type`: `image` or `video` (these drive the Image and Video filters).
- `category`: `mockups` (website mockups, brand designs, flyers), `open-source` (tools, extensions, breakdowns),
  or `ai-generated` for everything else (it has no filter button of its own). `case-study` is retired.
- `date`: `YYYY-MM`. Newest first.

## Layout
- Classic: masonry, 3 columns, 2 when narrow.
- Room: panel takes the right half, PC stays visible on the left; 3 or 2 columns. Portrait uses a bottom sheet.

## Media size
`post/` is about 1 GB, and GitHub Pages limits a published site to 1 GB. Compress new clips before adding them
(aim: 720p, under 8 MB, check quality by eye). Example:
`ffmpeg -i in.webm -vf "scale='if(gt(iw,ih),-2,min(720,iw))':'if(gt(iw,ih),min(720,ih),-2)'" -c:v libvpx-vp9 -b:v 0 -crf 36 -c:a libopus -b:a 96k out.webm`
