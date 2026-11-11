/**
 * Tarot Divination — "What's new" window.
 * Click the version tag in the header to open it. To add a release, put a new
 * object at the TOP of CHANGELOG. Types: new, visual, upgrades, assets, fixes.
 */
(function () {
  'use strict';

  const TYPES = {
    new:      { label: 'New',      color: '#3ddc84' },
    visual:   { label: 'Visual',   color: '#a78bfa' },
    upgrades: { label: 'Upgrades', color: '#38bdf8' },
    assets:   { label: 'Assets',   color: '#dfb15b' },
    fixes:    { label: 'Fixes',    color: '#f87171' }
  };

  const CHANGELOG = [
    {
      version: '0.9.2', title: 'Layout update', date: 'Nov 11, 2026',
      summary: 'A tidier table, cleaner cards and a simpler key window.',
      groups: [
        { type: 'visual', items: [
          '<strong>Upright / Reversed</strong> moved off the card and now sits under Past / Present / Future.',
          '<strong>Major Arcana showcase:</strong> light rays removed, the reflective shine stays.',
          '<strong>Cards fit their slots</strong> and are centred.',
          '<strong>Oracle icon</strong> changed: dark disc, gold ring, no purple.'
        ]},
        { type: 'upgrades', items: [
          '<strong>Key window:</strong> your key and the house Oracle split by a line with OR. The button now just says Skip, with the daily count above it.',
          '<strong>Reset</strong> button centred between the deck and your cards.',
          '<strong>Layout:</strong> the deck, slots and Reset keep fixed positions on desktop, tablet and phone.'
        ]},
        { type: 'fixes', items: [
          'Phone and tablet UI placement corrected: no clipped slots, no jumping page, header fits one row.'
        ]}
      ]
    },
    {
      version: '0.9.1', title: 'Visual update', date: 'Nov 11, 2026',
      summary: 'Major Arcana get their moment, and the screen gets cleaner.',
      groups: [
        { type: 'visual', items: [
          '<strong>Major Arcana showcase.</strong> Major cards flip, grow into a trading-card style showcase with a reflective light ray, then return to place. Minor cards stay as they were.',
          '<strong>Cleaner card slots.</strong> The blue "(Upright)" / "(Reversed)" text is gone; only the golden tag remains.',
          '<strong>Gemini icons.</strong> A flat Gemini mark in the header and the colourful one on the Oracle.',
          '<strong>Side-by-side key window.</strong> Your own key and the house Oracle are now two clear choices split by "OR".'
        ]},
        { type: 'upgrades', items: [
          '<strong>Flip timing.</strong> A short pause before the flip, with the sound starting just ahead of it so both line up.',
          '<strong>Clearer wording</strong> on the launch button and the key window.'
        ]},
        { type: 'assets', items: ['New <strong>reveal</strong> sound (Neutral Spell whisper).'] },
        { type: 'new', items: ['This <strong>What\'s new</strong> window. Click the version tag any time.'] }
      ]
    },
    {
      version: '0.9', title: 'First launch', date: 'Nov 10, 2026',
      summary: 'Assets update: real card art and sound arrive.',
      groups: [
        { type: 'assets', items: [
          '<strong>22 Major Arcana</strong> now have their own illustrations.',
          'New card flip, card place and reveal sounds.'
        ]},
        { type: 'new', items: ['Minor Arcana use elemental suit symbols (Wands, Cups, Swords, Pentacles).'] },
        { type: 'upgrades', items: ['Art cards show their title once, cleanly.', 'Debug menu hidden from visitors.'] }
      ]
    }
  ];

  const CURRENT = CHANGELOG[0].version;
  const SEEN_KEY = 'tarot_seen_ver';
  let overlay = null, lastFocus = null;

  function store(get, val) {
    try { return get ? localStorage.getItem(SEEN_KEY) : localStorage.setItem(SEEN_KEY, val); } catch (e) { return null; }
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'wn-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'wn-title');

    const versions = CHANGELOG.map((v, i) => {
      const groups = v.groups.map(g => {
        const t = TYPES[g.type];
        return `<div class="wn-group" style="--wn-c:${t.color}">
          <div class="wn-group-head"><span class="wn-group-label">${t.label}</span><span class="wn-count">${g.items.length}</span></div>
          <ul class="wn-list">${g.items.map(x => `<li>${x}</li>`).join('')}</ul></div>`;
      }).join('');
      return `<div class="wn-ver ${i === 0 ? 'current' : 'collapsed'}">
        <button type="button" class="wn-ver-head" aria-expanded="${i === 0}">
          <span class="wn-ver-num">v${esc(v.version)} ${esc(v.title)}</span>
          ${i === 0 ? '<span class="wn-badge">This version</span>' : ''}
          <span class="wn-date">${esc(v.date)}</span><span class="wn-chev" aria-hidden="true">▼</span>
        </button>
        <div class="wn-ver-content"><p class="wn-summary">${esc(v.summary)}</p>${groups}</div></div>`;
    }).join('');

    overlay.innerHTML = `<div class="wn-panel">
      <h2 class="wn-title" id="wn-title">What's new</h2>
      <div class="wn-body">${versions}</div>
      <div class="wn-footer"><button type="button" class="wn-close">Close</button></div></div>`;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelector('.wn-close').addEventListener('click', close);
    overlay.querySelectorAll('.wn-ver-head').forEach(h => h.addEventListener('click', () => {
      const v = h.parentElement; const c = v.classList.toggle('collapsed');
      h.setAttribute('aria-expanded', String(!c));
    }));
  }

  function open() {
    if (!overlay) build();
    lastFocus = document.activeElement;
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('open'));
    overlay.querySelector('.wn-close').focus();
    store(false, CURRENT);
    const tag = document.getElementById('version-tag');
    if (tag) tag.classList.remove('is-new');
  }

  function close() {
    if (!overlay || overlay.hidden) return;
    overlay.classList.remove('open');
    setTimeout(() => { overlay.hidden = true; }, 200);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function init() {
    const tag = document.getElementById('version-tag');
    if (!tag) return;
    tag.addEventListener('click', open);
    if (store(true) !== CURRENT) tag.classList.add('is-new');
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay && !overlay.hidden) { e.stopPropagation(); close(); }
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
