# Diothas Systems — diothassystems.com

Static site for Diothas Systems, LLC. Two sections: **Perspectives**, long-form
writing on product and technology leadership, and **The Workshop**, the web and
mobile applications where those ideas get tested.

A plain Node script turns Markdown and XML into HTML. GitHub Actions builds it
and uploads the result to Hostinger. **Nothing runs on the server** — no Node, no
database, no admin, no login. Hostinger serves files.

---

## Quick start

```bash
npm install
npm run preview     # builds, then serves dist/ at http://localhost:8080
npm run build       # build only, into dist/
```

`server.js` exists solely for that local preview. It is never deployed.

---

## Where things live

```
cms/*.xml               the main page, one file per section  → cms/README.md
content/perspectives/   one folder per article               → content/README.md
content/workshop/       one folder per application           → content/README.md
uploads/                shared graphics (logo, hero banner)
assets/site.css         the design tokens, as CSS
build.js                the whole generator, ~450 lines
design/                 the hi-fi prototype, for reference
dist/                   generated; git-ignored; never edit
```

**To change the main page**, edit `cms/*.xml`.
**To publish an article or an app**, add a folder under `content/`.
You never edit the home page to publish something — the featured card, the
numbered list, the theme chips and the app grid are all generated.

---

## Deploying

Every push to `main` builds and deploys. Pull requests build but do not deploy.

Before the first deploy, add three **repository secrets** in GitHub under
*Settings → Secrets and variables → Actions*:

| Secret | Where to find it |
|---|---|
| `FTP_SERVER` | hPanel → Files → FTP Accounts → *FTP hostname* |
| `FTP_USERNAME` | the FTP account username |
| `FTP_PASSWORD` | the FTP account password |

Optionally set a repository **variable** `FTP_REMOTE_DIR` if your web root is
not `/public_html/`.

If Hostinger's FTPS certificate causes a handshake failure, add
`security: loose` to the deploy step in `.github/workflows/deploy.yml`.

**The build is the safety net.** There is no admin panel and no staging
environment, so `build.js` refuses to emit a broken site: invalid front matter,
a date that isn't a real calendar date, a status outside `LIVE | BETA | IN
DEVELOPMENT`, a referenced image that isn't in the folder. A failed build never
deploys, and the live site keeps serving the last good version.

To roll back: `git revert` the commit and push.

---

## Design

Recreated from the `.dc.html` prototypes in `design/`. Colours, spacing, radii,
the 90-second hero pan and the card hover lift are transcribed exactly into
`assets/site.css`.

Three deliberate departures, each for a reason:

- **Inter replaces Aptos.** Aptos ships with Microsoft Office and has no free
  web licence. Inter is a close neo-grotesque match at the weights the design
  uses. To restore Aptos, drop the `woff2` files into `uploads/fonts`, add the
  `@font-face` rules, and prepend `Aptos` to `--font-sans` in `assets/site.css`.
  Nothing else changes.
- **Responsive breakpoints exist.** The prototype had none; the handoff says to
  apply the target system's. Both two-column grids collapse under 820px and the
  hero headline scales down.
- **Status pills are mapped, not pattern-matched.** The prototype coloured the
  pill amber via `/beta|soon|wip/i`. SW-020 mandates the phrase *In Development*,
  which that expression does not match — it would have rendered green, like
  `LIVE`. Statuses are now an explicit three-value map.

Two screens were designed here rather than in the prototype: `/perspectives/`
and `/workshop/`. The prototype's "All Perspectives →" pointed at a home-page
anchor, which strands the sixth article onward.

---

## Requirements

Against `Diothas_Web-claude.md` v1.0 (22 requirements).

| | |
|---|---|
| **Implemented** | SW-001 – SW-005, SW-008, SW-009, SW-010, SW-014, SW-015, SW-019, SW-020, SW-022 |
| **Dropped by the owner** | SW-006 (Word input), SW-011 / SW-012 / SW-013 (comments), SW-017 (admin page), SW-021 (subscribe) |
| **Superseded by the design** | SW-007 — three-across with horizontal scroll became the featured card plus a numbered list |
| **Amended** | SW-009 — content lives in the repo, not on the host, so it is versioned and revertible. A folder name is the URL slug; the title comes from front matter, because SW-009's "folder name is the title" cannot express a colon on Windows. |
| | SW-016 — "each Workshop page links to its web service" holds only for hosted services. ReqDoc is a file you download, not a service; Wi-Fi Validator is unreleased and links to nothing. `liveUrl` therefore accepts a URL, a filename in the app's folder, or nothing at all when the app is `IN DEVELOPMENT`. |
| **Knowingly unmet** | SW-018 — hero content stays in `cms/hero.xml` rather than a `HERO` folder |

SW-008 asks for a "100 word summary" on each Workshop card. The design gives that
text four lines at 14px, which is roughly 30 words. The design won; `summary`
is the card text and the app page carries the long form.
