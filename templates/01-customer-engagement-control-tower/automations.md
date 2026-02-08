# Customer Engagement Control Tower - Automations

## Overview

These automations use Notion's native automation feature (or Notion API + Make/Zapier for advanced triggers). Each automation is defined with a trigger, condition, and action.

---

## Automation 1: Discovery Call → Delivery Checklist

**Purpose:** When a discovery call is logged, auto-create the standard set of initial deliverables.

**Trigger:** New page added to `Calls/Meetings` database
**Condition:** `Type` = `Discovery`
**Actions:**
1. Create new page in `Deliverables`:
   - Title: "Engagement Scope Document"
   - Engagement: same as the Call's Engagement relation
   - Type: "Report"
   - Status: "Not Started"
   - Priority: "High"
   - Due Date: Call Date + 5 business days

2. Create new page in `Deliverables`:
   - Title: "Stakeholder Map"
   - Engagement: same as the Call's Engagement relation
   - Type: "Report"
   - Status: "Not Started"
   - Priority: "Medium"
   - Due Date: Call Date + 3 business days

3. Create new page in `Deliverables`:
   - Title: "Initial Findings Presentation"
   - Engagement: same as the Call's Engagement relation
   - Type: "Presentation"
   - Status: "Not Started"
   - Priority: "High"
   - Due Date: Call Date + 10 business days

**Implementation:** Notion native automation (Add page trigger → Create page action x3)

---

## Automation 2: Scan Results → Analysis Tasks

**Purpose:** When a deliverable of type "Report" is marked as delivered, generate follow-on analysis tasks.

**Trigger:** Property changed in `Deliverables` database
**Condition:** `Status` changed to `Delivered` AND `Type` = `Report`
**Actions:**
1. Create new page in `Deliverables`:
   - Title: "Review & Analysis: [Original Deliverable Title]"
   - Engagement: same Engagement relation
   - Type: "Review"
   - Status: "Not Started"
   - Priority: "High"
   - Due Date: today + 3 business days

2. Create new page in `Deliverables`:
   - Title: "Recommendations Document"
   - Engagement: same Engagement relation
   - Type: "Report"
   - Status: "Not Started"
   - Priority: "High"
   - Due Date: today + 7 business days

**Implementation:** Notion native automation (Property changed trigger → Create page action x2)

---

## Automation 3: Inactivity Follow-up (14 Days)

**Purpose:** When an active engagement has no logged calls for 14 days, prompt a follow-up.

**Trigger:** Recurring daily check (or use the `Days Since Contact` formula on Accounts)
**Condition:** Account `Health` = `Needs Attention` AND `Relationship Status` = `Active`
**Actions:**
1. Create new page in `Calls/Meetings`:
   - Title: "Follow-up: [Account Name] - Inactivity Alert"
   - Date: today + 2 days
   - Type: "Status Update"
   - Status: "Scheduled"
   - Agenda: "This meeting was auto-generated due to 14+ days of inactivity. Review engagement status, confirm next steps, and re-establish cadence."

**Implementation:**
- **Option A (Simple):** Use the `Health` formula column on Accounts as a visual trigger. Filter the Accounts view to show "Needs Attention" and manually create the follow-up.
- **Option B (Automated):** Use Notion API + Make.com. Daily scheduled trigger → Query Accounts database → Filter where `Days Since Contact` > 14 and `Relationship Status` = "Active" → Create Call page.

---

## Automation 4: Engagement End → Renewal Brief

**Purpose:** When an engagement is within 30 days of its end date, generate a renewal brief.

**Trigger:** Property changed in `Engagements` database (or daily scheduled check)
**Condition:** `Renewal Flag` formula = `Renewal Window`
**Actions:**
1. Create new page in `Commercials`:
   - Title: "Renewal Assessment: [Engagement Name]"
   - Engagement: current Engagement
   - Type: "Renewal"
   - Status: "Draft"
   - Value: same as current Engagement value
   - Date Raised: today
   - Date Due: Engagement End Date
   - Notes: "Auto-generated renewal brief. Review engagement outcomes, client satisfaction, and expansion opportunities before approaching client."

2. Create new page in `Deliverables`:
   - Title: "Engagement Summary & Outcomes Report"
   - Engagement: current Engagement
   - Type: "Report"
   - Status: "Not Started"
   - Priority: "High"
   - Due Date: Engagement End Date - 14 days

**Implementation:**
- **Option A (Simple):** Filter Engagements view to show `Renewal Flag` = "Renewal Window". Manually trigger from there.
- **Option B (Automated):** Notion API + Make.com. Daily check → Query where `Renewal Flag` = "Renewal Window" → Create pages if not already created.

---

## Automation 5: New Engagement → Kickoff Checklist

**Purpose:** When a new engagement is created, auto-create the kickoff meeting and standard first deliverables.

**Trigger:** New page added to `Engagements` database
**Condition:** None (applies to all new engagements)
**Actions:**
1. Create new page in `Calls/Meetings`:
   - Title: "Kickoff: [Engagement Name]"
   - Engagement: current Engagement
   - Type: "Kickoff"
   - Status: "Scheduled"
   - Date: Engagement Start Date
   - Agenda: "Introductions, scope review, success criteria alignment, ways of working, communication cadence, immediate next steps."

2. Create new page in `Risks & Blockers`:
   - Title: "Scope creep risk"
   - Engagement: current Engagement
   - Type: "Risk"
   - Severity: "Medium"
   - Likelihood: "Likely"
   - Status: "Open"
   - Mitigation Plan: "Define clear change request process in kickoff. Document all scope items."

**Implementation:** Notion native automation (Add page trigger → Create page action x2)

---

## Automation 6: Overdue Deliverable Alert

**Purpose:** When a deliverable passes its due date without being delivered, flag it.

**Trigger:** The `Overdue` formula on Deliverables automatically computes this.
**Condition:** `Overdue` = true
**Actions:**
- No separate automation needed. The formula flags it. Use a filtered view (see views.md) to surface overdue items prominently.
- **Optional enhancement:** Notion API + Slack webhook to post a daily digest of overdue deliverables.

---

## Automation 7: Commercial Overdue Alert

**Purpose:** Highlight unpaid invoices past their due date.

**Trigger:** The `Overdue` formula on Commercials automatically computes this.
**Condition:** `Overdue` = true
**Actions:**
- Same as above: formula-based flagging + filtered view.
- **Optional:** Daily Slack/email alert for overdue commercials.

---

## Notion Native vs API Automations

| Automation | Notion Native | Needs API/Make |
|-----------|:---:|:---:|
| Discovery Call → Deliverables | Yes | - |
| Scan Results → Analysis Tasks | Yes | - |
| 14-Day Inactivity Follow-up | Partial (formula view) | Full automation |
| Engagement End → Renewal Brief | Partial (formula view) | Full automation |
| New Engagement → Kickoff | Yes | - |
| Overdue Deliverable Alert | Formula only | Slack notification |
| Commercial Overdue Alert | Formula only | Slack notification |

Automations marked "Partial" work as manual triggers using filtered views. Full automation requires the Notion API with a scheduler (Make.com, Zapier, or a cron job).
