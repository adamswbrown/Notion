# Personal Operating System - Views

## Overview

Views are the primary interface. The right view at the right time eliminates decision fatigue. Each database has views optimised for different mental states and workflows.

---

## Brain Cache Views

### View 1: Inbox (Table - Default)
- **Layout:** Table
- **Visible columns:** Thought, Source, Type Guess, Captured, Processed
- **Filter:** Processed = unchecked
- **Sort:** Captured descending (newest first)
- **Purpose:** Quick capture review. Process from top down.

### View 2: Stale Items (Table)
- **Layout:** Table
- **Visible columns:** Thought, Source, Type Guess, Days in Cache, Captured
- **Filter:** Stale = true
- **Sort:** Days in Cache descending
- **Purpose:** Weekly cleanup. Decide: process, drop, or accept as irrelevant.

### View 3: All Items (Table)
- **Layout:** Table
- **Visible columns:** Thought, Source, Type Guess, Captured, Processed, Promoted To
- **Filter:** None
- **Sort:** Captured descending
- **Purpose:** Full archive. Searchable reference.

---

## Activation Board Views

### View 1: What Can I Start? (Board - Default)
- **Layout:** Board
- **Group by:** Activation Difficulty
- **Card properties:** Task, Energy Required, Time Estimate, Smallest Next Step, Deadline Pressure
- **Filter:** Status = `Ready`
- **Sort:** Total Friction ascending (lowest friction first within each group)
- **Purpose:** The primary working view. Look at it, pick the leftmost column, start.

### View 2: Full Capacity Day (Table)
- **Layout:** Table
- **Visible columns:** Task, Activation Difficulty, Energy Required, Total Friction, Domain, Time Estimate, Smallest Next Step
- **Filter:** Status = `Ready`
- **Sort:** Total Friction descending (hardest first — eat the frog)
- **Purpose:** When energy is high, tackle high-friction tasks while you can.

### View 3: Low Energy Day (Table)
- **Layout:** Table
- **Visible columns:** Task, Activation Difficulty, Energy Required, Total Friction, Time Estimate, Smallest Next Step
- **Filter:** Status = `Ready` AND Total Friction ≤ 6
- **Sort:** Total Friction ascending
- **Purpose:** When energy is low, only see achievable tasks. No guilt from seeing hard tasks.

### View 4: Recovery Mode (Table)
- **Layout:** Table
- **Visible columns:** Task, Time Estimate, Smallest Next Step
- **Filter:** Status = `Ready` AND Activation Difficulty in (`Trivial (just do it)`, `Low (small push)`) AND Energy Required in (`Minimal`, `Low`)
- **Sort:** Total Friction ascending
- **Purpose:** When barely functional. Only the easiest possible things. No friction visible.

### View 5: Quick Wins (Table)
- **Layout:** Table
- **Visible columns:** Task, Time Estimate, Smallest Next Step, Domain
- **Filter:** Status = `Ready` AND Time Estimate in (`< 5 min`, `5-15 min`) AND Activation Difficulty in (`Trivial (just do it)`, `Low (small push)`)
- **Sort:** Time Estimate ascending
- **Purpose:** Need momentum? Knock out three quick wins to build activation energy.

### View 6: Blocked (Table)
- **Layout:** Table
- **Visible columns:** Task, Blocked By, Domain, Deadline Pressure
- **Filter:** Status = `Blocked`
- **Sort:** Deadline Pressure (TODAY first)
- **Purpose:** Weekly review. Can any blockers be resolved?

### View 7: By Domain (Board)
- **Layout:** Board
- **Group by:** Domain
- **Card properties:** Task, Activation Difficulty, Status, Time Estimate
- **Filter:** Status in (`Ready`, `Active`)
- **Sort:** Total Friction ascending
- **Purpose:** When you want to batch work by area (all admin at once, all personal at once).

