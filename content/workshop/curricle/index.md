---
name: Curricle
subtitle: One shared itinerary for the whole family.
status: BETA
tags: ANDROID · iOS · WEB
liveUrl: https://app.curricle.app
liveLabel: Open the web app
icon: icon.png
monogram: C
variant: cyan
order: 6
summary: >
  Forward a flight, hotel, dinner or ticket confirmation and it lands on a
  shared calendar. One itinerary for the whole family, with reminders timed to
  each reservation and an invitation for everyone who is coming.
draft: false
---

Every family trip has one person who planned it, and everyone else asks that person what time dinner is. Curricle is meant to end the asking. Forward the confirmation emails (flights, hotels, dinners, tickets) to a trip's own address, and each one lands on a shared itinerary the whole family can open on a phone or in a browser, with a reminder timed to each booking. Share the trip, and everyone sees the same plan. This page is about how it was built, and about how hard it was to find a name.

## How it was built

Curricle started with our own family vacations. I planned them, and nobody else could remember what we were doing or when; the answer was always buried in my inbox. The confirmations already said everything that mattered. They just needed to land somewhere everyone could see, in the order they would happen.

**The name.** Finding one was harder than building the first screen. The travel and itinerary space is crowded, and every obvious word (trip, journey, itinerary, voyage, planner) is already taken, usually several times over, in the stores, in domain names, or in someone's trademark filing. After [Tip Smart](/workshop/tip-smart/), I wasn't going to build an icon around a name I hadn't cleared. Curricle comes from [*The Diothas*](https://www.amazon.com/Diothas-Far-Look-Ahead/dp/1167296753?crid=1L053K7ECEA9U&dib=eyJ2IjoiMSJ9.teobE86BHwHgdWYaFMdkasUsUOWjII0J4uDRaQN32WCRwf8qnWSFcdR7ztBv2xHzKxAkqTQVxztrjkXz5X4r3NCtoB6oD_Bg6K-GRhzBWrI.pfR1Xeo6eZFmhtEpBian7h1e1XLRKL6MmteYZf9ZPz8&dib_tag=se&keywords=the+diothas&qid=1784388474&sprefix=the+diothas%2Caps%2C256&sr=8-2&linkCode=ll2&tag=diothassystem-20&linkId=81074232b65211b8abfb375a3cb56060&language=en_US&ref_=as_li_ss_tl), John Macnie's 1883 novel of the far future and the book this studio takes its name from. Its narrator, travelling through a much later century, is carried down smooth, silent roads, in a lane reserved for them, in a light personal vehicle he calls a curricle, "as I may freely render the native appellation of our vehicle." A light vehicle that carries the family through the trip felt right, and nobody else in the space was using it.

![A steampunk curricle: a brass travelling machine with a globe compass, strapped luggage, and an unrolling itinerary of flights, hotels, dinners and sights.](images/curricle-machine.jpg "The curricle, in the Workshop's idiom: a light vehicle that carries the whole family through the trip, itinerary unrolling as it goes.")

**New ground: email and a database.** In earlier Workshop projects, mail and data were supporting parts. In Curricle they are the product.

- **Email.** Every calendar gets its own forwarding address. Inbound mail is received on the app's own domain and read in layers: calendar files first, then the booking markup airlines and hotels embed, and only then a language model for the rest. The same domain sends the branded invitations, sign-in codes and replies.
- **The database.** It decides who sees what. Row-level rules mean each person reads only the calendars shared with them, with view, add or delete access. Retention is automatic: a trip disappears a year after it ends, and ratings are kept for five years.

**Hand-offs.** Curricle does less on its own by handing off to what the phone already does well:

- Tap an address, and the maps app takes you there from wherever you are.
- Reminders are local notifications, timed by the type of booking and sent earlier when you're far away, with the distance worked out on the phone; your location never leaves it.
- Face ID or a fingerprint signs you in.
- An invitation email opens the app straight to the trip.
- A feature request or problem report opens your own mail app, already addressed and filled in.

**The stack.** The app is Expo and React Native, one codebase for Android, iOS and the web app at [app.curricle.app](https://app.curricle.app), built in Claude Code: on Windows for Android and the web, and on a Mac mini for iOS. Supabase provides the Postgres database, sign-in and server functions. Resend receives and sends the email. Claude Haiku reads confirmations that carry no machine-readable booking data. Google AdMob supplies the banner. Hostinger hosts curricle.app, the web app and an operations portal with its own feedback inbox.

## The store

The local prototype came together quickly. Getting it through the stores took about twice as long as building it. That's the same ratio Tip Smart taught me, and this time I expected it, which helped less than I'd hoped. A lot was learned along the way:

- **Reviewers need a real account with a life in it.** An empty calendar doesn't demonstrate anything, so the review account gets a family, three trips and a few ratings, reseeded before every submission.
- **Every link in the app is part of the review.** The in-app privacy link pointed at a page that had never been published. Nothing in the build would have caught it.
- **Test ads in every build except the one that ships.** Promoting a tested build to production doesn't rebuild it, so a build made with test ads stays a test-ad build forever.
- **Build numbers only go up.** Failed attempts still spend a number, and the free build allowance can run out halfway through a release.
- **Two machines means two branches.** Work on the Mac and on Windows drifted apart without anyone noticing until it was merged, including one feature built twice.
- **The store reads your binary.** Google's pre-launch report flagged unoptimized code; turning on code shrinking cut it from 54.7 MB to 22.5 MB.

## What it taught me

**Clear the name before anything else.** It cost real time up front, and it was cheaper than a rename later.

**The data you hold is a promise.** Family itineraries are personal. Deciding what to keep, for how long, and who can see it shaped the database more than any feature did.

**Hand off instead of rebuilding.** Maps, mail, notifications and biometrics already work on every phone. The app is better for borrowing them.

**Store operations are still the project.** Accounts, declarations, reviewers, build numbers and ad settings together outweighed the prototype again.

**The roadmap.**

- **v1.0**, Android release on Google Play
- **v1.0**, iOS release on the App Store
- **v1.1**, turning the feedback inbox into the next set of changes

## Where it stands

The web app is live at [app.curricle.app](https://app.curricle.app). The Android release is with Google Play, and the iOS build is being prepared for TestFlight and the App Store.
