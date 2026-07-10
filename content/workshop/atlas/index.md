---
name: Atlas
subtitle: Geospatial primitives as a service — geocoding, routing, and tiles behind one clean API.
status: IN DEVELOPMENT
tags: API · SERVICE
liveUrl: https://example.com
liveLabel: Join the waitlist
monogram: A
variant: gold
order: 4
summary: >
  Geospatial primitives as a service — geocoding, routing, and tiles behind
  one clean, fairly-priced API.
draft: false
---

Geospatial infrastructure is a market with two options: a hyperscaler that will bill you into a coma, or an open-source stack that will consume an engineer. Atlas is a third answer, built on the second and priced like a utility.

## What it does

Three primitives behind one key. **Geocoding** — address to coordinate and back, with the messy human-input tolerance that makes the difference between a demo and a product. **Routing** — turn-by-turn and matrix, with traffic-free deterministic mode for anyone doing logistics planning rather than navigation. **Tiles** — vector, styleable, cached at the edge.

## Why it exists

Every application eventually needs to answer *where*, and the moment it does, the team faces a choice between a bill that scales superlinearly with success and a self-hosted stack that scales linearly with headcount. Neither is a good trade for a small team, and the gap is wide enough to build in.

## How it was built

Atlas stands on OpenStreetMap, Valhalla, and Pelias. Almost none of the interesting work is algorithmic — it is operational. Keeping a planet-scale extract fresh, rebuilding routing tiles without a maintenance window, and serving a p99 under fifty milliseconds from a cold cache are the actual problems, and each of them is a systems problem rather than a geospatial one.

The pricing model was designed before the API. Per-request billing punishes exactly the exploratory usage that makes developers adopt a tool, so Atlas prices on sustained throughput with a generous free tier — a decision that constrained the architecture, because it means the cheap path has to be the default path.

## Where it stands

In development, with a waitlist. Geocoding and tiles are running in a private preview; routing is behind them because the tile-rebuild story is not yet good enough to promise an SLA against.
