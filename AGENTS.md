# AGENTS.md

## Cursor Cloud specific instructions

This repository is a static personal website (GitHub Pages, served at `www.flavioarenas.com` via the `CNAME` file). It is plain HTML/CSS with no package manager, build step, tests, or lint configuration.

### Running locally
There is no build. Serve the files with any static file server from the repo root, e.g.:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html`. The site is a single page (`index.html`, `style.css`, `book.js`, and `assets/roll-the-calls.jpg`).

### Notes / gotchas
- Quiet paper-and-ink page. The published jacket on the Currently reading book is the only strong color.
- Currently building links to `https://princepsmedia.com`. Currently reading is a CSS 3D hardcover (`book.js` tilts with the pointer and settles on scroll; both are off when `prefers-reduced-motion` is set).
- `CNAME` is the Pages custom domain and must stay exactly `www.flavioarenas.com` (no trailing newline). That host is canonical. Apex `flavioarenas.com` reaches the same site only after DNS: four `A` records and four `AAAA` records on the apex to GitHub Pages, while `www` stays a `CNAME` to `flavioarenas.github.io`. Pages then redirects the apex to `www`. Enforce HTTPS is already on. GitHub Pages serves the repo root from `master`.
- `index.html` links assets via relative paths. Fonts load from Google Fonts (`Inter`, `Source Serif 4`) with system-font fallbacks, so the page still renders without network access.
- There are no automated tests, lint, or build commands to run.
