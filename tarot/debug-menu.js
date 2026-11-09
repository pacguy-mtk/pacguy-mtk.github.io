/**
 * Tarot Divination — Debug Menu  (TEMPORARY — remove before launch)
 * -----------------------------------------------------------------------
 * Fully self-contained: it injects its own button, panel, CSS and shortcut.
 * To remove it for good: delete the <script src="debug-menu.js"> line in
 * index.html, then delete this file. Nothing else depends on it.
 * (Or set DEBUG_MENU: false in config.js to hide it without deleting.)
 *
 * Open with the "Debug" button in the header, or Ctrl+Shift+T.
 */
(function () {
  'use strict';

  const C = window.TAROT_CONFIG;
  if (!C || !C.DEBUG_MENU) return;

  const B = window.Backend;
  const Ctl = window.Controller;

  // -----------------------------------------------------------------------
  // Styles (scoped under .dbg-*)
  // -----------------------------------------------------------------------
  const css = `
  .dbg-toggle{background:rgba(255,255,255,.05);border:1px solid var(--slate-border);color:var(--text-muted);padding:.45rem .85rem;border-radius:6px;font-family:var(--font-tech);font-size:.8rem;cursor:pointer;transition:background-color .2s,color .2s,border-color .2s;display:flex;align-items:center;gap:.4rem}
  .dbg-toggle:hover{background:rgba(255,255,255,.1);color:var(--text-main);border-color:var(--cyan-neon)}
  .dbg-toggle.active{background:rgba(78,250,245,.15);color:var(--cyan-neon);border-color:var(--cyan-neon)}
  .dbg-panel{position:fixed;top:var(--header-height);left:0;right:0;z-index:1500;max-height:calc(100vh - var(--header-height) - 6px);overflow-y:auto;background:#06080f;border-bottom:2px solid var(--cyan-neon);padding:1rem 1.5rem 1.25rem;box-shadow:0 10px 30px rgba(0,0,0,.8);transform:translateY(-105%);visibility:hidden;transition:transform .25s cubic-bezier(.4,0,.2,1),visibility 0s linear .25s;user-select:text;-webkit-user-select:text}
  .dbg-panel *{user-select:text;-webkit-user-select:text}
  .dbg-panel.open{transform:none;visibility:visible;transition:transform .25s cubic-bezier(.4,0,.2,1)}
  .dbg-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:.85rem;padding-bottom:.5rem;border-bottom:1px solid rgba(78,250,245,.2);gap:1rem;flex-wrap:wrap}
  .dbg-title{font-size:.9rem;font-weight:700;color:var(--cyan-neon);letter-spacing:1.5px;text-transform:uppercase}
  .dbg-warn{font-size:.72rem;color:#fbbf24}
  .dbg-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:.9rem}
  .dbg-card{background:rgba(14,18,32,.9);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:.9rem}
  .dbg-card h3{font-size:.76rem;font-weight:600;color:var(--gold-light);margin-bottom:.65rem;text-transform:uppercase;letter-spacing:1px}
  .dbg-row{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.5rem}
  .dbg-kv{display:grid;grid-template-columns:auto 1fr;gap:.2rem .75rem;font-size:.75rem;margin-bottom:.6rem}
  .dbg-kv dt{color:var(--text-muted)} .dbg-kv dd{color:#a7f3d0;font-family:monospace;word-break:break-all}
  .dbg-btn{background:rgba(255,255,255,.08);border:1px solid var(--slate-border);color:var(--text-main);padding:.38rem .7rem;border-radius:4px;font-size:.74rem;cursor:pointer;transition:background-color .2s,border-color .2s,color .2s;flex:1;text-align:center;white-space:nowrap}
  .dbg-btn:hover:not(:disabled){background:rgba(78,250,245,.2);border-color:var(--cyan-neon);color:var(--cyan-neon)}
  .dbg-btn:disabled{opacity:.4;cursor:not-allowed}
  .dbg-btn.danger:hover:not(:disabled){background:rgba(239,68,68,.2);border-color:var(--danger);color:#fca5a5}
  .dbg-check{display:flex;align-items:center;gap:.5rem;font-size:.76rem;color:var(--text-main);margin-bottom:.45rem;cursor:pointer}
  .dbg-select,.dbg-textarea{background:rgba(6,8,15,.8);border:1px solid rgba(255,255,255,.15);color:#fff;padding:.38rem .55rem;border-radius:4px;font-family:monospace;font-size:.74rem;outline:none;width:100%}
  .dbg-select:focus,.dbg-textarea:focus{border-color:var(--cyan-neon)}
  .dbg-textarea{height:110px;resize:vertical;margin-bottom:.5rem}
  .dbg-hint{font-size:.7rem;color:var(--text-muted);margin-top:.35rem;line-height:1.4}
  .dbg-log{background:#030407;border:1px solid rgba(255,255,255,.1);border-radius:4px;height:130px;overflow-y:auto;padding:.5rem;font-family:monospace;font-size:.68rem;color:#a7f3d0;line-height:1.4;white-space:pre-wrap;word-break:break-word}
  .dbg-fps{position:fixed;left:8px;bottom:8px;z-index:4000;background:rgba(0,0,0,.8);color:#a7f3d0;font:11px/1.4 monospace;padding:6px 8px;border-radius:4px;pointer-events:none;white-space:pre}
  .dbg-fps[hidden]{display:none}
  /* "fancy blur" toggle: the heavy v1-style blur, kept only for comparison */
  .fx-blur .deck-reservoir-section,.fx-blur .timeline-dock-section{transition:opacity .45s ease,filter .45s ease}
  .fx-blur .game-stage-container.active-focus .deck-reservoir-section,
  .fx-blur .game-stage-container.active-focus .timeline-dock-section{filter:blur(8px);opacity:.45}
  `;
  const style = document.createElement('style');
  style.id = 'debug-menu-style';
  style.textContent = css;
  document.head.appendChild(style);

  // -----------------------------------------------------------------------
  // Markup
  // -----------------------------------------------------------------------
  const cardOptions = (window.masterTarotDatabase || [])
    .map(c => `<option value="${c.id}">${c.id} · ${c.name}</option>`).join('');

  const panel = document.createElement('div');
  panel.className = 'dbg-panel';
  panel.id = 'debug-menu';
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML = `
    <div class="dbg-head">
      <div class="dbg-title">🛠 Debug menu</div>
      <div class="dbg-warn">Temporary — remove <code>debug-menu.js</code> and its &lt;script&gt; tag before launch · shortcut: Ctrl+Shift+T</div>
    </div>
    <div class="dbg-grid">

      <div class="dbg-card">
        <h3>Oracle access</h3>
        <dl class="dbg-kv" id="dbg-status"></dl>
        <div class="dbg-row">
          <button class="dbg-btn" data-tok="0">Tokens 0</button>
          <button class="dbg-btn" data-tok="1">1</button>
          <button class="dbg-btn" data-tok="2">2</button>
          <button class="dbg-btn" data-tok="full">Full</button>
        </div>
        <div class="dbg-row">
          <button class="dbg-btn" data-mode="own" id="dbg-mode-own">Mode: own key</button>
          <button class="dbg-btn" data-mode="owner">Mode: house</button>
          <button class="dbg-btn" data-mode="local">Mode: basic</button>
        </div>
        <div class="dbg-row">
          <button class="dbg-btn" id="dbg-open-access">Show access prompt</button>
          <button class="dbg-btn danger" id="dbg-forget-key">Forget own key</button>
        </div>
        <div class="dbg-row">
          <button class="dbg-btn danger" id="dbg-wipe">Wipe site data &amp; reload (test first visit)</button>
        </div>
      </div>

      <div class="dbg-card">
        <h3>Switches</h3>
        <label class="dbg-check"><input type="checkbox" id="dbg-mock"> Mock Oracle (no API call; house tokens still spent)</label>
        <label class="dbg-check"><input type="checkbox" id="dbg-blur"> Heavy blur on reveal (v1 look, slower)</label>
        <label class="dbg-check"><input type="checkbox" id="dbg-fps"> FPS meter</label>
        <div class="dbg-hint">The FPS meter shows average FPS, the slowest 1% of frames, and how many frames took longer than 33 ms since it was switched on.</div>
        <h3 style="margin-top:.9rem">Next card</h3>
        <div class="dbg-row">
          <select class="dbg-select" id="dbg-card"><option value="">Random</option>${cardOptions}</select>
        </div>
        <div class="dbg-row">
          <select class="dbg-select" id="dbg-orient">
            <option value="random">Random orientation</option>
            <option value="upright">Upright</option>
            <option value="reversed">Reversed</option>
          </select>
          <button class="dbg-btn" id="dbg-arm">Arm next draw</button>
        </div>
        <div class="dbg-hint" id="dbg-armed">Useful for checking one illustration at a time.</div>
      </div>

      <div class="dbg-card">
        <h3>Oracle system prompt</h3>
        <textarea class="dbg-textarea" id="dbg-sys"></textarea>
        <div class="dbg-row">
          <button class="dbg-btn" id="dbg-sys-apply">Apply</button>
          <button class="dbg-btn" id="dbg-sys-reset">Reset to default</button>
        </div>
      </div>

      <div class="dbg-card">
        <h3>Automation &amp; telemetry</h3>
        <div class="dbg-row">
          <button class="dbg-btn" id="dbg-auto">Start auto-run</button>
          <button class="dbg-btn" id="dbg-export">Export log JSON</button>
        </div>
        <div class="dbg-hint" style="margin:0 0 .5rem">Auto-run draws, waits, resets and repeats until tokens run out.</div>
        <div class="dbg-log" id="dbg-log"></div>
      </div>

    </div>`;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'dbg-toggle';
  toggle.textContent = '🛠 Debug';

  const fpsBox = document.createElement('div');
  fpsBox.className = 'dbg-fps';
  fpsBox.hidden = true;

  const header = document.getElementById('header-controls');
  if (header) header.appendChild(toggle);
  document.body.append(panel, fpsBox);

  const $ = id => document.getElementById(id);

  // -----------------------------------------------------------------------
  // Open / close
  // -----------------------------------------------------------------------
  let open = false;
  function setOpen(v) {
    open = v;
    panel.classList.toggle('open', v);
    panel.setAttribute('aria-hidden', String(!v));
    toggle.classList.toggle('active', v);
    if (v) { refresh(); renderLog(); }
  }
  toggle.addEventListener('click', () => setOpen(!open));
  window.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'T' || e.key === 't')) { e.preventDefault(); setOpen(!open); }
  });

  // -----------------------------------------------------------------------
  // Status
  // -----------------------------------------------------------------------
  function fmtMs(ms) {
    const m = Math.round(ms / 60000);
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  }

  function refresh() {
    if (!open) return;
    const t = B.getTokens();
    const owner = C.OWNER_PROXY_URL ? 'proxy' : (B.ownerConfigured && B.ownerConfigured()) ? 'keys in config.js (visible to visitors!)' : 'NOT configured';
    $('dbg-status').innerHTML = [
      ['Mode', B.getMode() || '(none chosen yet)'],
      ['Tokens', `${t.left}/${t.max}  ·  refill in ${fmtMs(B.msUntilReset())}`],
      ['Own key', B.getOwnKey() ? B.maskedKey() : 'none'],
      ['House Oracle', owner],
      ['Model', C.MODEL]
    ].map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
    $('dbg-mode-own').disabled = !B.getOwnKey();
  }

  B.on('change', refresh);
  setInterval(refresh, 5000);

  // -----------------------------------------------------------------------
  // Controls
  // -----------------------------------------------------------------------
  panel.querySelectorAll('[data-tok]').forEach(b => b.addEventListener('click', () => {
    B.setTokensLeft(b.dataset.tok === 'full' ? C.DAILY_TOKENS : Number(b.dataset.tok));
  }));
  panel.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => B.setMode(b.dataset.mode)));
  $('dbg-open-access').addEventListener('click', () => { setOpen(false); if (window.OracleAccess) window.OracleAccess.open(); });
  $('dbg-forget-key').addEventListener('click', () => { B.forgetOwnKey(); refresh(); });
  $('dbg-wipe').addEventListener('click', () => {
    if (!confirm('Delete this site\'s saved key, mode and daily tokens in THIS browser, then reload?')) return;
    try {
      Object.keys(localStorage).filter(k => k.startsWith('tarot_') || k.startsWith('bs_')).forEach(k => localStorage.removeItem(k));
    } catch (e) { /* ignore */ }
    location.reload();
  });

  $('dbg-mock').addEventListener('change', e => { B.flags.mockOracle = e.target.checked; B.logEvent('DEBUG', `Mock Oracle ${e.target.checked ? 'on' : 'off'}`); });
  $('dbg-blur').addEventListener('change', e => document.documentElement.classList.toggle('fx-blur', e.target.checked));

  $('dbg-arm').addEventListener('click', () => {
    const id = $('dbg-card').value;
    Ctl.setForcedNext(id === '' ? null : Number(id), $('dbg-orient').value);
    const name = id === '' ? null : (window.masterTarotDatabase.find(c => c.id === Number(id)) || {}).name;
    $('dbg-armed').textContent = name ? `Armed: next draw is ${name} (${$('dbg-orient').value}).` : 'Next draw is random.';
  });

  const sys = $('dbg-sys');
  sys.value = B.getSystemPrompt();
  $('dbg-sys-apply').addEventListener('click', () => { B.setSystemPrompt(sys.value); B.logEvent('DEBUG', 'System prompt updated'); });
  $('dbg-sys-reset').addEventListener('click', () => { B.setSystemPrompt(''); sys.value = B.getDefaultSystemPrompt(); });

  $('dbg-export').addEventListener('click', () => B.exportTelemetry());

  // Auto-run: draw -> wait for the Oracle -> reset -> repeat, until blocked.
  let autoTimer = null;
  let completeAt = 0;
  function autoStep() {
    if (Ctl.isRevelationOpen()) { Ctl.debugDismissRevelation(); return; }
    if (Ctl.isAsking()) { Ctl.debugAnswerQuestion(); return; }
    if (Ctl.isBusy()) return;
    if (Ctl.isComplete()) {
      if (!completeAt) completeAt = Date.now();
      if (Date.now() - completeAt > 2500) { completeAt = 0; Ctl.reset(); }
      return;
    }
    if (Ctl.cardsDrawn() === 0 && !B.canStartReading()) { stopAuto('blocked: no access/tokens'); return; }
    Ctl.drawNext();
  }
  function stopAuto(why) {
    clearInterval(autoTimer); autoTimer = null; completeAt = 0;
    $('dbg-auto').textContent = 'Start auto-run';
    if (why) B.logEvent('DEBUG', `Auto-run stopped (${why})`);
  }
  $('dbg-auto').addEventListener('click', () => {
    if (autoTimer) { stopAuto('manual'); return; }
    $('dbg-auto').textContent = 'Stop auto-run';
    autoTimer = setInterval(autoStep, 700);
  });

  // -----------------------------------------------------------------------
  // Log box
  // -----------------------------------------------------------------------
  function renderLog() {
    const box = $('dbg-log');
    box.textContent = B.getLogs().slice(-60)
      .map(l => `[${l.timestamp.slice(11, 19)}] ${l.type}: ${l.message}`).join('\n');
    box.scrollTop = box.scrollHeight;
  }
  B.on('log', () => { if (open) renderLog(); });

  // -----------------------------------------------------------------------
  // FPS meter (only runs while its checkbox is on)
  // -----------------------------------------------------------------------
  let fpsOn = false, fpsRaf = 0, last = 0, frames = [], slow = 0, total = 0;
  function fpsLoop(t) {
    if (!fpsOn) return;
    if (last) {
      const dt = t - last;
      frames.push(dt); total++;
      if (dt > 33.4) slow++;
      if (frames.length > 240) frames.shift();
      if (total % 20 === 0) {
        const avg = frames.reduce((a, b) => a + b, 0) / frames.length;
        const sorted = frames.slice().sort((a, b) => b - a);
        const worst1 = sorted.slice(0, Math.max(1, Math.ceil(sorted.length * 0.01)));
        const low = worst1.reduce((a, b) => a + b, 0) / worst1.length;
        fpsBox.textContent = `${(1000 / avg).toFixed(0)} fps avg\n${(1000 / low).toFixed(0)} fps 1% low\n${slow} / ${total} frames > 33ms`;
      }
    }
    last = t;
    fpsRaf = requestAnimationFrame(fpsLoop);
  }
  $('dbg-fps').addEventListener('change', e => {
    fpsOn = e.target.checked;
    fpsBox.hidden = !fpsOn;
    cancelAnimationFrame(fpsRaf);
    last = 0; frames = []; slow = 0; total = 0;
    if (fpsOn) fpsRaf = requestAnimationFrame(fpsLoop);
  });

  window.DebugMenu = { open: () => setOpen(true), close: () => setOpen(false) };
})();
