/**
 * Korean Public Data MCP 서버 - 도구 등록
 * stdio / remote 진입점에서 공통으로 사용
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerLawTools } from "./tools/law-tools.js";
import { registerDartTools } from "./tools/dart-tools.js";
import { registerData20Tools } from "./tools/data20-tools.js";
import { registerUnipassTools } from "./tools/unipass-tools.js";
import { registerEximTools } from "./tools/exim-tools.js";
import { registerMafraTools } from "./tools/mafra-tools.js";

export interface ServerConfig {
  lawApiOc: string;
  dartApiKey?: string;
  data20ServiceKey?: string;
  unipassApiKeys?: Record<string, string>;
  eximApiKey?: string;
  mafraApiKey?: string;
}

export function createServer(config: ServerConfig): McpServer {
  const server = new McpServer({
    name: "public-data",
    version: "5.0.0",
  });

  registerLawTools(server, config.lawApiOc);

  if (config.dartApiKey) {
    registerDartTools(server, config.dartApiKey);
  }

  if (config.data20ServiceKey) {
    registerData20Tools(server, config.data20ServiceKey);
  }

  if (config.unipassApiKeys && Object.keys(config.unipassApiKeys).length > 0) {
    registerUnipassTools(server, config.unipassApiKeys);
  }

  if (config.eximApiKey) {
    registerEximTools(server, config.eximApiKey);
  }

  if (config.mafraApiKey) {
    registerMafraTools(server, config.mafraApiKey);
  }

  return server;
}
