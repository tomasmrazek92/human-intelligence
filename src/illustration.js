export function runSecureMCP(nextPage) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const scope = nextPage || document;
  if (!scope.querySelector('[data-illustration]')) return;

  // ─────────────────────────────────────────────
  // ANIMATION CONFIG — tweak everything here
  // ─────────────────────────────────────────────
  const CONFIG = {
    // ScrollTrigger — add [data-illustration] to your SVG wrapper in Webflow
    scrollTrigger: {
      trigger: '[data-illustration]',
      start: 'top 80%',
      markers: false,
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
      subLayers: { offset: 0.06, gap: 0.05, duration: 0.22 },
    },

    // ── Phase 2 — labels, outlines and lines all reveal together ─────────────
    // labels.gap places the shared 'reveal' mark relative to the end of the
    // layers phase; outlines.offset and dashedLines.offset are measured FROM
    // that mark, so all three run concurrently.
    labels: {
      duration: 0.2,
      stagger: 0.06,
      gap: '-=0.25', // overlap with the tail of the layers phase
      groupGap: '-=0.15',
      title: { duration: 0.2, gap: '-=0.1' },
    },

    // ── Phase 3 — outline prisms drawn around the stack ──────────────────────
    // Both wrappers sit FIRST in document order inside their parent, so they
    // paint under the layers — drawing them alongside cannot cover anything.
    outlines: {
      offset: 0,
      fill: 0.3,
      stroke: 1.1,
      strokeEase: 'power2.out',
      overlap: '-=0.1', // stroke starts before the fill has finished
      between: '-=0.9', // apps prism starts while the platform prism is drawing
    },

    // ── Phase 4 — dashed connector lines ─────────────────────────────────────
    // strokeDashoffset, NOT DrawSVG — DrawSVG rewrites stroke-dasharray and
    // would destroy the dash pattern.
    dashedLines: {
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.inOut',
      offset: 0,
      repeatDelay: 0.8,
    },

    // ─── Float animations (post-reveal) ──────────────────────────────────────
    floats: {
      agentPlatform: {
        y: -5,
        ease: 'sine.inOut',
        'agent-platform-layer': { duration: 1.8, delay: 0 },
        'headcount-layer': { duration: 1.9, delay: 0.15 },
        'open-enrollment-layer': { duration: 1.7, delay: 0.3, y: -4 },
        'performance-management-layer': { duration: 2.0, delay: 0.45 },
        'onboarding-layer': { duration: 1.8, delay: 0.6, y: -4 },
        'people-analytics-layer': { duration: 1.9, delay: 0.75 },
      },
      agents: {
        y: -8,
        ease: 'sine.inOut',
        claude: { duration: 1.8, delay: 0 },
        gpt: { duration: 1.9, delay: 0.4 },
        gemini: { duration: 2.0, delay: 0.6 },
        grok: { duration: 1.7, delay: 0.2 },
      },
      dataPlatform: {
        y: -6,
        ease: 'sine.inOut',
        'mcp-layer': { duration: 1.8, delay: 0 },
        'compliance-layer': { duration: 1.9, delay: 0.15 },
        'identity-aware-layer': { duration: 1.7, delay: 0.3, y: -4 },
        'semantic-layer': { duration: 2.0, delay: 0.45 },
        'data-modeling-layer': { duration: 1.8, delay: 0.6, y: -4 },
      },
      apps: {
        y: -8,
        ease: 'sine.inOut',
        workday: { duration: 1.8, delay: 0 },
        'greenhouse-layer': { duration: 1.9, delay: 0.3 },
        carta: { duration: 2.0, delay: 0.5 },
        'lattice-layer': { duration: 1.7, delay: 0.15 },
      },
    },
    // ─────────────────────────────────────────────────────────────────────────
  };
  // ─────────────────────────────────────────────

  /**
   * IllustrationAnimation
   * Master sequence for the architecture diagram, in four phases:
   * 1. Layers   — every plate in the stack drops in, top of the diagram down:
   *               agent platform → agents row → data platform → source apps
   * 2. Labels   — the annotations, in the same top-to-bottom order
   * 3. Outlines — the two prism wrappers draw around the finished stack
   * 4. Dashed connector lines (looping)
   */
  const IllustrationAnimation = (() => {
    // 'carta_logo.svg' contains a dot — invalid in a #id selector
    const CARTA = '[id="carta_logo.svg"]';

    // Agent platform (topmost layer first, downward through the stack)
    const PLATFORM_LAYERS = [
      '#agent-platform-layer',
      '#headcount-layer',
      '#open-enrollment-layer',
      '#performance-management-layer',
      '#onboarding-layer',
      '#people-analytics-layer',
    ];
    // Label ids mirror the layer order. 'performance-managemet' is misspelt in
    // the source SVG — keep it, do not "fix" it here.
    const PLATFORM_LABELS = [
      '#headcount',
      '#open-enrollment',
      '#performance-managemet',
      '#onboarding',
      '#people-analytics',
    ];

    const AGENT_TILES = ['#claude', '#gpt', '#gemini', '#grok'];

    // Data platform — top of the stack down
    const DATA_LAYERS = [
      '#mcp-layer',
      '#compliance-layer',
      '#identity-aware-layer',
      '#semantic-layer',
      '#data-modeling-layer',
    ];
    // 'idenity-aware' is misspelt in the source SVG — kept as authored.
    const DATA_LABELS = ['#mcp', '#compliance', '#idenity-aware', '#semantic', '#data-modeling'];

    const APP_TILES = ['#workday', '#greenhouse-layer', CARTA, '#lattice-layer'];

    const DASHED_LINES = ['#dashed-lines', '#dashed-lines_2', '#dashed-lines_3', '#dashed-lines_4'];

    const floatTweens = [];

    const pushFloat = (sel, cfg, h) => {
      if (!cfg || !scope.querySelector(sel)) return;
      floatTweens.push(
        gsap.to(sel, {
          y: cfg.y ?? h.y,
          ease: h.ease,
          repeat: -1,
          yoyo: true,
          duration: cfg.duration,
          delay: cfg.delay,
        })
      );
    };

    // Float config is keyed by bare id so the selector list stays the source of truth
    const floatGroup = (selectors, h) => {
      selectors.forEach((sel) => {
        const key = sel.startsWith('#')
          ? sel.slice(1)
          : sel.replace(/\[id="(.+)"\]/, '$1').replace('_logo.svg', '');
        pushFloat(sel, h[key], h);
      });
    };

    const hideAll = () => {
      gsap.set(['#agent-platform', '#agents-row', '#data-platform-row'], { autoAlpha: 0 });

      // Phase 1 targets
      gsap.set([...PLATFORM_LAYERS, '#agents-base', ...AGENT_TILES, ...DATA_LAYERS, ...APP_TILES], {
        autoAlpha: 0,
      });

      // Phase 2 targets
      gsap.set([...PLATFORM_LABELS, '#label-title', '#agents', ...DATA_LABELS, '#title'], {
        autoAlpha: 0,
      });

      // Phase 3 targets — the apps prism is a fill path + a stroke path, the
      // platform prism is one path carrying both. drawSVG is deferred to the
      // outline phase so path length is measured after the parent is visible.
      gsap.set(['#layer-wrapper', '#apps-wrapper'], { autoAlpha: 0 });
      gsap.set('#apps-wrapper > path:first-child', { autoAlpha: 0 });

      // Phase 4 targets
      gsap.set(DASHED_LINES, { autoAlpha: 0 });
    };

    // Phase 1: every layer, top of the diagram to the bottom.
    // One flat list so the acceleration runs continuously across all four
    // groups. Each layer is positioned at an absolute time rather than chained,
    // because a stagger restarts its own pacing inside every tween.
    const layersTimeline = () => {
      const c = CONFIG.layers;
      // AGENT_TILES are deliberately absent: they are sub-layers of #agents-base
      // and are scheduled off it below, so the main stack never waits for them.
      const order = [...PLATFORM_LAYERS, '#agents-base', ...DATA_LAYERS, ...APP_TILES];
      const last = Math.max(order.length - 1, 1);
      // 0 at the first layer, 1 at the last, shaped by curve
      const ramp = (i, from, to) => from + (to - from) * (i / last) ** c.curve;
      // ease omitted — inherits the house 'osmo' default from index.js
      const tl = gsap.timeline();

      tl.set(['#agent-platform', '#agents-row', '#data-platform-row'], { autoAlpha: 1 });

      let at = 0;
      order.forEach((sel, i) => {
        tl.fromTo(
          sel,
          { y: CONFIG.dropY, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: ramp(i, c.durationFrom, c.durationTo) },
          at
        );

        // Sub-layers ride their own plate and do not advance the main clock
        if (sel === '#agents-base') {
          const s = c.subLayers;
          AGENT_TILES.forEach((tile, j) => {
            tl.fromTo(
              tile,
              { y: CONFIG.dropY, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: s.duration },
              at + s.offset + j * s.gap
            );
          });
        }

        at += ramp(i, c.gapFrom, c.gapTo);
      });

      tl.add(() => {
          floatGroup(PLATFORM_LAYERS, CONFIG.floats.agentPlatform);
          floatGroup(AGENT_TILES, CONFIG.floats.agents);
          floatGroup(DATA_LAYERS, CONFIG.floats.dataPlatform);
          floatGroup(APP_TILES, CONFIG.floats.apps);
        });

      return tl;
    };

    // Phase 2: labels, same top-to-bottom order
    const labelsTimeline = () => {
      const c = CONFIG.labels;
      const fade = { autoAlpha: 1, duration: c.duration, stagger: c.stagger };
      const tl = gsap.timeline(); // inherits the house 'osmo' ease

      tl.to(PLATFORM_LABELS, fade)
        .to('#label-title', { autoAlpha: 1, duration: c.title.duration }, c.title.gap)
        .to('#agents', { autoAlpha: 1, duration: c.duration }, c.groupGap)
        .to(DATA_LABELS, fade, c.groupGap)
        .to('#title', { autoAlpha: 1, duration: c.title.duration }, c.title.gap);

      return tl;
    };

    // Phase 3: the two outline prisms
    const outlinesTimeline = () => {
      const c = CONFIG.outlines;
      const tl = gsap.timeline();

      // Platform prism — one path with both fill and gradient stroke, so the
      // fill is faded via fillOpacity while drawSVG runs the stroke.
      const platform = gsap
        .timeline()
        .set('#layer-wrapper', { autoAlpha: 1, fillOpacity: 0, drawSVG: 0 })
        .to('#layer-wrapper', { fillOpacity: 1, duration: c.fill })
        .to('#layer-wrapper', { drawSVG: '100%', duration: c.stroke, ease: c.strokeEase }, c.overlap);

      // Apps prism — separate fill and stroke paths.
      // Built as its own timeline so `between` shifts the WHOLE block: a
      // position parameter on a .set() moves only that set, and the tweens
      // after it still append to the end of the parent timeline.
      const apps = gsap
        .timeline()
        .set('#apps-wrapper', { autoAlpha: 1 })
        .set('#apps-wrapper > path:last-child', { drawSVG: 0 })
        .to('#apps-wrapper > path:first-child', {
          autoAlpha: 1,
          duration: c.fill,
        })
        .to(
          '#apps-wrapper > path:last-child',
          { drawSVG: '100%', duration: c.stroke, ease: c.strokeEase },
          c.overlap
        );

      tl.add(platform).add(apps, c.between);

      return tl;
    };

    // Phase 4: dashed connector lines
    const dashedLinesTimeline = () => {
      const c = CONFIG.dashedLines;
      const tl = gsap.timeline();

      const parents = DASHED_LINES.map((id) => scope.querySelector(id)).filter(Boolean);
      const allPaths = parents.flatMap((el) =>
        el.tagName.toLowerCase() === 'path' ? [el] : [...el.querySelectorAll('path')]
      );

      if (!allPaths.length) return tl;

      // Preserve the dash pattern — offset by full path length now (still hidden)
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
        },
      });

      return tl;
    };

    const init = () => {
      const triggerEl = scope.querySelector(CONFIG.scrollTrigger.trigger);
      gsap.context(() => {
        if (!triggerEl) return;
        hideAll();

        gsap
          .timeline({
            scrollTrigger: {
              trigger: triggerEl,
              start: CONFIG.scrollTrigger.start,
              markers: CONFIG.scrollTrigger.markers,
              once: true,
            },
          })
          .add(layersTimeline())
          // Labels, outlines and connector lines all start from one mark so they
          // reveal together. Their offsets are measured from it, not chained —
          // a relative '-=x' would stack them back into a sequence.
          .addLabel('reveal', CONFIG.labels.gap)
          .add(labelsTimeline(), 'reveal')
          .add(outlinesTimeline(), `reveal+=${CONFIG.outlines.offset}`)
          .add(dashedLinesTimeline(), `reveal+=${CONFIG.dashedLines.offset}`);

        new IntersectionObserver(([entry]) => {
          floatTweens.forEach((t) => (entry.isIntersecting ? t.play() : t.pause()));
        }).observe(triggerEl);
      }, triggerEl);
    };

    return { init };
  })();

  IllustrationAnimation.init();
}
