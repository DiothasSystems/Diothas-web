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

ReqDoc is a single HTML file. You download it, open it in a browser, and it is the whole application — there is nothing to install, no account to create, and no server holding your product plans.

## What it does

**Set up the product.** A title, a company, a description, and a glossary of definitions that travels with the document.

**Add requirements one at a time.** Each one takes a statement, an acceptance criterion, a requester, a priority, and a domain. ReqDoc reads the statement and proposes the domain itself — a requirement mentioning *firmware* or *TLS* or *latency* lands in Firmware, Security, or Performance without being told. You can override it.

The ten domains are UX, System, Hardware, Firmware, Software, Network, Security, Performance, Data, and General. Priorities are MoSCoW: **Must Have**, **Should Have**, **Could Have**, **Won't Have**.

**Review the register.** Search the whole set, filter by domain or priority, and see at a glance how many requirements exist, how many are Must Have, and how many domains the product actually touches.

**Publish.** ReqDoc computes the next version number, diffs the register against the last published snapshot to show you exactly what changed, takes a changelog, and then generates three files:

- a **Word requirements document**, organized by domain
- an **Excel workbook** of the full register
- a **Claude Code build brief**, so the spec can be handed to an AI coding agent rather than retyped into a prompt

Drafts save and reopen as JSON. Where the browser supports it, *Set Save Location* writes those files straight into a folder you choose, instead of trickling through the downloads bar.

![ReqDoc requirements register](<> "Add a screenshot of the review screen to this folder and reference it here.")

## Why it exists

The requirements document is the least loved artifact in product management, and the reason is structural: the work of writing one is clerical, but the cost of writing a bad one is architectural. Teams build what the document says, including the parts it says by accident.

ReqDoc attacks the clerical half so that attention is left for the other. Domain sorting, version numbering, change detection, and three export formats are all mechanical work that software should be doing. What remains for the product manager is the only part that was ever hard: deciding what the system must do, and how you will know it did.

The single-file form is the point. A product manager should be able to write a spec on a laptop in an airport, hand the file to somebody, and have it open. No login screen stands between an idea and the document.

> Where PrismPRD is the cloud, ReqDoc is the file.

## How it was built

One HTML document, roughly ninety kilobytes: markup, styles, and vanilla JavaScript in a single file with no framework and no build step. That constraint is the product, so it constrains the implementation — every feature has to survive being written without a bundler.

The Word and Excel exports are the interesting part. Both `.docx` and `.xlsx` are ZIP archives of XML, so ReqDoc assembles the OOXML by hand and packs it with **JSZip**; the spreadsheet goes through **SheetJS**. Those two libraries load from a CDN, which is the one place the single-file promise leaks — the application needs a connection the first time you open it, though nothing you type ever leaves the browser.

Automatic domain sorting is a keyword map, not a model. It is a few hundred terms scored against the requirement text. This is worse than a classifier at the margins and far better in the way that matters: it is auditable, it runs instantly, it works offline, and when it guesses wrong the user can see why and correct it in one click.

Versioning keeps a snapshot of the register with each published version, which is what lets the publish screen show the diff — added, removed, and modified requirements — before you commit to a number.

## Where it stands

Live, and free. Download it and it works. The obvious next step is inlining the two CDN libraries so the file is genuinely self-contained.
