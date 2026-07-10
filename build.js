#!/usr/bin/env node
/**
 * Diothas Systems — static site generator.
 *
 * Reads:
 *   cms/*.xml                     chrome for each page section (the design's content model)
 *   content/perspectives/<slug>/  index.md + icon + images
 *   content/workshop/<slug>/      index.md + icon + images
 *   uploads/, assets/
 *
 * Writes dist/ — plain HTML, no runtime, no server.
 *
 * There is no admin UI and no preview environment, so this build is the only
 * safety net: invalid front matter, an unparseable date, an unknown status, or
 * a missing image aborts the build rather than deploying a broken page.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const yaml = require('js-yaml');
const { XMLParser } = require('fast-xml-parser');

const ROOT = __dirname;
// DIST_DIR lets you build outside OneDrive, which holds handles on synced
// folders. See emptyDir() below.
const OUT = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(ROOT, 'dist');

const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

/* ------------------------------------------------------------------ *
 * errors
 * ------------------------------------------------------------------ */
const problems = [];
const fail = (where, msg) => problems.push(`${where}\n    ${msg}`);

/* ------------------------------------------------------------------ *
 * small helpers
 * ------------------------------------------------------------------ */
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESCAPES[c]);

const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Front matter is loaded with CORE_SCHEMA, so a date arrives here as a string.
 * That is deliberate. YAML's timestamp type would hand us a Date, and JS
 * rolls out-of-range parts over silently — `2026-13-45` becomes 2027-02-14,
 * quietly reordering the site with no error to notice.
 */
function toDate(value, where) {
  const s = String(value == null ? '' : value).trim();
  if (!DATE_RE.test(s)) {
    fail(where, `date "${value}" must be written as YYYY-MM-DD`);
    return new Date(0);
  }
  const d = new Date(`${s}T00:00:00Z`);
  if (isNaN(d) || d.toISOString().slice(0, 10) !== s) {
    fail(where, `date "${s}" is not a real calendar date`);
    return new Date(0);
  }
  return d;
}
const monthYear = (d) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const isoDate = (d) => d.toISOString().slice(0, 10);

const titleCase = (s) => String(s).toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());

const rmrf = (p) => fs.rmSync(p, { recursive: true, force: true, maxRetries: 5, retryDelay: 120 });
const mkdirp = (p) => fs.mkdirSync(p, { recursive: true });

/**
 * Clear the output directory without removing the directory itself.
 *
 * This project lives inside OneDrive, which converts synced folders into
 * reparse points and keeps a handle on them. Deleting dist/ outright fails
 * with EPERM even when nothing of ours is running. Emptying it works, because
 * the handle is on the directory, not its children.
 */
function emptyDir(p) {
  if (!fs.existsSync(p)) { mkdirp(p); return; }
  for (const entry of fs.readdirSync(p)) rmrf(path.join(p, entry));
}

function writeFile(rel, contents) {
  const full = path.join(OUT, rel);
  mkdirp(path.dirname(full));
  fs.writeFileSync(full, contents, 'utf8');
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  mkdirp(to);
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else fs.copyFileSync(src, dst);
  }
}

/* ------------------------------------------------------------------ *
 * CMS: the design's five-element XML schema
 *   <field key>text</field> | <image key src alt/> | <link key href>label</link>
 *   <group key>…</group>    | <list key><item>…</item></list>
 * ------------------------------------------------------------------ */
const xml = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@',
  textNodeName: '#text',
  trimValues: true,
  processEntities: true,
  parseTagValue: false,      // keep "01" a string, not the number 1
  parseAttributeValue: false,
  isArray: (name) => ['field', 'image', 'link', 'group', 'list', 'item'].includes(name),
});

const nodeText = (n) => (n['#text'] == null ? '' : String(n['#text']).trim());

function parseNode(n) {
  const out = {};
  for (const f of n.field || []) out[f['@key']] = nodeText(f);
  for (const i of n.image || []) out[i['@key']] = { src: i['@src'] || '', alt: i['@alt'] || '' };
  for (const l of n.link || []) out[l['@key']] = { href: l['@href'] || '#', label: nodeText(l) };
  for (const g of n.group || []) out[g['@key']] = parseNode(g);
  for (const s of n.list || []) out[s['@key']] = (s.item || []).map(parseNode);
  return out;
}

