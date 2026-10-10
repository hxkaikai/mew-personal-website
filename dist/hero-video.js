/* A paused, frame-addressable portrait. Time never advances by itself. */
(() => {
  'use strict';
  const hero = document.querySelector('.hero.has-video');
  const video = document.querySelector('#hero-video');
  const portrait = document.querySelector('.hero-portrait');
  const toggle = document.querySelector('#portrait-toggle');
  const hint = document.querySelector('#portrait-hint');
  const config = window.PROFILE?.profile?.heroVideo;
  if (!hero || !video || !portrait || !config?.src) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const compact = matchMedia('(max-width: 680px)');
  const neutral = config.neutralTime ?? 0.083333;
  const poses = config.poses;
  let enabled = true;
  let visible = true;
  let failed = false;
  let loaded = false;
  let raf = 0;
  let point = null;
  let targetTime = neutral;
  let origin = null;
  let lowerRightPose = 'right';

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  const mayTrack = () => enabled && visible && !document.hidden && !reduced.matches && finePointer.matches && !compact.matches && !failed;
  const showPoster = () => video.classList.remove('is-ready');
  const resetTransform = () => {
    for (const property of ['--portrait-x', '--portrait-y', '--portrait-rx', '--portrait-ry']) portrait.style.removeProperty(property);
  };
  const seekLatest = () => {
    if (!mayTrack() || video.readyState < 1 || video.seeking || !Number.isFinite(video.duration)) return;
    const time = Math.min(Math.max(0, targetTime), video.duration - 1 / 24);
    if (Math.abs(video.currentTime - time) < 1 / 48) return;
    try { video.currentTime = time; } catch { /* Keep the still poster if seeking is unavailable. */ }
  };
  const loadVideo = () => {
    if (loaded || !mayTrack()) return;
    loaded = true;
    video.preload = 'auto';
    video.src = config.src;
    video.load();
  };

  // The clip covers right -> up -> left -> down. Down-right uses its nearest
  // available downward pose rather than sweeping through the full ten-second clip.
  const poseFor = (x, y) => {
    if (Math.hypot(x, y) < 0.15) { lowerRightPose = 'right'; return neutral; }
    const mix = (a, b, t) => a + (b - a) * Math.min(1, Math.max(0, t));
    const angle = Math.atan2(-y, x) * 180 / Math.PI;
    if (angle >= 0) lowerRightPose = 'right';
    if (angle <= -90) lowerRightPose = 'down';
    if (angle >= 0 && angle <= 45) return mix(poses.right, poses.upRight, angle / 45);
    if (angle > 45 && angle <= 90) return mix(poses.upRight, poses.up, (angle - 45) / 45);
    if (angle > 90 && angle <= 135) return mix(poses.up, poses.upLeft, (angle - 90) / 45);
    if (angle > 135) return mix(poses.upLeft, poses.left, (angle - 135) / 45);
    if (angle < -135) return mix(poses.left, poses.downLeft, (angle + 180) / 45);
    if (angle < -90) return mix(poses.downLeft, poses.down, (angle + 135) / 45);
    // No real down-right turn exists in this clip. Select the nearest pose,
    // with a 14-degree hysteresis band to avoid chatter near the diagonal.
    if (angle < -52) lowerRightPose = 'down';
    else if (angle > -38) lowerRightPose = 'right';
    return lowerRightPose === 'right' ? poses.right : mix(poses.down, poses.downRight, (angle + 90) / 52);
  };
  const measure = () => {
    // Use the unrotated parent as reference so pointer transforms cannot feed back.
    const rect = portrait.parentElement.getBoundingClientRect();
    origin = { x: rect.left + rect.width / 2, y: rect.top + portrait.offsetHeight * 0.42, width: rect.width, height: portrait.offsetHeight };
  };
  const renderPointer = () => {
    raf = 0;
    if (!mayTrack() || !point) return;
    if (!origin) measure();
    const clamp = value => Math.max(-1, Math.min(1, value));
    const x = clamp((point.x - origin.x) / (origin.width * 0.65));
    const y = clamp((point.y - origin.y) / (origin.height * 0.6));
    targetTime = Math.round(poseFor(x, y) * 24) / 24;
    loadVideo();
    seekLatest();
  };
  const onPointer = event => {
    if (event.pointerType === 'touch' || !mayTrack()) return;
    if (event.clientY > hero.getBoundingClientRect().bottom) return;
    point = { x: event.clientX, y: event.clientY };
    if (!raf) raf = requestAnimationFrame(renderPointer);
  };
  const neutralize = () => {
    point = null;
    targetTime = neutral;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    resetTransform();
    if (mayTrack()) seekLatest();
    else showPoster();
  };
  const updateMode = () => {
    const interactive = enabled && !reduced.matches && finePointer.matches && !compact.matches && !failed;
    hero.classList.toggle('is-tracking', interactive);
    toggle.hidden = reduced.matches || !finePointer.matches || compact.matches || failed;
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.textContent = enabled ? '暂停跟随' : '开启跟随';
    hint.textContent = interactive ? '移动鼠标，和我打个招呼。' : '很高兴，认识你。';
    portrait.setAttribute('aria-label', interactive ? '胡轩恺的互动肖像，人物会随鼠标方向转头' : '胡轩恺的个人肖像');
    neutralize();
    if (interactive) loadVideo();
  };

  video.addEventListener('loadedmetadata', seekLatest);
  video.addEventListener('loadeddata', () => {
    if (mayTrack()) video.classList.add('is-ready');
    seekLatest();
  });
  video.addEventListener('seeked', () => {
    if (mayTrack()) video.classList.add('is-ready');
    seekLatest();
  });
  video.addEventListener('error', () => { failed = true; showPoster(); updateMode(); });
  // Defensive invariant: the interactive portrait must never run as an autoplay loop.
  video.addEventListener('play', () => video.pause());
  toggle.addEventListener('click', () => { enabled = !enabled; updateMode(); });
  document.addEventListener('pointermove', onPointer, { passive: true });
  document.documentElement.addEventListener('pointerleave', neutralize);
  window.addEventListener('blur', neutralize);
  addEventListener('resize', () => { origin = null; neutralize(); }, { passive: true });
  addEventListener('scroll', () => { origin = null; }, { passive: true });
  document.addEventListener('visibilitychange', () => { neutralize(); if (!document.hidden) loadVideo(); });
  reduced.addEventListener?.('change', updateMode);
  finePointer.addEventListener?.('change', updateMode);
  compact.addEventListener?.('change', updateMode);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (!visible) neutralize();
      else { origin = null; loadVideo(); seekLatest(); }
    }, { threshold: 0 }).observe(portrait);
  }
  updateMode();
})();
