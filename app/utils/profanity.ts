// app/utils/profanity.ts

const DENY_STRICT: RegExp[] = [
  /씨발|시발|좆|병신|븅신|개새끼|개색기|조카튼|엿/i,
];

export type ProfanityLevel = 'none' | 'strict';
export type ProfanityResult = { level: ProfanityLevel; matches?: string[] };

export function checkProfanity(text: string): ProfanityResult {
  // 1) 자음만 또는 모음만 → 차단
  if (/^[ㄱ-ㅎㅏ-ㅣ]+$/.test(text)) {
    return { level: 'strict', matches: ['ONLY_JAMO'] };
  }

  // 2) 금지어 매칭
  const hit = DENY_STRICT.find((re) => re.test(text));
  if (hit) return { level: 'strict', matches: [hit.source] };

  return { level: 'none' };
}
