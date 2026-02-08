# Decision Engine Canvas - Database Schema

## Overview

A Notion-based reasoning system for structuring and presenting technical decisions. Contains two databases: a Decisions register and a supporting Evaluation Criteria library. The real value is in the page templates that enforce structured thinking.

---

## Database 1: Decisions

The master register of all decisions being evaluated or already made.

| Property | Type | Details |
|----------|------|---------|
| Decision Title | Title | Clear statement of what is being decided |
| Category | Select | `Architecture`, `Migration`, `Vendor Comparison`, `Buy vs Build`, `Technical Debt`, `Process Change`, `Investment`, `Deprecation` |
| Status | Select | `Draft`, `In Analysis`, `Recommendation Ready`, `Presented`, `Approved`, `Rejected`, `Deferred` |
| Priority | Select | `Critical`, `High`, `Medium`, `Low` |
| Decision Owner | Person | Who is driving this decision |
| Stakeholders | Multi-select | Who needs to approve or be informed |
| Date Raised | Date | When the decision was first identified |
| Decision Deadline | Date | When a decision must be made |
| Days Remaining | Formula | `dateBetween(prop("Decision Deadline"), now(), "days")` |
| Urgency Flag | Formula | `if(prop("Days Remaining") <= 3, "URGENT", if(prop("Days Remaining") <= 7, "Soon", "On Track"))` |
| Chosen Option | Text | The recommended or approved option |
| Confidence Level | Select | `High`, `Medium`, `Low` |
| Evaluation Criteria | Relation | → Evaluation Criteria database (many-to-many) |
| Reversibility | Select | `Easily Reversible`, `Reversible with Effort`, `Partially Reversible`, `Irreversible` |
| Impact Scope | Multi-select | `Performance`, `Cost`, `Security`, `Team Velocity`, `User Experience`, `Maintainability`, `Scalability`, `Compliance` |

---

## Database 2: Evaluation Criteria

Reusable criteria library for scoring options against.

| Property | Type | Details |
|----------|------|---------|
| Criterion | Title | Name of the evaluation dimension |
| Category | Select | `Technical`, `Financial`, `Operational`, `Strategic`, `Risk`, `People` |
| Description | Text | What this criterion measures |
| Weight | Select | `Critical (5)`, `High (4)`, `Medium (3)`, `Low (2)`, `Nice-to-have (1)` |
| Weight Value | Formula | `if(prop("Weight") == "Critical (5)", 5, if(prop("Weight") == "High (4)", 4, if(prop("Weight") == "Medium (3)", 3, if(prop("Weight") == "Low (2)", 2, 1))))` |
| Decisions | Relation | → Decisions database (many-to-many, reverse) |

### Default Criteria Library (Pre-populated)

| Criterion | Category | Default Weight |
|-----------|----------|---------------|
| Total Cost of Ownership | Financial | High (4) |
| Implementation Effort | Operational | High (4) |
| Time to Value | Strategic | Medium (3) |
| Team Skill Match | People | Medium (3) |
| Scalability | Technical | High (4) |
| Security Posture | Technical | Critical (5) |
| Vendor Lock-in Risk | Risk | Medium (3) |
| Maintenance Burden | Operational | Medium (3) |
| Community/Ecosystem | Technical | Low (2) |
| Compliance Alignment | Risk | High (4) |
| Performance | Technical | High (4) |
| Developer Experience | People | Medium (3) |
| Integration Complexity | Technical | Medium (3) |
| Disaster Recovery | Risk | High (4) |

---

## Decision Page Template

Every Decision page uses the following template structure. This is the core of the canvas — the sections below are implemented as page content (headings, callouts, toggles, tables) inside the Decision page.

### Section 1: Context
> **Heading:** Context
> **Type:** Callout block (grey background)
> **Prompt text:**
> - What situation are we in?
> - What triggered this decision?
> - What has changed since the last approach?
> - Who is affected?

### Section 2: Constraints
> **Heading:** Constraints
> **Type:** Bulleted list inside a toggle
> **Prompt text:**
> - Budget ceiling:
> - Timeline:
> - Technical constraints:
> - Regulatory requirements:
> - Team capacity:
> - Dependencies:

