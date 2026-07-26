(function () {
  function usEasternHour() {
    try {
      var formatted = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        hour12: false
      }).format(new Date());
      return parseInt(formatted, 10) % 24;
    } catch (e) {
      return new Date().getUTCHours();
    }
  }

  function rangeForHour(hour) {
    if (hour >= 9 && hour < 22) return [14, 63];
    if (hour >= 6 && hour < 9) return [6, 24];
    return [2, 11];
  }

  function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function paintBadges() {
    var range = rangeForHour(usEasternHour());
    document.querySelectorAll('[data-sm1c-viewing-badge]').forEach(function (badge) {
      var countEl = badge.querySelector('[data-sm1c-viewing-count]');
      if (countEl) countEl.textContent = randomInRange(range[0], range[1]);
      badge.hidden = false;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', paintBadges);
  } else {
    paintBadges();
  }
})();
