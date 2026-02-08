# Personal Operating System - Automations

## Overview

Automations designed to reduce decision fatigue, surface the right task at the right time, and catch patterns before burnout hits. Uses Notion native automations where possible, with API-based options for advanced triggers.

---

## Automation 1: Brain Cache → Stale Item Nudge

**Purpose:** Prevent the inbox from becoming a graveyard. Nudge processing of captured items before they lose context.

**Trigger:** Daily (or when viewing Brain Cache)
**Condition:** `Stale` = true (unprocessed items older than 7 days)
**Action:**
- Surface in a filtered view (see views.md: "Stale Items" view)
- **Optional API automation:** Send a daily summary notification listing stale items count.

**Implementation:** Formula-driven view filter. No automation needed for core functionality.

---

## Automation 2: Brain Cache Processing → Activation Board

**Purpose:** When a Brain Cache item is processed and marked as a task, create the corresponding Activation Board entry.

**Trigger:** Property changed in `Brain Cache`
**Condition:** `Processed` = checked AND `Type Guess` = `Task`
**Actions:**
1. Create new page in `Activation Board`:
   - Task: same as Brain Cache Thought title
   - Status: "Ready"
   - Source: link back to Brain Cache item
   - Smallest Next Step: (left blank — must be filled manually, this is intentional friction)

2. Set `Promoted To` on the Brain Cache item to the new Activation Board page

**Implementation:** Notion native automation (Property changed → Create page + Update page)

---

## Automation 3: Routine → Daily Task Generation

**Purpose:** Active routines auto-generate tasks on the Activation Board at their scheduled frequency.

**Trigger:** Daily scheduled check (morning)
**Condition:** Routine `Status` = `Active` AND `Frequency` matches today (Daily = every day, Weekdays = Mon-Fri, etc.)
**Actions:**
1. Create new page in `Activation Board`:
   - Task: "[Routine Name]"
   - Activation Difficulty: "Trivial (just do it)" (routines should be low-friction by design)
   - Energy Required: same as Routine's Energy Required
   - Status: "Ready"
   - Routine: link to source Routine
   - Smallest Next Step: first step from Routine's Steps list

**Implementation:**
- **Option A (Manual):** Use the Routines database as a checklist. Review each morning during Morning Boot Sequence.
- **Option B (API):** Notion API + cron job. Query Routines where Status = Active, match frequency to current day, create Activation Board entries.

---

## Automation 4: Task Completion → Recovery Data

**Purpose:** When tasks are completed, update Recovery Tracking with completion data for pattern analysis.

**Trigger:** Property changed in `Activation Board`
**Condition:** `Status` changed to `Done`
**Actions:**
1. Set `Completed Date` to today
2. Recovery Tracking for today: increment `Tasks Completed` count (handled via rollup — no automation needed if dates align)

**Implementation:** Semi-automatic. The `Completed Date` can be set via Notion native automation. The Recovery Tracking rollup handles the count.

---

## Automation 5: Overwhelm Triage → Activation Board Promotion

**Purpose:** When an overwhelm item is dispositioned as "Do Now" or "Schedule", promote it to the Activation Board.

**Trigger:** Property changed in `Overwhelm Triage`
**Condition:** `Disposition` changed to `Do Now` OR `Schedule`
**Actions:**
1. Create new page in `Activation Board`:
   - Task: same as Overwhelm Triage item title
   - Smallest Next Step: copied from Overwhelm Triage's `Smallest Action`
   - Status: "Ready"
   - Deadline: copied from `Actual Deadline` (if set)
   - Activation Difficulty: (left for manual assessment)
   - Energy Required: (left for manual assessment)

2. Set `Promoted To` on the Overwhelm Triage item
3. Set `Resolved` = checked on the Overwhelm Triage item

**Implementation:** Notion native automation (Property changed → Create page + Update page)

---

## Automation 6: Capacity-Based Task Surfacing

**Purpose:** Match today's capacity to appropriate tasks. On low-energy days, only show low-friction tasks.

**Trigger:** Manual (check Recovery Tracking) or API-based daily
**Condition:** Based on today's `Capacity Assessment` in Recovery Tracking
**Actions:**
- **Full Capacity:** Show all tasks, sorted by Total Friction descending (tackle hard things first)
- **Reduced Capacity:** Filter to Total Friction ≤ 6, sorted by Activation Score ascending (low friction first)
- **Recovery Mode:** Filter to Total Friction ≤ 3, show only Trivial/Low activation tasks

**Implementation:**
- **Option A (Manual):** Three pre-built views on Activation Board (see views.md). Check your energy, pick the right view.
- **Option B (API):** Notion API reads today's Recovery Tracking, returns a filtered task list. Could power a Slack bot or widget.

---

## Automation 7: Streak Tracking for Routines

**Purpose:** Track routine consistency. Increment streak on completion, reset on miss.

**Trigger:** Daily check
**Condition:** For each Active Routine:
- If a linked Activation Board task was completed today → increment `Current Streak`
- If no linked task was completed and Frequency matches today → reset `Current Streak` to 0

**Implementation:**
- **Option A (Manual):** Update streak count during Weekly Reset routine.
- **Option B (API):** Notion API daily cron. Query completed tasks linked to Routines, compare to expected frequency, update streak.

---

## Automation 8: Weekly Digest

**Purpose:** Compile a weekly summary for pattern recognition and calibration.

**Trigger:** Weekly (Sunday evening or Monday morning)
**Condition:** None
**Actions:**
Generate a summary (as a new page in Recovery Tracking or a dedicated Weekly Review database):
- Tasks completed this week (count + list)
- Average energy level
- Most common Pattern Tags
- Highest-friction task completed
- Brain Cache items still unprocessed
- Routines completion rate
- Comparison to previous week

**Implementation:** API-based. Notion API queries multiple databases, compiles data, creates a summary page.

---

## Automation 9: Burnout Early Warning

**Purpose:** Detect declining patterns before full burnout hits.

**Trigger:** Daily check against Recovery Tracking
**Condition:** Any of:
- 3+ consecutive days of Average Energy < 3
- Sleep Quality below "3 - OK" for 3+ days
- Overstimulation "Moderate" or "Severe" for 2+ days
- Tasks Completed trending down for 5+ days
- 0 tasks completed for 2+ days (when not weekend/holiday)

**Actions:**
1. Create entry in Overwhelm Triage:
   - Item: "Burnout Warning: [specific trigger]"
   - Urgency: "Burning (this week)"
   - Controllable: "Partially"
   - Smallest Action: "Review this week's Recovery Tracking. Cancel or defer one commitment. Schedule recovery time."
   - Disposition: (left for manual decision)

**Implementation:** API-based only. Requires querying Recovery Tracking history and detecting trends.

---

## Automation Summary

| Automation | Notion Native | Needs API | Frequency |
|-----------|:---:|:---:|-----------|
| Stale Brain Cache nudge | Formula + view | Optional notification | Continuous |
| Brain Cache → Activation Board | Yes | - | On change |
| Routine → Daily Tasks | Manual view | Yes for auto-generation | Daily |
| Task Completion → Recovery | Partial (rollup) | - | On change |
| Overwhelm → Activation Board | Yes | - | On change |
| Capacity-Based Surfacing | Views only | Yes for auto-switching | Daily |
| Routine Streak Tracking | Manual | Yes for auto-tracking | Daily |
| Weekly Digest | - | Yes | Weekly |
| Burnout Early Warning | - | Yes | Daily |