const SECTIONS = ['site', 'hero', 'perspectives', 'workshop', 'about', 'contact', 'footer'];

function loadCms() {
  const cms = {};
  for (const name of SECTIONS) {
    const file = path.join(ROOT, 'cms', `${name}.xml`);
    if (!fs.existsSync(file)) { fail(`cms/${name}.xml`, 'file is missing'); cms[name] = {}; continue; }
    try {
      const doc = xml.parse(fs.readFileSync(file, 'utf8'));
      cms[name] = parseNode(doc.section || {});
    } catch (e) {
      fail(`cms/${name}.xml`, `could not be parsed: ${e.message}`);
      cms[name] = {};
    }
  }
  return cms;
}

/* ------------------------------------------------------------------ *
 * Markdown → the design's block sequence
 *
 * The prototype models a body as ordered blocks: text, heading, quote,
 * image, chart. Markdown already is that language, so we map onto it
 * rather than making the author hand-write XML block tags:
 *
 *   paragraph                       -> text
 *   ## Heading                      -> heading
 *   > quote                         -> quote
 *   ![alt](src "caption")           -> image / chart  (identical in the design)
 *   ![alt]()                        -> the dashed placeholder tile
 * ------------------------------------------------------------------ */
function singleImageOf(group) {
  if (!group.length || group[0].type !== 'paragraph_open') return null;
  const inline = group[1];
  if (!inline || inline.type !== 'inline') return null;
  const kids = (inline.children || []).filter(
    (c) => c.type !== 'softbreak' && !(c.type === 'text' && !c.content.trim())
  );
  return kids.length === 1 && kids[0].type === 'image' ? kids[0] : null;
}

function figureHtml(img, where, assetDir) {
  const src = img.attrGet('src') || '';
  const alt = img.content || '';
  const caption = img.attrGet('title') || '';

  let media;
  if (!src) {
    media = `<div class="placeholder">${esc(alt || 'IMAGE / CHART')} — add a path to publish this figure</div>`;
  } else {
    if (!/^(https?:)?\/\//.test(src) && !src.startsWith('/')) {
      const onDisk = path.join(assetDir, src);
      if (!fs.existsSync(onDisk)) fail(where, `image "${src}" is referenced but does not exist in the folder`);
    }
    media = `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">`;
  }
  const cap = caption ? `<figcaption>${esc(caption)}</figcaption>` : '';
  return `<figure>${media}${cap}</figure>`;
}

function renderBody(source, where, assetDir) {
  const tokens = md.parse(source, {});
  const groups = [];
  let depth = 0;
  let current = [];
  for (const t of tokens) {
    current.push(t);
    depth += t.nesting;
    if (depth === 0) { groups.push(current); current = []; }
  }

  return groups.map((group) => {
    const img = singleImageOf(group);
    if (img) return figureHtml(img, where, assetDir);

    // The title lives in front matter; a body H1 would render twice.
    // Demote it, and demote anything below H3 into H3.
    for (const t of group) {
      if (t.type === 'heading_open' || t.type === 'heading_close') {
        if (t.tag === 'h1') {
          if (t.type === 'heading_open') fail(where, 'body begins with an H1 (`# …`) — the title comes from front matter. Start sections at `##`.');
          t.tag = 'h2';
        } else if (t.tag === 'h4' || t.tag === 'h5' || t.tag === 'h6') {
          t.tag = 'h3';
        }
      }
    }
    return md.renderer.render(group, md.options, {});
  }).join('\n');
}

/* ------------------------------------------------------------------ *
 * content
 * ------------------------------------------------------------------ */
const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const STATUSES = {
  'LIVE': { key: 'LIVE', label: 'LIVE', cls: 'pill--live' },
  'BETA': { key: 'BETA', label: 'BETA', cls: 'pill--beta' },
  'IN DEVELOPMENT': { key: 'IN DEVELOPMENT', label: 'IN DEVELOPMENT', cls: 'pill--dev' },
};

