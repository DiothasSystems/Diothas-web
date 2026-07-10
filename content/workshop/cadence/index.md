---
name: Cadence
subtitle: Decision logs and async standups for teams that would rather build than meet.
status: LIVE
tags: WEB · SERVICE
liveUrl: https://example.com
liveLabel: Launch application
monogram: C
variant: cyan
order: 1
summary: >
  Decision logs and async standups for teams that would rather build than meet.
draft: false
---

Cadence replaces the daily standup with a running, searchable decision log. Each team member posts a short structured update; Cadence threads decisions, blockers, and outcomes into a timeline the whole organization can read at its own speed.

## What it does

Updates take ninety seconds to write and ten to read. Decisions get first-class records — who made the call, what the alternatives were, when to revisit. Blockers escalate automatically if unacknowledged. Everything is linkable, so design docs and postmortems cite decisions instead of paraphrasing them.

![Application screenshot](<> "The decision timeline. Add a screenshot to this folder and reference it here.")

## Why it exists

It began as an experiment behind the perspective *Decisions, Not Documents*. The thesis: most meetings are memory synchronization, and memory is better synchronized in writing. Running the workshop this way proved the essay right — and produced the product.

## How it was built

A boring stack on purpose. Postgres for the log, because a decision record is exactly a row with a timestamp and an author, and nothing about that wants a document store. Server-rendered pages, because the read path dominates by two orders of magnitude and shipping a client-side framework to render immutable text is a tax with no payer.

The one interesting problem was escalation. A blocker that nobody acknowledges must escalate, but a blocker that escalates too eagerly trains people to ignore it. The rule that survived contact with real teams is time-boxed and role-aware: unacknowledged blockers surface to the owner's manager after one working day, and to nobody else, ever.

## Where it stands

Live and in daily use. The next work is search — full-text over decision records is easy, but ranking by *which decision is still load-bearing* is not, and that is the feature the log actually wants.
