import { SVG_PATTERNS } from './svgs';

/**
 * Pattern Animation — pulse-in reveal for SVG icon patterns, with post-reveal effects.
 *
 * Attrs:
 *   data-pattern="pulse"   → plays immediately on page load
 *   data-pattern="scroll"  → plays when SVG enters the viewport
 *
 * SVG structure expected:
 *   #base       group of base paths
 *   #highlight  group of highlight paths
 *
 * Post-reveal:
 *   - highlight paths: occasional scale pulse wave
 *   - base paths: subtle parallax shift following mouse position
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Force the root <svg> tag's width/height to 100% regardless of what's in the file. */
function normalizeSvgSize(svgString) {
  return svgString
    .replace(/(<svg\b[^>]*?)\s+width="[^"]*"/i, '$1 width="100%"')
    .replace(/(<svg\b[^>]*?)\s+height="[^"]*"/i, '$1 height="100%"');
}

// ─── Shared state ────────────────────────────────────────────────────────────
let platformVisible = false;
const pulseTls = [];

export function pausePatterns() {
  platformVisible = true;
  pulseTls.forEach((tl) => tl.pause());
}

export function resumePatterns() {
  platformVisible = false;
  pulseTls.forEach((tl) => tl.play());
}

// ─── Config ──────────────────────────────────────────────────────────────────
const DURATION = 1; // stagger spread per group (first path start → last path start)
const ANIM_DUR = 0.2; // per-path animation duration
const HIGHLIGHT_OVERLAP = 0.2; // highlight group starts this many seconds before base finishes

const PULSE_OPACITY = 0.5; // how far highlight paths scale up during pulse
const PULSE_SCALE = 0.9;
const PULSE_DURATION = 0.5; // duration of each pulse wave (up or down)
const PULSE_COL_STAGGER = 0.08; // delay between each column in the wave
const PULSE_REPEAT_DELAY = 2.5; // seconds between each pulse cycle

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sort paths by distance from the SVG's coordinate-space center (innermost first).
 */
function sortFromCenter(paths, svgEl) {
  const vb = svgEl.viewBox.baseVal;
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

/**
 * Group paths into vertical columns by clustering similar center-x values.
 * Auto-detects column spacing from the minimum x gap between any two distinct paths.
 * Returns an array of columns (each column is an array of paths), sorted left to right.
 */
function groupByColumns(paths) {
  if (!paths.length) return [];

  const items = [...paths]
    .map((p) => {
      const bb = p.getBBox();
      return { path: p, cx: bb.x + bb.width / 2 };
    })
    .sort((a, b) => a.cx - b.cx);

  // Find minimum non-trivial gap between consecutive x centers → column spacing
  const gaps = [];
  for (let i = 1; i < items.length; i++) {
    const g = items[i].cx - items[i - 1].cx;
    if (g > 0.1) gaps.push(g);
  }
  const tolerance = gaps.length ? Math.min(...gaps) * 0.6 : 1;

  // Cluster: new column when x drifts beyond tolerance from the column's first path
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

/**
 * Highlight paths: looping vertical-column wave (left → right), fires occasionally.
 */
function startHighlightPulse(highlightPaths, wrapperEl) {
  const columns = groupByColumns(highlightPaths);
  const tl = gsap.timeline({
    repeat: -1,
    repeatDelay: PULSE_REPEAT_DELAY,
    delay: PULSE_REPEAT_DELAY,
    paused: true,
  });

  columns.forEach((col, i) => {
    const t = i * PULSE_COL_STAGGER;
    tl.to(
      col,
      {
        opacity: PULSE_OPACITY,
        scale: PULSE_SCALE,
        transformOrigin: 'center center',
        duration: PULSE_DURATION,
        ease: 'sine.out',
      },
      t
    ).to(
      col,
      {
        opacity: 1,
        scale: 1,
        transformOrigin: 'center center',
        duration: PULSE_DURATION,
        ease: 'sine.in',
      },
      t + PULSE_DURATION
    );
  });

  pulseTls.push(tl);

  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !platformVisible) tl.play();
    else tl.pause();
  }).observe(wrapperEl);
}

/**
 * Build the pulse-in timeline for a wrapper containing base + highlight SVGs.
 * Queries paths from each SVG independently.
 */
function buildPulseIn(wrapperEl, { paused = false } = {}) {
  const baseSvg = wrapperEl.querySelector('[data-svg="base"]');
  const highlightSvg = wrapperEl.querySelector('[data-svg="highlight"]');
  if (!baseSvg || !highlightSvg) return;

  const basePaths = sortFromCenter(baseSvg.querySelectorAll('path'), baseSvg);
  const highlightPaths = sortFromCenter(highlightSvg.querySelectorAll('path'), highlightSvg);

  // Pre-hide all paths immediately so highlight paths don't flash visible
  // before their tween fires (fromTo at position > 0 has immediateRender: false)
  gsap.set([...basePaths, ...highlightPaths], {
    opacity: 0,
    scale: 0,
    transformOrigin: 'center center',
  });

  const staggerConfig = { amount: DURATION - ANIM_DUR, ease: 'sine.out' };
  const tl = gsap.timeline({ paused });
  const from = () => ({ opacity: 0, scale: 0, transformOrigin: 'center center' });
  const to = () => ({
    opacity: 1,
    scale: 1,
    duration: ANIM_DUR,
    ease: 'back.out(1.4)',
    stagger: staggerConfig,
  });

  tl.fromTo(basePaths, from(), to());
  tl.fromTo(highlightPaths, from(), to(), DURATION - HIGHLIGHT_OVERLAP);
  tl.call(() => {
    gsap.set([...basePaths, ...highlightPaths], { clearProps: 'all' });
    startHighlightPulse(highlightPaths, wrapperEl);
  });

  return tl;
}

