/* ————— Leaf & Spine — cinematic scroll engine ————— */
(() => {
  "use strict";

  /* ---------- config ---------- */
  const PX_PER_FRAME = 26;      // scroll pixels per film frame
  const HOLD_PX = 3400;         // extra scroll after film ends (premium grid + readers + final CTA)
  const SMOOTH = 0.16;          // extra cinematic damping on top of Lenis
  const DPR_CAP = 1.75;

  const canvas = document.getElementById("film");
  const ctx = canvas.getContext("2d");
  const track = document.getElementById("track");
  const loader = document.getElementById("loader");
  const loaderFill = document.getElementById("loaderFill");
  const loaderHint = document.getElementById("loaderHint");
  const nav = document.getElementById("nav");
  const scenes = [...document.querySelectorAll(".scene")].map(el => ({
    el,
    in: parseFloat(el.dataset.in),
    out: parseFloat(el.dataset.out),
    fade: parseFloat(el.dataset.fade || 0.03),
    left: el.classList.contains("left"),
    right: el.classList.contains("right"),
    on: false
  }));

  /* ---------- frames ---------- */
  const F = window.FRAMES || null;              // set by frames/manifest.js
  const N = F ? F.count : 0;
  const pad = i => String(i + 1).padStart(4, "0");
  const src = i => `frames/${(F && F.prefix) || "f_"}${pad(i)}${(F && F.ext) || ".jpg"}`;
  const imgs = new Array(N).fill(null);
  const loadedUpTo = () => { let i = 0; while (i < N && imgs[i]) i++; return i; };
  let loadedCount = 0;
  let poster = null;

  function loadFrame(i) {
    return new Promise(res => {
      if (i >= N || imgs[i]) return res();
      const im = new Image();
      im.onload = () => { imgs[i] = im; loadedCount++; res(); };
      im.onerror = () => res();
      im.src = src(i);
    });
  }

  async function loadRange(a, b, conc = 6, onTick) {
    let next = a;
    const worker = async () => {
      while (next < b) { const i = next++; await loadFrame(i); onTick && onTick(); }
    };
    await Promise.all(Array.from({ length: conc }, worker));
  }

  /* ---------- canvas ---------- */
  let vw = 0, vh = 0, dpr = 1;
  let filmEnd = 0.94; // computed: fraction of scrollable track occupied by the film
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    vw = window.innerWidth; vh = window.innerHeight;
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    canvas.style.width = vw + "px";
    canvas.style.height = vh + "px";
    track.style.height = (N ? N * PX_PER_FRAME + HOLD_PX + vh : vh * 6) + "px";
    filmEnd = N ? (N * PX_PER_FRAME) / (N * PX_PER_FRAME + HOLD_PX) : 0.8;
    lastDrawn = -1; // force repaint
  }

  let lastDrawn = -1;
  function paint(idx) {
    let im = null;
    if (N) {
      for (let i = Math.min(idx, N - 1); i >= 0; i--) { if (imgs[i]) { im = imgs[i]; idx = i; break; } }
    }
    im = im || poster;
    if (!im || idx === lastDrawn) return;
    lastDrawn = idx;
    const cw = canvas.width, ch = canvas.height;
    const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
    const s = Math.max(cw / iw, ch / ih);
    const dw = iw * s, dh = ih * s;
    ctx.drawImage(im, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  /* ---------- scroll ---------- */
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, smoothWheel: true });
  let scrollPos = 0;
  const readScroll = () => window.scrollY || document.documentElement.scrollTop || 0;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;

  let smoothScroll = 0;
  let frameFloat = 0;

  function sceneAlpha(s, x) {
    const aIn = s.in <= 0 ? 1 : smoothstep(s.in, s.in + s.fade, x);
    const aOut = s.out >= 1.3 ? 1 : 1 - smoothstep(s.out - s.fade, s.out, x);
    return clamp(aIn * aOut, 0, 1);
  }

  const chapterBtns = [...document.querySelectorAll("#chapters button")];
  const counters = [...document.querySelectorAll("[data-count]")];
  let countersRun = false;

  function runCounters() {
    if (countersRun) return; countersRun = true;
    counters.forEach(b => {
      const target = +b.dataset.count, t0 = performance.now(), dur = 1400;
      const step = t => {
        const p = clamp((t - t0) / dur, 0, 1);
        b.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  let lastTick = 0;
  function tick(time) {
    lastTick = performance.now();
    lenis.raf(time);
    scrollPos = readScroll();
    const dt = Math.min(200, time - (tick._t || time)); tick._t = time;
    const k = 1 - Math.pow(1 - SMOOTH, (dt || 16.7) / 16.7); // fps-independent damping
    smoothScroll = lerp(smoothScroll, scrollPos, k);
    if (Math.abs(smoothScroll - scrollPos) < 0.3) smoothScroll = scrollPos;

    const trackH = track.offsetHeight - vh;
    const p = trackH > 0 ? clamp(smoothScroll / trackH, 0, 1) : 0;
    const x = p / filmEnd;                     // section space (exceeds 1 in the hold)
    const f = clamp(x, 0, 1);                  // film space

    // film
    if (N) {
      frameFloat = f * (N - 1);
      paint(Math.round(frameFloat));
    } else paint(0);

    // scenes
    for (const s of scenes) {
      const a = sceneAlpha(s, x);
      const on = a > 0.02;
      if (on !== s.on) { s.on = on; s.el.classList.toggle("on", on); if (on && s.el.id === "habit") runCounters(); }
      if (!on) { s.el.style.opacity = 0; continue; }
      const dir = s.left ? -1 : s.right ? 1 : 0;
      const rise = (1 - a) * 34;
      s.el.style.opacity = a.toFixed(3);
      s.el.style.transform = `translate3d(${dir * rise * 0.6}px, ${rise}px, 0)`;
    }

    // nav + chapters
    nav.classList.toggle("scrolled", smoothScroll > 40);
    const ci = x >= 1 ? 4 : Math.min(4, Math.floor(f * 5));
    chapterBtns.forEach((b, i) => b.classList.toggle("active", i === ci));
  }

  function loop(time) {
    tick(time);
    requestAnimationFrame(loop);
  }
  // keep state fresh even when rAF is throttled (occluded window / background tab)
  setInterval(() => {
    if (performance.now() - lastTick > 400) tick(performance.now());
  }, 300);
  // Chrome purges canvas backing when the window is occluded — force repaint on return
  const forceRepaint = () => { lastDrawn = -1; };
  document.addEventListener("visibilitychange", forceRepaint);
  window.addEventListener("focus", forceRepaint);
  window.addEventListener("pageshow", forceRepaint);

  /* ---------- navigation ---------- */
  function gotoProgress(g) {
    const trackH = track.offsetHeight - vh;
    lenis.scrollTo(clamp(g * filmEnd, 0, 1) * trackH, { duration: 2.2, easing: t => 1 - Math.pow(1 - t, 4) });
  }
  document.querySelectorAll("[data-goto]").forEach(el => {
    el.addEventListener("click", e => { e.preventDefault(); gotoProgress(parseFloat(el.dataset.goto)); });
  });

  /* ---------- magnetic buttons ---------- */
  if (matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".magnetic").forEach(btn => {
      btn.addEventListener("mousemove", e => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / r.width;
        const dy = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = `translate(${dx * 10}px, ${dy * 8}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------- bookshelf micro-interactions ---------- */
  const shelfBooks = [...document.querySelectorAll("#miniShelf .book")];
  let activeBook = null;
  shelfBooks.forEach(b => b.addEventListener("click", () => {
    activeBook = b;
    shelfBooks.forEach(o => o.classList.toggle("selected", o === b));
  }));
  document.querySelectorAll("#swatches .sw").forEach(sw => {
    sw.addEventListener("click", () => {
      document.querySelectorAll("#swatches .sw").forEach(o => o.classList.remove("active"));
      sw.classList.add("active");
      const targets = activeBook ? [activeBook] : shelfBooks;
      if (sw.dataset.pattern) { targets.forEach(b => b.classList.toggle("patterned")); return; }
      targets.forEach(b => {
        b.style.setProperty("--c1", sw.dataset.c1);
        b.style.setProperty("--c2", sw.dataset.c2);
      });
    });
  });

  /* ---------- download CTAs ---------- */
  const STORE = {
    apple: "https://apps.apple.com/in/app/leaf-spine/id6758519785",
    play: "https://play.google.com/store/apps/details?id=com.experaforge.leafandspine&pcampaignid=web_share"
  };
  const storeModal = document.getElementById("storeModal");
  document.querySelectorAll(".download-cta").forEach(el => {
    el.addEventListener("click", e => {
      const ua = navigator.userAgent;
      if (/iPhone|iPad|iPod/i.test(ua)) { el.href = STORE.apple; return; }   // follow link
      if (/Android/i.test(ua)) { el.href = STORE.play; return; }            // follow link
      e.preventDefault();                                                    // desktop: choose
      storeModal.showModal();
    });
  });
  document.getElementById("closeStore").addEventListener("click", () => storeModal.close());
  storeModal.addEventListener("click", e => { if (e.target === storeModal) storeModal.close(); });

  /* ---------- trailer ---------- */
  const modal = document.getElementById("trailerModal");
  const video = document.getElementById("trailerVideo");
  const watchBtn = document.getElementById("watchTrailer");
  video.addEventListener("error", () => { watchBtn.style.display = "none"; }, { once: true });
  watchBtn.addEventListener("click", () => { modal.showModal(); video.currentTime = 0; video.play().catch(() => {}); });
  document.getElementById("closeTrailer").addEventListener("click", () => { video.pause(); modal.close(); });
  modal.addEventListener("click", e => { if (e.target === modal) { video.pause(); modal.close(); } });

  /* ---------- boot ---------- */
  async function boot() {
    resize();
    window.addEventListener("resize", resize);

    // poster is the instant fallback in all modes
    poster = new Image();
    poster.src = "assets/poster.jpg";
    poster.onerror = () => { poster = null; };

    if (!N) { finishLoad(); return; }

    const firstChunk = Math.max(12, Math.round(N * 0.2));
    const t0 = performance.now();
    let done = 0;
    await loadRange(0, firstChunk, 8, () => {
      done++;
      loaderFill.style.width = Math.round((done / firstChunk) * 100) + "%";
    });
    const minShow = 1800; // let the leaf finish drawing
    const left = minShow - (performance.now() - t0);
    if (left > 0) await new Promise(r => setTimeout(r, left));
    finishLoad();
    // background-load the rest
    loadRange(firstChunk, N, 5);
  }

  function finishLoad() {
    paint(0);
    loader.classList.add("done");
    document.body.classList.add("ready");
    requestAnimationFrame(loop);
  }

  boot();

  // debug/verification hook
  window.__leafspine = {
    get state() {
      let loaded = 0; for (let i = 0; i < N; i++) if (imgs[i]) loaded++;
      return { N, loaded, lastDrawn, smoothScroll: Math.round(smoothScroll), scrollPos: Math.round(scrollPos), lastTickAgo: Math.round(performance.now() - lastTick) };
    }
  };
})();
