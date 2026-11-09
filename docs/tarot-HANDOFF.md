# Tarot Divination — Project Handoff

## 1. Project Overview

A visual-first, cinematic single-player tarot reading web application. Users click face-down cards to draw a 3-card Past/Present/Future spread. After all 3 cards are revealed through a cinematic animation pipeline, a single LLM API call narrates a cohesive reading.

**Purpose:** Showcase platform for ComfyUI Illusion AI-generated tarot card art.

**No server required.** Everything runs in the browser. API calls go directly from the client to the configured LLM provider.

---

## 2. File Organization

```
play tarrot/
├── index.html              — Semantic layout, two-column grid
├── mystic-theme.css        — Deep slate glassmorphism, 3D card transforms
├── mystic-controller.js    — Frontend runtime, animation pipeline, UI state
├── backend.js              — API routing, localStorage, narrator engine
├── tarot-data.js           — 78-card database (DO NOT MODIFY)
├── HANDOFF.md              — This file
└── v1-completion-tarot-divination.md — v1 completion details + future roadmap
```

**Active files:** `index.html`, `mystic-theme.css`, `mystic-controller.js`, `backend.js`, `tarot-data.js`

---

## 3. Architecture Blueprint

### Load Order

```
1. tarot-data.js          → exposes window.masterTarotDatabase (78 cards)
2. backend.js             → exposes window.Backend (IIFE module), calls Backend.init()
3. mystic-controller.js   → exposes window.Controller (IIFE module), init on DOMContentLoaded
```

### Module Communication

```
Controller (UI)  ←→  Backend (API + State)
      ↕                    ↕
  DOM Elements       localStorage
```

- **Controller** owns all DOM manipulation, animation timing, and click handlers
- **Backend** owns API calls, localStorage persistence, and event logic
- Communication via explicit function calls: `Backend.spendChance()`, `Backend.fireNarrator()`, etc.
- Both are IIFEs exposing public APIs on `window.Controller` and `window.Backend`

---

## 4. Data Schema Contract (`tarot-data.js`)

Single Source of Truth. The full 78-card production data grid. **Never modified by the application.**

### Card Object Schema

```json
{
  "id": 13,
  "name": "Death",
  "category": "Major Arcana",
  "elemental_suit": "Water",
  "upright": "Profound endings, absolute transformation, rebirth cycles.",
  "reversed": "Resistance to change, stalling painful decays."
}
```

- Major Arcana: ids 0-21 (22 cards)
- Minor Arcana: ids 22-77 (56 cards, grouped by suit: Wands/Fire, Cups/Water, Swords/Air, Pentacles/Earth)

---

## 5. High-Entropy Selection Engine

### Card Drawing

1. **Unique Data Extraction:** `drawCard()` runs `pop()` on a live shuffled pool array, stripping the card from remaining pool to prevent single-spread duplicates.
2. **Three-Pass Fisher-Yates Shuffle:** Before each draw cycle, the pool is shuffled 3 times with fractional time noise injected into the index calculation.
3. **Fractional Time Noise Math for Orientation:**
```js
const microsecondTick = performance.now();
const dynamicNoiseFactor = (microsecondTick * 100000) % 1;
const liveRandomRoll = (Math.random() + dynamicNoiseFactor) > 0.5;
```
This produces a true 50/50 upright/reversed split without machine bias.

---

## 6. Token-Optimized Animation State Pipeline

**Single-Shot Request Rule:** The frontend displays immediate description text locally from client memory during card draws, holding all backend API calls until the final step. This shields API keys and eliminates per-card server costs.

### The 5-Step Pipeline

```
[Tick 0-2: Visual Revelations]
User clicks Card → Card flies from deck array to screen center (The Playground).
│
▼
[Focal Cinematic Blur Spotlight]
Altar background blurs out → Playground Card executes Y-axis 3D horizontal reveal flip.
│
▼
[Instant Local Text Injection]
Dialogue box reads line straight from tarot-data.js for $0 cost → Card withdraws to dock slot.
│
▼
[Tick 3-5: The Final Synthesis]
Card 3 sits locked → HTML packs all 3 locked descriptions into a single raw text string.
│
▼
[Single-Shot API Call → Target: gemini-3.1-flash-lite]
Oracle narrative formatted as sentence-per-paragraph with "..." ending.
```

