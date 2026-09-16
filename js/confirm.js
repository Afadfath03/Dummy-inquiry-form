'use strict';

// Case confirm page: show the entered values, and on "Send" POST them to the
// case's Google Form via a hidden iframe. The Google Form is linked to a
// spreadsheet, so each submission appends a row there.

var CASE_ID = document.body.getAttribute('data-case');
var CASE = (window.CASES || {})[CASE_ID];

if (!CASE) {
  // Unknown or missing case — send the visitor to the dashboard.
  window.location.replace('../index.html');
} else {
  (function () {
    var STORAGE_KEY = 'inquiry-form-data:' + CASE_ID;
    var LEGACY_KEY = 'inquiry-form-data';

    function loadFormData() {
      var raw = null;
      try {
        raw = sessionStorage.getItem(STORAGE_KEY);
        // "general" used the pre-per-case key before this became multi-case.
        if (!raw && CASE_ID === 'general') {
          raw = sessionStorage.getItem(LEGACY_KEY);
        }
      } catch (err) {
        return null;
      }
      if (!raw) return null;

      try {
        return JSON.parse(raw);
      } catch (err) {
        return null;
      }
    }

    function renderReview(data) {
      var list = document.getElementById('review-list');

      window.FormRender.eachField(CASE.fields, function (field) {
        if (!window.FormRender.isVisible(field, data)) return;

        var row = document.createElement('div');
        row.className = 'review-row';

        var dt = document.createElement('dt');
        dt.textContent = field.label;

        var dd = document.createElement('dd');
        dd.textContent = data[field.name] || '';
        if (field.type === 'textarea') {
          dd.className = 'prewrap';
        }

        row.appendChild(dt);
        row.appendChild(dd);
        list.appendChild(row);
      });
    }

    // All-digit values (e.g. a year like "081") are number-parsed by the
    // linked spreadsheet, which silently DROPS values with leading zeros.
    // Prefixing a single apostrophe forces text storage; Sheets strips the
    // apostrophe, so the cell shows the original value ("081").
    function sheetsSafe(value) {
      if (value && /^\d+$/.test(value)) {
        return "'" + value;
      }
      return value;
    }

    function submitToGoogleForm(data) {
      if (!CASE.formAction || !CASE.entries || !Object.keys(CASE.entries).length) {
        console.warn('Case "' + CASE_ID + '" has no Google Form configured; nothing was sent.');
        return;
      }

      var iframe = document.createElement('iframe');
      iframe.name = 'dummy-form-target';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      var form = document.createElement('form');
      form.method = 'POST';
      form.action = CASE.formAction;
      form.target = iframe.name;

      var fieldsByName = {};
      window.FormRender.eachField(CASE.fields, function (field) {
        fieldsByName[field.name] = field;
      });

      Object.keys(CASE.entries).forEach(function (key) {
        // Omit branches the visitor never saw (their values are absent from data).
        var field = fieldsByName[key];
        if (field && !window.FormRender.isVisible(field, data)) return;

        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = CASE.entries[key];
        input.value = sheetsSafe(data[key]) || '';
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    }

    function clearFormData() {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        // Nothing sensible to do — the tab is being left anyway.
      }
    }

    var data = loadFormData();

    if (!data) {
      // Confirm page opened directly without filling the form first.
      window.location.replace('index.html');
    } else {
      renderReview(data);

      document.getElementById('send-btn').addEventListener('click', function () {
        var button = this;
        button.disabled = true;
        button.textContent = 'Sending...';

        submitToGoogleForm(data);

        // Give the hidden iframe POST time to complete before navigating away.
        window.setTimeout(function () {
          clearFormData();
          window.location.href = 'thankyou.html';
        }, 1500);
      });
    }
  })();
}
