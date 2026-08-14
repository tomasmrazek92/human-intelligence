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
      breakpoint: 767, // portrait cutover — must match the CSS that swaps the artwork
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
        spread: 0.75, // seconds for the wave to reach the outermost tile
        ease: 'back.out(1.6)',
      },

      // Rows scroll slowly in alternating directions. Empty tiles are dropped and
      // the remaining logos repeated to fill, so the row count, tile pitch and
      // logo count are all read from the artwork — drop in a new export with
      // more logos and nothing here needs changing.
      marquee: {
        enabled: true,
        speed: 9, // SVG units per second
        startImmediately: true, // scroll from the moment it enters view, not after the reveal
        zigzag: true, // alternate direction per row; false = all one way
        dropEmpty: true, // bin tiles that contain no logo
        pitch: 0, // 0 = measure the spacing from the artwork
        // SVG-side edge fade. Off by default — the feather is done in CSS on the
        // wrapper instead (see README), which is tunable in Webflow without a
        // release. Leaving both on would double up.
        fade: 0, // fraction of the width faded at each edge; 0 = off
      },

      glow: { at: 0.7, duration: 1.1 }, // the soft white bloom behind the shield
      shieldBase: { at: 0.8, duration: 0.7, from: { scale: 0.93 } },
      mark: { at: 1.25, duration: 0.6, from: { scale: 0.8 } }, // the logo inside

      // The static outlines grow out from behind the shield exactly like a wave
      // does — same motion, but once, and they stay.
      outlineReveal: { at: 0.65, duration: 1, ease: 'power2.out' },

      connector: { at: 0.7, duration: 0.5 },
      agentsBox: { at: 1.15, duration: 0.5 },
      agentTiles: { at: 1.2, duration: 0.5, from: { y: 10 }, stagger: 0.08 },

      // the dashed border round the agents row
      agentsDash: {
        enabled: true,
        speed: 15, // 0 = inherit marquee.speed
        reverse: false,
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
        travel: 0.6, // time to move between stops
        hold: 0.35, // pause on each stop
        fadeOut: 0.4, // fade after the last stop
        gap: 0.7, // empty beat before the next wave sets off
        peakOpacity: 0.9,
        strokeWidth: 1,
        ease: 'power2.out', // quick push, then settling into the stop
        startScale: 0, // 0 = start at the last static outline
      },

      // the mark breathing — deliberately not a multiple of `period` so the two
      // loops drift out of phase instead of pulsing in lockstep
      breathe: {
        enabled: true,
        scale: 1.14,
        duration: 2.3,
        ease: 'sine.inOut',
      },

      // The solid shield breathing under its outline. Only the body moves —
      // outline-1 stays put because the connector line meets it, and a moving
      // outline would pull away from that join. Keep this subtle: it sits behind
      // the mark's own breathe, and the two compound visually.
      shieldBreathe: {
        enabled: true,
        scale: 1.02,
        duration: 3.1, // not a multiple of the mark's 2.3, so they drift apart
        ease: 'sine.inOut',
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

    // 6 · Systems — scattered -> connected -----------------------------------
    // One diagram, played from the `before` state to the `after` state. The
    // artwork ships fully lit, so the entrance runs it backwards: the dashed
    // grey borders are clones of the real ones (see `before`), and the real
    // borders + glows + lines + plate start hidden and arrive on the beat.
    systems: {
      timeScale: 1,

      // the unlit state, cloned onto each tile from its own border path so the
      // dashed outline sits exactly where the lit one will
      before: { stroke: '#444', dash: '2.77 2.77' },

      // 1 · the systems turn up, scattered and unconnected
      tiles: { at: 0, duration: 0.85, from: { scale: 0.9, y: 8 }, stagger: 0.06, ease: 'back.out(1.5)' },

      // 2 · the chip — note it now rides in WITH the tiles rather than landing
      // after them, which is what came back from the tuning panel
      label: { at: 0, duration: 0.7, from: { scale: 0.44, y: 6 } },
      labelOut: { at: 2.05, duration: 0.3, scale: 0.94 },

      // 3 · the handoff — the chip gives way to the mark, and the borders light
      core: { at: 2.25, duration: 0.45, from: { scale: 0.66 }, ease: 'back.out(1.7)' },
      light: { at: 2, duration: 2.3, spread: 3, ease: 'power2.out' }, // centre-out
      plate: { at: 5.05, duration: 3, ease: 'power2.out' }, // held until the last chord has landed
      grid: { at: 0, duration: 1.2 }, // the floor is there from the first frame

      // The lattice is periodic, so sliding it by exactly one cell returns it to
      // itself — an endless floor rather than a loop that visibly restarts. Both
      // isometric axes and the cell pitch are measured off the artwork. The
      // diamond outline is split out and left standing: it is the floor's
      // silhouette, not part of the repeating pattern.
      // axis picks WHICH diagonal the floor slides along, reverse picks which way
      // along it:  1 = up-left / down-right,  2 = up-right / down-left.
      // This is bottom-left.
      gridDrift: { enabled: true, speed: 10, axis: 2, reverse: true }, // speed in SVG units/sec

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
        ease: 'power2.inOut',
        fadeIn: 0.2,
        centreSplit: 14,
        chordReverse: true, // draw the outer 4 from the far end instead
        chordDelay: 0.35, // extra beat before the chords follow the arms
      },

      // ambient — a packet running back down each line into the core, so the
      // connections read as live rather than as a finished diagram
      pulse: {
        enabled: false,
        tint: '#FF99E1',
        strokeWidth: 1.6,
        length: 26, // dash length in SVG units
        duration: 1.1, // one traverse
        stagger: 0.18,
        fadeOut: 0.25,
        cycleDelay: 1.4,
      },

      breathe: { enabled: false, scale: 1.03, duration: 2.6, ease: 'sine.inOut' },
    },

    // 8 · Connected systems + agents ---------------------------------------
    agents: {
      timeScale: 1,

      panel: { at: 0, duration: 0.7, from: { scale: 0.99 }, ease: 'power2.out' },

      mark: { at: 0.1, duration: 0.55, from: { scale: 0.88 }, ease: 'back.out(1.7)' },

      // the agent chips sit in the mark's negative space, so they land after it
      chips: { at: 0.5, duration: 0.45, from: { y: 8, scale: 0.75 }, stagger: 0.08, ease: 'back.out(2.4)' },

      // the systems arrive centre-out: distance from the mark drives the delay,
      // so the ring expands rather than a sorted list running top to bottom.
      // Each card is nudged toward the mark to start, so it reads as emitted.
      cards: { at: 0.72, duration: 0.62, spread: 0.5, from: { dist: 12, scale: 0.94 }, ease: 'back.out(1.4)' },

      // the checklist fills in behind each card. `at` is relative to that card's
      // own entrance, so every card carries its rows with it wherever the
      // centre-out wave puts it.
      rows: { at: 0.2, duration: 0.4, stagger: 0.055, from: { x: -6 } },

      // Figma's connectors are dashed, so the entrance cannot use the path's own
      // dashoffset — that slot belongs to the crawl. Each line is revealed by a
      // white wipe travelling out from the mark inside a mask instead, which
      // leaves the authored 4/4 pattern intact.
      lines: { at: 1.3, duration: 0.9, stagger: 0.09, ease: 'power2.inOut', wipeWidth: 10 },

      // ambient — the dashes crawl from the moment the illustration enters, not
      // after the reveal: the lines are masked until their wipe runs, so the
      // motion is simply invisible until then and is already up to speed when
      // the line appears. 'in' runs them toward the mark, whichever way Figma
      // authored the path.
      crawl: { enabled: true, speed: 9, direction: 'in' }, // SVG units per second

      breathe: { enabled: true, scale: 1.03, duration: 3.4, ease: 'sine.inOut' },
    },

    // 10 · Warehouse hero -----------------------------------------------------
    // Almost nothing here is a new mechanism: the floor is the `systems` drift,
    // the cards and the dashed conduits are the `agents` pattern (a wipe mask
    // for the entrance, dashoffset for the crawl), the app plate is the same
    // tile stagger. The one genuinely new part is the warehouse itself — six
    // plates stacked inside an 11.85σ blur and clipped by the prism mask, which
    // is what makes the glow. They ride up and down on a slow offset wave.
    //
    // The story runs top-down — sources -> ingestion -> the warehouse -> the
    // apps standing on the plate — so every `at` below is ordered that way.
    // Flipping it to bottom-up is a config edit, not a code one.
    'warehouse-hero': {
      timeScale: 1,

      // the floor is there from the first frame, like systems
      grid: { at: 0, duration: 1.2 },
      // axis/reverse pick which diagonal it travels and which way along it
      gridDrift: { enabled: true, speed: 10, axis: 2, reverse: true },

      // 1 · the sources land, back row first — sorted by depth, not by name,
      // because Figma renumbers card_N on every re-export
      cards: { at: 0.1, duration: 0.62, from: { y: -16, scale: 0.94 }, stagger: 0.11, ease: 'back.out(1.4)' },

      // 2 · the conduits grow down out of them. Same trick as agents: the
      // artwork's 3.17/3.17 dash pattern is left alone and a white wipe travels
      // inside a mask, because the dashoffset slot belongs to the crawl.
      // `from` picks the end it grows from: 'top' follows the story, 'bottom'
      // follows the direction Figma authored the paths in.
      lines: { at: 0.62, duration: 1.05, stagger: 0.1, ease: 'power2.inOut', wipeWidth: 8, from: 'top' },

      // 3 · the warehouse — walls and lid first, so the glow has somewhere to be
      well: { at: 1.15, duration: 0.7, from: { y: 10, scale: 0.97 }, ease: 'power2.out' },

      // 4 · the layers rise into it. They sit inside the blur AND inside the
      // prism mask, so the bottom of their travel is clipped — that is what
      // makes them read as filling the well rather than sliding past it.
      glow: { at: 1.35, duration: 0.95, from: { y: 30 }, stagger: 0.08, ease: 'power2.out' },

      logo: { at: 2, duration: 0.45, from: { scale: 0.62 }, ease: 'back.out(1.7)' },

      // 5 · the plate lands early (it is ground, not cargo); the apps stand up
      // on it once the warehouse is lit, back to front
      plate: { at: 0.35, duration: 0.8, from: { y: 12, scale: 0.985 }, ease: 'power2.out' },
      apps: { at: 2.1, duration: 0.6, from: { y: 14, scale: 0.94 }, stagger: 0.09, ease: 'back.out(1.4)' },

      labels: { at: 2.35, duration: 0.4, from: { y: 6, scale: 0.88 }, stagger: 0.1, ease: 'back.out(1.7)' },

      // ── ambient ────────────────────────────────────────────────────────────
      // The dashes crawl from the moment it enters — the lines are masked until
      // their wipe runs, so the motion is simply invisible until then and is
      // already up to speed when the line appears. 'down' follows the story.
      crawl: { enabled: true, speed: 9, direction: 'down' }, // SVG units per second

      // The glow drift. `mode` is the escape hatch if the blur turns out to cost
      // frames on a real machine:
      //   shapes — each plate moves on its own offset, so the 11.85σ Gaussian is
      //            re-run every frame. This is the look the artwork implies.
      //   group  — the filtered group is transformed as one instead, so the
      //            browser can reuse the blurred result. Cheaper; reads as one
      //            block breathing rather than a wave through the stack.
      //   off    — static.
      // x/scale are what keep it from reading as a lift: the plates wander
      // sideways and breathe, on periods that never line back up.
      glowDrift: { mode: 'shapes', y: 5, x: 7, scale: 0.045, duration: 2.6, stagger: 0.24, ease: 'sine.inOut' },

      // Every upward move — drop-in and float alike — is capped at the node's
      // own distance from the top of the frame, minus this. The back card sits
      // at y = 0.5, so it holds still rather than sliding out of the viewBox.
      edgeGuard: 1,

      cardFloat: { enabled: true, y: -7, duration: 2.4, stagger: 0.38, ease: 'sine.inOut' },
      appFloat: { enabled: true, y: -4, duration: 3.1, stagger: 0.45, ease: 'sine.inOut' },
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
    'warehouse-models': {
      timeScale: 1,

      // 1 · the radar rings, outermost first — they are the ground, not content
      rings: { at: 0, duration: 0.9, from: { scale: 0.88 }, stagger: -0.06, ease: 'power2.out' },

      // 2 · the panel, then its header
      panel: { at: 0.15, duration: 0.7, from: { scale: 0.97 }, ease: 'power2.out' },
      head: { at: 0.42, duration: 0.5, from: { y: -6 } },

      // 3 · the rows. `order` is 'top' (top row first, reading order) or 'bottom'
      //     (the order Figma authored them in, which is bottom-up).
      rows: { at: 0.55, duration: 0.55, from: { y: 10 }, stagger: 0.09, order: 'top', ease: 'power2.out' },

      // 4 · the conclusion chip sits above the panel, so it lands last
      label: { at: 0.95, duration: 0.45, from: { scale: 0.86 }, ease: 'back.out(1.7)' },

      // 5 · the sources arrive once there is something for them to feed
      sources: { at: 1, duration: 0.55, from: { scale: 0.8 }, stagger: 0.08, ease: 'back.out(1.5)' },

      // 6 · the lines grow out of the apps toward the panel. Same trick as agents
      //     and warehouse-hero: the artwork's 1.5/3 dash pattern is left alone and
      //     a white wipe travels inside a mask, because the dashoffset slot
      //     belongs to the crawl. Direction is derived per line (which endpoint is
      //     nearer the panel), so Figma can author them either way round.
      lines: { at: 1.15, duration: 0.8, stagger: 0.08, ease: 'power2.inOut', wipeWidth: 6 },

      // ── ambient ────────────────────────────────────────────────────────────
      // The packet flow. One source at a time, in artwork order unless `order`
      // names them — the row highlight only means anything if there is exactly
      // one row lit.
      flow: {
        enabled: true,
        travel: 1.8, // seconds for a packet to cross its line
        spread: 0.5, // Figma's dot spacing, as a fraction of `travel`, becomes the launch gap
        hold: 0.5, // how long the row stays lit after the last packet lands
        gap: 0.3, // dead air before the next source fires
        fade: 0.2, // packet fade-in / fade-out
        dotScale: 1, // resting size of a travelling packet
        landScale: 2.3, // it flares as it reaches the panel
        // The travel ease. 'none' is constant speed, which reads mechanical over a
        // short line; the house ease loads up and releases, so the packet has a
        // direction it is being sent in rather than just sliding.
        ease: 'osmo',
        launchEase: 'back.out(2.4)', // the pop as it leaves the source
        landEase: 'power3.in', // the flare as it meets the panel
        order: [], // [] = artwork order, or e.g. ['workday', 'lattice', 'greenhouse', 'slack']
        // Nathan's frame ships a Slack source with no Slack row and a Carta row
        // with no source. true pairs the leftovers off so every line lands
        // somewhere; false leaves Slack firing at no row at all.
        pairFallback: true,
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
        inEase: 'power3.out',
        outDuration: 0.55,
        outEase: 'power2.inOut',
        bracketLag: 0.08, // brackets darken just behind the row
        dotColor: '#333342', // matches the packet — the row wears what landed on it
        dotDuration: 0.16,
        dotLead: 0.13, // near dot flips on arrival, far dot this much later
        bracketColor: '#333342',
        bracketCrawl: true,
        crawlSpeed: 11, // SVG units per second, up the row brackets toward the head
      },

      // The source lines crawl from the moment it enters — they are masked until
      // their wipe runs, so it is invisible until then and already up to speed.
      crawl: { enabled: true, speed: 5 }, // SVG units per second, toward the panel
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
    'profile-match': {
      timeScale: 1,

      rings: { at: 0, duration: 0.9, from: { scale: 0.9 }, stagger: -0.07, ease: 'power2.out' },

      // the profile is the destination, so it is there before anything feeds it
      profile: { at: 0.1, duration: 0.7, from: { y: 14, scale: 0.98 }, ease: 'power2.out' },
      rows: { at: 0.45, duration: 0.5, from: { x: -10 }, stagger: 0.08, ease: 'power2.out' },

      // the deck lands back to front, so the featured card arrives last
      cards: { at: 0.75, duration: 0.6, from: { y: -14, scale: 0.97 }, stagger: 0.1, ease: 'back.out(1.3)' },

      // Conduits. Same trick as agents / warehouse-models: the artwork's 1.5/3
      // dash pattern is left alone and a white wipe travels inside a mask,
      // because the dashoffset slot belongs to the crawl. Only the ~60 units
      // between the deck and the profile are ever visible — the cards cover the
      // rest — which is also why the packet loop can teleport without showing.
      lines: { at: 1.05, duration: 0.6, stagger: 0.07, ease: 'power2.inOut', wipeWidth: 5 },

      // ── the deck ───────────────────────────────────────────────────────────
      deck: {
        enabled: true,
        step: 3.2, // dwell at the front before the stack advances again
        moveDuration: 0.75, // travel between slots
        ease: 'power2.inOut',
        lift: 34, // how far the front card carries on before it is recycled

        // WHICH PROFILE ROW EACH CARD LIGHTS.
        // One entry per app card, in the order they are stacked in the artwork,
        // BACK to FRONT. The number is the profile row, 1-based, top to bottom.
        // Today that is Greenhouse / Lattice / Workday against
        // Metrics & fields · People & roles · Org graph · Data Access.
        // A fourth card → a fourth number. Anything missing just cycles the rows.
        rows: [2, 1, 3],
      },

      // ── the packets ────────────────────────────────────────────────────────
      // One wave per dwell, fired by the card that just reached the front — this
      // is that card's data going down, not an ambient waterfall. The conduits
      // are empty between dwells on purpose: it is what makes the packets belong
      // to a source. Each packet keeps the position Figma parked it at as its
      // launch offset, so the spacing in the artwork is the spacing on screen.
      flow: {
        enabled: true,
        travel: 1.5, // seconds for one packet to cross, deck to profile
        spread: 0.55, // Figma's packet spacing, as a fraction of travel
        fade: 0.18, // both ends are under a card, so this only has to be quick
        ease: 'none',
      },

      // Lit = the row takes the accent the artwork already uses for its own lit
      // row, read off the artwork rather than hard-coded, plus whatever trailing
      // label that row carries. Nothing moves and nothing scales: at this size a
      // colour change reads as state and anything else reads as a glitch.
      highlight: {
        accent: '#40BE88', // fallback only — the real one comes from the artwork
        inDuration: 0.28,
        inEase: 'power3.out',
        outDuration: 0.45,
        outEase: 'power2.inOut',
      },

      crawl: { enabled: true, speed: 6 }, // dash crawl, SVG units per second
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

  // every hook whose name matches, in document order — for layers that are named
  // differently or counted differently between the desktop and mobile artwork
  function matching(root, re) {
    return [].slice.call(root.querySelectorAll('[data-anim]')).filter(function (el) {
      return re.test(el.getAttribute('data-anim'));
    });
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

  // svgo emits relative commands, so a subpath starts with `m` and its origin
  // depends on where the previous one ended — they cannot be split verbatim.
  // Walk them with a pen and hand back absolute, independently renderable pieces.
  function absSubpaths(path) {
    var d = path.getAttribute('d');
    var subs = d && d.match(/[Mm][^Mm]*/g);
    if (!subs || !subs.length) return null;

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
      parts.push({
        d: abs,
        x: b.x, y: b.y, w: b.width, h: b.height,
        sx: ax, sy: ay, ex: end.x, ey: end.y,
        closed: /z/i.test(abs),
      });
    }
    parent.removeChild(probe);
    return parts.length ? parts : null;
  }

  function splitGlyphs(path) {
    if (path.__glyphs) return path.__glyphs; // idempotent — rebuild() re-runs this

    var all = absSubpaths(path);
    if (!all || all.length < 2) return null;

    var parts = all.filter(function (p) { return p.w || p.h; });
    if (!parts.length) return null;

    var parent = path.parentNode;

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

  // Every 80×80 logo tile, found by its own rect rather than by Figma's junk
  // group names ("Frame 2147223359"), which change on every re-export.
  function tilesIn(scope) {
    if (!scope) return [];
    var out = [];
    scope.querySelectorAll('rect[rx="12"]').forEach(function (r) {
      if (parseFloat(r.getAttribute('width')) !== 80) return;
      var g = r.parentNode;
      if (g && g !== scope && out.indexOf(g) === -1) out.push(g);
    });
    return out;
  }

  // Rebuild the logo grid as a set of scrolling rows.
  //
  // Everything is measured, not assumed: rows come from the tiles' y positions,
  // the pitch from the median gap between neighbours, and a tile counts as
  // "empty" if it holds nothing but its background rect. The surviving logos are
  // repeated until the row is wider than the viewport plus one full set, which
  // is what makes the wrap seamless.
  //
  // Clip paths survive the move because userSpaceOnUse clips resolve in the
  // referencing element's user space, so an ancestor translate carries them.
  function buildMarquee(logos, cfg, viewW) {
    if (!logos || !cfg || !cfg.enabled) return [];

    // idempotent: keep a pristine copy so a rebuild does not clone the clones
    if (logos.__orig == null) logos.__orig = logos.innerHTML;
    else logos.innerHTML = logos.__orig;

    var tiles = tilesIn(logos);
    if (!tiles.length) return [];

    var meta = tiles.map(function (t) {
      var r = t.querySelector('rect[rx="12"]');
      return {
        el: t,
        x: parseFloat(r.getAttribute('x')) || 0,
        y: parseFloat(r.getAttribute('y')) || 0,
        // anything beyond the background rect means it carries a logo
        empty: !t.querySelector('path, image, use, circle, polygon, ellipse'),
      };
    });

    // group into rows by y
    var rows = [];
    meta.forEach(function (m) {
      var row = rows.filter(function (r) { return Math.abs(r.y - m.y) < 2; })[0];
      if (!row) { row = { y: m.y, items: [] }; rows.push(row); }
      row.items.push(m);
    });
    rows.sort(function (a, b) { return a.y - b.y; });

    var built = [];
    rows.forEach(function (row, ri) {
      row.items.sort(function (a, b) { return a.x - b.x; });

      // pitch = the median neighbour gap, so an irregular export still works
      var gaps = [];
      for (var i = 1; i < row.items.length; i++) gaps.push(row.items[i].x - row.items[i - 1].x);
      gaps.sort(function (a, b) { return a - b; });
      var pitch = cfg.pitch || gaps[Math.floor(gaps.length / 2)] || 96;

      var startX = row.items[0].x;
      var keep = cfg.dropEmpty ? row.items.filter(function (m) { return !m.empty; }) : row.items;
      row.items.forEach(function (m) { if (keep.indexOf(m) === -1) m.el.remove(); });
      if (!keep.length) return;

      var setWidth = keep.length * pitch;
      var copies = Math.ceil(viewW / setWidth) + 1; // viewport + one spare set

      var rowG = document.createElementNS(SVGNS, 'g');
      rowG.setAttribute('data-marquee-row', String(ri));
      logos.appendChild(rowG);

      for (var c = 0; c < copies; c++) {
        for (var j = 0; j < keep.length; j++) {
          var src = keep[j];
          var node = c === 0 ? src.el : src.el.cloneNode(true);
          var wrap = document.createElementNS(SVGNS, 'g');
          var targetX = startX + (c * keep.length + j) * pitch;
          wrap.setAttribute('transform', 'translate(' + (targetX - src.x) + ' 0)');
          wrap.appendChild(node);
          rowG.appendChild(wrap);
        }
      }

      built.push({ g: rowG, setWidth: setWidth, dir: cfg.zigzag && ri % 2 ? 1 : -1 });
    });

    applyEdgeFade(logos, cfg.fade, viewW);
    return built;
  }

  // Fade both edges of the scrolling grid with a luminance mask. Deliberately
  // not a pair of white rects: a mask fades the tiles against whatever sits
  // behind the SVG, so it survives the card ever not being white.
  function applyEdgeFade(logos, fade, viewW) {
    var root = logos.ownerSVGElement;
    var prev = root.querySelector('#hi-marquee-fade');
    if (prev) prev.remove();
    logos.removeAttribute('mask');
    if (!fade || fade <= 0) return;

    var defs = root.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS(SVGNS, 'defs');
      root.insertBefore(defs, root.firstChild);
    }

    var vb = root.viewBox && root.viewBox.baseVal;
    var h = (vb && vb.height) || parseFloat(root.getAttribute('height')) || 431;
    var f = Math.min(0.49, fade);

    var grad = document.createElementNS(SVGNS, 'linearGradient');
    grad.setAttribute('id', 'hi-marquee-fade-grad');
    grad.setAttribute('x1', '0');
    grad.setAttribute('x2', '1');
    [[0, '#000'], [f, '#fff'], [1 - f, '#fff'], [1, '#000']].forEach(function (s) {
      var stop = document.createElementNS(SVGNS, 'stop');
      stop.setAttribute('offset', String(s[0]));
      stop.setAttribute('stop-color', s[1]);
      grad.appendChild(stop);
    });

    var mask = document.createElementNS(SVGNS, 'mask');
    mask.setAttribute('id', 'hi-marquee-fade');
    mask.setAttribute('maskUnits', 'userSpaceOnUse');
    var r = document.createElementNS(SVGNS, 'rect');
    r.setAttribute('x', '0');
    r.setAttribute('y', '0');
    r.setAttribute('width', String(viewW));
    r.setAttribute('height', String(h));
    r.setAttribute('fill', 'url(#hi-marquee-fade-grad)');
    mask.appendChild(grad);
    mask.appendChild(r);
    defs.appendChild(mask);

    logos.setAttribute('mask', 'url(#hi-marquee-fade)');
  }

  // Drives several independent loops as one, for the pause/kill plumbing.
  function multiLoop(list) {
    return {
      play: function () { list.forEach(function (t) { t.play(); }); },
      pause: function () { list.forEach(function (t) { t.pause(); }); },
      // scrubbing an ambient loop is how the checks verify it moves at all
      seek: function (t) { list.forEach(function (x) { x.pause(); x.time(t); }); },
      kill: function () { list.forEach(function (t) { t.kill(); }); },
      paused: function () { return list[0] ? list[0].paused() : true; },
      duration: function () {
        return list.reduce(function (m, t) { return Math.max(m, t.duration()); }, 0);
      },
    };
  }

  // Distance from a point, per element, normalised 0..1 — the basis of the
  // centre-out wave.
  function radialDelays(els, cx, cy) {
    var d = els.map(function (el) {
      var b = el.getBBox();
      return Math.sqrt(Math.pow(b.x + b.width / 2 - cx, 2) + Math.pow(b.y + b.height / 2 - cy, 2));
    });
    var max = Math.max.apply(null, d) || 1;
    return d.map(function (v) { return v / max; });
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

  BUILD.shield = function (root, d) {
    var k = CONFIG.shield;
    var tl = gsap.timeline({ paused: true });

    var shield = one(root, 'shield');
    var agents = one(root, 'ai-agents');
    if (!shield) return tl;

    // Named layers, with a structural fallback in case a re-export loses them
    var parts = [].slice.call(shield.children);
    var glow = one(root, 'shield-bg') || parts.filter(function (el) { return el.getAttribute('filter'); })[0];
    var body = one(root, 'shield-base');
    var mark = one(root, 'shield-logo');

    // outline-1 is the inner ring, outline-2 the outer one — the pulse runs 1 → 2
    var rings = [one(root, 'shield-outline-1'), one(root, 'shield-outline-2')].filter(Boolean);
    if (!rings.length) {
      rings = parts.filter(function (el) {
        return el.tagName === 'path' && el.getAttribute('stroke') && !el.getAttribute('filter');
      });
    }

    var sb = shield.getBBox();
    var cx = sb.x + sb.width / 2;
    var cy = sb.y + sb.height / 2;

    // ── logo grid: restructure into scrolling rows FIRST, so the centre-out
    //    reveal measures the tiles where they actually end up ─────────────────
    var vb = root.viewBox && root.viewBox.baseVal;
    var viewW = (vb && vb.width) || parseFloat(root.getAttribute('width')) || 700;
    var rows = buildMarquee(one(root, 'logos'), k.marquee, viewW);

    // ── logo grid, centre-out ────────────────────────────────────────────────
    var tiles = tilesIn(one(root, 'logos'));
    if (tiles.length) {
      var norm = radialDelays(tiles, cx, cy);
      tiles.forEach(function (t) { gsap.set(t, { transformOrigin: 'center center' }); });
      tl.from(
        tiles,
        {
          autoAlpha: 0,
          scale: k.logos.from.scale,
          y: k.logos.from.y * d,
          duration: k.logos.duration,
          ease: k.logos.ease,
          stagger: function (i) { return norm[i] * k.logos.spread; },
        },
        k.logos.at
      );
    }

    // ── the shield itself ────────────────────────────────────────────────────
    var base = [glow, rings[0], rings[1], body].filter(Boolean);
    gsap.set(base.concat(mark ? [mark] : []), { transformOrigin: 'center center' });

    if (glow) tl.from(glow, { autoAlpha: 0, duration: k.glow.duration }, k.glow.at);

    // Split the outlines into the ones that stay put and the ones the waves
    // replace. Only the moving set is held out of the reveal — the entrance's
    // from-tween ends at autoAlpha:1 and would otherwise un-hide them.
    var animFrom = Math.max(0, Math.min(k.ripple.animateFrom | 0, rings.length));
    var rippleOn = k.ripple.enabled && rings.length > animFrom;
    var staticRings = rippleOn ? rings.slice(0, animFrom) : rings;
    var movingRings = rippleOn ? rings.slice(animFrom) : [];

    tl.from(
      [body].filter(Boolean),
      { autoAlpha: 0, scale: k.shieldBase.from.scale, duration: k.shieldBase.duration },
      k.shieldBase.at
    );

    // Static outlines expand out from behind the shield, matching the wave's
    // motion — the scale they start at is the shield body, same as a wave's.
    if (staticRings.length && body) {
      var baseWidth = rings[0].getBBox().width;
      var fromScale = body.getBBox().width / baseWidth;
      staticRings.forEach(function (r) {
        gsap.set(r, { transformOrigin: 'center center' });
        tl.fromTo(
          r,
          { scale: (fromScale * baseWidth) / r.getBBox().width, autoAlpha: 0 },
          {
            scale: 1,
            autoAlpha: 1,
            duration: k.outlineReveal.duration,
            ease: k.outlineReveal.ease,
          },
          k.outlineReveal.at
        );
      });
    }
    if (mark) {
      tl.from(mark, { autoAlpha: 0, scale: k.mark.from.scale, duration: k.mark.duration }, k.mark.at);
    }

    // ── connector + agents row ───────────────────────────────────────────────
    var conn = one(root, 'connector');
    if (conn && conn.getTotalLength) {
      dashPrime(conn);
      tl.to(conn, { strokeDashoffset: 0, duration: k.connector.duration, ease: 'none' }, k.connector.at);
    }
    if (agents) {
      var boxes = [].slice.call(agents.children).filter(function (el) { return el.tagName === 'rect'; });
      tl.from(boxes, { autoAlpha: 0, duration: k.agentsBox.duration }, k.agentsBox.at);
      var aTiles = tilesIn(agents);
      if (aTiles.length) {
        aTiles.forEach(function (t) { gsap.set(t, { transformOrigin: 'center center' }); });
        tl.from(
          aTiles,
          { autoAlpha: 0, y: k.agentTiles.from.y * d, duration: k.agentTiles.duration, stagger: k.agentTiles.stagger },
          k.agentTiles.at
        );
      }
    }

    // ── ambient: waves off the shield + the mark breathing ───────────────────
    // Each wave is its own repeating timeline. Nesting infinite children inside
    // one parent makes the parent's duration infinite and the offsets collapse,
    // so they are kept separate and driven through a small facade instead.
    var idles = [];

    if (rippleOn) {
      var rc = k.ripple;
      // clear waves left over from a rebuild or a breakpoint change
      shield.querySelectorAll('[data-ripple]').forEach(function (el) { el.remove(); });

      // Stops measured off the real outlines, so a re-export stays aligned.
      // The wave is drawn from rings[0]'s silhouette; every scale is that
      // ring's width ratio against it.
      var baseW = rings[0].getBBox().width;
      var stops = movingRings.map(function (r) {
        return { scale: r.getBBox().width / baseW, colour: r.getAttribute('stroke') };
      });

      // start where the last static outline sits, so the wave appears to peel
      // off it rather than materialising in mid-air
      var anchor = staticRings[staticRings.length - 1] || body;
      var s0 = rc.startScale || (anchor ? anchor.getBBox().width / baseW : 0.85);

      // only the moving outlines are replaced by waves; the rest stay visible
      movingRings.forEach(function (r) {
        r.setAttribute('data-ripple-hidden', '');
        gsap.set(r, { autoAlpha: 0 });
      });

      var period = rc.travel * stops.length + rc.hold * stops.length + rc.fadeOut + (rc.gap || 0);

      for (var w = 0; w < rc.waves; w++) {
        var wave = document.createElementNS(SVGNS, 'path');
        wave.setAttribute('d', rings[0].getAttribute('d'));
        wave.setAttribute('fill', 'none');
        wave.setAttribute('stroke', stops[0].colour);
        wave.setAttribute('stroke-width', String(rc.strokeWidth));
        // keeps the line the same weight as the wave grows, like a real ripple
        wave.setAttribute('vector-effect', 'non-scaling-stroke');
        wave.setAttribute('data-ripple', '');
        wave.style.opacity = '0';
        shield.insertBefore(wave, rings[0]);
        gsap.set(wave, { transformOrigin: 'center center', scale: s0 });

        var wt = gsap.timeline({
          paused: true,
          repeat: -1,
          repeatDelay: rc.gap || 0, // the empty beat, spent invisible at the start scale
          delay: (w * period) / rc.waves,
        });
        var at = 0;
        stops.forEach(function (stop, si) {
          // step out to this stop, taking its colour on the way
          wt.to(
            wave,
            {
              scale: stop.scale,
              stroke: stop.colour,
              opacity: rc.peakOpacity,
              duration: rc.travel,
              ease: rc.ease,
            },
            at
          );
          at += rc.travel + rc.hold; // then sit still for `hold`
        });
        // clear, and snap back to the start for the next pass
        wt.to(wave, { opacity: 0, duration: rc.fadeOut, ease: 'none' }, at)
          .set(wave, { scale: s0, stroke: stops[0].colour }, at + rc.fadeOut);

        idles.push(wt);
      }
    }

    // rows scroll forever; one set-width per cycle so the wrap is invisible
    // The marquee is background texture — it reads as dead if it waits for the
    // reveal, so it gets its own bucket that starts the moment the panel enters.
    var immediate = [];
    rows.forEach(function (row, ri) {
      gsap.set(row.g, { willChange: 'transform' });
      var dur = row.setWidth / k.marquee.speed;
      var rt = gsap.timeline({ paused: true }).fromTo(
        row.g,
        { x: row.dir < 0 ? 0 : -row.setWidth },
        { x: row.dir < 0 ? -row.setWidth : 0, duration: dur, ease: 'none', repeat: -1 }
      );
      // rows with the same set width would otherwise travel in lockstep
      rt.time(((ri * 0.37) % 1) * dur);
      (k.marquee.startImmediately ? immediate : idles).push(rt);
    });

    // The dashed frame crawls at the marquee's speed so the two read as one
    // system rather than two unrelated animations. One dash period per cycle
    // keeps the loop seamless whatever the dash pattern is.
    if (k.agentsDash.enabled && agents) {
      var dashed = agents.querySelector('[stroke-dasharray]');
      if (dashed) {
        var pattern = (dashed.getAttribute('stroke-dasharray') || '')
          .split(/[\s,]+/)
          .map(parseFloat)
          .filter(function (n) { return !isNaN(n); });
        var cycle = pattern.reduce(function (a, b) { return a + b; }, 0);
        if (pattern.length === 1) cycle *= 2; // "8" means 8 on, 8 off
        var dashSpeed = k.agentsDash.speed || k.marquee.speed;
        if (cycle > 0 && dashSpeed > 0) {
          immediate.push(
            gsap.timeline({ paused: true }).fromTo(
              dashed,
              { strokeDashoffset: 0 },
              {
                strokeDashoffset: k.agentsDash.reverse ? cycle : -cycle,
                duration: cycle / dashSpeed,
                ease: 'none',
                repeat: -1,
              }
            )
          );
        }
      }
    }
    if (immediate.length) tl.__loopNow = multiLoop(immediate);

    if (k.shieldBreathe && k.shieldBreathe.enabled && body) {
      gsap.set(body, { transformOrigin: 'center center' });
      idles.push(
        gsap.timeline({ paused: true }).to(body, {
          scale: k.shieldBreathe.scale,
          duration: k.shieldBreathe.duration,
          ease: k.shieldBreathe.ease,
          yoyo: true,
          repeat: -1,
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
          repeat: -1,
        })
      );
    }

    if (idles.length) tl.__loop = multiLoop(idles);
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

  // ---------------------------------------------------------------------------
  // isometric floor — slide the lattice by exactly one cell, forever
  // ---------------------------------------------------------------------------

  // The grid ships as ONE path: two families of parallel lines plus the closing
  // diamond. Sliding all of it would drag the outline off, and the lines are
  // painted with a userSpaceOnUse gradient, so translating them drags the
  // edge-fade along too — three copies would each carry their own bright centre
  // and band against each other. So: outline left standing, lattice repainted
  // flat and put under a STATIC mask that reproduces the gradient's fade.
  // svgo emits hex; Figma occasionally leaves a named colour in. Anything else
  // falls back to black, which only affects how a fade is weighted.
  function parseColor(c) {
    if (!c) return [255, 255, 255];
    var m = /^#([0-9a-f]{3,8})$/i.exec(c.trim());
    if (m) {
      var h = m[1];
      if (h.length < 6) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
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
    // rebuild() hands back the group from the previous run — put the original
    // path back first, or an axis/reverse change would have nothing to re-derive
    if (grid.__gridSrc) {
      var was = grid.__gridSrc;
      var orig = document.createElementNS(SVGNS, 'path');
      Object.keys(was).forEach(function (n) { orig.setAttribute(n, was[n]); });
      grid.parentNode.insertBefore(orig, grid);
      grid.parentNode.removeChild(grid);
      grid = orig;
    }

    var parts = absSubpaths(grid);
    if (!parts) return null;

    var lattice = parts.filter(function (p) { return !p.closed; });
    var outline = parts.filter(function (p) { return p.closed; });
    if (lattice.length < 2) return null;

    // the two families run in opposite directions; consecutive lines within one
    // family are exactly one cell apart, and that gap is the loop distance
    var family = lattice.filter(function (p) {
      return cfg.axis === 2 ? p.ex <= p.sx : p.ex > p.sx;
    });
    if (family.length < 2) return null;

    var dir = cfg.reverse ? -1 : 1;
    var px = (family[1].sx - family[0].sx) * dir;
    var py = (family[1].sy - family[0].sy) * dir;
    var span = Math.sqrt(px * px + py * py);
    if (!span) return null;

    var svg = grid.ownerSVGElement || root;
    var defs = svg.querySelector('defs');
    var paint = (grid.getAttribute('stroke') || '').match(/url\(#([^)]+)\)/);
    var src = paint && svg.querySelector('#' + paint[1]);
    if (!defs || !src) return null;

    // reuse the artwork's own gradient geometry for the mask, so the fade lands
    // exactly where Figma put it — only the stops become white-to-transparent
    var uid = 'grid-fade-' + (src.id || 'x');
    var old = svg.querySelector('#' + uid);
    if (old) old.parentNode.removeChild(old);
    var oldMask = svg.querySelector('#' + uid + '-mask');
    if (oldMask) oldMask.parentNode.removeChild(oldMask);

    var grad = src.cloneNode(true);
    grad.setAttribute('id', uid);
    var stops = [].slice.call(grad.querySelectorAll('stop'));

    // A lattice gets faded out one of two ways and the artwork uses both:
    // `systems` runs stop-opacity to 0 over a dark section, `warehouse-hero`
    // holds opacity at 1 and runs the COLOUR to the page background instead.
    // A mask only understands alpha, so a colour fade has to be converted into
    // one — read literally it produces a fully opaque mask, and the floor then
    // tiles edge to edge with no fade at all.
    //
    // The reference point is whichever stop is already invisible: the
    // lowest-alpha one, or — when every stop shares an alpha, which is exactly
    // the colour-fade case — the last, since these gradients fade outward.
    var info = stops.map(function (s) {
      var a = s.getAttribute('stop-opacity');
      return { el: s, alpha: a == null ? 1 : parseFloat(a), rgb: parseColor(s.getAttribute('stop-color')) };
    });
    var minA = Math.min.apply(null, info.map(function (s) { return s.alpha; }));
    var faded = info.filter(function (s) { return s.alpha === minA; });
    var ref = (faded.length === info.length ? info[info.length - 1] : faded[0]).rgb;

    var dist = info.map(function (s) {
      return (Math.abs(s.rgb[0] - ref[0]) + Math.abs(s.rgb[1] - ref[1]) + Math.abs(s.rgb[2] - ref[2])) / 3;
    });
    var maxD = Math.max.apply(null, dist);

    var flat = '#2B2D2E';
    var peak = -1;
    info.forEach(function (s, i) {
      // no colour spread means it was already an opacity fade — leave it alone
      var alpha = s.alpha * (maxD ? dist[i] / maxD : 1);
      if (alpha > peak) { peak = alpha; flat = s.el.getAttribute('stop-color') || flat; }
      s.el.setAttribute('stop-color', '#fff');
      s.el.setAttribute('stop-opacity', String(alpha));
    });
    defs.appendChild(grad);

    var box = (svg.getAttribute('viewBox') || '0 0 776 874').split(/[\s,]+/).map(Number);
    var mask = document.createElementNS(SVGNS, 'mask');
    mask.setAttribute('id', uid + '-mask');
    mask.setAttribute('maskUnits', 'userSpaceOnUse');
    mask.setAttribute('x', box[0]);
    mask.setAttribute('y', box[1]);
    mask.setAttribute('width', box[2]);
    mask.setAttribute('height', box[3]);
    var fade = document.createElementNS(SVGNS, 'rect');
    fade.setAttribute('x', box[0]);
    fade.setAttribute('y', box[1]);
    fade.setAttribute('width', box[2]);
    fade.setAttribute('height', box[3]);
    fade.setAttribute('fill', 'url(#' + uid + ')');
    mask.appendChild(fade);
    defs.appendChild(mask);

    // rebuild the grid as: static outline + masked, repeating lattice
    var wrap = document.createElementNS(SVGNS, 'g');
    var src0 = {};
    for (var a2 = 0; a2 < grid.attributes.length; a2++) {
      var at = grid.attributes[a2];
      src0[at.name] = at.value;
      if (at.name !== 'd' && at.name !== 'stroke') wrap.setAttribute(at.name, at.value);
    }
    wrap.__gridSrc = src0;

    if (outline.length) {
      var edge = document.createElementNS(SVGNS, 'path');
      edge.setAttribute('d', outline.map(function (p) { return p.d; }).join(''));
      edge.setAttribute('stroke', grid.getAttribute('stroke'));
      wrap.appendChild(edge);
    }

    var band = document.createElementNS(SVGNS, 'g');
    band.setAttribute('mask', 'url(#' + uid + '-mask)');
    band.setAttribute('stroke', flat);
    wrap.appendChild(band);

    // three copies, one cell apart: whichever way it travels, the band it leaves
    // behind is already filled by its neighbour
    var latD = lattice.map(function (p) { return p.d; }).join('');
    var copies = [-1, 0, 1].map(function (n) {
      var el = document.createElementNS(SVGNS, 'path');
      el.setAttribute('d', latD);
      el.setAttribute('data-systems-grid', String(n));
      band.appendChild(el);
      return { el: el, n: n };
    });

    grid.parentNode.insertBefore(wrap, grid);
    grid.parentNode.removeChild(grid);

    var loop = gsap.timeline({ paused: true, repeat: -1 });
    copies.forEach(function (c) {
      loop.fromTo(
        c.el,
        { x: c.n * px, y: c.n * py },
        { x: (c.n + 1) * px, y: (c.n + 1) * py, duration: span / cfg.speed, ease: 'none' },
        0
      );
    });

    return { node: wrap, loop: loop };
  }

  BUILD.systems = function (root, d) {
    var k = CONFIG.systems;
    var tl = gsap.timeline({ paused: true });

    var after = one(root, 'after');
    if (!after) return tl;

    // Read the tiles out of the group rather than by name — Figma renumbers
    // app-card_N on every re-export, but the before/after grouping is stable.
    var tiles = [].slice.call(after.children).filter(function (el) {
      return /^app-card/.test(el.getAttribute('data-anim') || '');
    });
    var core = one(root, 'human-intelligence');
    var label = one(root, 'label');
    var plate = one(root, 'base-lines');
    var grid = one(root, 'grid');
    if (!tiles.length || !core) return tl;

    var cb = core.getBBox();
    var cx = cb.x + cb.width / 2;
    var cy = cb.y + cb.height / 2;

    // matchMedia reverts tweens but knows nothing about injected nodes, so every
    // breakpoint cross would otherwise stack another set of ghosts and pulses.
    var stale = root.querySelectorAll('[data-systems-ghost],[data-systems-pulse]');
    for (var s = 0; s < stale.length; s++) stale[s].parentNode.removeChild(stale[s]);

    // Each tile ships with its border already lit: one base stroke followed by
    // one to three radial-gradient glows. Cloning the base into a dashed grey
    // ghost gives the "before" look without touching the artwork — the tile that
    // has no flat base stroke (its border IS a gradient) keeps its gradient.
    var lit = [];
    var ghosts = [];
    tiles.forEach(function (tile) {
      var strokes = [].slice.call(tile.querySelectorAll('path[stroke]'));
      if (!strokes.length) { lit.push([]); ghosts.push(null); return; }

      var ghost = strokes[0].cloneNode(false);
      ghost.setAttribute('stroke', k.before.stroke);
      ghost.setAttribute('stroke-dasharray', k.before.dash);
      ghost.removeAttribute('data-anim');
      ghost.setAttribute('data-systems-ghost', '');
      strokes[0].parentNode.insertBefore(ghost, strokes[0]);

      gsap.set(strokes, { autoAlpha: 0 });
      lit.push(strokes);
      ghosts.push(ghost);
    });

    // 1 · the systems arrive
    step(tl, tiles, k.tiles, d, { transformOrigin: 'center center' });

    // 2 · the label, centred on where the mark will land. x/y carry the offset,
    // so it is set explicitly rather than through step()'s `from`.
    if (label) {
      var lb = label.getBBox();
      var dx = cx - (lb.x + lb.width / 2);
      var dy = cy - (lb.y + lb.height / 2);
      gsap.set(label, { x: dx, y: dy, autoAlpha: 0, transformOrigin: 'center center' });

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

    // 3 · the mark takes the chip's place, and the borders light centre-out
    gsap.set(core, { transformOrigin: 'center center' });
    step(tl, core, k.core, d);

    var delays = radialDelays(tiles, cx, cy);
    tiles.forEach(function (tile, i) {
      var at = k.light.at + delays[i] * k.light.spread;
      if (ghosts[i]) tl.to(ghosts[i], { autoAlpha: 0, duration: k.light.duration, ease: k.light.ease }, at);
      if (lit[i].length) tl.to(lit[i], { autoAlpha: 1, duration: k.light.duration, ease: k.light.ease }, at);
    });

    var drift = grid && k.gridDrift.enabled ? buildGridDrift(root, grid, k.gridDrift) : null;
    if (drift) grid = drift.node; // the fade-in now covers outline + lattice together
    if (grid) step(tl, grid, k.grid, d);

    if (plate) {
      dashPrime(plate);
      tl.to(plate, { strokeDashoffset: 0, duration: k.plate.duration, ease: k.plate.ease }, k.plate.at);
    }

    // 4 · the connections. Figma authored the six lines in whichever direction
    // it felt like, so each one is primed to draw from whichever end is nearer
    // the core — otherwise half of them grow inwards, which reads backwards.
    var lines = series(root, 'lines', 6)
      .map(function (g) {
        var path = g.querySelector('path');
        if (!path) return null;
        var len = path.getTotalLength();

        // where along the line does it come closest to the mark?
        var near = { dist: Infinity, at: 0 };
        for (var s = 0; s <= 160; s++) {
          var at = (len * s) / 160;
          var p = path.getPointAtLength(at);
          var dist = Math.hypot(p.x - cx, p.y - cy);
          if (dist < near.dist) near = { dist: dist, at: at };
        }

        var a = path.getPointAtLength(0);
        var b = path.getPointAtLength(len);
        var startsAtCore = Math.hypot(a.x - cx, a.y - cy) <= Math.hypot(b.x - cx, b.y - cy);
        // a line that crosses the mark has its nearest point in the middle of
        // its own run; one that merely ends near it has it at an end
        var through =
          near.dist <= k.lines.centreSplit && near.at > len * 0.05 && near.at < len * 0.95;

        gsap.set(g, { autoAlpha: 0 });
        if (through) {
          // dash pattern [0, gap, dash, rest] shows exactly [gap, gap+dash].
          // Collapsing gap to 0 while dash grows to the full length walks both
          // ends outwards from the crossing point, arriving together.
          gsap.set(path, { strokeDasharray: '0 ' + near.at + ' 0 ' + len });
        } else {
          // draws from the core-facing end; chordReverse starts it at the far one
          var fromNear = k.lines.chordReverse ? !startsAtCore : startsAtCore;
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: fromNear ? len : -len });
        }

        return {
          group: g,
          path: path,
          len: len,
          startsAtCore: startsAtCore,
          through: through,
          // how far from the mark this line starts growing — the running order
          reach: through ? 0 : Math.min(Math.hypot(a.x - cx, a.y - cy), Math.hypot(b.x - cx, b.y - cy)),
        };
      })
      .filter(Boolean);

    // radiate: the lines through the mark go first, the outer chords follow
    lines.sort(function (p, q) { return p.reach - q.reach; });

    lines.forEach(function (l, i) {
      var at = k.lines.at + i * k.lines.stagger + (l.through ? 0 : k.lines.chordDelay);
      tl.to(l.group, { autoAlpha: 1, duration: k.lines.fadeIn }, at);
      tl.to(
        l.path,
        l.through
          ? { strokeDasharray: '0 0 ' + l.len + ' 0', duration: k.lines.duration, ease: k.lines.ease }
          : { strokeDashoffset: 0, duration: k.lines.duration, ease: k.lines.ease },
        at
      );
    });

    var loops = [];

    // packets running down the lines into the core, forever
    if (k.pulse.enabled && lines.length) {
      var pulses = gsap.timeline({ paused: true, repeat: -1, repeatDelay: k.pulse.cycleDelay });

      lines.forEach(function (l, i) {
        var pulse = l.path.cloneNode(false);
        pulse.setAttribute('stroke', k.pulse.tint);
        pulse.setAttribute('stroke-width', String(k.pulse.strokeWidth));
        pulse.setAttribute('stroke-linecap', 'round');
        pulse.removeAttribute('data-anim');
        pulse.setAttribute('data-systems-pulse', '');
        pulse.style.opacity = '0';
        l.path.parentNode.insertBefore(pulse, l.path.nextSibling);

        var seg = Math.min(k.pulse.length, l.len * 0.5);
        gsap.set(pulse, { strokeDasharray: seg + ' ' + l.len });

        // the dash travels along the path's own direction, so a line authored
        // from the core outwards has to be run in reverse to arrive at it
        var from = l.startsAtCore ? -l.len : seg;
        var to = l.startsAtCore ? seg : -l.len;
        var at = i * k.pulse.stagger;

        pulses
          .set(pulse, { strokeDashoffset: from, opacity: 1 }, at)
          .to(pulse, { strokeDashoffset: to, duration: k.pulse.duration, ease: 'none' }, at)
          .to(pulse, { opacity: 0, duration: k.pulse.fadeOut }, at + k.pulse.duration - k.pulse.fadeOut);
      });

      loops.push(pulses);
    }

    if (k.breathe.enabled) {
      loops.push(
        gsap.timeline({ paused: true, repeat: -1, yoyo: true }).to(core, {
          scale: k.breathe.scale,
          duration: k.breathe.duration,
          ease: k.breathe.ease,
        })
      );
    }

    // waits for the reveal — a packet arriving at a core that is not there yet
    // reads as a glitch
    if (loops.length) tl.__loop = multiLoop(loops);

    // the floor is scenery, not a payoff: it should already be moving when the
    // grid fades in, so it goes in the bucket that starts on enter
    if (drift) tl.__loopNow = drift.loop;

    return tl;
  };


  // A dashed line cannot be drawn on with its own strokeDashoffset — that is
  // what carries the dash pattern. Reveal it through a mask instead: one white
  // stroke, one dash the length of the path, offset fully out of view. Animating
  // the mask's offset to 0 wipes the real line in, pattern untouched and free to
  // crawl afterwards.
  var wipeUid = 0;

  // The rows inside a system card, matched on shape rather than name: Figma
  // named half of these `rows`/`rows_2` and left the rest as `Frame 2147223886`.
  // A row is the one group holding a text path and a tick — the head has text
  // but no tick, so it is excluded without special-casing it.
  function cardRows(card) {
    return [].slice.call(card.querySelectorAll('g')).filter(function (g) {
      var text = false, icon = false;
      for (var i = 0; i < g.children.length; i++) {
        var kid = g.children[i];
        var n = kid.getAttribute('data-anim') || '';
        if (kid.tagName === 'path' && /^text/.test(n)) text = true;
        else if (kid.tagName === 'g' && /^Icon/.test(n)) icon = true;
      }
      return text && icon;
    });
  }

  function makeWipe(root, path, len, fromCore, width) {
    var defs = root.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS(SVGNS, 'defs');
      root.insertBefore(defs, root.firstChild);
    }

    var vb = (root.getAttribute('viewBox') || '0 0 1000 1000').split(/[\s,]+/).map(Number);
    var id = 'hi-agents-wipe-' + ++wipeUid;

    var mask = document.createElementNS(SVGNS, 'mask');
    mask.setAttribute('id', id);
    mask.setAttribute('maskUnits', 'userSpaceOnUse');
    mask.setAttribute('x', vb[0]);
    mask.setAttribute('y', vb[1]);
    mask.setAttribute('width', vb[2]);
    mask.setAttribute('height', vb[3]);
    mask.setAttribute('data-agents-wipe', '');

    var w = path.cloneNode(false);
    w.removeAttribute('data-anim');
    w.setAttribute('fill', 'none');
    w.setAttribute('stroke', '#fff');
    w.setAttribute('stroke-width', String(width));
    w.setAttribute('stroke-linecap', 'round');
    w.setAttribute('stroke-dasharray', String(len));
    // +len draws from the path's start, -len draws back from its end
    w.setAttribute('stroke-dashoffset', String(fromCore ? len : -len));
    mask.appendChild(w);
    defs.appendChild(mask);

    return { id: id, path: w };
  }

  BUILD.agents = function (root, d) {
    var k = CONFIG.agents;
    var tl = gsap.timeline({ paused: true });

    // desktop calls the mark 'humain-intelligence-logo' (Figma's spelling),
    // the ≤767 export just calls it 'logo'
    var logo = one(root, 'humain-intelligence-logo') || one(root, 'logo');
    var cardsGroup = one(root, 'cards');
    if (!logo || !cardsGroup) return tl;

    var panel = one(root, 'bg');
    var chipsGroup = one(root, 'ai-agents');

    // matchMedia reverts tweens but knows nothing about injected nodes, so every
    // breakpoint cross would otherwise stack another set of masks.
    var stale = root.querySelectorAll('[data-agents-wipe]');
    for (var s = 0; s < stale.length; s++) stale[s].parentNode.removeChild(stale[s]);

    var lb = logo.getBBox();
    var cx = lb.x + lb.width / 2;
    var cy = lb.y + lb.height / 2;

    // 1 · the panel
    if (panel) step(tl, panel, k.panel, d, { transformOrigin: 'center center' });

    // 2 · the mark, as one piece
    tl.from(
      logo,
      {
        autoAlpha: 0,
        scale: k.mark.from.scale,
        svgOrigin: cx + ' ' + cy,
        duration: k.mark.duration,
        ease: k.mark.ease,
      },
      k.mark.at
    );

    // 3 · the agent chips, in the mark's negative space
    if (chipsGroup) {
      var chips = [].slice.call(chipsGroup.children);
      if (chips.length) step(tl, chips, k.chips, d, { transformOrigin: 'center center' });
    }

    // 4 · the systems, centre-out. Read them out of the group rather than by
    // name — Figma renumbers Button_N on every re-export.
    var cards = [].slice.call(cardsGroup.children);
    var delays = radialDelays(cards, cx, cy);
    cards.forEach(function (card, i) {
      var b = card.getBBox();
      var vx = b.x + b.width / 2 - cx;
      var vy = b.y + b.height / 2 - cy;
      var m = Math.hypot(vx, vy) || 1;
      var at = k.cards.at + delays[i] * k.cards.spread;

      tl.from(
        card,
        {
          autoAlpha: 0,
          x: (-vx / m) * k.cards.from.dist * d,
          y: (-vy / m) * k.cards.from.dist * d,
          scale: k.cards.from.scale,
          transformOrigin: 'center center',
          duration: k.cards.duration,
          ease: k.cards.ease,
        },
        at
      );

      var rows = cardRows(card);
      if (!rows.length) return;
      var rv = {
        autoAlpha: 0,
        x: k.rows.from.x * d,
        duration: k.rows.duration,
        stagger: k.rows.stagger,
      };
      if (k.rows.ease) rv.ease = k.rows.ease;
      tl.from(rows, rv, at + k.rows.at);
    });

    // 5 · the connections, each wiped in from whichever end is nearer the mark —
    // Figma authored them in both directions, and half of them growing inwards
    // reads backwards.
    // 'Connector line…' on desktop, 'lines…' at ≤767, and the layouts don't have
    // the same number of them — take whatever the artwork carries, in DOM order.
    var lines = matching(root, /^(Connector line|lines)(_\d+)?$/)
      .map(function (g) {
        var path = g.querySelector('path');
        if (!path) return null;
        var len = path.getTotalLength();
        var a = path.getPointAtLength(0);
        var b = path.getPointAtLength(len);
        var startsAtCore = Math.hypot(a.x - cx, a.y - cy) <= Math.hypot(b.x - cx, b.y - cy);

        var wipe = makeWipe(root, path, len, startsAtCore, k.lines.wipeWidth);
        g.setAttribute('mask', 'url(#' + wipe.id + ')');

        // period of the authored dash pattern — one period of travel loops seamlessly
        var dash = (path.getAttribute('stroke-dasharray') || '4 4').split(/[\s,]+/).map(parseFloat).filter(function (n) {
          return !isNaN(n);
        });
        var period = dash.reduce(function (t, n) { return t + n; }, 0) || 8;
        if (dash.length % 2) period *= 2; // odd counts repeat inverted

        return { group: g, path: path, wipe: wipe.path, len: len, startsAtCore: startsAtCore, period: period };
      })
      .filter(Boolean);

    lines.forEach(function (l, i) {
      tl.to(
        l.wipe,
        { strokeDashoffset: 0, duration: k.lines.duration, ease: k.lines.ease },
        k.lines.at + i * k.lines.stagger
      );
    });

    // the dashes crawl. Increasing the offset walks the pattern back toward the
    // path's start, so the sign follows whichever end the mark is on.
    if (k.crawl.enabled && lines.length) {
      var crawl = gsap.timeline({ paused: true, repeat: -1 });
      lines.forEach(function (l) {
        var toward = k.crawl.direction === 'out' ? !l.startsAtCore : l.startsAtCore;
        gsap.set(l.path, { strokeDashoffset: 0 });
        crawl.to(
          l.path,
          {
            strokeDashoffset: toward ? l.period : -l.period,
            duration: l.period / k.crawl.speed,
            ease: 'none',
          },
          0
        );
      });
      tl.__loopNow = crawl; // no waiting — it is masked out until its line draws
    }

    var loops = [];

    if (k.breathe.enabled) {
      gsap.set(logo, { transformOrigin: 'center center' });
      loops.push(
        gsap.timeline({ paused: true, repeat: -1, yoyo: true }).to(logo, {
          scale: k.breathe.scale,
          duration: k.breathe.duration,
          ease: k.breathe.ease,
        })
      );
    }

    // waits for the reveal — dashes crawling along a line that has not been
    // drawn yet reads as a glitch
    if (loops.length) tl.__loop = multiLoop(loops);

    return tl;
  };

  // The ≤767 artwork is the same diagram restacked, and the builder reads its
  // geometry off the artwork, so it drives both. The alias only exists so the
  // mobile SVG can also live in its own mount if that suits the Webflow build
  // better than two SVGs in one.
  BUILD['agents-mobile'] = BUILD.agents;
  CONFIG['agents-mobile'] = CONFIG.agents;

  // ---------------------------------------------------------------------------
  // warehouse hero
  // ---------------------------------------------------------------------------

  // Depth order, not DOM order. Both the source cards and the app tiles are
  // isometric, so "further back" is simply "higher up the artwork" — and Figma
  // numbers them in whatever order they were drawn.
  function byDepth(list) {
    return list
      .map(function (el) { return { el: el, y: el.getBBox().y }; })
      .sort(function (a, b) { return a.y - b.y; })
      .map(function (r) { return r.el; });
  }

  // Direct children of a group whose hook starts with `base`, e.g. card, card_2…
  function childrenNamed(group, base) {
    if (!group) return [];
    var re = new RegExp('^' + base + '(_\\d+)?$');
    return [].slice.call(group.children).filter(function (el) {
      return re.test(el.getAttribute('data-anim') || '');
    });
  }

  BUILD['warehouse-hero'] = function (root, d) {
    var k = CONFIG['warehouse-hero'];
    var tl = gsap.timeline({ paused: true });

    var wellGroup = one(root, 'highlight-part');
    var cardsGroup = one(root, 'ai-cards');
    if (!wellGroup || !cardsGroup) return tl;

    var lid = one(root, 'Vector_20');
    var logo = one(root, 'HI-LogoBlack');
    var walls = [one(root, 'Vector_18'), one(root, 'Vector_19')].filter(Boolean);
    var glowGroup = one(root, 'Group 1171275899'); // the filtered group itself
    var glow = series(root, 'shapes', 6);
    var plate = one(root, 'base');
    var apps = byDepth(childrenNamed(one(root, 'apps'), 'app'));
    var cards = byDepth(childrenNamed(cardsGroup, 'card'));
    var labels = series(root, 'label', 2); // ingestion, then modeling
    var grid = one(root, 'grid');

    // matchMedia reverts tweens but knows nothing about injected nodes, so every
    // breakpoint cross would otherwise stack another set of wipe masks.
    var stale = root.querySelectorAll('[data-agents-wipe]');
    for (var s = 0; s < stale.length; s++) stale[s].parentNode.removeChild(stale[s]);

    // How far a node can rise before it leaves the frame. The back card sits
    // flush against the top edge — y = 0.5 in a viewBox that starts at 0 — so an
    // unclamped drop-in or float slides it straight out and it renders cut off.
    // Measured, not special-cased: Figma renumbers the cards on every re-export
    // and the next frame may be tight at a different corner.
    var vb = (root.getAttribute('viewBox') || '0 0 487 558').split(/[\s,]+/).map(Number);
    function headroom(el) {
      return Math.max(0, el.getBBox().y - vb[1] - (k.edgeGuard || 0));
    }

    // ── the floor ───────────────────────────────────────────────────────────
    // Same single-path lattice as systems, so the same rebuild applies: outline
    // left standing, lattice repainted flat under a static fade mask and slid by
    // exactly one cell, forever.
    var drift = grid && k.gridDrift.enabled ? buildGridDrift(root, grid, k.gridDrift) : null;
    if (drift) grid = drift.node;
    if (grid) step(tl, grid, k.grid, d);

    step(tl, plate, k.plate, d, { transformOrigin: 'center center' });

    // ── 1 · the sources ─────────────────────────────────────────────────────
    // Not step(): each card's drop is capped at its own headroom, so the back
    // one arrives on scale and fade alone rather than from outside the frame.
    var cardLift = cards.map(function (card) {
      return Math.min(Math.abs(k.cards.from.y * d), headroom(card));
    });
    cards.forEach(function (card, i) {
      tl.from(
        card,
        {
          autoAlpha: 0,
          y: -cardLift[i],
          scale: k.cards.from.scale,
          transformOrigin: 'center center',
          duration: k.cards.duration,
          ease: k.cards.ease,
        },
        k.cards.at + i * k.cards.stagger
      );
    });

    // ── 2 · the conduits ────────────────────────────────────────────────────
    // Straight verticals, authored bottom -> top. The entrance runs a white wipe
    // inside a mask so the artwork's own 3.17/3.17 pattern survives untouched —
    // that slot belongs to the crawl.
    var lines = [].slice
      .call((one(root, 'dashed-lines') || root).querySelectorAll('path'))
      .map(function (path) {
        var len = path.getTotalLength();
        if (!len) return null;
        var a = path.getPointAtLength(0);
        var b = path.getPointAtLength(len);
        var startsAtBottom = a.y > b.y;

        // grow from the top end: that is the path's START when Figma drew it
        // downwards, and its END when it drew it upwards
        var fromStart = k.lines.from === 'bottom' ? startsAtBottom : !startsAtBottom;
        var wipe = makeWipe(root, path, len, fromStart, k.lines.wipeWidth);
        wipe.path.removeAttribute('opacity'); // the clone carries the artwork's .5
        path.setAttribute('mask', 'url(#' + wipe.id + ')');

        // travelling exactly one period of the authored dash pattern loops
        // seamlessly. Here the pattern is set on the parent group, which
        // dashPeriod already looks through.
        return { path: path, wipe: wipe.path, startsAtBottom: startsAtBottom, period: dashPeriod(path, 8) };
      })
      .filter(Boolean);

    lines.forEach(function (l, i) {
      tl.to(
        l.wipe,
        { strokeDashoffset: 0, duration: k.lines.duration, ease: k.lines.ease },
        k.lines.at + i * k.lines.stagger
      );
    });

    // ── 3 · the warehouse ───────────────────────────────────────────────────
    var shell = walls.concat(lid ? [lid] : []);
    if (shell.length) {
      gsap.set(shell, { transformOrigin: 'center center' });
      step(tl, shell, k.well, d);
    }

    // 4 · the layers rise into it, bottom of the stack first
    if (glow.length) step(tl, glow, k.glow, d);

    if (logo) {
      gsap.set(logo, { transformOrigin: 'center center' });
      step(tl, logo, k.logo, d);
    }

    // ── 5 · the apps on the plate, then the chips ───────────────────────────
    if (apps.length) {
      gsap.set(apps, { transformOrigin: 'center center' });
      step(tl, apps, k.apps, d);
    }
    if (labels.length) {
      gsap.set(labels, { transformOrigin: 'center center' });
      step(tl, labels, k.labels, d);
    }

    // ── ambient ─────────────────────────────────────────────────────────────
    var immediate = [];
    if (drift) immediate.push(drift.loop);

    if (k.crawl.enabled && lines.length) {
      var crawl = gsap.timeline({ paused: true, repeat: -1 });
      lines.forEach(function (l) {
        // increasing the offset walks the pattern back toward the path's start,
        // so which sign runs the dashes downwards depends on how Figma drew it
        var down = l.startsAtBottom ? l.period : -l.period;
        gsap.set(l.path, { strokeDashoffset: 0 });
        crawl.to(
          l.path,
          {
            strokeDashoffset: k.crawl.direction === 'down' ? down : -down,
            duration: l.period / k.crawl.speed,
            ease: 'none',
          },
          0
        );
      });
      immediate.push(crawl); // masked out until its line draws, so it can run early
    }

    if (immediate.length) tl.__loopNow = multiLoop(immediate);

    var loops = [];

    // The glow wave. Moving the plates re-runs the blur every frame; moving the
    // filtered group as one lets the browser reuse the blurred result. Same
    // motion, different cost — see CONFIG.glowDrift.mode.
    //
    // Each plate gets its OWN timeline rather than one staggered tween, because
    // organic means they must never line back up: the periods are deliberately
    // non-multiples and each one starts part-way through its own cycle. Sideways
    // travel alternates and scale breathes against it, so the glow wanders and
    // swells inside the well instead of sliding up and down as a block.
    var gd = k.glowDrift;
    if (gd.mode === 'shapes' && glow.length) {
      glow.forEach(function (shape, i) {
        gsap.set(shape, { transformOrigin: 'center center' });
        var swing = i % 2 ? 1 : -1; // neighbours lean opposite ways
        var wobble = 1 + (i % 3) * 0.17; // 3 periods that never resolve to a beat
        var span = gd.duration * wobble;

        // fromTo, not to: seeding the phase below RENDERS this timeline at build
        // time, and a .to() would record whatever the plate's y is at that
        // moment — which is the entrance's start offset, 30 units down. The loop
        // would then haul the whole stack back up the first time it played.
        var t = gsap.timeline({ paused: true, repeat: -1, yoyo: true }).fromTo(
          shape,
          { x: 0, y: 0, scale: 1 },
          {
            y: -gd.y * d * (0.7 + (i % 4) * 0.15),
            x: gd.x * d * swing * (0.6 + (i % 3) * 0.25),
            scale: 1 + gd.scale * (i % 2 ? 1 : -1),
            duration: span,
            ease: gd.ease,
          }
        );
        t.progress(((i * gd.stagger) % span) / span); // start part-way through
        loops.push(t);
      });
    } else if (gd.mode === 'group' && glowGroup) {
      gsap.set(glowGroup, { transformOrigin: 'center center' });
      loops.push(
        gsap.timeline({ paused: true, repeat: -1, yoyo: true }).to(glowGroup, {
          y: -gd.y * d,
          x: gd.x * d * 0.5,
          scale: 1 + gd.scale,
          duration: gd.duration,
          ease: gd.ease,
        })
      );
    }

    // Clamped like the entrance — the back card has no headroom to float into.
    if (k.cardFloat.enabled && cards.length) {
      var float = gsap.timeline({ paused: true, repeat: -1, yoyo: true });
      cards.forEach(function (card, i) {
        var rise = Math.min(Math.abs(k.cardFloat.y * d), headroom(card));
        if (!rise) return;
        float.to(
          card,
          { y: -rise, duration: k.cardFloat.duration, ease: k.cardFloat.ease },
          i * k.cardFloat.stagger
        );
      });
      if (float.duration()) loops.push(float);
    }

    if (k.appFloat.enabled && apps.length) {
      loops.push(
        gsap.timeline({ paused: true, repeat: -1, yoyo: true }).to(apps, {
          y: k.appFloat.y * d,
          duration: k.appFloat.duration,
          ease: k.appFloat.ease,
          stagger: k.appFloat.stagger,
        })
      );
    }

    // waits for the reveal — a card bobbing before it has landed reads as a slip
    if (loops.length) tl.__loop = multiLoop(loops);

    return tl;
  };

  // ---------------------------------------------------------------------------
  // warehouse-models — sources feed rows
  // ---------------------------------------------------------------------------

  // Period of an authored dash pattern. Travelling exactly one period loops
  // seamlessly; an odd count repeats inverted, so it takes two passes.
  function dashPeriod(el, fallback) {
    var raw =
      el.getAttribute('stroke-dasharray') ||
      (el.parentNode && el.parentNode.getAttribute && el.parentNode.getAttribute('stroke-dasharray')) ||
      '';
    var dash = raw.split(/[\s,]+/).map(parseFloat).filter(function (n) { return !isNaN(n); });
    var period = dash.reduce(function (t, n) { return t + n; }, 0) || fallback || 8;
    if (dash.length % 2) period *= 2;
    return period;
  }

  // Where a point sits along a path, as a 0..1 fraction of its length. Figma
  // parks each packet somewhere on its line; that position IS the packet's phase,
  // so moving the dots in the artwork re-times the flow with no code change.
  function phaseOf(path, len, x, y) {
    var best = 0, bestD = Infinity;
    for (var i = 0; i <= 240; i++) {
      var p = path.getPointAtLength((i / 240) * len);
      var dd = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y);
      if (dd < bestD) { bestD = dd; best = i / 240; }
    }
    return best;
  }

  BUILD['warehouse-models'] = function (root, d) {
    var k = CONFIG['warehouse-models'];
    var tl = gsap.timeline({ paused: true });

    var panel = one(root, 'main-bg');
    if (!panel) return tl;

    var rings = matching(root, /^\d+$/); // the radar circles are named by their radius
    var head = one(root, 'head');
    var label = one(root, 'label');
    var appDots = matching(root, /^app-dot(_\d+)?$/);
    var hl = k.highlight;
    var idle = hl.rowIdle;

    // matchMedia reverts tweens but knows nothing about injected nodes, so every
    // breakpoint cross would otherwise stack another set of wipe masks.
    var stale = root.querySelectorAll('[data-agents-wipe]');
    for (var s = 0; s < stale.length; s++) stale[s].parentNode.removeChild(stale[s]);

    // ── the rows ────────────────────────────────────────────────────────────
    // Each row-wrap holds the row plus the two dashed brackets carrying it up to
    // the head. Dimming the wrap moves row and brackets together, which is what
    // makes "this one is lit" read at card size.
    var rows = matching(root, /^row-wrap(_\d+)?$/).map(function (wrap) {
      var group = null, brackets = [];
      for (var i = 0; i < wrap.children.length; i++) {
        var kid = wrap.children[i];
        if (kid.tagName === 'path') brackets.push(kid);
        else if (kid.tagName === 'g' && !group) group = kid;
      }
      var dots = group
        ? [].slice.call(group.children).filter(function (c) { return c.tagName === 'circle'; })
        : [];
      return {
        wrap: wrap,
        brackets: brackets,
        dots: dots,
        key: null,
        dotFill: (dots[0] && dots[0].getAttribute('fill')) || '#8B95AA',
        stroke: (brackets[0] && brackets[0].getAttribute('stroke')) || '#8B95AA',
      };
    });

    // ── the sources ─────────────────────────────────────────────────────────
    var pc = panel.getBBox();
    var panelX = pc.x + pc.width / 2;
    var panelY = pc.y + pc.height / 2;

    var apps = matching(root, /-part$/)
      .map(function (part) {
        var line = part.querySelector('path');
        if (!line) return null;
        var len = line.getTotalLength();
        if (!len) return null;

        // travel toward the panel, whichever way Figma drew the path
        var a = line.getPointAtLength(0);
        var b = line.getPointAtLength(len);
        var da = Math.pow(a.x - panelX, 2) + Math.pow(a.y - panelY, 2);
        var db = Math.pow(b.x - panelX, 2) + Math.pow(b.y - panelY, 2);
        var forward = db < da;

        var dots = [].slice
          .call(part.children)
          .filter(function (c) { return c.tagName === 'circle'; })
          .map(function (node) {
            var cx = parseFloat(node.getAttribute('cx')) || 0;
            var cy = parseFloat(node.getAttribute('cy')) || 0;
            var t = phaseOf(line, len, cx, cy);
            return { node: node, cx: cx, cy: cy, phase: forward ? t : 1 - t };
          })
          .sort(function (x, y) { return x.phase - y.phase; });

        // re-base the phases so the first packet always launches at 0
        var first = dots.length ? dots[0].phase : 0;
        dots.forEach(function (m) { m.phase -= first; });

        // which side of the panel this source arrives on — picks the row dot
        // that flips first
        var endPt = line.getPointAtLength(forward ? len : 0);

        return {
          key: (part.getAttribute('data-anim') || '').replace(/-part$/, ''),
          icon: part.querySelector('g'),
          endX: endPt.x,
          line: line,
          len: len,
          forward: forward,
          period: dashPeriod(line, 4.5),
          dots: dots,
          row: null,
          place: function (m, t) {
            var p = line.getPointAtLength((forward ? t : 1 - t) * len);
            gsap.set(m.node, { x: p.x - m.cx, y: p.y - m.cy });
          },
        };
      })
      .filter(Boolean);

    // Rows are paired to sources on the logo layer each carries — the row holds
    // `lattice_symbol.svg`, the source the same artwork as `lattice_symbol.svg_2`.
    // Matching on the name rather than on position survives Figma reordering the
    // rows, which is the one thing a re-export reliably does.
    rows.forEach(function (r) {
      var names = [].slice.call(r.wrap.querySelectorAll('[data-anim]')).map(function (el) {
        return (el.getAttribute('data-anim') || '').toLowerCase();
      });
      for (var i = 0; i < apps.length; i++) {
        if (apps[i].row) continue;
        var key = apps[i].key.toLowerCase();
        var hit = names.some(function (n) { return n.indexOf(key) === 0; });
        if (hit) { apps[i].row = r; r.key = apps[i].key; return; }
      }
    });

    // Nathan's frame ships a Slack source with no Slack row and a Carta row with
    // no source. Pair the leftovers off in order so every line still lands
    // somewhere; flow.pairFallback false leaves Slack firing at no row at all.
    if (k.flow.pairFallback) {
      var free = rows.filter(function (r) { return !r.key; });
      apps.forEach(function (a) {
        if (a.row || !free.length) return;
        a.row = free.shift();
        a.row.key = a.key;
      });
    }

    // ── entrance ────────────────────────────────────────────────────────────
    if (rings.length) {
      gsap.set(rings, { transformOrigin: 'center center' });
      step(tl, rings, k.rings, d);
    }

    gsap.set(panel, { transformOrigin: 'center center' });
    step(tl, panel, k.panel, d);
    if (head) step(tl, head, k.head, d);

    // Figma authored the rows bottom-up; 'top' plays them in reading order.
    var ordered = rows.slice().sort(function (x, y) {
      return x.wrap.getBBox().y - y.wrap.getBBox().y;
    });
    if (k.rows.order === 'bottom') ordered.reverse();
    if (idle < 1) {
      gsap.set(rows.map(function (r) { return r.wrap; }), { opacity: idle });
      // reduced motion never runs the flow, so nothing would ever lift these
      // back out of the dim — see wire()
      rows.forEach(function (r) { r.wrap.setAttribute('data-flow-idle', ''); });
    }
    step(tl, ordered.map(function (r) { return r.wrap; }), k.rows, d);

    if (label) {
      gsap.set(label, { transformOrigin: 'center center' });
      step(tl, label, k.label, d);
    }

    var icons = apps.map(function (a) { return a.icon; }).filter(Boolean);
    if (icons.length) gsap.set(icons, { transformOrigin: 'center center' });
    step(tl, icons.concat(appDots), k.sources, d);

    apps.forEach(function (a, i) {
      var wipe = makeWipe(root, a.line, a.len, a.forward, k.lines.wipeWidth);
      wipe.path.removeAttribute('opacity');
      a.line.setAttribute('mask', 'url(#' + wipe.id + ')');
      tl.to(
        wipe.path,
        { strokeDashoffset: 0, duration: k.lines.duration, ease: k.lines.ease },
        k.lines.at + i * k.lines.stagger
      );
    });

    // ── resting state ───────────────────────────────────────────────────────
    var movers = [];
    apps.forEach(function (a) { a.dots.forEach(function (m) { movers.push(m.node); }); });
    if (k.flow.enabled && movers.length) {
      gsap.set(movers, { autoAlpha: 0, transformOrigin: 'center center' });
      // reduced-motion holds the end frame with every loop killed, so the packets
      // have to be put back — see wire()
      movers.forEach(function (n) { n.setAttribute('data-flow-hidden', ''); });
    }
    // ── ambient ─────────────────────────────────────────────────────────────
    var immediate = [];

    if (k.crawl.enabled && apps.length) {
      var crawl = gsap.timeline({ paused: true, repeat: -1 });
      apps.forEach(function (a) {
        // increasing the offset walks the pattern back toward the path's start,
        // so the sign that runs it toward the panel depends on how Figma drew it
        gsap.set(a.line, { strokeDashoffset: 0 });
        crawl.to(
          a.line,
          {
            strokeDashoffset: a.forward ? -a.period : a.period,
            duration: a.period / k.crawl.speed,
            ease: 'none',
          },
          0
        );
      });
      immediate.push(crawl); // masked out until its line draws, so it can run early
    }

    if (hl.bracketCrawl) {
      var bcrawl = gsap.timeline({ paused: true, repeat: -1 });
      var any = false;
      rows.forEach(function (r) {
        r.brackets.forEach(function (p) {
          // authored from the row endpoint outward and up, so negative runs it
          // toward the head — the direction the row's data is going
          var per = dashPeriod(p, 8);
          gsap.set(p, { strokeDashoffset: 0 });
          bcrawl.to(p, { strokeDashoffset: -per, duration: per / hl.crawlSpeed, ease: 'none' }, 0);
          any = true;
        });
      });
      if (any) immediate.push(bcrawl);
    }

    if (immediate.length) tl.__loopNow = multiLoop(immediate);

    // The packet flow: one source at a time. The row lights as the packets LEAVE
    // the source rather than when they land, so the dot and the row it belongs to
    // are lit together — that pairing is the whole illustration.
    var loops = [];
    var f = k.flow;
    if (f.enabled && apps.length) {
      var order = apps;
      if (f.order && f.order.length) {
        var named = f.order
          .map(function (key) {
            return apps.filter(function (a) { return a.key === key; })[0];
          })
          .filter(Boolean);
        // anything the list forgot still gets a turn, after the named ones
        order = named.concat(apps.filter(function (a) { return named.indexOf(a) < 0; }));
      }

      // An eased packet is visually there long before its tween ends — with the
      // house ease it covers the last 3% in the final quarter of the travel. Ask
      // the ease itself where that is, so the flare-out and the row's endpoint
      // dots fire when the packet LOOKS like it landed rather than when the timer
      // says so. Works for whatever ease gets typed into the TUNE panel.
      var landAt = 1;
      var easeFn = gsap.parseEase(f.ease);
      if (easeFn) {
        for (var q = 0; q <= 1; q += 0.005) {
          if (easeFn(q) >= 0.97) { landAt = q; break; }
        }
      }
      var reach = f.travel * landAt;

      var cycle = gsap.timeline({ paused: true, repeat: -1 });
      var cursor = 0;

      order.forEach(function (a) {
        var last = cursor;

        // 1 · the row wakes as the packets leave — fast and springy
        if (a.row) {
          cycle.to(
            a.row.wrap,
            { opacity: 1, duration: hl.inDuration, ease: hl.inEase },
            cursor
          );
          if (a.row.brackets.length) {
            cycle.to(
              a.row.brackets,
              { stroke: hl.bracketColor, duration: hl.inDuration, ease: hl.inEase },
              cursor + hl.bracketLag
            );
          }
        }

        // 2 · the packets cross
        a.dots.forEach(function (m) {
          var at = cursor + m.phase * f.spread * f.travel;
          var proxy = { t: 0 };
          cycle.fromTo(
            proxy,
            { t: 0 },
            {
              t: 1,
              duration: f.travel,
              ease: f.ease || 'none',
              onUpdate: function () { a.place(m, proxy.t); },
            },
            at
          );
          cycle.fromTo(
            m.node,
            { autoAlpha: 0, scale: 0.2 },
            { autoAlpha: 1, scale: f.dotScale, duration: f.fade, ease: f.launchEase },
            at
          );
          // it flares out as it meets the panel edge rather than just stopping
          cycle.to(
            m.node,
            { autoAlpha: 0, scale: f.landScale, duration: f.fade * 1.5, ease: f.landEase },
            at + reach - f.fade * 0.4
          );
          last = Math.max(last, at + reach);
        });

        // 3 · the row's endpoint dots take the colour on ARRIVAL, near side first.
        //     Colour only — see CONFIG. The lead between the two is what makes the
        //     panel read as receiving something rather than switching state.
        var arrival = cursor + reach;
        if (a.row && a.row.dots.length) {
          var pair = a.row.dots.slice();
          if (pair.length > 1) {
            pair.sort(function (p, q) {
              return (
                Math.abs((parseFloat(p.getAttribute('cx')) || 0) - a.endX) -
                Math.abs((parseFloat(q.getAttribute('cx')) || 0) - a.endX)
              );
            });
          }
          pair.forEach(function (dot, i) {
            var v = { fill: hl.dotColor, duration: hl.dotDuration, ease: hl.inEase };
            if (dot.getAttribute('stroke')) v.stroke = hl.dotColor;
            cycle.to(dot, v, arrival + i * hl.dotLead);
          });
        }

        // 4 · release — slower and softer than the wake, so the cycle breathes
        var release = last + f.hold;
        if (a.row) {
          cycle.to(
            a.row.wrap,
            { opacity: idle, duration: hl.outDuration, ease: hl.outEase },
            release
          );
          a.row.dots.forEach(function (dot) {
            var v = { fill: a.row.dotFill, duration: hl.outDuration, ease: hl.outEase };
            if (dot.getAttribute('stroke')) v.stroke = a.row.dotFill;
            cycle.to(dot, v, release);
          });
          if (a.row.brackets.length) {
            cycle.to(
              a.row.brackets,
              { stroke: a.row.stroke, duration: hl.outDuration, ease: hl.outEase },
              release
            );
          }
        }
        cursor = release + hl.outDuration + f.gap;
      });

      // GSAP trims a timeline to its last tween, which would eat the final gap
      // and make the cycle snap straight back to source one
      cycle.to({ pad: 0 }, { pad: 1, duration: 0.001 }, cursor);
      loops.push(cycle);
    }

    // waits for the reveal — packets arriving at rows that have not landed yet
    // would read as a slip
    if (loops.length) tl.__loop = multiLoop(loops);

    return tl;
  };

  // ---------------------------------------------------------------------------
  // profile-match — a rotating deck of app cards feeding one profile
  // ---------------------------------------------------------------------------

  function merge(a, b) {
    var out = {};
    for (var k1 in a) out[k1] = a[k1];
    for (var k2 in b) out[k2] = b[k2];
    return out;
  }

  BUILD['profile-match'] = function (root, d) {
    var k = CONFIG['profile-match'];
    var tl = gsap.timeline({ paused: true });

    var profile = one(root, 'human-intelligence-card');
    if (!profile) return tl;

    var hl = k.highlight;
    var rings = matching(root, /^\d+$/);

    // matchMedia reverts tweens but knows nothing about injected nodes, so every
    // breakpoint cross would otherwise stack another set of wipe masks.
    var stale = root.querySelectorAll('[data-agents-wipe]');
    for (var s = 0; s < stale.length; s++) stale[s].parentNode.removeChild(stale[s]);

    // ── the profile rows ────────────────────────────────────────────────────
    // A row is a direct child holding an Icon group and a Description path.
    // Matched on shape, not name: Figma left these as `Frame 2147223916` /
    // `Frame 2147223915` / … and renumbers them on every export, and the header
    // falls out on its own because it has neither.
    var kids = [].slice.call(profile.children).filter(function (n) { return n.tagName === 'g'; });
    var rows = kids.filter(function (g) {
      var icon = false, text = false;
      for (var i = 0; i < g.children.length; i++) {
        var n = g.children[i].getAttribute('data-anim') || '';
        if (g.children[i].tagName === 'g' && /^Icon/.test(n)) icon = true;
        else if (g.children[i].tagName === 'path' && /^Description/.test(n)) text = true;
      }
      return icon && text;
    });
    var header = kids.filter(function (g) { return rows.indexOf(g) < 0; });

    // the trailing label only exists on the row Nathan drew lit, so it belongs to
    // that row's active state rather than to the row itself
    function paint(row) {
      return [].slice.call(row.querySelectorAll('path')).filter(function (p) {
        return !/^secondary/.test(p.getAttribute('data-anim') || '');
      });
    }
    function trailing(row) {
      return [].slice.call(row.querySelectorAll('[data-anim^="secondary"]'));
    }

    // The accent is READ OFF the artwork — whichever row Figma left lit is the
    // odd fill out — so a palette change in Figma carries with no config edit.
    var fills = rows
      .map(function (r) {
        var t = r.querySelector('[data-anim^="Description"]');
        return t && t.getAttribute('fill');
      })
      .filter(Boolean);
    var tally = {};
    fills.forEach(function (f) { tally[f] = (tally[f] || 0) + 1; });
    var idleFill = Object.keys(tally).sort(function (a, b) { return tally[b] - tally[a]; })[0] || '#333342';
    var accent = fills.filter(function (f) { return f !== idleFill; })[0] || hl.accent;

    // ── the deck ────────────────────────────────────────────────────────────
    // The stack fakes depth with three different card WIDTHS, so a card cannot
    // simply be translated into the next slot — its shell has to resize while its
    // contents only slide. The shell rects animate their own attributes; every-
    // thing else rides a transform. Left padding is constant across the artwork,
    // so the content offset is just the slot delta.
    var deck = matching(root, /^app-card(_\d+)?$/)
      .map(function (el) {
        var rects = [], content = [];
        for (var i = 0; i < el.children.length; i++) {
          (el.children[i].tagName === 'rect' ? rects : content).push(el.children[i]);
        }
        if (!rects.length) return null;
        var r = rects[0];
        return {
          el: el,
          rects: rects,
          content: content,
          home: {
            x: parseFloat(r.getAttribute('x')) || 0,
            y: parseFloat(r.getAttribute('y')) || 0,
            w: parseFloat(r.getAttribute('width')) || 0,
          },
        };
      })
      .filter(Boolean);

    // slot 0 is the back of the stack, slot n-1 the front — the featured one
    var slots = deck
      .map(function (c) { return { x: c.home.x, y: c.home.y, w: c.home.w }; })
      .sort(function (a, b) { return a.y - b.y; });
    var n = slots.length;
    var homeSlot = deck.map(function (c) {
      for (var i = 0; i < n; i++) if (Math.abs(slots[i].y - c.home.y) < 1) return i;
      return 0;
    });

    function moveTo(tlx, c, slot, vars, at) {
      tlx.to(c.rects, merge({ attr: { x: slot.x, y: slot.y, width: slot.w } }, vars), at);
      if (c.content.length) {
        tlx.to(c.content, merge({ x: slot.x - c.home.x, y: slot.y - c.home.y }, vars), at);
      }
    }
    // A stack fakes depth with paint order as much as with size, so rotating the
    // cards has to rotate the z-order too or the card that just receded keeps
    // drawing over the one in front of it. Re-derived from the target slots on
    // every pass rather than nudged one step at a time, so it is self-correcting.
    // The anchor is whatever follows the deck in the artwork — the profile card is
    // a later sibling and must stay on top of all of them.
    var deckParent = deck.length ? deck[0].el.parentNode : null;
    var deckAnchor = deck.length ? deck[deck.length - 1].el.nextSibling : null;
    function restack(targets) {
      if (!deckParent) return;
      targets
        .slice()
        .sort(function (a, b) { return a.to - b.to; })
        .forEach(function (o) { deckParent.insertBefore(o.el, deckAnchor); });
    }

    function jumpTo(tlx, c, slot, at) {
      tlx.set(c.rects, { attr: { x: slot.x, y: slot.y, width: slot.w } }, at);
      if (c.content.length) {
        tlx.set(c.content, { x: slot.x - c.home.x, y: slot.y - c.home.y }, at);
      }
    }

    // ── the conduits ────────────────────────────────────────────────────────
    var pc = profile.getBBox();
    var profileY = pc.y + pc.height / 2;

    var lines = matching(root, /^moving-part(_\d+)?$/)
      .map(function (part) {
        var path = part.querySelector('path');
        if (!path) return null;
        var len = path.getTotalLength();
        if (!len) return null;

        // travel toward the profile, whichever way Figma drew the path
        var a = path.getPointAtLength(0);
        var b = path.getPointAtLength(len);
        var forward = Math.abs(b.y - profileY) < Math.abs(a.y - profileY);

        var dots = [].slice
          .call(part.children)
          .filter(function (c) { return c.tagName === 'circle'; })
          .map(function (node) {
            var cx = parseFloat(node.getAttribute('cx')) || 0;
            var cy = parseFloat(node.getAttribute('cy')) || 0;
            var t = phaseOf(path, len, cx, cy);
            return { node: node, cx: cx, cy: cy, phase: forward ? t : 1 - t };
          });

        return {
          path: path,
          len: len,
          forward: forward,
          period: dashPeriod(path, 4.5),
          dots: dots,
          minPhase: dots.reduce(function (m, x) { return Math.min(m, x.phase); }, 1),
          place: function (m, t) {
            var p = path.getPointAtLength((forward ? t : 1 - t) * len);
            gsap.set(m.node, { x: p.x - m.cx, y: p.y - m.cy });
          },
        };
      })
      .filter(Boolean);

    // Phases are re-based across ALL conduits, not per conduit: the wave should
    // keep the relative offsets Figma drew between the three lines and simply
    // start when the card lands.
    var firstPhase = lines.reduce(function (m, l) { return Math.min(m, l.minPhase); }, 1);
    lines.forEach(function (l) {
      l.dots.forEach(function (m) { m.phase -= firstPhase; });
    });

    // ── entrance ────────────────────────────────────────────────────────────
    if (rings.length) {
      gsap.set(rings, { transformOrigin: 'center center' });
      step(tl, rings, k.rings, d);
    }

    var shell = [].slice.call(profile.children).filter(function (nd) { return nd.tagName === 'rect'; });
    gsap.set(shell.concat(header), { transformOrigin: 'center center' });
    step(tl, shell.concat(header), k.profile, d);
    step(tl, rows, k.rows, d);

    // back to front, so the featured card is the last thing to land
    var byDepthCards = deck
      .slice()
      .sort(function (a, b) { return a.home.y - b.home.y; })
      .map(function (c) { return c.el; });
    gsap.set(byDepthCards, { transformOrigin: 'center center' });
    step(tl, byDepthCards, k.cards, d);

    lines.forEach(function (l, i) {
      var wipe = makeWipe(root, l.path, l.len, l.forward, k.lines.wipeWidth);
      wipe.path.removeAttribute('opacity');
      l.path.setAttribute('mask', 'url(#' + wipe.id + ')');
      tl.to(
        wipe.path,
        { strokeDashoffset: 0, duration: k.lines.duration, ease: k.lines.ease },
        k.lines.at + i * k.lines.stagger
      );
    });

    // The "in sync" label exists on exactly one row in the artwork, but it
    // belongs to the ACTIVE state rather than to that row. Lift it out onto the
    // card itself and move it to whichever row is lit — the row pitch comes from
    // the artwork, so a fifth row needs no code change.
    var rowY = rows.map(function (r) { return r.getBBox().y; });
    var badge = [];
    var badgeHomeY = 0;
    for (var bi = 0; bi < rows.length; bi++) {
      var found = trailing(rows[bi]);
      if (!found.length) continue;
      badge = found;
      badgeHomeY = rowY[bi];
      break;
    }
    // appendChild is idempotent, so a matchMedia rebuild cannot stack copies
    badge.forEach(function (el) { profile.appendChild(el); });

    // ── resting state ───────────────────────────────────────────────────────
    // Every row idle, the artwork's own lit row tagged so reduced motion can put
    // it back — with no deck running, nothing would ever light it again.
    rows.forEach(function (r) {
      var lit = paint(r).filter(function (p) { return p.getAttribute('fill') === accent; }).length > 0;
      gsap.set(paint(r), { fill: idleFill });
      var extra = trailing(r);
      if (extra.length) gsap.set(extra, { autoAlpha: 0 });
      if (!lit) return;
      paint(r).forEach(function (p) { p.setAttribute('data-lit-default', accent); });
      extra.forEach(function (p) { p.setAttribute('data-lit-default', ''); });
    });

    // ── ambient ─────────────────────────────────────────────────────────────
    var immediate = [];

    if (k.crawl.enabled && lines.length) {
      var crawl = gsap.timeline({ paused: true, repeat: -1 });
      lines.forEach(function (l) {
        // increasing the offset walks the pattern back toward the path's start,
        // so the sign that runs it toward the profile depends on how Figma drew it
        gsap.set(l.path, { strokeDashoffset: 0 });
        crawl.to(
          l.path,
          {
            strokeDashoffset: l.forward ? -l.period : l.period,
            duration: l.period / k.crawl.speed,
            ease: 'none',
          },
          0
        );
      });
      immediate.push(crawl); // masked out until its line draws, so it can run early
    }

    if (immediate.length) tl.__loopNow = multiLoop(immediate);

    // Packets wait at the top of their conduit — out of sight under the deck —
    // until the card that owns them reaches the front. Both ends of the travel
    // are under a card, so they emerge and vanish without needing a mask.
    var f = k.flow;
    var packets = [];
    lines.forEach(function (l) {
      l.dots.forEach(function (m) { packets.push(m.node); l.place(m, 0); });
    });
    if (f.enabled && packets.length) gsap.set(packets, { autoAlpha: 0 });

    // An eased packet is visually there before its tween ends — ask the ease
    // itself where, so the fade-out fires when it LOOKS like it landed.
    var landAt = 1;
    var packetEase = gsap.parseEase(f.ease);
    if (packetEase) {
      for (var q = 0; q <= 1; q += 0.005) {
        if (packetEase(q) >= 0.97) { landAt = q; break; }
      }
    }
    var reach = f.travel * landAt;

    // ── the deck cycle ──────────────────────────────────────────────────────
    var loops = [];
    if (k.deck.enabled && n > 1) {
      var dk = k.deck;
      var mv = dk.moveDuration;

      // Which profile row a card lights. Positional on purpose — the client will
      // hand us a list, and a list of row numbers is the most editable thing this
      // can be. Anything the list forgets falls back to cycling the rows so a new
      // card is never silently inert.
      function rowFor(cardIndex) {
        if (!rows.length) return -1;
        var v = (dk.rows || [])[cardIndex];
        if (v == null) v = (cardIndex % rows.length) + 1;
        return Math.max(0, Math.min(rows.length - 1, Math.round(v) - 1));
      }

      // One wave of packets per dwell, launched by the card that just arrived.
      // The row lights as they LEAVE and the badge lands as they ARRIVE, so the
      // sequence reads as this card pushing its data down into that row.
      function wave(when) {
        if (!f.enabled) return;
        lines.forEach(function (l) {
          l.dots.forEach(function (m) {
            var lat = when + m.phase * f.spread * f.travel;
            var proxy = { t: 0 };
            cycle.fromTo(
              proxy,
              { t: 0 },
              {
                t: 1,
                duration: f.travel,
                ease: f.ease || 'none',
                onUpdate: function () { l.place(m, proxy.t); },
              },
              lat
            );
            cycle.fromTo(m.node, { autoAlpha: 0 }, { autoAlpha: 1, duration: f.fade }, lat);
            cycle.to(m.node, { autoAlpha: 0, duration: f.fade }, lat + reach - f.fade * 0.5);
          });
        });
      }

      var cycle = gsap.timeline({ paused: true, repeat: -1 });

      // Each segment is a dwell followed by an advance, so the advance for pass p
      // lands exactly on the segment boundary. The card the entrance left at the
      // front is therefore lit from the first frame rather than being rotated away
      // before it has had its turn.
      for (var pass = 1; pass <= n; pass++) {
        var at = pass * dk.step - mv;

        // paint order follows the slots, applied while the wrapping card is out
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
            // leaving the front: carry on forward and fade, then drop back in at
            // the rear of the stack rather than sliding back through it
            moveTo(
              cycle, card,
              { x: slots[n - 1].x, y: slots[n - 1].y + dk.lift, w: slots[n - 1].w },
              { autoAlpha: 0, duration: mv * 0.45, ease: dk.ease },
              at
            );
            jumpTo(cycle, card, { x: slots[to].x, y: slots[to].y - dk.lift, w: slots[to].w }, at + mv * 0.5);
            moveTo(cycle, card, slots[to], { autoAlpha: 1, duration: mv * 0.5, ease: dk.ease }, at + mv * 0.5);
          } else {
            moveTo(cycle, card, slots[to], { duration: mv, ease: dk.ease }, at);
          }

          // the card arriving at the front is the one that owns the next dwell
          if (to !== n - 1) continue;
          var ri = rowFor(c);
          if (ri < 0) continue;
          var lit = rows[ri];

          var on = at + mv * 0.55;
          cycle.to(paint(lit), { fill: accent, duration: hl.inDuration, ease: hl.inEase }, on);

          // The last pass brings the deck home, so the dwell it opens is the same
          // one the opener owns. Its highlight still has to fire (nothing else
          // relights that row before the seam) but its wave and badge would be a
          // second copy that runs past the end of the cycle and breaks the beat.
          if (pass !== n) {
            wave(on);
            if (badge.length) {
              // repositioned while it is still invisible, then landed with the wave
              cycle.set(badge, { y: rowY[ri] - badgeHomeY }, on);
              cycle.to(badge, { autoAlpha: 1, duration: hl.inDuration, ease: hl.inEase }, on + reach);
            }
          }

          // released as the stack starts to move again, not before — the pause
          // with nothing lit is what separates one card's turn from the next.
          // The last pass brings the deck home, so its highlight is the one that
          // carries across the loop boundary and must NOT be released here.
          if (pass === n) continue;
          var off = at + dk.step;
          cycle.to(paint(lit), { fill: idleFill, duration: hl.outDuration, ease: hl.outEase }, off);
          if (badge.length) {
            cycle.to(badge, { autoAlpha: 0, duration: hl.outDuration, ease: hl.outEase }, off);
          }
        }
      }

      // The card sitting at the front when the reveal ends opens the cycle. On
      // repeat the last pass has already lit it, so this tween is a no-op rather
      // than a second flash.
      var opener = homeSlot.indexOf(n - 1);
      var fi = opener < 0 ? -1 : rowFor(opener);
      if (fi >= 0) {
        var first = rows[fi];
        cycle.to(paint(first), { fill: accent, duration: hl.inDuration, ease: hl.inEase }, 0);
        wave(0);
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

      // GSAP trims a timeline to its last tween, which would eat the final dwell
      // and make the deck snap straight back to the first card
      cycle.to({ pad: 0 }, { pad: 1, duration: 0.001 }, n * dk.step);
      loops.push(cycle);
    }

    // waits for the reveal — the deck rotating before it has landed reads as a slip
    if (loops.length) tl.__loop = multiLoop(loops);

    return tl;
  };

  // ===========================================================================
  // boot
  // ===========================================================================

  var triggers = [];
  var timelines = {};
  var mm = null;

  // Marks a mount as having its start state applied, so CSS can keep it hidden
  // until then. The artwork is inlined in the markup, so between first paint and
  // this script running the browser shows the illustration fully assembled — and
  // then the entrance yanks it back to its start. Measured at ~400 ms / 49 frames
  // on a warm connection. Below the fold nobody sees it; in a hero it is the
  // first thing they see. Only mounts whose CSS opts in are affected — see
  // webflow/warehouse-hero.html, which also carries a failsafe so a bundle that
  // never arrives still reveals the artwork instead of leaving a blank slot.
  function ready(mount) {
    mount.setAttribute('data-hi-ready', '');
  }

  function wire(mount, name, portrait, reduced) {
    var build = BUILD[name];
    // A mount may hold both the desktop and the ≤767 artwork with CSS swapping
    // them. Wire the one actually on screen: getBBox on a display:none SVG
    // returns zeros, which would silently flatten every centre-out delay to 0.
    var all = mount.querySelectorAll('svg');
    var svg = null;
    for (var i = 0; i < all.length; i++) {
      if (all[i].getClientRects().length) { svg = all[i]; break; }
    }
    if (!build || !svg) return;

    var g = CONFIG.global;

    if (reduced) {
      var still = build(svg, 0);
      still.eventCallback('onComplete', null); // never start an infinite loop
      still.progress(1);
      if (still.__loop) still.__loop.kill();
      if (still.__loopNow) still.__loopNow.kill();
      // The shield ripple hides the real outlines and replaces them with waves.
      // With no waves running, put the artwork back rather than leaving it bare.
      svg.querySelectorAll('[data-ripple]').forEach(function (el) { el.remove(); });
      // warehouse-models parks its travelling packets at autoAlpha 0 for the same
      // reason — with no flow running, put them back where Figma drew them.
      svg.querySelectorAll('[data-ripple-hidden],[data-flow-hidden],[data-flow-idle]').forEach(function (el) {
        gsap.set(el, { autoAlpha: 1 });
      });
      // profile-match idles every row and drives the accent from the deck, so with
      // no deck running the row Figma drew lit has to be repainted by hand.
      svg.querySelectorAll('[data-lit-default]').forEach(function (el) {
        var lit = el.getAttribute('data-lit-default');
        gsap.set(el, lit ? { fill: lit, autoAlpha: 1 } : { autoAlpha: 1 });
      });
      ready(mount);
      return;
    }

    // Build the timeline in full FIRST, attach ScrollTrigger after — these panels
    // sit high on the page, so onEnter fires on init and an empty timeline would
    // silently never play.
    var tl = build(svg, portrait ? g.portraitDistance : 1);
    tl.timeScale((CONFIG[name].timeScale || 1) * (portrait ? g.portraitTimeScale : 1));
    timelines[name] = tl;
    ready(mount); // the start state is applied — safe to show now

    var st = ScrollTrigger.create({
      trigger: mount,
      start: g.start,
      end: g.end,
      markers: g.markers,
      onEnter: function () {
        tl.play();
        if (tl.__loopNow) tl.__loopNow.play(); // background motion, no waiting
      },
      // ambient loops must not burn frames off-screen
      onToggle: function (self) {
        if (tl.__loopNow) self.isActive ? tl.__loopNow.play() : tl.__loopNow.pause();
        if (!tl.__loop) return;
        // this bucket waits for the reveal — starting it early would run the
        // ambient motion underneath the entrance
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
      if (timelines[n].__loopNow) timelines[n].__loopNow.kill();
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
      if (timelines[name].__loopNow) timelines[name].__loopNow.kill();
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
