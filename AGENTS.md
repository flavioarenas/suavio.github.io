# AGENTS.md

## Cursor Cloud specific instructions

This repository is a static personal website. Vercel serves it from `master`. `CNAME` stays `www.flavioarenas.com`. It is plain HTML/CSS with no package manager, build step, tests, or lint configuration.

### Running locally
There is no build. Serve the files with any static file server from the repo root, e.g.:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html`. The site is a single page (`index.html`, `style.css`, `book.js`, and `assets/roll-the-calls.jpg`).

### Notes / gotchas
- Dark shelf in the manner of Stripe Press. Currently building (Princeps Media) and Currently reading (Roll the Calls) rest as horizontal spines. Clicking one stands it face-on and opens a summary beside it. `book.js` toggles that state; `prefers-reduced-motion` skips the transition.
- `CNAME` must stay exactly `www.flavioarenas.com` (no trailing newline). Do not change DNS from this repo. The site is static files at the repo root.
- `index.html` links assets via relative paths. Fonts load from Google Fonts (`Source Serif 4`) with a system-font fallback, so the page still renders without network access.
- There are no automated tests, lint, or build commands to run.
