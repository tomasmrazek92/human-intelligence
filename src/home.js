import {
  revealDotGrid,
  revealChatBox,
  revealGraf,
  revealPlatformIllustration,
  revealResponse,
} from './graphAnimations';
import { initWhitePaperSwiper } from './osmo';

initWhitePaperSwiper();

// ── Hero graph ──────────────────────────────────────────────────────────────
$('.claude-dashboard').each(function () {
  const trigger = $(this);
  const chatBubble = trigger.find('[data-anim="chat-bubble"]');
  const chatResponse = trigger.find('[data-anim="response"]');

  gsap
    .timeline({ scrollTrigger: { trigger, start: '40 bottom', once: true } })
    .add(revealChatBox(chatBubble))
    .add(revealResponse(chatResponse), '>-1')
    .add(revealGraf(trigger), '>-2');
});

// ── Claude Feature ──────────────────────────────────────────────────────────────
$('[data-anim="claude-feature"]').each(function () {
  const trigger = $(this);
  const chatBubble = trigger.find('[data-anim="chat-bubble"]');
  const chatResponse = trigger.find('[data-anim="response"]');

  gsap
    .timeline({ scrollTrigger: { trigger, start: '40% bottom', once: true } })
    .add(revealChatBox(chatBubble))
    .add(revealResponse(chatResponse), '>-1')
    .add(revealGraf(trigger), '>-2');
});

// ── Chat Feature ──────────────────────────────────────────────────────────────
$('[data-anim="chat-feature"]').each(function () {
  const trigger = $(this);
  const chatBubble = trigger.find('[data-anim="chat-bubble"]');
  const chatResponse = trigger.find('[data-anim="response"]');

  gsap
    .timeline({ scrollTrigger: { trigger, start: '40% bottom', once: true } })
    .add(revealChatBox(chatBubble))
    .add(revealResponse(chatResponse), '>-1')
    .add(revealGraf(trigger), '>-2');
});

// ── Dashboard illustration (hero) ───────────────────────────────────────────
console.log('[dashboard] gsap loaded?', typeof gsap, 'ScrollTrigger loaded?', typeof ScrollTrigger);
console.log('[dashboard] matched count:', $('[data-anim="dashboard"]').length);
console.log('[dashboard] .home-hero_visuals count:', $('.home-hero_visuals').length);

