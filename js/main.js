/* Majid Sanad — portfolio interactions (no dependencies) */
(() => {
  const D = window.PORTFOLIO;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const page = document.body.dataset.page || "home";
  // language: Arabic pages live in /ar/ and use <base href="../">, so asset paths stay the same
  const AR = document.documentElement.lang === "ar";
  const LP = AR ? "ar/" : "";
  D.projects.forEach(p => { p.key = p.cat; });
  if (AR && window.PORTFOLIO_AR) {
    const A = window.PORTFOLIO_AR;
    D.projects.forEach(p => Object.assign(p, A.projects[p.slug] || {}));
    D.workedAt = A.workedAt;
  }
  const T = AR ? {
    view: "شوف", next: "التالي", hi: "هلا", copied: "تم نسخ الإيميل ✓",
    chapters: { Branding: ["الهويات", "البراند مو شعار… البراند وعد تشوفه بعينك.", ""], Campaign: ["الحملات", "أفكار تحرّك الناس — حملات توعية وإطلاقات ومواسم لجهات وطنية.", "dark"], Editorial: ["المطبوعات", "معلومات كثيرة، بس تنعرض بهدوء — بروفايلات وتقارير وكتيّبات.", ""] },
    allWork: "→ كل الأعمال", client: "العميل", discipline: "المجال", designer: "المصمم", me: "Majid Sanad",
    about: ["عن", "المشروع"], similar: "عندك مشروع<br><em>زيه؟</em>", talk: "كلّمني", nextProject: "المشروع التالي", arrow: "←",
    foot: "مصمم جرافيك — © 2026. كل البراندات، كل الرؤية.", top: "ارجع فوق ↑", lett: "خط عربي يدوي — ماجد سند"
  } : {
    view: "View", next: "Next", hi: "Say hi", copied: "Email copied ✓",
    chapters: { Branding: ["Branding", "A brand is not a logo. It's a promise made visible.", ""], Campaign: ["Campaigns", "Ideas that move people — awareness, launches and seasonal campaigns for national entities.", "dark"], Editorial: ["Editorials", "Dense information, made calm. Profiles, reports and brochures.", ""] },
    allWork: "← All work", client: "Client", discipline: "Discipline", designer: "Designer", me: "Majid Sanad",
    about: ["About this", "project"], similar: "Have a similar<br><em>project?</em>", talk: "Let's talk", nextProject: "Next project", arrow: "→",
    foot: "Graphic Designer — © 2026. All brands. All vision.", top: "Back to top ↑", lett: "Arabic lettering by Majid Sanad"
  };
  // image ids: "p13" = cropped artboard, "k115" = original Links file
  const IV = "?i=2"; // bump to force browsers to re-download images
  const img = (id, size = "s") => (size === "s" ? `img/w/s/${id}.jpg` : size === "m" ? `img/w/m/${id}.jpg` : `img/w/${id}.jpg`) + IV;
  // responsive sources: the browser picks 1000 / 2000 / 4000px for the screen
  const srcset = id => `img/w/s/${id}.jpg${IV} 1000w, img/w/m/${id}.jpg${IV} 2000w, img/w/${id}.jpg${IV} 4000w`;
  const pic = (id, sizes, alt, extra = "") => `<img src="${img(id, "m")}" srcset="${srcset(id)}" sizes="${sizes}" alt="${alt}" ${extra}>`;
  const pad2 = n => String(n).padStart(2, "0");
  let vw = innerWidth, vh = innerHeight;
  const scrollers = [];
  const inView = (r, m = 0) => r.bottom > -m && r.top < vh + m;

  /* ---------- helpers ---------- */
  function splitChars(el) {
    const text = el.textContent;
    el.setAttribute("aria-hidden", "true");
    el.textContent = "";
    [...text].forEach((c, i) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = c === " " ? " " : c;
      s.style.setProperty("--i", i);
      el.appendChild(s);
    });
  }
  function splitWords(el) {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(" ");
  }
  // scale a display title so its widest line fills the container
  function fit(el, ratio = 1, maxPx = Infinity) {
    if (!el) return;
    const lines = $$(":scope > .hero__line, :scope > .line", el);
    el.style.fontSize = "100px";
    let widest = 0;
    lines.forEach(l => {
      const prev = l.style.cssText;
      l.style.display = "inline-block"; l.style.width = "auto";
      widest = Math.max(widest, l.getBoundingClientRect().width);
      l.style.cssText = prev;
    });
    const box = el.parentElement, cs = getComputedStyle(box);
    const inner = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    el.style.fontSize = Math.min(maxPx, Math.max(40, inner * ratio / widest * 100)) + "px";
    $$(".flex-word", el).forEach(f => (f.style.fontSize = "inherit"));
  }

  /* ---------- clock ---------- */
  const clock = $(".js-clock");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Riyadh" });
    const tick = () => (clock.textContent = fmt.format(new Date()));
    tick(); setInterval(tick, 15000);
  }

  /* ---------- cursor ---------- */
  const cursor = $(".cursor");
  const mouse = { x: vw / 2, y: vh / 2 };
  addEventListener("pointermove", e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  if (cursor && fine) {
    document.body.classList.add("has-cursor");
    const label = $(".cursor__label", cursor);
    let cx = mouse.x, cy = mouse.y;
    (function loop() {
      cx = lerp(cx, mouse.x, .22); cy = lerp(cy, mouse.y, .22);
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", e => {
      const t = e.target.closest("[data-cursor], a, button");
      const fx = !!(t && t.matches(".nav__cta, .consult__btn, .contact__cta"));
      cursor.classList.toggle("is-hidden", fx);
      cursor.classList.toggle("is-big", !fx && !!(t && t.dataset.cursor));
      cursor.classList.toggle("is-link", !fx && !!(t && !t.dataset.cursor));
      if (t && t.dataset.cursor) label.textContent = t.dataset.cursor;
    });
  }

  /* ---------- magnetic buttons ---------- */
  function magnetic(el) {
    if (!fine || reduce) return;
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .25}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transition = "transform .6s cubic-bezier(.16,1,.3,1)";
      el.style.transform = "";
      setTimeout(() => (el.style.transition = ""), 600);
    });
  }
  $$(".magnetic").forEach(magnetic);

  /* ---------- CTA buttons: a circle grows from where the pointer enters, shrinks to where it leaves ---------- */
  function ctaFill(el) {
    if (!fine || el.dataset.fx) return;
    el.dataset.fx = "1";
    el.classList.add("cta-fx");
    const f = document.createElement("span");
    f.className = "fx"; f.setAttribute("aria-hidden", "true");
    el.prepend(f);
    const at = e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const d = 2 * Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y));
      el.style.setProperty("--fx-x", x + "px"); el.style.setProperty("--fx-y", y + "px"); el.style.setProperty("--fx-d", d + "px");
    };
    el.addEventListener("pointerenter", e => { at(e); el.classList.add("fx-on"); });
    el.addEventListener("pointerleave", e => { at(e); el.classList.remove("fx-on"); });
  }
  const initFx = () => $$(".nav__cta, .consult__btn, .contact__cta").forEach(ctaFill);
  initFx();

  /* ---------- menu ---------- */
  const burger = $(".nav__burger");
  if (burger) {
    const toggle = open => {
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", open);
      $(".menu").setAttribute("aria-hidden", !open);
    };
    burger.addEventListener("click", () => toggle(!document.body.classList.contains("menu-open")));
    $$(".menu a").forEach(a => a.addEventListener("click", () => toggle(false)));
  }

  /* ---------- copy email ---------- */
  const toast = $(".toast");
  const say = msg => { if (!toast) return; toast.textContent = msg; toast.classList.add("show"); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove("show"), 1800); };
  document.addEventListener("click", e => {
    const b = e.target.closest(".js-copy");
    if (!b) return;
    const v = b.dataset.copy;
    (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => say(T.copied), () => (location.href = "mailto:" + v));
  });

  /* ---------- in-page anchors: scroll here, never jump to another page ---------- */
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const id = a.getAttribute("href").slice(1);
    const el = id && id !== "top" ? document.getElementById(id) : null;
    scrollTo({ top: el ? el.getBoundingClientRect().top + scrollY : 0, behavior: reduce ? "auto" : "smooth" });
  });

  /* ---------- page transitions ---------- */
  const curtain = document.createElement("div");
  curtain.className = "curtain";
  document.body.appendChild(curtain);
  if (sessionStorage.getItem("ms-curtain")) {
    sessionStorage.removeItem("ms-curtain");
    curtain.style.transform = "translateY(0)";
    requestAnimationFrame(() => requestAnimationFrame(() => { curtain.style.transform = ""; curtain.classList.add("out"); }));
  }
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute("href");
    if (!/^(ar\/)?(index\.html|project\.html|about\.html)/.test(href)) return;
    e.preventDefault();
    if (reduce) { location.href = href; return; }
    curtain.classList.remove("out"); curtain.classList.add("in");
    sessionStorage.setItem("ms-curtain", "1");
    setTimeout(() => (location.href = href), 600);
  });
  addEventListener("pageshow", e => { if (e.persisted) { curtain.classList.remove("in"); curtain.classList.add("out"); } });

  /* ---------- reveal on view ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      io.unobserve(en.target);
      if (en.target.matches(".statement__title")) countUp(en.target);
    });
  }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
  const observeReveals = () => $$(".reveal, .big-title, .statement__title, .contact__title, .consult__title,.p-title, .p-about h2, .p-gallery figure").forEach(el => io.observe(el));

  function countUp(root) {
    $$(".js-num", root).forEach(n => {
      const to = +n.dataset.to, t0 = performance.now(), dur = reduce ? 1 : 1400;
      (function step(t) {
        const p = clamp((t - t0) / dur);
        n.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }

  /* =========================================================
     HOME
     ========================================================= */
  let hTrack, hSection, trackMax = 0;
  // chapter cards (Branding / Campaigns / Editorials): the big word stays on one line and fills the card;
  // all chapters share the size of the longest word so they match
  function fitChapters() {
    const words = $$(".hchap .flex-word");
    if (!words.length) return;
    let size = Infinity;
    words.forEach(w => {
      w.style.fontSize = "100px";
      const box = w.parentElement, cs = getComputedStyle(box);
      const inner = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      size = Math.min(size, inner / w.scrollWidth * 100 * .98);
    });
    words.forEach(w => (w.style.fontSize = size.toFixed(1) + "px"));
  }
  function sizeH() {
    if (!hTrack) return;
    trackMax = Math.max(0, hTrack.scrollWidth - vw);
    hSection.style.height = (trackMax + vh) + "px";
  }

  if (page === "home") {
    $$(".js-words").forEach(splitWords);

    /* hero: rolling word inside the statement */
    const roller = $(".js-roller");
    if (roller) {
      // typewriter: the red word is typed, held, erased letter by letter, then the next one is typed
      const words = $$(".roller__w", roller).map(w => w.textContent);
      roller.classList.add("roller--type");
      roller.innerHTML = `<span class="roller__t">${words[0]}</span><i class="roller__caret" aria-hidden="true"></i>`;
      const t = $(".roller__t", roller);
      let wi = 0;
      const wait = ms => new Promise(r => setTimeout(r, ms));
      window.__startHero = async () => {
        if (reduce) return;
        await wait(1800);
        for (;;) {
          const w = words[wi];
          for (let n = w.length; n >= 0; n--) { t.textContent = w.slice(0, n); await wait(35); }
          roller.classList.add("is-empty");
          await wait(260);
          wi = (wi + 1) % words.length;
          const nw = words[wi];
          roller.classList.remove("is-empty");
          for (let n = 1; n <= nw.length; n++) { t.textContent = nw.slice(0, n); await wait(60 + Math.random() * 30); }
          await wait(2000);
        }
      };
    }

    /* hero: strip of work, looping slowly */
    const track = $(".js-strip .hero__track");
    if (track) {
      const extra = [["k102", "alatool"], ["k004", "sports-for-all"], ["k097", "frame-house"], ["k123", "sadeem"], ["k162", "do-not-give-it-a-chance"], ["k169", "cyberani-profile"], ["k182", "marasi"], ["k202", "alinma-fantasy"]];
      const items = [];
      const SKIP = ["cyberani-profile", "alinma-fantasy"];
      D.projects.forEach((p, i) => { if (!SKIP.includes(p.slug)) items.push([p.cover, p.slug, p.title]); if (extra[i] && !SKIP.includes(extra[i][1])) items.push([extra[i][0], extra[i][1], D.projects.find(q => q.slug === extra[i][1]).title]); });
      const html = items.map(([id, slug, title]) => `<a href="${LP}project.html?p=${slug}" data-cursor="${T.view}">${pic(id, "(max-width: 860px) 140px, 260px", title, 'decoding="async"')}<span>${title}</span></a>`).join("");
      track.innerHTML = html + html.replace(/<a /g, '<a aria-hidden="true" tabindex="-1" ');
    }

    /* contact title: letters widen near the cursor (first-version effect) */
    $$(".js-prox").forEach(splitChars);
    const prox = $$(".js-prox .ch").map(c => ({ c, w: 62 }));
    if (fine && !reduce && prox.length) scrollers.push(() => {
      const box = $(".contact__title").getBoundingClientRect();
      if (!inView(box)) return;
      const R = Math.max(160, box.height * 1.2);
      prox.forEach(o => {
        const r = o.c.getBoundingClientRect();
        const t = Math.max(0, 1 - Math.hypot(mouse.x - (r.left + r.width / 2), mouse.y - (r.top + r.height / 2)) / R);
        o.w = lerp(o.w, 62 + t * t * 60, .14);
        o.c.style.setProperty("--w", o.w.toFixed(1));
      });
    });

    /* marquee band: CSS-driven loop (runs on the compositor) */
    $$(".js-marquee").forEach(m => {
      const inner = $(".marquee__inner", m);
      for (let i = 0; i < 3; i++) m.appendChild(inner.cloneNode(true));
    });

    /* horizontal work track */
    hTrack = $(".js-htrack"); hSection = $(".hwork");
    const chapters = T.chapters;
    let lastCat = null, html = "", n = 0;
    D.projects.forEach(p => {
      if (p.key !== lastCat) {
        const c = chapters[p.key];
        html += `<div class="hchap ${c[2]}" data-chapter="${p.key.toLowerCase()}"><div class="hchap__top label"><span>${c[0]}</span></div><span class="flex-word">${c[0]}</span><p>${c[1]}</p></div>`;
        lastCat = p.key;
      }
      n++;
      html += `<a class="hcard" href="${LP}project.html?p=${p.slug}" data-cursor="${T.view}">
        <div class="hcard__media">${pic(p.cover, "(max-width: 860px) 84vw, 56vw", p.title + " — " + p.sub, 'loading="lazy"')}${pic(p.hover, "(max-width: 860px) 84vw, 56vw", "", 'loading="lazy"')}</div>
        <div class="hcard__meta"><h3 class="hcard__title">${p.title}</h3><span class="hcard__cat">${p.cat} — ${p.sub}</span></div>
      </a>`;
    });
    hTrack.innerHTML = html;
    const hbar = $(".hwork__bar");
    sizeH();
    scrollers.push(() => {
      const r = hSection.getBoundingClientRect();
      if (!inView(r, vh)) return;
      const p = clamp(-r.top / Math.max(1, r.height - vh));
      hTrack.style.transform = `translate3d(${(AR ? 1 : -1) * p * trackMax}px,0,0)`;
      hbar.style.setProperty("--hp", p);
    });

    /* lettering: stacked carousel, moved only by the visitor (drag, arrows, keys, trackpad, click a side poster).
       Front poster full size; the ones behind get smaller and peek out to the sides (vertically on phones). */
    const drum = $(".js-drum");
    if (drum) {
      // l01 (Awaidak Al Mashi) left out; the three black posters (5, 6, 7) and similar colours are kept apart, loop included
      const IDS = [16, 19, 4, 9, 6, 11, 8, 17, 10, 14, 2, 7, 13, 18, 15, 5, 12];   // Gaza (l16) is always the first one in front
      const N = IDS.length;
      const stage = $(".drum__stage", drum);
      stage.innerHTML = IDS.map((n, i) => {
        const id = "l" + pad2(n);
        return `<figure class="drum__card" data-i="${i}"><span class="drum__pic"><img src="img/lt/s/${id}.jpg${IV}" srcset="img/lt/s/${id}.jpg${IV} 640w, img/lt/${id}.jpg${IV} 1200w" sizes="(max-width: 600px) 75vw, 40vw" alt="${T.lett}" draggable="false"></span></figure>`;
      }).join("");
      const cards = $$(".drum__card", stage);
      const vert = matchMedia("(max-width: 600px)");
      const DUR = 420;
      let dragTo = 0;
      let V, SHOW, SHRINK, H = 0, P = 0, pos = 0, from = 0, to = 0, t0 = -1e9, dragging = false, moved = false, visible = false;
      const measure = () => {
        V = vert.matches;
        SHOW = V ? 3 : 5; SHRINK = V ? .1 : .075;
        H = V ? cards[0].offsetHeight : cards[0].offsetWidth;
        // wide screens: the outermost posters reach the screen edges
        P = V ? H * .065 : Math.max(24, (drum.clientWidth - H) / 2 / SHOW);
      };
      const wrap = d => ((d % N) + N * 1.5) % N - N / 2;
      const ease = x => 1 - Math.pow(1 - x, 3);
      const render = () => {
        cards.forEach(c => {
          const d = wrap(+c.dataset.i - pos), ad = Math.abs(d);
          if (ad > SHOW + .7) { c.style.visibility = "hidden"; return; }
          c.style.visibility = "";
          const sc = 1 - SHRINK * ad;
          const o = (Math.sign(d) * (H / 2 * (1 - sc) + P * ad)).toFixed(1);
          c.style.transform = V ? `translate3d(-50%, calc(-50% + ${o}px), 0) scale(${sc.toFixed(4)})`
                                : `translate3d(calc(-50% + ${o}px), -50%, 0) scale(${sc.toFixed(4)})`;
          c.style.zIndex = 100 - Math.round(ad * 10);
          c.style.opacity = ad > SHOW ? Math.max(0, 1 - (ad - SHOW) / .7).toFixed(3) : 1;
        });
      };
      const animTo = t => { from = pos; to = t; t0 = performance.now(); };
      const go = k => animTo(Math.round(t0 + DUR > performance.now() ? to : pos) + k);
      drum.addEventListener("keydown", e => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); go(1); }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); go(-1); }
      });
      // trackpad: sideways swipe moves it on wide screens; vertical page scroll is left alone
      let wAcc = 0, wT = 0;
      drum.addEventListener("wheel", e => {
        if (V || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        e.preventDefault();
        wAcc += e.deltaX;
        const now = performance.now();
        if (Math.abs(wAcc) > 60 && now - wT > 350) { go(Math.sign(wAcc)); wAcc = 0; wT = now; }
      }, { passive: false });
      // drag / swipe: along the stack's own direction (phones: sideways swipe also works, so the page can still scroll)
      let sx = 0, sy = 0, sp = 0, pid = null;
      let downT = 0;
      stage.addEventListener("pointerdown", e => { downT = performance.now(); dragTo = pos; dragging = true; moved = false; pid = e.pointerId; sx = e.clientX; sy = e.clientY; sp = pos; t0 = -1e9; drum.classList.add("is-drag"); });
      addEventListener("pointermove", e => {
        if (!dragging || e.pointerId !== pid) return;
        const dy = e.clientY - sy, dx = e.clientX - sx;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved = true;
        if (!V && e.pointerType !== "mouse" && Math.abs(dy) > Math.abs(dx) * 1.2 && Math.abs(dx) < 12) { dragging = false; drum.classList.remove("is-drag"); animTo(Math.round(pos)); return; }
        const d = V ? dy : dx;              // phones: up / down like reels; wider screens: sideways
        pos = dragTo = sp + Math.max(-1.1, Math.min(1.1, -d / (V ? H * .4 : Math.max(P * 1.2, 80))));
        render();
      });
      const end = e => {
        if (!dragging) return;
        dragging = false; drum.classList.remove("is-drag");
        if (!moved) {                       // a click on a side poster brings it to the front
          const c = e.target.closest && e.target.closest(".drum__card");
          if (c) { const d = wrap(+c.dataset.i - pos); animTo(Math.round(pos + d)); return; }
        }
        // like reels: a swipe moves exactly one poster, whichever way it went; a quick flick is enough
        const moveBy = pos - sp, fast = Math.abs(moveBy) / Math.max(1, performance.now() - downT) * 1000;
        animTo(Math.abs(moveBy) > .08 || fast > .8 ? Math.round(sp) + Math.sign(moveBy) : Math.round(sp));
      };
      addEventListener("pointerup", end); addEventListener("pointercancel", end);
      new IntersectionObserver(es => es.forEach(en => { visible = en.isIntersecting; })).observe(drum);
      addEventListener("resize", () => { measure(); render(); });
      measure(); render();
      (function tick(t) {
        if (visible) {
          if (t - t0 < DUR + 50) { pos = from + (to - from) * ease(Math.min(1, (t - t0) / DUR)); render(); }
        }
        requestAnimationFrame(tick);
      })(performance.now());
    }

    /* marks: real vector logos, two slow rows */
    const tracks = $$(".js-mtrack");
    if (tracks.length) {
      Promise.all(Array.from({ length: 28 }, (_, i) => fetch(`img/logos/logo-${pad2(i + 1)}.svg`).then(r => r.text()).catch(() => "")))
        .then(svgs => {
          // phones: logos as images (drawn once) instead of inline vectors that iOS re-rasterises while moving
          const asImg = svg => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
            svg.replace(/currentColor/g, "#EFEFED").replace(/var\(--logo-bg[^)]*\)/g, "#0B0B0B"));
          const cell = svg => fine ? `<span class="mk">${svg}</span>`
            : `<span class="mk"><img src="${asImg(svg)}" alt="" decoding="async"></span>`;
          [svgs.slice(0, 14), svgs.slice(14)].forEach((set, r) => {
            const html = set.filter(Boolean).map(cell).join("");
            tracks[r].innerHTML = html + html;
          });
          // move each row by an exact pixel distance, started only once the logos have a size
          // (Safari fixes a % distance at start time, when the row was still empty)
          const anims = [];
          const run = () => {
            anims.forEach(a => a.cancel()); anims.length = 0;
            tracks.forEach((t, r) => {
              const half = t.scrollWidth / 2;
              if (!half) return;
              const a = t.animate(
                [{ transform: "translate3d(0,0,0)" }, { transform: `translate3d(${-half}px,0,0)` }],
                { duration: half / 45 * 1000, iterations: Infinity, easing: "linear", direction: r ? "reverse" : "normal" });
              anims.push(a);
            });
          };
          const imgs = $$("img", tracks[0].parentNode.parentNode);
          Promise.all(imgs.map(i => i.decode ? i.decode().catch(() => {}) : Promise.resolve()))
            .then(() => requestAnimationFrame(run));
          let lw = innerWidth, mt;
          addEventListener("resize", () => { if (innerWidth === lw) return; lw = innerWidth; clearTimeout(mt); mt = setTimeout(run, 200); });
          if (fine) {
            const rows = $(".marks__rows");
            rows.addEventListener("pointerenter", () => anims.forEach(a => a.pause()));
            rows.addEventListener("pointerleave", () => anims.forEach(a => a.play()));
          }
        });
    }

    /* worked at */
    $(".js-worked").innerHTML = D.workedAt.map((w, i) =>
      `<li class="reveal"><span class="a">${w[0]}</span><span class="r">${w[1]}</span><span class="d">${w[2]}</span></li>`).join("");

    /* scroll-linked horizontal rows */
    // rows marked js-drag also take a drag / swipe / sideways trackpad scroll on top of the scroll motion
    const setX = el => {
      let x = (el._base || 0) + (el._off || 0);
      if (el._drag) {
        const lim = Math.max(0, (el.scrollWidth - innerWidth) / 2 + 16);
        x = clamp(x, -lim, lim); el._off = x - (el._base || 0);
      }
      el.style.setProperty("--x", x.toFixed(1) + "px");
    };
    $$(".js-xscroll").forEach(el => {
      const dir = +el.dataset.dir || -1, amt = +el.dataset.amt || .3;
      scrollers.push(() => {
        const r = el.getBoundingClientRect();
        if (!inView(r, 200)) return;
        const p = clamp((vh - r.top) / (vh + r.height));
        el._base = dir * (p - .5) * amt * r.width;
        setX(el);
      });
    });
    $$(".js-drag").forEach(el => {
      el._drag = true; el._off = 0;
      let down = false, sx = 0, so = 0, lx = 0, lt = 0, v = 0, raf = 0, moved = 0;
      const glide = () => {
        v *= .94; el._off += v; setX(el);
        if (Math.abs(v) > .3) raf = requestAnimationFrame(glide);
      };
      el.addEventListener("pointerdown", e => {
        if (e.button) return;
        down = true; moved = 0; sx = lx = e.clientX; so = el._off; lt = performance.now(); v = 0;
        cancelAnimationFrame(raf); el.classList.add("is-drag");
      });
      addEventListener("pointermove", e => {
        if (!down) return;
        const now = performance.now();
        v = (e.clientX - lx) / Math.max(1, now - lt) * 16; lx = e.clientX; lt = now;
        moved = Math.max(moved, Math.abs(e.clientX - sx));
        el._off = so + (e.clientX - sx); setX(el);
      });
      const up = () => {
        if (!down) return;
        down = false; el.classList.remove("is-drag");
        if (performance.now() - lt < 80) raf = requestAnimationFrame(glide);
      };
      addEventListener("pointerup", up); addEventListener("pointercancel", up);
      el.addEventListener("click", e => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
      el.addEventListener("dragstart", e => e.preventDefault());
      el.addEventListener("wheel", e => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        e.preventDefault(); cancelAnimationFrame(raf);
        el._off -= e.deltaX; setX(el);
      }, { passive: false });
    });

    /* about photo parallax */
    $$(".js-par").forEach(f => scrollers.push(() => {
      const r = f.getBoundingClientRect();
      if (!inView(r)) return;
      f.style.setProperty("--py", (-(clamp((vh - r.top) / (vh + r.height))) * 12).toFixed(2) + "%");
    }));

    /* quote words */
    const quote = $(".quote"), qs = $(".quote__sticky"), words = $$(".quote__text .w");
    if (quote) scrollers.push(() => {
      const r = quote.getBoundingClientRect();
      if (!inView(r)) return;
      const p = clamp(-r.top / (r.height - vh));
      qs.style.setProperty("--qp", clamp(p * 1.6).toFixed(3));
      const lit = Math.floor(clamp(p * 1.25) * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < lit));
    });

    /* floating whatsapp */

    /* loader */
    const loader = $(".loader"), count = $(".js-count");
    const minTime = reduce ? 200 : sessionStorage.getItem("ms-visited") ? 600 : 1500;
    const t0 = performance.now();
    let ready = false, finished = false;
    const assets = Promise.all([
      document.fonts ? document.fonts.ready : 0,
      0
    ]).then(() => (ready = true));
    const finish = () => {
      if (finished) return;
      finished = true;
      count.textContent = "100";
      sessionStorage.setItem("ms-visited", "1");
      onResize();
      loader.classList.add("done");
      document.body.classList.remove("is-loading");
      setTimeout(() => { document.body.classList.add("loaded"); window.__startHero && window.__startHero(); }, 250);
      setTimeout(() => loader.remove(), 1400);
    };
    Promise.all([assets, new Promise(r => setTimeout(r, minTime))]).then(finish);
    setTimeout(finish, minTime + 3500);
    (function load() {
      if (finished) return;
      const p = clamp((performance.now() - t0) / minTime);
      count.textContent = String(Math.round((ready ? p : Math.min(p, .9)) * 100)).padStart(3, "0");
      requestAnimationFrame(load);
    })();
  }

  /* =========================================================
     PROJECT PAGE
     ========================================================= */
  if (page === "project") {
    const slug = new URLSearchParams(location.search).get("p");
    const idx = D.projects.findIndex(p => p.slug === slug);
    if (idx < 0) { location.replace(LP + "index.html#work"); return; }
    const p = D.projects[idx], next = D.projects[(idx + 1) % D.projects.length];
    document.title = `${p.title} — ${p.sub} · ${T.me}`;
    const sw = $(".js-lang");
    if (sw) sw.href = (AR ? "" : "ar/") + "project.html?p=" + p.slug;
    document.documentElement.style.setProperty("--pbg", p.bg);
    document.documentElement.style.setProperty("--pfg", p.fg);
    $('meta[name="theme-color"]').setAttribute("content", p.bg);

    const lines = []; let cur = "";
    p.title.split(" ").forEach(w => { if ((cur + " " + w).trim().length > 12 && cur) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim(); });
    lines.push(cur);

    const fig = (id, sz = "100vw") => `<figure>${pic(id, sz, p.title + " — " + p.sub, 'loading="lazy"')}</figure>`;
    const gallery = p.gallery.map(item => Array.isArray(item)
      ? `<div class="g-row" style="--n:${item.length}">${item.map(id => fig(id, p.stack ? "(max-width: 600px) 100vw, 50vw" : `${Math.round(100 / item.length)}vw`)).join("")}</div>`
      : p.mob && p.mob[item]
        // phones: a combined image is replaced by its single posters, one per row
        ? fig(item).replace("<figure>", '<figure class="g-wide g-desk">') + `<div class="g-mob">${p.mob[item].map(id => fig(id, "100vw")).join("")}</div>`
        : fig(item).replace("<figure>", '<figure class="g-wide">')).join("");

    $("#project").innerHTML = `
      <section class="p-hero">
        <div class="p-hero__top label"><a href="${LP}index.html#work" class="p-back roll"><span data-t="${T.allWork}">${T.allWork}</span></a><span>${p.cat}</span></div>
        <h1 class="p-title">${lines.map(l => `<span class="line"><span>${l}</span></span>`).join("")}</h1>
        <div class="p-hero__row"><span class="p-sub">${p.sub}</span></div>
      </section>
      <div class="p-meta">
        <div><span>${T.client}</span>${p.client}</div>
        <div><span>${T.discipline}</span>${p.cat} — ${p.sub}</div>
        <div><span>${T.designer}</span>${T.me}</div>
      </div>
      <figure class="p-cover">${pic(p.cover, "100vw", p.title + " — " + p.sub)}</figure>
      <section class="p-about">
        <h2><span class="line"><span>${T.about[0]}</span></span><span class="line"><span>${T.about[1]}</span></span></h2>
        <div class="p-about__grid">${p.about.map(a => `<article class="reveal"><h3>${a[0]}</h3><p>${a[1]}</p></article>`).join("")}</div>
      </section>
      <section class="p-gallery${p.stack ? " p-gallery--stack" : ""}">${gallery}</section>
      <section class="p-cta">
        <p>${T.similar}</p>
        <a class="contact__cta magnetic" href="${D.whatsapp}" target="_blank" rel="noopener" data-cursor="${T.hi}"><span>${T.talk}</span><i><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18L18 6M8 6h10v10" fill="none" stroke="currentColor" stroke-width="2.2"/></svg></i></a>
      </section>
      <a class="p-next" href="${LP}project.html?p=${next.slug}" data-cursor="${T.next}">
        <span class="label">${T.nextProject}</span>
        <div class="p-next__title">${next.title}</div>
        <div class="p-next__row"><span>${next.cat} — ${next.sub}</span><span>${T.arrow}</span></div>
      </a>
      <footer class="foot p-foot">
        <span>${T.me}</span><span>//</span><span>${T.foot}</span>
        <a href="#top" class="roll"><span data-t="${T.top}">${T.top}</span></a>
      </footer>`;

    $$(".p-cta .magnetic").forEach(magnetic);
    initFx();

    // rows: give every image in a row the row's average aspect ratio, so nothing is cropped hard
    $$(".g-row").forEach(row => {
      const ims = $$("img", row);
      const apply = () => {
        if (!ims.every(i => i.naturalWidth)) return;
        const ar = ims.reduce((s, i) => s + i.naturalWidth / i.naturalHeight, 0) / ims.length;
        row.style.setProperty("--ar", ar.toFixed(3));
      };
      ims.forEach(i => i.complete ? apply() : i.addEventListener("load", apply));
    });

    const cover = $(".p-cover");
    scrollers.push(() => {
      const r = cover.getBoundingClientRect();
      if (!inView(r)) return;
      cover.style.setProperty("--pc", (1.12 - clamp((vh - r.top) / (vh + r.height)) * .12).toFixed(3));
    });
    requestAnimationFrame(() => document.body.classList.add("loaded"));
  }

  /* =========================================================
     ABOUT PAGE
     ========================================================= */
  if (page === "about") {
    $(".js-worked").innerHTML = D.workedAt.map(w =>
      `<li class="reveal"><span class="a">${w[0]}</span><span class="r">${w[1]}</span><span class="d">${w[2]}</span></li>`).join("");
    $$(".p-cta .magnetic").forEach(magnetic);
    const ph = $(".ab-photo");
    scrollers.push(() => {
      const r = ph.getBoundingClientRect();
      if (!inView(r)) return;
      ph.style.setProperty("--pc", (1.12 - clamp((vh - r.top) / (vh + r.height)) * .12).toFixed(3));
    });
    requestAnimationFrame(() => document.body.classList.add("loaded"));
  }

  observeReveals();

  /* ---------- nav colour from the section under it ---------- */
  const nav = $(".nav");
  let themed = null, navUnder;
  const isLight = rgb => { const m = rgb.match(/\d+/g); return m ? (m[0] * .299 + m[1] * .587 + m[2] * .114) > 140 : false; };
  scrollers.push(() => {
    if (!nav) return;
    let light = false, under = null;
    themed = themed || $$("[data-theme], .p-hero, .p-about, .p-cover, .p-gallery, .p-next");
    for (const s of themed) {
      const r = s.getBoundingClientRect();
      if (r.top <= 30 && r.bottom > 30) {
        light = s.dataset.theme ? s.dataset.theme !== "black" : s.matches(".p-about, .p-next") || (s.matches(".p-hero") && isLight(getComputedStyle(s).backgroundColor));
        under = s;
        break;
      }
    }
    nav.classList.toggle("on-light", light);
    nav.classList.toggle("on-red", !!(under && under.dataset.theme === "red"));
    // blurred bar behind the nav, tinted with the colour of the section underneath
    nav.classList.toggle("is-scrolled", scrollY > 40);
    if (under !== navUnder) {
      navUnder = under;
      // a section's theme wins over its computed background (the hero is a light card on a dark section)
      const THEME = { paper: "rgb(239, 239, 237)", black: "rgb(11, 11, 11)", red: "rgb(239, 43, 60)" };
      let bg = under && under.dataset.theme ? THEME[under.dataset.theme] : under ? getComputedStyle(under).backgroundColor : "";
      if (!bg || bg === "transparent" || /,\s*0\)$/.test(bg)) bg = light ? THEME.paper : THEME.black;
      const m = bg.match(/\d+(\.\d+)?/g);
      nav.style.setProperty("--nav-bg", `${m[0]}, ${m[1]}, ${m[2]}`);
    }
  });

  /* ---------- resize ---------- */
  function onResize() {
    vw = innerWidth; vh = innerHeight;
    if (page === "home") {
      fit($(".contact__title"), .62, vh * .13);
      fitChapters();
      sizeH();
    }
  }
  if (page === "home") {
    addEventListener("load", onResize);
    $$(".hcard img").forEach(i => i.addEventListener("load", sizeH, { once: true }));
  }
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(onResize, 120); });
  if (document.fonts) document.fonts.ready.then(onResize);

  /* ---------- nav hides on the way down, returns on the way up ---------- */
  let navY = 0;
  scrollers.push(({ y }) => {
    if (!nav || document.body.classList.contains("menu-open")) return;
    if (Math.abs(y - navY) < 8) return;
    nav.classList.toggle("hide", y > navY && y > vh * .6);
    navY = y;
  });

  /* ---------- master loop: idle when nothing moves ---------- */
  let lastY = scrollY, vel = 0, activeUntil = performance.now() + 1500;
  const kick = () => { activeUntil = performance.now() + 800; };
  addEventListener("scroll", kick, { passive: true });
  addEventListener("pointermove", kick, { passive: true });
  addEventListener("resize", kick);
  (function frame() {
    const now = performance.now();
    if (now < activeUntil) {
      const y = scrollY;
      vel = lerp(vel, y - lastY, .2);
      lastY = y;
      for (let i = 0; i < scrollers.length; i++) scrollers[i]({ y, vel });
    }
    requestAnimationFrame(frame);
  })();
})();
