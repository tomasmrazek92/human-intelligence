/* Persona slider — Webflow build (real DOM, not SVG crops).
 *
 * The page owns everything: the cards are Webflow elements, the chat window is
 * a Webflow element, the answers are real text. This drives them.
 *
 *   .org-aware_slider           mount, carries data-hi-persona-slider
 *     .org-aware_slider-wrapper the rail
 *       .org-aware_slide        one per persona (the card)
 *         .org-aware_slide-content   that persona's prompt + answer, hidden
 *     .org-aware_slide-box      the chat window — the constant
 *
 * On init each slide's content is moved into the box and stacked, so the window
 * never redraws: only the message crossfades. The rail is tripled and re-seated
 * after every move, which is what makes the loop endless rather than rewinding.
 *
 * Text lives in Webflow, so copy changes never come back to code.
 */

export const CONFIG = {
  select: {
    track: '[data-hi-track], .org-aware_slider-wrapper',
    slide: '[data-hi-slide], .org-aware_slide',
    content: '[data-hi-content], .org-aware_slide-content',
    // tried in order, NOT as one selector list: querySelector resolves a list by
    // document order, which would return the outer box — the inner one wins
    stage: ['[data-hi-stage]', '.org-aware_slide-box-inner', '.org-aware_slide-box'],
    bubble: '[data-hi-bubble], .org-aware_slide-message',
    promptText: '[data-hi-prompt], .org-aware_slide-message-text',
    answer: '[data-hi-answer], .org-aware_slide-box-answer',
    answerText: 'p',
    dots: '[data-hi-dots], .org-aware_slider-dots',
    dotClass: 'org-aware_slider-dot',
    activeClass: 'is-active',
  },

  dwell: 6, // seconds before autoplay advances
  slide: 0.6, // rail travel
  swap: 0.4, // message out / in
  distance: 24, // how far a message travels while fading
  idleScale: 0.96, // the cards either side sit back
  idleAlpha: 0.55,
  swipe: 0.05, // fraction of a card that counts as a swipe
  swipeMin: 16, // …but never less than this many px
  flick: 0.25, // px/ms — a fast flick always advances
  dots: true, // build dots when the page has a container for them
  ease: 'osmo',

  // the conversation, offset from the start of the swap — these are the same
  // numbers the SVG scenes use for a chat panel
  chat: {
    bubble: { at: 0, duration: 0.5, scale: 0.94 },
    prompt: { at: 0.15, duration: 0.01, stagger: 0.012 },
    status: { at: 0.4, duration: 0.4, stagger: 0.08 },
    answer: { at: 0.75, duration: 0.55, stagger: 0.12, distance: 6 },
  },
};

// The page hides the content blocks (they live inside the cards until we move
// them), and that rule is a class, so clearing the inline style cannot undo it.
// Doubling the class beats a combo without needing !important.
const STYLE = `
.hi-persona-stage { position: relative; }
.hi-persona-msg.hi-persona-msg { display: flex; position: absolute; inset: 0; }
.hi-persona-msg.is-measure { position: relative; }
.hi-persona-unit { display: inline-block; will-change: opacity; }
`;

function injectStyle() {
  if (document.getElementById('hi-persona-dom-style')) return;
  const el = document.createElement('style');
  el.id = 'hi-persona-dom-style';
  el.textContent = STYLE;
  document.head.appendChild(el);
}

