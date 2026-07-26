(function () {
  function moneyFromCents(cents) {
    return '$' + (cents / 100).toFixed(2);
  }

  function renderCard(product) {
    var variant = product.variants && product.variants[0];
    var image = product.images && product.images[0];
    var card = document.createElement('div');
    card.className = 'sm1c-fav-card';
    card.innerHTML =
      '<div class="sm1c-fav-imgwrap">' +
        '<a href="/products/' + product.handle + '">' +
          '<div class="sm1c-fav-img">' +
            (image ? '<img src="' + image + '" alt="' + (product.title || '').replace(/"/g, '&quot;') + '" loading="lazy">' : '') +
          '</div>' +
        '</a>' +
        '<button type="button" class="sm1c-fav-remove" data-sm1c-favorite-toggle="' + product.handle + '" aria-label="Remove from favorites">✕</button>' +
      '</div>' +
      '<a href="/products/' + product.handle + '">' +
        '<div class="sm1c-fav-name">' + product.title + '</div>' +
        '<div class="sm1c-fav-price">' + (variant ? moneyFromCents(variant.price) : '') + '</div>' +
      '</a>';
    return card;
  }

  function bindRemove(btn, grid) {
    btn.addEventListener('click', function (evt) {
      evt.preventDefault();
      evt.stopPropagation();
      window.sm1cWishlist.toggle(btn.getAttribute('data-sm1c-favorite-toggle'));
      btn.classList.add('sm1c-pop');
      var card = btn.closest('.sm1c-fav-card');
      setTimeout(function () {
        if (card) card.remove();
        if (!grid.querySelector('.sm1c-fav-card')) {
          document.querySelectorAll('[data-sm1c-favorites-empty]').forEach(function (el) { el.hidden = false; });
        }
      }, 200);
    });
  }

  function load() {
    var root = document.querySelector('[data-sm1c-favorites-page]');
    if (!root || !window.sm1cWishlist) return;
    var grid = root.querySelector('[data-sm1c-favorites-grid]');
    var emptyState = root.querySelector('[data-sm1c-favorites-empty]');
    var handles = window.sm1cWishlist.getIds();

    if (!handles.length) {
      emptyState.hidden = false;
      return;
    }

    handles.forEach(function (handle) {
      fetch('/products/' + handle + '.js')
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (product) {
          if (!product) return;
          var card = renderCard(product);
          grid.appendChild(card);
          bindRemove(card.querySelector('[data-sm1c-favorite-toggle]'), grid);
        })
        .catch(function () {});
    });
  }

  document.addEventListener('DOMContentLoaded', load);
})();
