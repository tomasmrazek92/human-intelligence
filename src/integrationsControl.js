/* eslint-disable no-undef */
/* HI — integrations control
 *
 * Drives the Carta / Workday / Greenhouse tab card. Webflow supplies ONE row as
 * a template; this clones it per item and sets the state attributes below. The
 * head shows all three logos in the markup — only the active one stays visible.
 *
 * ── Attribute contract on each row ──────────────────────────────────────────
 *   data-status="unlocked"  a real permission the user can toggle
 *   data-status="locked"    always-on; padlock shown, toggle hidden
 *   data-state="active"     toggle on
 *   data-state="inactive"   toggle off
 *   data-state="disabled"   greyed out (the scopes Carta deliberately excludes)
 *
 * JS sets attributes and nothing else — every visual rule lives in CSS. The
 * head is switched by REORDERING: the active logo is moved to first child,
 * because `.integrations-control_head-box svg:not(:first-child)` is what hides
 * the others. Setting display here would fight that rule.
 */

const ATTR = {
  status: { open: 'unlocked', locked: 'locked' },
  state: { on: 'active', off: 'inactive', dim: 'disabled' },
};

// Content per tab. `lock` shows the padlock and hides the toggle, `on` turns the
// toggle on, `dim` greys the row out. Order here is the order rendered.
const TABS = [
  {
    id: 'carta',
    nav: 'Carta',
    title: 'Integrate with Carta',
    desc: 'Connect employee equity grants and outstanding shares per employee. Leave investor records and the full cap table where they are.',
    items: [
      { label: 'employee_equity_grants', dim: true },
      { label: 'outstanding_shares_per_employee', dim: true },
      { label: 'investors and cap table', dim: true },
      { label: 'read_issuer_shareclasses', on: true },
      { label: 'read_issuer_draftsecurities', on: true },
      { label: 'read_issuer_interests', on: true },
      { label: 'read_issuer_capitalizationtablesummary', on: true },
      { label: 'read_issuer_stakeholdercapitalizationtable', on: true },
      { label: 'read_issuer_securitiestemplates', on: true },
    ],
  },
  {
    id: 'workday',
    nav: 'Workday',
    title: 'Integrate with Workday',
    desc: 'Once saved, API keys, secrets, and tokens are encrypted and never shown again to protect your credentials.',
    items: [
      { label: 'Staffing', lock: true },
      { label: 'Compensation', lock: true },
      { label: 'Recruiting', on: true },
      { label: 'Talent and Performance', on: true },
      { label: 'Payroll' },
      { label: 'Financial Management' },
      { label: 'Absence Management' },
      { label: 'Recruiting' },
      { label: 'Benefits' },
    ],
  },
  {
    id: 'greenhouse',
    nav: 'Greenhouse',
    title: 'Integrate with Greenhouse',
    desc: 'Connect your Greenhouse account to sync the data you choose into Human Intelligence.',
    items: [
      { label: 'Candidates', lock: true },
      { label: 'Applications', lock: true },
      { label: 'Jobs', lock: true },
      { label: 'Offers', on: true },
      { label: 'Scorecards' },
      { label: 'Approvals' },
      { label: 'Users & Permissions' },
      { label: 'Organization Setup' },
      { label: 'Compliance & Demographics' },
      { label: 'Custom Fields' },
    ],
  },
];

const SWITCH = { fade: 0.18, rowStagger: 0.025, rowShift: 6 };

// On every tab change the logo box makes a quarter-turn and dips, swapping the
// logo at the midpoint where it is smallest — so the change happens under cover
// of the motion rather than reading as a flip. Meanwhile the connector icon
// between the two boxes turns a full circle, which reads as "reconnecting".
// Only the box and the icon transform, so this is safe whatever the layout of
// the logos inside the box.
const LOGO = {
  spin: 0.62, // total time for the switch
  boxRotate: 90, // quarter-turn out and back on the logo box
  iconRotate: 360, // one full turn on the connector icon
  dip: 0.72, // how small the box gets at the midpoint
  inEase: 'power2.in',
  outEase: 'back.out(1.7)',
  iconEase: 'power2.inOut',
};

const AUTOPLAY = {
  enabled: true,
  dwell: 5, // seconds a tab holds before advancing
  // The card must reach the middle band of the viewport. Expressed as a margin
  // rather than a threshold ratio on purpose: a ratio can never be satisfied by
  // an element taller than the viewport, which this card is on mobile.
  viewMargin: '-15%',
  resumeAfterClick: true, // false = a click stops the carousel for good
};

