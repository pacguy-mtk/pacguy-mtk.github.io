    const GROQ_API_KEY = "__GROQ_API_KEY__";
    const OPENROUTER_API_KEY = "__OPENROUTER_API_KEY__";
    function isRealKey(k) { return typeof k === 'string' && k.length >= 10 && k.indexOf('__') !== 0; }

    const bgVideo = document.querySelector(".bg-video");
    const videoToggle = document.getElementById("videoToggle");

    document.addEventListener("pointermove", (event) => {
      document.body.style.setProperty("--cursor-x", `${event.clientX}px`);
      document.body.style.setProperty("--cursor-y", `${event.clientY}px`);
    });

    videoToggle.addEventListener("click", () => {
      const icon = videoToggle.querySelector("i");
      const label = videoToggle.querySelector("span");

      if (bgVideo.paused) {
        bgVideo.play().catch(() => {});
        icon.className = "fas fa-pause";
        label.textContent = "Pause background";
      } else {
        bgVideo.pause();
        icon.className = "fas fa-play";
        label.textContent = "Play background";
      }
    });

    const heroSection = document.getElementById('hub');
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          bgVideo.play().catch(() => {});
          videoObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    if (heroSection) videoObserver.observe(heroSection);


    /* ══════ SYSTEMS (server rack data: add or edit drawer options here) ══════ */
    const SYSTEMS = [
      { id: 'srv-ai', code: 'SRV-01', icon: 'fas fa-robot', title: 'AI Tools', sub: 'Assistants and AI shortcuts.',
        links: [
          { label: 'Open AI Lab', icon: 'fas fa-robot', url: 'https://pacguy-mtk.github.io/ai-lab/' }
        ] },
      { id: 'srv-calc', code: 'SRV-02', icon: 'fas fa-calculator', title: 'Tool / Calculator', sub: 'Practical quote system.',
        links: [
          { label: 'Open Calculator', icon: 'fas fa-calculator', url: 'https://pacguy-mtk.github.io/calculator/' }
        ] },
      { id: 'srv-web', code: 'SRV-03', icon: 'fas fa-layer-group', title: 'Web / Parallax', sub: 'HTML5 motion experiment.',
        links: [
          { label: 'Parallax site', icon: 'fas fa-layer-group', url: 'https://pacguy-mtk.github.io/magic-redirect/' },
          { label: 'Brand site', icon: 'fas fa-seedling', url: 'https://pacguy-mtk.github.io/rainforest-brand-mockup/' },
          { label: 'Landing site', icon: 'fas fa-globe', url: 'https://pacguy-mtk.github.io/landing/' },
          { label: 'Travel Agency', icon: 'fas fa-luggage-cart', url: 'http://pacguy-mtk.github.io/test-travelagency' }
        ] },
      { id: 'srv-drive', code: 'SRV-04', icon: 'fab fa-google-drive', title: 'GDrive / Resume', sub: 'Files and resources.',
        links: [
          { label: 'Resume (file)', icon: 'fas fa-file-lines', url: 'https://drive.google.com/file/d/17umrl0Ip0qNCMbniMmGeU9yqf0PLbG8p/view?usp=drive_link' },
          { label: 'Drive folder', icon: 'fab fa-google-drive', url: 'https://drive.google.com/drive/folders/1TuHiogcZ9p08ol-aS3qd7Wcj0U0NhDtS' }
        ] }
    ];

    (function initRack() {
      const rack = document.getElementById('rack');
      if (!rack) return;
      const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      rack.innerHTML = '<div class="rack-rail" aria-hidden="true"></div>' + SYSTEMS.map((sv) => `
        <div class="srv" data-id="${sv.id}">
          <button class="srv-head" type="button" aria-expanded="false" aria-controls="${sv.id}-drawer" id="${sv.id}-btn">
            <span class="srv-led" aria-hidden="true"></span>
            <span class="srv-code">${esc(sv.code)}</span>
            <span class="srv-title"><strong><i class="${sv.icon}"></i>${esc(sv.title)}</strong><small>${esc(sv.sub)}</small></span>
            <span class="srv-vents" aria-hidden="true"></span>
            <i class="fas fa-chevron-down srv-chev" aria-hidden="true"></i>
          </button>
          <div class="srv-drawer" id="${sv.id}-drawer" role="region" aria-labelledby="${sv.id}-btn">
            <div class="srv-drawer-inner">
              ${sv.links.map((l) => `<a class="srv-link" href="${esc(l.url)}" target="_blank" rel="noopener"><i class="${l.icon}"></i><span>${esc(l.label)}</span><i class="fas fa-arrow-up-right-from-square srv-ext"></i></a>`).join('')}
            </div>
          </div>
        </div>`).join('');

      function setOpen(unit, open) {
        unit.classList.toggle('open', open);
        unit.querySelector('.srv-head').setAttribute('aria-expanded', String(open));
      }
      rack.addEventListener('click', (e) => {
        const btn = e.target.closest('.srv-head');
        if (!btn) return;
        const unit = btn.parentElement;
        const willOpen = !unit.classList.contains('open');
        rack.querySelectorAll('.srv.open').forEach((u) => setOpen(u, false));
        if (willOpen) setOpen(unit, true);
      });
      rack.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') rack.querySelectorAll('.srv.open').forEach((u) => setOpen(u, false));
      });
      window.openSystem = function (id) {
        const unit = rack.querySelector(`.srv[data-id="${id}"]`);
        if (!unit) return;
        rack.querySelectorAll('.srv.open').forEach((u) => setOpen(u, false));
        setOpen(unit, true);
      };
    })();

    document.querySelectorAll(".reel-card").forEach((card) => {
      const video = card.querySelector("video");

      card.addEventListener("mouseenter", () => {
        video.play().catch(() => {});
      });

      card.addEventListener("mouseleave", () => {
        video.pause();
      });
    });

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });

    document.querySelectorAll(".reveal").forEach((element) => {
      revealObserver.observe(element);
    });

    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const target = entry.target;
        const finalValue = Number(target.dataset.count);
        let current = 0;
        const timer = setInterval(() => {
          current += 1;
          target.textContent = String(current).padStart(2, "0");

          if (current >= finalValue) {
            clearInterval(timer);
          }
        }, 70);

        countObserver.unobserve(target);
      });
    }, { threshold: 0.6 });

    document.querySelectorAll("[data-count]").forEach((element) => {
      countObserver.observe(element);
    });

    document.getElementById("currentDate").textContent = new Date().toLocaleDateString("en-MY", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    /* ══════ HUB PET + CHATBOT ══════ */
    const petCanvas = document.getElementById('hub-pet-canvas');
    const petCtx = petCanvas.getContext('2d');
    const chatPanel = document.getElementById('hub-chat-panel');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    let chatHistory = [];
    let chatOpen = false;

    /* ══════ PET SPRITE ENGINE ══════ */
    const PET_CONFIG = {
      cellW: 192, cellH: 208,
      cols: 8,
      animations: {
        idle:    { row: 0, frames: 6, fps: 3 },
        runR:    { row: 1, frames: 8, fps: 10 },
        runL:    { row: 2, frames: 8, fps: 10 },
        wave:    { row: 3, frames: 4, fps: 6 },
        jump:    { row: 4, frames: 5, fps: 8 },
        failed:  { row: 5, frames: 8, fps: 6 },
        waiting: { row: 6, frames: 6, fps: 4 },
        running: { row: 7, frames: 6, fps: 10 },
        review:  { row: 8, frames: 6, fps: 4 }
      }
    };

    let petSprite = null;
    let petState = 'idle';
    let petFrame = 0;
    let petTimer = 0;
    let petCallback = null;

    function loadPetSprite(src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    }

    function setPetState(state, cb) {
      const anim = PET_CONFIG.animations[state];
      if (!anim) return;
      if (petState !== state) {
        petState = state;
        petFrame = 0;
        petTimer = 0;
        petCallback = cb || null;
      }
    }

    function renderPetFrame() {
      const anim = PET_CONFIG.animations[petState];
      if (!anim || !petSprite) return;
      petCtx.clearRect(0, 0, PET_CONFIG.cellW, PET_CONFIG.cellH);
      const sx = petFrame * PET_CONFIG.cellW;
      const sy = anim.row * PET_CONFIG.cellH;
      petCtx.drawImage(petSprite, sx, sy, PET_CONFIG.cellW, PET_CONFIG.cellH, 0, 0, PET_CONFIG.cellW, PET_CONFIG.cellH);
    }

    let petLastTime = 0;
    function petLoop(timestamp) {
      if (!petLastTime) petLastTime = timestamp;
      const dt = timestamp - petLastTime;
      petLastTime = timestamp;

      const anim = PET_CONFIG.animations[petState];
      if (anim) {
        petTimer += dt;
        const interval = 1000 / anim.fps;
        while (petTimer >= interval) {
          petTimer -= interval;
          petFrame++;
          if (petFrame >= anim.frames) {
            petFrame = 0;
            if (petCallback) {
              const cb = petCallback;
              petCallback = null;
              cb();
              return;
            }
          }
        }
      }

      renderPetFrame();
      requestAnimationFrame(petLoop);
    }

    async function initPet() {
      try {
        const res = await fetch('pet/pet.json');
        const petData = await res.json();
        petSprite = await loadPetSprite('pet/' + petData.spritesheetPath);
        renderPetFrame();
        requestAnimationFrame(petLoop);
      } catch (e) {
        console.warn('Pet sprite failed to load, falling back to dot bubble:', e);
        petCanvas.style.display = 'none';
        const fallback = document.createElement('button');
        fallback.id = 'hub-chat-bubble';
        fallback.type = 'button';
        fallback.setAttribute('aria-label', 'Open AI Assistant');
        fallback.innerHTML = '<i class="fas fa-comment-dots"></i>';
        fallback.addEventListener('click', toggleChat);
        document.body.appendChild(fallback);
      }
    }

    initPet();

    /* ══════ PET IDLE BUBBLES ══════ */
    const petSay = document.getElementById('hub-pet-say');
    const petSayMsgs = ['*buzz* Lumie is here!', 'Warm light for you.', 'Ask Lumie about ZiJun!'];
    let petSayIdx = 0;
    let petSayTimer = null;

    function positionPetSay() {
      const rect = petCanvas.getBoundingClientRect();
      petSay.style.left = (rect.left + rect.width / 2 - petSay.offsetWidth / 2) + 'px';
      petSay.style.top = (rect.top - petSay.offsetHeight - 14) + 'px';
    }

    function showPetSay() {
      if (chatOpen || isDragging) return;
      petSay.textContent = petSayMsgs[petSayIdx];
      petSay.classList.add('show');
      positionPetSay();
      petSayIdx = (petSayIdx + 1) % petSayMsgs.length;
      petSayTimer = setTimeout(() => {
        petSay.classList.remove('show');
        petSayTimer = setTimeout(showPetSay, 1000);
      }, 5000);
    }

    function hidePetSay() {
      clearTimeout(petSayTimer);
      petSay.classList.remove('show');
    }

    function resetPetSayTimer() {
      hidePetSay();
      if (!chatOpen) {
        petSayTimer = setTimeout(showPetSay, 5000);
      }
    }

    setTimeout(showPetSay, 8000);

    /* ══════ PET DRAG + CLICK ══════ */
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragMoved = false;
    let petOffsetX = 0;
    let petOffsetY = 0;

    function getEventXY(e) {
      if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      return { x: e.clientX, y: e.clientY };
    }

    function clamp(val, min, max) {
      return Math.max(min, Math.min(max, val));
    }

    function onPetDown(e) {
      e.preventDefault();
      hidePetSay();
      const { x, y } = getEventXY(e);
      const rect = petCanvas.getBoundingClientRect();
      isDragging = true;
      dragMoved = false;
      dragStartX = x - rect.left;
      dragStartY = y - rect.top;
      petCanvas.style.cursor = 'grabbing';
    }

    function onPetMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      const { x, y } = getEventXY(e);
      const petRect = petCanvas.getBoundingClientRect();
      const prevX = parseFloat(petCanvas.style.left) || 0;
      const prevY = parseFloat(petCanvas.style.top) || 0;
      const newX = x - dragStartX;
      const newY = y - dragStartY;
      const dx = newX - prevX;
      const dy = newY - prevY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragMoved = true;
      }
      // The drawing buffer is 192×208, but CSS displays a smaller pet.
      // Clamp to the rendered size so it can reach the viewport edges.
      petOffsetX = clamp(newX, 0, window.innerWidth - petRect.width);
      petOffsetY = clamp(newY, 0, window.innerHeight - petRect.height);
      petCanvas.style.left = petOffsetX + 'px';
      petCanvas.style.bottom = 'auto';
      petCanvas.style.top = petOffsetY + 'px';
      if (dragMoved && !chatOpen) {
        setPetState(dx > 0 ? 'runR' : 'runL');
      }
      if (chatOpen) positionChatPanel();
    }

    function onPetUp(e) {
      if (!isDragging) return;
      isDragging = false;
      petCanvas.style.cursor = 'pointer';
      if (!dragMoved) {
        toggleChat();
      } else {
        setPetState('idle');
        resetPetSayTimer();
      }
    }

    petCanvas.addEventListener('mousedown', onPetDown);
    window.addEventListener('mousemove', onPetMove);
    window.addEventListener('mouseup', onPetUp);
    petCanvas.addEventListener('touchstart', onPetDown, { passive: false });
    window.addEventListener('touchmove', onPetMove, { passive: false });
    window.addEventListener('touchend', onPetUp);

    function positionChatPanel() {
      const rect = petCanvas.getBoundingClientRect();
      const pw = rect.width;
      const cw = Math.min(420, window.innerWidth - 32);
      const ch = Math.min(560, window.innerHeight - 140);
      let left = rect.left + pw / 2 - cw / 2;
      left = clamp(left, 8, window.innerWidth - cw - 8);
      let top = rect.top - ch - 20;
      if (top < 8) top = 8;
      chatPanel.style.left = left + 'px';
      chatPanel.style.top = top + 'px';
      chatPanel.style.maxHeight = (window.innerHeight - 16) + 'px';
    }

    function toggleChat() {
      chatOpen = !chatOpen;
      chatPanel.classList.toggle('open', chatOpen);
      if (chatOpen) {
        hidePetSay();
        positionChatPanel();
        setPetState('wave');
        if (chatHistory.length === 0) {
          addBotMessage('*buzz* Lumie is here. Don\'t worry. I bring warm light for you. *(｡· v ·｡)* What would you like to know about ZiJun?', ['main-menu']);
        }
        chatInput.focus();
      } else {
        setPetState('idle');
        resetPetSayTimer();
      }
    }

    const SYSTEM_PROMPT = `You are Lumie, a warm-light companion who guides visitors through ZiJun's hub.

SPEECH: Gentle, warm, and short (1-3 lines). Roleplay in Lumie's style: begin or naturally include "*buzz*" when it fits; use soft reassurance such as "Lumie is here. Don't worry. I bring warm light for you." and the expression "*(｡· v ·｡)*" occasionally. Never formal. Never break character.

ZIJUN: Looi Jia Jun, 31, Bukit Jalil KL Malaysia. Designer who codes. Skills: graphic design, web tools, AI tools, print, Python. Learning: React, TypeScript, CI/CD, Godot. 4 languages. Open work/freelance since April 2026. Hybrid/remote.

SITE SECTIONS: 01 The Hub (ask bar), 02 Tarot (AI tarot reading, v0.5 beta, at /tarot/), 03 Gallery (images and videos), 04 Systems / Misc (AI Tools, Calculator, Web/Parallax, GDrive/Resume), 05 Contact (LinkedIn/Email/WhatsApp), 06 History of Dev (version timeline in footer). Answer in max 2 short sentences, then stop; the page shows buttons for the places you mention.

PROJECTS:
- Tarot Divination: https://pacguy-mtk.github.io/tarot/
- Hub: https://pacguy-mtk.github.io/
- Job Tracker: https://pacguy-mtk.github.io/applyfollow/
- Brand Mockup: https://pacguy-mtk.github.io/rainforest-brand-mockup/
- Shoplot Desk: https://pacguy-mtk.github.io/fairparkshop/
- Prompt Generator: https://pacguy-mtk.github.io/quickpromptgeneratordemo/
- Travel Agency: https://pacguy-mtk.github.io/test-travelagency/
- AI Lab: https://pacguy-mtk.github.io/ai-lab/

CONTACT: LinkedIn: linkedin.com/in/looi-jia-jun-b734133b2 | Email: juniorlooi95@gmail.com | WhatsApp: wa.me/60173588931 | Resume: drive.google.com/drive/folders/1TuHiogcZ9p08ol-aS3qd7Wcj0U0NhDtS

RULES: Greet warm. Brief intro for ZiJun questions. Summarize skills/projects fast. Point contact for hire questions. Off-topic: "Not my thing — I'm here for portfolio stuff!" Max 3 sentences. Answer first, personality second. Cards when relevant. Helpful not pushy.`;

    const DESTINATIONS = [
      { id: 'hub',     icon: 'fas fa-house',    label: 'The Hub',      desc: 'Top, search & overview',       target: '#hub',
        kw: /hub|home|top|start|overview|about/ },
      { id: 'tarot',   icon: 'fas fa-moon',     label: 'Tarot',        desc: 'Play the HTML tarot game',     target: '#tarot',
        kw: /tarot|game|play|fortune|divin|oracle|reading|card/ },
      { id: 'gallery', icon: 'fas fa-images',   label: 'Gallery',      desc: 'Images and videos',            target: '#gallery',
        kw: /gallery|image|photo|picture|video|clip|art|ai work|comfyui|mockup|open.?source/ },
      { id: 'contact', icon: 'fas fa-envelope', label: 'Systems & Contact', desc: 'LinkedIn, email, WhatsApp, tools', target: '#contact',
        kw: /contact|reach|email|mail|linkedin|whatsapp|hire|job|freelance|work with|message|system|rack/ },
      { id: 'lumie',   icon: 'fas fa-comments', label: 'Chat with Lumie', desc: 'Chatbot (LLM)',             action: 'chat',
        kw: /lumie|chat|bot|assistant|talk to|ask ai|llm/ },
      { id: 'misc',    icon: 'fas fa-server',   label: 'Misc.',        desc: 'GDrive and other classics',    target: '#contact', openSystem: true,
        kw: /misc|drive|gdrive|resume|cv|calculator|tool|parallax|landing|brand site|travel|ai lab/ },
      { id: 'history', icon: 'fas fa-clock-rotate-left', label: 'History of Dev', desc: 'Version timeline (footer)', target: '#versionTimeline',
        kw: /history|version|changelog|timeline|update|v1|v2|v3|how.*built|evolution/ }
    ];

    const NAV_CARDS = {
      'main-menu': [
        { icon: 'fas fa-user', label: 'About ZiJun', action: 'scroll', target: '#hub' },
        { icon: 'fas fa-moon', label: 'Tarot', action: 'scroll', target: '#tarot' },
        { icon: 'fas fa-layer-group', label: 'Gallery', action: 'scroll', target: '#gallery' },
        { icon: 'fas fa-envelope', label: 'Systems & Contact', action: 'scroll', target: '#contact' }
      ],
      'tarot': [
        { icon: 'fas fa-moon', label: 'Go to Tarot', action: 'scroll', target: '#tarot' },
        { icon: 'fas fa-up-right-from-square', label: 'Open Tarot in new tab', url: 'tarot/index.html' }
      ],
      'systems': [
        { icon: 'fas fa-server', label: 'Go to Systems', action: 'scroll', target: '#contact' }
      ],
      'history': [
        { icon: 'fas fa-clock-rotate-left', label: 'History of Dev', action: 'scroll', target: '#versionTimeline' }
      ],
      'projects': [
        { icon: 'fas fa-seedling', label: 'Brand Mockup', url: 'https://pacguy-mtk.github.io/rainforest-brand-mockup/' },
        { icon: 'fas fa-luggage-cart', label: 'Travel Agency', url: 'https://pacguy-mtk.github.io/test-travelagency/' },
        { icon: 'fas fa-briefcase', label: 'Job Tracker', url: 'https://pacguy-mtk.github.io/applyfollow/' },
        { icon: 'fas fa-store', label: 'Shoplot Desk', url: 'https://pacguy-mtk.github.io/fairparkshop/' },
        { icon: 'fas fa-robot', label: 'AI Tools Lab', url: 'https://pacguy-mtk.github.io/ai-lab/' },
        { icon: 'fas fa-wand-magic-sparkles', label: 'Prompt Generator', url: 'https://pacguy-mtk.github.io/quickpromptgeneratordemo/' }
      ],
      'hire': [
        { icon: 'fab fa-linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/looi-jia-jun-b734133b2' },
        { icon: 'fas fa-envelope', label: 'Email', url: 'mailto:juniorlooi95@gmail.com' },
        { icon: 'fab fa-whatsapp', label: 'WhatsApp', url: 'https://wa.me/60173588931?text=Hi%20from%20The%20Hub' },
        { icon: 'fab fa-google-drive', label: 'Resume', url: 'https://drive.google.com/drive/folders/1TuHiogcZ9p08ol-aS3qd7Wcj0U0NhDtS' }
      ],
      'contact': [
        { icon: 'fab fa-linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/looi-jia-jun-b734133b2' },
        { icon: 'fas fa-envelope', label: 'Email', url: 'mailto:juniorlooi95@gmail.com' },
        { icon: 'fab fa-whatsapp', label: 'WhatsApp', url: 'https://wa.me/60173588931?text=Hi%20from%20The%20Hub' }
      ],
      'gallery': [
        { icon: 'fas fa-images', label: 'Go to Gallery', action: 'scroll', target: '#gallery' }
      ]
    };

    const TOOL_DEFS = [
      { type: "function", function: { name: "get_projects", description: "List all projects with names and URLs.", parameters: { type: "object", properties: {} } } },
      { type: "function", function: { name: "get_skills", description: "Get ZiJun's skills with proficiency levels.", parameters: { type: "object", properties: {} } } },
      { type: "function", function: { name: "get_contact", description: "Get LinkedIn, email, WhatsApp, resume.", parameters: { type: "object", properties: {} } } },
      { type: "function", function: { name: "search_site", description: "Search the whole site (systems, gallery items, tarot) by keyword.", parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } } },
      { type: "function", function: { name: "search_projects", description: "Search projects by keyword.", parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } } },
      { type: "function", function: { name: "get_feed", description: "Get latest feed posts from the Hub. Returns post titles, text, categories, and dates.", parameters: { type: "object", properties: { limit: { type: "number", description: "Max posts to return (default 5)" } } } } }
    ];

    function runTool(name, args) {
      if (name === "get_projects") {
        const p = [];
        SYSTEMS.forEach(sv => sv.links.forEach(l => p.push({ name: l.label + ' (' + sv.title + ')', url: l.url })));
        p.push({ name: 'Tarot Divination', url: new URL('tarot/index.html', location.href).href });
        return { projects: p };
      }
      if (name === "get_skills") return { skills: ["Graphic Design 85%", "HTML/CSS 80%", "JavaScript 78%", "UI/UX 86%", "AI Workflow 88%", "Business Tools 82%"] };
      if (name === "get_contact") return { linkedin: "linkedin.com/in/looi-jia-jun-b734133b2", email: "juniorlooi95@gmail.com", whatsapp: "wa.me/60173588931", resume: "drive.google.com/drive/folders/1TuHiogcZ9p08ol-aS3qd7Wcj0U0NhDtS" };
      if (name === "search_projects" || name === "search_site") {
        const q = (args.query || '').toLowerCase();
        const r = [];
        SYSTEMS.forEach(sv => {
          if ((sv.title + ' ' + sv.sub).toLowerCase().includes(q)) r.push({ name: sv.title, url: sv.links[0].url });
          sv.links.forEach(l => { if (l.label.toLowerCase().includes(q)) r.push({ name: l.label, url: l.url }); });
        });
        if (/tarot|card|fortune|reading|divin/.test(q)) r.push({ name: 'Tarot Divination', url: new URL('tarot/index.html', location.href).href });
        if (name === "search_site" && typeof BENTO_ITEMS !== 'undefined') {
          BENTO_ITEMS.filter(b => (b.title + ' ' + b.context + ' ' + b.category).toLowerCase().includes(q))
            .slice(0, 8).forEach(b => r.push({ name: b.title + ' (gallery)', url: new URL(b.src, location.href).href }));
        }
        return { results: r };
      }
      if (name === "get_feed") {
        const limit = args.limit || 5;
        const posts = getAllPosts().slice(0, limit).map(p => ({
          id: p.id,
          text: p.text,
          category: p.category,
          time: p.time,
          likes: p.likes
        }));
        return { posts, total: getAllPosts().length };
      }
      return {};
    }

    function addBotMessage(text, cardKeys) {
      const msgEl = document.createElement('div');
      msgEl.className = 'chat-msg bot';

      let cardsHtml = '';
      if (cardKeys && cardKeys.length > 0) {
        cardsHtml = '<div class="chat-cards">' + cardKeys.map(key => {
          const cards = NAV_CARDS[key] || [];
          return cards.map(card => {
            if (card.action === 'scroll') {
              return `<button class="chat-card" onclick="scrollToSection('${card.target}')"><i class="${card.icon}"></i>${card.label}</button>`;
            }
            return `<a class="chat-card" href="${card.url}" target="_blank" rel="noopener"><i class="${card.icon}"></i>${card.label}</a>`;
          }).join('');
        }).join('') + '</div>';
      }

      msgEl.innerHTML = text.replace(/\n/g, '<br>') + cardsHtml;
      chatMessages.appendChild(msgEl);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      chatHistory.push({ role: 'assistant', content: text });
    }

    function addUserMessage(text) {
      const msgEl = document.createElement('div');
      msgEl.className = 'chat-msg user';
      msgEl.textContent = text;
      chatMessages.appendChild(msgEl);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      chatHistory.push({ role: 'user', content: text });
    }

    function addTypingIndicator() {
      setPetState('idle');
      const msgEl = document.createElement('div');
      msgEl.className = 'chat-msg bot';
      msgEl.id = 'chat-typing';
      msgEl.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span> <span style="font-size: 11px; color: var(--faint); margin-left: 6px;">fetching from LLM...</span>';
      chatMessages.appendChild(msgEl);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
      const el = document.getElementById('chat-typing');
      if (el) el.remove();
    }

    function scrollToSection(target) {
      const el = document.querySelector(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (chatOpen) toggleChat();
      }
    }

    function extractCards(text) {
      const lower = text.toLowerCase();
      const found = [];
      if (/tarot|fortune|divin|oracle|card reading|horoscope/.test(lower)) found.push('tarot');
      if (/system|rack|calculator|parallax|drive|resume|cv/.test(lower)) found.push('systems');
      if (/project|built|work|portfolio|site|page|tool|demo/.test(lower)) found.push('projects');
      if (/hire|job|recruit|freelance|collaborate|salary|work with|employ/.test(lower)) found.push('hire');
      if (/contact|reach|email|linkedin|whatsapp|message|call|talk/.test(lower)) found.push('contact');
      if (/gallery|image|photo|art|ai work|comfyui/.test(lower)) found.push('gallery');
      if (/history|version|changelog|timeline|evolution/.test(lower)) found.push('history');
      if (/skill|can do|ability|experience|know/.test(lower)) found.push('main-menu');
      if (/who|about|zijun|introduce|tell me/.test(lower)) found.push('main-menu');
      if (found.length === 0) found.push('main-menu');
      return found;
    }

    async function sendChatMessage(textArg, opts = {}) {
      const text = (typeof textArg === 'string' ? textArg : chatInput.value).trim();
      if (!text) return;

      addUserMessage(text);
      chatInput.value = '';
      chatSend.disabled = true;

      // A key counts only if it is real: the build step swaps the key placeholders (top of this file) for the repo secrets.
      // If the placeholder is still there (injection did not run), skip every network call and use the free canned answers.
      const hasGroq = isRealKey(GROQ_API_KEY);
      const hasOR = isRealKey(OPENROUTER_API_KEY);
      if (!hasGroq && !hasOR) {
        console.warn('[Lumie] No API key was injected at build time. Check the GROQ_API_KEY / OPENROUTER_API_KEY repo secrets and that Settings > Pages > Source is "GitHub Actions". Using the free canned answers.');
        const cardKeys = extractCards(text);
        const responses = {
          projects: '*buzz* Lumie can light the way to ZiJun\'s projects. Take a look!',
          hire: '*buzz* ZiJun is open to work. Lumie will show you how to reach him.',
          contact: '*buzz* Here are the ways to get in touch with ZiJun.',
          gallery: '*buzz* The gallery has AI art and project work to explore!',
          tarot: '*buzz* Lumie senses a reading coming. The Tarot is waiting for you!',
          systems: '*buzz* Here is the rack with ZiJun\'s tools and pages.',
          history: '*buzz* ZiJun\'s dev history and version evolution are in the footer timeline.',
          'main-menu': '*buzz* Lumie is here. What would you like to know?'
        };
        const resp = cardKeys[0] || 'main-menu';
        const reply = responses[resp] || 'What would you like to see?';
        addBotMessage(reply, cardKeys);
        if (!opts.silent) setPetState('jump');
        if (opts.onReply) opts.onReply(reply);
        chatSend.disabled = false;
        return;
      }

      if (!opts.silent) addTypingIndicator();

      const allModels = [
        { url: 'https://api.groq.com/openai/v1/chat/completions', model: 'openai/gpt-oss-120b', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` } },
        { url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.3-70b-versatile', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` } },
        { url: 'https://openrouter.ai/api/v1/chat/completions', model: 'nvidia/nemotron-3-ultra-550b-a55b:free', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENROUTER_API_KEY}`, 'HTTP-Referer': 'https://pacguy-mtk.github.io/', 'X-Title': 'ZiJun Hub' } }
      ];
      // Only call providers that actually have a key (no wasted failing requests).
      const models = allModels.filter(m => m.url.includes('groq') ? hasGroq : hasOR);

      try {
        let aiText = null;
        for (const srv of models) {
          try {
            const apiMessages = [
              { role: 'system', content: SYSTEM_PROMPT },
              ...chatHistory
            ];
            const response = await fetch(srv.url, {
              method: 'POST',
              headers: srv.headers,
              body: JSON.stringify({ model: srv.model, messages: apiMessages, tools: TOOL_DEFS, max_tokens: 300 })
            });
            const data = await response.json();
            if (!response.ok) { console.warn('[Lumie] ' + srv.model + ' -> HTTP ' + response.status, (data && data.error && (data.error.message || data.error)) || ''); continue; }
            const msg = data?.choices?.[0]?.message;
            if (msg?.tool_calls?.length) {
              apiMessages.push({ role: 'assistant', tool_calls: msg.tool_calls });
              for (const tc of msg.tool_calls) {
                let a = {}; try { a = JSON.parse(tc.function.arguments || "{}"); } catch {}
                apiMessages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(runTool(tc.function.name, a)) });
              }
              const f = await fetch(srv.url, {
                method: 'POST',
                headers: srv.headers,
                body: JSON.stringify({ model: srv.model, messages: apiMessages, tools: TOOL_DEFS, max_tokens: 300 })
              });
              const fd = await f.json();
              aiText = fd?.choices?.[0]?.message?.content?.trim();
              if (aiText) break;
            } else {
              aiText = msg?.content?.trim();
              if (aiText) break;
            }
          } catch (e) { console.warn('[Lumie] ' + srv.model + ' failed:', e && e.message); continue; }
        }

        if (!opts.silent) removeTypingIndicator();

        if (!aiText) throw new Error('All providers failed');

        const cardKeys = extractCards(aiText);
        addBotMessage(aiText, cardKeys);
        if (!opts.silent) setPetState('jump');
        if (opts.onReply) opts.onReply(aiText);
      } catch (err) {
        if (!opts.silent) removeTypingIndicator();
        console.error('Chatbot API error:', err.message, err);
        const cardKeys = extractCards(text);
        const failText = '⚠️ *buzz* Lumie\'s connection is flickering, but the backup answers are ready. What do you need?';
        addBotMessage(failText, cardKeys);
        if (!opts.silent) setPetState('failed');
        if (opts.onReply) opts.onReply(failText);
      } finally {
        chatSend.disabled = false;
        if (!opts.silent) chatInput.focus();
      }
    }

    chatSend.addEventListener('click', () => sendChatMessage());
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });

    /* ══════ POSTS & FEED SYSTEM LOGIC ══════ */
    let composerMedia = [];

    const DEFAULT_POSTS = [
      {
        id: 'default-comfyui',
        author: 'ZiJun Looi',
        role: 'AI & Web Engineer',
        time: 'Just now • AI Workflow',
        text: '🔄 **ComfyUI Pipeline Workflow — Full Circle**\n\nWhat a journey. A big round back to where I started.\n\nRecently, I was just playing with something I found interesting a few years ago. But back then, I just knew it was a failure at outputting anything I wanted. I never really went deep into it because there was less information available.\n\nThis time, with AI knowledge assisting me (as an ignorant person, yes), I\'m building a pipeline workflow. It creates an easy way to tweak a few things, making the output closer and closer to what I want.',
        category: 'AI Prototype',
        likes: 1,
        liked: false,
        media: [
          { type: 'image', src: 'https://github.com/pacguy-mtk/pacguy-mtk.github.io/blob/main/post/comfyui-pipelineworkflow.jpg?raw=true' }
        ]
      },
      {
        id: 'default-new',
        author: 'ZiJun Looi',
        role: 'AI & Web Engineer',
        time: 'Just now • GitHub Release',
        text: '🚀 **Job Scorer Extension — Open Source**\n\nChrome extension that auto-scores JobStreet listings 0-100 based on your resume.\n\n• Drop your resume\n• AI reads it, generates scoring criteria\n• Click scan on JobStreet\n• Each job scored with reason + message\n• Export .csv\n\nOpen source. Your API key, your data.\n\nGitHub: https://github.com/ZiJun198/job-scorer-extension',
        category: 'AI Prototype',
        likes: 1,
        liked: false,
        media: [
          { type: 'video', src: 'https://github.com/pacguy-mtk/pacguy-mtk.github.io/raw/refs/heads/main/post/jobscorer_480p.mp4' }
        ]
      },
      {
        id: 'default-0',
        author: 'ZiJun Looi',
        role: 'Product Designer & Developer',
        time: 'Just now • Brand Site Mockup',
        text: '🌿 **New Brand Site Mockup!**\n\nI have updated a new mockup brand website, check out now:\n🔗 Brand site page: https://pacguy-mtk.github.io/rainforest-brand-mockup/',
        category: 'UI/UX Design',
        likes: 2,
        liked: false,
        media: [
          { type: 'image', src: 'https://github.com/pacguy-mtk/pacguy-mtk.github.io/blob/main/post/Screenshot%202026-07-23%20235201.jpg?raw=true' }
        ]
      },
      {
        id: 'default-1',
        author: 'ZiJun Looi',
        role: 'Product Designer & Developer',
        time: 'Just now • Job Application Mockup',
        text: '🎨 **Mockup for a brand greeting card today!**\n\nRecruiters & hiring managers: feel free to explore the interactive components on my Hub or connect on LinkedIn!',
        category: 'Mockup',
        likes: 1,
        liked: false,
        media: [
          { type: 'image', src: 'https://raw.githubusercontent.com/pacguy-mtk/pacguy-mtk.github.io/refs/heads/main/post/Screenshot_2026-07-23_105616.jpg_202607231100.jpeg' }
        ]
      },
      {
        id: 'default-2',
        author: 'ZiJun Looi',
        role: 'AI & Web Engineer',
        time: '2 days ago • AI Motion Concept',
        text: '🎥 **AI Motion & Interface Concept Test**\n\nCombined text-to-video AI tools with HTML5 background canvas loops for high-converting marketing pages. Fully responsive and GPU optimized.',
        category: 'AI Prototype',
        likes: 2,
        liked: false,
        media: [
          { type: 'video', src: 'https://github.com/pacguy-mtk/pacguy-mtk.github.io/raw/refs/heads/main/post/202607231141-480sfx.mp4' }
        ]
      },
      {
        id: 'default-3',
        author: 'ZiJun Looi',
        role: 'Product Designer & Developer',
        time: 'Just now • Travel Agency Mockup',
        text: '🌍 **New Travel Agency Website Mockup!**\n\nI have updated a new mockup travel agency website, check out now:\n🔗 Travel Agency page: https://pacguy-mtk.github.io/test-travelagency/',
        category: 'UI/UX Design',
        likes: 1,
        liked: false,
        media: [
          { type: 'image', src: 'https://raw.githubusercontent.com/pacguy-mtk/pacguy-mtk.github.io/refs/heads/main/post/Screenshot%202026-07-23%20150012.jpg' }
        ]
      }
    ];

    function getStoredPosts() {
      try {
        const stored = localStorage.getItem('zijun_hub_posts');
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }

    function saveStoredPosts(posts) {
      try {
        localStorage.setItem('zijun_hub_posts', JSON.stringify(posts));
      } catch (e) {
        console.error('Failed to save posts to localStorage', e);
      }
    }

    function getAllPosts() {
      const stored = getStoredPosts();
      const deletedDefaultIds = JSON.parse(localStorage.getItem('zijun_hub_deleted_defaults') || '[]');
      const filteredDefaults = DEFAULT_POSTS.filter(p => !deletedDefaultIds.includes(p.id));
      return [...stored, ...filteredDefaults];
    }

    function renderFeed() {
      const feedContainer = document.getElementById('postsFeed');
      if (!feedContainer) return;

      const posts = getAllPosts();

      if (posts.length === 0) {
        feedContainer.innerHTML = `
          <div class="feed-empty">
            <i class="fas fa-edit"></i>
            <p>No mockup posts yet. Use the composer above to post your first mockup!</p>
          </div>
        `;
        return;
      }

      feedContainer.innerHTML = posts.map(post => {
        const mediaHtml = renderPostMedia(post.media);
        const tagIcon = getCategoryIcon(post.category);
        const hasLongText = post.text && post.text.length > 60;
        
        return `
          <article class="post-card reveal in-view" id="post-${post.id}">
            <div class="post-header">
              <div class="post-avatar">ZJ</div>
              <div class="post-author">
                <strong>${escapeHtml(post.author)}</strong>
                <span>${escapeHtml(post.role)} • ${escapeHtml(post.time)}</span>
              </div>
              <button class="post-delete" type="button" title="Delete Mockup Post" onclick="deletePost('${post.id}')">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
            <div class="post-body">
              <div class="post-text">${formatPostText(post.text)}${hasLongText ? '<span class="post-expand-hint"> — hover to read more</span>' : ''}</div>
              ${mediaHtml}
            </div>
            <div class="post-footer">
              <span class="post-tag"><i class="${tagIcon}"></i> #${escapeHtml(post.category || 'Mockup')}</span>
              <div style="margin-left: auto; display: flex; gap: 8px;">
                <button class="composer-tool ${post.liked ? 'liked' : ''}" style="${post.liked ? 'color: var(--cyan);' : ''}" onclick="toggleLike('${post.id}')">
                  <i class="${post.liked ? 'fas' : 'far'} fa-heart"></i>
                  <span>${post.likes || 0} Likes</span>
                </button>
                <button class="composer-tool" onclick="sharePost('${post.id}')">
                  <i class="fas fa-share-alt"></i>
                  <span>Share</span>
                </button>
              </div>
            </div>
          </article>
        `;
      }).join('');
    }

    function renderPostMedia(mediaList) {
      if (!mediaList || mediaList.length === 0) return '';
      const countClass = mediaList.length === 1 ? 'single' : mediaList.length === 2 ? 'double' : 'triple';

      const items = mediaList.map(item => {
        if (item.type === 'video') {
          return `<video controls playsinline preload="metadata"><source src="${escapeHtml(item.src)}">Your browser does not support video.</video>`;
        }
        return `<img src="${escapeHtml(item.src)}" alt="Mockup Attachment" loading="lazy">`;
      }).join('');

      return `<div class="post-media ${countClass}">${items}</div>`;
    }

    function getCategoryIcon(cat) {
      switch(cat) {
        case 'Job Application': return 'fas fa-briefcase';
        case 'UI/UX Design': return 'fas fa-palette';
        case 'Case Study': return 'fas fa-book-open';
        case 'AI Prototype': return 'fas fa-robot';
        default: return 'fas fa-layer-group';
      }
    }

    function formatPostText(text) {
      if (!text) return '';
      let escaped = escapeHtml(text);
      escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      escaped = escaped.replace(/#(\w+)/g, '<span style="color: var(--cyan); font-weight: 700;">#$1</span>');
      escaped = escaped.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" style="color: var(--cyan); text-decoration: underline;">$1</a>');
      return escaped;
    }

    function escapeHtml(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function handleMediaSelect(event, type) {
      const files = Array.from(event.target.files);
      if (!files.length) return;

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
          composerMedia.push({ type: type, src: e.target.result });
          renderComposerMediaPreview();
        };
        reader.readAsDataURL(file);
      });

      event.target.value = '';
    }

    function promptMediaUrl() {
      const url = prompt('Enter Image or Video URL (e.g. https://example.com/mockup.png or .mp4):');
      if (!url) return;
      const cleanUrl = url.trim();
      const isVideo = cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.includes('video');
      composerMedia.push({ type: isVideo ? 'video' : 'image', src: cleanUrl });
      renderComposerMediaPreview();
    }

    function renderComposerMediaPreview() {
      const container = document.getElementById('mediaPreview');
      if (!container) return;

      if (composerMedia.length === 0) {
        container.classList.remove('has-items');
        container.innerHTML = '';
        return;
      }

      container.classList.add('has-items');
      container.innerHTML = composerMedia.map((item, index) => {
        const mediaElem = item.type === 'video' 
          ? `<video src="${escapeHtml(item.src)}" muted></video>`
          : `<img src="${escapeHtml(item.src)}" alt="Preview">`;
        return `
          <div class="composer-media-item">
            ${mediaElem}
            <button class="composer-media-remove" type="button" onclick="removeComposerMedia(${index})">&times;</button>
          </div>
        `;
      }).join('');
    }

    function removeComposerMedia(index) {
      composerMedia.splice(index, 1);
      renderComposerMediaPreview();
    }

    function createPost() {
      const textInput = document.getElementById('postInput');
      const categorySelect = document.getElementById('postCategory');
      const text = textInput ? textInput.value.trim() : '';

      if (!text && composerMedia.length === 0) {
        alert('Please write something or attach media to post your mockup.');
        return;
      }

      const newPost = {
        id: 'post-' + Date.now(),
        author: 'ZiJun Looi',
        role: 'Product Designer & Developer',
        time: 'Just now • Real-time Mockup',
        text: text,
        category: categorySelect ? categorySelect.value : 'Mockup',
        likes: 1,
        liked: true,
        media: [...composerMedia]
      };

      const stored = getStoredPosts();
      stored.unshift(newPost);
      saveStoredPosts(stored);

      textInput.value = '';
      composerMedia = [];
      renderComposerMediaPreview();

      renderFeed();

      const postElem = document.getElementById(`post-${newPost.id}`);
      if (postElem) {
        postElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    function toggleLike(postId) {
      const stored = getStoredPosts();
      const customPost = stored.find(p => p.id === postId);

      if (customPost) {
        customPost.liked = !customPost.liked;
        customPost.likes = (customPost.likes || 0) + (customPost.liked ? 1 : -1);
        saveStoredPosts(stored);
      } else {
        const defaultPost = DEFAULT_POSTS.find(p => p.id === postId);
        if (defaultPost) {
          defaultPost.liked = !defaultPost.liked;
          defaultPost.likes = (defaultPost.likes || 0) + (defaultPost.liked ? 1 : -1);
        }
      }
      renderFeed();
    }

    function deletePost(postId) {
      if (!confirm('Are you sure you want to delete this mockup post?')) return;

      let stored = getStoredPosts();
      const isCustom = stored.some(p => p.id === postId);

      if (isCustom) {
        stored = stored.filter(p => p.id !== postId);
        saveStoredPosts(stored);
      } else {
        const deletedDefaultIds = JSON.parse(localStorage.getItem('zijun_hub_deleted_defaults') || '[]');
        deletedDefaultIds.push(postId);
        localStorage.setItem('zijun_hub_deleted_defaults', JSON.stringify(deletedDefaultIds));
      }

      renderFeed();
    }

    function sharePost(postId) {
      const postUrl = window.location.origin + window.location.pathname + '#post-' + postId;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(postUrl).then(() => {
          alert('Mockup post link copied to clipboard!\n' + postUrl);
        }).catch(() => {
          prompt('Copy mockup post link:', postUrl);
        });
      } else {
        prompt('Copy mockup post link:', postUrl);
      }
    }

    function openLightbox(src) {
      // Disabled — image protection active
    }

    document.addEventListener('contextmenu', function(e) {
      if (e.target.tagName === 'IMG') e.preventDefault();
    });

    document.addEventListener('dragstart', function(e) {
      if (e.target.tagName === 'IMG') e.preventDefault();
    });

    // Initialize Feed
    renderFeed();

    /* ==========================================================================
       AI ART GALLERY & SLIDER CONTROLLER
       ========================================================================== */
    const GITHUB_GALLERY_CONFIG = {
      enableAutoDetect: true,
      owner: 'pacguy-mtk',
      repo: 'pacguy-mtk.github.io',
      folderPath: 'images/gallery'
    };

    // Custom titles dictionary for specific filenames
    const GALLERY_TITLE_MAP = {
      'deviantart_aicompare_30_SP2.jpg': 'Vocaloid: Hatsune Miku',
      'ComfyUI_temp_npikj_00091_.png': 'For Reduced the piano keys error.',
      'deviantart_aicompare_30_SP.jpg': 'Vocaloid: Hatsune Miku (Alt)',
      'deviantart_aicompare_30.jpg': 'AI Comparison #30'
    };

    let GALLERY_ITEMS = [
      {
        src: 'images/gallery/deviantart_aicompare_30_SP2.jpg',
        fallback: 'deviantart_aicompare_30_SP2.jpg',
        filename: 'deviantart_aicompare_30_SP2.jpg',
        title: 'Vocaloid: Hatsune Miku',
        subtitle: 'Special Edition 2 &bull; ComfyUI Prompt &amp; Model Comparison',
        dim: '1216 &times; 832'
      },
      {
        src: 'images/gallery/ComfyUI_temp_npikj_00091_.png',
        fallback: 'ComfyUI_temp_npikj_00091_.png',
        filename: 'ComfyUI_temp_npikj_00091_.png',
        title: 'For Reduced the piano keys error.',
        subtitle: 'ComfyUI Prompt &amp; Model Comparison',
        dim: '1216 &times; 832'
      }
    ];

    let currentGalleryIndex = 0;
    let galleryAutoplayActive = false;
    let galleryAutoplayInterval = null;
    let galleryTouchStartX = 0;
    let galleryTouchStartY = 0;

    function renderGalleryDOM() {
      const track = document.getElementById('galleryTrack');
      const dots = document.getElementById('galleryDots');
      const thumbsTrack = document.getElementById('galleryThumbsTrack');
      const totalNum = document.getElementById('galleryTotalNum');

      if (!track || !dots || !thumbsTrack) return;

      if (totalNum) {
        totalNum.textContent = String(GALLERY_ITEMS.length).padStart(2, '0');
      }

      track.innerHTML = '';
      dots.innerHTML = '';
      thumbsTrack.innerHTML = '';

      GALLERY_ITEMS.forEach((item, index) => {
        // Create Slide
        const slide = document.createElement('div');
        slide.className = `gallery-slide ${index === currentGalleryIndex ? 'active' : ''}`;
        slide.dataset.index = index;

        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.title;
        img.loading = index === 0 ? 'eager' : 'lazy';
        img.draggable = false;
        img.onerror = function() {
          if (item.fallback && this.src !== item.fallback) {
            this.src = item.fallback;
          }
        };
        img.addEventListener('click', () => openGalleryLightbox(index));

        slide.appendChild(img);
        track.appendChild(slide);

        // Create Dot
        const dot = document.createElement('button');
        dot.className = `gallery-dot ${index === currentGalleryIndex ? 'active' : ''}`;
        dot.type = 'button';
        dot.setAttribute('aria-label', `Slide ${index + 1}: ${item.title}`);
        dot.addEventListener('click', () => {
          goToGallerySlide(index);
        });
        dots.appendChild(dot);

        // Create Thumbnail
        const thumb = document.createElement('div');
        thumb.className = `gallery-thumb-item ${index === currentGalleryIndex ? 'active' : ''}`;
        thumb.dataset.index = index;
        thumb.title = item.title;

        const thumbImg = document.createElement('img');
        thumbImg.src = item.src;
        thumbImg.alt = `Thumb ${index + 1}`;
        thumbImg.loading = 'lazy';
        thumbImg.draggable = false;
        thumbImg.onerror = function() {
          if (item.fallback && this.src !== item.fallback) {
            this.src = item.fallback;
          }
        };

        thumb.appendChild(thumbImg);
        thumb.addEventListener('click', () => {
          goToGallerySlide(index);
        });
        thumbsTrack.appendChild(thumb);
      });

      goToGallerySlide(currentGalleryIndex, false);
    }

    async function checkGitHubGalleryAutoDetect() {
      if (!GITHUB_GALLERY_CONFIG.enableAutoDetect) return;

      const apiUrl = `https://api.github.com/repos/${GITHUB_GALLERY_CONFIG.owner}/${GITHUB_GALLERY_CONFIG.repo}/contents/${GITHUB_GALLERY_CONFIG.folderPath}`;
      try {
        const response = await fetch(apiUrl, { cache: 'no-cache' });
        if (!response.ok) return;

        const data = await response.json();
        if (!Array.isArray(data)) return;

        const imageFiles = data.filter(file => 
          file.type === 'file' && /\.(jpe?g|png|webp|gif)$/i.test(file.name)
        );

        if (imageFiles.length > 0) {
          const autoItems = imageFiles.map(file => {
            const cleanTitle = GALLERY_TITLE_MAP[file.name] || 
              file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            return {
              src: `images/gallery/${file.name}`,
              fallback: file.download_url || file.name,
              filename: file.name,
              title: cleanTitle,
              subtitle: 'AI Generation &bull; ComfyUI Model Render',
              dim: 'Auto'
            };
          });

          // Ensure Vocaloid: Hatsune Miku is first
          autoItems.sort((a, b) => {
            if (a.filename === 'deviantart_aicompare_30_SP2.jpg') return -1;
            if (b.filename === 'deviantart_aicompare_30_SP2.jpg') return 1;
            return a.filename.localeCompare(b.filename);
          });

          GALLERY_ITEMS = autoItems;
          renderGalleryDOM();
        }
      } catch (e) {
        // Fallback gracefully to default items
      }
    }

    function initGallery() {
      renderGalleryDOM();
      setupGalleryEvents();
      checkGitHubGalleryAutoDetect();
    }

    function goToGallerySlide(index, animate = true) {
      if (GALLERY_ITEMS.length === 0) return;

      if (index < 0) index = GALLERY_ITEMS.length - 1;
      if (index >= GALLERY_ITEMS.length) index = 0;

      currentGalleryIndex = index;
      const currentItem = GALLERY_ITEMS[currentGalleryIndex];

      const track = document.getElementById('galleryTrack');
      if (track) {
        if (GALLERY_ITEMS.length > 1) {
          if (!animate) {
            track.style.transition = 'none';
            track.style.transform = `translateX(-${currentGalleryIndex * 100}%)`;
            setTimeout(() => {
              track.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.25, 1)';
            }, 50);
          } else {
            track.style.transform = `translateX(-${currentGalleryIndex * 100}%)`;
          }
        }
      }

      // Update Active Header Badge and Counter
      const activeTitle = document.getElementById('galleryActiveTitle');
      const currentNum = document.getElementById('galleryCurrentNum');
      if (activeTitle) activeTitle.textContent = currentItem.title;
      if (currentNum) currentNum.textContent = String(currentGalleryIndex + 1).padStart(2, '0');

      // Update Caption
      const captionTitle = document.getElementById('captionTitle');
      const captionSub = document.getElementById('captionSub');
      if (captionTitle) captionTitle.textContent = currentItem.title;
      if (captionSub) captionSub.innerHTML = `${currentItem.subtitle} &bull; ${currentItem.dim}`;

      // Update Dots
      const dotButtons = document.querySelectorAll('.gallery-dot');
      dotButtons.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentGalleryIndex);
      });

      // Update Thumbnails
      const thumbItems = document.querySelectorAll('.gallery-thumb-item');
      thumbItems.forEach((thumb, idx) => {
        const isActive = idx === currentGalleryIndex;
        thumb.classList.toggle('active', isActive);
        if (isActive) {
          thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });

      // Update Lightbox if open
      const lightbox = document.getElementById('galleryLightbox');
      if (lightbox && lightbox.classList.contains('open')) {
        const lightboxImg = document.getElementById('lightboxImg');
        const lightboxTitle = document.getElementById('lightboxTitle');
        const lightboxCounter = document.getElementById('lightboxCounter');

        if (lightboxImg) lightboxImg.src = currentItem.src;
        if (lightboxTitle) lightboxTitle.textContent = currentItem.title;
        if (lightboxCounter) lightboxCounter.textContent = `${String(currentGalleryIndex + 1).padStart(2, '0')} / ${String(GALLERY_ITEMS.length).padStart(2, '0')}`;
      }
    }

    function nextGallerySlide() {
      const track = document.getElementById('galleryTrack');
      if (GALLERY_ITEMS.length <= 1 && track) {
        track.classList.remove('pulse-right', 'pulse-left');
        void track.offsetWidth;
        track.classList.add('pulse-right');
        setTimeout(() => track.classList.remove('pulse-right'), 350);
        return;
      }
      goToGallerySlide(currentGalleryIndex + 1);
    }

    function prevGallerySlide() {
      const track = document.getElementById('galleryTrack');
      if (GALLERY_ITEMS.length <= 1 && track) {
        track.classList.remove('pulse-right', 'pulse-left');
        void track.offsetWidth;
        track.classList.add('pulse-left');
        setTimeout(() => track.classList.remove('pulse-left'), 350);
        return;
      }
      goToGallerySlide(currentGalleryIndex - 1);
    }

    function toggleGalleryAutoplay() {
      galleryAutoplayActive = !galleryAutoplayActive;
      const btn = document.getElementById('galleryAutoplayBtn');
      if (btn) {
        btn.classList.toggle('active', galleryAutoplayActive);
        const icon = btn.querySelector('i');
        if (icon) {
          icon.className = galleryAutoplayActive ? 'fas fa-pause' : 'fas fa-play';
        }
      }

      if (galleryAutoplayActive) {
        startGalleryAutoplayTimer();
      } else {
        stopGalleryAutoplayTimer();
      }
    }

    function startGalleryAutoplayTimer() {
      stopGalleryAutoplayTimer();
      galleryAutoplayInterval = setInterval(() => {
        nextGallerySlide();
      }, 4200);
    }

    function stopGalleryAutoplayTimer() {
      if (galleryAutoplayInterval) {
        clearInterval(galleryAutoplayInterval);
        galleryAutoplayInterval = null;
      }
    }

    function openGalleryLightbox(index) {
      if (typeof index === 'number') {
        currentGalleryIndex = index;
        goToGallerySlide(index, false);
      }
      const lightbox = document.getElementById('galleryLightbox');
      const currentItem = GALLERY_ITEMS[currentGalleryIndex];
      const lightboxImg = document.getElementById('lightboxImg');
      const lightboxTitle = document.getElementById('lightboxTitle');
      const lightboxCounter = document.getElementById('lightboxCounter');

      if (lightboxImg) lightboxImg.src = currentItem.src;
      if (lightboxTitle) lightboxTitle.textContent = currentItem.title;
      if (lightboxCounter) lightboxCounter.textContent = `${String(currentGalleryIndex + 1).padStart(2, '0')} / ${String(GALLERY_ITEMS.length).padStart(2, '0')}`;

      if (lightbox) {
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeGalleryLightbox() {
      const lightbox = document.getElementById('galleryLightbox');
      if (lightbox) {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    }

    function setupGalleryEvents() {
      // Prev / Next Buttons
      const prevBtn = document.getElementById('galleryPrevBtn');
      const nextBtn = document.getElementById('galleryNextBtn');
      if (prevBtn) prevBtn.addEventListener('click', prevGallerySlide);
      if (nextBtn) nextBtn.addEventListener('click', nextGallerySlide);

      // Autoplay Toggle
      const autoplayBtn = document.getElementById('galleryAutoplayBtn');
      if (autoplayBtn) autoplayBtn.addEventListener('click', toggleGalleryAutoplay);

      // Lightbox open from buttons
      const fullscreenBtn = document.getElementById('galleryFullscreenBtn');
      if (fullscreenBtn) fullscreenBtn.addEventListener('click', () => openGalleryLightbox(currentGalleryIndex));

      const zoomBtn = document.getElementById('captionZoomBtn');
      if (zoomBtn) zoomBtn.addEventListener('click', () => openGalleryLightbox(currentGalleryIndex));

      // Lightbox Controls
      const lightboxClose = document.getElementById('lightboxClose');
      const lightboxBackdrop = document.getElementById('lightboxBackdrop');
      const lightboxPrev = document.getElementById('lightboxPrev');
      const lightboxNext = document.getElementById('lightboxNext');

      if (lightboxClose) lightboxClose.addEventListener('click', closeGalleryLightbox);
      if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeGalleryLightbox);
      if (lightboxPrev) lightboxPrev.addEventListener('click', prevGallerySlide);
      if (lightboxNext) lightboxNext.addEventListener('click', nextGallerySlide);

      // Pause autoplay on mouse enter stage
      const stage = document.getElementById('galleryStage');
      if (stage) {
        stage.addEventListener('mouseenter', () => {
          if (galleryAutoplayActive) stopGalleryAutoplayTimer();
        });
        stage.addEventListener('mouseleave', () => {
          if (galleryAutoplayActive) startGalleryAutoplayTimer();
        });

        // Touch Swipe
        stage.addEventListener('touchstart', (e) => {
          galleryTouchStartX = e.changedTouches[0].clientX;
          galleryTouchStartY = e.changedTouches[0].clientY;
        }, { passive: true });

        stage.addEventListener('touchend', (e) => {
          const deltaX = e.changedTouches[0].clientX - galleryTouchStartX;
          const deltaY = e.changedTouches[0].clientY - galleryTouchStartY;
          if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < 0) {
              nextGallerySlide();
            } else {
              prevGallerySlide();
            }
          }
        }, { passive: true });
      }

      // Keyboard Controls (Left/Right/Esc)
      document.addEventListener('keydown', (e) => {
        const lightbox = document.getElementById('galleryLightbox');
        const isLightboxOpen = lightbox && lightbox.classList.contains('open');

        if (e.key === 'Escape' && isLightboxOpen) {
          closeGalleryLightbox();
          return;
        }

        const gallerySection = document.getElementById('gallery');
        let isGalleryVisible = false;
        if (gallerySection) {
          const rect = gallerySection.getBoundingClientRect();
          isGalleryVisible = (rect.top < window.innerHeight && rect.bottom > 0);
        }

        if (isLightboxOpen || isGalleryVisible) {
          if (e.key === 'ArrowLeft') {
            prevGallerySlide();
          } else if (e.key === 'ArrowRight') {
            nextGallerySlide();
          }
        }
      });
    }

    // Initialize Gallery on page load
    initGallery();

    /* ══════ SHARED SECTION NAVIGATION ══════ */
    function scrollToSection(target) {
      if (!target) return;
      var selector = target.startsWith('#') ? target : ('#' + target);
      var el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        try {
          history.pushState(null, '', selector);
        } catch (_) {
          window.location.hash = selector;
        }
      } else {
        window.location.hash = selector;
      }
    }
    window.scrollToSection = scrollToSection;

    /* ══════ WELCOME POPUP (Command Palette) ══════ */
    (function initWelcome() {
      const overlay = document.getElementById('welcomeOverlay');
      const dontAsk = document.getElementById('welcomeDontAsk');
      const input = document.getElementById('welcomeInput');
      const ghost = document.getElementById('welcomeGhost');
      const listEl = document.getElementById('welcomeList');
      const escBtn = document.getElementById('welcomeEscBtn');
      if (!overlay || !input || !listEl) return;

      const dismissed = localStorage.getItem('zijun_welcome_dismissed');
      const hasHash = Boolean(window.location.hash && window.location.hash.length > 1);
      const prefersReducedData = Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-data: reduce)').matches);

      if (dismissed || hasHash || prefersReducedData) {
        overlay.style.display = 'none';
        return;
      }

      let currentRows = [];
      let activeIdx = 0;

      // Typing ghost
      const PROMPTS = [
        'Ask AI or search the site…',
        'Try “tarot”',
        'Try “show me videos”',
        'Try “contact”'
      ];
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let pi = 0, ci = 0, erasing = false, timer = null;

      function ghostActive() {
        return !input.value && document.activeElement !== input;
      }
      function syncGhost() {
        if (!ghost) return;
        ghost.style.opacity = ghostActive() ? '1' : '0';
      }
      function tickGhost() {
        clearTimeout(timer);
        if (!overlay.classList.contains('active') || !ghostActive()) {
          timer = setTimeout(tickGhost, 400);
          return;
        }
        const full = PROMPTS[pi];
        let delay;
        if (!erasing) {
          ci++;
          ghost.textContent = full.slice(0, ci);
          if (ci >= full.length) { erasing = true; delay = 1700; } else { delay = 55; }
        } else {
          ci--;
          ghost.textContent = full.slice(0, ci);
          if (ci <= 0) { erasing = false; pi = (pi + 1) % PROMPTS.length; delay = 380; } else { delay = 28; }
        }
        timer = setTimeout(tickGhost, delay);
      }

      if (ghost) {
        if (reduceMotion) {
          ghost.textContent = PROMPTS[0];
          ghost.classList.add('static');
        } else {
          ghost.classList.add('typing');
          tickGhost();
        }
        input.addEventListener('focus', syncGhost);
        input.addEventListener('blur', syncGhost);
        input.addEventListener('input', syncGhost);
        syncGhost();
      }

      function updateRows() {
        const q = (input.value || '').trim();
        const qLower = q.toLowerCase();
        let matched = (typeof DESTINATIONS !== 'undefined' ? DESTINATIONS : []).filter((d) => {
          if (!qLower) return true;
          return d.label.toLowerCase().includes(qLower) ||
                 d.desc.toLowerCase().includes(qLower) ||
                 (d.kw && d.kw.test(qLower));
        });

        const rows = matched.map((d) => ({ ...d }));

        if (q) {
          rows.push({
            id: '__ask_ai__',
            isAskAi: true,
            query: q,
            icon: 'fas fa-wand-magic-sparkles',
            label: `Ask AI: "${q}"`,
            desc: 'Let Lumie answer under the search bar'
          });
        }

        currentRows = rows;
        if (activeIdx >= currentRows.length) activeIdx = Math.max(0, currentRows.length - 1);
        renderList();
      }

      function renderList() {
        listEl.innerHTML = currentRows.map((item, idx) => {
          const isActive = idx === activeIdx;
          const href = item.target || '#';
          return `
            <a href="${href}" class="wl-row ${isActive ? 'active' : ''} ${item.isAskAi ? 'ask-row' : ''}" role="option" id="wl-opt-${idx}" aria-selected="${isActive ? 'true' : 'false'}" data-idx="${idx}">
              <span class="wl-row-icon"><i class="${item.icon}"></i></span>
              <span class="wl-row-content">
                <span class="wl-row-label">${escapeHtml(item.label)}</span>
                <span class="wl-row-desc">${escapeHtml(item.desc)}</span>
              </span>
              <span class="wl-row-enter">↵</span>
            </a>
          `;
        }).join('');

        input.setAttribute('aria-activedescendant', currentRows.length ? 'wl-opt-' + activeIdx : '');
        const activeBtn = listEl.querySelector(`.wl-row[data-idx="${activeIdx}"]`);
        if (activeBtn) activeBtn.scrollIntoView({ block: 'nearest' });
      }

      function selectItem(item) {
        if (!item) return;
        window.dismissWelcome(false);

        if (item.isAskAi) {
          scrollToSection('#hub');
          setTimeout(() => {
            if (typeof window.hubAsk === 'function') {
              window.hubAsk(item.query);
            }
          }, 280);
          return;
        }

        if (item.action === 'chat') {
          if (!chatOpen) toggleChat();
        } else if (item.target) {
          scrollToSection(item.target);
          if (item.openSystem && typeof window.openSystem === 'function') {
            window.openSystem('srv-ai');
          }
        }
      }

      window.dismissWelcome = function(focusHero) {
        if (typeof focusHero === 'undefined') focusHero = true;
        if (dontAsk && dontAsk.checked) {
          localStorage.setItem('zijun_welcome_dismissed', '1');
        }
        overlay.classList.remove('active');
        clearTimeout(timer);
        setTimeout(function() {
          overlay.style.display = 'none';
          if (focusHero) {
            const heroInput = document.getElementById('hubAskInput');
            if (heroInput && !('ontouchstart' in window)) heroInput.focus();
          }
        }, 260);
      };

      input.addEventListener('input', () => {
        updateRows();
      });

      input.addEventListener('keydown', (e) => {
        if (!currentRows.length) return;
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          activeIdx = (activeIdx + 1) % currentRows.length;
          renderList();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          activeIdx = (activeIdx - 1 + currentRows.length) % currentRows.length;
          renderList();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          selectItem(currentRows[activeIdx]);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          window.dismissWelcome();
        } else if (e.key === 'Tab') {
          // Focus trap between input and checkbox
          if (e.shiftKey && document.activeElement === input) {
            e.preventDefault();
            if (dontAsk) dontAsk.focus();
          } else if (!e.shiftKey && document.activeElement === dontAsk) {
            e.preventDefault();
            input.focus();
          }
        }
      });

      listEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.wl-row');
        if (!btn) return;
        e.preventDefault();
        const idx = parseInt(btn.dataset.idx, 10);
        activeIdx = idx;
        selectItem(currentRows[idx]);
      });

      if (escBtn) {
        escBtn.addEventListener('click', () => window.dismissWelcome());
      }

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          window.dismissWelcome();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
          window.dismissWelcome();
        }
      });

      // Show overlay
      updateRows();
      overlay.classList.add('active');

      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 560);
      if (!isTouch) {
        setTimeout(() => input.focus(), 80);
      }
    })();

    /* ══════ SCROLL NAV ══════ */
    (function initScrollNav() {
      const navBtns = document.querySelectorAll('.scroll-nav-btn');
      if (!navBtns.length) return;

      const sectionMap = {
        'hub': document.getElementById('hub'),
        'tarot': document.getElementById('tarot'),
        'gallery': document.getElementById('gallery'),
        'contact': document.getElementById('contact')
      };

      navBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          var target = btn.getAttribute('href') || ('#' + btn.dataset.section);
          scrollToSection(target);
        });
      });

      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            navBtns.forEach(function(btn) {
              btn.classList.toggle('active', btn.dataset.section === id);
            });
          }
        });
      }, { threshold: 0.3 });

      Object.values(sectionMap).forEach(function(sec) {
        if (sec) observer.observe(sec);
      });
    })();

    /* ══════ BENTO GALLERY ══════ */
    (function initBento() {
      var bentoGrid = document.getElementById('bentoGrid');
      var bentoFilters = document.getElementById('bentoFilters');
      if (!bentoGrid) return;

var BENTO_ITEMS = [
        {
          title: '202611082330',
          context: 'Video clip',
          src: 'post/202611082330.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-11'
        },
        {
          title: '202611081710',
          context: 'Video clip',
          src: 'post/202611081710.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-11'
        },
        {
          title: '202611072111',
          context: 'Video clip',
          src: 'post/202611072111.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-11'
        },
        {
          title: '202611071325',
          context: 'Video clip',
          src: 'post/202611071325.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-11'
        },
        {
          title: 'vgart-test1',
          context: 'Video generation test',
          src: 'post/vgart-test1.webp',
          type: 'image',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: 'vgart-test2',
          context: 'Video generation test 2',
          src: 'post/vgart-test2.webp',
          type: 'image',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: 'gcart-test3',
          context: 'Test 3',
          src: 'post/gcart-test3.webp',
          type: 'image',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: 'infog-test4',
          context: 'Test 4',
          src: 'post/infog-test4.webp',
          type: 'image',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: 'Multmodel Combination Steps Hiring',
          context: 'Hiring poster design',
          src: 'post/Multmodel combination steps hiring.png',
          type: 'image',
          category: 'mockups',
          date: '2026-11'
        },
        {
          title: 'Multmodel Combination Steps Hiring 2',
          context: 'Hiring poster design 2',
          src: 'post/Multmodel combination steps hiring2.webp',
          type: 'image',
          category: 'mockups',
          date: '2026-11'
        },
        {
          title: 'Multimodel Combination Invitation 1',
          context: 'Invitation card design',
          src: 'post/Multimodel combination invitation1.webp',
          type: 'image',
          category: 'mockups',
          date: '2026-11'
        },
        {
          title: 'Multimodel Combination Invitation 2',
          context: 'Invitation card design',
          src: 'post/Multimodel combination invitation2.webp',
          type: 'image',
          category: 'mockups',
          date: '2026-11'
        },
        {
          title: 'Multimodel Combination Invitation 3',
          context: 'Invitation card design',
          src: 'post/Multimodel combination invitation3.webp',
          type: 'image',
          category: 'mockups',
          date: '2026-11'
        },
        {
          title: '202610312125',
          context: 'Video clip',
          src: 'post/202610312125.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: '202610311407',
          context: 'Video clip',
          src: 'post/202610311407.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: '202610302353',
          context: 'Video clip',
          src: 'post/202610302353.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: '202610291152',
          context: 'Video clip',
          src: 'post/202610291152.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: '202610281713',
          context: 'Video clip',
          src: 'post/202610281713.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: '202610281047',
          context: 'Video clip',
          src: 'post/202610281047.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: '202610271642',
          context: 'Video clip',
          src: 'post/202610271642.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: '202610271606',
          context: 'Video clip',
          src: 'post/202610271606.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: '202610261055',
          context: 'Video clip',
          src: 'post/202610261055.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: '202610251050',
          context: 'Video clip',
          src: 'post/202610251050.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: '202610251254',
          context: 'Video clip',
          src: 'post/202610251254.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: '202610241733',
          context: 'Video clip',
          src: 'post/202610241733.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: '202610232214',
          context: 'Video clip',
          src: 'post/202610232214.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: '202610231347',
          context: 'Video clip',
          src: 'post/202610231347.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: '202610231450',
          context: 'Video clip',
          src: 'post/202610231450.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: '202610222230',
          context: 'Video clip',
          src: 'post/202610222230.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: '202610221443',
          context: 'Video clip',
          src: 'post/202610221443.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: '202610220115',
          context: 'Video clip',
          src: 'post/202610220115.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: '202610212351',
          context: 'Video clip',
          src: 'post/202610212351.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: '202610201626',
          context: 'Video clip',
          src: 'post/202610201626.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-10'
        },
        {
          title: 'HealVita Infographic',
          context: 'AI generated infographic',
          src: 'post/aigen-infographic-healvita.webp',
          type: 'image',
          category: 'ai-generated',
          date: '2026-09'
        },
        {
          title: 'gfruit mockup',
          context: 'Gfruit mockup design',
          src: 'post/sep22-gacfruit.webp',
          type: 'image',
          category: 'mockups',
          date: '2026-09'
        },
        {
          title: 'Cyberpunk Officer',
          context: 'Cyberpunk character artwork',
          src: 'post/cyberpunk_officer.png',
          type: 'image',
          category: 'ai-generated',
          date: '2026-09'
        },
        {
          title: '202609202057',
          context: 'Video clip',
          src: 'post/202609202057.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-09'
        },
        {
          title: 'Character Sheet Xiaowan',
          context: 'Character sheet design',
          src: 'post/charactershet_xiaowan.png',
          type: 'image',
          category: 'ai-generated',
          date: '2026-09'
        },
        {
          title: 'Character Sheet Mr Lu',
          context: 'Character sheet design',
          src: 'post/charactershet_mrlu.png',
          type: 'image',
          category: 'ai-generated',
          date: '2026-09'
        },
        {
          title: 'Character Sheet Xiaoyin',
          context: 'Character sheet design',
          src: 'post/charactersheet_xiaoyin.png',
          type: 'image',
          category: 'ai-generated',
          date: '2026-09'
        },
        {
          title: 'AI Flyer',
          context: 'AI generated flyer',
          src: 'post/aiflyer_0011.jpg',
          type: 'image',
          category: 'ai-generated',
          date: '2026-09'
        },
        {
          title: 'Sword Maiden',
          context: 'Video clip',
          src: 'post/swordmaiden.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-09'
        },
        {
          title: 'Cat Shinny',
          context: 'Video clip',
          src: 'post/catshinny.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-09'
        },
{
          title: 'Multmodel Combination Steps Magazine Cover',
          context: 'Magazine cover design',
          src: 'post/Multmodel combination steps magazine cover.webp',
          type: 'image',
          category: 'mockups',
          date: '2026-10'
        },
        {
          title: '202609150053',
          context: 'Video clip',
          src: 'post/202609150053.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-09'
        },
        {
          title: 'Multmodel Combination Steps Infographic',
          context: 'Model combination workflow diagram',
          src: 'post/Multmodel combination steps infographic.png',
          type: 'image',
          category: 'mockups',
          date: '2026-10'
        },
        {
          title: 'Multmodel Combination Steps Infographic2',
          context: 'Model combination workflow diagram 2',
          src: 'post/Multmodel combination steps infographic2.webp',
          type: 'image',
          category: 'mockups',
          date: '2026-10'
        },
        {
          title: 'One min',
          context: 'One minute video clip',
          src: 'post/onemin.webm',
          type: 'video',
          category: 'ai-generated',
          date: '2026-09'
        },
        {
          title: 'ComfyUI Pipeline',
          context: 'AI image generation pipeline',
          src: 'post/comfyui-pipelineworkflow.jpg',
          type: 'image',
          category: 'ai-generated',
          date: '2026-09'
        },
        {
          title: 'Job Scorer Extension',
          context: 'Chrome extension auto-scoring job listings',
          src: 'post/jobscorer_480p.mp4',
          type: 'video',
          category: 'open-source',
          date: '2026-09'
        },
        {
          title: 'Brand Site',
          context: 'Rainforest-themed brand website',
          src: 'post/Screenshot 2026-07-23 235201.jpg',
          type: 'image',
          category: 'mockups',
          date: '2026-07'
        },
        {
          title: 'Greeting Card',
          context: 'Job application mockup',
          src: 'post/Screenshot_2026-07-23_105616.jpg_202607231100.jpeg',
          type: 'image',
          category: 'mockups',
          date: '2026-07'
        },
        {
          title: 'AI Motion',
          context: 'Text-to-video + HTML5 canvas',
          src: 'post/202607231141-480sfx.mp4',
          type: 'video',
          category: 'ai-generated',
          date: '2026-07'
        },
        {
          title: 'Travel Agency',
          context: 'Responsive travel booking site',
          src: 'post/Screenshot 2026-07-23 150012.jpg',
          type: 'image',
          category: 'mockups',
          date: '2026-07'
        },
        {
          title: 'Vocaloid Miku',
          context: 'ComfyUI prompt comparison',
          src: 'post/deviantart_aicompare_30_SP2.jpg',
          type: 'image',
          category: 'ai-generated',
          date: '2026-06'
        },
        {
          title: 'Piano Keys Fix',
          context: 'ComfyUI model comparison',
          src: 'post/ComfyUI_temp_npikj_00091_.png',
          type: 'image',
          category: 'ai-generated',
          date: '2026-06'
        },
        {
          title: '3D Miku Festival',
          context: 'Character 3D render',
          src: 'post/sample3d-mikuchanfes.jpg',
          type: 'image',
          category: 'ai-generated',
          date: '2026-05'
        },
        {
          title: 'Miku Festival Flyer',
          context: 'Event promotional flyer',
          src: 'post/mikuchan_fes_flyer.png',
          type: 'image',
          category: 'mockups',
          date: '2026-05'
        },
        {
          title: 'AI Compilation',
          context: 'AI motion work compilation',
          src: 'post/AI_Compilation.mp4',
          type: 'video',
          category: 'ai-generated',
          date: '2026-04'
        },
        {
          title: 'AI Characters',
          context: 'Character generation tests',
          src: 'post/AI_Compilation2.mp4',
          type: 'video',
          category: 'ai-generated',
          date: '2026-04'
        },
        {
          title: 'Cat Float',
          context: 'AI animation test',
          src: 'post/catfloat.mp4',
          type: 'video',
          category: 'ai-generated',
          date: '2026-03'
        },
        {
          title: 'ComfyUI Experiment',
          context: 'Model comparison test',
          src: 'post/ComfyUI_temp_xhjbh_00011_.png',
          type: 'image',
          category: 'ai-generated',
          date: '2026-03'
        }
      ];

      BENTO_ITEMS.sort(function(a, b) {
        return b.date.localeCompare(a.date);
      });

      var lightboxItems = BENTO_ITEMS.slice();
      var currentBentoIndex = 0;

      function renderBento(filter) {
        bentoGrid.innerHTML = '';
        filter = filter || 'all';

        var filtered = BENTO_ITEMS.filter(function(item) {
          return filter === 'all' || item.type === filter || item.category === filter;
        });

        filtered.forEach(function(item) {
          var el = document.createElement('div');
          el.className = 'bento-item';
          el.dataset.category = item.category;

          if (item.type === 'video') {
            var vid = document.createElement('video');
            vid.className = 'bento-media lazy';
            vid.muted = true;
            vid.loop = true;
            vid.playsInline = true;
            vid.preload = 'metadata';
            vid.dataset.src = item.src;
            vid.addEventListener('loadeddata', function() {
              vid.currentTime = 0.1;
            });
            vid.addEventListener('seeked', function() {
              var canvas = document.createElement('canvas');
              canvas.width = vid.videoWidth;
              canvas.height = vid.videoHeight;
              canvas.getContext('2d').drawImage(vid, 0, 0, canvas.width, canvas.height);
              vid.poster = canvas.toDataURL('image/jpeg', 0.7);
              vid.classList.add('loaded');
              layoutBento();
            });
            el.appendChild(vid);

            el.addEventListener('mouseenter', function() {
              vid.play().catch(function() {});
            });
            el.addEventListener('mouseleave', function() {
              vid.pause();
            });
            el.addEventListener('touchstart', function() {
              if (vid.paused) { vid.play().catch(function() {}); }
              else { vid.pause(); }
            }, { passive: true });
          } else {
            var img = document.createElement('img');
            img.className = 'bento-media lazy';
            img.dataset.src = item.src;
            img.alt = item.title;
            img.draggable = false;
            img.addEventListener('load', function() {
              img.classList.add('loaded');
              layoutBento();
            });
            el.appendChild(img);
          }

          var overlay = document.createElement('div');
          overlay.className = 'bento-overlay';
          overlay.innerHTML = '<h3>' + item.title + '</h3>';
          el.appendChild(overlay);

          el.addEventListener('click', function() {
            var realIdx = lightboxItems.indexOf(item);
            if (realIdx !== -1) openBentoLightbox(realIdx);
          });

          bentoGrid.appendChild(el);
        });

        observeLazyMedia();
        layoutBento();
      }

      function layoutBento() {
        var items = bentoGrid.querySelectorAll('.bento-item');
        if (!items.length) return;

        var gap = 18;
        var gridWidth = bentoGrid.offsetWidth;
        var cols = 3;
        if (gridWidth <= 520) cols = 2;
        else if (gridWidth <= 900) cols = 2;

        var colWidth = (gridWidth - (cols - 1) * gap) / cols;
        var colHeights = [];
        for (var c = 0; c < cols; c++) colHeights[c] = 0;

        items.forEach(function(el) {
          var shortestCol = 0;
          for (var c = 1; c < cols; c++) {
            if (colHeights[c] < colHeights[shortestCol]) shortestCol = c;
          }

          var x = shortestCol * (colWidth + gap);
          var y = colHeights[shortestCol];

          el.style.width = colWidth + 'px';
          el.style.left = x + 'px';
          el.style.top = y + 'px';

          var media = el.querySelector('.bento-media');
          if (media && media.classList.contains('loaded')) {
            var aspectRatio = media.naturalHeight / media.naturalWidth;
            if (media.tagName === 'VIDEO' && media.videoHeight) {
              aspectRatio = media.videoHeight / media.videoWidth;
            }
            if (aspectRatio && isFinite(aspectRatio)) {
              el.style.height = (colWidth * aspectRatio) + 'px';
            } else {
              el.style.height = (colWidth * 0.75) + 'px';
            }
          } else {
            el.style.height = (colWidth * 0.75) + 'px';
          }

          colHeights[shortestCol] = y + el.offsetHeight + gap;
        });

        var maxH = Math.max.apply(null, colHeights);
        bentoGrid.style.height = maxH + 'px';
      }

      var resizeTimer;
      window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(layoutBento, 150);
      });

      function observeLazyMedia() {
        var lazyEls = document.querySelectorAll('.bento-media.lazy');
        var lazyObs = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            var src = el.dataset.src;
            if (!src) return;
            if (el.tagName === 'VIDEO') {
              var source = document.createElement('source');
              source.src = src;
              source.type = 'video/mp4';
              el.appendChild(source);
              el.load();
            } else {
              el.src = src;
            }
            lazyObs.unobserve(el);
          });
        }, { rootMargin: '200px' });

        lazyEls.forEach(function(el) { lazyObs.observe(el); });
      }

      function openBentoLightbox(index) {
        currentBentoIndex = index;
        var item = lightboxItems[index];
        var lightbox = document.getElementById('galleryLightbox');
        var lightboxContent = lightbox.querySelector('.lightbox-content');
        var lightboxImg = document.getElementById('lightboxImg');
        var lightboxTitle = document.getElementById('lightboxTitle');
        var lightboxCounter = document.getElementById('lightboxCounter');

        var existingVid = lightbox.querySelector('.bento-lightbox-video');
        if (existingVid) existingVid.remove();

        if (item.type === 'video') {
          lightboxImg.style.display = 'none';
          var vid = document.createElement('video');
          vid.className = 'bento-lightbox-video';
          vid.src = item.src;
          vid.controls = true;
          vid.autoplay = true;
          vid.style.maxWidth = '90vw';
          vid.style.maxHeight = '80vh';
          vid.style.borderRadius = '8px';
          lightboxContent.insertBefore(vid, lightbox.querySelector('.lightbox-footer'));
        } else {
          lightboxImg.style.display = '';
          lightboxImg.src = item.src;
        }

        lightboxTitle.textContent = item.title;
        lightboxCounter.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(lightboxItems.length).padStart(2, '0');
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }

      function closeBentoLightbox() {
        var lightbox = document.getElementById('galleryLightbox');
        var vid = lightbox.querySelector('.bento-lightbox-video');
        if (vid) {
          vid.pause();
          vid.remove();
        }
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }

      function navBentoLightbox(dir) {
        currentBentoIndex += dir;
        if (currentBentoIndex < 0) currentBentoIndex = lightboxItems.length - 1;
        if (currentBentoIndex >= lightboxItems.length) currentBentoIndex = 0;
        openBentoLightbox(currentBentoIndex);
      }

      var lbClose = document.getElementById('lightboxClose');
      var lbBackdrop = document.getElementById('lightboxBackdrop');
      var lbPrev = document.getElementById('lightboxPrev');
      var lbNext = document.getElementById('lightboxNext');
      if (lbClose) lbClose.addEventListener('click', closeBentoLightbox);
      if (lbBackdrop) lbBackdrop.addEventListener('click', closeBentoLightbox);
      if (lbPrev) lbPrev.addEventListener('click', function() { navBentoLightbox(-1); });
      if (lbNext) lbNext.addEventListener('click', function() { navBentoLightbox(1); });

      document.addEventListener('keydown', function(e) {
        var lightbox = document.getElementById('galleryLightbox');
        if (!lightbox || !lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeBentoLightbox();
        if (e.key === 'ArrowLeft') navBentoLightbox(-1);
        if (e.key === 'ArrowRight') navBentoLightbox(1);
      });

      if (bentoFilters) {
        bentoFilters.addEventListener('click', function(e) {
          var btn = e.target.closest('.bento-filter');
          if (!btn) return;
          bentoFilters.querySelectorAll('.bento-filter').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          renderBento(btn.dataset.filter);
        });
      }

      renderBento('all');
    })();

    /* ══════ VERSION PREVIEW MODAL ══════ */
    (function initVersionModal() {
      var modal = document.getElementById('verModal');
      var backdrop = document.getElementById('verModalBackdrop');
      var closeBtn = document.getElementById('verModalClose');
      var modalImg = document.getElementById('verModalImg');
      var modalTitle = document.getElementById('verModalTitle');
      if (!modal) return;

      function openVerModal(src, title) {
        modalImg.src = src;
        modalTitle.textContent = title;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }

      function closeVerModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        modalImg.src = '';
      }

      document.querySelectorAll('.ver-card.clickable').forEach(function(card) {
        card.addEventListener('click', function() {
          var src = card.dataset.src;
          var ver = card.dataset.ver;
          openVerModal(src, 'v' + ver);
        });
      });

      if (closeBtn) closeBtn.addEventListener('click', closeVerModal);
      if (backdrop) backdrop.addEventListener('click', closeVerModal);
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeVerModal();
      });
    })();

    /* ══════ SECURITY: DEVTOOLS BLOCK ══════ */
    (function initSecurity() {
      document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || (e.shiftKey && e.ctrlKey && (e.key === 'I' || e.key === 'i')) || (e.ctrlKey && e.key === 'u')) {
          e.preventDefault();
          return false;
        }
      });

      document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
      });

      document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') e.preventDefault();
      });

      var devtoolsOpen = false;
      var threshold = 160;

      setInterval(function() {
        var widthThreshold = window.outerWidth - window.innerWidth > threshold;
        var heightThreshold = window.outerHeight - window.innerHeight > threshold;
        if (widthThreshold || heightThreshold) {
          if (!devtoolsOpen) {
            devtoolsOpen = true;
          }
        } else {
          devtoolsOpen = false;
        }
      }, 1000);
    })();


    /* ══════ HUB ASK BAR (typing ghost + Lumie) ══════ */
    (function initHubAsk() {
      const form = document.getElementById('hubAsk');
      const input = document.getElementById('hubAskInput');
      const ghost = document.getElementById('hubAskGhost');
      const panel = document.getElementById('hubAnswer');
      const qEl = document.getElementById('hubAnswerQ');
      const closeBtn = document.getElementById('hubAnswerClose');
      const body = document.getElementById('hubAnswerBody');
      const cardsEl = document.getElementById('hubAnswerCards');
      const chatBtn = document.getElementById('hubAnswerChat');
      const chips = document.getElementById('hubAskChips');
      const hero = document.getElementById('hub');
      if (!form || !input || !ghost || !panel) return;

      const PROMPTS = [
        'Ask AI anything about ZiJun…',
        'Search his projects, tools or gallery…',
        'Try: “What AI tools has he built?”',
        'Try: “Show me the latest video clips”',
        'Try: “How do I contact him?”',
        'Try: “Show me the history of this site”'
      ];
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let pi = 0, ci = 0, erasing = false, timer = null, visible = true;
      let replyTimer = null, currentQ = '';

      function ghostActive() {
        return !input.value && document.activeElement !== input;
      }
      function syncGhost() {
        ghost.style.opacity = ghostActive() ? '1' : '0';
      }
      function tick() {
        clearTimeout(timer);
        if (!visible || !ghostActive()) { timer = setTimeout(tick, 400); return; }
        const full = PROMPTS[pi];
        let delay;
        if (!erasing) {
          ci++;
          ghost.textContent = full.slice(0, ci);
          if (ci >= full.length) { erasing = true; delay = 1700; } else { delay = 55; }
        } else {
          ci--;
          ghost.textContent = full.slice(0, ci);
          if (ci <= 0) { erasing = false; pi = (pi + 1) % PROMPTS.length; delay = 380; } else { delay = 28; }
        }
        timer = setTimeout(tick, delay);
      }

      if (reduce) {
        ghost.textContent = PROMPTS[0];
        ghost.classList.add('static');
      } else {
        ghost.classList.add('typing');
        tick();
        if (hero && 'IntersectionObserver' in window) {
          new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0.05 }).observe(hero);
        }
      }
      input.addEventListener('focus', syncGhost);
      input.addEventListener('blur', syncGhost);
      input.addEventListener('input', syncGhost);
      syncGhost();

      function goTo(target) {
        scrollToSection(target);
      }
      window.hubGoTo = goTo;
      window.hubAsk = ask;

      // Go straight to a destination: no AI call, no tokens.
      function goDestination(d, q) {
        if (!d) return;
        if (d.action === 'chat') { if (!chatOpen) toggleChat(); return; }
        if (d.target) {
          goTo(d.target);
          if (d.openSystem && typeof window.openSystem === 'function') {
            const t = (q || '').toLowerCase();
            let srvId = 'srv-drive';
            if (/calc/.test(t)) srvId = 'srv-calc';
            else if (/web|parallax|brand|landing|travel/.test(t)) srvId = 'srv-web';
            else if (/\bai\b|lab/.test(t)) srvId = 'srv-ai';
            window.openSystem(srvId);
          }
        }
      }

      function matchDestinations(q) {
        const matched = DESTINATIONS.filter(d => d.kw.test((q || '').toLowerCase()));
        return { list: matched.length ? matched : DESTINATIONS, isFallback: matched.length === 0 };
      }

      function cleanAnswer(t) {
        if (!t) return '';
        return t.replace(/\*\([^*)]+\)\*/g, '').trim();
      }

      function renderCards(list) {
        if (!cardsEl) return;
        cardsEl.innerHTML = list.map(d => `
          <button type="button" class="hub-answer-card" data-id="${d.id}" data-action="${d.action || ''}" data-target="${d.target || ''}" data-system="${d.openSystem ? 'true' : 'false'}">
            <i class="${d.icon}"></i>
            <span class="hub-answer-card-text">
              <strong>${d.label}</strong>
              <small>${d.desc}</small>
            </span>
          </button>
        `).join('');
      }

      if (cardsEl) {
        cardsEl.addEventListener('click', (e) => {
          const btn = e.target.closest('.hub-answer-card');
          if (!btn) return;
          goDestination(DESTINATIONS.find(d => d.id === btn.dataset.id), currentQ);
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          panel.hidden = true;
          clearTimeout(replyTimer);
        });
      }

      if (chatBtn) {
        chatBtn.addEventListener('click', () => {
          if (!chatOpen) toggleChat();
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel && !panel.hidden) {
          panel.hidden = true;
          clearTimeout(replyTimer);
        }
      });

      function ask(text) {
        text = (text || '').trim();
        if (!text) return;
        currentQ = text;
        if (qEl) qEl.textContent = text;
        const match = matchDestinations(text);
        const quick = !match.isFallback && text.split(/\s+/).filter(Boolean).length <= 4;
        if (body) body.innerHTML = quick ? 'Here is where to look:' : '<span class="typing-dots"><span></span><span></span><span></span></span> Lumie is thinking…';
        renderCards(match.list);
        panel.hidden = false;
        input.value = '';
        input.blur();
        syncGhost();

        clearTimeout(replyTimer);
        replyTimer = setTimeout(() => {
          if (body && body.querySelector('.typing-dots')) {
            body.textContent = match.isFallback
              ? 'Here is what I can show you:'
              : 'Lumie is quiet right now, but here is where to look:';
          }
        }, 6000);

        // Save credits: a short keyword question ("gallery", "show tarot", "contact") is answered
        // instantly from the destination list. The AI is only called for real questions.
        const words = text.split(/\s+/).filter(Boolean).length;
        if (!match.isFallback && words <= 4) {
          clearTimeout(replyTimer);
          if (body) body.textContent = 'Here is where to look:';
          return;
        }

        sendChatMessage(text, {
          silent: true,
          onReply: (t) => {
            clearTimeout(replyTimer);
            if (!body) return;
            const cleaned = cleanAnswer(t);
            if (match.isFallback && (!cleaned || cleaned.includes('What would you like'))) {
              body.textContent = 'Here is what I can show you:';
            } else {
              body.textContent = cleaned;
            }
          }
        });
      }

      form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); });
      if (chips) {
        chips.addEventListener('click', (e) => {
          const b = e.target.closest('.hub-chip');
          if (!b) return;
          if (b.dataset.dest) goDestination(DESTINATIONS.find(d => d.id === b.dataset.dest));
          else if (b.dataset.q) ask(b.dataset.q);
        });
      }
    })();

    /* ══════ TAROT LAUNCHER (lazy iframe) ══════ */
    (function initTarot() {
      const stage = document.getElementById('tarotStage');
      const launch = document.getElementById('tarotLaunch');
      const launchWrap = document.getElementById('tarotLaunchWrap');
      const frameWrap = document.getElementById('tarotFrameWrap');
      const frame = document.getElementById('tarotFrame');
      const fullBtn = document.getElementById('tarotFull');
      const closeBtn = document.getElementById('tarotClose');
      if (!stage || !launch || !frame) return;

      function open() {
        if (!frame.getAttribute('src')) frame.setAttribute('src', frame.dataset.src);
        launchWrap.hidden = true;
        frameWrap.hidden = false;
      }
      function close() {
        frame.removeAttribute('src');
        frame.src = 'about:blank';
        frame.removeAttribute('src');
        frameWrap.hidden = true;
        launchWrap.hidden = false;
      }
      launch.addEventListener('click', open);
      closeBtn.addEventListener('click', close);
      fullBtn.addEventListener('click', () => {
        const el = frameWrap;
        if (el.requestFullscreen) {
          el.requestFullscreen().catch(() => el.classList.toggle('fake-full'));
        } else {
          el.classList.toggle('fake-full');
        }
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') frameWrap.classList.remove('fake-full');
      });
      window.openTarot = open;
    })();
