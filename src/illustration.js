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
      markers: true,
    },

    // Gap between each section in the master timeline
    sectionGap: '-=0.6',

    // Shared easing for reveal tweens
    ease: 'back.out(1.7)',

    // How far elements drop in from (px)
    dropY: 30,

    // Section 1 — Agent Builders (top of stack)
    agentBuilders: {
      tiles: { duration: 0.3, stagger: 0.1, gap: '-=0.08' },
      label: { duration: 0.2 },
    },

    // Section 2 — Human Intelligence
    humanIntelligence: {
      card: { duration: 0.3 },
      logo: { duration: 0.2, overlap: '-=0.1' },
    },

    // Section 3 — Highlight prism outline
    highlight: {
      fill: { duration: 0.3 },
      stroke: { duration: 1, ease: 'power2.out', overlap: '-=0.1' },
      gap: '-=0.3',
    },

    // Section 4 — MCP and API (4 layers)
    mcpApi: {
      layers: { duration: 0.3, stagger: 0.08 },
      label: { duration: 0.2, gap: '+=0.05' },
    },

    // Section 5 — PII Audit (single layer)
    piiAudit: {
      layer: { duration: 0.3 },
      label: { duration: 0.2, gap: '+=0.05' },
    },

    // Section 6 — Policy Management (4 layers)
    policy: {
      layers: { duration: 0.3, stagger: 0.08 },
      label: { duration: 0.2, gap: '+=0.05' },
    },

    // Section 7 — Org-Aware row-level security (single layer)
    orgAware: {
      layer: { duration: 0.3 },
      label: { duration: 0.2, gap: '+=0.05' },
    },

    // Section 8 — Metric & Methodology Management (single layer)
    metricMethology: {
      layer: { duration: 0.3 },
      label: { duration: 0.2, gap: '+=0.05' },
    },

    // Section 9 — Warehousing, ingestion & modeling
    warehousing: {
      outerCard: { duration: 0.3 },
      innerCard: { duration: 0.25, overlap: '-=0.5' },
      label: { duration: 0.2, gap: '-=0.05' },
    },

    // Section 10 — Data sources and tools (bottom of stack)
    dataSources: {
      tools: { duration: 0.3, stagger: 0.08, dropY: 30 },
      label: { duration: 0.2, gap: '+=0.05' },
    },

    // Section 11 — Dotted connector lines (DrawSVG stroke reveal)
    dottedLines: {
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.inOut',
      gap: '-=0.4',
      repeatDelay: 0.8,
    },

    // ─── Float animations (post-reveal) ──────────────────────────────────────
    floats: {
      agentBuilders: {
        y: -8,
        ease: 'sine.inOut',
        airtable: { duration: 1.8, delay: 0 },
        claude: { duration: 1.9, delay: 0.4 },
        agentBuilder: { duration: 2.0, delay: 0.6 },
      },
      humanIntelligence: {
        y: -4,
        ease: 'sine.inOut',
        card: { duration: 2.2, delay: 0 },
      },
      mcpApi: {
        y: -6,
        ease: 'sine.inOut',
        layer_12: { duration: 1.8, delay: 0 },
        layer_13: { duration: 1.9, delay: 0.15, y: -4 },
        layer_14: { duration: 1.7, delay: 0.3 },
        layer_15: { duration: 2.0, delay: 0.45, y: -4 },
      },
      piiAudit: {
        y: -5,
        ease: 'sine.inOut',
        layer_11: { duration: 1.8, delay: 0 },
      },
      policy: {
        y: -6,
        ease: 'sine.inOut',
        layer_7: { duration: 1.8, delay: 0 },
        layer_8: { duration: 1.9, delay: 0.15 },
        layer_9: { duration: 1.7, delay: 0.3, y: -4 },
        layer_10: { duration: 2.0, delay: 0.45 },
      },
      orgAware: {
        y: -5,
        ease: 'sine.inOut',
        layer_6: { duration: 1.8, delay: 0 },
      },
      metricMethology: {
        y: -5,
        ease: 'sine.inOut',
        layer: { duration: 1.8, delay: 0 },
      },
      warehousing: {
        y: -6,
        ease: 'sine.inOut',
        layer_4: { duration: 1.8, delay: 0 },
        layer_5: { duration: 1.8, delay: 0.1, y: -4 },
      },
    },
    // ─────────────────────────────────────────────────────────────────────────
  };
  // ─────────────────────────────────────────────

  /**
   * IllustrationAnimation
   * Master animation sequence for the architecture diagram.
   * Animates sections top to bottom:
   * 1. Agent Builders
   * 2. Human Intelligence
   * 3. Highlight prism outline (DrawSVG)
   * 4. MCP and API
   * 5. PII Audit
   * 6. Policy Management
   * 7. Org-Aware row-level security
   * 8. Metric & Methodology Management
   * 9. Warehousing, ingestion & modeling
   * 10. Data sources and tools
   * 11. Dotted connector lines
   */
  const IllustrationAnimation = (() => {
    // 'warehousing, ingestion' contains a comma — needs attribute selector
    const warehousingSel = '[id="warehousing, ingestion"]';
    const getWarehousingEl = () => scope.querySelector(warehousingSel);

    const floatTweens = [];

    const pushFloat = (id, cfg, h) => {
      floatTweens.push(
        gsap.to(id, {
          y: cfg.y ?? h.y,
          ease: h.ease,
          repeat: -1,
          yoyo: true,
          duration: cfg.duration,
          delay: cfg.delay,
        })
      );
    };

    const hideAll = () => {
      gsap.set(
        '#highlight, #dotted-line, #dotted-line_2, #dotted-line_3, #dotted-line_4, #agent-builders, #human-intelligence, #mcp-and-api, #pii-audit, #policy, #org-aware, #metric-methology, #data-source-tools',
        { autoAlpha: 0 }
      );
      gsap.set(getWarehousingEl(), { autoAlpha: 0 });

      // Labels (label_7 = data sources, label_8 = agent builders)
      gsap.set('#label, #label_2, #label_3, #label_4, #label_5, #label_6, #label_7, #label_8', {
        autoAlpha: 0,
      });

      // Tools inside data-source-tools (also have small drop offset)
      gsap.set('#workday, #greenhouse, #lattice, #slack', { autoAlpha: 0, y: 15 });

      // Agent builder tiles hidden individually so parent group can be revealed
      // without flashing all children at once
      gsap.set('#airtable, #notion, #claude, #agent-builder_2', { autoAlpha: 0 });

      // Highlight fill hidden individually — drawSVG deferred to highlightTimeline
      // so path length is measured after the parent is visible
      gsap.set('#highlight > path:first-child', { autoAlpha: 0 });
    };

    // Section 1: Agent Builders (top)
    const agentBuildersTimeline = () => {
      const c = CONFIG.agentBuilders;
      const tl = gsap.timeline({ defaults: { ease: CONFIG.ease } });

      tl.set('#agent-builders', { autoAlpha: 1 })
        .to('#label_8', { autoAlpha: 1, duration: c.label.duration })
        .fromTo(
          '#airtable, #notion, #claude, #agent-builder_2',
          { y: CONFIG.dropY, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: c.tiles.duration, stagger: c.tiles.stagger },
          c.tiles.gap
        )
        .add(() => {
          const h = CONFIG.floats.agentBuilders;
          [
            ['#airtable', h.airtable],
            ['#notion', h.notion],
            ['#claude', h.claude],
            ['#agent-builder_2', h.agentBuilder],
          ].forEach(([id, cfg]) => pushFloat(id, cfg, h));
        });

      return tl;
    };

    // Section 2: Human Intelligence
    const humanIntelligenceTimeline = () => {
      const c = CONFIG.humanIntelligence;
      const tl = gsap.timeline({ defaults: { ease: CONFIG.ease } });

      tl.set('#human-intelligence', { autoAlpha: 1 })
        .from('#Vector_16', {
          y: CONFIG.dropY,
          autoAlpha: 0,
          duration: c.card.duration,
        })
        .from(
          '#HI-LogoBlack',
          {
            autoAlpha: 0,
            duration: c.logo.duration,
          },
          c.logo.overlap
        )
        .add(() => {
          const h = CONFIG.floats.humanIntelligence;
          pushFloat('#human-intelligence', h.card, h);
        });

      return tl;
    };

    // Section 3: Highlight prism outline
    const highlightTimeline = () => {
      const c = CONFIG.highlight;
      const tl = gsap.timeline();

      tl.set('#highlight', { autoAlpha: 1 })
        .set('#highlight > path:last-child', { drawSVG: 0 })
        .to('#highlight > path:first-child', {
          autoAlpha: 1,
          duration: c.fill.duration,
          ease: CONFIG.ease,
        })
        .to(
          '#highlight > path:last-child',
          {
            drawSVG: '100%',
            duration: c.stroke.duration,
            ease: c.stroke.ease,
          },
          c.stroke.overlap
        );

      return tl;
    };

    // Section 4: MCP and API
    const mcpApiTimeline = () => {
      const c = CONFIG.mcpApi;
      const tl = gsap.timeline({ defaults: { ease: CONFIG.ease } });

      tl.set('#mcp-and-api', { autoAlpha: 1 })
        .from('#layer_12, #layer_13, #layer_14, #layer_15', {
          y: CONFIG.dropY,
          autoAlpha: 0,
          duration: c.layers.duration,
          stagger: c.layers.stagger,
        })
        .to('#label_6', { autoAlpha: 1, duration: c.label.duration }, c.label.gap)
        .add(() => {
          const h = CONFIG.floats.mcpApi;
          [
            ['#layer_12', h.layer_12],
            ['#layer_13', h.layer_13],
            ['#layer_14', h.layer_14],
            ['#layer_15', h.layer_15],
          ].forEach(([id, cfg]) => pushFloat(id, cfg, h));
        });

      return tl;
    };

    // Section 5: PII Audit
    const piiAuditTimeline = () => {
      const c = CONFIG.piiAudit;
      const tl = gsap.timeline({ defaults: { ease: CONFIG.ease } });

      tl.set('#pii-audit', { autoAlpha: 1 })
        .from('#layer_11', {
          y: CONFIG.dropY,
          autoAlpha: 0,
          duration: c.layer.duration,
        })
        .to('#label_5', { autoAlpha: 1, duration: c.label.duration }, c.label.gap)
        .add(() => {
          const h = CONFIG.floats.piiAudit;
          pushFloat('#layer_11', h.layer_11, h);
        });

      return tl;
    };

    // Section 6: Policy Management
    const policyTimeline = () => {
      const c = CONFIG.policy;
      const tl = gsap.timeline({ defaults: { ease: CONFIG.ease } });

      tl.set('#policy', { autoAlpha: 1 })
        .from('#layer_7, #layer_8, #layer_9, #layer_10', {
          y: CONFIG.dropY,
          autoAlpha: 0,
          duration: c.layers.duration,
          stagger: c.layers.stagger,
        })
        .to('#label_4', { autoAlpha: 1, duration: c.label.duration }, c.label.gap)
        .add(() => {
          const h = CONFIG.floats.policy;
          [
            ['#layer_7', h.layer_7],
            ['#layer_8', h.layer_8],
            ['#layer_9', h.layer_9],
            ['#layer_10', h.layer_10],
          ].forEach(([id, cfg]) => pushFloat(id, cfg, h));
        });

      return tl;
    };

    // Section 7: Org-Aware row-level security
    const orgAwareTimeline = () => {
      const c = CONFIG.orgAware;
      const tl = gsap.timeline({ defaults: { ease: CONFIG.ease } });

      tl.set('#org-aware', { autoAlpha: 1 })
        .from('#layer_6', {
          y: CONFIG.dropY,
          autoAlpha: 0,
          duration: c.layer.duration,
        })
        .to('#label_3', { autoAlpha: 1, duration: c.label.duration }, c.label.gap)
        .add(() => {
          const h = CONFIG.floats.orgAware;
          pushFloat('#layer_6', h.layer_6, h);
        });

      return tl;
    };

    // Section 8: Metric & Methodology Management
    const metricMethologyTimeline = () => {
      const c = CONFIG.metricMethology;
      const tl = gsap.timeline({ defaults: { ease: CONFIG.ease } });

      tl.set('#metric-methology', { autoAlpha: 1 })
        .from('#metric-methology_2', {
          y: CONFIG.dropY,
          autoAlpha: 0,
          duration: c.layer.duration,
        })
        .to('#label_2', { autoAlpha: 1, duration: c.label.duration }, c.label.gap)
        .add(() => {
          const h = CONFIG.floats.metricMethology;
          pushFloat('#metric-methology_2', h.layer, h);
        });

      return tl;
    };

    // Section 9: Warehousing, ingestion & modeling
    const warehousingTimeline = () => {
      const c = CONFIG.warehousing;
      const tl = gsap.timeline({ defaults: { ease: CONFIG.ease } });

      tl.set(getWarehousingEl(), { autoAlpha: 1 })
        .from('#layer_4', {
          y: CONFIG.dropY,
          autoAlpha: 0,
          duration: c.outerCard.duration,
        })
        .from(
          '#layer_5',
          {
            y: CONFIG.dropY,
            autoAlpha: 0,
            duration: c.innerCard.duration,
          },
          c.innerCard.overlap
        )
        .to('#label', { autoAlpha: 1, duration: c.label.duration }, c.label.gap)
        .add(() => {
          const h = CONFIG.floats.warehousing;
          [
            ['#layer_4', h.layer_4],
            ['#layer_5', h.layer_5],
          ].forEach(([id, cfg]) => pushFloat(id, cfg, h));
        });

      return tl;
    };

    // Section 10: Data sources and tools (bottom)
    const dataSourcesTimeline = () => {
      const c = CONFIG.dataSources;
      const tl = gsap.timeline({ defaults: { ease: CONFIG.ease } });

      tl.set('#data-source-tools', { autoAlpha: 1 })
        .to('#workday, #greenhouse, #lattice, #slack', {
          autoAlpha: 1,
          y: 0,
          duration: c.tools.duration,
          stagger: c.tools.stagger,
        })
        .to('#label_7', { autoAlpha: 1, duration: c.label.duration }, c.label.gap);

      return tl;
    };

    // Section 11: Dotted connector lines
    const dottedLinesTimeline = () => {
      const c = CONFIG.dottedLines;
      const ids = ['#dotted-line', '#dotted-line_2', '#dotted-line_3', '#dotted-line_4'];
      const tl = gsap.timeline();

      const parents = ids.map((id) => scope.querySelector(id)).filter(Boolean);
      const allPaths = parents.flatMap((el) =>
        el.tagName.toLowerCase() === 'path' ? [el] : [...el.querySelectorAll('path')]
      );

      if (!allPaths.length) return tl;

      // Preserve dash pattern — offset by full path length now (elements still hidden)
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
            delay: 0,
            scrollTrigger: {
              trigger: triggerEl,
              start: CONFIG.scrollTrigger.start,
              once: true,
            },
          })
          .add(agentBuildersTimeline())
          .add(humanIntelligenceTimeline(), CONFIG.sectionGap)
          .add(highlightTimeline(), CONFIG.highlight.gap)
          .add(mcpApiTimeline(), CONFIG.sectionGap)
          .add(piiAuditTimeline(), CONFIG.sectionGap)
          .add(policyTimeline(), CONFIG.sectionGap)
          .add(orgAwareTimeline(), CONFIG.sectionGap)
          .add(metricMethologyTimeline(), CONFIG.sectionGap)
          .add(warehousingTimeline(), CONFIG.sectionGap)
          .add(dataSourcesTimeline(), CONFIG.sectionGap)
          .add(dottedLinesTimeline(), CONFIG.dottedLines.gap);

        new IntersectionObserver(([entry]) => {
          floatTweens.forEach((t) => (entry.isIntersecting ? t.play() : t.pause()));
        }).observe(triggerEl);
      }, triggerEl);
    };

    return { init };
  })();

  IllustrationAnimation.init();
}
