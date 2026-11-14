# Portfolio

Personal portfolio site of Benas Petronis: pure mathematics, programming languages, security tooling and interactive explainers. Live at [benpetronis.vercel.app](https://benpetronis.vercel.app).

The site is static HTML with a LaTeX-style title block on the home page, plus a few small React components bundled with esbuild.

## Pages

| Page | What it is |
|---|---|
| `index.html` | Home: about, project list, contact |
| `book.html`, `Book.pdf` | *The Spectral Theorem*, a short book |
| `matrix-proof.html`, `determinant proof.pdf` | A proof about matrix determinants |
| `rocket-geometry.html`, `Differential trajectories.pdf` | Rocket trajectories and differential geometry |
| `reentry-feasibility.html` | Mach-16+ re-entry feasibility study |
| `custom-language.html` | Project page for [Marila](https://github.com/ker0s3ner/Marila), a mathematical programming language |
| `chemistry-tool.html` | Project page for [Catalyst](https://github.com/ker0s3ner/catalyst), a chemistry TUI |
| `pentesting.html` | Penetration testing terminal write-up |
| `surveillance.html` | Surveillance system write-up |

## Background and blog

- `assets/spectral-bg.js` draws the page background: a red DOOM-style fire (heat-diffusion cellular automaton) plus spectral-theory formulas, typeset once by MathJax, that fade in and out in place. The formula list is the `TEX` array in that file.
- `assets/site.css` holds the styles shared by the home page and the blog.
- `posts/*.md` are blog posts. `npm run build` turns them into `blog/` (index, one page per post, `posts.json`, `feed.xml`). `blog/` is generated and git-ignored; Vercel builds it on deploy.

### Writing a monthly post

1. Create `posts/YYYY-MM-your-slug.md`:
   ```
   ---
   title: Your title
   date: 2026-12-14
   summary: One sentence shown on the home page and blog index.
   ---
   Body in markdown. Math with $inline$ and $$display$$.
   ```
2. `npm run build`, open `blog/` to check it, commit, push. Files starting with `_` are ignored (use them for drafts).

## Development

Requires Node.js.

```bash
git clone https://github.com/ker0s3ner/port.git
cd port
npm install
npm run build    # bundles src/ into dist/ with esbuild
npm run watch    # rebuild on change
```

Open `index.html` in a browser, or serve the folder with any static server. The interactive pieces (`MathVisualization.jsx`, `OrbitingCircles.jsx`) live in `src/` and build to `dist/`.

## Deployment

Deployed on Vercel. `vercel.json` runs `npm run build`, serves the repo root, and rewrites all routes to `index.html`.

## Contact

GitHub: [@ker0s3ner](https://github.com/ker0s3ner) · LinkedIn: [benaspetronis](https://www.linkedin.com/in/benaspetronis/)
