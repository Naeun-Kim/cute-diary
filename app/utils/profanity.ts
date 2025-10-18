// app/utils/profanity.ts
import * as Hangul from 'hangul-js';

const DENY_STRICT: RegExp[] = [/씨발|시발|좆|병신|븅신|개새끼|개색기/i];
const DENY_SOFT: RegExp[] = [/ㅈ같|꺼져|닥쳐|미친|엿먹|개같|똥개/i];

// 초성(자음만) 축약 우회 대응
const CHOSEONG_STRICT: RegExp[] = [/ㅅㅂ/, /ㅂㅅ/, /ㄲㅈ/];
const CHOSEONG_SOFT: RegExp[] = [/ㅈ같/];

const LEET_MAP: Record<string, string> = { '5': '오', '0': 'o', '@': 'a' };
// 공백/기호 제거
const DROP_RE = /[\s\-_.~!?:*+#/\\()\[\]{}<>|',"]/g;

function squashRepeats(s: string) {
  return s.replace(/([ㅋㅎ])\1{2,}/g, '$1$1').replace(/([!?.])\1{2,}/g, '$1');
}

export function normalizeKo(input: string): string {
  let s = input.normalize('NFKC');
  s = s.replace(/[50@]/g, (m) => LEET_MAP[m] ?? m);
  s = s.replace(DROP_RE, '');
  // 자모 우회 입력을 한 번 붙여주되(예: ㅅ ㅣ -> 시) 정상 문장을 위한 과정
  const jamo = Hangul.disassemble(s).filter((ch) => ch !== ' ');
  s = Hangul.assemble(jamo);
  return squashRepeats(s);
}

/** ⛳ 자음/모음만인지 간단/정확하게 판별 (재조합 X) */
export function isOnlyJamo(input: string): boolean {
  let s = input.normalize('NFKC').replace(DROP_RE, '');
  if (!s) return false;
  // 완성형 한글(가-힣)이 하나라도 있으면 "자모만"은 아님
  if (/[가-힣]/.test(s)) return false;
  // 남은 문자가 전부 자음(ㄱ-ㅎ) 또는 모음(ㅏ-ㅣ)인가?
  return /^[ㄱ-ㅎㅏ-ㅣ]+$/.test(s);
}

/** 초성 문자열만 추출: '강아지' -> 'ㄱㅇㅈ' */
export function toChoseong(input: string): string {
  const res: string[] = [];
  for (const ch of Array.from(input)) {
    if (/[가-힣]/.test(ch)) {
      // disassemble은 1차원 배열 반환: [초성, 중성, 종성?]
      const parts = Hangul.disassemble(ch);
      const cho = parts[0]; // 초성
      if (cho) res.push(cho);
    } else if (/^[ㄱ-ㅎ]$/.test(ch)) {
      // 자음 단독 입력은 그대로 초성 취급
      res.push(ch);
    }
    // 그 외 문자는 초성 없음 → 무시
  }
  return res.join('');
}

export type ProfanityLevel = 'none' | 'soft' | 'strict';
export type ProfanityResult = { level: ProfanityLevel; matches?: string[] };

export function checkProfanity(text: string): ProfanityResult {
  // 1) 자모만(자음/모음만 또는 혼합) → 즉시 차단
  if (isOnlyJamo(text)) {
    return { level: 'strict', matches: ['ONLY_JAMO'] };
  }

  const n = normalizeKo(text);

  // 2) 원문 매칭
  const sHit = DENY_STRICT.find((re) => re.test(n));
  if (sHit) return { level: 'strict', matches: [sHit.source] };
  const wHit = DENY_SOFT.find((re) => re.test(n));
  if (wHit) return { level: 'soft', matches: [wHit.source] };

  // 3) 초성 축약 매칭 (예: ㅅㅂ)
  const cho = toChoseong(n);
  const csHit = CHOSEONG_STRICT.find((re) => re.test(cho));
  if (csHit) return { level: 'strict', matches: [csHit.source] };
  const cwHit = CHOSEONG_SOFT.find((re) => re.test(cho));
  if (cwHit) return { level: 'soft', matches: [cwHit.source] };

  return { level: 'none' };
}
