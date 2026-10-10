(() => {
  'use strict';
  const data = window.PROFILE;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const collections = { fashion: data?.fashionGallery, models: data?.modelGallery, game: data?.game?.videos };
  const safeSource = value => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try { return ['http:', 'https:', 'file:'].includes(new URL(value, location.href).protocol) ? value : null; }
    catch { return null; }
  };
  const manualVideoSelector = '.portfolio-card video, .game-reel-list video, .music-video';
  const portfolioVideos = () => [...document.querySelectorAll(manualVideoSelector)];
  const musicVideo = document.getElementById('music-video');
  if (musicVideo) {
    const music = data?.musicVideo;
    if (safeSource(music?.src)) musicVideo.src = music.src;
    if (safeSource(music?.poster)) musicVideo.poster = music.poster;
    if (music?.label) musicVideo.setAttribute('aria-label', music.label);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) musicVideo.pause();
      }, { threshold: 0 }).observe(musicVideo);
    }
  }

  document.querySelectorAll('.portfolio-card').forEach(card => {
    const track = card.querySelector('.portfolio-track');
    const entries = collections[card.dataset.collection];
    const isVideo = card.dataset.collection === 'game';
    if (entries?.length) {
      const slides = entries.filter(item => safeSource(isVideo ? item.src : item.image)).map(item => {
        const slide = document.createElement('figure');
        slide.className = 'portfolio-slide';
        const media = document.createElement(isVideo ? 'video' : 'img');
        media.src = isVideo ? item.src : item.image;
        if (isVideo) {
          if (safeSource(item.poster)) media.poster = item.poster;
          media.controls = true;
          media.playsInline = true;
          media.muted = true;
          media.preload = 'none';
          media.setAttribute('aria-label', item.label);
        } else {
          media.alt = item.label;
          media.loading = 'lazy';
          media.draggable = false;
        }
        slide.append(media);
        return slide;
      });
      if (slides.length) track.replaceChildren(...slides);
    }
    const slides = [...track.children];
    const count = card.querySelector('.portfolio-count');
    const previous = card.querySelector('[data-media-prev]');
    const next = card.querySelector('[data-media-next]');
    const caption = card.querySelector('.portfolio-caption');
    let index = 0;
    let target = null;
    const update = () => {
      count.textContent = `${index + 1} / ${slides.length}`;
      previous.disabled = index === 0;
      next.disabled = index === slides.length - 1;
      slides.forEach((slide, position) => {
        slide.inert = position !== index;
        if (position !== index) slide.querySelector('video')?.pause();
      });
      const item = entries?.[index];
      if (item) caption.textContent = isVideo ? `操作片段 ${String(index + 1).padStart(2, '0')} · ${item.duration} · 点击播放` : item.label;
    };
    const show = (destination, instant = false) => {
      index = Math.max(0, Math.min(slides.length - 1, destination));
      target = index;
      track.scrollTo({ left: index * track.clientWidth, behavior: instant || reducedMotion.matches ? 'instant' : 'smooth' });
      update();
    };
    const syncScroll = () => {
      if (!track.clientWidth) return;
      if (target !== null) {
        if (Math.abs(track.scrollLeft - target * track.clientWidth) > 2) return;
        target = null;
      }
      index = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
      update();
    };
    previous.addEventListener('click', () => show(index - 1));
    next.addEventListener('click', () => show(index + 1));
    track.addEventListener('scroll', syncScroll, { passive: true });
    ['wheel', 'touchstart', 'pointerdown'].forEach(name => track.addEventListener(name, () => { target = null; syncScroll(); }, { passive: true }));
    track.addEventListener('keydown', event => {
      if (event.target !== track || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const destinations = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: slides.length - 1 };
      if (!(event.key in destinations)) return;
      event.preventDefault();
      show(destinations[event.key]);
    });
    if ('ResizeObserver' in window) new ResizeObserver(() => { if (track.clientWidth) show(index, true); }).observe(track);
    else addEventListener('resize', () => show(index, true), { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) track.querySelectorAll('video').forEach(video => video.pause());
      }, { threshold: 0 }).observe(track);
    }
    card.querySelector('.portfolio-arrows').hidden = false;
    update();
  });

  // Native controls keep seeking, volume and full-screen available. Never autoplay.
  document.addEventListener('play', event => {
    if (!(event.target instanceof HTMLVideoElement) || !event.target.matches(`${manualVideoSelector}, .sport-video`)) return;
    document.querySelectorAll(`${manualVideoSelector}, .sport-video`).forEach(video => {
      if (video !== event.target) video.pause();
    });
  }, true);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) portfolioVideos().forEach(video => video.pause());
  });
})();