### Section 3: Signals (Data)
> **Heading:** Signals
> **Type:** Table block (inline, not database)
> **Columns:** Signal | Source | Date | Confidence | Implication
> **Prompt text:** List all data points, metrics, research findings, and observations relevant to this decision.

### Section 4: Options
> **Heading:** Options Under Consideration
> **Type:** Toggle blocks (one per option)
> Each toggle contains:
> - **Description:** What this option involves
> - **Pros:** Bulleted list
> - **Cons:** Bulleted list
> - **Estimated Cost:**
> - **Estimated Timeline:**
> - **Key Risks:**

### Section 5: Tradeoff Matrix
> **Heading:** Tradeoff Matrix
> **Type:** Table block (inline)
> **Columns:** Criterion | Weight | Option A Score (1-5) | Option B Score (1-5) | Option C Score (1-5)
> **Rows:** Populated from linked Evaluation Criteria
> **Footer row:** Weighted Total (calculated manually or with a helper database — see calculator section below)

### Section 6: Risk Surface
> **Heading:** Risk Surface
> **Type:** Table block (inline)
> **Columns:** Risk | Likelihood (1-5) | Impact (1-5) | Risk Score | Mitigation | Residual Risk
> **Prompt text:** For each option, what could go wrong? Focus on risks specific to this decision, not general project risks.

### Section 7: Recommended Path
> **Heading:** Recommendation
> **Type:** Callout block (blue background)
> **Prompt text:**
> - **Recommended option:**
> - **Primary rationale:**
> - **Key conditions/assumptions:**
> - **Immediate next steps:**

### Section 8: "If We Do Nothing" Scenario
> **Heading:** If We Do Nothing
> **Type:** Callout block (red background)
> **Prompt text:**
> - What happens if no decision is made?
> - What is the cost of inaction over 3/6/12 months?
> - What risks materialise by default?
> - What opportunities are lost?

### Section 9: Business Impact Translation
> **Heading:** Business Impact
> **Type:** Table block (inline)
> **Columns:** Dimension | Current State | After Implementation | Improvement
> **Rows:** Cost, Revenue, Risk, Velocity, Customer Impact
> **Prompt text:** Translate the technical recommendation into business language. Quantify where possible.

---

## Scoring Calculator (Optional Helper Database)

For users who want automated weighted scoring in the Tradeoff Matrix.

### Database: Option Scores

| Property | Type | Details |
|----------|------|---------|
| Entry | Title | Auto: "[Decision] - [Option] - [Criterion]" |
| Decision | Relation | → Decisions database |
| Option Name | Select | `Option A`, `Option B`, `Option C`, `Option D` |
| Criterion | Relation | → Evaluation Criteria database |
| Raw Score | Number | 1-5 rating |
| Weight | Rollup | Weight Value from related Criterion |
| Weighted Score | Formula | `prop("Raw Score") * prop("Weight")` |

Then on the Decisions database, add:
- **Relation:** → Option Scores (one-to-many)
- **Rollup per option:** Filter Option Scores by Option Name, sum Weighted Score

This gives an automated ranked total per option.

---

## Category Variations

The same template structure works across all decision types, but each category has suggested emphasis:

### Architecture Decision
- Emphasise: Constraints, Tradeoff Matrix, Risk Surface
- De-emphasise: Business Impact (or make it secondary)
- Add section: "Architectural Principles Alignment" (checklist against existing standards)

### Migration Decision
- Emphasise: "If We Do Nothing", Risk Surface, Timeline
- Add section: "Migration Phases" (staged rollout plan)
- Add section: "Rollback Strategy"

### Vendor Comparison
- Emphasise: Tradeoff Matrix, Signals (vendor demos, references, pricing)
- Add section: "Vendor Scorecard" (using the scoring calculator)
- Add section: "Contract Terms Comparison"

### Buy vs Build
- Emphasise: Total Cost of Ownership (multi-year), Maintenance Burden
- Add section: "Build Estimate" (effort, timeline, ongoing cost)
- Add section: "Buy Estimate" (licensing, integration, migration)

### Technical Debt Justification
- Emphasise: "If We Do Nothing" (this is the entire pitch), Business Impact
- Add section: "Debt Inventory" (what specifically is wrong)
- Add section: "Compound Effect" (how the debt grows over time)
