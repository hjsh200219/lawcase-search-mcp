/**
 * 법제처 국가법령정보센터 MCP 서버 - Remote HTTP 진입점
 * Claude 모바일/웹 앱에서 Remote MCP 커넥터로 연결
 */

import express from "express";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./server.js";
import { createApiRouter } from "./api-routes.js";
import { generateOpenApiSpec } from "./openapi.js";

const LAW_API_OC = process.env.LAW_API_OC || "";
const PORT = parseInt(process.env.PORT || "3000", 10);

if (!LAW_API_OC) {
  console.error(
    "LAW_API_OC 환경변수가 설정되지 않았습니다. 법제처 API 인증코드를 설정하세요."
  );
  process.exit(1);
}

const app = express();
app.use(express.json());

// 세션별 transport 관리
const sessions = new Map<string, StreamableHTTPServerTransport>();

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", server: "law-search", version: "4.0.0" });
});

// REST API (GPT Actions 등 일반 HTTP 클라이언트용)
app.use("/api", createApiRouter(LAW_API_OC));

// OpenAPI 스펙 (GPT Actions 임포트용)
app.get("/openapi.json", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  res.json(generateOpenApiSpec(baseUrl));
});

// MCP endpoint — POST (클라이언트 → 서버 메시지)
app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  let transport: StreamableHTTPServerTransport;

  if (sessionId && sessions.has(sessionId)) {
    // 기존 세션
    transport = sessions.get(sessionId)!;
  } else if (!sessionId) {
    // 새 세션 (InitializeRequest)
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
    });

    transport.onclose = () => {
      if (transport.sessionId) {
        sessions.delete(transport.sessionId);
      }
    };

    const server = createServer(LAW_API_OC);
    await server.connect(transport);

    await transport.handleRequest(req, res, req.body);

    // handleRequest 후 sessionId가 생성되므로 여기서 저장
    if (transport.sessionId) {
      sessions.set(transport.sessionId, transport);
    }
    return;
  } else {
    // 잘못된 세션 ID
    res.status(404).json({ error: "Session not found" });
    return;
  }

  await transport.handleRequest(req, res, req.body);
});

// MCP endpoint — GET (서버 → 클라이언트 SSE 스트림)
app.get("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (!sessionId || !sessions.has(sessionId)) {
    res.status(400).json({ error: "Invalid or missing session ID" });
    return;
  }

  const transport = sessions.get(sessionId)!;
  await transport.handleRequest(req, res);
});

// MCP endpoint — DELETE (세션 종료)
app.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (sessionId && sessions.has(sessionId)) {
    const transport = sessions.get(sessionId)!;
    await transport.close();
    sessions.delete(sessionId);
  }

  res.status(200).json({ message: "Session closed" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`law-search remote server running on port ${PORT}`);
  console.log(`MCP endpoint: http://0.0.0.0:${PORT}/mcp`);
  console.log(`REST API: http://0.0.0.0:${PORT}/api`);
  console.log(`OpenAPI spec: http://0.0.0.0:${PORT}/openapi.json`);
});