### Timing Breakdown

| Step | Duration | What Happens |
|------|----------|-------------|
| 1. Fly to Center | 0.8s | Card element clones from deck grid, flies to viewport center via CSS transition |
| 2. Blur Background | instant | `backdrop-filter: blur(15px)` applied to cosmic canvas |
| 3. 3D Flip Reveal | 1.2s | Card frame executes `rotateY(180deg)` with `perspective(1000px)` |
| 4. Description Bubble | 0.4s fade | Floating box fades up below card — name, orientation, meaning from local data |
| 5. Cooldown + Withdraw | 2.5s hold + 0.8s slide | Bubble fades, card slides to Past/Present/Future slot, background unblurs |

**Total per card:** ~5.7s | **Total for 3 cards + API:** ~20s

---

## 7. UI Layout

### Two-Column Layout

```
┌──────────────────────────────────────────────────────────┐
│  [🔮]  TAROT DIVINATION    [♦ 1] Revelation Chances  [⚙] │
├──────────────────────────────────────────┬───────────────┤
│            DRAW 3 CARDS                  │  THE ORACLE   │
│   ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐...   │  ● Active     │
│   └──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘      │               │
│                                          │ ┌───────────┐ │
│            ╭─────────────╮               │ │ Dialogue  │ │
│            │  (Playground │              │ │ Box       │ │
│            │   Hero)      │              │ │ (scrolls) │ │
│            ╰─────────────╯               │ └───────────┘ │
│                                          │               │
│    (Reversed)  (Upright)  (Reversed)     │ Card Reveal   │
│   ┌────────┐┌────────┐┌────────┐        │ Status        │
│   │  Past  ││Present ││ Future │        │ 1: Name - Rev │
│   │  CARD  ││  CARD  ││  CARD  │        │ 2: Name - Up  │
│   └────────┘└────────┘└────────┘        │ 3: Awaiting   │
│                                          │               │
│            [Reset Button]                │ [Copy Reveal] │
└──────────────────────────────────────────┴───────────────┘
```

### Grid Structure

```css
.game-stage-container {
  display: grid;
  grid-template-areas:
    "deck"        — top, auto height (22 stacked cards)
    "playground"  — center, 1fr (hero with aura ring)
    "dock"        — bottom, auto height (3 dock slots + orientation labels)
}
```

### Typography System

- **Header elements:** Cinzel (Semi-bold weights, tracked spacing)
- **Dialogue text:** Cormorant Garamond (Fluid line heights, crisp readability)
- **Card labels:** Cinzel (Bold, uppercase, letter-spaced)
- **UI elements:** Inter (Clean, technical)

---

## 8. Hidden Developer Sandbox

### The Drawer Panel

All technical components — API keys, model inputs, auto-simulation toggles, and telemetry — are contained inside `#dev-sandbox`.

### UI Rules

- Slides down from header when activated
- Completely invisible during standard player operation
- **Trigger:** Click the gear icon (⚙) in the header, or press `Ctrl+Shift+T`

### Contents

- Provider Endpoint (text input, default: Google Gemini)
- Base URL (text input, default: googleapis.com)
- Model ID (text input, default: gemini-3.1-flash-lite)
- API Key (password input)
- System Prompt (textarea)
- Lock Configuration button
- +5 Revelation Chances button
- Auto Simulation Loop toggle
- Export Telemetry JSON button
- Live session event log

---

## 9. API Integration

### Provider Routing

| Provider | Detection | Endpoint Format | Auth |
|----------|-----------|----------------|------|
| Google Gemini | `googleapis.com` in base URL | `{baseUrl}/models/{model}:generateContent?key={key}` | API key in URL |
| OpenAI-compatible | Any other URL | `{baseUrl}/chat/completions` | `Authorization: Bearer` |

### Request Body (Gemini)

```js
{
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts: [{ text: context }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
}
```

### Request Body (OpenAI-compatible)

```js
{
    model: model,
    messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: context }
    ],
    temperature: 0.7,
    max_tokens: 400
}
```

### Response Parsing

- Gemini: `data.candidates[0].content.parts[0].text`
- Others: `data.choices[0].message.content`

### Oracle System Prompt

