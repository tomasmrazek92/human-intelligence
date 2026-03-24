import { revealChatBox, revealGraf } from './graphAnimations';

// ── Hero scatter chart ───────────────────────────────────────────────────────
$('[data-anim="natural-lang-hero"]').each(function () {
  const trigger = $(this);
  const svg = trigger.find('svg')[0] || trigger;

  const side = svg.querySelector('#side');
  const header = svg.querySelector('#Header');
  const filters = svg.querySelector('#filters');
  const barChart = svg.querySelector('#Bar\\ Chart');
  const frame17 = svg.querySelector('#Frame\\ 17');
  const navItems = side ? [...side.querySelectorAll('#items > *')] : [];

  const chatBubble = trigger.find('[data-anim="chat-bubble"]');

  // Set starting states before timeline runs
  gsap.set(side, { autoAlpha: 0, x: -24 });
  gsap.set(header, { autoAlpha: 0, y: -18 });
  gsap.set(filters, { autoAlpha: 0 });
  gsap.set(barChart, { autoAlpha: 0, scale: 0.96, transformOrigin: 'center center' });
  gsap.set(frame17, { autoAlpha: 0, x: -100 });
  if (navItems.length) gsap.set(navItems, { autoAlpha: 0, x: -10 });

  gsap
    .timeline({ delay: 0.5 })
    // Sidebar + header land together
    .to(side, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0)
    .to(header, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0.05)
    // Nav items stagger in shortly after sidebar
    .to(navItems, { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power2.out', stagger: 0.05 }, 0.25)
    // Filter bar fades in
    .to(filters, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 0.4)
    // Right panel + main chart arrive last
    .to(barChart, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, 0.5)
    .to(frame17, { autoAlpha: 1, x: 0, duration: 0.45, ease: 'power2.out' }, 0.8)
    .add(revealGraf(trigger))
    .add(revealChatBox(chatBubble), '<');
});

$('[data-anim="product-chart"]').each(function () {
  const trigger = $(this);
  const chatBubble = trigger.find('[data-anim="chat-bubble"]');

  gsap
    .timeline({ scrollTrigger: { trigger, start: 'top 80%', once: true } })
    .add(revealChatBox(chatBubble), 0)
    .add(revealGraf(trigger), '<1');
});
