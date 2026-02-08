import { notion } from "./config.js";

/**
 * Create a Notion database under a parent page.
 * Returns the created database object (including .id).
 */
export async function createDatabase(parentPageId, title, icon, properties) {
  const db = await notion.databases.create({
    parent: { type: "page_id", page_id: parentPageId },
    title: [{ type: "text", text: { content: title } }],
    icon: icon ? { type: "emoji", emoji: icon } : undefined,
    properties,
  });
  console.log(`  Created database: ${title} (${db.id})`);
  return db;
}

/**
 * Add a relation property to an existing database.
 * Used when two databases reference each other and both must exist first.
 */
export async function addRelation(databaseId, propertyName, relatedDbId, isSynced = true) {
  const updatePayload = {
    database_id: databaseId,
    properties: {
      [propertyName]: {
        relation: {
          database_id: relatedDbId,
          ...(isSynced ? { type: "dual_property", dual_property: {} } : { type: "single_property", single_property: {} }),
        },
      },
    },
  };
  const result = await notion.databases.update(updatePayload);
  console.log(`  Added relation: ${propertyName} → ${relatedDbId.slice(0, 8)}...`);
  return result;
}

/**
 * Create a page inside a database with the given properties and optional body content.
 */
export async function createPage(databaseId, properties, children = []) {
  const page = await notion.pages.create({
    parent: { database_id: databaseId },
    properties,
    children: children.length > 0 ? children : undefined,
  });
  return page;
}

/**
 * Create a sub-page under a parent page (not a database entry).
 */
export async function createSubPage(parentPageId, title, icon, children = []) {
  const page = await notion.pages.create({
    parent: { page_id: parentPageId },
    icon: icon ? { type: "emoji", emoji: icon } : undefined,
    properties: {
      title: { title: [{ type: "text", text: { content: title } }] },
    },
    children: children.length > 0 ? children : undefined,
  });
  console.log(`  Created page: ${title} (${page.id})`);
  return page;
}

/**
 * Append blocks (content) to an existing page or block.
 */
export async function appendBlocks(blockId, children) {
  if (children.length === 0) return;
  // Notion API limit: 100 blocks per request
  for (let i = 0; i < children.length; i += 100) {
    const batch = children.slice(i, i + 100);
    await notion.blocks.children.append({
      block_id: blockId,
      children: batch,
    });
  }
}

// --- Block builders ---

export function heading1(text) {
  return {
    object: "block",
    type: "heading_1",
    heading_1: { rich_text: [{ type: "text", text: { content: text } }] },
  };
}

export function heading2(text) {
  return {
    object: "block",
    type: "heading_2",
    heading_2: { rich_text: [{ type: "text", text: { content: text } }] },
  };
}

export function heading3(text) {
  return {
    object: "block",
    type: "heading_3",
    heading_3: { rich_text: [{ type: "text", text: { content: text } }] },
  };
}

export function paragraph(text, bold = false) {
  return {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: text
        ? [{ type: "text", text: { content: text }, annotations: { bold } }]
        : [],
    },
  };
}

export function bulletedListItem(text, bold = false) {
  return {
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [{ type: "text", text: { content: text }, annotations: { bold } }],
    },
  };
}

export function numberedListItem(text) {
  return {
    object: "block",
    type: "numbered_list_item",
    numbered_list_item: {
      rich_text: [{ type: "text", text: { content: text } }],
    },
  };
}

export function callout(text, icon = "💡") {
  return {
    object: "block",
    type: "callout",
    callout: {
      rich_text: [{ type: "text", text: { content: text } }],
      icon: { type: "emoji", emoji: icon },
    },
  };
}

export function divider() {
  return { object: "block", type: "divider", divider: {} };
}

export function toggle(text, children = []) {
  return {
    object: "block",
    type: "toggle",
    toggle: {
      rich_text: [{ type: "text", text: { content: text } }],
      children,
    },
  };
}

export function quote(text) {
  return {
    object: "block",
    type: "quote",
    quote: {
      rich_text: [{ type: "text", text: { content: text } }],
    },
  };
}

/**
 * Build a simple inline table block.
 * Notion API supports table blocks with table_row children.
 */
export function table(headers, rows) {
  const width = headers.length;
  const headerRow = {
    object: "block",
    type: "table_row",
    table_row: {
      cells: headers.map((h) => [{ type: "text", text: { content: h } }]),
    },
  };
  const dataRows = rows.map((row) => ({
    object: "block",
    type: "table_row",
    table_row: {
      cells: row.map((cell) => [{ type: "text", text: { content: String(cell) } }]),
    },
  }));
  return {
    object: "block",
    type: "table",
    table: {
      table_width: width,
      has_column_header: true,
      has_row_header: false,
      children: [headerRow, ...dataRows],
    },
  };
}

// --- Property definition helpers ---

export function titleProp() {
  return { title: {} };
}

export function richTextProp() {
  return { rich_text: {} };
}

export function numberProp(format = "number") {
  return { number: { format } };
}

export function selectProp(options) {
  return {
    select: {
      options: options.map((name) => ({ name })),
    },
  };
}

export function multiSelectProp(options) {
  return {
    multi_select: {
      options: options.map((name) => ({ name })),
    },
  };
}

export function dateProp() {
  return { date: {} };
}

export function checkboxProp() {
  return { checkbox: {} };
}

export function urlProp() {
  return { url: {} };
}

export function emailProp() {
  return { email: {} };
}

export function phoneProp() {
  return { phone_number: {} };
}

export function peopleProp() {
  return { people: {} };
}

export function createdTimeProp() {
  return { created_time: {} };
}

export function formulaProp(expression) {
  return { formula: { expression } };
}

export function relationProp(databaseId, synced = true) {
  if (synced) {
    return {
      relation: {
        database_id: databaseId,
        type: "dual_property",
        dual_property: {},
      },
    };
  }
  return {
    relation: {
      database_id: databaseId,
      type: "single_property",
      single_property: {},
    },
  };
}

export function rollupProp(relationName, rollupPropertyName, func = "count") {
  return {
    rollup: {
      relation_property_name: relationName,
      rollup_property_name: rollupPropertyName,
      function: func,
    },
  };
}

/** Small delay to avoid rate limits */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
