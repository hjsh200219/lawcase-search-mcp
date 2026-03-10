#!/usr/bin/env node

/**
 * 법제처 국가법령정보센터 MCP 서버 - stdio 진입점
 * Claude Desktop 등 로컬 MCP 클라이언트용
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

const LAW_API_OC = process.env.LAW_API_OC || "";

if (!LAW_API_OC) {
  console.error(
    "LAW_API_OC 환경변수가 설정되지 않았습니다. 법제처 API 인증코드를 설정하세요."
  );
  process.exit(1);
}

const server = createServer(LAW_API_OC);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("MCP 서버 시작 실패:", error);
  process.exit(1);
});
