/* ===================================================
   Tasty Chops – toast.js
   Global toast utility – must load FIRST
   =================================================== */
function showToast(msg, type = 'success') {
  const colors = {
    success: '#22c55e',
    error:   '#C8281A',
    info:    '#2D1A0E'
  };
  const icons = { success: '✓', error: '✕', info: 'ℹ' };

  const t = document.createElement('div');
  t.style.cssText = `
    position: fixed;
    top: 1.5rem;
    right: 1.5rem;
    z-index: 99999;
    background: ${colors[type] || colors.success};
    color: white;
    padding: 0.75rem 1.25rem;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
    font-size: 0.875rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    max-width: 320px;
    transform: translateY(-8px);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
    font-family: 'Plus Jakarta Sans', sans-serif;
  `;
  t.innerHTML = `<span style="font-size:1rem">${icons[type] || icons.success}</span><span>${msg}</span>`;
  document.body.appendChild(t);

  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      t.style.opacity = '1';
      t.style.transform = 'translateY(0)';
    });
  });

  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(-8px)';
    setTimeout(() => t.remove(), 350);
  }, 3000);
}
