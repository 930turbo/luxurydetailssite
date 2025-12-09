// About page interactions: FAQ smooth toggle + reveal-on-scroll (lightweight).

(() => {
  // Reveal-on-scroll for sections with .reveal (optional: add class in HTML if desired)
  const revealEls = document.querySelectorAll('.process-intel .intel-card, .stats .stat, .logo-row img, .tour-track img, .quote, .faq-list details');
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

  // FAQ open/close: ensure only one open at a time (optional)
  const list = document.getElementById('faqList');
  if (list) {
    list.addEventListener('toggle', (e) => {
      if (e.target.tagName.toLowerCase() !== 'details' || !e.target.open) return;
      list.querySelectorAll('details').forEach(d => { if (d !== e.target) d.removeAttribute('open'); });
    }, true);
  }
})();

(function () {
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

  // Hide-on-scroll
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
})();
