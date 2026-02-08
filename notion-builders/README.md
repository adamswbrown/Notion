# Notion Template Builders

Node.js scripts that programmatically create full Notion workspace templates via the Notion API. Each script builds databases with properties, relations, formulas, seed data, and dashboard pages.

## Setup

### 1. Create a Notion Integration

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Name it (e.g. "Template Builder")
4. Select the workspace where templates will be created
5. Copy the API key (starts with `secret_`)

### 2. Create a Parent Page

1. Create a blank page in your Notion workspace
2. Click the `...` menu → "Connect to" → select your integration
3. Copy the page ID from the URL: `notion.so/Your-Page-**{page_id}**`
   - The page ID is the 32-character hex string at the end of the URL (remove any dashes)

### 3. Configure Environment

```bash
cd notion-builders
cp .env.example .env
```

Edit `.env`:
```
NOTION_API_KEY=secret_your_token_here
NOTION_PARENT_PAGE_ID=your_32_char_page_id_here
```

### 4. Install Dependencies

```bash
npm install
```

## Usage

Build individual templates or all three:

```bash
# Build one template
npm run build:control-tower
npm run build:decision-canvas
npm run build:personal-os

# Build all three
npm run build:all
```

Each script creates a sub-page under your parent page containing all databases, relations, seed data, and a dashboard.

## What Gets Created

### Customer Engagement Control Tower (`build:control-tower`)
7 databases: Accounts, Engagements, Calls/Meetings, Deliverables, Risks & Blockers, Commercials, Stakeholders

Key formulas: Account Health, Renewal Flag, Budget Burn, Risk Score, Overdue detection

### Decision Engine Canvas (`build:decision-canvas`)
3 databases: Decisions, Evaluation Criteria, Option Scores

Includes: 14 pre-populated evaluation criteria, sample decision template with all 9 sections (Context → Constraints → Signals → Options → Tradeoffs → Risk Surface → Recommendation → "If We Do Nothing" → Business Impact), weighted scoring calculator

### Personal Operating System (`build:personal-os`)
7 databases: Brain Cache, Activation Board, Energy Schedule, Transition Buffers, Recovery Tracking, Overwhelm Triage, Routines

Includes: 7 pre-populated transition buffers, 3 default routines (Morning Boot, Work Shutdown, Weekly Reset), activation difficulty guide, overwhelm protocol

## Architecture

```
src/
  config.js         - API client + env loading
  helpers.js        - Database/page/block creation helpers
  build-control-tower.js   - Template 1
  build-decision-canvas.js - Template 2
  build-personal-os.js     - Template 3
  build-all.js             - Runs all three
```

Each builder exports a default async function that accepts a parent page ID, so they can be imported and composed in custom scripts.

## Notes

- Notion API rate limit is 3 requests/second. Scripts include small delays between operations.
- Relations are created as dual properties where both databases need to reference each other, or single properties for one-directional lookups.
- Formulas use Notion's formula 2.0 syntax.
- Views cannot be created via the Notion API — databases are created with default views. See the `templates/` spec files for view configurations to set up manually.
- Automations cannot be created via the API — see the spec files for automation rules to configure in Notion's automation panel.
