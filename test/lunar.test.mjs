// test/lunar.test.mjs
// 음력 변환 회귀 테스트.  실행: npm test  (또는 node test/lunar.test.mjs)
//
// 세 가지를 검증한다:
//  A. 공개 공휴일 — 네이버/구글 달력으로 확인되는 "정답"과 일치하는지 (라이브러리와 무관한 독립 기준)
//  B. KARI 전수 대조 — 1900~2050 전체 음력 날짜가 korean-lunar-calendar(한국천문연구원)와 일치하는지
//  C. 윤달 탐지 — getLeapMonth 가 알려진 윤달을 맞히는지
import { lunarToSolar, getLeapMonth } from '../src/utils/lunar.js';
import KoreanLunarCalendar from 'korean-lunar-calendar';

let pass = 0, fail = 0;
const fails = [];
function eq(actual, expected, label) {
  if (actual === expected) { pass++; }
  else { fail++; fails.push(`${label}\n    기대: ${expected}\n    실제: ${actual}`); }
}
const fmt = (r) => r ? `${r.year}-${String(r.month).padStart(2,'0')}-${String(r.day).padStart(2,'0')}` : 'null';

// ── A. 공개 공휴일 (독립 정답) ─────────────────────────────
// [라벨, 음력년, 음력월, 음력일, 윤달여부, 정답 양력]
const HOLIDAYS = [
  ['설날 2020',        2020, 1, 1,  false, '2020-01-25'],
  ['설날 2024',        2024, 1, 1,  false, '2024-02-10'],
  ['설날 2025',        2025, 1, 1,  false, '2025-01-29'],
  ['부처님오신날 2023', 2023, 4, 8,  false, '2023-05-27'],
  ['부처님오신날 2024', 2024, 4, 8,  false, '2024-05-15'],
  ['부처님오신날 2025', 2025, 4, 8,  false, '2025-05-05'],
  ['추석 2020',        2020, 8, 15, false, '2020-10-01'],
  ['추석 2023',        2023, 8, 15, false, '2023-09-29'],
  ['추석 2024',        2024, 8, 15, false, '2024-09-17'],
  ['추석 2025',        2025, 8, 15, false, '2025-10-06'],
  // 윤달 케이스 (2020년 윤4월은 실제로 존재)
  ['음 2020 윤4/1',    2020, 4, 1,  true,  '2020-05-23'],
];
for (const [label, y, m, d, leap, truth] of HOLIDAYS) {
  eq(fmt(lunarToSolar(y, m, d, leap)), truth, `[A] ${label}`);
}

// ── B. KARI 전수 대조 (1900~2050) ─────────────────────────
// 구현이 바뀌어도 한국천문연구원 기준과 어긋나지 않는지 회귀 감지
let swept = 0, mismatched = 0;
for (let y = 1900; y <= 2050; y++) {
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= 30; d++) {
      const ref = new KoreanLunarCalendar();
      if (!ref.setLunarDate(y, m, d, false)) continue; // 존재하지 않는 음력일은 건너뜀
      const r = ref.getSolarCalendar();
      const expected = `${r.year}-${String(r.month).padStart(2,'0')}-${String(r.day).padStart(2,'0')}`;
      swept++;
      if (fmt(lunarToSolar(y, m, d, false)) !== expected) {
        mismatched++;
        if (mismatched <= 5) fails.push(`[B] ${y}-${m}-${d} 음 → KARI ${expected} 와 불일치`);
      }
    }
  }
}
if (mismatched === 0) pass++; else { fail++; fails.push(`[B] KARI 전수 대조: ${swept}개 중 ${mismatched}개 불일치`); }

// ── C. 윤달 탐지 ──────────────────────────────────────────
eq(getLeapMonth(2020), 4,    '[C] 2020년 윤달 = 4월');
eq(getLeapMonth(2023), 2,    '[C] 2023년 윤달 = 2월');
eq(getLeapMonth(2025), 6,    '[C] 2025년 윤달 = 6월');
eq(getLeapMonth(2024), null, '[C] 2024년 윤달 없음');
eq(getLeapMonth(2022), null, '[C] 2022년 윤달 없음');

// ── 결과 ─────────────────────────────────────────────────
console.log(`\nKARI 전수 대조: ${swept}개 날짜 검증`);
console.log(`통과 ${pass} / 실패 ${fail}`);
if (fails.length) {
  console.log('\n실패 내역:');
  fails.forEach(f => console.log('  ✗ ' + f));
  process.exit(1);
} else {
  console.log('✅ 전부 통과');
}
