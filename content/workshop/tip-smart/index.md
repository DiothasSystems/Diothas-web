---
name: Tip Smart
subtitle: Know what to tip, anywhere in the world.
status: LIVE
tags: ANDROID · iOS
liveUrl: https://play.google.com/store/apps/details?id=com.diothassystems.tipsmart
liveLabel: Get it on Google Play
liveUrl2: https://apps.apple.com/us/app/tipsmart-like-a-local/id6819130086
liveLabel2: Get it on the App Store
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

Standing at a table in an unfamiliar country, the question is rarely "what is twenty percent of this?" It is "is twenty percent even the right thing to do here?" Most tip calculators answer the first and ignore the second. Tip Smart answers both: enter the bill, pick the service, and get the amount along with the local custom behind it, including the cases where tipping is not expected at all or a service charge is already sitting on the bill. It covers 73 countries across 14 service types, splits the bill across the table, and never asks for an account. This page is about how it was built, and about the rebrand nobody plans for.

![A brass and iron tipping machine parked on a wet cobbled street, its display reading Bill $86.50, Tip $17.30, Total $103.80, with fifteen, eighteen and twenty percent keys beneath a Tip Smart banner.](tip-smart-contraption.webp "Not what the app looks like — what it is trying to feel like. The sum already settled, the local custom already known.")

## How it was built

It began narrowly: work out the tip on a restaurant bill. Splitting the check and rounding to a clean total followed almost immediately, because that is what happens at a table. Then the scope opened on its own. If the app knows restaurants, it should know taxis and hotel porters and tour guides — and once it knows those, the interesting problem is not the arithmetic at all but the etiquette, which changes completely the moment you cross a border. That step, from calculator to tipping guide, is where it became worth building.

Idea to a working app took **about fifteen hours**. Everything after that — store listings, data-safety declarations, review cycles, an ad network, and an unplanned rebrand — took **roughly twice as long again**. That ratio is the most useful thing this project taught me, and nothing in the build warned me it was coming.

**The stack.** Requirements were written in **PrismPRD**, the sibling tool in this Workshop. The interface was designed in Claude Design, and the tipping research ran in Claude Cowork against published tourism-board and travel-publisher sources. The app is Flutter, built in Claude Code. Live exchange rates come from a free public API with a bundled offline fallback, and Google AdMob supplies the banner. There is no backend at all.

## The rename

It launched as Tip Jar. Weeks later, Apple relayed a trademark claim on behalf of a company holding registered marks on that name in the UK, the US, Canada and via Madrid, publishing a cashless-tipping product of its own. The phrase was plainly descriptive to me and distinctly theirs to them, which is exactly the collision a clearance search exists to catch. I had not run one.

A rename alone would have satisfied the claim. I withdrew the app from both stores instead and relaunched it as Tip Smart, because an Android package name is permanent: `com.diothassystems.tipjar` would have sat in the Play Store URL for the life of the listing. A clean identity meant a new package, new listings, and an install count back at zero. With a few dozen users that was cheap. A year later it would not have been.

**What it taught me.**

- **Clear the name before you build the icon.** The wordmark was in the app icon, the splash, the store graphics and the cross-promo banners. Changing a name touches far more than a string.
- **Store operations are the project, not the paperwork after it.** Signing keys, package identifiers, data-safety declarations, content ratings, ad-network verification — each is small, none is optional, and together they outweighed the build.
- **Some decisions are permanent, so make them deliberately.** A package name cannot be changed after release. Neither, in practice, can a signing key be replaced casually.
- **A screen that explains a permission must not impersonate the one that asks for it.** Borrowing the system dialog's wording, and offering a way around it, is what got the iOS build rejected. Explain, then get out of the way.
- **Static data that looks live is worse than no data.** A hardcoded city beside a "GPS" label confidently told a user in Georgia they were in Texas. The tip was right; the label was not.

**The roadmap.**

- **v1.0**, Android release: 73 countries, 14 service types, bill splitting, live currency conversion *(live on Google Play)*
- **v1.0.2**, iOS release *(live on the App Store, 21 October 2026)*
- **next**, an agent that watches store reviews and turns them into the next set of features

## Where it stands

Both platforms are live under the new name: [Google Play](https://play.google.com/store/apps/details?id=com.diothassystems.tipsmart) and the [App Store](https://apps.apple.com/us/app/tipsmart-like-a-local/id6819130086). iOS landed on 21 October 2026, built and signed on a Mac mini working from the same Git repository as the Windows machine — which, after months of carrying code between the two on a USB stick, was the single change that made the second platform tractable.

It did not go through first time. Apple rejected the build under guideline 5.1.1(iv), and the reason is worth repeating because it is so easy to walk into. The app shows its own screen before asking for location, explaining why it wants it. Good practice. But the button on that screen read **Allow Location Access**, and beside it sat a link to skip the whole thing. Apple reads a pre-permission screen that mimics the system dialog's wording, and offers an exit from it, as steering the answer rather than explaining the question. The button now says **Continue** and the escape hatch is gone on iOS — declining the real prompt still drops you straight into the country picker, so nothing was lost but the nudge.

Next is the review-watching agent: something that reads what people write in the stores and turns it into the next set of changes. There is a certain symmetry to shipping an app built with agents and then pointing an agent at its reviews.

Using the app, or thinking about it? [Support and FAQs](/tip-smart/) answers the common questions and has the contact address.
