/* HI — org graph (year slider)
 *
 * Nathan's frame is a *state*, not an animation: one org chart at one moment in
 * time, with the empty seats drawn as dashed placeholders. So this one is not an
 * animated Figma export — the SVG carries outlined text and a single year, and
 * every box has to be able to hold different copy at five different years.
 * It is rebuilt as DOM instead:
 *
 *   · one mount div, everything below it generated from DATA + LAYOUT
 *   · the artwork is laid out in Figma's own 620 × 430 units and the whole stage
 *     is `transform: scale()`d to the container width, so it scales exactly like
 *     the inlined SVGs do while keeping real, selectable, re-typable text
 *   · connectors are derived from the same LAYOUT numbers as the boxes, so
 *     changing a column or adding a row moves the wires with it
 *
 * ── Editing the content ─────────────────────────────────────────────────────
 * DATA is the whole illustration. Each person carries the year they joined:
 *
 *   { name: 'Product Designer', since: 2023 }
 *
 * A box is filled when the slider year >= `since`, dashed otherwise, so the
 * chart can only ever grow as you drag right. Roles are sorted by `since`, so a
 * column always fills top-down whatever order they are typed in. Add a fourth
 * role to any department and every column gains a fourth row (LAYOUT.rowPitch
 * spaces it; the panel does not grow, so keep it to 3 unless Nathan resizes).
 * Add or remove a year and the slider re-ticks itself.
 *
 * ── Markup ──────────────────────────────────────────────────────────────────
 *   <div data-hi-org-graph></div>
 * That is the entire Webflow build. Paste org-graph/styles.html once for the CSS.
 *
 * Live tuning from the console, no reload:
 *   HIOrgGraph.config.fill.duration = 0.8
 *   HIOrgGraph.setYear(2025)
 */

/* eslint-disable no-undef */

const MOUNT = '[data-hi-org-graph]';

