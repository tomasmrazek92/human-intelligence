import { runSecureMCP } from './illustration';
import { runPattern } from './pattern';
import { initGlobalParallax } from './osmo';
import { initScrambleText } from './osmo';
import { initContentRevealScroll } from './osmo';
import { initHighlightMarkerTextReveal } from './osmo';
import { initWhitePaperSwiper } from './osmo';
import { initModalBasic } from './osmo';
import { initPlatformDots } from './platform';
import { initCardIllustrations } from './cardIllustrations';
import { initIntegrationsControl } from './integrationsControl';
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

// Held at module scope so a re-init (Barba) can disconnect the previous one.
let tabsResizeObserver = null;

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

  // Pixel colors: mostly white with occasional darker accent pixels
  const colorChance = 0.05;
  const baseColor = '#ffffff';
  const accentColor = '#e4e8f1';
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
  if (has('[data-hi-illustration]')) initCardIllustrations(scope);
  if (has('[data-tab-active]')) initIntegrationsControl(scope);

  // Interactions
  if (has('[data-accordion-css-init]')) initAccordionCSS(scope);
  if (has('[data-modal-group-status]')) initModalBasic(nextPage);
  if (has('[data-tabs-init]')) initDashboardTabs(scope);

  // Page-specific animations
  initHomeAnimations(scope);
  initProductAnimations(scope);

  $(nextPage).find('main').css('opacity', '1');
}

