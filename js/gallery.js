// GALLERY: header pass-through + hide-on-scroll + reveal-on-scroll + filter pills
(() => {
  // ===== Inject header (same markup as About/Services) if not globally included =====
  const mount = document.getElementById('site-header');
  if (mount && !mount.innerHTML.trim()) {
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

    // Pass-through + hide-on-scroll
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      mount.classList.toggle('scrolled', y > 8);
      if (y > lastY && y > 120) mount.classList.add('hide');
      else mount.classList.remove('hide');
      lastY = y;
    };
    document.documentElement.classList.add('js','ready');
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ===== Reveal-on-scroll for gallery cards =====
  const gallery = document.getElementById('galleryMasonry');
  const revealEls = gallery ? gallery.querySelectorAll('.gal-item') : [];
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
  revealEls.forEach(el => io.observe(el));

  // ===== Filter pills (no external lib) =====
  const tabs = document.querySelector('.gal-tabs');
  if (tabs && gallery) {
    tabs.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-filter]');
      if (!a) return;
      e.preventDefault();

      // active state
      tabs.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      a.classList.add('active');

      // filter items
      const sel = a.dataset.filter;
      const items = gallery.querySelectorAll('.gal-item');
      if (sel === '*' || !sel) {
        items.forEach(it => { it.style.display = ''; });
      } else {
        items.forEach(it => {
          it.style.display = it.matches(sel) ? '' : 'none';
        });
      }

      // reflow masonry columns (force)
      gallery.style.columnGap = getComputedStyle(gallery).columnGap;
      // simple kick to repaint
      gallery.style.transform = 'translateZ(0)';
    });
  }

  // ===== Optional: Lightbox (very lightweight) =====
  gallery?.addEventListener('click', (e) => {
    const img = e.target.closest('img');
    if (!img) return;
    const src = img.getAttribute('src');
    const wrap = document.createElement('div');
    wrap.style.cssText = `
      position:fixed; inset:0; background:rgba(0,0,0,.9);
      display:flex; align-items:center; justify-content:center; z-index:9999;
    `;
    wrap.innerHTML = `
      <img src="${src}" alt="${img.alt || ''}" style="max-width:92vw; max-height:92vh; border-radius:12px; box-shadow:0 30px 70px rgba(0,0,0,.5)">
    `;
    wrap.addEventListener('click', () => wrap.remove());
    document.body.appendChild(wrap);
  });
})();

// header scroll behavior
document.addEventListener("scroll", () => {
  const header = document.getElementById("site-header");
  if (!header) return;
  
  if (window.scrollY > 80) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// auto-hide on scroll down
let lastScroll = 0;
window.addEventListener("scroll", () => {
  const header = document.getElementById("site-header");
  if (!header) return;
  
  const currentScroll = window.scrollY;
  if (currentScroll > lastScroll && currentScroll > 100) {
    header.classList.add("hide");
  } else {
    header.classList.remove("hide");
  }
  lastScroll = currentScroll;
});

// --- Smooth reopen add-on (non-destructive) ---
(() => {
  const SHOW_DELTA = 12;  // small upward movement to reveal
  const HOTZONE_Y  = 80;  // mouse/touch near top edge reveals
  let lastY = window.scrollY;
  let upDelta = 0;
  let ticking = false;

function revealHeader() {
  const header = document.getElementById("site-header");
  if (!header) return;
  if (!header.classList.contains("hide")) return;

  // ensure transition is applied from a computed hidden state
  header.style.transition = header.style.transition || ""; // no-op, but keeps intent clear
  // Force reflow so the browser recognizes the current (hidden) state
  // BEFORE we remove the class (this is the key to avoid instant jump)
  // eslint-disable-next-line no-unused-expressions
  header.getBoundingClientRect();

  // Remove hide on next frame to trigger transition
  requestAnimationFrame(() => {
    header.classList.remove("hide");
  });
}

  function onScrollReopen() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const header = document.getElementById("site-header");
      if (!header) { ticking = false; return; }

      const y = window.scrollY;
      const diff = y - lastY;

      if (diff < 0) {
        // scrolling up
        upDelta += -diff;
        if (upDelta > SHOW_DELTA) {
          header.classList.remove("hide");
          upDelta = 0; // reset after reveal
        }
      } else {
        // scrolling down or steady
        upDelta = 0;
      }

      lastY = y;
      ticking = false;
    });
  }

  // Reveal when pointer nears the top (desktop)
  function onMouseMove(e) {
    if (e.clientY <= HOTZONE_Y) revealHeader();
  }

  // Reveal when touch starts near the top (mobile)
  function onTouchStart(e) {
    const t = e.touches && e.touches[0];
    if (t && t.clientY <= HOTZONE_Y) revealHeader();
  }

  // Reveal when header or its children receive focus (keyboard users)
  function onFocusIn(e) {
    const header = document.getElementById("site-header");
    if (header && header.contains(e.target)) revealHeader();
  }

  window.addEventListener("scroll", onScrollReopen, { passive: true });
  window.addEventListener("mousemove", onMouseMove, { passive: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("focusin", onFocusIn);
})();
