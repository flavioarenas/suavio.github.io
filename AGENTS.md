# AGENTS.md

## Cursor Cloud specific instructions

This repository is a static personal website (GitHub Pages, served at `www.flavioarenas.com` via the `CNAME` file). It is plain HTML/CSS with no package manager, build step, tests, or lint configuration.

### Running locally
There is no build. Serve the files with any static file server from the repo root, e.g.:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html`. Pages: `index.html` (home), `projects.html`, `about.html`.

### Notes / gotchas
- `index.html` links its stylesheet via a `github.com/.../blob/...` URL, so `style.css` does not actually apply when viewing `index.html`; `projects.html`/`about.html` link relative paths. This is the existing repo state, not a setup issue.
- `about.html` is currently effectively empty.
- There are no automated tests, lint, or build commands to run.
