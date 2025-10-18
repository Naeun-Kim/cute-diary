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

// 자음/모음만으로 이뤄졌는지(완성형 → 자모 분해 후 검사)
export function isOnlyConsonantsOrVowels(input: string): boolean {
  const n = normalizeKo(input);
  const jamo = Hangul.disassemble(n).filter((ch) => ch !== ' ');
  if (jamo.length === 0) return false;
  const onlyConsonants = jamo.every((ch) => /[ㄱ-ㅎ]/.test(ch));
  const onlyVowels = jamo.every((ch) => /[ㅏ-ㅣ]/.test(ch));
  return onlyConsonants || onlyVowels;
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
  // 1) 자음/모음만 → 무조건 strict
  if (isOnlyConsonantsOrVowels(text)) {
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
