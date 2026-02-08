# Personal Operating System - Database Schema

## Overview

Seven interconnected databases forming a mental load management system. The core innovation: tasks are indexed by **activation difficulty**, not priority. Every database is designed to reduce friction between "I should do this" and "I am doing this."

```
Brain Cache ──> Activation Board (promoted when ready)
Activation Board ──> Energy Schedule (slotted by energy match)
Energy Schedule ──> Transition Buffers (between blocks)
Recovery Tracking (independent, feeds Energy Schedule calibration)
Overwhelm Triage (emergency intake from any source)
Routines (repeating sequences, feeds Activation Board)
```

---

## Database 1: Brain Cache

Capture without categorising. Zero-friction inbox. The only rule: get it out of your head.

| Property | Type | Details |
|----------|------|---------|
| Thought | Title | Whatever is in your head — no formatting rules |
| Captured | Created time | Auto-timestamp |
| Source | Select | `Head`, `Meeting`, `Slack/Email`, `Reading`, `Shower Thought`, `Dream`, `Conversation`, `While Working On Something Else` |
| Type Guess | Select | `Task`, `Idea`, `Question`, `Reference`, `Worry`, `Someday`, `Unknown` |
| Processed | Checkbox | Has this been triaged? |
| Promoted To | Relation | → Activation Board (optional, set when processed) |
| Days in Cache | Formula | `dateBetween(now(), prop("Captured"), "days")` |
| Stale | Formula | `if(and(prop("Processed") == false, prop("Days in Cache") > 7), true, false)` |
| Notes | Text | Extra context captured in the moment |

### Design Principles
- No required fields except Title
- No categories, tags, or priorities at capture time
- The `Source` field is optional — helps pattern recognition later ("I always capture tasks while in meetings")
- `Type Guess` is optional and can be wrong — it's a first pass, not a commitment
- Processing happens separately, in a dedicated "triage" session

---

## Database 2: Activation Board

The core innovation. Tasks live here only when they are **activatable** — meaning you could start them right now if you chose to.

