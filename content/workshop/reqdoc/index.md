---
name: ReqDoc
subtitle: Requirements in, documents out. One file, no account, no server.
status: LIVE
tags: STANDALONE · HTML
liveUrl: ReqDoc.html
liveLabel: Download ReqDoc
monogram: R
variant: gold
order: 3
summary: >
  A standalone HTML application for product managers. Enter requirements one at
  a time, let it sort them by domain and MoSCoW priority, then publish a Word
  requirements document, an Excel workbook, and a Claude Code build brief.
draft: false
---

ReqDoc is a single HTML file. You download it, open it in a browser, and it *is* the whole application: no install, no account, no server. Enter requirements one at a time, let it sort them by domain and MoSCoW priority, then publish a Word document, an Excel workbook, and a Claude Code build brief. Grab it from the button above to use it; this page is about how it was built.

## How it was built

One HTML document, roughly ninety kilobytes: markup, styles, and vanilla JavaScript in a single file with no framework and no build step. That constraint is the product, so it constrains the implementation: every feature has to survive being written without a bundler.

The Word and Excel exports are the interesting part. Both `.docx` and `.xlsx` are ZIP archives of XML, so ReqDoc assembles the OOXML by hand and packs it with **JSZip**; the spreadsheet goes through **SheetJS**. Those two libraries load from a CDN, which is the one place the single-file promise leaks: the application needs a connection the first time you open it, though nothing you type ever leaves the browser.

Automatic domain sorting is a keyword map, not a model. It is a few hundred terms scored against the requirement text. This is worse than a classifier at the margins and far better in the way that matters: it is auditable, it runs instantly, it works offline, and when it guesses wrong the user can see why and correct it in one click.

Versioning keeps a snapshot of the register with each published version, which is what lets the publish screen show the diff (added, removed, and modified requirements) before you commit to a number.

## Where it stands

Live, and free. Download it and it works. The obvious next step is inlining the two CDN libraries so the file is genuinely self-contained.
