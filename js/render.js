'use strict';

// Shared field renderer. Builds form controls from a case's field config and
// reads their values back. Labels and option text are set with textContent so
// config data is never interpreted as HTML.

(function (global) {
  function fieldId(name) {
    return 'field-' + name;
  }

  function eachField(fields, fn) {
    fields.forEach(function (field) {
      if (field.row) {
        eachField(field.row, fn);
      } else {
        fn(field);
      }
    });
  }

  function buildInput(field) {
    var input;

    if (field.type === 'textarea') {
      input = document.createElement('textarea');
      input.rows = field.rows || 4;
    } else if (field.type === 'select') {
      input = document.createElement('select');
      (field.options || []).forEach(function (option) {
        var node = document.createElement('option');
        node.value = option.value;
        node.textContent = option.label;
        input.appendChild(node);
      });
    } else {
      input = document.createElement('input');
      input.type = field.type || 'text';
    }

    input.id = fieldId(field.name);
    input.name = field.name;
    input.required = Boolean(field.required);
    return input;
  }

  function buildField(field) {
    var wrapper = document.createElement('div');
    wrapper.className = 'field';

    var label = document.createElement('label');
    label.htmlFor = fieldId(field.name);
    label.textContent = field.label;

    wrapper.appendChild(label);
    wrapper.appendChild(buildInput(field));
    return wrapper;
  }

  function buildRow(fields) {
    var row = document.createElement('div');
    row.className = 'field-row';
    fields.forEach(function (field) {
      row.appendChild(buildField(field));
    });
    return row;
  }

  function renderFields(container, fields) {
    container.textContent = '';
    fields.forEach(function (field) {
      container.appendChild(field.row ? buildRow(field.row) : buildField(field));
    });
  }

  function collectValues(form, fields) {
    var values = {};
    eachField(fields, function (field) {
      var input = form.elements[field.name];
      if (input && !input.disabled) {
        values[field.name] = input.value.trim();
      }
    });
    return values;
  }

  // Reads every field's current value, including disabled (hidden) ones, so a
  // hidden field can still act as a condition for another field.
  function allValues(form, fields) {
    var values = {};
    eachField(fields, function (field) {
      var input = form.elements[field.name];
      if (input) {
        values[field.name] = input.value.trim();
      }
    });
    return values;
  }

  // A field with no condition is always visible; `equals` may be a single
  // value or an array meaning "one of".
  function isVisible(field, values) {
    if (!field.showIf) return true;
    var expected = [].concat(field.showIf.equals);
    return expected.indexOf(values[field.showIf.field]) !== -1;
  }

  // Disable + hide fields whose condition is not met. Disabling (rather than
  // only hiding) is what keeps a hidden `required` field from blocking native
  // form validation.
  function applyVisibility(form, fields) {
    var values = allValues(form, fields);
    eachField(fields, function (field) {
      var input = form.elements[field.name];
      if (!input) return;

      var visible = isVisible(field, values);
      input.disabled = !visible;

      var wrapper = input.closest('.field');
      if (wrapper) wrapper.hidden = !visible;
    });
  }

  global.FormRender = {
    renderFields: renderFields,
    collectValues: collectValues,
    allValues: allValues,
    isVisible: isVisible,
    applyVisibility: applyVisibility,
    eachField: eachField,
    fieldId: fieldId
  };
})(window);
