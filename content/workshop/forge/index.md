---
name: Forge
subtitle: An internal developer portal you can stand up in a weekend.
status: BETA
tags: WEB · OPEN SOURCE
liveUrl: https://example.com
liveLabel: View on GitHub
monogram: F
variant: cyan
order: 3
summary: >
  An internal developer portal you can stand up in a weekend — service catalog,
  scorecards, golden paths.
draft: false
---

Every company above about forty engineers builds a service catalog. Almost all of them build it twice, because the first one was a spreadsheet and the second one was a six-month platform project. Forge is the thing in between.

## What it does

Three surfaces. A **service catalog** that discovers itself from repository metadata rather than asking humans to maintain a registry. **Scorecards** that grade each service against standards you define — has an owner, has a runbook, has alerts wired to a rotation. And **golden paths**: templated repositories that start life already passing the scorecard.

![Forge scorecard view](<> "Scorecards, showing per-service compliance. Add a screenshot to this folder.")

## Why it exists

The alternative on the market is excellent and enormous. Standing it up is itself a platform project, which is precisely the thing a forty-engineer company cannot spare a quarter for. Forge is the deliberately smaller answer to the question the big tool answers well but expensively.

## How it was built

The discovery layer is the whole product. Forge reads a small `service.yaml` from each repository and derives everything else — ownership from CODEOWNERS, health from the CI status API, on-call from the paging provider. Nothing is entered twice, because a catalog that requires manual upkeep is a catalog that is wrong by the second month.

The scorecard engine was rewritten once, from imperative checks to declarative rules, after the first version made it impossible to explain to a team *why* they had scored badly. Explainability turned out to be a load-bearing feature, not a nicety: a score you cannot argue with is a score nobody acts on.

## Where it stands

Beta, and open source. The rules engine is stable; the golden-path templates are still opinionated toward the stacks we happen to use, which is the main thing keeping this from a 1.0.
