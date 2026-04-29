import { runSecureMCP } from './illustration';
import { runPattern } from './pattern';
import { initGlobalParallax } from './osmo';
import { initScrambleText } from './osmo';
import { initContentRevealScroll } from './osmo';
import { initHighlightMarkerTextReveal } from './osmo';
import { initWhitePaperSwiper } from './osmo';
import { initModalBasic } from './osmo';
import { initPlatformDots } from './platform';
import {
  revealDotGrid,
  revealChatBox,
  revealGraf,
  revealPlatformIllustration,
  revealResponse,
} from './graphAnimations';

// -----------------------------------------
// OSMO PAGE TRANSITION BOILERPLATE
// -----------------------------------------

gsap.registerPlugin(SplitText, ScrollTrigger, DrawSVGPlugin, CustomEase);

history.scrollRestoration = 'manual';

let lenis = null;
let nextPage = document;
let onceFunctionsInitialized = false;

const hasLenis = typeof window.Lenis !== 'undefined';
const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';

const rmMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = rmMQ.matches;
rmMQ.addEventListener?.('change', (e) => (reducedMotion = e.matches));
rmMQ.addListener?.((e) => (reducedMotion = e.matches));

const has = (s) => !!nextPage.querySelector(s);

let staggerDefault = 0.05;
let durationDefault = 0.6;

CustomEase.create('osmo', '0.625, 0.05, 0, 1');
gsap.defaults({ ease: 'osmo', duration: durationDefault });

// -----------------------------------------
// FUNCTION REGISTRY
// -----------------------------------------

function initOnceFunctions() {
  initLenis();
  if (onceFunctionsInitialized) return;
  onceFunctionsInitialized = true;

  // Runs once on first load
  $('body').attr('data-anim-loaded', 'true');
  resetPage(nextPage);
  initVisuals(nextPage);
}

function initBeforeEnterFunctions(next) {
  nextPage = next || document;

  if (hasScrollTrigger) {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill(false));
  }
}

function initAfterEnterFunctions(next) {
  nextPage = next || document;

  if (hasLenis) {
    lenis.resize();
  }

  if (hasScrollTrigger) {
    ScrollTrigger.refresh();
  }
}

// -----------------------------------------
// PAGE TRANSITIONS
// -----------------------------------------

const pixelHorizontalAmount = 80;
const transitionDuration = 1;
const pixelFadeDuration = 0.2;
const pixelOverlap = 0;

function runPageOnceAnimation(next) {
  const tl = gsap.timeline();

  return tl;
}

