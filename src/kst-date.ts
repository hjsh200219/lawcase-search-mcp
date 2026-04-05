/**
 * 한국 표준시(KST) 날짜 유틸리티
 * 모든 API 클라이언트에서 일관된 KST 기준 날짜 사용을 보장
 */

export function toKSTDate(): Date {
  const now = new Date();
  return new Date(now.getTime() + 9 * 60 * 60 * 1000);
}

export function formatYYYYMMDD(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export function subtractDays(yyyymmdd: string, days: number): string {
  const y = parseInt(yyyymmdd.slice(0, 4), 10);
  const m = parseInt(yyyymmdd.slice(4, 6), 10) - 1;
  const d = parseInt(yyyymmdd.slice(6, 8), 10);
  const date = new Date(Date.UTC(y, m, d - days));
  return formatYYYYMMDD(date);
}

export function isWeekend(yyyymmdd: string): boolean {
  const y = parseInt(yyyymmdd.slice(0, 4), 10);
  const m = parseInt(yyyymmdd.slice(4, 6), 10) - 1;
  const d = parseInt(yyyymmdd.slice(6, 8), 10);
  const dow = new Date(Date.UTC(y, m, d)).getUTCDay();
  return dow === 0 || dow === 6;
}

/** 주말을 건너뛰어 가장 가까운 직전 평일 반환 */
export function skipWeekends(yyyymmdd: string): string {
  let date = yyyymmdd;
  while (isWeekend(date)) {
    date = subtractDays(date, 1);
  }
  return date;
}
