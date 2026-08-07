/* HI — tab illustration scroll animations
 *
 * Each Webflow Embed holds only the inlined SVG inside
 *   <div data-hi-illustration="integrations">…</div>
 * This file is loaded once from the bundle and wires all six.
 *
 * Hooks are data-anim attributes, scoped to each SVG root — see build.mjs.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EVERYTHING IS TUNED IN THE CONFIG BLOCK BELOW. Nothing below it needs editing
 * for timing work.
 *
 * Every step accepts the same keys:
 *   at         when the step starts, in seconds from the timeline start
 *   duration   how long the step itself takes
 *   stagger    gap between elements inside the step (omit for single elements)
 *   from       starting offsets — { x, y, scale }. x/y are SVG units and get
 *              multiplied by the portrait distance factor; scale does not.
 *   ease       overrides the global ease for this step only
 *   fade       set false to keep the element opaque and animate position only
 *
 * Live tuning from the console, no reload:
 *   HIIllustrations.config.lineage.tables.stagger = 0.15
 *   HIIllustrations.rebuild('lineage')
 *   HIIllustrations.timelines.lineage.progress(0.5).pause()
 * ─────────────────────────────────────────────────────────────────────────────
 */
/* eslint-disable no-undef */
// gsap / ScrollTrigger / CustomEase are globals from the CDN bundle and the
// 'osmo' ease is already registered in index.js — do not re-register here.

