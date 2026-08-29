'use strict';

// Inquiry form: save entries to sessionStorage, then go to the confirm page.
// On load, restore previously entered values (e.g. after "Back" from confirm).

var STORAGE_KEY = 'inquiry-form-data';

var form = document.getElementById('inquiry-form');

function getFormData() {
  return {
    firstName: form.firstName.value.trim(),
    lastName: form.lastName.value.trim(),
    email: form.email.value.trim(),
    phone1: form.phone1.value.trim(),
    phone2: form.phone2.value.trim(),
    phone3: form.phone3.value.trim(),
    subject: form.subject.value.trim(),
    message: form.message.value.trim()
  };
}

function restoreFormData() {
  var raw;
  try {
    raw = sessionStorage.getItem(STORAGE_KEY);
  } catch (err) {
    return; // storage unavailable (e.g. blocked) — start with a blank form
  }
  if (!raw) return;

  try {
    var data = JSON.parse(raw);
  } catch (err) {
    return;
  }

  ['firstName', 'lastName', 'email', 'phone1', 'phone2', 'phone3',
   'subject', 'message'].forEach(function (key) {
    if (typeof data[key] === 'string' && form[key]) {
      form[key].value = data[key];
    }
  });
}

form.addEventListener('submit', function (event) {
  event.preventDefault();
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(getFormData()));
  } catch (err) {
    // Storage unavailable — continue; confirm page will handle missing data.
    console.warn('Could not save form data:', err);
  }
  window.location.href = 'confirm.html';
});

restoreFormData();