function runPageLeaveAnimation(current, next) {
  const tl = gsap.timeline();

  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    tl.set(current, { autoAlpha: 0 });
    tl.call(() => current.remove(), null, 0);
    initVisuals(next);
    return tl;
  }

  // Run PixelGrid Helper
  const isPortrait = window.innerHeight > window.innerWidth;
  const activeDuration = isPortrait ? transitionDuration * 1.5 : transitionDuration;
  pixelGrid(isPortrait);

  const transitionWrap = document.querySelector('[data-transition-wrap]');
  const transitionPanel = transitionWrap.querySelector('[data-transition-panel]');
  const lines = Array.from(transitionPanel.querySelectorAll('[data-transition-col]'));
  const allPixels = transitionPanel.querySelectorAll('[data-transition-pixel]');

  const overlap = Math.max(0, Math.min(1, pixelOverlap));
  const clipFrom = isPortrait
    ? 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)'
    : 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)';
  const clipTo = isPortrait
    ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
    : 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
  const clipStart = Math.min(pixelFadeDuration, activeDuration * 0.5);
  const clipDuration = Math.max(0.001, activeDuration - 2 * clipStart);
  const stepDur = clipDuration / Math.max(1, pixelHorizontalAmount);
  const transitionEndDelay = activeDuration / Math.max(1, pixelHorizontalAmount);

  gsap.set(allPixels, { opacity: 0, willChange: 'opacity' });
  gsap.set(transitionPanel, { opacity: 1, willChange: 'opacity' });

  gsap.set(next, {
    autoAlpha: 1,
    clipPath: clipFrom,
    webkitClipPath: clipFrom,
    willChange: 'clip-path',
    force3D: true,
    maxHeight: '100dvh',
  });

  lines.forEach((line, i) => {
    const pixels = Array.from(line.querySelectorAll('[data-transition-pixel]'));
    if (!pixels.length) return;

    const revealTime = clipStart + i * stepDur;
    const fillStart = Math.max(0, revealTime - pixelFadeDuration);
    const fadeStart = Math.min(activeDuration, revealTime + stepDur);
    const fadeEnd = Math.min(activeDuration, fadeStart + pixelFadeDuration);
    const perPixelMin = pixelFadeDuration / pixels.length;
    const perPixelDur = perPixelMin * (1 - overlap) + pixelFadeDuration * overlap;
    const spread = Math.max(0, pixelFadeDuration - perPixelDur);

    // Animate Pixels In
    tl.to(
      pixels,
      {
        opacity: 1,
        duration: Math.max(0.001, perPixelDur),
        ease: 'none',
        stagger: {
          amount: spread,
          from: 'random',
        },
      },
      fillStart
    );

    // Animate Pixels Out
    tl.to(
      pixels,
      {
        opacity: 0,
        duration: Math.max(0.001, perPixelDur),
        ease: 'none',
        stagger: {
          amount: spread,
          from: 'random',
        },
      },
      fadeStart
    );
  });

  tl.to(
    next,
    {
      clipPath: clipTo,
      webkitClipPath: clipTo,
      ease: `steps(${pixelHorizontalAmount}, start)`,
      duration: clipDuration,
    },
    clipStart
  ).call(initVisuals, [next], isPortrait ? clipStart + clipDuration : clipStart + clipDuration / 2);

  tl.set(
    next,
    { clearProps: 'clipPath,webkitClipPath,willChange,force3D,maxHeight' },
    clipStart + clipDuration
  );

  tl.call(() => current.remove(), null, activeDuration + transitionEndDelay);
  tl.set(allPixels, { clearProps: 'willChange' }, activeDuration + transitionEndDelay);
  tl.set(transitionPanel, { clearProps: 'willChange' }, activeDuration + transitionEndDelay);

  return tl;
}

function runPageEnterAnimation(next) {
  const tl = gsap.timeline();
  const isPortrait = window.innerHeight > window.innerWidth;
  const activeDuration = isPortrait ? transitionDuration * 2 : transitionDuration;
  const transitionEndDelay = activeDuration / Math.max(1, pixelHorizontalAmount);

  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    tl.set(next, { autoAlpha: 1 });
    tl.add('pageReady');
    tl.call(resetPage, [next], 'pageReady');
    $(nextPage).find('main').css('opacity', '1');
    return new Promise((resolve) => tl.call(resolve, null, 'pageReady'));
  }

  tl.add('pageReady', activeDuration + transitionEndDelay);
  tl.call(resetPage, [next], 'pageReady');

  return new Promise((resolve) => {
    tl.call(resolve, null, 'pageReady');
  });
}

