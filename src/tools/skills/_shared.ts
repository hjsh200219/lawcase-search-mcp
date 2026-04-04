/**
 * 스킬 공통 유틸 — action 디스패치 + 파라미터 검증
 */

export type SkillResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

export type ActionHandler<T> = (params: T) => Promise<SkillResult>;

/**
 * action enum → handler 매핑 디스패처 생성.
 * handler 맵에 없는 action이 들어오면 isError 응답 반환.
 */
export function createDispatcher<T extends { action: string }>(
  skillName: string,
  handlers: Record<string, ActionHandler<T>>,
): ActionHandler<T> {
  return async (params: T): Promise<SkillResult> => {
    const handler = handlers[params.action];
    if (!handler) {
      return {
        content: [{
          type: "text",
          text: `[${skillName}] 알 수 없는 action: "${params.action}". 사용 가능: ${Object.keys(handlers).join(", ")}`,
        }],
        isError: true,
      };
    }
    return handler(params);
  };
}

/**
 * 필수 파라미터 누락 시 에러 메시지 반환 헬퍼.
 * 예: requireParam(params, "hs_code", "search_hs")
 */
export function requireParam(
  params: Record<string, unknown>,
  name: string,
  action: string,
): SkillResult | null {
  const value = params[name];
  if (value === undefined || value === null || value === "") {
    return {
      content: [{
        type: "text",
        text: `"${action}" action에는 "${name}" 파라미터가 필요합니다.`,
      }],
      isError: true,
    };
  }
  return null;
}