// styles.html, inlined here by `sync-org-graph.mjs --repo` so the repo build is
// self-contained — the Webflow side is then a single empty div, with no CSS
// paste that can go stale against a layout change. Left empty in the prototype:
// the preview loads styles.html itself so it stays editable as a real CSS file.
const STYLE = "\n  [data-hi-org-graph] {\n    --og-panel: #f8f9fc;\n    --og-line: #e4e8f1;\n    --og-dot: #c8cdd8;\n    --og-dash: #8b95aa;\n    --og-ink: #333342;\n    --og-box: #ffffff;\n\n    /* No width here — sizing is yours. The component measures whatever width the\n       mount ends up with and scales the 620-unit artwork into it, then sets the\n       height itself. A block-level div fills its parent by default; if the mount\n       ever measures 0 (a collapsed flex child) it falls back to 620 rather than\n       vanishing. */\n    position: relative;\n    overflow: hidden; /* the stage is scaled, not reflowed */\n  }\n\n  /* 620 × 430 Figma units, scaled to the container by JS. transform-origin is\n     what keeps the whole thing pinned to the top-left as it scales. */\n  .org-graph_stage {\n    position: absolute;\n    top: 0;\n    left: 0;\n    transform-origin: 0 0;\n    font-family: inherit;\n    color: var(--og-ink);\n    -webkit-font-smoothing: antialiased;\n  }\n\n  .org-graph_panel {\n    position: absolute;\n    top: 0;\n    left: 0;\n    box-sizing: border-box;\n    background-color: var(--og-panel);\n    border: 1px solid var(--og-line);\n    overflow: hidden;\n  }\n\n  .org-graph_title {\n    position: absolute;\n    left: 0;\n    width: 100%;\n    text-align: center;\n    line-height: 1;\n    font-weight: 500;\n    letter-spacing: 0.01em;\n  }\n\n  .org-graph_wires {\n    position: absolute;\n    inset: 0;\n    width: 100%;\n    height: 100%;\n    overflow: visible;\n    pointer-events: none;\n  }\n  .org-graph_dot {\n    fill: var(--og-dot);\n    fill-opacity: 0.32;\n  }\n  .org-graph_wires path {\n    fill: none;\n    stroke: var(--og-dash);\n    stroke-width: 1;\n    stroke-dasharray: 3 3;\n  }\n\n  /* ── a seat ──────────────────────────────────────────────────────────────\n     ghost = the dashed placeholder, always there. fill = the white card that\n     lands on top of it. Same rect, so the swap is pixel-exact and tweenable —\n     border-style itself is not. */\n  .org-graph_box {\n    position: absolute;\n    box-sizing: border-box;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n  }\n  .org-graph_box-ghost,\n  .org-graph_box-fill {\n    position: absolute;\n    inset: 0;\n    box-sizing: border-box;\n  }\n  /* the placeholder is an SVG stroke, not `border: dashed` — only a stroke can\n     carry Figma's exact 4 4 pattern around an 8px radius */\n  .org-graph_box-ghost {\n    width: 100%;\n    height: 100%;\n    overflow: visible;\n  }\n  .org-graph_box-ghost rect {\n    fill: none;\n    stroke: var(--og-dash);\n    stroke-width: 1;\n    stroke-dasharray: 4 4;\n  }\n  .org-graph_box-fill {\n    border-radius: 8px;\n  }\n  .org-graph_box-fill {\n    background: var(--og-box);\n    border: 1px solid var(--og-line);\n  }\n  .org-graph_box-label {\n    position: relative;\n    line-height: 1;\n    font-weight: 500;\n    white-space: nowrap;\n  }\n  .org-graph_box[data-org-size='lg'] .org-graph_box-label {\n    font-size: 14px;\n  }\n  .org-graph_box[data-org-size='sm'] .org-graph_box-label {\n    font-size: 12px;\n  }\n\n  /* ── slider ──────────────────────────────────────────────────────────── */\n  .org-graph_slider {\n    position: absolute;\n    left: 0;\n    width: 100%;\n    touch-action: none; /* the knob owns horizontal drag, the page keeps vertical */\n    cursor: grab;\n  }\n  .org-graph_slider[data-dragging] {\n    cursor: grabbing;\n  }\n  .org-graph_slider:focus-visible {\n    outline: 2px solid var(--og-ink);\n    outline-offset: 3px;\n    border-radius: 12px;\n  }\n  .org-graph_track {\n    position: absolute;\n    left: 0;\n    right: 0;\n    box-sizing: border-box;\n    background: var(--og-box);\n    border: 1px solid var(--og-line);\n  }\n  .org-graph_knob {\n    position: absolute;\n    top: 0;\n    left: 0;\n    border-radius: 50%;\n    background: var(--og-ink);\n    will-change: transform;\n  }\n\n  /* ── year axis ───────────────────────────────────────────────────────── */\n  .org-graph_years {\n    position: absolute;\n    left: 0;\n    width: 100%;\n    height: 14px;\n    line-height: 1;\n  }\n  .org-graph_year {\n    position: absolute;\n    top: 0;\n    transform: translateX(-50%);\n    cursor: pointer;\n    color: var(--og-dash);\n    transition: color 0.25s ease;\n  }\n  .org-graph_year[data-state='active'] {\n    color: var(--og-ink);\n    font-weight: 500;\n  }\n";

// ===========================================================================
// CONTENT — this is the bit that gets edited
// ===========================================================================

