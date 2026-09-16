'use strict';

// Case form page: render the case's fields, save entries to sessionStorage,
// then go to the confirm page. On load, restore previously entered values
// (e.g. after "Back" from confirm).

var CASE_ID = document.body.getAttribute('data-case');
var CASE = (window.CASES || {})[CASE_ID];

if (!CASE) {
  // Unknown or missing case — send the visitor to the dashboard.
  window.location.replace('../index.html');
} else {
  (function () {
    var STORAGE_KEY = 'inquiry-form-data:' + CASE_ID;
    var LEGACY_KEY = 'inquiry-form-data';

    var form = document.getElementById('inquiry-form');

    window.FormRender.renderFields(document.getElementById('form-fields'), CASE.fields);

    // Branching: re-evaluate conditional fields whenever a choice changes.
    form.addEventListener('change', function () {
      window.FormRender.applyVisibility(form, CASE.fields);
    });

    function loadStored() {
      var raw;
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

    function restoreFormData() {
      var data = loadStored();
      if (!data) return;

      window.FormRender.eachField(CASE.fields, function (field) {
        var input = form.elements[field.name];
        if (input && typeof data[field.name] === 'string') {
          input.value = data[field.name];
        }
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(window.FormRender.collectValues(form, CASE.fields))
        );
      } catch (err) {
        // Storage unavailable — continue; confirm page will handle missing data.
        console.warn('Could not save form data:', err);
      }
      window.location.href = 'confirm.html';
    });

    restoreFormData();
    // Reveal the branch matching any restored choice (e.g. "Back" from confirm).
    window.FormRender.applyVisibility(form, CASE.fields);
  })();
}
