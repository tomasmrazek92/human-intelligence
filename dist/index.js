"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/illustration.js
  function runSecureMCP(nextPage2) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const scope = nextPage2 || document;
    if (!scope.querySelector("[data-illustration]"))
      return;
    const CONFIG5 = {
      // ScrollTrigger — add [data-illustration] to your SVG wrapper in Webflow
      scrollTrigger: {
        trigger: "[data-illustration]",
        start: "top 80%",
        markers: false
      },
      // No `ease` here on purpose: index.js registers the house CustomEase and
      // sets gsap.defaults({ ease: 'osmo' }), so every tween below inherits it.
      // The old back.out(1.7) override put the same bounce on all 20 layers,
      // which is what read as mechanical.
      // How far elements drop in from (px) — short travel reads snappier
      dropY: 18,
      // ── Phase 1 — every layer in the stack, top of the diagram to the bottom ──
      // The reveal accelerates: both the gap between layers and each layer's own
      // duration ramp from the *From value down to the *To value across the WHOLE
      // stack, not per group — a per-group stagger would reset to slow four times.
      // curve shapes the ramp: 1 = linear, higher = holds the slow pace longer
      // and then drops away faster.
      layers: {
        gapFrom: 0.1,
        gapTo: 0.022,
        durationFrom: 0.28,
        durationTo: 0.12,
        curve: 2,
        // The agent tiles sit ON the agents-base plate, so they are sub-layers:
        // they run alongside the main stack from the moment their plate lands and
        // never hold the sequence up. offset is measured from the plate's start.
        subLayers: { offset: 0.06, gap: 0.05, duration: 0.22 }
      },
      // ── Phase 2 — labels, outlines and lines all reveal together ─────────────
      // labels.gap places the shared 'reveal' mark relative to the end of the
      // layers phase; outlines.offset and dashedLines.offset are measured FROM
      // that mark, so all three run concurrently.
      labels: {
        duration: 0.2,
        stagger: 0.06,
        gap: "-=0.25",
        // overlap with the tail of the layers phase
        groupGap: "-=0.15",
        title: { duration: 0.2, gap: "-=0.1" }
      },
      // ── Phase 3 — outline prisms drawn around the stack ──────────────────────
      // Both wrappers sit FIRST in document order inside their parent, so they
      // paint under the layers — drawing them alongside cannot cover anything.
      outlines: {
        offset: 0,
        fill: 0.3,
        stroke: 1.1,
        strokeEase: "power2.out",
        overlap: "-=0.1",
        // stroke starts before the fill has finished
        between: "-=0.9"
        // apps prism starts while the platform prism is drawing
      },
      // ── Phase 4 — dashed connector lines ─────────────────────────────────────
      // strokeDashoffset, NOT DrawSVG — DrawSVG rewrites stroke-dasharray and
      // would destroy the dash pattern.
      dashedLines: {
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.inOut",
        offset: 0,
        repeatDelay: 0.8
      },
      // ─── Float animations (post-reveal) ──────────────────────────────────────
      floats: {
        agentPlatform: {
          y: -5,
          ease: "sine.inOut",
          "agent-platform-layer": { duration: 1.8, delay: 0 },
          "headcount-layer": { duration: 1.9, delay: 0.15 },
          "open-enrollment-layer": { duration: 1.7, delay: 0.3, y: -4 },
          "performance-management-layer": { duration: 2, delay: 0.45 },
          "onboarding-layer": { duration: 1.8, delay: 0.6, y: -4 },
          "people-analytics-layer": { duration: 1.9, delay: 0.75 }
        },
        agents: {
          y: -8,
          ease: "sine.inOut",
          claude: { duration: 1.8, delay: 0 },
          gpt: { duration: 1.9, delay: 0.4 },
          gemini: { duration: 2, delay: 0.6 },
          grok: { duration: 1.7, delay: 0.2 }
        },
        dataPlatform: {
          y: -6,
          ease: "sine.inOut",
          "mcp-layer": { duration: 1.8, delay: 0 },
          "compliance-layer": { duration: 1.9, delay: 0.15 },
          "identity-aware-layer": { duration: 1.7, delay: 0.3, y: -4 },
          "semantic-layer": { duration: 2, delay: 0.45 },
          "data-modeling-layer": { duration: 1.8, delay: 0.6, y: -4 }
        },
        apps: {
          y: -8,
          ease: "sine.inOut",
          workday: { duration: 1.8, delay: 0 },
          "greenhouse-layer": { duration: 1.9, delay: 0.3 },
          carta: { duration: 2, delay: 0.5 },
          "lattice-layer": { duration: 1.7, delay: 0.15 }
        }
      }
      // ─────────────────────────────────────────────────────────────────────────
    };
    const IllustrationAnimation = (() => {
      const CARTA = '[id="carta_logo.svg"]';
      const PLATFORM_LAYERS = [
        "#agent-platform-layer",
        "#headcount-layer",
        "#open-enrollment-layer",
        "#performance-management-layer",
        "#onboarding-layer",
        "#people-analytics-layer"
      ];
      const PLATFORM_LABELS = [
        "#headcount",
        "#open-enrollment",
        "#performance-managemet",
        "#onboarding",
        "#people-analytics"
      ];
      const AGENT_TILES = ["#claude", "#gpt", "#gemini", "#grok"];
      const DATA_LAYERS = [
        "#mcp-layer",
        "#compliance-layer",
        "#identity-aware-layer",
        "#semantic-layer",
        "#data-modeling-layer"
      ];
      const DATA_LABELS = ["#mcp", "#compliance", "#idenity-aware", "#semantic", "#data-modeling"];
      const APP_TILES = ["#workday", "#greenhouse-layer", CARTA, "#lattice-layer"];
      const DASHED_LINES = ["#dashed-lines", "#dashed-lines_2", "#dashed-lines_3", "#dashed-lines_4"];
      const floatTweens = [];
      const pushFloat = (sel, cfg, h) => {
        if (!cfg || !scope.querySelector(sel))
          return;
        floatTweens.push(
          gsap.to(sel, {
            y: cfg.y ?? h.y,
            ease: h.ease,
            repeat: -1,
            yoyo: true,
            duration: cfg.duration,
            delay: cfg.delay
          })
        );
      };
      const floatGroup = (selectors, h) => {
        selectors.forEach((sel) => {
          const key = sel.startsWith("#") ? sel.slice(1) : sel.replace(/\[id="(.+)"\]/, "$1").replace("_logo.svg", "");
          pushFloat(sel, h[key], h);
        });
      };
      const hideAll = () => {
        gsap.set(["#agent-platform", "#agents-row", "#data-platform-row"], { autoAlpha: 0 });
        gsap.set([...PLATFORM_LAYERS, "#agents-base", ...AGENT_TILES, ...DATA_LAYERS, ...APP_TILES], {
          autoAlpha: 0
        });
        gsap.set([...PLATFORM_LABELS, "#label-title", "#agents", ...DATA_LABELS, "#title"], {
          autoAlpha: 0
        });
        gsap.set(["#layer-wrapper", "#apps-wrapper"], { autoAlpha: 0 });
        gsap.set("#apps-wrapper > path:first-child", { autoAlpha: 0 });
        gsap.set(DASHED_LINES, { autoAlpha: 0 });
      };
      const layersTimeline = () => {
        const c = CONFIG5.layers;
        const order = [...PLATFORM_LAYERS, "#agents-base", ...DATA_LAYERS, ...APP_TILES];
        const last = Math.max(order.length - 1, 1);
        const ramp = (i, from, to) => from + (to - from) * (i / last) ** c.curve;
        const tl = gsap.timeline();
        tl.set(["#agent-platform", "#agents-row", "#data-platform-row"], { autoAlpha: 1 });
        let at = 0;
        order.forEach((sel, i) => {
          tl.fromTo(
            sel,
            { y: CONFIG5.dropY, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: ramp(i, c.durationFrom, c.durationTo) },
            at
          );
          if (sel === "#agents-base") {
            const s = c.subLayers;
            AGENT_TILES.forEach((tile, j) => {
              tl.fromTo(
                tile,
                { y: CONFIG5.dropY, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: s.duration },
                at + s.offset + j * s.gap
              );
            });
          }
          at += ramp(i, c.gapFrom, c.gapTo);
        });
        tl.add(() => {
          floatGroup(PLATFORM_LAYERS, CONFIG5.floats.agentPlatform);
          floatGroup(AGENT_TILES, CONFIG5.floats.agents);
          floatGroup(DATA_LAYERS, CONFIG5.floats.dataPlatform);
          floatGroup(APP_TILES, CONFIG5.floats.apps);
        });
        return tl;
      };
      const labelsTimeline = () => {
        const c = CONFIG5.labels;
        const fade = { autoAlpha: 1, duration: c.duration, stagger: c.stagger };
        const tl = gsap.timeline();
        tl.to(PLATFORM_LABELS, fade).to("#label-title", { autoAlpha: 1, duration: c.title.duration }, c.title.gap).to("#agents", { autoAlpha: 1, duration: c.duration }, c.groupGap).to(DATA_LABELS, fade, c.groupGap).to("#title", { autoAlpha: 1, duration: c.title.duration }, c.title.gap);
        return tl;
      };
      const outlinesTimeline = () => {
        const c = CONFIG5.outlines;
        const tl = gsap.timeline();
        const platform = gsap.timeline().set("#layer-wrapper", { autoAlpha: 1, fillOpacity: 0, drawSVG: 0 }).to("#layer-wrapper", { fillOpacity: 1, duration: c.fill }).to("#layer-wrapper", { drawSVG: "100%", duration: c.stroke, ease: c.strokeEase }, c.overlap);
        const apps = gsap.timeline().set("#apps-wrapper", { autoAlpha: 1 }).set("#apps-wrapper > path:last-child", { drawSVG: 0 }).to("#apps-wrapper > path:first-child", {
          autoAlpha: 1,
          duration: c.fill
        }).to(
          "#apps-wrapper > path:last-child",
          { drawSVG: "100%", duration: c.stroke, ease: c.strokeEase },
          c.overlap
        );
        tl.add(platform).add(apps, c.between);
        return tl;
      };
      const dashedLinesTimeline = () => {
        const c = CONFIG5.dashedLines;
        const tl = gsap.timeline();
        const parents = DASHED_LINES.map((id) => scope.querySelector(id)).filter(Boolean);
        const allPaths = parents.flatMap(
          (el2) => el2.tagName.toLowerCase() === "path" ? [el2] : [...el2.querySelectorAll("path")]
        );
        if (!allPaths.length)
          return tl;
        allPaths.forEach((path) => {
          gsap.set(path, { strokeDashoffset: path.getTotalLength() });
        });
        tl.set(parents, { autoAlpha: 1 }).to(allPaths, {
          strokeDashoffset: 0,
          duration: c.duration,
          stagger: c.stagger,
          ease: c.ease,
          onComplete() {
            const loopTl = gsap.timeline({ repeat: -1, repeatDelay: c.repeatDelay });
            allPaths.forEach((path, i) => {
              loopTl.fromTo(
                path,
                { strokeDashoffset: path.getTotalLength() },
                { strokeDashoffset: 0, duration: c.duration, ease: c.ease },
                i * c.stagger
              );
            });
            floatTweens.push(loopTl);
          }
        });
        return tl;
      };
      const init = () => {
        const triggerEl = scope.querySelector(CONFIG5.scrollTrigger.trigger);
        gsap.context(() => {
          if (!triggerEl)
            return;
          hideAll();
          gsap.timeline({
            scrollTrigger: {
              trigger: triggerEl,
              start: CONFIG5.scrollTrigger.start,
              markers: CONFIG5.scrollTrigger.markers,
              once: true
            }
          }).add(layersTimeline()).addLabel("reveal", CONFIG5.labels.gap).add(labelsTimeline(), "reveal").add(outlinesTimeline(), `reveal+=${CONFIG5.outlines.offset}`).add(dashedLinesTimeline(), `reveal+=${CONFIG5.dashedLines.offset}`);
          new IntersectionObserver(([entry]) => {
            floatTweens.forEach((t) => entry.isIntersecting ? t.play() : t.pause());
          }).observe(triggerEl);
        }, triggerEl);
      };
      return { init };
    })();
    IllustrationAnimation.init();
  }

  // src/pattern.js
  var BUNDLE_BASE = (() => {
    const src = document.currentScript && document.currentScript.src || "";
    if (src)
      return src.replace(/[^/]+$/, "");
    const guess = [...document.scripts].map((s) => s.src).find((s) => /index\.js/.test(s));
    return guess ? guess.replace(/[^/]+$/, "") : "";
  })();
  var patternsPromise = null;
  function loadPatterns() {
    if (window.HI_SVG_PATTERNS)
      return Promise.resolve(window.HI_SVG_PATTERNS);
    if (patternsPromise)
      return patternsPromise;
    patternsPromise = new Promise((resolve) => {
      const el2 = document.createElement("script");
      el2.src = BUNDLE_BASE + "patterns-bundle.js";
      el2.onload = () => resolve(window.HI_SVG_PATTERNS || null);
      el2.onerror = () => {
        console.warn("[pattern] could not load " + el2.src);
        resolve(null);
      };
      document.head.appendChild(el2);
    });
    return patternsPromise;
  }
  function normalizeSvgSize(svgString) {
    return svgString.replace(/(<svg\b[^>]*?)\s+width="[^"]*"/i, '$1 width="100%"').replace(/(<svg\b[^>]*?)\s+height="[^"]*"/i, '$1 height="100%"');
  }
  var platformVisible = false;
  var pulseTls = [];
  function pausePatterns() {
    platformVisible = true;
    pulseTls.forEach((tl) => tl.pause());
  }
  function resumePatterns() {
    platformVisible = false;
    pulseTls.forEach((tl) => tl.play());
  }
  var DURATION = 1;
  var ANIM_DUR = 0.2;
  var HIGHLIGHT_OVERLAP = 0.2;
  var PULSE_OPACITY = 0.5;
  var PULSE_SCALE = 0.9;
  var PULSE_DURATION = 0.5;
  var PULSE_COL_STAGGER = 0.08;
  var PULSE_REPEAT_DELAY = 2.5;
  function sortFromCenter(paths, svgEl2) {
    const vb = svgEl2.viewBox.baseVal;
    const cx = vb.x + vb.width / 2;
    const cy = vb.y + vb.height / 2;
    return [...paths].sort((a, b) => {
      const ra = a.getBBox();
      const rb = b.getBBox();
      const da = Math.hypot(ra.x + ra.width / 2 - cx, ra.y + ra.height / 2 - cy);
      const db = Math.hypot(rb.x + rb.width / 2 - cx, rb.y + rb.height / 2 - cy);
      return da - db;
    });
  }
  function groupByColumns(paths) {
    if (!paths.length)
      return [];
    const items = [...paths].map((p) => {
      const bb = p.getBBox();
      return { path: p, cx: bb.x + bb.width / 2 };
    }).sort((a, b) => a.cx - b.cx);
    const gaps = [];
    for (let i = 1; i < items.length; i++) {
      const g = items[i].cx - items[i - 1].cx;
      if (g > 0.1)
        gaps.push(g);
    }
    const tolerance = gaps.length ? Math.min(...gaps) * 0.6 : 1;
    const columns = [];
    let col = [items[0]];
    for (let i = 1; i < items.length; i++) {
      if (items[i].cx - col[0].cx <= tolerance) {
        col.push(items[i]);
      } else {
        columns.push(col.map((p) => p.path));
        col = [items[i]];
      }
    }
    columns.push(col.map((p) => p.path));
    return columns;
  }
  function startHighlightPulse(highlightPaths, wrapperEl) {
    const columns = groupByColumns(highlightPaths);
    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: PULSE_REPEAT_DELAY,
      delay: PULSE_REPEAT_DELAY,
      paused: true
    });
    columns.forEach((col, i) => {
      const t = i * PULSE_COL_STAGGER;
      tl.to(
        col,
        {
          opacity: PULSE_OPACITY,
          scale: PULSE_SCALE,
          transformOrigin: "center center",
          duration: PULSE_DURATION,
          ease: "sine.out"
        },
        t
      ).to(
        col,
        {
          opacity: 1,
          scale: 1,
          transformOrigin: "center center",
          duration: PULSE_DURATION,
          ease: "sine.in"
        },
        t + PULSE_DURATION
      );
    });
    pulseTls.push(tl);
    new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !platformVisible) {
          wrapperEl.style.visibility = "";
          tl.play();
        } else {
          tl.pause();
          wrapperEl.style.visibility = "hidden";
        }
      },
      { rootMargin: "100px 0px" }
    ).observe(wrapperEl);
  }
  var baseSvgOf = (el2) => el2.matches("svg") ? el2 : el2.querySelector('[data-svg="base"]');
  function buildPulseIn(wrapperEl, { paused = false } = {}) {
    const baseSvg = baseSvgOf(wrapperEl);
    const highlightSvg = wrapperEl.querySelector('[data-svg="highlight"]');
    if (!baseSvg)
      return;
    const basePaths = sortFromCenter(baseSvg.querySelectorAll("path"), baseSvg);
    const highlightPaths = highlightSvg ? sortFromCenter(highlightSvg.querySelectorAll("path"), highlightSvg) : [];
    gsap.set([...basePaths, ...highlightPaths], {
      opacity: 0,
      scale: 0,
      transformOrigin: "center center"
    });
    const staggerConfig = { amount: DURATION - ANIM_DUR, ease: "sine.out" };
    const tl = gsap.timeline({ paused });
    const from = () => ({ opacity: 0, scale: 0, transformOrigin: "center center" });
    const to = () => ({
      opacity: 1,
      scale: 1,
      duration: ANIM_DUR,
      ease: "back.out(1.4)",
      stagger: staggerConfig
    });
    tl.fromTo(basePaths, from(), to());
    if (highlightPaths.length) {
      tl.fromTo(highlightPaths, from(), to(), DURATION - HIGHLIGHT_OVERLAP);
    }
    tl.call(() => {
      gsap.set([...basePaths, ...highlightPaths], { clearProps: "all" });
      if (highlightPaths.length)
        startHighlightPulse(highlightPaths, wrapperEl);
    });
    return tl;
  }
  function buildAppsIn(wrapperEl, { paused = false } = {}) {
    const baseSvg = baseSvgOf(wrapperEl);
    const appsSvg = wrapperEl.querySelector('[data-svg="apps"]');
    if (!baseSvg || !appsSvg)
      return;
    const basePaths = sortFromCenter(baseSvg.querySelectorAll("path"), baseSvg);
    const appGroups = [...appsSvg.querySelectorAll('[id^="app"]')].filter(
      (el2) => el2.id !== "app-flow"
    );
    const arrow = appsSvg.querySelector("#arrow");
    gsap.set(basePaths, { opacity: 0, scale: 0, transformOrigin: "center center" });
    gsap.set(appGroups, { opacity: 0, scale: 0.85, transformOrigin: "center center" });
    if (arrow)
      gsap.set(arrow, { clipPath: "inset(0 0 100% 0)" });
    const staggerConfig = { amount: DURATION - ANIM_DUR, ease: "sine.out" };
    const tl = gsap.timeline({ paused });
    tl.fromTo(
      basePaths,
      { opacity: 0, scale: 0, transformOrigin: "center center" },
      { opacity: 1, scale: 1, duration: ANIM_DUR, ease: "back.out(1.4)", stagger: staggerConfig }
    );
    tl.to(
      appGroups,
      {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        stagger: 0.2,
        ease: "back.out(1.4)",
        transformOrigin: "center center"
      },
      DURATION - HIGHLIGHT_OVERLAP
    );
    if (arrow) {
      tl.to(arrow, { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "power2.inOut" }, ">-0.1");
    }
    tl.call(() => {
      gsap.set(basePaths, { clearProps: "all" });
      gsap.set(appGroups, { clearProps: "all" });
      if (arrow)
        gsap.set(arrow, { clearProps: "clipPath" });
    });
    return tl;
  }
  function initPulse(wrapperEl) {
    const builder = wrapperEl.querySelector('[data-svg="apps"]') ? buildAppsIn : buildPulseIn;
    builder(wrapperEl);
    new IntersectionObserver(
      ([entry]) => {
        wrapperEl.style.visibility = entry.isIntersecting ? "" : "hidden";
      },
      { rootMargin: "100px 0px" }
    ).observe(wrapperEl);
  }
  function initScroll(wrapperEl) {
    const builder = wrapperEl.querySelector('[data-svg="apps"]') ? buildAppsIn : buildPulseIn;
    const tl = builder(wrapperEl, { paused: true });
    ScrollTrigger.create({
      trigger: wrapperEl,
      start: "top 80%",
      once: true,
      onEnter: () => tl.play()
    });
    new IntersectionObserver(
      ([entry]) => {
        wrapperEl.style.visibility = entry.isIntersecting ? "" : "hidden";
      },
      { rootMargin: "100px 0px" }
    ).observe(wrapperEl);
  }
  async function runPattern(nextPage2) {
    if (window.innerWidth < 992)
      return;
    const scope = nextPage2 || document;
    const needsRegistry = [...$("[data-pattern]", scope)].some(
      (el2) => !el2.matches("svg") && [...el2.classList].some((c) => c.startsWith("cc-"))
    );
    const SVG_PATTERNS = needsRegistry ? await loadPatterns() : {};
    if (needsRegistry && !SVG_PATTERNS)
      return;
    $("[data-pattern]", scope).each(function() {
      const mode = $(this).data("pattern");
      const isSvg = this.matches("svg");
      const ccClass = isSvg ? null : [...this.classList].find((c) => c.startsWith("cc-"));
      if (ccClass) {
        const entry = SVG_PATTERNS[ccClass];
        if (!entry) {
          console.warn(`[pattern] No SVG found for key "${ccClass}"`);
          return;
        }
        const hasOverlay = !!(entry.apps || entry.highlight);
        let maskStyle = "";
        if (entry.mask || hasOverlay) {
          const edgeMaskH = hasOverlay ? `linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)` : null;
          const edgeMaskV = hasOverlay ? `linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)` : null;
          const masks = [entry.mask?.replace(/;+$/, ""), edgeMaskH, edgeMaskV].filter(Boolean);
          const composites = Array(masks.length - 1).fill("intersect").join(", ");
          maskStyle = `mask-image: ${masks.join(", ")}; mask-composite: ${composites || "add"};`;
        }
        const secondSvg = entry.apps ? `<svg data-svg="apps"       style="position:absolute;inset:0;width:100%;height:100%;z-index:2">${normalizeSvgSize(
          entry.apps
        )}</svg>` : entry.highlight ? `<svg data-svg="highlight"  style="position:absolute;inset:0;width:100%;height:100%;z-index:2">${normalizeSvgSize(
          entry.highlight
        )}</svg>` : "";
        this.style.contentVisibility = "auto";
        $(this).html(`
        <svg data-svg="base" style="position:absolute;inset:0;width:100%;height:100%;z-index:1;${maskStyle}">${normalizeSvgSize(
          entry.base
        )}</svg>
        ${secondSvg}
      `);
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;
      if (mode === "pulse")
        initPulse(this);
      else if (mode === "scroll")
        initScroll(this);
    });
  }

  // src/osmo.js
  function initGlobalParallax(nextPage2) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const scope = nextPage2 || document;
    const mm = gsap.matchMedia();
    mm.add(
      {
        isMobile: "(max-width:479px)",
        isMobileLandscape: "(max-width:767px)",
        isTablet: "(max-width:991px)",
        isDesktop: "(min-width:992px)"
      },
      (context) => {
        const { isMobile, isMobileLandscape, isTablet } = context.conditions;
        const ctx = gsap.context(() => {
          scope.querySelectorAll('[data-parallax="trigger"]').forEach((trigger) => {
            const disable = trigger.getAttribute("data-parallax-disable") || "tablet";
            if (disable === "mobile" && isMobile || disable === "mobileLandscape" && isMobileLandscape || disable === "tablet" && isTablet) {
              return;
            }
            const target = trigger.querySelector('[data-parallax="target"]') || trigger;
            const direction = trigger.getAttribute("data-parallax-direction") || "vertical";
            const prop = direction === "horizontal" ? "xPercent" : "yPercent";
            const scrubAttr = trigger.getAttribute("data-parallax-scrub");
            const scrub = scrubAttr ? parseFloat(scrubAttr) : true;
            const startAttr = trigger.getAttribute("data-parallax-start");
            const startVal = startAttr !== null ? parseFloat(startAttr) : 20;
            const endAttr = trigger.getAttribute("data-parallax-end");
            const endVal = endAttr !== null ? parseFloat(endAttr) : -20;
            const scrollStart = trigger.getAttribute("data-parallax-scroll-start") || "top bottom";
            const scrollEnd = trigger.getAttribute("data-parallax-scroll-end") || "bottom top";
            gsap.fromTo(
              target,
              { [prop]: startVal },
              {
                [prop]: endVal,
                ease: "none",
                scrollTrigger: {
                  trigger,
                  start: scrollStart,
                  end: scrollEnd,
                  scrub
                }
              }
            );
          });
        });
        return () => ctx.revert();
      }
    );
  }
  function initScrambleText(nextPage2) {
    if (window.innerWidth < 992)
      return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const scope = nextPage2 || document;
    function initScrambleOnLoad() {
      let targets = scope.querySelectorAll('[data-scramble="load"]');
      targets.forEach((target) => {
        let split = new SplitText(target, {
          type: "words, chars",
          wordsClass: "word",
          charsClass: "char"
        });
        gsap.to(split.words, {
          duration: 1.2,
          stagger: 0.01,
          scrambleText: {
            text: "{original}",
            chars: "01",
            // experiment with different scramble characters here
            speed: 0.85
          },
          // Once animation is done, revert the split to reduce DOM size
          onComplete: () => split.revert()
        });
      });
    }
    function initScrambleOnScroll() {
      let targets = scope.querySelectorAll('[data-scramble="scroll"]');
      targets.forEach((target) => {
        let split = new SplitText(target, {
          type: "words, chars",
          wordsClass: "word",
          charsClass: "char"
        });
        gsap.to(split.words, {
          duration: 2,
          stagger: 0.015,
          scrambleText: {
            text: "{original}",
            chars: "01",
            // experiment with different scramble characters here
            speed: 0.1
          },
          scrollTrigger: {
            trigger: target,
            start: "top bottom",
            once: true
          },
          // Once animation is done, revert the split to reduce DOM size
          onComplete: () => split.revert()
        });
      });
    }
    function initScrambleOnHover() {
      let targets = scope.querySelectorAll('[data-scramble-hover="link"]');
      targets.forEach((target) => {
        let textEl = target.querySelector('[data-scramble-hover="target"]');
        let originalText = textEl.textContent;
        let customHoverText = textEl.getAttribute("data-scramble-text");
        let split = new SplitText(textEl, {
          type: "words, chars",
          wordsClass: "word",
          charsClass: "char"
        });
        target.addEventListener("mouseenter", () => {
          gsap.to(textEl, {
            duration: 1,
            scrambleText: {
              text: customHoverText ? customHoverText : originalText,
              chars: "01"
            }
          });
        });
        target.addEventListener("mouseleave", () => {
          gsap.to(textEl, {
            duration: 0.6,
            scrambleText: {
              text: originalText,
              speed: 2,
              chars: "01"
            }
          });
        });
      });
    }
    initScrambleOnLoad();
    initScrambleOnScroll();
    initScrambleOnHover();
  }
  function initContentRevealScroll(nextPage2) {
    const scope = nextPage2 || document;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 992;
    const CONFIG5 = {
      from: { yPercent: 10, blur: 10 },
      duration: 0.55,
      ease: "cubic-bezier(0.38, 0.005, 0.215, 1)"
    };
    const HEADING_TAGS = /* @__PURE__ */ new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);
    function getFromState(el2) {
      const useBlur = !isMobile || HEADING_TAGS.has(el2.tagName);
      return {
        ...isMobile ? {} : { yPercent: CONFIG5.from.yPercent },
        autoAlpha: 0,
        ...useBlur ? { filter: `blur(${CONFIG5.from.blur}px)` } : {}
      };
    }
    function getToState(el2) {
      const useBlur = !isMobile || HEADING_TAGS.has(el2.tagName);
      return {
        ...isMobile ? {} : { yPercent: 0 },
        autoAlpha: 1,
        ...useBlur ? { filter: "blur(0px)" } : {},
        duration: CONFIG5.duration,
        ease: CONFIG5.ease
      };
    }
    const ctx = gsap.context(() => {
      scope.querySelectorAll("[data-reveal-group]").forEach((groupEl) => {
        const groupStaggerSec = (parseFloat(groupEl.getAttribute("data-stagger")) || 100) / 1e3;
        const triggerStart = groupEl.getAttribute("data-start") || "top 80%";
        if (prefersReduced) {
          gsap.set(groupEl, { clearProps: "all", yPercent: 0, autoAlpha: 1 });
          return;
        }
        const directChildren = Array.from(groupEl.children).filter(
          (el2) => el2.nodeType === 1 && !el2.hasAttribute("data-reveal-skip")
        );
        if (!directChildren.length) {
          gsap.set(groupEl, getFromState(groupEl));
          ScrollTrigger.create({
            trigger: groupEl,
            start: triggerStart,
            once: true,
            onEnter: () => gsap.to(groupEl, {
              ...getToState(groupEl),
              onComplete: () => gsap.set(groupEl, { clearProps: "all" })
            })
          });
          return;
        }
        const staggerOf = (el2, fallback) => {
          const ms = parseFloat(el2.getAttribute("data-stagger"));
          return isNaN(ms) ? fallback : ms / 1e3;
        };
        const isSkipped = (el2) => el2.hasAttribute("data-reveal-skip") || el2.getAttribute("data-ignore") === "true";
        const wrapsNestedGroup = (el2) => !!el2.querySelector("[data-reveal-group-nested]");
        const entries = [];
        const walk = (group, baseTime, stagger) => {
          let slot = 0;
          Array.from(group.children).forEach((child) => {
            if (child.nodeType !== 1 || isSkipped(child))
              return;
            const time = baseTime + slot * stagger;
            slot += 1;
            const isNested = child.matches("[data-reveal-group-nested]");
            const isWrapper = !isNested && wrapsNestedGroup(child);
            if (isNested || isWrapper) {
              if (child.getAttribute("data-ignore") === "false") {
                entries.push({ el: child, time });
              }
              walk(child, time, isNested ? staggerOf(child, stagger) : stagger);
              return;
            }
            entries.push({ el: child, time });
          });
        };
        walk(groupEl, 0, groupStaggerSec);
        entries.forEach(({ el: el2 }) => gsap.set(el2, getFromState(el2)));
        if (isMobile) {
          const revealEl = (el2) => {
            ScrollTrigger.create({
              trigger: el2,
              start: triggerStart,
              once: true,
              onEnter: () => gsap.to(el2, {
                ...getToState(el2),
                onComplete: () => gsap.set(el2, { clearProps: "all" })
              })
            });
          };
          entries.forEach(({ el: el2 }) => revealEl(el2));
          return;
        }
        ScrollTrigger.create({
          trigger: groupEl,
          start: triggerStart,
          once: true,
          onEnter: () => {
            const tl = gsap.timeline();
            entries.forEach(({ el: el2, time }) => {
              tl.to(
                el2,
                {
                  ...getToState(el2),
                  onComplete: () => gsap.set(el2, { clearProps: "all" })
                },
                time
              );
            });
          }
        });
      });
    });
    return () => ctx.revert();
  }
  function initHighlightMarkerTextReveal(nextPage2) {
    const scope = nextPage2 || document;
    const CONFIG5 = {
      totalDuration: 0.9,
      wordDuration: 0.7,
      ease: "cubic-bezier(0.38, 0.005, 0.215, 1)",
      from: { yPercent: 10, blur: 10 },
      scrollStart: "top 90%"
    };
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      scope.querySelectorAll("[data-highlight-marker-reveal]").forEach((el2) => {
        gsap.set(el2, { visibility: "visible", opacity: 1 });
      });
      return;
    }
    const elements = scope.querySelectorAll("[data-highlight-marker-reveal]");
    if (!elements.length)
      return;
    elements.forEach((el2) => {
      const scrollStart = el2.getAttribute("data-marker-scroll-start") || CONFIG5.scrollStart;
      const split = SplitText.create(el2, {
        type: "words",
        autoSplit: true,
        onSplit(self) {
          gsap.set(self.words, {
            yPercent: CONFIG5.from.yPercent,
            autoAlpha: 0,
            filter: `blur(${CONFIG5.from.blur}px)`
          });
          gsap.set(el2, { autoAlpha: 1 });
          ScrollTrigger.create({
            trigger: el2,
            start: scrollStart,
            once: true,
            onEnter: () => {
              const count = self.words.length;
              const stagger = count > 1 ? (CONFIG5.totalDuration - CONFIG5.wordDuration) / (count - 1) : 0;
              gsap.to(self.words, {
                yPercent: 0,
                autoAlpha: 1,
                filter: "blur(0px)",
                stagger,
                duration: CONFIG5.wordDuration,
                ease: CONFIG5.ease
              });
            }
          });
        }
      });
    });
  }
  function initWhitePaperSwiper(nextPage2) {
    const el2 = (nextPage2 || document).querySelector(".white-paper_testimonials");
    if (!el2)
      return;
    const swiper = new Swiper(el2, {
      slidesPerView: 1,
      autoHeight: true,
      effect: "fade",
      fadeEffect: { crossFade: true },
      speed: 600,
      loop: true,
      autoplay: false,
      pagination: {
        el: ".swiper-navigation",
        bulletClass: "swiper-dot",
        bulletActiveClass: "cc-active",
        clickable: true
      }
    });
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          swiper.autoplay.start();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el2);
  }
  function initModalBasic(nextPage2) {
    const scope = nextPage2 || document;
    const modalGroup = scope.querySelector("[data-modal-group-status]");
    const modals = scope.querySelectorAll("[data-modal-name]");
    const modalTargets = scope.querySelectorAll("[data-modal-target]");
    modalTargets.forEach((modalTarget) => {
      modalTarget.addEventListener("click", function() {
        const modalTargetName = this.getAttribute("data-modal-target");
        modalTargets.forEach((target) => target.setAttribute("data-modal-status", "not-active"));
        modals.forEach((modal) => modal.setAttribute("data-modal-status", "not-active"));
        scope.querySelector(`[data-modal-target="${modalTargetName}"]`).setAttribute("data-modal-status", "active");
        scope.querySelector(`[data-modal-name="${modalTargetName}"]`).setAttribute("data-modal-status", "active");
        if (modalGroup) {
          modalGroup.setAttribute("data-modal-group-status", "active");
        }
        if (typeof lenis !== "undefined" && lenis) {
          lenis.stop();
        } else {
          disableScroll();
        }
      });
    });
    scope.querySelectorAll("[data-modal-close]").forEach((closeBtn) => {
      closeBtn.addEventListener("click", closeAllModals);
    });
    document.addEventListener("keydown", function(event) {
      if (event.key === "Escape") {
        closeAllModals();
      }
    });
    function closeAllModals() {
      modalTargets.forEach((target) => target.setAttribute("data-modal-status", "not-active"));
      if (modalGroup) {
        modalGroup.setAttribute("data-modal-group-status", "not-active");
      }
      if (typeof lenis !== "undefined" && lenis) {
        lenis.start();
      } else {
        enableScroll();
      }
    }
  }

  // src/platform.js
  var GRAY_DUR_MIN = 2;
  var GRAY_DUR_MAX = 5;
  var GROUP_DUR = 3;
  var GROUP_SPREAD = 20;
  function initPlatformDots(nextPage2, selector = '[data-anim="platform-dots"]') {
    if (window.innerWidth < 992)
      return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const scope = nextPage2 || document;
    const svg = scope.querySelector(selector);
    if (!svg)
      return;
    if (document.getElementById("platform-dots-style")) {
      document.getElementById("platform-dots-style").remove();
    }
    const style = document.createElement("style");
    style.id = "platform-dots-style";
    style.textContent = `
    @keyframes platform-gray-flicker {
      0%, 100% { opacity: var(--op-lo); }
      50%       { opacity: var(--op-hi); }
    }

    @keyframes platform-group-breathe {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.2; }
    }

    [data-anim="platform-dots"] #gray-side rect {
      animation: platform-gray-flicker var(--dur) ease-in-out infinite;
      animation-play-state: paused;
    }

    [data-anim="platform-dots"] #purple-side g[id^="group-"],
    [data-anim="platform-dots"] #purple-side g[id^="group_"] {
      transform-box: fill-box;
      transform-origin: center;
      animation: platform-group-breathe ${GROUP_DUR}s ease-in-out infinite;
      animation-play-state: paused;
    }
  `;
    document.head.appendChild(style);
    svg.querySelectorAll("#gray-side rect").forEach((rect) => {
      const dur = (GRAY_DUR_MIN + Math.random() * (GRAY_DUR_MAX - GRAY_DUR_MIN)).toFixed(2);
      const lo = (0.1 + Math.random() * 0.3).toFixed(2);
      const hi = (0.5 + Math.random() * 0.5).toFixed(2);
      const delay = (Math.random() * parseFloat(dur)).toFixed(2);
      rect.style.setProperty("--dur", `${dur}s`);
      rect.style.setProperty("--op-lo", lo);
      rect.style.setProperty("--op-hi", hi);
      rect.style.animationDelay = `-${delay}s`;
    });
    const groups = [
      ...svg.querySelectorAll('#purple-side g[id^="group-"], #purple-side g[id^="group_"]')
    ];
    const total = groups.length;
    groups.forEach((group, i) => {
      const delay = ((total - 1 - i) / total * GROUP_SPREAD).toFixed(2);
      group.style.animationDelay = `-${delay}s`;
    });
    const els = '#gray-side rect, #purple-side g[id^="group-"], #purple-side g[id^="group_"]';
    const attachObserver = () => {
      new IntersectionObserver(([entry]) => {
        const state = entry.isIntersecting ? "running" : "paused";
        svg.querySelectorAll(els).forEach((el2) => {
          el2.style.animationPlayState = state;
        });
        if (entry.isIntersecting)
          pausePatterns();
        else
          resumePatterns();
      }).observe(svg);
    };
    svg.querySelectorAll(els).forEach((el2) => {
      el2.style.animationPlayState = "running";
    });
    setTimeout(attachObserver, 2e3);
  }

  // src/cardIllustrations.js
  var API = function() {
    var CONFIG5 = {
      global: {
        ease: "osmo",
        // CustomEase, registered below
        easePath: "M0,0 C0.625,0.05 0,1 1,1",
        duration: 0.5,
        // fallback when a step omits duration
        start: "top 78%",
        // ScrollTrigger start
        end: "bottom top",
        // when the ambient loops pause
        breakpoint: 767,
        // portrait cutover — must match the CSS that swaps the artwork
        portraitDistance: 0.6,
        // x/y offsets are scaled by this under the breakpoint
        portraitTimeScale: 1.15,
        // >1 plays faster on mobile
        markers: false
        // ScrollTrigger markers
      },
      // 0 · Integrations ------------------------------------------------------
      integrations: {
        timeScale: 1,
        sidebar: { at: 0, duration: 0.6, from: { x: -30 } },
        tabs: { at: 0.12, duration: 0.5, from: { x: -12 }, stagger: 0.04 },
        header: { at: 0.2, duration: 0.5, from: { y: 8 } },
        // cards come in as a 2-column grid: rowStagger between rows,
        // colStagger between the left and right card of the same row
        cards: {
          at: 0.3,
          duration: 0.55,
          from: { x: 16, y: 10 },
          // x is the magnitude; left column uses -x
          rowStagger: 0.12,
          colStagger: 0.04
        }
      },
      // 1 · Lineage graph -----------------------------------------------------
      lineage: {
        timeScale: 1,
        sources: { at: 0, duration: 0.6, from: { x: -24 } },
        sourceItems: { at: 0.1, duration: 0.5, from: { x: -10 }, stagger: 0.05 },
        connectors: { at: 0.4, duration: 0.7, stagger: 0.08, ease: "none" },
        arrow: { at: 0.9, duration: 0.3 },
        tableBlock: { at: 0.55, duration: 0.4 },
        tables: { at: 0.25, duration: 0.5, from: { y: 8 }, stagger: 0.06 },
        outcomes: { at: 0.75, duration: 0.55, from: { y: 12 }, stagger: 0.1 },
        // the ambient "data flowing" loop
        flow: {
          enabled: true,
          // the travelling packet
          tint: "#A54BF7",
          // packet stroke colour
          strokeWidth: 1,
          // packet stroke width
          // `step` is a MINIMUM. The real step auto-extends to fit the whole
          // highlight (highlightAt + traceDraw + traceHold + traceFade) plus
          // stepGap, so a node always clears before the next packet launches —
          // retune the trace freely and the cadence follows.
          step: 1.6,
          stepGap: 0.25,
          // quiet beat between one node clearing and the next firing
          pulseDuration: 0.55,
          // packet travel time along one line
          pulseLength: 37,
          // packet length in SVG units
          pulseFadeOut: 0.2,
          // packet fade as it arrives
          pulseFadeAt: 0.68,
          // when the fade starts, relative to the step
          cycleDelay: 0,
          // pause between full 8-step cycles
          // the "arrival" on the table node — independent of the packet above.
          // No glow, no ring: the node scales while a line draws itself around the
          // outline, finishing as a complete border. It reuses the packet's
          // `strokeWidth` so the two always match.
          // The lit window is built from its parts, so each phase is set directly:
          //   highlightAt → traceDraw → traceHold → traceFade
          // Keep their sum under `step` or a node is still lit when the next lights up.
          highlightAt: 0.35,
          // when the table lights up, relative to the step
          traceDraw: 0.95,
          // how long the border takes to draw itself on
          traceHold: 1,
          // how long it stays fully drawn
          traceFade: 0.5,
          // line fade in / out
          traceEase: "power2.inOut",
          highlightTint: "#A54BF7",
          // the drawing line's colour
          highlightScale: 1.03,
          // node swells slightly as the packet lands
          highlightIn: 0.28,
          // scale-up time
          highlightOut: 0.5,
          // scale-down time, starts as the border clears
          highlightEase: "back.out(2.2)"
        }
      },
      // 2 · Metric form -------------------------------------------------------
      "metric-form": {
        timeScale: 1,
        header: { at: 0, duration: 0.55, from: { y: 10 } },
        fields: { at: 0.18, duration: 0.5, from: { y: 10 }, stagger: 0.08 },
        chips: {
          at: 0.46,
          duration: 0.4,
          from: { scale: 0.9 },
          stagger: 0.06,
          transformOrigin: "left center"
        }
      },
      // 3 · Refusal -----------------------------------------------------------
      refusal: {
        timeScale: 1,
        user: { at: 0, duration: 0.5, from: { y: -8 } },
        card: { at: 0.05, duration: 0.4 },
        prompt: { at: 0.25, duration: 0.55, from: { y: 14 } },
        // the gap between prompt and answer is the "thinking" beat — the whole
        // point of this illustration is that the refusal feels considered
        answer: { at: 1.45, duration: 0.6, from: { y: 14 } },
        logo: { at: 1.55, duration: 0.45, from: { scale: 0.8 }, transformOrigin: "center" },
        // outlined text split into per-glyph paths and staggered — reads as typing
        // without needing real characters
        typing: {
          enabled: true,
          stagger: 0.012,
          // seconds per letter — ~83 cpm at 0.012
          duration: 0.06,
          // each letter's own fade
          promptAt: 0.45,
          // the user's question types in
          answerAt: 1.7
          // the refusal types in, after the thinking beat
        }
      },
      // 4 · Policy cards ------------------------------------------------------
      policies: {
        timeScale: 1,
        cards: {
          at: 0,
          duration: 0.6,
          from: { x: 20, y: 16 },
          // alternating sides: even cards use -x
          stagger: 0.1
        },
        shield: {
          at: 0.5,
          duration: 0.5,
          from: { scale: 0.6 },
          ease: "back.out(2)",
          transformOrigin: "center"
        },
        // Cards advance up one slot at a time, forever. The slot the shield sits
        // beside is the featured one, so each policy takes its turn there.
        // Slots are read from the artwork, so a re-export that moves them still works.
        cycle: {
          enabled: true,
          step: 2.2,
          // dwell before the stack advances again
          moveDuration: 0.7,
          // travel time between slots
          wrapLift: 70
          // how far the top card carries on before it is recycled
        }
      },
      // 6 · Shield + logo grid -------------------------------------------------
      shield: {
        timeScale: 1,
        // The tile grid is irregular, so the reveal is driven by each tile's
        // distance from the shield centre rather than by DOM order — it expands
        // as a real ring, and equidistant tiles fire together.
        logos: {
          at: 0,
          duration: 0.55,
          from: { scale: 0.85, y: 6 },
          spread: 0.75,
          // seconds for the wave to reach the outermost tile
          ease: "back.out(1.6)"
        },
        // Rows scroll slowly in alternating directions. Empty tiles are dropped and
        // the remaining logos repeated to fill, so the row count, tile pitch and
        // logo count are all read from the artwork — drop in a new export with
        // more logos and nothing here needs changing.
        marquee: {
          enabled: true,
          speed: 9,
          // SVG units per second
          startImmediately: true,
          // scroll from the moment it enters view, not after the reveal
          zigzag: true,
          // alternate direction per row; false = all one way
          dropEmpty: true,
          // bin tiles that contain no logo
          pitch: 0,
          // 0 = measure the spacing from the artwork
          // SVG-side edge fade. Off by default — the feather is done in CSS on the
          // wrapper instead (see README), which is tunable in Webflow without a
          // release. Leaving both on would double up.
          fade: 0
          // fraction of the width faded at each edge; 0 = off
        },
        glow: { at: 0.7, duration: 1.1 },
        // the soft white bloom behind the shield
        shieldBase: { at: 0.8, duration: 0.7, from: { scale: 0.93 } },
        mark: { at: 1.25, duration: 0.6, from: { scale: 0.8 } },
        // the logo inside
        // The static outlines grow out from behind the shield exactly like a wave
        // does — same motion, but once, and they stay.
        outlineReveal: { at: 0.65, duration: 1, ease: "power2.out" },
        connector: { at: 0.7, duration: 0.5 },
        agentsBox: { at: 1.15, duration: 0.5 },
        agentTiles: { at: 1.2, duration: 0.5, from: { y: 10 }, stagger: 0.08 },
        // the dashed border round the agents row
        agentsDash: {
          enabled: true,
          speed: 15,
          // 0 = inherit marquee.speed
          reverse: false
        },
        // Waves emanating from the shield. Each one steps out to where outline-1
        // sits (taking its colour), rests, steps out to outline-2 (taking that
        // colour), rests, then clears. The two real outlines are HIDDEN while this
        // runs — the waves are the outlines. Stop positions and colours are read
        // off the real outlines at runtime, so a re-export keeps them aligned.
        ripple: {
          enabled: true,
          // Index of the first outline that animates. Everything before it stays
          // put — outline-1 is where the connector line meets the shield, so
          // animating it away would break that join.
          animateFrom: 1,
          // With more than one wave in flight there is almost always one parked at
          // the stop, so it reads as a permanent outline rather than a pulse.
          // One wave plus a gap gives a clear empty beat between passes.
          waves: 1,
          travel: 0.6,
          // time to move between stops
          hold: 0.35,
          // pause on each stop
          fadeOut: 0.4,
          // fade after the last stop
          gap: 0.7,
          // empty beat before the next wave sets off
          peakOpacity: 0.9,
          strokeWidth: 1,
          ease: "power2.out",
          // quick push, then settling into the stop
          startScale: 0
          // 0 = start at the last static outline
        },
        // the mark breathing — deliberately not a multiple of `period` so the two
        // loops drift out of phase instead of pulsing in lockstep
        breathe: {
          enabled: true,
          scale: 1.14,
          duration: 2.3,
          ease: "sine.inOut"
        },
        // The solid shield breathing under its outline. Only the body moves —
        // outline-1 stays put because the connector line meets it, and a moving
        // outline would pull away from that join. Keep this subtle: it sits behind
        // the mark's own breathe, and the two compound visually.
        shieldBreathe: {
          enabled: true,
          scale: 1.02,
          duration: 3.1,
          // not a multiple of the mark's 2.3, so they drift apart
          ease: "sine.inOut"
        }
      },
      // 5 · Audit log ---------------------------------------------------------
      "audit-log": {
        timeScale: 1,
        header: { at: 0, duration: 0.5, from: { y: 10 } },
        head: { at: 0.15, duration: 0.5, from: { y: 8 } },
        rows: { at: 0.25, duration: 0.5, from: { y: 10 }, stagger: 0.05 },
        // the highlight band walking down the rows, forever
        walk: {
          enabled: true,
          at: 0.7,
          // when the band first appears
          fadeIn: 0.3,
          rows: 4,
          // how far down it walks before resetting
          stepDuration: 0.4,
          // one row-to-row move
          hold: 1,
          // dwell on each row
          resetDuration: 0.4,
          // the jump back to the top
          repeatDelay: 0.6
          // pause before the cycle restarts
        }
      },
      // 6 · Systems — scattered -> connected -----------------------------------
      // One diagram, played from the `before` state to the `after` state. The
      // artwork ships fully lit, so the entrance runs it backwards: the dashed
      // grey borders are clones of the real ones (see `before`), and the real
      // borders + glows + lines + plate start hidden and arrive on the beat.
      systems: {
        timeScale: 1,
        // the unlit state, cloned onto each tile from its own border path so the
        // dashed outline sits exactly where the lit one will
        before: { stroke: "#444", dash: "2.77 2.77" },
        // 1 · the systems turn up, scattered and unconnected
        tiles: { at: 0, duration: 0.85, from: { scale: 0.9, y: 8 }, stagger: 0.06, ease: "back.out(1.5)" },
        // 2 · the chip — note it now rides in WITH the tiles rather than landing
        // after them, which is what came back from the tuning panel
        label: { at: 0, duration: 0.7, from: { scale: 0.44, y: 6 } },
        labelOut: { at: 2.05, duration: 0.3, scale: 0.94 },
        // 3 · the handoff — the chip gives way to the mark, and the borders light
        core: { at: 2.25, duration: 0.45, from: { scale: 0.66 }, ease: "back.out(1.7)" },
        light: { at: 2, duration: 2.3, spread: 3, ease: "power2.out" },
        // centre-out
        plate: { at: 5.05, duration: 3, ease: "power2.out" },
        // held until the last chord has landed
        grid: { at: 0, duration: 1.2 },
        // the floor is there from the first frame
        // The lattice is periodic, so sliding it by exactly one cell returns it to
        // itself — an endless floor rather than a loop that visibly restarts. Both
        // isometric axes and the cell pitch are measured off the artwork. The
        // diamond outline is split out and left standing: it is the floor's
        // silhouette, not part of the repeating pattern.
        // axis picks WHICH diagonal the floor slides along, reverse picks which way
        // along it:  1 = up-left / down-right,  2 = up-right / down-left.
        // This is bottom-left.
        gridDrift: { enabled: true, speed: 10, axis: 2, reverse: true },
        // speed in SVG units/sec
        // 4 · the point of the whole thing — everything radiates out of the mark.
        // Two of the six lines run straight THROUGH it rather than stopping at it,
        // so they grow from that crossing point in both directions at once; the
        // rest draw from whichever end is nearer, whatever direction Figma
        // authored them in. Order is by distance from the mark, not DOM order.
        // centreSplit = how close a line has to pass to count as going through it.
        // The 4 arms off the mark are the two through-lines drawing outward. The
        // other 4 are chords between outer tiles: they run the other way and wait
        // for the arms to be out before they start.
        lines: {
          at: 2.6,
          duration: 1.6,
          stagger: 0.1,
          ease: "power2.inOut",
          fadeIn: 0.2,
          centreSplit: 14,
          chordReverse: true,
          // draw the outer 4 from the far end instead
          chordDelay: 0.35
          // extra beat before the chords follow the arms
        },
        // ambient — a packet running back down each line into the core, so the
        // connections read as live rather than as a finished diagram
        pulse: {
          enabled: false,
          tint: "#FF99E1",
          strokeWidth: 1.6,
          length: 26,
          // dash length in SVG units
          duration: 1.1,
          // one traverse
          stagger: 0.18,
          fadeOut: 0.25,
          cycleDelay: 1.4
        },
        breathe: { enabled: false, scale: 1.03, duration: 2.6, ease: "sine.inOut" }
      },
      // 8 · Connected systems + agents ---------------------------------------
      agents: {
        timeScale: 1,
        panel: { at: 0, duration: 0.7, from: { scale: 0.99 }, ease: "power2.out" },
        mark: { at: 0.1, duration: 0.55, from: { scale: 0.88 }, ease: "back.out(1.7)" },
        // the agent chips sit in the mark's negative space, so they land after it
        chips: { at: 0.5, duration: 0.45, from: { y: 8, scale: 0.75 }, stagger: 0.08, ease: "back.out(2.4)" },
        // the systems arrive centre-out: distance from the mark drives the delay,
        // so the ring expands rather than a sorted list running top to bottom.
        // Each card is nudged toward the mark to start, so it reads as emitted.
        cards: { at: 0.72, duration: 0.62, spread: 0.5, from: { dist: 12, scale: 0.94 }, ease: "back.out(1.4)" },
        // the checklist fills in behind each card. `at` is relative to that card's
        // own entrance, so every card carries its rows with it wherever the
        // centre-out wave puts it.
        rows: { at: 0.2, duration: 0.4, stagger: 0.055, from: { x: -6 } },
        // Figma's connectors are dashed, so the entrance cannot use the path's own
        // dashoffset — that slot belongs to the crawl. Each line is revealed by a
        // white wipe travelling out from the mark inside a mask instead, which
        // leaves the authored 4/4 pattern intact.
        lines: { at: 1.3, duration: 0.9, stagger: 0.09, ease: "power2.inOut", wipeWidth: 10 },
        // ambient — the dashes crawl from the moment the illustration enters, not
        // after the reveal: the lines are masked until their wipe runs, so the
        // motion is simply invisible until then and is already up to speed when
        // the line appears. 'in' runs them toward the mark, whichever way Figma
        // authored the path.
        crawl: { enabled: true, speed: 9, direction: "in" },
        // SVG units per second
        breathe: { enabled: true, scale: 1.03, duration: 3.4, ease: "sine.inOut" }
      },
      // 10 · Warehouse hero (v2, 2026-09-23) --------------------------------------
      // Nathan's redraw: four source plates over a glass warehouse, a stack of data
      // cubes inside it, a lid carrying the HI mark, two loose sources plugged in
      // from the sides. The floor and the conduits are the same mechanisms as v1
      // (systems drift, agents wipe + crawl); the cube fill and the lid are new.
      //
      // The export arrives with Figma's throwaway names (Vector_12…), so the
      // builder finds every part by SHAPE — see BUILD['warehouse-hero'].
      //
      // Order (Tom, 2026-09-23, third pass): floor + base -> the cubes -> the side
      // boxes plug in -> the WRAPPER forms around the stack (walls, HI lid + mark,
      // the dotted lines on its edges) -> the chips and the source plates last.
      // Every `at` below is ordered that way.
      "warehouse-hero": {
        timeScale: 1,
        // the floor is there from the first frame, like systems
        grid: { at: 0, duration: 1.2 },
        gridDrift: { enabled: true, speed: 10, axis: 2, reverse: true },
        // ground, not cargo — lands early
        slab: { at: 0.2, duration: 0.8, from: { y: 12, scale: 0.985 }, ease: "power2.out" },
        // 5 · the sources rise into place last, with the chips. Each plate
        // carries its own logo. Positive y = comes up from below.
        plates: { at: 2.8, duration: 0.62, from: { y: 16, scale: 0.94 }, stagger: 0.11, ease: "back.out(1.4)" },
        // 4b · the dotted edges of the wrapper grow up with it
        lines: { at: 2.25, duration: 0.9, stagger: 0.08, ease: "power2.inOut", wipeWidth: 8, flow: "up" },
        // 4 · the wrapper, drawn not slid: once the lid is there, the walls'
        // outline draws down from its corners (both sides at once, meeting at
        // the front bottom corner) while the glass fill fades in behind it
        shell: { at: 2, duration: 0.7, ease: "power2.inOut" },
        // 2 · the cubes, lowest first, straight onto the base
        cubes: { at: 0.45, duration: 0.45, from: { y: -14 }, stagger: 0.03, ease: "back.out(1.2)" },
        // 4a · the lid (the logo plate) spawns on its own, in place, then the mark
        lid: { at: 2.15, duration: 0.6, from: { scale: 0.9 }, ease: "back.out(1.4)" },
        logo: { at: 2.5, duration: 0.45, from: { scale: 0.62 }, ease: "back.out(1.7)" },
        // 3 · the side boxes slide in along their conduits, then the conduits run
        loose: { at: 1.35, duration: 0.6, travel: 26, stagger: 0.15, ease: "power3.out" },
        ingest: { at: 1.6, duration: 0.8, stagger: 0.06, ease: "power2.inOut", wipeWidth: 8 },
        labels: { at: 2.9, duration: 0.4, from: { y: 6, scale: 0.88 }, stagger: 0.1, ease: "back.out(1.7)" },
        // ── ambient ──────────────────────────────────────────────────────────────
        // diagonals flow into the warehouse, verticals flow `lines.flow`; masked
        // until their wipe runs
        crawl: { enabled: true, speed: 9 },
        // SVG units per second
        // the dashed (not-yet-connected) source plate marches slowly
        pendingCrawl: { enabled: true, speed: 4 },
        // "modeling": one visible cube at a time lights up in the blue the artwork
        // already uses for its resolved cubes, then settles back
        tint: { enabled: true, color: "#5E93ED", duration: 0.5, hold: 0.9, gap: 0.35 },
        // Every upward move is capped at the node's own distance from the top of
        // the frame, minus this. The back plate sits at y = 0.5.
        edgeGuard: 1,
        plateFloat: { enabled: true, y: -7, duration: 2.4, stagger: 0.38, ease: "sine.inOut" },
        looseFloat: { enabled: true, y: -4, duration: 3.1, stagger: 0.45, ease: "sine.inOut" }
      },
      // 11 · Warehouse models ---------------------------------------------------
      // Four source apps feed one resolved-entity panel. The whole point of the
      // piece is the correspondence: a packet leaves an app, travels its line, and
      // the row that app owns is lit the entire time it is in flight — so you can
      // see the dot and its destination at once. Everything else (radar rings,
      // panel, rows) is scaffolding for that one reading.
      //
      // Nothing here is hard-coded to Nathan's four apps: the sources come from the
      // `*-part` groups, the packet count and each packet's phase are read off
      // wherever Figma parked the dots, and rows are paired to sources by the logo
      // layer they carry. A re-export with a fifth app needs no code change.
      "warehouse-models": {
        timeScale: 1,
        // 1 · the radar rings, outermost first — they are the ground, not content
        rings: { at: 0, duration: 0.9, from: { scale: 0.88 }, stagger: -0.06, ease: "power2.out" },
        // 2 · the panel, then its header
        panel: { at: 0.15, duration: 0.7, from: { scale: 0.97 }, ease: "power2.out" },
        head: { at: 0.42, duration: 0.5, from: { y: -6 } },
        // 3 · the rows. `order` is 'top' (top row first, reading order) or 'bottom'
        //     (the order Figma authored them in, which is bottom-up).
        rows: { at: 0.55, duration: 0.55, from: { y: 10 }, stagger: 0.09, order: "top", ease: "power2.out" },
        // 4 · the conclusion chip sits above the panel, so it lands last
        label: { at: 0.95, duration: 0.45, from: { scale: 0.86 }, ease: "back.out(1.7)" },
        // 5 · the sources arrive once there is something for them to feed
        sources: { at: 1, duration: 0.55, from: { scale: 0.8 }, stagger: 0.08, ease: "back.out(1.5)" },
        // 6 · the lines grow out of the apps toward the panel. Same trick as agents
        //     and warehouse-hero: the artwork's 1.5/3 dash pattern is left alone and
        //     a white wipe travels inside a mask, because the dashoffset slot
        //     belongs to the crawl. Direction is derived per line (which endpoint is
        //     nearer the panel), so Figma can author them either way round.
        lines: { at: 1.15, duration: 0.8, stagger: 0.08, ease: "power2.inOut", wipeWidth: 6 },
        // ── ambient ────────────────────────────────────────────────────────────
        // The packet flow. One source at a time, in artwork order unless `order`
        // names them — the row highlight only means anything if there is exactly
        // one row lit.
        flow: {
          enabled: true,
          travel: 1.8,
          // seconds for a packet to cross its line
          spread: 0.5,
          // Figma's dot spacing, as a fraction of `travel`, becomes the launch gap
          hold: 0.5,
          // how long the row stays lit after the last packet lands
          gap: 0.3,
          // dead air before the next source fires
          fade: 0.2,
          // packet fade-in / fade-out
          dotScale: 1,
          // resting size of a travelling packet
          landScale: 2.3,
          // it flares as it reaches the panel
          // The travel ease. 'none' is constant speed, which reads mechanical over a
          // short line; the house ease loads up and releases, so the packet has a
          // direction it is being sent in rather than just sliding.
          ease: "osmo",
          launchEase: "back.out(2.4)",
          // the pop as it leaves the source
          landEase: "power3.in",
          // the flare as it meets the panel
          order: [],
          // [] = artwork order, or e.g. ['workday', 'lattice', 'greenhouse', 'slack']
          // Nathan's frame ships a Slack source with no Slack row and a Carta row
          // with no source. true pairs the leftovers off so every line lands
          // somewhere; false leaves Slack firing at no row at all.
          pairFallback: true
        },
        // What "lit" looks like. rowIdle: 1 turns the dimming off entirely and
        // leaves only the dots and brackets to carry the highlight.
        // What "lit" looks like, and — more to the point — how it gets there. The
        // row wakes as the packets LEAVE, the brackets follow it, and the row's own
        // two endpoint dots only take the colour once a packet has actually LANDED,
        // near side first. Nothing scales: at card width a growing dot reads as a
        // glitch, a colour change reads as state.
        // Asymmetric by design — in is fast and springy, out is slow and soft, which
        // is what stops a repeating cycle feeling metronomic.
        highlight: {
          rowIdle: 0.45,
          inDuration: 0.24,
          inEase: "power3.out",
          outDuration: 0.55,
          outEase: "power2.inOut",
          bracketLag: 0.08,
          // brackets darken just behind the row
          dotColor: "#333342",
          // matches the packet — the row wears what landed on it
          dotDuration: 0.16,
          dotLead: 0.13,
          // near dot flips on arrival, far dot this much later
          bracketColor: "#333342",
          bracketCrawl: true,
          crawlSpeed: 11
          // SVG units per second, up the row brackets toward the head
        },
        // The source lines crawl from the moment it enters — they are masked until
        // their wipe runs, so it is invisible until then and already up to speed.
        crawl: { enabled: true, speed: 5 }
        // SVG units per second, toward the panel
      },
      // 12 · Profile match — MVP -----------------------------------------------
      // ⚠ MVP / NOT FINAL. Two things are placeholders waiting on the client:
      //    · deck.rows is MY reading of which profile row each app card owns. Only
      //      Workday -> Org graph is actually stated by the artwork.
      //    · the fourth row (Data Access) has no source card yet.
      // Everything else is production shape — the mapping is one line to change.
      // A deck of app cards feeds one Human Intelligence profile. The deck rotates
      // forever — each app takes its turn at the front — and while a card is at the
      // front, the profile row that app owns is lit. Packets rain down the three
      // conduits the whole time.
      //
      // The two things that will actually change here are `deck.rows` (the client
      // tells us which row each card lights) and the number of cards. Both are
      // config, not code: the slots, the widths and the packet phases are all read
      // off the artwork, so Nathan adding a fourth card needs one more number.
      "profile-match": {
        timeScale: 1,
        rings: { at: 0, duration: 0.9, from: { scale: 0.9 }, stagger: -0.07, ease: "power2.out" },
        // the profile is the destination, so it is there before anything feeds it
        profile: { at: 0.1, duration: 0.7, from: { y: 14, scale: 0.98 }, ease: "power2.out" },
        rows: { at: 0.45, duration: 0.5, from: { x: -10 }, stagger: 0.08, ease: "power2.out" },
        // the deck lands back to front, so the featured card arrives last
        cards: { at: 0.75, duration: 0.6, from: { y: -14, scale: 0.97 }, stagger: 0.1, ease: "back.out(1.3)" },
        // Conduits. Same trick as agents / warehouse-models: the artwork's 1.5/3
        // dash pattern is left alone and a white wipe travels inside a mask,
        // because the dashoffset slot belongs to the crawl. Only the ~60 units
        // between the deck and the profile are ever visible — the cards cover the
        // rest — which is also why the packet loop can teleport without showing.
        lines: { at: 1.05, duration: 0.6, stagger: 0.07, ease: "power2.inOut", wipeWidth: 5 },
        // ── the deck ───────────────────────────────────────────────────────────
        deck: {
          enabled: true,
          step: 3.2,
          // dwell at the front before the stack advances again
          moveDuration: 0.75,
          // travel between slots
          ease: "power2.inOut",
          lift: 34,
          // how far the front card carries on before it is recycled
          // WHICH PROFILE ROW EACH CARD LIGHTS.
          // One entry per app card, in the order they are stacked in the artwork,
          // BACK to FRONT. The number is the profile row, 1-based, top to bottom.
          // Today that is Greenhouse / Lattice / Workday against
          // Metrics & fields · People & roles · Org graph · Data Access.
          // A fourth card → a fourth number. Anything missing just cycles the rows.
          rows: [2, 1, 3]
        },
        // ── the packets ────────────────────────────────────────────────────────
        // One wave per dwell, fired by the card that just reached the front — this
        // is that card's data going down, not an ambient waterfall. The conduits
        // are empty between dwells on purpose: it is what makes the packets belong
        // to a source. Each packet keeps the position Figma parked it at as its
        // launch offset, so the spacing in the artwork is the spacing on screen.
        flow: {
          enabled: true,
          travel: 1.5,
          // seconds for one packet to cross, deck to profile
          spread: 0.55,
          // Figma's packet spacing, as a fraction of travel
          fade: 0.18,
          // both ends are under a card, so this only has to be quick
          ease: "none"
        },
        // Lit = the row takes the accent the artwork already uses for its own lit
        // row, read off the artwork rather than hard-coded, plus whatever trailing
        // label that row carries. Nothing moves and nothing scales: at this size a
        // colour change reads as state and anything else reads as a glitch.
        highlight: {
          accent: "#40BE88",
          // fallback only — the real one comes from the artwork
          inDuration: 0.28,
          inEase: "power3.out",
          outDuration: 0.45,
          outEase: "power2.inOut"
        },
        crawl: { enabled: true, speed: 6 }
        // dash crawl, SVG units per second
      },
      // 13 · Audit logging — three stacked log rows ----------------------------
      // No ambient loop: three cards, one entrance, nothing that keeps running.
      "audit-logging": {
        timeScale: 1,
        // Rows are ordered by where they sit in the artwork, not by Figma's stack
        // order (which is bottom-up). `order`: 'top' | 'bottom' | 'dom'.
        rows: {
          order: "top",
          at: 0,
          duration: 0.55,
          stagger: 0.11,
          from: { y: 14, x: -10 }
        },
        // The permitted/blocked dot pops once its own row has landed — the one
        // accent in an otherwise flat card, so it carries the whole read.
        dot: {
          enabled: true,
          lag: 0.3,
          // after that row's own start
          duration: 0.4,
          ease: "back.out(3)"
        }
      },
      // 14 · Audit logging 2 — table, then a filter being set --------------------
      // One scripted beat: the table lands, the filter button and its dropdown
      // arrive, and the cursor walks in and ticks the first choice. Entrance only.
      "audit-logging-2": {
        timeScale: 1,
        header: { at: 0, duration: 0.5, from: { y: 8 } },
        rows: { at: 0.12, duration: 0.5, stagger: 0.08, from: { y: 10 } },
        button: { at: 0.8, duration: 0.45, from: { y: -6 } },
        // the panel opens downward off its own top edge, then the choices fill in
        dropdown: { at: 1.05, duration: 0.5, from: { y: -10 } },
        choices: { at: 1.2, duration: 0.4, stagger: 0.07, from: { y: -6 } },
        cursor: { at: 1.65, duration: 0.65, from: { x: 46, y: 58 } },
        // scale dips about the arrow tip, so it reads as a press rather than a shrink
        press: { enabled: true, at: 2.2, scale: 0.88, dip: 0.1, rebound: 0.2 },
        // the tick lands on the bottom of the dip
        check: { fade: 0.12, lag: 0.04, duration: 0.35, ease: "back.out(2.6)" }
      },
      // 15 · Audit logging tabs — one filter result per tab ---------------------
      // Both tabs are the same component with different rows, so they share this
      // block. They live inside the tab crossfade, so the entrance is replayed on
      // activation rather than played once on scroll — see replay() below.
      "audit-logging-tab-1": {
        timeScale: 1,
        header: { at: 0, duration: 0.45, from: { y: -8 } },
        rows: { at: 0.14, duration: 0.5, stagger: 0.08, from: { y: 12 } },
        dot: { enabled: true, lag: 0.28, duration: 0.4, ease: "back.out(3)" }
      }
    };
    var SCENES = (
      /*SCENES:BEGIN*/
      {
        "agents-hero": {
          "timeScale": 1,
          "tracks": {
            "frame": {
              "preset": "fade",
              "at": 0,
              "duration": 0.8,
              "targets": "agents-frame, agents-border"
            },
            "agents": {
              "preset": "from-bottom",
              "at": 0.15,
              "duration": 0.6,
              "targets": "agent-item*",
              "stagger": 0.12,
              "distance": 16
            },
            "shield": {
              "preset": "pop",
              "at": 0.55,
              "duration": 0.7,
              "scale": 0.8
            },
            "lines": {
              "preset": "fade",
              "at": 0.85,
              "duration": 0.5,
              "targets": "line*",
              "stagger": 0.06
            },
            "apps": {
              "preset": "pop",
              "at": 0.95,
              "duration": 0.55,
              "targets": "app-box*",
              "stagger": 0.07,
              "scale": 0.85
            },
            "dots": {
              "preset": "travel",
              "at": 0,
              "duration": 2.4,
              "targets": "line*",
              "stagger": 0.4,
              "towards": "up"
            }
          }
        },
        "act": {
          "timeScale": 1,
          "tracks": {
            "panel": {
              "preset": "from-bottom",
              "at": 0,
              "duration": 0.8,
              "distance": 20
            },
            "logo": {
              "preset": "pop",
              "at": 0.3,
              "duration": 0.5,
              "scale": 0.6
            },
            "nav": {
              "preset": "from-left",
              "at": 0.35,
              "duration": 0.45,
              "stagger": 0.04,
              "distance": 6
            },
            "bubble": {
              "preset": "pop",
              "at": 0.55,
              "duration": 0.5,
              "scale": 0.94,
              "origin": "100% 50%"
            },
            "prompt": {
              "preset": "type",
              "at": 0.7,
              "duration": 0.01,
              "stagger": 0.012
            },
            "status": {
              "preset": "fade",
              "at": 0.95,
              "duration": 0.4
            },
            "answer": {
              "preset": "lines",
              "at": 1.3,
              "duration": 0.55,
              "stagger": 0.12,
              "distance": 6
            }
          }
        },
        "orchestrate": {
          "timeScale": 1,
          "tracks": {
            "panel": {
              "preset": "from-bottom",
              "at": 0,
              "duration": 0.8,
              "distance": 20
            },
            "title": {
              "preset": "fade",
              "at": 0.2,
              "duration": 0.4
            },
            "avatar": {
              "preset": "pop",
              "at": 0.45,
              "duration": 0.5,
              "scale": 0.7
            },
            "sender": {
              "preset": "from-left",
              "at": 0.55,
              "duration": 0.45,
              "stagger": 0.06,
              "distance": 6
            },
            "message": {
              "preset": "lines",
              "at": 0.55,
              "duration": 0.5,
              "stagger": 0.1,
              "distance": 6
            },
            "checks": {
              "preset": "lines",
              "at": 0.55,
              "duration": 0.3,
              "stagger": 0.1,
              "distance": 6
            },
            "accent": {
              "preset": "grow-y",
              "at": 1.15,
              "duration": 0.5
            },
            "question": {
              "preset": "lines",
              "at": 1.6,
              "duration": 0.45,
              "distance": 6
            },
            "buttons": {
              "preset": "pop",
              "at": 1.8,
              "duration": 0.45,
              "targets": "send, pick",
              "stagger": 0.08,
              "scale": 0.9
            }
          }
        },
        "understand": {
          "timeScale": 1,
          "tracks": {
            "panel": {
              "preset": "from-bottom",
              "at": 0,
              "duration": 0.8,
              "distance": 20
            },
            "logo": {
              "preset": "pop",
              "at": 0.3,
              "duration": 0.5,
              "scale": 0.6
            },
            "nav": {
              "preset": "from-left",
              "at": 0.35,
              "duration": 0.45,
              "stagger": 0.04,
              "distance": 6
            },
            "card": {
              "preset": "from-top",
              "at": 0.45,
              "duration": 0.75,
              "distance": 16
            },
            "avatar": {
              "preset": "pop",
              "at": 0.7,
              "duration": 0.5,
              "scale": 0.6
            },
            "name": {
              "preset": "lines",
              "at": 0.8,
              "duration": 0.4,
              "distance": 4
            },
            "role": {
              "preset": "lines",
              "at": 0.9,
              "duration": 0.4,
              "distance": 4
            },
            "badge": {
              "preset": "pop",
              "at": 1.05,
              "duration": 0.45,
              "scale": 0.9,
              "origin": "0% 50%"
            },
            "bubble": {
              "preset": "pop",
              "at": 1.05,
              "duration": 0.5,
              "scale": 0.94,
              "origin": "0% 50%"
            },
            "prompt": {
              "preset": "type",
              "at": 1.05,
              "duration": 0.4,
              "stagger": 0.012
            },
            "status": {
              "preset": "fade",
              "at": 1.3,
              "duration": 0.6
            },
            "answer": {
              "preset": "lines",
              "at": 1.85,
              "duration": 0.55,
              "stagger": 0.12,
              "distance": 6
            }
          }
        },
        "access-follows-the-person": {
          "timeScale": 1,
          "tracks": {
            "panel": {
              "preset": "from-bottom",
              "at": 0,
              "duration": 0.8,
              "distance": 20
            },
            "logo": {
              "preset": "pop",
              "at": 0.3,
              "duration": 0.5,
              "scale": 0.6
            },
            "nav": {
              "preset": "from-left",
              "at": 0.35,
              "duration": 0.45,
              "stagger": 0.04,
              "distance": 6
            },
            "card": {
              "preset": "from-top",
              "at": 0.5,
              "duration": 0.7,
              "distance": 16
            },
            "avatar": {
              "preset": "pop",
              "at": 0.75,
              "duration": 0.5,
              "scale": 0.6
            },
            "name": {
              "preset": "lines",
              "at": 0.85,
              "duration": 0.4,
              "distance": 4
            },
            "role": {
              "preset": "lines",
              "at": 0.95,
              "duration": 0.4,
              "distance": 4
            },
            "bubble": {
              "preset": "pop",
              "at": 0.95,
              "duration": 0.5,
              "scale": 0.94,
              "origin": "100% 50%"
            },
            "prompt": {
              "preset": "type",
              "at": 1.2,
              "duration": 0.05,
              "stagger": 0.012
            },
            "status": {
              "preset": "fade",
              "at": 1.55,
              "duration": 0.4
            },
            "answer": {
              "preset": "lines",
              "at": 1.55,
              "duration": 0.55,
              "stagger": 0.14,
              "distance": 6
            }
          }
        },
        "every-action-is-auditable": {
          "timeScale": 1,
          "tracks": {
            "panel": {
              "preset": "from-bottom",
              "at": 0,
              "duration": 0.8,
              "distance": 20
            },
            "logo": {
              "preset": "pop",
              "at": 0.3,
              "duration": 0.5,
              "scale": 0.6
            },
            "nav": {
              "preset": "from-left",
              "at": 0.35,
              "duration": 0.45,
              "stagger": 0.04,
              "distance": 6
            },
            "card": {
              "preset": "from-top",
              "at": 0.5,
              "duration": 0.7,
              "distance": 16
            },
            "avatar": {
              "preset": "pop",
              "at": 0.75,
              "duration": 0.5,
              "scale": 0.6
            },
            "name": {
              "preset": "lines",
              "at": 0.85,
              "duration": 0.4,
              "distance": 4
            },
            "role": {
              "preset": "lines",
              "at": 0.95,
              "duration": 0.4,
              "distance": 4
            },
            "badges": {
              "preset": "pop",
              "at": 1.1,
              "duration": 0.45,
              "targets": "badge, badge_2",
              "stagger": 0.12,
              "scale": 0.9,
              "origin": "0% 50%"
            },
            "bubble": {
              "preset": "pop",
              "at": 1.3,
              "duration": 0.5,
              "scale": 0.94,
              "origin": "100% 50%"
            },
            "prompt": {
              "preset": "type",
              "at": 1.35,
              "duration": 0.05,
              "stagger": 0.012
            },
            "status": {
              "preset": "fade",
              "at": 1.6,
              "duration": 0.4
            },
            "answer": {
              "preset": "lines",
              "at": 1.85,
              "duration": 0.55,
              "stagger": 0.14,
              "distance": 6
            }
          }
        },
        "definitions-stay-consistent": {
          "timeScale": 1,
          "tracks": {
            "window": {
              "preset": "from-bottom",
              "at": 0,
              "duration": 0.8,
              "distance": 20
            },
            "logo": {
              "preset": "pop",
              "at": 0.3,
              "duration": 0.5,
              "scale": 0.6
            },
            "nav": {
              "preset": "from-left",
              "at": 0.35,
              "duration": 0.45,
              "stagger": 0.05,
              "distance": 6
            },
            "bubble": {
              "preset": "pop",
              "at": 0.55,
              "duration": 0.5,
              "scale": 0.94,
              "origin": "100% 50%"
            },
            "prompt": {
              "preset": "type",
              "at": 0.7,
              "duration": 0.05,
              "stagger": 0.015
            },
            "status": {
              "preset": "fade",
              "at": 1.2,
              "duration": 0.4
            },
            "answer": {
              "preset": "lines",
              "at": 1.3,
              "duration": 0.55,
              "stagger": 0.12,
              "distance": 6
            },
            "window_2": {
              "preset": "from-bottom",
              "at": 1.45,
              "duration": 0.8,
              "distance": 28
            },
            "logo_2": {
              "preset": "pop",
              "at": 1.65,
              "duration": 0.5,
              "scale": 0.6
            },
            "nav_2": {
              "preset": "from-left",
              "at": 1.8,
              "duration": 0.45,
              "stagger": 0.05,
              "distance": 6
            },
            "bubble_2": {
              "preset": "pop",
              "at": 1.95,
              "duration": 0.5,
              "scale": 0.94,
              "origin": "100% 50%"
            },
            "prompt_2": {
              "preset": "type",
              "at": 2.05,
              "duration": 0.05,
              "stagger": 0.015
            },
            "answer_2": {
              "preset": "lines",
              "at": 2.1,
              "duration": 0.55,
              "stagger": 0.12,
              "distance": 6
            }
          }
        },
        "policies-follow-the-data": {
          "timeScale": 1,
          "tracks": {
            "table": {
              "preset": "from-bottom",
              "at": 0,
              "duration": 0.8,
              "distance": 20
            },
            "header": {
              "preset": "fade",
              "at": 0.15,
              "duration": 0.45,
              "stagger": 0.04
            },
            "rows": {
              "preset": "from-bottom",
              "at": 0.15,
              "duration": 0.55,
              "targets": "row, row_2, row_3, row_4, row_5, row_6",
              "stagger": 0.09,
              "distance": 10
            }
          }
        },
        "semantic-hero": {
          "timeScale": 1,
          "tracks": {
            "header": {
              "preset": "fade",
              "at": 0,
              "duration": 0.4
            },
            "row": {
              "preset": "from-bottom",
              "at": 0.1,
              "duration": 0.5,
              "stagger": 0.06,
              "distance": 10
            },
            "drawer": {
              "preset": "from-right",
              "at": 0.5,
              "duration": 0.6,
              "distance": 40
            },
            "metric": {
              "preset": "lines",
              "at": 0.62,
              "duration": 0.35,
              "stagger": 0,
              "distance": 6
            },
            "people": {
              "preset": "from-bottom",
              "at": 0.65,
              "duration": 0.35,
              "stagger": 0.03,
              "distance": 6
            },
            "status": {
              "preset": "fade",
              "at": 0.68,
              "duration": 0.3
            },
            "status-dot": {
              "preset": "pop",
              "at": 0.74,
              "duration": 0.35,
              "scale": 0,
              "ease": "back.out(3)"
            },
            "calc-label": {
              "preset": "fade",
              "at": 0.7,
              "duration": 0.3
            },
            "calc": {
              "preset": "lines",
              "at": 0.72,
              "duration": 0.35,
              "stagger": 0.04,
              "distance": 6
            },
            "segments-label": {
              "preset": "fade",
              "at": 0.76,
              "duration": 0.3
            },
            "segments": {
              "preset": "pop",
              "at": 0.77,
              "duration": 0.35,
              "scale": 0.97,
              "origin": "50% 0%"
            },
            "segment-row": {
              "preset": "from-top",
              "at": 0.8,
              "duration": 0.3,
              "stagger": 0.03,
              "distance": 6
            },
            "sql-label": {
              "preset": "fade",
              "at": 0.83,
              "duration": 0.3
            },
            "sql": {
              "preset": "from-bottom",
              "at": 0.84,
              "duration": 0.35,
              "distance": 10
            },
            "sql-line": {
              "preset": "type",
              "at": 0.9,
              "duration": 0.04,
              "stagger": 8e-3
            }
          }
        },
        "semantic-feature-1": {
          "timeScale": 1,
          "tracks": {
            "window": {
              "preset": "from-bottom",
              "at": 0,
              "duration": 0.8,
              "distance": 20
            },
            "logo": {
              "preset": "pop",
              "at": 0.3,
              "duration": 0.5,
              "scale": 0.6
            },
            "nav": {
              "preset": "from-left",
              "at": 0.35,
              "duration": 0.45,
              "stagger": 0.05,
              "distance": 6
            },
            "bubble": {
              "preset": "pop",
              "at": 0.55,
              "duration": 0.5,
              "scale": 0.94,
              "origin": "100% 50%"
            },
            "prompt": {
              "preset": "type",
              "at": 0.7,
              "duration": 0.05,
              "stagger": 0.015
            },
            "status": {
              "preset": "fade",
              "at": 0.95,
              "duration": 0.4
            },
            "answer": {
              "preset": "lines",
              "at": 1.15,
              "duration": 0.55,
              "stagger": 0.12,
              "distance": 6
            },
            "window_2": {
              "preset": "from-bottom",
              "at": 1.6,
              "duration": 0.8,
              "distance": 28
            },
            "logo_2": {
              "preset": "pop",
              "at": 1.9,
              "duration": 0.5,
              "scale": 0.6
            },
            "nav_2": {
              "preset": "from-left",
              "at": 2.05,
              "duration": 0.45,
              "stagger": 0.05,
              "distance": 6
            },
            "bubble_2": {
              "preset": "pop",
              "at": 2.55,
              "duration": 0.5,
              "scale": 0.94,
              "origin": "100% 50%"
            },
            "prompt_2": {
              "preset": "type",
              "at": 2.7,
              "duration": 0.05,
              "stagger": 0.015
            },
            "answer_2": {
              "preset": "lines",
              "at": 2.7,
              "duration": 0.55,
              "stagger": 0.12,
              "distance": 6
            }
          }
        },
        "semantic-feature-2": {
          "timeScale": 1,
          "tracks": {
            "tab": {
              "preset": "from-top",
              "at": 0,
              "duration": 0.5,
              "distance": 8
            },
            "question-box": {
              "preset": "pop",
              "at": 0.15,
              "duration": 0.5,
              "scale": 0.96,
              "origin": "0% 0%"
            },
            "question": {
              "preset": "type",
              "at": 0.35,
              "duration": 0.05,
              "stagger": 0.012
            },
            "connector": {
              "preset": "draw",
              "at": 0.85,
              "duration": 0.6,
              "targets": "connector, connector_2, connector_3",
              "dir": "down"
            },
            "caps": {
              "preset": "fade",
              "at": 0.9,
              "duration": 0.3,
              "targets": "cap, cap_2, cap_3"
            },
            "match-label": {
              "preset": "fade",
              "at": 1.4,
              "duration": 0.4
            },
            "run-label": {
              "preset": "fade",
              "at": 1.4,
              "duration": 0.4,
              "targets": "run-label, run-label_2"
            },
            "cards": {
              "preset": "from-bottom",
              "at": 1.45,
              "duration": 0.55,
              "targets": "match, sql, sql_2",
              "distance": 8
            },
            "chip": {
              "preset": "pop",
              "at": 1.7,
              "duration": 0.45,
              "stagger": 0.08,
              "scale": 0.85
            },
            "panel": {
              "preset": "fade",
              "at": 1.6,
              "duration": 0.6
            },
            "sql-text": {
              "preset": "type",
              "at": 1.8,
              "duration": 0.05,
              "targets": "sql-text, sql-text_2",
              "stagger": 8e-3
            },
            "badge": {
              "preset": "pop",
              "at": 2.6,
              "duration": 0.5,
              "scale": 0.8,
              "origin": "0% 50%",
              "ease": "back.out(1.7)"
            },
            "dots": {
              "preset": "travel",
              "at": 0,
              "duration": 2.2,
              "targets": "connector, connector_2, connector_3, dot, dot_2, dot_3",
              "stagger": 0.45,
              "fadeEdge": 0.06,
              "towards": "down"
            }
          }
        },
        "semantic-feature-3": {
          "timeScale": 1,
          "tracks": {
            "label": {
              "preset": "fade",
              "at": 0,
              "duration": 0.4
            },
            "code": {
              "preset": "from-bottom",
              "at": 0.1,
              "duration": 0.7,
              "distance": 16
            },
            "code-head": {
              "preset": "fade",
              "at": 0.4,
              "duration": 0.4
            },
            "code-line": {
              "preset": "from-left",
              "at": 0.5,
              "duration": 0.4,
              "stagger": 0.09,
              "distance": 6
            },
            "hi-label": {
              "preset": "fade",
              "at": 1.65,
              "duration": 0.4
            },
            "modal": {
              "preset": "from-bottom",
              "at": 1.45,
              "duration": 0.7,
              "distance": 24
            },
            "field": {
              "preset": "from-bottom",
              "at": 1.45,
              "duration": 0.45,
              "stagger": 0.1,
              "distance": 8
            },
            "value": {
              "preset": "type",
              "at": 1.45,
              "duration": 0.05,
              "stagger": 0.015
            },
            "segments-label": {
              "preset": "fade",
              "at": 1.45,
              "duration": 0.4
            },
            "segment": {
              "preset": "from-bottom",
              "at": 1.45,
              "duration": 0.45,
              "stagger": 0.1,
              "distance": 8
            },
            "button": {
              "preset": "pop",
              "at": 1.45,
              "duration": 0.5,
              "scale": 0.92
            }
          }
        },
        "semantic-feature-4": {
          "timeScale": 1,
          "tracks": {
            "frame": {
              "preset": "fade",
              "at": 0,
              "duration": 0.6
            },
            "title": {
              "preset": "lines",
              "at": 0.15,
              "duration": 0.45,
              "distance": 6
            },
            "description": {
              "preset": "fade",
              "at": 0.3,
              "duration": 0.5
            },
            "table": {
              "preset": "from-bottom",
              "at": 0.35,
              "duration": 0.7,
              "distance": 12
            },
            "header": {
              "preset": "fade",
              "at": 0.5,
              "duration": 0.4
            },
            "row": {
              "preset": "from-bottom",
              "at": 0.55,
              "duration": 0.5,
              "stagger": 0.07,
              "distance": 8
            }
          }
        },
        "mcp-hero": {
          "timeScale": 1,
          "tracks": {
            "card-glow": {
              "preset": "fade",
              "at": 0,
              "duration": 0.6
            },
            "card": {
              "preset": "from-bottom",
              "at": 0.05,
              "duration": 0.6,
              "stagger": 0.08,
              "distance": 12
            },
            "card-cap": {
              "preset": "fade",
              "at": 0.5,
              "duration": 0.3,
              "stagger": 0.05
            },
            "connector": {
              "preset": "draw",
              "at": 0.55,
              "duration": 0.6,
              "dir": "down",
              "stagger": 0.05
            },
            "gate": {
              "preset": "pop",
              "at": 0.95,
              "duration": 0.45,
              "scale": 0.7,
              "stagger": 0.06,
              "ease": "back.out(2)"
            },
            "no-gate": {
              "preset": "fade",
              "at": 1.05,
              "duration": 0.4
            },
            "model-glow": {
              "preset": "fade",
              "at": 1.1,
              "duration": 0.5
            },
            "model": {
              "preset": "from-bottom",
              "at": 1.15,
              "duration": 0.6,
              "distance": 12
            },
            "rail": {
              "preset": "draw",
              "at": 1.45,
              "duration": 0.5,
              "dir": "down",
              "stagger": 0.03
            },
            "row": {
              "preset": "from-bottom",
              "at": 1.5,
              "duration": 0.5,
              "stagger": 0.08,
              "distance": 8
            },
            "row-cap": {
              "preset": "fade",
              "at": 1.7,
              "duration": 0.3,
              "stagger": 0.04
            },
            "dots": {
              "preset": "travel",
              "at": 0,
              "duration": 2.4,
              "targets": "connector, dot",
              "stagger": 0.35,
              "towards": "down"
            }
          }
        },
        "mcp-feature-1": {
          "timeScale": 1,
          "tracks": {
            "window": {
              "preset": "from-bottom",
              "at": 0,
              "duration": 0.65,
              "distance": 20
            },
            "logo": {
              "preset": "pop",
              "at": 0.25,
              "duration": 0.5,
              "scale": 0.6
            },
            "nav": {
              "preset": "from-left",
              "at": 0.3,
              "duration": 0.45,
              "stagger": 0.05,
              "distance": 6
            },
            "card": {
              "preset": "from-top",
              "at": 0.4,
              "duration": 0.55,
              "distance": 16
            },
            "avatar": {
              "preset": "pop",
              "at": 0.6,
              "duration": 0.5,
              "scale": 0.6
            },
            "name": {
              "preset": "lines",
              "at": 0.68,
              "duration": 0.4,
              "distance": 4
            },
            "role": {
              "preset": "lines",
              "at": 0.74,
              "duration": 0.4,
              "distance": 4
            },
            "bubble": {
              "preset": "pop",
              "at": 0.8,
              "duration": 0.5,
              "scale": 0.94,
              "origin": "100% 50%"
            },
            "prompt": {
              "preset": "type",
              "at": 0.9,
              "duration": 0.05,
              "stagger": 0.012
            },
            "status": {
              "preset": "fade",
              "at": 1.1,
              "duration": 0.4
            },
            "answer": {
              "preset": "lines",
              "at": 1.3,
              "duration": 0.55,
              "stagger": 0.12,
              "distance": 6
            },
            "window_2": {
              "preset": "from-bottom",
              "at": 1.45,
              "duration": 0.65,
              "distance": 24
            },
            "logo_2": {
              "preset": "pop",
              "at": 1.65,
              "duration": 0.5,
              "scale": 0.6
            },
            "nav_2": {
              "preset": "from-left",
              "at": 1.75,
              "duration": 0.45,
              "stagger": 0.05,
              "distance": 6
            },
            "card_2": {
              "preset": "from-top",
              "at": 1.85,
              "duration": 0.55,
              "distance": 16
            },
            "avatar_2": {
              "preset": "pop",
              "at": 1.95,
              "duration": 0.5,
              "scale": 0.6
            },
            "name_2": {
              "preset": "lines",
              "at": 2.05,
              "duration": 0.4,
              "distance": 4
            },
            "role_2": {
              "preset": "lines",
              "at": 2.2,
              "duration": 0.4,
              "distance": 4
            },
            "bubble_2": {
              "preset": "pop",
              "at": 2.25,
              "duration": 0.5,
              "scale": 0.94,
              "origin": "100% 50%"
            },
            "prompt_2": {
              "preset": "type",
              "at": 2.35,
              "duration": 0.05,
              "stagger": 0.012
            },
            "status_2": {
              "preset": "fade",
              "at": 2.45,
              "duration": 0.4
            },
            "answer_2": {
              "preset": "lines",
              "at": 3.72,
              "duration": 0.55,
              "stagger": 0.12,
              "distance": 6
            }
          }
        },
        "mcp-feature-2": {
          "timeScale": 1,
          "tracks": {
            "label": {
              "preset": "fade",
              "at": 0,
              "duration": 0.4
            },
            "code": {
              "preset": "from-bottom",
              "at": 0.05,
              "duration": 0.7,
              "distance": 14
            },
            "code-line": {
              "preset": "from-left",
              "at": 0.35,
              "duration": 0.4,
              "stagger": 0.07,
              "distance": 6
            },
            "badge": {
              "preset": "pop",
              "at": 0.95,
              "duration": 0.45,
              "scale": 0.9,
              "origin": "0% 50%"
            },
            "connector": {
              "preset": "draw",
              "at": 1.05,
              "duration": 0.55,
              "dir": "down",
              "stagger": 0.06
            },
            "cap": {
              "preset": "fade",
              "at": 1.1,
              "duration": 0.3,
              "stagger": 0.04
            },
            "card": {
              "preset": "from-right",
              "at": 1.35,
              "duration": 0.55,
              "stagger": 0.1,
              "distance": 14
            },
            "bi-label": {
              "preset": "fade",
              "at": 2,
              "duration": 0.4
            },
            "tools": {
              "preset": "fade",
              "at": 2.05,
              "duration": 0.5
            },
            "tool": {
              "preset": "pop",
              "at": 2.15,
              "duration": 0.45,
              "stagger": 0.08,
              "scale": 0.85
            },
            "dots": {
              "preset": "travel",
              "at": 0,
              "duration": 2.2,
              "targets": "connector, dot",
              "stagger": 0.4,
              "towards": "down"
            }
          }
        },
        "mcp-feature-3": {
          "timeScale": 1,
          "tracks": {
            "table": {
              "preset": "from-bottom",
              "at": 0,
              "duration": 0.7,
              "distance": 12
            },
            "header": {
              "preset": "fade",
              "at": 0.25,
              "duration": 0.4
            },
            "row": {
              "preset": "from-bottom",
              "at": 0.3,
              "duration": 0.5,
              "stagger": 0.07,
              "distance": 8
            },
            "code": {
              "preset": "from-top",
              "at": 0.7,
              "duration": 0.7,
              "distance": 16
            },
            "code-head": {
              "preset": "fade",
              "at": 1,
              "duration": 0.4
            },
            "code-line": {
              "preset": "from-left",
              "at": 1.1,
              "duration": 0.4,
              "stagger": 0.08,
              "distance": 6
            }
          }
        },
        "policies-hero": {
          "timeScale": 1,
          "tracks": {
            "logo": {
              "preset": "pop",
              "at": 0,
              "duration": 0.5,
              "stagger": 0.08,
              "scale": 0.8
            },
            "connector": {
              "preset": "draw",
              "at": 0.3,
              "duration": 0.5,
              "dir": "right",
              "stagger": 0.06
            },
            "cap": {
              "preset": "fade",
              "at": 0.35,
              "duration": 0.3,
              "stagger": 0.05
            },
            "shield": {
              "preset": "pop",
              "at": 0.6,
              "duration": 0.55,
              "scale": 0.6,
              "ease": "back.out(2)"
            },
            "card": {
              "preset": "from-right",
              "at": 0.8,
              "duration": 0.6,
              "stagger": 0.1,
              "distance": 24
            },
            "stack": {
              "preset": "cycle",
              "at": 0,
              "duration": 0.7,
              "targets": "card",
              "step": 2.2,
              "moveDuration": 0.7,
              "wrapLift": 70
            }
          }
        },
        "policies-feature-1": {
          "timeScale": 1,
          "tracks": {
            "window": {
              "preset": "from-bottom",
              "at": 0,
              "duration": 0.7,
              "distance": 18
            },
            "logo": {
              "preset": "pop",
              "at": 0.25,
              "duration": 0.5,
              "scale": 0.6
            },
            "nav": {
              "preset": "from-left",
              "at": 0.3,
              "duration": 0.45,
              "stagger": 0.05,
              "distance": 6
            },
            "card": {
              "preset": "from-top",
              "at": 0.4,
              "duration": 0.6,
              "distance": 16
            },
            "avatar": {
              "preset": "pop",
              "at": 0.62,
              "duration": 0.5,
              "scale": 0.6
            },
            "identity": {
              "preset": "lines",
              "at": 0.7,
              "duration": 0.4,
              "stagger": 0.06,
              "distance": 4
            },
            "badge": {
              "preset": "pop",
              "at": 0.85,
              "duration": 0.45,
              "stagger": 0.1,
              "scale": 0.9,
              "origin": "0% 50%"
            },
            "prompts": {
              "preset": "pop",
              "at": 1.1,
              "duration": 0.5,
              "targets": "blocked, allowed",
              "stagger": 0.07,
              "scale": 0.94,
              "origin": "100% 50%"
            },
            "blocked-text": {
              "preset": "tint",
              "at": 1.75,
              "duration": 0.35,
              "from": "#333342",
              "stagger": 0.12
            },
            "strike": {
              "preset": "draw",
              "at": 1.8,
              "duration": 0.4,
              "dir": "right",
              "stagger": 0.12
            }
          }
        },
        "policies-feature-2": {
          "timeScale": 1,
          "tracks": {
            "window": {
              "preset": "from-bottom",
              "at": 0,
              "duration": 0.7,
              "distance": 18
            },
            "logo": {
              "preset": "pop",
              "at": 0.25,
              "duration": 0.5,
              "scale": 0.6
            },
            "nav": {
              "preset": "from-left",
              "at": 0.3,
              "duration": 0.45,
              "stagger": 0.05,
              "distance": 6
            },
            "bubble": {
              "preset": "pop",
              "at": 0.5,
              "duration": 0.5,
              "scale": 0.94,
              "origin": "100% 50%"
            },
            "prompt": {
              "preset": "type",
              "at": 0.65,
              "duration": 0.05,
              "stagger": 0.012
            },
            "hi-mark": {
              "preset": "pop",
              "at": 1.15,
              "duration": 0.5,
              "scale": 0.7
            },
            "alert": {
              "preset": "from-left",
              "at": 2.1,
              "duration": 0.5,
              "distance": 16
            },
            "status": {
              "preset": "fade",
              "at": 1.5,
              "duration": 0.4,
              "stagger": 0.06
            },
            "divider": {
              "preset": "draw",
              "at": 1.6,
              "duration": 0.5,
              "dir": "right"
            },
            "answer-head": {
              "preset": "lines",
              "at": 1.75,
              "duration": 0.45,
              "distance": 5
            },
            "answer": {
              "preset": "lines",
              "at": 1.9,
              "duration": 0.55,
              "stagger": 0.1,
              "distance": 6
            }
          }
        },
        "policies-feature-3": {
          "timeScale": 1,
          "tracks": {
            "panel": {
              "preset": "from-bottom",
              "at": 0,
              "duration": 0.7,
              "distance": 16
            },
            "panel-head": {
              "preset": "lines",
              "at": 0.3,
              "duration": 0.45,
              "stagger": 0.08,
              "distance": 5
            },
            "row": {
              "preset": "from-bottom",
              "at": 0.45,
              "duration": 0.5,
              "stagger": 0.09,
              "distance": 8
            },
            "toggle": {
              "preset": "pop",
              "at": 0.7,
              "duration": 0.4,
              "stagger": 0.09,
              "scale": 0.7,
              "ease": "back.out(2.4)"
            },
            "create": {
              "preset": "from-bottom",
              "at": 0.85,
              "duration": 0.7,
              "distance": 22
            },
            "create-head": {
              "preset": "lines",
              "at": 0.95,
              "duration": 0.4,
              "distance": 5
            },
            "field": {
              "preset": "from-bottom",
              "at": 1.05,
              "duration": 0.45,
              "stagger": 0.1,
              "distance": 8
            },
            "create-button": {
              "preset": "pop",
              "at": 1.25,
              "duration": 0.45,
              "scale": 0.9
            }
          }
        },
        "org-hero": {
          "timeScale": 1,
          "tracks": {
            "pattern": {
              "preset": "fade",
              "at": 0,
              "duration": 0.8
            },
            "card": {
              "preset": "pop",
              "at": 0.1,
              "duration": 0.55,
              "scale": 0.96
            },
            "avatar": {
              "preset": "pop",
              "at": 0.30000000000000004,
              "duration": 0.45,
              "scale": 0.6
            },
            "person": {
              "preset": "from-left",
              "at": 0.3,
              "duration": 0.45,
              "distance": 6
            },
            "window": {
              "preset": "from-bottom",
              "at": 0.3,
              "duration": 0.8,
              "distance": 20
            },
            "logo": {
              "preset": "pop",
              "at": 0.3,
              "duration": 0.5,
              "scale": 0.6
            },
            "nav": {
              "preset": "from-left",
              "at": 0.35,
              "duration": 0.45,
              "stagger": 0.05,
              "distance": 6
            },
            "bubble": {
              "preset": "pop",
              "at": 0.45,
              "duration": 0.5,
              "scale": 0.94,
              "origin": "100% 50%"
            },
            "prompt": {
              "preset": "type",
              "at": 0.55,
              "duration": 0.05,
              "stagger": 0.015
            },
            "status": {
              "preset": "fade",
              "at": 0.85,
              "duration": 0.4
            },
            "answer": {
              "preset": "lines",
              "at": 1.1,
              "duration": 0.55,
              "stagger": 0.12,
              "distance": 6
            },
            "card_2": {
              "preset": "pop",
              "at": 1.7,
              "duration": 0.55,
              "scale": 0.96
            },
            "avatar_2": {
              "preset": "pop",
              "at": 1.75,
              "duration": 0.45,
              "scale": 0.6
            },
            "person_2": {
              "preset": "from-left",
              "at": 1.75,
              "duration": 0.45,
              "distance": 6
            },
            "window_2": {
              "preset": "from-bottom",
              "at": 1.75,
              "duration": 0.8,
              "distance": 28
            },
            "logo_2": {
              "preset": "pop",
              "at": 1.75,
              "duration": 0.5,
              "scale": 0.6
            },
            "nav_2": {
              "preset": "from-left",
              "at": 1.75,
              "duration": 0.45,
              "stagger": 0.05,
              "distance": 6
            },
            "bubble_2": {
              "preset": "pop",
              "at": 1.75,
              "duration": 0.5,
              "scale": 0.94,
              "origin": "100% 50%"
            },
            "prompt_2": {
              "preset": "type",
              "at": 1.75,
              "duration": 0.05,
              "stagger": 0.015
            },
            "status_2": {
              "preset": "fade",
              "at": 2.05,
              "duration": 0.4
            },
            "answer_2": {
              "preset": "lines",
              "at": 2.25,
              "duration": 0.55,
              "stagger": 0.12,
              "distance": 6
            }
          }
        },
        "org-code": {
          "timeScale": 1,
          "tracks": {
            "dots": {
              "preset": "fade",
              "at": 0,
              "duration": 0.8
            },
            "code": {
              "preset": "from-bottom",
              "at": 0.1,
              "duration": 0.7,
              "distance": 16
            },
            "code-head": {
              "preset": "fade",
              "at": 0.4,
              "duration": 0.4
            },
            "code-line": {
              "preset": "from-left",
              "at": 0.5,
              "duration": 0.4,
              "stagger": 0.12,
              "distance": 6
            },
            "line-no": {
              "preset": "fade",
              "at": 0.75,
              "duration": 0.3,
              "stagger": 0.08
            },
            "card": {
              "preset": "from-top",
              "at": 1.1,
              "duration": 0.6,
              "distance": 16
            },
            "avatar": {
              "preset": "pop",
              "at": 1.3,
              "duration": 0.45,
              "scale": 0.6
            },
            "person": {
              "preset": "from-left",
              "at": 1.35,
              "duration": 0.45,
              "distance": 6
            },
            "highlight": {
              "preset": "grow-x",
              "at": 1.75,
              "duration": 0.5,
              "stagger": 0.25,
              "origin": "0% 50%"
            },
            "inject": {
              "preset": "draw",
              "at": 1.85,
              "duration": 0.6,
              "stagger": 0.25,
              "dir": "right"
            },
            "inject-note": {
              "preset": "from-right",
              "at": 2.3,
              "duration": 0.4,
              "stagger": 0.25,
              "distance": 8
            }
          }
        }
      }
    );
    for (var sceneKey in SCENES)
      CONFIG5[sceneKey] = SCENES[sceneKey];
    CONFIG5.consistent = JSON.parse(JSON.stringify(CONFIG5["warehouse-models"]));
    Object.assign(CONFIG5.consistent.flow, {
      mode: "random",
      // 'random' | 'sequence' (warehouse-models: one source at a time)
      travel: 3.2,
      ease: "sine.inOut",
      spread: 0.35,
      hold: 0.4,
      randomGap: [1.2, 4.5],
      // seconds between a source's firings, picked per firing
      shots: 6
      // firings per source before its loop repeats
    });
    CONFIG5.consistent.count = { enabled: true, start: [40, 900], step: [1, 3], duration: 0.9 };
    CONFIG5["consistent-mobile"] = CONFIG5.consistent;
    ScrollTrigger.config({ ignoreMobileResize: true });
    var SVGNS = "http://www.w3.org/2000/svg";
    var LANES = [
      { line: "Shape", tables: ["app-item_7", "app-item_8"] },
      // Workday
      { d: "M134 193.5c26.02 0 32.98 20 62 20", tables: ["app-item_5", "app-item_6"] },
      // Greenhouse
      { line: "Shape_3", tables: ["app-item_9", "app-item_10"] },
      // Lattice
      { line: "Shape_2", tables: ["app-item_11", "app-item_12"] }
      // Culture Amp
    ];
    function one(root, name) {
      return root.querySelector('[data-anim="' + name + '"]');
    }
    function series(root, base, count) {
      var out = [];
      for (var i = 1; i <= count; i++) {
        var el2 = one(root, i === 1 ? base : base + "_" + i);
        if (el2)
          out.push(el2);
      }
      return out;
    }
    function matching(root, re) {
      return [].slice.call(root.querySelectorAll("[data-anim]")).filter(function(el2) {
        return re.test(el2.getAttribute("data-anim"));
      });
    }
    function range(root, base, first, last) {
      var out = [];
      for (var i = first; i <= last; i++) {
        var el2 = one(root, base + "_" + i);
        if (el2)
          out.push(el2);
      }
      return out;
    }
    function step(tl, targets, c, d, overrides) {
      if (!c || !targets)
        return tl;
      var list = targets.length !== void 0 ? targets : [targets];
      list = [].slice.call(list).filter(Boolean);
      if (!list.length)
        return tl;
      var vars = { duration: c.duration != null ? c.duration : CONFIG5.global.duration };
      if (c.fade !== false)
        vars.autoAlpha = 0;
      if (c.from) {
        if (c.from.x != null)
          vars.x = c.from.x * d;
        if (c.from.y != null)
          vars.y = c.from.y * d;
        if (c.from.scale != null)
          vars.scale = c.from.scale;
      }
      if (c.stagger != null)
        vars.stagger = c.stagger;
      if (c.ease)
        vars.ease = c.ease;
      if (c.transformOrigin)
        vars.transformOrigin = c.transformOrigin;
      if (overrides)
        for (var k in overrides)
          vars[k] = overrides[k];
      return tl.from(list, vars, c.at || 0);
    }
    function absSubpaths(path) {
      var d = path.getAttribute("d");
      var subs = d && d.match(/[Mm][^Mm]*/g);
      if (!subs || !subs.length)
        return null;
      var parent = path.parentNode;
      var probe = document.createElementNS(SVGNS, "path");
      parent.insertBefore(probe, path);
      var NUM = /-?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;
      var parts = [];
      var pen = { x: 0, y: 0 };
      for (var i = 0; i < subs.length; i++) {
        var raw = subs[i];
        var rel = raw[0] === "m";
        var body = raw.slice(1);
        NUM.lastIndex = 0;
        var n1 = NUM.exec(body);
        var n2 = NUM.exec(body);
        if (!n1 || !n2)
          continue;
        var ax = rel ? pen.x + parseFloat(n1[0]) : parseFloat(n1[0]);
        var ay = rel ? pen.y + parseFloat(n2[0]) : parseFloat(n2[0]);
        var rest = body.slice(NUM.lastIndex);
        var tail = "";
        if (rest.trim())
          tail = /^[a-zA-Z]/.test(rest.trim()) ? rest : (rel ? "l" : "L") + rest;
        var abs = "M" + ax + " " + ay + tail;
        probe.setAttribute("d", abs);
        var end = probe.getPointAtLength(probe.getTotalLength());
        pen = { x: end.x, y: end.y };
        var b = probe.getBBox();
        parts.push({
          d: abs,
          x: b.x,
          y: b.y,
          w: b.width,
          h: b.height,
          sx: ax,
          sy: ay,
          ex: end.x,
          ey: end.y,
          closed: /z/i.test(abs)
        });
      }
      parent.removeChild(probe);
      return parts.length ? parts : null;
    }
    function groupLines(parts) {
      var lines = [];
      parts.slice().sort(function(a, b) {
        return a.y - b.y;
      }).forEach(function(p) {
        for (var i = 0; i < lines.length; i++) {
          var L = lines[i];
          var overlap = Math.min(L.bottom, p.y + p.h) - Math.max(L.top, p.y);
          if (overlap > Math.min(L.bottom - L.top, p.h) * 0.35) {
            L.items.push(p);
            L.top = Math.min(L.top, p.y);
            L.bottom = Math.max(L.bottom, p.y + p.h);
            return;
          }
        }
        lines.push({ top: p.y, bottom: p.y + p.h, items: [p] });
      });
      return lines.sort(function(a, b) {
        return a.top - b.top;
      });
    }
    function splitGlyphs(path) {
      if (path.__glyphs)
        return path.__glyphs;
      var all = absSubpaths(path);
      if (!all || all.length < 2)
        return null;
      var parts = all.filter(function(p) {
        return p.w || p.h;
      });
      if (!parts.length)
        return null;
      var parent = path.parentNode;
      var lines = groupLines(parts);
      var glyphs = [];
      lines.forEach(function(L) {
        var cur = null;
        L.items.sort(function(a2, b) {
          return a2.x - b.x;
        }).forEach(function(p) {
          if (cur) {
            var ov = Math.min(cur.x2, p.x + p.w) - Math.max(cur.x, p.x);
            if (ov > Math.min(cur.x2 - cur.x, p.w) * 0.5) {
              cur.d += p.d;
              cur.x2 = Math.max(cur.x2, p.x + p.w);
              return;
            }
          }
          cur = { d: p.d, x: p.x, x2: p.x + p.w };
          glyphs.push(cur);
        });
      });
      if (glyphs.length < 2)
        return null;
      var g = document.createElementNS(SVGNS, "g");
      for (var a = 0; a < path.attributes.length; a++) {
        var at = path.attributes[a];
        if (at.name !== "d")
          g.setAttribute(at.name, at.value);
      }
      g.setAttribute("data-glyphs", String(glyphs.length));
      var out = glyphs.map(function(gl) {
        var el2 = document.createElementNS(SVGNS, "path");
        el2.setAttribute("d", gl.d);
        g.appendChild(el2);
        return el2;
      });
      parent.replaceChild(g, path);
      g.__glyphs = out;
      return out;
    }
    function typeIn(tl, scope, cfg, at) {
      if (!scope || !cfg || !cfg.enabled)
        return;
      var blocks = [].slice.call(scope.querySelectorAll("path[data-anim], g[data-glyphs]")).filter(function(p) {
        var n = p.getAttribute("data-anim") || "";
        return n.length > 20 && /\s/.test(n);
      });
      blocks.forEach(function(block) {
        var glyphs = block.__glyphs || splitGlyphs(block);
        if (!glyphs)
          return;
        tl.fromTo(
          glyphs,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: cfg.duration, ease: "none", stagger: cfg.stagger },
          at
        );
      });
    }
    function dashPrime(path) {
      var len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      return len;
    }
    function roundedRectPath(x, y, w, h, r) {
      r = Math.min(r || 0, w / 2, h / 2);
      return "M" + (x + r) + " " + y + "H" + (x + w - r) + "A" + r + " " + r + " 0 0 1 " + (x + w) + " " + (y + r) + "V" + (y + h - r) + "A" + r + " " + r + " 0 0 1 " + (x + w - r) + " " + (y + h) + "H" + (x + r) + "A" + r + " " + r + " 0 0 1 " + x + " " + (y + h - r) + "V" + (y + r) + "A" + r + " " + r + " 0 0 1 " + (x + r) + " " + y + "Z";
    }
    function makeTrace(node, ring, cfg) {
      var old = node.querySelector("[data-flow-trace]");
      if (old)
        old.parentNode.removeChild(old);
      if (!ring)
        return null;
      var n = function(a) {
        return parseFloat(ring.getAttribute(a)) || 0;
      };
      var p = document.createElementNS(SVGNS, "path");
      p.setAttribute("d", roundedRectPath(n("x"), n("y"), n("width"), n("height"), n("rx")));
      p.setAttribute("fill", "none");
      p.setAttribute("stroke", cfg.highlightTint);
      p.setAttribute("stroke-width", String(cfg.strokeWidth));
      p.setAttribute("stroke-linecap", "round");
      p.setAttribute("data-flow-trace", "");
      p.style.opacity = "0";
      node.appendChild(p);
      var len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      p.__len = len;
      return p;
    }
    function buildFlowLoop(root, cfg) {
      if (!cfg || !cfg.enabled)
        return null;
      var stale = root.querySelectorAll("[data-flow-pulse]");
      for (var s = 0; s < stale.length; s++)
        stale[s].parentNode.removeChild(stale[s]);
      var lanes = LANES.map(function(lane) {
        var src = lane.line ? one(root, lane.line) : null;
        var d = lane.d || src && src.getAttribute("d");
        if (!d)
          return null;
        var pulse = document.createElementNS(SVGNS, "path");
        pulse.setAttribute("d", d);
        pulse.setAttribute("fill", "none");
        pulse.setAttribute("stroke", cfg.tint);
        pulse.setAttribute("stroke-width", String(cfg.strokeWidth));
        pulse.setAttribute("stroke-linecap", "round");
        pulse.setAttribute("data-flow-pulse", "");
        pulse.style.opacity = "0";
        var anchor = src || one(root, "connecting-line_2");
        if (!anchor || !anchor.parentNode)
          return null;
        anchor.parentNode.insertBefore(pulse, anchor.nextSibling);
        var len = pulse.getTotalLength();
        var seg = Math.min(cfg.pulseLength, len * 0.35);
        gsap.set(pulse, { strokeDasharray: seg + " " + len, strokeDashoffset: seg });
        return {
          pulse,
          len,
          seg,
          marks: lane.tables.map(function(t) {
            var node = one(root, t);
            if (!node)
              return null;
            var ring = node.querySelector("rect[stroke]");
            return { node, ring, trace: makeTrace(node, ring, cfg) };
          })
        };
      }).filter(Boolean);
      if (!lanes.length)
        return null;
      lanes.forEach(function(l2) {
        l2.marks.forEach(function(m) {
          if (!m)
            return;
          if (m.ring)
            gsap.set(m.ring, { strokeOpacity: 0 });
          gsap.set(m.node, { transformOrigin: "center center" });
        });
      });
      var loop = gsap.timeline({ paused: true, repeat: -1, repeatDelay: cfg.cycleDelay });
      var stepDur = Math.max(
        cfg.step,
        cfg.highlightAt + cfg.traceDraw + cfg.traceHold + cfg.traceFade + cfg.stepGap
      );
      for (var pass = 0; pass < 2; pass++) {
        for (var i = 0; i < lanes.length; i++) {
          var l = lanes[i];
          var mark = l.marks[pass];
          var at = (pass * lanes.length + i) * stepDur;
          loop.set(l.pulse, { strokeDashoffset: l.seg, opacity: 1 }, at).to(l.pulse, { strokeDashoffset: -l.len, duration: cfg.pulseDuration, ease: "none" }, at).to(l.pulse, { opacity: 0, duration: cfg.pulseFadeOut }, at + cfg.pulseFadeAt);
          if (mark) {
            var lit = at + cfg.highlightAt;
            var off = lit + cfg.traceDraw + cfg.traceHold;
            loop.to(mark.node, { scale: cfg.highlightScale, duration: cfg.highlightIn, ease: cfg.highlightEase }, lit).to(mark.node, { scale: 1, duration: cfg.highlightOut }, off);
            if (mark.trace) {
              loop.set(mark.trace, { strokeDashoffset: mark.trace.__len }, lit).to(mark.trace, { opacity: 1, duration: cfg.traceFade }, lit).to(mark.trace, { strokeDashoffset: 0, duration: cfg.traceDraw, ease: cfg.traceEase }, lit).to(mark.trace, { opacity: 0, duration: cfg.traceFade }, off);
            }
          }
        }
      }
      return loop;
    }
    function buildPolicyCycle(root, cfg) {
      if (!cfg || !cfg.enabled)
        return null;
      return cardCycle(series(root, "use-case", 4), cfg);
    }
    function cardCycle(cards, cfg) {
      if (!cards || cards.length < 2)
        return null;
      var boxes = [].map.call(cards, function(c2) {
        var b2 = c2.getBBox();
        return { el: c2, x: b2.x, y: b2.y };
      });
      var slots = boxes.map(function(b2) {
        return { x: b2.x, y: b2.y };
      }).sort(function(a, b2) {
        return a.y - b2.y;
      });
      var n = slots.length;
      var startSlot = boxes.map(function(b2) {
        for (var i = 0; i < n; i++)
          if (Math.abs(slots[i].y - b2.y) < 1)
            return i;
        return 0;
      });
      var loop = gsap.timeline({ paused: true, repeat: -1 });
      var move = cfg.moveDuration != null ? cfg.moveDuration : 0.7;
      var lift = cfg.wrapLift != null ? cfg.wrapLift : 70;
      var step2 = cfg.step != null ? cfg.step : 2.2;
      for (var k = 1; k <= n; k++) {
        for (var c = 0; c < boxes.length; c++) {
          var b = boxes[c];
          var from = (startSlot[c] - (k - 1) + n * 9) % n;
          var to = (startSlot[c] - k + n * 9) % n;
          var at = (k - 1) * step2;
          var dx = slots[to].x - b.x;
          var dy = slots[to].y - b.y;
          if (from === 0) {
            loop.to(
              b.el,
              { x: slots[0].x - b.x, y: slots[0].y - b.y - lift, autoAlpha: 0, duration: move * 0.45 },
              at
            ).set(b.el, { x: dx, y: dy + lift }, at + move * 0.5).to(b.el, { x: dx, y: dy, autoAlpha: 1, duration: move * 0.5 }, at + move * 0.5);
          } else {
            loop.to(b.el, { x: dx, y: dy, duration: move }, at);
          }
        }
      }
      loop.to({ _: 0 }, { _: 1, duration: 1e-3 }, n * step2 - 1e-3);
      return loop;
    }
    function tilesIn(scope) {
      if (!scope)
        return [];
      var out = [];
      scope.querySelectorAll('rect[rx="12"]').forEach(function(r) {
        if (parseFloat(r.getAttribute("width")) !== 80)
          return;
        var g = r.parentNode;
        if (g && g !== scope && out.indexOf(g) === -1)
          out.push(g);
      });
      return out;
    }
    function buildMarquee(logos, cfg, viewW) {
      if (!logos || !cfg || !cfg.enabled)
        return [];
      if (logos.__orig == null)
        logos.__orig = logos.innerHTML;
      else
        logos.innerHTML = logos.__orig;
      var tiles = tilesIn(logos);
      if (!tiles.length)
        return [];
      var meta = tiles.map(function(t) {
        var r = t.querySelector('rect[rx="12"]');
        return {
          el: t,
          x: parseFloat(r.getAttribute("x")) || 0,
          y: parseFloat(r.getAttribute("y")) || 0,
          // anything beyond the background rect means it carries a logo
          empty: !t.querySelector("path, image, use, circle, polygon, ellipse")
        };
      });
      var rows = [];
      meta.forEach(function(m) {
        var row = rows.filter(function(r) {
          return Math.abs(r.y - m.y) < 2;
        })[0];
        if (!row) {
          row = { y: m.y, items: [] };
          rows.push(row);
        }
        row.items.push(m);
      });
      rows.sort(function(a, b) {
        return a.y - b.y;
      });
      var built = [];
      rows.forEach(function(row, ri) {
        row.items.sort(function(a, b) {
          return a.x - b.x;
        });
        var gaps = [];
        for (var i = 1; i < row.items.length; i++)
          gaps.push(row.items[i].x - row.items[i - 1].x);
        gaps.sort(function(a, b) {
          return a - b;
        });
        var pitch = cfg.pitch || gaps[Math.floor(gaps.length / 2)] || 96;
        var startX = row.items[0].x;
        var keep = cfg.dropEmpty ? row.items.filter(function(m) {
          return !m.empty;
        }) : row.items;
        row.items.forEach(function(m) {
          if (keep.indexOf(m) === -1)
            m.el.remove();
        });
        if (!keep.length)
          return;
        var setWidth = keep.length * pitch;
        var copies = Math.ceil(viewW / setWidth) + 1;
        var rowG = document.createElementNS(SVGNS, "g");
        rowG.setAttribute("data-marquee-row", String(ri));
        logos.appendChild(rowG);
        for (var c = 0; c < copies; c++) {
          for (var j = 0; j < keep.length; j++) {
            var src = keep[j];
            var node = c === 0 ? src.el : src.el.cloneNode(true);
            var wrap = document.createElementNS(SVGNS, "g");
            var targetX = startX + (c * keep.length + j) * pitch;
            wrap.setAttribute("transform", "translate(" + (targetX - src.x) + " 0)");
            wrap.appendChild(node);
            rowG.appendChild(wrap);
          }
        }
        built.push({ g: rowG, setWidth, dir: cfg.zigzag && ri % 2 ? 1 : -1 });
      });
      applyEdgeFade(logos, cfg.fade, viewW);
      return built;
    }
    function applyEdgeFade(logos, fade, viewW) {
      var root = logos.ownerSVGElement;
      var prev = root.querySelector("#hi-marquee-fade");
      if (prev)
        prev.remove();
      logos.removeAttribute("mask");
      if (!fade || fade <= 0)
        return;
      var defs = root.querySelector("defs");
      if (!defs) {
        defs = document.createElementNS(SVGNS, "defs");
        root.insertBefore(defs, root.firstChild);
      }
      var vb = root.viewBox && root.viewBox.baseVal;
      var h = vb && vb.height || parseFloat(root.getAttribute("height")) || 431;
      var f = Math.min(0.49, fade);
      var grad = document.createElementNS(SVGNS, "linearGradient");
      grad.setAttribute("id", "hi-marquee-fade-grad");
      grad.setAttribute("x1", "0");
      grad.setAttribute("x2", "1");
      [[0, "#000"], [f, "#fff"], [1 - f, "#fff"], [1, "#000"]].forEach(function(s) {
        var stop = document.createElementNS(SVGNS, "stop");
        stop.setAttribute("offset", String(s[0]));
        stop.setAttribute("stop-color", s[1]);
        grad.appendChild(stop);
      });
      var mask = document.createElementNS(SVGNS, "mask");
      mask.setAttribute("id", "hi-marquee-fade");
      mask.setAttribute("maskUnits", "userSpaceOnUse");
      var r = document.createElementNS(SVGNS, "rect");
      r.setAttribute("x", "0");
      r.setAttribute("y", "0");
      r.setAttribute("width", String(viewW));
      r.setAttribute("height", String(h));
      r.setAttribute("fill", "url(#hi-marquee-fade-grad)");
      mask.appendChild(grad);
      mask.appendChild(r);
      defs.appendChild(mask);
      logos.setAttribute("mask", "url(#hi-marquee-fade)");
    }
    function multiLoop(list) {
      return {
        play: function() {
          list.forEach(function(t) {
            t.play();
          });
        },
        pause: function() {
          list.forEach(function(t) {
            t.pause();
          });
        },
        // scrubbing an ambient loop is how the checks verify it moves at all
        seek: function(t) {
          list.forEach(function(x) {
            x.pause();
            x.time(t);
          });
        },
        kill: function() {
          list.forEach(function(t) {
            t.kill();
          });
        },
        paused: function() {
          return list[0] ? list[0].paused() : true;
        },
        duration: function() {
          return list.reduce(function(m, t) {
            return Math.max(m, t.duration());
          }, 0);
        }
      };
    }
    function radialDelays(els, cx, cy) {
      var d = els.map(function(el2) {
        var b = el2.getBBox();
        return Math.sqrt(Math.pow(b.x + b.width / 2 - cx, 2) + Math.pow(b.y + b.height / 2 - cy, 2));
      });
      var max = Math.max.apply(null, d) || 1;
      return d.map(function(v) {
        return v / max;
      });
    }
    var PRESETS = ["fade", "from-bottom", "from-top", "from-left", "from-right", "pop", "grow-x", "grow-y", "draw", "tint", "lines", "type", "travel", "cycle"];
    function scenePieces(path, mode) {
      var all = absSubpaths(path);
      var parts = all && all.filter(function(p) {
        return p.w || p.h;
      });
      if (!parts || parts.length < 2)
        return [path];
      var lines = groupLines(parts);
      var chunks = [];
      lines.forEach(function(L) {
        if (mode === "lines") {
          chunks.push(L.items.sort(function(a2, b) {
            return a2.x - b.x;
          }).map(function(p) {
            return p.d;
          }).join(""));
          return;
        }
        var cur = null;
        L.items.sort(function(a2, b) {
          return a2.x - b.x;
        }).forEach(function(p) {
          if (cur) {
            var ov = Math.min(cur.x2, p.x + p.w) - Math.max(cur.x, p.x);
            if (ov > Math.min(cur.x2 - cur.x, p.w) * 0.5) {
              cur.d += p.d;
              cur.x2 = Math.max(cur.x2, p.x + p.w);
              return;
            }
          }
          cur = { d: p.d, x: p.x, x2: p.x + p.w };
          chunks.push(cur);
        });
      });
      chunks = chunks.map(function(c) {
        return typeof c === "string" ? c : c.d;
      });
      if (chunks.length < 2)
        return [path];
      var g = document.createElementNS(SVGNS, "g");
      for (var a = 0; a < path.attributes.length; a++) {
        var at = path.attributes[a];
        if (at.name !== "d")
          g.setAttribute(at.name, at.value);
      }
      g.setAttribute("data-split", mode);
      var out = chunks.map(function(d) {
        var el2 = document.createElementNS(SVGNS, "path");
        el2.setAttribute("d", d);
        g.appendChild(el2);
        return el2;
      });
      path.parentNode.replaceChild(g, path);
      g.__orig = path;
      return out;
    }
    function sceneReset(root) {
      root.querySelectorAll("[data-split]").forEach(function(g) {
        if (g.__orig)
          g.parentNode.replaceChild(g.__orig, g);
      });
      var els = root.querySelectorAll("[data-anim], [data-anim] *");
      gsap.killTweensOf(els);
      gsap.set(els, { clearProps: "transform,opacity,visibility,fill,stroke" });
      root.querySelectorAll("[data-draw-clip]").forEach(function(cp) {
        cp.parentNode.removeChild(cp);
      });
      root.querySelectorAll("[data-draw-clipped]").forEach(function(el2) {
        var prev = el2.getAttribute("data-draw-clipped");
        if (prev)
          el2.setAttribute("clip-path", prev);
        else
          el2.removeAttribute("clip-path");
        el2.removeAttribute("data-draw-clipped");
      });
      root.querySelectorAll("[data-travel]").forEach(function(c) {
        c.setAttribute("cx", c.getAttribute("data-cx"));
        c.setAttribute("cy", c.getAttribute("data-cy"));
        c.removeAttribute("data-travel");
        c.removeAttribute("data-flow-hidden");
        c.style.opacity = "";
      });
    }
    function sceneUnits(root, key, track) {
      var names = String(track.targets || key).split(",").map(function(n) {
        return n.trim();
      }).filter(Boolean);
      var tagged = [].slice.call(root.querySelectorAll("[data-anim]"));
      var units = [];
      names.forEach(function(n) {
        var els = n.slice(-1) === "*" ? tagged.filter(function(el2) {
          return el2.getAttribute("data-anim").indexOf(n.slice(0, -1)) === 0;
        }) : tagged.filter(function(el2) {
          return el2.getAttribute("data-anim") === n;
        });
        if (!els.length)
          return;
        if (names.length > 1)
          units.push(els);
        else
          els.forEach(function(el2) {
            units.push([el2]);
          });
      });
      return units;
    }
    function travelLoop(units, t) {
      var loop = gsap.timeline({ paused: true });
      var flat = [];
      units.forEach(function(unit) {
        flat = flat.concat(unit);
      });
      var expand = function(tag) {
        var out = [];
        flat.forEach(function(el2) {
          if (el2.tagName === tag)
            out.push(el2);
          [].push.apply(out, el2.querySelectorAll ? [].slice.call(el2.querySelectorAll(tag)) : []);
        });
        return out;
      };
      var lanes = expand("path").map(function(line) {
        var len = line.getTotalLength();
        var pts = [];
        for (var i = 0; i <= 40; i++)
          pts.push(line.getPointAtLength(len * i / 40));
        var flip = !!t.reverse;
        var a = pts[0], b = pts[pts.length - 1];
        if (t.towards === "down")
          flip = a.y > b.y;
        else if (t.towards === "up")
          flip = a.y < b.y;
        else if (t.towards === "right")
          flip = a.x > b.x;
        else if (t.towards === "left")
          flip = a.x < b.x;
        return { line, len, pts, dots: [], flip };
      });
      if (!lanes.length)
        return loop;
      expand("circle").forEach(function(dot) {
        if (+dot.getAttribute("r") < 2.5)
          return;
        var cx = +dot.getAttribute("cx"), cy = +dot.getAttribute("cy");
        var best = null, bestD = Infinity;
        lanes.forEach(function(lane) {
          lane.pts.forEach(function(p) {
            var dd = (p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy);
            if (dd < bestD) {
              bestD = dd;
              best = lane;
            }
          });
        });
        if (best)
          best.dots.push(dot);
      });
      lanes.forEach(function(lane, u) {
        lane.dots.forEach(function(dot, i) {
          dot.setAttribute("data-cx", dot.getAttribute("cx"));
          dot.setAttribute("data-cy", dot.getAttribute("cy"));
          dot.setAttribute("data-travel", "");
          dot.setAttribute("data-flow-hidden", "");
          dot.style.opacity = "0";
          var edge = t.fadeEdge != null ? t.fadeEdge : 0.12;
          var dur = t.duration || 2.4;
          var proxy = { p: 0 };
          loop.to(proxy, {
            p: 1,
            duration: dur,
            ease: "none",
            repeat: -1,
            delay: (t.stagger || 0) * u + dur * i / lane.dots.length,
            onUpdate: function() {
              var f = proxy.p;
              var pt = lane.line.getPointAtLength(lane.len * (lane.flip ? 1 - f : f));
              dot.setAttribute("cx", pt.x);
              dot.setAttribute("cy", pt.y);
              dot.style.opacity = Math.max(0, Math.min(1, f / edge, (1 - f) / edge));
            }
          }, 0);
        });
      });
      return loop;
    }
    function drawReveal(tl, el2, t, d) {
      var bb = el2.getBBox();
      var pad = 4;
      var x = bb.x - pad, y = bb.y - pad, w = bb.width + pad * 2, h = bb.height + pad * 2;
      var defs = el2.ownerSVGElement.querySelector("defs");
      if (!defs) {
        defs = document.createElementNS(SVGNS, "defs");
        el2.ownerSVGElement.insertBefore(defs, el2.ownerSVGElement.firstChild);
      }
      var cp = document.createElementNS(SVGNS, "clipPath");
      var id = "hi-draw-" + Math.random().toString(36).slice(2, 8);
      cp.setAttribute("id", id);
      cp.setAttribute("data-draw-clip", "");
      var rect = document.createElementNS(SVGNS, "rect");
      cp.appendChild(rect);
      defs.appendChild(cp);
      el2.setAttribute("data-draw-clipped", el2.getAttribute("clip-path") || "");
      el2.setAttribute("clip-path", "url(#" + id + ")");
      var dir = t.dir || "down";
      var from = { x, y, width: w, height: h };
      if (dir === "down") {
        from.height = 0;
      } else if (dir === "up") {
        from.height = 0;
        from.y = y + h;
      } else if (dir === "right") {
        from.width = 0;
      } else if (dir === "left") {
        from.width = 0;
        from.x = x + w;
      }
      gsap.set(rect, { attr: from });
      return tl.to(rect, {
        attr: { x, y, width: w, height: h },
        duration: t.duration != null ? t.duration : 0.6,
        ease: t.ease || CONFIG5.global.ease,
        data: null
      }, t.at || 0);
    }
    function buildScene(name, root, d) {
      var scene = CONFIG5[name];
      if (!root.querySelector("[data-anim]")) {
        console.warn('[hi-illustrations] "' + name + '" has no data-anim hooks \u2014 paste webflow/svg-only/' + name + ".svg, not the Figma export");
      }
      sceneReset(root);
      var tl = gsap.timeline({ paused: true });
      var loops = [];
      Object.keys(scene.tracks || {}).forEach(function(key) {
        var t = scene.tracks[key];
        if (!t || t.enabled === false)
          return;
        var units = sceneUnits(root, key, t);
        if (!units.length)
          return;
        if (t.preset === "travel") {
          loops.push(travelLoop(units, t));
          return;
        }
        if (t.preset === "tint") {
          var attr = t.mode === "stroke" ? "stroke" : "fill";
          units.forEach(function(unit, i) {
            unit.forEach(function(el2) {
              var to = el2.getAttribute(attr) || window.getComputedStyle(el2)[attr];
              var a = {}, bb = { duration: t.duration != null ? t.duration : 0.4, data: key };
              a[attr] = t.from || "#8B95AA";
              bb[attr] = to;
              if (t.ease)
                bb.ease = t.ease;
              tl.fromTo(el2, a, bb, (t.at || 0) + i * (t.stagger || 0));
            });
          });
          return;
        }
        if (t.preset === "cycle") {
          var ring = cardCycle(units.map(function(u) {
            return u[0];
          }), t);
          if (ring)
            loops.push(ring);
          return;
        }
        if (t.preset === "draw") {
          units.forEach(function(unit, i) {
            unit.forEach(function(el2) {
              var STROKED = { path: 1, line: 1, polyline: 1, polygon: 1, circle: 1, ellipse: 1, rect: 1 };
              if (!STROKED[el2.tagName] && !el2.querySelector("path, line, polyline"))
                return;
              var step2 = { at: (t.at || 0) + i * (t.stagger || 0), duration: t.duration, ease: t.ease, dir: t.dir };
              drawReveal(tl, el2, step2, d).vars.data = key;
            });
          });
          return;
        }
        if (t.preset === "lines" || t.preset === "type") {
          var pieces = [];
          units.forEach(function(unit) {
            unit.forEach(function(el2) {
              var paths = el2.tagName === "path" ? [el2] : [].slice.call(el2.querySelectorAll("path"));
              var text = paths.filter(function(p) {
                return ((p.getAttribute("d") || "").match(/[Mm]/g) || []).length >= 3;
              });
              if (!text.length) {
                pieces.push(el2);
                return;
              }
              text.forEach(function(p) {
                pieces = pieces.concat(scenePieces(p, t.preset));
              });
            });
          });
          units = pieces.map(function(p) {
            return [p];
          });
        }
        var dist = (t.distance != null ? t.distance : 12) * d;
        var vars = { duration: t.duration != null ? t.duration : CONFIG5.global.duration, autoAlpha: 0, data: key };
        if (t.ease)
          vars.ease = t.ease;
        switch (t.preset) {
          case "from-bottom":
            vars.y = dist;
            break;
          case "from-top":
            vars.y = -dist;
            break;
          case "from-left":
            vars.x = -dist;
            break;
          case "from-right":
            vars.x = dist;
            break;
          case "pop":
            vars.scale = t.scale != null ? t.scale : 0.9;
            vars.transformOrigin = t.origin || "50% 50%";
            break;
          case "grow-x":
            vars.scaleX = 0;
            vars.transformOrigin = t.origin || "0% 50%";
            break;
          case "grow-y":
            vars.scaleY = 0;
            vars.transformOrigin = t.origin || "50% 0%";
            break;
          case "lines":
            vars.y = (t.distance != null ? t.distance : 6) * d;
            break;
          case "type":
            vars.ease = "none";
            break;
        }
        units.forEach(function(unit, i) {
          tl.from(unit, Object.assign({}, vars), (t.at || 0) + i * (t.stagger || 0));
        });
      });
      if (loops.length)
        tl.__loop = loops.length === 1 ? loops[0] : multiLoop(loops);
      return tl;
    }
    var BUILD = {};
    Object.keys(SCENES).forEach(function(name) {
      BUILD[name] = function(root, d) {
        return buildScene(name, root, d);
      };
    });
    BUILD.integrations = function(root, d) {
      var k = CONFIG5.integrations;
      var tl = gsap.timeline({ paused: true });
      step(tl, one(root, "side-bar"), k.sidebar, d);
      step(tl, series(root, "Tab", 6), k.tabs, d);
      step(tl, one(root, "header"), k.header, d);
      series(root, "app-item", 8).forEach(function(card, i) {
        var col = i % 2;
        var at = k.cards.at + Math.floor(i / 2) * k.cards.rowStagger + col * k.cards.colStagger;
        step(tl, card, { at, duration: k.cards.duration, ease: k.cards.ease }, d, {
          x: (col ? k.cards.from.x : -k.cards.from.x) * d,
          y: k.cards.from.y * d,
          autoAlpha: 0
        });
      });
      return tl;
    };
    BUILD.lineage = function(root, d) {
      var k = CONFIG5.lineage;
      var tl = gsap.timeline({ paused: true });
      var strokes = ["Shape", "Shape_2", "Shape_3", "connecting-line_5"].map(function(n) {
        return one(root, n);
      }).filter(Boolean);
      strokes.forEach(dashPrime);
      step(tl, one(root, "app-block"), k.sources, d);
      step(tl, series(root, "app-item", 4), k.sourceItems, d);
      tl.to(
        strokes,
        { strokeDashoffset: 0, duration: k.connectors.duration, stagger: k.connectors.stagger, ease: k.connectors.ease },
        k.connectors.at
      );
      step(tl, one(root, "Shape_4"), k.arrow, d);
      step(tl, one(root, "app-block_2"), k.tableBlock, d);
      step(tl, range(root, "app-item", 5, 12), k.tables, d);
      step(tl, series(root, "Modal Content", 3), k.outcomes, d);
      var flow = buildFlowLoop(root, k.flow);
      if (flow) {
        tl.__loop = flow;
      }
      return tl;
    };
    BUILD["metric-form"] = function(root, d) {
      var k = CONFIG5["metric-form"];
      var tl = gsap.timeline({ paused: true });
      step(tl, one(root, "header"), k.header, d);
      step(tl, series(root, "field", 4), k.fields, d);
      step(tl, [one(root, "option"), one(root, "option_2")], k.chips, d);
      return tl;
    };
    BUILD.refusal = function(root, d) {
      var k = CONFIG5.refusal;
      var tl = gsap.timeline({ paused: true });
      step(tl, one(root, "model-user"), k.user, d);
      step(tl, one(root, "card"), k.card, d);
      step(tl, one(root, "prompt"), k.prompt, d);
      step(tl, one(root, "answer"), k.answer, d);
      step(tl, one(root, "logo_2"), k.logo, d);
      typeIn(tl, one(root, "prompt"), k.typing, k.typing.promptAt);
      typeIn(tl, one(root, "answer"), k.typing, k.typing.answerAt);
      return tl;
    };
    BUILD.policies = function(root, d) {
      var k = CONFIG5.policies;
      var tl = gsap.timeline({ paused: true });
      series(root, "use-case", 4).forEach(function(card, i) {
        step(tl, card, { at: k.cards.at + i * k.cards.stagger, duration: k.cards.duration, ease: k.cards.ease }, d, {
          x: (i % 2 ? k.cards.from.x : -k.cards.from.x) * d,
          y: k.cards.from.y * d,
          autoAlpha: 0
        });
      });
      step(tl, [one(root, "icon"), one(root, "icon_2")], k.shield, d);
      var cycle = buildPolicyCycle(root, k.cycle);
      if (cycle) {
        tl.__loop = cycle;
      }
      return tl;
    };
    BUILD.shield = function(root, d) {
      var k = CONFIG5.shield;
      var tl = gsap.timeline({ paused: true });
      var shield = one(root, "shield");
      var agents = one(root, "ai-agents");
      if (!shield)
        return tl;
      var parts = [].slice.call(shield.children);
      var glow = one(root, "shield-bg") || parts.filter(function(el2) {
        return el2.getAttribute("filter");
      })[0];
      var body = one(root, "shield-base");
      var mark = one(root, "shield-logo");
      var rings = [one(root, "shield-outline-1"), one(root, "shield-outline-2")].filter(Boolean);
      if (!rings.length) {
        rings = parts.filter(function(el2) {
          return el2.tagName === "path" && el2.getAttribute("stroke") && !el2.getAttribute("filter");
        });
      }
      var sb = shield.getBBox();
      var cx = sb.x + sb.width / 2;
      var cy = sb.y + sb.height / 2;
      var vb = root.viewBox && root.viewBox.baseVal;
      var viewW = vb && vb.width || parseFloat(root.getAttribute("width")) || 700;
      var rows = buildMarquee(one(root, "logos"), k.marquee, viewW);
      var tiles = tilesIn(one(root, "logos"));
      if (tiles.length) {
        var norm = radialDelays(tiles, cx, cy);
        tiles.forEach(function(t) {
          gsap.set(t, { transformOrigin: "center center" });
        });
        tl.from(
          tiles,
          {
            autoAlpha: 0,
            scale: k.logos.from.scale,
            y: k.logos.from.y * d,
            duration: k.logos.duration,
            ease: k.logos.ease,
            stagger: function(i) {
              return norm[i] * k.logos.spread;
            }
          },
          k.logos.at
        );
      }
      var base = [glow, rings[0], rings[1], body].filter(Boolean);
      gsap.set(base.concat(mark ? [mark] : []), { transformOrigin: "center center" });
      if (glow)
        tl.from(glow, { autoAlpha: 0, duration: k.glow.duration }, k.glow.at);
      var animFrom = Math.max(0, Math.min(k.ripple.animateFrom | 0, rings.length));
      var rippleOn = k.ripple.enabled && rings.length > animFrom;
      var staticRings = rippleOn ? rings.slice(0, animFrom) : rings;
      var movingRings = rippleOn ? rings.slice(animFrom) : [];
      tl.from(
        [body].filter(Boolean),
        { autoAlpha: 0, scale: k.shieldBase.from.scale, duration: k.shieldBase.duration },
        k.shieldBase.at
      );
      if (staticRings.length && body) {
        var baseWidth = rings[0].getBBox().width;
        var fromScale = body.getBBox().width / baseWidth;
        staticRings.forEach(function(r) {
          gsap.set(r, { transformOrigin: "center center" });
          tl.fromTo(
            r,
            { scale: fromScale * baseWidth / r.getBBox().width, autoAlpha: 0 },
            {
              scale: 1,
              autoAlpha: 1,
              duration: k.outlineReveal.duration,
              ease: k.outlineReveal.ease
            },
            k.outlineReveal.at
          );
        });
      }
      if (mark) {
        tl.from(mark, { autoAlpha: 0, scale: k.mark.from.scale, duration: k.mark.duration }, k.mark.at);
      }
      var conn = one(root, "connector");
      if (conn && conn.getTotalLength) {
        dashPrime(conn);
        tl.to(conn, { strokeDashoffset: 0, duration: k.connector.duration, ease: "none" }, k.connector.at);
      }
      if (agents) {
        var boxes = [].slice.call(agents.children).filter(function(el2) {
          return el2.tagName === "rect";
        });
        tl.from(boxes, { autoAlpha: 0, duration: k.agentsBox.duration }, k.agentsBox.at);
        var aTiles = tilesIn(agents);
        if (aTiles.length) {
          aTiles.forEach(function(t) {
            gsap.set(t, { transformOrigin: "center center" });
          });
          tl.from(
            aTiles,
            { autoAlpha: 0, y: k.agentTiles.from.y * d, duration: k.agentTiles.duration, stagger: k.agentTiles.stagger },
            k.agentTiles.at
          );
        }
      }
      var idles = [];
      if (rippleOn) {
        var rc = k.ripple;
        shield.querySelectorAll("[data-ripple]").forEach(function(el2) {
          el2.remove();
        });
        var baseW = rings[0].getBBox().width;
        var stops = movingRings.map(function(r) {
          return { scale: r.getBBox().width / baseW, colour: r.getAttribute("stroke") };
        });
        var anchor = staticRings[staticRings.length - 1] || body;
        var s0 = rc.startScale || (anchor ? anchor.getBBox().width / baseW : 0.85);
        movingRings.forEach(function(r) {
          r.setAttribute("data-ripple-hidden", "");
          gsap.set(r, { autoAlpha: 0 });
        });
        var period = rc.travel * stops.length + rc.hold * stops.length + rc.fadeOut + (rc.gap || 0);
        for (var w = 0; w < rc.waves; w++) {
          var wave = document.createElementNS(SVGNS, "path");
          wave.setAttribute("d", rings[0].getAttribute("d"));
          wave.setAttribute("fill", "none");
          wave.setAttribute("stroke", stops[0].colour);
          wave.setAttribute("stroke-width", String(rc.strokeWidth));
          wave.setAttribute("vector-effect", "non-scaling-stroke");
          wave.setAttribute("data-ripple", "");
          wave.style.opacity = "0";
          shield.insertBefore(wave, rings[0]);
          gsap.set(wave, { transformOrigin: "center center", scale: s0 });
          var wt = gsap.timeline({
            paused: true,
            repeat: -1,
            repeatDelay: rc.gap || 0,
            // the empty beat, spent invisible at the start scale
            delay: w * period / rc.waves
          });
          var at = 0;
          stops.forEach(function(stop, si) {
            wt.to(
              wave,
              {
                scale: stop.scale,
                stroke: stop.colour,
                opacity: rc.peakOpacity,
                duration: rc.travel,
                ease: rc.ease
              },
              at
            );
            at += rc.travel + rc.hold;
          });
          wt.to(wave, { opacity: 0, duration: rc.fadeOut, ease: "none" }, at).set(wave, { scale: s0, stroke: stops[0].colour }, at + rc.fadeOut);
          idles.push(wt);
        }
      }
      var immediate = [];
      rows.forEach(function(row, ri) {
        gsap.set(row.g, { willChange: "transform" });
        var dur = row.setWidth / k.marquee.speed;
        var rt = gsap.timeline({ paused: true }).fromTo(
          row.g,
          { x: row.dir < 0 ? 0 : -row.setWidth },
          { x: row.dir < 0 ? -row.setWidth : 0, duration: dur, ease: "none", repeat: -1 }
        );
        rt.time(ri * 0.37 % 1 * dur);
        (k.marquee.startImmediately ? immediate : idles).push(rt);
      });
      if (k.agentsDash.enabled && agents) {
        var dashed = agents.querySelector("[stroke-dasharray]");
        if (dashed) {
          var pattern = (dashed.getAttribute("stroke-dasharray") || "").split(/[\s,]+/).map(parseFloat).filter(function(n) {
            return !isNaN(n);
          });
          var cycle = pattern.reduce(function(a, b) {
            return a + b;
          }, 0);
          if (pattern.length === 1)
            cycle *= 2;
          var dashSpeed = k.agentsDash.speed || k.marquee.speed;
          if (cycle > 0 && dashSpeed > 0) {
            immediate.push(
              gsap.timeline({ paused: true }).fromTo(
                dashed,
                { strokeDashoffset: 0 },
                {
                  strokeDashoffset: k.agentsDash.reverse ? cycle : -cycle,
                  duration: cycle / dashSpeed,
                  ease: "none",
                  repeat: -1
                }
              )
            );
          }
        }
      }
      if (immediate.length)
        tl.__loopNow = multiLoop(immediate);
      if (k.shieldBreathe && k.shieldBreathe.enabled && body) {
        gsap.set(body, { transformOrigin: "center center" });
        idles.push(
          gsap.timeline({ paused: true }).to(body, {
            scale: k.shieldBreathe.scale,
            duration: k.shieldBreathe.duration,
            ease: k.shieldBreathe.ease,
            yoyo: true,
            repeat: -1
          })
        );
      }
      if (k.breathe.enabled && mark) {
        idles.push(
          gsap.timeline({ paused: true }).to(mark, {
            scale: k.breathe.scale,
            duration: k.breathe.duration,
            ease: k.breathe.ease,
            yoyo: true,
            repeat: -1
          })
        );
      }
      if (idles.length)
        tl.__loop = multiLoop(idles);
      return tl;
    };
    BUILD["audit-log"] = function(root, d) {
      var k = CONFIG5["audit-log"];
      var tl = gsap.timeline({ paused: true });
      var rows = series(root, "table-row", 7);
      var band = one(root, "active-row-bg");
      step(tl, one(root, "Header"), k.header, d);
      step(tl, one(root, "table-head"), k.head, d);
      step(tl, rows, k.rows, d);
      if (band && rows.length > 1 && k.walk.enabled) {
        var gap = rows[0].getBBox ? rows[1].getBBox().y - rows[0].getBBox().y : 40;
        tl.from(band, { autoAlpha: 0, duration: k.walk.fadeIn }, k.walk.at);
        var walk = gsap.timeline({ paused: true, repeat: -1, repeatDelay: k.walk.repeatDelay });
        for (var i = 1; i <= k.walk.rows; i++) {
          walk.to(band, { y: gap * i, duration: k.walk.stepDuration }, (i - 1) * k.walk.hold);
        }
        walk.to(band, { y: 0, duration: k.walk.resetDuration }, k.walk.rows * k.walk.hold);
        tl.__loop = walk;
      }
      return tl;
    };
    function parseColor(c) {
      if (!c)
        return [255, 255, 255];
      var m = /^#([0-9a-f]{3,8})$/i.exec(c.trim());
      if (m) {
        var h = m[1];
        if (h.length < 6)
          h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
      }
      m = /rgba?\(([^)]+)\)/i.exec(c);
      if (m) {
        var p = m[1].split(/[\s,/]+/).map(parseFloat);
        return [p[0] || 0, p[1] || 0, p[2] || 0];
      }
      return /^white$/i.test(c.trim()) ? [255, 255, 255] : [0, 0, 0];
    }
    function buildGridDrift(root, grid, cfg) {
      if (grid.__gridSrc) {
        var was = grid.__gridSrc;
        var orig = document.createElementNS(SVGNS, "path");
        Object.keys(was).forEach(function(n) {
          orig.setAttribute(n, was[n]);
        });
        grid.parentNode.insertBefore(orig, grid);
        grid.parentNode.removeChild(grid);
        grid = orig;
      }
      var parts = absSubpaths(grid);
      if (!parts)
        return null;
      var lattice = parts.filter(function(p) {
        return !p.closed;
      });
      var outline = parts.filter(function(p) {
        return p.closed;
      });
      if (lattice.length < 2)
        return null;
      var family = lattice.filter(function(p) {
        return cfg.axis === 2 ? p.ex <= p.sx : p.ex > p.sx;
      });
      if (family.length < 2)
        return null;
      var dir = cfg.reverse ? -1 : 1;
      var px = (family[1].sx - family[0].sx) * dir;
      var py = (family[1].sy - family[0].sy) * dir;
      var span = Math.sqrt(px * px + py * py);
      if (!span)
        return null;
      var svg = grid.ownerSVGElement || root;
      var defs = svg.querySelector("defs");
      var paint = (grid.getAttribute("stroke") || "").match(/url\(#([^)]+)\)/);
      var src = paint && svg.querySelector("#" + paint[1]);
      if (!defs || !src)
        return null;
      var uid2 = "grid-fade-" + (src.id || "x");
      var old = svg.querySelector("#" + uid2);
      if (old)
        old.parentNode.removeChild(old);
      var oldMask = svg.querySelector("#" + uid2 + "-mask");
      if (oldMask)
        oldMask.parentNode.removeChild(oldMask);
      var grad = src.cloneNode(true);
      grad.setAttribute("id", uid2);
      var stops = [].slice.call(grad.querySelectorAll("stop"));
      var info = stops.map(function(s) {
        var a = s.getAttribute("stop-opacity");
        return { el: s, alpha: a == null ? 1 : parseFloat(a), rgb: parseColor(s.getAttribute("stop-color")) };
      });
      var minA = Math.min.apply(null, info.map(function(s) {
        return s.alpha;
      }));
      var faded = info.filter(function(s) {
        return s.alpha === minA;
      });
      var ref = (faded.length === info.length ? info[info.length - 1] : faded[0]).rgb;
      var dist = info.map(function(s) {
        return (Math.abs(s.rgb[0] - ref[0]) + Math.abs(s.rgb[1] - ref[1]) + Math.abs(s.rgb[2] - ref[2])) / 3;
      });
      var maxD = Math.max.apply(null, dist);
      var flat = "#2B2D2E";
      var peak = -1;
      info.forEach(function(s, i) {
        var alpha = s.alpha * (maxD ? dist[i] / maxD : 1);
        if (alpha > peak) {
          peak = alpha;
          flat = s.el.getAttribute("stop-color") || flat;
        }
        s.el.setAttribute("stop-color", "#fff");
        s.el.setAttribute("stop-opacity", String(alpha));
      });
      defs.appendChild(grad);
      var box = (svg.getAttribute("viewBox") || "0 0 776 874").split(/[\s,]+/).map(Number);
      var mask = document.createElementNS(SVGNS, "mask");
      mask.setAttribute("id", uid2 + "-mask");
      mask.setAttribute("maskUnits", "userSpaceOnUse");
      mask.setAttribute("x", box[0]);
      mask.setAttribute("y", box[1]);
      mask.setAttribute("width", box[2]);
      mask.setAttribute("height", box[3]);
      var fade = document.createElementNS(SVGNS, "rect");
      fade.setAttribute("x", box[0]);
      fade.setAttribute("y", box[1]);
      fade.setAttribute("width", box[2]);
      fade.setAttribute("height", box[3]);
      fade.setAttribute("fill", "url(#" + uid2 + ")");
      mask.appendChild(fade);
      defs.appendChild(mask);
      var wrap = document.createElementNS(SVGNS, "g");
      var src0 = {};
      for (var a2 = 0; a2 < grid.attributes.length; a2++) {
        var at = grid.attributes[a2];
        src0[at.name] = at.value;
        if (at.name !== "d" && at.name !== "stroke")
          wrap.setAttribute(at.name, at.value);
      }
      wrap.__gridSrc = src0;
      if (outline.length) {
        var edge = document.createElementNS(SVGNS, "path");
        edge.setAttribute("d", outline.map(function(p) {
          return p.d;
        }).join(""));
        edge.setAttribute("stroke", grid.getAttribute("stroke"));
        wrap.appendChild(edge);
      }
      var band = document.createElementNS(SVGNS, "g");
      band.setAttribute("mask", "url(#" + uid2 + "-mask)");
      band.setAttribute("stroke", flat);
      wrap.appendChild(band);
      var latD = lattice.map(function(p) {
        return p.d;
      }).join("");
      var copies = [-1, 0, 1].map(function(n) {
        var el2 = document.createElementNS(SVGNS, "path");
        el2.setAttribute("d", latD);
        el2.setAttribute("data-systems-grid", String(n));
        band.appendChild(el2);
        return { el: el2, n };
      });
      grid.parentNode.insertBefore(wrap, grid);
      grid.parentNode.removeChild(grid);
      var loop = gsap.timeline({ paused: true, repeat: -1 });
      copies.forEach(function(c) {
        loop.fromTo(
          c.el,
          { x: c.n * px, y: c.n * py },
          { x: (c.n + 1) * px, y: (c.n + 1) * py, duration: span / cfg.speed, ease: "none" },
          0
        );
      });
      return { node: wrap, loop };
    }
    BUILD.systems = function(root, d) {
      var k = CONFIG5.systems;
      var tl = gsap.timeline({ paused: true });
      var after = one(root, "after");
      if (!after)
        return tl;
      var tiles = [].slice.call(after.children).filter(function(el2) {
        return /^app-card/.test(el2.getAttribute("data-anim") || "");
      });
      var core = one(root, "human-intelligence");
      var label = one(root, "label");
      var plate = one(root, "base-lines");
      var grid = one(root, "grid");
      if (!tiles.length || !core)
        return tl;
      var cb = core.getBBox();
      var cx = cb.x + cb.width / 2;
      var cy = cb.y + cb.height / 2;
      var stale = root.querySelectorAll("[data-systems-ghost],[data-systems-pulse]");
      for (var s = 0; s < stale.length; s++)
        stale[s].parentNode.removeChild(stale[s]);
      var lit = [];
      var ghosts = [];
      tiles.forEach(function(tile) {
        var strokes = [].slice.call(tile.querySelectorAll("path[stroke]"));
        if (!strokes.length) {
          lit.push([]);
          ghosts.push(null);
          return;
        }
        var ghost = strokes[0].cloneNode(false);
        ghost.setAttribute("stroke", k.before.stroke);
        ghost.setAttribute("stroke-dasharray", k.before.dash);
        ghost.removeAttribute("data-anim");
        ghost.setAttribute("data-systems-ghost", "");
        strokes[0].parentNode.insertBefore(ghost, strokes[0]);
        gsap.set(strokes, { autoAlpha: 0 });
        lit.push(strokes);
        ghosts.push(ghost);
      });
      step(tl, tiles, k.tiles, d, { transformOrigin: "center center" });
      if (label) {
        var lb = label.getBBox();
        var dx = cx - (lb.x + lb.width / 2);
        var dy = cy - (lb.y + lb.height / 2);
        gsap.set(label, { x: dx, y: dy, autoAlpha: 0, transformOrigin: "center center" });
        tl.fromTo(
          label,
          { autoAlpha: 0, scale: k.label.from.scale, y: dy + k.label.from.y * d },
          { autoAlpha: 1, scale: 1, y: dy, duration: k.label.duration },
          k.label.at
        ).to(
          label,
          { autoAlpha: 0, scale: k.labelOut.scale, duration: k.labelOut.duration },
          k.labelOut.at
        );
      }
      gsap.set(core, { transformOrigin: "center center" });
      step(tl, core, k.core, d);
      var delays = radialDelays(tiles, cx, cy);
      tiles.forEach(function(tile, i) {
        var at = k.light.at + delays[i] * k.light.spread;
        if (ghosts[i])
          tl.to(ghosts[i], { autoAlpha: 0, duration: k.light.duration, ease: k.light.ease }, at);
        if (lit[i].length)
          tl.to(lit[i], { autoAlpha: 1, duration: k.light.duration, ease: k.light.ease }, at);
      });
      var drift = grid && k.gridDrift.enabled ? buildGridDrift(root, grid, k.gridDrift) : null;
      if (drift)
        grid = drift.node;
      if (grid)
        step(tl, grid, k.grid, d);
      if (plate) {
        dashPrime(plate);
        tl.to(plate, { strokeDashoffset: 0, duration: k.plate.duration, ease: k.plate.ease }, k.plate.at);
      }
      var lines = series(root, "lines", 6).map(function(g) {
        var path = g.querySelector("path");
        if (!path)
          return null;
        var len = path.getTotalLength();
        var near = { dist: Infinity, at: 0 };
        for (var s2 = 0; s2 <= 160; s2++) {
          var at = len * s2 / 160;
          var p = path.getPointAtLength(at);
          var dist = Math.hypot(p.x - cx, p.y - cy);
          if (dist < near.dist)
            near = { dist, at };
        }
        var a = path.getPointAtLength(0);
        var b = path.getPointAtLength(len);
        var startsAtCore = Math.hypot(a.x - cx, a.y - cy) <= Math.hypot(b.x - cx, b.y - cy);
        var through = near.dist <= k.lines.centreSplit && near.at > len * 0.05 && near.at < len * 0.95;
        gsap.set(g, { autoAlpha: 0 });
        if (through) {
          gsap.set(path, { strokeDasharray: "0 " + near.at + " 0 " + len });
        } else {
          var fromNear = k.lines.chordReverse ? !startsAtCore : startsAtCore;
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: fromNear ? len : -len });
        }
        return {
          group: g,
          path,
          len,
          startsAtCore,
          through,
          // how far from the mark this line starts growing — the running order
          reach: through ? 0 : Math.min(Math.hypot(a.x - cx, a.y - cy), Math.hypot(b.x - cx, b.y - cy))
        };
      }).filter(Boolean);
      lines.sort(function(p, q) {
        return p.reach - q.reach;
      });
      lines.forEach(function(l, i) {
        var at = k.lines.at + i * k.lines.stagger + (l.through ? 0 : k.lines.chordDelay);
        tl.to(l.group, { autoAlpha: 1, duration: k.lines.fadeIn }, at);
        tl.to(
          l.path,
          l.through ? { strokeDasharray: "0 0 " + l.len + " 0", duration: k.lines.duration, ease: k.lines.ease } : { strokeDashoffset: 0, duration: k.lines.duration, ease: k.lines.ease },
          at
        );
      });
      var loops = [];
      if (k.pulse.enabled && lines.length) {
        var pulses = gsap.timeline({ paused: true, repeat: -1, repeatDelay: k.pulse.cycleDelay });
        lines.forEach(function(l, i) {
          var pulse = l.path.cloneNode(false);
          pulse.setAttribute("stroke", k.pulse.tint);
          pulse.setAttribute("stroke-width", String(k.pulse.strokeWidth));
          pulse.setAttribute("stroke-linecap", "round");
          pulse.removeAttribute("data-anim");
          pulse.setAttribute("data-systems-pulse", "");
          pulse.style.opacity = "0";
          l.path.parentNode.insertBefore(pulse, l.path.nextSibling);
          var seg = Math.min(k.pulse.length, l.len * 0.5);
          gsap.set(pulse, { strokeDasharray: seg + " " + l.len });
          var from = l.startsAtCore ? -l.len : seg;
          var to = l.startsAtCore ? seg : -l.len;
          var at = i * k.pulse.stagger;
          pulses.set(pulse, { strokeDashoffset: from, opacity: 1 }, at).to(pulse, { strokeDashoffset: to, duration: k.pulse.duration, ease: "none" }, at).to(pulse, { opacity: 0, duration: k.pulse.fadeOut }, at + k.pulse.duration - k.pulse.fadeOut);
        });
        loops.push(pulses);
      }
      if (k.breathe.enabled) {
        loops.push(
          gsap.timeline({ paused: true, repeat: -1, yoyo: true }).to(core, {
            scale: k.breathe.scale,
            duration: k.breathe.duration,
            ease: k.breathe.ease
          })
        );
      }
      if (loops.length)
        tl.__loop = multiLoop(loops);
      if (drift)
        tl.__loopNow = drift.loop;
      return tl;
    };
    var wipeUid = 0;
    function cardRows(card) {
      return [].slice.call(card.querySelectorAll("g")).filter(function(g) {
        var text = false, icon = false;
        for (var i = 0; i < g.children.length; i++) {
          var kid = g.children[i];
          var n = kid.getAttribute("data-anim") || "";
          if (kid.tagName === "path" && /^text/.test(n))
            text = true;
          else if (kid.tagName === "g" && /^Icon/.test(n))
            icon = true;
        }
        return text && icon;
      });
    }
    function makeWipe(root, path, len, fromCore, width) {
      var defs = root.querySelector("defs");
      if (!defs) {
        defs = document.createElementNS(SVGNS, "defs");
        root.insertBefore(defs, root.firstChild);
      }
      var vb = (root.getAttribute("viewBox") || "0 0 1000 1000").split(/[\s,]+/).map(Number);
      var id = "hi-agents-wipe-" + ++wipeUid;
      var mask = document.createElementNS(SVGNS, "mask");
      mask.setAttribute("id", id);
      mask.setAttribute("maskUnits", "userSpaceOnUse");
      mask.setAttribute("x", vb[0]);
      mask.setAttribute("y", vb[1]);
      mask.setAttribute("width", vb[2]);
      mask.setAttribute("height", vb[3]);
      mask.setAttribute("data-agents-wipe", "");
      var w = path.cloneNode(false);
      w.removeAttribute("data-anim");
      w.setAttribute("fill", "none");
      w.setAttribute("stroke", "#fff");
      w.setAttribute("stroke-width", String(width));
      w.setAttribute("stroke-linecap", "round");
      w.setAttribute("stroke-dasharray", String(len));
      w.setAttribute("stroke-dashoffset", String(fromCore ? len : -len));
      mask.appendChild(w);
      defs.appendChild(mask);
      return { id, path: w };
    }
    BUILD.agents = function(root, d) {
      var k = CONFIG5.agents;
      var tl = gsap.timeline({ paused: true });
      var logo = one(root, "humain-intelligence-logo") || one(root, "logo");
      var cardsGroup = one(root, "cards");
      if (!logo || !cardsGroup)
        return tl;
      var panel = one(root, "bg");
      var chipsGroup = one(root, "ai-agents");
      var stale = root.querySelectorAll("[data-agents-wipe]");
      for (var s = 0; s < stale.length; s++)
        stale[s].parentNode.removeChild(stale[s]);
      var lb = logo.getBBox();
      var cx = lb.x + lb.width / 2;
      var cy = lb.y + lb.height / 2;
      if (panel)
        step(tl, panel, k.panel, d, { transformOrigin: "center center" });
      tl.from(
        logo,
        {
          autoAlpha: 0,
          scale: k.mark.from.scale,
          svgOrigin: cx + " " + cy,
          duration: k.mark.duration,
          ease: k.mark.ease
        },
        k.mark.at
      );
      if (chipsGroup) {
        var chips = [].slice.call(chipsGroup.children);
        if (chips.length)
          step(tl, chips, k.chips, d, { transformOrigin: "center center" });
      }
      var cards = [].slice.call(cardsGroup.children);
      var delays = radialDelays(cards, cx, cy);
      cards.forEach(function(card, i) {
        var b = card.getBBox();
        var vx = b.x + b.width / 2 - cx;
        var vy = b.y + b.height / 2 - cy;
        var m = Math.hypot(vx, vy) || 1;
        var at = k.cards.at + delays[i] * k.cards.spread;
        tl.from(
          card,
          {
            autoAlpha: 0,
            x: -vx / m * k.cards.from.dist * d,
            y: -vy / m * k.cards.from.dist * d,
            scale: k.cards.from.scale,
            transformOrigin: "center center",
            duration: k.cards.duration,
            ease: k.cards.ease
          },
          at
        );
        var rows = cardRows(card);
        if (!rows.length)
          return;
        var rv = {
          autoAlpha: 0,
          x: k.rows.from.x * d,
          duration: k.rows.duration,
          stagger: k.rows.stagger
        };
        if (k.rows.ease)
          rv.ease = k.rows.ease;
        tl.from(rows, rv, at + k.rows.at);
      });
      var lines = matching(root, /^(Connector line|lines)(_\d+)?$/).map(function(g) {
        var path = g.querySelector("path");
        if (!path)
          return null;
        var len = path.getTotalLength();
        var a = path.getPointAtLength(0);
        var b = path.getPointAtLength(len);
        var startsAtCore = Math.hypot(a.x - cx, a.y - cy) <= Math.hypot(b.x - cx, b.y - cy);
        var wipe = makeWipe(root, path, len, startsAtCore, k.lines.wipeWidth);
        g.setAttribute("mask", "url(#" + wipe.id + ")");
        var dash = (path.getAttribute("stroke-dasharray") || "4 4").split(/[\s,]+/).map(parseFloat).filter(function(n) {
          return !isNaN(n);
        });
        var period = dash.reduce(function(t, n) {
          return t + n;
        }, 0) || 8;
        if (dash.length % 2)
          period *= 2;
        return { group: g, path, wipe: wipe.path, len, startsAtCore, period };
      }).filter(Boolean);
      lines.forEach(function(l, i) {
        tl.to(
          l.wipe,
          { strokeDashoffset: 0, duration: k.lines.duration, ease: k.lines.ease },
          k.lines.at + i * k.lines.stagger
        );
      });
      if (k.crawl.enabled && lines.length) {
        var crawl = gsap.timeline({ paused: true, repeat: -1 });
        lines.forEach(function(l) {
          var toward = k.crawl.direction === "out" ? !l.startsAtCore : l.startsAtCore;
          gsap.set(l.path, { strokeDashoffset: 0 });
          crawl.to(
            l.path,
            {
              strokeDashoffset: toward ? l.period : -l.period,
              duration: l.period / k.crawl.speed,
              ease: "none"
            },
            0
          );
        });
        tl.__loopNow = crawl;
      }
      var loops = [];
      if (k.breathe.enabled) {
        gsap.set(logo, { transformOrigin: "center center" });
        loops.push(
          gsap.timeline({ paused: true, repeat: -1, yoyo: true }).to(logo, {
            scale: k.breathe.scale,
            duration: k.breathe.duration,
            ease: k.breathe.ease
          })
        );
      }
      if (loops.length)
        tl.__loop = multiLoop(loops);
      return tl;
    };
    BUILD["agents-mobile"] = BUILD.agents;
    CONFIG5["agents-mobile"] = CONFIG5.agents;
    function byDepth(list) {
      return list.map(function(el2) {
        return { el: el2, y: el2.getBBox().y };
      }).sort(function(a, b) {
        return a.y - b.y;
      }).map(function(r) {
        return r.el;
      });
    }
    function childrenNamed(group, base) {
      if (!group)
        return [];
      var re = new RegExp("^" + base + "(_\\d+)?$");
      return [].slice.call(group.children).filter(function(el2) {
        return re.test(el2.getAttribute("data-anim") || "");
      });
    }
    BUILD["warehouse-hero"] = function(root, d) {
      var k = CONFIG5["warehouse-hero"];
      var tl = gsap.timeline({ paused: true });
      var logo = one(root, "HI-LogoBlack");
      if (!logo)
        return tl;
      var art = logo;
      while (art.parentNode && art.parentNode !== root)
        art = art.parentNode;
      if (!art.parentNode)
        return tl;
      var stale = root.querySelectorAll("[data-agents-wipe]");
      for (var s = 0; s < stale.length; s++)
        stale[s].parentNode.removeChild(stale[s]);
      var grid = null, lid = null, shell = null, slab = null;
      var lines = [], labels = [], plates = [], cubes = [], loose = [], smalls = [], bigs = [];
      [].slice.call(art.children).forEach(function(el2) {
        var b = el2.getBBox();
        var item = { el: el2, b, cx: b.x + b.width / 2, cy: b.y + b.height / 2, icons: [] };
        if (el2.tagName === "path" && el2.getAttribute("stroke-dasharray"))
          lines.push(item);
        else if (el2.__gridSrc || el2.tagName === "path" && /url\(/.test(el2.getAttribute("stroke") || "") && b.width > 400)
          grid = el2;
        else if (el2.contains(logo))
          lid = item;
        else if (el2.tagName === "g" && el2.firstElementChild && el2.firstElementChild.tagName === "rect")
          labels.push(item);
        else if (el2.tagName === "g" && Math.abs(b.width - 62) < 4 && Math.abs(b.height - 64) < 4)
          cubes.push(item);
        else if (el2.tagName === "g" && b.width > 110 && b.width < 140 && b.height < 90)
          plates.push(item);
        else if (b.width > 200)
          bigs.push(item);
        else
          smalls.push(item);
      });
      bigs.sort(function(a, b) {
        return b.b.height - a.b.height;
      });
      shell = bigs[0] || null;
      slab = bigs[1] || null;
      if (!shell)
        return tl;
      var sx0 = shell.b.x, sx1 = shell.b.x + shell.b.width;
      var scx = shell.cx, scy = shell.cy;
      cubes = cubes.filter(function(c2) {
        var out = c2.b.x < sx0 - 1 || c2.b.x + c2.b.width > sx1 + 1;
        if (out)
          loose.push(c2);
        return !out;
      });
      var hosts = plates.concat(cubes, loose);
      smalls.forEach(function(s2) {
        var best = null;
        hosts.forEach(function(h2) {
          var inside = s2.cx > h2.b.x && s2.cx < h2.b.x + h2.b.width && s2.cy > h2.b.y && s2.cy < h2.b.y + h2.b.height;
          if (inside && (!best || h2.b.width * h2.b.height < best.b.width * best.b.height))
            best = h2;
        });
        if (best)
          best.icons.push(s2.el);
      });
      function withIcons(h2) {
        return [h2.el].concat(h2.icons);
      }
      var vb = (root.getAttribute("viewBox") || "0 0 724 498").split(/[\s,]+/).map(Number);
      function headroom(b) {
        return Math.max(0, b.y - vb[1] - (k.edgeGuard || 0));
      }
      var drift = grid && k.gridDrift.enabled ? buildGridDrift(root, grid, k.gridDrift) : null;
      if (drift)
        grid = drift.node;
      if (grid)
        step(tl, grid, k.grid, d, { data: "grid" });
      if (slab)
        step(tl, slab.el, k.slab, d, { transformOrigin: "center center", data: "slab" });
      plates.sort(function(a, b) {
        return a.b.y - b.b.y;
      });
      plates.forEach(function(p, i) {
        tl.from(
          withIcons(p),
          {
            autoAlpha: 0,
            // rising from below needs no clamp; dropping in is capped at headroom
            y: k.plates.from.y > 0 ? k.plates.from.y * d : -Math.min(Math.abs(k.plates.from.y * d), headroom(p.b)),
            scale: k.plates.from.scale,
            svgOrigin: p.cx + " " + p.cy,
            duration: k.plates.duration,
            ease: k.plates.ease,
            data: "plates"
          },
          k.plates.at + i * k.plates.stagger
        );
      });
      function conduit(item) {
        var path = item.el;
        var len = path.getTotalLength();
        if (!len)
          return null;
        var a = path.getPointAtLength(0);
        var z = path.getPointAtLength(len);
        var vertical = Math.abs(a.x - z.x) < 1;
        var towardStart = vertical ? k.lines.flow === "up" ? a.y < z.y : a.y > z.y : Math.hypot(a.x - scx, a.y - scy) < Math.hypot(z.x - scx, z.y - scy);
        var wipe = makeWipe(root, path, len, !towardStart, vertical ? k.lines.wipeWidth : k.ingest.wipeWidth);
        wipe.path.removeAttribute("opacity");
        path.setAttribute("mask", "url(#" + wipe.id + ")");
        return { path, wipe: wipe.path, vertical, towardStart, period: dashPeriod2(path, 8) };
      }
      var runs = lines.map(conduit).filter(Boolean);
      var drops = runs.filter(function(r) {
        return r.vertical;
      });
      var feeds = runs.filter(function(r) {
        return !r.vertical;
      });
      var lidEnd = k.lid.at + k.lid.duration;
      function underLid(b) {
        return lid && b.y >= lid.b.y - 1 && b.y + b.height <= lid.b.y + lid.b.height + 2 && b.x >= lid.b.x - 1 && b.x + b.width <= lid.b.x + lid.b.width + 1;
      }
      var edgeIdx = 0;
      drops.forEach(function(r) {
        if (underLid(r.path.getBBox())) {
          tl.to(r.wipe, { strokeDashoffset: 0, duration: 0.01, data: "lid" }, lidEnd);
          return;
        }
        tl.to(r.wipe, { strokeDashoffset: 0, duration: k.lines.duration, ease: k.lines.ease, data: "lines" }, k.lines.at + edgeIdx++ * k.lines.stagger);
      });
      var shellPaths = [].slice.call(shell.el.querySelectorAll("path"));
      var edge = shellPaths.filter(function(p) {
        return p.getAttribute("stroke");
      })[0];
      var glass = shellPaths.filter(function(p) {
        return !p.getAttribute("stroke");
      });
      var parts = edge && absSubpaths(edge);
      if (parts && parts.length > 1) {
        var probe = document.createElementNS(SVGNS, "path");
        edge.parentNode.appendChild(probe);
        var lens = parts.map(function(p) {
          probe.setAttribute("d", p.d);
          return probe.getTotalLength();
        });
        edge.parentNode.removeChild(probe);
        var walls = lens[lens.length - 1];
        var dashAt = function(p) {
          var a2 = walls / 2 * p;
          return a2 + " " + Math.max(0, walls - 2 * a2) + " " + a2;
        };
        var draw = { p: 0 };
        gsap.set(edge, { strokeDasharray: dashAt(0) });
        tl.from(shell.el, { autoAlpha: 0, duration: 0.01, data: "shell" }, k.shell.at);
        tl.to(draw, {
          p: 1,
          duration: k.shell.duration,
          ease: k.shell.ease,
          data: "shell",
          onUpdate: function() {
            edge.style.strokeDasharray = dashAt(draw.p);
          }
        }, k.shell.at);
        if (glass.length)
          tl.from(glass, { opacity: 0, duration: k.shell.duration, ease: "power1.out", data: "shell" }, k.shell.at);
      } else {
        step(tl, shell.el, k.shell, d, { transformOrigin: "center center", data: "shell" });
      }
      cubes.sort(function(a, b) {
        return b.b.y + b.b.height - (a.b.y + a.b.height) || a.b.x - b.b.x;
      });
      var cubeIdx = 0;
      cubes.forEach(function(c2) {
        if (underLid(c2.b)) {
          tl.from(withIcons(c2), { autoAlpha: 0, duration: 0.01, data: "lid" }, lidEnd);
          return;
        }
        tl.from(
          withIcons(c2),
          { autoAlpha: 0, y: k.cubes.from.y * d, duration: k.cubes.duration, ease: k.cubes.ease, data: "cubes" },
          k.cubes.at + cubeIdx++ * k.cubes.stagger
        );
      });
      if (lid)
        step(tl, lid.el, k.lid, d, { data: "lid", transformOrigin: "center center" });
      gsap.set(logo, { transformOrigin: "center center" });
      step(tl, logo, k.logo, d, { data: "logo" });
      loose.sort(function(a, b) {
        return a.cx - b.cx;
      });
      loose.forEach(function(c2, i) {
        var side = c2.cx < scx ? -1 : 1;
        tl.from(
          withIcons(c2),
          {
            autoAlpha: 0,
            x: side * k.loose.travel * 0.866 * d,
            y: k.loose.travel * 0.5 * d,
            duration: k.loose.duration,
            ease: k.loose.ease,
            data: "loose"
          },
          k.loose.at + i * k.loose.stagger
        );
      });
      feeds.forEach(function(r, i) {
        tl.to(r.wipe, { strokeDashoffset: 0, duration: k.ingest.duration, ease: k.ingest.ease, data: "ingest" }, k.ingest.at + i * k.ingest.stagger);
      });
      labels.sort(function(a, b) {
        return b.b.y - a.b.y;
      });
      var chips = labels.map(function(l) {
        return l.el;
      });
      if (chips.length) {
        gsap.set(chips, { transformOrigin: "center center" });
        step(tl, chips, k.labels, d, { data: "labels" });
      }
      var immediate = [];
      if (drift)
        immediate.push(drift.loop);
      if (k.crawl.enabled && runs.length) {
        var crawl = gsap.timeline({ paused: true, repeat: -1 });
        runs.forEach(function(r) {
          gsap.set(r.path, { strokeDashoffset: 0 });
          crawl.to(
            r.path,
            { strokeDashoffset: r.towardStart ? r.period : -r.period, duration: r.period / k.crawl.speed, ease: "none" },
            0
          );
        });
        immediate.push(crawl);
      }
      var pending = [];
      plates.forEach(function(p) {
        [].forEach.call(p.el.querySelectorAll("[stroke-dasharray]"), function(el2) {
          pending.push(el2);
        });
      });
      if (k.pendingCrawl.enabled && pending.length) {
        var march = gsap.timeline({ paused: true, repeat: -1 });
        pending.forEach(function(el2) {
          var period = dashPeriod2(el2, 8);
          gsap.set(el2, { strokeDashoffset: 0 });
          march.to(el2, { strokeDashoffset: -period, duration: period / k.pendingCrawl.speed, ease: "none" }, 0);
        });
        immediate.push(march);
      }
      if (immediate.length)
        tl.__loopNow = multiLoop(immediate);
      var loops = [];
      var BLUE = k.tint.color.toLowerCase();
      var lidBottom = lid ? lid.b.y + lid.b.height : -Infinity;
      var lit = cubes.filter(function(c2) {
        return c2.cy > lidBottom - 8;
      }).map(function(c2) {
        var paths = [].slice.call(c2.el.querySelectorAll("path[stroke]"));
        return {
          base: paths.filter(function(p) {
            return !/url\(/.test(p.getAttribute("stroke"));
          }),
          overlay: paths.filter(function(p) {
            return /url\(/.test(p.getAttribute("stroke"));
          })
        };
      }).filter(function(c2) {
        return c2.base.length && c2.overlay.length && c2.base[0].getAttribute("stroke").toLowerCase() !== BLUE;
      });
      if (k.tint.enabled && lit.length > 1) {
        var t = k.tint;
        var wave = gsap.timeline({ paused: true, repeat: -1 });
        var n = lit.length;
        var stride = 1;
        for (var st = Math.max(2, Math.round(n * 0.38)); st < n; st++) {
          var g = n, h = st;
          while (h) {
            var tmp = g % h;
            g = h;
            h = tmp;
          }
          if (g === 1) {
            stride = st;
            break;
          }
        }
        for (var j = 0; j < n; j++) {
          var c = lit[j * stride % n];
          var at = j * (t.duration + t.gap);
          var orig = c.base[0].getAttribute("stroke");
          wave.to(c.base, { stroke: t.color, duration: t.duration, ease: "power1.inOut" }, at).to(c.overlay, { opacity: 0, duration: t.duration, ease: "power1.inOut" }, at).to(c.base, { stroke: orig, duration: t.duration, ease: "power1.inOut" }, at + t.duration + t.hold).to(c.overlay, { opacity: 1, duration: t.duration, ease: "power1.inOut" }, at + t.duration + t.hold);
        }
        loops.push(wave);
      }
      if (k.plateFloat.enabled && plates.length) {
        var float = gsap.timeline({ paused: true, repeat: -1, yoyo: true });
        plates.forEach(function(p, i) {
          var rise = Math.min(Math.abs(k.plateFloat.y * d), headroom(p.b));
          if (!rise)
            return;
          float.to(withIcons(p), { y: -rise, duration: k.plateFloat.duration, ease: k.plateFloat.ease }, i * k.plateFloat.stagger);
        });
        if (float.duration())
          loops.push(float);
      }
      if (k.looseFloat.enabled && loose.length) {
        var bob = gsap.timeline({ paused: true, repeat: -1, yoyo: true });
        loose.forEach(function(c2, i) {
          bob.to(withIcons(c2), { y: k.looseFloat.y * d, duration: k.looseFloat.duration, ease: k.looseFloat.ease }, i * k.looseFloat.stagger);
        });
        loops.push(bob);
      }
      if (loops.length)
        tl.__loop = multiLoop(loops);
      return tl;
    };
    function dashPeriod2(el2, fallback) {
      var raw = el2.getAttribute("stroke-dasharray") || el2.parentNode && el2.parentNode.getAttribute && el2.parentNode.getAttribute("stroke-dasharray") || "";
      var dash = raw.split(/[\s,]+/).map(parseFloat).filter(function(n) {
        return !isNaN(n);
      });
      var period = dash.reduce(function(t, n) {
        return t + n;
      }, 0) || fallback || 8;
      if (dash.length % 2)
        period *= 2;
      return period;
    }
    function phaseOf(path, len, x, y) {
      var best = 0, bestD = Infinity;
      for (var i = 0; i <= 240; i++) {
        var p = path.getPointAtLength(i / 240 * len);
        var dd = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y);
        if (dd < bestD) {
          bestD = dd;
          best = i / 240;
        }
      }
      return best;
    }
    function buildModels(name) {
      return function(root, d) {
        var k = CONFIG5[name];
        var tl = gsap.timeline({ paused: true });
        var panel = one(root, "main-bg");
        if (!panel)
          return tl;
        var rings = matching(root, /^\d+$/);
        var head = one(root, "head");
        var label = one(root, "label");
        var appDots = matching(root, /^app-dot(_\d+)?$/);
        var hl = k.highlight;
        var idle = hl.rowIdle;
        var stale = root.querySelectorAll("[data-agents-wipe]");
        for (var s = 0; s < stale.length; s++)
          stale[s].parentNode.removeChild(stale[s]);
        var rows = matching(root, /^row-wrap(_\d+)?$/).map(function(wrap) {
          var group = null, brackets = [];
          for (var i = 0; i < wrap.children.length; i++) {
            var kid = wrap.children[i];
            if (kid.tagName === "path" && kid.getAttribute("stroke-dasharray"))
              brackets.push(kid);
            else if (kid.tagName === "g" && !group)
              group = kid;
          }
          var dots = group ? [].slice.call(group.children).filter(function(c) {
            return c.tagName === "circle";
          }) : [];
          return {
            wrap,
            brackets,
            dots,
            key: null,
            dotFill: dots[0] && dots[0].getAttribute("fill") || "#8B95AA",
            stroke: brackets[0] && brackets[0].getAttribute("stroke") || "#8B95AA"
          };
        });
        var pc = panel.getBBox();
        var panelX = pc.x + pc.width / 2;
        var panelY = pc.y + pc.height / 2;
        var apps = matching(root, /-part$/).map(function(part) {
          var line = part.querySelector("path");
          if (!line)
            return null;
          var len = line.getTotalLength();
          if (!len)
            return null;
          var a = line.getPointAtLength(0);
          var b = line.getPointAtLength(len);
          var da = Math.pow(a.x - panelX, 2) + Math.pow(a.y - panelY, 2);
          var db = Math.pow(b.x - panelX, 2) + Math.pow(b.y - panelY, 2);
          var forward = db < da;
          var dots = [].slice.call(part.children).filter(function(c) {
            return c.tagName === "circle";
          }).map(function(node) {
            var cx = parseFloat(node.getAttribute("cx")) || 0;
            var cy = parseFloat(node.getAttribute("cy")) || 0;
            var t = phaseOf(line, len, cx, cy);
            return { node, cx, cy, phase: forward ? t : 1 - t };
          }).sort(function(x, y) {
            return x.phase - y.phase;
          });
          var first = dots.length ? dots[0].phase : 0;
          dots.forEach(function(m) {
            m.phase -= first;
          });
          var endPt = line.getPointAtLength(forward ? len : 0);
          return {
            key: (part.getAttribute("data-anim") || "").replace(/-part$/, ""),
            icon: part.querySelector("g"),
            endX: endPt.x,
            line,
            len,
            forward,
            period: dashPeriod2(line, 4.5),
            dots,
            row: null,
            place: function(m, t) {
              var p = line.getPointAtLength((forward ? t : 1 - t) * len);
              gsap.set(m.node, { x: p.x - m.cx, y: p.y - m.cy });
            }
          };
        }).filter(Boolean);
        rows.forEach(function(r) {
          var names = [].slice.call(r.wrap.querySelectorAll("[data-anim]")).map(function(el2) {
            return (el2.getAttribute("data-anim") || "").toLowerCase();
          });
          for (var i = 0; i < apps.length; i++) {
            if (apps[i].row)
              continue;
            var key = apps[i].key.toLowerCase();
            var hit = names.some(function(n) {
              return n.indexOf(key) === 0;
            });
            if (hit) {
              apps[i].row = r;
              r.key = apps[i].key;
              return;
            }
          }
        });
        if (k.flow.pairFallback) {
          var free = rows.filter(function(r) {
            return !r.key;
          });
          apps.forEach(function(a) {
            if (a.row || !free.length)
              return;
            a.row = free.shift();
            a.row.key = a.key;
          });
        }
        if (rings.length) {
          gsap.set(rings, { transformOrigin: "center center" });
          step(tl, rings, k.rings, d);
        }
        gsap.set(panel, { transformOrigin: "center center" });
        step(tl, panel, k.panel, d);
        if (head)
          step(tl, head, k.head, d);
        var ordered = rows.slice().sort(function(x, y) {
          return x.wrap.getBBox().y - y.wrap.getBBox().y;
        });
        if (k.rows.order === "bottom")
          ordered.reverse();
        if (idle < 1) {
          gsap.set(rows.map(function(r) {
            return r.wrap;
          }), { opacity: idle });
          rows.forEach(function(r) {
            r.wrap.setAttribute("data-flow-idle", "");
          });
        }
        step(tl, ordered.map(function(r) {
          return r.wrap;
        }), k.rows, d);
        if (label) {
          gsap.set(label, { transformOrigin: "center center" });
          step(tl, label, k.label, d);
        }
        var icons = apps.map(function(a) {
          return a.icon;
        }).filter(Boolean);
        if (icons.length)
          gsap.set(icons, { transformOrigin: "center center" });
        step(tl, icons.concat(appDots), k.sources, d);
        apps.forEach(function(a, i) {
          var wipe = makeWipe(root, a.line, a.len, a.forward, k.lines.wipeWidth);
          wipe.path.removeAttribute("opacity");
          a.line.setAttribute("mask", "url(#" + wipe.id + ")");
          tl.to(
            wipe.path,
            { strokeDashoffset: 0, duration: k.lines.duration, ease: k.lines.ease },
            k.lines.at + i * k.lines.stagger
          );
        });
        var movers = [];
        apps.forEach(function(a) {
          a.dots.forEach(function(m) {
            movers.push(m.node);
          });
        });
        if (k.flow.enabled && movers.length) {
          gsap.set(movers, { autoAlpha: 0, transformOrigin: "center center" });
          movers.forEach(function(n) {
            n.setAttribute("data-flow-hidden", "");
          });
        }
        var immediate = [];
        if (k.crawl.enabled && apps.length) {
          var crawl = gsap.timeline({ paused: true, repeat: -1 });
          apps.forEach(function(a) {
            gsap.set(a.line, { strokeDashoffset: 0 });
            crawl.to(
              a.line,
              {
                strokeDashoffset: a.forward ? -a.period : a.period,
                duration: a.period / k.crawl.speed,
                ease: "none"
              },
              0
            );
          });
          immediate.push(crawl);
        }
        if (hl.bracketCrawl) {
          var bcrawl = gsap.timeline({ paused: true, repeat: -1 });
          var any = false;
          rows.forEach(function(r) {
            r.brackets.forEach(function(p) {
              var per = dashPeriod2(p, 8);
              gsap.set(p, { strokeDashoffset: 0 });
              bcrawl.to(p, { strokeDashoffset: -per, duration: per / hl.crawlSpeed, ease: "none" }, 0);
              any = true;
            });
          });
          if (any)
            immediate.push(bcrawl);
        }
        if (immediate.length)
          tl.__loopNow = multiLoop(immediate);
        var loops = [];
        var f = k.flow;
        var count = k.count && k.count.enabled ? k.count : null;
        var pick = function(r) {
          return r[0] + Math.floor(Math.random() * (r[1] - r[0] + 1));
        };
        var fmt = function(v) {
          return Math.round(v).toLocaleString("en-US");
        };
        rows.forEach(function(r) {
          r.count = count && r.wrap.querySelector('[data-anim="count"]');
          if (!r.count)
            return;
          r.value = pick(count.start);
          r.count.textContent = fmt(r.value);
        });
        var bump = function(r) {
          var from = { v: r.value };
          r.value += pick(count.step);
          gsap.to(from, {
            v: r.value,
            duration: count.duration,
            ease: "power2.out",
            onUpdate: function() {
              r.count.textContent = fmt(from.v);
            }
          });
        };
        if (f.enabled && apps.length) {
          var order = apps;
          if (f.order && f.order.length) {
            var named = f.order.map(function(key) {
              return apps.filter(function(a) {
                return a.key === key;
              })[0];
            }).filter(Boolean);
            order = named.concat(apps.filter(function(a) {
              return named.indexOf(a) < 0;
            }));
          }
          var landAt = 1;
          var easeFn = gsap.parseEase(f.ease);
          if (easeFn) {
            for (var q = 0; q <= 1; q += 5e-3) {
              if (easeFn(q) >= 0.97) {
                landAt = q;
                break;
              }
            }
          }
          var reach = f.travel * landAt;
          var fire = function(cycle2, a, cursor2) {
            var last = cursor2;
            if (a.row) {
              cycle2.to(
                a.row.wrap,
                { opacity: 1, duration: hl.inDuration, ease: hl.inEase },
                cursor2
              );
              if (a.row.brackets.length) {
                cycle2.to(
                  a.row.brackets,
                  { stroke: hl.bracketColor, duration: hl.inDuration, ease: hl.inEase },
                  cursor2 + hl.bracketLag
                );
              }
            }
            a.dots.forEach(function(m) {
              var at = cursor2 + m.phase * f.spread * f.travel;
              var proxy = { t: 0 };
              cycle2.fromTo(
                proxy,
                { t: 0 },
                {
                  t: 1,
                  duration: f.travel,
                  ease: f.ease || "none",
                  onUpdate: function() {
                    a.place(m, proxy.t);
                  }
                },
                at
              );
              cycle2.fromTo(
                m.node,
                { autoAlpha: 0, scale: 0.2 },
                { autoAlpha: 1, scale: f.dotScale, duration: f.fade, ease: f.launchEase },
                at
              );
              cycle2.to(
                m.node,
                { autoAlpha: 0, scale: f.landScale, duration: f.fade * 1.5, ease: f.landEase },
                at + reach - f.fade * 0.4
              );
              last = Math.max(last, at + reach);
            });
            var arrival = cursor2 + reach;
            if (a.row && a.row.dots.length) {
              var pair = a.row.dots.slice();
              if (pair.length > 1) {
                pair.sort(function(p, q2) {
                  return Math.abs((parseFloat(p.getAttribute("cx")) || 0) - a.endX) - Math.abs((parseFloat(q2.getAttribute("cx")) || 0) - a.endX);
                });
              }
              pair.forEach(function(dot, i) {
                var v = { fill: hl.dotColor, duration: hl.dotDuration, ease: hl.inEase };
                if (dot.getAttribute("stroke"))
                  v.stroke = hl.dotColor;
                cycle2.to(dot, v, arrival + i * hl.dotLead);
              });
            }
            var release = last + f.hold;
            if (a.row) {
              cycle2.to(
                a.row.wrap,
                { opacity: idle, duration: hl.outDuration, ease: hl.outEase },
                release
              );
              a.row.dots.forEach(function(dot) {
                var v = { fill: a.row.dotFill, duration: hl.outDuration, ease: hl.outEase };
                if (dot.getAttribute("stroke"))
                  v.stroke = a.row.dotFill;
                cycle2.to(dot, v, release);
              });
              if (a.row.brackets.length) {
                cycle2.to(
                  a.row.brackets,
                  { stroke: a.row.stroke, duration: hl.outDuration, ease: hl.outEase },
                  release
                );
              }
            }
            if (count && a.row && a.row.count)
              cycle2.call(bump, [a.row], arrival);
            return release + hl.outDuration;
          };
          if (f.mode === "random") {
            var seed = 7;
            var rnd = function() {
              seed = seed * 16807 % 2147483647;
              return (seed - 1) / 2147483646;
            };
            var span = function(r) {
              return r[0] + rnd() * (r[1] - r[0]);
            };
            apps.forEach(function(a) {
              var own = gsap.timeline({ paused: true, repeat: -1 });
              var t = span(f.randomGap) * rnd();
              for (var n = 0; n < f.shots; n++)
                t = fire(own, a, t) + span(f.randomGap);
              own.to({ pad: 0 }, { pad: 1, duration: 1e-3 }, t);
              loops.push(own);
            });
          } else {
            var cycle = gsap.timeline({ paused: true, repeat: -1 });
            var cursor = 0;
            order.forEach(function(a) {
              cursor = fire(cycle, a, cursor) + f.gap;
            });
            cycle.to({ pad: 0 }, { pad: 1, duration: 1e-3 }, cursor);
            loops.push(cycle);
          }
        }
        if (loops.length)
          tl.__loop = multiLoop(loops);
        return tl;
      };
    }
    BUILD["warehouse-models"] = buildModels("warehouse-models");
    BUILD.consistent = buildModels("consistent");
    BUILD["consistent-mobile"] = BUILD.consistent;
    function merge(a, b) {
      var out = {};
      for (var k1 in a)
        out[k1] = a[k1];
      for (var k2 in b)
        out[k2] = b[k2];
      return out;
    }
    BUILD["profile-match"] = function(root, d) {
      var k = CONFIG5["profile-match"];
      var tl = gsap.timeline({ paused: true });
      var profile = one(root, "human-intelligence-card");
      if (!profile)
        return tl;
      var hl = k.highlight;
      var rings = matching(root, /^\d+$/);
      var stale = root.querySelectorAll("[data-agents-wipe]");
      for (var s = 0; s < stale.length; s++)
        stale[s].parentNode.removeChild(stale[s]);
      var kids = [].slice.call(profile.children).filter(function(n2) {
        return n2.tagName === "g";
      });
      var rows = kids.filter(function(g) {
        var icon = false, text = false;
        for (var i = 0; i < g.children.length; i++) {
          var n2 = g.children[i].getAttribute("data-anim") || "";
          if (g.children[i].tagName === "g" && /^Icon/.test(n2))
            icon = true;
          else if (g.children[i].tagName === "path" && /^Description/.test(n2))
            text = true;
        }
        return icon && text;
      });
      var header = kids.filter(function(g) {
        return rows.indexOf(g) < 0;
      });
      function paint(row) {
        return [].slice.call(row.querySelectorAll("path")).filter(function(p) {
          return !/^secondary/.test(p.getAttribute("data-anim") || "");
        });
      }
      function trailing(row) {
        return [].slice.call(row.querySelectorAll('[data-anim^="secondary"]'));
      }
      var fills = rows.map(function(r) {
        var t = r.querySelector('[data-anim^="Description"]');
        return t && t.getAttribute("fill");
      }).filter(Boolean);
      var tally = {};
      fills.forEach(function(f2) {
        tally[f2] = (tally[f2] || 0) + 1;
      });
      var idleFill = Object.keys(tally).sort(function(a, b) {
        return tally[b] - tally[a];
      })[0] || "#333342";
      var accent = fills.filter(function(f2) {
        return f2 !== idleFill;
      })[0] || hl.accent;
      var deck = matching(root, /^app-card(_\d+)?$/).map(function(el2) {
        var rects = [], content = [];
        for (var i = 0; i < el2.children.length; i++) {
          (el2.children[i].tagName === "rect" ? rects : content).push(el2.children[i]);
        }
        if (!rects.length)
          return null;
        var r = rects[0];
        return {
          el: el2,
          rects,
          content,
          home: {
            x: parseFloat(r.getAttribute("x")) || 0,
            y: parseFloat(r.getAttribute("y")) || 0,
            w: parseFloat(r.getAttribute("width")) || 0
          }
        };
      }).filter(Boolean);
      var slots = deck.map(function(c2) {
        return { x: c2.home.x, y: c2.home.y, w: c2.home.w };
      }).sort(function(a, b) {
        return a.y - b.y;
      });
      var n = slots.length;
      var homeSlot = deck.map(function(c2) {
        for (var i = 0; i < n; i++)
          if (Math.abs(slots[i].y - c2.home.y) < 1)
            return i;
        return 0;
      });
      function moveTo(tlx, c2, slot, vars, at2) {
        tlx.to(c2.rects, merge({ attr: { x: slot.x, y: slot.y, width: slot.w } }, vars), at2);
        if (c2.content.length) {
          tlx.to(c2.content, merge({ x: slot.x - c2.home.x, y: slot.y - c2.home.y }, vars), at2);
        }
      }
      var deckParent = deck.length ? deck[0].el.parentNode : null;
      var deckAnchor = deck.length ? deck[deck.length - 1].el.nextSibling : null;
      function restack(targets) {
        if (!deckParent)
          return;
        targets.slice().sort(function(a, b) {
          return a.to - b.to;
        }).forEach(function(o) {
          deckParent.insertBefore(o.el, deckAnchor);
        });
      }
      function jumpTo(tlx, c2, slot, at2) {
        tlx.set(c2.rects, { attr: { x: slot.x, y: slot.y, width: slot.w } }, at2);
        if (c2.content.length) {
          tlx.set(c2.content, { x: slot.x - c2.home.x, y: slot.y - c2.home.y }, at2);
        }
      }
      var pc = profile.getBBox();
      var profileY = pc.y + pc.height / 2;
      var lines = matching(root, /^moving-part(_\d+)?$/).map(function(part) {
        var path = part.querySelector("path");
        if (!path)
          return null;
        var len = path.getTotalLength();
        if (!len)
          return null;
        var a = path.getPointAtLength(0);
        var b = path.getPointAtLength(len);
        var forward = Math.abs(b.y - profileY) < Math.abs(a.y - profileY);
        var dots = [].slice.call(part.children).filter(function(c2) {
          return c2.tagName === "circle";
        }).map(function(node) {
          var cx = parseFloat(node.getAttribute("cx")) || 0;
          var cy = parseFloat(node.getAttribute("cy")) || 0;
          var t = phaseOf(path, len, cx, cy);
          return { node, cx, cy, phase: forward ? t : 1 - t };
        });
        return {
          path,
          len,
          forward,
          period: dashPeriod2(path, 4.5),
          dots,
          minPhase: dots.reduce(function(m, x) {
            return Math.min(m, x.phase);
          }, 1),
          place: function(m, t) {
            var p = path.getPointAtLength((forward ? t : 1 - t) * len);
            gsap.set(m.node, { x: p.x - m.cx, y: p.y - m.cy });
          }
        };
      }).filter(Boolean);
      var firstPhase = lines.reduce(function(m, l) {
        return Math.min(m, l.minPhase);
      }, 1);
      lines.forEach(function(l) {
        l.dots.forEach(function(m) {
          m.phase -= firstPhase;
        });
      });
      if (rings.length) {
        gsap.set(rings, { transformOrigin: "center center" });
        step(tl, rings, k.rings, d);
      }
      var shell = [].slice.call(profile.children).filter(function(nd) {
        return nd.tagName === "rect";
      });
      gsap.set(shell.concat(header), { transformOrigin: "center center" });
      step(tl, shell.concat(header), k.profile, d);
      step(tl, rows, k.rows, d);
      var byDepthCards = deck.slice().sort(function(a, b) {
        return a.home.y - b.home.y;
      }).map(function(c2) {
        return c2.el;
      });
      gsap.set(byDepthCards, { transformOrigin: "center center" });
      step(tl, byDepthCards, k.cards, d);
      lines.forEach(function(l, i) {
        var wipe = makeWipe(root, l.path, l.len, l.forward, k.lines.wipeWidth);
        wipe.path.removeAttribute("opacity");
        l.path.setAttribute("mask", "url(#" + wipe.id + ")");
        tl.to(
          wipe.path,
          { strokeDashoffset: 0, duration: k.lines.duration, ease: k.lines.ease },
          k.lines.at + i * k.lines.stagger
        );
      });
      var rowY = rows.map(function(r) {
        return r.getBBox().y;
      });
      var badge = [];
      var badgeHomeY = 0;
      for (var bi = 0; bi < rows.length; bi++) {
        var found = trailing(rows[bi]);
        if (!found.length)
          continue;
        badge = found;
        badgeHomeY = rowY[bi];
        break;
      }
      badge.forEach(function(el2) {
        profile.appendChild(el2);
      });
      rows.forEach(function(r) {
        var lit2 = paint(r).filter(function(p) {
          return p.getAttribute("fill") === accent;
        }).length > 0;
        gsap.set(paint(r), { fill: idleFill });
        var extra = trailing(r);
        if (extra.length)
          gsap.set(extra, { autoAlpha: 0 });
        if (!lit2)
          return;
        paint(r).forEach(function(p) {
          p.setAttribute("data-lit-default", accent);
        });
        extra.forEach(function(p) {
          p.setAttribute("data-lit-default", "");
        });
      });
      var immediate = [];
      if (k.crawl.enabled && lines.length) {
        var crawl = gsap.timeline({ paused: true, repeat: -1 });
        lines.forEach(function(l) {
          gsap.set(l.path, { strokeDashoffset: 0 });
          crawl.to(
            l.path,
            {
              strokeDashoffset: l.forward ? -l.period : l.period,
              duration: l.period / k.crawl.speed,
              ease: "none"
            },
            0
          );
        });
        immediate.push(crawl);
      }
      if (immediate.length)
        tl.__loopNow = multiLoop(immediate);
      var f = k.flow;
      var packets = [];
      lines.forEach(function(l) {
        l.dots.forEach(function(m) {
          packets.push(m.node);
          l.place(m, 0);
        });
      });
      if (f.enabled && packets.length)
        gsap.set(packets, { autoAlpha: 0 });
      var landAt = 1;
      var packetEase = gsap.parseEase(f.ease);
      if (packetEase) {
        for (var q = 0; q <= 1; q += 5e-3) {
          if (packetEase(q) >= 0.97) {
            landAt = q;
            break;
          }
        }
      }
      var reach = f.travel * landAt;
      var loops = [];
      if (k.deck.enabled && n > 1) {
        let rowFor2 = function(cardIndex) {
          if (!rows.length)
            return -1;
          var v = (dk.rows || [])[cardIndex];
          if (v == null)
            v = cardIndex % rows.length + 1;
          return Math.max(0, Math.min(rows.length - 1, Math.round(v) - 1));
        }, wave2 = function(when) {
          if (!f.enabled)
            return;
          lines.forEach(function(l) {
            l.dots.forEach(function(m) {
              var lat = when + m.phase * f.spread * f.travel;
              var proxy = { t: 0 };
              cycle.fromTo(
                proxy,
                { t: 0 },
                {
                  t: 1,
                  duration: f.travel,
                  ease: f.ease || "none",
                  onUpdate: function() {
                    l.place(m, proxy.t);
                  }
                },
                lat
              );
              cycle.fromTo(m.node, { autoAlpha: 0 }, { autoAlpha: 1, duration: f.fade }, lat);
              cycle.to(m.node, { autoAlpha: 0, duration: f.fade }, lat + reach - f.fade * 0.5);
            });
          });
        };
        var rowFor = rowFor2, wave = wave2;
        var dk = k.deck;
        var mv = dk.moveDuration;
        var cycle = gsap.timeline({ paused: true, repeat: -1 });
        for (var pass = 1; pass <= n; pass++) {
          var at = pass * dk.step - mv;
          var order = [];
          for (var q = 0; q < deck.length; q++) {
            order.push({ el: deck[q].el, to: (homeSlot[q] + pass) % n });
          }
          cycle.call(restack, [order], at + mv * 0.5);
          for (var c = 0; c < deck.length; c++) {
            var card = deck[c];
            var from = (homeSlot[c] + pass - 1) % n;
            var to = (homeSlot[c] + pass) % n;
            if (from === n - 1) {
              moveTo(
                cycle,
                card,
                { x: slots[n - 1].x, y: slots[n - 1].y + dk.lift, w: slots[n - 1].w },
                { autoAlpha: 0, duration: mv * 0.45, ease: dk.ease },
                at
              );
              jumpTo(cycle, card, { x: slots[to].x, y: slots[to].y - dk.lift, w: slots[to].w }, at + mv * 0.5);
              moveTo(cycle, card, slots[to], { autoAlpha: 1, duration: mv * 0.5, ease: dk.ease }, at + mv * 0.5);
            } else {
              moveTo(cycle, card, slots[to], { duration: mv, ease: dk.ease }, at);
            }
            if (to !== n - 1)
              continue;
            var ri = rowFor2(c);
            if (ri < 0)
              continue;
            var lit = rows[ri];
            var on = at + mv * 0.55;
            cycle.to(paint(lit), { fill: accent, duration: hl.inDuration, ease: hl.inEase }, on);
            if (pass !== n) {
              wave2(on);
              if (badge.length) {
                cycle.set(badge, { y: rowY[ri] - badgeHomeY }, on);
                cycle.to(badge, { autoAlpha: 1, duration: hl.inDuration, ease: hl.inEase }, on + reach);
              }
            }
            if (pass === n)
              continue;
            var off = at + dk.step;
            cycle.to(paint(lit), { fill: idleFill, duration: hl.outDuration, ease: hl.outEase }, off);
            if (badge.length) {
              cycle.to(badge, { autoAlpha: 0, duration: hl.outDuration, ease: hl.outEase }, off);
            }
          }
        }
        var opener = homeSlot.indexOf(n - 1);
        var fi = opener < 0 ? -1 : rowFor2(opener);
        if (fi >= 0) {
          var first = rows[fi];
          cycle.to(paint(first), { fill: accent, duration: hl.inDuration, ease: hl.inEase }, 0);
          wave2(0);
          if (badge.length) {
            cycle.set(badge, { y: rowY[fi] - badgeHomeY }, 0);
            cycle.to(badge, { autoAlpha: 1, duration: hl.inDuration, ease: hl.inEase }, reach);
          }
          var firstOff = dk.step - mv;
          cycle.to(paint(first), { fill: idleFill, duration: hl.outDuration, ease: hl.outEase }, firstOff);
          if (badge.length) {
            cycle.to(badge, { autoAlpha: 0, duration: hl.outDuration, ease: hl.outEase }, firstOff);
          }
        }
        cycle.to({ pad: 0 }, { pad: 1, duration: 1e-3 }, n * dk.step);
        loops.push(cycle);
      }
      if (loops.length)
        tl.__loop = multiLoop(loops);
      return tl;
    };
    var triggers = [];
    var timelines = {};
    var mm = null;
    BUILD["audit-logging"] = function(root, d) {
      var k = CONFIG5["audit-logging"];
      var tl = gsap.timeline({ paused: true });
      var rows = series(root, "row", 3);
      if (rows.length > 1 && rows[0].getBBox) {
        rows.sort(function(a, b) {
          return a.getBBox().y - b.getBBox().y;
        });
      }
      if (k.rows.order === "bottom")
        rows.reverse();
      step(tl, rows, k.rows, d);
      if (k.dot.enabled) {
        rows.forEach(function(row, i) {
          var dot = row.querySelector('[data-anim^="Ellipse 485"]');
          if (!dot)
            return;
          tl.from(
            dot,
            {
              autoAlpha: 0,
              scale: 0,
              transformOrigin: "center",
              duration: k.dot.duration,
              ease: k.dot.ease
            },
            (k.rows.at || 0) + i * (k.rows.stagger || 0) + k.dot.lag
          );
        });
      }
      return tl;
    };
    BUILD["audit-logging-2"] = function(root, d) {
      var k = CONFIG5["audit-logging-2"];
      var tl = gsap.timeline({ paused: true });
      var rows = series(root, "Table Row", 6);
      var cursor = matching(root, /^curso/)[0];
      var box = one(root, "Checkbox");
      var check = one(root, "Primary");
      step(tl, one(root, "Table Header"), k.header, d);
      step(tl, rows, k.rows, d);
      step(tl, one(root, "Button"), k.button, d);
      step(tl, one(root, "Dropdown"), k.dropdown, d);
      step(tl, series(root, "Dropdown Choice", 3), k.choices, d);
      step(tl, cursor, k.cursor, d);
      if (!k.press.enabled)
        return tl;
      var ghost = null;
      var plain = one(root, "Checkbox_2");
      if (box && plain && box.getBBox) {
        var a = box.getBBox(), b = plain.getBBox();
        ghost = plain.cloneNode(true);
        ghost.removeAttribute("data-anim");
        ghost.setAttribute("data-check-ghost", "");
        box.parentNode.insertBefore(ghost, box.nextSibling);
        gsap.set(ghost, { x: a.x - b.x, y: a.y - b.y });
      }
      gsap.set([box, check], { autoAlpha: 0 });
      var at = k.press.at;
      if (cursor) {
        tl.to(cursor, { scale: k.press.scale, duration: k.press.dip, transformOrigin: "0% 0%", ease: "power2.in" }, at).to(cursor, { scale: 1, duration: k.press.rebound, ease: "power2.out" }, at + k.press.dip);
      }
      var lands = at + k.press.dip;
      if (ghost)
        tl.to(ghost, { autoAlpha: 0, duration: k.check.fade }, lands);
      tl.to(box, { autoAlpha: 1, duration: k.check.fade }, lands);
      tl.fromTo(
        check,
        { scale: 0, transformOrigin: "center" },
        { autoAlpha: 1, scale: 1, duration: k.check.duration, ease: k.check.ease },
        lands + k.check.lag
      );
      return tl;
    };
    BUILD["audit-logging-tab-1"] = function(root, d) {
      var k = CONFIG5["audit-logging-tab-1"];
      var tl = gsap.timeline({ paused: true });
      var rows = series(root, "Table Row", 5);
      step(tl, one(root, "Table Header"), k.header, d);
      step(tl, rows, k.rows, d);
      if (k.dot.enabled) {
        rows.forEach(function(row, i) {
          var dot = row.querySelector('[data-anim^="Ellipse 485"]');
          if (!dot)
            return;
          tl.from(
            dot,
            { autoAlpha: 0, scale: 0, transformOrigin: "center", duration: k.dot.duration, ease: k.dot.ease },
            (k.rows.at || 0) + i * (k.rows.stagger || 0) + k.dot.lag
          );
        });
      }
      return tl;
    };
    BUILD["audit-logging-tab-2"] = BUILD["audit-logging-tab-1"];
    CONFIG5["audit-logging-tab-2"] = CONFIG5["audit-logging-tab-1"];
    function ready(mount) {
      mount.setAttribute("data-hi-ready", "");
    }
    function wire(mount, name, portrait, reduced) {
      var build = BUILD[name];
      var all = mount.matches("svg") ? [mount] : mount.querySelectorAll("svg");
      var svg = null;
      for (var i = 0; i < all.length; i++) {
        if (all[i].getClientRects().length) {
          svg = all[i];
          break;
        }
      }
      if (!build || !svg)
        return;
      var g = CONFIG5.global;
      if (reduced) {
        var still = build(svg, 0);
        still.eventCallback("onComplete", null);
        still.progress(1);
        if (still.__loop)
          still.__loop.kill();
        if (still.__loopNow)
          still.__loopNow.kill();
        svg.querySelectorAll("[data-ripple]").forEach(function(el2) {
          el2.remove();
        });
        svg.querySelectorAll("[data-ripple-hidden],[data-flow-hidden],[data-flow-idle]").forEach(function(el2) {
          gsap.set(el2, { autoAlpha: 1 });
        });
        svg.querySelectorAll("[data-lit-default]").forEach(function(el2) {
          var lit = el2.getAttribute("data-lit-default");
          gsap.set(el2, lit ? { fill: lit, autoAlpha: 1 } : { autoAlpha: 1 });
        });
        ready(mount);
        return;
      }
      var tl = build(svg, portrait ? g.portraitDistance : 1);
      tl.timeScale((CONFIG5[name].timeScale || 1) * (portrait ? g.portraitTimeScale : 1));
      timelines[name] = tl;
      ready(mount);
      var st = ScrollTrigger.create({
        trigger: mount,
        start: g.start,
        end: g.end,
        markers: g.markers,
        onEnter: function() {
          tl.play();
          if (tl.__loopNow)
            tl.__loopNow.play();
        },
        // ambient loops must not burn frames off-screen
        onToggle: function(self) {
          if (tl.__loopNow)
            self.isActive ? tl.__loopNow.play() : tl.__loopNow.pause();
          if (!tl.__loop)
            return;
          if (self.isActive && tl.progress() === 1)
            tl.__loop.play();
          else
            tl.__loop.pause();
        }
      });
      triggers.push(st);
      if (tl.__loop) {
        tl.eventCallback("onComplete", function() {
          if (st.isActive)
            tl.__loop.play();
        });
      }
    }
    function init(scope) {
      var mounts = (scope || document).querySelectorAll("[data-hi-illustration]");
      if (!mounts.length)
        return;
      destroy();
      var args = arguments;
      var pending = [].filter.call(mounts, function(m) {
        return m.hasAttribute("data-hi-src") && !m.querySelector("svg");
      });
      if (pending.length) {
        hydrate(pending).then(function() {
          init.apply(null, args);
        });
        return;
      }
      var g = CONFIG5.global;
      mm = gsap.matchMedia();
      mm.add(
        {
          // `desktop` must be here even though nothing reads it: matchMedia only runs
          // the callback when at least one condition matches, so without it a plain
          // desktop viewport wires nothing at all.
          desktop: "(min-width: " + (g.breakpoint + 1) + "px)",
          portrait: "(max-width: " + g.breakpoint + "px)",
          reduced: "(prefers-reduced-motion: reduce)"
        },
        function(ctx) {
          var c = ctx.conditions;
          mounts.forEach(function(mount) {
            wire(mount, mount.getAttribute("data-hi-illustration"), c.portrait, c.reduced);
          });
        }
      );
    }
    function hydrate(mounts) {
      return Promise.all([].map.call(mounts, function(m) {
        if (m.__hiHydrating)
          return m.__hiHydrating;
        m.__hiHydrating = fetch(m.getAttribute("data-hi-src")).then(function(r) {
          if (!r.ok)
            throw new Error(r.status);
          return r.text();
        }).then(function(text) {
          if (m.querySelector("svg"))
            return;
          m.innerHTML = text.replace(/<\?xml[\s\S]*?\?>|<!--[\s\S]*?-->/g, "");
          var svg = m.querySelector("svg");
          if (svg) {
            svg.setAttribute("width", "100%");
            svg.removeAttribute("height");
            svg.style.display = "block";
            svg.style.height = "auto";
          }
        }).catch(function(e) {
          console.warn("[hi-illustrations] could not load " + m.getAttribute("data-hi-src") + " (" + e.message + ")");
          m.setAttribute("data-hi-src-failed", "");
        });
        return m.__hiHydrating;
      }));
    }
    function destroy() {
      triggers.forEach(function(t) {
        t.kill();
      });
      triggers = [];
      Object.keys(timelines).forEach(function(n) {
        if (timelines[n].__loop)
          timelines[n].__loop.kill();
        if (timelines[n].__loopNow)
          timelines[n].__loopNow.kill();
        timelines[n].kill();
        delete timelines[n];
      });
      if (mm) {
        mm.revert();
        mm = null;
      }
    }
    function replay(name) {
      var tl = timelines[name];
      if (!tl) {
        var mount = document.querySelector('[data-hi-illustration="' + name + '"]');
        if (!mount)
          return;
        var g = CONFIG5.global;
        wire(
          mount,
          name,
          window.matchMedia("(max-width: " + g.breakpoint + "px)").matches,
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        );
        tl = timelines[name];
        if (!tl)
          return;
      }
      if (tl.__loop)
        tl.__loop.pause().progress(0);
      if (tl.__loopNow)
        tl.__loopNow.restart();
      tl.progress(0).play();
    }
    function rebuild(name) {
      var mount = document.querySelector('[data-hi-illustration="' + name + '"]');
      if (!mount)
        return;
      var svg = mount.matches("svg") ? mount : mount.querySelector("svg");
      if (timelines[name]) {
        if (timelines[name].__loop)
          timelines[name].__loop.kill();
        if (timelines[name].__loopNow)
          timelines[name].__loopNow.kill();
        timelines[name].progress(0).kill();
        delete timelines[name];
      }
      triggers = triggers.filter(function(t) {
        if (t.trigger === mount) {
          t.kill();
          return false;
        }
        return true;
      });
      svg.querySelectorAll("[data-flow-pulse],[data-check-ghost]").forEach(function(p) {
        p.remove();
      });
      gsap.set(svg.querySelectorAll("[data-anim] *"), { clearProps: "transform,opacity,visibility" });
      wire(mount, name, window.matchMedia("(max-width: " + CONFIG5.global.breakpoint + "px)").matches, false);
      ScrollTrigger.refresh();
      if (timelines[name])
        timelines[name].play();
      return timelines[name];
    }
    window.HIIllustrations = {
      config: CONFIG5,
      init,
      destroy,
      replay,
      rebuild,
      timelines,
      // studio.html
      scenes: SCENES,
      presets: PRESETS,
      buildScene,
      // hand-coded builders driven by CONFIG — the studio's config mode
      buildConfig: function(name, root, d) {
        return BUILD[name] ? BUILD[name](root, d) : null;
      },
      hasBuild: function(name) {
        return typeof BUILD[name] === "function";
      },
      sceneUnits,
      sceneReset
    };
    return { init, destroy };
  }();
  var initCardIllustrations = API.init;
  var destroyCardIllustrations = API.destroy;
  var replayCardIllustration = API.replay;

  // src/auditTabs.js
  var CONFIG = {
    dwell: 5,
    // seconds a tab holds before advancing
    crossfade: 0.4,
    // The card must reach the middle band of the viewport before autoplay starts.
    // A margin rather than a threshold ratio: a ratio can never be satisfied by an
    // element taller than the viewport, which this is on mobile.
    viewMargin: "-15%",
    resumeAfterClick: true
    // false = a click stops the carousel for good
  };
  function initAuditTabs(scope, opts = {}) {
    const root = (scope || document).querySelector(".audit-logging-tabs-wrap");
    if (!root)
      return;
    root.__auditTabs?.destroy();
    const visuals = root.querySelector(".audit-logging-tabs-visuals");
    const navItems = [...root.querySelectorAll(".integrations-control_nav-item")];
    if (!visuals || !navItems.length)
      return;
    const { gsap: gsap2 } = window;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const panes = [...visuals.querySelectorAll("svg")].map((svg) => {
      const named = svg.querySelector('[data-anim^="audit-logging-tab-"]');
      const name = named?.getAttribute("data-anim") || null;
      if (name)
        svg.setAttribute("data-hi-illustration", name);
      return { svg, name };
    });
    if (!panes.length)
      return;
    if (panes.length !== navItems.length) {
      console.warn(
        `[audit-tabs] ${panes.length} visual(s) vs ${navItems.length} nav item(s) \u2014 pairing by index.`
      );
    }
    if (getComputedStyle(visuals).display !== "grid") {
      console.warn(
        "[audit-tabs] .audit-logging-tabs-visuals is not display:grid \u2014 see audit-tabs/styles.html"
      );
    }
    function setVis(el2, on) {
      if (gsap2)
        gsap2.set(el2, { autoAlpha: on ? 1 : 0 });
      else
        el2.style.opacity = on ? 1 : 0;
    }
    panes.forEach((p, i) => setVis(p.svg, i === 0));
    const fills = navItems.map(
      (el2) => el2.querySelector(".integrations-control_nav-active") || el2.querySelector(".integrations-control_nav-line")
    );
    fills.forEach((el2) => {
      if (!el2)
        return;
      el2.style.transformOrigin = "left center";
      el2.style.transform = "scaleX(0)";
      el2.style.willChange = "transform";
    });
    const paint = (index2, p) => fills.forEach((el2, i) => {
      if (el2)
        el2.style.transform = "scaleX(" + (i === index2 ? p : 0) + ")";
    });
    let index = 0;
    function show(next, animate = true) {
      if (!panes[next])
        return;
      const prev = panes[index];
      const pane = panes[next];
      index = next;
      navItems.forEach((el2, i) => el2.classList.toggle("is-active", i === next));
      if (prev && prev !== pane) {
        if (animate && gsap2 && !reduced)
          gsap2.to(prev.svg, { autoAlpha: 0, duration: CONFIG.crossfade, overwrite: true });
        else
          setVis(prev.svg, false);
      }
      if (animate && gsap2 && !reduced)
        gsap2.to(pane.svg, { autoAlpha: 1, duration: CONFIG.crossfade, overwrite: true });
      else
        setVis(pane.svg, true);
      play(pane);
    }
    function play(pane) {
      if (!pane.name)
        return;
      const api = window.HIIllustrations;
      if (opts.replay) {
        opts.replay(pane.name);
        return;
      }
      if (api?.replay) {
        api.replay(pane.name);
        if (api.timelines?.[pane.name])
          return;
      }
      opts.entrance?.(pane.svg, pane.name);
    }
    let elapsed = 0;
    let started = false;
    let last = 0;
    let running = false;
    let rafId = null;
    let observer = null;
    let stopped = reduced;
    function frame(now) {
      rafId = requestAnimationFrame(frame);
      const dt = last ? (now - last) / 1e3 : 0;
      last = now;
      if (!running || stopped)
        return;
      elapsed += dt;
      const p = Math.min(1, elapsed / CONFIG.dwell);
      paint(index, p);
      if (p >= 1) {
        elapsed = 0;
        show((index + 1) % panes.length, true);
      }
    }
    function setRunning(on) {
      running = on;
      if (!on)
        return;
      last = 0;
      if (!started) {
        started = true;
        show(0, false);
      }
      if (rafId == null)
        rafId = requestAnimationFrame(frame);
    }
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => setRunning(entries[0].isIntersecting), {
        rootMargin: CONFIG.viewMargin + " 0px",
        threshold: 0
      });
      observer.observe(root);
    } else {
      setRunning(true);
    }
    navItems.forEach((el2, i) => {
      if (!panes[i])
        return;
      el2.style.cursor = "pointer";
      el2.setAttribute("role", "button");
      el2.setAttribute("tabindex", "0");
      const pick = () => {
        elapsed = 0;
        paint(i, 0);
        stopped = !CONFIG.resumeAfterClick;
        started = true;
        show(i, true);
      };
      el2.addEventListener("click", pick);
      el2.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          pick();
        }
      });
    });
    function destroy() {
      if (rafId != null)
        cancelAnimationFrame(rafId);
      rafId = null;
      observer?.disconnect();
      stopped = true;
      root.__auditTabs = null;
    }
    root.__auditTabs = { show, destroy, root };
    return root.__auditTabs;
  }

  // src/integrationsControl.js
  var ATTR = {
    status: { open: "unlocked", locked: "locked" },
    state: { on: "active", off: "inactive", dim: "disabled" }
  };
  var TABS = [
    {
      id: "carta",
      nav: "Carta",
      title: "Integrate with Carta",
      desc: "Connect employee equity grants and outstanding shares per employee. Leave investor records and the full cap table where they are.",
      items: [
        { label: "employee_equity_grants", dim: true },
        { label: "outstanding_shares_per_employee", dim: true },
        { label: "investors and cap table", dim: true },
        { label: "read_issuer_shareclasses", on: true },
        { label: "read_issuer_draftsecurities", on: true },
        { label: "read_issuer_interests", on: true },
        { label: "read_issuer_capitalizationtablesummary", on: true },
        { label: "read_issuer_stakeholdercapitalizationtable", on: true },
        { label: "read_issuer_securitiestemplates", on: true }
      ]
    },
    {
      id: "workday",
      nav: "Workday",
      title: "Integrate with Workday",
      desc: "Once saved, API keys, secrets, and tokens are encrypted and never shown again to protect your credentials.",
      items: [
        { label: "Staffing", lock: true },
        { label: "Compensation", lock: true },
        { label: "Recruiting", on: true },
        { label: "Talent and Performance", on: true },
        { label: "Payroll" },
        { label: "Financial Management" },
        { label: "Absence Management" },
        { label: "Recruiting" },
        { label: "Benefits" }
      ]
    },
    {
      id: "greenhouse",
      nav: "Greenhouse",
      title: "Integrate with Greenhouse",
      desc: "Connect your Greenhouse account to sync the data you choose into Human Intelligence.",
      items: [
        { label: "Candidates", lock: true },
        { label: "Applications", lock: true },
        { label: "Jobs", lock: true },
        { label: "Offers", on: true },
        { label: "Scorecards" },
        { label: "Approvals" },
        { label: "Users & Permissions" },
        { label: "Organization Setup" },
        { label: "Compliance & Demographics" },
        { label: "Custom Fields" }
      ]
    }
  ];
  var SWITCH = { fade: 0.18, rowStagger: 0.025, rowShift: 6 };
  var LOGO = {
    spin: 0.62,
    // total time for the switch
    boxRotate: 90,
    // quarter-turn out and back on the logo box
    iconRotate: 360,
    // one full turn on the connector icon
    dip: 0.72,
    // how small the box gets at the midpoint
    inEase: "power2.in",
    outEase: "back.out(1.7)",
    iconEase: "power2.inOut"
  };
  var AUTOPLAY = {
    enabled: true,
    dwell: 5,
    // seconds a tab holds before advancing
    // The card must reach the middle band of the viewport. Expressed as a margin
    // rather than a threshold ratio on purpose: a ratio can never be satisfied by
    // an element taller than the viewport, which this card is on mobile.
    viewMargin: "-15%",
    resumeAfterClick: true
    // false = a click stops the carousel for good
  };
  function initIntegrationsControl(scope) {
    const root = (scope || document).querySelector("[data-tab-active]");
    if (!root)
      return;
    const list = root.querySelector(".integrations-control_list");
    const titleEl = root.querySelector(".integrations-control_title");
    const descEl = root.querySelector(".integrations-control_desc");
    const logos = [...root.querySelectorAll("[data-logo]")];
    if (!list || !titleEl || !descEl)
      return;
    const template = list.querySelector(".integrations-control_item");
    if (!template)
      return;
    const proto = template.cloneNode(true);
    template.remove();
    const overlay = list.querySelector(".integrations-control_list-overlay");
    const navRoot = (scope || document).querySelector(".integrations-control_nav") || root.parentElement?.querySelector(".integrations-control_nav");
    const navItems = navRoot ? [...navRoot.querySelectorAll(".integrations-control_nav-item")] : [];
    function buildRow(item) {
      const row = proto.cloneNode(true);
      const title = row.querySelector(".integrations-control_item-title");
      if (title)
        title.textContent = item.label;
      row.setAttribute("data-status", item.lock ? ATTR.status.locked : ATTR.status.open);
      row.setAttribute(
        "data-state",
        item.dim ? ATTR.state.dim : item.on ? ATTR.state.on : ATTR.state.off
      );
      return row;
    }
    function placeLogo(tab) {
      const active = logos.filter((el2) => el2.getAttribute("data-logo") === tab.id)[0];
      if (active && active.parentNode && active !== active.parentNode.firstElementChild) {
        active.parentNode.insertBefore(active, active.parentNode.firstElementChild);
      }
    }
    const logoBox = logos.length ? logos[0].parentNode : null;
    const headIcon = root.querySelector(".integrations-control_head-row > svg");
    function spinLogo(tab) {
      if (!logoBox || typeof gsap === "undefined") {
        placeLogo(tab);
        return;
      }
      const half = LOGO.spin / 2;
      const tl = gsap.timeline();
      tl.set(logoBox, { transformOrigin: "center center" }).to(logoBox, { rotate: LOGO.boxRotate, scale: LOGO.dip, duration: half, ease: LOGO.inEase }, 0).add(() => placeLogo(tab), half).to(logoBox, { rotate: 0, scale: 1, duration: half, ease: LOGO.outEase }, half);
      if (headIcon) {
        tl.set(headIcon, { transformOrigin: "center center" }, 0).fromTo(
          headIcon,
          { rotate: 0 },
          { rotate: LOGO.iconRotate, duration: LOGO.spin, ease: LOGO.iconEase },
          0
        );
      }
      tl.set([logoBox, headIcon].filter(Boolean), { clearProps: "transform" });
    }
    function render2(tab) {
      root.setAttribute("data-tab-active", tab.id);
      titleEl.textContent = tab.title;
      descEl.textContent = tab.desc;
      list.querySelectorAll(".integrations-control_item").forEach((el2) => el2.remove());
      const frag = document.createDocumentFragment();
      tab.items.forEach((item) => frag.appendChild(buildRow(item)));
      overlay ? list.insertBefore(frag, overlay) : list.appendChild(frag);
      navItems.forEach((el2, i) => el2.classList.toggle("is-active", TABS[i] === tab));
      return [...list.querySelectorAll(".integrations-control_item")];
    }
    let current = null;
    function show(tab, animate) {
      if (tab === current)
        return;
      current = tab;
      const rows = render2(tab);
      if (!animate || typeof gsap === "undefined") {
        placeLogo(tab);
        return;
      }
      spinLogo(tab);
      gsap.fromTo(
        [titleEl, descEl],
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: SWITCH.fade, overwrite: true }
      );
      gsap.fromTo(
        rows,
        { autoAlpha: 0, y: SWITCH.rowShift },
        {
          autoAlpha: 1,
          y: 0,
          duration: SWITCH.fade,
          stagger: SWITCH.rowStagger,
          overwrite: true,
          clearProps: "transform"
        }
      );
    }
    const fills = navItems.map(
      (el2) => el2.querySelector(".integrations-control_nav-active") || el2.querySelector(".integrations-control_nav-line")
    );
    fills.forEach((el2) => {
      if (!el2)
        return;
      el2.style.transformOrigin = "left center";
      el2.style.transform = "scaleX(0)";
      el2.style.willChange = "transform";
    });
    function paint(index2, p) {
      fills.forEach((el2, i) => {
        if (el2)
          el2.style.transform = "scaleX(" + (i === index2 ? p : 0) + ")";
      });
    }
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let index = 0;
    let elapsed = 0;
    let last = 0;
    let running = false;
    let rafId = null;
    let stopped = !AUTOPLAY.enabled || reduced;
    function frame(now) {
      rafId = requestAnimationFrame(frame);
      const dt = last ? (now - last) / 1e3 : 0;
      last = now;
      if (!running || stopped)
        return;
      elapsed += dt;
      const p = Math.min(1, elapsed / AUTOPLAY.dwell);
      paint(index, p);
      if (p >= 1) {
        index = (index + 1) % TABS.length;
        elapsed = 0;
        show(TABS[index], true);
      }
    }
    function setRunning(on) {
      running = on;
      if (on) {
        last = 0;
        if (rafId == null)
          rafId = requestAnimationFrame(frame);
      }
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => setRunning(entries[0].isIntersecting), {
        rootMargin: AUTOPLAY.viewMargin + " 0px",
        threshold: 0
      }).observe(root);
    } else {
      setRunning(true);
    }
    navItems.forEach((el2, i) => {
      if (!TABS[i])
        return;
      el2.style.cursor = "pointer";
      el2.setAttribute("role", "tab");
      el2.setAttribute("tabindex", "0");
      const go = () => {
        index = i;
        elapsed = 0;
        if (!AUTOPLAY.resumeAfterClick)
          stopped = true;
        paint(index, stopped ? 1 : 0);
        show(TABS[i], true);
      };
      el2.addEventListener("click", go);
      el2.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          go();
        }
      });
    });
    const initial = TABS.filter((t) => t.id === root.getAttribute("data-tab-active"))[0] || TABS[0];
    index = TABS.indexOf(initial);
    show(initial, false);
    paint(index, stopped ? 1 : 0);
  }

  // src/orgGraph.js
  var MOUNT = "[data-hi-org-graph]";
  var STYLE = "\n  [data-hi-org-graph] {\n    --og-panel: #f8f9fc;\n    --og-line: #e4e8f1;\n    --og-dot: #c8cdd8;\n    --og-dash: #8b95aa;\n    --og-ink: #333342;\n    --og-box: #ffffff;\n\n    /* No width here \u2014 sizing is yours. The component measures whatever width the\n       mount ends up with and scales the 620-unit artwork into it, then sets the\n       height itself. A block-level div fills its parent by default; if the mount\n       ever measures 0 (a collapsed flex child) it falls back to 620 rather than\n       vanishing. */\n    position: relative;\n    overflow: hidden; /* the stage is scaled, not reflowed */\n  }\n\n  /* 620 \xD7 430 Figma units, scaled to the container by JS. transform-origin is\n     what keeps the whole thing pinned to the top-left as it scales. */\n  .org-graph_stage {\n    position: absolute;\n    top: 0;\n    left: 0;\n    transform-origin: 0 0;\n    font-family: inherit;\n    color: var(--og-ink);\n    -webkit-font-smoothing: antialiased;\n  }\n\n  .org-graph_panel {\n    position: absolute;\n    top: 0;\n    left: 0;\n    box-sizing: border-box;\n    background-color: var(--og-panel);\n    border: 1px solid var(--og-line);\n    overflow: hidden;\n  }\n\n  .org-graph_title {\n    position: absolute;\n    left: 0;\n    width: 100%;\n    text-align: center;\n    line-height: 1;\n    font-weight: 500;\n    letter-spacing: 0.01em;\n  }\n\n  .org-graph_wires {\n    position: absolute;\n    inset: 0;\n    width: 100%;\n    height: 100%;\n    overflow: visible;\n    pointer-events: none;\n  }\n  .org-graph_dot {\n    fill: var(--og-dot);\n    fill-opacity: 0.32;\n  }\n  .org-graph_wires path {\n    fill: none;\n    stroke: var(--og-dash);\n    stroke-width: 1;\n    stroke-dasharray: 3 3;\n  }\n\n  /* \u2500\u2500 a seat \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n     ghost = the dashed placeholder, always there. fill = the white card that\n     lands on top of it. Same rect, so the swap is pixel-exact and tweenable \u2014\n     border-style itself is not. */\n  .org-graph_box {\n    position: absolute;\n    box-sizing: border-box;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n  }\n  .org-graph_box-ghost,\n  .org-graph_box-fill {\n    position: absolute;\n    inset: 0;\n    box-sizing: border-box;\n  }\n  /* the placeholder is an SVG stroke, not `border: dashed` \u2014 only a stroke can\n     carry Figma's exact 4 4 pattern around an 8px radius */\n  .org-graph_box-ghost {\n    width: 100%;\n    height: 100%;\n    overflow: visible;\n  }\n  .org-graph_box-ghost rect {\n    fill: none;\n    stroke: var(--og-dash);\n    stroke-width: 1;\n    stroke-dasharray: 4 4;\n  }\n  .org-graph_box-fill {\n    border-radius: 8px;\n  }\n  .org-graph_box-fill {\n    background: var(--og-box);\n    border: 1px solid var(--og-line);\n  }\n  .org-graph_box-label {\n    position: relative;\n    line-height: 1;\n    font-weight: 500;\n    white-space: nowrap;\n  }\n  .org-graph_box[data-org-size='lg'] .org-graph_box-label {\n    font-size: 14px;\n  }\n  .org-graph_box[data-org-size='sm'] .org-graph_box-label {\n    font-size: 12px;\n  }\n\n  /* \u2500\u2500 slider \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  .org-graph_slider {\n    position: absolute;\n    left: 0;\n    width: 100%;\n    touch-action: none; /* the knob owns horizontal drag, the page keeps vertical */\n    cursor: grab;\n  }\n  .org-graph_slider[data-dragging] {\n    cursor: grabbing;\n  }\n  .org-graph_slider:focus-visible {\n    outline: 2px solid var(--og-ink);\n    outline-offset: 3px;\n    border-radius: 12px;\n  }\n  .org-graph_track {\n    position: absolute;\n    left: 0;\n    right: 0;\n    box-sizing: border-box;\n    background: var(--og-box);\n    border: 1px solid var(--og-line);\n  }\n  .org-graph_knob {\n    position: absolute;\n    top: 0;\n    left: 0;\n    border-radius: 50%;\n    background: var(--og-ink);\n    will-change: transform;\n  }\n\n  /* \u2500\u2500 year axis \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  .org-graph_years {\n    position: absolute;\n    left: 0;\n    width: 100%;\n    height: 14px;\n    line-height: 1;\n  }\n  .org-graph_year {\n    position: absolute;\n    top: 0;\n    transform: translateX(-50%);\n    cursor: pointer;\n    color: var(--og-dash);\n    transition: color 0.25s ease;\n  }\n  .org-graph_year[data-state='active'] {\n    color: var(--og-ink);\n    font-weight: 500;\n  }\n";
  var DATA = {
    title: "AUTO Org graph",
    years: [2022, 2023, 2024, 2025, 2026],
    // the top box
    lead: { name: "CEO", since: 2022 },
    // one column each, left to right. `since` on the department itself lets a
    // whole column arrive later — GTM below only opens in 2023.
    departments: [
      {
        name: "Product",
        since: 2022,
        roles: [
          { name: "Product Designer", since: 2022 },
          { name: "Product Manager", since: 2023 },
          { name: "UX Researcher", since: 2025 }
        ]
      },
      {
        name: "Engineering",
        since: 2022,
        roles: [
          { name: "Eng Manager", since: 2022 },
          { name: "Backend Engineer", since: 2023 },
          { name: "Data Engineer", since: 2024 }
        ]
      },
      {
        name: "GTM",
        since: 2022,
        roles: [
          { name: "Account Executive", since: 2023 },
          { name: "Sales Engineer", since: 2024 },
          { name: "Growth Marketer", since: 2026 }
        ]
      }
    ]
  };
  var CONFIG2 = {
    ease: "osmo",
    // CustomEase, registered below if the page has not already
    easePath: "M0,0 C0.625,0.05 0,1 1,1",
    // the frame, in Figma units. Every box and every wire is derived from here.
    layout: {
      width: 620,
      height: 430,
      panel: { w: 620, h: 380, radius: 12 },
      title: { y: 19, size: 10 },
      boxW: 153,
      lead: { x: 233.5, y: 36.5, h: 51 },
      columns: [55.5, 233.5, 411.5],
      // box left edges
      deptY: 136.5,
      deptH: 51,
      rowY: 204.5,
      // first role row
      rowH: 35,
      rowPitch: 52,
      // top-to-top between role rows
      elbowY: 112,
      // where the lead's two branches run horizontally
      elbowR: 24,
      slider: { y: 400, h: 7, inset: 13, knob: 12 },
      // y is the centre line
      axis: { y: 419, size: 11 }
      // 419 + 11px line box = 430, the frame's last pixel
    },
    // marching ants. Speed is in artwork units per second; the dash period is read
    // off the real stroke-dasharray, so travelling exactly one period loops
    // seamlessly whatever pattern the CSS carries.
    crawl: {
      enabled: true,
      wire: { speed: 7 },
      // connectors, flowing away from the CEO
      ghost: { enabled: false, speed: 5 }
      // the empty seats sit still — one flag away
    },
    entrance: { duration: 0.5, stagger: 0.05, y: 10 },
    // panel furniture on enter
    fill: { duration: 0.45, stagger: 0.07, y: 6, scale: 0.94 },
    // seat gets taken
    clear: { duration: 0.28 },
    // …and given back, dragging left
    wire: { duration: 0.35 },
    knob: { duration: 0.5 },
    // walks the slider once on enter so the illustration plays for people who
    // never touch it. Any interaction cancels it for good.
    autoplay: { enabled: true, delay: 0.7, dwell: 2.3 },
    start: "top 78%"
    // ScrollTrigger start, when ScrollTrigger is on the page
  };
  var NS = "http://www.w3.org/2000/svg";
  var instances = [];
  var uid = 0;
  var el = (tag, cls, parent) => {
    const n = document.createElement(tag);
    if (cls)
      n.className = cls;
    if (parent)
      parent.appendChild(n);
    return n;
  };
  var svgEl = (tag, parent) => {
    const n = document.createElementNS(NS, tag);
    if (parent)
      parent.appendChild(n);
    return n;
  };
  var place = (node, x, y, w, h) => {
    node.style.left = x - 0.5 + "px";
    node.style.top = y - 0.5 + "px";
    node.style.width = w + 1 + "px";
    node.style.height = h + 1 + "px";
  };
  function dashPeriod(node) {
    const raw = getComputedStyle(node).strokeDasharray || "";
    const nums = raw.split(/[\s,]+/).map(parseFloat).filter((n) => !isNaN(n));
    if (!nums.length)
      return 0;
    const sum = nums.reduce((t, n) => t + n, 0);
    return nums.length % 2 ? sum * 2 : sum;
  }
  function ease() {
    const CustomEase2 = window.CustomEase;
    if (CustomEase2 && !CustomEase2.get(CONFIG2.ease))
      CustomEase2.create(CONFIG2.ease, CONFIG2.easePath);
    return CustomEase2 && CustomEase2.get(CONFIG2.ease) ? CONFIG2.ease : "power3.out";
  }
  function model() {
    const L = CONFIG2.layout;
    const depts = DATA.departments;
    const rows = depts.reduce((n, d) => Math.max(n, d.roles.length), 0);
    const seats = [];
    seats.push({
      key: "lead",
      person: DATA.lead,
      x: L.lead.x,
      y: L.lead.y,
      w: L.boxW,
      h: L.lead.h,
      size: "lg"
    });
    depts.forEach((dept, c) => {
      const x = L.columns[c % L.columns.length];
      seats.push({ key: "dept-" + c, person: dept, x, y: L.deptY, w: L.boxW, h: L.deptH, size: "lg", col: c });
      const roles = dept.roles.slice().sort((a, b) => a.since - b.since);
      for (let r = 0; r < rows; r++) {
        seats.push({
          key: "role-" + c + "-" + r,
          person: roles[r] || null,
          // a column with fewer roles keeps its dashed seat
          x,
          y: L.rowY + r * L.rowPitch,
          w: L.boxW,
          h: L.rowH,
          size: "sm",
          col: c,
          row: r
        });
      }
    });
    return { seats, rows };
  }
  function trunk(cx, leadCx, leadBottom, deptTop) {
    const L = CONFIG2.layout;
    if (Math.abs(cx - leadCx) < 0.5)
      return `M${cx} ${deptTop}V${leadBottom}`;
    const r = L.elbowR;
    const y = L.elbowY;
    const dir = leadCx > cx ? 1 : -1;
    return `M${cx} ${deptTop}V${y + r}A${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${cx + dir * r} ${y}H${leadCx - dir * r}A${r} ${r} 0 0 ${dir > 0 ? 0 : 1} ${leadCx} ${y - r}V${leadBottom}`;
  }
  function render(mount) {
    const L = CONFIG2.layout;
    const { seats } = model();
    mount.innerHTML = "";
    const stage = el("div", "org-graph_stage", mount);
    stage.style.width = L.width + "px";
    stage.style.height = L.height + "px";
    const panel = el("div", "org-graph_panel", stage);
    panel.style.width = L.panel.w + "px";
    panel.style.height = L.panel.h + "px";
    panel.style.borderRadius = L.panel.radius + "px";
    const title = el("div", "org-graph_title", panel);
    title.textContent = DATA.title;
    title.style.top = L.title.y + "px";
    title.style.fontSize = L.title.size + "px";
    const wires = svgEl("svg", panel);
    wires.setAttribute("class", "org-graph_wires");
    wires.setAttribute("viewBox", `0 0 ${L.panel.w} ${L.panel.h}`);
    const dotId = "org-graph-dots-" + ++uid;
    const defs = svgEl("defs", wires);
    const pat = svgEl("pattern", defs);
    pat.setAttribute("id", dotId);
    pat.setAttribute("patternUnits", "userSpaceOnUse");
    pat.setAttribute("width", "16");
    pat.setAttribute("height", "16");
    const dot = svgEl("rect", pat);
    dot.setAttribute("class", "org-graph_dot");
    dot.setAttribute("x", "14");
    dot.setAttribute("y", "14");
    dot.setAttribute("width", "2");
    dot.setAttribute("height", "2");
    const dots = svgEl("rect", wires);
    dots.setAttribute("width", String(L.panel.w));
    dots.setAttribute("height", String(L.panel.h));
    dots.setAttribute("fill", "url(#" + dotId + ")");
    const wireFor = (d) => {
      const p = svgEl("path", wires);
      p.setAttribute("d", d);
      return p;
    };
    const leadCx = L.lead.x + L.boxW / 2;
    const leadBottom = L.lead.y + L.lead.h;
    seats.filter((s) => s.key.indexOf("dept-") === 0).forEach((s) => {
      const cx = s.x + s.w / 2;
      wireFor(trunk(cx, leadCx, leadBottom, s.y)).setAttribute("data-wire", "trunk");
    });
    const stubs = {};
    seats.filter((s) => s.row !== void 0).forEach((s) => {
      const cx = s.x + s.w / 2;
      const above = s.row === 0 ? L.deptY + L.deptH : s.y - L.rowPitch + L.rowH;
      const p = wireFor(`M${cx} ${above}V${s.y}`);
      p.setAttribute("data-wire", "stub");
      stubs[s.key] = p;
    });
    const boxes = seats.map((s) => {
      const box = el("div", "org-graph_box", panel);
      box.setAttribute("data-org-size", s.size);
      place(box, s.x, s.y, s.w, s.h);
      const ghost = svgEl("svg", box);
      ghost.setAttribute("class", "org-graph_box-ghost");
      ghost.setAttribute("viewBox", `0 0 ${s.w + 1} ${s.h + 1}`);
      const grect = svgEl("rect", ghost);
      grect.setAttribute("x", "0.5");
      grect.setAttribute("y", "0.5");
      grect.setAttribute("width", String(s.w));
      grect.setAttribute("height", String(s.h));
      grect.setAttribute("rx", "7.5");
      const fill = el("span", "org-graph_box-fill", box);
      const label = el("span", "org-graph_box-label", box);
      return { seat: s, node: box, ghost, ghostRect: grect, fill, label, stub: stubs[s.key] || null, filled: null };
    });
    const slider = el("div", "org-graph_slider", stage);
    slider.style.top = L.slider.y - L.slider.knob + "px";
    slider.style.height = L.slider.knob * 2 + "px";
    slider.setAttribute("role", "slider");
    slider.setAttribute("tabindex", "0");
    slider.setAttribute("aria-label", "Year");
    slider.setAttribute("aria-valuemin", String(DATA.years[0]));
    slider.setAttribute("aria-valuemax", String(DATA.years[DATA.years.length - 1]));
    const track = el("div", "org-graph_track", slider);
    track.style.top = L.slider.knob - L.slider.h / 2 - 0.5 + "px";
    track.style.height = L.slider.h + 1 + "px";
    track.style.borderRadius = L.slider.h / 2 + "px";
    const knob = el("div", "org-graph_knob", slider);
    knob.style.width = knob.style.height = L.slider.knob * 2 + "px";
    const axis = el("div", "org-graph_years", stage);
    axis.style.top = L.axis.y + "px";
    axis.style.fontSize = L.axis.size + "px";
    const yearNodes = DATA.years.map((y, i) => {
      const n = el("span", "org-graph_year", axis);
      n.textContent = y;
      n.style.left = tickX(i) + "px";
      return n;
    });
    return { mount, stage, panel, boxes, slider, knob, yearNodes, wires };
  }
  function tickX(i) {
    const L = CONFIG2.layout;
    const span = L.width - L.slider.inset * 2;
    return L.slider.inset + span * i / Math.max(1, DATA.years.length - 1);
  }
  function create(mount) {
    const gsap2 = window.gsap;
    const L = CONFIG2.layout;
    const ui = render(mount);
    const E = ease();
    const st = {
      ...ui,
      index: 0,
      autoplay: null,
      dragging: false,
      touched: false,
      entered: false,
      visible: false,
      // the crawl only runs while the panel is on screen
      killed: false
    };
    const fit = () => {
      const w = mount.getBoundingClientRect().width || L.width;
      const s = w / L.width;
      st.stage.style.transform = "scale(" + s + ")";
      mount.style.height = L.height * s + "px";
    };
    fit();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(fit) : null;
    if (ro)
      ro.observe(mount);
    else
      window.addEventListener("resize", fit);
    st.ro = ro;
    st.fit = fit;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const paint = (animate) => {
      const year = DATA.years[st.index];
      let n = 0;
      st.boxes.forEach((b) => {
        const p = b.seat.person;
        const filled = !!p && year >= p.since;
        if (filled === b.filled)
          return;
        b.filled = filled;
        b.node.setAttribute("data-state", filled ? "filled" : "empty");
        if (filled)
          b.label.textContent = p.name;
        if (b.ghostCrawl)
          b.ghostCrawl.__want = !filled;
        if (b.stubCrawl)
          b.stubCrawl.__want = filled;
        if (st.syncCrawl)
          st.syncCrawl();
        const d = animate && !reduced;
        const targets = [b.fill, b.label];
        if (filled) {
          gsap2.killTweensOf(targets);
          gsap2.fromTo(
            targets,
            { autoAlpha: 0, y: CONFIG2.fill.y, scale: CONFIG2.fill.scale },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: d ? CONFIG2.fill.duration : 0,
              ease: E,
              delay: d ? n * CONFIG2.fill.stagger : 0,
              overwrite: true
            }
          );
          if (b.stub) {
            gsap2.to(b.stub, {
              autoAlpha: 1,
              duration: d ? CONFIG2.wire.duration : 0,
              ease: E,
              delay: d ? n * CONFIG2.fill.stagger : 0
            });
          }
          n++;
        } else {
          gsap2.killTweensOf(targets);
          gsap2.to(targets, {
            autoAlpha: 0,
            y: CONFIG2.fill.y,
            scale: CONFIG2.fill.scale,
            duration: d ? CONFIG2.clear.duration : 0,
            ease: E,
            overwrite: true
          });
          if (b.stub)
            gsap2.to(b.stub, { autoAlpha: 0, duration: d ? CONFIG2.clear.duration : 0, ease: E });
        }
      });
      st.slider.setAttribute("aria-valuenow", String(year));
      st.slider.setAttribute("aria-valuetext", String(year));
      st.yearNodes.forEach((node, i) => node.setAttribute("data-state", i === st.index ? "active" : "idle"));
    };
    const moveKnob = (x, animate) => {
      gsap2.to(st.knob, {
        x: x - L.slider.knob,
        duration: animate && !reduced ? CONFIG2.knob.duration : 0,
        ease: E,
        overwrite: true
      });
    };
    const setIndex = (i, animate) => {
      i = Math.max(0, Math.min(DATA.years.length - 1, i));
      if (i === st.index)
        return;
      st.index = i;
      paint(animate !== false);
    };
    paint(false);
    gsap2.set(
      st.boxes.map((b) => [b.fill, b.label]).flat(),
      { autoAlpha: 0, y: CONFIG2.fill.y, scale: CONFIG2.fill.scale }
    );
    gsap2.set(st.wires.querySelectorAll('[data-wire="stub"]'), { autoAlpha: 0 });
    st.boxes.forEach((b) => b.filled = null);
    moveKnob(tickX(0), false);
    const furniture = [st.panel.querySelector(".org-graph_title"), st.slider, st.stage.querySelector(".org-graph_years")];
    const ghosts = st.boxes.map((b) => b.ghost);
    const trunks = [].slice.call(st.wires.querySelectorAll('[data-wire="trunk"]'));
    const crawls = [];
    const crawl = (node, speed, dir, want) => {
      const period = dashPeriod(node);
      if (!period || reduced || !CONFIG2.crawl.enabled)
        return null;
      const tw = gsap2.to(node, {
        strokeDashoffset: dir * period,
        duration: period / speed,
        ease: "none",
        repeat: -1,
        paused: true
      });
      tw.__want = want;
      crawls.push(tw);
      return tw;
    };
    st.crawls = crawls;
    const syncCrawl = () => {
      crawls.forEach((tw) => tw.paused(!(st.visible && tw.__want)));
    };
    st.syncCrawl = syncCrawl;
    trunks.forEach((t) => crawl(t, CONFIG2.crawl.wire.speed, 1, true));
    st.boxes.forEach((b) => {
      b.ghostCrawl = CONFIG2.crawl.ghost.enabled ? crawl(b.ghostRect, CONFIG2.crawl.ghost.speed, -1, true) : null;
      if (b.stub)
        b.stubCrawl = crawl(b.stub, CONFIG2.crawl.wire.speed, -1, false);
    });
    const enter = () => {
      if (st.entered)
        return;
      st.entered = true;
      if (reduced) {
        st.index = DATA.years.length - 1;
        paint(false);
        moveKnob(tickX(st.index), false);
        return;
      }
      const tl = gsap2.timeline();
      tl.from(furniture, { autoAlpha: 0, y: CONFIG2.entrance.y, duration: CONFIG2.entrance.duration, ease: E, stagger: CONFIG2.entrance.stagger }, 0).from(ghosts, { autoAlpha: 0, duration: CONFIG2.entrance.duration, ease: E, stagger: CONFIG2.entrance.stagger / 2 }, 0.05).from(trunks, { autoAlpha: 0, duration: CONFIG2.wire.duration, ease: E }, 0.15);
      tl.add(() => paint(true), 0.2);
      if (CONFIG2.autoplay.enabled) {
        st.autoplay = gsap2.delayedCall(CONFIG2.autoplay.delay + CONFIG2.autoplay.dwell, function step() {
          if (st.touched || st.killed)
            return;
          if (st.index >= DATA.years.length - 1)
            return;
          setIndex(st.index + 1, true);
          moveKnob(tickX(st.index), true);
          st.autoplay = gsap2.delayedCall(CONFIG2.autoplay.dwell, step);
        });
      }
    };
    st.enter = enter;
    const stopAutoplay = () => {
      st.touched = true;
      if (st.autoplay)
        st.autoplay.kill();
      st.autoplay = null;
    };
    const unitX = (clientX) => {
      const r = st.stage.getBoundingClientRect();
      const s = r.width / L.width || 1;
      return (clientX - r.left) / s;
    };
    const nearest = (x) => {
      const span = L.width - L.slider.inset * 2;
      const t = (x - L.slider.inset) / span;
      return Math.round(t * (DATA.years.length - 1));
    };
    const onDown = (e) => {
      stopAutoplay();
      st.dragging = true;
      st.slider.setPointerCapture(e.pointerId);
      st.slider.setAttribute("data-dragging", "");
      onMove(e);
    };
    const onMove = (e) => {
      if (!st.dragging)
        return;
      const x = Math.max(L.slider.inset, Math.min(L.width - L.slider.inset, unitX(e.clientX)));
      moveKnob(x, false);
      setIndex(nearest(x), true);
    };
    const onUp = (e) => {
      if (!st.dragging)
        return;
      st.dragging = false;
      st.slider.removeAttribute("data-dragging");
      if (st.slider.hasPointerCapture(e.pointerId))
        st.slider.releasePointerCapture(e.pointerId);
      moveKnob(tickX(st.index), true);
    };
    const onKey = (e) => {
      const k = e.key;
      let i = st.index;
      if (k === "ArrowRight" || k === "ArrowUp")
        i++;
      else if (k === "ArrowLeft" || k === "ArrowDown")
        i--;
      else if (k === "Home")
        i = 0;
      else if (k === "End")
        i = DATA.years.length - 1;
      else
        return;
      e.preventDefault();
      stopAutoplay();
      setIndex(i, true);
      moveKnob(tickX(st.index), true);
    };
    st.slider.addEventListener("pointerdown", onDown);
    st.slider.addEventListener("pointermove", onMove);
    st.slider.addEventListener("pointerup", onUp);
    st.slider.addEventListener("pointercancel", onUp);
    st.slider.addEventListener("keydown", onKey);
    st.yearNodes.forEach((node, i) => {
      node.addEventListener("click", () => {
        stopAutoplay();
        setIndex(i, true);
        moveKnob(tickX(i), true);
      });
    });
    st.setYear = (year) => {
      stopAutoplay();
      const i = DATA.years.indexOf(year);
      if (i < 0)
        return;
      setIndex(i, true);
      moveKnob(tickX(i), true);
    };
    const seen = (visible) => {
      st.visible = visible;
      syncCrawl();
      if (visible)
        enter();
    };
    const ScrollTrigger2 = window.ScrollTrigger;
    if (ScrollTrigger2) {
      st.trigger = ScrollTrigger2.create({
        trigger: mount,
        start: CONFIG2.start,
        end: "bottom top",
        onToggle: (self) => seen(self.isActive)
      });
    } else if (typeof IntersectionObserver !== "undefined") {
      st.io = new IntersectionObserver((entries) => entries.forEach((en) => seen(en.isIntersecting)), {
        threshold: 0.15
      });
      st.io.observe(mount);
    } else {
      seen(true);
    }
    return st;
  }
  function initOrgGraph(scope) {
    if (!window.gsap)
      return;
    if (STYLE && !document.getElementById("hi-org-graph-styles")) {
      const tag = document.createElement("style");
      tag.id = "hi-org-graph-styles";
      tag.textContent = STYLE;
      document.head.appendChild(tag);
    }
    destroyOrgGraph();
    const mounts = (scope || document).querySelectorAll(MOUNT);
    mounts.forEach((m) => instances.push(create(m)));
  }
  function destroyOrgGraph() {
    while (instances.length) {
      const st = instances.pop();
      st.killed = true;
      if (st.autoplay)
        st.autoplay.kill();
      if (st.crawls)
        st.crawls.forEach((tw) => tw.kill());
      if (st.trigger)
        st.trigger.kill();
      if (st.io)
        st.io.disconnect();
      if (st.ro)
        st.ro.disconnect();
      else
        window.removeEventListener("resize", st.fit);
      st.mount.innerHTML = "";
    }
  }
  if (typeof window !== "undefined") {
    window.HIOrgGraph = {
      config: CONFIG2,
      data: DATA,
      init: initOrgGraph,
      destroy: destroyOrgGraph,
      instances,
      setYear: (y) => instances.forEach((st) => st.setYear(y))
    };
  }

  // src/orgTabs.js
  var CONFIG3 = {
    svg: "",
    // pasted into the page in Webflow — nothing to fetch
    states: { "source": ["dist/org-tabs-1.svg", "dist/org-tabs-2.svg"], "moves": [{ "name": "Rectangle 21571", "dx": 329.99, "dy": 0 }, { "name": "Modal Content", "dx": 335, "dy": 0 }, { "name": "Modal Content_2", "dx": -330, "dy": 0 }, { "name": "Job Title_4", "dx": 538, "dy": 0 }], "tints": [{ "name": "Group 1171275915", "attr": "fill", "from": "#C375D9", "to": "#E4E8F1" }, { "name": "Group 1171275917", "attr": "fill", "from": "#E4E8F1", "to": "#C375D9" }, { "name": "Group 1171275918", "attr": "fill", "from": "#E4E8F1", "to": "#C375D9" }, { "name": "Group 1171275916", "attr": "fill", "from": "#C375D9", "to": "#E4E8F1" }, { "name": "Name_3", "attr": "fill", "from": "#8B95AA", "to": "#333342" }, { "name": "Ellipse 480", "attr": "fill", "from": "#F798DD", "to": "#666C7E" }, { "name": "Ellipse 481", "attr": "fill", "from": "#F798DD", "to": "#666C7E" }, { "name": "Name_6", "attr": "fill", "from": "#8B95AA", "to": "#333342" }, { "name": "Name_7", "attr": "fill", "from": "#8B95AA", "to": "#333342" }], "overlays": { "a": ["Vector 275", "Vector 278", "Vector 279"], "b": ["Vector 280", "Vector 281", "Vector 277"] } },
    // Tab copy. The frame only carries a description for the first state; the
    // second is Tom's to write — flagged rather than invented.
    tabs: [
      {
        label: "Jane manages Platform",
        text: "Her scope lights up her subtree \u2014 every worker in it, nobody outside it. Nobody configured this."
      },
      {
        label: "Jane moves to Infra",
        text: "Her scope follows her. The Platform subtree goes dark the moment she moves, and Infra lights up."
      }
    ],
    // What to adopt on the page. Lists, so the Webflow classes and the preview's
    // own markup can both match without a second build.
    select: {
      svg: "svg",
      tabs: "[data-hi-tab], .org-aware_nav-item, .org-tabs_tab",
      fill: "[data-hi-progress], .integrations-control_nav-active, .org-tabs_fill",
      activeClass: "is-active"
    },
    nav: 0.55,
    // seconds the mobile tab track takes to bring the active tab in
    swipe: 0.05,
    // fraction of a tab's width that counts as a swipe
    swipeMin: 16,
    // …but never less than this many px
    flick: 0.25,
    // px/ms — a fast flick switches whatever the distance
    dwell: 5,
    // seconds a state holds before autoplay advances
    move: 0.9,
    // travel time between states
    tint: 0.55,
    // colour crossfade
    march: 1.6,
    // seconds for the lit connector's dots to travel one dash cycle
    ease: "osmo"
  };
  function initOrgTabs(scope) {
    const gsap2 = window.gsap;
    const mounts = (scope || document).querySelectorAll("[data-hi-org-tabs]");
    if (!gsap2 || !mounts.length)
      return;
    mounts.forEach(async (mount) => {
      if (mount.__orgTabs)
        mount.__orgTabs.destroy();
      const states = typeof CONFIG3.states === "object" ? CONFIG3.states : await fetch(CONFIG3.states).then((r) => r.json());
      const needsSvg = !mount.querySelector(CONFIG3.select.svg);
      const svgText = needsSvg ? await fetch(CONFIG3.svg).then((r) => r.text()) : "";
      const existing = mount.querySelectorAll(CONFIG3.select.tabs);
      if (!existing.length) {
        mount.innerHTML = `
      <div class="org-tabs">
        <div class="org-tabs_stage"></div>
        <div class="org-tabs_bar">
          ${CONFIG3.tabs.map(
          (t, i) => `
            <button class="org-tabs_tab${i ? "" : " is-active"}" type="button" data-tab="${i}" aria-pressed="${!i}">
              <span class="org-tabs_rail"><span class="org-tabs_fill"></span></span>
              <span class="org-tabs_label">${t.label}</span>
              <span class="org-tabs_text">${t.text}</span>
            </button>`
        ).join("")}
        </div>
      </div>`;
      }
      if (!mount.querySelector(CONFIG3.select.svg)) {
        const host2 = mount.querySelector(".org-tabs_stage") || mount;
        host2.innerHTML = svgText.replace(/<!--[\s\S]*?-->/g, "");
      }
      const svg = mount.querySelector(CONFIG3.select.svg);
      if (!svg)
        return console.warn("[org-tabs] no svg inside the mount");
      svg.setAttribute("width", "100%");
      svg.removeAttribute("height");
      const tabs = [...mount.querySelectorAll(CONFIG3.select.tabs)];
      const fills = tabs.map((tab) => tab.querySelector(CONFIG3.select.fill)).filter(Boolean);
      if (tabs.length < 2)
        return console.warn("[org-tabs] need two tab elements");
      const ACTIVE = CONFIG3.select.activeClass;
      const nodes = (name) => svg.querySelectorAll(`[data-anim="${CSS.escape(name)}"]`);
      const overlay = (state) => [...svg.querySelectorAll(`[data-scope="${state}"]`)];
      const overlays = { a: overlay("a"), b: overlay("b") };
      gsap2.set([...overlays.a, ...overlays.b], { autoAlpha: 0 });
      const paint = (v) => v || "rgba(0,0,0,0)";
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let index = 0;
      let timer = null;
      let tl = null;
      let running = false;
      let marching = [];
      function apply(to, instant) {
        if (tl)
          tl.kill();
        const d = instant || reduced ? 0 : 1;
        tl = gsap2.timeline({ defaults: { ease: CONFIG3.ease } });
        states.moves.forEach(({ name, dx, dy }) => {
          tl.to(nodes(name), { x: to ? dx : 0, y: to ? dy : 0, duration: CONFIG3.move * d }, 0);
        });
        states.tints.forEach(({ name, attr, from, to: toColor }) => {
          const vars = { duration: CONFIG3.tint * d };
          vars[attr] = paint(to ? toColor : from);
          tl.to(nodes(name), vars, CONFIG3.move * d * 0.25);
        });
        const on = to ? overlays.b : overlays.a;
        const off = to ? overlays.a : overlays.b;
        tl.to(off, { autoAlpha: 0, duration: CONFIG3.tint * d }, 0);
        tl.to(on, { autoAlpha: 1, duration: CONFIG3.tint * d }, CONFIG3.move * d * 0.3);
        march(on, off);
        return tl;
      }
      function march(on, off) {
        marching.forEach((t) => t.kill());
        marching = [];
        gsap2.set(off, { strokeDashoffset: 0 });
        if (reduced)
          return;
        on.forEach((el2) => {
          const cycle = 4.5;
          marching.push(
            gsap2.fromTo(
              el2,
              { strokeDashoffset: 0 },
              { strokeDashoffset: -cycle, duration: CONFIG3.march, ease: "none", repeat: -1 }
            )
          );
        });
      }
      const host = tabs[0].parentElement;
      const nativeScroll = () => /auto|scroll/.test(getComputedStyle(host).overflowX);
      const currentX = () => gsap2.getProperty(tabs[0], "x") || 0;
      function metrics() {
        const style = getComputedStyle(host);
        const padL = parseFloat(style.paddingLeft) || 0;
        const padR = parseFloat(style.paddingRight) || 0;
        const first = tabs[0];
        const last = tabs[tabs.length - 1];
        const trackWidth = last.offsetLeft + last.offsetWidth - first.offsetLeft;
        const viewport = host.clientWidth - padL - padR;
        return { trackWidth, viewport, minX: Math.min(0, viewport - trackWidth) };
      }
      const overflows = () => {
        const m = metrics();
        return m.trackWidth > m.viewport + 4;
      };
      function targetX(i) {
        const m = metrics();
        return Math.max(m.minX, Math.min(0, -(tabs[i].offsetLeft - tabs[0].offsetLeft)));
      }
      function positionNav(instant) {
        if (!host)
          return;
        const d = instant || reduced ? 0 : 1;
        if (!overflows()) {
          gsap2.to(tabs, { x: 0, duration: CONFIG3.nav * d, ease: CONFIG3.ease });
          if (host.scrollLeft)
            host.scrollLeft = 0;
          return;
        }
        if (nativeScroll()) {
          const proxy = { v: host.scrollLeft };
          gsap2.to(proxy, {
            v: tabs[index].offsetLeft - tabs[0].offsetLeft,
            duration: CONFIG3.nav * d,
            ease: CONFIG3.ease,
            onUpdate: () => {
              host.scrollLeft = proxy.v;
            }
          });
          return;
        }
        gsap2.to(tabs, {
          x: targetX(index),
          duration: CONFIG3.nav * d,
          ease: CONFIG3.ease,
          onUpdate: () => {
            if (host.scrollLeft)
              host.scrollLeft = 0;
          }
        });
        if (host.scrollLeft)
          host.scrollLeft = 0;
      }
      let drag = null;
      function nearestTab() {
        const x = currentX();
        let best = index;
        let bestD = Infinity;
        tabs.forEach((tab, i) => {
          const d = Math.abs(-(tab.offsetLeft - tabs[0].offsetLeft) - x);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        });
        return best;
      }
      function onDown(e) {
        if (!overflows() || nativeScroll() || e.button > 0)
          return;
        drag = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          from: currentX(),
          moved: false,
          last: e.clientX,
          time: performance.now(),
          velocity: 0
        };
        gsap2.killTweensOf(tabs);
        gsap2.killTweensOf(fills);
      }
      function onMove(e) {
        if (!drag || e.pointerId !== drag.id)
          return;
        const dx = e.clientX - drag.x;
        if (!drag.moved) {
          if (Math.abs(dx) < 6 || Math.abs(e.clientY - drag.y) > Math.abs(dx))
            return;
          drag.moved = true;
          host.setPointerCapture(e.pointerId);
        }
        const now = performance.now();
        const dt = now - drag.time;
        if (dt > 0)
          drag.velocity = (e.clientX - drag.last) / dt;
        drag.last = e.clientX;
        drag.time = now;
        const bound = metrics().minX;
        let x = drag.from + dx;
        if (x > 0)
          x *= 0.35;
        else if (x < bound)
          x = bound + (x - bound) * 0.35;
        gsap2.set(tabs, { x });
      }
      function onUp(e) {
        if (!drag || e.pointerId !== drag.id)
          return;
        const moved = drag.moved;
        const travelled = e.clientX - drag.x;
        const velocity = drag.velocity;
        drag = null;
        if (!moved)
          return runFill();
        const step = tabs.length > 1 ? tabs[1].offsetLeft - tabs[0].offsetLeft : tabs[0].offsetWidth;
        const threshold = Math.max(CONFIG3.swipeMin, step * CONFIG3.swipe);
        const flicked = Math.abs(velocity) > CONFIG3.flick;
        let next;
        if (Math.abs(travelled) > threshold || flicked) {
          next = index + (travelled < 0 ? 1 : -1);
          next = Math.max(0, Math.min(tabs.length - 1, next));
        } else {
          next = nearestTab();
        }
        if (next !== index)
          show(next);
        else {
          positionNav();
          runFill();
        }
      }
      if (host) {
        host.addEventListener("pointerdown", onDown);
        host.addEventListener("pointermove", onMove);
        host.addEventListener("pointerup", onUp);
        host.addEventListener("pointercancel", onUp);
        host.style.touchAction = "pan-y";
      }
      function show(next, instant) {
        index = next;
        tabs.forEach((t, i) => {
          t.classList.toggle(ACTIVE, i === index);
          t.setAttribute("aria-pressed", String(i === index));
        });
        apply(index === 1, instant);
        positionNav(instant);
        runFill();
      }
      function runFill() {
        gsap2.killTweensOf(fills);
        gsap2.set(fills, { scaleX: 0 });
        if (!running)
          return;
        gsap2.set(fills[index], { scaleX: 0 });
        gsap2.to(fills[index], {
          scaleX: 1,
          duration: CONFIG3.dwell,
          ease: "none",
          onComplete: () => show((index + 1) % tabs.length)
        });
      }
      tabs.forEach(
        (tab, i) => tab.addEventListener("click", () => {
          if (i === index || drag && drag.moved)
            return;
          show(i);
        })
      );
      const io = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((e) => e.isIntersecting);
          if (visible === running)
            return;
          running = visible;
          if (running)
            runFill();
          else
            gsap2.killTweensOf(fills);
        },
        { threshold: 0.25 }
      );
      io.observe(mount);
      let lastWidth = window.innerWidth;
      const onResize = () => {
        if (window.innerWidth === lastWidth)
          return;
        lastWidth = window.innerWidth;
        positionNav(true);
      };
      window.addEventListener("resize", onResize);
      show(0, true);
      mount.__orgTabs = {
        destroy() {
          io.disconnect();
          window.removeEventListener("resize", onResize);
          if (host) {
            host.removeEventListener("pointerdown", onDown);
            host.removeEventListener("pointermove", onMove);
            host.removeEventListener("pointerup", onUp);
            host.removeEventListener("pointercancel", onUp);
          }
          gsap2.set(tabs, { clearProps: "x" });
          clearTimeout(timer);
          if (tl)
            tl.kill();
          marching.forEach((t) => t.kill());
          gsap2.killTweensOf(fills);
          gsap2.set(fills, { clearProps: "all" });
          delete mount.__orgTabs;
        },
        show,
        get index() {
          return index;
        }
      };
    });
  }

  // src/personaSlider.js
  var CONFIG4 = {
    select: {
      track: "[data-hi-track], .org-aware_slider-wrapper",
      slide: "[data-hi-slide], .org-aware_slide",
      content: "[data-hi-content], .org-aware_slide-content",
      // tried in order, NOT as one selector list: querySelector resolves a list by
      // document order, which would return the outer box — the inner one wins
      stage: ["[data-hi-stage]", ".org-aware_slide-box-inner", ".org-aware_slide-box"],
      bubble: "[data-hi-bubble], .org-aware_slide-message",
      promptText: "[data-hi-prompt], .org-aware_slide-message-text",
      answer: "[data-hi-answer], .org-aware_slide-box-answer",
      answerText: "p",
      dots: "[data-hi-dots], .org-aware_slider-dots",
      dotClass: "org-aware_slider-dot",
      activeClass: "is-active"
    },
    dwell: 6,
    // seconds before autoplay advances
    slide: 0.6,
    // rail travel
    swap: 0.4,
    // message out / in
    distance: 24,
    // how far a message travels while fading
    idleScale: 0.96,
    // the cards either side sit back
    idleAlpha: 0.55,
    swipe: 0.05,
    // fraction of a card that counts as a swipe
    swipeMin: 16,
    // …but never less than this many px
    flick: 0.25,
    // px/ms — a fast flick always advances
    dots: true,
    // build dots when the page has a container for them
    ease: "osmo",
    // the conversation, offset from the start of the swap — these are the same
    // numbers the SVG scenes use for a chat panel
    chat: {
      bubble: { at: 0, duration: 0.5, scale: 0.94 },
      prompt: { at: 0.15, duration: 0.01, stagger: 0.012 },
      status: { at: 0.4, duration: 0.4, stagger: 0.08 },
      answer: { at: 0.75, duration: 0.55, stagger: 0.12, distance: 6 }
    }
  };
  var STYLE2 = `
.hi-persona-stage { position: relative; }
.hi-persona-msg.hi-persona-msg { display: flex; position: absolute; inset: 0; }
.hi-persona-msg.is-measure { position: relative; }
.hi-persona-unit { display: inline-block; will-change: opacity; }
`;
  function injectStyle() {
    if (document.getElementById("hi-persona-dom-style"))
      return;
    const el2 = document.createElement("style");
    el2.id = "hi-persona-dom-style";
    el2.textContent = STYLE2;
    document.head.appendChild(el2);
  }
  function initPersonaSlider(scope) {
    const gsap2 = window.gsap;
    const mounts = (scope || document).querySelectorAll("[data-hi-persona-slider]");
    if (!gsap2 || !mounts.length)
      return;
    injectStyle();
    mounts.forEach((mount) => {
      if (mount.__personaSlider)
        mount.__personaSlider.destroy();
      const S = CONFIG4.select;
      const track = mount.querySelector(S.track);
      const stage = S.stage.map((sel) => mount.querySelector(sel)).find(Boolean);
      if (!track || !stage)
        return console.warn("[persona] no track or stage inside the mount");
      const originals = [...track.querySelectorAll(S.slide)];
      const n = originals.length;
      if (n < 2)
        return console.warn("[persona] needs at least two slides");
      stage.classList.add("hi-persona-stage");
      const loose = [...mount.querySelectorAll(S.content)].filter((el2) => !stage.contains(el2));
      const messages = originals.map((slide, i) => slide.querySelector(S.content) || loose[i] || null);
      if (messages.some((m) => !m))
        return console.warn(`[persona] ${n} slides but only ${loose.length} content blocks`);
      messages.forEach((content) => {
        content.classList.add("hi-persona-msg");
        content.style.display = "";
        stage.appendChild(content);
      });
      const sizeStage = () => {
        messages.forEach((m) => m.classList.remove("is-measure"));
        let tallest = messages[0];
        let max = 0;
        messages.forEach((m) => {
          m.classList.add("is-measure");
          const h = m.offsetHeight;
          m.classList.remove("is-measure");
          if (h > max) {
            max = h;
            tallest = m;
          }
        });
        tallest.classList.add("is-measure");
        gsap2.set(messages.filter((m) => m !== tallest), { position: "absolute" });
      };
      messages.forEach(parts);
      sizeStage();
      const cards = [];
      for (let set = 0; set < 3; set++) {
        originals.forEach((slide, i) => {
          const card = set === 0 ? slide : slide.cloneNode(true);
          card.dataset.slide = String(i);
          if (set > 0)
            card.setAttribute("aria-hidden", "true");
          track.appendChild(card);
          cards.push(card);
        });
      }
      let dots = [];
      const dotWrap = mount.querySelector(S.dots);
      if (dotWrap && CONFIG4.dots) {
        dotWrap.innerHTML = "";
        dots = originals.map((_, i) => {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = S.dotClass;
          dot.setAttribute("aria-label", `Slide ${i + 1}`);
          dot.addEventListener("click", () => go(i));
          dotWrap.appendChild(dot);
          return dot;
        });
      }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let pos = n;
      let index = 0;
      let running = false;
      let rebaseCall = null;
      let drag = null;
      let draggedAt = 0;
      const rail = track.parentElement || track;
      const step = () => cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth;
      function xFor(i) {
        const card = cards[i];
        if (!card)
          return 0;
        const carried = gsap2.getProperty(track, "x") || 0;
        const trackLeft = track.getBoundingClientRect().left - carried;
        const view = rail.getBoundingClientRect();
        const inTrack = card.offsetLeft - (card.offsetParent === track ? 0 : track.offsetLeft);
        return view.left + view.width / 2 - trackLeft - (inTrack + card.offsetWidth / 2);
      }
      function layout(instant) {
        const d = instant || reduced ? 0 : 1;
        gsap2.to(track, { x: xFor(pos), duration: CONFIG4.slide * d, ease: CONFIG4.ease });
        cards.forEach((card, i) => {
          gsap2.to(card, {
            scale: i === pos ? 1 : CONFIG4.idleScale,
            autoAlpha: i === pos ? 1 : CONFIG4.idleAlpha,
            duration: CONFIG4.slide * d,
            ease: CONFIG4.ease
          });
        });
        dots.forEach((dot, i) => {
          dot.classList.toggle(CONFIG4.select.activeClass, i === index);
          dot.setAttribute("aria-selected", String(i === index));
        });
        originals.forEach((slide, i) => slide.classList.toggle(CONFIG4.select.activeClass, i === index));
      }
      function rebase() {
        const target = n + index;
        if (pos === target)
          return;
        pos = target;
        gsap2.set(track, { x: xFor(pos) });
        cards.forEach(
          (card, i) => gsap2.set(card, { scale: i === pos ? 1 : CONFIG4.idleScale, autoAlpha: i === pos ? 1 : CONFIG4.idleAlpha })
        );
      }
      function split(el2, unit) {
        if (!el2)
          return [];
        const walker = document.createTreeWalker(el2, NodeFilter.SHOW_TEXT);
        const texts = [];
        while (walker.nextNode())
          texts.push(walker.currentNode);
        const out = [];
        texts.forEach((node) => {
          const pieces = unit === "char" ? [...node.textContent] : node.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          pieces.forEach((piece) => {
            if (!piece)
              return;
            if (/^\s+$/.test(piece))
              return frag.appendChild(document.createTextNode(piece));
            const span = document.createElement("span");
            span.className = "hi-persona-unit";
            span.textContent = piece;
            frag.appendChild(span);
            out.push(span);
          });
          node.parentNode.replaceChild(frag, node);
        });
        return out;
      }
      function groupLines(words) {
        const lines = [];
        let top = null;
        words.forEach((w) => {
          const y = Math.round(w.offsetTop);
          if (top === null || Math.abs(y - top) > 2) {
            lines.push([]);
            top = y;
          }
          lines[lines.length - 1].push(w);
        });
        return lines;
      }
      function parts(message) {
        if (message.__parts)
          return message.__parts;
        const bubble = message.querySelector(S.bubble);
        const answer = message.querySelector(S.answer);
        const text = answer && answer.querySelector(S.answerText);
        const words = split(text, "word");
        const built = {
          bubble,
          chars: split(bubble && bubble.querySelector(S.promptText), "char"),
          status: answer ? [...answer.children].filter((c) => c !== text) : [],
          words,
          lines: groupLines(words)
        };
        message.__parts = built;
        return built;
      }
      function shortest(from, to) {
        const forward = (to - from + n) % n;
        const backward = (from - to + n) % n;
        return forward <= backward ? forward : -backward;
      }
      function swapMessage(previous, dir, instant) {
        const d = instant || reduced ? 0 : 1;
        if (previous !== index) {
          gsap2.to(messages[previous], {
            autoAlpha: 0,
            x: -CONFIG4.distance * dir,
            duration: CONFIG4.swap * d,
            ease: CONFIG4.ease
          });
        }
        const message = messages[index];
        const p = parts(message);
        gsap2.killTweensOf([message, p.bubble, ...p.chars, ...p.status, ...p.words].filter(Boolean));
        const tl = gsap2.timeline();
        tl.set(message, { autoAlpha: 1, x: 0 });
        if (!d) {
          tl.set([p.bubble, ...p.chars, ...p.status, ...p.words].filter(Boolean), { autoAlpha: 1, scale: 1, y: 0 });
          return;
        }
        const C = CONFIG4.chat;
        const base = previous === index ? 0 : CONFIG4.swap * 0.5;
        if (p.bubble)
          tl.fromTo(
            p.bubble,
            { autoAlpha: 0, scale: C.bubble.scale },
            { autoAlpha: 1, scale: 1, duration: C.bubble.duration, ease: CONFIG4.ease, transformOrigin: "100% 50%" },
            base + C.bubble.at
          );
        if (p.chars.length)
          tl.fromTo(
            p.chars,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: C.prompt.duration, ease: "none", stagger: C.prompt.stagger },
            base + C.prompt.at
          );
        if (p.status.length)
          tl.fromTo(
            p.status,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: C.status.duration, ease: CONFIG4.ease, stagger: C.status.stagger },
            base + C.status.at
          );
        p.lines.forEach(
          (line, i) => tl.fromTo(
            line,
            { autoAlpha: 0, y: C.answer.distance },
            { autoAlpha: 1, y: 0, duration: C.answer.duration, ease: CONFIG4.ease },
            base + C.answer.at + i * C.answer.stagger
          )
        );
      }
      function go(next, instant) {
        const previous = index;
        const target = (next + n) % n;
        const delta = shortest(previous, target);
        index = target;
        pos += delta;
        swapMessage(previous, delta >= 0 ? 1 : -1, instant);
        layout(instant);
        queue();
        if (rebaseCall)
          rebaseCall.kill();
        if (instant || reduced)
          rebase();
        else
          rebaseCall = gsap2.delayedCall(CONFIG4.slide + 0.05, rebase);
      }
      function queue() {
        gsap2.killTweensOf(tick);
        if (!running)
          return;
        gsap2.delayedCall(CONFIG4.dwell, tick);
      }
      function tick() {
        go(index + 1);
      }
      function onDown(e) {
        if (e.button > 0)
          return;
        drag = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          from: gsap2.getProperty(track, "x") || 0,
          moved: false,
          last: e.clientX,
          time: performance.now(),
          velocity: 0
        };
        gsap2.killTweensOf(track);
        gsap2.killTweensOf(tick);
      }
      function onMove(e) {
        if (!drag || e.pointerId !== drag.id)
          return;
        const dx = e.clientX - drag.x;
        if (!drag.moved) {
          if (Math.abs(dx) < 6 || Math.abs(e.clientY - drag.y) > Math.abs(dx))
            return;
          drag.moved = true;
          rail.setPointerCapture(e.pointerId);
        }
        const now = performance.now();
        const dt = now - drag.time;
        if (dt > 0)
          drag.velocity = (e.clientX - drag.last) / dt;
        drag.last = e.clientX;
        drag.time = now;
        gsap2.set(track, { x: drag.from + dx });
      }
      function onUp(e) {
        if (!drag || e.pointerId !== drag.id)
          return;
        const { moved, velocity } = drag;
        const travelled = e.clientX - drag.x;
        drag = null;
        if (!moved)
          return queue();
        draggedAt = performance.now();
        const threshold = Math.max(CONFIG4.swipeMin, step() * CONFIG4.swipe);
        if (Math.abs(travelled) > threshold || Math.abs(velocity) > CONFIG4.flick) {
          go(index + (travelled < 0 ? 1 : -1));
        } else {
          layout();
          queue();
        }
      }
      rail.addEventListener("pointerdown", onDown);
      rail.addEventListener("pointermove", onMove);
      rail.addEventListener("pointerup", onUp);
      rail.addEventListener("pointercancel", onUp);
      rail.style.touchAction = "pan-y";
      cards.forEach(
        (card, i) => card.addEventListener("click", () => {
          if (drag && drag.moved || performance.now() - draggedAt < 350)
            return;
          const slideIndex = +card.dataset.slide;
          if (slideIndex !== index)
            go(slideIndex);
        })
      );
      const io = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((e) => e.isIntersecting);
          if (visible === running)
            return;
          running = visible;
          queue();
        },
        { threshold: 0.25 }
      );
      io.observe(mount);
      let lastWidth = window.innerWidth;
      const onResize = () => {
        if (window.innerWidth === lastWidth)
          return;
        lastWidth = window.innerWidth;
        sizeStage();
        gsap2.set(track, { x: xFor(pos) });
      };
      window.addEventListener("resize", onResize);
      gsap2.set(messages, { autoAlpha: 0 });
      go(0, true);
      mount.__personaSlider = {
        destroy() {
          io.disconnect();
          window.removeEventListener("resize", onResize);
          rail.removeEventListener("pointerdown", onDown);
          rail.removeEventListener("pointermove", onMove);
          rail.removeEventListener("pointerup", onUp);
          rail.removeEventListener("pointercancel", onUp);
          gsap2.killTweensOf(tick);
          if (rebaseCall)
            rebaseCall.kill();
          delete mount.__personaSlider;
        },
        go,
        get index() {
          return index;
        }
      };
    });
  }

  // src/graphAnimations.js
  var prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function typeText(element, duration = 0.5, delay = 0) {
    if (window.innerWidth < 992)
      return;
    if (prefersReducedMotion())
      return gsap.timeline();
    const split = new SplitText(element, { type: "words", linesClass: "split-line" });
    if (!split.words.length)
      return;
    gsap.set(split.words, { visibility: "hidden" });
    return gsap.to(split.words, {
      visibility: "visible",
      duration,
      delay,
      stagger: { amount: duration, ease: "power2.Inout" },
      ease: "power2.out"
    });
  }
  function revealChatBox(el2, { labelSelector = '[data-anim="chat-label"]', stagger = 0.15 } = {}) {
    if (prefersReducedMotion())
      return gsap.timeline();
    const els = $(el2).toArray();
    const tl = gsap.timeline();
    els.forEach((item, i) => {
      const $label = $(item).prev(labelSelector);
      gsap.set(item, { opacity: 0, y: "5rem", filter: "blur(8px)" });
      if ($label.length)
        gsap.set($label, { x: "1rem", opacity: 0, filter: "blur(8px)" });
      const sub = gsap.timeline();
      sub.to(
        item,
        { opacity: 1, y: "0rem", duration: 0.5, ease: "back.out(1.2)", filter: "blur(0px)" },
        0
      );
      sub.add(typeText(item), 0.25);
      if ($label.length) {
        sub.to($label, { x: "0rem", opacity: 1, filter: "blur(0px)", duration: 0.5 }, 0);
      }
      tl.add(sub, i === 0 ? 0 : `>-1`);
    });
    return tl;
  }
  function revealResponse(el2, { typeDuration = 1.2, logoStagger = 0.08 } = {}) {
    if (prefersReducedMotion())
      return gsap.timeline();
    const $el = $(el2);
    const $head = $el.find('[data-anim="response-head"]');
    const $text = $el.find('[data-anim="response-text"]');
    const $sources = $el.find('[data-anim="response-sources"]');
    const $logos = $sources.find("svg, img");
    gsap.set(el2, { opacity: 0, y: "3rem", filter: "blur(6px)" });
    if ($head.length)
      gsap.set($head, { opacity: 0, x: "-0.5rem" });
    if ($text.length)
      gsap.set($text, { opacity: 0 });
    if ($sources.length)
      gsap.set($sources, { opacity: 0 });
    if ($logos.length)
      gsap.set($logos.toArray(), { opacity: 0, scale: 0.6 });
    const tl = gsap.timeline();
    tl.to(el2, {
      opacity: 1,
      y: "0rem",
      filter: "blur(0px)",
      duration: 0.4,
      ease: "power3.out"
    });
    if ($head.length) {
      tl.to(
        $head,
        {
          opacity: 1,
          x: "0rem",
          duration: 0.25,
          ease: "power2.out"
        },
        ">-0.3"
      );
    }
    if ($text.length) {
      tl.to($text, { opacity: 1, duration: 0.1 }, ">-0.15");
      tl.add(typeText($text[0], typeDuration), "<");
    }
    if ($sources.length) {
      tl.to($sources, { opacity: 1, duration: 0.15 }, "<+0.4");
      if ($logos.length) {
        tl.to(
          $logos.toArray(),
          {
            opacity: 1,
            scale: 1,
            duration: 0.2,
            ease: "back.out(2)",
            stagger: logoStagger
          },
          "<"
        );
      }
    }
    return tl;
  }
  function revealGraf(el2) {
    if (prefersReducedMotion())
      return gsap.timeline();
    const $el = $(el2);
    const tl = gsap.timeline();
    const $base = $el.find('[data-anim="graph-base"]');
    const $dots = $el.find('[data-anim="dots"]').find("path, circle");
    const $mask = $el.find('[data-anim="graph-mask"]');
    const $chart = $el.find('[data-anim="chart"]');
    const $maskPaths = $mask.find("path");
    const $maskDots = $mask.find('[id^="dots"]');
    const $cursor = $el.find('[data-anim="cursor"]');
    const $dot = $el.find('[data-anim="dot"]');
    const $lineH = $el.find('[id^="line-h"]');
    const $lineV = $el.find('[id^="line-v"]');
    const $lineGroups = $el.find('[id^="line-group"]');
    const $lineTop = $el.find('[id^="line-top"]');
    const $lineBottom = $el.find('[id^="line-bottom"]');
    const $lineLeft = $el.find('[id^="line-left"]');
    const $lineRight = $el.find('[id^="line-right"]');
    const $tooltip = $el.find('[data-anim="tooltip"]');
    const $label = $el.find('[data-anim="label"]');
    const $graphTable = $el.find('[data-anim="graph-table"]');
    const base = $base[0];
    const grid = base ? base.querySelector("#grid") : null;
    const labelsY = base ? [...base.querySelectorAll("#stats-vertical path")] : [];
    const labelsX = base ? [...base.querySelectorAll("#stats-horizontal path")] : [];
    const legend = base ? [...base.querySelectorAll("#legend > g")] : [];
    const baseRows = base ? [...base.querySelectorAll('[id^="row_"]')] : [];
    const baseHasKnownChildren = grid || labelsY.length || labelsX.length || legend.length || baseRows.length;
    if (base && !baseHasKnownChildren) {
      gsap.set(base, { autoAlpha: 0 });
    }
    if (grid)
      gsap.set(grid, { autoAlpha: 0 });
    if (labelsY.length)
      gsap.set(labelsY, { autoAlpha: 0, x: -8 });
    if (labelsX.length)
      gsap.set(labelsX, { autoAlpha: 0, y: 8 });
    if (legend.length)
      gsap.set(legend, { autoAlpha: 0, y: 6 });
    baseRows.forEach((row) => {
      const rowBase = row.querySelector("#base");
      const others = [...row.children].filter((c) => c.id !== "base");
      gsap.set(row, { autoAlpha: 0 });
      if (rowBase)
        gsap.set(rowBase, { clipPath: "inset(0 100% 0 0)" });
      if (others.length)
        gsap.set(others, { autoAlpha: 0, y: 4 });
    });
    const $dotsContainer = $el.find('[data-anim="dots"]');
    if ($dotsContainer.length)
      gsap.set($dotsContainer, { autoAlpha: 0 });
    if ($dots.length)
      gsap.set($dots, { scale: 0, transformOrigin: "center" });
    if ($maskDots.length)
      gsap.set($maskDots, { scale: 0, transformOrigin: "center" });
    if ($chart.length)
      gsap.set($chart, { rotate: 25, autoAlpha: 0 });
    if ($cursor.length)
      gsap.set($cursor, { autoAlpha: 0 });
    if ($lineH.length)
      gsap.set($lineH, { clipPath: "inset(0 100% 0 0)" });
    if ($lineV.length)
      gsap.set($lineV, { scaleY: 0, transformOrigin: "center bottom" });
    if ($lineTop.length)
      gsap.set($lineTop, { scaleY: 0, transformOrigin: "center top" });
    if ($lineBottom.length)
      gsap.set($lineBottom, { scaleY: 0, transformOrigin: "center bottom" });
    if ($lineLeft.length)
      gsap.set($lineLeft, { scaleX: 0, transformOrigin: "left center" });
    if ($lineRight.length)
      gsap.set($lineRight, { scaleX: 0, transformOrigin: "right center" });
    if ($dot.length)
      gsap.set($dot, { x: "10em", y: "10em" });
    if ($tooltip.length)
      gsap.set($tooltip, { scale: 0.5, transformOrigin: "left", autoAlpha: 0 });
    if ($label.length)
      gsap.set($label, { scale: 0.5, transformOrigin: "center", autoAlpha: 0 });
    if (base && !baseHasKnownChildren) {
      tl.to(base, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0);
    }
    if (grid)
      tl.to(grid, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0);
    if (labelsY.length)
      tl.to(labelsY, { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.06, ease: "power2.out" }, 0.1);
    if (labelsX.length)
      tl.to(labelsX, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.04, ease: "power2.out" }, 0.1);
    if (legend.length)
      tl.to(legend, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" }, 0.4);
    if (baseRows.length) {
      baseRows.forEach((row, i) => {
        const rowBase = row.querySelector("#base");
        const others = [...row.children].filter((c) => c.id !== "base");
        const pos = i === 0 ? ">-0.15" : ">-0.18";
        tl.set(row, { autoAlpha: 1 }, pos);
        if (others.length)
          tl.to(
            others,
            { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.02, ease: "power2.out" },
            "<"
          );
        if (rowBase)
          tl.to(rowBase, { clipPath: "inset(0 0% 0 0)", duration: 0.35, ease: "power2.out" }, "<");
      });
    }
    if ($dots.length) {
      const DOTS_SPREAD = 0.5;
      const DOTS_DURATION = 0.06;
      const shuffled = gsap.utils.shuffle([...$dots]);
      if ($dotsContainer.length)
        tl.set($dotsContainer, { autoAlpha: 1 }, "-=0.2");
      tl.to(
        shuffled,
        {
          scale: 1,
          duration: DOTS_DURATION,
          stagger: $dots.length > 0 ? DOTS_SPREAD / $dots.length : 0.03,
          ease: "back.out(2)"
        },
        "<"
      );
    }
    if ($maskPaths.length) {
      const dashed = [];
      const solid = [];
      $maskPaths.each((_, el3) => {
        (el3.getAttribute("stroke-dasharray") ? dashed : solid).push(el3);
      });
      if (solid.length) {
        tl.fromTo(
          solid,
          {
            strokeDasharray: (i, el3) => parseFloat(el3.style.strokeDasharray) || el3.getTotalLength(),
            strokeDashoffset: (i, el3) => parseFloat(el3.style.strokeDasharray) || el3.getTotalLength()
          },
          { strokeDashoffset: 0, duration: 1.5, stagger: 0.2, ease: "power2.out" },
          "-=0.2"
        );
      }
      if (dashed.length) {
        gsap.set(dashed, { clipPath: "inset(0 100% 0 0)" });
        tl.to(
          dashed,
          { clipPath: "inset(0 0% 0 0)", duration: 1.5, stagger: 0.2, ease: "power2.out" },
          solid.length ? "<" : "-=0.2"
        );
      }
    }
    if ($maskDots.length) {
      tl.to($maskDots, { scale: 1, duration: 0.25, stagger: 0.04, ease: "back.out(3)" });
    }
    if ($chart.length) {
      tl.to($chart, { rotate: 0, autoAlpha: 1, duration: 1.5, ease: "power2.out" }, "<");
      const $chartLabels = $chart.find('[id^="label-"]');
      if ($chartLabels.length) {
        gsap.set($chartLabels, { autoAlpha: 0 });
        tl.to(
          $chartLabels,
          { autoAlpha: 1, duration: 0.7, stagger: 0.05, ease: "back.out(2)" },
          "-=0.1"
        );
      }
    }
    if ($graphTable.length) {
      tl.from($graphTable.find("#labels path, #head path"), {
        y: "1em",
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.inOut"
      }).from(
        $graphTable.find('#table [id^="item"]'),
        { y: "1em", autoAlpha: 0, duration: 0.8, stagger: 0.01, ease: "power2.inOut" },
        "<0.2"
      );
    }
    if ($dot.length)
      tl.to($dot, { x: "0em", y: "0em", duration: 0.8, ease: "power2.inOut" }, "-=0.1");
    if ($lineH.length)
      tl.to(
        [...$lineH].reverse(),
        { clipPath: "inset(0 0% 0 0)", duration: 0.5, stagger: 0.06, ease: "power2.out" },
        "-=0.4"
      );
    if ($lineGroups.length) {
      const groups = [...$lineGroups];
      groups.forEach((group, i) => {
        const $g = $(group);
        const vBars = [
          ...$g.find('[id^="line-v"]').toArray(),
          ...$g.find('[id^="line-top"]').toArray(),
          ...$g.find('[id^="line-bottom"]').toArray()
        ];
        const hBars = [
          ...$g.find('[id^="line-left"]').toArray(),
          ...$g.find('[id^="line-right"]').toArray()
        ];
        const pos = i === 0 ? "-=0.8" : ">-=0.3";
        if (vBars.length)
          tl.to(vBars, { scaleY: 1, duration: 0.5, ease: "power2.out" }, pos);
        if (hBars.length)
          tl.to(hBars, { scaleX: 1, duration: 0.5, ease: "power2.out" }, pos);
      });
    } else if ($lineV.length) {
      tl.to(
        [...$lineV].reverse(),
        { scaleY: 1, duration: 0.5, stagger: 0.06, ease: "power2.out" },
        "-=0.8"
      );
    }
    if ($cursor.length)
      tl.to($cursor, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, "-=0.2");
    if ($tooltip.length)
      tl.to(
        $tooltip,
        { scale: 1, autoAlpha: 1, duration: 0.5, stagger: 0.03, ease: "back.out(2)" },
        "-=0.2"
      );
    if ($label.length)
      tl.to(
        $label,
        { scale: 1, autoAlpha: 1, duration: 0.5, stagger: 0.03, ease: "back.out(2)" },
        "-=0.2"
      );
    return tl;
  }
  function revealPlatformIllustration(el2) {
    if (prefersReducedMotion())
      return gsap.timeline();
    const $el = $(el2);
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    const logo = $el.find(".platform-illustration_logo")[0];
    const agentBoxes = $el.find(".platform-illustration_agent-box").toArray();
    const options = $el.find(".platform-illustrations_options")[0];
    const serviceBoxes = $el.find(".platform-illustration_service-box").toArray();
    const human = $el.find(".platform-illustrations_human")[0];
    const baseBoxes = $el.find(".platform-illustrations_base-box, .page-header_side-diagram-box").toArray();
    const queryBox = $el.find(".platform-illustration_query-box")[0];
    const labels = $el.find(".platform-illustrations_label").toArray();
    const staticBase = $el.find('[data-anim="platform-dots"]')[0];
    const mainEls = [logo, options, human, queryBox].filter(Boolean);
    if (mainEls.length)
      gsap.set(mainEls, { autoAlpha: 0, y: 20 });
    if (labels.length)
      gsap.set(labels, { autoAlpha: 0, y: 8 });
    if (agentBoxes.length)
      gsap.set(agentBoxes, { autoAlpha: 0, y: 24 });
    if (serviceBoxes.length)
      gsap.set(serviceBoxes, { autoAlpha: 0, y: 20 });
    if (baseBoxes.length)
      gsap.set(baseBoxes, { autoAlpha: 0, y: 16 });
    if (staticBase)
      gsap.set(staticBase, { autoAlpha: 0 });
    if (baseBoxes.length) {
      tl.to(
        baseBoxes,
        { autoAlpha: 1, y: 0, duration: 0.4, stagger: { amount: 0.5, from: "random" } },
        0
      );
    }
    if (human)
      tl.to(human, { autoAlpha: 1, y: 0, duration: 0.35 }, ">-0.3");
    if (serviceBoxes.length) {
      tl.to(serviceBoxes, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.08 }, ">-0.3");
    }
    if (options) {
      gsap.set(options, { x: -12 });
      tl.to(options, { autoAlpha: 1, x: 0, y: 0, duration: 0.35 }, ">-0.25");
    }
    if (agentBoxes.length) {
      tl.to(
        agentBoxes,
        { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "back.out(1.4)" },
        ">-0.25"
      );
    }
    if (logo) {
      gsap.set(logo, { scale: 0.9 });
      tl.to(logo, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.7)" }, ">-0.2");
    }
    if (queryBox)
      tl.to(queryBox, { autoAlpha: 1, y: 0, duration: 0.4 }, ">-0.2");
    if (labels.length)
      tl.to(labels, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.06 }, ">-0.2");
    if (staticBase)
      tl.to(staticBase, { autoAlpha: 1, duration: 1 }, ">-0.2");
    return tl;
  }

  // src/index.js
  gsap.registerPlugin(SplitText, ScrollTrigger, DrawSVGPlugin, CustomEase);
  history.scrollRestoration = "manual";
  var lenis2 = null;
  var nextPage = document;
  var onceFunctionsInitialized = false;
  var hasLenis = typeof window.Lenis !== "undefined";
  var hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";
  var rmMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reducedMotion = rmMQ.matches;
  rmMQ.addEventListener?.("change", (e) => reducedMotion = e.matches);
  rmMQ.addListener?.((e) => reducedMotion = e.matches);
  var durationDefault = 0.6;
  var tabsResizeObserver = null;
  CustomEase.create("osmo", "0.625, 0.05, 0, 1");
  gsap.defaults({ ease: "osmo", duration: durationDefault });
  function initOnceFunctions() {
    initLenis();
    if (onceFunctionsInitialized)
      return;
    onceFunctionsInitialized = true;
    $("body").attr("data-anim-loaded", "true");
    resetPage(nextPage);
    initVisuals(nextPage);
  }
  function initBeforeEnterFunctions(next) {
    nextPage = next || document;
    if (hasScrollTrigger) {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill(false));
    }
  }
  function initAfterEnterFunctions(next) {
    nextPage = next || document;
    if (hasLenis) {
      lenis2.resize();
    }
    if (hasScrollTrigger) {
      ScrollTrigger.refresh();
    }
  }
  var pixelHorizontalAmount = 80;
  var transitionDuration = 1;
  var pixelFadeDuration = 0.2;
  var pixelOverlap = 0;
  function runPageOnceAnimation(next) {
    const tl = gsap.timeline();
    return tl;
  }
  function runPageLeaveAnimation(current, next) {
    const tl = gsap.timeline();
    if (reducedMotion) {
      tl.set(current, { autoAlpha: 0 });
      tl.call(() => current.remove(), null, 0);
      initVisuals(next);
      return tl;
    }
    const isPortrait = window.innerHeight > window.innerWidth;
    const activeDuration = isPortrait ? transitionDuration * 1.5 : transitionDuration;
    pixelGrid(isPortrait);
    const transitionWrap = document.querySelector("[data-transition-wrap]");
    const transitionPanel = transitionWrap.querySelector("[data-transition-panel]");
    const lines = Array.from(transitionPanel.querySelectorAll("[data-transition-col]"));
    const allPixels = transitionPanel.querySelectorAll("[data-transition-pixel]");
    const overlap = Math.max(0, Math.min(1, pixelOverlap));
    const clipFrom = isPortrait ? "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" : "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)";
    const clipTo = isPortrait ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
    const clipStart = Math.min(pixelFadeDuration, activeDuration * 0.5);
    const clipDuration = Math.max(1e-3, activeDuration - 2 * clipStart);
    const stepDur = clipDuration / Math.max(1, pixelHorizontalAmount);
    const transitionEndDelay = activeDuration / Math.max(1, pixelHorizontalAmount);
    gsap.set(allPixels, { opacity: 0, willChange: "opacity" });
    gsap.set(transitionPanel, { opacity: 1, willChange: "opacity" });
    gsap.set(next, {
      autoAlpha: 1,
      clipPath: clipFrom,
      webkitClipPath: clipFrom,
      willChange: "clip-path",
      force3D: true,
      maxHeight: "100dvh"
    });
    lines.forEach((line, i) => {
      const pixels = Array.from(line.querySelectorAll("[data-transition-pixel]"));
      if (!pixels.length)
        return;
      const revealTime = clipStart + i * stepDur;
      const fillStart = Math.max(0, revealTime - pixelFadeDuration);
      const fadeStart = Math.min(activeDuration, revealTime + stepDur);
      const fadeEnd = Math.min(activeDuration, fadeStart + pixelFadeDuration);
      const perPixelMin = pixelFadeDuration / pixels.length;
      const perPixelDur = perPixelMin * (1 - overlap) + pixelFadeDuration * overlap;
      const spread = Math.max(0, pixelFadeDuration - perPixelDur);
      tl.to(
        pixels,
        {
          opacity: 1,
          duration: Math.max(1e-3, perPixelDur),
          ease: "none",
          stagger: {
            amount: spread,
            from: "random"
          }
        },
        fillStart
      );
      tl.to(
        pixels,
        {
          opacity: 0,
          duration: Math.max(1e-3, perPixelDur),
          ease: "none",
          stagger: {
            amount: spread,
            from: "random"
          }
        },
        fadeStart
      );
    });
    tl.to(
      next,
      {
        clipPath: clipTo,
        webkitClipPath: clipTo,
        ease: `steps(${pixelHorizontalAmount}, start)`,
        duration: clipDuration
      },
      clipStart
    ).call(initVisuals, [next], isPortrait ? clipStart + clipDuration : clipStart + clipDuration / 2);
    tl.set(
      next,
      { clearProps: "clipPath,webkitClipPath,willChange,force3D,maxHeight" },
      clipStart + clipDuration
    );
    tl.call(() => current.remove(), null, activeDuration + transitionEndDelay);
    tl.set(allPixels, { clearProps: "willChange" }, activeDuration + transitionEndDelay);
    tl.set(transitionPanel, { clearProps: "willChange" }, activeDuration + transitionEndDelay);
    return tl;
  }
  function runPageEnterAnimation(next) {
    const tl = gsap.timeline();
    const isPortrait = window.innerHeight > window.innerWidth;
    const activeDuration = isPortrait ? transitionDuration * 2 : transitionDuration;
    const transitionEndDelay = activeDuration / Math.max(1, pixelHorizontalAmount);
    if (reducedMotion) {
      tl.set(next, { autoAlpha: 1 });
      tl.add("pageReady");
      tl.call(resetPage, [next], "pageReady");
      $(nextPage).find("main").css("opacity", "1");
      return new Promise((resolve) => tl.call(resolve, null, "pageReady"));
    }
    tl.add("pageReady", activeDuration + transitionEndDelay);
    tl.call(resetPage, [next], "pageReady");
    return new Promise((resolve) => {
      tl.call(resolve, null, "pageReady");
    });
  }
  function pixelGrid(isPortrait) {
    const panel = document.querySelector("[data-transition-panel]");
    if (!panel)
      return;
    const rect = panel.getBoundingClientRect();
    panel.style.flexDirection = isPortrait ? "column" : "row";
    const lineSizePx = isPortrait ? rect.height / pixelHorizontalAmount : rect.width / pixelHorizontalAmount;
    const crossAmount = Math.ceil((isPortrait ? rect.width : rect.height) / lineSizePx);
    let lines = panel.querySelectorAll("[data-transition-col]");
    const lineTemplate = lines[0];
    const pixelTemplate = lineTemplate.querySelector("[data-transition-pixel]");
    if (lines.length !== pixelHorizontalAmount) {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < pixelHorizontalAmount; i++) {
        frag.appendChild(lineTemplate.cloneNode(false));
      }
      panel.replaceChildren(frag);
      lines = panel.querySelectorAll("[data-transition-col]");
    }
    lines.forEach((line) => {
      line.style.flexDirection = isPortrait ? "row" : "column";
      line.style.flex = "1 1 auto";
      line.style.justifyContent = "center";
      const diff = crossAmount - line.childElementCount;
      if (diff > 0) {
        const frag = document.createDocumentFragment();
        for (let i = 0; i < diff; i++) {
          frag.appendChild(pixelTemplate.cloneNode(true));
        }
        line.appendChild(frag);
      } else if (diff < 0) {
        for (let i = diff; i < 0; i++) {
          line.lastElementChild.remove();
        }
      }
    });
    const colorChance = 0.05;
    const baseColor = "#ffffff";
    const accentColor = "#e4e8f1";
    const allPx = panel.querySelectorAll("[data-transition-pixel]");
    allPx.forEach((px) => {
      px.style.backgroundColor = Math.random() < colorChance ? accentColor : baseColor;
    });
  }
  barba.hooks.beforeEnter((data) => {
    gsap.set(data.next.container, {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10
    });
    if (lenis2 && typeof lenis2.stop === "function") {
      lenis2.stop();
    }
    initBeforeEnterFunctions(data.next.container);
    applyThemeFrom(data.next.container);
  });
  barba.hooks.afterLeave(() => {
  });
  barba.hooks.enter((data) => {
    initBarbaNavUpdate(data);
    $(data.next.container).find("main").css("opacity", "0");
  });
  barba.hooks.afterEnter((data) => {
    initAfterEnterFunctions(data.next.container);
    if (window.Webflow && window.Webflow.require) {
      window.Webflow.destroy();
      window.Webflow.ready();
      window.Webflow.require("ix2").init();
      document.dispatchEvent(new Event("readystatechange"));
    }
    if (hasLenis) {
      lenis2.resize();
      lenis2.start();
    }
    if (hasScrollTrigger) {
      ScrollTrigger.refresh();
    }
  });
  barba.init({
    debug: true,
    // Set to 'false' in production
    timeout: 7e3,
    preventRunning: true,
    transitions: [
      {
        name: "default",
        sync: true,
        // First load
        async once(data) {
          initOnceFunctions();
          return runPageOnceAnimation(data.next.container);
        },
        // Current page leaves
        async leave(data) {
          return runPageLeaveAnimation(data.current.container, data.next.container);
        },
        // New page enters
        async enter(data) {
          return runPageEnterAnimation(data.next.container);
        }
      }
    ]
  });
  var themeConfig = {
    light: {
      nav: "dark",
      transition: "light"
    },
    dark: {
      nav: "light",
      transition: "dark"
    }
  };
  function applyThemeFrom(container) {
    const pageTheme = container?.dataset?.pageTheme || "light";
    const config = themeConfig[pageTheme] || themeConfig.light;
    document.body.dataset.pageTheme = pageTheme;
    const transitionEl = document.querySelector("[data-theme-transition]");
    if (transitionEl) {
      transitionEl.dataset.themeTransition = config.transition;
    }
    const nav = document.querySelector("[data-theme-nav]");
    if (nav) {
      nav.dataset.themeNav = config.nav;
    }
  }
  function initLenis() {
    if (lenis2)
      return;
    if (!hasLenis)
      return;
    lenis2 = new Lenis({
      lerp: 0.165,
      wheelMultiplier: 1.25
    });
    if (hasScrollTrigger) {
      lenis2.on("scroll", ScrollTrigger.update);
    }
    gsap.ticker.add((time) => {
      lenis2.raf(time * 1e3);
    });
    gsap.ticker.lagSmoothing(0);
  }
  function resetPage(container) {
    window.scrollTo(0, 0);
    gsap.set(container, { clearProps: "position,top,left,right" });
    if (hasLenis) {
      lenis2.resize();
      lenis2.start();
    }
  }
  function initBarbaNavUpdate(data) {
    document.querySelectorAll(".nav_menu-dropdown.is-product.w-dropdown-list.w--open").forEach((dd) => {
      gsap.to(dd, {
        autoAlpha: 0,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          dd.classList.remove("w--open");
          gsap.set(dd, { clearProps: "all" });
        }
      });
    });
    document.querySelectorAll(".w-dropdown-toggle.w--open").forEach((toggle) => {
      toggle.classList.remove("w--open");
    });
    document.querySelectorAll(".w-nav-button").forEach((btn) => {
      btn.classList.remove("w--open");
      btn.setAttribute("aria-expanded", "false");
    });
    document.querySelectorAll(".w-nav-overlay").forEach((overlay) => {
      overlay.style.display = "none";
      overlay.style.height = "0";
    });
    document.querySelectorAll(".w-nav-menu").forEach((menu) => {
      menu.classList.remove("w--open");
    });
    var tpl = document.createElement("template");
    tpl.innerHTML = data.next.html.trim();
    var nextNodes = tpl.content.querySelectorAll("[data-barba-update]");
    var currentNodes = document.querySelectorAll("nav [data-barba-update]");
    currentNodes.forEach(function(curr, index) {
      var next = nextNodes[index];
      if (!next)
        return;
      var newStatus = next.getAttribute("aria-current");
      if (newStatus !== null) {
        curr.setAttribute("aria-current", newStatus);
      } else {
        curr.removeAttribute("aria-current");
      }
      var newClassList = next.getAttribute("class") || "";
      curr.setAttribute("class", newClassList);
    });
  }
  function initVisuals(nextPage2) {
    const scope = nextPage2 || document;
    const has = (s) => !!scope.querySelector(s);
    if (has("[data-illustration]"))
      runSecureMCP(nextPage2);
    scope.querySelectorAll(".graph-box_wrap").forEach((el2) => {
      gsap.set(el2, { autoAlpha: 0, yPercent: 10 });
    });
    $("body").attr("data-anim-loaded", "true");
    if (has('[data-parallax="trigger"]'))
      initGlobalParallax(nextPage2);
    if (has("[data-scramble]") || has("[data-scramble-hover]"))
      initScrambleText(nextPage2);
    if (has("[data-pattern]"))
      runPattern(nextPage2);
    if (has("[data-highlight-marker-reveal]"))
      initHighlightMarkerTextReveal(nextPage2);
    if (has("[data-reveal-group]"))
      initContentRevealScroll(nextPage2);
    if (has('[data-anim="platform-dots"]'))
      initPlatformDots(nextPage2);
    if (has(".audit-logging-tabs-wrap"))
      initAuditTabs(scope, { replay: replayCardIllustration });
    if (has("[data-hi-illustration]"))
      initCardIllustrations(scope);
    if (has("[data-tab-active]"))
      initIntegrationsControl(scope);
    if (has("[data-hi-org-graph]"))
      initOrgGraph(scope);
    if (has("[data-hi-org-tabs]"))
      initOrgTabs(scope);
    if (has("[data-hi-persona-slider]"))
      initPersonaSlider(scope);
    if (has("[data-accordion-css-init]"))
      initAccordionCSS(scope);
    if (has("[data-modal-group-status]"))
      initModalBasic(nextPage2);
    if (has("[data-tabs-init]"))
      initDashboardTabs(scope);
    initHomeAnimations(scope);
    initProductAnimations(scope);
    $(nextPage2).find("main").css("opacity", "1");
  }
  function initAccordionCSS(scope) {
    let acIdSeq = 0;
    const uid2 = (prefix) => `${prefix}-${++acIdSeq}`;
    scope.querySelectorAll("[data-accordion-css-init]").forEach((accordion) => {
      const closeSiblings = accordion.getAttribute("data-accordion-close-siblings") === "true";
      accordion.querySelectorAll("[data-accordion-status]").forEach((item) => {
        const toggle = item.querySelector("[data-accordion-toggle]");
        if (!toggle)
          return;
        const panel = Array.from(item.children).find((c) => c !== toggle);
        if (!panel)
          return;
        if (!panel.id)
          panel.id = uid2("accordion-panel");
        panel.setAttribute("role", "region");
        const heading = toggle.querySelector("h1, h2, h3, h4, h5, h6");
        if (heading) {
          if (!heading.id)
            heading.id = uid2("accordion-heading");
          panel.setAttribute("aria-labelledby", heading.id);
        }
        if (!toggle.hasAttribute("role"))
          toggle.setAttribute("role", "button");
        if (!toggle.hasAttribute("tabindex"))
          toggle.setAttribute("tabindex", "0");
        toggle.setAttribute("aria-controls", panel.id);
        const isActiveInit = item.getAttribute("data-accordion-status") === "active";
        toggle.setAttribute("aria-expanded", isActiveInit ? "true" : "false");
        const icon = toggle.querySelector(".faqs-item_icon, [data-accordion-icon]");
        if (icon)
          icon.setAttribute("aria-hidden", "true");
      });
      const syncAria = (item) => {
        const toggle = item.querySelector("[data-accordion-toggle]");
        if (!toggle)
          return;
        const isActive = item.getAttribute("data-accordion-status") === "active";
        toggle.setAttribute("aria-expanded", isActive ? "true" : "false");
      };
      const toggleItem = (item) => {
        const isActive = item.getAttribute("data-accordion-status") === "active";
        item.setAttribute("data-accordion-status", isActive ? "not-active" : "active");
        syncAria(item);
        if (closeSiblings && !isActive) {
          accordion.querySelectorAll('[data-accordion-status="active"]').forEach((sibling) => {
            if (sibling !== item) {
              sibling.setAttribute("data-accordion-status", "not-active");
              syncAria(sibling);
            }
          });
        }
      };
      accordion.addEventListener("click", (event) => {
        const toggle = event.target.closest("[data-accordion-toggle]");
        if (!toggle)
          return;
        const item = toggle.closest("[data-accordion-status]");
        if (!item)
          return;
        toggleItem(item);
      });
      accordion.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ")
          return;
        const toggle = event.target.closest("[data-accordion-toggle]");
        if (!toggle)
          return;
        event.preventDefault();
        const item = toggle.closest("[data-accordion-status]");
        if (!item)
          return;
        toggleItem(item);
      });
    });
  }
  function initHomeAnimations(scope) {
    const $scope = $(scope);
    const has = (s) => !!scope.querySelector(s);
    if (has(".white-paper_testimonials"))
      initWhitePaperSwiper(scope);
    $scope.find(".claude-dashboard").each(function() {
      const trigger = $(this);
      const chatDashboard = trigger.find(".claude-dashboard_base");
      const chatBubble = trigger.find('[data-anim="chat-bubble"]');
      const chatResponse = trigger.find('[data-anim="response"]');
      const boxWrap = this.querySelector(".graph-box_wrap");
      if (chatDashboard.length) {
        gsap.from(chatDashboard, {
          opacity: 0,
          yPercent: 5,
          scrollTrigger: { trigger: chatDashboard, start: "top 90%", once: true }
        });
      }
      if (boxWrap) {
        gsap.set(boxWrap, { autoAlpha: 0, yPercent: 10 });
        ScrollTrigger.create({
          trigger: boxWrap,
          start: "top 90%",
          once: true,
          onEnter: () => gsap.to(boxWrap, {
            autoAlpha: 1,
            yPercent: 0,
            duration: 0.55,
            ease: "cubic-bezier(0.38, 0.005, 0.215, 1)"
          })
        });
      }
      if (chatBubble.length) {
        const bubbleTl = revealChatBox(chatBubble);
        bubbleTl.pause();
        ScrollTrigger.create({
          trigger: chatBubble,
          start: "top 95%",
          once: true,
          onEnter: () => bubbleTl.play()
        });
      }
      if (chatResponse.length) {
        const responseTl = revealResponse(chatResponse);
        responseTl.pause();
        ScrollTrigger.create({
          trigger: chatResponse,
          start: "top 95%",
          once: true,
          onEnter: () => responseTl.play()
        });
      }
      const grafTl = revealGraf(trigger);
      grafTl.pause();
      ScrollTrigger.create({
        trigger: trigger.find('[data-anim="graph-base"]').length ? trigger.find('[data-anim="graph-base"]') : trigger,
        start: "top 90%",
        once: true,
        markers: true,
        onEnter: () => grafTl.play()
      });
    });
    $scope.find('[data-anim="claude-feature"]').each(function() {
      const trigger = $(this);
      const chatBubble = trigger.find('[data-anim="chat-bubble"]');
      const chatResponse = trigger.find('[data-anim="response"]');
      const boxWrap = this.querySelector(".graph-box_wrap");
      const tl = gsap.timeline({ scrollTrigger: { trigger, start: "40% bottom", once: true } });
      if (boxWrap)
        tl.to(
          boxWrap,
          { autoAlpha: 1, yPercent: 0, duration: 0.55, ease: "cubic-bezier(0.38, 0.005, 0.215, 1)" },
          0
        );
      tl.add(revealChatBox(chatBubble), 0).add(revealResponse(chatResponse), ">-1").add(revealGraf(trigger), ">-2");
    });
    $scope.find('[data-anim="chat-feature"]').each(function() {
      const trigger = $(this);
      const chatBubble = trigger.find('[data-anim="chat-bubble"]');
      const chatResponse = trigger.find('[data-anim="response"]');
      const boxWrap = this.querySelector(".graph-box_wrap");
      const tl = gsap.timeline({ scrollTrigger: { trigger, start: "40% bottom", once: true } });
      if (boxWrap)
        tl.to(
          boxWrap,
          { autoAlpha: 1, yPercent: 0, duration: 0.55, ease: "cubic-bezier(0.38, 0.005, 0.215, 1)" },
          0
        );
      tl.add(revealChatBox(chatBubble), 0).add(revealResponse(chatResponse), ">-1").add(revealGraf(trigger), ">-2");
    });
    $scope.find('[data-anim="platform-top"]').each(function() {
      gsap.timeline({
        delay: 1,
        scrollTrigger: { trigger: this, start: "top bottom", once: true },
        onComplete: () => window.dispatchEvent(new Event("platform-illustration-complete"))
      }).add(revealPlatformIllustration(this));
    });
    $scope.find('[data-anim="platform"]').each(function() {
      gsap.timeline({
        delay: 1,
        scrollTrigger: { trigger: this, start: "top bottom", once: true },
        onComplete: () => window.dispatchEvent(new Event("platform-illustration-complete"))
      }).add(revealPlatformIllustration(this));
      const $allBoxes = $(this).find(".platform-illustration_agent-box");
      let activeBox = null;
      $allBoxes.each(function() {
        const $box = $(this);
        $box.on("mouseenter", function() {
          activeBox = this;
          const $prev = $box.prevAll(".platform-illustration_agent-box");
          const $next = $box.nextAll(".platform-illustration_agent-box");
          gsap.killTweensOf($allBoxes.toArray());
          $allBoxes.each(function() {
            gsap.set(this, { zIndex: "auto" });
          });
          gsap.set(this, { zIndex: 10 });
          gsap.to(this, { rotation: -4, y: -14, scale: 1.03, duration: 0.3, ease: "power2.out" });
          gsap.to($prev.toArray(), {
            x: 18,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
            stagger: 0.04
          });
          gsap.to($next.toArray(), {
            x: -18,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
            stagger: 0.04
          });
        });
        $box.on("mouseleave", function() {
          if (activeBox !== this)
            return;
          activeBox = null;
          gsap.killTweensOf($allBoxes.toArray());
          gsap.to($allBoxes.toArray(), {
            x: 0,
            rotation: 0,
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: "power2.inOut",
            onComplete: () => $allBoxes.each(function() {
              gsap.set(this, { zIndex: "auto" });
            })
          });
        });
      });
    });
  }
  function initProductAnimations(scope) {
    const $scope = $(scope);
    $scope.find('[data-anim="natural-lang-hero"]').each(function() {
      const trigger = $(this);
      const svg = trigger.find("svg")[0] || trigger;
      const side = svg.querySelector("#side");
      const header = svg.querySelector("#Header");
      const filters = svg.querySelector("#filters");
      const barChart = svg.querySelector("#Bar\\ Chart");
      const frame17 = svg.querySelector("#Frame\\ 17");
      const navItems = side ? [...side.querySelectorAll("#items > *")] : [];
      const chatBubble = trigger.find('[data-anim="chat-bubble"]');
      gsap.set(side, { autoAlpha: 0, x: -24 });
      gsap.set(header, { autoAlpha: 0, y: -18 });
      gsap.set(filters, { autoAlpha: 0 });
      gsap.set(barChart, { autoAlpha: 0, scale: 0.96, transformOrigin: "center center" });
      gsap.set(frame17, { autoAlpha: 0, x: -100 });
      if (navItems.length)
        gsap.set(navItems, { autoAlpha: 0, x: -10 });
      const boxWrap = this.querySelector(".graph-box_wrap");
      const tl = gsap.timeline({ delay: 0.5 });
      if (boxWrap)
        tl.to(
          boxWrap,
          { autoAlpha: 1, yPercent: 0, duration: 0.55, ease: "cubic-bezier(0.38, 0.005, 0.215, 1)" },
          0
        );
      tl.to(side, { autoAlpha: 1, x: 0, duration: 0.5, ease: "power2.out" }, 0).to(header, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0.05).to(navItems, { autoAlpha: 1, x: 0, duration: 0.35, ease: "power2.out", stagger: 0.05 }, 0.25).to(filters, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0.4).to(barChart, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "power2.out" }, 0.5).to(frame17, { autoAlpha: 1, x: 0, duration: 0.45, ease: "power2.out" }, 0.8).add(revealGraf(trigger)).add(revealChatBox(chatBubble), "<");
    });
    $scope.find('[data-anim="product-chart"]').each(function() {
      const trigger = $(this);
      const chatBubble = trigger.find('[data-anim="chat-bubble"]');
      const boxWrap = this.querySelector(".graph-box_wrap");
      const grafTl = revealGraf(trigger);
      const chatTl = revealChatBox(chatBubble);
      const master = gsap.timeline({ paused: true });
      if (boxWrap)
        master.to(
          boxWrap,
          { autoAlpha: 1, yPercent: 0, duration: 0.55, ease: "cubic-bezier(0.38, 0.005, 0.215, 1)" },
          0
        );
      master.add(chatTl, 0).add(grafTl, "<1");
      ScrollTrigger.create({
        trigger,
        start: "top 80%",
        once: true,
        onEnter: () => master.play()
      });
    });
  }
  function initDashboardTabs(scope) {
    const root = (scope || document).querySelector("[data-tabs-init]");
    if (!root)
      return;
    const items = [...root.querySelectorAll("[data-tab-item]")];
    const images = [...root.querySelectorAll("[data-tab-image]")];
    if (!items.length || !images.length)
      return;
    const list = root.querySelector("[data-tabs-list]") || items[0].parentElement;
    if (!list)
      return;
    const panes = items.map((item, i) => {
      const key = item.getAttribute("data-tab-item");
      let img = images.find((el2) => el2.getAttribute("data-tab-image") === key);
      if (!img && images[i]) {
        img = images[i];
        console.warn(`[tabs] no [data-tab-image="${key}"] \u2014 matched by index instead.`);
      }
      return { item, img, key };
    }).filter((p) => p.img);
    if (!panes.length)
      return;
    const stack = images[0].parentElement;
    if (getComputedStyle(images[0]).position === "static") {
      gsap.set(stack, { position: "relative" });
      gsap.set(images, { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" });
    }
    gsap.set(images, { display: getComputedStyle(images[0]).display, autoAlpha: 0 });
    const pillHost = list.parentElement;
    let pill = pillHost.querySelector("[data-tab-pill]");
    if (!pill) {
      pill = document.createElement("div");
      pill.setAttribute("data-tab-pill", "");
      pill.setAttribute("aria-hidden", "true");
      pillHost.insertBefore(pill, list);
    }
    gsap.set(pillHost, { position: "relative" });
    gsap.set(pill, {
      position: "absolute",
      top: 0,
      left: 0,
      pointerEvents: "none",
      zIndex: 0,
      autoAlpha: 0
    });
    gsap.set(list, { position: "relative", zIndex: 1 });
    items.forEach((el2) => gsap.set(el2, { cursor: "pointer" }));
    const measure = (item) => {
      const a = item.getBoundingClientRect();
      const b = pillHost.getBoundingClientRect();
      return {
        x: a.left - b.left + pillHost.scrollLeft,
        y: a.top - b.top + pillHost.scrollTop,
        width: a.width,
        height: a.height
      };
    };
    let lastBox = "";
    const boxKey = (b) => `${b.x}|${b.y}|${b.width}|${b.height}`;
    const movePill = (item, animate) => {
      const box = measure(item);
      lastBox = boxKey(box);
      const to = { ...box, autoAlpha: 1 };
      if (animate && !reducedMotion)
        gsap.to(pill, { ...to, duration: 0.45, overwrite: true });
      else
        gsap.set(pill, to);
    };
    list.setAttribute("role", "tablist");
    list.setAttribute("aria-orientation", "vertical");
    panes.forEach(({ item, img, key }, i) => {
      const tabId = `h-dashboard-tab-${key || i}`;
      const panelId = `h-dashboard-panel-${key || i}`;
      item.id = tabId;
      item.setAttribute("role", "tab");
      item.setAttribute("aria-controls", panelId);
      img.id = panelId;
      img.setAttribute("role", "tabpanel");
      img.setAttribute("aria-labelledby", tabId);
    });
    let active = -1;
    const setActive = (index, animate = true) => {
      if (!panes[index] || index === active)
        return;
      const prev = panes[active];
      active = index;
      const { item, img } = panes[index];
      panes.forEach((p, i) => {
        const on = i === index;
        p.item.setAttribute("data-state", on ? "active" : "inactive");
        p.item.setAttribute("aria-selected", on ? "true" : "false");
        p.item.tabIndex = on ? 0 : -1;
      });
      movePill(item, animate);
      if (!animate || reducedMotion) {
        gsap.set(
          panes.map((p) => p.img),
          { autoAlpha: 0, zIndex: 1 }
        );
        gsap.set(img, { autoAlpha: 1, scale: 1, y: 0, zIndex: 2 });
        return;
      }
      if (prev && prev.img !== img) {
        gsap.set(prev.img, { zIndex: 1 });
        gsap.to(prev.img, { autoAlpha: 0, scale: 0.985, duration: 0.35, overwrite: true });
      }
      gsap.set(img, { zIndex: 2 });
      gsap.fromTo(
        img,
        { autoAlpha: 0, scale: 1.015, y: 8 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, overwrite: true }
      );
    };
    panes.forEach(({ item }, i) => {
      item.addEventListener("click", () => setActive(i));
      item.addEventListener("keydown", (e) => {
        const last = panes.length - 1;
        let next = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight")
          next = i === last ? 0 : i + 1;
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft")
          next = i === 0 ? last : i - 1;
        else if (e.key === "Home")
          next = 0;
        else if (e.key === "End")
          next = last;
        else if (e.key === "Enter" || e.key === " ")
          next = i;
        if (next === null)
          return;
        e.preventDefault();
        setActive(next);
        panes[next].item.focus();
      });
    });
    const syncPill = () => {
      if (!panes[active])
        return;
      if (gsap.isTweening(pill))
        return;
      const box = measure(panes[active].item);
      if (boxKey(box) === lastBox)
        return;
      movePill(panes[active].item, false);
    };
    tabsResizeObserver?.disconnect();
    tabsResizeObserver = new ResizeObserver(syncPill);
    tabsResizeObserver.observe(list);
    items.forEach((el2) => tabsResizeObserver.observe(el2));
    const preset = panes.findIndex(({ item }) => item.getAttribute("data-state") === "active");
    setActive(preset > -1 ? preset : 0, false);
  }
})();
//# sourceMappingURL=index.js.map