// Helper: Create the PixelGrid
function pixelGrid(isPortrait) {
  const panel = document.querySelector('[data-transition-panel]');
  if (!panel) return;

  const rect = panel.getBoundingClientRect();
  panel.style.flexDirection = isPortrait ? 'column' : 'row';

  const lineSizePx = isPortrait
    ? rect.height / pixelHorizontalAmount
    : rect.width / pixelHorizontalAmount;
  const crossAmount = Math.ceil((isPortrait ? rect.width : rect.height) / lineSizePx);

  let lines = panel.querySelectorAll('[data-transition-col]');
  const lineTemplate = lines[0];
  const pixelTemplate = lineTemplate.querySelector('[data-transition-pixel]');

  if (lines.length !== pixelHorizontalAmount) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < pixelHorizontalAmount; i++) {
      frag.appendChild(lineTemplate.cloneNode(false));
    }
    panel.replaceChildren(frag);
    lines = panel.querySelectorAll('[data-transition-col]');
  }

  lines.forEach((line) => {
    line.style.flexDirection = isPortrait ? 'row' : 'column';
    line.style.flex = '1 1 auto';
    line.style.justifyContent = 'center';

    const diff = crossAmount - line.childElementCount;

    if (diff > 0) {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < diff; i++) {
        frag.appendChild(pixelTemplate.cloneNode(true));
      }
      line.appendChild(frag);
    } else if (diff < 0) {
      for (let i = diff; i < 0; i++) {
        line.lastElementChild.remove();
      }
    }
  });

  // Pixel colors: mostly dark with occasional lighter accent pixels
  const colorChance = 0.05;
  const baseColor = '#121416';
  const accentColor = '#1c1e1f';
  const allPx = panel.querySelectorAll('[data-transition-pixel]');

  allPx.forEach((px) => {
    px.style.backgroundColor = Math.random() < colorChance ? accentColor : baseColor;
  });
}

// -----------------------------------------
// BARBA HOOKS + INIT
// -----------------------------------------

barba.hooks.beforeEnter((data) => {
  // Position new container on top
  gsap.set(data.next.container, {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  });

  if (lenis && typeof lenis.stop === 'function') {
    lenis.stop();
  }

  initBeforeEnterFunctions(data.next.container);
  applyThemeFrom(data.next.container);
});

barba.hooks.afterLeave(() => {});

barba.hooks.enter((data) => {
  initBarbaNavUpdate(data);
  $(data.next.container).find('main').css('opacity', '0');
});

barba.hooks.afterEnter((data) => {
  // Run page functions
  initAfterEnterFunctions(data.next.container);

  // Re-init Webflow native components (nav, tabs, sliders, etc.)
  if (window.Webflow && window.Webflow.require) {
    window.Webflow.destroy();
    window.Webflow.ready();
    window.Webflow.require('ix2').init();
    document.dispatchEvent(new Event('readystatechange'));
  }

  // Settle
  if (hasLenis) {
    lenis.resize();
    lenis.start();
  }

  if (hasScrollTrigger) {
    ScrollTrigger.refresh();
  }
});

barba.init({
  debug: true, // Set to 'false' in production
  timeout: 7000,
  preventRunning: true,
  transitions: [
    {
      name: 'default',
      sync: true,

      // First load
      async once(data) {
        initOnceFunctions();

        return runPageOnceAnimation(data.next.container);
      },

      // Current page leaves
      async leave(data) {
        return runPageLeaveAnimation(data.current.container, data.next.container);
      },

      // New page enters
      async enter(data) {
        return runPageEnterAnimation(data.next.container);
      },
    },
  ],
});

// -----------------------------------------
// GENERIC + HELPERS
// -----------------------------------------

const themeConfig = {
  light: {
    nav: 'dark',
    transition: 'light',
  },
  dark: {
    nav: 'light',
    transition: 'dark',
  },
};

function applyThemeFrom(container) {
  const pageTheme = container?.dataset?.pageTheme || 'light';
  const config = themeConfig[pageTheme] || themeConfig.light;

  document.body.dataset.pageTheme = pageTheme;
  const transitionEl = document.querySelector('[data-theme-transition]');
  if (transitionEl) {
    transitionEl.dataset.themeTransition = config.transition;
  }

  const nav = document.querySelector('[data-theme-nav]');
  if (nav) {
    nav.dataset.themeNav = config.nav;
  }
}