$('[data-anim="dashboard"]').each(function () {
  console.log('[dashboard] each fired', this);
  const $el = $(this);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.log('[dashboard] reduced motion — bailing');
    return;
  }

  const dashboardImg = $el.find('.home-hero_dashboard-img')[0];
  const sidebar = $el.find('#sidebar')[0];
  const tabs = $el.find('#Tab, #Tab_2, #Tab_3, #Tab_4, #Tab_5, #Tab_6, #Tab_7').toArray();
  const title = $el.find('#title')[0];
  const search = $el.find('#search')[0];

  // Sibling .home-hero_options rows (live alongside the dashboard inside .home-hero_visuals)
  const $optionRows = $('.home-hero_options-row');
  const optionsRow1 = $optionRows.eq(0).find('.home-hero_options-item').toArray();
  const optionsRow2 = $optionRows.eq(1).find('.home-hero_options-item').toArray();

  console.log('[dashboard] found:', {
    sidebar: !!sidebar,
    tabs: tabs.length,
    title: !!title,
    search: !!search,
    optionsRow1: optionsRow1.length,
    optionsRow2: optionsRow2.length,
  });

  const rows = [
    {
      row: $el.find('#row')[0],
      head: $el.find('#head')[0],
      cards: $el.find('#item_2, #item_3').toArray(),
    },
    {
      row: $el.find('#row_2')[0],
      head: $el.find('#head_2')[0],
      cards: $el.find('#item_4, #item_5').toArray(),
    },
    {
      row: $el.find('#row_3')[0],
      head: $el.find('#head_3')[0],
      cards: $el.find('#item_6, #item_7').toArray(),
    },
  ];

  const leftCards = rows.map((r) => r.cards[0]).filter(Boolean);
  const rightCards = rows.map((r) => r.cards[1]).filter(Boolean);
  const allHeads = rows.map((r) => r.head).filter(Boolean);
  const allRowEls = rows.map((r) => r.row).filter(Boolean);

  // Initial hidden state
  if (sidebar) gsap.set(sidebar, { autoAlpha: 0, x: -30 });
  if (tabs.length) gsap.set(tabs, { autoAlpha: 0, x: -10 });
  if (title) gsap.set(title, { autoAlpha: 0, y: -20 });
  if (search) gsap.set(search, { autoAlpha: 0, y: -15 });
  if (allRowEls.length) gsap.set(allRowEls, { autoAlpha: 0 });
  if (allHeads.length) gsap.set(allHeads, { autoAlpha: 0 });
  if (leftCards.length) gsap.set(leftCards, { autoAlpha: 0, x: -40 });
  if (rightCards.length) gsap.set(rightCards, { autoAlpha: 0, x: 40 });
  if (optionsRow1.length) gsap.set(optionsRow1, { autoAlpha: 0, x: -50 });
  if (optionsRow2.length) gsap.set(optionsRow2, { autoAlpha: 0, x: 50 });
  if (dashboardImg) gsap.set(dashboardImg, { autoAlpha: 0, y: 20 });

  console.log('[dashboard] building paused timeline...');
  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: 'back.out(1.4)' },
    onStart: () => console.log('[dashboard] timeline onStart'),
    onComplete: () => console.log('[dashboard] timeline onComplete'),
  });

  // 0a. Dashboard SVG wrapper fades up first
  if (dashboardImg) {
    tl.to(dashboardImg, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0);
  }

  // 0b. Options rows slide in from opposite sides, in parallel with sidebar
  if (optionsRow1.length) {
    tl.to(
      optionsRow1,
      { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' },
      0
    );
  }
  if (optionsRow2.length) {
    tl.to(
      optionsRow2,
      { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' },
      0.15
    );
  }

  // 1. Sidebar slides in
  if (sidebar) tl.to(sidebar, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power3.out' }, 0);

  // 2. Tabs stagger from left
  if (tabs.length) {
    tl.to(tabs, { autoAlpha: 1, x: 0, duration: 0.25, stagger: 0.05 }, '>-0.2');
  }

  // 3. Title drops from above
  if (title) tl.to(title, { autoAlpha: 1, y: 0, duration: 0.3 }, '>-0.15');

  // 4. Search drops from above
  if (search) tl.to(search, { autoAlpha: 1, y: 0, duration: 0.3 }, '>-0.15');

  // 5–7. Rows: container shows, header fades, cards slide in from opposite sides
  rows.forEach(({ row, head, cards }) => {
    if (row) tl.set(row, { autoAlpha: 1 });
    if (head) tl.to(head, { autoAlpha: 1, duration: 0.15, ease: 'power2.out' }, '>-0.05');
    if (cards.length) {
      tl.to(
        cards,
        { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.04, ease: 'power3.out' },
        '>-0.15'
      );
    }
  });

  console.log('[dashboard] timeline built — duration:', tl.duration(), '— attaching ScrollTrigger');
  ScrollTrigger.create({
    trigger: '.home-hero_visuals',
    start: 'bottom bottom',
    once: true,
    onEnter: () => tl.play(),
  });
});

// ── Platform illustration ───────────────────────────────────────────────────
$('[data-anim="platform-top"]').each(function () {
  gsap
    .timeline({
      delay: 1,
      scrollTrigger: { trigger: this, start: 'top bottom', once: true },
      onComplete: () => window.dispatchEvent(new Event('platform-illustration-complete')),
    })
    .add(revealPlatformIllustration(this));
});

$('[data-anim="platform"]').each(function () {
  gsap
    .timeline({
      delay: 1,
      scrollTrigger: { trigger: this, start: 'top bottom', once: true },
      onComplete: () => window.dispatchEvent(new Event('platform-illustration-complete')),
    })
    .add(revealPlatformIllustration(this));

  // Agent box card fan hover
  const $allBoxes = $(this).find('.platform-illustration_agent-box');
  let activeBox = null;

  $allBoxes.each(function () {
    const $box = $(this);

    $box.on('mouseenter', function () {
      activeBox = this;
      const $prev = $box.prevAll('.platform-illustration_agent-box');
      const $next = $box.nextAll('.platform-illustration_agent-box');

      gsap.killTweensOf($allBoxes.toArray());
      $allBoxes.each(function () {
        gsap.set(this, { zIndex: 'auto' });
      });
      gsap.set(this, { zIndex: 10 });

      gsap.to(this, { rotation: -4, y: -14, scale: 1.03, duration: 0.3, ease: 'power2.out' });
      gsap.to($prev.toArray(), {
        x: 18,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
        stagger: 0.04,
      });
      gsap.to($next.toArray(), {
        x: -18,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
        stagger: 0.04,
      });
    });

    $box.on('mouseleave', function () {
      if (activeBox !== this) return;
      activeBox = null;

      gsap.killTweensOf($allBoxes.toArray());
      gsap.to($allBoxes.toArray(), {
        x: 0,
        rotation: 0,
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power2.inOut',
        onComplete: () =>
          $allBoxes.each(function () {
            gsap.set(this, { zIndex: 'auto' });
          }),
      });
    });
  });
});
