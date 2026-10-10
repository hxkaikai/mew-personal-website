/* Native scrolling, progressive enhancement, and editable content. */
(() => {
  'use strict';
  const data = window.PROFILE;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safeUrl = value => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, location.href);
      return ['http:', 'https:', 'file:'].includes(url.protocol) ? value : null;
    } catch { return null; }
  };

  if (data) {
    const profile = data.profile;
    document.title = `${profile.name} · ${profile.tagline}`;
    $('#hero-title').innerHTML = `${escapeHTML(profile.name)}<span class="blue-dot">.</span>`;
    $$('.education-card').forEach((card, index) => {
      const item = data.education[index];
      if (!item) return;
      $('h3', card).textContent = item.school;
      $('.date', card).textContent = `${item.start} — ${item.end}`;
      $('.major', card).textContent = item.major;
      $('.education-bottom span', card).textContent = item.label.toUpperCase();
      $('.degree-label', card).innerHTML = item.end === '至今' ? `<i></i> ${escapeHTML(item.degree)}在读` : escapeHTML(item.degree);
    });
    if (!profile.heroVideo && profile.portrait && safeUrl(profile.portrait)) {
      const portrait = $('.hero-art img');
      portrait.src = profile.portrait;
      portrait.alt = `${profile.name}的个人照片`;
      portrait.style.cssText = 'max-height:560px;object-fit:contain;border-radius:28px';
      $('.hero-art').removeAttribute('aria-hidden');
      if ($('.orbit-caption')) $('.orbit-caption').hidden = true;
    }
    if (safeUrl(data.game?.image) && $('.blade-art')) $('.blade-art').src = data.game.image;
    const email = data.contact?.email;
    const resume = safeUrl(data.contact?.resume);
    const social = safeUrl(data.contact?.social);
    if (email || resume || social) {
      const contacts = document.createElement('div');
      contacts.className = 'contact-links';
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const link = document.createElement('a');
        link.href = `mailto:${email}`;
        link.textContent = '发一封邮件 ↗';
        contacts.append(link);
      }
      for (const [url, text] of [[resume, '查看简历 ↗'], [social, '社交主页 ↗']]) {
        if (!url) continue;
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = text;
        contacts.append(link);
      }
      $('.hello-inner').insertBefore(contacts, $('.back-to-top'));
    }
    const internshipList = $('#internship-list');
    if (internshipList && data.internships?.length) {
      internshipList.innerHTML = data.internships.map((item, index) => `
        <article class="internship-card${item.current ? ' internship-card-current' : ''}" aria-labelledby="internship-company-${index}">
          <div class="internship-top"><span class="internship-index">${String(index + 1).padStart(2, '0')}</span><span class="internship-period">${escapeHTML(item.period)}</span>${item.current ? '<span class="internship-current-label">目前在职</span>' : ''}</div>
          <h3 id="internship-company-${index}">${escapeHTML(item.company)}</h3>
          <p class="internship-role">${escapeHTML(item.department)}<span aria-hidden="true"> · </span>${escapeHTML(item.role)}</p>
          <p class="internship-summary">${escapeHTML(item.summary)}</p>
          <ul class="internship-highlights">${item.highlights.map(line => `<li>${escapeHTML(line)}</li>`).join('')}</ul>
          <div class="internship-tags" aria-label="工作方向">${item.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('')}</div>
        </article>`).join('');
    }
  }
  $('#copyright-year').textContent = new Date().getFullYear();

  // The page is complete before enhancement; unsupported animation APIs leave it readable.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const internshipTrack = $('#internship-list');
  const internshipControls = $('#internship-controls');
  if (internshipTrack && internshipControls) {
    const cards = $$('.internship-card', internshipTrack);
    const previous = $('#internship-prev');
    const next = $('#internship-next');
    // Reveal the strip once; entering cards should never fade from blank while swiping.
    cards.forEach(card => card.classList.remove('reveal'));
    $('#internship-count').textContent = `${cards.length} 段经历`;
    internshipControls.hidden = false;
    const maxScroll = () => Math.max(0, internshipTrack.scrollWidth - internshipTrack.clientWidth);
    const updateControls = () => {
      previous.disabled = internshipTrack.scrollLeft <= 2;
      next.disabled = internshipTrack.scrollLeft >= maxScroll() - 2;
    };
    const moveTo = left => internshipTrack.scrollTo({
      left: Math.max(0, Math.min(left, maxScroll())),
      behavior: reduceMotion.matches ? 'instant' : 'smooth'
    });
    const move = direction => {
      const positions = cards.map(card => card.offsetLeft);
      const current = internshipTrack.scrollLeft;
      const target = direction > 0
        ? positions.find(left => left > current + 2) ?? maxScroll()
        : positions.reverse().find(left => left < current - 2) ?? 0;
      moveTo(target);
    };
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    internshipTrack.addEventListener('scroll', updateControls, { passive: true });
    internshipTrack.addEventListener('keydown', event => {
      if (event.target !== internshipTrack || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home') moveTo(0);
      else if (event.key === 'End') moveTo(maxScroll());
      else move(event.key === 'ArrowRight' ? 1 : -1);
    });
    addEventListener('resize', updateControls, { passive: true });
    addEventListener('load', updateControls);
    if ('ResizeObserver' in window) new ResizeObserver(updateControls).observe(internshipTrack);
    updateControls();
  }
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js-enabled');
    const reveals = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          reveals.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -18px 0px' });
    $$('.reveal').forEach(element => reveals.observe(element));
  }

  const menu = $('.menu-toggle');
  const nav = $('#nav-links');
  const closeMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', '打开导航菜单');
    nav.classList.remove('is-open');
  };
  menu.addEventListener('click', event => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
    nav.classList.toggle('is-open', open);
    if (open && event.detail === 0) $('a', nav).focus();
  });
  $$('.nav-links a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });

  const hero = $('.hero');
  const heroCopy = $('.hero-copy');
  const heroArt = $('.hero-art');
  const progress = $('.reading-progress');
  const header = $('.site-header');
  const navItems = $$('.nav-links a').map(link => ({link, section: $(link.getAttribute('href')), top: 0}));
  let ticking = false;
  let pageHeight = 1;
  let heroHeight = 1;
  let mobile = innerWidth <= 680;
  const measure = () => {
    pageHeight = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    heroHeight = hero.offsetHeight;
    mobile = innerWidth <= 680;
    navItems.forEach(item => { item.top = item.section.getBoundingClientRect().top + scrollY; });
  };
  const renderScroll = () => {
    const y = scrollY;
    const p = Math.min(y / heroHeight, 1);
    progress.style.transform = `scaleX(${Math.min(1, y / pageHeight)})`;
    header.classList.toggle('is-scrolled', y > 30);
    if (!reduceMotion.matches && !mobile) {
      heroArt.style.transform = hero.classList.contains('has-video')
        ? `translate3d(0,${-p * 58}px,0)`
        : `translate3d(0,${-p * 130}px,0) rotate(${-p * 7}deg)`;
      heroCopy.style.transform = `translate3d(0,${p * 56}px,0)`;
      heroCopy.style.opacity = String(Math.max(0, 1 - p * 1.18));
    } else {
      heroArt.style.transform = '';
      heroCopy.style.transform = '';
      heroCopy.style.opacity = '';
    }
    let current = null;
    navItems.forEach(item => { if (y + 190 >= item.top) current = item; });
    navItems.forEach(item => {
      if (item === current) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    });
    ticking = false;
  };
  const requestRender = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(renderScroll); }
  };
  addEventListener('scroll', requestRender, { passive: true });
  addEventListener('resize', () => { measure(); requestRender(); if (innerWidth > 680) closeMenu(); }, { passive: true });
  addEventListener('load', () => { measure(); requestRender(); });
  reduceMotion.addEventListener?.('change', () => { measure(); requestRender(); });
  measure();
  requestRender();

  const sportLines = { '健身': '下一组，继续。', '徒步': '走进山野，让脚步带路。', '攀岩': '换一个角度，寻找下一个支点。', '击剑': '进退之间，保持专注。', '钓鱼': '慢下来，把时间交给水面。' };
  $$('.sport-tabs button').forEach(button => {
    button.addEventListener('click', () => {
      $$('.sport-tabs button').forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      $('#sport-line').textContent = sportLines[button.dataset.sport];
    });
  });
  $('#sport-line').setAttribute('aria-live', 'polite');

  const dialog = $('#detail-dialog');
  const dialogContent = $('#dialog-content');
  let opener = null;
  const dialogIntro = (eyebrow, title, text) => `<p class="dialog-eyebrow">${escapeHTML(eyebrow)}</p><h2 class="dialog-title" id="dialog-title">${escapeHTML(title)}</h2><p class="dialog-intro">${escapeHTML(text)}</p>`;
  const gallery = entries => `<div class="gallery-placeholders">${entries.map((item, index) => safeUrl(item.image) ? `<figure class="gallery-slot"><img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.label)}" loading="lazy"><figcaption>${escapeHTML(item.label)}</figcaption></figure>` : `<div class="gallery-slot"><span>${String(index + 1).padStart(2, '0')}</span><p>${escapeHTML(item.label)}</p><small>${escapeHTML(item.status)}</small></div>`).join('')}</div>`;
  const getDialog = key => {
    switch (key) {
      case 'fashion':
        return dialogIntro('FASHION DESIGN', '把想法，穿在身上。', data?.fashionGallery.some(item => safeUrl(item.image)) ? '一些关于廓形、面料与细节的探索。' : '设计作品图片即将补充。为手稿、成衣和细节，留下一点空间。') + gallery(data?.fashionGallery || []);
      case 'models':
        return dialogIntro('MY LITTLE COLLECTION', '小小世界，大大热爱。', data?.modelGallery.some(item => safeUrl(item.image)) ? '那些让日常多一点快乐的小小收藏。' : '收藏图片即将补充。这里将展示我喜欢的模型与玩具。') + gallery(data?.modelGallery || []);
      case 'game':
        return dialogIntro('IRELIA / GAMEPLAY', '艾瑞莉娅。刀锋起舞。', '三段完整操作片段，按上传顺序展示。点击播放，可开启声音或进入全屏。') + `<div class="game-reel-list">${(data?.game?.videos || []).filter(item => safeUrl(item.src)).map(item => `<figure><video src="${escapeHTML(item.src)}" poster="${escapeHTML(safeUrl(item.poster) || '')}" controls playsinline muted preload="none" aria-label="${escapeHTML(item.label)}"></video><figcaption>${escapeHTML(item.label)}<span>${escapeHTML(item.duration)}</span></figcaption></figure>`).join('')}</div>`;
      default: return '';
    }
  };
  $$('[data-dialog]').forEach(button => {
    button.addEventListener('click', () => {
      opener = button;
      $$('.portfolio-card video, .music-video').forEach(video => video.pause());
      dialog.classList.add('has-media-details');
      dialogContent.innerHTML = getDialog(button.dataset.dialog);
      dialog.showModal();
      document.dispatchEvent(new Event('media-dialog-open'));
      document.body.classList.add('dialog-open');
      dialog.scrollTop = 0;
      $('.dialog-close').focus({ preventScroll: true });
    });
  });
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    $$('video', dialog).forEach(video => video.pause());
    document.body.classList.remove('dialog-open');
    document.dispatchEvent(new Event('media-dialog-close'));
    opener?.focus({ preventScroll: true });
  });
})();
