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

  // src/products.js
  $('[data-anim="natural-lang-hero"]').each(function() {
    const trigger = $(this);
    const svg = trigger.find("svg")[0] || trigger;
    const side = svg.querySelector("#side");
    const header = svg.querySelector("#Header");
    const filters = svg.querySelector("#filters");
    const barChart = svg.querySelector("#Bar\\ Chart");
    const frame17 = svg.querySelector("#Frame\\ 17");
    const navItems = side ? [...side.querySelectorAll("#items > *")] : [];
    const chatBubble = trigger.find('[data-anim="chat-bubble"]');
    gsap.set(side, { autoAlpha: 0, x: -24 });
    gsap.set(header, { autoAlpha: 0, y: -18 });
    gsap.set(filters, { autoAlpha: 0 });
    gsap.set(barChart, { autoAlpha: 0, scale: 0.96, transformOrigin: "center center" });
    gsap.set(frame17, { autoAlpha: 0, x: -100 });
    if (navItems.length)
      gsap.set(navItems, { autoAlpha: 0, x: -10 });
    gsap.timeline({ delay: 0.5 }).to(side, { autoAlpha: 1, x: 0, duration: 0.5, ease: "power2.out" }, 0).to(header, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0.05).to(navItems, { autoAlpha: 1, x: 0, duration: 0.35, ease: "power2.out", stagger: 0.05 }, 0.25).to(filters, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0.4).to(barChart, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "power2.out" }, 0.5).to(frame17, { autoAlpha: 1, x: 0, duration: 0.45, ease: "power2.out" }, 0.8).add(revealGraf(trigger)).add(revealChatBox(chatBubble), "<");
  });
  $('[data-anim="product-chart"]').each(function() {
    const trigger = $(this);
    const chatBubble = trigger.find('[data-anim="chat-bubble"]');
    const grafTl = revealGraf(trigger);
    const chatTl = revealChatBox(chatBubble);
    const master = gsap.timeline({
      paused: true
    });
    master.add(chatTl, 0).add(grafTl, "<1");
    ScrollTrigger.create({
      trigger,
      start: "top 80%",
      once: true,
      onEnter: () => master.play()
    });
  });
})();
//# sourceMappingURL=products.js.map