```
You are an objective, perceptive Tarot Diviner translating raw metrics into a cohesive
prophetic script for a human seeker. Speak directly to the seeker with calm, mystical authority.

Rules:
1. Speak fluidly across the linear timeline: Past, Present, and Future. Do not use lists or
   structured bullet points.
2. Read the entire spread as a connected journey. Let the cards talk to each other rather than
   treating them as isolated entries.
3. Keep sentences clear, impactful, and conversational. Avoid both overly verbose poetry and
   cold, robotic fragments. This must sound natural when read by a voice engine.
4. Interpret Upright cards as external forces, active choices, and manifested energy flowing
   into the world.
5. Interpret Reversed cards neutrally as internal friction, subconscious blockages, or a call
   for self-reflection — not as automatic failures or punishments.
6. Deliver a balanced, non-biased reality check based strictly on the provided card
   implications. Do not add moral judgment.
7. Output only the spoken text lines. No meta-commentary, no markdown headers, and no
   conversational preambles.
```

---

## 10. State Management

### localStorage Keys

| Key | Type | Purpose |
|-----|------|---------|
| `bs_revelation_state` | JSON string | `{ revelationChances, sessionLogs[] }` |
| `bs_api_config` | JSON string | `{ provider, baseUrl, model, apiKey, systemPrompt }` |

### State Shape

```js
{
    revelationChances: Number,     // Default 1, managed via Dev Sandbox
    sessionLogs: Array             // Telemetry entries (max 200)
}
```

### Flow

1. User opens Dev Sandbox → enters API key → clicks "Lock Configuration"
2. User adds revelation chances via "+5" button
3. User clicks deck card → `revelationChances -= 1` (if >= 1, otherwise blocked)
4. After 3 cards drawn + narrator API call → reading complete
5. Reset button appears → clears spread, re-enables deck

---

## 11. Image Assets

The app looks for card images at `assets/{id}.png` (0.png through 77.png).

**Current state:** No `assets/` folder exists. All cards use vector CSS fallback.

**Fallback:** If an image fails to load (`onerror`), the controller swaps to a golden neon vector fallback — a CSS-drawn card with the card name and suit text. The app works fully without any images.

**For ComfyUI Illusion AI integration:** Place generated images as `assets/0.png` through `assets/77.png`.

---

## 12. Known Issues / Technical Debt

1. **No assets/ folder** — Card images always hit the fallback. Need to generate with ComfyUI Illusion AI.
2. **Legacy files exist** — `index2.html`, old JSON telemetry, `V1 failed tarrot llm/` folder can be archived.
3. **tarot_specifications.md is stale** — References original schema. Current implementation diverges.
4. **No card deduplication across readings** — Pool resets, so same card can appear in consecutive readings.
5. **Web Audio synthesis only** — No real audio files yet.

---

## 13. Future Implementation

### Phase 2: Art Assets (ComfyUI Illusion AI)
- [ ] Generate 78 card images (0.png - 77.png)
- [ ] Design ornate card back
- [ ] Create header/oracle icons
- [ ] Design background texture

### Phase 3: Mobile-Friendly Optimization
- [ ] Responsive layout (stack game area and sidebar vertically)
- [ ] Touch gestures (tap to draw)
- [ ] Card sizing for small screens (70-80px)
- [ ] Dock slots stack/shrink for mobile
- [ ] Dialogue box full-width on mobile
- [ ] Header controls collapse to icons
- [ ] Dev sandbox full-screen overlay on mobile

### Phase 4: SFX Assets
- [ ] Replace Web Audio with real audio files
- [ ] Add ambient background loop
- [ ] Add UI click sounds

### Phase 5: Voice Output (TTS)
- [ ] Oracle voice narration
- [ ] Voice selection options
- [ ] Sync with typewriter effect

### Phase 6: Voice Input
- [ ] Voice command to draw cards
- [ ] Voice question input
- [ ] Wake word detection

### Phase 7: Security
- [ ] Disable DevTools (F12, Ctrl+Shift+I, Ctrl+U, right-click)
- [ ] Anti-copy image (disable drag, right-click save, long-press save)
- [ ] Obfuscate source (minify JS/HTML)
- [ ] Disable text selection on card meanings and oracle text
- [ ] Invisible watermark on generated art assets

---

## 14. How to Run