export function initPersonaSlider(scope) {
  const gsap = window.gsap;
  const mounts = (scope || document).querySelectorAll('[data-hi-persona-slider]');
  if (!gsap || !mounts.length) return;
  injectStyle();

  mounts.forEach((mount) => {
    if (mount.__personaSlider) mount.__personaSlider.destroy();

    const S = CONFIG.select;
    const track = mount.querySelector(S.track);
    const stage = S.stage.map((sel) => mount.querySelector(sel)).find(Boolean);
    if (!track || !stage) return console.warn('[persona] no track or stage inside the mount');

    const originals = [...track.querySelectorAll(S.slide)];
    const n = originals.length;
    if (n < 2) return console.warn('[persona] needs at least two slides');

    // The messages move into the chat window and stack there; the tallest sets
    // the height, so swapping never resizes the window.
    //
    // They may live inside their own card, or — the friendlier thing to build in
    // Webflow — collected in one hidden bucket anywhere in the mount. In that
    // case they pair with the cards by document order.
    stage.classList.add('hi-persona-stage');
    const loose = [...mount.querySelectorAll(S.content)].filter((el) => !stage.contains(el));
    const messages = originals.map((slide, i) => slide.querySelector(S.content) || loose[i] || null);
    if (messages.some((m) => !m))
      return console.warn(`[persona] ${n} slides but only ${loose.length} content blocks`);
    messages.forEach((content) => {
      content.classList.add('hi-persona-msg');
      content.style.display = '';
      stage.appendChild(content);
    });

    // one message is taken out of the stack to give the window its height
    const sizeStage = () => {
      messages.forEach((m) => m.classList.remove('is-measure'));
      let tallest = messages[0];
      let max = 0;
      messages.forEach((m) => {
        m.classList.add('is-measure');
        const h = m.offsetHeight;
        m.classList.remove('is-measure');
        if (h > max) {
          max = h;
          tallest = m;
        }
      });
      tallest.classList.add('is-measure');
      gsap.set(messages.filter((m) => m !== tallest), { position: 'absolute' });
    };
    // split before measuring: wrapping words in inline-block spans can change
    // where a line breaks, and the stage is sized off those heights
    messages.forEach(parts);
    sizeStage();

    // three sets of cards so the rail can travel one way forever
    const cards = [];
    for (let set = 0; set < 3; set++) {
      originals.forEach((slide, i) => {
        const card = set === 0 ? slide : slide.cloneNode(true);
        card.dataset.slide = String(i);
        if (set > 0) card.setAttribute('aria-hidden', 'true'); // clones are decorative
        track.appendChild(card);
        cards.push(card);
      });
    }

    // dots are optional: only built when the page gives them a home
    let dots = [];
    const dotWrap = mount.querySelector(S.dots);
    if (dotWrap && CONFIG.dots) {
      dotWrap.innerHTML = '';
      dots = originals.map((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = S.dotClass;
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => go(i));
        dotWrap.appendChild(dot);
        return dot;
      });
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let pos = n; // index within the tripled rail — start in the middle set
    let index = 0;
    let running = false;
    let rebaseCall = null;
    let drag = null;
    let draggedAt = 0; // a drag ends with a click on whatever card was under it

    // the visible viewport the cards are centred in, and the surface a drag
    // is read from
    const rail = track.parentElement || track;

    // Layout metrics. offsetLeft/offsetWidth are layout values, so a card's own
    // scale and the rail's translate never touch them — rects would.
    const step = () => (cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth);

    // Centre by measurement rather than by asking the page for centring padding:
    // the rail's untransformed left edge is its rect minus the x it currently
    // carries, and the card's centre is a plain layout offset inside it.
    function xFor(i) {
      const card = cards[i];
      if (!card) return 0;
      const carried = gsap.getProperty(track, 'x') || 0;
      const trackLeft = track.getBoundingClientRect().left - carried;
      const view = rail.getBoundingClientRect();
      const inTrack = card.offsetLeft - (card.offsetParent === track ? 0 : track.offsetLeft);
      return view.left + view.width / 2 - trackLeft - (inTrack + card.offsetWidth / 2);
    }

    function layout(instant) {
      const d = instant || reduced ? 0 : 1;
      gsap.to(track, { x: xFor(pos), duration: CONFIG.slide * d, ease: CONFIG.ease });
      cards.forEach((card, i) => {
        gsap.to(card, {
          scale: i === pos ? 1 : CONFIG.idleScale,
          autoAlpha: i === pos ? 1 : CONFIG.idleAlpha,
          duration: CONFIG.slide * d,
          ease: CONFIG.ease,
        });
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle(CONFIG.select.activeClass, i === index);
        dot.setAttribute('aria-selected', String(i === index));
      });
      originals.forEach((slide, i) => slide.classList.toggle(CONFIG.select.activeClass, i === index));
    }

    // Re-seat in the middle set after the travel. The card under the cursor is an
    // identical copy, so the jump is invisible.
    function rebase() {
      const target = n + index;
      if (pos === target) return;
      pos = target;
      gsap.set(track, { x: xFor(pos) });
      cards.forEach((card, i) =>
        gsap.set(card, { scale: i === pos ? 1 : CONFIG.idleScale, autoAlpha: i === pos ? 1 : CONFIG.idleAlpha })
      );
    }

    // Split the text nodes only, so element boundaries (strong, em, links)
    // survive untouched — the reason this isn't a naive innerHTML rewrite.
    function split(el, unit) {
      if (!el) return [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const texts = [];
      while (walker.nextNode()) texts.push(walker.currentNode);

      const out = [];
      texts.forEach((node) => {
        const pieces = unit === 'char' ? [...node.textContent] : node.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        pieces.forEach((piece) => {
          if (!piece) return;
          if (/^\s+$/.test(piece)) return frag.appendChild(document.createTextNode(piece));
          const span = document.createElement('span');
          span.className = 'hi-persona-unit';
          span.textContent = piece;
          frag.appendChild(span);
          out.push(span);
        });
        node.parentNode.replaceChild(frag, node);
      });
      return out;
    }

    // Words that share a top are one line, whatever wrapped them there.
    function groupLines(words) {
      const lines = [];
      let top = null;
      words.forEach((w) => {
        const y = Math.round(w.offsetTop);
        if (top === null || Math.abs(y - top) > 2) {
          lines.push([]);
          top = y;
        }
        lines[lines.length - 1].push(w);
      });
      return lines;
    }

    // split once per message, then reuse: re-splitting on every swap would
    // rebuild the DOM under a running tween
    function parts(message) {
      if (message.__parts) return message.__parts;
      const bubble = message.querySelector(S.bubble);
      const answer = message.querySelector(S.answer);
      const text = answer && answer.querySelector(S.answerText);
      const words = split(text, 'word');
      const built = {
        bubble,
        chars: split(bubble && bubble.querySelector(S.promptText), 'char'),
        status: answer ? [...answer.children].filter((c) => c !== text) : [],
        words,
        lines: groupLines(words),
      };
      message.__parts = built;
      return built;
    }

    function shortest(from, to) {
      const forward = (to - from + n) % n;
      const backward = (from - to + n) % n;
      return forward <= backward ? forward : -backward;
    }

    // The chat replays the scene engine's pattern for a conversation: the bubble
    // pops in, the prompt types, the status fades, the answer arrives a line at
    // a time. Same offsets as the "type"/"lines" tracks in SCENES.
    function swapMessage(previous, dir, instant) {
      const d = instant || reduced ? 0 : 1;
      if (previous !== index) {
        gsap.to(messages[previous], {
          autoAlpha: 0,
          x: -CONFIG.distance * dir,
          duration: CONFIG.swap * d,
          ease: CONFIG.ease,
        });
      }
      const message = messages[index];
      const p = parts(message);
      gsap.killTweensOf([message, p.bubble, ...p.chars, ...p.status, ...p.words].filter(Boolean));

      const tl = gsap.timeline();
      tl.set(message, { autoAlpha: 1, x: 0 });
      if (!d) {
        // first paint and reduced motion land on the finished conversation
        tl.set([p.bubble, ...p.chars, ...p.status, ...p.words].filter(Boolean), { autoAlpha: 1, scale: 1, y: 0 });
        return;
      }

      const C = CONFIG.chat;
      const base = previous === index ? 0 : CONFIG.swap * 0.5;
      if (p.bubble)
        tl.fromTo(
          p.bubble,
          { autoAlpha: 0, scale: C.bubble.scale },
          { autoAlpha: 1, scale: 1, duration: C.bubble.duration, ease: CONFIG.ease, transformOrigin: '100% 50%' },
          base + C.bubble.at
        );
      if (p.chars.length)
        tl.fromTo(
          p.chars,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: C.prompt.duration, ease: 'none', stagger: C.prompt.stagger },
          base + C.prompt.at
        );
      if (p.status.length)
        tl.fromTo(
          p.status,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: C.status.duration, ease: CONFIG.ease, stagger: C.status.stagger },
          base + C.status.at
        );
      // a line is a group of words sharing an offsetTop, so the markup inside the
      // answer (strong, links) is never touched
      p.lines.forEach((line, i) =>
        tl.fromTo(
          line,
          { autoAlpha: 0, y: C.answer.distance },
          { autoAlpha: 1, y: 0, duration: C.answer.duration, ease: CONFIG.ease },
          base + C.answer.at + i * C.answer.stagger
        )
      );
    }

    function go(next, instant) {
      const previous = index;
      const target = (next + n) % n;
      const delta = shortest(previous, target);
      index = target;
      pos += delta;

      swapMessage(previous, delta >= 0 ? 1 : -1, instant);
      layout(instant);
      queue();

      if (rebaseCall) rebaseCall.kill();
      if (instant || reduced) rebase();
      else rebaseCall = gsap.delayedCall(CONFIG.slide + 0.05, rebase);
    }

    function queue() {
      gsap.killTweensOf(tick);
      if (!running) return;
      gsap.delayedCall(CONFIG.dwell, tick);
    }
    function tick() {
      go(index + 1);
    }

    // ---- drag / swipe -------------------------------------------------------

    function onDown(e) {
      if (e.button > 0) return;
      drag = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        from: gsap.getProperty(track, 'x') || 0,
        moved: false,
        last: e.clientX,
        time: performance.now(),
        velocity: 0,
      };
      gsap.killTweensOf(track);
      gsap.killTweensOf(tick); // the dwell pauses while a finger is down
    }

    function onMove(e) {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < 6 || Math.abs(e.clientY - drag.y) > Math.abs(dx)) return; // vertical scroll wins
        drag.moved = true;
        rail.setPointerCapture(e.pointerId);
      }
      const now = performance.now();
      const dt = now - drag.time;
      if (dt > 0) drag.velocity = (e.clientX - drag.last) / dt;
      drag.last = e.clientX;
      drag.time = now;
      gsap.set(track, { x: drag.from + dx }); // tripled rail, so no clamp needed
    }

    function onUp(e) {
      if (!drag || e.pointerId !== drag.id) return;
      const { moved, velocity } = drag;
      const travelled = e.clientX - drag.x;
      drag = null;
      if (!moved) return queue();
      draggedAt = performance.now();
      const threshold = Math.max(CONFIG.swipeMin, step() * CONFIG.swipe);
      if (Math.abs(travelled) > threshold || Math.abs(velocity) > CONFIG.flick) {
        go(index + (travelled < 0 ? 1 : -1));
      } else {
        layout();
        queue();
      }
    }

    rail.addEventListener('pointerdown', onDown);
    rail.addEventListener('pointermove', onMove);
    rail.addEventListener('pointerup', onUp);
    rail.addEventListener('pointercancel', onUp);
    rail.style.touchAction = 'pan-y';

    // clicking a neighbouring card selects it
    cards.forEach((card, i) =>
      card.addEventListener('click', () => {
        // the click that ends a swipe would otherwise select the card under the
        // finger and undo the swipe
        if ((drag && drag.moved) || performance.now() - draggedAt < 350) return;
        const slideIndex = +card.dataset.slide;
        if (slideIndex !== index) go(slideIndex);
      })
    );

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible === running) return;
        running = visible;
        queue();
      },
      { threshold: 0.25 }
    );
    io.observe(mount);

    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return; // width-only: mobile scroll fires resize
      lastWidth = window.innerWidth;
      sizeStage();
      gsap.set(track, { x: xFor(pos) });
    };
    window.addEventListener('resize', onResize);

    gsap.set(messages, { autoAlpha: 0 });
    go(0, true);

    mount.__personaSlider = {
      destroy() {
        io.disconnect();
        window.removeEventListener('resize', onResize);
        rail.removeEventListener('pointerdown', onDown);
        rail.removeEventListener('pointermove', onMove);
        rail.removeEventListener('pointerup', onUp);
        rail.removeEventListener('pointercancel', onUp);
        gsap.killTweensOf(tick);
        if (rebaseCall) rebaseCall.kill();
        delete mount.__personaSlider;
      },
      go,
      get index() {
        return index;
      },
    };
  });
}
