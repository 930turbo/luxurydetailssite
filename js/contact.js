// CONTACT: header injection + hide-on-scroll + form validation + Leaflet map
(() => {
    // ===== Header injection (same markup/pattern as other pages) =====
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

        // Hide-on-scroll
        let lastY = window.scrollY;
        const onScroll = () => {
            const y = window.scrollY;
            mount.classList.toggle('scrolled', y > 8);
            if (y > lastY && y > 120) mount.classList.add('hide');
            else mount.classList.remove('hide');
            lastY = y;
        };
        document.documentElement.classList.add('js', 'ready');
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // ===== Form validation (outline missing fields red; disable submit until valid) =====
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');

    const requiredFields = ['name', 'email', 'subject', 'message'];
    const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');

    function validateField(field) {
        const wrap = field.closest('.field');
        let valid = true;

        if (field.hasAttribute('required')) {
            valid = field.value.trim().length > 0;
            if (valid && field.type === 'email') valid = isEmail(field.value.trim());
        }
        wrap.classList.toggle('invalid', !valid);
        return valid;
    }

    function validateForm() {
        const fields = requiredFields.map(n => form.elements[n]).filter(Boolean);
        const ok = fields.every(validateField);
        submitBtn.disabled = !ok;
        return ok;
    }

    form?.querySelectorAll('input, textarea, select').forEach(el => {
        el.addEventListener('input', () => validateField(el) && validateForm());
        el.addEventListener('blur', () => validateField(el) && validateForm());
    });

    form?.addEventListener('submit', (e) => {
        if (!validateForm()) {
            e.preventDefault();
            // Scroll to first invalid
            const firstInvalid = form.querySelector('.field.invalid');
            firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
    });

    // ===== Leaflet Map (dark mode tiles to match site) =====
    const mapEl = document.getElementById('contactMap');
    if (mapEl && window.L) {
        const lat = parseFloat(mapEl.dataset.lat || '42.291262');
        const lng = parseFloat(mapEl.dataset.lng || '-71.538801');
        const label = mapEl.dataset.label || 'Luxury Details';

        const map = L.map(mapEl, {
            zoomControl: true,
            scrollWheelZoom: false
        }).setView([lat, lng], 14);

        // Dark Matter tiles (Carto)
        L.tileLayer('https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap, © Carto',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        // Interactive SVG pin (gold) — keep the click “works like default”
        const goldIcon = L.divIcon({
            className: 'ld-gold-pin',    // give it a class (don’t leave empty)
            html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="25" height="41" aria-hidden="true">
      <path fill="#c7a34b" stroke="#111" stroke-width="2"
        d="M12 0C6 0 1.5 4.5 1.5 10.5c0 7.875 10.5 24 10.5 24s10.5-16.125 10.5-24C22.5 4.5 18 0 12 0z"/>
      <circle cx="12" cy="10.5" r="4" fill="#111"/>
    </svg>
  `,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
        });

        L.marker([lat, lng], {
            icon: goldIcon,
            riseOnHover: true,
            keyboard: true,          // space/enter opens popup
            title: label
        })
            .addTo(map)
            .bindPopup(`<strong>${label}</strong><br>251 Turnpike Rd<br>Southborough, MA 01772`);

        // Keep map responsive on layout changes
        const ro = new ResizeObserver(() => { map.invalidateSize() });
        ro.observe(mapEl);
    }
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
