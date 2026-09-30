// ===== UPDATED PORTFOLIO SCRIPT =====
"use strict";

// Footer year
(() => {
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();

// Accessible tabs
(() => {
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));
  if (!tabs.length) return;
  const activate = (btn, focus) => {
    tabs.forEach((b) => {
      const on = b === btn;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    const panel = document.getElementById("tab-" + btn.dataset.tab);
    panels.forEach((p) => {
      const on = p === panel;
      p.classList.toggle("active", on);
      if (on) p.removeAttribute("hidden"); else p.setAttribute("hidden", "");
    });
    if (focus) btn.focus();
  };
  tabs.forEach((btn, i) => {
    btn.addEventListener("click", () => activate(btn, false));
    btn.addEventListener("keydown", (e) => {
      let n = null;
      if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") n = tabs[0];
      else if (e.key === "End") n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); activate(n, true); }
    });
  });
  activate(document.querySelector(".tab.active") || tabs[0], false);
})();

// Nav active link (rAF throttled)
(() => {
  const ids = ["home", "about", "portfolio", "contact"];
  const links = Array.from(document.querySelectorAll(".links a"));
  if (!links.length) return;
  let t = false;
  const upd = () => {
    let cur = "home";
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 220) cur = id;
    });
    links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + cur));
    t = false;
  };
  window.addEventListener("scroll", () => { if (!t) { requestAnimationFrame(upd); t = true; } }, { passive: true });
  upd();
})();

// Reveal on scroll
(() => {
  const sel = ".about-sec .eyebrow, .about-grid > *, .mini-card, .showcase > h2, .showcase > p, .tabs, .cert-card, .tech, .featured-project, .contact-finale > *, .footer";
  const els = Array.from(document.querySelectorAll(sel));
  if (!("IntersectionObserver" in window) || !els.length) return;
  document.documentElement.classList.add("motion-ready");
  els.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.setProperty("--delay", ((i % 4) * 70) + "ms");
  });
  const io = new IntersectionObserver((es) => {
    es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  els.forEach((el) => io.observe(el));
})();

// Smooth anchors (respects reduced motion, closes mobile menu)
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      try { history.replaceState(null, "", id); } catch (err) {}
      document.querySelector(".nav")?.classList.remove("menu-open");
      const mt = document.querySelector(".menu-toggle");
      if (mt) { mt.setAttribute("aria-expanded", "false"); mt.setAttribute("aria-label", "Open navigation menu"); }
    });
  });
})();

// Nav shadow + subtle badge parallax
(() => {
  const bar = document.querySelector(".nav");
  const card = document.querySelector(".lanyard-wrap");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let t = false;
  const upd = () => {
    const y = window.scrollY;
    if (bar) bar.classList.toggle("is-scrolled", y > 24);
    if (card && window.innerWidth > 760 && !reduce) {
      const o = Math.max(-18, Math.min(18, y * 0.035));
      card.style.translate = "0 " + o + "px";
    }
    t = false;
  };
  window.addEventListener("scroll", () => { if (!t) { requestAnimationFrame(upd); t = true; } }, { passive: true });
  upd();
})();

// Active section + side dots (single observer, no dim hiding)
(() => {
  const secs = Array.from(document.querySelectorAll("#home, #about, #portfolio, #contact"));
  const dots = Array.from(document.querySelectorAll(".section-dots a"));
  if (!("IntersectionObserver" in window) || !secs.length) return;
  const io = new IntersectionObserver((es) => {
    es.forEach((en) => {
      if (!en.isIntersecting) return;
      secs.forEach((s) => s.classList.toggle("snap-active", s === en.target));
      dots.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { threshold: 0.4 });
  secs.forEach((s) => io.observe(s));
})();

// Magnetic buttons (desktop pointers only)
(() => {
  if (!window.matchMedia("(pointer:fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.1).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.14).toFixed(1) + "px)";
    });
    el.addEventListener("mouseleave", () => { el.style.transform = "translate(0,0)"; });
  });
})();

// Single mobile menu (menu-open is the source of truth)
(() => {
  const btn = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  const links = document.querySelector("#primary-links");
  if (!btn || !nav || !links) return;
  const close = () => {
    nav.classList.remove("menu-open");
    links.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Open navigation menu");
  };
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = !nav.classList.contains("menu-open");
    nav.classList.toggle("menu-open", open);
    links.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  });
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  document.addEventListener("click", (e) => { if (!nav.contains(e.target)) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { close(); btn.blur(); } });
  window.addEventListener("resize", () => { if (window.innerWidth > 900) close(); });
})();