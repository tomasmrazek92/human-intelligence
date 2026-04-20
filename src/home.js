import {
  revealDotGrid,
  revealChatBox,
  revealGraf,
  revealPlatformIllustration,
  revealResponse,
} from './graphAnimations';

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