function readItems(kind) {
  const base = path.join(ROOT, 'content', kind);
  if (!fs.existsSync(base)) return [];

  const items = [];
  for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const dir = path.join(base, slug);
    const where = `content/${kind}/${slug}`;

    if (!SLUG_RE.test(slug)) {
      fail(where, 'folder name must be lowercase kebab-case — it becomes the URL');
      continue;
    }
    const mdFile = path.join(dir, 'index.md');
    if (!fs.existsSync(mdFile)) { fail(where, 'has no index.md'); continue; }

    const raw = fs.readFileSync(mdFile, 'utf8');
    const match = raw.match(FRONT_MATTER);
    if (!match) { fail(`${where}/index.md`, 'is missing its `---` front matter block'); continue; }

    let meta;
    try {
      // CORE_SCHEMA omits YAML's timestamp type — see toDate() for why.
      meta = yaml.load(match[1], { schema: yaml.CORE_SCHEMA }) || {};
    } catch (e) {
      fail(`${where}/index.md`, `front matter is not valid YAML: ${e.message}`);
      continue;
    }
    if (meta.draft === true) continue;

    const bodySrc = raw.slice(match[0].length);
    const words = bodySrc.replace(/[#>*_`\-!\[\]()]/g, ' ').split(/\s+/).filter(Boolean).length;

    const iconFile = meta.icon ? String(meta.icon) : null;
    if (iconFile && !fs.existsSync(path.join(dir, iconFile))) {
      fail(where, `icon "${iconFile}" is declared but not present in the folder`);
    }
    const iconUrl = iconFile ? `/${kind}/${slug}/${iconFile}` : '/uploads/DiothasIcon.png';

    const item = {
      kind, slug, dir, url: `/${kind}/${slug}/`,
      iconUrl, hasIcon: Boolean(iconFile),
      summary: String(meta.summary || '').trim(),
      subtitle: String(meta.subtitle || '').trim(),
      body: renderBody(bodySrc, `${where}/index.md`, dir),
    };

    if (!item.summary) fail(where, 'front matter needs a `summary` — it is the card text on the home page');

    if (kind === 'perspectives') {
      item.title = String(meta.title || '').trim();
      item.category = String(meta.category || '').trim().toUpperCase();
      item.author = String(meta.author || '').trim();
      item.date = toDate(meta.date, where);
      item.readTime = Number(meta.readTime) || Math.max(1, Math.round(words / 220));
      if (!item.title) fail(where, 'front matter needs a `title`');
      if (!item.category) fail(where, 'front matter needs a `category` — it drives the label and the theme chips');
      if (meta.date == null) fail(where, 'front matter needs a `date` (YYYY-MM-DD) — it sets the running order');
    } else {
      item.name = String(meta.name || '').trim();
      item.tags = String(meta.tags || '').trim();
      item.monogram = String(meta.monogram || item.name.charAt(0) || '?').trim().charAt(0).toUpperCase();
      item.variant = meta.variant === 'gold' ? 'gold' : 'cyan';
      item.order = Number.isFinite(Number(meta.order)) ? Number(meta.order) : 999;

      if (!item.name) fail(where, 'front matter needs a `name`');

      const key = String(meta.status || '').trim().toUpperCase().replace(/[-_]+/g, ' ');
      const status = STATUSES[key];
      if (!status) fail(where, `status "${meta.status}" is not one of: LIVE, BETA, IN DEVELOPMENT`);
      item.status = status || STATUSES.LIVE;

      /**
       * SW-016 says every Workshop page links to its running service. Two of the
       * apps break that as written, so the rule is amended rather than met:
       *
       *   liveUrl: https://…      a hosted service — opens in a new tab
       *   liveUrl: ReqDoc.html    a file in this folder — renders a download button
       *   liveUrl omitted         allowed only for IN DEVELOPMENT, because an
       *                           unreleased app has nothing to link to
       */
      const live = String(meta.liveUrl || '').trim();
      item.liveLabel = String(meta.liveLabel || '').trim();
      item.isDownload = false;
      item.liveUrl = '';

      if (!live) {
        if (item.status.key !== 'IN DEVELOPMENT') {
          fail(where, 'front matter needs a `liveUrl` — only an IN DEVELOPMENT app may omit it');
        }
      } else if (/^https?:\/\//.test(live)) {
        item.liveUrl = live;
        item.liveLabel = item.liveLabel || 'Launch application';
      } else if (live.startsWith('/') || live.includes('://')) {
        fail(where, `liveUrl "${live}" must be an absolute http(s) URL, or the name of a file in this folder`);
      } else {
        if (!fs.existsSync(path.join(dir, live))) {
          fail(where, `liveUrl "${live}" names a file that is not in this folder`);
        }
        item.liveUrl = `/${kind}/${slug}/${live}`;
        item.downloadName = live;
        item.isDownload = true;
        item.liveLabel = item.liveLabel || 'Download';
      }
    }

    items.push(item);
  }

  if (kind === 'perspectives') items.sort((a, b) => b.date - a.date);
  else items.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  return items;
}

/* ------------------------------------------------------------------ *
 * templates
 * ------------------------------------------------------------------ */
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">`;

function page({ title, description, body, canonical, baseUrl }) {
  const url = canonical && baseUrl ? baseUrl.replace(/\/$/, '') + canonical : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${url ? `<link rel="canonical" href="${esc(url)}">` : ''}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
${url ? `<meta property="og:url" content="${esc(url)}">` : ''}
<link rel="icon" href="/uploads/DiothasIcon.png">
${FONTS}
<link rel="stylesheet" href="/assets/site.css">
</head>
<body>
${body}
</body>
</html>
`;
}

// Anchors live on the home page. Everywhere else they need to point back at it.
const href = (h, atHome) => (h.startsWith('#') && !atHome ? `/${h}` : h);

function nav(site, atHome) {
  const links = (site.nav || [])
    .map((n) => `<a class="nav__link" href="${esc(href(n.link.href, atHome))}">${esc(n.link.label)}</a>`)
    .join('\n        ');
  return `<header class="nav">
    <div class="wide nav__inner">
      <a class="nav__brand" href="/">
        <img class="nav__logo" src="/${esc(site.logo.src)}" alt="${esc(site.logo.alt)}">
        <span class="nav__names">
          <span class="nav__name">${esc(site.brandName)}</span>
          <span class="nav__tag">${esc(site.brandTagline)}</span>
        </span>
      </a>
      <nav class="nav__links">
        ${links}
        <a class="btn-brass" href="${esc(site.cta.href)}">${esc(site.cta.label)}</a>
      </nav>
    </div>
  </header>`;
}

function fullFooter(footer, atHome) {
  const cols = (footer.columns || []).map((col) => `
        <div class="footer__col">
          <div class="footer__colhead">${esc(col.heading)}</div>
          ${(col.links || []).map((l) => `<a class="footer__link" href="${esc(href(l.link.href, atHome))}">${esc(l.link.label)}</a>`).join('\n          ')}
        </div>`).join('');

  return `<footer class="footer">
    <div class="wide footer__top">
      <div class="footer__brandcol">
        <div class="footer__brandrow">
          <img class="footer__logo" src="/${esc(footer.logo.src)}" alt="${esc(footer.logo.alt)}">
          <span class="footer__name">${esc(footer.brandName)}</span>
        </div>
        <p class="footer__blurb">${esc(footer.blurb)}</p>
      </div>
      <div class="footer__cols">${cols}
      </div>
    </div>
    <div class="footer__bar">
      <span>${esc(footer.copyright)}</span>
      <span>${esc(footer.tagline)}</span>
    </div>
  </footer>`;
}

function slimFooter(footer, site) {
  return `<footer class="footer footer--slim">
    <div class="footer__bar">
      <span>${esc(footer.copyright)}</span>
      <a href="mailto:${esc(site.contactEmail)}">${esc(String(site.contactEmail).toUpperCase())}</a>
    </div>
  </footer>`;
}

function tile(item, big) {
  const cls = big ? 'apphead__tile' : 'tile tile--mono';
  if (item.hasIcon) {
    return `<img class="${big ? 'apphead__icon' : 'tile'}" src="${esc(item.iconUrl)}" alt="${esc(item.name)} icon">`;
  }
  return `<div class="${cls} tile--${item.variant}"><span class="tile__letter">${esc(item.monogram)}</span></div>`;
}

/* ---------------------------- home ---------------------------- */
function homePage(cms, perspectives, workshop) {
  const { site, hero, about, contact, footer } = cms;
  const p = cms.perspectives;
  const w = cms.workshop;

  const featured = perspectives[0];
  const rest = perspectives.slice(1, 5);

  const themes = [];
  for (const a of perspectives) if (!themes.includes(a.category)) themes.push(a.category);

  const featuredHtml = featured ? `
        <a class="featured" href="${esc(featured.url)}">
          <div class="featured__panel">
            <img src="${esc(featured.iconUrl)}" alt="">
            <div class="featured__vignette"></div>
            <span class="featured__badge">FEATURED</span>
          </div>
          <div class="featured__body">
            <div class="cat">${esc(featured.category)}</div>
            <h3 class="featured__title">${esc(featured.title)}</h3>
            <p class="featured__excerpt">${esc(featured.summary)}</p>
            <div class="meta">
              <span>${featured.readTime} MIN READ</span><span class="meta__dot">·</span><span>${monthYear(featured.date)}</span>
            </div>
          </div>
        </a>` : '<p class="featured__excerpt">No perspectives published yet.</p>';

  const posts = rest.map((a, i) => `
            <a class="postrow" href="${esc(a.url)}">
              <span class="postrow__num">${String(i + 2).padStart(2, '0')}</span>
              <div>
                <div class="postrow__cat">${esc(a.category)}</div>
                <h4 class="postrow__title">${esc(a.title)}</h4>
                <div class="postrow__read">${a.readTime} MIN READ</div>
              </div>
            </a>`).join('');

  const cards = workshop.map((app) => `
          <a class="card" href="${esc(app.url)}">
            ${tile(app, false)}
            <div style="flex:1">
              <div class="card__head">
                <h3 class="card__name">${esc(app.name)}</h3>
                <span class="pill ${app.status.cls}">${esc(app.status.label)}</span>
              </div>
              <p class="card__desc">${esc(app.summary)}</p>
              <div class="card__tags">${esc(app.tags)}</div>
            </div>
          </a>`).join('');

  const body = `<div class="shell">
  <div class="glow glow--cyan"></div>
  <div class="glow glow--brass"></div>

  ${nav(site, true)}

  <section class="hero" id="top">
    <div class="hero__bg" style="background-image:url('/${esc(hero.backdrop.src)}')"></div>
    <div class="hero__scrim-a"></div>
    <div class="hero__scrim-b"></div>
    <div class="wide hero__inner">
      <div class="hero__col">
        <div class="hero__eyebrow"><span class="hero__rule"></span>${esc(hero.eyebrow)}</div>
        <h1 class="hero__title">${esc(hero.title)}</h1>
        <p class="hero__subtitle">${esc(hero.subtitle)}</p>
        ${(hero.paragraphs || []).map((x) => `<p class="hero__p">${esc(x.text)}</p>`).join('\n        ')}
        <div class="hero__closing">
          ${(hero.closingLines || []).map((x) => `<p>${esc(x.text)}</p>`).join('\n          ')}
        </div>
        <div class="hero__ctas">
          <a class="btn-primary" href="${esc(hero.primaryCta.href)}">${esc(hero.primaryCta.label)} <span>→</span></a>
          <a class="btn-ghost" href="${esc(hero.secondaryCta.href)}">${esc(hero.secondaryCta.label)}</a>
        </div>
      </div>
    </div>
  </section>

  <section class="wide section" id="writing">
    <div class="sechead">
      <div>
        <div class="kicker">${esc(p.sectionNo)} — ${esc(p.kicker)}</div>
        <h2 class="h2">${esc(p.heading)}</h2>
      </div>
      <a class="viewall" href="/perspectives/">${esc(p.viewAll.label)}</a>
    </div>

    <div class="persp-grid">
      ${featuredHtml}
      <div class="postlist">${posts}
      </div>
    </div>

    <div class="themes">
      <div class="kicker">${esc(p.themesLabel)}</div>
      <div class="themes__row">
        ${themes.map((t) => `<span class="chip">${esc(titleCase(t))}</span>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="band" id="work">
    <div class="wide section">
      <div class="sechead">
        <div class="work__intro">
          <div class="kicker">${esc(w.sectionNo)} — ${esc(w.kicker)}</div>
          <h2 class="h2">${esc(w.heading)}</h2>
          <p>${esc(w.body)}</p>
        </div>
        <a class="viewall" href="/workshop/">${esc(w.viewAll.label)}</a>
      </div>
      <div class="card-grid">${cards}
      </div>
    </div>
  </section>

  <section class="wide section" id="about">
    <div class="about-grid">
      <div class="about__emblem-wrap">
        <img class="about__emblem" src="/${esc(about.emblem.src)}" alt="${esc(about.emblem.alt)}">
      </div>
      <div>
        <div class="kicker">${esc(about.sectionNo)} — ${esc(about.kicker)}</div>
        <h2 class="about__h2">${esc(about.heading)}</h2>
        <p class="about__p">${esc(about.body1)}</p>
        <p class="about__p">${esc(about.body2)}</p>
        <div class="stats">
          ${(about.stats || []).map((s) => `<div>
            <div class="stat__value">${esc(s.value)}</div>
            <div class="stat__label">${esc(s.label)}</div>
          </div>`).join('\n          ')}
        </div>
      </div>
    </div>
  </section>

  <section class="contact" id="contact">
    <div class="contact__inner">
      <div class="kicker">${esc(contact.kicker)}</div>
      <h2 class="contact__h2">${esc(contact.heading)}</h2>
      <a class="contact__btn" href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>
    </div>
  </section>

  ${fullFooter(footer, true)}
</div>`;

  return page({
    title: `${site.brandName} — ${hero.subtitle}`,
    description: (hero.paragraphs && hero.paragraphs[0] && hero.paragraphs[0].text) || site.brandTagline,
    body, canonical: '/', baseUrl: site.baseUrl,
  });
}

/* ---------------------------- article ---------------------------- */
function articlePage(cms, a) {
  const { site, footer } = cms;
  const author = a.author || site.brandName.toUpperCase();

  const body = `<div class="shell">
  ${nav(site, false)}

  <header class="dochead">
    <div class="dochead__inner">
      <a class="backlink" href="/perspectives/">← ALL PERSPECTIVES</a>
      <div class="arthead__row">
        <img class="arthead__icon" src="${esc(a.iconUrl)}" alt="">
        <div style="padding-top:4px">
          <div class="arthead__cat">${esc(a.category)}</div>
          <div class="arthead__meta">
            <span>${esc(monthYear(a.date))}</span><span class="meta__dot">·</span><span>${a.readTime} MIN READ</span><span class="meta__dot">·</span><span>${esc(author)}</span>
          </div>
        </div>
      </div>
      <h1 class="doc__title">${esc(a.title)}</h1>
      ${a.subtitle ? `<p class="doc__subtitle">${esc(a.subtitle)}</p>` : ''}
    </div>
  </header>

  <article class="doc">
    <div class="prose">
${a.body}
    </div>

    <div class="endrule">
      <span></span><span class="endrule__mark">◆</span><span></span>
    </div>

    <div class="docnav">
      <a class="btn-ghost" href="/perspectives/">← More Perspectives</a>
      <a class="docnav__side" href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a>
    </div>
  </article>

  ${slimFooter(footer, site)}
</div>`;

  return page({
    title: `${a.title} — ${site.brandName}`,
    description: a.summary,
    body, canonical: a.url, baseUrl: site.baseUrl,
  });
}

/* ---------------------------- workshop app ---------------------------- */
function appPage(cms, app) {
  const { site, footer } = cms;

  // A download stays on-origin and must not open a tab; a coming-soon app has
  // no link at all, so it gets no primary button rather than a dead one.
  const primaryCta = !app.liveUrl ? ''
    : app.isDownload
      ? `<a class="btn-primary" href="${esc(app.liveUrl)}" download="${esc(app.downloadName)}">${esc(app.liveLabel)} <span>↓</span></a>`
      : `<a class="btn-primary" href="${esc(app.liveUrl)}" target="_blank" rel="noopener">${esc(app.liveLabel)} <span>↗</span></a>`;

  const footCta = !app.liveUrl
    ? `<span class="docnav__side">Not yet released — <a href="mailto:${esc(site.contactEmail)}">ask to be told when it is</a></span>`
    : app.isDownload
      ? `<a class="docnav__live" href="${esc(app.liveUrl)}" download="${esc(app.downloadName)}">${esc(app.liveLabel)} ↓</a>`
      : `<a class="docnav__live" href="${esc(app.liveUrl)}" target="_blank" rel="noopener">${esc(app.liveLabel)} ↗</a>`;

  const body = `<div class="shell">
  ${nav(site, false)}

  <header class="dochead">
    <div class="dochead__inner">
      <a class="backlink" href="/workshop/">← THE WORKSHOP</a>
      <div class="apphead__row">
        ${tile(app, true)}
        <div class="apphead__body">
          <div class="apphead__namerow">
            <h1 class="apphead__name">${esc(app.name)}</h1>
            <span class="pill pill--lg ${app.status.cls}">${esc(app.status.label)}</span>
          </div>
          ${app.subtitle ? `<p class="apphead__sub">${esc(app.subtitle)}</p>` : ''}
          <div class="apphead__tags">${esc(app.tags)}</div>
          <div class="apphead__ctas">
            ${primaryCta}
            <a class="btn-ghost" href="${esc(site.cta.href)}">${esc(site.cta.label)}</a>
          </div>
        </div>
      </div>
    </div>
  </header>

  <article class="doc">
    <div class="prose">
${app.body}
    </div>

    <div class="endrule">
      <span></span><span class="endrule__mark">◆</span><span></span>
    </div>

    <div class="docnav">
      <a class="btn-ghost" href="/workshop/">← Back to the Workshop</a>
      ${footCta}
    </div>
  </article>

  ${slimFooter(footer, site)}
</div>`;

  return page({
    title: `${app.name} — ${site.brandName}`,
    description: app.summary,
    body, canonical: app.url, baseUrl: site.baseUrl,
  });
}

/* ---------------------------- index pages ----------------------------
 * Not in the prototype. The design's "All Perspectives →" pointed at the
 * home section anchor, which silently strands the sixth article onward.
 * Built from the existing tokens. */
function indexPage(cms, { heading, blurb, rows, canonical, backLabel }) {
  const { site, footer } = cms;

  const body = `<div class="shell">
  ${nav(site, false)}

  <header class="indexhead">
    <div class="indexhead__inner">
      <a class="backlink" href="/">← ${esc(backLabel)}</a>
      <h1>${esc(heading)}</h1>
      <p>${esc(blurb)}</p>
    </div>
  </header>

  <div class="wide section">
    <div class="indexlist">${rows}
    </div>
  </div>

  ${fullFooter(footer, false)}
</div>`;

  return page({ title: `${heading} — ${site.brandName}`, description: blurb, body, canonical, baseUrl: site.baseUrl });
}

function perspectivesIndex(cms, items) {
  const rows = items.map((a) => `
      <a class="indexrow" href="${esc(a.url)}">
        <img class="indexrow__icon" src="${esc(a.iconUrl)}" alt="">
        <div>
          <div class="postrow__cat">${esc(a.category)}</div>
          <h2 class="indexrow__title">${esc(a.title)}</h2>
          <p class="indexrow__excerpt">${esc(a.summary)}</p>
          <div class="meta"><span>${a.readTime} MIN READ</span><span class="meta__dot">·</span><span>${esc(monthYear(a.date))}</span></div>
        </div>
      </a>`).join('');

  return indexPage(cms, {
    heading: 'All Perspectives',
    blurb: cms.perspectives.heading,
    rows: rows || '\n      <p class="indexrow__excerpt">Nothing published yet.</p>',
    canonical: '/perspectives/',
    backLabel: 'HOME',
  });
}

function workshopIndex(cms, items) {
  const rows = items.map((app) => `
      <a class="indexrow" href="${esc(app.url)}">
        ${app.hasIcon
          ? `<img class="indexrow__icon" src="${esc(app.iconUrl)}" alt="">`
          : `<div class="indexrow__icon tile--mono tile--${app.variant}"><span class="tile__letter" style="font-size:24px">${esc(app.monogram)}</span></div>`}
        <div>
          <div class="card__head">
            <h2 class="indexrow__title" style="margin:0">${esc(app.name)}</h2>
            <span class="pill ${app.status.cls}">${esc(app.status.label)}</span>
          </div>
          <p class="indexrow__excerpt">${esc(app.summary)}</p>
          <div class="card__tags">${esc(app.tags)}</div>
        </div>
      </a>`).join('');

  return indexPage(cms, {
    heading: 'All Projects',
    blurb: cms.workshop.body,
    rows: rows || '\n      <p class="indexrow__excerpt">Nothing published yet.</p>',
    canonical: '/workshop/',
    backLabel: 'HOME',
  });
}

function notFoundPage(cms) {
  const { site, footer } = cms;
  const body = `<div class="shell">
  ${nav(site, false)}
  <div class="notfound">
    <h1>The mechanism has no gear here.</h1>
    <p>That page does not exist. It may have been renamed, or never wound at all.</p>
    <a class="btn-primary" href="/">Return to the workshop <span>→</span></a>
  </div>
  ${slimFooter(footer, site)}
</div>`;
  return page({ title: `Not found — ${site.brandName}`, description: 'Page not found.', body, canonical: '', baseUrl: site.baseUrl });
}

function sitemap(baseUrl, urls) {
  const base = String(baseUrl || '').replace(/\/$/, '');
  const entries = urls.map(({ loc, lastmod }) =>
    `  <url><loc>${esc(base + loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

/* ------------------------------------------------------------------ *
 * build
 * ------------------------------------------------------------------ */
function build() {
  const cms = loadCms();
  const perspectives = readItems('perspectives');
  const workshop = readItems('workshop');

  if (problems.length) {
    console.error(`\n  Build failed — ${problems.length} problem${problems.length > 1 ? 's' : ''}:\n`);
    for (const p of problems) console.error(`  • ${p}\n`);
    console.error('  Nothing was written. Fix the above and run again.\n');
    process.exit(1);
  }

  emptyDir(OUT);

  copyDir(path.join(ROOT, 'uploads'), path.join(OUT, 'uploads'));
  copyDir(path.join(ROOT, 'assets'), path.join(OUT, 'assets'));

  writeFile('index.html', homePage(cms, perspectives, workshop));
  writeFile('404.html', notFoundPage(cms));
  writeFile('perspectives/index.html', perspectivesIndex(cms, perspectives));
  writeFile('workshop/index.html', workshopIndex(cms, workshop));

  for (const a of perspectives) {
    writeFile(`perspectives/${a.slug}/index.html`, articlePage(cms, a));
    copyItemAssets(a);
  }
  for (const app of workshop) {
    writeFile(`workshop/${app.slug}/index.html`, appPage(cms, app));
    copyItemAssets(app);
  }

  const urls = [
    { loc: '/' },
    { loc: '/perspectives/' },
    { loc: '/workshop/' },
    ...perspectives.map((a) => ({ loc: a.url, lastmod: isoDate(a.date) })),
    ...workshop.map((a) => ({ loc: a.url })),
  ];
  writeFile('sitemap.xml', sitemap(cms.site.baseUrl, urls));
  writeFile('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${String(cms.site.baseUrl || '').replace(/\/$/, '')}/sitemap.xml\n`);

  console.log(`  Built ${perspectives.length} perspective${perspectives.length === 1 ? '' : 's'} and ${workshop.length} workshop page${workshop.length === 1 ? '' : 's'} into dist/`);
  const drafted = countDrafts();
  if (drafted) console.log(`  ${drafted} item${drafted === 1 ? '' : 's'} skipped as draft.`);
}

function copyItemAssets(item) {
  for (const entry of fs.readdirSync(item.dir, { withFileTypes: true })) {
    if (entry.name === 'index.md') continue;
    const src = path.join(item.dir, entry.name);
    const dst = path.join(OUT, item.kind, item.slug, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else { mkdirp(path.dirname(dst)); fs.copyFileSync(src, dst); }
  }
}

function countDrafts() {
  let n = 0;
  for (const kind of ['perspectives', 'workshop']) {
    const base = path.join(ROOT, 'content', kind);
    if (!fs.existsSync(base)) continue;
    for (const e of fs.readdirSync(base, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const f = path.join(base, e.name, 'index.md');
      if (fs.existsSync(f) && /^draft:\s*true\s*$/m.test(fs.readFileSync(f, 'utf8'))) n++;
    }
  }
  return n;
}

build();