const DATA = {
  title: 'AUTO Org graph',
  years: [2022, 2023, 2024, 2025, 2026],

  // the top box
  lead: { name: 'CEO', since: 2022 },

  // one column each, left to right. `since` on the department itself lets a
  // whole column arrive later — GTM below only opens in 2023.
  departments: [
    {
      name: 'Product',
      since: 2022,
      roles: [
        { name: 'Product Designer', since: 2022 },
        { name: 'Product Manager', since: 2023 },
        { name: 'UX Researcher', since: 2025 },
      ],
    },
    {
      name: 'Engineering',
      since: 2022,
      roles: [
        { name: 'Eng Manager', since: 2022 },
        { name: 'Backend Engineer', since: 2023 },
        { name: 'Data Engineer', since: 2024 },
      ],
    },
    {
      name: 'GTM',
      since: 2022,
      roles: [
        { name: 'Account Executive', since: 2023 },
        { name: 'Sales Engineer', since: 2024 },
        { name: 'Growth Marketer', since: 2026 },
      ],
    },
  ],
};

// ===========================================================================
// CONFIG
// ===========================================================================

const CONFIG = {
  ease: 'osmo', // CustomEase, registered below if the page has not already
  easePath: 'M0,0 C0.625,0.05 0,1 1,1',

  // the frame, in Figma units. Every box and every wire is derived from here.
  layout: {
    width: 620,
    height: 430,
    panel: { w: 620, h: 380, radius: 12 },
    title: { y: 19, size: 10 },
    boxW: 153,
    lead: { x: 233.5, y: 36.5, h: 51 },
    columns: [55.5, 233.5, 411.5], // box left edges
    deptY: 136.5,
    deptH: 51,
    rowY: 204.5, // first role row
    rowH: 35,
    rowPitch: 52, // top-to-top between role rows
    elbowY: 112, // where the lead's two branches run horizontally
    elbowR: 24,
    slider: { y: 400, h: 7, inset: 13, knob: 12 }, // y is the centre line
    axis: { y: 419, size: 11 }, // 419 + 11px line box = 430, the frame's last pixel
  },

  // marching ants. Speed is in artwork units per second; the dash period is read
  // off the real stroke-dasharray, so travelling exactly one period loops
  // seamlessly whatever pattern the CSS carries.
  crawl: {
    enabled: true,
    wire: { speed: 7 }, // connectors, flowing away from the CEO
    ghost: { enabled: false, speed: 5 }, // the empty seats sit still — one flag away
  },

  entrance: { duration: 0.5, stagger: 0.05, y: 10 }, // panel furniture on enter
  fill: { duration: 0.45, stagger: 0.07, y: 6, scale: 0.94 }, // seat gets taken
  clear: { duration: 0.28 }, // …and given back, dragging left
  wire: { duration: 0.35 },
  knob: { duration: 0.5 },

  // walks the slider once on enter so the illustration plays for people who
  // never touch it. Any interaction cancels it for good.
  autoplay: { enabled: true, delay: 0.7, dwell: 2.3 },

  start: 'top 78%', // ScrollTrigger start, when ScrollTrigger is on the page
};

// ===========================================================================
// build
// ===========================================================================

const NS = 'http://www.w3.org/2000/svg';
const instances = [];
let uid = 0;

const el = (tag, cls, parent) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (parent) parent.appendChild(n);
  return n;
};

const svgEl = (tag, parent) => {
  const n = document.createElementNS(NS, tag);
  if (parent) parent.appendChild(n);
  return n;
};

// SVG rects sit on the half-unit so a 1px stroke lands on the pixel; a DOM box
// with a 1px border-box border covers the same outer rect from x-0.5, w+1.
const place = (node, x, y, w, h) => {
  node.style.left = x - 0.5 + 'px';
  node.style.top = y - 0.5 + 'px';
  node.style.width = w + 1 + 'px';
  node.style.height = h + 1 + 'px';
};

// The pattern is set in CSS, so measure it rather than restate it here. An odd
// number of dash values repeats inverted, so the real period is doubled.
function dashPeriod(node) {
  const raw = getComputedStyle(node).strokeDasharray || '';
  const nums = raw.split(/[\s,]+/).map(parseFloat).filter((n) => !isNaN(n));
  if (!nums.length) return 0;
  const sum = nums.reduce((t, n) => t + n, 0);
  return nums.length % 2 ? sum * 2 : sum;
}

