/**
 * Tarot Divination — Oracle Access (welcome prompt + header badge)
 * Lets a visitor paste their own Google key (unlimited) or skip to use the
 * house Oracle's daily tokens. Owns the #access-modal and #access-badge UI.
 */
(function () {
  'use strict';

  const C = window.TAROT_CONFIG;
  const B = window.Backend;
  const $ = id => document.getElementById(id);

  let el = {};
  let busy = false;
  let lastFocus = null;

  function init() {
    el = {
      modal: $('access-modal'), reason: $('access-reason'),
      input: $('access-key-input'), msg: $('access-key-msg'),
      save: $('access-save-btn'), skip: $('access-skip-btn'), skipInfo: $('access-skip-info'),
      local: $('access-local-btn'), forget: $('access-forget-btn'), close: $('access-close-btn'),
      saved: $('access-saved-row'), savedText: $('access-saved-text'),
      badge: $('access-badge'), badgeIcon: $('access-badge-icon'), badgeText: $('access-badge-text')
    };
    if (!el.modal || !el.badge) return;

    el.badge.addEventListener('click', () => open());
    el.close.addEventListener('click', close);
    el.save.addEventListener('click', onSave);
    el.input.addEventListener('keydown', e => { if (e.key === 'Enter') onSave(); });
    el.input.addEventListener('input', () => setMsg(''));
    el.skip.addEventListener('click', () => choose('owner'));
    el.local.addEventListener('click', () => choose('local'));
    el.forget.addEventListener('click', () => { B.forgetOwnKey(); render(); });
    el.modal.addEventListener('keydown', trapFocus);
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !el.modal.hidden && B.getMode()) close();
    });

    B.on('change', renderBadge);
    setInterval(renderBadge, 60000);          // picks up the daily refill while the tab stays open
    renderBadge();

    if (!B.getMode()) open();                 // first visit: ask once
  }

  // ---------------------------------------------------------------------
  // Badge (header)
  // ---------------------------------------------------------------------
  function renderBadge() {
    if (!el.badge) return;
    const mode = B.getMode();
    let icon = '♦', text = 'Choose your Oracle';
    if (mode === 'owner') {
      const t = B.getTokens();
      icon = '♦'; text = `${t.left}/${t.max} Daily Tokens`;
      el.badge.classList.toggle('is-empty', t.left === 0);
    } else {
      el.badge.classList.remove('is-empty');
      if (mode === 'own') { icon = '✦'; text = 'Own key · unlimited'; }
      else if (mode === 'local') { icon = '◇'; text = 'Basic readings'; }
    }
    el.badgeIcon.textContent = icon;
    el.badgeText.textContent = text;
  }

  // ---------------------------------------------------------------------
  // Modal
  // ---------------------------------------------------------------------
  function fmtReset() {
    const m = Math.max(1, Math.round(B.msUntilReset() / 60000));
    return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
  }

  /** open({ reason: 'out' }) shows the "no tokens left" variant. */
  function open(opts = {}) {
    if (!el.modal) return;
    lastFocus = document.activeElement;
    render(opts.reason);
    el.modal.hidden = false;
    document.body.classList.add('modal-open');
    setTimeout(() => (el.input.disabled ? el.skip : el.input).focus(), 30);
  }

  function close() {
    if (!B.getMode()) return;                 // first-run choice is mandatory
    el.modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function render(reason) {
    const mode = B.getMode();
    const t = B.getTokens();
    const outOfTokens = reason === 'out' || (mode === 'owner' && t.left === 0);

    el.reason.hidden = !outOfTokens;
    el.reason.textContent = outOfTokens
      ? `You've used all ${t.max} of today's readings. Tokens refill in ${fmtReset()}.`
      : '';

    // house Oracle button
    el.skip.disabled = t.left === 0;
    el.skipInfo.textContent = t.left === 0
      ? `No tokens left (refill in ${fmtReset()})`
      : `Use the house Oracle (${t.left}/${t.max} today)`;

    // basic (no-AI) mode is offered when the house tokens can't be used
    el.local.hidden = !(outOfTokens || mode === 'local');

    // saved key row
    const hasKey = Boolean(B.getOwnKey());
    el.saved.hidden = !hasKey;
    el.savedText.textContent = hasKey ? `Your key ${B.maskedKey()} is saved in this browser.` : '';

    el.close.hidden = !mode;
    el.input.value = '';
    setMsg('');
    setBusy(false);
  }

  function setMsg(text, kind) {
    el.msg.textContent = text || '';
    el.msg.className = 'access-msg' + (kind ? ' is-' + kind : '');
  }

  function setBusy(b) {
    busy = b;
    el.save.disabled = b;
    el.input.disabled = b;
    el.save.textContent = b ? 'Checking key…' : 'Save key & continue';
  }

  function choose(mode) {
    B.setMode(mode);
    el.modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (window.Controller) window.Controller.onAccessChosen(mode);
  }

  async function onSave() {
    if (busy) return;
    const key = el.input.value.trim();
    if (!key) { setMsg('Paste your Google API key first.', 'error'); return; }
    if (!B.isValidKeyFormat(key)) {
      setMsg('That doesn\'t look like a Google API key. Google keys start with "AIza" or "AQ.".', 'error');
      return;
    }
    setBusy(true);
    const r = await B.verifyKey(key);
    if (r.ok || r.kind === 'network') {
      // On a network hiccup we trust the format check; a wrong key is reported at reading time.
      B.saveOwnKey(key);
      choose('own');
      return;
    }
    setBusy(false);
    setMsg(r.message || 'Google could not verify this key.', 'error');
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const f = [...el.modal.querySelectorAll('button, input, a[href]')].filter(x => !x.disabled && !x.hidden && x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  window.OracleAccess = { init, open, close, renderBadge };
})();
