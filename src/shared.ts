/**
 * 공유 유틸리티 — MCP 도구 핸들러 공통 함수
 */

export const MAX_CONTENT_LENGTH = 8000;

export function truncate(text: string, max = MAX_CONTENT_LENGTH): string {
  if (text.length <= max) return text;
  return text.substring(0, max) + "\n\n... (내용이 길어 일부만 표시)";
}

export function errorResponse(label: string, error: unknown) {
  const message = error instanceof Error ? error.message : "알 수 없는 오류";
  return {
    content: [{ type: "text" as const, text: `${label} 오류: ${message}` }],
    isError: true,
  };
}