function ease() {
  const CustomEase = window.CustomEase;
  if (CustomEase && !CustomEase.get(CONFIG.ease)) CustomEase.create(CONFIG.ease, CONFIG.easePath);
  return CustomEase && CustomEase.get(CONFIG.ease) ? CONFIG.ease : 'power3.out';
}

// Every seat in the chart, positioned from LAYOUT alone. `key` is only used to
// keep the entrance order stable.
function model() {
  const L = CONFIG.layout;
  const depts = DATA.departments;
  const rows = depts.reduce((n, d) => Math.max(n, d.roles.length), 0);
  const seats = [];

  seats.push({
    key: 'lead',
    person: DATA.lead,
    x: L.lead.x,
    y: L.lead.y,
    w: L.boxW,
    h: L.lead.h,
    size: 'lg',
  });

  depts.forEach((dept, c) => {
    const x = L.columns[c % L.columns.length];
    seats.push({ key: 'dept-' + c, person: dept, x, y: L.deptY, w: L.boxW, h: L.deptH, size: 'lg', col: c });

    // sorted by joining year so a column always fills from the top down,
    // whatever order the roles are typed in
    const roles = dept.roles.slice().sort((a, b) => a.since - b.since);
    for (let r = 0; r < rows; r++) {
      seats.push({
        key: 'role-' + c + '-' + r,
        person: roles[r] || null, // a column with fewer roles keeps its dashed seat
        x,
        y: L.rowY + r * L.rowPitch,
        w: L.boxW,
        h: L.rowH,
        size: 'sm',
        col: c,
        row: r,
      });
    }
  });

  return { seats, rows };
}

// The two branch elbows + the centre drop, exactly as Figma drew them: straight
// out of the box, a radiused corner, the horizontal run, a second corner up into
// the lead. Mirrored per side off `dir`, so a fourth column would wire itself.
function trunk(cx, leadCx, leadBottom, deptTop) {
  const L = CONFIG.layout;
  if (Math.abs(cx - leadCx) < 0.5) return `M${cx} ${deptTop}V${leadBottom}`;
  const r = L.elbowR;
  const y = L.elbowY;
  const dir = leadCx > cx ? 1 : -1;
  return (
    `M${cx} ${deptTop}V${y + r}` +
    `A${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${cx + dir * r} ${y}` +
    `H${leadCx - dir * r}` +
    `A${r} ${r} 0 0 ${dir > 0 ? 0 : 1} ${leadCx} ${y - r}` +
    `V${leadBottom}`
  );
}

