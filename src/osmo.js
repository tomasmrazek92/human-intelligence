export function initGlobalParallax() {
  const mm = gsap.matchMedia();

  mm.add(
    {
      isMobile: '(max-width:479px)',
      isMobileLandscape: '(max-width:767px)',
      isTablet: '(max-width:991px)',
      isDesktop: '(min-width:992px)',
    },
    (context) => {
      const { isMobile, isMobileLandscape, isTablet } = context.conditions;

      const ctx = gsap.context(() => {
        document.querySelectorAll('[data-parallax="trigger"]').forEach((trigger) => {
          // Check if this trigger has to be disabled on smaller breakpoints
          const disable = trigger.getAttribute('data-parallax-disable') || 'tablet';
          if (
            (disable === 'mobile' && isMobile) ||
            (disable === 'mobileLandscape' && isMobileLandscape) ||
            (disable === 'tablet' && isTablet)
          ) {
            return;
          }

          // Optional: you can target an element inside a trigger if necessary
          const target = trigger.querySelector('[data-parallax="target"]') || trigger;

          // Get the direction value to decide between xPercent or yPercent tween
          const direction = trigger.getAttribute('data-parallax-direction') || 'vertical';
          const prop = direction === 'horizontal' ? 'xPercent' : 'yPercent';

          // Get the scrub value, our default is 'true' because that feels nice with Lenis
          const scrubAttr = trigger.getAttribute('data-parallax-scrub');
          const scrub = scrubAttr ? parseFloat(scrubAttr) : true;

          // Get the start position in %
          const startAttr = trigger.getAttribute('data-parallax-start');
          const startVal = startAttr !== null ? parseFloat(startAttr) : 20;

          // Get the end position in %
          const endAttr = trigger.getAttribute('data-parallax-end');
          const endVal = endAttr !== null ? parseFloat(endAttr) : -20;

          // Get the start value of the ScrollTrigger
          const scrollStart = trigger.getAttribute('data-parallax-scroll-start') || 'top bottom';

          // Get the end value of the ScrollTrigger
          const scrollEnd = trigger.getAttribute('data-parallax-scroll-end') || 'bottom top';

          gsap.fromTo(
            target,
            { [prop]: startVal },
            {
              [prop]: endVal,
              ease: 'none',
              scrollTrigger: {
                trigger,
                start: scrollStart,
                end: scrollEnd,
                scrub,
              },
            }
          );
        });
      });

      return () => ctx.revert();
    }
  );
}

export function initScrambleText() {
  if (window.innerWidth < 992) return;

  // Function to reveal stuff on load
  function initScrambleOnLoad() {
    let targets = document.querySelectorAll('[data-scramble="load"]');

    targets.forEach((target) => {
      // split into seperate words + letters
      let split = new SplitText(target, {
        type: 'words, chars',
        wordsClass: 'word',
        charsClass: 'char',
      });

      gsap.to(split.words, {
        duration: 1.2,
        stagger: 0.01,
        scrambleText: {
          text: '{original}',
          chars: '01', // experiment with different scramble characters here
          speed: 0.85,
        },
        // Once animation is done, revert the split to reduce DOM size
        onComplete: () => split.revert(),
      });
    });
  }

  // Function to reveal stuff on scroll
  function initScrambleOnScroll() {
    let targets = document.querySelectorAll('[data-scramble="scroll"]');

    targets.forEach((target) => {
      let split = new SplitText(target, {
        type: 'words, chars',
        wordsClass: 'word',
        charsClass: 'char',
      });

      gsap.to(split.words, {
        duration: 2,
        stagger: 0.015,
        scrambleText: {
          text: '{original}',
          chars: '01', // experiment with different scramble characters here
          speed: 0.1,
        },
        scrollTrigger: {
          trigger: target,
          start: 'top bottom',
          once: true,
        },
        // Once animation is done, revert the split to reduce DOM size
        onComplete: () => split.revert(),
      });
    });
  }

  function initScrambleOnHover() {
    let targets = document.querySelectorAll('[data-scramble-hover="link"]');

    targets.forEach((target) => {
      let textEl = target.querySelector('[data-scramble-hover="target"]');
      let originalText = textEl.textContent; // save original text
      let customHoverText = textEl.getAttribute('data-scramble-text'); // if this attribute is present, take a custom hover text

      let split = new SplitText(textEl, {
        type: 'words, chars',
        wordsClass: 'word',
        charsClass: 'char',
      });

      target.addEventListener('mouseenter', () => {
        gsap.to(textEl, {
          duration: 1,
          scrambleText: {
            text: customHoverText ? customHoverText : originalText,
            chars: '01',
          },
        });
      });

      target.addEventListener('mouseleave', () => {
        gsap.to(textEl, {
          duration: 0.6,
          scrambleText: {
            text: originalText,
            speed: 2,
            chars: '01',
          },
        });
      });
    });
  }

  initScrambleOnLoad();
  initScrambleOnScroll();
  initScrambleOnHover();
}

