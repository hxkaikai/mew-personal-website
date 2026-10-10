(() => {
  'use strict';
  // Shared controller for the sport card's two videos and photo galleries.
  const card = document.querySelector('.sport-card');
  if (!card) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const mediaIds = { '健身': 'fitness', '徒步': 'hiking', '攀岩': 'climbing', '击剑': 'fencing', '钓鱼': 'fishing' };
  let selectedSport = '健身';
  let inView = !('IntersectionObserver' in window);

  const videos = [['fitness', '健身'], ['fishing', '钓鱼']].map(([id, label]) => {
    const video = document.getElementById(`${id}-video`);
    const media = document.getElementById(`${id}-media`);
    const playButton = document.getElementById(`${id}-play`);
    const soundButton = document.getElementById(`${id}-sound`);
    let wantsPlay = !reducedMotion.matches;
    let playPending = false;
    const updateControls = () => {
      if (video.error) {
        playButton.textContent = '视频暂不可用';
        playButton.setAttribute('aria-label', `${label}视频暂不可用`);
        playButton.disabled = true;
        soundButton.hidden = true;
        return;
      }
      playButton.textContent = video.paused ? '播放' : '暂停';
      playButton.setAttribute('aria-label', `${video.paused ? '播放' : '暂停'}${label}视频`);
      soundButton.textContent = video.muted ? '开启声音' : '静音';
      soundButton.setAttribute('aria-label', video.muted ? `开启${label}视频声音` : `静音${label}视频`);
    };
    const shouldPlay = () => selectedSport === label && inView && !document.hidden && !document.querySelector('dialog[open]') && ![...document.querySelectorAll('.music-video, .portfolio-card video, .game-reel-list video')].some(media => !media.paused) && wantsPlay;
    const sync = () => {
      if (!shouldPlay()) {
        video.pause();
        updateControls();
        return;
      }
      if (!video.paused || playPending || video.error) return;
      playPending = true;
      video.play().catch(error => {
        // Switching tabs can cancel play; autoplay rejection waits for a click.
        if (error.name !== 'AbortError') wantsPlay = false;
      }).finally(() => {
        playPending = false;
        sync();
        updateControls();
      });
    };
    playButton.addEventListener('click', () => {
      wantsPlay = video.paused;
      if (wantsPlay) document.querySelectorAll('.music-video, .portfolio-card video, .game-reel-list video').forEach(media => media.pause());
      sync();
    });
    soundButton.addEventListener('click', () => {
      video.muted = !video.muted;
      updateControls();
    });
    video.addEventListener('play', () => {
      if (!shouldPlay()) video.pause();
      updateControls();
    });
    video.addEventListener('pause', updateControls);
    video.addEventListener('volumechange', updateControls);
    video.addEventListener('error', () => {
      wantsPlay = false;
      video.pause();
      video.hidden = true;
      media.classList.add('has-error');
      updateControls();
    });
    video.controls = false;
    video.muted = true;
    updateControls();
    return { sync, reduceMotion() { wantsPlay = false; sync(); } };
  });
  const syncPlayback = () => videos.forEach(controller => controller.sync());

  const track = document.getElementById('hiking-track');
  const count = document.getElementById('hiking-count');
  const previous = document.getElementById('hiking-prev');
  const next = document.getElementById('hiking-next');
  const photoCount = track.children.length;
  let photoIndex = 0;
  let photoTarget = null;
  const updateGallery = () => {
    if (!track.clientWidth) return;
    if (photoTarget !== null) {
      if (Math.abs(track.scrollLeft - photoTarget * track.clientWidth) > 2) return;
      photoTarget = null;
    }
    photoIndex = Math.max(0, Math.min(photoCount - 1, Math.round(track.scrollLeft / track.clientWidth)));
    count.textContent = `${photoIndex + 1} / ${photoCount}`;
    previous.disabled = photoIndex === 0;
    next.disabled = photoIndex === photoCount - 1;
  };
  const showPhoto = (index, instant = false) => {
    photoIndex = Math.max(0, Math.min(photoCount - 1, index));
    photoTarget = photoIndex;
    track.scrollTo({ left: photoIndex * track.clientWidth, behavior: instant || reducedMotion.matches ? 'instant' : 'smooth' });
    count.textContent = `${photoIndex + 1} / ${photoCount}`;
    previous.disabled = photoIndex === 0;
    next.disabled = photoIndex === photoCount - 1;
  };
  previous.addEventListener('click', () => showPhoto(photoIndex - 1));
  next.addEventListener('click', () => showPhoto(photoIndex + 1));
  track.addEventListener('scroll', updateGallery, { passive: true });
  ['wheel', 'touchstart', 'pointerdown'].forEach(eventName => {
    track.addEventListener(eventName, () => {
      photoTarget = null;
      updateGallery();
    }, { passive: true });
  });
  track.addEventListener('keydown', event => {
    if (event.target !== track || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const destinations = { ArrowLeft: photoIndex - 1, ArrowRight: photoIndex + 1, Home: 0, End: photoCount - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    showPhoto(destinations[event.key]);
  });
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      if (selectedSport === '徒步' && track.clientWidth) showPhoto(photoIndex, true);
    }).observe(track);
  } else {
    addEventListener('resize', () => {
      if (selectedSport === '徒步') showPhoto(photoIndex, true);
    }, { passive: true });
  }

  const selectSport = sport => {
    selectedSport = sport;
    const id = mediaIds[sport];
    Object.values(mediaIds).forEach(mediaId => {
      document.getElementById(`${mediaId}-media`).hidden = mediaId !== id;
      const controls = document.getElementById(`${mediaId}-actions`);
      if (controls) controls.hidden = mediaId !== id;
    });
    const hasMedia = Boolean(id);
    card.classList.toggle('has-fitness-video', hasMedia);
    card.classList.toggle('has-sport-photos', ['徒步', '攀岩', '击剑'].includes(sport));
    card.classList.toggle('has-fishing-video', sport === '钓鱼');
    card.querySelector('h3').hidden = sport !== '健身';
    document.getElementById('sport-category').textContent = sport;
    if (sport === '徒步') showPhoto(photoIndex, true);
    syncPlayback();
  };
  card.querySelectorAll('[data-sport]').forEach(button => {
    button.addEventListener('click', () => selectSport(button.dataset.sport));
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.25;
      syncPlayback();
    }, { threshold: [0, 0.25] }).observe(card);
  }
  document.addEventListener('visibilitychange', syncPlayback);
  document.addEventListener('media-dialog-open', syncPlayback);
  document.addEventListener('media-dialog-close', syncPlayback);
  reducedMotion.addEventListener?.('change', () => {
    if (reducedMotion.matches) videos.forEach(controller => controller.reduceMotion());
    else syncPlayback();
  });
  selectSport(selectedSport);
})();
