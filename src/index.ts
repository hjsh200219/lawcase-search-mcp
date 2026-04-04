#!/usr/bin/env node

/**
 * Korean Public Data MCP 서버 - stdio 진입점
 * Claude Desktop 등 로컬 MCP 클라이언트용
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer, type ServerConfig } from "./server.js";

const LAW_API_OC = process.env.LAW_API_OC || "";
const DART_API_KEY = process.env.DART_API_KEY || "";
const DATA20_SERVICE_KEY = process.env.DATA20_SERVICE_KEY || "";

if (!LAW_API_OC) {
  console.error(
    "LAW_API_OC 환경변수가 설정되지 않았습니다. 법제처 API 인증코드를 설정하세요."
  );
  process.exit(1);
}

if (!DART_API_KEY) {
  console.warn("DART_API_KEY 미설정 — DART 공시 도구 비활성화");
}

if (!DATA20_SERVICE_KEY) {
  console.warn("DATA20_SERVICE_KEY 미설정 — 공공데이터포털 도구 비활성화");
}

const serverConfig: ServerConfig = {
  lawApiOc: LAW_API_OC,
  dartApiKey: DART_API_KEY || undefined,
  data20ServiceKey: DATA20_SERVICE_KEY || undefined,
};

const server = createServer(serverConfig);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("MCP 서버 시작 실패:", error);
  process.exit(1);
});