function render(mount) {
  const L = CONFIG.layout;
  const { seats } = model();

  mount.innerHTML = '';
  const stage = el('div', 'org-graph_stage', mount);
  stage.style.width = L.width + 'px';
  stage.style.height = L.height + 'px';

  const panel = el('div', 'org-graph_panel', stage);
  panel.style.width = L.panel.w + 'px';
  panel.style.height = L.panel.h + 'px';
  panel.style.borderRadius = L.panel.radius + 'px';

  const title = el('div', 'org-graph_title', panel);
  title.textContent = DATA.title;
  title.style.top = L.title.y + 'px';
  title.style.fontSize = L.title.size + 'px';

  // ── wires ────────────────────────────────────────────────────────────────
  const wires = svgEl('svg', panel);
  wires.setAttribute('class', 'org-graph_wires');
  wires.setAttribute('viewBox', `0 0 ${L.panel.w} ${L.panel.h}`);

  // The dot grid lives in the SVG rather than as a CSS background-image: the
  // stage is transform-scaled, and a background tile is rasterised at layout
  // size and then scaled, which turns the grid into moire on a small card.
  const dotId = 'org-graph-dots-' + ++uid;
  const defs = svgEl('defs', wires);
  const pat = svgEl('pattern', defs);
  pat.setAttribute('id', dotId);
  pat.setAttribute('patternUnits', 'userSpaceOnUse');
  pat.setAttribute('width', '16');
  pat.setAttribute('height', '16');
  const dot = svgEl('rect', pat);
  dot.setAttribute('class', 'org-graph_dot');
  dot.setAttribute('x', '14');
  dot.setAttribute('y', '14');
  dot.setAttribute('width', '2');
  dot.setAttribute('height', '2');
  const dots = svgEl('rect', wires);
  dots.setAttribute('width', String(L.panel.w));
  dots.setAttribute('height', String(L.panel.h));
  dots.setAttribute('fill', 'url(#' + dotId + ')');

  const wireFor = (d) => {
    const p = svgEl('path', wires);
    p.setAttribute('d', d);
    return p;
  };

  const leadCx = L.lead.x + L.boxW / 2;
  const leadBottom = L.lead.y + L.lead.h;

  seats
    .filter((s) => s.key.indexOf('dept-') === 0)
    .forEach((s) => {
      const cx = s.x + s.w / 2;
      wireFor(trunk(cx, leadCx, leadBottom, s.y)).setAttribute('data-wire', 'trunk');
    });

  // stubs between a box and the one under it — shown only once the LOWER box is
  // taken, which is why the right column has no stub in Nathan's frame
  const stubs = {};
  seats
    .filter((s) => s.row !== undefined)
    .forEach((s) => {
      const cx = s.x + s.w / 2;
      const above = s.row === 0 ? L.deptY + L.deptH : s.y - L.rowPitch + L.rowH;
      const p = wireFor(`M${cx} ${above}V${s.y}`);
      p.setAttribute('data-wire', 'stub');
      stubs[s.key] = p;
    });

  // ── boxes ────────────────────────────────────────────────────────────────
  const boxes = seats.map((s) => {
    const box = el('div', 'org-graph_box', panel);
    box.setAttribute('data-org-size', s.size);
    place(box, s.x, s.y, s.w, s.h);
    const ghost = svgEl('svg', box);
    ghost.setAttribute('class', 'org-graph_box-ghost');
    ghost.setAttribute('viewBox', `0 0 ${s.w + 1} ${s.h + 1}`);
    const grect = svgEl('rect', ghost);
    grect.setAttribute('x', '0.5');
    grect.setAttribute('y', '0.5');
    grect.setAttribute('width', String(s.w));
    grect.setAttribute('height', String(s.h));
    grect.setAttribute('rx', '7.5');
    const fill = el('span', 'org-graph_box-fill', box);
    const label = el('span', 'org-graph_box-label', box);
    return { seat: s, node: box, ghost, ghostRect: grect, fill, label, stub: stubs[s.key] || null, filled: null };
  });

  // ── slider + year axis ───────────────────────────────────────────────────
  const slider = el('div', 'org-graph_slider', stage);
  slider.style.top = L.slider.y - L.slider.knob + 'px';
  slider.style.height = L.slider.knob * 2 + 'px';
  slider.setAttribute('role', 'slider');
  slider.setAttribute('tabindex', '0');
  slider.setAttribute('aria-label', 'Year');
  slider.setAttribute('aria-valuemin', String(DATA.years[0]));
  slider.setAttribute('aria-valuemax', String(DATA.years[DATA.years.length - 1]));

  const track = el('div', 'org-graph_track', slider);
  track.style.top = L.slider.knob - L.slider.h / 2 - 0.5 + 'px';
  track.style.height = L.slider.h + 1 + 'px';
  track.style.borderRadius = L.slider.h / 2 + 'px';

  const knob = el('div', 'org-graph_knob', slider);
  knob.style.width = knob.style.height = L.slider.knob * 2 + 'px';

  const axis = el('div', 'org-graph_years', stage);
  axis.style.top = L.axis.y + 'px';
  axis.style.fontSize = L.axis.size + 'px';
  const yearNodes = DATA.years.map((y, i) => {
    const n = el('span', 'org-graph_year', axis);
    n.textContent = y;
    n.style.left = tickX(i) + 'px'; // centred on its own tick, same maths as the knob
    return n;
  });

  return { mount, stage, panel, boxes, slider, knob, yearNodes, wires };
}

