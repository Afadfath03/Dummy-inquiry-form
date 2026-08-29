# Dummy Inquiry Form

A static 3-page inquiry form. No build step, no backend, no dependencies.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | The inquiry form (header, form, submit button) |
| `confirm.html` | Review entered values, then **Back** or **Send** |
| `thankyou.html` | Thank-you message + **Back to Inquiry** button |

## Run

Either works:

- Double-click `index.html` (works from `file://`), or
- Serve it:

  ```sh
  python3 -m http.server 8000
  ```

  then open <http://localhost:8000>.

## How sending works

There is no backend. On **Send**, `js/confirm.js` POSTs the values to a
Google Form ([Test Dummy](https://forms.gle/sehwi37GASVUuJcr5)) through a
hidden iframe. That form's responses are linked to a Google Spreadsheet,
so every submission appears there as a new row in the **Form Responses 1**
tab.

Limitations (inherent to this no-backend approach):

- Submission is fire-and-forget: the site cannot confirm whether the POST
  succeeded; the Thank You page is always shown after sending.
- Responses land in the form's own response tab, not a hand-made tab.

## Files

```
index.html       inquiry form
confirm.html     review + send
thankyou.html    thank-you page
css/style.css    shared styles
js/form.js       save form data to sessionStorage, restore on back
js/confirm.js    render review, POST to Google Form
```

## Changing the target form

The Google Form endpoint and its `entry.*` field IDs live in the `CONFIG`
block at the top of `js/confirm.js`. To target a different form, fetch its
`viewform` page and update `formAction` plus the entry IDs accordingly.
