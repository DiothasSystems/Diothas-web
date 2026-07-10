---
name: Wi-Fi Validator
subtitle: Your whole home Wi-Fi, optimized.
status: IN DEVELOPMENT
tags: iOS · ANDROID
icon: icon.png
monogram: W
variant: cyan
order: 4
summary: >
  A consumer iOS and Android app that grades how well Wi-Fi reaches every room.
  Walk the house, test each room, get an A–F grade and a recommendation. No
  account, no cloud — everything stays on the device.
draft: false
---

Everyone knows which room the Wi-Fi is bad in. Almost nobody knows *why*, or what to buy to fix it. Wi-Fi Validator turns a vague household complaint into a measurement, a grade, and a specific thing to do about it.

## What it does

You walk your home, room by room. In each one you stand in the middle, run a short signal test, and the app scores the bands it can see and awards the room a grade from **A** to **F**, derived from live signal strength rather than a guess.

Four steps, in order:

**Onboard.** Accept the licence, set up the home. Decline and the app exits — there is no anonymous mode collecting data in the background, because there is no data collection at all.

**Validate.** Pick a floor and a room, stand in the centre, test. Repeat. At least four rooms, up to twelve.

**Review.** A coverage table and a two-dimensional floor-plan map showing where the signal actually goes, which is rarely where people assume it does.

**Act.** Weak rooms produce an extender recommendation with installation help, and the whole report can be emailed to yourself as a styled document.

Nothing syncs. Everything — settings, results, history — lives on the device. The email address you send the report to is used once and never stored.

![Room grade and floor-plan coverage map](<> "Add a screenshot of the review screen to this folder and reference it here.")

## Why it exists

The mesh-and-extender market sells hardware against a problem nobody has measured. A homeowner with a dead spot in the back bedroom is asked to guess at a product tier, buy it, and find out afterwards whether it helped. The diagnosis step is missing entirely, and it is the cheap one.

An app can perform that diagnosis with hardware everyone already carries. The phone in your pocket has a radio that knows precisely how bad the signal is in the room you are standing in. All that was missing was the discipline of walking the house and writing it down — which is exactly the kind of chore software is for.

## How it's being built

*The account below is drawn from the project's own build brief, not from shipped code — this application is still in development.*

Local-first, single binary, no server. The intended stack is Expo with a React Native development build rather than Expo Go, because native Wi-Fi modules have to link. State is a context and reducer over one session object plus a short history; persistence is on-device through AsyncStorage or MMKV, never synced. The floor-plan map is drawn with `react-native-svg`, and an optional pedometer and heading reading can place rooms on it as you walk.

The single biggest technical risk is signal access itself. Android exposes it readily through `WifiManager`. iOS restricts it heavily, and will simply deliver less. The design absorbs this rather than fighting it: one `getSignal()` contract returning `{ ssid, bssid, rssi, band }`, one thin native module per platform behind it, and an explicit allowance in the requirements register for platform-divergent behaviour.

That is the honest shape of the problem. A cross-platform app that pretends both platforms are the same either lies to iOS users or refuses to ship on iOS. This one names the asymmetry in its data layer and lets the product decide what to do about it.

## Where it stands

In development. There is nothing to download yet.