// ===========================================================================
// state
// ===========================================================================

function tickX(i) {
  const L = CONFIG.layout;
  const span = L.width - L.slider.inset * 2;
  return L.slider.inset + (span * i) / Math.max(1, DATA.years.length - 1);
}

function create(mount) {
  const gsap = window.gsap;
  const L = CONFIG.layout;
  const ui = render(mount);
  const E = ease();

  const st = {
    ...ui,
    index: 0,
    autoplay: null,
    dragging: false,
    touched: false,
    entered: false,
    visible: false, // the crawl only runs while the panel is on screen
    killed: false,
  };

  // ── scaling: 620 units -> whatever the card is wide ──────────────────────
  const fit = () => {
    const w = mount.getBoundingClientRect().width || L.width;
    const s = w / L.width;
    st.stage.style.transform = 'scale(' + s + ')';
    mount.style.height = L.height * s + 'px';
  };
  fit();
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
  if (ro) ro.observe(mount);
  else window.addEventListener('resize', fit);
  st.ro = ro;
  st.fit = fit;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── the seats ────────────────────────────────────────────────────────────
  const paint = (animate) => {
    const year = DATA.years[st.index];
    let n = 0;
    st.boxes.forEach((b) => {
      const p = b.seat.person;
      const filled = !!p && year >= p.since;
      if (filled === b.filled) return;
      b.filled = filled;
      b.node.setAttribute('data-state', filled ? 'filled' : 'empty');
      if (filled) b.label.textContent = p.name;
      if (b.ghostCrawl) b.ghostCrawl.__want = !filled; // hidden behind the card
      if (b.stubCrawl) b.stubCrawl.__want = filled; // only drawn once it is
      if (st.syncCrawl) st.syncCrawl();

      const d = animate && !reduced;
      const targets = [b.fill, b.label];
      if (filled) {
        gsap.killTweensOf(targets);
        gsap.fromTo(
          targets,
          { autoAlpha: 0, y: CONFIG.fill.y, scale: CONFIG.fill.scale },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: d ? CONFIG.fill.duration : 0,
            ease: E,
            delay: d ? n * CONFIG.fill.stagger : 0,
            overwrite: true,
          }
        );
        if (b.stub) {
          gsap.to(b.stub, {
            autoAlpha: 1,
            duration: d ? CONFIG.wire.duration : 0,
            ease: E,
            delay: d ? n * CONFIG.fill.stagger : 0,
          });
        }
        n++;
      } else {
        gsap.killTweensOf(targets);
        gsap.to(targets, {
          autoAlpha: 0,
          y: CONFIG.fill.y,
          scale: CONFIG.fill.scale,
          duration: d ? CONFIG.clear.duration : 0,
          ease: E,
          overwrite: true,
        });
        if (b.stub) gsap.to(b.stub, { autoAlpha: 0, duration: d ? CONFIG.clear.duration : 0, ease: E });
      }
    });

    st.slider.setAttribute('aria-valuenow', String(year));
    st.slider.setAttribute('aria-valuetext', String(year));
    st.yearNodes.forEach((node, i) => node.setAttribute('data-state', i === st.index ? 'active' : 'idle'));
  };

  const moveKnob = (x, animate) => {
    gsap.to(st.knob, {
      x: x - L.slider.knob,
      duration: animate && !reduced ? CONFIG.knob.duration : 0,
      ease: E,
      overwrite: true,
    });
  };

  const setIndex = (i, animate) => {
    i = Math.max(0, Math.min(DATA.years.length - 1, i));
    if (i === st.index) return;
    st.index = i;
    paint(animate !== false);
  };

  // ── initial state: nothing placed, then the entrance fills 2022 ──────────
  paint(false); // labels, aria and year states in place…
  gsap.set(
    st.boxes.map((b) => [b.fill, b.label]).flat(),
    { autoAlpha: 0, y: CONFIG.fill.y, scale: CONFIG.fill.scale }
  );
  gsap.set(st.wires.querySelectorAll('[data-wire="stub"]'), { autoAlpha: 0 });
  st.boxes.forEach((b) => (b.filled = null)); // …but nothing on screen until enter
  moveKnob(tickX(0), false);

  const furniture = [st.panel.querySelector('.org-graph_title'), st.slider, st.stage.querySelector('.org-graph_years')];
  const ghosts = st.boxes.map((b) => b.ghost);
  const trunks = [].slice.call(st.wires.querySelectorAll('[data-wire="trunk"]'));

  // ── marching ants ────────────────────────────────────────────────────────
  // One tween per element so a seat can stop crawling the moment it is taken —
  // the ghost is then behind an opaque card, and a hidden stub has nothing to
  // show. `want` is the element's own opinion, `st.visible` the viewport's;
  // syncCrawl reconciles the two so nothing burns frames off-screen.
  const crawls = [];
  const crawl = (node, speed, dir, want) => {
    const period = dashPeriod(node);
    if (!period || reduced || !CONFIG.crawl.enabled) return null;
    const tw = gsap.to(node, {
      strokeDashoffset: dir * period,
      duration: period / speed,
      ease: 'none',
      repeat: -1,
      paused: true,
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

  // Trunks are authored from the department UP to the lead, stubs from the box
  // above DOWN into the box below. Raising the offset walks the pattern back
  // toward a path's start, so the signs differ to give both the same flow —
  // outward, away from the CEO.
  trunks.forEach((t) => crawl(t, CONFIG.crawl.wire.speed, 1, true));
  st.boxes.forEach((b) => {
    b.ghostCrawl = CONFIG.crawl.ghost.enabled ? crawl(b.ghostRect, CONFIG.crawl.ghost.speed, -1, true) : null;
    if (b.stub) b.stubCrawl = crawl(b.stub, CONFIG.crawl.wire.speed, -1, false);
  });

  const enter = () => {
    if (st.entered) return;
    st.entered = true;
    if (reduced) {
      st.index = DATA.years.length - 1;
      paint(false);
      moveKnob(tickX(st.index), false);
      return;
    }
    const tl = gsap.timeline();
    tl.from(furniture, { autoAlpha: 0, y: CONFIG.entrance.y, duration: CONFIG.entrance.duration, ease: E, stagger: CONFIG.entrance.stagger }, 0)
      .from(ghosts, { autoAlpha: 0, duration: CONFIG.entrance.duration, ease: E, stagger: CONFIG.entrance.stagger / 2 }, 0.05)
      .from(trunks, { autoAlpha: 0, duration: CONFIG.wire.duration, ease: E }, 0.15);

    // the first year's seats land as part of the entrance, then the walk starts
    tl.add(() => paint(true), 0.2);

    if (CONFIG.autoplay.enabled) {
      st.autoplay = gsap.delayedCall(CONFIG.autoplay.delay + CONFIG.autoplay.dwell, function step() {
        if (st.touched || st.killed) return;
        if (st.index >= DATA.years.length - 1) return;
        setIndex(st.index + 1, true);
        moveKnob(tickX(st.index), true);
        st.autoplay = gsap.delayedCall(CONFIG.autoplay.dwell, step);
      });
    }
  };
  st.enter = enter;

  // ── drag / click / keyboard ──────────────────────────────────────────────
  const stopAutoplay = () => {
    st.touched = true;
    if (st.autoplay) st.autoplay.kill();
    st.autoplay = null;
  };

  // the stage is transform-scaled, so its own rect already carries the scale
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
    st.slider.setAttribute('data-dragging', '');
    onMove(e);
  };

  const onMove = (e) => {
    if (!st.dragging) return;
    const x = Math.max(L.slider.inset, Math.min(L.width - L.slider.inset, unitX(e.clientX)));
    moveKnob(x, false); // the knob tracks the finger; the year snaps as it passes
    setIndex(nearest(x), true);
  };

  const onUp = (e) => {
    if (!st.dragging) return;
    st.dragging = false;
    st.slider.removeAttribute('data-dragging');
    if (st.slider.hasPointerCapture(e.pointerId)) st.slider.releasePointerCapture(e.pointerId);
    moveKnob(tickX(st.index), true); // settle on the year it landed nearest
  };

  const onKey = (e) => {
    const k = e.key;
    let i = st.index;
    if (k === 'ArrowRight' || k === 'ArrowUp') i++;
    else if (k === 'ArrowLeft' || k === 'ArrowDown') i--;
    else if (k === 'Home') i = 0;
    else if (k === 'End') i = DATA.years.length - 1;
    else return;
    e.preventDefault();
    stopAutoplay();
    setIndex(i, true);
    moveKnob(tickX(st.index), true);
  };

  st.slider.addEventListener('pointerdown', onDown);
  st.slider.addEventListener('pointermove', onMove);
  st.slider.addEventListener('pointerup', onUp);
  st.slider.addEventListener('pointercancel', onUp);
  st.slider.addEventListener('keydown', onKey);

  // clicking a year label is the same control
  st.yearNodes.forEach((node, i) => {
    node.addEventListener('click', () => {
      stopAutoplay();
      setIndex(i, true);
      moveKnob(tickX(i), true);
    });
  });

  st.setYear = (year) => {
    stopAutoplay();
    const i = DATA.years.indexOf(year);
    if (i < 0) return;
    setIndex(i, true);
    moveKnob(tickX(i), true);
  };

  // ── plays on enter ───────────────────────────────────────────────────────
  // enter() is guarded, so the trigger keeps reporting after the first pass —
  // it is also what parks the marching ants when the panel scrolls away.
  const seen = (visible) => {
    st.visible = visible;
    syncCrawl();
    if (visible) enter();
  };

  const ScrollTrigger = window.ScrollTrigger;
  if (ScrollTrigger) {
    st.trigger = ScrollTrigger.create({
      trigger: mount,
      start: CONFIG.start,
      end: 'bottom top',
      onToggle: (self) => seen(self.isActive),
    });
  } else if (typeof IntersectionObserver !== 'undefined') {
    st.io = new IntersectionObserver((entries) => entries.forEach((en) => seen(en.isIntersecting)), {
      threshold: 0.15,
    });
    st.io.observe(mount);
  } else {
    seen(true);
  }

  return st;
}

// ===========================================================================
// boot
// ===========================================================================

export function initOrgGraph(scope) {
  if (!window.gsap) return;
  if (STYLE && !document.getElementById('hi-org-graph-styles')) {
    const tag = document.createElement('style');
    tag.id = 'hi-org-graph-styles';
    tag.textContent = STYLE;
    document.head.appendChild(tag);
  }
  destroyOrgGraph(); // Barba-safe: never stack a second set of listeners
  const mounts = (scope || document).querySelectorAll(MOUNT);
  mounts.forEach((m) => instances.push(create(m)));
}

export function destroyOrgGraph() {
  while (instances.length) {
    const st = instances.pop();
    st.killed = true;
    if (st.autoplay) st.autoplay.kill();
    if (st.crawls) st.crawls.forEach((tw) => tw.kill());
    if (st.trigger) st.trigger.kill();
    if (st.io) st.io.disconnect();
    if (st.ro) st.ro.disconnect();
    else window.removeEventListener('resize', st.fit);
    st.mount.innerHTML = '';
  }
}

if (typeof window !== 'undefined') {
  window.HIOrgGraph = {
    config: CONFIG,
    data: DATA,
    init: initOrgGraph,
    destroy: destroyOrgGraph,
    instances,
    setYear: (y) => instances.forEach((st) => st.setYear(y)),
  };
}