function initAccordionCSS(scope) {
  let acIdSeq = 0;
  const uid = (prefix) => `${prefix}-${++acIdSeq}`;

  scope.querySelectorAll('[data-accordion-css-init]').forEach((accordion) => {
    const closeSiblings = accordion.getAttribute('data-accordion-close-siblings') === 'true';

    // ── ARIA scaffolding: turn each item into a real disclosure widget ──────
    accordion.querySelectorAll('[data-accordion-status]').forEach((item) => {
      const toggle = item.querySelector('[data-accordion-toggle]');
      if (!toggle) return;
      const panel = Array.from(item.children).find((c) => c !== toggle);
      if (!panel) return;

      // Panel: needs an id so the toggle can reference it
      if (!panel.id) panel.id = uid('accordion-panel');
      panel.setAttribute('role', 'region');

      // Heading inside toggle: id so the panel can reference it
      const heading = toggle.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        if (!heading.id) heading.id = uid('accordion-heading');
        panel.setAttribute('aria-labelledby', heading.id);
      }

      // Toggle: make it behave as a button (it's a <div>, not <button>)
      if (!toggle.hasAttribute('role')) toggle.setAttribute('role', 'button');
      if (!toggle.hasAttribute('tabindex')) toggle.setAttribute('tabindex', '0');
      toggle.setAttribute('aria-controls', panel.id);
      const isActiveInit = item.getAttribute('data-accordion-status') === 'active';
      toggle.setAttribute('aria-expanded', isActiveInit ? 'true' : 'false');

      // Decorative icon shouldn't be announced
      const icon = toggle.querySelector('.faqs-item_icon, [data-accordion-icon]');
      if (icon) icon.setAttribute('aria-hidden', 'true');
    });

    const syncAria = (item) => {
      const toggle = item.querySelector('[data-accordion-toggle]');
      if (!toggle) return;
      const isActive = item.getAttribute('data-accordion-status') === 'active';
      toggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    };

    const toggleItem = (item) => {
      const isActive = item.getAttribute('data-accordion-status') === 'active';
      item.setAttribute('data-accordion-status', isActive ? 'not-active' : 'active');
      syncAria(item);

      if (closeSiblings && !isActive) {
        accordion.querySelectorAll('[data-accordion-status="active"]').forEach((sibling) => {
          if (sibling !== item) {
            sibling.setAttribute('data-accordion-status', 'not-active');
            syncAria(sibling);
          }
        });
      }
    };

    accordion.addEventListener('click', (event) => {
      const toggle = event.target.closest('[data-accordion-toggle]');
      if (!toggle) return;
      const item = toggle.closest('[data-accordion-status]');
      if (!item) return;
      toggleItem(item);
    });

    // Keyboard: Enter or Space on the toggle activates it (since it's a <div>)
    accordion.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const toggle = event.target.closest('[data-accordion-toggle]');
      if (!toggle) return;
      event.preventDefault(); // stop Space from scrolling
      const item = toggle.closest('[data-accordion-status]');
      if (!item) return;
      toggleItem(item);
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
        scrollTrigger: { trigger: chatDashboard, start: 'top 90%', once: true },
      });
    }

    // Graph box wrap
    if (boxWrap) {
      gsap.set(boxWrap, { autoAlpha: 0, yPercent: 10 });
      ScrollTrigger.create({
        trigger: boxWrap,
        start: 'top 90%',
        once: true,

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

// ── Dashboard tabs ───────────────────────────────────────────────────────────
// Sidebar list drives a stack of screenshots: clicking a tab crossfades its
// image in and the rest out. A single pill div is injected behind the list and
// slides/resizes to whichever item is active.
//
// Markup contract (attributes only, no class dependency):
//   [data-tabs-init]           → component root (wraps both the list and images)
//   [data-tab-item="key"]      → each clickable sidebar item
//   [data-tab-image="key"]     → the matching image; keys must line up
//   [data-tabs-list]           → optional, the element the pill is measured
//                                against. Defaults to the items' parent.
//
// Webflow side: only thing worth styling there is the active state, e.g.
//   .h-dashboard_list-item[data-state="active"] { color: var(--…); }
// The icons already use currentColor, so one colour rule covers both.
function initDashboardTabs(scope) {
  const root = (scope || document).querySelector('[data-tabs-init]');
  if (!root) return;

  const items = [...root.querySelectorAll('[data-tab-item]')];
  const images = [...root.querySelectorAll('[data-tab-image]')];
  if (!items.length || !images.length) return;

  const list = root.querySelector('[data-tabs-list]') || items[0].parentElement;
  if (!list) return;

  // Pair each tab with its image by key, falling back to position so a typo'd
  // key in Webflow (e.g. audit-logs vs audit) degrades to the right image
  // instead of killing the whole component.
  const panes = items
    .map((item, i) => {
      const key = item.getAttribute('data-tab-item');
      let img = images.find((el) => el.getAttribute('data-tab-image') === key);
      if (!img && images[i]) {
        img = images[i];
        console.warn(`[tabs] no [data-tab-image="${key}"] — matched by index instead.`);
      }
      return { item, img, key };
    })
    .filter((p) => p.img);
  if (!panes.length) return;

  // ── Stack the images so they can crossfade ────────────────────────────────
  // Normally Webflow already has them absolute; this is just a fallback so the
  // component still works if that CSS ever goes missing.
  const stack = images[0].parentElement;
  if (getComputedStyle(images[0]).position === 'static') {
    gsap.set(stack, { position: 'relative' });
    gsap.set(images, { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' });
  }

  // Take over from the CSS no-flash guard:
  //   [data-tab-image]:not(:first-child) { display: none; }
  // That rule stops all eight images stacking up before JS boots, but display
  // can't be overridden by autoAlpha (which only touches visibility/opacity),
  // so every non-first image would stay hidden forever. Copy the first image's
  // computed display onto all of them as an inline style — inline beats the
  // stylesheet, and reading it rather than hardcoding 'block' keeps whatever
  // Webflow set. From here on visibility is entirely autoAlpha's job.
  gsap.set(images, { display: getComputedStyle(images[0]).display, autoAlpha: 0 });

  // ── Moving active pill ────────────────────────────────────────────────────
  // Injected as a sibling of the <ul>, not a child — a bare <div> inside a
  // role="list" would break the list semantics for screen readers.
  const pillHost = list.parentElement;
  let pill = pillHost.querySelector('[data-tab-pill]');
  if (!pill) {
    pill = document.createElement('div');
    pill.setAttribute('data-tab-pill', '');
    pill.setAttribute('aria-hidden', 'true');
    pillHost.insertBefore(pill, list);
  }
  // JS owns geometry only — position, size, and the fact that it sits behind
  // the list. Everything visual (background, radius, shadow, border) is styled
  // in CSS off [data-tab-pill]. Note GSAP can't set colours from CSS vars: it
  // parses backgroundColor as a colour, has no var() support, and mangles the
  // token into a junk rgba() — so colour never belongs in here anyway.
  gsap.set(pillHost, { position: 'relative' });
  gsap.set(pill, {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    zIndex: 0,
    autoAlpha: 0,
  });
  gsap.set(list, { position: 'relative', zIndex: 1 });
  items.forEach((el) => gsap.set(el, { cursor: 'pointer' }));

  const measure = (item) => {
    const a = item.getBoundingClientRect();
    const b = pillHost.getBoundingClientRect();
    return {
      x: a.left - b.left + pillHost.scrollLeft,
      y: a.top - b.top + pillHost.scrollTop,
      width: a.width,
      height: a.height,
    };
  };

  // Last geometry written to the pill, so the ResizeObserver below can drop
  // callbacks that wouldn't move anything.
  let lastBox = '';
  const boxKey = (b) => `${b.x}|${b.y}|${b.width}|${b.height}`;

  const movePill = (item, animate) => {
    const box = measure(item);
    lastBox = boxKey(box);
    const to = { ...box, autoAlpha: 1 };
    if (animate && !reducedMotion) gsap.to(pill, { ...to, duration: 0.45, overwrite: true });
    else gsap.set(pill, to);
  };

  // ── ARIA: sidebar is a vertical tablist, images are the panels ────────────
  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-orientation', 'vertical');
  panes.forEach(({ item, img, key }, i) => {
    const tabId = `h-dashboard-tab-${key || i}`;
    const panelId = `h-dashboard-panel-${key || i}`;
    item.id = tabId;
    item.setAttribute('role', 'tab');
    item.setAttribute('aria-controls', panelId);
    img.id = panelId;
    img.setAttribute('role', 'tabpanel');
    img.setAttribute('aria-labelledby', tabId);
  });

  // ── Activation ────────────────────────────────────────────────────────────
  let active = -1;

  const setActive = (index, animate = true) => {
    if (!panes[index] || index === active) return;
    const prev = panes[active];
    active = index;
    const { item, img } = panes[index];

    panes.forEach((p, i) => {
      const on = i === index;
      p.item.setAttribute('data-state', on ? 'active' : 'inactive');
      p.item.setAttribute('aria-selected', on ? 'true' : 'false');
      p.item.tabIndex = on ? 0 : -1;
    });

    movePill(item, animate);

    if (!animate || reducedMotion) {
      gsap.set(
        panes.map((p) => p.img),
        { autoAlpha: 0, zIndex: 1 }
      );
      gsap.set(img, { autoAlpha: 1, scale: 1, y: 0, zIndex: 2 });
      return;
    }

    if (prev && prev.img !== img) {
      gsap.set(prev.img, { zIndex: 1 });
      gsap.to(prev.img, { autoAlpha: 0, scale: 0.985, duration: 0.35, overwrite: true });
    }
    gsap.set(img, { zIndex: 2 });
    gsap.fromTo(
      img,
      { autoAlpha: 0, scale: 1.015, y: 8 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, overwrite: true }
    );
  };

  // ── Events ────────────────────────────────────────────────────────────────
  panes.forEach(({ item }, i) => {
    item.addEventListener('click', () => setActive(i));
    item.addEventListener('keydown', (e) => {
      const last = panes.length - 1;
      let next = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = i === last ? 0 : i + 1;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = i === 0 ? last : i - 1;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = last;
      else if (e.key === 'Enter' || e.key === ' ') next = i;
      if (next === null) return;
      e.preventDefault();
      setActive(next);
      panes[next].item.focus();
    });
  });

  // ── Keep the pill on target ───────────────────────────────────────────────
  // The section is sized in vw, so every item dimension is a moving target. A
  // window resize listener would miss the other things that shift it (webfont
  // reflow, zoom, the sidebar's own content changing), so observe the list
  // itself instead — it fires for all of them, including width changes.
  //
  // Safe from feedback loops: the pill is absolutely positioned, so resizing it
  // can't change the size of the box being observed.
  //
  // Mobile-scroll note: the usual width-only guard exists because window
  // resize fires on every URL-bar show/hide. That doesn't apply here — a
  // ResizeObserver on the list only fires if the list's own box actually
  // changed, and the extra rect check below drops no-op callbacks anyway.
  const syncPill = () => {
    if (!panes[active]) return;
    // Don't fight a click transition that's mid-flight — it already measured.
    if (gsap.isTweening(pill)) return;
    const box = measure(panes[active].item);
    if (boxKey(box) === lastBox) return;
    movePill(panes[active].item, false);
  };

  tabsResizeObserver?.disconnect(); // repeat inits (Barba) replace, never stack
  tabsResizeObserver = new ResizeObserver(syncPill);
  tabsResizeObserver.observe(list);
  items.forEach((el) => tabsResizeObserver.observe(el));

  // Honour an active state already set in Webflow, otherwise open the first tab.
  const preset = panes.findIndex(({ item }) => item.getAttribute('data-state') === 'active');
  setActive(preset > -1 ? preset : 0, false);
}