| Property | Type | Details |
|----------|------|---------|
| Task | Title | Clear, specific action (verb + object) |
| Activation Difficulty | Select | `Trivial (just do it)`, `Low (small push)`, `Medium (need setup)`, `High (need conditions)`, `Steep (executive function wall)` |
| Activation Score | Formula | `if(prop("Activation Difficulty") == "Trivial (just do it)", 1, if(prop("Activation Difficulty") == "Low (small push)", 2, if(prop("Activation Difficulty") == "Medium (need setup)", 3, if(prop("Activation Difficulty") == "High (need conditions)", 4, 5))))` |
| Energy Required | Select | `Minimal`, `Low`, `Medium`, `High`, `Peak` |
| Energy Score | Formula | `if(prop("Energy Required") == "Minimal", 1, if(prop("Energy Required") == "Low", 2, if(prop("Energy Required") == "Medium", 3, if(prop("Energy Required") == "High", 4, 5))))` |
| Total Friction | Formula | `prop("Activation Score") + prop("Energy Score")` |
| Context | Multi-select | `Computer`, `Phone`, `Out of House`, `Home`, `Office`, `With People`, `Alone`, `Online`, `Offline` |
| Domain | Select | `Work`, `Personal`, `Health`, `Admin`, `Creative`, `Learning`, `Social`, `Maintenance` |
| Status | Select | `Ready`, `Active`, `Blocked`, `Done`, `Dropped` |
| Blocked By | Text | What is preventing activation (only if Status = Blocked) |
| Smallest Next Step | Text | The absolute minimum action to start — "open the file", "write one sentence", "send one message" |
| Time Estimate | Select | `< 5 min`, `5-15 min`, `15-30 min`, `30-60 min`, `1-2 hours`, `Half day`, `Unknown` |
| Deadline | Date | Hard deadline if one exists (most tasks won't have one) |
| Deadline Pressure | Formula | `if(empty(prop("Deadline")), "None", if(dateBetween(prop("Deadline"), now(), "days") <= 1, "TODAY", if(dateBetween(prop("Deadline"), now(), "days") <= 3, "This Week", if(dateBetween(prop("Deadline"), now(), "days") <= 7, "Upcoming", "Distant"))))` |
| Source | Relation | → Brain Cache (where it came from, optional) |
| Routine | Relation | → Routines (if this is a recurring instance) |
| Completed Date | Date | When marked done |
| Completion Notes | Text | What actually happened, how it went |
| Started | Date | When first moved to Active |
| Actual Duration | Formula | `if(and(not empty(prop("Started")), not empty(prop("Completed Date"))), dateBetween(prop("Completed Date"), prop("Started"), "hours"), 0)` |

### Design Principles
- **Activation Difficulty is the primary sort axis**, not priority
- Priority is deliberately absent — it creates anxiety without aiding execution
- "Smallest Next Step" is mandatory thinking — forces decomposition at the point of entry
- Blocked tasks are visible but filtered to a separate view
- `Time Estimate` uses ranges, not precise numbers — precision is false confidence
- `Total Friction` combines activation cost + energy cost into one number for sorting

### Activation Difficulty Guide

| Level | Meaning | Example |
|-------|---------|---------|
| Trivial | No resistance. Could do it on autopilot. | Reply to a yes/no email |
| Low | Small mental push needed. Know exactly what to do. | Write a short Slack message |
| Medium | Need to set up context or gather materials first. | Review a pull request |
| High | Need specific conditions (energy, time, focus, tools). | Write a design document |
| Steep | Executive function wall. Dread or avoidance present. | Start tax return, difficult conversation |

---

## Database 3: Energy Schedule

Maps time blocks to energy levels. Not a calendar — an energy landscape.

| Property | Type | Details |
|----------|------|---------|
| Block Name | Title | Descriptive label for the time block |
| Day | Select | `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday` |
| Start Time | Text | e.g. "09:00" (using text, not date, for simplicity) |
| End Time | Text | e.g. "11:30" |
| Duration (min) | Number | Length in minutes |
| Energy Level | Select | `Peak`, `High`, `Medium`, `Low`, `Recovery` |
| Best For | Multi-select | `Deep Work`, `Communication`, `Admin`, `Creative`, `Physical`, `Learning`, `Meetings`, `Nothing` |
| Protect | Checkbox | Is this block non-negotiable? |
| Transition Before | Select | `None`, `5 min`, `10 min`, `15 min`, `30 min` |
| Transition After | Select | `None`, `5 min`, `10 min`, `15 min`, `30 min` |
| Notes | Text | Context — what tends to work in this block, what doesn't |
| Assigned Tasks | Relation | → Activation Board (tasks slotted into this block) |

### Default Template (Adjustable)

| Block | Time | Energy | Best For |
|-------|------|--------|----------|
| Morning Boot | 07:00-08:00 | Low | Routine, nothing demanding |
| Peak Window 1 | 09:00-11:00 | Peak | Deep Work |
| Mid-Morning | 11:00-12:00 | High | Communication, Meetings |
| Post-Lunch | 13:00-14:00 | Low | Admin, Light tasks |
| Afternoon Build | 14:00-16:00 | Medium-High | Creative, Learning |
| Late Afternoon | 16:00-17:30 | Medium | Communication, Wrap-up |
| Evening | 19:00-21:00 | Varies | Personal, Learning |

---

## Database 4: Transition Buffers

Structured decompression between context switches. The invisible productivity killer that nobody tracks.

| Property | Type | Details |
|----------|------|---------|
| Transition | Title | "From [X] → To [Y]" |
| From Context | Select | `Deep Work`, `Meeting`, `Communication`, `Admin`, `Break`, `Commute`, `Exercise`, `Social`, `Creative` |
| To Context | Select | (same options as From) |
| Buffer Duration (min) | Number | How many minutes needed |
| Buffer Activity | Multi-select | `Walk`, `Water/Tea`, `Breathing`, `Journaling`, `Music`, `Silence`, `Stretching`, `Phone Break`, `Nothing` |
| Difficulty | Select | `Easy`, `Moderate`, `Hard` |
| Notes | Text | What works and what doesn't for this transition |
| Success Rate | Select | `Usually Fine`, `Sometimes Struggle`, `Often Fail`, `Almost Never Manage` |

### Default Transitions (Pre-populated)

| From | To | Buffer | Activity | Difficulty |
|------|----|--------|----------|------------|
| Deep Work | Meeting | 10 min | Walk, Water | Moderate |
| Meeting | Deep Work | 15 min | Silence, Breathing | Hard |
| Deep Work | Deep Work (new topic) | 5 min | Stretching | Easy |
| Social | Deep Work | 20 min | Silence, Walk | Hard |
| Commute | Work | 10 min | Tea, Settle | Moderate |
| Work | Personal | 15 min | Walk, Change Context | Moderate |
| Screen Time | Sleep | 30 min | Reading, Stretching | Hard |

---

## Database 5: Recovery Tracking

Track energy, capacity, and recovery patterns over time. Feeds back into Energy Schedule accuracy.

| Property | Type | Details |
|----------|------|---------|
| Date | Title | Date as title (one entry per day) |
| Date Value | Date | Actual date for calendar view |
| Morning Energy | Select | `1 - Depleted`, `2 - Low`, `3 - Moderate`, `4 - Good`, `5 - Peak` |
| Afternoon Energy | Select | (same scale) |
| Evening Energy | Select | (same scale) |
| Average Energy | Formula | Average of the three energy scores (mapped from select values) |
| Sleep Quality | Select | `1 - Terrible`, `2 - Poor`, `3 - OK`, `4 - Good`, `5 - Excellent` |
| Sleep Hours | Number | Hours slept |
| Exercise | Checkbox | Did physical activity happen? |
| Social Drain | Select | `None`, `Light`, `Moderate`, `Heavy`, `Overwhelming` |
| Overstimulation | Select | `None`, `Mild`, `Moderate`, `Severe` |
| Tasks Completed | Rollup | Count of Activation Board tasks completed on this date |
| Highest Friction Completed | Rollup | Max Total Friction of completed tasks on this date |
| Capacity Assessment | Formula | Based on Average Energy + Sleep Quality: `if(prop("Average Energy") >= 4 and prop("Sleep Quality") >= "4 - Good", "Full Capacity", if(prop("Average Energy") >= 3, "Reduced Capacity", "Recovery Mode"))` |
| Notes | Text | What happened, what affected energy, what to remember |
| Wins | Text | What went well — evidence for future low days |
| Pattern Tags | Multi-select | `Monday Slump`, `Post-Social Crash`, `Hyperfocus Day`, `Burnout Signal`, `Recovery Day`, `High Output`, `Context Switch Heavy` |

---

## Database 6: Overwhelm Triage

Emergency intake system. When everything feels like too much, this is the single entry point.

| Property | Type | Details |
|----------|------|---------|
| Item | Title | What is overwhelming you right now |
| Urgency | Select | `On Fire (today)`, `Burning (this week)`, `Smouldering (soon)`, `Background Worry`, `Not Actually Urgent` |
| Controllable | Select | `Fully`, `Partially`, `Not At All` |
| Smallest Action | Text | The tiniest possible thing you could do about this right now |
| Actual Deadline | Date | The real deadline (if any — most things don't have one) |
| Consequence of Delay | Text | What actually happens if you don't do this today? Be honest. |
| Disposition | Select | `Do Now`, `Schedule`, `Delegate`, `Defer`, `Drop`, `Accept (can't change)` |
| Promoted To | Relation | → Activation Board (if it becomes a real task) |
| Resolved | Checkbox | Is this handled? |
| Resolution Notes | Text | What happened |
| Triage Date | Created time | When this was captured |

### Triage Workflow

The Overwhelm Triage is designed to be used in a specific sequence:

1. **Dump everything** — Write every item that is weighing on you. No filtering.
2. **Urgency sort** — For each item, honestly assess urgency.
3. **Controllability check** — Can you actually affect this?
4. **Smallest action** — For controllable items, what is the tiniest step?
5. **Consequence check** — What actually happens if you delay?
6. **Disposition** — Decide: do, schedule, delegate, defer, drop, or accept.
7. **Promote** — Move the "Do Now" items to the Activation Board with smallest next step pre-filled.

---

## Database 7: Routines

Repeating sequences that run on autopilot once established. Reduces daily decision load.

| Property | Type | Details |
|----------|------|---------|
| Routine Name | Title | Name of the routine |
| Type | Select | `Morning`, `Evening`, `Work Start`, `Work End`, `Weekly`, `Monthly`, `Transition`, `Recovery` |
| Frequency | Select | `Daily`, `Weekdays`, `Weekends`, `Weekly`, `Fortnightly`, `Monthly`, `As Needed` |
| Steps | Text | Ordered sequence of actions (numbered list) |
| Duration (min) | Number | Total time this routine takes |
| Energy Required | Select | `Minimal`, `Low`, `Medium` (routines should never be High/Peak) |
| Activation Cue | Text | What triggers this routine? (time, event, location, feeling) |
| Current Streak | Number | How many consecutive completions |
| Last Completed | Date | When last done |
| Status | Select | `Active`, `Building`, `Paused`, `Retired` |
| Difficulty Level | Select | `Automatic`, `Easy`, `Needs Effort`, `Struggling` |
| Notes | Text | What helps, what breaks the routine, adjustments made |
| Generated Tasks | Relation | → Activation Board (tasks created from this routine) |

### Default Routines (Pre-populated)

**Morning Boot Sequence**
1. Water + medication (if applicable)
2. Check calendar — what's the shape of today?
3. Review Activation Board — pick 1-3 tasks for today
4. Set transition buffer for first context switch
5. Start first task (or start routine work)

**Work Shutdown**
1. Log what was done today (Activation Board → Done)
2. Capture anything lingering → Brain Cache
3. Check tomorrow's calendar
4. Set one intention for tomorrow morning
5. Close all work apps

**Weekly Reset (Sunday/Monday)**
1. Process Brain Cache → triage all unprocessed items
2. Review Activation Board → drop or defer stale items
3. Check upcoming deadlines
4. Log Recovery Tracking for the week
5. Adjust Energy Schedule if patterns shifted
6. Set 3 intentions for the week

---

## Relation Map

```
Brain Cache ───promotes to──→ Activation Board
Overwhelm Triage ───promotes to──→ Activation Board
Routines ───generates──→ Activation Board

Activation Board ───assigned to──→ Energy Schedule
Recovery Tracking ───informs──→ Energy Schedule (manual calibration)
Transition Buffers ───scheduled between──→ Energy Schedule blocks
```

---

## Core Formulas Summary

| Database | Formula | Purpose |
|----------|---------|---------|
| Brain Cache | Days in Cache | Spot items rotting in inbox |
| Brain Cache | Stale | Flag unprocessed items > 7 days |
| Activation Board | Activation Score | Numeric version of difficulty for sorting |
| Activation Board | Energy Score | Numeric version of energy for sorting |
| Activation Board | Total Friction | Combined activation + energy cost |
| Activation Board | Deadline Pressure | Time-based urgency (not priority) |
| Activation Board | Actual Duration | How long tasks really take (calibration data) |
| Energy Schedule | (via views) | Match task energy to block energy |
| Recovery Tracking | Average Energy | Daily energy trend |
| Recovery Tracking | Capacity Assessment | Am I at full/reduced/recovery capacity? |
