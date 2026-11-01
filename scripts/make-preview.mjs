// Turns the built site (dist/) into a self-contained preview with relative links,
// so it can be clicked through without a web server. Not used for the real site.
import fs from 'node:fs';
import path from 'node:path';

const src = 'dist';
const out = process.argv[2] || 'preview';
fs.rmSync(out, { recursive: true, force: true });

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));

for (const file of walk(src)) {
  const rel = path.relative(src, file);
  const dest = path.join(out, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!file.endsWith('.html') && !file.endsWith('.css')) { fs.copyFileSync(file, dest); continue; }

  const depth = rel.split(path.sep).length - 1;
  const up = depth ? '../'.repeat(depth) : './';
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/(href|src)="\/(?!\/)([^"]*)"/g, (_, attr, p) => {
    let target = p === '' ? 'index.html' : p.endsWith('/') ? p + 'index.html' : p;
    return `${attr}="${up}${target}"`;
  });
  html = html.replace(/<html([^>]*)>/, `<html$1 data-root="${up}">`);
  html = html.replace(/id="my-trail"/, `id="my-trail" data-prefix="${up}exhibits/"`);
  fs.writeFileSync(dest, html);
}

// The preview's front page is published as the artifact page itself, without its document shell.
let home = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
home = home
  .replace(/<!doctype html>/i, '')
  .replace(/<html[^>]*>|<\/html>|<head>|<\/head>|<body>|<\/body>/g, '')
  .replace(/<meta charset="utf-8"\s*\/?>|<meta name="viewport"[^>]*>/g, '')
  .replace(/<title>[^<]*<\/title>/, '<title>Learning Crumbs</title><meta name="claude:viewport-fit-sides" content="cover">');
fs.writeFileSync(path.join(out, 'home.html'), home);
console.log('preview written to', out);
