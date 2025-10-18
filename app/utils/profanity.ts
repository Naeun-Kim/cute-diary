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
  console.log('normalizeKo - 입력:', input);
  let s = input.normalize('NFKC');
  console.log('normalizeKo - NFKC 후:', s);
  s = s.replace(/[50@]/g, (m) => LEET_MAP[m] ?? m);
  console.log('normalizeKo - 숫자변환 후:', s);
  s = s.replace(DROP_RE, '');
  console.log('normalizeKo - 특수문자 제거 후:', s);
  const jamo = Hangul.disassemble(s).filter((ch) => ch !== ' ');
  console.log('normalizeKo - 자모분해:', jamo);
  s = Hangul.assemble(jamo);
  console.log('normalizeKo - 자모조합 후:', s);
  const result = squashRepeats(s);
  console.log('normalizeKo - 반복제거 후:', result);
  return result;
}

// 자음/모음만으로 이뤄졌는지(완성형 → 자모 분해 후 검사)
export function isOnlyConsonantsOrVowels(input: string): boolean {
  const n = normalizeKo(input);
  const jamo = Hangul.disassemble(n).filter((ch) => ch !== ' ');

  console.log('isOnlyConsonantsOrVowels - 원본:', input);
  console.log('isOnlyConsonantsOrVowels - 정규화:', n);
  console.log('isOnlyConsonantsOrVowels - 자모분해:', jamo);

  if (jamo.length === 0) {
    console.log('isOnlyConsonantsOrVowels - 자모 길이 0');
    return false;
  }

  // 모든 문자가 자음이거나 모음인지 확인
  const onlyConsonants = jamo.every((ch) => /[ㄱ-ㅎ]/.test(ch));
  const onlyVowels = jamo.every((ch) => /[ㅏ-ㅣ]/.test(ch));

  console.log('isOnlyConsonantsOrVowels - 자음만:', onlyConsonants);
  console.log('isOnlyConsonantsOrVowels - 모음만:', onlyVowels);
  console.log('isOnlyConsonantsOrVowels - 결과:', onlyConsonants || onlyVowels);

  return onlyConsonants || onlyVowels;
}

// 자음/모음만으로 이루어진 부분이 있는지 확인 (혼합 텍스트용)
export function hasOnlyConsonantsOrVowels(input: string): boolean {
  const n = normalizeKo(input);
  const jamo = Hangul.disassemble(n).filter((ch) => ch !== ' ');

  console.log('hasOnlyConsonantsOrVowels - 정규화된 텍스트:', n);
  console.log('hasOnlyConsonantsOrVowels - 자모 분해:', jamo);

  // 연속된 자음/모음 그룹이 있는지 확인
  let currentGroup = '';
  for (let i = 0; i < jamo.length; i++) {
    const ch = jamo[i];
    if (/[ㄱ-ㅎㅏ-ㅣ]/.test(ch)) {
      currentGroup += ch;
    } else {
      // 완성형 한글을 만나면 현재 그룹 검사
      if (currentGroup.length >= 3) {
        console.log('현재 그룹 검사:', currentGroup);
        const onlyConsonants = currentGroup
          .split('')
          .every((c) => /[ㄱ-ㅎ]/.test(c));
        const onlyVowels = currentGroup
          .split('')
          .every((c) => /[ㅏ-ㅣ]/.test(c));
        console.log('자음만:', onlyConsonants, '모음만:', onlyVowels);
        if (onlyConsonants || onlyVowels) {
          console.log('자음/모음만 그룹 발견!');
          return true;
        }
      }
      currentGroup = '';
    }
  }

  // 마지막 그룹 검사
  if (currentGroup.length >= 3) {
    console.log('마지막 그룹 검사:', currentGroup);
    const onlyConsonants = currentGroup
      .split('')
      .every((c) => /[ㄱ-ㅎ]/.test(c));
    const onlyVowels = currentGroup.split('').every((c) => /[ㅏ-ㅣ]/.test(c));
    console.log('자음만:', onlyConsonants, '모음만:', onlyVowels);
    if (onlyConsonants || onlyVowels) {
      console.log('자음/모음만 그룹 발견!');
      return true;
    }
  }

  console.log('자음/모음만 그룹 없음');
  return false;
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
  console.log('=== 비속어 검사 시작 ===');
  console.log('원본 텍스트:', text);

  // 1) 자음/모음만 → 무조건 strict
  if (isOnlyConsonantsOrVowels(text)) {
    console.log('자음/모음만 감지됨');
    return { level: 'strict', matches: ['ONLY_JAMO'] };
  }

  // 1-2) 혼합 텍스트에서 자음/모음만으로 이루어진 부분이 있는지 확인
  if (hasOnlyConsonantsOrVowels(text)) {
    console.log('혼합 텍스트에서 자음/모음만 감지됨');
    return { level: 'strict', matches: ['MIXED_JAMO'] };
  }

  const n = normalizeKo(text);
  console.log('정규화된 텍스트:', n);

  // 2) 원문 매칭
  const sHit = DENY_STRICT.find((re) => re.test(n));
  if (sHit) {
    console.log('STRICT 비속어 감지:', sHit.source);
    return { level: 'strict', matches: [sHit.source] };
  }

  const wHit = DENY_SOFT.find((re) => re.test(n));
  if (wHit) {
    console.log('SOFT 비속어 감지:', wHit.source);
    return { level: 'soft', matches: [wHit.source] };
  }

  // 3) 초성 축약 매칭
  const cho = toChoseong(n);
  console.log('초성 변환:', cho);
  const csHit = CHOSEONG_STRICT.find((re) => re.test(cho));
  if (csHit) {
    console.log('STRICT 초성 감지:', csHit.source);
    return { level: 'strict', matches: [csHit.source] };
  }

  const cwHit = CHOSEONG_SOFT.find((re) => re.test(cho));
  if (cwHit) {
    console.log('SOFT 초성 감지:', cwHit.source);
    return { level: 'soft', matches: [cwHit.source] };
  }

  console.log('비속어 없음');
  return { level: 'none' };
}

// (선택) soft 레벨 마스킹: 실제론 부분 마스킹 권장
export function maskSoft(text: string): string {
  return text.replace(/([가-힣A-Za-z0-9])/g, '•');
}