### View 8: Deadlines (Table)
- **Layout:** Table
- **Visible columns:** Task, Deadline, Deadline Pressure, Activation Difficulty, Status
- **Filter:** Deadline is not empty AND Status not in (`Done`, `Dropped`)
- **Sort:** Deadline ascending
- **Purpose:** The only time-pressure view. Deliberately separated from the main workflow.

### View 9: Active Now (Table)
- **Layout:** Table
- **Visible columns:** Task, Smallest Next Step, Time Estimate, Started
- **Filter:** Status = `Active`
- **Sort:** Started descending
- **Purpose:** What am I working on right now? Limit to 1-3 items.

### View 10: Done This Week (Gallery)
- **Layout:** Gallery
- **Card properties:** Task, Completed Date, Domain, Total Friction
- **Filter:** Status = `Done` AND Completed Date is within past week
- **Sort:** Completed Date descending
- **Purpose:** Evidence of progress. Look at this when you feel unproductive.

### View 11: Friction Calibration (Table)
- **Layout:** Table
- **Visible columns:** Task, Activation Difficulty, Energy Required, Total Friction, Time Estimate, Actual Duration
- **Filter:** Status = `Done`
- **Sort:** Completed Date descending
- **Purpose:** Compare estimates to actuals. Recalibrate your friction assessments over time.

---

## Energy Schedule Views

### View 1: Today's Map (Table - Default)
- **Layout:** Table
- **Visible columns:** Block Name, Start Time, End Time, Energy Level, Best For, Protect, Assigned Tasks, Transition Before, Transition After
- **Filter:** Day = [current day of week]
- **Sort:** Start Time ascending
- **Purpose:** See today's energy landscape at a glance.

### View 2: Weekly Grid (Table)
- **Layout:** Table
- **Group by:** Day
- **Visible columns:** Block Name, Start Time, End Time, Energy Level, Best For, Protect
- **Sort:** Start Time ascending within each day
- **Purpose:** Full week overview for planning.

### View 3: Peak Windows (Table)
- **Layout:** Table
- **Visible columns:** Block Name, Day, Start Time, End Time, Protect, Assigned Tasks
- **Filter:** Energy Level in (`Peak`, `High`)
- **Sort:** Day then Start Time
- **Purpose:** Identify and protect your most valuable time blocks.

---

## Transition Buffers Views

### View 1: All Transitions (Table - Default)
- **Layout:** Table
- **Visible columns:** Transition, From Context, To Context, Buffer Duration, Buffer Activity, Difficulty, Success Rate
- **Sort:** Difficulty (Hard first)
- **Purpose:** Reference and calibration.

### View 2: Problem Transitions (Table)
- **Layout:** Table
- **Visible columns:** Transition, Buffer Duration, Buffer Activity, Difficulty, Success Rate, Notes
- **Filter:** Success Rate in (`Often Fail`, `Almost Never Manage`)
- **Sort:** Difficulty descending
- **Purpose:** Focus improvement efforts on transitions that consistently fail.

---

## Recovery Tracking Views

### View 1: This Week (Table - Default)
- **Layout:** Table
- **Visible columns:** Date, Morning Energy, Afternoon Energy, Evening Energy, Average Energy, Sleep Quality, Sleep Hours, Tasks Completed, Capacity Assessment, Pattern Tags
- **Filter:** Date Value is within past 7 days
- **Sort:** Date Value descending
- **Purpose:** Current week's pattern.

### View 2: Calendar
- **Layout:** Calendar
- **Date property:** Date Value
- **Card properties:** Average Energy, Capacity Assessment, Tasks Completed
- **Purpose:** Visual energy pattern over time. Spot weekly/monthly cycles.

### View 3: Trend (Table)
- **Layout:** Table
- **Visible columns:** Date, Average Energy, Sleep Quality, Tasks Completed, Highest Friction Completed, Pattern Tags
- **Filter:** Date Value is within past 30 days
- **Sort:** Date Value descending
- **Purpose:** Monthly trend for deeper pattern recognition.

