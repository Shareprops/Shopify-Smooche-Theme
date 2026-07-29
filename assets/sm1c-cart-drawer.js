(function () {
  var drawer = document.querySelector('[data-sm1c-cart-drawer]');
  var cartIconEl = document.querySelector('[data-sm1c-cart-icon]');
  var cartCountEl = document.querySelector('[data-sm1c-cart-count]');

  function formatMoney(cents) {
    var format = window.sm1cMoneyFormat || '${{amount}}';
    var value = (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return format.replace(/\{\{\s*amount\s*\}\}/, value);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function isRealVariantTitle(title) {
    if (!title) return false;
    var normalized = title.trim().toLowerCase();
    return normalized !== '' && normalized !== 'default title' && normalized !== 'n/a';
  }

  function openDrawer() {
    if (!drawer) return;
    drawer.hidden = false;
    requestAnimationFrame(function () {
      drawer.classList.add('is-open');
    });
    document.body.classList.add('sm1c-cart-drawer-open');
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    document.body.classList.remove('sm1c-cart-drawer-open');
    setTimeout(function () {
      drawer.hidden = true;
    }, 300);
  }

  window.sm1cOpenCartDrawer = openDrawer;
  window.sm1cCloseCartDrawer = closeDrawer;

  if (drawer) {
    drawer.querySelectorAll('[data-sm1c-cart-drawer-close]').forEach(function (el) {
      el.addEventListener('click', closeDrawer);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
    });
  }

  function renderDrawer(cart) {
    if (!drawer) return;
    var itemsEl = drawer.querySelector('[data-sm1c-cart-drawer-items]');
    var subtotalEl = drawer.querySelector('[data-sm1c-cart-drawer-subtotal]');
    if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);

    if (itemsEl) {
      if (!cart.items.length) {
        itemsEl.innerHTML = '<p class="sm1c-cart-drawer-empty">Your cart is empty.</p>';
      } else {
        itemsEl.innerHTML = cart.items.map(function (item) {
          return '' +
            '<div class="sm1c-cart-drawer-item">' +
              '<div class="sm1c-cart-drawer-item-img">' + (item.image ? '<img src="' + item.image + '" alt="' + escapeHtml(item.product_title) + '">' : '') + '</div>' +
              '<div>' +
                '<div class="sm1c-cart-drawer-item-title">' + escapeHtml(item.product_title) + '</div>' +
                (isRealVariantTitle(item.variant_title) ? '<div class="sm1c-cart-drawer-item-variant">' + escapeHtml(item.variant_title) + '</div>' : '') +
                '<div class="sm1c-cart-drawer-item-meta">Qty ' + item.quantity + '</div>' +
              '</div>' +
              '<div class="sm1c-cart-drawer-item-price">' + formatMoney(item.final_line_price) + '</div>' +
            '</div>';
        }).join('');
      }
    }

    if (cartCountEl) cartCountEl.textContent = cart.item_count;
  }

  function refreshCart() {
    return fetch('/cart.js')
      .then(function (res) { return res.json(); })
      .then(renderDrawer);
  }

  function flyToCart(sourceImgEl) {
    if (!sourceImgEl || !cartIconEl) return;
    var srcRect = sourceImgEl.getBoundingClientRect();
    var destRect = cartIconEl.getBoundingClientRect();
    if (!srcRect.width || !destRect.width) return;

    var clone = sourceImgEl.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.left = srcRect.left + 'px';
    clone.style.top = srcRect.top + 'px';
    clone.style.width = srcRect.width + 'px';
    clone.style.height = srcRect.height + 'px';
    clone.style.margin = '0';
    clone.style.zIndex = '9999';
    clone.style.borderRadius = '12px';
    clone.style.objectFit = 'cover';
    clone.style.transition = 'transform .7s cubic-bezier(.42,0,.58,1), opacity .7s ease';
    clone.style.pointerEvents = 'none';
    document.body.appendChild(clone);

    var deltaX = (destRect.left + destRect.width / 2) - (srcRect.left + srcRect.width / 2);
    var deltaY = (destRect.top + destRect.height / 2) - (srcRect.top + srcRect.height / 2);

    requestAnimationFrame(function () {
      clone.style.transform = 'translate(' + deltaX + 'px,' + deltaY + 'px) scale(.15)';
      clone.style.opacity = '0.25';
    });

    setTimeout(function () {
      clone.remove();
    }, 750);
  }

  function addToCart(variantId, quantity, sourceImgEl, button) {
    if (!variantId) return;
    var originalText = button ? button.textContent : null;
    if (button) {
      button.disabled = true;
      button.textContent = 'Adding...';
    }

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: quantity || 1 })
    })
      .then(function (res) {
        if (!res.ok) return res.json().then(function (err) { throw err; });
        return res.json();
      })
      .then(function () {
        if (sourceImgEl) flyToCart(sourceImgEl);
        return refreshCart();
      })
      .then(function () {
        setTimeout(openDrawer, sourceImgEl ? 500 : 0);
      })
      .catch(function (err) {
        window.alert((err && err.description) || 'Could not add this item to your cart.');
      })
      .finally(function () {
        if (button) {
          button.disabled = false;
          button.textContent = originalText;
        }
      });
  }

  window.sm1cAddToCart = addToCart;

  document.addEventListener('click', function (e) {
    var cartLink = e.target.closest('[data-sm1c-cart-icon]');
    if (cartLink) {
      e.preventDefault();
      openDrawer();
      return;
    }

    var quickAddBtn = e.target.closest('[data-sm1c-quick-add]');
    if (quickAddBtn) {
      e.preventDefault();
      var variantId = quickAddBtn.getAttribute('data-variant-id');
      var card = quickAddBtn.closest('[data-sm1c-product-card]');
      var img = card ? card.querySelector('img') : null;
      addToCart(variantId, 1, img, quickAddBtn);
    }
  });

  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-sm1c-ajax-cart-form]');
    if (!form) return;
    e.preventDefault();
    var idInput = form.querySelector('[name="id"]');
    var qtyInput = form.querySelector('[name="quantity"]');
    var variantId = idInput ? idInput.value : null;
    var quantity = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;
    var pdpWrap = form.closest('.sm1c-pdp-wrap');
    var img = pdpWrap ? pdpWrap.querySelector('[data-sm1c-main-img] img') : null;
    var submitBtn = form.querySelector('button[type="submit"]');
    addToCart(variantId, quantity, img, submitBtn);
  });

  refreshCart();
})();
