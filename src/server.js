// stdio entry point (MausBot). Reads Facebook credentials from the .env next
// to this server. Tokens are never logged.
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadEnvFiles, requireEnv } from "./env.js";
import { registerTools } from "./tools.js";

const dir = dirname(fileURLToPath(import.meta.url));
const env = loadEnvFiles([join(dir, "..", ".env")]);
requireEnv(env, ["FB_PAGE_TOKEN", "FB_PAGE_ID", "FB_LONG_TOKEN"]);

const server = new McpServer({
  name: "facebook-draft",
  version: "1.0.0",
});
registerTools(server, {
  pageToken: env.FB_PAGE_TOKEN,
  pageId: env.FB_PAGE_ID,
  userToken: env.FB_LONG_TOKEN,
});

await server.connect(new StdioServerTransport());
console.error("facebook-draft (stdio) ready");
