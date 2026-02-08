# Customer Engagement Control Tower - Database Schema

## Overview

Seven interconnected databases forming a post-sale execution OS. The relational model connects companies to engagements, engagements to all operational activity, and commercials track the money.

```
Accounts ──< Engagements ──< Calls/Meetings
                          ──< Deliverables
                          ──< Risks & Blockers
                          ──< Commercials
         ──< Stakeholders
```

---

## Database 1: Accounts

The company-level record. One row per client organisation.

| Property | Type | Details |
|----------|------|---------|
| Account Name | Title | Company name |
| Industry | Select | `Technology`, `Finance`, `Healthcare`, `Government`, `Manufacturing`, `Professional Services`, `Retail`, `Other` |
| Account Tier | Select | `Strategic`, `Growth`, `Standard` |
| Primary Contact | Text | Name + email of main point of contact |
| Website | URL | Company website |
| Relationship Status | Select | `Prospect`, `Active`, `On Hold`, `Churned`, `Alumni` |
| Account Owner | Person | Your team member who owns this account |
| Notes | Text | Freeform context |
| Engagements | Relation | → Engagements database (one-to-many) |
| Stakeholders | Relation | → Stakeholders database (one-to-many) |
| Total Revenue | Rollup | Sum of `Value` from related Engagements |
| Active Engagements | Rollup | Count of Engagements where Status = `In Progress` |
| Last Activity | Rollup | Latest `Date` from related Calls/Meetings (via Engagements) |
| Days Since Contact | Formula | `dateBetween(now(), prop("Last Activity"), "days")` |
| Health | Formula | `if(prop("Days Since Contact") > 14, "Needs Attention", if(prop("Days Since Contact") > 7, "Monitor", "Healthy"))` |

---

## Database 2: Engagements

One row per project/engagement. An account can have many engagements.

| Property | Type | Details |
|----------|------|---------|
| Engagement Name | Title | Project or engagement name |
| Account | Relation | → Accounts database (many-to-one) |
| Type | Select | `Discovery`, `Assessment`, `Implementation`, `Advisory`, `Retainer`, `Training` |
| Status | Select | `Scoping`, `In Progress`, `On Hold`, `Delivered`, `Closed` |
| Start Date | Date | Engagement start |
| End Date | Date | Engagement end or expected end |
| Value | Number | Contract value (£) — format: currency |
| Billing Model | Select | `Fixed Price`, `Time & Materials`, `Retainer`, `Day Rate` |
| Day Rate | Number | If applicable (£) |
| Estimated Days | Number | Total estimated effort |
| Days Used | Rollup | Count of completed Deliverables (or sum of logged days) |
| Budget Burn | Formula | `if(prop("Estimated Days") > 0, round(prop("Days Used") / prop("Estimated Days") * 100), 0)` — displays as % |
| Days to End | Formula | `dateBetween(prop("End Date"), now(), "days")` |
| Renewal Flag | Formula | `if(prop("Days to End") <= 30 and prop("Days to End") > 0, "Renewal Window", if(prop("Days to End") <= 0, "Expired", ""))` |
| Calls | Relation | → Calls/Meetings database (one-to-many) |
| Deliverables | Relation | → Deliverables database (one-to-many) |
| Risks | Relation | → Risks & Blockers database (one-to-many) |
| Commercials | Relation | → Commercials database (one-to-many) |
| Scope Summary | Text | What was agreed |
| Success Criteria | Text | How the client defines success |
| Internal Notes | Text | Private notes not shared with client |

---

## Database 3: Calls / Meetings

Every interaction logged in one place.

| Property | Type | Details |
|----------|------|---------|
| Meeting Title | Title | Brief description |
| Engagement | Relation | → Engagements database (many-to-one) |
| Date | Date | When it happened or is scheduled |
| Type | Select | `Discovery`, `Kickoff`, `Status Update`, `Technical Review`, `Stakeholder Check-in`, `Ad Hoc`, `Closure` |
| Attendees | Multi-select | Names or roles present |
| Status | Select | `Scheduled`, `Completed`, `Cancelled`, `No Show` |
| Agenda | Text | Pre-meeting agenda items |
| Notes | Text | Meeting notes and discussion points |
| Action Items | Text | Captured actions (also used to generate Deliverables) |
| Follow-up Date | Date | When to follow up |
| Follow-up Done | Checkbox | Whether follow-up has been completed |
| Recording Link | URL | Link to recording if applicable |

---