const API = (function () {
  // ===========================================================================
  // CONFIG
  // ===========================================================================

  var CONFIG = {
    global: {
      ease: 'osmo', // CustomEase, registered below
      easePath: 'M0,0 C0.625,0.05 0,1 1,1',
      duration: 0.5, // fallback when a step omits duration
      start: 'top 78%', // ScrollTrigger start
      end: 'bottom top', // when the ambient loops pause
      breakpoint: 700, // portrait cutover, matches the CSS
      portraitDistance: 0.6, // x/y offsets are scaled by this under the breakpoint
      portraitTimeScale: 1.15, // >1 plays faster on mobile
      markers: false, // ScrollTrigger markers
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
        from: { x: 16, y: 10 }, // x is the magnitude; left column uses -x
        rowStagger: 0.12,
        colStagger: 0.04,
      },
    },

    // 1 · Lineage graph -----------------------------------------------------
    lineage: {
      timeScale: 1,
      sources: { at: 0, duration: 0.6, from: { x: -24 } },
      sourceItems: { at: 0.1, duration: 0.5, from: { x: -10 }, stagger: 0.05 },
      connectors: { at: 0.4, duration: 0.7, stagger: 0.08, ease: 'none' },
      arrow: { at: 0.9, duration: 0.3 },
      tableBlock: { at: 0.55, duration: 0.4 },
      tables: { at: 0.25, duration: 0.5, from: { y: 8 }, stagger: 0.06 },
      outcomes: { at: 0.75, duration: 0.55, from: { y: 12 }, stagger: 0.1 },

      // the ambient "data flowing" loop
      flow: {
        enabled: true,

        // the travelling packet
        tint: '#A54BF7', // packet stroke colour
        strokeWidth: 1, // packet stroke width
        // `step` is a MINIMUM. The real step auto-extends to fit the whole
        // highlight (highlightAt + traceDraw + traceHold + traceFade) plus
        // stepGap, so a node always clears before the next packet launches —
        // retune the trace freely and the cadence follows.
        step: 1.6,
        stepGap: 0.25, // quiet beat between one node clearing and the next firing
        pulseDuration: 0.55, // packet travel time along one line
        pulseLength: 37, // packet length in SVG units
        pulseFadeOut: 0.2, // packet fade as it arrives
        pulseFadeAt: 0.68, // when the fade starts, relative to the step
        cycleDelay: 0, // pause between full 8-step cycles

        // the "arrival" on the table node — independent of the packet above.
        // No glow, no ring: the node scales while a line draws itself around the
        // outline, finishing as a complete border. It reuses the packet's
        // `strokeWidth` so the two always match.
        // The lit window is built from its parts, so each phase is set directly:
        //   highlightAt → traceDraw → traceHold → traceFade
        // Keep their sum under `step` or a node is still lit when the next lights up.
        highlightAt: 0.35, // when the table lights up, relative to the step
        traceDraw: 0.95, // how long the border takes to draw itself on
        traceHold: 1, // how long it stays fully drawn
        traceFade: 0.5, // line fade in / out
        traceEase: 'power2.inOut',
        highlightTint: '#A54BF7', // the drawing line's colour
        highlightScale: 1.03, // node swells slightly as the packet lands
        highlightIn: 0.28, // scale-up time
        highlightOut: 0.5, // scale-down time, starts as the border clears
        highlightEase: 'back.out(2.2)',
      },
    },

    // 2 · Metric form -------------------------------------------------------
    'metric-form': {
      timeScale: 1,
      header: { at: 0, duration: 0.55, from: { y: 10 } },
      fields: { at: 0.18, duration: 0.5, from: { y: 10 }, stagger: 0.08 },
      chips: {
        at: 0.46,
        duration: 0.4,
        from: { scale: 0.9 },
        stagger: 0.06,
        transformOrigin: 'left center',
      },
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
      logo: { at: 1.55, duration: 0.45, from: { scale: 0.8 }, transformOrigin: 'center' },

      // outlined text split into per-glyph paths and staggered — reads as typing
      // without needing real characters
      typing: {
        enabled: true,
        stagger: 0.012, // seconds per letter — ~83 cpm at 0.012
        duration: 0.06, // each letter's own fade
        promptAt: 0.45, // the user's question types in
        answerAt: 1.7, // the refusal types in, after the thinking beat
      },
    },

    // 4 · Policy cards ------------------------------------------------------
    policies: {
      timeScale: 1,
      cards: {
        at: 0,
        duration: 0.6,
        from: { x: 20, y: 16 }, // alternating sides: even cards use -x
        stagger: 0.1,
      },
      shield: {
        at: 0.5,
        duration: 0.5,
        from: { scale: 0.6 },
        ease: 'back.out(2)',
        transformOrigin: 'center',
      },

      // Cards advance up one slot at a time, forever. The slot the shield sits
      // beside is the featured one, so each policy takes its turn there.
      // Slots are read from the artwork, so a re-export that moves them still works.
      cycle: {
        enabled: true,
        step: 2.2, // dwell before the stack advances again
        moveDuration: 0.7, // travel time between slots
        wrapLift: 70, // how far the top card carries on before it is recycled
      },
    },

    // 5 · Audit log ---------------------------------------------------------
    'audit-log': {
      timeScale: 1,
      header: { at: 0, duration: 0.5, from: { y: 10 } },
      head: { at: 0.15, duration: 0.5, from: { y: 8 } },
      rows: { at: 0.25, duration: 0.5, from: { y: 10 }, stagger: 0.05 },

      // the highlight band walking down the rows, forever
      walk: {
        enabled: true,
        at: 0.7, // when the band first appears
        fadeIn: 0.3,
        rows: 4, // how far down it walks before resetting
        stepDuration: 0.4, // one row-to-row move
        hold: 1.0, // dwell on each row
        resetDuration: 0.4, // the jump back to the top
        repeatDelay: 0.6, // pause before the cycle restarts
      },
    },
  };

  // ===========================================================================
  // setup
  // ===========================================================================

  // Mobile browsers fire resize when the URL bar hides on scroll. Without this,
  // every scroll gesture triggers a full ScrollTrigger refresh — the width-only
  // resize filter, but handled by ScrollTrigger itself.
  ScrollTrigger.config({ ignoreMobileResize: true });

  var SVGNS = 'http://www.w3.org/2000/svg';

  // Which source app feeds which two warehouse tables, confirmed from the brand
  // monograms inside each node. Greenhouse's connector (Shape_4) was outlined into
  // a fill by Figma so it has no stroke to travel along — its geometry is the
  // mirror of Shape_3, so we synthesise a path for the pulse instead.
  var LANES = [
    { line: 'Shape', tables: ['app-item_7', 'app-item_8'] }, // Workday
    { d: 'M134 193.5c26.02 0 32.98 20 62 20', tables: ['app-item_5', 'app-item_6'] }, // Greenhouse
    { line: 'Shape_3', tables: ['app-item_9', 'app-item_10'] }, // Lattice
    { line: 'Shape_2', tables: ['app-item_11', 'app-item_12'] }, // Culture Amp
  ];

  // ---------------------------------------------------------------------------
  // helpers
  // ---------------------------------------------------------------------------

  function one(root, name) {
    return root.querySelector('[data-anim="' + name + '"]');
  }

  // Figma numbers repeats base, base_2, base_3 … — that suffix is the stagger index.
  function series(root, base, count) {
    var out = [];
    for (var i = 1; i <= count; i++) {
      var el = one(root, i === 1 ? base : base + '_' + i);
      if (el) out.push(el);
    }
    return out;
  }

  function range(root, base, first, last) {
    var out = [];
    for (var i = first; i <= last; i++) {
      var el = one(root, base + '_' + i);
      if (el) out.push(el);
    }
    return out;
  }

  // Turn a config step into a .from() tween. `d` is the portrait distance factor.
  function step(tl, targets, c, d, overrides) {
    if (!c || !targets) return tl;
    var list = targets.length !== undefined ? targets : [targets];
    list = [].slice.call(list).filter(Boolean);
    if (!list.length) return tl;

    var vars = { duration: c.duration != null ? c.duration : CONFIG.global.duration };
    if (c.fade !== false) vars.autoAlpha = 0;
    if (c.from) {
      if (c.from.x != null) vars.x = c.from.x * d;
      if (c.from.y != null) vars.y = c.from.y * d;
      if (c.from.scale != null) vars.scale = c.from.scale;
    }
    if (c.stagger != null) vars.stagger = c.stagger;
    if (c.ease) vars.ease = c.ease;
    if (c.transformOrigin) vars.transformOrigin = c.transformOrigin;
    if (overrides) for (var k in overrides) vars[k] = overrides[k];

    return tl.from(list, vars, c.at || 0);
  }


  // ---------------------------------------------------------------------------
  // glyph splitting — Figma outlines text, so one <path> holds a whole paragraph
  // as a run of subpaths. Split it into one path per letter so we can stagger.
  //
  // The catch is counters: the hole in "o" and the dot on "i" are their own
  // subpaths. Emitted separately they'd fill solid / detach, so contours that
  // overlap horizontally on the same line get merged back into one glyph path.
  // ---------------------------------------------------------------------------

  function splitGlyphs(path) {
    if (path.__glyphs) return path.__glyphs; // idempotent — rebuild() re-runs this

    var d = path.getAttribute('d');
    // svgo emits relative commands, so subpaths start with `m` and each one's
    // origin depends on where the previous ended — they cannot be split verbatim.
    var subs = d && d.match(/[Mm][^Mm]*/g);
    if (!subs || subs.length < 2) return null;

    var parent = path.parentNode;
    var probe = document.createElementNS(SVGNS, 'path');
    parent.insertBefore(probe, path);

    var NUM = /-?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;
    var parts = [];
    var pen = { x: 0, y: 0 };

    for (var i = 0; i < subs.length; i++) {
      var raw = subs[i];
      var rel = raw[0] === 'm';
      var body = raw.slice(1);

      NUM.lastIndex = 0;
      var n1 = NUM.exec(body);
      var n2 = NUM.exec(body);
      if (!n1 || !n2) continue;

      var ax = rel ? pen.x + parseFloat(n1[0]) : parseFloat(n1[0]);
      var ay = rel ? pen.y + parseFloat(n2[0]) : parseFloat(n2[0]);

      // numbers following a moveto are an implicit lineto of the same case
      var rest = body.slice(NUM.lastIndex);
      var tail = '';
      if (rest.trim()) tail = /^[a-zA-Z]/.test(rest.trim()) ? rest : (rel ? 'l' : 'L') + rest;

      var abs = 'M' + ax + ' ' + ay + tail;
      probe.setAttribute('d', abs);

      var end = probe.getPointAtLength(probe.getTotalLength()); // 'z' returns to start
      pen = { x: end.x, y: end.y };

      var b = probe.getBBox();
      if (!b.width && !b.height) continue;
      parts.push({ d: abs, x: b.x, y: b.y, w: b.width, h: b.height });
    }
    parent.removeChild(probe);
    if (!parts.length) return null;

    // group into lines by vertical overlap — more robust than baseline maths,
    // which descenders (p, g, y) throw off
    var lines = [];
    parts.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (p) {
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

    // within a line, merge horizontally-overlapping contours into single glyphs
    var glyphs = [];
    lines.sort(function (a, b) { return a.top - b.top; }).forEach(function (L) {
      var cur = null;
      L.items.sort(function (a, b) { return a.x - b.x; }).forEach(function (p) {
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

    if (glyphs.length < 2) return null;

    // swap the single path for a group of per-glyph paths, carrying every
    // presentation attribute across so fill-rule / clip-path still apply
    var g = document.createElementNS(SVGNS, 'g');
    for (var a = 0; a < path.attributes.length; a++) {
      var at = path.attributes[a];
      if (at.name !== 'd') g.setAttribute(at.name, at.value);
    }
    g.setAttribute('data-glyphs', String(glyphs.length));

    var out = glyphs.map(function (gl) {
      var el = document.createElementNS(SVGNS, 'path');
      el.setAttribute('d', gl.d);
      g.appendChild(el);
      return el;
    });

    parent.replaceChild(g, path);
    g.__glyphs = out;
    return out;
  }

  // Stagger every text block inside `scope` as if it were being typed.
  function typeIn(tl, scope, cfg, at) {
    if (!scope || !cfg || !cfg.enabled) return;

    // Figma names text layers after their content, so a long spaced data-anim
    // is reliably a text block rather than an icon or a container.
    var blocks = [].slice.call(scope.querySelectorAll('path[data-anim], g[data-glyphs]')).filter(function (p) {
      var n = p.getAttribute('data-anim') || '';
      return n.length > 20 && /\s/.test(n);
    });

    blocks.forEach(function (block) {
      var glyphs = block.__glyphs || splitGlyphs(block);
      if (!glyphs) return;
      tl.fromTo(
        glyphs,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: cfg.duration, ease: 'none', stagger: cfg.stagger },
        at
      );
    });
  }

  function dashPrime(path) {
    var len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    return len;
  }

  // ---------------------------------------------------------------------------
  // ambient loop — lineage "data flowing" pulse
  // ---------------------------------------------------------------------------

  // A rounded-rect as an explicit path. <rect> only gained getTotalLength in
  // SVG2 and support is patchy, so we describe the outline ourselves.
  function roundedRectPath(x, y, w, h, r) {
    r = Math.min(r || 0, w / 2, h / 2);
    return (
      'M' + (x + r) + ' ' + y +
      'H' + (x + w - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + w) + ' ' + (y + r) +
      'V' + (y + h - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + w - r) + ' ' + (y + h) +
      'H' + (x + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + x + ' ' + (y + h - r) +
      'V' + (y + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + y + 'Z'
    );
  }

  // The line that laps a table node's outline while it is lit. Lives inside the
  // node group so it inherits the highlight scale.
  function makeTrace(node, ring, cfg) {
    var old = node.querySelector('[data-flow-trace]');
    if (old) old.parentNode.removeChild(old);
    if (!ring) return null;

    var n = function (a) { return parseFloat(ring.getAttribute(a)) || 0; };
    var p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', roundedRectPath(n('x'), n('y'), n('width'), n('height'), n('rx')));
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', cfg.highlightTint);
    p.setAttribute('stroke-width', String(cfg.strokeWidth)); // matches the packet
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('data-flow-trace', '');
    p.style.opacity = '0';
    node.appendChild(p);

    // one dash the length of the whole perimeter, offset fully out of view —
    // animating the offset to 0 draws the border on
    var len = p.getTotalLength();
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    p.__len = len;
    return p;
  }

  function buildFlowLoop(root, cfg) {
    if (!cfg || !cfg.enabled) return null;

    // matchMedia reverts GSAP's tweens but knows nothing about nodes we inject,
    // so every breakpoint cross would otherwise stack another set of pulses.
    var stale = root.querySelectorAll('[data-flow-pulse]');
    for (var s = 0; s < stale.length; s++) stale[s].parentNode.removeChild(stale[s]);

    var lanes = LANES.map(function (lane) {
      var src = lane.line ? one(root, lane.line) : null;
      var d = lane.d || (src && src.getAttribute('d'));
      if (!d) return null;

      var pulse = document.createElementNS(SVGNS, 'path');
      pulse.setAttribute('d', d);
      pulse.setAttribute('fill', 'none');
      pulse.setAttribute('stroke', cfg.tint);
      pulse.setAttribute('stroke-width', String(cfg.strokeWidth));
      pulse.setAttribute('stroke-linecap', 'round');
      pulse.setAttribute('data-flow-pulse', '');
      pulse.style.opacity = '0';

      var anchor = src || one(root, 'connecting-line_2'); // sit above the line it traces
      if (!anchor || !anchor.parentNode) return null;
      anchor.parentNode.insertBefore(pulse, anchor.nextSibling);

      var len = pulse.getTotalLength();
      var seg = Math.min(cfg.pulseLength, len * 0.35);
      gsap.set(pulse, { strokeDasharray: seg + ' ' + len, strokeDashoffset: seg });

      return {
        pulse: pulse,
        len: len,
        seg: seg,
        marks: lane.tables.map(function (t) {
          var node = one(root, t);
          if (!node) return null;
          var ring = node.querySelector('rect[stroke]');
          return { node: node, ring: ring, trace: makeTrace(node, ring, cfg) };
        }),
      };
    }).filter(Boolean);

    if (!lanes.length) return null;

    // the design ships every node outlined — we want exactly one lit at a time
    lanes.forEach(function (l) {
      l.marks.forEach(function (m) {
        if (!m) return;
        // recolour once at build rather than interpolating a colour every cycle
        if (m.ring) gsap.set(m.ring, { strokeOpacity: 0 }); // design ships all 8 outlined
        gsap.set(m.node, { transformOrigin: 'center center' });
      });
    });


    var loop = gsap.timeline({ paused: true, repeat: -1, repeatDelay: cfg.cycleDelay });

    // never start the next packet while the previous node is still lit
    var stepDur = Math.max(
      cfg.step,
      cfg.highlightAt + cfg.traceDraw + cfg.traceHold + cfg.traceFade + cfg.stepGap
    );

    for (var pass = 0; pass < 2; pass++) {
      for (var i = 0; i < lanes.length; i++) {
        var l = lanes[i];
        var mark = l.marks[pass];
        var at = (pass * lanes.length + i) * stepDur;

        loop
          .set(l.pulse, { strokeDashoffset: l.seg, opacity: 1 }, at)
          .to(l.pulse, { strokeDashoffset: -l.len, duration: cfg.pulseDuration, ease: 'none' }, at)
          .to(l.pulse, { opacity: 0, duration: cfg.pulseFadeOut }, at + cfg.pulseFadeAt);

        if (mark) {
          // the border holds complete for exactly traceHold, then everything clears
          var lit = at + cfg.highlightAt;
          var off = lit + cfg.traceDraw + cfg.traceHold;

          loop
            .to(mark.node, { scale: cfg.highlightScale, duration: cfg.highlightIn, ease: cfg.highlightEase }, lit)
            .to(mark.node, { scale: 1, duration: cfg.highlightOut }, off);

          if (mark.trace) {
            loop
              .set(mark.trace, { strokeDashoffset: mark.trace.__len }, lit)
              .to(mark.trace, { opacity: 1, duration: cfg.traceFade }, lit)
              .to(mark.trace, { strokeDashoffset: 0, duration: cfg.traceDraw, ease: cfg.traceEase }, lit)
              .to(mark.trace, { opacity: 0, duration: cfg.traceFade }, off);
          }
        }
      }
    }

    return loop;
  }

  // Vertical carousel for the policy stack. Every card steps up one slot per
  // cycle; the card leaving the top continues out of frame, fades, and is
  // recycled into the bottom slot so the teleport is never visible.
  function buildPolicyCycle(root, cfg) {
    if (!cfg || !cfg.enabled) return null;

    var cards = series(root, 'use-case', 4);
    if (cards.length < 2) return null;

    // getBBox ignores the element's own transform, so this stays correct even
    // after the entrance tweens have written transforms onto the cards
    var boxes = cards.map(function (c) {
      var b = c.getBBox();
      return { el: c, x: b.x, y: b.y };
    });

    var slots = boxes
      .map(function (b) { return { x: b.x, y: b.y }; })
      .sort(function (a, b) { return a.y - b.y; });
    var n = slots.length;

    var startSlot = boxes.map(function (b) {
      for (var i = 0; i < n; i++) if (Math.abs(slots[i].y - b.y) < 1) return i;
      return 0;
    });

    var loop = gsap.timeline({ paused: true, repeat: -1 });

    for (var k = 1; k <= n; k++) {
      for (var c = 0; c < boxes.length; c++) {
        var b = boxes[c];
        var from = (startSlot[c] - (k - 1) + n * 9) % n;
        var to = (startSlot[c] - k + n * 9) % n;
        var at = (k - 1) * cfg.step;
        var dx = slots[to].x - b.x;
        var dy = slots[to].y - b.y;

        if (from === 0) {
          // leaving the top: carry on upward, fade, then reappear below the last slot
          loop
            .to(
              b.el,
              { x: slots[0].x - b.x, y: slots[0].y - b.y - cfg.wrapLift, autoAlpha: 0, duration: cfg.moveDuration * 0.45 },
              at
            )
            .set(b.el, { x: dx, y: dy + cfg.wrapLift }, at + cfg.moveDuration * 0.5)
            .to(b.el, { x: dx, y: dy, autoAlpha: 1, duration: cfg.moveDuration * 0.5 }, at + cfg.moveDuration * 0.5);
        } else {
          loop.to(b.el, { x: dx, y: dy, duration: cfg.moveDuration }, at);
        }
      }
    }

    // hold the final dwell so the loop repeats on the beat rather than early
    loop.to({ _: 0 }, { _: 1, duration: 0.001 }, n * cfg.step - 0.001);

    return loop;
  }

  // ---------------------------------------------------------------------------
  // builders — each returns a paused timeline, optionally with .__loop attached
  // ---------------------------------------------------------------------------

  var BUILD = {};

  BUILD.integrations = function (root, d) {
    var k = CONFIG.integrations;
    var tl = gsap.timeline({ paused: true });

    step(tl, one(root, 'side-bar'), k.sidebar, d);
    step(tl, series(root, 'Tab', 6), k.tabs, d);
    step(tl, one(root, 'header'), k.header, d);

    series(root, 'app-item', 8).forEach(function (card, i) {
      var col = i % 2; // 0 = left, 1 = right
      var at = k.cards.at + Math.floor(i / 2) * k.cards.rowStagger + col * k.cards.colStagger;
      step(tl, card, { at: at, duration: k.cards.duration, ease: k.cards.ease }, d, {
        x: (col ? k.cards.from.x : -k.cards.from.x) * d,
        y: k.cards.from.y * d,
        autoAlpha: 0,
      });
    });

    return tl;
  };

  BUILD.lineage = function (root, d) {
    var k = CONFIG.lineage;
    var tl = gsap.timeline({ paused: true });

    var strokes = ['Shape', 'Shape_2', 'Shape_3', 'connecting-line_5']
      .map(function (n) { return one(root, n); })
      .filter(Boolean);
    strokes.forEach(dashPrime);

    step(tl, one(root, 'app-block'), k.sources, d);
    step(tl, series(root, 'app-item', 4), k.sourceItems, d);

    tl.to(
      strokes,
      { strokeDashoffset: 0, duration: k.connectors.duration, stagger: k.connectors.stagger, ease: k.connectors.ease },
      k.connectors.at
    );

    // Shape_4 was outlined into a fill by Figma — it can only fade, not draw
    step(tl, one(root, 'Shape_4'), k.arrow, d);

    // tables land AFTER the connectors reach them — a node appearing while its
    // own feed line is still travelling reads backwards
    step(tl, one(root, 'app-block_2'), k.tableBlock, d);
    step(tl, range(root, 'app-item', 5, 12), k.tables, d);
    step(tl, series(root, 'Modal Content', 3), k.outcomes, d);

    var flow = buildFlowLoop(root, k.flow);
    if (flow) {
      tl.__loop = flow;
    }

    return tl;
  };

  BUILD['metric-form'] = function (root, d) {
    var k = CONFIG['metric-form'];
    var tl = gsap.timeline({ paused: true });

    step(tl, one(root, 'header'), k.header, d);
    step(tl, series(root, 'field', 4), k.fields, d);
    step(tl, [one(root, 'option'), one(root, 'option_2')], k.chips, d);

    return tl;
  };

  BUILD.refusal = function (root, d) {
    var k = CONFIG.refusal;
    var tl = gsap.timeline({ paused: true });

    step(tl, one(root, 'model-user'), k.user, d);
    step(tl, one(root, 'card'), k.card, d);
    step(tl, one(root, 'prompt'), k.prompt, d);
    step(tl, one(root, 'answer'), k.answer, d);
    step(tl, one(root, 'logo_2'), k.logo, d);

    // the bubbles slide in empty, then the copy types into them
    typeIn(tl, one(root, 'prompt'), k.typing, k.typing.promptAt);
    typeIn(tl, one(root, 'answer'), k.typing, k.typing.answerAt);

    return tl;
  };

  BUILD.policies = function (root, d) {
    var k = CONFIG.policies;
    var tl = gsap.timeline({ paused: true });

    series(root, 'use-case', 4).forEach(function (card, i) {
      step(tl, card, { at: k.cards.at + i * k.cards.stagger, duration: k.cards.duration, ease: k.cards.ease }, d, {
        x: (i % 2 ? k.cards.from.x : -k.cards.from.x) * d,
        y: k.cards.from.y * d,
        autoAlpha: 0,
      });
    });

    step(tl, [one(root, 'icon'), one(root, 'icon_2')], k.shield, d);

    var cycle = buildPolicyCycle(root, k.cycle);
    if (cycle) {
      tl.__loop = cycle;
    }

    return tl;
  };

  BUILD['audit-log'] = function (root, d) {
    var k = CONFIG['audit-log'];
    var tl = gsap.timeline({ paused: true });
    var rows = series(root, 'table-row', 7);
    var band = one(root, 'active-row-bg');

    step(tl, one(root, 'Header'), k.header, d);
    step(tl, one(root, 'table-head'), k.head, d);
    step(tl, rows, k.rows, d);

    if (band && rows.length > 1 && k.walk.enabled) {
      // measured, not hard-coded. getBBox is missing if the SVG was parsed into
      // the HTML namespace — see the self-closing <div/> note in build.mjs.
      var gap = rows[0].getBBox ? rows[1].getBBox().y - rows[0].getBBox().y : 40;
      tl.from(band, { autoAlpha: 0, duration: k.walk.fadeIn }, k.walk.at);

      // logging is ongoing, so the walk loops rather than stopping after N rows
      var walk = gsap.timeline({ paused: true, repeat: -1, repeatDelay: k.walk.repeatDelay });
      for (var i = 1; i <= k.walk.rows; i++) {
        walk.to(band, { y: gap * i, duration: k.walk.stepDuration }, (i - 1) * k.walk.hold);
      }
      walk.to(band, { y: 0, duration: k.walk.resetDuration }, k.walk.rows * k.walk.hold);

      tl.__loop = walk;
    }

    return tl;
  };

  // ===========================================================================
  // boot
  // ===========================================================================

  var triggers = [];
  var timelines = {};
  var mm = null;

  function wire(mount, name, portrait, reduced) {
    var build = BUILD[name];
    var svg = mount.querySelector('svg');
    if (!build || !svg) return;

    var g = CONFIG.global;

    if (reduced) {
      var still = build(svg, 0);
      still.eventCallback('onComplete', null); // never start an infinite loop
      still.progress(1);
      if (still.__loop) still.__loop.kill();
      return;
    }

    // Build the timeline in full FIRST, attach ScrollTrigger after — these panels
    // sit high on the page, so onEnter fires on init and an empty timeline would
    // silently never play.
    var tl = build(svg, portrait ? g.portraitDistance : 1);
    tl.timeScale((CONFIG[name].timeScale || 1) * (portrait ? g.portraitTimeScale : 1));
    timelines[name] = tl;

    var st = ScrollTrigger.create({
      trigger: mount,
      start: g.start,
      end: g.end,
      markers: g.markers,
      onEnter: function () { tl.play(); },
      // the entrance plays once, but an ambient loop must not burn frames off-screen
      onToggle: function (self) {
        if (!tl.__loop) return;
        // only resume once the entrance has actually finished — otherwise the loop
        // starts the moment the panel enters and runs underneath the reveal
        if (self.isActive && tl.progress() === 1) tl.__loop.play();
        else tl.__loop.pause();
      },
    });
    triggers.push(st);

    if (tl.__loop) {
      // Scrolling quickly past means onEnter fires, onToggle pauses, and then the
      // entrance finishes OFF-SCREEN — so the loop must check visibility itself
      // rather than trusting that completion implies being seen.
      tl.eventCallback('onComplete', function () {
        if (st.isActive) tl.__loop.play();
      });
    }
  }

  function init(scope) {
    var mounts = (scope || document).querySelectorAll('[data-hi-illustration]');
    if (!mounts.length) return;

    destroy(); // Barba-safe: never stack a second set of triggers

    var g = CONFIG.global;
    mm = gsap.matchMedia();

    mm.add(
      {
        // `desktop` must be here even though nothing reads it: matchMedia only runs
        // the callback when at least one condition matches, so without it a plain
        // desktop viewport wires nothing at all.
        desktop: '(min-width: ' + (g.breakpoint + 1) + 'px)',
        portrait: '(max-width: ' + g.breakpoint + 'px)',
        reduced: '(prefers-reduced-motion: reduce)',
      },
      function (ctx) {
        var c = ctx.conditions;
        mounts.forEach(function (mount) {
          wire(mount, mount.getAttribute('data-hi-illustration'), c.portrait, c.reduced);
        });
      }
    );
  }

  function destroy() {
    triggers.forEach(function (t) { t.kill(); });
    triggers = [];
    Object.keys(timelines).forEach(function (n) {
      if (timelines[n].__loop) timelines[n].__loop.kill();
      timelines[n].kill();
      delete timelines[n];
    });
    if (mm) { mm.revert(); mm = null; }
  }

  // Rebuild one illustration in place after a config edit — the tuning loop.
  function rebuild(name) {
    var mount = document.querySelector('[data-hi-illustration="' + name + '"]');
    if (!mount) return;
    var svg = mount.querySelector('svg');

    if (timelines[name]) {
      if (timelines[name].__loop) timelines[name].__loop.kill();
      timelines[name].progress(0).kill();
      delete timelines[name];
    }
    triggers = triggers.filter(function (t) {
      if (t.trigger === mount) { t.kill(); return false; }
      return true;
    });
    svg.querySelectorAll('[data-flow-pulse]').forEach(function (p) { p.remove(); });
    gsap.set(svg.querySelectorAll('[data-anim] *'), { clearProps: 'transform,opacity,visibility' });

    wire(mount, name, window.matchMedia('(max-width: ' + CONFIG.global.breakpoint + 'px)').matches, false);
    ScrollTrigger.refresh();
    if (timelines[name]) timelines[name].play();
    return timelines[name];
  }

  // exposed for console tuning in dev; harmless in production
  window.HIIllustrations = {
    config: CONFIG,
    init: init,
    destroy: destroy,
    rebuild: rebuild,
    timelines: timelines,
  };

  return { init: init, destroy: destroy };

})();

export const initCardIllustrations = API.init;
export const destroyCardIllustrations = API.destroy;