export function initIntegrationsControl(scope) {
  const root = (scope || document).querySelector('[data-tab-active]');
  if (!root) return;

  const list = root.querySelector('.integrations-control_list');
  const titleEl = root.querySelector('.integrations-control_title');
  const descEl = root.querySelector('.integrations-control_desc');
  const logos = [...root.querySelectorAll('[data-logo]')];
  if (!list || !titleEl || !descEl) return;

  // The first row in Webflow is the template. Take it out of the document and
  // keep it as the prototype, so the Designer only ever holds one row.
  const template = list.querySelector('.integrations-control_item');
  if (!template) return;
  const proto = template.cloneNode(true);
  template.remove();

  // Anything that is not a row (the bottom fade) stays put and stays last.
  const overlay = list.querySelector('.integrations-control_list-overlay');

  const navRoot =
    (scope || document).querySelector('.integrations-control_nav') ||
    root.parentElement?.querySelector('.integrations-control_nav');
  const navItems = navRoot ? [...navRoot.querySelectorAll('.integrations-control_nav-item')] : [];

  function buildRow(item) {
    const row = proto.cloneNode(true);
    const title = row.querySelector('.integrations-control_item-title');

    if (title) title.textContent = item.label;

    row.setAttribute('data-status', item.lock ? ATTR.status.locked : ATTR.status.open);
    row.setAttribute(
      'data-state',
      item.dim ? ATTR.state.dim : item.on ? ATTR.state.on : ATTR.state.off
    );

    return row;
  }

  // Reorder rather than hide — the head CSS shows whichever svg is first.
  function placeLogo(tab) {
    const active = logos.filter((el) => el.getAttribute('data-logo') === tab.id)[0];
    if (active && active.parentNode && active !== active.parentNode.firstElementChild) {
      active.parentNode.insertBefore(active, active.parentNode.firstElementChild);
    }
  }

  const logoBox = logos.length ? logos[0].parentNode : null;
  // the plug icon sitting between the two boxes
  const headIcon = root.querySelector('.integrations-control_head-row > svg');

  function spinLogo(tab) {
    if (!logoBox || typeof gsap === 'undefined') {
      placeLogo(tab);
      return;
    }
    const half = LOGO.spin / 2;
    const tl = gsap.timeline();

    tl.set(logoBox, { transformOrigin: 'center center' })
      .to(logoBox, { rotate: LOGO.boxRotate, scale: LOGO.dip, duration: half, ease: LOGO.inEase }, 0)
      .add(() => placeLogo(tab), half) // swapped at its smallest, mid-turn
      .to(logoBox, { rotate: 0, scale: 1, duration: half, ease: LOGO.outEase }, half);

    if (headIcon) {
      tl.set(headIcon, { transformOrigin: 'center center' }, 0).fromTo(
        headIcon,
        { rotate: 0 },
        { rotate: LOGO.iconRotate, duration: LOGO.spin, ease: LOGO.iconEase },
        0
      );
    }

    // 360 === 0 and the box is back at 0, so clearing is visually a no-op
    tl.set([logoBox, headIcon].filter(Boolean), { clearProps: 'transform' });
  }

  function render(tab) {
    root.setAttribute('data-tab-active', tab.id);
    titleEl.textContent = tab.title;
    descEl.textContent = tab.desc;

    list.querySelectorAll('.integrations-control_item').forEach((el) => el.remove());
    const frag = document.createDocumentFragment();
    tab.items.forEach((item) => frag.appendChild(buildRow(item)));
    overlay ? list.insertBefore(frag, overlay) : list.appendChild(frag);

    navItems.forEach((el, i) => el.classList.toggle('is-active', TABS[i] === tab));

    return [...list.querySelectorAll('.integrations-control_item')];
  }

  let current = null;
  function show(tab, animate) {
    if (tab === current) return;
    current = tab;
    const rows = render(tab);
    if (!animate || typeof gsap === 'undefined') {
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
        clearProps: 'transform',
      }
    );
  }

  // ── progress bars ─────────────────────────────────────────────────────────
  // The fill inside each nav line doubles as the dwell timer. Driven by rAF
  // rather than a tween so pausing off-screen freezes it exactly where it was,
  // and so the standalone build needs no GSAP.
  const fills = navItems.map(
    (el) => el.querySelector('.integrations-control_nav-active') || el.querySelector('.integrations-control_nav-line')
  );
  fills.forEach((el) => {
    if (!el) return;
    el.style.transformOrigin = 'left center';
    el.style.transform = 'scaleX(0)';
    el.style.willChange = 'transform';
  });

  function paint(index, p) {
    fills.forEach((el, i) => {
      if (el) el.style.transform = 'scaleX(' + (i === index ? p : 0) + ')';
    });
  }

  // ── autoplay ──────────────────────────────────────────────────────────────
  const reduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let index = 0;
  let elapsed = 0;
  let last = 0;
  let running = false;
  let rafId = null;
  let stopped = !AUTOPLAY.enabled || reduced;

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const dt = last ? (now - last) / 1000 : 0;
    last = now;
    if (!running || stopped) return;

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
      last = 0; // drop the gap spent off-screen instead of fast-forwarding
      if (rafId == null) rafId = requestAnimationFrame(frame);
    }
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => setRunning(entries[0].isIntersecting), {
      rootMargin: AUTOPLAY.viewMargin + ' 0px',
      threshold: 0,
    }).observe(root);
  } else {
    setRunning(true);
  }

  // ── nav ───────────────────────────────────────────────────────────────────
  navItems.forEach((el, i) => {
    if (!TABS[i]) return;
    el.style.cursor = 'pointer';
    el.setAttribute('role', 'tab');
    el.setAttribute('tabindex', '0');
    const go = () => {
      index = i;
      elapsed = 0;
      if (!AUTOPLAY.resumeAfterClick) stopped = true;
      paint(index, stopped ? 1 : 0);
      show(TABS[i], true);
    };
    el.addEventListener('click', go);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    });
  });

  // Honour whichever tab Webflow was left on, so the Designer preview matches.
  const initial = TABS.filter((t) => t.id === root.getAttribute('data-tab-active'))[0] || TABS[0];
  index = TABS.indexOf(initial);
  show(initial, false);
  paint(index, stopped ? 1 : 0); // reduced motion: show the bar filled, not empty
}
