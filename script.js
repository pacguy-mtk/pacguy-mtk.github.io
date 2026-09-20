    const GROQ_API_KEY = "__GROQ_API_KEY__";
    const OPENROUTER_API_KEY = "__OPENROUTER_API_KEY__";

    const bgVideo = document.querySelector(".bg-video");
    const videoToggle = document.getElementById("videoToggle");
    const pageMenu = document.querySelector(".page-menu");
    const pageToggle = document.getElementById("pageToggle");
    const pageParallaxMenu = document.querySelector(".page-dropdown-group");
    const pageParallaxToggle = document.getElementById("pageParallaxToggle");
    const webParallaxMenu = document.querySelector(".page-card-menu");
    const webParallaxToggle = document.getElementById("webParallaxToggle");

    function setPageMenuOpen(isOpen) {
      pageMenu.classList.toggle("open", isOpen);
      pageToggle.setAttribute("aria-expanded", String(isOpen));
      if (!isOpen) {
        setPageParallaxMenuOpen(false);
      }
    }

    function setPageParallaxMenuOpen(isOpen) {
      pageParallaxMenu.classList.toggle("open", isOpen);
      pageParallaxToggle.setAttribute("aria-expanded", String(isOpen));
    }

    function setWebParallaxMenuOpen(isOpen) {
      webParallaxMenu.classList.toggle("open", isOpen);
      webParallaxToggle.setAttribute("aria-expanded", String(isOpen));
    }

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

    pageToggle.addEventListener("click", (event) => {
      const isOpen = !pageMenu.classList.contains("open");
      setPageMenuOpen(isOpen);
    });

    pageParallaxToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = !pageParallaxMenu.classList.contains("open");
      setPageParallaxMenuOpen(isOpen);
    });

    webParallaxToggle.addEventListener("click", () => {
      const isOpen = !webParallaxMenu.classList.contains("open");
      setWebParallaxMenuOpen(isOpen);
    });

    document.addEventListener("click", (event) => {
      if (!pageMenu.contains(event.target)) {
        setPageMenuOpen(false);
      } else if (!pageParallaxMenu.contains(event.target)) {
        setPageParallaxMenuOpen(false);
      }

      if (!webParallaxMenu.contains(event.target)) {
        setWebParallaxMenuOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setPageMenuOpen(false);
        setPageParallaxMenuOpen(false);
        setWebParallaxMenuOpen(false);
      }
    });

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

PROJECTS:
- Hub: https://pacguy-mtk.github.io/
- Job Tracker: https://pacguy-mtk.github.io/applyfollow/
- Brand Mockup: https://pacguy-mtk.github.io/rainforest-brand-mockup/
- Shoplot Desk: https://pacguy-mtk.github.io/fairparkshop/
- Prompt Generator: https://pacguy-mtk.github.io/quickpromptgeneratordemo/
- Travel Agency: https://pacguy-mtk.github.io/test-travelagency/
- AI Lab: https://pacguy-mtk.github.io/ai-lab/

CONTACT: LinkedIn: linkedin.com/in/looi-jia-jun-b734133b2 | Email: juniorlooi95@gmail.com | WhatsApp: wa.me/60173588931 | Resume: drive.google.com/drive/folders/1TuHiogcZ9p08ol-aS3qd7Wcj0U0NhDtS

