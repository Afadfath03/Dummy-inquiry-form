'use strict';

// Case registry. Each key is a case id and maps to the URL path it is served
// from (`dummy-form.com/{id}/`). A case defines the page title, the fields to
// render, and the Google Form it submits to.
//
// Field kinds understood by js/render.js:
//   text | email | url | textarea | select
// Wrapper: { row: [ ...fields ] } lays fields out side by side.
// Conditional fields: { showIf: { field: 'topic', equals: 'sales' } } hides the
// field until another field has that value. `equals` may be an array ("one
// of"). Hidden fields keep their values but are left out of the review and the
// submission.
//
// `formAction` is the Google Form's formResponse URL and `entries` maps each
// field name to its `entry.*` id. See README.md for how to obtain both.

window.CASES = {
  general: {
    title: 'General Inquiry',
    description: 'Name, email, and a message.',
    formAction: 'https://docs.google.com/forms/d/e/1FAIpQLScaKSMcbegnh9Oo-K78SwlFxfvaBJaFz8D4H8mGFw4MUuAgDA/formResponse',
    entries: {
      firstName: 'entry.309676237',
      lastName: 'entry.1145596174',
      email: 'entry.746662636',
      message: 'entry.1470100485'
    },
    fields: [
      {
        row: [
          { name: 'firstName', label: 'First Name', type: 'text', required: true },
          { name: 'lastName', label: 'Last Name', type: 'text', required: true }
        ]
      },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'message', label: 'Message', type: 'textarea', rows: 5, required: true }
    ]
  },

  dropdown: {
    title: 'Dropdown Demo',
    description: 'Form built around a select field.',
    // TODO: replace with this case's Google Form (see README.md).
    formAction: '',
    entries: {},
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        required: true,
        options: [
          { value: 'option-a', label: 'Option A' },
          { value: 'option-b', label: 'Option B' },
          { value: 'option-c', label: 'Option C' }
        ]
      },
      { name: 'notes', label: 'Notes', type: 'textarea', rows: 4 }
    ]
  },

  dropbox: {
    title: 'Dropbox Link Demo',
    description: 'Share a file through a link instead of uploading it.',
    // TODO: replace with this case's Google Form (see README.md).
    formAction: '',
    entries: {},
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'link', label: 'Shareable Link', type: 'url', required: true }
    ]
  },

  branching: {
    title: 'Branching Demo',
    description: 'Fields that appear based on the topic you pick.',
    // TODO: replace with this case's Google Form (see README.md).
    formAction: '',
    entries: {},
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      {
        name: 'topic',
        label: 'Topic',
        type: 'select',
        required: true,
        options: [
          { value: 'sales', label: 'Sales' },
          { value: 'support', label: 'Support' },
          { value: 'other', label: 'Other' }
        ]
      },
      { name: 'company', label: 'Company', type: 'text', required: true,
        showIf: { field: 'topic', equals: 'sales' } },
      { name: 'orderId', label: 'Order ID', type: 'text', required: true,
        showIf: { field: 'topic', equals: 'support' } },
      { name: 'message', label: 'Message', type: 'textarea', rows: 4, required: true,
        showIf: { field: 'topic', equals: 'other' } }
    ]
  }
};
