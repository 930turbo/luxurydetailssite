// footer.js
(function () {
  const mount = document.getElementById('site-footer');
  if (!mount) return;

  mount.classList.add('site-footer');
  mount.innerHTML = `
    <div class="footer-wrap">
      <div class="footer-badge">
        <img src="/assets/mark.png" alt="Luxury Details mark" />
      </div>

      <nav class="footer-nav" aria-label="Footer navigation">
        <a href="/pages/about.html">About</a>
        <a href="/pages/services.html">Services</a>
        <a href="/pages/gallery.html">Gallery</a>
        <a href="/pages/contact.html">Contact</a>
      </nav>

      <div class="footer-social" aria-label="Social links">
        <a class="soc-ig" href="#" aria-label="Instagram">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5"/>
            <circle cx="12" cy="12" r="3.2"/>
            <circle cx="17.5" cy="6.5" r="1.2"/>
          </svg>
        </a>
        <a class="soc-fb" href="#" aria-label="Facebook">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14 9h3V5h-3c-2.2 0-4 1.8-4 4v2H7v4h3v6h4v-6h3l1-4h-4V9c0-.6.4-1 1-1z"/>
          </svg>
        </a>
        <a class="soc-tt" href="#" aria-label="TikTok">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 8.5a6 6 0 0 1-4-1.7V16a5 5 0 1 1-5-5c.3 0 .7 0 1 .1V14a2 2 0 1 0 2 2V3h3c.2.8.7 1.6 1.3 2.2A6.5 6.5 0 0 0 19 6"/>
          </svg>
        </a>
      </div>

      <div class="footer-copy">© <strong>Luxury Details</strong> ${new Date().getFullYear()}</div>
    </div>
  `;

  // Highlight active page link
  const path = location.pathname.replace(/\/$/, '');
  mount.querySelectorAll('.footer-nav a').forEach(a => {
    if (a.getAttribute('href') === path) {
      a.classList.add('active');
    }
  });
})();
