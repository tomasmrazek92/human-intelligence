/* Nav dropdowns: one grey highlight per menu that slides to the hovered item,
 * instead of every item repainting its own background.
 *
 * Markup: data-nav-hover on the menu (the element holding the item links).
 * JS only creates, positions and shows the highlight; every visual rule lives in
 * the navbar's css-component embed in Webflow. Without this script the items'
 * own :hover background still works — the embed only mutes it under .is-tracking.
 */
// Desktop only: the dropdowns become the stacked mobile menu at 991 and below.
// Checked live (matchMedia change), so resizing across 992 switches it on/off.
const DESKTOP = '(min-width: 992px) and (hover: hover) and (pointer: fine)';

export function initNavHover(scope = document) {
  const mq = window.matchMedia(DESKTOP);

  scope.querySelectorAll('[data-nav-hover]').forEach((menu) => {
    if (menu.__navHover) return; // the nav persists across Barba — never wire twice
    menu.__navHover = true;

    const pill = document.createElement('div');
    pill.className = 'nav_menu-drop-hover';
    pill.setAttribute('aria-hidden', 'true');
    menu.prepend(pill); // absolutely positioned, so it takes no grid/flex slot

    let shown = false;

    // .is-tracking is what mutes the items' own :hover grey — only while active
    const sync = () => {
      menu.classList.toggle('is-tracking', mq.matches);
      if (!mq.matches) hide();
    };

    // offset* rather than rects: the dropdown list may be mid-transform while opening
    const apply = (item) => {
      pill.style.transform = `translate(${item.offsetLeft}px, ${item.offsetTop}px)`;
      pill.style.width = `${item.offsetWidth}px`;
      pill.style.height = `${item.offsetHeight}px`;
    };

    const place = (item) => {
      if (!mq.matches) return;
      if (!shown) {
        // entering the menu: appear under the item, don't fly in from the last one
        pill.style.transition = 'none';
        apply(item);
        void pill.offsetWidth;
        pill.style.transition = '';
      } else {
        apply(item);
      }
      pill.classList.add('is-shown');
      shown = true;
    };

    const hide = () => {
      pill.classList.remove('is-shown');
      shown = false;
    };

    menu.querySelectorAll('a').forEach((item) => {
      item.addEventListener('pointerenter', () => place(item));
      item.addEventListener('focus', () => place(item));
    });
    menu.addEventListener('pointerleave', hide);
    menu.addEventListener('focusout', (e) => {
      if (!menu.contains(e.relatedTarget)) hide();
    });

    mq.addEventListener('change', sync);
    sync();
  });
}
