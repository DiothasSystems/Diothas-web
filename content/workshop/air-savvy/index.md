---
name: Air Savvy
subtitle: Airline fare price tracker. Stop guessing, start saving on flights.
status: BETA
tags: WEB · SERVICE
liveUrl: https://air-savvy.com
liveLabel: Start tracking flights
icon: icon.png
monogram: A
variant: cyan
order: 1
summary: >
  Watches your routes every morning, builds a 90-day price history, and emails
  you the moment a fare hits your target or drops. Booking intelligence tells
  you whether to buy now or wait.
draft: false
---

Airfare is one of the few consumer prices that changes daily, in both directions, for reasons the buyer cannot see. The rational response is to check every morning; nobody does, so Air Savvy does it for you — watching your routes, building a rolling 90-day price history, and emailing you the moment a fare hits your target, with a buy-now-or-wait call on top. The live app is the place to see all of that. This page is about how it was built.

## How it was built

Air Savvy started as a personal itch. I plan trips ten to twelve months out, and the one variable I could never time was the airfare — it drifts up and down for reasons a buyer can't see. I wanted an agent that would watch specific flights every day and tell me when to buy, and figured anyone who books that far ahead could use the same thing.

Idea to working beta took **about twenty hours** — which is the point of the Workshop, not a footnote to it.

**The stack.** Air Savvy was built in Claude Cowork on Sonnet 4.6, with the interface shaped against Claude's design guidance and its graphics generated in Gemini. It runs on Hostinger: a Node.js service, a Hostinger database holding each tracked route and its price history, and Hostinger mail for the alerts. Live fares come from SerpAPI's Google Flights data, Stripe handles payment processing, and Google AdSense supports the free tier.

**The roadmap.**

- **v1.1** — PC and mobile web experience with an admin portal
- **v1.2** — Stripe payment processing
- **v1.3** — a mobile-app companion

## Where it stands

In beta. The free plan — tracking a single flight without alerts — is live today. The premium plan adds unlimited trackers, alerting, and more frequent price checks; its paid subscriptions arrive with **v1.2**, when Stripe is wired in, billed annually with a seven-day refund window.
