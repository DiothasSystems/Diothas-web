---
name: Tideline
subtitle: Personal cash-flow forecasting that reads like a tide chart — calm, visual, a little ahead of you.
status: LIVE
tags: iOS · ANDROID
liveUrl: https://example.com
liveLabel: Get the app
monogram: T
variant: gold
order: 2
summary: >
  Personal cash-flow forecasting that reads like a tide chart — calm, visual,
  and a little ahead of you.
draft: false
---

Most budgeting apps are ledgers pointed backwards. Tideline points forward: given what recurs, what is scheduled, and what you have, here is the shape of the next ninety days.

## What it does

Tideline reads your recurring inflows and outflows and draws a single curve — the balance you are actually going to have, day by day, out to a horizon you set. Low tide is the number that matters, and the app tells you the date it arrives before you get there.

No categories. No envelopes. No guilt. The premise is that people do not need to be told what they spent; they need to know whether next month works.

## Why it exists

Budgeting apps optimize for the wrong emotion. Retrospective categorization produces shame, and shame produces app deletion. A forecast produces a decision — move the car payment, skip the trip, take the freelance job — which is the only thing the user ever wanted from the software.

## How it was built

The forecasting engine is deliberately simple: recurrence rules, scheduled one-offs, and a confidence band derived from the variance of the last six months of discretionary spend. There is no machine learning in it, and adding some would make the curve less trustworthy, not more, because the user cannot audit a model they cannot read.

The hard part was rendering. A ninety-day curve on a phone is a legibility problem before it is a graphics problem. The chart went through four rewrites before it stopped lying about precision it did not have — the confidence band exists to make the honest uncertainty visible rather than hiding it behind a crisp line.

## Where it stands

Live on both platforms. Shared household forecasting is the most-requested feature and the one most likely to break the calm the app is built around, so it is being designed slowly.
