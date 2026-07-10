# Publishing — Perspectives and The Workshop

This is the day-to-day guide. Everything on the site's article pages, app pages,
and the cards that link to them comes from the folders beside this file.

**You never edit the home page to publish something.** You add a folder.

---

## The shape of a folder

One folder per item. The folder name becomes the URL, so keep it lowercase with
hyphens — `the-platform-tax`, not `The Platform Tax`. The *title* readers see
comes from the front matter, so it can contain colons, em-dashes, anything.

```
content/perspectives/the-diothas-far-look-ahead/
    index.md            the article — front matter + body
    icon.png            optional; falls back to the Diothas emblem
    images/varzeo.png   any figures you reference
```

---

## Publishing a Perspective

Create `content/perspectives/<slug>/index.md`:

```markdown
---
title: "The Diothas: A 19th-Century Blueprint for Betting on the Future"
subtitle: A far look ahead, and the discipline that makes it worth taking.
category: "FUTURES THINKING"
author: DIOTHAS SYSTEMS
date: 2026-07-09
readTime: 9          # optional — computed from word count if you omit it
icon: icon.png       # optional
summary: >
  Two or three sentences. This is the excerpt on the home page card and the
  description search engines show. Keep it under about 240 characters.
draft: false
---

The body starts here, at a paragraph. Never open with `# A Heading` — the
title above is already the page's H1, and a second one renders twice.

## Sections use two hashes

> Pull quotes use a blockquote. They render in italic brass.
```

**What happens next.** The newest article by `date` becomes the large featured
card. The next four fill the numbered list `02`–`05`. Everything older lives on
`/perspectives/`. The theme chips are the distinct `category` values across
every published article — you never maintain that list by hand.

Quote any `category` containing an ampersand: `category: "HIRING & TEAMS"`.

---

## Publishing a Workshop application

Create `content/workshop/<slug>/index.md`:

```markdown
---
name: Air Savvy
subtitle: Airline fare price tracker.
status: BETA               # LIVE | BETA | IN DEVELOPMENT — exactly these three
tags: WEB · SERVICE
liveUrl: https://air-savvy.com
liveLabel: Start tracking flights
icon: icon.png             # optional — omit and you get the monogram tile
monogram: A                # the letter shown when there is no icon
variant: gold              # cyan | gold — the monogram tile's colour
order: 1                   # optional; otherwise alphabetical
summary: >
  The card description on the home page.
draft: false
---
```

`status` is matched exactly against those three strings. `SOON` and `WIP` are
not statuses and will stop the build rather than quietly render as `LIVE`.

### `liveUrl` takes three forms

Not every application is a hosted service, so the link is not always a link.

| Front matter | What renders |
|---|---|
| `liveUrl: https://air-savvy.com` | A button opening the service in a new tab, marked `↗` |
| `liveUrl: ReqDoc.html` | A **download** button, marked `↓`, for a file in the same folder |
| *omitted* | No button at all — allowed **only** when `status: IN DEVELOPMENT` |

A bare filename must name a file that actually exists in the app's folder, or
the build stops. A path like `/downloads/thing.html` is rejected — put the file
next to `index.md` and name it directly.

Omitting `liveUrl` on a `LIVE` or `BETA` app is an error. A released app that
links to nothing is nearly always a mistake rather than a decision.

**Give every app page the same spine.** SW-014 asks these pages to cover the
function *and the development* of the application, and SW-002 says the whole
site exists to demonstrate technical leadership — so the build story is the
content, not a footnote to it:

```markdown
## What it does
## Why it exists
## How it was built
## Where it stands
```

Four apps written to the same spine are comparable to a reader skimming all of
them. Cut a section that has nothing to say, but start from the spine.

---

## Pictures, charts, and diagrams

Put the file in the folder and reference it relatively. The image *title* — the
quoted part — becomes the caption underneath.

```markdown
![Alt text for screen readers](images/chart.png "Fig. 1 — What the chart shows.")
```

To reserve a figure slot before you have the artwork, use an empty destination.
You get the dashed placeholder tile with your caption under it:

```markdown
![Diagram: team boundaries](<> "Fig. 1 — Drop the diagram in this folder.")
```

Charts and images render identically, so there is no separate chart syntax.

---

## Taking something down

Set `draft: true`. It disappears from the cards, the index, and its own URL on
the next deploy. Nothing is deleted.

---

## What happens when you commit

1. Drag the folder into GitHub's web uploader, or commit it however you like.
2. GitHub Actions runs `npm run build`.
3. **The build refuses to publish broken content.** A missing `summary`, a date
   that isn't a real calendar date, a `status` outside the three legal values,
   an image you referenced but didn't upload — each one fails the build with the
   folder name and the problem. A failed run doesn't deploy, so the live site
   keeps serving the last good version.
4. If it passes, `dist/` is uploaded to Hostinger over FTPS. About a minute.

There is no admin panel and no preview environment, which is why the build is
strict. Run `npm run preview` locally to see exactly what will ship.

To undo a bad deploy: `git revert` the commit and push.