RULES: Greet warm. Brief intro for ZiJun questions. Summarize skills/projects fast. Point contact for hire questions. Off-topic: "Not my thing — I'm here for portfolio stuff!" Max 3 sentences. Answer first, personality second. Cards when relevant. Helpful not pushy.`;

    const NAV_CARDS = {
      'main-menu': [
        { icon: 'fas fa-user', label: 'About ZiJun', action: 'scroll', target: '#hub' },
        { icon: 'fas fa-layer-group', label: 'Projects', action: 'scroll', target: '#gallery' },
        { icon: 'fas fa-envelope', label: 'Contact', action: 'scroll', target: '#contact' }
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
      { type: "function", function: { name: "search_projects", description: "Search projects by keyword.", parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } } },
      { type: "function", function: { name: "get_feed", description: "Get latest feed posts from the Hub. Returns post titles, text, categories, and dates.", parameters: { type: "object", properties: { limit: { type: "number", description: "Max posts to return (default 5)" } } } } }
    ];

    function runTool(name, args) {
      if (name === "get_projects") {
        const p = [];
        document.querySelectorAll('.page-card[href]').forEach(c => {
          const t = c.querySelector('strong')?.textContent?.trim();
          if (t && c.href) p.push({ name: t, url: c.href });
        });
        document.querySelectorAll('.page-card-dropdown a').forEach(a => {
          const s = a.querySelector('span')?.textContent?.trim();
          if (s && a.href) p.push({ name: s, url: a.href });
        });
        return { projects: p };
      }
      if (name === "get_skills") return { skills: ["Graphic Design 85%", "HTML/CSS 80%", "JavaScript 78%", "UI/UX 86%", "AI Workflow 88%", "Business Tools 82%"] };
      if (name === "get_contact") return { linkedin: "linkedin.com/in/looi-jia-jun-b734133b2", email: "juniorlooi95@gmail.com", whatsapp: "wa.me/60173588931", resume: "drive.google.com/drive/folders/1TuHiogcZ9p08ol-aS3qd7Wcj0U0NhDtS" };
      if (name === "search_projects") {
        const q = (args.query || '').toLowerCase();
        const r = [];
        document.querySelectorAll('.page-card[href], .page-card-dropdown a').forEach(el => {
          const t = (el.querySelector('strong')?.textContent || el.querySelector('span')?.textContent || '').trim();
          if (t.toLowerCase().includes(q)) r.push({ name: t, url: el.href });
        });
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
        toggleChat();
      }
    }

    function extractCards(text) {
      const lower = text.toLowerCase();
      const found = [];
      if (/project|built|work|portfolio|site|page|tool|demo/.test(lower)) found.push('projects');
      if (/hire|job|recruit|freelance|collaborate|salary|work with|employ/.test(lower)) found.push('hire');
      if (/contact|reach|email|linkedin|whatsapp|message|call|talk/.test(lower)) found.push('contact');
      if (/gallery|image|photo|art|ai work|comfyui/.test(lower)) found.push('gallery');
      if (/skill|can do|ability|experience|know/.test(lower)) found.push('main-menu');
      if (/who|about|zijun|introduce|tell me/.test(lower)) found.push('main-menu');
      if (found.length === 0) found.push('main-menu');
      return found;
    }

    async function sendChatMessage() {
      const text = chatInput.value.trim();
      if (!text) return;

      addUserMessage(text);
      chatInput.value = '';
      chatSend.disabled = true;

      if ((!GROQ_API_KEY || GROQ_API_KEY.length < 10) && (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.length < 10)) {
        const cardKeys = extractCards(text);
        const responses = {
          projects: '*buzz* Lumie can light the way to ZiJun\'s projects. Take a look!',
          hire: '*buzz* ZiJun is open to work. Lumie will show you how to reach him.',
          contact: '*buzz* Here are the ways to get in touch with ZiJun.',
          gallery: '*buzz* The gallery has AI art and project work to explore!',
          'main-menu': '*buzz* Lumie is here. What would you like to know?'
        };
        const resp = cardKeys[0] || 'main-menu';
        addBotMessage(responses[resp] || 'What would you like to see?', cardKeys);
        setPetState('jump');
        chatSend.disabled = false;
        return;
      }

      addTypingIndicator();

      const models = [
        { url: 'https://api.groq.com/openai/v1/chat/completions', model: 'openai/gpt-oss-120b', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` } },
        { url: 'https://openrouter.ai/api/v1/chat/completions', model: 'nvidia/nemotron-3-ultra-550b-a55b:free', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENROUTER_API_KEY}`, 'HTTP-Referer': 'https://pacguy-mtk.github.io/', 'X-Title': 'ZiJun Hub' } }
      ];

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
            if (!response.ok) continue;
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
          } catch (e) { continue; }
        }

        removeTypingIndicator();

        if (!aiText) throw new Error('All providers failed');

        const cardKeys = extractCards(aiText);
        addBotMessage(aiText, cardKeys);
        setPetState('jump');
      } catch (err) {
        removeTypingIndicator();
        console.error('Chatbot API error:', err.message, err);
        const cardKeys = extractCards(text);
        addBotMessage('⚠️ *buzz* Lumie\'s connection is flickering, but the backup answers are ready. What do you need?', cardKeys);
        setPetState('failed');
      } finally {
        chatSend.disabled = false;
        chatInput.focus();
      }
    }

    chatSend.addEventListener('click', sendChatMessage);
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

    /* ══════ WELCOME POPUP ══════ */
    (function initWelcome() {
      const overlay = document.getElementById('welcomeOverlay');
      const dontAsk = document.getElementById('welcomeDontAsk');
      if (!overlay) return;

      const dismissed = localStorage.getItem('zijun_welcome_dismissed');
      if (dismissed) {
        overlay.style.display = 'none';
        return;
      }

      overlay.classList.add('active');

      window.dismissWelcome = function() {
        if (dontAsk && dontAsk.checked) {
          localStorage.setItem('zijun_welcome_dismissed', '1');
        }
        overlay.classList.remove('active');
        setTimeout(function() { overlay.style.display = 'none'; }, 350);
      };

      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          window.dismissWelcome();
        }
      });
    })();

    /* ══════ SCROLL NAV ══════ */
    (function initScrollNav() {
      const navBtns = document.querySelectorAll('.scroll-nav-btn');
      if (!navBtns.length) return;

      const sectionMap = {
        'hub': document.getElementById('hub'),
        'gallery': document.getElementById('gallery'),
        'contact': document.getElementById('contact')
      };

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
          title: 'Not So AI',
          context: 'AI generated image',
          src: 'post/notsoai1.jpg',
          type: 'image',
          category: 'ai-generated',
          date: '2026-09'
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
          category: 'case-study',
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
          return filter === 'all' || item.category === filter;
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
