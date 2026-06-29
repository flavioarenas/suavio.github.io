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
- All pages link `style.css` via a relative path and share the same nav/footer markup and a small inline `<script>` for the mobile nav toggle.
- Fonts load from Google Fonts (`Inter`) with a system-font fallback, so the site still renders without network access.
- There are no automated tests, lint, or build commands to run.
