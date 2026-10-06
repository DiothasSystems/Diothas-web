---
name: Wi-Fi Validator
subtitle: Your whole home Wi-Fi, optimized.
status: LIVE
tags: ANDROID
liveUrl: https://play.google.com/store/apps/details?id=com.diothassystems.wifivalidator
liveLabel: Get it on Google Play
icon: icon.png
monogram: W
variant: cyan
order: 4
summary: >
  A consumer Android app that grades how well Wi-Fi reaches every room. Walk
  the house, test each room, get an A–F grade and a recommendation. No
  account, no cloud; everything stays on the device.
draft: false
---

Everyone knows which room the Wi-Fi is bad in. Almost nobody knows *why*, or what to buy to fix it. Wi-Fi Validator turns that vague complaint into a measurement: walk the house, run a quick signal test in each room, and every room earns an A–F grade with a specific fix for the weak ones. No account, no cloud; everything stays on the device. This page is about how it was built.

## How it was built

*The account below is drawn from the project's own build brief.*

Local-first, single binary, no server. The intended stack is Expo with a React Native development build rather than Expo Go, because native Wi-Fi modules have to link. State is a context and reducer over one session object plus a short history; persistence is on-device through AsyncStorage or MMKV, never synced. The floor-plan map is drawn with `react-native-svg`, and an optional pedometer and heading reading can place rooms on it as you walk.

The single biggest technical risk is signal access itself. Android exposes it readily through `WifiManager`. iOS restricts it heavily, and will simply deliver less. The design absorbs this rather than fighting it: one `getSignal()` contract returning `{ ssid, bssid, rssi, band }`, one thin native module per platform behind it, and an explicit allowance in the requirements register for platform-divergent behaviour.

That is the honest shape of the problem. A cross-platform app that pretends both platforms are the same either lies to iOS users or refuses to ship on iOS. This one named the asymmetry in its data layer, and in the end the product made the call the data layer predicted: ship where the measurement is real.

## Where it stands

The Android app is live on [Google Play](https://play.google.com/store/apps/details?id=com.diothassystems.wifivalidator). There are no plans for an iOS version: the signal access the whole product depends on is exactly what iOS restricts.
