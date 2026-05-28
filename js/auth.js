/* ===================================================
   Tasty Chops – auth.js
   Handles login state, token storage, UI updates
   =================================================== */

const Auth = (() => {
  const TOKEN_KEY = 'tc_token';
  const USER_KEY  = 'tc_user';

  function getToken()  { return localStorage.getItem(TOKEN_KEY); }
  function getUser()   { const u = localStorage.getItem(USER_KEY); return u ? JSON.parse(u) : null; }
  function isLoggedIn(){ return !!getToken(); }
  function isAdmin()   { const u = getUser(); return u && u.role === 'admin'; }

  function save(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    Cart.clear();
    updateNavUI();
    showToast('Logged out successfully', 'info');
    // Redirect away from admin
    if (window.location.pathname.includes('admin')) {
      window.location.href = '../index.html';
    }
  }

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    };
  }

  async function signup(name, email, password, phone) {
    const res  = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    save(data.token, data.user);
    updateNavUI();
    return data.user;
  }

  async function login(email, password) {
    const res  = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    save(data.token, data.user);
    updateNavUI();
    return data.user;
  }

  function updateNavUI() {
    const user          = getUser();
    const authBtns      = document.getElementById('nav-auth-btns');
    const userMenu      = document.getElementById('nav-user-menu');
    const userNameEl    = document.getElementById('nav-user-name');
    const mobileAuth    = document.getElementById('mobile-auth-btns');
    const mobileUser    = document.getElementById('mobile-user-menu');
    const mobileNameEl  = document.getElementById('mobile-user-name');

    if (user) {
      authBtns    && (authBtns.classList.add('hidden'));
      userMenu    && (userMenu.classList.remove('hidden'));
      userNameEl  && (userNameEl.textContent = user.name.split(' ')[0]);
      mobileAuth  && (mobileAuth.classList.add('hidden'));
      mobileUser  && (mobileUser.classList.remove('hidden'));
      mobileNameEl && (mobileNameEl.textContent = user.name.split(' ')[0]);
    } else {
      authBtns    && (authBtns.classList.remove('hidden'));
      userMenu    && (userMenu.classList.add('hidden'));
      mobileAuth  && (mobileAuth.classList.remove('hidden'));
      mobileUser  && (mobileUser.classList.add('hidden'));
    }
    Cart.updateBadge();
  }

  return { getToken, getUser, isLoggedIn, isAdmin, logout, signup, login, updateNavUI, authHeaders };
})();