## Database 4: Deliverables

Every piece of work output tracked.

| Property | Type | Details |
|----------|------|---------|
| Deliverable | Title | Name of the output |
| Engagement | Relation | → Engagements database (many-to-one) |
| Type | Select | `Report`, `Architecture Diagram`, `Runbook`, `Presentation`, `Code/Script`, `Config`, `Workshop`, `Review` |
| Status | Select | `Not Started`, `In Progress`, `In Review`, `Delivered`, `Accepted` |
| Priority | Select | `Critical`, `High`, `Medium`, `Low` |
| Due Date | Date | When it needs to be delivered |
| Completed Date | Date | When actually delivered |
| Assigned To | Person | Who is doing the work |
| Effort (Days) | Number | Estimated effort in days |
| Link | URL | Link to the deliverable artifact |
| Notes | Text | Context, dependencies, client feedback |
| Overdue | Formula | `if(and(prop("Status") != "Delivered", prop("Status") != "Accepted", prop("Due Date") < now()), true, false)` |

---

## Database 5: Risks & Blockers

Proactive risk tracking per engagement.

| Property | Type | Details |
|----------|------|---------|
| Risk | Title | Description of the risk or blocker |
| Engagement | Relation | → Engagements database (many-to-one) |
| Type | Select | `Risk`, `Blocker`, `Dependency`, `Assumption` |
| Severity | Select | `Critical`, `High`, `Medium`, `Low` |
| Likelihood | Select | `Almost Certain`, `Likely`, `Possible`, `Unlikely` |
| Risk Score | Formula | `if(prop("Severity") == "Critical", 4, if(prop("Severity") == "High", 3, if(prop("Severity") == "Medium", 2, 1))) * if(prop("Likelihood") == "Almost Certain", 4, if(prop("Likelihood") == "Likely", 3, if(prop("Likelihood") == "Possible", 2, 1)))` |
| Status | Select | `Open`, `Mitigating`, `Resolved`, `Accepted` |
| Owner | Person | Who is responsible for mitigation |
| Mitigation Plan | Text | What will be done about it |
| Raised Date | Date | When identified |
| Resolved Date | Date | When closed |
| Impact Description | Text | What happens if this materialises |

---

## Database 6: Commercials

Revenue tracking, renewal signals, and upsell triggers.

| Property | Type | Details |
|----------|------|---------|
| Item | Title | Description of the commercial event |
| Engagement | Relation | → Engagements database (many-to-one) |
| Type | Select | `Original Contract`, `Change Request`, `Upsell`, `Renewal`, `Credit Note`, `Expense` |
| Status | Select | `Draft`, `Sent`, `Accepted`, `Invoiced`, `Paid`, `Overdue`, `Cancelled` |
| Value | Number | Amount (£) — format: currency |
| Date Raised | Date | When created |
| Date Due | Date | Payment or decision due date |
| Date Closed | Date | When paid or resolved |
| Invoice Reference | Text | Invoice number or PO reference |
| Notes | Text | Commercial context |
| Overdue | Formula | `if(and(prop("Status") != "Paid", prop("Status") != "Cancelled", prop("Date Due") < now()), true, false)` |

---

## Database 7: Stakeholders

Map the people who matter in each account.

| Property | Type | Details |
|----------|------|---------|
| Name | Title | Stakeholder name |
| Account | Relation | → Accounts database (many-to-one) |
| Role | Text | Job title / function |
| Influence Level | Select | `Decision Maker`, `Strong Influencer`, `Influencer`, `End User`, `Blocker` |
| Sentiment | Select | `Champion`, `Supportive`, `Neutral`, `Resistant`, `Hostile` |
| Communication Preference | Select | `Email`, `Slack/Teams`, `Phone`, `In Person` |
| Email | Email | Contact email |
| Phone | Phone | Contact phone |
| LinkedIn | URL | Profile link |
| Last Contact | Date | When you last interacted |
| Notes | Text | Relationship context, preferences, motivations |
| Engagement Notes | Text | What they care about, what to avoid |

---

## Relation Map

```
Accounts (1) ──── (many) Engagements
Accounts (1) ──── (many) Stakeholders

Engagements (1) ──── (many) Calls/Meetings
Engagements (1) ──── (many) Deliverables
Engagements (1) ──── (many) Risks & Blockers
Engagements (1) ──── (many) Commercials
```

All relations are bidirectional in Notion. The "one" side shows a rollup count or list; the "many" side shows a single relation select.
