/* ===================================================
   Tasty Chops – loader.js
   Bouncing logo loader (OPay-style) for async actions
   =================================================== */

const Loader = (() => {
  let _overlay = null;
  let _textEl   = null;

  function _init() {
    if (_overlay) return;
    _overlay = document.createElement('div');
    _overlay.id = 'tc-loader-overlay';
    _overlay.innerHTML = `
      <svg class="tc-loader-logo" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="32" fill="#C8281A"/>
        <text x="32" y="44" font-family="Georgia, serif" font-size="28" font-weight="900"
              fill="white" text-anchor="middle" letter-spacing="-1">TC</text>
      </svg>
      <div class="tc-loader-dots">
        <span></span><span></span><span></span>
      </div>
      <div class="tc-loader-text" id="tc-loader-text">Please wait…</div>
    `;
    document.body.appendChild(_overlay);
    _textEl = _overlay.querySelector('#tc-loader-text');
  }

  function show(msg = 'Please wait…') {
    _init();
    _textEl.textContent = msg;
    // Force reflow so transition kicks in
    _overlay.classList.add('active');
  }

  function hide() {
    if (!_overlay) return;
    _overlay.classList.remove('active');
  }

  return { show, hide };
})();