1. Open `play tarrot/index.html` in a browser (or serve via any static file server)
2. Click the gear icon (⚙) or press `Ctrl+Shift+T` to open the developer sandbox
3. Enter your API key, click "Lock Configuration"
4. Add revelation chances via "+5" button
5. Click any face-down card in the deck to begin your reading
6. After 3 cards, the oracle narrates and Reset button appears

**Note:** Opening `index.html` directly via `file://` may cause CORS issues. Use a local server (`python -m http.server`, `npx serve`, etc.) for best results.

---

## 15. Version History

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | Aug 23, 2026 | Initial completion — full divination engine, layout, API integration |

---

*See `v1-completion-tarot-divination.md` for detailed v1 completion checklist and future roadmap.*

---

## Update 2026-11-08 — performance pass, Oracle access, debug menu

**New/changed files:** `config.js` (all site settings), `oracle-access.js` (key prompt + header badge), `debug-menu.js` (removable), `backend.js`, `mystic-controller.js`, `mystic-theme.css`, `index.html`, `owner-proxy/` (optional server for your key), `tools/convert-art.py`.

- **Oracle access:** first visit asks for a Google API key (format-checked, then verified with a free metadata call) or Skip. Own key = unlimited. Skip = house Oracle, `DAILY_TOKENS` (3) per day, 1 token per finished reading, spent only when the Oracle actually answers. At 0 tokens the visitor can add a key or play with basic (non-AI) readings. Model: `gemini-3.5-flash-lite` (no `temperature` is sent; Gemini 3.5 deprecates it).
- **House key:** set `OWNER_PROXY_URL` (recommended, see `owner-proxy/README.md`) or `OWNER_API_KEY` (testing only: visible in View Source, counter can be bypassed).
- **Debug menu:** header "Debug" button / Ctrl+Shift+T. To remove: delete the `<script src="debug-menu.js">` line in `index.html` and the file (or set `DEBUG_MENU: false`). Nothing else depends on it.
- **Art:** the game loads `assets/<id>.webp`, then `assets/<id>.png`. Convert finished illustrations with `python tools/convert-art.py <folder-of-id-named-pngs>` (about 1.3 MB -> 40 KB each). Once all 78 are .webp, change `ART_EXTS` in `mystic-controller.js` to `['webp']` to skip the .png probe.
- **Fixed:** card fronts rendered one card-height too low (`.card-back` was `position: relative`); whole-stage 12 px blur on reveal (also blurred the revealed card); first-visit saved state was overwritten by the config logger; shuffle used a triangular distribution (now uniform).
- **Storage keys:** `tarot_mode`, `tarot_gemini_key`, `tarot_daily`, `tarot_sys_prompt` (old `bs_api_config` key is adopted once, then ignored).

### Update 2026-11-08 (b) — the Seeker's question
- After the first card lands in its slot, a "Whisper your question" pop-up appears in the middle of the screen and withdraws once answered (3 path buttons from `QUESTION_CATEGORIES` in `config.js`, optional 200-char text, or Skip for a general reading). The deck is locked until answered. The choice + text go into the Oracle prompt; basic (no-AI) readings open with "On the matter of <path>:".
- Paths: Love & Connection / Work, Money & Purpose / Self & Inner Growth. Rename or swap any of them in `config.js` (label, hint, lens).
- The system prompt was rewritten (voice, shape, how to read, boundaries, language). It lives in `backend.js` between the PROMPT-BEGIN/END markers; after editing run `python tools/sync-prompt.py` to copy it into `owner-proxy/worker.js`.

### Update 2026-11-09 — revelation overlay + reading language
- After the 3rd card the full reading is written across the middle of the screen (`#revelation-overlay`) at 70% of the side-dialogue typing speed (`REVEAL_SPEED` in `config.js`; Chinese is a further 1.6x slower per character). "Click to go back" appears only after the text is fully revealed. A click while it is still typing reveals everything at once. The text is kept in the side panel and "Read the Revelation Again" reopens it.
- Reading language is chosen in the question pop-up (English / 中文（简体） / Bahasa Malaysia / "More languages — coming soon"), remembered in `tarot_lang`. The system prompt stays one fixed English text; each request adds a line `Reply language: <name>.` to the message. Edit the list in `LANGUAGES` in `config.js`. Basic (no-AI) readings are English only.
