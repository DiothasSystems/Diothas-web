---
name: Tip Jar
subtitle: Know what to tip, anywhere in the world.
status: IN DEVELOPMENT
tags: ANDROID · iOS
icon: icon.png
monogram: T
variant: cyan
order: 5
summary: >
  A fast tip calculator that knows tipping is a local custom, not a formula.
  Guidance for 73 countries across 14 service types, a bill splitter for the
  table, and no account to sign up for.
draft: false
---

Standing at a table in an unfamiliar country, the question is rarely "what is twenty percent of this?" It is "is twenty percent even the right thing to do here?" Most tip calculators answer the first question and ignore the second. Tip Jar answers both: enter the bill, pick the service, and get the amount along with the local custom behind it, including the cases where tipping is not expected at all or a service charge is already sitting on the bill. It covers 73 countries across 14 service types, splits the bill across the table, and never asks for an account. This page is about how it was built.

## How it was built

I wanted a small consumer app with genuine everyday value, and the strongest version of that idea pointed at international travel. It began narrowly: work out the tip on a restaurant bill. Splitting the check and rounding to a clean total followed almost immediately, because that is what actually happens at the table. Then the scope opened up on its own. If the app knows restaurants, it should know taxis and hotel porters and tour guides. And if it knows those, the interesting problem is not the arithmetic at all but the etiquette, which changes completely the moment you cross a border. That last step, from calculator to tipping guide, is where the product became worth building.

Two constraints held the whole way. Keep it simple, and store nothing about the user. There is no account, no history, and no bill data kept after you close the app.

Idea to Play Store submission took **about fifteen hours**.

**The stack.** Requirements were written in **PrismPRD**, the sibling tool in this Workshop. The interface was designed and iterated in Claude Design, and the international tipping research ran in Claude Cowork against published tourism-board and travel-publisher sources. The app itself is Flutter, built in Claude Code, starting on Sonnet and moving to Opus 5 for the store-preparation work and final passes. Live exchange rates come from a free public API with a bundled offline fallback, and Google AdMob supplies the banner that offsets development cost. There is no backend at all.

**What the build taught me.**

- **Start with an HTML demo.** The whole interface was prototyped as a single standalone HTML file first, which made the UX arguments cheap to have and cheap to lose. Reworking a layout took minutes instead of a rebuild cycle. By the time a line of Flutter was written, the design was settled.
- **Then build native anyway.** The obvious shortcut is to wrap that HTML and ship it. I went native instead, and it was the right call: real GPS, the camera flash as a flashlight, and the ad SDK all wanted native access, and the result feels like an app rather than a page.
- **Prototype scaffolding has to be hunted down before submission.** The demo left convincing fakes behind: a purchase button that took no payment, an ad slot filled with invented restaurant names, and terms of use that still described themselves as a draft. All three were plausible enough to survive months of testing and all three would have been a problem in review.
- **Some decisions are permanent, so make them on purpose.** An Android package name cannot be changed after the first release; a different one is simply a different app. Mine was still the scaffold default hours before submission. The signing key is the same kind of decision in reverse: lose it and you can never update the listing again.
- **Static data that looks live is worse than no data.** The location bar displayed a hardcoded city next to a "GPS" label, so it confidently told a user in Georgia they were in Texas. The tip was always right; the label was not. The same trap caught the bundled exchange rates, one of which had drifted 93% from the real value.
- **Build outside cloud-synced folders.** Days went into a build failure that turned out to be OneDrive holding files open mid-sync. Moving the project to a plain local path fixed it immediately.

**The roadmap.**

- **v1.0**, Android release: 73 countries, 14 service types, bill splitting, live currency conversion *(submitted)*
- **v1.1**, iOS release *(project scaffolded; needs a Mac to build and sign)*
- **v1.2**, an agent that watches store reviews and feedback and turns it into the next set of features

## Where it stands

The Android build is finished, signed, and verified on hardware, and is waiting on Play Store developer-account verification before it goes to internal testing. The iOS project is scaffolded and configured as far as Windows allows: bundle identifier, permissions, tracking prompt, and icons are all in place. Finishing it means adding a Mac to the toolchain, which is the next thing on the list.
