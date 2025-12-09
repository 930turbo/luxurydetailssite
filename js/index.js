// Header background on scroll
const header = document.querySelector('.site-header');
const onScroll = () => {
  if (window.scrollY > 10) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
};
window.addEventListener('scroll', onScroll);
onScroll();

// Simple reveal-on-scroll
const reveals = Array.from(document.querySelectorAll('.reveal'));
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
  reveals.forEach(el => io.observe(el));
} else {
  // Fallback
  reveals.forEach(el => el.classList.add('in'));
}

// Scroll direction: reveal/hide header
let lastY = window.scrollY;
let ticking = false;
function handleScrollDir() {
  const currentY = window.scrollY;
  const header = document.querySelector('.site-header');
  if (!header) return;
  // show on top, scroll up, or near top; hide on fast scroll down
  if (currentY < 10 || currentY < lastY) {
    header.classList.remove('hide');
  } else if (currentY > lastY + 6) {
    header.classList.add('hide');
  }
  lastY = currentY;
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(handleScrollDir);
    ticking = true;
  }
});
handleScrollDir();

// Hero: subtle mouse parallax on copy
(() => {
  const overlay = document.querySelector('.hero-overlay');
  const media = document.querySelector('.hero-media');
  if (!overlay || !media) return;

  let raf = null;
  let targetX = 0, targetY = 0;
  let currX = 0, currY = 0;

  const onMove = (e) => {
    const { innerWidth: w, innerHeight: h } = window;
    const x = (e.clientX / w - 0.5) * 2; // -1..1
    const y = (e.clientY / h - 0.5) * 2;
    targetX = x; targetY = y;
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const tick = () => {
    // ease
    currX += (targetX - currX) * 0.06;
    currY += (targetY - currY) * 0.06;

    // move copy slightly opposite, media slightly with
    overlay.style.transform = `translate3d(${currX * -6}px, ${currY * -4}px, 0)`;
    media.style.transform = `scale(1.1) translate3d(${currX * 4}px, ${currY * 2}px, 0)`;

    if (Math.abs(targetX - currX) > 0.001 || Math.abs(targetY - currY) > 0.001) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = null;
    }
  };

  window.addEventListener('mousemove', onMove, { passive: true });
})();

/* ========= OFFERS MARQUEE JS =========
   - Duplicates items until the track is >2x viewport for perfect looping
   - Sets animation duration based on total width for buttery smooth motion
*/
(function(){
  const track = document.getElementById('offersTrack');
  if(!track) return;

  const viewport = track.parentElement;
  const baseItems = Array.from(track.children).map(n => n.cloneNode(true));

  // Helper: total width of current track contents
  const calcTrackWidth = () => Array.from(track.children)
    .reduce((w, el) => w + el.getBoundingClientRect().width + 12 /* gap */, 0);

  // Ensure enough content to loop seamlessly
  const ensureFill = () => {
    // Start from single source of truth
    track.innerHTML = '';
    baseItems.forEach(n => track.appendChild(n.cloneNode(true)));

    // Duplicate until > 2x viewport width
    const minWidth = viewport.getBoundingClientRect().width * 2.2;
    while (calcTrackWidth() < minWidth) {
      baseItems.forEach(n => track.appendChild(n.cloneNode(true)));
    }
  };

  // Apply / update animation with duration based on content width
  const applyAnimation = () => {
    const total = calcTrackWidth();
    const pxPerSecond = 80; // adjust to taste (slower: smaller number)
    const duration = Math.max(18, total / pxPerSecond); // seconds
    const key = `
      @keyframes offersScroll {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-${total/2}px); }
      }`;
    // inject or replace style tag
    let styleTag = document.getElementById('offersMarqueeStyle');
    if(!styleTag){
      styleTag = document.createElement('style');
      styleTag.id = 'offersMarqueeStyle';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = key;
    track.style.animation = `offersScroll ${duration}s linear infinite`;
  };

  const setup = () => { ensureFill(); applyAnimation(); };

  // Initial
  setup();

  // Recompute on resize for responsiveness
  let rAF;
  const onResize = () => {
    cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(()=> setup());
  };
  window.addEventListener('resize', onResize, { passive:true });

  // Optional: touch to “nudge” (keeps things feeling alive on mobile)
  let dragging = false, startX = 0, offset = 0;
  track.addEventListener('pointerdown', e => {
    dragging = true; startX = e.clientX; offset = 0;
    track.style.animationPlayState = 'paused';
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener('pointermove', e => {
    if(!dragging) return;
    const dx = e.clientX - startX;
    offset = dx;
    track.style.transform = `translateX(${dx}px)`;
  });
  const endDrag = () => {
    if(!dragging) return;
    dragging = false;
    track.style.transform = '';
    track.style.animationPlayState = '';
  };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
})();

// ===== HERO VIDEO UX =====
// - Only plays when in view (saves battery).
// - Falls back to poster if autoplay is blocked.
(() => {
  const video = document.getElementById('heroVideo');
  if (!video) return;

  const showPoster = () => {
    video.style.display = 'none';
    const poster = video.parentElement.querySelector('.hero__poster');
    if (poster) poster.style.display = 'block';
  };

  // Try to play (required on some browsers even if muted)
  const attemptPlay = () => {
    video.play().catch(() => showPoster());
  };

  // Pause/play based on visibility
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          attemptPlay();
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.25 });
    io.observe(video);
  } else {
    attemptPlay();
  }

  // If user has reduced motion, don't autoplay
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) showPoster();

  // iOS sometimes needs a tap to start even when muted; keep graceful
  video.addEventListener('error', showPoster, { once: true });
})();

// put before closing </body>
document.documentElement.classList.add('js');

// mark if we started at the top
const atTop = window.scrollY <= 2;
document.body.classList.toggle('at-top', atTop);

// keep it updated on scroll
addEventListener('scroll', () => {
  const nowTop = scrollY <= 2;
  if (nowTop !== document.body.classList.contains('at-top')) {
    document.body.classList.toggle('at-top', nowTop);
  }
});

// re-enable header transitions after first paint
requestAnimationFrame(() => document.documentElement.classList.add('ready'));
