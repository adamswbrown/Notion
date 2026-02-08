# Customer Engagement Control Tower - Views

## Overview

Each database has multiple views configured for different contexts. Views define the layout (table, board, calendar, gallery), visible properties, filters, sorts, and groupings.

---

## Accounts Views

### View 1: Account Overview (Table - Default)
- **Layout:** Table
- **Visible columns:** Account Name, Industry, Account Tier, Relationship Status, Active Engagements, Total Revenue, Health, Days Since Contact
- **Sort:** Health (Needs Attention first), then Account Tier (Strategic first)
- **Filter:** Relationship Status is not `Churned`

### View 2: Accounts by Tier (Board)
- **Layout:** Board
- **Group by:** Account Tier
- **Card properties:** Account Name, Relationship Status, Active Engagements, Health
- **Filter:** Relationship Status = `Active`

### View 3: Needs Attention (Table)
- **Layout:** Table
- **Visible columns:** Account Name, Days Since Contact, Health, Primary Contact, Active Engagements
- **Filter:** Health = `Needs Attention`
- **Sort:** Days Since Contact descending

### View 4: Revenue Summary (Table)
- **Layout:** Table
- **Visible columns:** Account Name, Account Tier, Total Revenue, Active Engagements, Relationship Status
- **Sort:** Total Revenue descending
- **Filter:** Relationship Status is not `Prospect`

---

## Engagements Views

### View 1: Active Engagements (Board - Default)
- **Layout:** Board
- **Group by:** Status
- **Card properties:** Engagement Name, Account, Type, Value, Days to End, Budget Burn
- **Filter:** Status is not `Closed`
- **Sort:** End Date ascending (soonest first)

### View 2: Pipeline (Table)
- **Layout:** Table
- **Visible columns:** Engagement Name, Account, Type, Status, Value, Start Date, End Date, Days to End, Budget Burn, Renewal Flag
- **Sort:** End Date ascending
- **Filter:** None

### View 3: Renewal Radar (Table)
- **Layout:** Table
- **Visible columns:** Engagement Name, Account, Value, End Date, Days to End, Renewal Flag, Budget Burn
- **Filter:** Renewal Flag is not empty
- **Sort:** Days to End ascending

### View 4: By Account (Table)
- **Layout:** Table
- **Group by:** Account
- **Visible columns:** Engagement Name, Type, Status, Value, Start Date, End Date
- **Sort:** Start Date descending

### View 5: Timeline (Timeline)
- **Layout:** Timeline
- **Date property:** Start Date → End Date
- **Visible properties:** Engagement Name, Account, Status
- **Filter:** Status is not `Closed`

---

## Calls / Meetings Views

### View 1: Upcoming (Table - Default)
- **Layout:** Table
- **Visible columns:** Meeting Title, Engagement, Date, Type, Status, Follow-up Date, Follow-up Done
- **Filter:** Date >= today AND Status != `Cancelled`
- **Sort:** Date ascending

### View 2: Calendar
- **Layout:** Calendar
- **Date property:** Date
- **Card properties:** Meeting Title, Engagement, Type
- **Filter:** Status != `Cancelled`

### View 3: Follow-ups Due (Table)
- **Layout:** Table
- **Visible columns:** Meeting Title, Engagement, Date, Follow-up Date, Follow-up Done
- **Filter:** Follow-up Done = unchecked AND Follow-up Date <= today
- **Sort:** Follow-up Date ascending

### View 4: By Engagement (Table)
- **Layout:** Table
- **Group by:** Engagement
- **Visible columns:** Meeting Title, Date, Type, Status, Action Items
- **Sort:** Date descending

---

## Deliverables Views

### View 1: Active Work (Board - Default)
- **Layout:** Board
- **Group by:** Status
- **Card properties:** Deliverable, Engagement, Type, Priority, Due Date, Assigned To, Overdue
- **Filter:** Status is not `Accepted`
- **Sort:** Priority (Critical first), then Due Date ascending

