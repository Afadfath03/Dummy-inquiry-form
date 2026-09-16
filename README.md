# Dummy Inquiry Form

Static multi-case inquiry forms. No build step, no backend, no dependencies.

## URLs

| URL | Purpose |
|---|---|
| `/` | Dashboard listing every configured case |
| `/{case}/` | That case's inquiry form |
| `/{case}/confirm.html` | Review entered values, then **Back** or **Send** |
| `/{case}/thankyou.html` | Thank-you message + **Back to Inquiry** |

Configured cases: `general`, `dropdown`, `dropbox`, `branching`.

The old root URLs `/confirm.html` and `/thankyou.html` redirect into `/general/`.

## Run

Either works:

- Double-click `index.html` (works from `file://`), or
- Serve it:

  ```sh
  python3 -m http.server 8000
  ```

  then open <http://localhost:8000>.

## Dark mode

Every page has a toggle in the header. With no saved choice the theme follows
the OS `prefers-color-scheme`; once the visitor toggles, that choice is stored
in `localStorage['theme-preference']` and wins from then on.

Colors live as CSS custom properties in `css/style.css` (`:root` for light,
`[data-theme="dark"]` for dark), and `js/theme.js` is loaded from `<head>` so
the correct theme is applied before first paint (no flash). `color-scheme` is
set per theme so native `<select>` popups and scrollbars match.

## Navigation

Every case page has an icon back button at the left of the header that returns
to the dashboard (`/`). On the confirm page, the in-page **Back to form** button
goes back to that case's form instead.

## How sending works

There is no backend. On **Send**, `js/confirm.js` POSTs the values to the case's
Google Form through a hidden iframe. That form's responses are linked to a
Google Spreadsheet, so every submission appears there as a new row in the
**Form Responses 1** tab.

Limitations (inherent to this no-backend approach):

- Submission is fire-and-forget: the site cannot confirm whether the POST
  succeeded; the Thank You page is always shown after sending.
- Responses land in the form's own response tab, not a hand-made tab.
- Google Forms cannot receive file uploads this way, so the `dropbox` case
  collects a **shareable link** as text instead.

The `general` case is wired to the
[Test Dummy](https://forms.gle/sehwi37GASVUuJcr5) form. `dropdown` and
`dropbox` ship with **empty** `formAction`/`entries` placeholders: sending from
them logs a console warning and sends nothing until you fill those in.

## Cases

A case is one entry in the `window.CASES` registry in `js/cases.js`:

```js
dropdown: {
  title: 'Dropdown Demo',
  description: 'Form built around a select field.',
  formAction: 'https://docs.google.com/forms/d/e/<FORM_ID>/formResponse',
  entries: {
    name: 'entry.123',
    category: 'entry.456',
    notes: 'entry.789'
  },
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'select', required: true,
      options: [{ value: 'option-a', label: 'Option A' }] },
    { name: 'notes', label: 'Notes', type: 'textarea', rows: 4 }
  ]
}
```

- The registry key is both the case id and its URL path.
- `entries` maps each field `name` to its Google Form `entry.*` id.
- Field kinds: `text`, `email`, `url`, `textarea`, `select`.
- Wrap fields in `{ row: [ ... ] }` to lay them out side by side.
- Add `showIf: { field: 'topic', equals: 'sales' }` to reveal a field only when
  another field has that value. `equals` may be an array meaning "one of".
  Hidden fields keep their values when you switch branches, but are left out of
  the confirm review and the Google Form submission.

See the `branching` case for a working example: a `topic` select reveals
`company` for Sales, `orderId` for Support, or `message` for Other.

## Adding a new case

1. Add an entry to `window.CASES` in `js/cases.js`.
2. Copy one case folder (e.g. `general/`) to `{case}/` and update the
   `data-case` attribute plus the `<title>`, `<h1>`, and header back link
   (`../index.html`) in all three files.
3. Add the case to the table in the **URLs** section above.

## Changing the target form

`formAction` is the form's `formResponse` URL and each `entry.*` id maps to a
field. To point a case at a different Google Form, open its `viewform` page,
inspect the field `name` attributes, and update `formAction` plus `entries` in
`js/cases.js`.

All-digit answers (e.g. `081`) can be number-parsed by the linked spreadsheet,
which drops leading zeros. `sheetsSafe()` in `js/confirm.js` prefixes such
values with an apostrophe to force text storage.

## Files

```
index.html            dashboard (base domain)
confirm.html          legacy redirect into general/confirm.html
thankyou.html         legacy redirect into general/thankyou.html
general/              case pages: index.html, confirm.html, thankyou.html
dropdown/             case pages: index.html, confirm.html, thankyou.html
dropbox/              case pages: index.html, confirm.html, thankyou.html
branching/            case pages: index.html, confirm.html, thankyou.html
css/style.css         shared styles + theme tokens
js/cases.js           case registry (fields + Google Form target)
js/theme.js           apply theme early, inject header toggle, persist choice
js/render.js          shared field renderer, condition visibility, value collector
js/dashboard.js       build the dashboard case list
js/form.js            render case fields, save to sessionStorage, restore on back
js/confirm.js         render review, POST to the case's Google Form
```
