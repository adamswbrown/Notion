import { NOTION_PARENT_PAGE_ID } from "./config.js";
import buildControlTower from "./build-control-tower.js";
import buildDecisionCanvas from "./build-decision-canvas.js";
import buildPersonalOS from "./build-personal-os.js";

async function buildAll() {
  console.log("Building all templates into parent page:", NOTION_PARENT_PAGE_ID);
  console.log("=".repeat(60));

  const results = {};

  try {
    results.controlTower = await buildControlTower(NOTION_PARENT_PAGE_ID);
  } catch (err) {
    console.error("Control Tower failed:", err.message);
  }

  try {
    results.decisionCanvas = await buildDecisionCanvas(NOTION_PARENT_PAGE_ID);
  } catch (err) {
    console.error("Decision Canvas failed:", err.message);
  }

  try {
    results.personalOS = await buildPersonalOS(NOTION_PARENT_PAGE_ID);
  } catch (err) {
    console.error("Personal OS failed:", err.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("Build complete. Database IDs:\n");
  console.log(JSON.stringify(results, null, 2));
}

buildAll().catch(console.error);
