/* ===========================
   Tasty Chops – main.js (Full Stack Version)
   =========================== */

// showToast is defined in toast.js (loads first)

// ── Auth modal ────────────────────────────────────────────────────────────────
function showAuthModal(tab = 'login') {
  document.getElementById('auth-modal').classList.remove('hidden');
  switchAuthTab(tab);
  document.body.style.overflow = 'hidden';
}

function hideAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

function switchAuthTab(tab) {
  document.getElementById('login-form-wrap').classList.toggle('hidden', tab !== 'login');
  document.getElementById('signup-form-wrap').classList.toggle('hidden', tab !== 'signup');
  document.getElementById('tab-login').classList.toggle('active-tab', tab === 'login');
  document.getElementById('tab-signup').classList.toggle('active-tab', tab !== 'login');
}

// ── Cart panel ────────────────────────────────────────────────────────────────
function openCart() {
  if (!Auth.isLoggedIn()) { showAuthModal('login'); showToast('Please login to view cart', 'info'); return; }
  document.getElementById('cart-panel').classList.remove('translate-x-full');
  document.getElementById('cart-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  Cart.renderCartPanel();
}

function closeCart() {
  document.getElementById('cart-panel').classList.add('translate-x-full');
  document.getElementById('cart-overlay').classList.add('hidden');
  document.body.style.overflow = '';
}

// ── Navbar scroll behaviour ──────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Mobile menu toggle ───────────────────────────────────────────────────────
const menuBtn    = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
function closeMobileMenu() { mobileMenu.classList.add('hidden'); }

// ── Smooth scroll for anchor links ──────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ── Scroll reveal ────────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseFloat(entry.target.style.animationDelay || 0) * 1000;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Load and render menu from backend ────────────────────────────────────────
let allProducts    = [];
const MENU_PAGE_SIZE = 6;
let currentMenuCat = 'all';
let menuVisible    = MENU_PAGE_SIZE;

async function loadMenu() {
  try {
    const res  = await fetch(`${API_BASE}/products`);
    const data = await res.json();
    allProducts = data;
    renderMenu('all');
  } catch (err) {
    document.getElementById('menu-grid').innerHTML = `
      <div class="col-span-4 text-center py-16 text-brand-charcoal/50">
        <div class="text-4xl mb-4">😕</div>
        <p>Menu unavailable. Please try again later.</p>
      </div>`;
  }
}

function buildMenuCard(item) {
  return `
    <div class="menu-card" data-cat="${item.cat}">
      <div class="menu-card-img">
        <img src="${item.img}" alt="${item.name}" loading="lazy"/>
        ${item.badge ? `<span class="menu-badge">${item.badge}</span>` : ''}
      </div>
      <div class="menu-card-body">
        <div class="menu-card-title">${item.name}</div>
        <div class="menu-card-desc">${item.desc}</div>
        <p class="text-brand-red font-bold text-base mb-3">₦${item.price.toLocaleString()}</p>
        <button onclick="Cart.add('${item._id}')"
          class="menu-card-order">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
          Add to Cart
        </button>
      </div>
    </div>`;
}

function renderMenu(cat) {
  currentMenuCat = cat;
  menuVisible    = MENU_PAGE_SIZE;
  _renderCards();
}

function showMoreProducts() {
  menuVisible += MENU_PAGE_SIZE;
  _renderCards(true);
}

function _renderCards(appending = false) {
  const grid      = document.getElementById('menu-grid');
  const wrap      = document.getElementById('view-more-wrap');
  const label     = document.getElementById('view-more-label');
  const all       = currentMenuCat === 'all'
    ? allProducts
    : allProducts.filter(i => i.cat === currentMenuCat);

  if (all.length === 0) {
    grid.innerHTML = `<div class="col-span-4 text-center py-12 text-brand-charcoal/40">No items in this category yet.</div>`;
    if (wrap) wrap.classList.add('hidden');
    return;
  }

  const slice     = all.slice(0, menuVisible);
  const remaining = all.length - slice.length;

  if (!appending) grid.innerHTML = '';

  const startIdx = appending ? menuVisible - MENU_PAGE_SIZE : 0;
  slice.slice(startIdx).forEach((item, idx) => {
    const el = document.createElement('div');
    el.innerHTML = buildMenuCard(item);
    const card = el.firstElementChild;
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    grid.appendChild(card);
    requestAnimationFrame(() => {
      setTimeout(() => {
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, idx * 60);
    });
  });

  if (wrap) {
    if (remaining > 0) {
      wrap.classList.remove('hidden');
      if (label) label.textContent = `View More (${remaining} left)`;
    } else {
      wrap.classList.add('hidden');
    }
  }
}

document.querySelectorAll('.menu-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderMenu(tab.dataset.cat);
  });
});

// ── Login form submit ─────────────────────────────────────────────────────────
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn   = document.getElementById('login-btn');
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;
  btn.disabled = true;
  btn.textContent = 'Logging in…';
  try {
    const user = await Auth.login(email, pass);
    await Cart.load();
    hideAuthModal();
    showToast(`Welcome back, ${user.name.split(' ')[0]}! 👋`, 'success');
    if (user.role === 'admin') {
      window.location.href = 'admin/index.html';
      return;
    }
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Log In';
  }
});

