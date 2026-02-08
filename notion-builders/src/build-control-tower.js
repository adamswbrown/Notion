import { notion, NOTION_PARENT_PAGE_ID } from "./config.js";
import {
  createDatabase,
  addRelation,
  createPage,
  createSubPage,
  appendBlocks,
  sleep,
  heading1,
  heading2,
  heading3,
  paragraph,
  bulletedListItem,
  callout,
  divider,
  titleProp,
  richTextProp,
  numberProp,
  selectProp,
  multiSelectProp,
  dateProp,
  checkboxProp,
  urlProp,
  emailProp,
  phoneProp,
  peopleProp,
  formulaProp,
  relationProp,
  rollupProp,
} from "./helpers.js";

export default async function buildControlTower(parentPageId) {
  console.log("\n=== Building Customer Engagement Control Tower ===\n");

  // 1. Create container page
  const container = await createSubPage(parentPageId, "Customer Engagement Control Tower", "🗼");
  const pid = container.id;
  await sleep(300);

  // 2. Create databases in dependency order
  // Accounts first (no dependencies)
  console.log("\n--- Accounts ---");
  const accountsDb = await createDatabase(pid, "Accounts", "🏢", {
    "Account Name": titleProp(),
    Industry: selectProp([
      "Technology", "Finance", "Healthcare", "Government",
      "Manufacturing", "Professional Services", "Retail", "Other",
    ]),
    "Account Tier": selectProp(["Strategic", "Growth", "Standard"]),
    "Primary Contact": richTextProp(),
    Website: urlProp(),
    "Relationship Status": selectProp(["Prospect", "Active", "On Hold", "Churned", "Alumni"]),
    "Account Owner": peopleProp(),
    Notes: richTextProp(),
  });
  await sleep(300);

  // Stakeholders
  console.log("\n--- Stakeholders ---");
  const stakeholdersDb = await createDatabase(pid, "Stakeholders", "👥", {
    Name: titleProp(),
    Account: relationProp(accountsDb.id),
    Role: richTextProp(),
    "Influence Level": selectProp([
      "Decision Maker", "Strong Influencer", "Influencer", "End User", "Blocker",
    ]),
    Sentiment: selectProp(["Champion", "Supportive", "Neutral", "Resistant", "Hostile"]),
    "Communication Preference": selectProp(["Email", "Slack/Teams", "Phone", "In Person"]),
    Email: emailProp(),
    Phone: phoneProp(),
    LinkedIn: urlProp(),
    "Last Contact": dateProp(),
    Notes: richTextProp(),
    "Engagement Notes": richTextProp(),
  });
  await sleep(300);

  // Engagements
  console.log("\n--- Engagements ---");
  const engagementsDb = await createDatabase(pid, "Engagements", "📋", {
    "Engagement Name": titleProp(),
    Account: relationProp(accountsDb.id),
    Type: selectProp([
      "Discovery", "Assessment", "Implementation", "Advisory", "Retainer", "Training",
    ]),
    Status: selectProp(["Scoping", "In Progress", "On Hold", "Delivered", "Closed"]),
    "Start Date": dateProp(),
    "End Date": dateProp(),
    Value: numberProp("pound"),
    "Billing Model": selectProp(["Fixed Price", "Time & Materials", "Retainer", "Day Rate"]),
    "Day Rate": numberProp("pound"),
    "Estimated Days": numberProp("number"),
    "Scope Summary": richTextProp(),
    "Success Criteria": richTextProp(),
    "Internal Notes": richTextProp(),
    "Days to End": formulaProp('dateBetween(prop("End Date"), now(), "days")'),
    "Renewal Flag": formulaProp(
      'if(and(prop("Days to End") <= 30, prop("Days to End") > 0), "Renewal Window", if(prop("Days to End") <= 0, "Expired", ""))'
    ),
  });
  await sleep(300);

  // Calls / Meetings
  console.log("\n--- Calls / Meetings ---");
  const callsDb = await createDatabase(pid, "Calls / Meetings", "📞", {
    "Meeting Title": titleProp(),
    Engagement: relationProp(engagementsDb.id),
    Date: dateProp(),
    Type: selectProp([
      "Discovery", "Kickoff", "Status Update", "Technical Review",
      "Stakeholder Check-in", "Ad Hoc", "Closure",
    ]),
    Attendees: multiSelectProp([]),
    Status: selectProp(["Scheduled", "Completed", "Cancelled", "No Show"]),
    Agenda: richTextProp(),
    Notes: richTextProp(),
    "Action Items": richTextProp(),
    "Follow-up Date": dateProp(),
    "Follow-up Done": checkboxProp(),
    "Recording Link": urlProp(),
  });
  await sleep(300);

  // Deliverables
  console.log("\n--- Deliverables ---");
  const deliverablesDb = await createDatabase(pid, "Deliverables", "📦", {
    Deliverable: titleProp(),
    Engagement: relationProp(engagementsDb.id),
    Type: selectProp([
      "Report", "Architecture Diagram", "Runbook", "Presentation",
      "Code/Script", "Config", "Workshop", "Review",
    ]),
    Status: selectProp(["Not Started", "In Progress", "In Review", "Delivered", "Accepted"]),
    Priority: selectProp(["Critical", "High", "Medium", "Low"]),
    "Due Date": dateProp(),
    "Completed Date": dateProp(),
    "Assigned To": peopleProp(),
    "Effort (Days)": numberProp("number"),
    Link: urlProp(),
    Notes: richTextProp(),
    Overdue: formulaProp(
      'if(and(prop("Status") != "Delivered", prop("Status") != "Accepted", not empty(prop("Due Date")), prop("Due Date") < now()), true, false)'
    ),
  });
  await sleep(300);

  // Risks & Blockers
  console.log("\n--- Risks & Blockers ---");
  const risksDb = await createDatabase(pid, "Risks & Blockers", "⚠️", {
    Risk: titleProp(),
    Engagement: relationProp(engagementsDb.id),
    Type: selectProp(["Risk", "Blocker", "Dependency", "Assumption"]),
    Severity: selectProp(["Critical", "High", "Medium", "Low"]),
    Likelihood: selectProp(["Almost Certain", "Likely", "Possible", "Unlikely"]),
    "Risk Score": formulaProp(
      'if(prop("Severity") == "Critical", 4, if(prop("Severity") == "High", 3, if(prop("Severity") == "Medium", 2, 1))) * if(prop("Likelihood") == "Almost Certain", 4, if(prop("Likelihood") == "Likely", 3, if(prop("Likelihood") == "Possible", 2, 1)))'
    ),
    Status: selectProp(["Open", "Mitigating", "Resolved", "Accepted"]),
    Owner: peopleProp(),
    "Mitigation Plan": richTextProp(),
    "Raised Date": dateProp(),
    "Resolved Date": dateProp(),
    "Impact Description": richTextProp(),
  });
  await sleep(300);

  // Commercials
  console.log("\n--- Commercials ---");
  const commercialsDb = await createDatabase(pid, "Commercials", "💷", {
    Item: titleProp(),
    Engagement: relationProp(engagementsDb.id),
    Type: selectProp([
      "Original Contract", "Change Request", "Upsell",
      "Renewal", "Credit Note", "Expense",
    ]),
    Status: selectProp(["Draft", "Sent", "Accepted", "Invoiced", "Paid", "Overdue", "Cancelled"]),
    Value: numberProp("pound"),
    "Date Raised": dateProp(),
    "Date Due": dateProp(),
    "Date Closed": dateProp(),
    "Invoice Reference": richTextProp(),
    Notes: richTextProp(),
    Overdue: formulaProp(
      'if(and(prop("Status") != "Paid", prop("Status") != "Cancelled", not empty(prop("Date Due")), prop("Date Due") < now()), true, false)'
    ),
  });
  await sleep(300);

  // 3. Build dashboard page content
  console.log("\n--- Building dashboard ---");
  await appendBlocks(pid, [
    callout(
      "Post-sale execution OS. Track the full lifecycle from sales call through delivery, follow-ups, and expansion.",
      "🗼"
    ),
    divider(),
    heading2("Quick Start"),
    bulletedListItem("Create an Account for each client company"),
    bulletedListItem("Add Engagements under each Account"),
    bulletedListItem("Log Calls & Meetings as they happen"),
    bulletedListItem("Track Deliverables per engagement"),
    bulletedListItem("Monitor Risks and Commercials"),
    bulletedListItem("Map Stakeholders and their influence"),
    divider(),
    heading2("How It Works"),
    paragraph(
      "Everything connects through Engagements. An Account has many Engagements. " +
      "Each Engagement tracks its own Calls, Deliverables, Risks, and Commercials. " +
      "Stakeholders are mapped at the Account level."
    ),
    paragraph(""),
    heading3("Key Formulas"),
    bulletedListItem("Account Health: flags accounts with no contact in 14+ days"),
    bulletedListItem("Renewal Flag: surfaces engagements within 30 days of end date"),
    bulletedListItem("Budget Burn: tracks effort consumed vs estimated"),
    bulletedListItem("Risk Score: severity x likelihood for prioritisation"),
    bulletedListItem("Overdue: auto-flags late deliverables and unpaid invoices"),
    divider(),
    heading2("Automation Triggers"),
    paragraph("Set up these Notion automations for hands-free workflow:"),
    numberedItem("New Discovery call → auto-creates scope doc, stakeholder map, and findings presentation"),
    numberedItem("Report delivered → generates review and recommendations tasks"),
    numberedItem("New Engagement created → schedules kickoff meeting and adds scope creep risk"),
    numberedItem("Engagement nearing end → generates renewal brief and outcomes report"),
  ]);

  console.log("\n=== Control Tower complete ===");
  return {
    containerId: pid,
    databases: {
      accounts: accountsDb.id,
      stakeholders: stakeholdersDb.id,
      engagements: engagementsDb.id,
      calls: callsDb.id,
      deliverables: deliverablesDb.id,
      risks: risksDb.id,
      commercials: commercialsDb.id,
    },
  };
}

function numberedItem(text) {
  return {
    object: "block",
    type: "numbered_list_item",
    numbered_list_item: {
      rich_text: [{ type: "text", text: { content: text } }],
    },
  };
}

// Run directly
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"));
if (isMain || process.argv[1]?.endsWith("build-control-tower.js")) {
  buildControlTower(NOTION_PARENT_PAGE_ID).catch(console.error);
}
