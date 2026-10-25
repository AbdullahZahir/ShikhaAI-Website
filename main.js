(() => {
  const root = document.documentElement;
  const liveStatus = document.getElementById('live-status');
  const announce = (message) => { liveStatus.textContent = message; };
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const motionPaused = () => root.classList.contains('motion-paused');

  /* ---------- Header: hairline once the page scrolls ---------- */
  const header = document.getElementById('site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 4);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const menuToggle = header.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');

  const setMenu = (open, { restoreFocus = false } = {}) => {
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    header.classList.toggle('is-open', open);
    if (open) menu.querySelector('a').focus();
    else if (restoreFocus) menuToggle.focus();
  };

  menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) setMenu(false, { restoreFocus: true });
  });
  document.addEventListener('click', (e) => {
    if (!menu.hidden && !header.contains(e.target)) setMenu(false);
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
    if (e.matches && !menu.hidden) setMenu(false);
  });

  /* ---------- Images: hold a skeleton until the image has decoded ---------- */
  document.querySelectorAll('.media-loading').forEach((wrap) => {
    const img = wrap.querySelector('img');
    const done = () => wrap.classList.add('is-loaded');
    if (img.complete && img.naturalWidth) done();
    else {
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    }
  });

  /* ---------- Floating idea dots on the hero's graph paper ---------- */
  const dots = (() => {
    const canvas = document.querySelector('.hero-dots');
    const host = document.querySelector('.hero');
    if (!canvas || !host || !canvas.getContext) return { setPaused() {} };

    const ctx = canvas.getContext('2d');
    const LINK = 128;          // max distance for a line between two dots
    const REACH = 160;         // pointer connects to dots within this radius
    let width = 0;
    let height = 0;
    let nodes = [];
    let ripples = [];
    let colorA = '29 92 194';
    let colorB = '230 172 0';
    const pointer = { x: -1e4, y: -1e4 };
    let frame = null;
    let inView = true;
    let paused = motionPaused();

    const readColors = () => {
      const styles = getComputedStyle(root);
      colorA = styles.getPropertyValue('--dot-a').trim() || colorA;
      colorB = styles.getPropertyValue('--dot-b').trim() || colorB;
    };

    const seed = () => {
      const count = Math.max(24, Math.min(84, Math.round((width * height) / 15000)));
      nodes = Array.from({ length: count }, (_, i) => {
        const speed = 0.08 + Math.random() * 0.16;
        const angle = Math.random() * Math.PI * 2;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          base: speed,
          r: i % 9 === 0 ? 3 : 1.5 + Math.random(),
          spark: i % 9 === 0,
        };
      });
    };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = host.clientWidth;
      height = host.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      draw();
    };

    const step = () => {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        // Ease any burst of speed back down to the dot's resting drift.
        const speed = Math.hypot(n.vx, n.vy);
        if (speed > n.base) {
          const k = Math.max(n.base / speed, 0.96);
          n.vx *= k;
          n.vy *= k;
        }
        if (n.x < -8) n.x = width + 8;
        if (n.x > width + 8) n.x = -8;
        if (n.y < -8) n.y = height + 8;
        if (n.y > height + 8) n.y = -8;
      }
      ripples = ripples.filter((r) => (r.radius += 3) < r.max);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.strokeStyle = `rgb(${colorA} / ${(1 - d / LINK) * 0.22})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const dp = Math.hypot(a.x - pointer.x, a.y - pointer.y);
        if (dp < REACH) {
          ctx.strokeStyle = `rgb(${colorA} / ${(1 - dp / REACH) * 0.5})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }

      for (const n of nodes) {
        ctx.fillStyle = n.spark ? `rgb(${colorB} / 0.9)` : `rgb(${colorA} / 0.5)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const r of ripples) {
        ctx.strokeStyle = `rgb(${colorA} / ${(1 - r.radius / r.max) * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const loop = () => {
      step();
      draw();
      frame = requestAnimationFrame(loop);
    };

    const sync = () => {
      const shouldRun = !paused && inView && !document.hidden;
      if (shouldRun && frame === null) frame = requestAnimationFrame(loop);
      if (!shouldRun && frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
        draw();
      }
    };

    host.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const rect = host.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      if (paused) draw();
    });
    host.addEventListener('pointerleave', () => {
      pointer.x = pointer.y = -1e4;
      if (paused) draw();
    });

    // Clicking open graph paper sends a ripple that nudges nearby dots outward.
    host.addEventListener('pointerdown', (e) => {
      if (paused || e.target.closest('a, button, input, label, select, textarea, .builder, h1, p, li')) return;
      const rect = host.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ripples.push({ x, y, radius: 0, max: 140 });
      for (const n of nodes) {
        const dx = n.x - x;
        const dy = n.y - y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < 180) {
          const push = (1 - d / 180) * 2.4;
          n.vx += (dx / d) * push;
          n.vy += (dy / d) * push;
        }
      }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });
    document.addEventListener('visibilitychange', sync);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { readColors(); draw(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }).observe(host);
    }

    readColors();
    resize();
    sync();

    return {
      setPaused(value) {
        paused = value;
        sync();
      },
    };
  })();

  /* ---------- Motion toggle: pauses every animation on the page ---------- */
  const revealables = document.querySelectorAll('[data-reveal]');
  const revealAll = () => revealables.forEach((el) => el.classList.add('is-visible'));
  const motionToggle = document.querySelector('.motion-toggle');

  const applyMotion = (paused) => {
    root.classList.toggle('motion-paused', paused);
    const label = paused ? 'Play animations' : 'Pause animations';
    motionToggle.setAttribute('aria-pressed', String(paused));
    motionToggle.setAttribute('aria-label', label);
    motionToggle.title = label;
    dots.setPaused(paused);
    if (paused) revealAll();
  };

  applyMotion(motionPaused());
  motionToggle.addEventListener('click', () => {
    const paused = !motionPaused();
    applyMotion(paused);
    try { localStorage.setItem('shikha-motion', paused ? 'paused' : 'on'); } catch { /* storage unavailable */ }
    announce(paused ? 'Animations paused' : 'Animations on');
  });

  /* ---------- Gentle reveal as sections enter the viewport ---------- */
  if (motionPaused() || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0 });
    revealables.forEach((el) => io.observe(el));
  }

  // The hero highlight draws once the fonts are in, so it lands on the final line breaks.
  const drawHeroMarker = () => document.querySelectorAll('.is-drawn-on-load').forEach((el) => el.classList.add('is-drawn'));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawHeroMarker);
  else drawHeroMarker();

  /* ---------- Read-aloud with word highlighting ---------- */
  const reader = (() => {
    const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
    let session = 0;
    let timers = [];
    let onFinish = null;

    const pickVoices = () => {
      const voices = synth ? synth.getVoices().filter((v) => /^en(-|_|$)/i.test(v.lang)) : [];
      const local = voices.filter((v) => v.localService);
      const pool = local.length ? local : voices;
      return [pool[0] || null, pool[1] || pool[0] || null];
    };

    const clearHighlights = () => {
      timers.forEach(clearTimeout);
      timers = [];
      document.querySelectorAll('.word.is-spoken').forEach((w) => w.classList.remove('is-spoken'));
    };

    const highlightAt = (words, index) => {
      const target = words.find((w) => index >= w.start && index < w.end);
      if (!target) return;
      words.forEach((w) => w.el.classList.toggle('is-spoken', w === target));
    };

    // Split a paragraph into word spans and remember each word's character range.
    const wordify = (p) => {
      const text = p.textContent;
      p.textContent = '';
      const words = [];
      let offset = 0;
      text.split(/(\s+)/).forEach((token) => {
        if (!token) return;
        if (/^\s+$/.test(token)) {
          p.appendChild(document.createTextNode(token));
        } else {
          const span = document.createElement('span');
          span.className = 'word';
          span.textContent = token;
          p.appendChild(span);
          words.push({ el: span, start: offset, end: offset + token.length });
        }
        offset += token.length;
      });
      p._words = words;
      p._text = text;
    };

    const sentencesOf = (text) => {
      const out = [];
      const re = /[^.!?]+[.!?]+[’"']?\s*|[^.!?]+$/g;
      let m;
      while ((m = re.exec(text))) out.push({ text: m[0], start: m.index });
      return out;
    };

    // Fallback for voices that never report word boundaries: pace the highlight by word length.
    const estimate = (words, sentence, rate, id) => {
      const inSentence = words.filter((w) => w.start >= sentence.start && w.start < sentence.start + sentence.text.length);
      const msPerChar = 60000 / (165 * 5.2 * rate);
      let t = 0;
      inSentence.forEach((w) => {
        timers.push(setTimeout(() => { if (id === session) highlightAt(words, w.start); }, t));
        t += Math.max(140, (w.end - w.start + 1) * msPerChar);
      });
    };

    const stop = () => {
      session++;
      if (synth) synth.cancel();
      clearHighlights();
      if (onFinish) { const done = onFinish; onFinish = null; done(); }
    };

    const play = (paragraphs, { rate = 1, twoVoices = false, finished } = {}) => {
      // Replace any reading in progress without telling its owner it finished.
      onFinish = null;
      stop();
      if (!synth) return;
      const id = ++session;
      onFinish = finished;
      const [voiceA, voiceB] = pickVoices();
      const queue = [];
      paragraphs.forEach((p, index) => {
        const isB = twoVoices && index % 2 === 1;
        sentencesOf(p._text).forEach((sentence) => queue.push({ p, sentence, isB }));
      });

      const next = () => {
        if (id !== session) return;
        const item = queue.shift();
        if (!item) { stop(); return; }
        const { p, sentence, isB } = item;
        const utterance = new SpeechSynthesisUtterance(sentence.text);
        const voice = isB ? voiceB : voiceA;
        if (voice) utterance.voice = voice;
        utterance.rate = rate;
        utterance.pitch = twoVoices ? (isB ? 0.9 : 1.15) : 1;
        let sawBoundary = false;
        utterance.onboundary = (e) => {
          if (id !== session || (e.name && e.name !== 'word')) return;
          sawBoundary = true;
          timers.forEach(clearTimeout);
          timers = [];
          highlightAt(p._words, sentence.start + e.charIndex);
        };
        utterance.onstart = () => {
          if (id !== session) return;
          highlightAt(p._words, sentence.start + (sentence.text.length - sentence.text.trimStart().length));
          timers.push(setTimeout(() => { if (!sawBoundary && id === session) estimate(p._words, sentence, rate, id); }, 450));
        };
        utterance.onend = () => {
          if (id !== session) return;
          clearHighlights();
          next();
        };
        utterance.onerror = () => { if (id === session) stop(); };
        synth.speak(utterance);
      };
      // Chrome can drop an utterance queued in the same tick as cancel().
      setTimeout(next, 60);
    };

    // Chrome loads its voice list lazily; ask early so it is ready by the first click.
    if (synth) synth.getVoices();

    return { supported: Boolean(synth), wordify, play, stop };
  })();

  /* ---------- Lesson builder ---------- */
  (() => {
    const lessons = window.SHIKHA_LESSONS;
    const form = document.getElementById('builder-form');
    const stage = document.getElementById('stage');
    const result = document.getElementById('result');
    if (!lessons || !form || !stage) return;

    const button = document.getElementById('build-btn');
    const buttonLabel = button.querySelector('.build-label');
    const iconIdle = button.querySelector('.icon-idle');
    const iconBusy = button.querySelector('.icon-busy');
    const grade = document.getElementById('grade');
    const gradeOutput = document.getElementById('grade-output');
    const steps = [...stage.querySelectorAll('.pipeline li')];

    const BANDS = { elementary: 'Elementary', middle: 'Middle school', high: 'High school' };
    const bandOf = (g) => (g <= 4 ? 'elementary' : g <= 8 ? 'middle' : 'high');
    const formatName = { video: 'Video + Script', podcast: 'Podcast' };
    let speed = 1;
    let built = null;
    let building = false;

    const values = () => ({
      topic: form.elements.topic.value,
      grade: Number(grade.value),
      format: form.elements.format.value,
    });
    const sameLesson = (a, b) => a && b && a.topic === b.topic && a.format === b.format && bandOf(a.grade) === bandOf(b.grade) && a.grade === b.grade;

    const updateGrade = () => {
      const g = Number(grade.value);
      const band = BANDS[bandOf(g)];
      gradeOutput.innerHTML = `<strong>Grade ${g}</strong> · ${band}`;
      grade.setAttribute('aria-valuetext', `Grade ${g}, ${band.toLowerCase()}`);
      grade.style.setProperty('--fill', `${((g - 1) / 11) * 100}%`);
    };

    const markStale = () => {
      if (building) return;
      stage.dataset.stale = String(!sameLesson(values(), built));
    };

    const icon = (name, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
    const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    const render = ({ topic, grade: g, format }) => {
      const lesson = lessons[topic];
      const band = bandOf(g);
      let body = '';
      if (format === 'video') {
        body = `
          <ol class="storyboard" aria-label="Storyboard">
            ${lesson.scenes.map((s, i) => `
              <li class="scene">
                <div class="scene-art"><span class="scene-num">${i + 1}</span>${icon(s.icon)}</div>
                <span class="scene-caption">${escapeHtml(s.caption)}</span>
              </li>`).join('')}
          </ol>
          <div class="script">
            <span class="turn-name">Script</span>
            <p data-speak>${escapeHtml(lesson.script[band])}</p>
          </div>`;
      } else {
        const [a, b] = lesson.podcast[band];
        body = `
          <div class="dialogue">
            <div class="turn">
              <span class="avatar avatar--a" aria-hidden="true">S</span>
              <div><span class="turn-name">Shimmer</span><p data-speak>${escapeHtml(a)}</p></div>
            </div>
            <div class="turn">
              <span class="avatar avatar--b" aria-hidden="true">E</span>
              <div><span class="turn-name">Echo</span><p data-speak>${escapeHtml(b)}</p></div>
            </div>
          </div>`;
      }

      const listen = reader.supported ? `
        <div class="listen-row">
          <button class="btn btn--board btn--sm" type="button" data-listen aria-pressed="false">
            ${icon('volume', 'icon icon-listen')}${icon('stop', 'icon icon-stop')}
            <span class="listen-label">Listen</span>
          </button>
          <fieldset>
            <legend class="visually-hidden">Reading speed</legend>
            <div class="speed segmented">
              ${[0.75, 1, 1.25, 1.5, 2].map((v) => `
                <label class="segment"><input type="radio" name="speed" value="${v}" ${v === speed ? 'checked' : ''}><span>${v}×</span></label>`).join('')}
            </div>
          </fieldset>
        </div>
        <p class="stage-note">Read aloud by your browser’s built-in voice. The app narrates with natural AI voices.</p>` : `
        <p class="stage-note">The app narrates every lesson with natural AI voices.</p>`;

      result.innerHTML = `
        <div class="stage-label">
          <strong>${escapeHtml(lesson.title)}</strong>
          <span>Grade ${g} · ${BANDS[band]} · ${formatName[format]}</span>
        </div>
        ${body}
        ${listen}`;

      const paragraphs = [...result.querySelectorAll('[data-speak]')];
      paragraphs.forEach(reader.wordify);

      const listenBtn = result.querySelector('[data-listen]');
      if (listenBtn) {
        const label = listenBtn.querySelector('.listen-label');
        const setPlaying = (on) => {
          listenBtn.setAttribute('aria-pressed', String(on));
          label.textContent = on ? 'Stop' : 'Listen';
        };
        listenBtn.addEventListener('click', () => {
          if (listenBtn.getAttribute('aria-pressed') === 'true') {
            reader.stop();
            return;
          }
          setPlaying(true);
          reader.play(paragraphs, { rate: speed, twoVoices: format === 'podcast', finished: () => setPlaying(false) });
        });
        result.querySelectorAll('input[name="speed"]').forEach((input) => {
          input.addEventListener('change', () => {
            speed = Number(input.value);
            if (listenBtn.getAttribute('aria-pressed') === 'true') {
              reader.play(paragraphs, { rate: speed, twoVoices: format === 'podcast', finished: () => setPlaying(false) });
            }
          });
        });
      }
    };

    const setStep = (index, status) => { steps[index].dataset.status = status; };

    const build = async () => {
      if (building) return;
      building = true;
      reader.stop();
      const lesson = values();
      const isVideo = lesson.format === 'video';
      const texts = isVideo
        ? [`Writing the script for Grade ${lesson.grade}`, `Illustrating ${lessons[lesson.topic].scenes.length} scenes`, 'Recording the narration']
        : [`Writing the dialogue for Grade ${lesson.grade}`, 'Casting Shimmer and Echo', 'Recording two voices'];

      steps.forEach((li, i) => {
        li.querySelector('.pipeline-text').textContent = texts[i];
        li.dataset.status = 'pending';
      });
      button.setAttribute('aria-disabled', 'true');
      buttonLabel.textContent = 'Building…';
      iconIdle.hidden = true;
      iconBusy.hidden = false;
      stage.dataset.stale = 'false';
      stage.dataset.state = 'building';
      stage.setAttribute('aria-busy', 'true');
      announce('Building the lesson');

      const beat = motionPaused() ? 240 : 640;
      for (let i = 0; i < steps.length; i++) {
        setStep(i, 'active');
        await wait(beat);
        setStep(i, 'done');
      }
      await wait(beat / 3);

      render(lesson);
      built = lesson;
      stage.dataset.state = 'done';
      stage.setAttribute('aria-busy', 'false');
      result.classList.remove('is-entering');
      void result.offsetWidth;
      result.classList.add('is-entering');
      button.removeAttribute('aria-disabled');
      buttonLabel.textContent = 'Build lesson';
      iconIdle.hidden = false;
      iconBusy.hidden = true;
      building = false;
      announce(`Lesson ready: ${lessons[lesson.topic].title}, grade ${lesson.grade}, ${formatName[lesson.format]}`);
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      build();
    });
    form.addEventListener('input', (e) => {
      if (e.target === grade) updateGrade();
      markStale();
    });
    form.addEventListener('change', markStale);

    // Show a finished lesson straight away, so the card is never empty.
    updateGrade();
    built = values();
    render(built);
  })();

  /* ---------- Tabs (WAI-ARIA tabs pattern, automatic activation) ---------- */
  document.querySelectorAll('[data-tabs]').forEach((tabRoot) => {
    const tabs = [...tabRoot.querySelectorAll('[role="tab"]')];

    const select = (tab, { focus = false } = {}) => {
      tabs.forEach((t) => {
        const selected = t === tab;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        if (selected && panel.hidden) {
          panel.hidden = false;
          panel.classList.remove('is-entering');
          void panel.offsetWidth;
          panel.classList.add('is-entering');
        } else if (!selected) {
          panel.hidden = true;
        }
      });
      if (focus) tab.focus();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        let next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          select(next, { focus: true });
        }
      });
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('[data-accordion] .faq-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const open = trigger.getAttribute('aria-expanded') !== 'true';
      trigger.setAttribute('aria-expanded', String(open));
      trigger.closest('.faq-item').classList.toggle('is-open', open);
    });
  });

  /* ---------- Copy buttons ---------- */
  const legacyCopy = (text) => {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    area.remove();
    return ok;
  };

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch { /* permission denied — fall through to the legacy path */ }
    }
    return legacyCopy(text);
  };

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  document.querySelectorAll('.copy-btn').forEach((btn) => {
    const label = btn.querySelector('.copy-label');
    const code = btn.closest('.code').querySelector('pre code');
    let timer;
    btn.addEventListener('click', async () => {
      clearTimeout(timer);
      const ok = await copyText(btn.dataset.copy);
      if (ok) {
        btn.dataset.state = 'copied';
        label.textContent = 'Copied';
        announce('Copied to clipboard');
      } else {
        // Last resort: select the code so a keyboard shortcut finishes the job.
        const range = document.createRange();
        range.selectNodeContents(code);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        btn.dataset.state = 'manual';
        label.textContent = isMac ? 'Press ⌘C' : 'Press Ctrl+C';
        announce(`Text selected. ${label.textContent} to copy.`);
      }
      timer = setTimeout(() => {
        delete btn.dataset.state;
        label.textContent = 'Copy';
      }, 2400);
    });
  });

  /* ---------- Latest release, fetched live from GitHub ---------- */
  const release = document.getElementById('release');
  if (release) {
    const field = (name) => release.querySelector(`[data-release="${name}"]`);
    const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    fetch('https://api.github.com/repos/AbdullahZahir/ShikhaAI/releases/latest', {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        const asset = (data.assets || [])[0];
        const parts = [`Published ${dateFormat.format(new Date(data.published_at))}`];
        if (asset) {
          const type = asset.name.split('.').pop().toUpperCase();
          parts.push(`${type}, ${(asset.size / 1e6).toFixed(1)} MB`);
        }
        field('version').textContent = data.tag_name;
        field('meta').textContent = parts.join(' · ');
        field('link').href = data.html_url;
      })
      // On any failure the static v1.0.0 details already in the markup stay in place.
      .catch(() => {})
      .finally(() => {
        clearTimeout(timeout);
        release.setAttribute('aria-busy', 'false');
      });
  }
})();
