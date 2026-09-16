'use strict';

// Theme handling. Loaded in <head> so the saved (or OS) theme is applied
// before first paint — no flash of the wrong theme. The toggle button is
// injected into .site-header once the DOM is ready.

(function () {
  var STORAGE_KEY = 'theme-preference';
  var DARK_QUERY = '(prefers-color-scheme: dark)';
  var root = document.documentElement;

  function readStored() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      return null;
    }
  }

  function writeStored(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (err) {
      // Storage unavailable — the theme still applies for this page view.
    }
  }

  function systemPrefersDark() {
    return Boolean(window.matchMedia) && window.matchMedia(DARK_QUERY).matches;
  }

  // Pure decision: stored choice wins, otherwise follow the OS.
  function resolve(stored, prefersDark) {
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    return prefersDark ? 'dark' : 'light';
  }

  function currentTheme() {
    return root.getAttribute('data-theme');
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
  }

  // Exposed for the self-check.
  window.Theme = { resolve: resolve };

  apply(resolve(readStored(), systemPrefersDark()));

  document.addEventListener('DOMContentLoaded', function () {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-secondary theme-toggle';

    var icon = document.createElement('span');
    icon.className = 'theme-toggle-icon';
    icon.setAttribute('aria-hidden', 'true');
    button.appendChild(icon);

    function paint() {
      var dark = currentTheme() === 'dark';
      // VS15 (\uFE0E) asks platforms for text presentation instead of emoji.
      icon.textContent = dark ? '\u2600\uFE0E' : '\u263E';
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    }

    button.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      apply(next);
      writeStored(next);
      paint();
    });

    var media = window.matchMedia ? window.matchMedia(DARK_QUERY) : null;
    if (media) {
      media.addEventListener('change', function (event) {
        if (readStored()) return; // an explicit choice wins over the OS
        apply(event.matches ? 'dark' : 'light');
        paint();
      });
    }

    paint();
    header.appendChild(button);
  });
})();
