// app/utils/profanity.ts
import * as Hangul from 'hangul-js';

const DENY_STRICT: RegExp[] = [/씨발|시발|좆|병신|븅신|개새끼|개색기/i];
const DENY_SOFT: RegExp[] = [/ㅈ같|꺼져|닥쳐|미친|엿먹|개같|똥개/i];

// 초성(자음만) 축약 우회 대응
const CHOSEONG_STRICT: RegExp[] = [/ㅅㅂ/, /ㅂㅅ/, /ㄲㅈ/];
const CHOSEONG_SOFT: RegExp[] = [/ㅈ같/];

const LEET_MAP: Record<string, string> = { '5': '오', '0': 'o', '@': 'a' };
const DROP_RE = /[\s\-_.~!?:*+#/\\()\[\]{}<>|']/g;

function squashRepeats(s: string) {
  return s.replace(/([ㅋㅎ])\1{2,}/g, '$1$1').replace(/([!?.])\1{2,}/g, '$1');
}

export function normalizeKo(input: string): string {
  let s = input.normalize('NFKC');
  s = s.replace(/[50@]/g, (m) => LEET_MAP[m] ?? m);
  s = s.replace(DROP_RE, '');
  const jamo = Hangul.disassemble(s).filter((ch) => ch !== ' ');
  s = Hangul.assemble(jamo);
  return squashRepeats(s);
}

/** 자모 검사 전용 정규화 (assemble 하지 않음) */
function normalizeForJamoCheck(input: string): string[] {
  let s = input.normalize('NFKC');
  s = s.replace(/[50@]/g, (m) => LEET_MAP[m] ?? m);
  s = s.replace(DROP_RE, '');
  return Hangul.disassemble(s).filter((ch) => ch !== ' ');
}

/**
 * 자모만으로 이루어졌는지 검사 (자음만, 모음만, 자음+모음 혼합 모두 포함)
 * 전부가 [ㄱ-ㅎ] 또는 [ㅏ-ㅣ] 범위에 속하면 true
 */
export function isOnlyJamo(input: string): boolean {
  const jamo = normalizeForJamoCheck(input);
  if (jamo.length === 0) return false;
  return jamo.every((ch) => /^[ㄱ-ㅎㅏ-ㅣ]$/.test(ch));
}

export function toChoseong(input: string): string {
  const chars = Array.from(input);
  const res: string[] = [];
  for (const ch of chars) {
    if (/[가-힣]/.test(ch)) {
      const jamo = Hangul.disassemble(ch, true) as string[][];
      const cho = jamo[0]?.[0] ?? ch;
      res.push(cho);
    } else if (/^[ㄱ-ㅎ]$/.test(ch)) {
      res.push(ch);
    }
  }
  return res.join('');
}

export type ProfanityLevel = 'none' | 'soft' | 'strict';
export type ProfanityResult = { level: ProfanityLevel; matches?: string[] };

export function checkProfanity(text: string): ProfanityResult {
  // 1) 자모만(자/모 단독 + 혼합 포함) → 무조건 strict 차단
  if (isOnlyJamo(text)) {
    return { level: 'strict', matches: ['ONLY_JAMO'] };
  }

  const n = normalizeKo(text);

  // 2) 원문 매칭
  const sHit = DENY_STRICT.find((re) => re.test(n));
  if (sHit) return { level: 'strict', matches: [sHit.source] };

  const wHit = DENY_SOFT.find((re) => re.test(n));
  if (wHit) return { level: 'soft', matches: [wHit.source] };

  // 3) 초성 축약 매칭
  const cho = toChoseong(n);
  const csHit = CHOSEONG_STRICT.find((re) => re.test(cho));
  if (csHit) return { level: 'strict', matches: [csHit.source] };

  const cwHit = CHOSEONG_SOFT.find((re) => re.test(cho));
  if (cwHit) return { level: 'soft', matches: [cwHit.source] };

  return { level: 'none' };
}

// (선택) soft 레벨 마스킹: 실제론 부분 마스킹 권장
export function maskSoft(text: string): string {
  return text.replace(/([가-힣A-Za-z0-9])/g, '•');
}
