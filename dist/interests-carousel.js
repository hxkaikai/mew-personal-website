/* Independent outer shelf: no wheel or pointer hijacking over photos/videos. */
(() => {
  'use strict';
  const track = document.getElementById('interests-track');
  const controls = document.getElementById('interests-controls');
  if (!track || !controls) return;
  const cards = [...track.children];
  const previous = document.getElementById('interests-prev');
  const next = document.getElementById('interests-next');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);
  const positions = () => [...new Set(cards.map(card => Math.min(card.offsetLeft, maxScroll())))];
  let target = null;
  const update = () => {
    if (target !== null && Math.abs(track.scrollLeft - target) < 2) target = null;
    previous.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= maxScroll() - 2;
  };
  const moveTo = (left, instant = false) => {
    target = Math.max(0, Math.min(left, maxScroll()));
    track.scrollTo({ left: target, behavior: instant || reducedMotion.matches ? 'instant' : 'smooth' });
    update();
  };
  const move = direction => {
    const current = target ?? track.scrollLeft;
    const stops = positions();
    moveTo(direction > 0
      ? stops.find(left => left > current + 2) ?? maxScroll()
      : stops.reverse().find(left => left < current - 2) ?? 0);
  };
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('scroll', update, { passive: true });
  ['wheel', 'touchstart', 'pointerdown', 'focusin'].forEach(name => {
    track.addEventListener(name, () => { target = null; }, { passive: true });
  });
  track.addEventListener('keydown', event => {
    if (event.target !== track || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') moveTo(0, true);
    else if (event.key === 'End') moveTo(maxScroll(), true);
    else move(event.key === 'ArrowRight' ? 1 : -1);
  });
  const resize = () => { target = null; update(); };
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(track);
  else addEventListener('resize', resize, { passive: true });
  controls.hidden = false;
  update();
})();
