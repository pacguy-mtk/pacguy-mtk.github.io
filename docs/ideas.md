# Future expansion: rough ideas (ZiJun Hub)

Not a plan, just a parking lot. Ordered roughly from "do soon" to "dream". Effort: S = an evening, M = a weekend, L = weeks.

## 1. Aesthetic: give the whole site (and the tarot art) one consistent look
**Why:** the gallery, the hub and the tarot cards each look good alone, but they are not yet one "brand".
- **Collect the dataset first (S):** 40-100 images you love (your best gallery pieces + references). Tag each with mood words: dark, neon, mystic, soft, retro-pixel.
- **Write a one-page style guide (S):** 5 colours (already: cyan, violet, blue, gold, deep navy), 2 fonts, corner radius, glow rules, what to avoid.
- **Train a style LoRA for ComfyUI (M):** feed the dataset so all 78 tarot cards share one hand. Major Arcana first (12 of 22 are already real art), then Minor Arcana (56 still empty). Keep a fixed prompt template + seed policy so a new card matches the old ones.
- **Aesthetic scoring (M):** run an aesthetic predictor over generated cards and auto-reject the bottom 30%, so you only review the good ones.
- **Card back + UI ornaments (S):** one designed card back, one border, one loading sigil, reused everywhere.

## 2. Functional design: what visitors can actually *do*
- **Gallery (S):** real titles and short descriptions instead of timestamp names, so the ask bar and search can find things ("cat", "sword", "poster").
- **Ask bar (M):** actions, not just links: "show AI videos" applies the Video filter, "draw me a card" starts the tarot, "open calculator" opens its drawer.
- **Tarot (M):** save/share a reading as an image card; reading history in the browser; a "daily card"; spreads beyond 3 cards; the 3 chances/day shown as a visible meter.
- **Contact (S):** a tiny "available for work?" status that you flip in one place.
- **Resume (S):** one-click PDF in the rack with the latest version date.

## 2b. Tarot voice: sound while the revelation is read (asked 10 Nov)
Three ways, from cheapest to richest:
1. **Typing ticks (S, free):** a very soft tick every few letters as the revelation text writes itself, plus the existing `reveal.mp3` at the start. No new files needed (can be synthesized).
2. **Read aloud with the browser voice (M, free):** the Web Speech API (`speechSynthesis`) reads the revelation out loud. A small "Read aloud" toggle (off by default), voice chosen from the reading language the game already has, text split into sentences so long readings do not cut off, stops when the reading is closed. Voice quality depends on the visitor's device (good on Edge/Chrome/Android/iOS, robotic on some Linux).
3. **A real "Oracle" voice (L, costs tokens):** a neural text-to-speech API (e.g. Gemini TTS) called through the Cloudflare Worker proxy so the key stays hidden, cached per reading. Best quality, but every reading costs extra; keep it for a "Listen" button with its own daily limit.
Suggested order: 1, then 2; do 3 only after the key proxy exists.

## 3. UI/UX optimizer
- **Hick's law check (S):** the welcome popup, the chips and the rack all offer the same 6 places; keep that list identical everywhere.
- **Mobile pass (M):** thumb-reach test on a real phone: tarot inside the page is cramped, so offer "Play full screen" as the default on small screens.
- **Accessibility (M):** keyboard order, focus rings, contrast of grey ghost text, `prefers-reduced-motion` (partly done), alt text for gallery items, a "skip to content" link.
- **Micro-interactions (M):** card hover tilt, drawer click sound (the tarot already has sfx), Lumie reacting to scroll sections.
- **Measure, don't guess (S):** add privacy-friendly analytics (Cloudflare Web Analytics or GoatCounter) to see which of the 6 places people really use.

## 4. Web load optimizer
- **Media is the weight (800 MB):** the live site is fine because it is lazy, but a first visit can still pull a lot. Make a small **poster image + short loop** for every gallery video, and load the full file only on click.
- **Convert images to WebP/AVIF (S):** the tarot already did (cards went from big PNG to ~100 KB webp). Do the same for the gallery with a build script.
- **Split `script.js` (M):** it is ~120 KB: Lumie, gallery, welcome, rack, ask bar. Load Lumie + gallery code only when needed (`import()`), and ship it minified.
- **Split `style.css` (S):** ~90 KB, with dead rules from v1/v2 (`.page-card`, `.system-map`...). Delete unused CSS, minify.
- **Fonts and icons (S):** self-host Inter and a Font Awesome subset (`css/fa-subset.css` is referenced but missing from the repo today).
- **Measure (S):** Lighthouse mobile score now vs after each change; target LCP under 2.5 s on 4G.
- **Caching (M):** a tiny service worker for the shell + tarot assets (PWA, works offline for the basic reading).
- **Move big media off Pages (M):** Cloudflare R2 / a CDN so GitHub's 1 GB Pages limit stops being a risk.

## 5. three.js / 3D (dream, but fits the brand)
- **Hero background (M):** replace the video loop with a light three.js scene (floating particles or a slow card-field) that pauses off-screen. Lighter than a video if kept small.
- **Tarot table (L):** real 3D card flip with perspective, lighting and a shallow depth-of-field table; cards fan out from a deck you "cut" with the mouse.
- **Gallery wall (L):** a "walk-through" 3D gallery for the best 12 pieces, with the normal grid as the fallback.
- **Rules:** lazy-load three.js only when the section is visible; cap pixel ratio at 2; provide a static fallback for low-power devices and `prefers-reduced-motion`.

## 6. Safety and running costs (do before any traffic spike)
- **Keys are public.** Anything injected into `script.js` / `tarot/config.js` can be read in the browser. Minimum: restrict both Gemini keys to the site's referrer and set a daily quota cap; rotate the Groq/OpenRouter keys now and then.
- **Proper fix (M):** one small Cloudflare Worker that holds all keys, rate-limits per IP, and is used by both Lumie and the tarot (`tarot/owner-proxy/worker.js` is already the pattern). The "3 chances" then becomes a real server-side limit.
- **Spend alarm (S):** budget alerts on the Google project and OpenRouter.

## 7. Content ideas
- A short "making of" page per project (case studies become the Open Source tag).
- A changelog page fed from the version timeline (v2.0 screenshot is already there).
- Seasonal tarot decks, or a deck made from your own gallery characters.

## Suggested order
1. Gallery titles + descriptions (unlocks better search).
2. Key proxy (Worker) + referrer restrictions.
3. Image/video weight pass.
4. Style guide + LoRA for the remaining tarot cards.
5. UX/accessibility pass on mobile.
6. three.js hero, then the 3D tarot table.
