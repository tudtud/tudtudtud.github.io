# Fender neck-plate dating

Static site. No build step and **no dependencies** — do not run `npm i`,
there is nothing to install.

    python3 -m http.server 8080   # then open http://localhost:8080
    node test/run.js              # runs every verified guitar through the engine

Or via the package scripts, which do the same thing:

    npm run serve
    npm test

`package.json` exists only for `"type": "module"`, which Node needs in order to
read the `.js` files as ES modules. It declares no dependencies.

ES modules will not load over `file://` — opening `index.html` by double-clicking
fails with a CORS error. Serve it.

## Troubleshooting

**`EPERM: operation not permitted, uv_cwd`** — your shell is sitting in a
directory that has been moved or deleted. Nothing to do with this project.
Leave and re-enter by absolute path:

    cd ~ && cd /full/path/to/fender-dater

**Page loads but the evidence rows and example picker are empty** — the
subdirectories are missing. `index.html` loads `src/main.js`, which imports
`../data/*.js`. Check the browser console for a 404 and confirm the tree below.

## Deploying to GitHub Pages

Works as-is. No build step, no Actions workflow needed.

The contents of this folder must sit at the **published root** — either the
repository root, or `docs/` with Pages set to "main branch /docs". If the folder
itself is committed as a subdirectory, the site lands at `/fender-dater/` and
`index.html` will not be found at the root URL.

`.nojekyll` is included. Without it Pages runs the files through Jekyll, which
silently drops anything beginning with `_` — nothing here starts with an
underscore today, but one future file named `_partial.js` would vanish with no
error. The empty file also makes deploys faster.

Checked and fine for Pages:

- every path in `index.html` is relative, so project pages (`user.github.io/repo/`) work
- import paths match filenames case-exactly — Pages is case-sensitive, macOS is not
- fonts load over https
- `.js` is served with a JavaScript MIME type, which ES modules require

`package.json` and `test/` get published too. Harmless, and the test file is a
reasonable thing to have public. Delete them from the deployed copy if you'd
rather not ship them.

## Layout

    index.html            markup only
    styles.css            all styling
    data/                 domain data — no imports, no logic
      serials.js          serial number ranges by scheme
      evidence.js         the eleven signals, their intervals and copy
      cross-checks.js     contradictions the interval math can't see
      examples.js         guitars verified in hand
    src/                  logic — no DOM except render.js
      config.js           tunable constants
      format.js           year/month formatting and axis maths
      parse-serial.js     serial → candidate years
      parse-dates.js      neck, body, pickup and pot code strings → intervals
      fusion.js           interval intersection, conflicts, two-tier serial
      render.js           everything that touches the DOM
      main.js             wiring
    test/run.js           regression suite

## Editing the domain data

Boundaries live in `data/`. Nothing in `data/` imports anything, so a
boundary change is a one-line edit with no risk of touching logic.

Open-ended intervals use `null` as the upper bound — the fusion layer
substitutes the axis maximum. Write `[1964, null]`, not `[1964, 1977]`.

## Adding a verified guitar

Append to `data/examples.js` using the RAW markings as they read on the
instrument, then run `npm test`. Every example is a regression test.
