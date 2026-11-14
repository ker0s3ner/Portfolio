const { build } = require('esbuild');
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');

const SITE = 'https://benpetronis.vercel.app';
const POSTS_DIR = path.join(__dirname, 'posts');
const OUT_DIR = path.join(__dirname, 'blog');

/* ---------------------------------------------------------------- bundles */
build({
  entryPoints: ['src/OrbitingCircles.jsx'],
  bundle: true,
  outfile: 'dist/orbiting-circles.js',
  minify: true,
  sourcemap: false,
  target: ['es2015'],
  loader: { '.jsx': 'jsx' },
  define: { 'process.env.NODE_ENV': '"production"' },
  alias: { '@': path.resolve(__dirname, 'src') }
}).catch(() => process.exit(1));

/* ------------------------------------------------------------------- blog */
// Posts live in posts/YYYY-MM-slug.md with a small front-matter block:
//   ---
//   title: ...
//   date: 2026-11-30
//   summary: one sentence
//   ---
// Math: $inline$ and $$display$$ are typeset by MathJax in the browser.

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function parseFrontMatter(raw, file) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = {};
  m[1].split(/\r?\n/).forEach((line) => {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  });
  if (!meta.title || !meta.date) throw new Error(`${file}: front matter needs title and date`);
  return { meta, body: m[2] };
}

// Keep TeX away from the markdown parser (it would eat _, *, \\).
function renderMarkdown(src) {
  const stash = [];
  const keep = (tex) => { stash.push(tex); return `@@MATH${stash.length - 1}@@`; };
  let text = src
    .replace(/\$\$[\s\S]+?\$\$/g, keep)
    .replace(/\\\([\s\S]+?\\\)/g, keep)
    .replace(/(?<![\\$])\$(?!\s)[^$\n]+?(?<!\s)\$(?!\d)/g, keep);
  let html = marked.parse(text, { gfm: true });
  html = html.replace(/@@MATH(\d+)@@/g, (_, n) => esc(stash[Number(n)]).replace(/&quot;/g, '"'));
  return html;
}

const dateLabel = (iso) => {
  const d = new Date(iso + 'T12:00:00Z');
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
};

const shell = ({ title, description, body, depth = '../', current = '' }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="icon" type="image/svg+xml" href="${depth}favicon.svg">
<link rel="alternate" type="application/atom+xml" title="Blog" href="${depth}blog/feed.xml">
<script>window.MathJax={tex:{inlineMath:[['$','$'],['\\\\(','\\\\)']],displayMath:[['$$','$$'],['\\\\[','\\\\]']]},svg:{fontCache:'none'}};</script>
<script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
<link rel="stylesheet" href="${depth}assets/site.css">
</head>
<body>
<div id="spectral-bg" aria-hidden="true"></div>
<div class="container">
<nav class="site-nav" aria-label="Primary">
  <a href="${depth}index.html">Home</a>
  <a href="${depth}index.html#research">Projects</a>
  <a href="${depth}blog/" ${current === 'blog' ? 'aria-current="page"' : ''}>Blog</a>
  <a href="https://github.com/ker0s3ner" target="_blank" rel="noopener noreferrer">GitHub</a>
  <a href="https://www.linkedin.com/in/benaspetronis/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
</nav>
<main style="padding-top:40px">
${body}
</main>
<footer role="contentinfo"><p>Benas Petronis · <a href="${depth}blog/feed.xml">Atom feed</a> · <a href="${depth}index.html">Back to portfolio</a></p></footer>
</div>
<script src="${depth}assets/spectral-bg.js"></script>
</body>
</html>
`;

function buildBlog() {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const posts = fs.readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => {
      const { meta, body } = parseFrontMatter(fs.readFileSync(path.join(POSTS_DIR, f), 'utf8'), f);
      return {
        slug: f.replace(/\.md$/, ''),
        title: meta.title,
        date: meta.date,
        dateLabel: dateLabel(meta.date),
        summary: meta.summary || '',
        html: renderMarkdown(body)
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  posts.forEach((p) => {
    const body = `<article class="prose">
<h1>${esc(p.title)}</h1>
<span class="post-date">${esc(p.dateLabel)}</span>
${p.html}
<p style="margin-top:36px"><a href="./">← All posts</a></p>
</article>`;
    fs.writeFileSync(path.join(OUT_DIR, `${p.slug}.html`),
      shell({ title: `${p.title} — Benas Petronis`, description: p.summary || p.title, body, current: 'blog' }));
  });

  const list = posts.length
    ? `<ul class="post-list">${posts.map((p) => `<li><a class="post-item" href="${p.slug}.html"><h3>${esc(p.title)}</h3><div class="post-date">${esc(p.dateLabel)}</div><p class="post-summary">${esc(p.summary)}</p></a></li>`).join('')}</ul>`
    : '<p class="post-summary">No posts yet.</p>';
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), shell({
    title: 'Blog — Benas Petronis',
    description: 'Notes on spectral theory and the things I build.',
    body: `<h2 class="section-title" style="margin-top:0"><span class="tex">\\section{</span>Blog<span class="tex">}</span></h2>
<p class="intro" style="margin-bottom:28px">Notes on spectral theory and the things I build, roughly once a month.</p>${list}`,
    current: 'blog'
  }));

  fs.writeFileSync(path.join(OUT_DIR, 'posts.json'),
    JSON.stringify(posts.map(({ slug, title, date, dateLabel, summary }) => ({ slug, title, date, dateLabel, summary }))));

  const updated = posts.length ? posts[0].date : new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(OUT_DIR, 'feed.xml'), `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<title>Benas Petronis</title>
<link href="${SITE}/blog/feed.xml" rel="self"/>
<link href="${SITE}/blog/"/>
<id>${SITE}/blog/</id>
<updated>${updated}T12:00:00Z</updated>
<author><name>Benas Petronis</name></author>
${posts.map((p) => `<entry><title>${esc(p.title)}</title><link href="${SITE}/blog/${p.slug}.html"/><id>${SITE}/blog/${p.slug}.html</id><updated>${p.date}T12:00:00Z</updated><summary>${esc(p.summary)}</summary></entry>`).join('\n')}
</feed>
`);

  console.log(`blog: ${posts.length} post(s) -> blog/`);
}

buildBlog();