// ── Signup form submit ────────────────────────────────────────────────────────
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn   = document.getElementById('signup-btn');
  const name  = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const pass  = document.getElementById('signup-password').value;
  btn.disabled = true;
  btn.textContent = 'Creating account…';
  try {
    const user = await Auth.signup(name, email, pass, phone);
    await Cart.load();
    hideAuthModal();
    showToast(`Account created! Welcome, ${user.name.split(' ')[0]}! 🎉`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
});

// ── Reviews data ─────────────────────────────────────────────────────────────
const reviews = [
  { name: 'FAVOUR AKOR88',              initials: 'FA', date: '2 days ago',    stars: 5, text: 'Tasty chops foods & events for a reason 💯 It was everything I asked for and more 💗 I really enjoyed their service 🙏 Highly recommended 👍' },
  { name: 'Patrick Onwordi',            initials: 'PO', date: '1 month ago',   stars: 5, text: 'Best Small Chops in Festac. Promises and delivers 💯💯' },
  { name: 'Michael Okafor',             initials: 'MO', date: '3 months ago',  stars: 5, text: 'I had a great experience with Tasty Chops Foods & Events, Festac Lagos. I ordered small chops for my birthday even though I wasn\'t in town, and they delivered promptly despite the short notice.' },
  { name: 'Orly Nmere',                 initials: 'ON', date: '7 months ago',  stars: 5, text: 'Delivered in time, and tastes so fresh and delicious, customer service is 9/10 ❤️' },
  { name: 'Olukayode Ladenegan',        initials: 'OL', date: '8 months ago',  stars: 5, text: 'Good job, cheffo! Excellent.' },
  { name: 'Solomon Ayoola Okeowo',      initials: 'SA', date: '8 months ago',  stars: 5, text: 'Good taste and affordable all at the same place, Tasty Chops Food is the place.' },
  { name: 'Rebecca Okeowo',             initials: 'RO', date: '8 months ago',  stars: 5, text: 'Food taste so good and fresh.' },
  { name: 'Daniel Chinwe',              initials: 'DC', date: '8 months ago',  stars: 5, text: 'Excellent and great customer service.' },
  { name: 'Joy Onichakwe',              initials: 'JO', date: '8 months ago',  stars: 5, text: 'Nice place, great taste.' },
  { name: 'Seraph Floxy',               initials: 'SF', date: '8 months ago',  stars: 5, text: 'The food and services are wow.' },
  { name: 'Anaje Chiamaka',             initials: 'AC', date: '3 years ago',   stars: 5, text: 'Cool.' },
  { name: 'Darlington Nebo',            initials: 'DN', date: '4 years ago',   stars: 5, text: 'Boss.. he is the best.' },
  { name: 'Jeremiah Zenmaster George',  initials: 'JZ', date: '6 years ago',   stars: 5, text: 'Great shawarma and my friend swears by their pasta and noodles.' },
];

function starsHTML(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }

const slider = document.getElementById('reviews-slider');
const dotsContainer = document.getElementById('review-dots');
let currentSlide = 0;
let visibleCount = 1;

function getVisibleCount() {
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 640)  return 2;
  return 1;
}

function buildReviews() {
  slider.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="flex items-start gap-3 mb-3">
        <div class="review-avatar">${r.initials}</div>
        <div>
          <div class="font-semibold text-sm text-brand-dark">${r.name}</div>
          <div class="flex items-center gap-1">
            <span class="text-brand-gold text-xs">${starsHTML(r.stars)}</span>
            <span class="text-brand-charcoal/40 text-xs">· ${r.date}</span>
          </div>
        </div>
        <svg class="w-6 h-6 text-brand-red/20 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
      </div>
      <p class="text-sm text-brand-charcoal/70 leading-relaxed">${r.text}</p>
    </div>
  `).join('');

  visibleCount = getVisibleCount();
  const totalSlides = reviews.length - visibleCount + 1;
  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.className = 'review-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }
}

function goToSlide(n) {
  visibleCount = getVisibleCount();
  const cardWidth = 300 + 24;
  const maxSlide = reviews.length - visibleCount;
  currentSlide = Math.max(0, Math.min(n, maxSlide));
  slider.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
  slider.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
  document.querySelectorAll('.review-dot').forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}

buildReviews();
window.addEventListener('resize', () => { buildReviews(); goToSlide(0); currentSlide = 0; });
setInterval(() => { visibleCount = getVisibleCount(); const max = reviews.length - visibleCount; goToSlide(currentSlide >= max ? 0 : currentSlide + 1); }, 5000);

let touchStartX = 0;
slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
slider.addEventListener('touchend', e => { const diff = touchStartX - e.changedTouches[0].clientX; if (Math.abs(diff) > 50) goToSlide(currentSlide + (diff > 0 ? 1 : -1)); });

// ── Hero reveal ───────────────────────────────────────────────────────────────
function makeAllVisible() {
  document.querySelectorAll('.reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 60 + 100);
  });
}

// Run on DOMContentLoaded so content is never stuck invisible
document.addEventListener('DOMContentLoaded', () => {
  makeAllVisible();
  Auth.updateNavUI();
  Cart.load();
  loadMenu();
});

// Also run on load as a safety net
window.addEventListener('load', makeAllVisible);

// ── Active nav link on scroll ─────────────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('text-brand-gold', link.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => sectionObserver.observe(s));
