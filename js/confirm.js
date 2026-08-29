'use strict';

// Confirm page: show entered values, and on "Send" POST them to a Google Form
// via a hidden iframe. The Google Form is linked to a spreadsheet, so each
// submission appends a row there.

var STORAGE_KEY = 'inquiry-form-data';

// --- Google Form configuration ---------------------------------------------
// Form: "Test Dummy" (https://forms.gle/sehwi37GASVUuJcr5)
var CONFIG = {
  formAction: 'https://docs.google.com/forms/d/e/1FAIpQLScaKSMcbegnh9Oo-K78SwlFxfvaBJaFz8D4H8mGFw4MUuAgDA/formResponse',
  entries: {
    firstName: 'entry.309676237',
    lastName: 'entry.1145596174',
    phone1: 'entry.104458204',
    phone2: 'entry.1095439495',
    phone3: 'entry.1374313725',
    email: 'entry.746662636',
    subject: 'entry.1514490560',
    message: 'entry.1470100485'
  }
};
// ---------------------------------------------------------------------------

function loadFormData() {
  var raw = null;
  try {
    raw = sessionStorage.getItem(STORAGE_KEY);
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
  var phone = [data.phone1, data.phone2, data.phone3].join('-');

  var values = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: phone,
    subject: data.subject,
    message: data.message
  };

  var nodes = document.querySelectorAll('#review-list [data-field]');
  nodes.forEach(function (node) {
    var key = node.getAttribute('data-field');
    node.textContent = values[key] || '';
  });
}

// All-digit values (e.g. phone parts like "081") are number-parsed by the
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
  var iframe = document.createElement('iframe');
  iframe.name = 'dummy-form-target';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  var form = document.createElement('form');
  form.method = 'POST';
  form.action = CONFIG.formAction;
  form.target = iframe.name;

  Object.keys(CONFIG.entries).forEach(function (key) {
    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = CONFIG.entries[key];
    input.value = sheetsSafe(data[key]);
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
