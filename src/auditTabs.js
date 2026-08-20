/* eslint-disable no-undef */
/* HI — Audit logging tabs
 *
 * Webflow markup (attribute-free, matched on the classes Tom already has):
 *   .audit-logging-tabs-wrap
 *     .audit-logging-tabs-visuals          → holds the two inlined SVGs, in order
 *     .integrations-control_nav            → the same nav as the integrations card
 *       .integrations-control_nav-item     → .is-active marks the current one
 *         .integrations-control_nav-line > .integrations-control_nav-active
 *
 * Each built SVG carries its own name on the root group (data-anim="audit-logging-tab-1"),
 * so the panes identify themselves — no per-pane attribute to set in the Designer.
 * That name is copied onto the <svg> as data-hi-illustration, which is what
 * HIIllustrations wires and replays.
 *
 * Boot order does not matter: if the bundle already ran init(), replay() wires
 * the pane lazily on first activation.
 */

const CONFIG = {
  dwell: 5, // seconds a tab holds before advancing
  crossfade: 0.4,
  // The card must reach the middle band of the viewport before autoplay starts.
  // A margin rather than a threshold ratio: a ratio can never be satisfied by an
  // element taller than the viewport, which this is on mobile.
  viewMargin: '-15%',
  resumeAfterClick: true, // false = a click stops the carousel for good
};

// opts.replay   — the bundle's replayCardIllustration, passed in from index.js
// opts.entrance  — standalone fallback, used when no bundle timeline exists yet
export function initAuditTabs(scope, opts = {}) {
  const root = (scope || document).querySelector('.audit-logging-tabs-wrap');
  if (!root) return;

  // Barba re-inits on every navigation. Without this the previous rAF loop and
  // IntersectionObserver keep running forever against a detached tree.
  root.__auditTabs?.destroy();

  const visuals = root.querySelector('.audit-logging-tabs-visuals');
  const navItems = [...root.querySelectorAll('.integrations-control_nav-item')];
  if (!visuals || !navItems.length) return;

  const { gsap } = window;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // Panes name themselves off the root group Figma exported.
  const panes = [...visuals.querySelectorAll('svg')].map((svg) => {
    const named = svg.querySelector('[data-anim^="audit-logging-tab-"]');
    const name = named?.getAttribute('data-anim') || null;
    if (name) svg.setAttribute('data-hi-illustration', name);
    return { svg, name };
  });
  if (!panes.length) return;

  if (panes.length !== navItems.length) {
    console.warn(
      `[audit-tabs] ${panes.length} visual(s) vs ${navItems.length} nav item(s) — pairing by index.`
    );
  }

  // Stacking is CSS (display:grid on the visuals wrapper) so the container keeps
  // its height. This is only the fallback for a project missing that rule —
  // absolute positioning here would collapse the wrapper to nothing.
  if (getComputedStyle(visuals).display !== 'grid') {
    console.warn(
      '[audit-tabs] .audit-logging-tabs-visuals is not display:grid — see audit-tabs/styles.html'
    );
  }

  function setVis(el, on) {
    if (gsap) gsap.set(el, { autoAlpha: on ? 1 : 0 });
    else el.style.opacity = on ? 1 : 0;
  }
  panes.forEach((p, i) => setVis(p.svg, i === 0));

  // ── progress bars ─────────────────────────────────────────────────────────
  // The fill inside each nav line doubles as the dwell timer. rAF rather than a
  // tween, so pausing off-screen freezes it exactly where it was.
  const fills = navItems.map(
    (el) =>
      el.querySelector('.integrations-control_nav-active') ||
      el.querySelector('.integrations-control_nav-line')
  );
  fills.forEach((el) => {
    if (!el) return;
    el.style.transformOrigin = 'left center';
    el.style.transform = 'scaleX(0)';
    el.style.willChange = 'transform';
  });

  const paint = (index, p) =>
    fills.forEach((el, i) => {
      if (el) el.style.transform = 'scaleX(' + (i === index ? p : 0) + ')';
    });

  // ── activation ────────────────────────────────────────────────────────────
  let index = 0;

  function show(next, animate = true) {
    if (!panes[next]) return;
    const prev = panes[index];
    const pane = panes[next];
    index = next;

    navItems.forEach((el, i) => el.classList.toggle('is-active', i === next));

    if (prev && prev !== pane) {
      if (animate && gsap && !reduced)
        gsap.to(prev.svg, { autoAlpha: 0, duration: CONFIG.crossfade, overwrite: true });
      else setVis(prev.svg, false);
    }
    if (animate && gsap && !reduced)
      gsap.to(pane.svg, { autoAlpha: 1, duration: CONFIG.crossfade, overwrite: true });
    else setVis(pane.svg, true);

    play(pane);
  }

  // The entrance is replayed on activation, not played once on scroll: the panes
  // are only crossfaded, so a single scroll trigger fires every tab's entrance at
  // once and the later ones finish while nobody is looking.
  //
  // Three ways in, in order of preference: the bundle's replay passed by
  // index.js, the prototype's window API, and a self-contained fallback for the
  // standalone build (whose bundle predates these illustrations and has no
  // timeline to replay at all).
  function play(pane) {
    if (!pane.name) return;
    const api = window.HIIllustrations;
    if (opts.replay) {
      opts.replay(pane.name);
      return;
    }
    if (api?.replay) {
      api.replay(pane.name);
      if (api.timelines?.[pane.name]) return;
    }
    opts.entrance?.(pane.svg, pane.name);
  }

  // ── autoplay ──────────────────────────────────────────────────────────────
  let elapsed = 0;
  let started = false; // the first pane waits for the section, like every other illustration
  let last = 0;
  let running = false;
  let rafId = null;
  let observer = null;
  let stopped = reduced;

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const dt = last ? (now - last) / 1000 : 0;
    last = now;
    if (!running || stopped) return;

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
    if (!on) return;
    last = 0; // drop the gap spent off-screen instead of fast-forwarding
    if (!started) {
      started = true;
      show(0, false);
    }
    if (rafId == null) rafId = requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => setRunning(entries[0].isIntersecting), {
      rootMargin: CONFIG.viewMargin + ' 0px',
      threshold: 0,
    });
    observer.observe(root);
  } else {
    setRunning(true);
  }

  // ── nav ───────────────────────────────────────────────────────────────────
  navItems.forEach((el, i) => {
    if (!panes[i]) return;
    el.style.cursor = 'pointer';
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    const pick = () => {
      elapsed = 0;
      paint(i, 0);
      stopped = !CONFIG.resumeAfterClick;
      started = true;
      show(i, true);
    };
    el.addEventListener('click', pick);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        pick();
      }
    });
  });

  function destroy() {
    if (rafId != null) cancelAnimationFrame(rafId);
    rafId = null;
    observer?.disconnect();
    stopped = true;
    root.__auditTabs = null;
  }

  root.__auditTabs = { show, destroy, root };
  return root.__auditTabs;
}
