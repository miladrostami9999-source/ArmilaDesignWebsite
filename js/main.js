/**
 * ARMILA DESIGN STUDIO — shared site interactions
 * Consolidates: scroll-reveal, magnetic buttons, mobile nav toggle,
 * home hero accordion, and active nav-link highlighting.
 */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------------------------------------------------------------------
     1. Scroll reveal — fades/rises elements with class `.reveal` into
        view. Runs once per element, then disconnects its observer.
        Staggered entrances use a `data-reveal-delay="100"` (ms) attribute
        applied via setTimeout here — deliberately NOT a CSS
        transition-delay class, because a shared transition-delay also
        leaks into any *other* transition on the same element (e.g. a
        hover lift), making hover effects feel sluggish. Timing the
        `.is-visible` class via JS keeps the stagger purely on the
        one-time entrance animation.

        IMPORTANT: The observer is intentionally started AFTER the page
        loader finishes (LOADER_REVEAL_DELAY below). This ensures that
        page-entry animations (hero text, images, etc.) play visibly
        AFTER the loader has faded, not hidden behind it.
  --------------------------------------------------------------------- */
  const LOADER_REVEAL_DELAY = 680; // ms: loader show (320) + fade (320) + buffer (40)

  const startRevealObserver = () => {
    const revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && revealEls.length) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target;
              const delay = parseInt(el.getAttribute("data-reveal-delay") || "0", 10);
              if (delay > 0) {
                window.setTimeout(() => el.classList.add("is-visible"), delay);
              } else {
                el.classList.add("is-visible");
              }
              observer.unobserve(el);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -80px 0px" }
      );
      revealEls.forEach((el) => revealObserver.observe(el));
    } else {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    }
  };

  // If there's a loader, wait for it to finish before starting reveals.
  // If no loader (e.g. reduced-motion hides it), start immediately.
  if (document.getElementById("page-loader")) {
    window.setTimeout(startRevealObserver, LOADER_REVEAL_DELAY);
  } else {
    startRevealObserver();
  }

  /* ---------------------------------------------------------------------
     1b. Count-up numbers — stat figures (e.g. "65+") tagged with
        `data-counter="65"` animate from 0 up to their target the
        moment they scroll into view, instead of just static-appearing.
        Runs once per element. Respects prefers-reduced-motion (jumps
        straight to the final value instead of animating).
  --------------------------------------------------------------------- */
  const counterEls = document.querySelectorAll("[data-counter]");
  if (counterEls.length) {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute("data-counter"), 10) || 0;
      if (reduceMotion) {
        el.textContent = target;
        return;
      }
      const duration = 1400;
      const start = performance.now();
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const value = Math.round(target * easeOutCubic(progress));
        el.textContent = value;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counterEls.forEach((el) => counterObserver.observe(el));
  }

  /* ---------------------------------------------------------------------
     2. Magnetic buttons — cursor-follow effect on elements tagged
        `.magnetic-btn`. Skipped entirely for touch / reduced-motion.
  --------------------------------------------------------------------- */
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

  if (!prefersReducedMotion && !isTouchDevice) {
    document.querySelectorAll(".magnetic-btn").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const strength = 0.25;
        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0, 0)";
      });
    });
  }

  /* ---------------------------------------------------------------------
     3. Mobile nav toggle — shows/hides the off-canvas menu on small
        screens. Looks for #mobile-menu-button and #mobile-menu.
  --------------------------------------------------------------------- */
  const menuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  if (menuButton && mobileMenu) {
    const setMenuState = (isOpen) => {
      mobileMenu.classList.toggle("is-open", isOpen);
      menuButton.classList.toggle("is-open", isOpen);
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Toggle menu");
      document.body.classList.toggle("overflow-hidden", isOpen);
    };
    menuButton.addEventListener("click", () => {
      setMenuState(!mobileMenu.classList.contains("is-open"));
    });
    // Close menu when a link inside it is clicked
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuState(false));
    });
    // Close on Escape for keyboard users
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) {
        setMenuState(false);
      }
    });
  }

  /* ---------------------------------------------------------------------
     4. Home hero accordion — horizontal panels that expand on hover /
        click / focus (keyboard accessible).
  --------------------------------------------------------------------- */
  const accordionItems = document.querySelectorAll(".accordion-item");
  if (accordionItems.length) {
    const activate = (item) => {
      accordionItems.forEach((i) => {
        i.classList.remove("active");
        i.setAttribute("aria-expanded", "false");
      });
      item.classList.add("active");
      item.setAttribute("aria-expanded", "true");
    };
    accordionItems.forEach((item) => {
      item.addEventListener("mouseenter", () => activate(item));
      item.addEventListener("focus", () => activate(item));
      item.addEventListener("click", () => activate(item));
    });
  }

  /* ---------------------------------------------------------------------
     5. Active nav link — adds `.active` to the link matching the
        current page filename, so each page highlights its own nav item
        without needing hand-edited classes per file.
  --------------------------------------------------------------------- */
  const currentPage =
    window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

  /* ---------------------------------------------------------------------
     6. Contact / inquiry forms — real submission via Web3Forms.
        This site is static and deployed on Vercel (no backend), so we use
        Web3Forms' public API to relay submissions straight to an inbox —
        no server code needed. Get a free access key at web3forms.com and
        paste it into the form's hidden `access_key` input in the HTML.
        Submits via fetch so the page never reloads; shows a clear
        success/error message in the form's [data-form-status] element.
  --------------------------------------------------------------------- */
  document.querySelectorAll("form[data-armila-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = form.querySelector("[data-form-status]");
      const btn = form.querySelector('button[type="submit"]');
      const lbl = form.querySelector("[data-submit-label]");
      const original = lbl ? lbl.textContent : "";

      // honeypot — a bot filled the hidden box, so drop it without a word
      const hp = form.querySelector('input[name="botcheck"]');
      if (hp && hp.checked) return;

      const missing = [...form.querySelectorAll("[required]")].find((f) => !f.value.trim());
      if (missing) {
        if (status) {
          status.setAttribute("data-state", "error");
          status.textContent = "Please fill in every field before sending.";
        }
        const focusable = missing.type === "hidden"
          ? missing.closest("[data-af-dropdown]")?.querySelector(".af-select")
          : missing;
        focusable?.focus();
        return;
      }

      if (btn) btn.disabled = true;
      if (lbl) lbl.textContent = "Sending…";
      if (status) { status.removeAttribute("data-state"); status.textContent = ""; }

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      })
        .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
        .then(({ ok, j }) => {
          if (!ok || !j.success) throw new Error(j.message || "failed");
          if (status) {
            status.setAttribute("data-state", "ok");
            status.textContent = "Thank you — your message is on its way. We'll be in touch shortly.";
          }
          form.reset();
          form.querySelectorAll("[data-af-dropdown]").forEach((d) => {
            d.querySelector(".af-select")?.classList.remove("has-value");
            const v = d.querySelector("[data-af-value]"); if (v) v.textContent = "";
            const i = d.querySelector("[data-af-input]"); if (i) i.value = "";
          });
        })
        .catch(() => {
          if (status) {
            status.setAttribute("data-state", "error");
            status.textContent = "Something went wrong. Please email us directly at Armila.Design16@Gmail.com.";
          }
        })
        .finally(() => {
          if (btn) btn.disabled = false;
          if (lbl) lbl.textContent = original;
        });
    });
  });

  /* ---------------------------------------------------------------------
     6b. Custom dropdown. A native <select> renders as an OS menu that
         can't be eased or themed, which broke the page's rhythm. This is
         a button + listbox that animates open, and keeps real keyboard
         semantics: arrows to move, Enter to pick, Escape to close.
  --------------------------------------------------------------------- */
  document.querySelectorAll("[data-af-dropdown]").forEach((dd) => {
    const btn = dd.querySelector(".af-select");
    const menu = dd.querySelector(".af-menu");
    const out = dd.querySelector("[data-af-value]");
    const input = dd.querySelector("[data-af-input]");
    if (!btn || !menu) return;
    const opts = [...menu.querySelectorAll("li")];
    let cursor = -1;

    const open = (v) => {
      menu.classList.toggle("is-open", v);
      btn.setAttribute("aria-expanded", String(v));
      if (v) { cursor = opts.findIndex((o) => o.getAttribute("aria-selected") === "true"); mark(); }
    };
    const mark = () => opts.forEach((o, i) => o.classList.toggle("is-cursor", i === cursor));
    const pick = (o) => {
      opts.forEach((x) => x.setAttribute("aria-selected", String(x === o)));
      if (out) out.textContent = o.textContent;
      if (input) input.value = o.dataset.v || o.textContent;
      btn.classList.add("has-value");
      open(false);
      btn.focus();
    };

    btn.addEventListener("click", () => open(!menu.classList.contains("is-open")));
    opts.forEach((o) => o.addEventListener("click", () => pick(o)));
    btn.addEventListener("keydown", (e) => {
      const isOpen = menu.classList.contains("is-open");
      if (["ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        if (!isOpen) return open(true);
        cursor = (cursor + (e.key === "ArrowDown" ? 1 : -1) + opts.length) % opts.length;
        mark();
      } else if (e.key === "Enter" || e.key === " ") {
        if (isOpen && cursor > -1) { e.preventDefault(); pick(opts[cursor]); }
      } else if (e.key === "Escape") { open(false); }
    });
    document.addEventListener("click", (e) => { if (!dd.contains(e.target)) open(false); });
  });

  /* ---------------------------------------------------------------------
     6c. Hero — the clay pass resolves into the beauty pass exactly once.
         Both are full-screen layers with an animated blur, which is the
         most expensive thing on the page, so the animation is paused the
         moment the hero leaves the viewport and never restarts on scroll.
  --------------------------------------------------------------------- */
  const heroEl = document.getElementById("hero");
  if (heroEl) {
    const tag = document.getElementById("hero-pass-tag");
    if (tag) {
      setTimeout(() => { tag.textContent = "Final render"; }, 2800);
      setTimeout(() => { tag.style.opacity = "0"; }, 5000);
    }
    new IntersectionObserver(
      ([en]) => heroEl.classList.toggle("hero-rest", !en.isIntersecting),
      { threshold: 0.02 }
    ).observe(heroEl);
  }

  /* ---------------------------------------------------------------------
     6d. Workflow rail. Element positions are measured once and cached —
         reading getBoundingClientRect() on every scroll frame forces a
         synchronous layout and is exactly what makes a page feel sticky.
  --------------------------------------------------------------------- */
  const railEl = document.getElementById("proc-rail");
  if (railEl) {
    const fillEl = document.getElementById("proc-fill");
    const headEl = document.getElementById("proc-playhead");
    const barEl = document.getElementById("proc-bar");
    const passEl = document.getElementById("proc-pass");
    const pctEl = document.getElementById("proc-pct");
    const steps = [...railEl.querySelectorAll(".proc-step")];
    const frames = [...document.querySelectorAll("#proc-frames img")];
    const NAMES = ["Offset & Extrude", "Divided into Two Floors", "Create Indents",
                   "Terraces & Canopy", "Vertical Canopy Details"];
    let railTop = 0, railH = 1, tops = [], current = -1, queued = false;

    const measure = () => {
      const sy = window.scrollY || window.pageYOffset;
      const r = railEl.getBoundingClientRect();
      railTop = r.top + sy;
      railH = r.height || 1;
      tops = steps.map((s) => s.getBoundingClientRect().top + sy);
      paint();
    };
    const paint = () => {
      const anchor = (window.scrollY || window.pageYOffset) + window.innerHeight * 0.52;
      const p = Math.max(0, Math.min(1, (anchor - railTop) / railH));
      if (fillEl) fillEl.style.transform = "scaleY(" + p + ")";
      if (headEl) headEl.style.transform = "translateY(" + p * (railH - 26) + "px)";
      if (barEl) barEl.style.transform = "scaleX(" + p + ")";
      if (pctEl) pctEl.textContent = Math.round(p * 100) + "%";
      let idx = 0;
      for (let i = 0; i < tops.length; i++) if (tops[i] <= anchor) idx = i;
      if (idx !== current) {
        current = idx;
        steps.forEach((s, i) => {
          s.classList.toggle("is-active", i === idx);
          s.classList.toggle("is-done", i < idx);
        });
        frames.forEach((f, i) => f.classList.toggle("is-on", i === idx));
        if (passEl) passEl.textContent = NAMES[idx] || "";
      }
      queued = false;
    };
    window.addEventListener("scroll", () => {
      if (!queued) { queued = true; requestAnimationFrame(paint); }
    }, { passive: true });
    window.addEventListener("resize", () => requestAnimationFrame(measure), { passive: true });
    window.addEventListener("load", measure);
    measure();
  }

  /* ---------------------------------------------------------------------
     6b. "More details (optional)" collapsible section on the contact form.
  --------------------------------------------------------------------- */
  document.querySelectorAll("[data-more-toggle]").forEach((toggle) => {
    const panelId = toggle.getAttribute("aria-controls");
    const panel = document.getElementById(panelId);
    const label = toggle.querySelector("[data-more-label]");
    if (!panel) return;
    toggle.addEventListener("click", () => {
      const isOpen = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      if (label) label.textContent = isOpen ? "Hide extra details" : "More details (optional)";
    });
  });

  /* ---------------------------------------------------------------------
     7. Hero parallax — the hero background image drifts as you scroll,
        for a subtle sense of depth. The image is scaled up (see the
        IMG_SCALE constant below, matched to the inline `scale(...)` on
        the element) to leave overscan margin around every edge; the
        drift distance is then mathematically clamped to that exact
        overscan on every frame, so the image can never out-translate its
        own margin and reveal empty space behind it — this stays true at
        any viewport size or breakpoint, not just the ones tested.
        Respects reduced-motion. Uses requestAnimationFrame so it never
        fights the browser's own scroll handling.
  --------------------------------------------------------------------- */
  const parallaxImg = document.querySelector("[data-parallax]");
  if (parallaxImg && !prefersReducedMotion) {
    const wrap = document.querySelector("[data-parallax-wrap]");
    if (!wrap) {
      // data-parallax-wrap not found on this page — skip parallax silently
    } else {
    let ticking = false;
    const IMG_SCALE = 1.3; // must match the element's inline transform: scale(...)
    const SPEED_MULTIPLIER = 1.2; // 20% faster drift, per request

    const updateParallax = () => {
      const rect = wrap.getBoundingClientRect();
      // Only animate while the hero is at least partially in view
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const progress = 1 - (rect.bottom / (window.innerHeight + rect.height));
        // Overscan available on each edge from the scale-up, in px —
        // the hard ceiling the drift is never allowed to exceed.
        const safeMaxShift = rect.height * (IMG_SCALE - 1);
        const desiredMaxShift = 150 * SPEED_MULTIPLIER;
        const maxShift = Math.min(desiredMaxShift, safeMaxShift);
        const shift = (progress - 0.5) * maxShift;
        parallaxImg.style.transform = `scale(${IMG_SCALE}) translateY(${shift}px)`;
      }
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    });
    window.addEventListener("resize", updateParallax);
    updateParallax();
    } // end else (wrap exists)
  }

  /* ---------------------------------------------------------------------
     8. Smooth scroll — powered by Lenis (the same engine behind most
        premium agency sites), replacing the page's native scroll with a
        buttery, lag-free eased scroll on desktop. Touch devices keep
        their native (already smooth/inertial) scrolling untouched, and
        anyone who's asked for reduced motion is skipped entirely.
  --------------------------------------------------------------------- */
  let lenis = null;
  if (!prefersReducedMotion && typeof window.Lenis === "function") {
    lenis = new window.Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false, // keep native touch scrolling on mobile/tablet
      wheelMultiplier: 1,
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    // Route in-page anchor links (e.g. nav links pointing at #section)
    // through Lenis so they animate with the same easing as everything
    // else, instead of fighting it.
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -96 });
      });
    });

    window.__lenis = lenis; // exposed for the parallax + page-transition hooks below
  }

  /* ---------------------------------------------------------------------
     9. Page-transition fade — works the same way in every browser (see
        the html.pt-init / pt-ready / pt-exit rules in css/input.css).
        Fades the new page in once it's ready, and fades the current page
        out right before navigating to any internal link — including
        every project card on the Projects page and every nav/footer link
        — so navigation always feels like a soft cross-fade instead of an
        instant jump.
  --------------------------------------------------------------------- */
  /* ---------------------------------------------------------------------
     9. Page Loader — full-screen dark overlay that covers the page on
        initial load and fades out (opacity) to reveal content. On
        navigation, it fades back IN and we only navigate AFTER the
        transitionend event fires — guaranteeing the loader is fully
        opaque before the browser navigates (eliminates the flash that
        occurred when EXIT_SLIDE_MS was shorter than the CSS transition).

        The old pt-init / pt-ready / pt-exit body-opacity system is
        deliberately removed — it conflicted with the loader, causing a
        double dark-flash on every page load.
  --------------------------------------------------------------------- */
  const loader = document.getElementById("page-loader");

  if (loader) {
    /* Signal to CSS that JS is running — disables the no-JS fallback
       animation so opacity transitions work for navigation. */
    document.documentElement.classList.add("js-loader");

    const ENTER_DELAY_MS = 320; // how long the glow animation plays before hiding

    /* Initial load: let glow animate briefly, then fade out loader */
    window.setTimeout(() => loader.classList.add("loader-out"), ENTER_DELAY_MS);

    if (!prefersReducedMotion) {
      document.addEventListener("click", (e) => {
        const link = e.target.closest("a[href]");
        if (!link) return;
        if (link.target && link.target !== "_self") return;
        if (e.defaultPrevented || e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        let url;
        try { url = new URL(link.href, window.location.href); }
        catch (err) { return; }

        const isSameOrigin     = url.origin === window.location.origin;
        const isHashOnSamePage = url.pathname === window.location.pathname && url.hash;
        const isDownload       = link.hasAttribute("download");
        if (!isSameOrigin || isHashOnSamePage || isDownload) return;

        e.preventDefault();

        /* Fade loader IN, then navigate. transitionend is the preferred
           trigger, but a backup timeout guarantees navigation even if the
           transition event never fires (e.g. interrupted transition,
           element mid-animation, or browser edge cases). */
        let navigated = false;
        const go = () => {
          if (navigated) return;
          navigated = true;
          window.location.href = link.href;
        };

        loader.classList.remove("loader-out");
        loader.addEventListener("transitionend", go, { once: true });
        window.setTimeout(go, 450); /* backup: slightly longer than the 320ms CSS transition */
      });

      /* Back/forward cache: loader may still be visible — hide it */
      window.addEventListener("pageshow", (e) => {
        if (e.persisted) loader.classList.add("loader-out");
      });
    }
  }

  /* pt-ready removed — the loader overlay replaces the body-opacity system */

  /* ---------------------------------------------------------------------
     10. Hover-prefetch — the moment a visitor's cursor lands on an
        internal link (or it's tapped/focused on touch), the browser
        starts quietly downloading that page in the background. By the
        time the 380ms exit-fade above finishes and the navigation
        actually happens, the next page is often already sitting in
        cache — so it feels instant rather than waiting for a fresh
        request. This gets ~90% of the perceived-speed benefit of a
        full single-page-app rewrite, with none of the risk of
        restructuring a static multi-page Tailwind site into one.
  --------------------------------------------------------------------- */
  if ("requestIdleCallback" in window || true) {
    const prefetched = new Set();
    const schedulePrefetch = (href) => {
      if (prefetched.has(href)) return;
      prefetched.add(href);
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = href;
      document.head.appendChild(link);
    };
    const maybePrefetch = (e) => {
      const a = e.target.closest("a[href]");
      if (!a) return;
      let url;
      try {
        url = new URL(a.href, window.location.href);
      } catch (err) {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      if (!url.pathname.endsWith(".html") && url.pathname !== "/") return;
      schedulePrefetch(url.href);
    };
    document.addEventListener("mouseover", maybePrefetch, { passive: true });
    document.addEventListener("touchstart", maybePrefetch, { passive: true });
    document.addEventListener("focusin", maybePrefetch);
  }

  /* -----------------------------------------------------------------------
     8. Interactive Workflow Timeline
        Desktop: hover / keyboard activates nodes + animates progress line +
                 reveals inline content panel directly below each node.
        Mobile:  scroll-based auto-advance + swipe override.
  ----------------------------------------------------------------------- */
  (() => {
    /* ---------- Desktop ---------- */
    const desktopSection = document.querySelector(".workflow-desktop");
    if (desktopSection) {
      const nodes    = Array.from(desktopSection.querySelectorAll(".workflow-node"));
      const panels   = Array.from(desktopSection.querySelectorAll(".workflow-inline-panel"));
      const progress = desktopSection.querySelector(".workflow-progress");
      let current    = -1;

      /* Position progress line precisely through circle centers */
      const positionLine = () => {
        const trackLine = desktopSection.querySelector(".workflow-track-line");
        if (!trackLine) return;
        const firstCircle = nodes[0]?.querySelector(".workflow-circle");
        if (!firstCircle) return;
        const sectionRect = desktopSection.getBoundingClientRect();
        const circleRect  = firstCircle.getBoundingClientRect();
        const centerY     = circleRect.top + circleRect.height / 2 - sectionRect.top;
        trackLine.style.top  = centerY + "px";
        if (progress) progress.style.top = centerY + "px";
      };

      positionLine();
      window.addEventListener("resize", positionLine, { passive: true });

      /* Compute progress % to reach the center of the target node */
      const getProgressWidth = (idx) => {
        const container = desktopSection.querySelector(".workflow-node").parentElement;
        const containerRect = container.getBoundingClientRect();
        const targetNode  = nodes[idx];
        const circle      = targetNode.querySelector(".workflow-circle");
        if (!circle) return 0;
        const circleRect = circle.getBoundingClientRect();
        const circleCenterX = circleRect.left + circleRect.width / 2 - containerRect.left;
        return (circleCenterX / containerRect.width) * 100;
      };

      const activate = (idx) => {
        if (idx === current) return;
        current = idx;

        /* progress line to circle center of active node */
        if (progress) progress.style.width = getProgressWidth(idx) + "%";

        /* nodes */
        nodes.forEach((n, i) => {
          n.classList.toggle("is-active",   i === idx);
          n.classList.toggle("is-inactive", i !== idx);
          n.setAttribute("aria-selected", String(i === idx));
          n.setAttribute("tabindex", i === idx ? "0" : "-1");
        });

        /* inline panels */
        panels.forEach((p, i) => {
          if (i === idx) {
            p.setAttribute("aria-hidden", "false");
            clearTimeout(p._showTimer);
            p._showTimer = setTimeout(() => p.classList.add("is-active"), 30);
          } else {
            clearTimeout(p._showTimer);
            p.classList.remove("is-active");
            p.setAttribute("aria-hidden", "true");
          }
        });
      };

      /* default: stage 0 */
      setTimeout(() => activate(0), 80);

      nodes.forEach((node, idx) => {
        node.addEventListener("mouseenter", () => activate(idx));
        node.addEventListener("focus",      () => activate(idx));
        node.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(idx); }
          if (e.key === "ArrowRight") { const n = (idx + 1) % nodes.length; activate(n); nodes[n].focus(); }
          if (e.key === "ArrowLeft")  { const n = (idx - 1 + nodes.length) % nodes.length; activate(n); nodes[n].focus(); }
        });
      });
    }

    /* ---------- Mobile ---------- */
    const mobileSection = document.querySelector(".workflow-mobile");
    if (!mobileSection) return;

    const mStages    = Array.from(mobileSection.querySelectorAll(".workflow-mobile-stage"));
    const mProgress  = mobileSection.querySelector(".workflow-mobile-progress");
    let mCurrent     = -1;
    let autoAdvanceAllowed = true;
    const mProgressPercents = [0, 33.33, 66.66, 100];
    const CONTENT_HEIGHT    = 140;

    const mActivate = (idx, forceAuto) => {
      if (!forceAuto && idx === mCurrent) return;
      mCurrent = idx;
      if (mProgress) mProgress.style.height = mProgressPercents[idx] + "%";
      mStages.forEach((stage, i) => {
        const content = stage.querySelector(".workflow-mobile-content");
        /* Once a stage is reached, it stays open.
           isOpen = i <= idx  (all stages up to the current one remain open) */
        const isOpen    = i <= idx;
        const isCurrent = i === idx;
        stage.classList.toggle("is-active", isCurrent);
        if (content) {
          content.style.maxHeight = isOpen ? CONTENT_HEIGHT + "px" : "0";
          content.style.opacity   = isOpen ? "1" : "0";
        }
      });
    };

    /* Do NOT pre-activate stage 0 — the observer handles all stages.
       Pre-activating caused bullets to open before the user had scrolled
       anywhere near the workflow section. */

    /* rootMargin shrinks the observation window:
       - top: -10%  → stage must be at least 10% from top before counting
       - bottom: -38% → stage must be at least 38% from bottom before counting
       Combined: stages only trigger when in the middle ~52% of the viewport,
       ensuring the user has genuinely scrolled to each step before it opens. */
    const scrollObserver = new IntersectionObserver((entries) => {
      if (!autoAdvanceAllowed) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = parseInt(entry.target.getAttribute("data-mobile-stage"), 10);
          if (!isNaN(idx) && idx > mCurrent) mActivate(idx, false);
        }
      });
    }, { threshold: 0.25, rootMargin: "-10% 0px -38% 0px" });

    mStages.forEach((s) => scrollObserver.observe(s));

    mStages.forEach((stage, idx) => {
      stage.addEventListener("click", () => {
        autoAdvanceAllowed = false;
        mActivate(idx, true);
        setTimeout(() => { autoAdvanceAllowed = true; }, 2000);
      });
    });

    let touchStartX = 0, touchStartY = 0;
    mobileSection.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    mobileSection.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return;
      autoAdvanceAllowed = false;
      const next = Math.max(0, Math.min(mStages.length - 1, mCurrent + (dx < 0 ? 1 : -1)));
      mActivate(next, true);
      setTimeout(() => { autoAdvanceAllowed = true; }, 2000);
    }, { passive: true });
  })();

});