function initLenis() {
  if (lenis) return; // already created
  if (!hasLenis) return;

  lenis = new Lenis({
    lerp: 0.165,
    wheelMultiplier: 1.25,
  });

  if (hasScrollTrigger) {
    lenis.on('scroll', ScrollTrigger.update);
  }

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

function resetPage(container) {
  window.scrollTo(0, 0);
  gsap.set(container, { clearProps: 'position,top,left,right' });

  if (hasLenis) {
    lenis.resize();
    lenis.start();
  }
}

function debounceOnWidthChange(fn, ms) {
  let last = innerWidth,
    timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (innerWidth !== last) {
        last = innerWidth;
        fn.apply(this, args);
      }
    }, ms);
  };
}

function initBarbaNavUpdate(data) {
  // Force-close product dropdowns
  document
    .querySelectorAll('.nav_menu-dropdown.is-product.w-dropdown-list.w--open')
    .forEach((dd) => {
      gsap.to(dd, {
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          dd.classList.remove('w--open');
          gsap.set(dd, { clearProps: 'all' });
        },
      });
    });
  document.querySelectorAll('.w-dropdown-toggle.w--open').forEach((toggle) => {
    toggle.classList.remove('w--open');
  });

  // Force-close mobile nav on both containers
  document.querySelectorAll('.w-nav-button').forEach((btn) => {
    btn.classList.remove('w--open');
    btn.setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll('.w-nav-overlay').forEach((overlay) => {
    overlay.style.display = 'none';
    overlay.style.height = '0';
  });
  document.querySelectorAll('.w-nav-menu').forEach((menu) => {
    menu.classList.remove('w--open');
  });

  var tpl = document.createElement('template');
  tpl.innerHTML = data.next.html.trim();
  var nextNodes = tpl.content.querySelectorAll('[data-barba-update]');
  var currentNodes = document.querySelectorAll('nav [data-barba-update]');

  currentNodes.forEach(function (curr, index) {
    var next = nextNodes[index];
    if (!next) return;

    // Aria-current sync
    var newStatus = next.getAttribute('aria-current');
    if (newStatus !== null) {
      curr.setAttribute('aria-current', newStatus);
    } else {
      curr.removeAttribute('aria-current');
    }

    // Class list sync
    var newClassList = next.getAttribute('class') || '';
    curr.setAttribute('class', newClassList);
  });
}

// -----------------------------------------
// YOUR FUNCTIONS GO BELOW HERE
// -----------------------------------------

function initVisuals(nextPage) {
  const scope = nextPage || document;
  const has = (s) => !!scope.querySelector(s);

  if (has('[data-illustration]')) runSecureMCP(nextPage);

  // Pre-hide graph wrappers so they're ready for reveal in revealGraf
  scope.querySelectorAll('.graph-box_wrap').forEach((el) => {
    gsap.set(el, { autoAlpha: 0, yPercent: 10 });
  });

  $('body').attr('data-anim-loaded', 'true');
  if (has('[data-parallax="trigger"]')) initGlobalParallax(nextPage);
  if (has('[data-scramble]') || has('[data-scramble-hover]')) initScrambleText(nextPage);
  if (has('[data-pattern]')) runPattern(nextPage);
  if (has('[data-highlight-marker-reveal]')) initHighlightMarkerTextReveal(nextPage);
  if (has('[data-reveal-group]')) initContentRevealScroll(nextPage);
  if (has('[data-anim="platform-dots"]')) initPlatformDots(nextPage);

  // Interactions
  if (has('[data-accordion-css-init]')) initAccordionCSS(scope);
  if (has('[data-modal-group-status]')) initModalBasic(nextPage);

  // Page-specific animations
  initHomeAnimations(scope);
  initProductAnimations(scope);

  $(nextPage).find('main').css('opacity', '1');
}

function initAccordionCSS(scope) {
  scope.querySelectorAll('[data-accordion-css-init]').forEach((accordion) => {
    const closeSiblings = accordion.getAttribute('data-accordion-close-siblings') === 'true';

    accordion.addEventListener('click', (event) => {
      const toggle = event.target.closest('[data-accordion-toggle]');
      if (!toggle) return;

      const singleAccordion = toggle.closest('[data-accordion-status]');
      if (!singleAccordion) return;

      const isActive = singleAccordion.getAttribute('data-accordion-status') === 'active';
      singleAccordion.setAttribute('data-accordion-status', isActive ? 'not-active' : 'active');

      if (closeSiblings && !isActive) {
        accordion.querySelectorAll('[data-accordion-status="active"]').forEach((sibling) => {
          if (sibling !== singleAccordion)
            sibling.setAttribute('data-accordion-status', 'not-active');
        });
      }
    });
  });
}

// -----------------------------------------
// HOME PAGE ANIMATIONS
// -----------------------------------------

function initHomeAnimations(scope) {
  const $scope = $(scope);
  const has = (s) => !!scope.querySelector(s);

  if (has('.white-paper_testimonials')) initWhitePaperSwiper(scope);

  // Hero graph — each sub-element gets its own ScrollTrigger
  $scope.find('.claude-dashboard').each(function () {
    const trigger = $(this);
    const chatDashboard = trigger.find('.claude-dashboard_base');
    const chatBubble = trigger.find('[data-anim="chat-bubble"]');
    const chatResponse = trigger.find('[data-anim="response"]');
    const boxWrap = this.querySelector('.graph-box_wrap');

    // Dashboard base
    if (chatDashboard.length) {
      gsap.from(chatDashboard, {
        opacity: 0,
        yPercent: 5,
        scrollTrigger: { trigger: chatDashboard, start: 'top 90%', once: true, markers: true },
      });
    }

    // Graph box wrap
    if (boxWrap) {
      gsap.set(boxWrap, { autoAlpha: 0, yPercent: 10 });
      ScrollTrigger.create({
        trigger: boxWrap,
        start: 'top 90%',
        once: true,
        markers: true,
        onEnter: () =>
          gsap.to(boxWrap, {
            autoAlpha: 1,
            yPercent: 0,
            duration: 0.55,
            ease: 'cubic-bezier(0.38, 0.005, 0.215, 1)',
          }),
      });
    }

    // Chat bubble
    if (chatBubble.length) {
      const bubbleTl = revealChatBox(chatBubble);
      bubbleTl.pause();
      ScrollTrigger.create({
        trigger: chatBubble,
        start: 'top 95%',
        once: true,
        markers: true,
        onEnter: () => bubbleTl.play(),
      });
    }

    // Response
    if (chatResponse.length) {
      const responseTl = revealResponse(chatResponse);
      responseTl.pause();
      ScrollTrigger.create({
        trigger: chatResponse,
        start: 'top 95%',
        once: true,
        markers: true,
        onEnter: () => responseTl.play(),
      });
    }

    // Graf
    const grafTl = revealGraf(trigger);
    grafTl.pause();
    ScrollTrigger.create({
      trigger: trigger.find('[data-anim="graph-base"]').length
        ? trigger.find('[data-anim="graph-base"]')
        : trigger,
      start: 'top 90%',
      once: true,
      markers: true,
      onEnter: () => grafTl.play(),
    });
  });

  // Claude Feature
  $scope.find('[data-anim="claude-feature"]').each(function () {
    const trigger = $(this);
    const chatBubble = trigger.find('[data-anim="chat-bubble"]');
    const chatResponse = trigger.find('[data-anim="response"]');
    const boxWrap = this.querySelector('.graph-box_wrap');

    const tl = gsap.timeline({ scrollTrigger: { trigger, start: '40% bottom', once: true } });
    if (boxWrap)
      tl.to(
        boxWrap,
        { autoAlpha: 1, yPercent: 0, duration: 0.55, ease: 'cubic-bezier(0.38, 0.005, 0.215, 1)' },
        0
      );
    tl.add(revealChatBox(chatBubble), 0)
      .add(revealResponse(chatResponse), '>-1')
      .add(revealGraf(trigger), '>-2');
  });

  // Chat Feature
  $scope.find('[data-anim="chat-feature"]').each(function () {
    const trigger = $(this);
    const chatBubble = trigger.find('[data-anim="chat-bubble"]');
    const chatResponse = trigger.find('[data-anim="response"]');
    const boxWrap = this.querySelector('.graph-box_wrap');

    const tl = gsap.timeline({ scrollTrigger: { trigger, start: '40% bottom', once: true } });
    if (boxWrap)
      tl.to(
        boxWrap,
        { autoAlpha: 1, yPercent: 0, duration: 0.55, ease: 'cubic-bezier(0.38, 0.005, 0.215, 1)' },
        0
      );
    tl.add(revealChatBox(chatBubble), 0)
      .add(revealResponse(chatResponse), '>-1')
      .add(revealGraf(trigger), '>-2');
  });

  // Platform illustration
  $scope.find('[data-anim="platform-top"]').each(function () {
    gsap
      .timeline({
        delay: 1,
        scrollTrigger: { trigger: this, start: 'top bottom', once: true },
        onComplete: () => window.dispatchEvent(new Event('platform-illustration-complete')),
      })
      .add(revealPlatformIllustration(this));
  });

  $scope.find('[data-anim="platform"]').each(function () {
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
}

// -----------------------------------------
// PRODUCTS PAGE ANIMATIONS
// -----------------------------------------

function initProductAnimations(scope) {
  const $scope = $(scope);

  // Hero scatter chart
  $scope.find('[data-anim="natural-lang-hero"]').each(function () {
    const trigger = $(this);
    const svg = trigger.find('svg')[0] || trigger;

    const side = svg.querySelector('#side');
    const header = svg.querySelector('#Header');
    const filters = svg.querySelector('#filters');
    const barChart = svg.querySelector('#Bar\\ Chart');
    const frame17 = svg.querySelector('#Frame\\ 17');
    const navItems = side ? [...side.querySelectorAll('#items > *')] : [];

    const chatBubble = trigger.find('[data-anim="chat-bubble"]');

    gsap.set(side, { autoAlpha: 0, x: -24 });
    gsap.set(header, { autoAlpha: 0, y: -18 });
    gsap.set(filters, { autoAlpha: 0 });
    gsap.set(barChart, { autoAlpha: 0, scale: 0.96, transformOrigin: 'center center' });
    gsap.set(frame17, { autoAlpha: 0, x: -100 });
    if (navItems.length) gsap.set(navItems, { autoAlpha: 0, x: -10 });

    const boxWrap = this.querySelector('.graph-box_wrap');

    const tl = gsap.timeline({ delay: 0.5 });
    if (boxWrap)
      tl.to(
        boxWrap,
        { autoAlpha: 1, yPercent: 0, duration: 0.55, ease: 'cubic-bezier(0.38, 0.005, 0.215, 1)' },
        0
      );
    tl.to(side, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0)
      .to(header, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0.05)
      .to(navItems, { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power2.out', stagger: 0.05 }, 0.25)
      .to(filters, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 0.4)
      .to(barChart, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, 0.5)
      .to(frame17, { autoAlpha: 1, x: 0, duration: 0.45, ease: 'power2.out' }, 0.8)
      .add(revealGraf(trigger))
      .add(revealChatBox(chatBubble), '<');
  });

  // Product charts
  $scope.find('[data-anim="product-chart"]').each(function () {
    const trigger = $(this);
    const chatBubble = trigger.find('[data-anim="chat-bubble"]');
    const boxWrap = this.querySelector('.graph-box_wrap');

    const grafTl = revealGraf(trigger);
    const chatTl = revealChatBox(chatBubble);

    const master = gsap.timeline({ paused: true });
    if (boxWrap)
      master.to(
        boxWrap,
        { autoAlpha: 1, yPercent: 0, duration: 0.55, ease: 'cubic-bezier(0.38, 0.005, 0.215, 1)' },
        0
      );
    master.add(chatTl, 0).add(grafTl, '<1');

    ScrollTrigger.create({
      trigger,
      start: 'top 80%',
      once: true,
      onEnter: () => master.play(),
    });
  });
}