### View 2: Overdue (Table)
- **Layout:** Table
- **Visible columns:** Deliverable, Engagement, Type, Priority, Due Date, Assigned To, Status
- **Filter:** Overdue = true
- **Sort:** Due Date ascending (most overdue first)
- **Highlight:** Row colour red

### View 3: By Engagement (Table)
- **Layout:** Table
- **Group by:** Engagement
- **Visible columns:** Deliverable, Type, Status, Priority, Due Date, Completed Date
- **Sort:** Due Date ascending

### View 4: My Work (Table)
- **Layout:** Table
- **Visible columns:** Deliverable, Engagement, Type, Status, Priority, Due Date
- **Filter:** Assigned To = current user AND Status is not `Accepted`
- **Sort:** Priority then Due Date

---

## Risks & Blockers Views

### View 1: Open Risks (Board - Default)
- **Layout:** Board
- **Group by:** Severity
- **Card properties:** Risk, Engagement, Type, Likelihood, Risk Score, Owner
- **Filter:** Status is not `Resolved` AND Status is not `Accepted`
- **Sort:** Risk Score descending

### View 2: Risk Register (Table)
- **Layout:** Table
- **Visible columns:** Risk, Engagement, Type, Severity, Likelihood, Risk Score, Status, Owner, Raised Date
- **Sort:** Risk Score descending
- **Filter:** None

### View 3: By Engagement (Table)
- **Layout:** Table
- **Group by:** Engagement
- **Visible columns:** Risk, Type, Severity, Status, Owner
- **Sort:** Risk Score descending

---

## Commercials Views

### View 1: Financial Overview (Table - Default)
- **Layout:** Table
- **Visible columns:** Item, Engagement, Type, Status, Value, Date Raised, Date Due, Invoice Reference, Overdue
- **Sort:** Date Due ascending
- **Filter:** None

### View 2: Outstanding (Table)
- **Layout:** Table
- **Visible columns:** Item, Engagement, Value, Date Due, Status, Overdue
- **Filter:** Status not in (`Paid`, `Cancelled`)
- **Sort:** Date Due ascending

### View 3: Revenue by Engagement (Table)
- **Layout:** Table
- **Group by:** Engagement
- **Visible columns:** Item, Type, Value, Status, Date Closed
- **Sort:** Date Raised descending

### View 4: Overdue Payments (Table)
- **Layout:** Table
- **Visible columns:** Item, Engagement, Value, Date Due, Status, Invoice Reference
- **Filter:** Overdue = true
- **Sort:** Date Due ascending

---

## Stakeholders Views

### View 1: Stakeholder Map (Board - Default)
- **Layout:** Board
- **Group by:** Influence Level
- **Card properties:** Name, Account, Role, Sentiment, Last Contact
- **Sort:** Sentiment (Champion first)

### View 2: By Account (Table)
- **Layout:** Table
- **Group by:** Account
- **Visible columns:** Name, Role, Influence Level, Sentiment, Last Contact, Communication Preference
- **Sort:** Influence Level

### View 3: Engagement Risk (Table)
- **Layout:** Table
- **Visible columns:** Name, Account, Role, Influence Level, Sentiment, Last Contact
- **Filter:** Sentiment in (`Resistant`, `Hostile`)
- **Sort:** Influence Level (Decision Maker first)

---

## Dashboard Page Layout

The main Control Tower page should be structured as follows:

### Top Section: Quick Stats (Callout blocks)
- Total active engagements (linked database count)
- Revenue this quarter (rollup)
- Overdue deliverables count
- Accounts needing attention count

### Section 1: Accounts Needing Attention
- Linked database: Accounts → "Needs Attention" view
- Show max 5 rows

### Section 2: Active Engagements
- Linked database: Engagements → "Active Engagements" board view

### Section 3: This Week
Two columns:
- **Left:** Linked database: Calls/Meetings → "Upcoming" view (filtered to this week)
- **Right:** Linked database: Deliverables → "Overdue" view

### Section 4: Renewal Radar
- Linked database: Engagements → "Renewal Radar" view

### Section 5: Open Risks
- Linked database: Risks & Blockers → "Open Risks" board view

### Section 6: Financials
- Linked database: Commercials → "Outstanding" view
