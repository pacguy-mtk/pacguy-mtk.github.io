/**
 * Tarot Divination — Frontend Runtime Controller
 * 3D card animation pipeline, card selection engine, Web Audio, dialogue typewriter.
 *
 * Performance notes (vs. v1):
 *  - Deck cards are flat elements; only the card being revealed is a 3D object.
 *  - The reveal "spotlight" dims the deck/dock with opacity instead of blurring the whole stage.
 *  - Cards fly with transform-only (FLIP) animations: deck -> centre -> dock slot.
 *  - Typewriter appends to one text node on requestAnimationFrame (no innerHTML rebuild per character).
 *  - Card art is preloaded + decoded before the flip, and missing art is only probed once.
 */

(function () {
  'use strict';

  const B = window.Backend;
  const DECK_SIZE = 22;
  const REVEAL_CHAR_MS = Math.round(18 / (window.TAROT_CONFIG.REVEAL_SPEED || 0.7));   // 18 ms = the side dialogue's speed
  const ART_EXTS = ['webp', 'png'];           // tried in this order: assets/{id}.webp, then .png

  let livePool = [];
  let currentSpread = [];
  let isAnimating = false;
  let audioCtx = null;
  let revealStatus = [null, null, null];
  let lastNarrativeReading = '';
  let isSpreadComplete = false;
  let forcedNext = null;                      // debug: { id, orientation }
  let currentQuestion = null;                 // { categoryId, text } | null (null = general reading)
  let askDone = null;                         // resolver while the question panel is open
  let askCat = null;
  let el = {};

  // =========================================================================
  // Web Audio API Sound Synthesizer
  // =========================================================================

  function getAudioContext() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function tone(ctx, type, f0, f1, vol, start, dur) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, start);
    if (f1) osc.frequency.exponentialRampToValueAtTime(f1, start + dur);
    gain.gain.setValueAtTime(vol, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur);
  }

  // Real SFX files (temporary set). If a file is missing or blocked, the synth below plays instead.
  const SFX_FILES = { flip: 'assets/sfx/card-flip.mp3', dock: 'assets/sfx/card-place.mp3', chime: 'assets/sfx/reveal.mp3' };
  const sfxBase = {};
  function playFile(type) {
    const url = SFX_FILES[type];
    if (!url) return false;
    try {
      if (!sfxBase[type]) {
        const a = new Audio(url);
        a.preload = 'auto';
        a.addEventListener('error', () => { sfxBase[type] = 'failed'; });
        sfxBase[type] = a;
      }
      if (sfxBase[type] === 'failed') return false;
      const a = sfxBase[type].cloneNode();       // clone so quick repeats can overlap
      a.volume = 0.8;
      const p = a.play();
      if (p && p.catch) p.catch(() => { });
      return true;
    } catch (e) { return false; }
  }

  function playSound(type) {
    if (playFile(type)) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      if (type === 'flip') tone(ctx, 'sine', 300, 120, 0.15, now, 0.15);
      else if (type === 'dock') tone(ctx, 'triangle', 140, 40, 0.25, now, 0.2);
      else if (type === 'chime') [880, 1320, 1760].forEach((f, i) => tone(ctx, 'sine', f, 0, 0.12, now + i * 0.08, 0.8));
    } catch (e) { /* autoplay policy: stay silent */ }
  }

  // =========================================================================
  // High-Entropy Selection Engine
  // =========================================================================

  // Uniform [0,1) from the OS CSPRNG, then mixed with the high-resolution timer
  // fraction modulo 1 (a uniform + uniform mod 1 stays uniform).
  function roll() {
    let r;
    if (window.crypto && crypto.getRandomValues) {
      const u = new Uint32Array(1);
      crypto.getRandomValues(u);
      r = u[0] / 4294967296;
    } else {
      r = Math.random();
    }
    return (r + ((performance.now() * 100000) % 1)) % 1;
  }

  function resetPool() {
    livePool = Array.isArray(window.masterTarotDatabase) ? [...window.masterTarotDatabase] : [];
  }

  function drawCardFromPool() {
    if (livePool.length === 0) resetPool();

    // 3-pass Fisher-Yates (v1 used (rand+noise)/2, a triangular distribution that favoured
    // middle positions; it is uniform now).
    for (let pass = 0; pass < 3; pass++) {
      for (let i = livePool.length - 1; i > 0; i--) {
        const j = Math.floor(roll() * (i + 1));
        [livePool[i], livePool[j]] = [livePool[j], livePool[i]];
      }
    }
    return { ...livePool.pop(), isReversed: roll() > 0.5 };
  }

  function takeCard() {
    if (forcedNext) {
      const f = forcedNext;
      forcedNext = null;
      const found = window.masterTarotDatabase.find(c => c.id === f.id);
      if (found) {
        livePool = livePool.filter(c => c.id !== found.id);
        const isReversed = f.orientation === 'reversed' ? true : f.orientation === 'upright' ? false : roll() > 0.5;
        return { ...found, isReversed };
      }
    }
    return drawCardFromPool();
  }

  // =========================================================================
  // Card art: probe once, decode before it is needed
  // =========================================================================

  const artUrls = new Map();       // id -> url | null (resolved)
  const artPending = new Map();    // id -> Promise

  function tryImage(url) {
    return new Promise(resolve => {
      const img = new Image();
      let done = false;
      const finish = ok => { if (!done) { done = true; resolve(ok); } };
      img.decoding = 'async';
      img.onload = () => (img.decode ? img.decode().catch(() => { }) : Promise.resolve()).then(() => finish(true));
      img.onerror = () => finish(false);
      setTimeout(() => finish(false), 5000);
      img.src = url;
    });
  }

  function loadArt(id) {
    if (artUrls.has(id)) return Promise.resolve(artUrls.get(id));
    if (!artPending.has(id)) {
      artPending.set(id, (async () => {
        let found = null;
        for (const ext of ART_EXTS) {
          const url = `assets/${id}.${ext}`;
          if (await tryImage(url)) { found = url; break; }
        }
        artUrls.set(id, found);
        return found;
      })());
    }
    return artPending.get(id);
  }

  // =========================================================================
  // Init & event binding
  // =========================================================================

  function init() {
    cacheElements();
    if (!Array.isArray(window.masterTarotDatabase) || window.masterTarotDatabase.length === 0) {
      el.dialogueText.textContent = 'Card data is missing: tarot-data.js was not found next to index.html. ' +
        'Copy the whole game folder together (index.html, tarot-data.js, assets/, and the .js/.css files).';
      return;
    }
    resetPool();
    bindEvents();
    setupAskPanel();
    renderDeckReservoir();
    resetRevealStatus();
    if (window.OracleAccess) window.OracleAccess.init();
    typewriterDialogue('Welcome Seeker to Tarot Divination. Draw three cards to uncover your Past, Present, and Future timeline.');
  }

  function cacheElements() {
    const $ = id => document.getElementById(id);
    el = {
      deckContainer: $('deck-reservoir-grid'),
      playgroundStage: $('playground-stage'),
      gameStageContainer: $('game-stage-container'),
      descBubble: $('card-desc-bubble'),
      bubbleName: $('bubble-card-name'),
      bubbleOrientation: $('bubble-orientation'),
      bubbleMeaning: $('bubble-meaning'),
      dockSlots: [$('slot-past'), $('slot-present'), $('slot-future')],
      dialogueText: $('dialogue-text'),
      dialogueBox: document.querySelector('.dialogue-box-container'),
      dialogueSpinner: $('dialogue-loading-spinner'),
      revOverlay: $('revelation-overlay'), revCards: $('revelation-cards'), revScroll: $('revelation-scroll'),
      revText: $('revelation-text'), revNote: $('revelation-note'), revHint: $('revelation-hint'),
      rereadBtn: $('reread-btn'), askLang: $('ask-lang'),
      revealStatus: [1, 2, 3].map(n => ({ status: $(`reveal-${n}-status`), state: $(`reveal-${n}-state`) })),
      copyRevelationBtn: $('copy-revelation-btn'),
      deckSectionTitle: $('deck-section-title'),
      askOverlay: $('ask-overlay'), askPanel: $('ask-panel'), askChips: $('ask-chips'), askHint: $('ask-hint'),
      askInput: $('ask-input'), askCount: $('ask-count'), askSubmit: $('ask-submit'), askSkip: $('ask-skip')
    };
  }

  function bindEvents() {
    // One delegated listener for the whole deck (was 22).
    el.deckContainer.addEventListener('click', e => {
      const w = e.target.closest('.deck-card-wrapper');
      if (w && !w.classList.contains('used')) handleCardDraw(w);
    });
    el.deckContainer.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const w = e.target.closest('.deck-card-wrapper');
      if (w && !w.classList.contains('used')) { e.preventDefault(); handleCardDraw(w); }
    });
    if (el.copyRevelationBtn) el.copyRevelationBtn.addEventListener('click', handleCopyRevelation);
    if (el.revOverlay) {
      el.revOverlay.addEventListener('click', onRevelationClick);
      el.revOverlay.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); onRevelationClick(); }
      });
    }
    if (el.rereadBtn) el.rereadBtn.addEventListener('click', rereadRevelation);
    if (el.dialogueBox) el.dialogueBox.addEventListener('click', () => { if (twState) twState.finish(); });
  }

  // =========================================================================
  // Deck & card rendering
  // =========================================================================

  function renderDeckReservoir() {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < DECK_SIZE; i++) {
      const w = document.createElement('div');
      w.className = 'deck-card-wrapper';
      w.style.zIndex = i + 1;
      w.tabIndex = 0;
      w.setAttribute('role', 'button');
      w.setAttribute('aria-label', 'Draw a card');
      w.innerHTML = '<div class="deck-card"></div>';
      frag.appendChild(w);
    }
    el.deckContainer.replaceChildren(frag);
  }

  function createCardDOMElement(cardData, extraClass) {
    const card = document.createElement('div');
    card.className = 'tarot-card-3d' + (extraClass ? ' ' + extraClass : '');
    card.innerHTML =
      '<div class="card-inner">' +
        '<div class="card-face card-back"><div class="card-back-pattern"></div></div>' +
        '<div class="card-face card-front"></div>' +
      '</div>';
    if (cardData) fillCardFront(card, cardData);
    return card;
  }

  function fillCardFront(card, cardData) {
    const front = card.querySelector('.card-front');
    front.textContent = '';

    const content = document.createElement('div');
    content.className = 'card-front-content';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'card-image-container';

    const url = artUrls.get(cardData.id);
    if (url) {
      const img = document.createElement('img');
      img.className = 'card-img';
      img.src = url;
      img.alt = cardData.name;
      img.decoding = 'async';
      img.draggable = false;
      imageContainer.appendChild(img);
      content.classList.add('has-art');               // the art already prints the title: hide the duplicate name
    } else {
      imageContainer.appendChild(createVectorCardFallback(cardData));
      content.classList.add('has-fallback');          // placeholder already prints the name
    }

    const overlay = document.createElement('div');
    overlay.className = 'card-title-overlay';
    const title = document.createElement('div');
    title.className = 'card-title-text';
    title.textContent = cardData.name;
    const tag = document.createElement('div');
    tag.className = 'orientation-tag';
    tag.textContent = cardData.isReversed ? 'REVERSED' : 'UPRIGHT';
    overlay.append(title, tag);

    content.append(imageContainer, overlay);
    front.appendChild(content);
    if (cardData.isReversed) card.classList.add('reversed');
  }

  function createVectorCardFallback(cardData) {
    const suitIcons = { Fire: '🔥', Water: '💧', Air: '⚔️', Earth: '🪙', Lines: '✨' };
    const box = document.createElement('div');
    box.className = 'vector-card-fallback';
    const mk = (cls, text) => { const d = document.createElement('div'); d.className = cls; d.textContent = text; return d; };
    box.append(
      mk('vector-element-badge', cardData.category),
      mk('vector-suit-icon', suitIcons[cardData.elemental_suit] || '🔮'),
      mk('vector-card-title', cardData.name),
      mk('vector-element-badge', cardData.elemental_suit)
    );
    return box;
  }

  // =========================================================================
  // FLIP helper: animate an element from where another rect was, to where it is
  // =========================================================================

  function flyFrom(card, fromRect, ms, ease) {
    const r = card.getBoundingClientRect();
    const dx = fromRect.left + fromRect.width / 2 - (r.left + r.width / 2);
    const dy = fromRect.top + fromRect.height / 2 - (r.top + r.height / 2);
    const s = fromRect.width / r.width;
    card.style.transition = 'none';
    card.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${s})`;
    void card.offsetWidth;                                   // commit the start frame
    card.style.transition = `transform ${ms}ms ${ease}`;
    card.style.transform = 'translate3d(0, 0, 0) scale(1)';
  }

  function flyTo(card, toRect, ms, ease) {
    const r = card.getBoundingClientRect();
    const dx = toRect.left + toRect.width / 2 - (r.left + r.width / 2);
    const dy = toRect.top + toRect.height / 2 - (r.top + r.height / 2);
    const s = toRect.width / r.width;
    card.style.transition = `transform ${ms}ms ${ease}`;
    card.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${s})`;
  }

  // =========================================================================
  // Major Arcana showcase (v0.9.1)
  // =========================================================================

  function isMajorCard(cardData) {
    return /^major/i.test(String(cardData.category || '')) || (Number.isInteger(cardData.id) && cardData.id < 22);
  }

  const FLIP_DELAY_MS = 900;   // pause after the card lands, before it flips
  const SFX_LEAD_MS = 180;     // flip sound starts this long before the flip
  const SHOWCASE_MS = 3000;          // keep in sync with --showcase-ms in mystic-theme.css

  async function playMajorShowcase(cardEl) {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const front = cardEl.querySelector('.card-front');
    const holo = document.createElement('div');
    holo.className = 'card-holo';
    const shine = document.createElement('div');
    shine.className = 'card-shine';
    front.append(holo, shine);

    await sleep(420);                                          // let the 3D flip settle first
    cardEl.classList.add('showcase');
    await sleep(reduce ? 900 : SHOWCASE_MS);
    cardEl.classList.remove('showcase');                       // back to the original size
    await sleep(120);
    holo.remove();
    shine.remove();
  }

  // =========================================================================
  // Animation pipeline: fly -> flip -> describe -> dock -> (3rd card) Oracle
  // =========================================================================

  async function handleCardDraw(clickedWrapper) {
    if (isAnimating) return;

    if (isSpreadComplete) {
      typewriterDialogue('Revelation complete. Press Reset to start a new reading.');
      return;
    }
    if (currentSpread.length >= 3) return;

    // A reading needs access to an Oracle: gate once, at the first card.
    if (currentSpread.length === 0 && !B.canStartReading()) {
      if (window.OracleAccess) window.OracleAccess.open(B.getMode() ? { reason: 'out' } : {});
      return;
    }

    isAnimating = true;

    const slotIndex = currentSpread.length;
    const cardData = takeCard();
    currentSpread.push(cardData);
    const orientation = cardData.isReversed ? 'Reversed' : 'Upright';
    const position = ['PAST', 'PRESENT', 'FUTURE'][slotIndex];
    const artReady = loadArt(cardData.id);

    // STEP 1: card leaves the deck and flies to the centre of the stage
    const deckRect = clickedWrapper.getBoundingClientRect();
    clickedWrapper.classList.add('used');
    el.gameStageContainer.classList.add('active-focus');       // STEP 2: spotlight (dims deck + dock)
    playSound('flip');

    const flying = createCardDOMElement(null, 'hero');
    el.playgroundStage.appendChild(flying);
    flyFrom(flying, deckRect, 700, 'cubic-bezier(0.22, 1, 0.36, 1)');

    await Promise.all([artReady, sleep(550)]);                 // art is decoded before the flip
    fillCardFront(flying, cardData);

    // STEP 3: 3D reveal flip. v0.9.1: let the card rest a moment, then start the sound a beat
    // BEFORE the flip so the sfx and the visual line up (audio starts later than the picture).
    await sleep(FLIP_DELAY_MS);
    playSound('flip');
    await sleep(SFX_LEAD_MS);
    flying.classList.add('flipped');
    await sleep(800);

    // v0.9.1: Major Arcana get a trading-card style showcase (grow, tilt, light ray), then return
    if (isMajorCard(cardData)) await playMajorShowcase(flying);

    // STEP 4: local description (no API cost)
    const meaning = cardData.isReversed ? cardData.reversed : cardData.upright;
    showDescriptionBubble(cardData.name, orientation, meaning);
    updateRevealStatus(slotIndex, cardData.name, orientation);
    typewriterDialogue(`[${position}] Card ${slotIndex + 1} Revealed: ${cardData.name} (${orientation}). "${meaning}"`);
    await sleep(2500);

    // STEP 5: card glides into its dock slot
    hideDescriptionBubble();
    el.gameStageContainer.classList.remove('active-focus');
    const docked = dockCardInSlot(cardData, el.dockSlots[slotIndex]);
    flyTo(flying, docked.getBoundingClientRect(), 700, 'cubic-bezier(0.65, 0, 0.35, 1)');
    await sleep(720);
    docked.style.visibility = '';
    flying.remove();
    playSound('dock');

    if (slotIndex === 0) await askQuestion();                  // ask once, after the first card

    isAnimating = false;
    updateDeckTitle();

    if (currentSpread.length === 3) await handleFinalSpreadSynthesis();
  }

  function dockCardInSlot(cardData, slotEl) {
    slotEl.querySelectorAll('.dock-orientation-label, .tarot-card-3d').forEach(n => n.remove());
    slotEl.classList.add('filled-slot');

    // v0.9.1: the blue "(Upright)" / "(Reversed)" text was removed; the golden tag on the card is the only label.
    const card = createCardDOMElement(cardData, 'docked flipped');
    card.style.visibility = 'hidden';                          // shown when the flying card lands
    slotEl.append(card);
    return card;
  }

  function clearTimelineDock() {
    el.dockSlots.forEach(slot => {
      slot.textContent = '';
      const lbl = document.createElement('div');
      lbl.className = 'slot-label';
      lbl.textContent = slot.dataset.label;
      slot.appendChild(lbl);
      slot.classList.remove('filled-slot', 'active-slot');
    });
    renderDeckReservoir();
  }

  async function handleFinalSpreadSynthesis() {
    playSound('chime');
    typewriterDialogue('The three timeline nodes are locked. The Oracle is about to speak...');
    openRevelation();                                           // centre of the screen, "weaving..." while we wait

    const result = await B.fireNarrator(currentSpread, currentQuestion);
    lastNarrativeReading = result.text;
    lastNote = result.note || '';
    isSpreadComplete = true;

    await showRevelationText(formatNarrative(result.text), lastNote);   // resolves when the Seeker clicks back

    // Keep the full text in the side panel as a record
    setDialogueInstant(formatNarrative(result.text) + (lastNote ? `\n\n${lastNote}` : ''));
    if (el.rereadBtn) el.rereadBtn.hidden = false;
    showResetButton();
    disableDeckCards();
  }

  function showDescriptionBubble(name, orientation, meaning) {
    el.bubbleName.textContent = name;
    el.bubbleOrientation.textContent = orientation;
    el.bubbleMeaning.textContent = `"${meaning}"`;
    el.descBubble.classList.add('show');
  }

  function hideDescriptionBubble() { el.descBubble.classList.remove('show'); }

  // =========================================================================
  // Dialogue typewriter (single text node, rAF-driven)
  // =========================================================================

  let twState = null;
  const CHAR_MS = 18;

  const isCJK = t => /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(t);

  // Sentences -> short paragraphs (two sentences each) unless the Oracle already wrote paragraphs.
  function formatNarrative(text) {
    const clean = String(text).replace(/[ \t]+/g, ' ').trim();
    const cjk = isCJK(clean);
    const ellipsis = last => last.replace(/[.!?。！？]+(["'”’」』）)]*)$/, cjk ? '……$1' : ' ...$1');

    if (/\n\s*\n/.test(clean)) {
      const paras = clean.split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);
      paras[paras.length - 1] = ellipsis(paras[paras.length - 1]);
      return paras.join('\n\n');
    }
    const sentences = (clean.replace(/\s*\n\s*/g, ' ').match(/[^.!?。！？]+[.!?。！？]+["'”’」』）)]*|[^.!?。！？]+$/g) || [clean])
      .map(x => x.trim()).filter(Boolean);
    if (sentences.length === 0) return clean;
    sentences[sentences.length - 1] = ellipsis(sentences[sentences.length - 1]);
    const paras = [];
    for (let i = 0; i < sentences.length; i += 2) paras.push(sentences.slice(i, i + 2).join(cjk ? '' : ' '));
    return paras.join('\n\n');
  }

  // Time-based typewriter into one text node. Returns { finish, cancel }.
  function typeInto(target, text, msPerChar, scrollBox, onDone) {
    const node = document.createTextNode('');
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    target.textContent = '';
    target.append(node, cursor);

    const start = performance.now();
    let shown = 0, raf = 0, done = false;

    const cancel = () => { done = true; cancelAnimationFrame(raf); };
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      node.nodeValue = text;
      cursor.remove();
      if (scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;
      if (onDone) onDone();
    };
    function tick(now) {
      if (done) return;
      const n = Math.min(text.length, Math.floor((now - start) / msPerChar));
      if (n !== shown) {
        shown = n;
        node.nodeValue = text.slice(0, n);
        if (scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;
      }
      if (n < text.length) raf = requestAnimationFrame(tick);
      else finish();
    }
    raf = requestAnimationFrame(tick);
    return { finish, cancel };
  }

  function typewriterDialogue(text) {
    if (!el.dialogueText) return;
    if (twState) twState.cancel();
    twState = typeInto(el.dialogueText, text, CHAR_MS, el.dialogueBox, () => { twState = null; });
  }

  function setDialogueInstant(text) {
    if (twState) { twState.cancel(); twState = null; }
    el.dialogueText.textContent = text;
    if (el.dialogueBox) el.dialogueBox.scrollTop = 0;
  }

  // =========================================================================
  // Revelation overlay (centre of the screen)
  // =========================================================================

  let revState = null;          // { phase: 'loading' | 'typing' | 'ready', typer, readyAt, resolve }
  let lastNote = '';

  function openRevelation() {
    const positions = ['Past', 'Present', 'Future'];
    el.revCards.textContent = '';
    currentSpread.forEach((c, i) => {
      const item = document.createElement('span');
      const b = document.createElement('b');
      b.textContent = c.name;
      item.append(`${positions[i]} · `, b, ` (${c.isReversed ? 'Reversed' : 'Upright'})`);
      el.revCards.appendChild(item);
    });
    el.revText.textContent = 'The Oracle is weaving your timeline...';
    el.revText.classList.add('is-loading');
    el.revNote.textContent = '';
    el.revHint.classList.remove('show');
    el.revScroll.scrollTop = 0;

    el.revOverlay.hidden = false;
    void el.revOverlay.offsetWidth;                             // commit hidden state so it fades in
    el.revOverlay.classList.add('show');
    el.revOverlay.focus({ preventScroll: true });
    revState = { phase: 'loading', resolve: null };
  }

  // Resolves when the Seeker clicks back, after the text has been fully revealed.
  function showRevelationText(text, note, opts = {}) {
    return new Promise(resolve => {
      el.revText.classList.remove('is-loading');
      const ms = REVEAL_CHAR_MS * (isCJK(text) ? 1.6 : 1);      // CJK carries more per character
      revState = { phase: 'typing', typer: null, readyAt: 0, resolve };
      const state = revState;
      state.typer = typeInto(el.revText, text, ms, el.revScroll, () => {
        state.phase = 'ready';
        state.readyAt = performance.now() + 350;                // ignore the click that skipped the typing
        el.revNote.textContent = note || '';
        el.revHint.classList.add('show');
      });
      if (opts.instant) state.typer.finish();
    });
  }

  function onRevelationClick() {
    if (!revState) return;
    if (revState.phase === 'typing') { revState.typer.finish(); return; }          // 1st click: reveal everything now
    if (revState.phase === 'ready' && performance.now() >= revState.readyAt) closeRevelation();
  }

  function closeRevelation() {
    if (!revState) return;
    const done = revState.resolve;
    revState = null;
    el.revOverlay.classList.remove('show');
    setTimeout(() => { if (!revState) el.revOverlay.hidden = true; }, 750);
    if (done) done();
  }

  function rereadRevelation() {
    if (revState || !lastNarrativeReading) return;
    openRevelation();
    showRevelationText(formatNarrative(lastNarrativeReading), lastNote, { instant: true });
  }

  // Debug auto-run support
  function debugDismissRevelation() {
    if (!revState) return;
    if (revState.phase === 'typing') revState.typer.finish();
    else if (revState.phase === 'ready') closeRevelation();
  }

  // =========================================================================
  // Reveal status, copy, reset
  // =========================================================================

  function resetRevealStatus() {
    revealStatus = [null, null, null];
    el.revealStatus.forEach(r => {
      if (r.status) r.status.textContent = 'Awaiting...';
      if (r.state) { r.state.textContent = 'Unknown'; r.state.classList.remove('revealed'); }
    });
  }

  function updateRevealStatus(index, cardName, orientation) {
    revealStatus[index] = { cardName, orientation };
    const r = el.revealStatus[index];
    if (r.status) r.status.textContent = `${cardName} (${orientation})`;
    if (r.state) { r.state.textContent = 'Revealed'; r.state.classList.add('revealed'); }
  }

  function handleCopyRevelation() {
    const positions = ['Past', 'Present', 'Future'];
    const lines = currentSpread.map((card, i) => {
      const meaning = card.isReversed ? card.reversed : card.upright;
      return `[${positions[i]}] ${card.name} (${card.isReversed ? 'Reversed' : 'Upright'}). "${meaning}"`;
    });
    if (lines.length === 0) {
      typewriterDialogue('No cards revealed yet. Draw three cards first.');
      return;
    }
    const cat = currentQuestion && B.getCategory(currentQuestion.categoryId);
    if (cat) lines.unshift(`Question (${cat.label})${currentQuestion.text ? ': ' + currentQuestion.text : ''}`, '');
    if (lastNarrativeReading) lines.push('', formatNarrative(lastNarrativeReading));

    const done = () => typewriterDialogue('Current revelation copied to clipboard.');
    const fail = () => typewriterDialogue('Failed to copy to clipboard.');
    if (navigator.clipboard) navigator.clipboard.writeText(lines.join('\n')).then(done).catch(fail);
    else fail();
  }

  function showResetButton() {
    hideResetButton();
    const btn = document.createElement('button');
    btn.id = 'reset-spread-btn';
    btn.className = 'reset-spread-btn';
    btn.textContent = 'Reset';
    btn.addEventListener('click', handleReset);
    el.playgroundStage.appendChild(btn);
  }

  function hideResetButton() {
    const existing = document.getElementById('reset-spread-btn');
    if (existing) existing.remove();
  }

  function disableDeckCards() {
    el.deckContainer.querySelectorAll('.deck-card-wrapper').forEach(w => w.classList.add('used'));
  }

  function updateDeckTitle() {
    const remaining = 3 - currentSpread.length;
    el.deckSectionTitle.textContent =
      remaining > 1 ? `DRAW ${remaining} CARDS` : remaining === 1 ? 'DRAW 1 CARD' : 'READING COMPLETE';
  }

  function handleReset() {
    clearTimelineDock();
    currentSpread = [];
    lastNarrativeReading = '';
    currentQuestion = null;
    isSpreadComplete = false;
    resetRevealStatus();
    hideResetButton();
    if (el.rereadBtn) el.rereadBtn.hidden = true;
    updateDeckTitle();
    const t = B.getTokens();
    const m = B.getMode();
    const extra = m === 'owner' ? ` (${t.left}/${t.max} daily tokens left)` : '';
    typewriterDialogue(`Timeline reset. Draw three cards to begin a new reading.${extra}`);
  }

  // =========================================================================
  // The Seeker's question (one prompt, after the first card)
  // =========================================================================

  function setupAskPanel() {
    if (!el.askOverlay) return;
    const frag = document.createDocumentFragment();
    B.getCategories().forEach(c => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ask-chip';
      b.dataset.id = c.id;
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', 'false');
      const icon = document.createElement('span');
      icon.className = 'ask-chip-icon';
      icon.textContent = c.icon;
      const label = document.createElement('span');
      label.textContent = c.label;
      b.append(icon, label);
      frag.appendChild(b);
    });
    el.askChips.appendChild(frag);
    el.askInput.maxLength = window.TAROT_CONFIG.QUESTION_MAX_CHARS;

    B.getLanguages().forEach(l => {
      const o = document.createElement('option');
      o.value = l.id;
      o.textContent = l.label;
      o.disabled = Boolean(l.disabled);
      el.askLang.appendChild(o);
    });
    el.askLang.value = B.getLanguage();
    el.askLang.addEventListener('change', () => B.setLanguage(el.askLang.value));

    el.askChips.addEventListener('click', e => {
      const b = e.target.closest('.ask-chip');
      if (b) selectAskCategory(b.dataset.id);
    });
    el.askInput.addEventListener('input', updateAskCount);
    el.askInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submitQuestion(); } });
    el.askSubmit.addEventListener('click', submitQuestion);
    el.askSkip.addEventListener('click', () => finishAsk(null));
    el.askOverlay.addEventListener('keydown', e => { if (e.key === 'Escape') finishAsk(null); });
  }

  function selectAskCategory(id) {
    const cat = B.getCategory(id);
    if (!cat) return;
    askCat = id;
    el.askChips.querySelectorAll('.ask-chip').forEach(b => b.setAttribute('aria-checked', String(b.dataset.id === id)));
    el.askHint.textContent = cat.hint;
    el.askSubmit.disabled = false;
  }

  function updateAskCount() {
    const max = window.TAROT_CONFIG.QUESTION_MAX_CHARS;
    const n = el.askInput.value.length;
    el.askCount.textContent = n > max * 0.7 ? `${n}/${max}` : '';
  }

  function askQuestion() {
    return new Promise(resolve => {
      askDone = resolve;
      askCat = null;
      el.askInput.value = '';
      el.askChips.querySelectorAll('.ask-chip').forEach(b => b.setAttribute('aria-checked', 'false'));
      el.askHint.textContent = 'Choose the path your question follows.';
      el.askSubmit.disabled = true;
      updateAskCount();
      el.gameStageContainer.classList.add('awaiting-question');
      el.askOverlay.hidden = false;
      void el.askOverlay.offsetWidth;                          // commit hidden state so the pop-up animates in
      el.askOverlay.classList.add('show');
      const first = el.askChips.querySelector('.ask-chip');
      if (first) first.focus({ preventScroll: true });
      typewriterDialogue('The first card has awakened. Whisper to the Oracle what weighs on you: choose a path, then ask in your own words.');
    });
  }

  function submitQuestion() {
    if (!askDone || !askCat) return;
    finishAsk({ categoryId: askCat, text: B.sanitizeQuestion(el.askInput.value) });
  }

  function finishAsk(question) {
    if (!askDone) return;
    currentQuestion = question;
    el.askOverlay.classList.remove('show');                    // withdraw (fade + slide up)
    setTimeout(() => { el.askOverlay.hidden = true; }, 340);
    el.gameStageContainer.classList.remove('awaiting-question');
    const done = askDone;
    askDone = null;
    const cat = question && B.getCategory(question.categoryId);
    B.logEvent('QUESTION', cat ? `Focus: ${cat.id}${question.text ? ' (with words)' : ''}` : 'Skipped (general reading)');
    typewriterDialogue(cat
      ? `The Oracle listens... ${cat.label}. Draw the remaining two cards.`
      : 'Very well, a general reading then. Draw the remaining two cards.');
    done();
  }

  // Debug auto-run support
  function debugAnswerQuestion() {
    const cats = B.getCategories();
    if (!askDone) return false;
    finishAsk({ categoryId: cats[Math.floor(Math.random() * cats.length)].id, text: 'Debug question: what should I focus on?' });
    return true;
  }

  // Called by OracleAccess when the visitor picks a mode.
  function onAccessChosen(mode) {
    const t = B.getTokens();
    if (mode === 'own') typewriterDialogue('Your key is set. The Oracle is ready. Draw three cards for as many readings as you wish.');
    else if (mode === 'owner') typewriterDialogue(`The house Oracle will read for you. You have ${t.left}/${t.max} daily tokens; each reading costs 1.`);
    else typewriterDialogue('Basic readings enabled: the cards will speak from their own meanings.');
  }

  function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  // Hooks for the debug menu (all optional for the game itself)
  function drawNext() {
    if (isAnimating) return false;
    const w = el.deckContainer.querySelector('.deck-card-wrapper:not(.used)');
    if (!w) return false;
    handleCardDraw(w);
    return true;
  }
  function setForcedNext(id, orientation) { forcedNext = id == null ? null : { id, orientation: orientation || 'random' }; }

  window.Controller = {
    init, onAccessChosen, typewriterDialogue,
    drawNext, reset: handleReset, setForcedNext,
    isBusy: () => isAnimating,
    isComplete: () => isSpreadComplete,
    isAsking: () => askDone !== null,
    isRevelationOpen: () => revState !== null,
    debugDismissRevelation,
    debugAnswerQuestion,
    cardsDrawn: () => currentSpread.length
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
