# ZiJun Hub (3D Room & Classic)

Personal site on GitHub Pages with two modes:
- **3D Room (`room.html`)**: Cozy night desk. Since v2.2 it is a pre-rendered artwork split into depth layers (parallax) with animated effects, drawn with three.js. Interactive objects: PC Gallery (green LED), Radio OST, Systems dock, Lumie chatbot, Tarot, Ko-fi mug, Contact phone. Landscape only on phones.
- **Classic Hub (`index.html`)**: 01 The Hub (AI ask bar) / 02 Tarot Divination beta (`tarot/`) / 03 Gallery (`post/`) / 04 Systems & Contact.

Mode switch preference is remembered via `localStorage.zj_mode`, with URL overrides `?mode=room` and `?mode=classic`.
See `AGENTS.md` (how to edit), `docs/room-HANDOFF.md` (room internals), `docs/future-expansion.md` (ideas) and `docs/tarot-HANDOFF.md` (tarot internals).

## Note: Blender is required for the best three.js visuals
Hand-written three.js (shapes built in code) can only look so good: it looked "basic" next to a rendered image. To reach the best visual quality with three.js
(real 3D objects, correct lighting, soft shadows, reflections, objects that look solid from every side), the scene has to be **modelled and lit in Blender**
(or a similar 3D tool) and then exported (glTF with baked lighting and textures) into three.js.
v2.2 gets the rendered look without Blender by using a pre-rendered artwork split into depth layers. A true 3D version later will need Blender.
