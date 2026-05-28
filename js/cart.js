/* ===================================================
   Tasty Chops – cart.js
   Cart logic: add, remove, update, checkout
   =================================================== */

const Cart = (() => {
  let items = [];

  async function load() {
    if (!Auth.isLoggedIn()) { items = []; return; }
    try {
      const res  = await fetch(`${API_BASE}/cart`, { headers: Auth.authHeaders() });
      const data = await res.json();
      items = data.items || [];
      updateBadge();
      renderCartPanel();
    } catch (_) {}
  }

  async function add(productId) {
    if (!Auth.isLoggedIn()) {
      showAuthModal('login');
      showToast('Please login to add items to cart', 'info');
      return;
    }
    try {
      const res  = await fetch(`${API_BASE}/cart/add`, {
        method: 'POST',
        headers: Auth.authHeaders(),
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      items = data.items || [];
      updateBadge();
      renderCartPanel();
      showToast('Added to cart! 🛒', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to add to cart', 'error');
    }
  }

  async function update(productId, quantity) {
    if (!Auth.isLoggedIn()) return;
    try {
      const res  = await fetch(`${API_BASE}/cart/update/${productId}`, {
        method: 'PATCH',
        headers: Auth.authHeaders(),
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      items = data.items || [];
      updateBadge();
      renderCartPanel();
    } catch (_) {}
  }

  async function remove(productId) {
    if (!Auth.isLoggedIn()) return;
    try {
      const res  = await fetch(`${API_BASE}/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: Auth.authHeaders(),
      });
      const data = await res.json();
      items = data.items || [];
      updateBadge();
      renderCartPanel();
    } catch (_) {}
  }

  function clear() {
    items = [];
    updateBadge();
    renderCartPanel();
  }

  function updateBadge() {
    const total = items.reduce((s, i) => s + i.quantity, 0);
    document.querySelectorAll('.cart-badge').forEach(b => {
      b.textContent = total;
      b.classList.toggle('hidden', total === 0);
    });
  }

  function getTotal() {
    return items.reduce((s, i) => s + i.price * i.quantity, 0);
  }

  function renderCartPanel() {
    const panel   = document.getElementById('cart-panel');
    const content = document.getElementById('cart-content');
    if (!panel || !content) return;

    if (items.length === 0) {
      content.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64 text-brand-charcoal/50">
          <div class="text-5xl mb-4">🛒</div>
          <p class="font-semibold">Your cart is empty</p>
          <p class="text-sm mt-1">Add items from the menu!</p>
        </div>`;
      document.getElementById('cart-checkout-btn').classList.add('hidden');
      return;
    }

    document.getElementById('cart-checkout-btn').classList.remove('hidden');
    const total = getTotal();

    content.innerHTML = items.map(item => `
      <div class="flex gap-3 py-4 border-b border-brand-cream last:border-0" data-pid="${item.product}">
        <img src="${item.img}" alt="${item.name}" class="w-16 h-16 object-cover rounded-xl flex-shrink-0"/>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-sm text-brand-dark truncate">${item.name}</p>
          <p class="text-brand-red font-bold text-sm">₦${item.price.toLocaleString()}</p>
          <div class="flex items-center gap-2 mt-2">
            <button onclick="Cart.update('${item.product}', ${item.quantity - 1})"
              class="w-7 h-7 rounded-full bg-brand-cream border border-brand-charcoal/20 flex items-center justify-center text-brand-dark font-bold hover:bg-brand-red hover:text-white transition-colors text-sm">−</button>
            <span class="font-semibold text-sm w-4 text-center">${item.quantity}</span>
            <button onclick="Cart.update('${item.product}', ${item.quantity + 1})"
              class="w-7 h-7 rounded-full bg-brand-cream border border-brand-charcoal/20 flex items-center justify-center text-brand-dark font-bold hover:bg-brand-red hover:text-white transition-colors text-sm">+</button>
          </div>
        </div>
        <button onclick="Cart.remove('${item.product}')"
          class="text-brand-charcoal/30 hover:text-brand-red transition-colors self-start mt-1 flex-shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    `).join('') + `
      <div class="pt-4 flex justify-between items-center font-bold text-brand-dark">
        <span>Total</span>
        <span class="text-brand-red text-lg">₦${total.toLocaleString()}</span>
      </div>`;
  }

  function checkout() {
    if (!Auth.isLoggedIn()) { showAuthModal('login'); return; }
    if (items.length === 0) { showToast('Your cart is empty', 'info'); return; }

    const user  = Auth.getUser();
    const lines = items.map(i => `• ${i.name} x${i.quantity} — ₦${(i.price * i.quantity).toLocaleString()}`).join('\n');
    const total = getTotal();
    const msg   = encodeURIComponent(
      `Hi Tasty Chops! 🍽️\n\nI'd like to place an order:\n\n${lines}\n\n*Total: ₦${total.toLocaleString()}*\n\nName: ${user.name}\nPlease confirm availability and payment details. Thank you!`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  }

  return { load, add, update, remove, clear, updateBadge, renderCartPanel, checkout, getItems: () => items };
})();
