# Tools

Each tool is one self-contained ES module: `tools/<id>.js`, exporting a single
function `mount(root)` that builds the tool's UI into the given `<section>`
element. See `clock.js` for the pattern.

Rules that keep tools shipping as independent, conflict-free pull requests:

- Add exactly one new file, `tools/<id>.js`. Do **not** edit `index.html` or any
  other tool — the shell already loads every planned id.
- Everything self-contained: no globals, no shared state, no external libraries
  or network calls. Plain DOM only.
- Use the existing CSS classes from `index.html` (`.out`, and the styled
  `label` / `input` / `textarea` / `select` / `button` inside `.tool`).
- Give the tool an `<h2>` title and keep it usable offline.

Planned tools (each is a task on the Forge board): `json-formatter`, `base64`,
`color-converter`, `timestamp`.
