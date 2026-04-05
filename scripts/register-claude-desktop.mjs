#!/usr/bin/env node

/**
 * Claude Desktop에 public-data-mcp 서버를 자동 등록하는 스크립트
 *
 * Railway 배포된 리모트 서버에 mcp-remote로 연결합니다.
 * 환경변수는 Railway 서버에 설정되어 있으므로 로컬에 불필요.
 *
 * 사용법:
 *   node scripts/register-claude-desktop.mjs                    # Railway 리모트 등록 (기본)
 *   node scripts/register-claude-desktop.mjs --local             # 로컬 stdio 등록
 *   node scripts/register-claude-desktop.mjs --url https://...   # 커스텀 URL
 *   node scripts/register-claude-desktop.mjs --remove            # 제거
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const SERVER_NAME = "public-data-mcp";
const DEFAULT_RAILWAY_URL = "https://public-data.up.railway.app/mcp";

const CLAUDE_CONFIG_PATH = resolve(
  homedir(),
  "Library/Application Support/Claude/claude_desktop_config.json",
);

function parseEnvFile(envPath) {
  if (!existsSync(envPath)) return {};
  const content = readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }
  return env;
}

function loadClaudeConfig() {
  if (!existsSync(CLAUDE_CONFIG_PATH)) {
    console.error(`Claude Desktop 설정 파일을 찾을 수 없습니다: ${CLAUDE_CONFIG_PATH}`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(CLAUDE_CONFIG_PATH, "utf-8"));
}

function saveClaudeConfig(config) {
  writeFileSync(CLAUDE_CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
}

function registerRemote(mcpUrl) {
  const config = loadClaudeConfig();
  if (!config.mcpServers) config.mcpServers = {};

  config.mcpServers[SERVER_NAME] = { url: mcpUrl };

  saveClaudeConfig(config);
  console.log(`\n  public-data-mcp (리모트) 등록 완료`);
  console.log(`  URL: ${mcpUrl}`);
  console.log(`  방식: 네이티브 Remote MCP (서버 재배포 시 자동 재연결)\n`);
  console.log(`  Claude Desktop을 재시작하세요.\n`);
}

function registerLocal() {
  const envPath = resolve(PROJECT_ROOT, ".env");
  const env = parseEnvFile(envPath);
  if (Object.keys(env).length === 0) {
    console.error(`.env 파일이 없거나 비어 있습니다: ${envPath}`);
    process.exit(1);
  }

  const distPath = resolve(PROJECT_ROOT, "dist/index.js");
  if (!existsSync(distPath)) {
    console.error(`빌드 산출물이 없습니다. 먼저 npm run build를 실행하세요.`);
    process.exit(1);
  }

  const config = loadClaudeConfig();
  if (!config.mcpServers) config.mcpServers = {};

  config.mcpServers[SERVER_NAME] = {
    command: "node",
    args: ["--use-system-ca", distPath],
    env,
  };

  saveClaudeConfig(config);
  console.log(`\n  public-data-mcp (로컬) 등록 완료`);
  console.log(`  환경변수 ${Object.keys(env).length}개 포함\n`);
  console.log(`  Claude Desktop을 재시작하세요.\n`);
}

function remove() {
  const config = loadClaudeConfig();
  if (!config.mcpServers?.[SERVER_NAME]) {
    console.log(`\n  ${SERVER_NAME}가 등록되어 있지 않습니다.\n`);
    return;
  }
  delete config.mcpServers[SERVER_NAME];
  saveClaudeConfig(config);
  console.log(`\n  ${SERVER_NAME}가 Claude Desktop에서 제거되었습니다.`);
  console.log(`  Claude Desktop을 재시작하세요.\n`);
}

const args = process.argv.slice(2);
if (args.includes("--remove")) {
  remove();
} else if (args.includes("--local")) {
  registerLocal();
} else {
  const urlIdx = args.indexOf("--url");
  const mcpUrl = urlIdx !== -1 && args[urlIdx + 1]
    ? args[urlIdx + 1]
    : DEFAULT_RAILWAY_URL;
  registerRemote(mcpUrl);
}
