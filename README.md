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

GitHub: [@ker0s3ner](https://github.com/ker0s3ner)
