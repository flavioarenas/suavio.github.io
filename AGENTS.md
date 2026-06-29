# AGENTS.md

## Cursor Cloud specific instructions

This repository is a static personal website (GitHub Pages, served at `www.flavioarenas.com` via the `CNAME` file). It is plain HTML/CSS with no package manager, build step, tests, or lint configuration.

### Running locally
There is no build. Serve the files with any static file server from the repo root, e.g.:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html`. The site is a single page (`index.html` + `style.css`).

### Notes / gotchas
- Design is intentionally black & white only, on a white background.
- `index.html` links `style.css` via a relative path; fonts load from Google Fonts (`Inter`) with a system-font fallback, so the site still renders without network access.
- There are no automated tests, lint, or build commands to run.