export function initContentRevealScroll() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 992;

  const CONFIG = {
    from: { yPercent: 10, blur: 10 },
    duration: 0.55,
    ease: 'cubic-bezier(0.38, 0.005, 0.215, 1)',
  };

  const fromState = {
    ...(isMobile ? {} : { yPercent: CONFIG.from.yPercent }),
    autoAlpha: 0,
    filter: `blur(${CONFIG.from.blur}px)`,
  };
  const toState = {
    ...(isMobile ? {} : { yPercent: 0 }),
    autoAlpha: 1,
    filter: 'blur(0px)',
    duration: CONFIG.duration,
    ease: CONFIG.ease,
  };

  const ctx = gsap.context(() => {
    document.querySelectorAll('[data-reveal-group]').forEach((groupEl) => {
      const groupStaggerSec = (parseFloat(groupEl.getAttribute('data-stagger')) || 100) / 1000;
      const triggerStart = groupEl.getAttribute('data-start') || 'top 80%';

      // Reduced motion: show immediately
      if (prefersReduced) {
        gsap.set(groupEl, { clearProps: 'all', yPercent: 0, autoAlpha: 1 });
        return;
      }

      // If no direct children, animate the group element itself
      const directChildren = Array.from(groupEl.children).filter(
        (el) =>
          el.nodeType === 1 &&
          !el.hasAttribute('data-reveal-skip') &&
          !el.querySelector('[data-anim="dots"], [data-anim="graph-base"], [data-anim="graph-mask"]')
      );
      if (!directChildren.length) {
        gsap.set(groupEl, fromState);
        ScrollTrigger.create({
          trigger: groupEl,
          start: triggerStart,
          once: true,
          onEnter: () =>
            gsap.to(groupEl, {
              ...toState,
              onComplete: () => gsap.set(groupEl, { clearProps: 'all' }),
            }),
        });
        return;
      }

      // Build animation slots: item or nested
      const slots = [];
      directChildren.forEach((child) => {
        const nestedGroup = child.matches('[data-reveal-group-nested]')
          ? child
          : child.querySelector(':scope [data-reveal-group-nested]');

        if (nestedGroup) {
          const includeParent =
            child.getAttribute('data-ignore') === 'false' ||
            nestedGroup.getAttribute('data-ignore') === 'false';
          slots.push({ type: 'nested', parentEl: child, nestedEl: nestedGroup, includeParent });
        } else {
          slots.push({ type: 'item', el: child });
        }
      });

      // Initial hidden state
      slots.forEach((slot) => {
        if (slot.type === 'item') {
          gsap.set(slot.el, fromState);
        } else {
          if (slot.includeParent) gsap.set(slot.parentEl, fromState);
          Array.from(slot.nestedEl.children)
            .filter((el) => !el.hasAttribute('data-reveal-skip'))
            .forEach((target) => gsap.set(target, fromState));
        }
      });

      // Reveal sequence
      ScrollTrigger.create({
        trigger: groupEl,
        start: triggerStart,
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();

          slots.forEach((slot, slotIndex) => {
            const slotTime = slotIndex * groupStaggerSec;

            if (slot.type === 'item') {
              tl.to(
                slot.el,
                {
                  ...toState,
                  onComplete: () => gsap.set(slot.el, { clearProps: 'all' }),
                },
                slotTime
              );
            } else {
              if (slot.includeParent) {
                tl.to(
                  slot.parentEl,
                  {
                    ...toState,
                    onComplete: () => gsap.set(slot.parentEl, { clearProps: 'all' }),
                  },
                  slotTime
                );
              }
              const nestedMs = parseFloat(slot.nestedEl.getAttribute('data-stagger'));
              const nestedStaggerSec = isNaN(nestedMs) ? groupStaggerSec : nestedMs / 1000;
              Array.from(slot.nestedEl.children)
                .filter((el) => !el.hasAttribute('data-reveal-skip'))
                .forEach((nestedChild, nestedIndex) => {
                  tl.to(
                    nestedChild,
                    {
                      ...toState,
                      onComplete: () => gsap.set(nestedChild, { clearProps: 'all' }),
                    },
                    slotTime + nestedIndex * nestedStaggerSec
                  );
                });
            }
          });
        },
      });
    });
  });

  return () => ctx.revert();
}

export function initHighlightMarkerTextReveal() {
  const CONFIG = {
    totalDuration: 0.9,
    wordDuration: 0.7,
    ease: 'cubic-bezier(0.38, 0.005, 0.215, 1)',
    from: { yPercent: 10, blur: 10 },
    scrollStart: 'top 90%',
  };

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    document.querySelectorAll('[data-highlight-marker-reveal]').forEach((el) => {
      gsap.set(el, { autoAlpha: 1 });
    });
    return;
  }

  const elements = document.querySelectorAll('[data-highlight-marker-reveal]');
  if (!elements.length) return;

  elements.forEach((el) => {
    const scrollStart = el.getAttribute('data-marker-scroll-start') || CONFIG.scrollStart;

    const split = SplitText.create(el, {
      type: 'words',
      autoSplit: true,
      onSplit(self) {
        gsap.set(self.words, {
          yPercent: CONFIG.from.yPercent,
          autoAlpha: 0,
          filter: `blur(${CONFIG.from.blur}px)`,
        });

        gsap.set(el, { autoAlpha: 1 });

        ScrollTrigger.create({
          trigger: el,
          start: scrollStart,
          once: true,
          onEnter: () => {
            const count = self.words.length;
            const stagger =
              count > 1 ? (CONFIG.totalDuration - CONFIG.wordDuration) / (count - 1) : 0;
            gsap.to(self.words, {
              yPercent: 0,
              autoAlpha: 1,
              filter: 'blur(0px)',
              stagger: stagger,
              duration: CONFIG.wordDuration,
              ease: CONFIG.ease,
            });
          },
        });
      },
    });
  });
}

export function initWhitePaperSwiper() {
  const el = document.querySelector('.white-paper_testimonials');
  if (!el) return;

  const swiper = new Swiper(el, {
    slidesPerView: 1,
    autoHeight: true,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    speed: 600,
    loop: true,
    autoplay: false,
    pagination: {
      el: '.swiper-navigation',
      bulletClass: 'swiper-dot',
      bulletActiveClass: 'cc-active',
      clickable: true,
    },
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        swiper.autoplay.start();
        observer.disconnect();
      }
    },
    { threshold: 0.3 }
  );
  observer.observe(el);
}
