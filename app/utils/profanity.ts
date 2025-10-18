// app/utils/profanity.ts
import * as Hangul from 'hangul-js';

const DENY_STRICT: RegExp[] = [/씨발|시발|좆|병신|븅신|개새끼|개색기/i];
const DENY_SOFT: RegExp[] = [/ㅈ같|꺼져|닥쳐|미친|엿먹|개같|똥개/i];

// 초성(자음만) 축약 우회 대응
const CHOSEONG_STRICT: RegExp[] = [/ㅅㅂ/, /ㅂㅅ/, /ㄲㅈ/];
const CHOSEONG_SOFT: RegExp[] = [/ㅈ같/];

const LEET_MAP: Record<string, string> = { '5': '오', '0': 'o', '@': 'a' };
// 공백/기호 제거 (따옴표/콤마 포함)
const DROP_RE = /[\s\-_.~!?:*+#/\\()\[\]{}<>|'",]/g;

function squashRepeats(s: string) {
  return s.replace(/([ㅋㅎ])\1{2,}/g, '$1$1').replace(/([!?.])\1{2,}/g, '$1');
}

/** 어떤 값이 와도 문자열로 안전하게 NFKC 정규화 */
function safeNormalizeNFKC(value: unknown): string {
  const s = (value ?? '').toString();
  return typeof s.normalize === 'function' ? s.normalize('NFKC') : s;
}

/** 일반 한국어 문장 정규화 (우회된 자모를 조합해 정상화) */
export function normalizeKo(input: string): string {
  let s = safeNormalizeNFKC(input);
  s = s.replace(/[50@]/g, (m) => LEET_MAP[m] ?? m);
  s = s.replace(DROP_RE, '');
  // 자모 띄어쓰기/분산 입력을 붙여서 조합 (예: ㅅ ㅣ -> 시)
  const jamo = Hangul.disassemble(s).filter((ch) => ch !== ' ');
  s = Hangul.assemble(jamo);
  return squashRepeats(s);
}

/** 자모 분류: 자음/모음/기타 */
function jamoType(ch: string): 'C' | 'V' | null {
  const c = ch.charCodeAt(0);

  // 1) 호환 자모 (Compatibility Jamo)
  if (c >= 0x3131 && c <= 0x314e) return 'C'; // ㄱ-ㅎ
  if (c >= 0x314f && c <= 0x3163) return 'V'; // ㅏ-ㅣ

  // 2) 기본 자모 블록 (Hangul Jamo)
  if (c >= 0x1100 && c <= 0x1112) return 'C'; // choseong (ᄀ-ᄒ)
  if (c >= 0x1161 && c <= 0x1175) return 'V'; // jungseong (ᅡ-ᅵ)
  if (c >= 0x11a8 && c <= 0x11c2) return 'C'; // jongseong (ᆨ-ᇂ)

  // 3) 확장-A (대부분 초성 확장 → 자음으로 취급)
  if (c >= 0xa960 && c <= 0xa97f) return 'C';

  // 4) 확장-B는 실사용이 드뭅니다. 필요하면 세분화해 추가하세요.
  // if (c >= 0xD7B0 && c <= 0xD7FF) { ... }

  return null; // 자모가 아님
}

/** ✅ 자음만 또는 모음만으로만 이뤄졌는지 판별 */
export function isOnlyJamo(input: string): boolean {
  const s = safeNormalizeNFKC(input).replace(DROP_RE, '');
  if (!s) return false;

  // 완성형 한글(가-힣)이 들어있으면 '자모만'은 아님
  if (/[가-힣]/.test(s)) return false;

  let hasC = false;
  let hasV = false;

  for (const ch of s) {
    const t = jamoType(ch);
    if (t === 'C') hasC = true;
    else if (t === 'V') hasV = true;
    else return false; // 자모 이외 문자가 섞이면 자모-only가 아님
  }

  // 자음만 또는 모음만 → true (혼합이면 false)
  return (hasC && !hasV) || (!hasC && hasV);
}

// ✅ 자모 연속 구간 감지: 문장 중에 'ㄴㄹㅇ'·'ㅎㄷ' 같은 덩어리가 있으면 true
function containsJamoRun(input: string, minRun = 2): boolean {
  // 공백/개행은 유지해서 '단어 경계' 역할을 하게 하고, 나머지 기호는 제거
  const s = safeNormalizeNFKC(input).replace(
    /[^\S\r\n]|[\-_.~!?:*+#/\\()\[\]{}<>|'",]/g,
    (m) => (/\s/.test(m) ? m : '') // 공백류는 남기고, 기호는 제거
  );

  let run = 0;
  for (const ch of s) {
    const t = jamoType(ch);
    if (t === 'C' || t === 'V') {
      run += 1;
      if (run >= minRun) return true;
    } else {
      // 자모 연속 끊김 (완성형 한글/숫자/영문/공백 등)
      run = 0;
    }
  }
  return false;
}

/** 초성 문자열 추출: '강아지' -> 'ㄱㅇㅈ' (disassemble 반환은 1차원 배열) */
export function toChoseong(input: string): string {
  const res: string[] = [];
  for (const ch of Array.from(input)) {
    if (/[가-힣]/.test(ch)) {
      const parts = Hangul.disassemble(ch); // [초, 중, (종?)]
      const cho = parts[0];
      if (cho) res.push(cho);
    } else if (/^[ㄱ-ㅎ]$/.test(ch)) {
      // 자음 단독 입력은 그대로 초성 취급
      res.push(ch);
    }
    // 그 외 문자는 무시
  }
  return res.join('');
}

export type ProfanityLevel = 'none' | 'soft' | 'strict';
export type ProfanityResult = { level: ProfanityLevel; matches?: string[] };

export function checkProfanity(text: string): ProfanityResult {
  // 1) 문장 전체가 자모만 → 차단
  if (isOnlyJamo(text)) {
    return { level: 'strict', matches: ['ONLY_JAMO'] };
  }

  // 1-추가) 문장 속 자모 연속 구간(최소 2자) 포함 → 차단
  if (containsJamoRun(text, 2)) {
    return { level: 'strict', matches: ['JAMO_RUN'] };
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

/** (현재 미사용) soft 레벨 전용 마스킹 — 정책상 차단만 한다면 사용하지 않아도 됨 */
export function maskSoft(text: string): string {
  return text.replace(/([가-힣A-Za-z0-9])/g, '•');
}
