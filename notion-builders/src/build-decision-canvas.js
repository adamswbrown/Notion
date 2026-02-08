import { notion, NOTION_PARENT_PAGE_ID } from "./config.js";
import {
  createDatabase,
  createPage,
  createSubPage,
  appendBlocks,
  sleep,
  heading1,
  heading2,
  heading3,
  paragraph,
  bulletedListItem,
  numberedListItem,
  callout,
  divider,
  toggle,
  quote,
  table,
  titleProp,
  richTextProp,
  numberProp,
  selectProp,
  multiSelectProp,
  dateProp,
  peopleProp,
  formulaProp,
  relationProp,
  rollupProp,
} from "./helpers.js";

export default async function buildDecisionCanvas(parentPageId) {
  console.log("\n=== Building Decision Engine Canvas ===\n");

  // 1. Create container page
  const container = await createSubPage(parentPageId, "Decision Engine Canvas", "🧠");
  const pid = container.id;
  await sleep(300);

  // 2. Evaluation Criteria database (no dependencies)
  console.log("\n--- Evaluation Criteria ---");
  const criteriaDb = await createDatabase(pid, "Evaluation Criteria", "📏", {
    Criterion: titleProp(),
    Category: selectProp(["Technical", "Financial", "Operational", "Strategic", "Risk", "People"]),
    Description: richTextProp(),
    Weight: selectProp(["Critical (5)", "High (4)", "Medium (3)", "Low (2)", "Nice-to-have (1)"]),
    "Weight Value": formulaProp(
      'if(prop("Weight") == "Critical (5)", 5, if(prop("Weight") == "High (4)", 4, if(prop("Weight") == "Medium (3)", 3, if(prop("Weight") == "Low (2)", 2, 1))))'
    ),
  });
  await sleep(300);

  // 3. Decisions database
  console.log("\n--- Decisions ---");
  const decisionsDb = await createDatabase(pid, "Decisions", "⚖️", {
    "Decision Title": titleProp(),
    Category: selectProp([
      "Architecture", "Migration", "Vendor Comparison",
      "Buy vs Build", "Technical Debt", "Process Change",
      "Investment", "Deprecation",
    ]),
    Status: selectProp([
      "Draft", "In Analysis", "Recommendation Ready",
      "Presented", "Approved", "Rejected", "Deferred",
    ]),
    Priority: selectProp(["Critical", "High", "Medium", "Low"]),
    "Decision Owner": peopleProp(),
    Stakeholders: multiSelectProp([]),
    "Date Raised": dateProp(),
    "Decision Deadline": dateProp(),
    "Days Remaining": formulaProp('dateBetween(prop("Decision Deadline"), now(), "days")'),
    "Urgency Flag": formulaProp(
      'if(prop("Days Remaining") <= 3, "URGENT", if(prop("Days Remaining") <= 7, "Soon", "On Track"))'
    ),
    "Chosen Option": richTextProp(),
    "Confidence Level": selectProp(["High", "Medium", "Low"]),
    "Evaluation Criteria": relationProp(criteriaDb.id),
    Reversibility: selectProp([
      "Easily Reversible", "Reversible with Effort",
      "Partially Reversible", "Irreversible",
    ]),
    "Impact Scope": multiSelectProp([
      "Performance", "Cost", "Security", "Team Velocity",
      "User Experience", "Maintainability", "Scalability", "Compliance",
    ]),
  });
  await sleep(300);

  // 4. Option Scores calculator database
  console.log("\n--- Option Scores ---");
  const scoresDb = await createDatabase(pid, "Option Scores", "🔢", {
    Entry: titleProp(),
    Decision: relationProp(decisionsDb.id),
    "Option Name": selectProp(["Option A", "Option B", "Option C", "Option D"]),
    Criterion: relationProp(criteriaDb.id),
    "Raw Score": numberProp("number"),
    Weight: rollupProp("Criterion", "Weight Value", "sum"),
    "Weighted Score": formulaProp('prop("Raw Score") * prop("Weight")'),
  });
  await sleep(300);

  // 5. Seed default evaluation criteria
  console.log("\n--- Seeding default criteria ---");
  const defaultCriteria = [
    { name: "Total Cost of Ownership", cat: "Financial", weight: "High (4)", desc: "Full lifecycle cost including implementation, operation, and decommissioning" },
    { name: "Implementation Effort", cat: "Operational", weight: "High (4)", desc: "Time, resources, and complexity to implement" },
    { name: "Time to Value", cat: "Strategic", weight: "Medium (3)", desc: "How quickly the solution delivers measurable benefit" },
    { name: "Team Skill Match", cat: "People", weight: "Medium (3)", desc: "How well the solution aligns with existing team capabilities" },
    { name: "Scalability", cat: "Technical", weight: "High (4)", desc: "Ability to handle growth in volume, users, or complexity" },
    { name: "Security Posture", cat: "Technical", weight: "Critical (5)", desc: "Impact on the organisation's security stance" },
    { name: "Vendor Lock-in Risk", cat: "Risk", weight: "Medium (3)", desc: "Degree of dependency on a single vendor" },
    { name: "Maintenance Burden", cat: "Operational", weight: "Medium (3)", desc: "Ongoing effort to keep the solution running and updated" },
    { name: "Community & Ecosystem", cat: "Technical", weight: "Low (2)", desc: "Maturity of community, plugins, integrations, and support" },
    { name: "Compliance Alignment", cat: "Risk", weight: "High (4)", desc: "How well the solution meets regulatory and compliance requirements" },
    { name: "Performance", cat: "Technical", weight: "High (4)", desc: "Speed, throughput, and resource efficiency" },
    { name: "Developer Experience", cat: "People", weight: "Medium (3)", desc: "How pleasant and productive it is for engineers to work with" },
    { name: "Integration Complexity", cat: "Technical", weight: "Medium (3)", desc: "Effort to integrate with existing systems and workflows" },
    { name: "Disaster Recovery", cat: "Risk", weight: "High (4)", desc: "Ability to recover from failures and data loss" },
  ];

  for (const c of defaultCriteria) {
    await createPage(criteriaDb.id, {
      Criterion: { title: [{ type: "text", text: { content: c.name } }] },
      Category: { select: { name: c.cat } },
      Weight: { select: { name: c.weight } },
      Description: { rich_text: [{ type: "text", text: { content: c.desc } }] },
    });
    await sleep(200);
  }
  console.log(`  Seeded ${defaultCriteria.length} evaluation criteria`);

  // 6. Create decision page template (as a sample decision)
  console.log("\n--- Creating sample decision template ---");
  const sampleDecision = await createPage(decisionsDb.id, {
    "Decision Title": {
      title: [{ type: "text", text: { content: "[Template] New Decision — Duplicate This" } }],
    },
    Category: { select: { name: "Architecture" } },
    Status: { select: { name: "Draft" } },
    Priority: { select: { name: "Medium" } },
  });

  await appendBlocks(sampleDecision.id, [
    heading2("Context"),
    callout(
      "What situation are we in? What triggered this decision? What has changed since the last approach? Who is affected?",
      "📌"
    ),
    paragraph(""),
    divider(),

    heading2("Constraints"),
    bulletedListItem("Budget: "),
    bulletedListItem("Timeline: "),
    bulletedListItem("Technical constraints: "),
    bulletedListItem("Regulatory requirements: "),
    bulletedListItem("Team capacity: "),
    bulletedListItem("Dependencies: "),
    divider(),

    heading2("Signals (Data)"),
    table(
      ["Signal", "Source", "Date", "Confidence", "Implication"],
      [
        ["[Data point]", "[Source]", "[Date]", "High/Med/Low", "[What it means]"],
        ["", "", "", "", ""],
      ]
    ),
    divider(),

    heading2("Options Under Consideration"),
    toggle("Option A: [Name]", [
      paragraph("Description: "),
      paragraph("Pros:", true),
      bulletedListItem("[Advantage 1]"),
      bulletedListItem("[Advantage 2]"),
      paragraph("Cons:", true),
      bulletedListItem("[Disadvantage 1]"),
      bulletedListItem("[Disadvantage 2]"),
      paragraph("Estimated Cost: £"),
      paragraph("Estimated Timeline: "),
      paragraph("Key Risks: "),
    ]),
    toggle("Option B: [Name]", [
      paragraph("Description: "),
      paragraph("Pros:", true),
      bulletedListItem("[Advantage 1]"),
      bulletedListItem("[Advantage 2]"),
      paragraph("Cons:", true),
      bulletedListItem("[Disadvantage 1]"),
      bulletedListItem("[Disadvantage 2]"),
      paragraph("Estimated Cost: £"),
      paragraph("Estimated Timeline: "),
      paragraph("Key Risks: "),
    ]),
    toggle("Option C: [Name]", [
      paragraph("Description: "),
      paragraph("Pros:", true),
      bulletedListItem("[Advantage 1]"),
      bulletedListItem("[Advantage 2]"),
      paragraph("Cons:", true),
      bulletedListItem("[Disadvantage 1]"),
      bulletedListItem("[Disadvantage 2]"),
      paragraph("Estimated Cost: £"),
      paragraph("Estimated Timeline: "),
      paragraph("Key Risks: "),
    ]),
    divider(),

    heading2("Tradeoff Matrix"),
    table(
      ["Criterion", "Weight", "Option A", "Option B", "Option C"],
      [
        ["[Criterion 1]", "[1-5]", "[1-5]", "[1-5]", "[1-5]"],
        ["[Criterion 2]", "[1-5]", "[1-5]", "[1-5]", "[1-5]"],
        ["[Criterion 3]", "[1-5]", "[1-5]", "[1-5]", "[1-5]"],
        ["Weighted Total", "", "[Sum]", "[Sum]", "[Sum]"],
      ]
    ),
    paragraph("Use the Option Scores database for automated weighted scoring."),
    divider(),

    heading2("Risk Surface"),
    table(
      ["Risk", "Likelihood (1-5)", "Impact (1-5)", "Risk Score", "Mitigation", "Residual Risk"],
      [
        ["[Risk]", "", "", "", "[Mitigation]", "[Residual]"],
        ["", "", "", "", "", ""],
      ]
    ),
    divider(),

    heading2("Recommendation"),
    callout(
      "Recommended option: [Option X]\n\n" +
      "Primary rationale: [Why this option best satisfies constraints and criteria]\n\n" +
      "Key conditions: [What must be true for this to hold]\n\n" +
      "Immediate next steps:\n" +
      "1. [Action — who — by when]\n" +
      "2. [Action — who — by when]\n" +
      "3. [Action — who — by when]",
      "✅"
    ),
    divider(),

    heading2("If We Do Nothing"),
    callout(
      "3 months: [Impact]\n" +
      "6 months: [Impact]\n" +
      "12 months: [Impact]\n\n" +
      "Risks that materialise by default: [What breaks]\n" +
      "Opportunities lost: [What we miss]\n" +
      "Estimated cost of inaction: [£X or qualitative]",
      "🔴"
    ),
    divider(),

    heading2("Business Impact Translation"),
    table(
      ["Dimension", "Current State", "After Implementation", "Improvement"],
      [
        ["Cost", "[£X/month]", "[£Y/month]", "[Savings]"],
        ["Revenue", "[Current]", "[New capability]", "[Impact]"],
        ["Risk", "[Current exposure]", "[Post-implementation]", "[Reduction]"],
        ["Velocity", "[Current]", "[Expected]", "[% improvement]"],
        ["Customer Impact", "[Current]", "[Improved]", "[Measurable change]"],
      ]
    ),
    divider(),

    heading2("Decision Log"),
    table(
      ["Date", "Update", "By"],
      [
        ["[Today]", "Decision identified and analysis started", "[Name]"],
        ["", "", ""],
      ]
    ),
  ]);

  // 7. Dashboard content
  console.log("\n--- Building dashboard ---");
  await appendBlocks(pid, [
    callout(
      "A reasoning system for presenting technical decisions clearly. Not a slide deck — a structured framework for making stakeholders agree with you before you finish the meeting.",
      "🧠"
    ),
    divider(),
    heading2("How to Use"),
    numberedListItem("Open the Decisions database and duplicate the template entry"),
    numberedListItem("Fill in each section — Context through Business Impact"),
    numberedListItem("Use the Evaluation Criteria library to score options objectively"),
    numberedListItem("For automated scoring, add entries to Option Scores per option per criterion"),
    numberedListItem("Present the completed canvas to stakeholders"),
    divider(),
    heading2("Category Variations"),
    toggle("Architecture Decision", [
      bulletedListItem("Emphasise: Constraints, Tradeoff Matrix, Risk Surface"),
      bulletedListItem("Add: Architectural Principles Alignment checklist"),
    ]),
    toggle("Migration Decision", [
      bulletedListItem("Emphasise: 'If We Do Nothing', Risk Surface, Timeline"),
      bulletedListItem("Add: Migration Phases, Rollback Strategy"),
    ]),
    toggle("Vendor Comparison", [
      bulletedListItem("Emphasise: Tradeoff Matrix, Signals (demos, references, pricing)"),
      bulletedListItem("Add: Vendor Scorecard, Contract Terms Comparison"),
    ]),
    toggle("Buy vs Build", [
      bulletedListItem("Emphasise: Total Cost of Ownership (multi-year), Maintenance Burden"),
      bulletedListItem("Add: Build Estimate (effort, timeline, cost), Buy Estimate (licensing, integration)"),
    ]),
    toggle("Technical Debt Justification", [
      bulletedListItem("Emphasise: 'If We Do Nothing' (this is the entire pitch), Business Impact"),
      bulletedListItem("Add: Debt Inventory, Compound Effect (how debt grows over time)"),
    ]),
  ]);

  console.log("\n=== Decision Canvas complete ===");
  return {
    containerId: pid,
    databases: {
      decisions: decisionsDb.id,
      criteria: criteriaDb.id,
      scores: scoresDb.id,
    },
  };
}

// Run directly
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"));
if (isMain || process.argv[1]?.endsWith("build-decision-canvas.js")) {
  buildDecisionCanvas(NOTION_PARENT_PAGE_ID).catch(console.error);
}
