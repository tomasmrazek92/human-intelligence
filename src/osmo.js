export function initGlobalParallax(nextPage) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const scope = nextPage || document;
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
        scope.querySelectorAll('[data-parallax="trigger"]').forEach((trigger) => {
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

export function initScrambleText(nextPage) {
  if (window.innerWidth < 992) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const scope = nextPage || document;

  // Function to reveal stuff on load
  function initScrambleOnLoad() {
    let targets = scope.querySelectorAll('[data-scramble="load"]');

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
    let targets = scope.querySelectorAll('[data-scramble="scroll"]');

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
    let targets = scope.querySelectorAll('[data-scramble-hover="link"]');

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

export function initContentRevealScroll(nextPage) {
  const scope = nextPage || document;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 992;

  const CONFIG = {
    from: { yPercent: 10, blur: 10 },
    duration: 0.55,
    ease: 'cubic-bezier(0.38, 0.005, 0.215, 1)',
  };

  const HEADING_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);

  function getFromState(el) {
    const useBlur = !isMobile || HEADING_TAGS.has(el.tagName);
    return {
      ...(isMobile ? {} : { yPercent: CONFIG.from.yPercent }),
      autoAlpha: 0,
      ...(useBlur ? { filter: `blur(${CONFIG.from.blur}px)` } : {}),
    };
  }
  function getToState(el) {
    const useBlur = !isMobile || HEADING_TAGS.has(el.tagName);
    return {
      ...(isMobile ? {} : { yPercent: 0 }),
      autoAlpha: 1,
      ...(useBlur ? { filter: 'blur(0px)' } : {}),
      duration: CONFIG.duration,
      ease: CONFIG.ease,
    };
  }

  const ctx = gsap.context(() => {
    scope.querySelectorAll('[data-reveal-group]').forEach((groupEl) => {
      const groupStaggerSec = (parseFloat(groupEl.getAttribute('data-stagger')) || 100) / 1000;
      const triggerStart = groupEl.getAttribute('data-start') || 'top 80%';

      // Reduced motion: show immediately
      if (prefersReduced) {
        gsap.set(groupEl, { clearProps: 'all', yPercent: 0, autoAlpha: 1 });
        return;
      }

      // If no direct children, animate the group element itself
      const directChildren = Array.from(groupEl.children).filter(
        (el) => el.nodeType === 1 && !el.hasAttribute('data-reveal-skip')
      );
      if (!directChildren.length) {
        gsap.set(groupEl, getFromState(groupEl));
        ScrollTrigger.create({
          trigger: groupEl,
          start: triggerStart,
          once: true,
          onEnter: () =>
            gsap.to(groupEl, {
              ...getToState(groupEl),
              onComplete: () => gsap.set(groupEl, { clearProps: 'all' }),
            }),
        });
        return;
      }

      // Collect reveal entries by walking the group tree RECURSIVELY, so the
      // stagger cascades through ANY depth of nested groups. The old builder
      // only descended one level: a [data-reveal-group-nested] inside another
      // one had its children treated as a single flat slot, so they all fired
      // together instead of cascading. Each nested group now descends a level —
      // its children stagger by its own data-stagger (fallback: the parent's)
      // starting at that nested group's own slot time.
      //
      //   data-reveal-skip / data-ignore="true" → skip the element AND its subtree
      //   data-ignore="false" on a nested group → ALSO reveal the wrapper itself
      //                                           (default: children only)
      const staggerOf = (el, fallback) => {
        const ms = parseFloat(el.getAttribute('data-stagger'));
        return isNaN(ms) ? fallback : ms / 1000;
      };
      const isSkipped = (el) =>
        el.hasAttribute('data-reveal-skip') || el.getAttribute('data-ignore') === 'true';

      const wrapsNestedGroup = (el) => !!el.querySelector('[data-reveal-group-nested]');

      const entries = []; // flat, time-ordered list: { el, time }
      const walk = (group, baseTime, stagger) => {
        let slot = 0;
        Array.from(group.children).forEach((child) => {
          if (child.nodeType !== 1 || isSkipped(child)) return;

          const time = baseTime + slot * stagger;
          slot += 1;

          const isNested = child.matches('[data-reveal-group-nested]');
          // A plain element that happens to contain a nested group somewhere
          // below it. Treated as TRANSPARENT: we descend through it so its own
          // children each get a beat, but the wrapper's box isn't animated.
          //
          // This is the part that has to be recursive rather than a search for
          // nested groups. A wrapper holds a mix — some children are nested
          // groups, some are just content (a heading block next to a quote
          // card). Hunting only for the groups reaches the groups and silently
          // drops every plain sibling, which never gets hidden or revealed.
          const isWrapper = !isNested && wrapsNestedGroup(child);

          if (isNested || isWrapper) {
            // data-ignore="false" opts the element itself into the reveal, on
            // top of the cascade running through its children.
            if (child.getAttribute('data-ignore') === 'false') {
              entries.push({ el: child, time });
            }
            // A nested group restarts the stagger with its own data-stagger;
            // a transparent wrapper just carries the current one down.
            walk(child, time, isNested ? staggerOf(child, stagger) : stagger);
            return;
          }

          entries.push({ el: child, time });
        });
      };
      walk(groupEl, 0, groupStaggerSec);

      // Initial hidden state
      entries.forEach(({ el }) => gsap.set(el, getFromState(el)));

      // Mobile: per-child triggers (vertical layout means many children sit
      // below the fold when the group enters viewport — without per-child
      // triggers their reveal would play unseen)
      if (isMobile) {
        const revealEl = (el) => {
          ScrollTrigger.create({
            trigger: el,
            start: triggerStart,
            once: true,
            onEnter: () =>
              gsap.to(el, {
                ...getToState(el),
                onComplete: () => gsap.set(el, { clearProps: 'all' }),
              }),
          });
        };

        // Times are irrelevant here — each element waits for its own scroll
        // position — but the recursive walk still decides WHICH elements
        // animate, so deep nests are covered on mobile too.
        entries.forEach(({ el }) => revealEl(el));
        return;
      }

      // Desktop: single group trigger drives a staggered timeline
      ScrollTrigger.create({
        trigger: groupEl,
        start: triggerStart,
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();
          entries.forEach(({ el, time }) => {
            tl.to(
              el,
              {
                ...getToState(el),
                onComplete: () => gsap.set(el, { clearProps: 'all' }),
              },
              time
            );
          });
        },
      });
    });
  });

  return () => ctx.revert();
}

export function initHighlightMarkerTextReveal(nextPage) {
  const scope = nextPage || document;
  const CONFIG = {
    totalDuration: 0.9,
    wordDuration: 0.7,
    ease: 'cubic-bezier(0.38, 0.005, 0.215, 1)',
    from: { yPercent: 10, blur: 10 },
    scrollStart: 'top 90%',
  };

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    scope.querySelectorAll('[data-highlight-marker-reveal]').forEach((el) => {
      gsap.set(el, { visibility: 'visible', opacity: 1 });
    });
    return;
  }

  const elements = scope.querySelectorAll('[data-highlight-marker-reveal]');
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

export function initWhitePaperSwiper(nextPage) {
  const el = (nextPage || document).querySelector('.white-paper_testimonials');
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

export function initModalBasic(nextPage) {
  const scope = nextPage || document;
  const modalGroup = scope.querySelector('[data-modal-group-status]');
  const modals = scope.querySelectorAll('[data-modal-name]');
  const modalTargets = scope.querySelectorAll('[data-modal-target]');

  // Open modal
  modalTargets.forEach((modalTarget) => {
    modalTarget.addEventListener('click', function () {
      const modalTargetName = this.getAttribute('data-modal-target');

      // Close all modals
      modalTargets.forEach((target) => target.setAttribute('data-modal-status', 'not-active'));
      modals.forEach((modal) => modal.setAttribute('data-modal-status', 'not-active'));

      // Activate clicked modal
      scope
        .querySelector(`[data-modal-target="${modalTargetName}"]`)
        .setAttribute('data-modal-status', 'active');
      scope
        .querySelector(`[data-modal-name="${modalTargetName}"]`)
        .setAttribute('data-modal-status', 'active');

      // Set group to active
      if (modalGroup) {
        modalGroup.setAttribute('data-modal-group-status', 'active');
      }

      if (typeof lenis !== 'undefined' && lenis) {
        lenis.stop();
      } else {
        disableScroll();
      }
    });
  });

  // Close modal
  scope.querySelectorAll('[data-modal-close]').forEach((closeBtn) => {
    closeBtn.addEventListener('click', closeAllModals);
  });

  // Close modal on `Escape` key
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeAllModals();
    }
  });

  // Function to close all modals
  function closeAllModals() {
    modalTargets.forEach((target) => target.setAttribute('data-modal-status', 'not-active'));

    if (modalGroup) {
      modalGroup.setAttribute('data-modal-group-status', 'not-active');
    }
    if (typeof lenis !== 'undefined' && lenis) {
      lenis.start();
    } else {
      enableScroll();
    }
  }
}
