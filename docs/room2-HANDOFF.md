# room2.html handoff (layered picture room, first run)

Read this first if you are an AI agent (or a human) picking up `room2.html`. Related: `AGENTS.md`, `docs/room-HANDOFF.md` (the procedural 3D room, `room.html`), `docs/tarot-HANDOFF.md`.

## What this is
`room2.html` is an alternative to `room.html`. Instead of building the desk out of 3D shapes, it shows a rendered picture of the desk
(made in ComfyUI, 2112 x 1168) split into depth layers, and moves the layers slightly for a 3D feel. three.js (r160, same import map as room.html)
is used only as a fast layer compositor and effect renderer. Nothing is lit or shadowed in real time, so it is far lighter on the GPU than `room.html`.

Everything outside the module script (HTML, CSS, drawers, gallery, radio/OST, Systems, Lumie chat, tarot overlay, welcome card, dock, loader,
fatal screen, phone rotate card) is copied unchanged from `room.html`. The only new part is the `<script type="module">` and a small `.hs` CSS block.
The scene talks to the UI through `window.UI`: `open(id)`, `close()`, `onfocus(id)`, `onmusic(on)`, `onsay(mood)`, `onenter()`, `current`.
ids: gallery, radio, server, lumie, mug, phone, tarot.

## Files
```
room2.html
room2/mid.webp     midground: the scene with the lamp, mug and Lumie removed (rough automatic fill, see "Known weak spots")
room2/depth.webp   grey depth map, white = near (made in ComfyUI)
room2/lumie.webp   RGBA cut-out, full canvas, aligned
room2/mug.webp     RGBA cut-out, full canvas, aligned
room2/lamp.webp    RGBA cut-out, full canvas, aligned
```
All five images are the same 2112 x 1168 canvas, so layers stack with no offsets. `.github/workflows/build.yml` now also injects the chat keys into `room2.html`.

## How the depth effect works (module script)
- `mid` is a ShaderMaterial. For each pixel it reads the depth map and shifts the sampled colour by `(depth - focusDepth) * amplitude * mouse`.
  Two sampling steps reduce swimming at depth edges.
- The three cut-outs shift by the same formula using one representative depth each (`CFG.depth`), so they stay consistent with the midground behind them.
- Effects (fairy-light twinkle, window rain drops, bokeh shimmer, mug steam, lamp glow and light pool, server LEDs, radio glow while music plays, dust) are additive sprites,
  each given a depth so they drift with the layer they belong to.
- Colours are not touched: the renderer uses a linear output with no tone mapping and textures use no colour space, so pixels look exactly like the artwork.
- Lumie breathes, bounces when she is "happy" (chat reply) and bobs while music plays. She cannot flap wings or sway antennae, because she is a single cut-out.
- Hit testing converts the pointer to image pixels (`toImage`) and checks `CFG.hot` regions. Lumie and the mug use the cut-out's alpha channel.

## Tuning (all in `CFG` at the top of the module)
| Setting | Meaning |
|---|---|
| `parallax` (also `?px=90`) | strength in image px at full mouse movement per 1.0 depth difference. Default 60 |
| `focusDepth` | depth that stays still (Lumie's plane, 0.275) |
| `views` | per-section camera target and zoom (image px) |
| `hot` | clickable regions and the ring centre `c` for each section |
| `panes`, `bokeh`, `leds`, `lampGlow`, `lampPool`, `radioDial`, `steamAt`, `bubbleAt` | where the effects sit |
| `BULBS` | fairy-light positions, detected automatically from the artwork |

Other behaviour: Full / Light effects toggle (HUD pill, saved as `localStorage.zj_fx2`, also `?lite`), auto-drop to Light if frames are slow,
frame cap 60 (30 Light), 24 fps when idle or while the welcome card shows, nothing drawn when the tab is hidden or the tarot overlay is open.
On touch screens and after 3.5 s of no mouse movement the layers sway slowly by themselves.

## Phones
Same rotate card as `room.html` (landscape lock works on Android Chrome only). In portrait the picture is fitted to the screen width (small, with dark bars),
and the dock buttons zoom into each object. Landscape fills the screen like a wallpaper.

## Known weak spots (be honest in your summary)
- NOT verified in a browser by the author. Syntax and coordinate maths were checked; looks and feel were not seen. First thing to do: open it and look.
- `mid.webp` was filled automatically (OpenCV Telea). It is smeared where the lamp and Lumie were. Only thin slivers around those objects can show when layers move,
  and a worst-case test (up to 26 px shift) looked clean, but a proper inpaint would be better. Keep `parallax` modest if you see smearing.
- The window is still part of the midground. Rain drops and bokeh are overlays, not a separate "outside" layer.
- Zooming above about 2x looks soft because the layers are 2112 px wide. A 4224 x 2336 master of the artwork exists if a sharper version is wanted (cut-outs and depth would need redoing at that size).
- Effect and hotspot coordinates were read off the image by eye and by simple detection. Nudge them in `CFG` if a ring or glow sits slightly off.
- The lamp is not clickable.

## Test checklist
1. Open `room2.html`, then `room2.html?lite`, then `room2.html?px=100`.
2. Move the mouse slowly: desk front should shift most, Lumie least, the window slightly the other way. No black edges.
3. Click each dock button and each glowing ring: gallery, radio (music should start/stop), Lumie (chat), tarot (overlay), Systems, Contact, Ko-fi.
4. Hover Lumie and the mug: pointer cursor and label. Hover empty areas: no label.
5. Check rain drops stay inside the two window panes and steam rises from the mug.
6. Phone: rotate card appears in portrait; landscape works; no console errors.

## Deciding between room.html and room2.html
`room.html` = real 3D, free camera flight, heavier, looks procedural. `room2.html` = looks like the artwork, light on the GPU, limited camera movement.
`index.html` decides which page visitors land on; it was not changed.
