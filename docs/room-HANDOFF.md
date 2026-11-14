# 3D Room handoff (v3.1: performance, phones, lighting tools)

Read this first if you are an AI agent (or a human) picking up `room.html`.
Companion docs: `AGENTS.md` (site rules), `docs/tarot-HANDOFF.md` (tarot game).

## What this page is
`room.html` is a single-file three.js scene (three r160 from jsDelivr via an import map, no build step, no 3D model files).
Everything is drawn from code: rounded boxes, canvas-generated textures, sprites for glows, instanced meshes for ivy and keys.
Data (gallery items, OST list) is injected at the top of the file in `var DATA`. Secrets are injected by GitHub Actions
(`__GROQ_API_KEY__`, `__OPENROUTER_API_KEY__`), see `.github/workflows/build.yml`.

## What v3.1 changed (all in `room.html`)
Goal: the room made laptop GPU fans spin up. Causes found in the old code and what replaced them:

| Old behaviour | New behaviour |
|---|---|
| `powerPreference: 'high-performance'` (forces the discrete GPU on laptops) | `'default'` (browser picks; usually the cooler integrated GPU) |
| Pixel ratio up to 2 (4x pixels on retina) | Per-tier cap: high 1.5, medium 1.25, low 1 |
| Rendered at the display refresh rate, forever | Frame cap per tier (60/40/30), 24 fps when idle (8 s with no input) or while the welcome card is up, nothing drawn when the tab is hidden or the full-screen tarot overlay is open |
| 2048 spot shadow map redrawn every frame | Shadows redrawn 4 times a second (`shadowMap.autoUpdate = false`), 1024 map on medium/low, hard-edged PCF on medium/low |
| Full-resolution bloom | Bloom internal size is half resolution |
| 9 lights hitting every pixel | `extraLights` (fill, monitorBack, 3 warm points) are switched off on medium/low |
| No fallback | Auto step-down: if the average frame time is more than 1.6x the tier budget for 120 frames, drop one tier and remember it |

### Quality tiers
Defined in `TIERS` near the top of the module script. Chosen at load by:
`?quality=high|medium|low` > `?lite` (= low) > `localStorage.zj_quality` > auto (phones and 4-core / 4 GB machines start on medium, others on high).
The HUD pill "Graphics: X" cycles high, medium, low and saves the choice. `setTier(name, save)` applies a tier at runtime
(pixel ratio, shadow map size, extra lights, composer rebuild). Changing `shadowMap.type` is only done at startup (needs shader recompiles).

### Frame loop rules (in `tick(ts)`)
Do not remove the early returns. If you add animation that moves a shadow-casting object by a visible amount, set
`renderer.shadowMap.needsUpdate = true` while it moves, otherwise its shadow lags up to 0.25 s.
If you add input handlers that should wake the room from idle, set `lastInput = performance.now()`.
Do not use the name `now` as a parameter of `tick` (the Lumie block declares `const now`).

## Phones
- Touch devices (`pointer: coarse`) held in portrait get a "Best in landscape" card (`#rotate`).
  "Lock landscape" requests fullscreen then `screen.orientation.lock('landscape')`. This works on Android Chrome only.
  iOS Safari cannot lock orientation, so the card then tells the user to turn off rotation lock and turn the phone.
  "Continue in portrait" is remembered per session (`sessionStorage.zj_portrait_ok`).
- The lock only exists while this page is open: leaving the page exits fullscreen, and `pagehide` calls `screen.orientation.unlock()`.
  The classic site is not affected.
- Portrait itself still works: `resize()` widens the field of view for narrow screens (capped at 70 degrees). It is usable, not pretty.
- Short landscape phones (height 480 px or less) get a compact HUD and drawer via one `@media (orientation:landscape) and (max-height:480px)` block.

## Lighting: how it was tuned and how to tune it further
A reference render exists (generated from a text prompt, see `docs/` if the image was added): warm amber lamp pool on the right,
cool blue window light behind, bright white monitor, very dark far-left and foreground, soft bokeh and fairy lights.
The code author could not see the 3D render, so the first pass is an informed guess, not a verified match.

All light intensities live in one object, `LOOK`, at the top of the module. v3.1 changed it from the old values to:
hemisphere 1.7 -> 1.25, camera-side fill 0.5 -> 0.25 (less flat ambient, more contrast), moon 1.1 -> 1.15, lamp spot 52 -> 56 with a tighter cone,
exposure 0.9 -> 0.92, bloom strength 0.4 -> 0.42.

### Live tuning (no code editing)
Open `room.html?tune`. A slider panel appears (exposure, hemi, fill, moon, lamp, monitor, monitorBack, bloom).
Drag until it feels right, press "Copy LOOK values", and paste the line over `const LOOK = {...}` in `room.html`.

### Numeric calibration targets (measured from the reference render, 1376 x 768, 0 to 255)
| Region | Mean RGB | Luma |
|---|---|---|
| Whole image | 84, 71, 72 | 74 |
| Monitor screen | 209, 209, 212 | 209 |
| Window panes | 83, 96, 116 | 94 |
| Lamp pool on desk (right) | 113, 75, 61 | 82 |
| Desk, far left | 14, 7, 5 | 8 |
| Desk, front centre | 92, 64, 58 | 69 |
| Wall / shelf, upper left | 38, 28, 24 | 30 |
| Tarot mat | 112, 77, 83 | 85 |

To calibrate: screenshot the room at 1376 x 768 in the home view, measure the same regions (a few lines of Python with PIL and numpy),
and nudge `LOOK` until the luma values are close and the warm/cool split matches (lamp pool red-heavy, window blue-heavy).
Targets are a guide, not a law: the reference is an AI-generated image.

## Not verified (be honest in your next summary)
- The patch passes a JavaScript syntax check only. It was not rendered in a browser by the author.
- Auto tier detection thresholds (1.6x budget, 120 frames) are reasonable defaults and may need adjusting on real hardware.
- `WebGLRenderTarget` with `samples` and `HalfFloatType` needs WebGL2 (all current browsers). If it fails, the code falls back to plain rendering.
- Orientation lock cannot be tested on iOS (unsupported by the platform).

## Test checklist after any change
1. Open `room.html`, `room.html?quality=low`, `room.html?quality=high`, `room.html?tune`.
2. Open DevTools Performance or GPU monitor: with the mouse still for 10 s the page should drop to about 24 fps.
3. Click each dock button (Gallery, Music, Lumie, Tarot, Systems, Contact, Ko-fi): camera flies there, drawer opens.
4. Open Tarot: the scene should stop drawing (GPU usage drops) and resume on close.
5. Phone portrait: the rotate card appears; Continue works; landscape hides it.
6. Switch tabs and come back: no animation jump, no console errors.

## Things deliberately left alone
Gallery, OST player, Lumie chat, Systems, tarot overlay, mode switching in `index.html`, and the build workflow were not modified.
