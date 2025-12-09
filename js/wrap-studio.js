// Wrap Studio interactions
(() => {
  // Smooth scroll for header hero tabs
  const jumpLinks = document.querySelectorAll('.ws-tabs a');
  jumpLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || !id.startsWith('#')) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.pageYOffset - 80; // adjust for header
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  // Reveal-on-scroll
  const revealTargets = document.querySelectorAll('.reveal, .ws-masonry img, .brand-row img, .plan, .care-list li');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  revealTargets.forEach(el => io.observe(el));

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

  // Header hide-on-scroll (if your header.js doesn't already handle this)
  const header = document.querySelector('#site-header');
  let lastY = window.scrollY;
  const onScroll = () => {
    if (!header) return;
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 8);
    if (y > lastY && y > 120) header.classList.add('hide');
    else header.classList.remove('hide');
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Swatch click = copy name to clipboard + small toast
  const swatches = document.querySelectorAll('.swatch');
  const makeToast = (text) => {
    const t = document.createElement('div');
    t.textContent = text;
    t.style.position = 'fixed';
    t.style.left = '50%';
    t.style.bottom = '28px';
    t.style.transform = 'translateX(-50%)';
    t.style.padding = '10px 14px';
    t.style.background = 'rgba(0,0,0,.8)';
    t.style.color = '#fff';
    t.style.border = '1px solid #2b2b2b';
    t.style.borderRadius = '12px';
    t.style.font = "600 12px 'Rajdhani', sans-serif";
    t.style.zIndex = '9999';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1300);
  };
  swatches.forEach(s => {
    s.addEventListener('click', async () => {
      const name = s.dataset.name || s.querySelector('span')?.textContent?.trim() || 'Selected finish';
      try {
        await navigator.clipboard.writeText(name);
        makeToast(`Copied: ${name}`);
      } catch {
        makeToast(name);
      }
    });
  });

// ===== FAQ: buttery glide open/close + single-open =====
(() => {
  const faq = document.querySelector('.faq');
  if (!faq) return;

  const items = [...faq.querySelectorAll('details')];
  const ease = 'cubic-bezier(.22,.61,.36,1)'; // smoother than ease

  const collapsedH = (d) => (d.querySelector('summary')?.offsetHeight || 0) + 2;

  const setStyles = (d) => {
    d.style.overflow = 'hidden';
    d.style.transition = `max-height .45s ${ease}, opacity .35s ${ease}`;
    d.style.willChange = 'max-height';
  };

  const expand = (d) => {
    d.open = true;                      // ensure content is measurable
    setStyles(d);
    d.style.opacity = '1';
    d.style.maxHeight = collapsedH(d) + 'px';
    // next frame, grow to full height
    requestAnimationFrame(() => {
      d.style.maxHeight = d.scrollHeight + 'px';
    });
  };

  const collapse = (d) => {
    setStyles(d);
    // set current height to start the animation
    d.style.maxHeight = d.scrollHeight + 'px';
    d.style.opacity = '.96';
    // next frame, shrink to summary height
    requestAnimationFrame(() => {
      d.style.maxHeight = collapsedH(d) + 'px';
    });
    // after transition, actually close so focus/keyboard works
    const onEnd = (ev) => {
      if (ev.propertyName === 'max-height') {
        d.open = false;
        d.removeEventListener('transitionend', onEnd);
      }
    };
    d.addEventListener('transitionend', onEnd);
  };

  // Init
  items.forEach(d => {
    setStyles(d);
    if (d.open) {
      d.style.maxHeight = d.scrollHeight + 'px';
      d.style.opacity = '1';
    } else {
      d.style.maxHeight = collapsedH(d) + 'px';
      d.style.opacity = '.96';
    }

    // Intercept summary click to control timing
    const summary = d.querySelector('summary');
    if (!summary) return;

    summary.addEventListener('click', (e) => {
      e.preventDefault(); // stop native toggle (it’s instant/choppy)
      const isOpening = !d.open;

      if (isOpening) {
        // close others first
        items.forEach(o => { if (o !== d && o.open) collapse(o); });
        expand(d);
      } else {
        collapse(d);
      }
    });
  });

  // Keep heights correct on resize/content changes
  const refresh = () => items.forEach(d => {
    d.style.maxHeight = (d.open ? d.scrollHeight : collapsedH(d)) + 'px';
  });
  window.addEventListener('resize', refresh, { passive: true });
  new MutationObserver(refresh).observe(faq, { childList: true, subtree: true, characterData: true });
})();

})();
