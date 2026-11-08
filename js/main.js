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
  // image ids: "p13" = cropped artboard, "k115" = original Links file
  const img = (id, size = "s") => size === "s" ? `img/w/s/${id}.jpg` : size === "m" ? `img/w/m/${id}.jpg` : `img/w/${id}.jpg`;
  // responsive sources: the browser picks 900 / 1600 / 3000px for the screen
  const srcset = id => `img/w/s/${id}.jpg 900w, img/w/m/${id}.jpg 1600w, img/w/${id}.jpg 3000w`;
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
      cursor.classList.toggle("is-big", !!(t && t.dataset.cursor));
      cursor.classList.toggle("is-link", !!(t && !t.dataset.cursor));
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
    (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => say("Email copied ✓"), () => (location.href = "mailto:" + v));
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
    if (!/^(index\.html|project\.html)/.test(href)) return;
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
      const ws = $$(".roller__w", roller);
      let cur = 0, timer;
      const size = () => { roller.style.width = ws[cur].offsetWidth + "px"; };
      const show = i => {
        ws.forEach((w, k) => { w.classList.toggle("out", k === cur && k !== i); w.classList.toggle("on", k === i); });
        cur = i; size();
      };
      show(0);
      addEventListener("resize", size);
      if (document.fonts) document.fonts.ready.then(size);
      window.__startHero = () => {
        if (reduce) return;
        const step = () => { show((cur + 1) % ws.length); timer = setTimeout(step, 2400); };
        timer = setTimeout(step, 2200);
      };
    }

    /* hero: strip of work, looping slowly */
    const track = $(".js-strip .hero__track");
    if (track) {
      const extra = [["k102", "alatool"], ["k004", "sports-for-all"], ["k130", "frame-house"], ["k136", "sadeem"], ["k162", "do-not-give-it-a-chance"], ["k169", "cyberani-profile"], ["k182", "marasi"], ["k202", "alinma-fantasy"]];
      const items = [];
      const SKIP = ["cyberani-profile", "alinma-fantasy", "bina-ehsan"];
      D.projects.forEach((p, i) => { if (!SKIP.includes(p.slug)) items.push([p.cover, p.slug, p.title]); if (extra[i] && !SKIP.includes(extra[i][1])) items.push([extra[i][0], extra[i][1], D.projects.find(q => q.slug === extra[i][1]).title]); });
      const html = items.map(([id, slug, title]) => `<a href="project.html?p=${slug}" data-cursor="View">${pic(id, "(max-width: 860px) 140px, 260px", title, 'decoding="async"')}<span>${title}</span></a>`).join("");
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
    const chapters = {
      Branding: ["Branding", "02", "A brand is not a logo. It's a promise made visible.", ""],
      Campaign: ["Campaigns", "04", "Ideas that move people — awareness, launches and seasonal campaigns for national entities.", "dark"],
      Editorial: ["Editorials", "05", "Dense information, made calm. Profiles, reports and brochures.", ""]
    };
    let lastCat = null, html = "", n = 0;
    D.projects.forEach(p => {
      if (p.cat !== lastCat) {
        const c = chapters[p.cat];
        html += `<div class="hchap ${c[3]}" data-chapter="${c[0].toLowerCase()}"><div class="hchap__top label"><span>${c[0]}</span></div><span class="flex-word">${c[0]}</span><p>${c[2]}</p></div>`;
        lastCat = p.cat;
      }
      n++;
      html += `<a class="hcard" href="project.html?p=${p.slug}" data-cursor="View">
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
      hTrack.style.transform = `translate3d(${-p * trackMax}px,0,0)`;
      hbar.style.setProperty("--hp", p);
    });

    /* lettering: cards start scattered around the word, then settle into two rows that slide */
    const LETTERING = [{"id": "p88", "bg": "#000000", "src": "pdf"}, {"id": "k150", "bg": "#020202", "src": "links"}, {"id": "p89", "bg": "#000000", "src": "pdf"}, {"id": "p90", "bg": "#000000", "src": "pdf"}, {"id": "k213", "bg": "#ca191f", "src": "links"}, {"id": "p91", "bg": "#000000", "src": "pdf"}, {"id": "p92", "bg": "#000000", "src": "pdf"}, {"id": "k084", "bg": "#000000", "src": "links"}, {"id": "p93", "bg": "#000000", "src": "pdf"}, {"id": "p94", "bg": "#000000", "src": "pdf"}, {"id": "k215", "bg": "#e0e0e0", "src": "links"}, {"id": "p95", "bg": "#000000", "src": "pdf"}, {"id": "p96", "bg": "#000000", "src": "pdf"}, {"id": "k153", "bg": "#000000", "src": "links"}, {"id": "p97", "bg": "#000000", "src": "pdf"}, {"id": "p99", "bg": "#000000", "src": "pdf"}, {"id": "p100", "bg": "#000000", "src": "pdf"}, {"id": "p101", "bg": "#000000", "src": "pdf"}, {"id": "p102", "bg": "#000000", "src": "pdf"}];
    const lsrc = it => it.src === "links" ? img(it.id, "m") : `img/lt/${it.id}.jpg`;
    const half = Math.ceil(LETTERING.length / 2);
    $$(".lettering__row").forEach((row, r) => {
      row.innerHTML = (r ? LETTERING.slice(half) : LETTERING.slice(0, half))
        .map(it => `<figure style="--bg:${it.bg}"><img src="${lsrc(it)}" alt="Arabic lettering by Majid Sanad" loading="lazy"></figure>`).join("");
    });

    /* marks: real vector logos, two slow rows */
    const tracks = $$(".js-mtrack");
    if (tracks.length) {
      Promise.all(Array.from({ length: 28 }, (_, i) => fetch(`img/logos/logo-${pad2(i + 1)}.svg`).then(r => r.text()).catch(() => "")))
        .then(svgs => {
          const cell = svg => `<span class="mk">${svg}</span>`;
          [svgs.slice(0, 14), svgs.slice(14)].forEach((set, r) => {
            const html = set.filter(Boolean).map(cell).join("");
            tracks[r].innerHTML = html + html;
            $$("[aria-hidden]", tracks[r]);
          });
        });
    }

    /* worked at */
    $(".js-worked").innerHTML = D.workedAt.map((w, i) =>
      `<li class="reveal"><span class="a">${w[0]}</span><span class="r">${w[1]}</span><span class="d">${w[2]}</span></li>`).join("");

    /* scroll-linked horizontal rows */
    $$(".js-xscroll").forEach(el => {
      const dir = +el.dataset.dir || -1, amt = +el.dataset.amt || .3;
      scrollers.push(() => {
        const r = el.getBoundingClientRect();
        if (!inView(r, 200)) return;
        const p = clamp((vh - r.top) / (vh + r.height));
        el.style.setProperty("--x", (dir * (p - .5) * amt * r.width).toFixed(1) + "px");
      });
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
    if (idx < 0) { location.replace("index.html#work"); return; }
    const p = D.projects[idx], next = D.projects[(idx + 1) % D.projects.length];
    document.title = `${p.title} — ${p.sub} · Majid Sanad`;
    document.documentElement.style.setProperty("--pbg", p.bg);
    document.documentElement.style.setProperty("--pfg", p.fg);
    $('meta[name="theme-color"]').setAttribute("content", p.bg);

    const lines = []; let cur = "";
    p.title.split(" ").forEach(w => { if ((cur + " " + w).trim().length > 12 && cur) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim(); });
    lines.push(cur);

    const fig = (id, sz = "100vw") => `<figure>${pic(id, sz, p.title + " — " + p.sub, 'loading="lazy"')}</figure>`;
    const gallery = p.gallery.map(item => Array.isArray(item)
      ? `<div class="g-row" style="--n:${item.length}">${item.map(id => fig(id, `${Math.round(100 / item.length)}vw`)).join("")}</div>`
      : fig(item).replace("<figure>", '<figure class="g-wide">')).join("");

    $("#project").innerHTML = `
      <section class="p-hero">
        <div class="p-hero__top label"><a href="index.html#work" class="p-back roll"><span data-t="← All work">← All work</span></a><span>${p.cat}</span></div>
        <h1 class="p-title">${lines.map(l => `<span class="line"><span>${l}</span></span>`).join("")}</h1>
        <div class="p-hero__row"><span class="p-sub">${p.sub}</span></div>
      </section>
      <div class="p-meta">
        <div><span>Client</span>${p.client}</div>
        <div><span>Discipline</span>${p.cat} — ${p.sub}</div>
        <div><span>Designer</span>Majid Sanad</div>
      </div>
      <figure class="p-cover">${pic(p.cover, "100vw", p.title + " — " + p.sub)}</figure>
      <section class="p-about">
        <h2><span class="line"><span>About this</span></span><span class="line"><span>project</span></span></h2>
        <div class="p-about__grid">${p.about.map(a => `<article class="reveal"><h3>${a[0]}</h3><p>${a[1]}</p></article>`).join("")}</div>
      </section>
      <section class="p-gallery">${gallery}</section>
      <section class="p-cta">
        <p>Have a similar<br><em>project?</em></p>
        <a class="contact__cta magnetic" href="${D.whatsapp}" target="_blank" rel="noopener" data-cursor="Say hi"><span>Let's talk</span><i><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18L18 6M8 6h10v10" fill="none" stroke="currentColor" stroke-width="2.2"/></svg></i></a>
      </section>
      <a class="p-next" href="project.html?p=${next.slug}" data-cursor="Next">
        <span class="label">Next project</span>
        <div class="p-next__title">${next.title}</div>
        <div class="p-next__row"><span>${next.cat} — ${next.sub}</span><span>→</span></div>
      </a>
      <footer class="foot p-foot">
        <span>Majid Sanad</span><span>//</span><span>Graphic Designer — © 2026. All brands. All vision.</span>
        <a href="#top" class="roll"><span data-t="Back to top ↑">Back to top ↑</span></a>
      </footer>`;

    $$(".p-cta .magnetic").forEach(magnetic);

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

  observeReveals();

  /* ---------- nav colour from the section under it ---------- */
  const nav = $(".nav");
  let themed = null;
  const isLight = rgb => { const m = rgb.match(/\d+/g); return m ? (m[0] * .299 + m[1] * .587 + m[2] * .114) > 140 : false; };
  scrollers.push(() => {
    if (!nav) return;
    let light = false;
    themed = themed || $$("[data-theme], .p-hero, .p-about, .p-cover, .p-gallery, .p-next");
    for (const s of themed) {
      const r = s.getBoundingClientRect();
      if (r.top <= 30 && r.bottom > 30) {
        light = s.dataset.theme ? s.dataset.theme !== "black" : s.matches(".p-about, .p-next") || (s.matches(".p-hero") && isLight(getComputedStyle(s).backgroundColor));
        break;
      }
    }
    nav.classList.toggle("on-light", light);
  });

  /* ---------- resize ---------- */
  function onResize() {
    vw = innerWidth; vh = innerHeight;
    if (page === "home") {
      fit($(".contact__title"), .62, vh * .13);
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
