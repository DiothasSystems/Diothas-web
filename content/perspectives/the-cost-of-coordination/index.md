---
title: "The Cost of Coordination: Why Your Org Chart Is Your Architecture"
subtitle: Conway's Law isn't a warning, it's a design tool.
category: "ORG DESIGN"
author: DIOTHAS SYSTEMS
date: 2026-06-14
readTime: 14
summary: >
  Conway's Law isn't a warning, it's a design tool. How to draw team
  boundaries that produce the system you actually want, instead of the one
  your reporting lines accidentally encode.
draft: true
---

Every system your organization ships is a mirror. Look closely at its seams, the APIs, the handoffs, the places where two services meet awkwardly, and you will find the outline of your org chart, reflected back with unsettling fidelity.

## The law you cannot repeal

Conway observed it in 1967: organizations design systems that copy their own communication structures. Most leaders treat this as a curiosity. The better ones treat it as a constraint to design around. The best treat it as a lever, the cheapest, most powerful architectural instrument they own.

If two teams must coordinate every week to ship, the boundary between their systems will be chatty, brittle, and expensive. If they almost never need to speak, the boundary will be clean, because it has to be. Team boundaries are interface contracts, whether you write them down or not.

![Diagram: team boundaries vs. system boundaries](<> "Fig. 1, Communication paths become system seams. Drop a diagram in this folder and reference it here to replace this placeholder.")

## Designing the inverse

The practical move is the inverse maneuver: decide the architecture you want, then draw the teams that would naturally produce it. Want a stable platform with crisp product surfaces on top? You need a platform team with real customers, a roadmap, and the authority to say no, not a shared pool of infrastructure labor that every product team can raid.

> You are always doing org design and systems architecture at the same time. The only question is whether you are doing them on purpose.

This is also why reorgs are so expensive, and why they so rarely feel worth it. A reorg is a migration, of interfaces, of ownership, of accumulated context, performed on the highest-latency hardware you own: people. Budget for it the way you would budget for a database migration, and be equally suspicious of anyone who proposes one casually.

## What to do on Monday

Map your system seams against your team seams and look for the mismatches. Every place two teams co-own a component, expect drift. Every place one team owns two loosely-related systems, expect one of them to be quietly starving. Fix the ownership first; the architecture will follow it, it always does.
