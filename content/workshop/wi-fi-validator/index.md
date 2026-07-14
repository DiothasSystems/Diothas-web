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

Everyone knows which room the Wi-Fi is bad in. Almost nobody knows *why*, or what to buy to fix it. Wi-Fi Validator turns that vague complaint into a measurement: walk the house, run a quick signal test in each room, and every room earns an A–F grade with a specific fix for the weak ones. No account, no cloud — everything stays on the device. It is still in development, so this page is mostly about how it is being built.

## How it's being built

*The account below is drawn from the project's own build brief, not from shipped code — this application is still in development.*

Local-first, single binary, no server. The intended stack is Expo with a React Native development build rather than Expo Go, because native Wi-Fi modules have to link. State is a context and reducer over one session object plus a short history; persistence is on-device through AsyncStorage or MMKV, never synced. The floor-plan map is drawn with `react-native-svg`, and an optional pedometer and heading reading can place rooms on it as you walk.

The single biggest technical risk is signal access itself. Android exposes it readily through `WifiManager`. iOS restricts it heavily, and will simply deliver less. The design absorbs this rather than fighting it: one `getSignal()` contract returning `{ ssid, bssid, rssi, band }`, one thin native module per platform behind it, and an explicit allowance in the requirements register for platform-divergent behaviour.

That is the honest shape of the problem. A cross-platform app that pretends both platforms are the same either lies to iOS users or refuses to ship on iOS. This one names the asymmetry in its data layer and lets the product decide what to do about it.

## Where it stands

In development. There is nothing to download yet.
