/* Org-scope tabs — ONE diagram, two states, an autoplaying tab bar underneath.
 *
 * The two Figma states are the same artwork with four nodes moved and fifteen
 * recoloured (gen-states.mjs diffs the two builds into states.json). So the
 * component inlines state 1 only and tweens into state 2: Jane's card slides
 * across, her scope rectangle travels with her, and the subtrees trade tint.
 * Crossfading two copies would have shown a cut where the brief asks for a move.
 *
 * Markup: the component ADOPTS whatever is already on the page. Put
 * data-hi-org-tabs on the wrapper and give it an inlined SVG plus one element
 * per tab; the selectors below say what it looks for, and they default to the
 * Webflow build's own class names. If the wrapper is empty it falls back to
 * building its own markup (the local preview).
 */

export const CONFIG = {
  svg: '', // pasted into the page in Webflow — nothing to fetch
  states: {"source":["dist/org-tabs-1.svg","dist/org-tabs-2.svg"],"moves":[{"name":"Rectangle 21571","dx":329.99,"dy":0},{"name":"Modal Content","dx":335,"dy":0},{"name":"Modal Content_2","dx":-330,"dy":0},{"name":"Job Title_4","dx":538,"dy":0}],"tints":[{"name":"Group 1171275915","attr":"fill","from":"#C375D9","to":"#E4E8F1"},{"name":"Group 1171275917","attr":"fill","from":"#E4E8F1","to":"#C375D9"},{"name":"Group 1171275918","attr":"fill","from":"#E4E8F1","to":"#C375D9"},{"name":"Group 1171275916","attr":"fill","from":"#C375D9","to":"#E4E8F1"},{"name":"Name_3","attr":"fill","from":"#8B95AA","to":"#333342"},{"name":"Ellipse 480","attr":"fill","from":"#F798DD","to":"#666C7E"},{"name":"Ellipse 481","attr":"fill","from":"#F798DD","to":"#666C7E"},{"name":"Name_6","attr":"fill","from":"#8B95AA","to":"#333342"},{"name":"Name_7","attr":"fill","from":"#8B95AA","to":"#333342"}],"overlays":{"a":["Vector 275","Vector 278","Vector 279"],"b":["Vector 280","Vector 281","Vector 277"]}},

  // Tab copy. The frame only carries a description for the first state; the
  // second is Tom's to write — flagged rather than invented.
  tabs: [
    {
      label: 'Jane manages Platform',
      text: 'Her scope lights up her subtree — every worker in it, nobody outside it. Nobody configured this.',
    },
    {
      label: 'Jane moves to Infra',
      text: 'Her scope follows her. The Platform subtree goes dark the moment she moves, and Infra lights up.',
    },
  ],

  // What to adopt on the page. Lists, so the Webflow classes and the preview's
  // own markup can both match without a second build.
  select: {
    svg: 'svg',
    tabs: '[data-hi-tab], .org-aware_nav-item, .org-tabs_tab',
    fill: '[data-hi-progress], .integrations-control_nav-active, .org-tabs_fill',
    activeClass: 'is-active',
  },

  nav: 0.55, // seconds the mobile tab track takes to bring the active tab in
  swipe: 0.05, // fraction of a tab's width that counts as a swipe
  swipeMin: 16, // …but never less than this many px
  flick: 0.25, // px/ms — a fast flick switches whatever the distance
  dwell: 5, // seconds a state holds before autoplay advances
  move: 0.9, // travel time between states
  tint: 0.55, // colour crossfade
  march: 1.6, // seconds for the lit connector's dots to travel one dash cycle
  ease: 'osmo',
};

