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
  checkboxProp,
  urlProp,
  peopleProp,
  createdTimeProp,
  formulaProp,
  relationProp,
  rollupProp,
} from "./helpers.js";

export default async function buildPersonalOS(parentPageId) {
  console.log("\n=== Building Personal Operating System ===\n");

  // 1. Container page
  const container = await createSubPage(parentPageId, "Personal Operating System", "⚡");
  const pid = container.id;
  await sleep(300);

  // 2. Brain Cache (no dependencies)
  console.log("\n--- Brain Cache ---");
  const brainCacheDb = await createDatabase(pid, "Brain Cache", "🧠", {
    Thought: titleProp(),
    Captured: createdTimeProp(),
    Source: selectProp([
      "Head", "Meeting", "Slack/Email", "Reading",
      "Shower Thought", "Dream", "Conversation", "While Working On Something Else",
    ]),
    "Type Guess": selectProp(["Task", "Idea", "Question", "Reference", "Worry", "Someday", "Unknown"]),
    Processed: checkboxProp(),
    Notes: richTextProp(),
    "Days in Cache": formulaProp('dateBetween(now(), prop("Captured"), "days")'),
    Stale: formulaProp('if(and(prop("Processed") == false, prop("Days in Cache") > 7), true, false)'),
  });
  await sleep(300);

  // 3. Routines (no dependencies yet)
  console.log("\n--- Routines ---");
  const routinesDb = await createDatabase(pid, "Routines", "🔄", {
    "Routine Name": titleProp(),
    Type: selectProp(["Morning", "Evening", "Work Start", "Work End", "Weekly", "Monthly", "Transition", "Recovery"]),
    Frequency: selectProp(["Daily", "Weekdays", "Weekends", "Weekly", "Fortnightly", "Monthly", "As Needed"]),
    Steps: richTextProp(),
    "Duration (min)": numberProp("number"),
    "Energy Required": selectProp(["Minimal", "Low", "Medium"]),
    "Activation Cue": richTextProp(),
    "Current Streak": numberProp("number"),
    "Last Completed": dateProp(),
    Status: selectProp(["Active", "Building", "Paused", "Retired"]),
    "Difficulty Level": selectProp(["Automatic", "Easy", "Needs Effort", "Struggling"]),
    Notes: richTextProp(),
  });
  await sleep(300);

  // 4. Activation Board (depends on Brain Cache + Routines)
  console.log("\n--- Activation Board ---");
  const activationDb = await createDatabase(pid, "Activation Board", "🎯", {
    Task: titleProp(),
    "Activation Difficulty": selectProp([
      "Trivial (just do it)", "Low (small push)", "Medium (need setup)",
      "High (need conditions)", "Steep (executive function wall)",
    ]),
    "Activation Score": formulaProp(
      'if(prop("Activation Difficulty") == "Trivial (just do it)", 1, ' +
      'if(prop("Activation Difficulty") == "Low (small push)", 2, ' +
      'if(prop("Activation Difficulty") == "Medium (need setup)", 3, ' +
      'if(prop("Activation Difficulty") == "High (need conditions)", 4, 5))))'
    ),
    "Energy Required": selectProp(["Minimal", "Low", "Medium", "High", "Peak"]),
    "Energy Score": formulaProp(
      'if(prop("Energy Required") == "Minimal", 1, ' +
      'if(prop("Energy Required") == "Low", 2, ' +
      'if(prop("Energy Required") == "Medium", 3, ' +
      'if(prop("Energy Required") == "High", 4, 5))))'
    ),
    "Total Friction": formulaProp('prop("Activation Score") + prop("Energy Score")'),
    Context: multiSelectProp([
      "Computer", "Phone", "Out of House", "Home",
      "Office", "With People", "Alone", "Online", "Offline",
    ]),
    Domain: selectProp(["Work", "Personal", "Health", "Admin", "Creative", "Learning", "Social", "Maintenance"]),
    Status: selectProp(["Ready", "Active", "Blocked", "Done", "Dropped"]),
    "Blocked By": richTextProp(),
    "Smallest Next Step": richTextProp(),
    "Time Estimate": selectProp(["< 5 min", "5-15 min", "15-30 min", "30-60 min", "1-2 hours", "Half day", "Unknown"]),
    Deadline: dateProp(),
    "Deadline Pressure": formulaProp(
      'if(empty(prop("Deadline")), "None", ' +
      'if(dateBetween(prop("Deadline"), now(), "days") <= 1, "TODAY", ' +
      'if(dateBetween(prop("Deadline"), now(), "days") <= 3, "This Week", ' +
      'if(dateBetween(prop("Deadline"), now(), "days") <= 7, "Upcoming", "Distant"))))'
    ),
    Source: relationProp(brainCacheDb.id, false),
    Routine: relationProp(routinesDb.id, false),
    "Completed Date": dateProp(),
    "Completion Notes": richTextProp(),
    Started: dateProp(),
  });
  await sleep(300);

  // 5. Energy Schedule
  console.log("\n--- Energy Schedule ---");
  const energyDb = await createDatabase(pid, "Energy Schedule", "⚡", {
    "Block Name": titleProp(),
    Day: selectProp(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
    "Start Time": richTextProp(),
    "End Time": richTextProp(),
    "Duration (min)": numberProp("number"),
    "Energy Level": selectProp(["Peak", "High", "Medium", "Low", "Recovery"]),
    "Best For": multiSelectProp([
      "Deep Work", "Communication", "Admin", "Creative",
      "Physical", "Learning", "Meetings", "Nothing",
    ]),
    Protect: checkboxProp(),
    "Transition Before": selectProp(["None", "5 min", "10 min", "15 min", "30 min"]),
    "Transition After": selectProp(["None", "5 min", "10 min", "15 min", "30 min"]),
    Notes: richTextProp(),
    "Assigned Tasks": relationProp(activationDb.id, false),
  });
  await sleep(300);

  // 6. Transition Buffers
  console.log("\n--- Transition Buffers ---");
  const transitionsDb = await createDatabase(pid, "Transition Buffers", "🔀", {
    Transition: titleProp(),
    "From Context": selectProp([
      "Deep Work", "Meeting", "Communication", "Admin",
      "Break", "Commute", "Exercise", "Social", "Creative",
    ]),
    "To Context": selectProp([
      "Deep Work", "Meeting", "Communication", "Admin",
      "Break", "Commute", "Exercise", "Social", "Creative",
    ]),
    "Buffer Duration (min)": numberProp("number"),
    "Buffer Activity": multiSelectProp([
      "Walk", "Water/Tea", "Breathing", "Journaling",
      "Music", "Silence", "Stretching", "Phone Break", "Nothing",
    ]),
    Difficulty: selectProp(["Easy", "Moderate", "Hard"]),
    Notes: richTextProp(),
    "Success Rate": selectProp(["Usually Fine", "Sometimes Struggle", "Often Fail", "Almost Never Manage"]),
  });
  await sleep(300);

  // 7. Recovery Tracking
  console.log("\n--- Recovery Tracking ---");
  const recoveryDb = await createDatabase(pid, "Recovery Tracking", "📊", {
    Date: titleProp(),
    "Date Value": dateProp(),
    "Morning Energy": selectProp(["1 - Depleted", "2 - Low", "3 - Moderate", "4 - Good", "5 - Peak"]),
    "Afternoon Energy": selectProp(["1 - Depleted", "2 - Low", "3 - Moderate", "4 - Good", "5 - Peak"]),
    "Evening Energy": selectProp(["1 - Depleted", "2 - Low", "3 - Moderate", "4 - Good", "5 - Peak"]),
    "Sleep Quality": selectProp(["1 - Terrible", "2 - Poor", "3 - OK", "4 - Good", "5 - Excellent"]),
    "Sleep Hours": numberProp("number"),
    Exercise: checkboxProp(),
    "Social Drain": selectProp(["None", "Light", "Moderate", "Heavy", "Overwhelming"]),
    Overstimulation: selectProp(["None", "Mild", "Moderate", "Severe"]),
    "Capacity Assessment": selectProp(["Full Capacity", "Reduced Capacity", "Recovery Mode"]),
    Notes: richTextProp(),
    Wins: richTextProp(),
    "Pattern Tags": multiSelectProp([
      "Monday Slump", "Post-Social Crash", "Hyperfocus Day",
      "Burnout Signal", "Recovery Day", "High Output", "Context Switch Heavy",
    ]),
  });
  await sleep(300);

  // 8. Overwhelm Triage
  console.log("\n--- Overwhelm Triage ---");
  const overwhelmDb = await createDatabase(pid, "Overwhelm Triage", "🆘", {
    Item: titleProp(),
    Urgency: selectProp([
      "On Fire (today)", "Burning (this week)", "Smouldering (soon)",
      "Background Worry", "Not Actually Urgent",
    ]),
    Controllable: selectProp(["Fully", "Partially", "Not At All"]),
    "Smallest Action": richTextProp(),
    "Actual Deadline": dateProp(),
    "Consequence of Delay": richTextProp(),
    Disposition: selectProp(["Do Now", "Schedule", "Delegate", "Defer", "Drop", "Accept (can't change)"]),
    "Promoted To": relationProp(activationDb.id, false),
    Resolved: checkboxProp(),
    "Resolution Notes": richTextProp(),
    "Triage Date": createdTimeProp(),
  });
  await sleep(300);

  // 9. Seed default transition buffers
  console.log("\n--- Seeding transition buffers ---");
  const defaultTransitions = [
    { name: "Deep Work → Meeting", from: "Deep Work", to: "Meeting", dur: 10, acts: ["Walk", "Water/Tea"], diff: "Moderate", rate: "Sometimes Struggle" },
    { name: "Meeting → Deep Work", from: "Meeting", to: "Deep Work", dur: 15, acts: ["Silence", "Breathing"], diff: "Hard", rate: "Often Fail" },
    { name: "Deep Work → Deep Work (new topic)", from: "Deep Work", to: "Deep Work", dur: 5, acts: ["Stretching"], diff: "Easy", rate: "Usually Fine" },
    { name: "Social → Deep Work", from: "Social", to: "Deep Work", dur: 20, acts: ["Silence", "Walk"], diff: "Hard", rate: "Often Fail" },
    { name: "Commute → Deep Work", from: "Commute", to: "Deep Work", dur: 10, acts: ["Water/Tea", "Nothing"], diff: "Moderate", rate: "Sometimes Struggle" },
    { name: "Deep Work → Break", from: "Deep Work", to: "Break", dur: 5, acts: ["Walk", "Stretching"], diff: "Easy", rate: "Usually Fine" },
    { name: "Admin → Creative", from: "Admin", to: "Creative", dur: 10, acts: ["Music", "Walk"], diff: "Moderate", rate: "Sometimes Struggle" },
  ];

  for (const t of defaultTransitions) {
    await createPage(transitionsDb.id, {
      Transition: { title: [{ type: "text", text: { content: t.name } }] },
      "From Context": { select: { name: t.from } },
      "To Context": { select: { name: t.to } },
      "Buffer Duration (min)": { number: t.dur },
      "Buffer Activity": { multi_select: t.acts.map((a) => ({ name: a })) },
      Difficulty: { select: { name: t.diff } },
      "Success Rate": { select: { name: t.rate } },
    });
    await sleep(200);
  }
  console.log(`  Seeded ${defaultTransitions.length} transition buffers`);

  // 10. Seed default routines
  console.log("\n--- Seeding routines ---");
  const defaultRoutines = [
    {
      name: "Morning Boot Sequence",
      type: "Morning",
      freq: "Daily",
      steps: "1. Water + medication (if applicable)\n2. Check calendar — what's the shape of today?\n3. Review Activation Board — pick 1-3 tasks for today\n4. Set transition buffer for first context switch\n5. Start first task (or start routine work)",
      dur: 15,
      energy: "Low",
      cue: "Waking up / first 30 minutes",
      status: "Active",
      diff: "Easy",
    },
    {
      name: "Work Shutdown",
      type: "Work End",
      freq: "Weekdays",
      steps: "1. Log what was done today (Activation Board → Done)\n2. Capture anything lingering → Brain Cache\n3. Check tomorrow's calendar\n4. Set one intention for tomorrow morning\n5. Close all work apps",
      dur: 10,
      energy: "Low",
      cue: "End of work day / leaving office",
      status: "Active",
      diff: "Easy",
    },
    {
      name: "Weekly Reset",
      type: "Weekly",
      freq: "Weekly",
      steps: "1. Process Brain Cache → triage all unprocessed items\n2. Review Activation Board → drop or defer stale items\n3. Check upcoming deadlines\n4. Log Recovery Tracking for the week\n5. Adjust Energy Schedule if patterns shifted\n6. Set 3 intentions for the week",
      dur: 30,
      energy: "Medium",
      cue: "Sunday evening or Monday morning",
      status: "Active",
      diff: "Needs Effort",
    },
  ];

  for (const r of defaultRoutines) {
    await createPage(routinesDb.id, {
      "Routine Name": { title: [{ type: "text", text: { content: r.name } }] },
      Type: { select: { name: r.type } },
      Frequency: { select: { name: r.freq } },
      Steps: { rich_text: [{ type: "text", text: { content: r.steps } }] },
      "Duration (min)": { number: r.dur },
      "Energy Required": { select: { name: r.energy } },
      "Activation Cue": { rich_text: [{ type: "text", text: { content: r.cue } }] },
      "Current Streak": { number: 0 },
      Status: { select: { name: r.status } },
      "Difficulty Level": { select: { name: r.diff } },
    });
    await sleep(200);
  }
  console.log(`  Seeded ${defaultRoutines.length} routines`);

  // 11. Build dashboard content
  console.log("\n--- Building dashboard ---");
  await appendBlocks(pid, [
    callout(
      "A productivity system designed for how your brain actually executes tasks. Tasks are stored by activation difficulty, not priority.",
      "⚡"
    ),
    divider(),

    heading2("Current State"),
    callout("Check Recovery Tracking to set today's capacity: Full / Reduced / Recovery. Then pick the matching view on the Activation Board.", "📊"),
    divider(),

    heading2("Quick Start"),
    numberedListItem("Dump everything in your head into Brain Cache — no organising, just capture"),
    numberedListItem("Process Brain Cache: mark each item as Task, Idea, Question, etc."),
    numberedListItem("Tasks get promoted to the Activation Board"),
    numberedListItem("On the Activation Board, set Activation Difficulty and Energy Required for each task"),
    numberedListItem("Write the Smallest Next Step — the tiniest action to start"),
    numberedListItem("Check your Energy Schedule to find the right time block"),
    numberedListItem("Pick tasks that match your current energy level"),
    divider(),

    heading2("The Core Idea"),
    paragraph(
      "Most productivity systems sort tasks by priority or due date. " +
      "This system sorts by activation difficulty — how hard it is to START the task, not how important it is. " +
      "A critical task you can't start is less useful than a small task you can."
    ),
    paragraph(""),
    paragraph("Total Friction = Activation Score + Energy Score", true),
    paragraph(""),
    table(
      ["Activation Difficulty", "Score", "Meaning"],
      [
        ["Trivial", "1", "No resistance. Autopilot."],
        ["Low", "2", "Small mental push. Know exactly what to do."],
        ["Medium", "3", "Need to set up context or gather materials."],
        ["High", "4", "Need specific conditions (energy, time, focus)."],
        ["Steep", "5", "Executive function wall. Dread or avoidance."],
      ]
    ),
    divider(),

    heading2("Views Guide"),
    toggle("What Can I Start? (default)", [
      paragraph("Board grouped by Activation Difficulty. Start from the leftmost column."),
    ]),
    toggle("Full Capacity Day", [
      paragraph("All tasks, hardest first. Use when energy is high — eat the frog."),
    ]),
    toggle("Low Energy Day", [
      paragraph("Only tasks with Total Friction ≤ 6. No guilt from seeing hard tasks."),
    ]),
    toggle("Recovery Mode", [
      paragraph("Only Trivial + Low activation, Minimal + Low energy. For barely-functional days."),
    ]),
    toggle("Quick Wins", [
      paragraph("Tasks under 15 minutes with low activation. Build momentum with small completions."),
    ]),
    divider(),

    heading2("Overwhelm Protocol"),
    callout(
      "When everything feels like too much:\n\n" +
      "1. Open Overwhelm Triage\n" +
      "2. Dump every item weighing on you\n" +
      "3. For each: Is it actually urgent? Can you control it?\n" +
      "4. Write the smallest possible action\n" +
      "5. What actually happens if you delay? Be honest.\n" +
      "6. Decide: Do Now / Schedule / Delegate / Defer / Drop / Accept\n\n" +
      "You don't have to do everything. You have to do one small thing.",
      "🆘"
    ),
    divider(),

    heading2("Databases"),
    bulletedListItem("Brain Cache — zero-friction capture inbox"),
    bulletedListItem("Activation Board — tasks indexed by activation difficulty"),
    bulletedListItem("Energy Schedule — map your energy landscape across the week"),
    bulletedListItem("Transition Buffers — structured decompression between context switches"),
    bulletedListItem("Recovery Tracking — daily energy and capacity logging"),
    bulletedListItem("Overwhelm Triage — emergency intake when everything is too much"),
    bulletedListItem("Routines — repeating sequences that reduce daily decisions"),
  ]);

  console.log("\n=== Personal OS complete ===");
  return {
    containerId: pid,
    databases: {
      brainCache: brainCacheDb.id,
      activationBoard: activationDb.id,
      energySchedule: energyDb.id,
      transitionBuffers: transitionsDb.id,
      recoveryTracking: recoveryDb.id,
      overwhelmTriage: overwhelmDb.id,
      routines: routinesDb.id,
    },
  };
}

// Run directly
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"));
if (isMain || process.argv[1]?.endsWith("build-personal-os.js")) {
  buildPersonalOS(NOTION_PARENT_PAGE_ID).catch(console.error);
}
