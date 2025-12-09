// Reveal-on-scroll for cards and images
(() => {
  const targets = document.querySelectorAll('.svc-card, .svc-masonry img, .brand-row img');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, {threshold: 0.08});

  targets.forEach(el => {
    el.classList.add('reveal');
    io.observe(el);
  });
})();

// If page is reloaded with a hash, strip it so the browser doesn't auto-jump
(() => {
  const nav = performance.getEntriesByType('navigation')[0];
  const isReload = nav && nav.type === 'reload';
  if (isReload && location.hash) {
    // Remove the hash without adding a history entry
    history.replaceState(null, '', location.pathname + location.search);
    // Ensure we're at the top after stripping
    window.scrollTo({ top: 0, left: 0 });
  }
})();


// Smooth scroll for in-page nav
document.querySelectorAll('.svc-tabs a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const target = document.querySelector(targetId);
    if (!target) return;

    window.scrollTo({
      top: target.offsetTop - 80, // adjust if header overlaps
      behavior: 'smooth'
    });
  });
});

// SERVICES: header pass-through + hide-on-scroll + reveal-on-scroll
(() => {
  // ===== Reveal-on-scroll (targets Services blocks) =====
  const revealEls = document.querySelectorAll(`
    .svc-section .svc-head,
    .svc-section .svc-card,
    .svc-masonry img,
    .brand-row img,
    .stats .stat,
    .quote
  `);

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.transition = 'transform .5s ease, opacity .5s ease';
        e.target.style.transform = 'none';
        e.target.style.opacity = '1';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  revealEls.forEach(el => {
    el.style.transform = 'translateY(10px)';
    el.style.opacity = '0';
    io.observe(el);
  });

  // ===== Mount header (same markup/behavior as About) =====
  const mount = document.getElementById('site-header');
  if (!mount) return;

  mount.classList.add('site-header');
  mount.innerHTML = `
    <nav class="nav" aria-label="Main Navigation">
      <a class="brand" href="/"><span>Luxury</span> Details</a>

      <button class="menu-toggle" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>

      <ul class="nav-links">
        <li><a href="/pages/about.html">About</a></li>
        <li><a href="/pages/services.html">Services</a></li>
        <li><a href="/pages/gallery.html">Gallery</a></li>
        <li><a class="cta-link" href="/pages/contact.html">Contact</a></li>
      </ul>
    </nav>
  `;

  // Mobile toggle
  const btn = mount.querySelector('.menu-toggle');
  const list = mount.querySelector('.nav-links');
  if (btn && list) {
    btn.addEventListener('click', () => {
      const open = list.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-open', open);
    });
  }

  // Active link
  const path = location.pathname.replace(/\/$/, '');
  mount.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

  // ===== Pass-through + hide-on-scroll (identical to About) =====
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    mount.classList.toggle('scrolled', y > 8);      // adds blur/transparent bg
    if (y > lastY && y > 120) mount.classList.add('hide'); // slide up when scrolling down
    else mount.classList.remove('hide');                   // show on scroll up / near top
    lastY = y;
  };
  document.documentElement.classList.add('js','ready');
  window.addEventListener('scroll', onScroll, { passive: true });
})();

(() => {
  const header = document.getElementById('site-header');
  const getOffset = () => (header ? header.offsetHeight : 0) + 12;

  // Apply offset when landing on the page with a hash
  window.addEventListener('load', () => {
    if (!location.hash) return;
    const target = document.querySelector(location.hash);
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.pageYOffset - getOffset();
    window.scrollTo({ top: y, behavior: 'smooth' });
  });

  // Intercept in-page hash links (tabs, etc.) and apply offset
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.pageYOffset - getOffset();
    window.scrollTo({ top: y, behavior: 'smooth' });
    history.pushState(null, '', id);
  });
})();

// Image Lightbox (no flash on close)
(() => {
  const images = document.querySelectorAll('.svc-card img, .svc-masonry img');
  if (!images.length) return;

  // Build overlay once
  const overlay = document.createElement('div');
  overlay.className = 'img-lightbox';
  overlay.innerHTML = `
    <div class="img-lightbox-inner">
      <img src="" alt="">
      <span class="close-btn" aria-label="Close">&times;</span>
    </div>
  `;
  document.body.appendChild(overlay);

  const overlayImg = overlay.querySelector('img');
  const closeBtn   = overlay.querySelector('.close-btn');

  let isClosing = false;

  const openLightbox = (img) => {
    overlayImg.src = img.currentSrc || img.src;
    overlayImg.alt = img.alt || '';
    document.body.classList.add('no-scroll');
    overlay.classList.add('open');
  };

  const closeLightbox = () => {
    if (isClosing || !overlay.classList.contains('open')) return;
    isClosing = true;
    overlay.classList.remove('open');  // start fade-out

    // Wait for opacity transition to finish, THEN clear src
    const onDone = (e) => {
      if (e && e.target !== overlay) return;
      overlay.removeEventListener('transitionend', onDone);
      overlayImg.src = '';            // clear *after* fade
      document.body.classList.remove('no-scroll');
      isClosing = false;
    };
    overlay.addEventListener('transitionend', onDone);

    // Fallback in case transitionend doesn't fire (e.g., user prefers reduced motion)
    setTimeout(() => {
      if (!isClosing) return;
      overlay.dispatchEvent(new Event('transitionend')); // trigger handler
    }, 350);
  };

  images.forEach(img => img.addEventListener('click', () => openLightbox(img)));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === closeBtn) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
})();

