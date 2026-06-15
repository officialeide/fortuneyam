// utils/lunar.js
// 음력→양력 변환 — 한국천문연구원(KARI) 데이터 기반 (오프라인, 1000~2050년)
// korean-lunar-calendar 라이브러리 래퍼. 윤달(isLeap)·대소월 모두 정확.
import KoreanLunarCalendar from 'korean-lunar-calendar';

// 변환 실패(범위 밖, 또는 해당 연도에 없는 윤달 등) 시 null 반환
export function lunarToSolar(year, month, day, isLeap = false) {
  try {
    const cal = new KoreanLunarCalendar();
    if (!cal.setLunarDate(year, month, day, isLeap)) return null;
    const s = cal.getSolarCalendar();
    return { year: s.year, month: s.month, day: s.day };
  } catch {
    return null;
  }
}

// 해당 음력 연도에 윤달이 있으면 그 달 번호를, 없으면 null 반환.
// 라이브러리는 평달에 isLeap=true를 줘도 평달과 같은 날짜를 돌려준다.
// 따라서 평달/윤달 변환 결과가 "다른" 달이 곧 실제 윤달이다.
export function getLeapMonth(year) {
  for (let m = 1; m <= 12; m++) {
    const normal = lunarToSolar(year, m, 1, false);
    const leap = lunarToSolar(year, m, 1, true);
    if (normal && leap &&
        (normal.year !== leap.year || normal.month !== leap.month || normal.day !== leap.day)) {
      return m;
    }
  }
  return null;
}
