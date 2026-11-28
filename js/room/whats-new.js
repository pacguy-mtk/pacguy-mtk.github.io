/* Version tag beside the ZJ logo, and its "What's new" window. Content: data/whats-new.js */
(function(){
  'use strict';
  const list = window.WHATS_NEW || [], tag = document.getElementById('wnTag');
  if(!list.length || !tag) return;
  const LABEL = { new: 'New', visual: 'Visual', upgrade: 'Upgrade', fix: 'Fix' };
  const KEY = 'zj_seen_ver', current = list[0].version;
  let box = null;
  const seen = () => { try { return localStorage.getItem(KEY); } catch(e){ return null; } };
  const markSeen = () => { try { localStorage.setItem(KEY, current); } catch(e){} };
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

  tag.querySelector('b').textContent = 'v' + current;
  tag.hidden = false;
  if(seen() !== current) tag.classList.add('is-new');

  function build(){
    box = document.createElement('dialog');
    box.id = 'wn';
    box.setAttribute('aria-labelledby', 'wnTitle');
    box.innerHTML = '<div class="wn-panel"><header><h2 id="wnTitle">What\'s new</h2>'
      + '<button type="button" class="wn-close" aria-label="Close">&#10005;</button></header><div class="wn-body">'
      + list.map((v, i) => '<details' + (i ? '' : ' open') + '><summary><b>v' + esc(v.version) + '</b><span>' + esc(v.title) + '</span>'
        + '<small>' + esc(v.date) + '</small></summary><p>' + esc(v.summary) + '</p><ul>'
        + v.items.map(x => '<li><em class="t-' + esc(x[0]) + '">' + (LABEL[x[0]] || esc(x[0])) + '</em>' + esc(x[1]) + '</li>').join('')
        + '</ul>'
        + (v.image ? '<a href="' + esc(v.image) + '" target="_blank" rel="noopener"><img loading="lazy" src="' + esc(v.image) + '" alt="Screenshot of version ' + esc(v.version) + '"></a>' : '')
        + '</details>').join('')
      + '</div></div>';
    document.body.appendChild(box);
    box.querySelector('.wn-close').addEventListener('click', () => box.close());
    box.addEventListener('click', e => { if(e.target === box) box.close(); });   /* click outside */
    /* keep Escape and other keys from also driving the room behind */
    box.addEventListener('keydown', e => e.stopPropagation());
  }

  tag.addEventListener('click', () => {
    if(!box) build();
    box.showModal();
    markSeen();
    tag.classList.remove('is-new');
  });
})();