/**
 * Build the reveal timeline for a wrapper containing base + apps SVGs.
 * Sequence:
 *   1. Base paths pulse in (center-out, same as buildPulseIn)
 *   2. App groups scale in with stagger
 *   3. Arrow draws in via clip-path top → bottom (matches arrow flow direction)
 */
function buildAppsIn(wrapperEl, { paused = false } = {}) {
  const baseSvg = wrapperEl.querySelector('[data-svg="base"]');
  const appsSvg = wrapperEl.querySelector('[data-svg="apps"]');
  if (!baseSvg || !appsSvg) return;

  const basePaths = sortFromCenter(baseSvg.querySelectorAll('path'), baseSvg);
  const appGroups = [...appsSvg.querySelectorAll('[id^="app"]')].filter(
    (el) => el.id !== 'app-flow'
  );
  const arrow = appsSvg.querySelector('#arrow');

  gsap.set(basePaths, { opacity: 0, scale: 0, transformOrigin: 'center center' });
  gsap.set(appGroups, { opacity: 0, scale: 0.85, transformOrigin: 'center center' });
  if (arrow) gsap.set(arrow, { clipPath: 'inset(0 0 100% 0)' });

  const staggerConfig = { amount: DURATION - ANIM_DUR, ease: 'sine.out' };
  const tl = gsap.timeline({ paused });

  // 1. Base reveal — center-out
  tl.fromTo(
    basePaths,
    { opacity: 0, scale: 0, transformOrigin: 'center center' },
    { opacity: 1, scale: 1, duration: ANIM_DUR, ease: 'back.out(1.4)', stagger: staggerConfig }
  );

  // 2. App groups scale in
  tl.to(
    appGroups,
    {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      stagger: 0.2,
      ease: 'back.out(1.4)',
      transformOrigin: 'center center',
    },
    DURATION - HIGHLIGHT_OVERLAP
  );

  // 3. Arrow clip-path reveal: top → bottom (source to tip)
  if (arrow) {
    tl.to(arrow, { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'power2.inOut' }, '>-0.1');
  }

  tl.call(() => {
    gsap.set(basePaths, { clearProps: 'all' });
    gsap.set(appGroups, { clearProps: 'all' });
    if (arrow) gsap.set(arrow, { clearProps: 'clipPath' });
  });

  return tl;
}

function initPulse(wrapperEl) {
  const builder = wrapperEl.querySelector('[data-svg="apps"]') ? buildAppsIn : buildPulseIn;
  builder(wrapperEl);
}

function initScroll(wrapperEl) {
  const builder = wrapperEl.querySelector('[data-svg="apps"]') ? buildAppsIn : buildPulseIn;
  const tl = builder(wrapperEl, { paused: true });

  ScrollTrigger.create({
    trigger: wrapperEl,
    start: 'top 80%',
    once: true,
    onEnter: () => tl.play(),
  });
}

export function runPattern() {
  if (window.innerWidth < 992) return;

  $('[data-pattern]').each(function () {
    const mode = $(this).data('pattern');
    const ccClass = [...this.classList].find((c) => c.startsWith('cc-'));

    // Inject two SVGs from JS registry
    if (ccClass) {
      const entry = SVG_PATTERNS[ccClass];
      if (!entry) {
        console.warn(`[pattern] No SVG found for key "${ccClass}"`);
        return;
      }
      const edgeMaskH = `linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)`;
      const edgeMaskV = `linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)`;
      const masks = [entry.mask?.replace(/;+$/, ''), edgeMaskH, edgeMaskV].filter(Boolean);
      const composites = Array(masks.length - 1)
        .fill('intersect')
        .join(', ');
      const maskStyle = `mask-image: ${masks.join(', ')}; mask-composite: ${composites || 'add'};`;

      const secondSvg = entry.apps
        ? `<svg data-svg="apps"       style="position:absolute;inset:0;width:100%;height:100%;z-index:2">${normalizeSvgSize(entry.apps)}</svg>`
        : `<svg data-svg="highlight"  style="position:absolute;inset:0;width:100%;height:100%;z-index:2">${normalizeSvgSize(entry.highlight)}</svg>`;

      $(this).html(`
        <svg data-svg="base" style="position:absolute;inset:0;width:100%;height:100%;z-index:1;${maskStyle}">${normalizeSvgSize(entry.base)}</svg>
        ${secondSvg}
      `);
    }

    if (mode === 'pulse') initPulse(this);
    else if (mode === 'scroll') initScroll(this);
  });
}
