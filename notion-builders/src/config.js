import { Client } from "@notionhq/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const envPath = resolve(__dirname, "..", ".env");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env file not found, rely on environment variables
  }
}

loadEnv();

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_PARENT_PAGE_ID = process.env.NOTION_PARENT_PAGE_ID;

if (!NOTION_API_KEY) {
  console.error("Missing NOTION_API_KEY. Set it in .env or as an environment variable.");
  process.exit(1);
}

if (!NOTION_PARENT_PAGE_ID) {
  console.error("Missing NOTION_PARENT_PAGE_ID. Set it in .env or as an environment variable.");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });

export { notion, NOTION_PARENT_PAGE_ID };
