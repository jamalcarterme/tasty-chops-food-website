/* ===========================
   Tasty Chops – main.js (Full Stack Version)
   =========================== */

// ── Toast utility ─────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const colors = { success: 'bg-green-500', error: 'bg-brand-red', info: 'bg-brand-charcoal' };
  const t = document.createElement('div');
  t.className = `fixed top-6 right-6 z-[9999] ${colors[type] || colors.success} text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold transition-all duration-300 translate-y-0 opacity-100 max-w-xs`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(-10px)'; }, 2500);
  setTimeout(() => t.remove(), 3000);
}

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
let allProducts = [];

async function loadMenu() {
  try {
    const res  = await fetch(`${API_BASE}/products`);
    const data = await res.json();
    allProducts = data;
    renderMenu('all');
  } catch (err) {
    // Fallback: show error state
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
        <div class="flex items-center justify-between mt-auto pt-2">
          <span class="text-brand-red font-bold text-sm">₦${item.price.toLocaleString()}</span>
          <button onclick="Cart.add('${item._id}')"
            class="menu-card-order flex items-center gap-1">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
            Add to Cart
          </button>
        </div>
      </div>
    </div>`;
}

function renderMenu(cat) {
  const grid  = document.getElementById('menu-grid');
  const items = cat === 'all' ? allProducts : allProducts.filter(i => i.cat === cat);
  if (items.length === 0) {
    grid.innerHTML = `<div class="col-span-4 text-center py-12 text-brand-charcoal/40">No items in this category yet.</div>`;
    return;
  }
  grid.innerHTML = '';
  items.forEach((item, idx) => {
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
      setTimeout(() => {
        if (confirm('Admin account detected. Go to Admin Dashboard?')) {
          window.location.href = 'admin/index.html';
        }
      }, 500);
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
  { name: 'Adaeze Okonkwo', initials: 'AO', date: '2 weeks ago', stars: 5, text: 'Tasty Chops is simply the best in Festac! Their small chops platter was the star of my daughter\'s birthday party. Guests kept asking who catered. Will definitely book again!' },
  { name: 'Emeka Johnson',  initials: 'EJ', date: '1 month ago',  stars: 5, text: 'Ordered via WhatsApp and the experience was seamless. Food was delivered hot and on time. The suya and grilled chicken are absolutely amazing. A gem in Festac Town!' },
  { name: 'Blessing Taiwo', initials: 'BT', date: '3 weeks ago',  stars: 5, text: 'Both the service and meals are delicious. I\'ve tried many food vendors in Festac but Tasty Chops stands out. The jollof rice is smoky and perfect every single time.' },
  { name: 'Chidera Eze',    initials: 'CE', date: '1 month ago',  stars: 5, text: 'We used Tasty Chops for our office end-of-year party and they exceeded every expectation. Professional, prompt and the food? Absolutely outstanding. 10/10!' },
  { name: 'Funmi Adeyemo',  initials: 'FA', date: '2 months ago', stars: 5, text: 'The puff puff and spring rolls are INCREDIBLE. Hot, crispy and so generously portioned. My family now orders every weekend. Best small chops in Festac hands down!' },
  { name: 'Samuel Ogah',    initials: 'SO', date: '3 months ago', stars: 5, text: 'Catered our wedding reception and I couldn\'t be happier. Every dish was flawless, the team was professional and our guests are still talking about the food. Thank you!' },
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
window.addEventListener('load', () => {
  document.querySelectorAll('.hero-bg ~ * .reveal, section#home .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 100 + 300);
  });
  Auth.updateNavUI();
  Cart.load();
  loadMenu();
});

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
