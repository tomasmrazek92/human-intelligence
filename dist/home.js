"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/graphAnimations.js
  var prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function typeText(element, duration = 0.5, delay = 0) {
    if (window.innerWidth < 992)
      return;
    if (prefersReducedMotion())
      return gsap.timeline();
    const split = new SplitText(element, { type: "words", linesClass: "split-line" });
    if (!split.words.length)
      return;
    gsap.set(split.words, { visibility: "hidden" });
    return gsap.to(split.words, {
      visibility: "visible",
      duration,
      delay,
      stagger: { amount: duration, ease: "power2.Inout" },
      ease: "power2.out"
    });
  }
  function revealChatBox(el, { labelSelector = '[data-anim="chat-label"]', stagger = 0.15 } = {}) {
    if (prefersReducedMotion())
      return gsap.timeline();
    const els = $(el).toArray();
    const tl = gsap.timeline();
    els.forEach((item, i) => {
      const $label = $(item).prev(labelSelector);
      gsap.set(item, { opacity: 0, y: "5rem", filter: "blur(8px)" });
      if ($label.length)
        gsap.set($label, { x: "1rem", opacity: 0, filter: "blur(8px)" });
      const sub = gsap.timeline();
      sub.to(
        item,
        { opacity: 1, y: "0rem", duration: 0.5, ease: "back.out(1.2)", filter: "blur(0px)" },
        0
      );
      sub.add(typeText(item), 0.25);
      if ($label.length) {
        sub.to($label, { x: "0rem", opacity: 1, filter: "blur(0px)", duration: 0.5 }, 0);
      }
      tl.add(sub, i === 0 ? 0 : `>-1`);
    });
    return tl;
  }
  function revealResponse(el, { typeDuration = 1.2, logoStagger = 0.08 } = {}) {
    if (prefersReducedMotion())
      return gsap.timeline();
    const $el = $(el);
    const $head = $el.find('[data-anim="response-head"]');
    const $text = $el.find('[data-anim="response-text"]');
    const $sources = $el.find('[data-anim="response-sources"]');
    const $logos = $sources.find("svg, img");
    gsap.set(el, { opacity: 0, y: "3rem", filter: "blur(6px)" });
    if ($head.length)
      gsap.set($head, { opacity: 0, x: "-0.5rem" });
    if ($text.length)
      gsap.set($text, { opacity: 0 });
    if ($sources.length)
      gsap.set($sources, { opacity: 0 });
    if ($logos.length)
      gsap.set($logos.toArray(), { opacity: 0, scale: 0.6 });
    const tl = gsap.timeline();
    tl.to(el, {
      opacity: 1,
      y: "0rem",
      filter: "blur(0px)",
      duration: 0.4,
      ease: "power3.out"
    });
    if ($head.length) {
      tl.to(
        $head,
        {
          opacity: 1,
          x: "0rem",
          duration: 0.25,
          ease: "power2.out"
        },
        ">-0.3"
      );
    }
    if ($text.length) {
      tl.to($text, { opacity: 1, duration: 0.1 }, ">-0.15");
      tl.add(typeText($text[0], typeDuration), "<");
    }
    if ($sources.length) {
      tl.to($sources, { opacity: 1, duration: 0.15 }, "<+0.4");
      if ($logos.length) {
        tl.to(
          $logos.toArray(),
          {
            opacity: 1,
            scale: 1,
            duration: 0.2,
            ease: "back.out(2)",
            stagger: logoStagger
          },
          "<"
        );
      }
    }
    return tl;
  }
  function revealGraf(el) {
    if (prefersReducedMotion())
      return gsap.timeline();
    const $el = $(el);
    const tl = gsap.timeline();
    const $base = $el.find('[data-anim="graph-base"]');
    const $dots = $el.find('[data-anim="dots"]').find("path, circle");
    const $mask = $el.find('[data-anim="graph-mask"]');
    const $chart = $el.find('[data-anim="chart"]');
    const $maskPaths = $mask.find("path");
    const $maskDots = $mask.find('[id^="dots"]');
    const $cursor = $el.find('[data-anim="cursor"]');
    const $dot = $el.find('[data-anim="dot"]');
    const $lineH = $el.find('[id^="line-h"]');
    const $lineV = $el.find('[id^="line-v"]');
    const $lineGroups = $el.find('[id^="line-group"]');
    const $lineTop = $el.find('[id^="line-top"]');
    const $lineBottom = $el.find('[id^="line-bottom"]');
    const $lineLeft = $el.find('[id^="line-left"]');
    const $lineRight = $el.find('[id^="line-right"]');
    const $tooltip = $el.find('[data-anim="tooltip"]');
    const $label = $el.find('[data-anim="label"]');
    const $graphTable = $el.find('[data-anim="graph-table"]');
    const base = $base[0];
    const grid = base ? base.querySelector("#grid") : null;
    const labelsY = base ? [...base.querySelectorAll("#stats-vertical path")] : [];
    const labelsX = base ? [...base.querySelectorAll("#stats-horizontal path")] : [];
    const legend = base ? [...base.querySelectorAll("#legend > g")] : [];
    const baseRows = base ? [...base.querySelectorAll('[id^="row_"]')] : [];
    const baseHasKnownChildren = grid || labelsY.length || labelsX.length || legend.length || baseRows.length;
    if (base && !baseHasKnownChildren) {
      gsap.set(base, { autoAlpha: 0 });
    }
    if (grid)
      gsap.set(grid, { autoAlpha: 0 });
    if (labelsY.length)
      gsap.set(labelsY, { autoAlpha: 0, x: -8 });
    if (labelsX.length)
      gsap.set(labelsX, { autoAlpha: 0, y: 8 });
    if (legend.length)
      gsap.set(legend, { autoAlpha: 0, y: 6 });
    baseRows.forEach((row) => {
      const rowBase = row.querySelector("#base");
      const others = [...row.children].filter((c) => c.id !== "base");
      gsap.set(row, { autoAlpha: 0 });
      if (rowBase)
        gsap.set(rowBase, { clipPath: "inset(0 100% 0 0)" });
      if (others.length)
        gsap.set(others, { autoAlpha: 0, y: 4 });
    });
    const $dotsContainer = $el.find('[data-anim="dots"]');
    if ($dotsContainer.length)
      gsap.set($dotsContainer, { autoAlpha: 0 });
    if ($dots.length)
      gsap.set($dots, { scale: 0, transformOrigin: "center" });
    if ($maskDots.length)
      gsap.set($maskDots, { scale: 0, transformOrigin: "center" });
    if ($chart.length)
      gsap.set($chart, { rotate: 25, autoAlpha: 0 });
    if ($cursor.length)
      gsap.set($cursor, { autoAlpha: 0 });
    if ($lineH.length)
      gsap.set($lineH, { clipPath: "inset(0 100% 0 0)" });
    if ($lineV.length)
      gsap.set($lineV, { scaleY: 0, transformOrigin: "center bottom" });
    if ($lineTop.length)
      gsap.set($lineTop, { scaleY: 0, transformOrigin: "center top" });
    if ($lineBottom.length)
      gsap.set($lineBottom, { scaleY: 0, transformOrigin: "center bottom" });
    if ($lineLeft.length)
      gsap.set($lineLeft, { scaleX: 0, transformOrigin: "left center" });
    if ($lineRight.length)
      gsap.set($lineRight, { scaleX: 0, transformOrigin: "right center" });
    if ($dot.length)
      gsap.set($dot, { x: "10em", y: "10em" });
    if ($tooltip.length)
      gsap.set($tooltip, { scale: 0.5, transformOrigin: "left", autoAlpha: 0 });
    if ($label.length)
      gsap.set($label, { scale: 0.5, transformOrigin: "center", autoAlpha: 0 });
    if (base && !baseHasKnownChildren) {
      tl.to(base, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0);
    }
    if (grid)
      tl.to(grid, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0);
    if (labelsY.length)
      tl.to(labelsY, { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.06, ease: "power2.out" }, 0.1);
    if (labelsX.length)
      tl.to(labelsX, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.04, ease: "power2.out" }, 0.1);
    if (legend.length)
      tl.to(legend, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" }, 0.4);
    if (baseRows.length) {
      baseRows.forEach((row, i) => {
        const rowBase = row.querySelector("#base");
        const others = [...row.children].filter((c) => c.id !== "base");
        const pos = i === 0 ? ">-0.15" : ">-0.18";
        tl.set(row, { autoAlpha: 1 }, pos);
        if (others.length)
          tl.to(
            others,
            { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.02, ease: "power2.out" },
            "<"
          );
        if (rowBase)
          tl.to(rowBase, { clipPath: "inset(0 0% 0 0)", duration: 0.35, ease: "power2.out" }, "<");
      });
    }
    if ($dots.length) {
      const DOTS_SPREAD = 0.5;
      const DOTS_DURATION = 0.06;
      const shuffled = gsap.utils.shuffle([...$dots]);
      if ($dotsContainer.length)
        tl.set($dotsContainer, { autoAlpha: 1 }, "-=0.2");
      tl.to(
        shuffled,
        {
          scale: 1,
          duration: DOTS_DURATION,
          stagger: $dots.length > 0 ? DOTS_SPREAD / $dots.length : 0.03,
          ease: "back.out(2)"
        },
        "<"
      );
    }
    if ($maskPaths.length) {
      const dashed = [];
      const solid = [];
      $maskPaths.each((_, el2) => {
        (el2.getAttribute("stroke-dasharray") ? dashed : solid).push(el2);
      });
      if (solid.length) {
        tl.fromTo(
          solid,
          {
            strokeDasharray: (i, el2) => parseFloat(el2.style.strokeDasharray) || el2.getTotalLength(),
            strokeDashoffset: (i, el2) => parseFloat(el2.style.strokeDasharray) || el2.getTotalLength()
          },
          { strokeDashoffset: 0, duration: 1.5, stagger: 0.2, ease: "power2.out" },
          "-=0.2"
        );
      }
      if (dashed.length) {
        gsap.set(dashed, { clipPath: "inset(0 100% 0 0)" });
        tl.to(
          dashed,
          { clipPath: "inset(0 0% 0 0)", duration: 1.5, stagger: 0.2, ease: "power2.out" },
          solid.length ? "<" : "-=0.2"
        );
      }
    }
    if ($maskDots.length) {
      tl.to($maskDots, { scale: 1, duration: 0.25, stagger: 0.04, ease: "back.out(3)" });
    }
    if ($chart.length) {
      tl.to($chart, { rotate: 0, autoAlpha: 1, duration: 1.5, ease: "power2.out" }, "<");
      const $chartLabels = $chart.find('[id^="label-"]');
      if ($chartLabels.length) {
        gsap.set($chartLabels, { autoAlpha: 0 });
        tl.to(
          $chartLabels,
          { autoAlpha: 1, duration: 0.7, stagger: 0.05, ease: "back.out(2)" },
          "-=0.1"
        );
      }
    }
    if ($graphTable.length) {
      tl.from($graphTable.find("#labels path, #head path"), {
        y: "1em",
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.inOut"
      }).from(
        $graphTable.find('#table [id^="item"]'),
        { y: "1em", autoAlpha: 0, duration: 0.8, stagger: 0.01, ease: "power2.inOut" },
        "<0.2"
      );
    }
    if ($dot.length)
      tl.to($dot, { x: "0em", y: "0em", duration: 0.8, ease: "power2.inOut" }, "-=0.1");
    if ($lineH.length)
      tl.to(
        [...$lineH].reverse(),
        { clipPath: "inset(0 0% 0 0)", duration: 0.5, stagger: 0.06, ease: "power2.out" },
        "-=0.4"
      );
    if ($lineGroups.length) {
      const groups = [...$lineGroups];
      groups.forEach((group, i) => {
        const $g = $(group);
        const vBars = [
          ...$g.find('[id^="line-v"]').toArray(),
          ...$g.find('[id^="line-top"]').toArray(),
          ...$g.find('[id^="line-bottom"]').toArray()
        ];
        const hBars = [
          ...$g.find('[id^="line-left"]').toArray(),
          ...$g.find('[id^="line-right"]').toArray()
        ];
        const pos = i === 0 ? "-=0.8" : ">-=0.3";
        if (vBars.length)
          tl.to(vBars, { scaleY: 1, duration: 0.5, ease: "power2.out" }, pos);
        if (hBars.length)
          tl.to(hBars, { scaleX: 1, duration: 0.5, ease: "power2.out" }, pos);
      });
    } else if ($lineV.length) {
      tl.to(
        [...$lineV].reverse(),
        { scaleY: 1, duration: 0.5, stagger: 0.06, ease: "power2.out" },
        "-=0.8"
      );
    }
    if ($cursor.length)
      tl.to($cursor, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, "-=0.2");
    if ($tooltip.length)
      tl.to(
        $tooltip,
        { scale: 1, autoAlpha: 1, duration: 0.5, stagger: 0.03, ease: "back.out(2)" },
        "-=0.2"
      );
    if ($label.length)
      tl.to(
        $label,
        { scale: 1, autoAlpha: 1, duration: 0.5, stagger: 0.03, ease: "back.out(2)" },
        "-=0.2"
      );
    return tl;
  }
  function revealPlatformIllustration(el) {
    if (prefersReducedMotion())
      return gsap.timeline();
    const $el = $(el);
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    const logo = $el.find(".platform-illustration_logo")[0];
    const agentBoxes = $el.find(".platform-illustration_agent-box").toArray();
    const options = $el.find(".platform-illustrations_options")[0];
    const serviceBoxes = $el.find(".platform-illustration_service-box").toArray();
    const human = $el.find(".platform-illustrations_human")[0];
    const baseBoxes = $el.find(".platform-illustrations_base-box, .page-header_side-diagram-box").toArray();
    const queryBox = $el.find(".platform-illustration_query-box")[0];
    const labels = $el.find(".platform-illustrations_label").toArray();
    const staticBase = $el.find('[data-anim="platform-dots"]')[0];
    const mainEls = [logo, options, human, queryBox].filter(Boolean);
    if (mainEls.length)
      gsap.set(mainEls, { autoAlpha: 0, y: 20 });
    if (labels.length)
      gsap.set(labels, { autoAlpha: 0, y: 8 });
    if (agentBoxes.length)
      gsap.set(agentBoxes, { autoAlpha: 0, y: 24 });
    if (serviceBoxes.length)
      gsap.set(serviceBoxes, { autoAlpha: 0, y: 20 });
    if (baseBoxes.length)
      gsap.set(baseBoxes, { autoAlpha: 0, y: 16 });
    if (staticBase)
      gsap.set(staticBase, { autoAlpha: 0 });
    if (baseBoxes.length) {
      tl.to(
        baseBoxes,
        { autoAlpha: 1, y: 0, duration: 0.4, stagger: { amount: 0.5, from: "random" } },
        0
      );
    }
    if (human)
      tl.to(human, { autoAlpha: 1, y: 0, duration: 0.35 }, ">-0.3");
    if (serviceBoxes.length) {
      tl.to(serviceBoxes, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.08 }, ">-0.3");
    }
    if (options) {
      gsap.set(options, { x: -12 });
      tl.to(options, { autoAlpha: 1, x: 0, y: 0, duration: 0.35 }, ">-0.25");
    }
    if (agentBoxes.length) {
      tl.to(
        agentBoxes,
        { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "back.out(1.4)" },
        ">-0.25"
      );
    }
    if (logo) {
      gsap.set(logo, { scale: 0.9 });
      tl.to(logo, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.7)" }, ">-0.2");
    }
    if (queryBox)
      tl.to(queryBox, { autoAlpha: 1, y: 0, duration: 0.4 }, ">-0.2");
    if (labels.length)
      tl.to(labels, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.06 }, ">-0.2");
    if (staticBase)
      tl.to(staticBase, { autoAlpha: 1, duration: 1 }, ">-0.2");
    return tl;
  }

  // src/osmo.js
  function initWhitePaperSwiper(nextPage) {
    const el = (nextPage || document).querySelector(".white-paper_testimonials");
    if (!el)
      return;
    const swiper = new Swiper(el, {
      slidesPerView: 1,
      autoHeight: true,
      effect: "fade",
      fadeEffect: { crossFade: true },
      speed: 600,
      loop: true,
      autoplay: false,
      pagination: {
        el: ".swiper-navigation",
        bulletClass: "swiper-dot",
        bulletActiveClass: "cc-active",
        clickable: true
      }
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

  // src/home.js
  initWhitePaperSwiper();
  $(".claude-dashboard").each(function() {
    const trigger = $(this);
    const chatBubble = trigger.find('[data-anim="chat-bubble"]');
    const chatResponse = trigger.find('[data-anim="response"]');
    gsap.timeline({ scrollTrigger: { trigger, start: "40 bottom", once: true } }).add(revealChatBox(chatBubble)).add(revealResponse(chatResponse), ">-1").add(revealGraf(trigger), ">-2");
  });
  $('[data-anim="claude-feature"]').each(function() {
    const trigger = $(this);
    const chatBubble = trigger.find('[data-anim="chat-bubble"]');
    const chatResponse = trigger.find('[data-anim="response"]');
    gsap.timeline({ scrollTrigger: { trigger, start: "40% bottom", once: true } }).add(revealChatBox(chatBubble)).add(revealResponse(chatResponse), ">-1").add(revealGraf(trigger), ">-2");
  });
  $('[data-anim="chat-feature"]').each(function() {
    const trigger = $(this);
    const chatBubble = trigger.find('[data-anim="chat-bubble"]');
    const chatResponse = trigger.find('[data-anim="response"]');
    gsap.timeline({ scrollTrigger: { trigger, start: "40% bottom", once: true } }).add(revealChatBox(chatBubble)).add(revealResponse(chatResponse), ">-1").add(revealGraf(trigger), ">-2");
  });
  $('[data-anim="dashboard"]').each(function() {
    const $el = $(this);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const dashboardImg = $el.find(".home-hero_dashboard-img")[0];
    const sidebar = $el.find("#sidebar")[0];
    const tabs = $el.find("#Tab, #Tab_2, #Tab_3, #Tab_4, #Tab_5, #Tab_6, #Tab_7").toArray();
    const title = $el.find("#title")[0];
    const search = $el.find("#search")[0];
    const $optionRows = $(".home-hero_options-row");
    const optionsRow1 = $optionRows.eq(0).find(".home-hero_options-item").toArray();
    const optionsRow2 = $optionRows.eq(1).find(".home-hero_options-item").toArray();
    const rows = [
      {
        row: $el.find("#row")[0],
        head: $el.find("#head")[0],
        cards: $el.find("#item_2, #item_3").toArray()
      },
      {
        row: $el.find("#row_2")[0],
        head: $el.find("#head_2")[0],
        cards: $el.find("#item_4, #item_5").toArray()
      },
      {
        row: $el.find("#row_3")[0],
        head: $el.find("#head_3")[0],
        cards: $el.find("#item_6, #item_7").toArray()
      }
    ];
    const leftCards = rows.map((r) => r.cards[0]).filter(Boolean);
    const rightCards = rows.map((r) => r.cards[1]).filter(Boolean);
    const allHeads = rows.map((r) => r.head).filter(Boolean);
    const allRowEls = rows.map((r) => r.row).filter(Boolean);
    if (sidebar)
      gsap.set(sidebar, { autoAlpha: 0, x: -30 });
    if (tabs.length)
      gsap.set(tabs, { autoAlpha: 0, x: -10 });
    if (title)
      gsap.set(title, { autoAlpha: 0, y: -20 });
    if (search)
      gsap.set(search, { autoAlpha: 0, y: -15 });
    if (allRowEls.length)
      gsap.set(allRowEls, { autoAlpha: 0 });
    if (allHeads.length)
      gsap.set(allHeads, { autoAlpha: 0 });
    if (leftCards.length)
      gsap.set(leftCards, { autoAlpha: 0, x: -30 });
    if (rightCards.length)
      gsap.set(rightCards, { autoAlpha: 0, x: 30 });
    if (optionsRow1.length)
      gsap.set(optionsRow1, { autoAlpha: 0, x: -50 });
    if (optionsRow2.length)
      gsap.set(optionsRow2, { autoAlpha: 0, x: 50 });
    if (dashboardImg)
      gsap.set(dashboardImg, { autoAlpha: 0, y: 20 });
    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: "back.out(1.4)" }
    });
    if (dashboardImg) {
      tl.to(dashboardImg, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0);
    }
    if (optionsRow1.length) {
      tl.to(
        optionsRow1,
        { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" },
        0
      );
    }
    if (optionsRow2.length) {
      tl.to(
        optionsRow2,
        { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" },
        0.15
      );
    }
    if (sidebar)
      tl.to(sidebar, { autoAlpha: 1, x: 0, duration: 0.5, ease: "power3.out" }, 0);
    if (tabs.length) {
      tl.to(tabs, { autoAlpha: 1, x: 0, duration: 0.25, stagger: 0.05 }, ">-0.2");
    }
    if (title)
      tl.to(title, { autoAlpha: 1, y: 0, duration: 0.3 }, ">-0.15");
    if (search)
      tl.to(search, { autoAlpha: 1, y: 0, duration: 0.3 }, ">-0.15");
    rows.forEach(({ row, head, cards }, i) => {
      const rowStart = i === 0 ? ">-0.1" : "<+=0.12";
      if (row)
        tl.set(row, { autoAlpha: 1 }, rowStart);
      if (head)
        tl.to(head, { autoAlpha: 1, duration: 0.15, ease: "power2.out" }, "<");
      if (cards.length) {
        tl.to(
          cards,
          { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.04, ease: "power3.out" },
          "<0.05"
        );
      }
    });
    tl.play();
  });
  $('[data-anim="platform-top"]').each(function() {
    gsap.timeline({
      delay: 1,
      scrollTrigger: { trigger: this, start: "top bottom", once: true },
      onComplete: () => window.dispatchEvent(new Event("platform-illustration-complete"))
    }).add(revealPlatformIllustration(this));
  });
  $('[data-anim="platform"]').each(function() {
    gsap.timeline({
      delay: 1,
      scrollTrigger: { trigger: this, start: "top bottom", once: true },
      onComplete: () => window.dispatchEvent(new Event("platform-illustration-complete"))
    }).add(revealPlatformIllustration(this));
    const $allBoxes = $(this).find(".platform-illustration_agent-box");
    let activeBox = null;
    $allBoxes.each(function() {
      const $box = $(this);
      $box.on("mouseenter", function() {
        activeBox = this;
        const $prev = $box.prevAll(".platform-illustration_agent-box");
        const $next = $box.nextAll(".platform-illustration_agent-box");
        gsap.killTweensOf($allBoxes.toArray());
        $allBoxes.each(function() {
          gsap.set(this, { zIndex: "auto" });
        });
        gsap.set(this, { zIndex: 10 });
        gsap.to(this, { rotation: -4, y: -14, scale: 1.03, duration: 0.3, ease: "power2.out" });
        gsap.to($prev.toArray(), {
          x: 18,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
          stagger: 0.04
        });
        gsap.to($next.toArray(), {
          x: -18,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
          stagger: 0.04
        });
      });
      $box.on("mouseleave", function() {
        if (activeBox !== this)
          return;
        activeBox = null;
        gsap.killTweensOf($allBoxes.toArray());
        gsap.to($allBoxes.toArray(), {
          x: 0,
          rotation: 0,
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: "power2.inOut",
          onComplete: () => $allBoxes.each(function() {
            gsap.set(this, { zIndex: "auto" });
          })
        });
      });
    });
  });
})();
//# sourceMappingURL=home.js.map
