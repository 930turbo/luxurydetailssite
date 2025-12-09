document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("site-header");
  if (!el) return;

  // Inject CSS into the head once
  if (!document.getElementById("header-styles")) {
    const style = document.createElement("style");
    style.id = "header-styles";
    style.textContent = `
      .nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 1rem;
      }
      .nav .brand img {
        height: 40px;
        width: auto;
        display: block;
      }
      .nav-links {
        display: flex;
        gap: 2rem;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .nav-links a {
        text-decoration: none;
        color: inherit;
        font-weight: 500;
      }
      .nav-links a.active {
        border-bottom: 2px solid currentColor;
      }
      .menu-toggle {
        display: none;
        flex-direction: column;
        gap: 5px;
        background: none;
        border: none;
        cursor: pointer;
      }
      .menu-toggle span {
        display: block;
        width: 24px;
        height: 2px;
        background: currentColor;
      }
      /* Mobile styles */
      @media (max-width: 768px) {
        .menu-toggle {
          display: flex;
        }
        .nav-links {
          position: absolute;
          top: 100%;
          right: 0;
          flex-direction: column;
          background: #000;
          padding: 1rem;
          display: none;
        }
        .nav-links.open {
          display: flex;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Inject header HTML
  el.innerHTML = `
    <nav class="nav" aria-label="Main Navigation">
      <a class="brand" href="/">
        <img src="/assets/mark.png" alt="Luxury Details logo" />
      </a>

      <button class="menu-toggle" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>

      <ul class="nav-links">
        <li><a href="/pages/about.html">About</a></li>
        <li><a href="/pages/services.html">Services</a></li>
        <li><a href="/pages/gallery.html">Gallery</a></li>
        <li class="wrap-item">
          <a href="/pages/wrap-studio.html" class="wrap-btn">Luxury Wrap Studio</a>
        </li>
        <li><a href="/pages/contact.html" class="cta-link">Contact</a></li>
      </ul>
    </nav>
  `;

  // Active link highlight
  const pathFile = location.pathname.split("/").pop() || "index.html";
  el.querySelectorAll(".nav-links a").forEach(a => {
    const hrefFile = (new URL(a.href, location.origin)).pathname.split("/").pop() || "index.html";
    if (hrefFile === pathFile) a.classList.add("active");
  });

  // Mobile menu toggle
  const toggle = el.querySelector(".menu-toggle");
  const links = el.querySelector(".nav-links");
  const closeMenu = () => {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  };
  toggle.addEventListener("click", () => {
    links.classList.toggle("open");
    const open = links.classList.contains("open");
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
  });
  window.addEventListener("keydown", e => {
    if (e.key === "Escape") closeMenu();
  });
  links.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
});