export function initOrgTabs(scope) {
  const gsap = window.gsap;
  const mounts = (scope || document).querySelectorAll('[data-hi-org-tabs]');
  if (!gsap || !mounts.length) return;

  mounts.forEach(async (mount) => {
    if (mount.__orgTabs) mount.__orgTabs.destroy();

    // states.json can be handed in directly (bundled) or fetched (preview)
    const states =
      typeof CONFIG.states === 'object' ? CONFIG.states : await fetch(CONFIG.states).then((r) => r.json());
    const needsSvg = !mount.querySelector(CONFIG.select.svg);
    const svgText = needsSvg ? await fetch(CONFIG.svg).then((r) => r.text()) : '';

    // Adopt the page's markup when it is there; only build when the mount is bare.
    const existing = mount.querySelectorAll(CONFIG.select.tabs);
    if (!existing.length) {
      mount.innerHTML = `
      <div class="org-tabs">
        <div class="org-tabs_stage"></div>
        <div class="org-tabs_bar">
          ${CONFIG.tabs
            .map(
              (t, i) => `
            <button class="org-tabs_tab${i ? '' : ' is-active'}" type="button" data-tab="${i}" aria-pressed="${!i}">
              <span class="org-tabs_rail"><span class="org-tabs_fill"></span></span>
              <span class="org-tabs_label">${t.label}</span>
              <span class="org-tabs_text">${t.text}</span>
            </button>`
            )
            .join('')}
        </div>
      </div>`;
    }

    // The SVG may already be pasted into the page (Webflow) or may need loading.
    if (!mount.querySelector(CONFIG.select.svg)) {
      const host = mount.querySelector('.org-tabs_stage') || mount;
      host.innerHTML = svgText.replace(/<!--[\s\S]*?-->/g, '');
    }

    const svg = mount.querySelector(CONFIG.select.svg);
    if (!svg) return console.warn('[org-tabs] no svg inside the mount');
    svg.setAttribute('width', '100%');
    svg.removeAttribute('height');

    const tabs = [...mount.querySelectorAll(CONFIG.select.tabs)];
    // one progress fill per tab, looked up inside that tab
    const fills = tabs.map((tab) => tab.querySelector(CONFIG.select.fill)).filter(Boolean);
    if (tabs.length < 2) return console.warn('[org-tabs] need two tab elements');
    const ACTIVE = CONFIG.select.activeClass;

    const nodes = (name) => svg.querySelectorAll(`[data-anim="${CSS.escape(name)}"]`);
    // the pink overlay of each connector, per state it belongs to
    const overlay = (state) =>
      [...svg.querySelectorAll(`[data-scope="${state}"]`)];
    const overlays = { a: overlay('a'), b: overlay('b') };
    gsap.set([...overlays.a, ...overlays.b], { autoAlpha: 0 });
    // "no paint" in the diff means the attribute is absent — tween opacity, since
    // GSAP cannot interpolate a colour to nothing
    const paint = (v) => v || 'rgba(0,0,0,0)';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let index = 0;
    let timer = null;
    let tl = null;
    let running = false;
    let marching = []; // dash tweens, killed by identity — killTweensOf(el) would
                       // also kill the opacity fades running on the same nodes

    function apply(to, instant) {
      if (tl) tl.kill();
      const d = instant || reduced ? 0 : 1;
      tl = gsap.timeline({ defaults: { ease: CONFIG.ease } });

      states.moves.forEach(({ name, dx, dy }) => {
        tl.to(nodes(name), { x: to ? dx : 0, y: to ? dy : 0, duration: CONFIG.move * d }, 0);
      });

      states.tints.forEach(({ name, attr, from, to: toColor }) => {
        const vars = { duration: CONFIG.tint * d };
        vars[attr] = paint(to ? toColor : from);
        tl.to(nodes(name), vars, CONFIG.move * d * 0.25);
      });

      // the lit subtree's connectors are the pink overlays; the grey base under
      // them never changes, so a line can never disappear
      const on = to ? overlays.b : overlays.a;
      const off = to ? overlays.a : overlays.b;
      tl.to(off, { autoAlpha: 0, duration: CONFIG.tint * d }, 0);
      tl.to(on, { autoAlpha: 1, duration: CONFIG.tint * d }, CONFIG.move * d * 0.3);
      march(on, off);

      return tl;
    }

    // Emphasis: the lit connectors' dashes travel along the line, so the active
    // scope reads as live rather than merely tinted. Dashed strokes cannot be
    // "drawn" with dashoffset, but marching the offset is exactly that pattern.
    function march(on, off) {
      marching.forEach((t) => t.kill());
      marching = [];
      gsap.set(off, { strokeDashoffset: 0 });
      if (reduced) return;
      on.forEach((el) => {
        const cycle = 4.5; // dasharray "1.5 3"
        marching.push(
          gsap.fromTo(
            el,
            { strokeDashoffset: 0 },
            { strokeDashoffset: -cycle, duration: CONFIG.march, ease: 'none', repeat: -1 }
          )
        );
      });
    }

    // Under 479 the tabs sit side by side in a track wider than the screen, so
    // the active one has to travel into view — and be draggable. Measured with
    // rects, not offsetLeft: offsetLeft is relative to the offset PARENT, which
    // is not the track unless the track happens to be positioned, and that is
    // what put the active tab half off screen.
    const host = tabs[0].parentElement;
    const nativeScroll = () => /auto|scroll/.test(getComputedStyle(host).overflowX);
    const currentX = () => gsap.getProperty(tabs[0], 'x') || 0;

    // Layout metrics, NOT rects or scrollWidth: a transform on the tabs changes
    // both, so measuring them while translating made the clamp chase its own
    // tail and park the active tab half off screen. offsetLeft/offsetWidth are
    // pre-transform, and every tab shares an offset parent, so differences hold.
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

    // how far the track must move for tab i to sit at the viewport's left edge
    function targetX(i) {
      const m = metrics();
      return Math.max(m.minX, Math.min(0, -(tabs[i].offsetLeft - tabs[0].offsetLeft)));
    }

    function positionNav(instant) {
      if (!host) return;
      const d = instant || reduced ? 0 : 1;

      if (!overflows()) {
        gsap.to(tabs, { x: 0, duration: CONFIG.nav * d, ease: CONFIG.ease });
        if (host.scrollLeft) host.scrollLeft = 0;
        return;
      }

      if (nativeScroll()) {
        const proxy = { v: host.scrollLeft };
        gsap.to(proxy, {
          v: tabs[index].offsetLeft - tabs[0].offsetLeft,
          duration: CONFIG.nav * d,
          ease: CONFIG.ease,
          onUpdate: () => {
            host.scrollLeft = proxy.v;
          },
        });
        return;
      }

      // clicking a tab makes the browser scroll its overflow to reveal focus,
      // which fights the translate — keep the container pinned at 0
      gsap.to(tabs, {
        x: targetX(index),
        duration: CONFIG.nav * d,
        ease: CONFIG.ease,
        onUpdate: () => {
          if (host.scrollLeft) host.scrollLeft = 0;
        },
      });
      if (host.scrollLeft) host.scrollLeft = 0;
    }

    // Drag / swipe. Only when the track actually overflows and we own the
    // translate; a native scroll container already drags itself.
    let drag = null;
    // which tab the track has been dragged closest to, in layout terms
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
      if (!overflows() || nativeScroll() || e.button > 0) return;
      drag = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        from: currentX(),
        moved: false,
        last: e.clientX,
        time: performance.now(),
        velocity: 0,
      };
      gsap.killTweensOf(tabs);
      gsap.killTweensOf(fills); // the dwell pauses while a finger is down
    }

    function onMove(e) {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < 6 || Math.abs(e.clientY - drag.y) > Math.abs(dx)) return; // let vertical scroll win
        drag.moved = true;
        host.setPointerCapture(e.pointerId);
      }
      // a little resistance past the ends, so the track feels bounded
      const now = performance.now();
      const dt = now - drag.time;
      if (dt > 0) drag.velocity = (e.clientX - drag.last) / dt;
      drag.last = e.clientX;
      drag.time = now;

      const bound = metrics().minX;
      let x = drag.from + dx;
      if (x > 0) x *= 0.35;
      else if (x < bound) x = bound + (x - bound) * 0.35;
      gsap.set(tabs, { x });
    }

    function onUp(e) {
      if (!drag || e.pointerId !== drag.id) return;
      const moved = drag.moved;
      const travelled = e.clientX - drag.x;
      const velocity = drag.velocity;
      drag = null;
      if (!moved) return runFill(); // a tap, handled by the click listener

      // A short drag should still change tab: nearest-tab alone means dragging
      // more than half a tab before anything happens, which reads as stuck.
      const step = tabs.length > 1 ? tabs[1].offsetLeft - tabs[0].offsetLeft : tabs[0].offsetWidth;
      const threshold = Math.max(CONFIG.swipeMin, step * CONFIG.swipe);
      const flicked = Math.abs(velocity) > CONFIG.flick;
      let next;
      if (Math.abs(travelled) > threshold || flicked) {
        next = index + (travelled < 0 ? 1 : -1);
        next = Math.max(0, Math.min(tabs.length - 1, next));
      } else {
        next = nearestTab();
      }
      if (next !== index) show(next);
      else {
        positionNav();
        runFill();
      }
    }

    if (host) {
      host.addEventListener('pointerdown', onDown);
      host.addEventListener('pointermove', onMove);
      host.addEventListener('pointerup', onUp);
      host.addEventListener('pointercancel', onUp);
      host.style.touchAction = 'pan-y'; // horizontal gestures are ours
    }

    function show(next, instant) {
      index = next;
      tabs.forEach((t, i) => {
        t.classList.toggle(ACTIVE, i === index);
        t.setAttribute('aria-pressed', String(i === index));
      });
      apply(index === 1, instant);
      positionNav(instant);
      runFill();
    }

    // The active tab's rail fills over the dwell — the progress bar in the frame.
    function runFill() {
      gsap.killTweensOf(fills);
      gsap.set(fills, { scaleX: 0 });
      if (!running) return;
      gsap.set(fills[index], { scaleX: 0 });
      gsap.to(fills[index], {
        scaleX: 1,
        duration: CONFIG.dwell,
        ease: 'none',
        onComplete: () => show((index + 1) % tabs.length),
      });
    }

    tabs.forEach((tab, i) =>
      tab.addEventListener('click', () => {
        if (i === index || (drag && drag.moved)) return;
        show(i);
      })
    );

    // Off-screen it neither plays nor burns frames.
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible === running) return;
        running = visible;
        if (running) runFill();
        else gsap.killTweensOf(fills);
      },
      { threshold: 0.25 }
    );
    io.observe(mount);

    // width-only: mobile scroll fires resize, and the track may start fitting
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      positionNav(true);
    };
    window.addEventListener('resize', onResize);

    show(0, true);

    mount.__orgTabs = {
      destroy() {
        io.disconnect();
        window.removeEventListener('resize', onResize);
        if (host) {
          host.removeEventListener('pointerdown', onDown);
          host.removeEventListener('pointermove', onMove);
          host.removeEventListener('pointerup', onUp);
          host.removeEventListener('pointercancel', onUp);
        }
        gsap.set(tabs, { clearProps: 'x' });
        clearTimeout(timer);
        if (tl) tl.kill();
        marching.forEach((t) => t.kill());
        gsap.killTweensOf(fills);
        gsap.set(fills, { clearProps: 'all' });
        delete mount.__orgTabs;
      },
      show,
      get index() {
        return index;
      },
    };
  });
}
