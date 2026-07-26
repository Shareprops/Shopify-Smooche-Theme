(function () {
  var STORAGE_KEY = 'sm1c_wishlist';

  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveWishlist(ids) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch (e) {}
  }

  function isSaved(id) {
    return getWishlist().indexOf(String(id)) !== -1;
  }

  function toggle(id) {
    id = String(id);
    var ids = getWishlist();
    var idx = ids.indexOf(id);
    var added;
    if (idx === -1) {
      ids.push(id);
      added = true;
    } else {
      ids.splice(idx, 1);
      added = false;
    }
    saveWishlist(ids);
    updateCountBadges();
    return added;
  }

  function updateCountBadges() {
    var count = getWishlist().length;
    document.querySelectorAll('[data-sm1c-wishlist-count]').forEach(function (el) {
      el.textContent = count;
      el.hidden = count === 0;
    });
  }

  function syncButtonState(btn) {
    var id = btn.getAttribute('data-sm1c-favorite-toggle');
    var saved = isSaved(id);
    btn.classList.toggle('is-favorited', saved);
    btn.setAttribute('aria-pressed', saved ? 'true' : 'false');
  }

  function bindButton(btn) {
    if (btn.dataset.sm1cBound) return;
    btn.dataset.sm1cBound = '1';
    syncButtonState(btn);
    btn.addEventListener('click', function (evt) {
      evt.preventDefault();
      evt.stopPropagation();
      var id = btn.getAttribute('data-sm1c-favorite-toggle');
      var added = toggle(id);
      syncButtonState(btn);
      if (added) {
        btn.classList.remove('sm1c-pop');
        void btn.offsetWidth;
        btn.classList.add('sm1c-pop');
      }
    });
  }

  function scan() {
    document.querySelectorAll('[data-sm1c-favorite-toggle]').forEach(bindButton);
    updateCountBadges();
  }

  document.addEventListener('DOMContentLoaded', scan);
  document.addEventListener('shopify:section:load', scan);

  window.sm1cWishlist = {
    getIds: getWishlist,
    isSaved: isSaved,
    toggle: toggle
  };
})();