### View 4: Wins Archive (Gallery)
- **Layout:** Gallery
- **Card properties:** Date, Wins, Tasks Completed, Capacity Assessment
- **Filter:** Wins is not empty
- **Sort:** Date Value descending
- **Purpose:** Look at this on bad days. Evidence that you are capable.

---

## Overwhelm Triage Views

### View 1: Triage Now (Board - Default)
- **Layout:** Board
- **Group by:** Urgency
- **Card properties:** Item, Controllable, Smallest Action, Actual Deadline, Consequence of Delay
- **Filter:** Resolved = unchecked
- **Sort:** Urgency (On Fire first)
- **Purpose:** The emergency interface. Use during overwhelm episodes.

### View 2: Not Actually Urgent (Table)
- **Layout:** Table
- **Visible columns:** Item, Urgency, Controllable, Consequence of Delay, Disposition
- **Filter:** Urgency = `Not Actually Urgent` OR Controllable = `Not At All`
- **Sort:** Triage Date descending
- **Purpose:** Reality check. Most things that feel urgent aren't.

### View 3: Resolved (Table)
- **Layout:** Table
- **Visible columns:** Item, Urgency, Disposition, Resolution Notes, Triage Date
- **Filter:** Resolved = checked
- **Sort:** Triage Date descending
- **Purpose:** Evidence that overwhelm passes and things get resolved.

---

## Routines Views

### View 1: Active Routines (Table - Default)
- **Layout:** Table
- **Visible columns:** Routine Name, Type, Frequency, Duration, Current Streak, Last Completed, Difficulty Level
- **Filter:** Status = `Active`
- **Sort:** Type then Frequency
- **Purpose:** Daily reference and streak tracking.

### View 2: Struggling (Table)
- **Layout:** Table
- **Visible columns:** Routine Name, Type, Frequency, Difficulty Level, Current Streak, Notes
- **Filter:** Difficulty Level in (`Needs Effort`, `Struggling`)
- **Sort:** Current Streak ascending
- **Purpose:** Identify routines that need adjustment or decomposition.

### View 3: All Routines (Table)
- **Layout:** Table
- **Visible columns:** All
- **Filter:** None
- **Sort:** Status then Type
- **Purpose:** Full management view.

---

## Dashboard Page Layout

The main Personal OS page should be structured for **minimal decision-making on load.**

### Top Section: Current State
- Callout block: "Today's Capacity: [Full / Reduced / Recovery]" (linked to Recovery Tracking)
- Callout block: "Brain Cache: [X] unprocessed items" (linked database count)

### Section 1: What Can I Do Right Now?
- Linked database: Activation Board → view based on current capacity:
  - Full Capacity → "Full Capacity Day" view
  - Reduced → "Low Energy Day" view
  - Recovery → "Recovery Mode" view
- Show max 10 rows

### Section 2: Today's Energy Map
- Linked database: Energy Schedule → "Today's Map" view

### Section 3: Active Now
- Linked database: Activation Board → "Active Now" view
- Show max 3 rows

### Section 4: Quick Wins Available
- Linked database: Activation Board → "Quick Wins" view
- Show max 5 rows

### Section 5: This Week's Progress
Two columns:
- **Left:** Linked database: Activation Board → "Done This Week" view
- **Right:** Linked database: Recovery Tracking → "This Week" view

### Section 6: Routines
- Linked database: Routines → "Active Routines" view

### Sidebar / Toggle: Emergency Mode
- Toggle block: "Overwhelm? Open this."
  - Link to Overwhelm Triage → "Triage Now" view
  - Breathing exercise prompt (text block)
  - Reminder: "You don't have to do everything. You have to do one small thing."

### Footer: Brain Cache
- Linked database: Brain Cache → "Inbox" view
- Always visible, always accessible for capture
