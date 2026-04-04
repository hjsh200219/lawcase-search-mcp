/**
 * 관세청 UNI-PASS MCP 도구 등록 오케스트레이터
 *
 * 52개 도구를 4개 카테고리로 분류하여 등록:
 * - cargo: 화물/컨테이너/운송 (14개)
 * - customs: 통관/신고 (19개)
 * - tariff: 관세/품목/환율 (8개)
 * - entity: 업체/인력 (11개)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCargoTools } from "./unipass/cargo-tools.js";
import { registerCustomsTools } from "./unipass/customs-tools.js";
import { registerTariffTools } from "./unipass/tariff-tools.js";
import { registerEntityTools } from "./unipass/entity-tools.js";

export function registerUnipassTools(
  server: McpServer,
  apiKeys: Record<string, string>,
): void {
  registerCargoTools(server, apiKeys);
  registerCustomsTools(server, apiKeys);
  registerTariffTools(server, apiKeys);
  registerEntityTools(server, apiKeys);
}
