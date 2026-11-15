# room.html handoff (v2.2: layered picture room)

Read this first if you are an AI agent (or a human) editing `room.html`. Related: `AGENTS.md`, `docs/tarot-HANDOFF.md`, `version/v2.2-completion.md`.

Version naming used by the owner: **v2.1 = tarot implemented, v2.2 = this layered room** (a good update, the owner's favourite so far).

## What this is
`room.html` shows a rendered picture of the desk (made in ComfyUI, 2112 x 1168) split into depth layers. Moving the mouse (or a slow automatic sway on touch screens)
shifts the layers by different amounts, which gives a 3D feel. three.js (r160, import map in the page head) is only a fast layer compositor and effect renderer.
Nothing is lit or shadowed in real time, so it is light on the GPU.

Everything outside the module script (HTML, CSS, drawers, gallery, radio/OST, Systems, Lumie chat, tarot overlay, welcome card, dock, loader, fatal screen) is the
original UI layer. The scene talks to it only through `window.UI`: `open(id)`, `close()`, `onfocus(id)`, `onmusic(on)`, `onsay(mood)`, `onenter()`, `current`.
ids: gallery, radio, server, lumie, mug, phone, tarot.

The previous procedural room (built from code-made shapes with real-time lighting, "v3.0/v3.1" in older notes) no longer exists in the tree. It is in git history if ever needed.

## Files (`room-layers/`, all the same 2112 x 1168 canvas, so layers stack with no offsets)
| File | Role | depth (0 far, 1 near) |
|---|---|---|
| `mid.webp` | midground: scene with the objects below removed (rough automatic fill behind them) | per pixel, from depth.webp |
| `depth.webp` | grey depth map, white = near (ComfyUI) | |
| `monitor.webp` | RGBA cut-out: monitor head and neck (base stays in mid; neck bottom fades out) | .316 |
| `radio.webp` | RGBA cut-out: radio | .564 |
| `lumie.webp` | RGBA cut-out: Lumie | .275 (the "still" plane, `focusDepth`) |
| `mug.webp` | RGBA cut-out: mug | .323 |
| `steam.webp` | RGBA: the steam that was painted into the picture, lifted off the midground (steam colour + soft alpha) | .323, so it travels with the mug |
| `lamp.webp` | RGBA cut-out: lamp | .397 |
Draw order, back to front: mid, rain/bokeh, monitor, radio, bulbs/LEDs, Lumie, mug, steam, lamp, then glows, steam puffs and dust.
Replace the images **together** (same size, same alignment). Never replace one alone.

## How the depth effect works
- `mid` is a ShaderMaterial: each pixel samples the depth map and shifts the colour by `-(depth - focusDepth) * amplitude * mouse` (two sampling steps limit swimming at edges).
- Each cut-out is a rigid plane shifted by the same formula using its own depth. Rigid means no warping: this fixed the "flat and wobbly" look the radio and monitor had when they were part of the midground.
- The steam layer has a small shader that wafts it sideways (more at the top). More animated puffs sit on top at the mug's depth.
- Effects (fairy-light twinkle, rain drops, bokeh shimmer, lamp glow and light pool, server LEDs, radio glow while music plays, dust) are additive sprites, each tracked at a depth so they drift with the layer they belong to.
- Colours are untouched: linear output, no tone mapping, textures with no colour space, so pixels look exactly like the artwork.
- Hit testing converts the pointer to image pixels and checks `CFG.hot`. Monitor, radio, Lumie and mug use their layer's alpha, shifted by the layer's current offset.
- The gallery hotspot is a small **green LED** on the monitor's bottom bezel (CSS class `.hs.led`), the others are glowing rings. It follows the monitor layer.

## Tuning (`CFG` at the top of the module)
`parallax` (also `?px=90`), `focusDepth`, `depth`, `views` (camera target and zoom per section), `hot` (clickable regions, ring/LED centre `c`),
`panes`, `bokeh`, `leds`, `lampGlow`, `lampPool`, `radioDial`, `steamAt`, `bubbleAt`, and `BULBS` (fairy-light positions, detected from the artwork).

## Performance and behaviour
Full / Light effects toggle (HUD pill, `localStorage.zj_fx2`, also `?lite`), automatic drop to Light if frames are slow, frame cap 60 (30 Light),
24 fps when idle or while the welcome card is up, nothing drawn when the tab is hidden, the tarot overlay is open, or a phone is held upright.

## Phones: landscape only
- Phones (`pointer: coarse` and the short screen side 600 px or less) in portrait get a blocking card: "Please turn your phone sideways",
  with a "Rotate automatically" button and a link to the classic site. There is no "continue in portrait" option.
- The page tries to lock landscape automatically on the first tap and on "Come in" (fullscreen + `screen.orientation.lock`). This works on **Android Chrome only**.
  iPhones cannot be locked by a web page, so they just see the card until they turn the phone.
- The lock only lasts while `room.html` is open (fullscreen ends on navigation, and `pagehide` unlocks). The classic site is unaffected.
- Tablets are not blocked: in portrait the picture is fitted to the screen width with dark bars.

## HUD
The top-left brand is only the **ZJ logo** (no "ZiJun Room" or "Design / AI / Tools" text). Keep it that way.

## Known weak spots (be honest in your summary)
- `mid.webp` behind the removed objects was filled automatically (OpenCV Telea), so it is smeared there. A worst-case test (radio 15 px, lamp 8 px) looked clean, but a proper inpaint is better if the parallax strength is raised a lot.
- The window is still part of the midground. Rain and bokeh are overlays, not a separate "outside" layer.
- Zooming above about 2x is soft (layers are 2112 px wide). A 4224 x 2336 master of the artwork exists if a sharper version is wanted (cut-outs and depth would need redoing).
- Objects are rigid pictures. A flat image has no hidden sides, so the radio and monitor cannot show their sides turning. For real solidity, see the Blender note below.
- Effect and hotspot coordinates were read off the image by eye and simple detection. Nudge them in `CFG` if something sits slightly off.
- The lamp is not clickable.

## Blender note (also in README.md)
To reach the best visual quality with three.js (real 3D objects, correct lighting, soft shadows, reflections, solid-looking radio and monitor), the scene needs to be modelled and lit
in **Blender**, then exported (glTF with baked lighting and textures) and shown in three.js. Hand-written three.js shapes look basic. v2.2 uses a pre-rendered artwork to get the look without Blender.

## Test checklist after any change
1. Open `room.html`, `room.html?lite`, `room.html?px=100`.
2. Move the mouse slowly: desk front shifts most, Lumie least, the window slightly the other way, radio and monitor stay rigid, steam stays on the mug. No black edges.
3. Click each dock button, the green LED on the monitor, and each ring (radio: music starts/stops; Lumie: chat; tarot: overlay; Systems; Contact; Ko-fi).
4. Phone: portrait shows the blocking card, landscape works, the classic link in the card works, no console errors.
