# Facebook Page MCP server (stdio, for a MausBot)

A small MCP server that lets a MausBot work with a Facebook Page through the
Graph API — unpublished drafts, plus one gated publish. Built by Muse-proto.

## Rules

- **Drafts by default.** The only writes are create / edit / delete of
  *unpublished drafts*. `create_draft` hard-codes `published: false` and takes
  no parameter that can change it. `edit_draft` / `delete_draft` first verify
  the post is an unpublished draft on the configured Page and refuse anything
  published.
- **`publish_draft` is gated, not open.** It takes ONLY a draft post id — no
  text or message parameter, so it cannot invent or post new content. It first
  verifies the post is an unpublished draft on the configured Page and refuses
  anything already published or not on that Page. Use it only after the page
  owner has explicitly approved that specific draft.
- There is **no** schedule, reply, comment, hide, or delete-live-post code
  anywhere in this repo. Nothing here can schedule a post, reply to one, or
  delete a live post.
- The page owner approves every post before it goes live — either by approving
  a specific draft for `publish_draft`, or by publishing it in Facebook.

## Tools

| Tool | What it does |
|---|---|
| `read_page_posts` | Latest posts on the Page (published + drafts). Read-only. |
| `read_page_drafts` | Unpublished draft posts. Read-only. |
| `create_draft` | Create a draft post (never published). |
| `edit_draft` | Edit a draft's text (refuses published posts). |
| `delete_draft` | Delete a draft (refuses published posts). |
| `publish_draft` | Publish ONE existing draft, id only, only after the page owner approves that draft (refuses published posts and posts not on this Page). |
| `search_ads` | Search the Meta Ad Library for businesses running ads (warm leads). Read-only. |

## How drafts are listed

Facebook has no working "list drafts" edge, and `/feed` only returns published
posts, so an unpublished draft is invisible to the API's feed. This wrapper
remembers every draft it creates in `drafts.json` (next to `.env`, mode 600,
never committed — it holds post ids and message snippets only, no tokens).
`read_page_drafts` re-checks each recorded id directly and prunes ids that come
back published or gone. `edit_draft` updates the stored snippet; `delete_draft`
and `publish_draft` remove the id from the record. Drafts created before this
record existed (or by anything else) will not appear in `read_page_drafts`
until they are re-created through this wrapper.

## Config

Copy `.env.example` to `.env` (mode 600, never committed) and fill in:

- `FB_APP_ID`, `FB_APP_SECRET`
- `FB_PAGE_ID`
- `FB_PAGE_TOKEN` (never-expiring Page token)
- `FB_LONG_TOKEN` (long-lived user token, ~60 days, for Ad Library search)
- `FB_SHORT_TOKEN` is optional and not required at runtime

## Run

```
npm install
npm start          # stdio transport; started by MausBot per bot
```

Example MausBot entry (`config.json` → `mcpServers`):

```json
"facebook-draft": {
  "command": "node",
  "args": ["/path/to/muse-facebook-mcp-draft/src/server.js"],
  "env": {},
  "enabled": true
}
```

No build step — plain ESM run directly by node.

## appsecret_proof

Every Graph API call carries `appsecret_proof` (HMAC-SHA256 of the access token, keyed with
`FB_APP_SECRET`, hex), so the Meta app can keep **Require App Secret** turned on. The server
refuses to start without `FB_APP_SECRET`, and never logs it.
