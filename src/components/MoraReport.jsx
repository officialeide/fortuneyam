// MoraReport.jsx v7.1 도넛차트, 카테고리 재편, 무당체 완전 통일
import React, { useState, useEffect } from 'react'
import { callNetlify } from '../utils/callNetlify.js'
import { ILGAN_DESC } from '../data/constants.js'

const C = {
  void: "#0D0A0F", dusk: "#1A1220", ember: "#241830",
  mahogany: "#3D2016", walnut: "#6B3A2A", caramel: "#A0522D",
  sand: "#C8956C", abyss: "#1E1028", plum: "#4A2060",
  iris: "#7B4FA6", lavender: "#B89FCC", parchment: "#F0E8DC",
  ash: "#9E8F8A", fog: "#5C5158",
}

// 상단 카테고리 네비게이션바 (2행 · 4+6)
const CATEGORY_NAV_ROWS = [
  ["사주 심화", "평생운", "재물운", "연애운", "애정운"],
  ["직장운", "취업운", "관계운", "건강운", "가족운"],
]

const OHK_KR = { 목: "나무", 화: "불", 토: "흙", 금: "금속", 수: "물" }
const OHK_COLOR = { 목: "#4CAF50", 화: "#FF5722", 토: "#8D6E63", 금: "#FFB300", 수: "#2196F3" }
const OHK_DESC = {
  목: "성장을 향해 끊임없이 뻗어나가는 에너지야. 새로운 것을 시작하고 가능성을 여는 힘이 강해. 창의적이고 추진력이 넘치지만, 뿌리가 약하면 방향이 흔들리기 쉬워. 한번 꽂히면 빠르게 달려가는데, 그 속도가 주변을 앞질러버리는 경우가 많아. 시작은 잘하는데 마무리가 약한 게 이 기운의 함정이야.",
  화: "뜨겁게 타오르는 에너지야. 표현력과 직관이 강하고, 주변을 밝히는 존재감이 있어. 사람을 끌어당기는 매력이 있지만, 타오르는 만큼 소진도 빨라. 감정의 기복이 크고, 흥미가 식으면 급격히 식어버리는 구조야. 이 기운이 강하면 화려하지만 지속성이 문제고, 너무 많으면 오히려 자기 자신을 태워버려.",
  토: "묵직하게 버티는 에너지야. 어떤 상황에서도 중심을 잡고, 주변을 안정시키는 힘이 있어. 포용력이 강하고 신뢰를 주는 존재가 되지만, 그 무게를 혼자 다 짊어지는 게 문제야. 변화에 느리고, 한번 굳으면 바꾸기 어려워. 안정감이 강점이지만, 지나치면 정체가 돼.",
  금: "자르고 정리하는 에너지야. 원칙이 뚜렷하고 결단력이 강해. 불필요한 것을 제거하고 핵심에 집중하는 능력이 있어. 하지만 날이 서있는 만큼 주변과 마찰이 생기기 쉬워. 타협을 못 하는 게 강점이기도 하고 약점이기도 해. 이 기운이 강하면 냉철한 대신 차갑게 보일 수 있어.",
  수: "깊이 스며드는 에너지야. 표면이 잔잔해 보여도 내면에 엄청난 깊이가 있어. 직관이 예리하고, 보이지 않는 것을 먼저 감지하는 능력이 있어. 유연하게 흐르면서 어떤 형태에도 적응하지만, 방향을 잃으면 어디로 흘러야 할지 모르는 구조야. 이 기운이 너무 많으면 생각이 깊어지는 대신 행동이 느려지고, 감정을 혼자 담아두다 무너지는 경우가 있어.",
}

// 조사 헬퍼: 받침 유무로 은/는, 이/가, 을/를 선택
const _hasJong = (s) => { const c = (s || "").charCodeAt((s || "").length - 1); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0 }
const _josaEunNeun = (s) => s + (_hasJong(s) ? "은" : "는")
const _josaIga = (s) => s + (_hasJong(s) ? "이" : "가")
const _josaEul = (s) => s + (_hasJong(s) ? "을" : "를")

// 오행이 과다할 때(dominant) 성향 — 강점과 그림자를 함께
const OHK_STRONG_TRAIT = {
  목: "새로운 걸 시작하고 밀어붙이는 추진력이 남달라. 벌여놓기만 하고 마무리를 못 하는 게 함정이야.",
  화: "표현력과 존재감이 강해서 어디 있든 눈에 띄어. 타오르는 만큼 식는 것도 빨라 감정 기복이 커.",
  토: "어떤 상황에서도 흔들리지 않는 무게가 있어. 대신 변화에 느리고 짐을 혼자 다 짊어지려는 게 문제야.",
  금: "원칙이 뚜렷하고 결단이 빨라. 대신 날이 서있는 만큼 부딪히기 쉽고, 넘치면 차갑게 보여.",
  수: "겉은 잔잔한데 속이 깊어. 대신 생각만 깊어지고 행동이 느려지는 게 이 기운의 함정이야.",
}
// 오행이 없을 때 부족한 부분
const OHK_MISSING_TRAIT = {
  목: "새로 시작하고 밀어붙이는 추진력",
  화: "열정을 드러내고 표현하는 힘",
  토: "중심을 잡고 버티는 안정감",
  금: "끊고 정리하는 결단력",
  수: "깊이 사고하고 유연하게 적응하는 감각",
}

const YONGSIN_DETAIL = {
  "목": {"업종": "교육, 출판, 작가, 콘텐츠 창작, 인테리어, 조경, 의류, 패션, 기획, 스타트업, 코칭", "행동": "새로운 걸 배우고 시작하는 것. 독서, 강의 수강, 새 프로젝트 도전.", "취미": "등산, 원예, 독서, 글쓰기, 악기 배우기", "피해야할것": "많이 벌여놓고 마무리를 못 짓는 것."},
  "화": {"업종": "방송, 엔터테인먼트, 뷰티, 마케팅, 강연, 홍보, 요식업, 전기, 에너지", "행동": "사람들 앞에 나서는 것. 발표, 자기 PR, 적극적인 만남.", "취미": "댄스, 노래, 요리, 사진, 유튜브, 공연 관람", "피해야할것": "충전 없이 계속 태워 빠르게 소진되는 것."},
  "토": {"업종": "부동산, 건축, 토목, 농업, 의료, 컨설팅, 중개업, 유통, 식품, 요양, 복지", "행동": "기반을 다지는 것. 자격증 취득, 저축, 안정적인 루틴 만들기.", "취미": "요리, 텃밭 가꾸기, 도예, 봉사활동, 명상", "피해야할것": "변화에 느리게 반응해 한번 굳으면 안 바뀌는 것."},
  "금": {"업종": "법, 금융, 제조, 기계, 외과, 군경, 스포츠, 정밀 기계, 귀금속, IT 하드웨어", "행동": "원칙을 세우고 지키는 것. 계약 검토, 자격 공부, 규칙적인 단련.", "취미": "격투기, 검도, 퍼즐, 정밀 공작, 수집", "피해야할것": "타협 없이 날을 세워 주변과 부딪히는 것."},
  "수": {"업종": "무역, 유통, 해운, 여행, IT, 연구, 심리상담, 예술, 영성, 물 관련 사업", "행동": "유연하게 흐르는 것. 새 정보 수집, 여행, 폭넓은 네트워킹.", "취미": "수영, 낚시, 요가, 명상, 글쓰기, 여행", "피해야할것": "목표 없이 흘러다니며 에너지가 흩어지는 것."},
  "화·토": {"업종": "의료, 요식업, 부동산, 에너지, 마케팅, 유통, 건설, 뷰티, 교육", "행동": "열정적으로 일하되 안정적인 기반을 쌓는 것. 자격증 취득, 저축, 인맥 관리.", "취미": "요리, 원예, 댄스, 봉사활동", "피해야할것": "시작만 하고 마무리를 못 짓는 것."},
  "목·화": {"업종": "교육, 출판, 창작, 방송, 마케팅, 강연, 기획, 콘텐츠 제작", "행동": "배우고 나누는 것. 강의, 발표, 새 프로젝트 함께 벌이기.", "취미": "독서, 강의, 글쓰기, 퍼포먼스, 유튜브", "피해야할것": "에너지를 산만하게 흩뿌리는 것."},
  "금·수": {"업종": "금융, IT, 무역, 연구, 귀금속, 해운, 데이터 분석, 컨설팅", "행동": "분석하고 판단하는 것. 투자 공부, 자격증 취득, 해외 네트워크 확장.", "취미": "바둑, 체스, 코딩, 독서, 여행", "피해야할것": "너무 냉정하게만 판단하는 것."},
  "수·목": {"업종": "IT, 교육, 여행, 창작, 연구, 심리상담, 플랫폼, 미디어", "행동": "배우고 흘려보내는 것. 지식 습득과 나눔의 반복.", "취미": "독서, 여행, 수영, 글쓰기, 강의 듣기", "피해야할것": "계속 배우기만 하고 실행을 안 하는 것."},
  "토·금": {"업종": "건축, 법, 금융, 제조, 농업, 컨설팅, 의료, 부동산, 물류", "행동": "기반을 다지고 원칙을 지키는 것. 계약과 법 점검, 재테크, 자격증 취득.", "취미": "도예, 정밀 공작, 격투기, 명상, 요리", "피해야할것": "너무 보수적으로만 가는 것."}
}

const yongsinJobMap = {"목": "교육, 출판, 의류, 인테리어, 조경, 원예, 목재, 가구, 창작, 기획, 성장 관련 분야야. 새로운 걸 시작하고 키우는 일이 맞아.", "화": "방송, 엔터테인먼트, 뷰티, 조명, 전기, 에너지, 요식업, 마케팅, 강연, 홍보 분야야. 빛을 내고 사람들 앞에 서는 일이 맞아.", "토": "부동산, 건축, 토목, 농업, 의료, 컨설팅, 중개업, 유통, 식품 분야야. 실체가 있는 것을 다루고 안정적인 기반을 만드는 일이 맞아.", "금": "법, 금융, 제조, 기계, 외과, 군경, 스포츠, 정밀 기계, 귀금속 분야야. 원칙이 명확하고 결과가 바로 나타나는 일이 맞아.", "수": "무역, 유통, 해운, 여행, IT, 연구, 심리상담, 예술, 영성 분야야. 흐르고 연결되는 성질의 일이 맞아.", "목·화": "교육, 출판, 창작, 방송, 마케팅, 강연, 기획 분야야. 새로운 것을 만들고 알리는 일이 맞아.", "화·토": "의료, 요식업, 부동산, 에너지, 마케팅, 유통, 건설 분야야. 실체 있는 것을 빛나게 만드는 일이 맞아.", "토·금": "건축, 법, 금융, 제조, 농업, 컨설팅, 의료 분야야. 안정적이고 원칙이 있는 일이 맞아.", "금·수": "금융, IT, 무역, 연구, 귀금속, 해운 분야야. 정밀하고 유연하게 흐르는 일이 맞아.", "수·목": "IT, 교육, 여행, 창작, 연구, 심리상담 분야야. 지식을 쌓고 나누는 일이 맞아."}
const GISIN_DETAIL = {
  "목": {"업종": "교육, 출판, 창작, 인테리어, 의류, 기획", "행동": "새로운 걸 자꾸 벌이면서 마무리를 못 하는 거야. 에너지를 산만하게 흩뿌리면 다 새어나가.", "사람": "시작은 잘하지만 마무리가 약한 사람, 변덕이 잦은 사람"},
  "화": {"업종": "방송, 엔터, 마케팅, 화려함을 좇는 분야", "행동": "충동적으로 결정하고, 과하게 사람을 만나며 에너지를 태우는 거야.", "사람": "화려하고 자극적인 사람, 감정 기복이 큰 사람"},
  "토": {"업종": "부동산, 중개업", "행동": "고집을 부리고 변화를 거부하며, 무거운 책임을 혼자 짊어지는 거야.", "사람": "고집이 너무 센 사람, 변화를 거부하는 사람"},
  "금": {"업종": "법, 제조, 금융", "행동": "타협 없이 밀어붙이고, 강압적으로 나가는 거야.", "사람": "냉정하고 날 선 사람, 원칙만 따지는 사람"},
  "수": {"업종": "무역, 해운, 물 관련 사업", "행동": "방향 없이 흘러다니고, 너무 많은 정보에 휩쓸리는 거야.", "사람": "일관성 없는 사람, 종잡을 수 없는 사람"},
  "수·금": {"업종": "금융, IT, 무역, 정밀 분야", "행동": "냉정한 계산만 따르고, 감정 없이 판단하며, 방향 없이 흘러다니는 거야.", "사람": "차갑고 계산적인 사람, 일관성 없는 사람"},
  "목·토": {"업종": "기획, 부동산, 농업, 중개업", "행동": "시작만 하고 마무리를 못 하거나, 너무 많은 책임을 짊어지는 거야.", "사람": "변덕스러운 사람, 고집이 센 사람"},
  "금·토": {"업종": "제조, 건설, 법", "행동": "지나치게 원칙만 따지고, 변화를 거부하며 짐을 혼자 지는 거야.", "사람": "너무 딱딱하고 융통성 없는 사람"},
  "목·수": {"업종": "창작, IT, 교육", "행동": "산만하게 이것저것 시작하고, 방향을 잃고 흘러다니는 거야.", "사람": "일관성 없는 사람, 시작만 하는 사람"},
  "화·금": {"업종": "방송, 제조, 에너지 분야", "행동": "충동적인 결정과 냉정한 판단이 부딪히면서 엇나가는 거야.", "사람": "감정 기복이 크면서 날 선 사람"},
  "화·토": {"업종": "요식업, 부동산, 건설", "행동": "충동적으로 벌여놓고 무거운 책임에 눌리는 거야.", "사람": "기복이 크면서 고집이 센 사람"},
  "토·화": {"업종": "요식업, 부동산, 건설", "행동": "충동적으로 벌여놓고 무거운 책임에 눌리는 거야.", "사람": "기복이 크면서 고집이 센 사람"}
}

const OHK_ORGAN = {
  목: "간과 담낭", 화: "심장과 소장, 혈액순환", 토: "비장과 위, 소화기",
  금: "폐와 대장, 호흡기", 수: "신장과 방광, 생식기, 비뇨기",
}
const OHK_ORGAN_SIGN = {
  목: "피로가 쌓이면 간 수치가 오르거나 눈이 침침해지는 식으로 먼저 신호가 와",
  화: "스트레스를 받으면 가슴이 두근거리거나 혈압이 오르는 식으로 먼저 신호가 와",
  토: "무리하면 소화가 안 되거나 속이 더부룩한 식으로 먼저 신호가 와",
  금: "무리하면 기침이 잦아지거나 피부가 예민해지는 식으로 먼저 신호가 와",
  수: "무리하면 붓거나 허리가 뻐근한 식으로 먼저 신호가 와",
}
const OHK_SEASON = { 목: "봄", 화: "여름", 토: "환절기", 금: "가을", 수: "겨울" }
const OHK_SEASON_WARN = {
  목: "나무 기운이 약한데, 봄에는 간과 담낭이 먼저 지쳐. 춘곤증이 유독 심하게 오거나 피로가 만성적으로 쌓이기 쉬우니 이 시기에 무리하지 마.",
  화: "불 기운이 약한데, 여름에는 심장과 혈액순환에 부담이 와. 수분을 충분히 챙기고 과격한 운동은 피하는 게 좋아.",
  토: "흙 기운이 약한데, 환절기마다 소화기와 컨디션이 흔들려. 계절이 바뀔 때일수록 규칙적으로 챙겨 먹어야 해.",
  금: "금 기운이 약한데, 가을에는 폐와 대장이 약해져. 호흡기 관리에 특히 신경 쓰고, 건조한 날씨엔 수분도 충분히 챙겨.",
  수: "물 기운이 약한데, 겨울에는 체력이 빨리 떨어져. 체온 유지랑 규칙적인 생활 리듬이 중요해. 무리한 일정은 피해.",
}
const OHK_FOOD = {
  목: "초록 채소, 신맛 나는 과일, 나물류",
  화: "토마토, 붉은 과일, 적당히 매콤한 음식",
  토: "고구마, 호박, 잡곡밥, 대추, 생강처럼 따뜻하고 노란 음식",
  금: "무, 배, 마늘, 흰 살 생선처럼 담백한 음식",
  수: "검은콩, 미역, 해조류, 견과류",
}
// 운동 전용 마무리 — 운동 습관/강도 얘기로만 한정 (식이 텍스트와 주제가 겹치지 않도록 분리)
const OHK_EXERCISE_CLOSE = {
  목: "새 운동으로 자꾸 갈아타고 싶어지는데, 하나를 최소 3개월은 밀고 가야 몸에 진짜 효과가 쌓여.",
  화: "초반에 확 몰아붙이다 금방 지치는 패턴이 많아. 처음부터 강도를 낮춰 잡아야 오래 갈 수 있어.",
  토: "이미 익숙한 루틴을 반복하는 게 잘 맞아. 운동 종류를 자꾸 바꾸기보다 하나를 오래 끌고 가.",
  금: "정확한 자세와 기록을 따지는 편이 잘 맞아. 숫자로 확인되는 운동일수록 동기부여가 잘 돼.",
  수: "그날그날 컨디션 따라 강도를 다르게 가져가는 게 잘 맞아. 매일 같은 강도를 억지로 채우려 하지 마.",
}
// 식습관 전용 마무리 — 식이 섹션인데 "사람과 어울려라"처럼 엉뚱한 얘기가 나오지 않도록, 먹는 습관/속도 얘기로만 분리
const OHK_FOOD_CLOSE = {
  목: "급하게 먹는 습관이 소화를 방해하기 쉬워. 천천히 오래 씹는 습관만 들여도 몸이 훨씬 편해져.",
  화: "맵고 자극적인 음식에 자꾸 끌리는데, 스트레스 받을수록 오히려 순한 음식으로 속을 달래줘야 해.",
  토: "정해진 시간에 규칙적으로 먹는 게 이 사주엔 제일 중요해. 야식이나 불규칙한 식사가 제일 큰 적이야.",
  금: "입맛이 까다로운 편이라 먹던 것만 먹기 쉬운데, 의식적으로 다양한 재료를 시도해야 균형이 맞아.",
  수: "입맛 기복이 큰 편이라 안 먹다가 몰아 먹기 쉬워. 적더라도 규칙적으로 챙기는 습관이 훨씬 중요해.",
}
const OHK_EXERCISE = {
  목: "등산, 스트레칭, 요가처럼 몸을 늘리고 뻗는 운동",
  화: "댄스, 유산소, 러닝처럼 심장을 활발히 뛰게 하는 운동",
  토: "필라테스, 걷기처럼 코어를 다지는 규칙적인 운동",
  금: "호흡을 깊게 쓰는 수영, 등산, 복싱",
  수: "수영, 명상, 천천히 걷기처럼 순환을 돕는 활동",
}
// 연주 십성 → 부모궁 해석 (십성 그룹별)
const SIBSONG_PARENT = {
  비견: "부모가 원칙과 자립을 중요하게 여기는 분위기였을 가능성이 커. 각자의 영역을 존중하는 대신, 살가운 감정 표현은 적었을 수 있어. 그 덕에 일찍부터 스스로 결정하고 책임지는 힘을 자연스레 몸에 익혔을 거야.",
  겁재: "형제 같은 부모, 또는 경쟁과 비교가 있던 환경이었을 수 있어. 정을 주면서도 은근한 긴장이 있는 관계야. 그 긴장 속에서 오히려 지지 않으려는 근성과 추진력을 키웠을 가능성이 커.",
  식신: "여유 있고 편안한 분위기에서 자랐을 가능성이 커. 부모가 표현을 잘 해주는 편이라 정서적으로 안정된 기반을 받았을 수 있어. 그 편안함이 지금도 사람을 대하는 태도에 여유로 남아 있어.",
  상관: "부모의 기대와 자신의 개성이 부딪히는 지점이 있었을 거야. 자유롭게 크고 싶은데 틀에 맞추길 바라는 환경과 부딪혔을 수 있어. 그 갈등이 오히려 자기만의 색을 뚜렷하게 만드는 원동력이 됐어.",
  편재: "현실적이고 능동적인 부모 밑에서 자랐을 가능성이 커. 물질적으로는 안정됐지만 감정적으로 바쁜 분위기였을 수 있어. 그 속에서 생활력과 눈치가 일찍 트였고, 스스로 챙기는 법도 함께 배웠어.",
  정재: "성실하고 계획적인 부모야. 안정적인 기반을 물려받았지만, 그만큼 규칙과 기대도 명확했을 거야. 정해진 틀 안에서 꾸준함을 배운 대신, 예상 밖의 길을 시도하는 데는 다소 조심스러웠을 수 있어.",
  편관: "엄격하거나 규율이 강한 분위기에서 자랐을 가능성이 커. 그 압박이 지금의 책임감과 맷집을 만든 배경이야. 힘든 상황에서도 흔들리지 않는 힘은 이 시절에 이미 다져진 거야.",
  정관: "원칙적이고 책임감 있는 부모야. 잘 돌봐주는데 따뜻함보다 규범이 앞섰을 수 있어. 감정적으로 연결되는 게 어색했을 수 있지만, 그만큼 반듯하게 자기 자리를 지키는 법을 익혔어.",
  편인: "독립적이고 개인적인 공간을 존중하는 분위기, 또는 부모와 물리적, 정서적 거리가 있었을 가능성이 커. 그 거리 덕에 일찍부터 혼자 생각하고 판단하는 힘이 남달리 자랐을 거야.",
  정인: "보호받고 배려받는 분위기에서 자랐을 가능성이 커. 다만 그 보호가 지나치면 스스로 결정하는 힘을 늦게 배웠을 수 있어. 그래도 그 안정감이 지금도 마음의 든든한 뿌리로 남아 있어.",
}
const SIBSONG_SIBLING = {
  비견: "형제와는 대등한 관계야. 각자의 길을 존중하는 편이라 부딪힐 일은 적어도 깊이 얽히지도 않아. 필요할 때 부담 없이 기댈 수 있는, 담백하지만 든든한 사이야.",
  겁재: "형제와 경쟁하거나 비교당하는 에너지가 있어. 사이가 좋으면 가장 강한 지원군이 되고, 틀어지면 오래가는 앙금이 남아. 그만큼 서로에게 자극이 되는 존재이기도 해.",
  식신: "형제와는 편안하고 다정한 관계야. 같이 있으면 여유롭고 즐거운 시간을 보내는 사이야. 큰 걱정 없이 편하게 웃고 떠들 수 있는, 정서적으로 안전한 관계야.",
  상관: "형제와 티격태격하면서도 서로 자극을 주는 관계야. 각자 개성이 뚜렷해서 부딪힐 때도 있어. 다투고도 금방 풀리는 편이라, 그 티격태격이 오히려 서로를 성장시켜.",
  편재: "형제와는 현실적인 관계야. 감정보다 실리로 얽히는 경우가 많고, 각자 자기 몫을 챙기는 편이야. 정 없어 보여도 필요할 땐 확실하게 도움을 주고받는 사이야.",
  정재: "형제와 안정적이고 무난한 관계야. 큰 갈등 없이 각자 자리에서 성실하게 지내는 사이야. 자주 연락하지 않아도 서로의 안부를 은근히 챙기는 편안한 관계야.",
  편관: "형제 중 한 명이 유독 엄하거나 부담을 주는 존재였을 수 있어. 그만큼 서로에게 자극이 되기도 해. 부딪히면서도 결국 서로를 단단하게 만들어주는 관계야.",
  정관: "형제와 서로의 역할을 인정하는 관계야. 큰 마찰 없이 각자 책임을 다하는 편이야. 서로 간섭하지 않으면서도 필요할 땐 든든하게 힘을 보태주는 사이야.",
  편인: "형제와는 거리가 있는 관계일 수 있어. 각자의 세계가 뚜렷해서 자주 안 봐도 어색하지 않은 사이야. 오히려 그 적당한 거리가 관계를 오래 편안하게 유지시켜줘.",
  정인: "형제와 서로 돌봐주는 관계야. 힘들 때 가장 먼저 손을 내미는 사이가 형제일 가능성이 커. 말없이도 서로의 상황을 알아채고 챙겨주는 깊은 정이 있어.",
}

const FONT = "'Nanum Myeongjo', 'Noto Serif KR', Georgia, serif"
const FONT_SANS = "'Nanum Gothic', 'Apple SD Gothic Neo', sans-serif"
const txt = { fontSize: 14, color: C.parchment, lineHeight: 1.9, fontWeight: 400, fontFamily: FONT, whiteSpace: "pre-line", textAlign: "justify" }
const hdg = (a) => ({ fontSize: 9, letterSpacing: 3, color: a, textTransform: "uppercase", fontFamily: FONT_SANS, marginBottom: 8, fontWeight: 400 })
const dvd = { borderBottom: `1px solid ${C.ember}`, marginBottom: 20, paddingBottom: 20 }

function mug(s) {
  if (!s) return ""
  let t = s
    .replace(/[（(][一-龯\u4E00-\u9FFF\uAC00-\uD7A3 ]+[）)]/g, "")
    .replace(/[一-龯\u4E00-\u9FFF]{2,}/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
  const r = [
    ["이야.", "이야."], ["이야,", "이야,"], ["이야 ", "이야 "], ["이에요\n", "이야\n"],
    ["야.", "야."], ["야,", "야,"], ["야 ", "야 "], ["예요\n", "야\n"],
    ["있어.", "있어."], ["있어,", "있어,"], ["있어 ", "있어 "],
    ["없어.", "없어."], ["없어,", "없어,"], ["없어 ", "없어 "],
    ["해.", "해."], ["해,", "해,"], ["해 ", "해 "], ["해요\n", "해\n"],
    ["돼.", "돼."], ["돼,", "돼,"], ["돼 ", "돼 "],
    ["가.", "가."], ["가,", "가,"], ["가 ", "가 "],
    ["나.", "나."], ["나,", "나,"], ["나 ", "나 "],
    ["거야.", "거야."], ["거야,", "거야,"], ["거야 ", "거야 "],
    ["았어.", "았어."], ["었어.", "었어."], ["았어,", "았어,"], ["었어,", "었어,"],
    ["잖아.", "잖아."], ["잖아,", "잖아,"],
    ["네.", "네."], ["네,", "네,"], ["네 ", "네 "],
    ["어.", "어."], ["어,", "어,"], ["어 ", "어 "],
    ["아.", "아."], ["아,", "아,"], ["아 ", "아 "],
    ["ㄹ게.", "ㄹ게."], ["할게.", "할게."], ["줄게.", "줄게."],
    ["신약", "에너지 분산 구조"], ["신강", "에너지 집중 구조"],
    ["하세요.", "해."], ["주세요.", "줘."],
    ["해내요.", "해내."], ["느껴.", "느껴."], ["보여.", "보여."], ["바꿔.", "바꿔."], ["바꿔,", "바꿔,"], ["바꿔 ", "바꿔 "], ["줘.", "줘."], ["줘,", "줘,"], ["줘 ", "줘 "],
    ["위치하여", "있어."], ["위치해", "있어"], ["위치하고", "있고"], ["자리하여", "있어."], ["자리해", "있어"],
    ["드러내", "드러내"], ["강화하는데", "강화해"],
    ["만들어줘", "만들어줘"],
    // 직설 톤 보정: 완곡→단정 (오작동 없는 것만)
    ["하는 게 좋아.", "해."], ["하는 것이 좋아.", "해."],
    ["필요해 보여.", "필요해."],
  ]
  for (const [o, n] of r) t = t.split(o).join(n)
  // 조사 중복 정리: "에 에", "에 있어" 앞 조사 중복, 이중 마침표 등
  t = t
    .replace(/에\s+에\s+/g, "에 ")
    .replace(/에\s+있어/g, "에 있어")
    .replace(/자리에\s+있어/g, "자리에 있어")
    .replace(/\.\s*\./g, ".")
    .replace(/\s{2,}/g, " ")
    .trim()
  return t
}

function noColon(s) {
  return mug(s || "").replace(/[：:]\s*/g, " ").trim()
}

// 도넛 차트
function MangseTable({ pillars, noTime, highlightIlju, compact }) {
  if (!pillars || pillars.length < 4) return null
  // 궁성(가족) 라벨: [연, 월, 일, 시]
  const ganFam = ["조부", "부친", "자신", "아들"]
  const jiFam = ["조모", "모친", "배우자", "딸"]
  const colHead = ["연주", "월주", "일주", "시주"]
  const cell = { flex: 1, textAlign: "center", padding: compact ? "4px 1px" : "6px 2px" }
  const famStyle = { fontSize: compact ? 8 : 9, color: C.fog, fontFamily: FONT_SANS, marginTop: 2 }
  const sibStyle = { fontSize: compact ? 8 : 9, color: C.ash, fontFamily: FONT_SANS }
  const hanjaStyle = { fontSize: compact ? 13 : 16, color: C.parchment, fontFamily: FONT, lineHeight: 1.1 }
  const koStyle = { fontSize: compact ? 9 : 10, color: C.sand, fontFamily: FONT_SANS }
  const showTime = !noTime
  const cols = showTime ? [0, 1, 2, 3] : [0, 1, 2]
  // 일주(index 2) 글자색 강조 (배경 없음)
  const iljuCol = (i) => ({})
  const iljuHanja = (i) => (highlightIlju && i === 2) ? { ...hanjaStyle, color: C.caramel } : hanjaStyle
  const iljuKo = (i) => (highlightIlju && i === 2) ? { ...koStyle, color: C.caramel } : koStyle
  return (
    <div style={{ marginBottom: compact ? 0 : 16, background: C.dusk, borderRadius: 12, padding: compact ? "10px 4px" : "12px 8px", border: `1px solid ${C.ember}`, height: compact ? "100%" : "auto", display: compact ? "flex" : "block", flexDirection: compact ? "column" : undefined, justifyContent: compact ? "center" : undefined, boxSizing: "border-box" }}>
      <div style={{ display: "flex" }}>
        {cols.map(i => (
          <div key={"h" + i} style={{ ...cell, fontSize: compact ? 9 : 10, color: (highlightIlju && i === 2) ? C.caramel : C.fog, fontFamily: FONT_SANS, fontWeight: (highlightIlju && i === 2) ? 600 : 400 }}>{colHead[i]}</div>
        ))}
      </div>
      {/* 천간 */}
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        {cols.map(i => (
          <div key={"g" + i} style={cell}>
            <div style={sibStyle}>{pillars[i].gan.sibsong}</div>
            <div style={iljuHanja(i)}>{pillars[i].gan.hanja}</div>
            <div style={iljuKo(i)}>{pillars[i].gan.ko}</div>
            <div style={famStyle}>{ganFam[i]}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: C.ember, margin: compact ? "6px 0" : "8px 0" }} />
      {/* 지지 */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {cols.map(i => (
          <div key={"j" + i} style={cell}>
            <div style={iljuHanja(i)}>{pillars[i].ji.hanja}</div>
            <div style={iljuKo(i)}>{pillars[i].ji.ko}</div>
            <div style={sibStyle}>{pillars[i].ji.sibsong}</div>
            <div style={famStyle}>{jiFam[i]}</div>
          </div>
        ))}
      </div>
      {noTime && (
        <div style={{ fontSize: compact ? 9 : 10, color: C.fog, fontFamily: FONT_SANS, textAlign: "center", marginTop: 8 }}>
          태어난 시간을 몰라서 시주는 빼고 봤어.
        </div>
      )}
    </div>
  )
}

function DonutChart({ ohaeng, dominant, hideDesc, hideIndex, compact }) {
  const total = Object.values(ohaeng).reduce((a, b) => a + b, 0)
  if (!total) return null
  const size = compact ? 76 : 80; const r = compact ? 26 : 28; const cx = size/2; const cy = size/2; const stroke = compact ? 9 : 10
  let cumAngle = -90
  const slices = Object.entries(ohaeng).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([k,v])=>{
    const angle = (v/total)*360
    const startA = cumAngle; cumAngle += angle
    return {k, v, startA, angle, color: OHK_COLOR[k]||"#888"}
  })
  const polar = (a) => {
    const rad = (a*Math.PI)/180
    return [cx + r*Math.cos(rad), cy + r*Math.sin(rad)]
  }
  const svg = (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      {slices.map(s => {
        const [x1,y1] = polar(s.startA)
        const [x2,y2] = polar(s.startA + s.angle)
        const large = s.angle > 180 ? 1 : 0
        if (s.angle >= 359.9) {
          return <circle key={s.k} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={stroke}/>
        }
        return (
          <path key={s.k}
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
            fill={s.color} stroke={C.dusk} strokeWidth={1}
          />
        )
      })}
      <circle cx={cx} cy={cy} r={r-stroke} fill={C.dusk}/>
      <text x={cx} y={cy-3} textAnchor="middle" fill={OHK_COLOR[dominant]||C.sand} fontSize={compact ? 10 : 11} fontFamily={FONT_SANS} fontWeight="400">
        {OHK_KR[dominant]||dominant}
      </text>
      <text x={cx} y={cy+11} textAnchor="middle" fill={C.ash} fontSize={compact ? 8 : 9} fontFamily={FONT_SANS}>
        {ohaeng[dominant]||0}개
      </text>
    </svg>
  )
  if (hideIndex) {
    // 만세력과 나란히 배치되는 레이아웃 전용: svg만, 인덱스는 OhaengIndexList가 별도로 담당
    return <div style={{ display: "flex", justifyContent: "center", padding: compact ? "10px 0 4px" : "12px 0 6px" }}>{svg}</div>
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
        {svg}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: C.fog, fontFamily: FONT_SANS, fontWeight: 400 }}>
            {Object.entries(ohaeng).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([k,v])=>(
              <span key={k} style={{ marginRight: 8, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: OHK_COLOR[k]||C.fog, display: "inline-block" }} />
                {OHK_KR[k]||k} {v}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: C.parchment, lineHeight: 1.8, fontFamily: FONT, fontWeight: 400, display: hideDesc ? "none" : "block" }}>
        {OHK_DESC[dominant] || ""}
      </div>
    </div>
  )
}

// 오행 인덱스 세로 리스트 — 색상 박스(background)로 렌더링 (유니코드 ■ 색상 미표시 이슈 방지)
function OhaengIndexList({ ohaeng }) {
  const entries = Object.entries(ohaeng).filter(([,v]) => v > 0).sort((a,b) => b[1]-a[1])
  if (!entries.length) return null
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 12px 10px" }}>
      {entries.map(([k, v]) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: FONT_SANS, color: C.parchment }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: OHK_COLOR[k] || C.fog, display: "inline-block", flexShrink: 0 }} />
          <span style={{ color: C.ash }}>{OHK_KR[k] || k}</span>
          <span style={{ marginLeft: "auto", color: C.sand, fontWeight: 500 }}>{v}</span>
        </div>
      ))}
    </div>
  )
}

// 만세력(좌) + 오행 도넛차트(우, svg + 하단 인덱스) 나란히 배치
function MangseDonutRow({ pillars, noTime, ohaeng, dominant }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "stretch" }}>
      <div style={{ flex: 1 }}>
        <MangseTable pillars={pillars} noTime={noTime} highlightIlju compact />
      </div>
      <div style={{ flex: 1, background: C.dusk, borderRadius: 12, border: `1px solid ${C.ember}`, display: "flex", flexDirection: "column" }}>
        <DonutChart ohaeng={ohaeng} dominant={dominant} hideDesc hideIndex compact />
        <div style={{ height: 1, background: C.ember, margin: "2px 10px 8px" }} />
        <OhaengIndexList ohaeng={ohaeng} />
      </div>
    </div>
  )
}

function Bar({ label, score }) {
  const col = score >= 80 ? C.caramel : score >= 65 ? C.lavender : C.iris
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 11, color: C.ash, fontFamily: FONT_SANS }}>{label}</span>
        <span style={{ fontSize: 11, color: col, fontFamily: FONT_SANS, fontWeight: 500 }}>{score}</span>
      </div>
      <div style={{ background: C.ember, borderRadius: 4, height: 4 }}>
        <div style={{ background: col, borderRadius: 4, height: 4, width: `${score}%` }} />
      </div>
    </div>
  )
}

function Monthly({ months, yongsinA, gisinA }) {
  const [sel, setSel] = useState(0)
  if (!months.length) return <div style={txt}>월별 흐름을 읽는 중이야.</div>
  const m = months[sel]
  const areas = m.areas || {}
  const cmt = m.score >= 80
    ? `흐름이 좋은 달이야.${yongsinA ? ` 용신 ${yongsinD} 방향으로 움직이면 결과가 나와.` : " 적극적으로 움직여도 좋아."}`
    : m.score >= 65
    ? "무난한 달이야. 꾸준히 나아가면 좋아."
    : `${gisinA ? `기신 ${gisinD} ` : "기신 "}기운이 강한 달이야. 큰 결정은 미루는 게 좋아.`
  return (
    <div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
        {months.map((mo, i) => (
          <div key={i} onClick={() => setSel(i)} style={{
            background: sel === i ? C.mahogany : C.ember,
            border: `1px solid ${sel === i ? C.caramel : C.ember}`,
            borderRadius: 8, padding: "8px 10px", cursor: "pointer",
            minWidth: 58, textAlign: "center", flexShrink: 0,
          }}>
            <div style={{ fontSize: 10, color: C.ash, fontFamily: FONT_SANS, marginBottom: 2 }}>{mo.label}</div>
            <div style={{ fontSize: 12, color: mo.score >= 80 ? C.caramel : mo.score >= 65 ? C.lavender : C.iris, fontFamily: FONT_SANS, fontWeight: 500 }}>{mo.score}</div>
            <div style={{ fontSize: 9, color: C.fog, fontFamily: FONT_SANS }}>{mo.ganji}</div>
            {mo.isThis && <div style={{ fontSize: 8, color: C.caramel, fontFamily: FONT_SANS }}>이번달</div>}
          </div>
        ))}
      </div>
      <div style={{ background: C.ember, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, color: C.sand, fontFamily: FONT_SANS, marginBottom: 2 }}>{m.label} {m.ganji} 종합 {m.score}점</div>
        <Bar label="건강" score={areas.건강 || 0} />
        <Bar label="재물" score={areas.재물 || 0} />
        <Bar label="커리어" score={areas.커리어 || 0} />
        <Bar label="관계" score={areas.관계 || 0} />
        <Bar label="애정" score={areas.애정 || 0} />
        <div style={{ marginTop: 12, fontSize: 13, color: C.parchment, fontFamily: FONT, lineHeight: 1.8 }}>{cmt}</div>
      </div>
    </div>
  )
}

function BestMonth({ months, category, label }) {
  const vals = (months || []).map(m => ({ label: m.label, ganji: m.ganji, score: (m.areas && m.areas[category]) || 0 }))
  if (!vals.length) return <div style={txt}>흐름을 읽는 중이야.</div>
  const best = vals.reduce((a, b) => (b.score > a.score ? b : a), vals[0])
  const [y, mo] = (best.label || "").split(".")
  const period = y && mo ? `${y}년 ${parseInt(mo)}월` : best.label
  return (
    <div>
      <div style={{ background: C.mahogany, borderRadius: 12, padding: "16px 18px", textAlign: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: C.sand, fontFamily: FONT_SANS, marginBottom: 4 }}>가장 좋은 달</div>
        <div style={{ fontSize: 22, color: C.parchment, fontFamily: FONT, fontWeight: 600 }}>{period}</div>
        <div style={{ fontSize: 12, color: C.sand, fontFamily: FONT_SANS, marginTop: 4 }}>{best.ganji || ""}, {best.score}점</div>
      </div>
      <div style={{ fontSize: 14, color: C.parchment, fontFamily: FONT, lineHeight: 1.8 }}>
        앞으로 1년 중 이 달의 기운이 제일 좋아. {ACTION_HINT[category] || "중요한 결정은 이때를 노려."} 이 달이 제일이야.
      </div>
    </div>
  )
}

function DaeunMap({ daeun }) {
  if (!daeun || !daeun.length) return <div style={txt}>대운을 읽는 중이야.</div>
  const col = (s) => s >= 80 ? C.lavender : s >= 58 ? C.iris : C.walnut
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100, marginBottom: 10 }}>
        {daeun.map((dv, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <div style={{ fontSize: 9, color: dv.cur ? C.sand : C.fog, fontFamily: FONT_SANS, marginBottom: 2, fontWeight: dv.cur ? 700 : 400 }}>{dv.score}</div>
            <div style={{ width: "72%", height: `${dv.score}%`, background: dv.cur ? C.sand : col(dv.score), borderRadius: 3 }} />
            <div style={{ fontSize: 10, color: dv.cur ? C.sand : C.lavender, fontFamily: FONT, marginTop: 4, fontWeight: dv.cur ? 700 : 400 }}>{dv.label}</div>
            <div style={{ fontSize: 8, color: C.fog, fontFamily: FONT_SANS }}>{dv.startYear ? dv.startYear : ""}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CategoryScore({ months, category, thisYearScore, label }) {
  // months: monthForecast 배열, category: '재물'|'애정'|'커리어'|'건강'|'관계'
  const vals = (months || []).map(m => ({ label: m.label, ganji: m.ganji, score: category === "종합" ? (m.score || 0) : ((m.areas && m.areas[category]) || 0), isThis: m.isThis }))
  const best = vals.reduce((a, b) => (b.score > (a?.score || 0) ? b : a), null)
  const col = (s) => s >= 80 ? C.lavender : s >= 65 ? C.iris : C.walnut
  const yr = thisYearScore || 0
  const [selected, setSelected] = useState(null)
  const displayScore = selected ? selected.score : yr
  const displayLabel = selected ? `${(selected.label || "").replace(".", "년 ")}월 ${label}` : `올해 ${label}`
  // "2026.7" -> "26.07" 형식으로, x축에 연도 넘어가는 지점이 보이도록
  const shortLabel = (lbl) => {
    const [y, m] = (lbl || "").split(".")
    return (y && m) ? `${y.slice(2)}.${m.padStart(2, "0")}` : ""
  }
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: C.ash, fontFamily: FONT_SANS }}>{displayLabel}</span>
        <span style={{ fontSize: 28, color: col(displayScore) === C.walnut ? C.sand : col(displayScore), fontFamily: FONT, fontWeight: 600, transition: "color 0.2s" }}>{displayScore}</span>
        <span style={{ fontSize: 13, color: C.ash, fontFamily: FONT_SANS }}>점</span>
        {selected && <button onClick={() => setSelected(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: C.fog, fontSize: 11, cursor: "pointer", fontFamily: FONT_SANS }}>초기화</button>}
      </div>
      <div style={{ fontSize: 11, color: C.fog, fontFamily: FONT_SANS, marginBottom: 8 }}>조회일 기준 향후 12개월 흐름, 막대를 눌러보면 그 달 점수를 볼 수 있어</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 70, marginBottom: 8 }}>
        {vals.map((v, i) => (
          <div key={i}
            onMouseEnter={() => setSelected(v)}
            onMouseLeave={() => setSelected(null)}
            onClick={() => setSelected(selected && selected.label === v.label ? null : v)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", cursor: "pointer" }}
          >
            <div style={{ width: "70%", height: `${Math.max(6, v.score)}%`, background: v.isThis ? C.sand : col(v.score), borderRadius: 3, opacity: selected && selected.label !== v.label ? 0.5 : 1, transition: "opacity 0.15s" }} />
            <div style={{ fontSize: 8, color: v.isThis ? C.sand : C.fog, fontFamily: FONT_SANS, marginTop: 3 }}>{shortLabel(v.label)}</div>
          </div>
        ))}
      </div>
      {best && (
        <div style={{ fontSize: 13, color: C.parchment, fontFamily: FONT, lineHeight: 1.7, marginTop: 8 }}>
          조회일 기준 향후 12개월 중 {best.label?.replace(".", "년 ")}월이 {yr >= 70 ? "제일 강해" : "그나마 가장 나아"}. {ACTION_HINT[category] || "중요한 일을 벌일 거면 이때를 노려."}
        </div>
      )}
    </div>
  )
}
const ACTION_HINT = {
  "재물": "큰 지출, 투자, 계약을 할 거면 이때를 노려.",
  "애정": "고백, 소개팅, 중요한 만남은 이때가 좋아.",
  "관계": "새 인맥을 만들거나 껄끄러운 사이를 풀 거면 이때야.",
  "건강": "건강검진, 미뤄둔 치료, 새 운동이나 식단을 시작할 거면 이때야.",
  "커리어": "이직, 중요한 프로젝트, 면접은 이때를 노려.",
  "종합": "인생에서 큰 결정을 내릴 거면 이때가 가장 좋아.",
}

function PeakYears({ data }) {
  if (!data || data.none) return <div style={txt}>{data?.none || ""}</div>
  const AREA_LABEL = { 재물: "재물운", 애정: "애정운", 커리어: "커리어운", 건강: "건강운", 관계: "관계운" }
  return (
    <div>
      <div style={{ ...txt, marginBottom: 14 }}>{data.intro}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {data.years.map((y, i) => (
          <div key={i} style={{ background: C.abyss, borderRadius: 10, padding: "12px 14px", borderLeft: `3px solid ${C.iris}` }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: C.parchment, fontFamily: FONT }}>{y.year}년</span>
              <span style={{ fontSize: 12, color: C.lavender, fontFamily: FONT_SANS }}>{AREA_LABEL[y.area] || "종합운"} {y.score}점</span>
            </div>
            <div style={{ fontSize: 13.5, color: C.ash, fontFamily: FONT_SANS, lineHeight: 1.75 }}>{y.msg}</div>
          </div>
        ))}
      </div>
      <div style={txt}>{data.closing}</div>
    </div>
  )
}

function Block({ h, text, kw, jsxContent, accent, last, noLine }) {
  if (!text && !h && !jsxContent) return null
  const wrapStyle = last ? {} : noLine ? { marginBottom: 20 } : dvd
  return (
    <div style={wrapStyle}>
      {h && <div style={hdg(accent || C.caramel)}>{h}</div>}
      {kw && <div style={{ fontSize: 15, color: C.caramel, fontFamily: FONT, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>{kw}</div>}
      {text && <div style={txt}>{text}</div>}
      {jsxContent && <div>{jsxContent}</div>}
    </div>
  )
}

// 카테고리별 잠금 화면 후킹 문구 — 무료에서 보여준 결과의 "이유"를 안 풀고 끊는 방식
const HOOK_TEXT = {
  "사주 심화": "지금까지 본 건 기본 풀이야. 진짜 사주 풀이는 여기 있는데, 이거 모르고 넘어가면 반만 알고 사는 거야.",
  "재물운": "지금 눈앞에 돈 들어올 구멍 하나 열려있어. 근데 이거 아무 때나 열려있는 거 아니야. 언제, 어디서 들어오는지 궁금하지 않아?",
  "연애운": "지금 스쳐 지나가는 그 사람, 인연 맞아. 근데 이번에 놓치면 다음 인연은 몇 년 뒤야.",
  "애정운": "연애할 때마다 똑같은 이유로 헤어지는 거, 알고 있었어? 이번에도 모르고 들어가면 또 똑같이 끝나.",
  "직장운": "열심히 하면 잘될 거라는 착각, 그게 발목을 잡고 있을 수도 있어. 방향이 안 맞으면 아무리 애써도 제자리야.",
  "취업운": "합격 문 열리는 시기, 따로 있어. 같은 이력서도 타이밍만 맞으면 결과 완전히 달라져. 그 시기가 언제인지 궁금하지 않아?",
  "관계운": "곁에 있는 사람 중에, 기운 갉아먹는 사람 하나 있어. 근데 아직 못 알아챘을 수도 있어.",
  "건강운": "별거 아니라고 넘기는 그 신호, 사주에선 이미 잡혀. 이거 놓치면 나중에 제대로 발목 잡혀.",
  "가족운": "반복되는 그 갈등 패턴, 우연 아니야. 뿌리를 모르고 넘어가면 다음 세대까지 그대로 물려줘.",
  "평생운": "매년 변하지 않는 진짜 이유, 사주에 다 나와 있어. 모르고 넘기면 내년에도 똑같아.",
}
const HOOK_DEFAULT = "지금까지 본 건 기본 풀이야. 진짜 이유는 아직 안 풀었어."

// 유료 카테고리 목록 페이지 (4페이지 뒤 신설)
const CATEGORY_ICONS = {
  "사주 심화": "☯", "재물운": "❖", "연애운": "♡", "애정운": "❥", "직장운": "▤",
  "취업운": "◎", "관계운": "◍", "건강운": "✚", "가족운": "⌂", "평생운": "✦",
}
function CategoryListPage({ categories, unlockedCategories, onSelect }) {
  return (
    <div style={{ background: C.dusk, border: `1px solid ${C.mahogany}`, borderRadius: 16, overflow: "hidden", minHeight: 480, boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px ${C.ember}` }}>
      <div style={{ background: `linear-gradient(135deg, ${C.mahogany} 0%, ${C.abyss} 100%)`, padding: "24px 24px 20px", borderBottom: `1px solid ${C.ember}` }}>
        <div style={{ fontSize: 9, letterSpacing: 4, color: C.plum, textTransform: "uppercase", fontFamily: FONT_SANS, marginBottom: 14 }}>더 깊은 리딩</div>
        <div style={{ fontSize: 15, color: C.parchment, lineHeight: 1.6, fontFamily: FONT, fontWeight: 400 }}>99%가 놓치는{"\n"}인생 역전의 순간, 지금 이 안에 있어.</div>
      </div>
      <div style={{ padding: "16px" }}>
        {categories.map((cat) => {
          const unlocked = unlockedCategories.includes(cat.name)
          return (
            <div key={cat.name} onClick={() => !unlocked && onSelect(cat)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", marginBottom: 8,
              background: C.void, border: `1px solid ${unlocked ? C.walnut : C.ember}`, borderRadius: 12,
              cursor: unlocked ? "default" : "pointer",
            }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.abyss, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15, color: C.lavender }}>{CATEGORY_ICONS[cat.name] || "✦"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: C.parchment, fontWeight: 400, fontFamily: FONT }}>{cat.name}</div>
                <div style={{ fontSize: 11, color: unlocked ? C.caramel : C.ash, marginTop: 2, fontFamily: FONT_SANS, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{unlocked ? "구매 완료, 눌러서 이동" : (HOOK_TEXT[cat.name] || "")}</div>
              </div>
              <div style={{ flexShrink: 0, fontSize: 13, color: unlocked ? C.caramel : C.fog, fontFamily: FONT_SANS }}>{unlocked ? "열림" : "🔒"}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChapterCard({ label, tag, tagColor, tagText, accent, title, subtitle, blocks, extra, flipping, flipDir, locked, category, onUnlock, noDvd }) {
  const visibleBlocks = blocks.filter(Boolean)
  const teaserBlock = locked ? visibleBlocks[0] : null
  const restCount = locked ? Math.max(visibleBlocks.length - 1, 0) : 0
  return (
    <div style={{
      background: C.dusk, border: `1px solid ${C.mahogany}`, borderRadius: 16, overflow: "hidden",
      transform: flipping ? (flipDir > 0 ? "rotateY(-15deg) scale(0.96)" : "rotateY(15deg) scale(0.96)") : "rotateY(0deg) scale(1)",
      transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
      transformOrigin: flipDir > 0 ? "left center" : "right center",
      boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px ${C.ember}`,
      minHeight: 480,
    }}>
      <div style={{ background: `linear-gradient(135deg, ${C.mahogany} 0%, ${C.abyss} 100%)`, padding: "24px 24px 18px", borderBottom: `1px solid ${C.ember}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: 4, color: accent, textTransform: "uppercase", fontFamily: FONT_SANS, fontWeight: 400 }}>{label}</div>
          {tag && <div style={{ background: tagColor, borderRadius: 20, padding: "3px 10px", fontSize: 11, color: tagText, fontFamily: FONT_SANS, fontWeight: 400 }}>{tag}</div>}
        </div>
        <div style={{ fontSize: 17, color: C.parchment, lineHeight: 1.6, whiteSpace: "pre-line", fontWeight: 400, fontFamily: FONT }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: C.ash, marginTop: 6, fontFamily: FONT_SANS, letterSpacing: 0.5, fontWeight: 400 }}>{subtitle}</div>}
      </div>
      <div style={{ padding: "20px 24px 24px" }}>
        {extra}
        {!locked && visibleBlocks.map((b, i) => (
          <Block key={i} {...b} last={i === visibleBlocks.length - 1} noLine={noDvd} />
        ))}
        {locked && teaserBlock && <Block {...teaserBlock} last={false} />}
        {locked && (
          <div style={{ position: "relative", marginTop: 14 }}>
            <div aria-hidden="true" style={{ filter: "blur(6px)", opacity: 0.5, pointerEvents: "none", userSelect: "none" }}>
              {restCount > 0 && <Block {...visibleBlocks[1]} last={true} />}
            </div>
            <div style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", textAlign: "center",
              background: `linear-gradient(180deg, ${C.dusk}00 0%, ${C.dusk}f0 30%)`,
              padding: "24px 12px 8px", gap: 10,
            }}>
              <div style={{ fontSize: 13, color: C.parchment, lineHeight: 1.6, fontFamily: FONT, maxWidth: 320 }}>{HOOK_TEXT[category] || HOOK_DEFAULT}</div>
              <button onClick={() => onUnlock && onUnlock(category)} style={{
                background: C.plum, border: "none", borderRadius: 20, padding: "10px 22px",
                color: C.lavender, fontSize: 13, fontFamily: FONT_SANS, fontWeight: 600, cursor: "pointer",
              }}>🔒 {category} 전체보기 · 구매하기</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MoraReport({ d, onHome, onSavePDF, pdfLoading, pdfMode, parentAstroAI, setParentAstroAI, parentTarotAI, setParentTarotAI, parentUnlockedCategories, setParentUnlockedCategories }) {
  const [current, setCurrent] = useState(0)
  // 열람(구매) 카테고리는 부모(SajuReport)의 state를 우선 따름 — PDF 저장 시 이 값이 그대로 오프스크린 인스턴스에 전달되어야 잠금 없이 캡처됨
  const [unlockedCategories, setUnlockedCategories] = useState(parentUnlockedCategories || d?.unlockedCategories || [])
  const handleUnlock = (category) => {
    if (!category || unlockedCategories.includes(category)) return
    const next = [...unlockedCategories, category]
    setUnlockedCategories(next)
    setParentUnlockedCategories && setParentUnlockedCategories(next)
    // TODO: PG 연동 시 여기서 결제 플로우 실행 후 성공 콜백에서 unlock + Supabase 저장으로 교체
  }
  const [flipping, setFlipping] = useState(false)
  const [flipDir, setFlipDir] = useState(null)
  const [astroAI, setAstroAI] = useState(parentAstroAI || null) // _astroAI 캐시 무시 항상 새로 계산
  const [tarotAI, setTarotAI] = useState(parentTarotAI || d._tarotAI || null)
  const [loadingAstro, setLoadingAstro] = useState(!astroAI)

  const goTo = (dir) => {
    if (flipping) return
    const next = current + dir
    if (next < 0 || next >= chapters.length) return
    setFlipDir(dir); setFlipping(true)
    setTimeout(() => { setCurrent(next); setFlipping(false); setFlipDir(null) }, 400)
  }
  const jumpTo = (idx) => {
    if (flipping || idx < 0 || idx >= chapters.length || idx === current) return
    const dir = idx > current ? 1 : -1
    setFlipDir(dir); setFlipping(true)
    setTimeout(() => { setCurrent(idx); setFlipping(false); setFlipDir(null) }, 400)
  }

  // 별자리는 로컬 계산(d.astro)을 쓰므로 AI 호출 없음

  // 별자리·타로 모두 로컬 데이터를 쓰므로 AI 호출이 전혀 없어.

  // ── 데이터 추출 ──
  const bnd = d.boundary
  const isBnd = bnd?.isBoundary
  const ss = d.summary?.sixSystems || []
  const sajuSys = ss.find(s => s.system === "사주") || {}
  const tojungSys = ss.find(s => s.system === "토정비결") || {}
  const juyeokSys = ss.find(s => s.system === "주역") || {}
  const tarotSys = ss.find(s => s.system === "타로수비학") || {}
  const mbtiSys = ss.find(s => s.system === "MBTI") || {}
  const a = d.astro || {}
  const t = d.tarot || {}
  const dn = d.daynight || {}
  const night = dn.night || {}

  // 오행 — ohaengDist는 한자키(木火土金水)로 오므로 한글키(목화토금수)로 정규화
  const _HANJA2KR = { 木: "목", 火: "화", 土: "토", 金: "금", 水: "수" }
  const _rawOhaeng = d.ohaengDist || {}
  const ohaeng = Object.fromEntries(
    Object.entries(_rawOhaeng).map(([k, v]) => [_HANJA2KR[k] || k, v])
  )
  // 다섯 오행 모두 0으로라도 채워두기 (없는 오행 판정용)
  for (const k of ["목", "화", "토", "금", "수"]) if (ohaeng[k] === undefined) ohaeng[k] = 0
  const dominant = Object.entries(ohaeng).sort((x, y) => y[1] - x[1])[0]?.[0] || "토"
  const singang = d.singang || ""
  const isSingang = singang.includes("강")
  const yongsinA = d.yongsinA || ""
  const gisinA = d.gisinA || ""
  // 본문 표시용: 오행을 순우리말(나무/불/흙/금/물)로, 두 개 병기 시 콤마. (조회/분기는 원본 yongsinA/gisinA 유지)
  const _ohKr = (s) => (s || "").split("·").map(x => OHK_KR[x] || x).join(", ")
  const yongsinD = _ohKr(yongsinA)
  const gisinD = _ohKr(gisinA)

  // 별자리 띠이름 완전 변환
  const zodiacFix = (s) => {
    if (!s) return ""
    return s
      .replace(/[一-龯\u4E00-\u9FFF]{2,}/g, "")
      .replace(/[（(][^）)]+[）)]/g, "")
      .replace(/戊|己|庚|辛|壬|癸|甲|乙|丙|丁/g, "")
      .replace(/쥐자리/g, "양자리").replace(/소자리/g, "황소자리")
      .replace(/범자리|호랑이자리/g, "쌍둥이자리").replace(/토끼자리/g, "게자리")
      .replace(/용자리/g, "사자자리").replace(/뱀자리/g, "처녀자리")
      .replace(/말자리/g, "천칭자리").replace(/양자리\(미\)|미자리|양자리\(羊\)/g, "전갈자리")
      .replace(/원숭이자리/g, "사수자리").replace(/닭자리/g, "염소자리")
      .replace(/개자리/g, "물병자리").replace(/돼지자리/g, "물고기자리")
      .replace(/\s{2,}/g, " ").trim()
  }
  const sunSign = a.sun && a.sun !== "분석 중" ? a.sun : null
  const moonSign = a.moon && a.moon !== "분석 중" ? a.moon : null
  const ascSign = a.asc && a.asc !== "분석 중" ? a.asc : null

  // 신살 한 박스, 엔터 구분, 마침표
  // 신살 JSX로 렌더링 (이름 색상 + 짧은 한 줄 설명만 — 볼륨 축소)
  const sinsalJSX = d.sinsal?.length
    ? (() => {
        const shown = d.sinsal
        const items = shown.map((s, i) => {
          const nm = s.name.replace(/\([^)]*\)/g, "").trim()
          const easy = s.easy ? ` ${mug(s.easy)}` : (s.desc ? ` ${mug(s.desc).split(".")[0]}.` : "")
          return React.createElement("div", { key: i, style: { marginBottom: i < shown.length - 1 ? 8 : 0 } },
            React.createElement("span", { style: { color: C.sand, fontSize: 14, fontFamily: FONT, fontWeight: 400 } }, nm),
            React.createElement("span", { style: { color: C.parchment, fontSize: 14, fontFamily: FONT, fontWeight: 400 } }, easy)
          )
        })
        return items
      })()
    : [React.createElement("div", { key: 0, style: { color: C.parchment, fontSize: 14, fontFamily: FONT } }, "특별한 신살 없어. 안정적인 구조야. 튀지 않는 대신 오래 가.")]
  const sinsalText = ""

  // 12신살 JSX (각 기둥별)
  const mkPillarBlock = (arr, titleKey) => (arr && arr.length)
    ? arr.map((s, i) => React.createElement("div", { key: i, style: { marginBottom: i < arr.length - 1 ? 16 : 0, paddingBottom: i < arr.length - 1 ? 16 : 0, borderBottom: i < arr.length - 1 ? `1px solid ${C.ember}` : "none" } },
        // 위치 뱃지 + 이름
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 } },
          React.createElement("span", { style: { fontSize: 11, color: C.lavender, fontFamily: FONT_SANS, background: C.plum, borderRadius: 5, padding: "3px 8px", fontWeight: 500 } }, `${s.label} · ${s.ji}`),
          React.createElement("span", { style: { color: C.sand, fontSize: 16, fontFamily: FONT, fontWeight: 500 } }, (s[titleKey] || "").replace(/\(.*\)/, ""))
        ),
        React.createElement("div", { style: { color: C.parchment, fontSize: 14, fontFamily: FONT, lineHeight: 1.8 } }, mug(s.desc || s.easy || ""))
      ))
    : [React.createElement("div", { key: 0, style: { color: C.parchment, fontSize: 14, fontFamily: FONT } }, "분석 중이야.")]
  // 십성 분석 렌더러
  const sibsongJSX = (d.sibsongAnalysis?.top || []).length
    ? d.sibsongAnalysis.top.map((s, i) => React.createElement("div", { key: i, style: { marginBottom: i < d.sibsongAnalysis.top.length - 1 ? 16 : 0, paddingBottom: i < d.sibsongAnalysis.top.length - 1 ? 16 : 0, borderBottom: i < d.sibsongAnalysis.top.length - 1 ? `1px solid ${C.ember}` : "none" } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 } },
          React.createElement("span", { style: { fontSize: 11, color: C.lavender, fontFamily: FONT_SANS, background: C.plum, borderRadius: 5, padding: "3px 8px", fontWeight: 500 } }, `${s.key} ${s.count}`),
          React.createElement("span", { style: { color: C.sand, fontSize: 16, fontFamily: FONT, fontWeight: 500 } }, s.label)
        ),
        React.createElement("div", { style: { color: C.parchment, fontSize: 14, fontFamily: FONT, lineHeight: 1.8 } }, mug(s.desc || ""))
      ))
    : [React.createElement("div", { key: 0, style: { color: C.parchment, fontSize: 14, fontFamily: FONT } }, "분석 중이야.")]
  const sinsal12JSX = mkPillarBlock(d.sinsal12, "name")
  const unseong12JSX = mkPillarBlock(d.unseong12, "stage")


  // 토정비결
  const tojungKw = tojungSys.key?.replace(/[（(][一-龯\u4E00-\u9FFF]+[）)]/g, "").trim() || ""
  const tojungDesc = noColon(tojungSys.desc || "").replace(/^[\n\r]+/, "")

  // 주역 — 괘명을 문장 앞머리에 자연스럽게, nature와 strategy 사이 종결
  const _ichingRaw = (juyeokSys.key || d.iching?.bonmyeonggae || "")
  const _ichingKoMatch = _ichingRaw.match(/[（(]([가-힣]+)[）)]/)
  const ichingKw = _ichingKoMatch ? _ichingKoMatch[1] : _ichingRaw.replace(/[.:：]/g, "").replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim()
  const _ichingNatureRaw = noColon(juyeokSys.desc || d.iching?.gaeNature || "").replace(/^[\n\r]+/, "").replace(/[.\s]+$/, "")
  const ichingStrategy = (d.iching?.strategy || []).slice(0, 2).map(noColon)
  const ichingBodyText = `지금 이 사주에는 ${_ichingNatureRaw}의 기운이 흐르고 있고, 이걸 알고 움직이는 것과 모르고 움직이는 건 결과가 달라.${ichingStrategy.length ? " " + ichingStrategy.join(" ") : " 이 흐름을 알고 움직이면 훨씬 수월하게 넘어갈 수 있어."}`

  // 일주 설명
  const iljuDescStd = mug(isBnd ? bnd.standardDesc : (sajuSys.desc || ""))
  const iljuDescMid = mug(bnd?.midnightDesc || "")

  // 당사주
  const dansajuPillars = d.dansaju?.pillars || []
  const dansajuText = (() => {
    if (!dansajuPillars.length) return ""
    const stars = dansajuPillars.map(p => p.byeolseong?.split("(")[0].replace(/\([^)]*\)/g, "").trim() || "").filter(Boolean)
    const kws = dansajuPillars.map(p => p.kw || "").filter(Boolean)
    return `별이 네 개야. ${stars.join(", ")} 순서로 흘러가. ${kws.slice(0, 2).map(k => k.replace(/·/g, ", ")).join("과 ")}의 기운이 삶의 뼈대를 만들어.`
  })()

  // 별자리 텍스트 한자 완전 제거
  const astroSunText = sunSign ? mug(a.sunDesc || "") : ""
  const astroMoonText = moonSign ? mug(a.moonDesc || "") : ""
  const astroAscText = ascSign ? mug(a.ascDesc || "") : ""

  // 타로
  const tarotLifeText = mug(t.lifePathDesc || tarotSys.desc || "")
  const tarotSoulText = mug(t.soulDesc || "")
  const tarotCardName = (t.lifePathCard || "본명 카드").replace(/\([^)]*\)/g, "").trim()
  // 오행별 행동 처방 (page1Action, 다섯관점 결론 등에서 공용)
  const _actionByOh = {
    목: "나무 기운이 강하면 가만히 있을 때보다 뭔가 벌일 때 기운이 살아. 방향만 잘 잡으면 거침없이 뻗어나가는 구조야.",
    화: "불 기운이 강하면 드러내고 표현할 때 기운이 붙어. 숨기지 말고 존재감을 자연스럽게 꺼내는 게 맞아.",
    토: "흙 기운이 강하면 서두르기보다 다지는 쪽이 맞아. 급하게 가지 말고 기반부터 단단히 다져.",
    금: "금속 기운이 강하면 원칙과 기준을 분명히 세울 때 힘이 실려. 흐리멍텅하게 가지 말고 확실히 선을 그어.",
    수: "물 기운이 강하면 억지로 밀어붙이기보다 흐름을 타는 게 맞아. 때를 기다리다 트일 때 확 나아가.",
  }
  // 동서양 종합 결론 (다섯 관점 통합) — 마지막 문장은 오행별로 개인화
  const ARCHETYPE_LINE_BY_OH = {
    목: "결국 뭔가를 계속 벌이고 키워가야 살아있다고 느껴.",
    화: "결국 존재감을 드러내고 나눌 때 비로소 채워져.",
    토: "결국 흔들림 없이 자기 자리를 지키는 걸로 존재를 증명해.",
    금: "결국 원칙과 기준으로 스스로를 세워.",
    수: "결국 겉으론 잔잔해도 속으로 깊이 사유해.",
  }
  const fiveViewText = `사주와 당사주, 토정비결은 ${dominant ? OHK_KR[dominant] : ""} 기운을 짚고, 별자리(${sunSign || "별자리"})와 타로(${tarotCardName})도 같은 결을 다른 언어로 그려. ${ARCHETYPE_LINE_BY_OH[dominant] || ARCHETYPE_LINE_BY_OH["토"]}`

  // 동서양 종합 4 — 다섯 관점이 "엇갈리는" 지점 (수렴이 아니라 긴장·입체감)
  const _SUN_ELEM = {
    양자리: "불", 사자자리: "불", 사수자리: "불",
    황소자리: "흙", 처녀자리: "흙", 염소자리: "흙",
    쌍둥이자리: "공기", 천칭자리: "공기", 물병자리: "공기",
    게자리: "물", 전갈자리: "물", 물고기자리: "물",
  }
  const fiveViewTensionText = (() => {
    // 사주(오행) 성향: 안정형 vs 확장형 vs 사색형
    const sajuStable = ["토", "금"].includes(dominant)
    const sajuLabel = sajuStable ? "기반을 다지고 지키는 안정" : dominant === "수" ? "깊이 파고들고 유연하게 흐르는 사색" : "새로 벌이고 밀어붙이는 확장"
    // 별자리(원소) 성향
    const elem = sunSign ? _SUN_ELEM[sunSign] : null
    const astroOutward = elem === "불" || elem === "공기"
    const astroLabel = !elem ? null : astroOutward ? "밖으로 뻗고 변화를 좇는" : "안으로 다지고 안정을 찾는"
    // 타로 생명경로물 성향
    const lp = parseInt(t.lifePath || "0")
    const tarotDrive = [1, 3, 5].includes(lp) ? "개척" : [2, 4, 6, 8].includes(lp) ? "안정" : lp ? "성찰" : null
    // 사주 vs 별자리 긴장
    const clash = astroLabel && (sajuStable === !astroOutward ? false : true)
    let body
    if (!elem) {
      body = `이 사주는 ${sajuLabel} 기운이 중심이야. 태어난 시간이 없어 별자리는 못 겹쳐 보지만, 동양의 결 안에서도 밀고 당기는 두 힘이 함께 있어. 그 진폭 자체가 입체감으로 남아.`
    } else if (clash) {
      body = `하지만 사주는 ${sajuLabel}을 말하는데, 별자리는 ${astroLabel} 기질을 가리켜. 방향이 엇갈리지만 결함이 아니야. 두 힘이 팽팽히 당겨 입체가 생겨. 겉은 안정을 지키면서 속으로 딴 세상을 꿈꾸는 낙차가 매력이자 숙제야.`
    } else {
      body = `사주도 별자리도 ${sajuLabel} 쪽으로 결이 비슷하게 모여. 드물게 안팎이 한 방향인 구조라 흔들려도 결국 제자리를 찾아와. ${tarotDrive ? `타로의 ${tarotDrive} 기운만 살짝 다른 각을 주는데, ` : ""}그 작은 어긋남이 지루함을 깨는 변주야.`
    }
    return body
  })()

  // 성격 요약 (후킹용 보편화 · 무당체)
  const strengths = (d.mbti?.strengths || []).map(mug).filter(Boolean).slice(0, 2)
  const challenges = (d.mbti?.challenges || []).map(mug).filter(Boolean).slice(0, 2)
  const dayImpression = mug(dn.day?.impression || "")
  const daymask = mug(dn.day?.mask || "")
  // 후킹 보편화: 신강/신약 + 일간 오행 기반, 누구나 뜨끔할 심리를 무당이 툭 던지는 톤
  const _persO = OHK_KR[dominant] || ""
  const yearForecast = d.summary?.yearForecast || []
  const thisYear = yearForecast[0] || {}
  const _topSibsong = (() => {
    const cc = d.sibsongAnalysis?.counts || {}
    const groups = {
      비겁: (cc["비견"] || 0) + (cc["겁재"] || 0),
      식상: (cc["식신"] || 0) + (cc["상관"] || 0),
      재성: (cc["편재"] || 0) + (cc["정재"] || 0),
      관성: (cc["편관"] || 0) + (cc["정관"] || 0),
      인성: (cc["편인"] || 0) + (cc["정인"] || 0),
    }
    return Object.entries(groups).sort((a, b) => b[1] - a[1])[0][0]
  })()
  // ── 세분화 공용 axis ──
  const _scA = d.sibsongAnalysis?.counts || {}
  const _bijG = (_scA["비견"] || 0) + (_scA["겁재"] || 0)
  const _sikG = (_scA["식신"] || 0) + (_scA["상관"] || 0)
  const _jaeG = (_scA["편재"] || 0) + (_scA["정재"] || 0)
  const _gwanG = (_scA["편관"] || 0) + (_scA["정관"] || 0)
  const _inG = (_scA["편인"] || 0) + (_scA["정인"] || 0)
  const _jeongJ = _scA["정재"] || 0, _pyeonJ = _scA["편재"] || 0
  // 최다 십성으로 5갈래 픽
  const pick5 = (m) => m[_topSibsong] || m["재성"] || Object.values(m)[0]
  // 재성 구조 키: 편재우세 / 정재우세 / 과다 / 없음 / 균형
  const _jaeStruct = _jaeG === 0 ? "없음" : _jaeG >= 3 ? "과다" : _pyeonJ > _jeongJ ? "편재" : _jeongJ > _pyeonJ ? "정재" : "균형"
  // 최다 오행 순우리말(다가가기 등)
  const _domOhKr = OHK_KR[dominant] || "나무"
  const _punch = {
    비겁: "근데 그거 알아? 무리에 섞여 있다가도 결정적인 순간엔 끝내 자기 두 발로 서고 마는 사람이야. 그 꺾이지 않는 심지가 이 사주의 진짜 척추야.",
    식상: "근데 그거 알아? 머릿속에선 이미 남보다 열 걸음 앞서 그림을 그리고 있어. 그 상상력이 결국 재능으로 증명되는 사람이야.",
    재성: "근데 그거 알아? 순하고 무던해 보여도 필요할 땐 누구보다 계산이 빠르고 독해. 그 야무짐이 결국 이 사람을 남다르게 만들어.",
    관성: "근데 그거 알아? 다들 흔들릴 때 오히려 더 반듯해져서, 그 무게가 곁의 사람들까지 붙잡아 줘. 그 책임감이 이 사주의 진짜 그릇이야.",
    인성: "근데 그거 알아? 혼자 삭이는 그 깊이가 결국 남들이 못 보는 걸 먼저 읽어내는 눈이 돼. 그게 이 사주의 진짜 무기야.",
  }[_topSibsong] || "근데 그거 알아? 남들이 못 보는 자기만의 결을 끝내 찾아내고야 마는 사람이야."
  const _persoCore = isSingang
    ? `겉으론 강해 보여도 속은 안 그래. 책임감에 혼자 짊어지다 안에서 곪는 사람이야. 맞지?`
    : `겉은 무던하고 유순해 보여도 속은 훨씬 복잡해. 상처받으면 표현 없이 조용히 마음을 닫지. 맞지?`
 const personaHook = `${_persoCore} ${_punch}`
  const personaYear = (() => {
    const ty = yearForecast[0]
    if (!ty) return "올해는 흐름을 다지는 해야. 급하게 결과를 좇기보다 뿌리를 내리는 시기라고 봐."
    const s = ty.score || 0
    const yr = ty.year || new Date().getFullYear()
    if (s >= 78) return `올해는 흐름이 제대로 트이는 해야. 미뤄뒀던 걸 벌이고 판을 키워도 좋아. 망설이다 때 놓치지 마. 올해 잡은 기회가 앞으로 몇 년을 끌고 가. 특히 사람과 기회가 같이 들어오니, 문을 활짝 열어둬.`
    if (s >= 62) return `올해는 나쁘지 않아. 크게 터지진 않아도 꾸준히 쌓으면 손해 볼 일 없는 해야. 조급해하지 말고 할 일 하면서 다음 흐름을 준비해. 무리한 승부수보다 착실함이 답이야.`
    return `올해는 버티고 다지는 해야. 억지로 밀어붙이면 오히려 탈이 나. 새 판을 벌이기보다 내실을 채우고 실력을 쌓아둬. 지금 참고 준비한 게 다음 해에 터져. 조용히 힘을 모아.`
  })()

  // 재물
  const jaemuScore = thisYear?.areas?.재물 || 0
  const bestYear = [...yearForecast].sort((a, b) => (b.areas?.재물 || 0) - (a.areas?.재물 || 0))[0]
  // 애정/결혼 타이밍 전용 — 재물 기준 bestYear를 잘못 재사용하던 버그가 있어 분리함 (2026-07-27)
  const bestLoveYear = [...yearForecast].sort((a, b) => (b.areas?.애정 || 0) - (a.areas?.애정 || 0))[0]
  const reomulStructure = isSingang
    ? `에너지가 집중된 구조야. 돈 잡으면 오래 쥐고 있어. 근데 욕심이 화근이야. 한 번에 다 가지려다 날리는 패턴, 이미 경험했지?`
    : `에너지가 분산된 구조야. 돈이 들어와도 손에 안 남아. 구조가 그래. 잘못이 아닌데 이 패턴 모르면 평생 반복돼.`
  const wealthPatternText = pick5({
    비겁: "능력은 있어. 근데 혼자 다 하려다 힘이 분산돼. 사람과 나누고 판을 키울 때 오히려 돈이 붙어.",
    식상: "능력은 있어. 근데 만들기만 하고 파는 걸 놓쳐. 표현하고 내다 파는 데까지 가야 돈이 돼.",
    재성: "능력도 돈 감각도 좋아. 근데 여러 군데 벌여서 다 얕게 먹어. 하나에 집중해 깊게 팔 때 큰돈이 붙어.",
    관성: "능력도 인정도 있어. 근데 자리나 직책이 서야 돈이 따라오는 구조야. 벌이보다 자리에 오르는 게 먼저야.",
    인성: "능력은 있어. 근데 배우고 준비만 하다 실전 타이밍을 놓쳐. 완벽히 준비되기 전에 한 발 먼저 내밀어야 해.",
  }) + " 의지가 약해서 반복되는 게 아니야. 사주 구조상 원래 힘이 흩어지는 지점이 있는 거야."
  const _gd = GISIN_DETAIL[gisinA] || GISIN_DETAIL[gisinA?.split("·")[0]] || {}
  const reomulGisin = gisinA
    ? `${gisinD} 기운은 돈을 새게 만들어. 피해야 할 업종은 ${_gd["업종"] || gisinD + " 방향의 분야"} 쪽이야. 조심해야 할 사람은 ${_gd["사람"] || gisinD + " 기운이 강한 사람"}이야. 가까이 둘수록 재물이 막혀.`
    : ""
  const reomulYear = jaemuScore ? `올해 재물 흐름 ${jaemuScore}점이야. ${mug(thisYear.summary || "")}` : ""
  const reomulBest = bestYear && bestYear.year !== thisYear.year
    ? `향후 5년 중 ${bestYear.year}년이 재물 흐름이 제일 강해. 그때를 노려야 해.` : ""
  const reomulFlow = yearForecast.slice(0, 5).map(y => `${y.year}년 ${y.areas?.재물 || 0}점`).join(" · ")

  // 연애
  const desire = mug(night.desire || "")
  const desire2 = mug(night.desire2 || "")
  const idealType = mug(night.idealType || "")
  const idealType2 = mug(night.idealType2 || "")
  const triggers = (night.triggers || []).map(mug).filter(Boolean)

  // 커리어
  const bestEnv = mug(d.mbti?.bestEnv || "")
  const recovery = mug(d.mbti?.recovery || "")

  // 인간관계
  const dayMask = mug(dn.day?.mask || "")
  const dayImp = mug(dn.day?.impression || "")

  // 대운·세운
  const daeun = d.daeun || []
  const curDaeun = daeun.find(dv => dv.cur) || daeun[0]
  const nextDaeun = daeun[daeun.indexOf(curDaeun) + 1]
  const futureDaeun = daeun.slice(0, 5)
  const _daeunLabel = curDaeun ? (curDaeun.label?.replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim()) : ""
  // 이 대운의 의미 — 대운 오행이 용신/기신 중 무엇인지로 판단
  const _HANJA2KR_D = { 木:"목",火:"화",土:"토",金:"금",水:"수" }
  const _curDaeunO = curDaeun ? (_HANJA2KR_D[curDaeun.ohaeng] || curDaeun.ohaeng || "") : ""
  const _yongList = (yongsinA || "").split("·")
  const _giList = (gisinA || "").split("·")
  const daeunMeaning = curDaeun
    ? (_yongList.includes(_curDaeunO)
        ? `이 대운은 용신인 ${OHK_KR[_curDaeunO]||_curDaeunO} 기운이 들어오는 구간이야. 십 년 중 가장 크게 치고 나갈 수 있는 시기라, 미뤄뒀던 일을 벌여야 해.`
        : _giList.includes(_curDaeunO)
        ? `이 대운은 기신인 ${OHK_KR[_curDaeunO]||_curDaeunO} 기운이 강해지는 구간이야. 무리하게 확장하기보다 실력을 다지며 다음 대운을 준비해.`
        : `이 대운의 ${OHK_KR[_curDaeunO]||_curDaeunO} 기운은 용신도 기신도 아닌 중립 구간이야. 스스로 방향을 정하고 꾸준히 밀고 가는 사람이 결과를 만들어.`)
    : ""
  const _curDaeunTheme = curDaeun ? (() => {
    const map = { "목":"새로 싹트고 뻗어나가는 성장", "화":"재능을 드러내고 이름을 알리는 표현과 확장", "토":"기반을 다지고 중심을 세우는 안정", "금":"결실을 거두고 매듭짓는 수확", "수":"깊이 사색하고 다음을 준비하는 재충전" }
    return map[_curDaeunO] || "흐름을 다지는"
  })() : ""
  const _birthYear = parseInt((d.birth || "").match(/(\d{4})년/)?.[1] || "0")
  const _ageStart = (pd) => { const mch = (pd || "").match(/만\s*(\d+)/); return mch ? parseInt(mch[1]) : null }
  const _daeunYear = (pd) => { const a = _ageStart(pd); return (_birthYear && a != null) ? _birthYear + a : null }
  const _daeunRange = (pd) => { const y = _daeunYear(pd); return y ? `${y}년~${y + 9}년` : "" }
  const _curRange = curDaeun ? _daeunRange(curDaeun.period) : ""
  const daeunCurText = curDaeun
    ? `지금은 ${_daeunLabel} 대운${_curRange ? `(${_curRange})` : ""}이야. ${daeunMeaning}`
    : "대운 읽는 중이야."
  const _nextStartYear = nextDaeun ? _daeunYear(nextDaeun.period) : null
  const _nextRange = nextDaeun ? _daeunRange(nextDaeun.period) : ""
  const daeunNextText = nextDaeun
    ? `다음은 ${nextDaeun.label?.replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim()} 대운${_nextRange ? `(${_nextRange})` : ""}이야. ${_nextStartYear ? `${_nextStartYear}년부터 흐름이 바뀌어. ` : ""}그 전에 지금 대운에서 쌓아둔 게 다음 십 년을 결정해. 전환점이 오기 전에 지금 이 시기를 알차게 써야 해. 미뤄둔 게 있으면 이 대운 안에 끝내라는 뜻이야.`
    : "곧 대운이 바뀌는 시점이 와. 지금 쌓아둔 게 다음 십 년을 결정하니까, 이 시기를 알차게 써야 해. 미뤄둔 일이 있으면 지금 마무리해둬."
  const daeunFlow = futureDaeun.map(dv => { const lb = dv.label?.replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim(); const pd = dv.period || (dv.startAge ? `만 ${dv.startAge}~${Number(dv.startAge)+9}세` : ""); const yr = _daeunYear(pd); return `${lb} ${yr ? yr + "년~ " : ""}${pd}${dv.cur ? " (지금)" : ""}` }).join("\n")
  const yearFlowText = yearForecast.slice(0, 5).map(y => `${y.year}년 ${y.score}점 ${mug(y.summary || "")}`).join("\n")

  const sajuTag = (sajuSys.key || "").replace(/[（(][一-龯\u4E00-\u9FFF]+[）)]/g, "").trim()

  // 오행 서술 (I-2 오행분포용) — 카테고리 분리 없이 줄글 하나로
  const ohEntries = Object.entries(ohaeng).sort((x, y) => y[1] - x[1])
  const missingOh = Object.entries(ohaeng).filter(([, v]) => !v).map(([k]) => k)
  const _domTrait = OHK_STRONG_TRAIT[dominant] || OHK_DESC[dominant] || ""
  const _missTraits = missingOh.map(k => OHK_MISSING_TRAIT[k]).filter(Boolean)
  const _missPart = missingOh.length
    ? ` 대신 ${missingOh.map(k => OHK_KR[k]).join(", ")}이 없어서 ${_josaIga(_missTraits.join(", "))} 부족해.`
    : " 오행이 고르게 갖춰진 편이라, 상황에 맞게 여러 기운을 꺼내 쓸 수 있어."
  const ohaengFull = `이 사주에서 가장 강한 기운은 ${OHK_KR[dominant] || dominant}${_hasJong(OHK_KR[dominant] || dominant) ? "이야" : "야"}. ${_domTrait}${_missPart}`
  // 임의의 명식(경계 mid 포함)에 대해 오행 분석 풀버전을 동일 포맷으로 생성 — 첫째/둘째 해석 길이 일관성
  const mkOhaengFull = (ohMap, dom) => {
    if (!ohMap) return ohaengFull
    const missing = ["목", "화", "토", "금", "수"].filter(k => !ohMap[k])
    const domTrait = OHK_STRONG_TRAIT[dom] || OHK_DESC[dom] || ""
    const missTraits = missing.map(k => OHK_MISSING_TRAIT[k]).filter(Boolean)
    const missPart = missing.length
      ? ` 대신 ${missing.map(k => OHK_KR[k]).join(", ")}이 없어서 ${_josaIga(missTraits.join(", "))} 부족해.`
      : " 오행이 고르게 갖춰진 편이라, 상황에 맞게 여러 기운을 꺼내 쓸 수 있어."
    return `이 사주에서 가장 강한 기운은 ${OHK_KR[dom] || dom}${_hasJong(OHK_KR[dom] || dom) ? "이야" : "야"}. ${domTrait}${missPart}`
  }

  // 월별 세운 (X-2)
  const monthForecast = d.summary?.monthForecast || []

  // 건강운 (VIII)
  const healthWeakOh = missingOh.length ? missingOh : [ohEntries[ohEntries.length - 1]?.[0]].filter(Boolean)
  const healthOrgan = healthWeakOh.map(k => OHK_ORGAN[k]).filter(Boolean).join(", ")
  const healthSign = healthWeakOh.map(k => OHK_ORGAN_SIGN[k]).filter(Boolean)[0] || ""
  const healthYearScore = thisYear?.areas?.건강 || 0
  const healthWeakText = healthOrgan
    ? `${healthWeakOh.map(k => OHK_KR[k]).join(", ")}이 ${healthWeakOh.length > 1 ? "아예 없어" : "부족해"}. ${healthWeakOh.map(k=>OHK_ORGAN[k]).join(", ")}과 연결되는 자리라 이 부분이 구조적으로 약해. ${healthSign}. 이 신호가 오면 바로 쉬어야 큰 탈이 안 나.`
    : "오행이 고르게 갖춰져 있어. 특별히 취약한 장기 없이 안정적인 구조야."
  const healthYearText = `${thisYear.year || new Date().getFullYear()}년 건강 ${healthYearScore}점이야. ${gisinA ? `${gisinD} 기운이 강해지는 시기엔 ${OHK_ORGAN[gisinA?.split("·")[0]] || "몸"}에 부담이 갈 수 있어.` : ""} 잘 때 잘 자는 게 제일 중요해. 수면이 무너지면 다 무너지는 구조야.`
  const healthExercise = OHK_EXERCISE[yongsinA] || OHK_EXERCISE[yongsinA?.split("·")[0]] || "규칙적인 유산소와 스트레칭"
  const healthExerciseText = `달이 ${moonSign || "감정의 별자리"}에 있는 만큼, 규칙적인 생활 리듬이 건강의 핵심이야. ${healthExercise}${_hasJong(healthExercise) ? "이" : "가"} 맞아. ${OHK_EXERCISE_CLOSE[dominant] || OHK_EXERCISE_CLOSE["토"]}`
  const healthSeasonText = healthWeakOh.map(k => OHK_SEASON_WARN[k]).filter(Boolean).join("\n") || "특별히 취약한 계절 없이 사계절 무난하게 지나가는 구조야."
  const healthFoodText = `${OHK_FOOD[yongsinA] || OHK_FOOD[yongsinA?.split("·")[0]] || "제철 음식"} 위주로, 따뜻하게 먹는 게 이 사주엔 맞아. ${OHK_FOOD_CLOSE[yongsinA?.split("·")[0]] || OHK_FOOD_CLOSE[dominant] || OHK_FOOD_CLOSE["토"]}`
  const healthMentalText = pick5({
    관성: "책임과 압박을 스스로 짊어지다 긴장이 몸으로 오는 구조야. 어깨나 목 결림, 불면으로 나오기 쉬워. 다 짊어지려는 마음을 내려놓는 게 정신 건강 관리야. 완벽하게 해내지 않아도 괜찮다는 걸 스스로에게 자주 말해줘야, 몸도 마음도 숨 쉴 틈이 생겨.",
    인성: "혼자 생각을 곱씹고 담아두는 게 많은 구조야. 표현하지 않으면 결국 몸으로 나오니, 글쓰기나 가까운 사람한테 털어놓기, 혼자만의 회복 시간이 약이야. 담아두는 습관이 편해 보여도 오래가면 소진되니, 정기적으로 마음을 비우는 루틴을 만들어둬.",
    식상: "에너지를 계속 밖으로 쏟다 방전되는 구조야. 신나게 달리다 갑자기 무기력이 오기 쉬워. 의식적으로 멈추고 충전하는 리듬을 만드는 게 관리법이야. 쉬는 걸 게으름이라 여기지 말고, 다음 도약을 위한 준비 시간으로 받아들이는 게 마음을 지키는 열쇠야.",
    비겁: "쉬지 않고 움직이려는 기질이라 몸을 혹사하기 쉬워. 멈추는 걸 못 견디는 게 함정이니, 강제로라도 쉬는 시간을 넣는 게 정신 건강의 열쇠야. 몸이 보내는 작은 신호를 무시하지 말고, 지치기 전에 먼저 속도를 늦추는 연습이 필요해.",
    재성: "여러 일을 동시에 붙들다 과부하가 오는 구조야. 다 챙기려다 신경이 곤두서기 쉬우니, 우선순위를 정해 덜어내는 게 마음을 지키는 법이야. 모든 걸 완벽하게 해내려는 마음을 조금 풀어놓아야, 진짜 중요한 것에 힘을 쓸 여유가 생겨.",
  })

  // 가족운 + 전생업보 (IX)
  const yeonSibsong = d.pillars?.[0]?.gan?.sibsong || ""
  const wolSibsong = d.pillars?.[1]?.gan?.sibsong || ""
  const parentText = SIBSONG_PARENT[yeonSibsong] || "부모와의 관계는 태어난 환경에 따라 다양한 모양을 가져. 지금의 나를 만든 뿌리 중 하나야."
  const siblingText = SIBSONG_SIBLING[wolSibsong] || SIBSONG_SIBLING[yeonSibsong] || "형제자매와는 각자의 속도로 살아가는 관계야."
  const familyKarmaText = `${dominant ? OHK_KR[dominant] : ""} 기운이 강한 집안에서 태어났어. ${(OHK_STRONG_TRAIT[dominant] || "").split(".")[0]}. 이런 기질이 대대로 이어져 내려온 흐름이라, 부모나 형제한테서 나와 닮은 반응 패턴을 발견할 때가 많을 거야.`
  // 가족운 3페이지 확장용
  const childhoodText = (() => {
    const yj = d.pillars?.[0]?.ji?.sibsong || ""
    let base
    if (["편인","정인"].includes(yj)) base = "유년기에 보살핌과 관심을 넉넉히 받고 자란 편이야."
    else if (["편관","정관"].includes(yj)) base = "유년기에 규율과 기대 속에서 자란 편이야."
    else if (["편재","정재"].includes(yj)) base = "유년기에 현실적이고 활기찬 가정에서 자란 편이야."
    else if (["식신","상관"].includes(yj)) base = "유년기에 자유롭고 표현이 허용되는 분위기에서 자랐어."
    else base = "유년기의 가정 분위기가 지금의 정서적 뿌리를 만들었어."
    // 아버지(편재) — 존재감·거리, 0개/1개/2개 이상 3단계
    const pj = d.sibsongAnalysis?.counts?.["편재"] || 0
    const father = pj >= 2
      ? " 아버지의 존재감이 유독 뚜렷했을 사주야. 그 무게가 집안 분위기를 좌우했을 수 있어."
      : pj === 1
      ? " 아버지는 밖에서 부지런히 생활을 책임진 분이었을 가능성이 커."
      : " 아버지의 존재감은 다소 옅어서, 그 빈자리를 스스로 채우며 자랐을 수 있어."
    // 어머니(인성) — 존재감·거리, 0개/1개/2개 이상 3단계
    const mj = (d.sibsongAnalysis?.counts?.["정인"] || 0) + (d.sibsongAnalysis?.counts?.["편인"] || 0)
    const mother = mj >= 2
      ? " 어머니의 영향이 특히 강했던 사주야. 그 관심이 간섭처럼 느껴지는 순간도 잦았을 수 있어."
      : mj === 1
      ? " 어머니는 곁에서 감싸주는 편이었지만, 때로 간섭처럼 느껴졌을 수도 있어."
      : " 어머니의 손길은 옅은 편이라 정서적으로 일찍 자립했어."
    return base + father + mother
  })()
  const _JI_OH_LOOK = { 자:"수", 축:"토", 인:"목", 묘:"목", 진:"토", 사:"화", 오:"화", 미:"토", 신:"금", 유:"금", 술:"토", 해:"수" }
  const _SPOUSE_LOOK = {
    목: "외모로는 키가 크고 선이 곧은 편이 많아. 젊고 반듯한 인상을 주는 사람이야.",
    화: "외모로는 화사하고 눈에 띄는 인상이 많아. 함께 있으면 분위기가 밝아지는 사람이야.",
    토: "외모로는 둥글고 편안한 인상이 많아. 처음 봐도 사람을 마음 놓이게 하는 사람이야.",
    금: "외모로는 피부가 희고 깔끔한 인상이 많아. 차분하면서도 야무진 느낌을 주는 사람이야.",
    수: "외모로는 부드럽고 촉촉한 인상이 많아. 은근한 매력이 있어 오래 봐도 질리지 않는 사람이야.",
  }
  const _spouseEastLabel = (() => {
    const ilji = d.pillars?.[2]?.ji?.sibsong || ""
    if (["편재","정재"].includes(ilji)) return { key: "재성", desc: "현실적이고 생활력 있는" }
    if (["편관","정관"].includes(ilji)) return { key: "관성", desc: "듬직하고 책임감 있는" }
    if (["편인","정인"].includes(ilji)) return { key: "인성", desc: "따뜻하고 나를 챙겨주는" }
    if (["식신","상관"].includes(ilji)) return { key: "식상", desc: "표현이 풍부하고 즐거운" }
    return { key: "비겁", desc: "친구처럼 편안한" }
  })()
  const spousePalaceText = (() => {
    const ilji = d.pillars?.[2]?.ji?.sibsong || ""
    const iljiKo = d.pillars?.[2]?.ji?.ko || ""
    const look = _SPOUSE_LOOK[_JI_OH_LOOK[iljiKo]] || ""
    let core
    if (["편재","정재"].includes(ilji)) core = "배우자 자리에 재성이 앉아 있어. 현실적이고 생활력 있는 짝을 만날 가능성이 커. 알뜰하게 살림을 꾸려 결혼 후 경제적으로 안정되는 흐름이야."
    else if (["편관","정관"].includes(ilji)) core = "배우자 자리에 관성이 앉아 있어. 듬직하고 책임감 있는 짝을 만날 가능성이 커. 원칙이 분명해 삶의 기둥이 되어주는 상대야."
    else if (["편인","정인"].includes(ilji)) core = "배우자 자리에 인성이 앉아 있어. 따뜻하고 나를 챙겨주는 짝을 만날 가능성이 커. 힘들 때 마음의 안식처가 되어주는 상대야."
    else if (["식신","상관"].includes(ilji)) core = "배우자 자리에 식상이 앉아 있어. 표현이 풍부하고 함께 있으면 즐거운 짝을 만날 가능성이 커. 재치 있고 감각적인 상대야."
    else core = "배우자 자리에 비겁이 앉아 있어. 나와 비슷한 기질의 짝, 친구처럼 편안한 상대를 만날 가능성이 커. 대등하게 손잡고 가는 동반자형이야."
    return look ? core + " " + look : core
  })()
  const familyLineageText = `이 흐름에는 못다 푼 숙제도 함께 넘어와. 윗대에서 못다 이룬 몫이 나한테 온 셈이라, 그걸 알아차리고 끊어내는 게 이번 생에서 내가 맡은 몫이야. 부모나 조부모 세대에서 반복됐던 갈등 패턴이 있다면, 그게 나한테서 되풀이되는지부터 살펴봐. 같은 패턴을 반복하지 않는 것, 그게 가문의 흐름을 바꾸는 시작이야.`
  const missionText = missingOh.length
    ? `${missingOh.map(k => OHK_KR[k]).join(", ")} 기운이 비어있는 구조야. 전생에서 ${OHK_KR[dominant]} 기운은 충분히 쌓았다면, 이번 생의 과제는 부족한 그 기운을 채우는 거야. ${_missTraits.length ? _josaEul(_missTraits.join(", ")) + " 이번 생에서 배우고 익히라고 이렇게 태어난 거야." : "그 기운을 이번 생에서 배우고 익히라고 이렇게 태어난 거야."}`
    : "오행이 고르게 갖춰진 채로 태어났어. 전생에 어느 한쪽으로 치우쳤던 걸 이미 다 풀어냈다는 뜻이야. 이번 생의 과제는 이 균형을 잘 지키면서 그릇을 더 키우는 거야."
  // 부모님과 갈등 안 만드는 법, 독립 타이밍, 배우자와 안 부딪히는 법 — 실전 액션 3종 (리뷰 반영: 철학적 서술만 있고 액션이 없다는 지적)
  const parentConflictText = pick5({
    관성: "부모님과는 원칙과 규칙을 두고 부딪히기 쉬워. 맞다 틀리다로 다투기보다 '이렇게 해보면 어떨까요' 식으로 제안하는 화법이 먹혀. 지시받는 느낌만 줄여도 갈등의 반은 사라져.",
    식상: "부모님과는 표현 방식 차이로 오해가 생기기 쉬워. 편하게 던진 말이 서운하게 들릴 수 있으니, 중요한 얘기는 조금 더 정중하게 해. 농담처럼 넘긴 말도 부모님껜 진심으로 남을 수 있어.",
    인성: "부모님 의견을 거스르기 어려워하는 편이라, 속으로 쌓아뒀다 한번에 터뜨리기 쉬워. 서운한 건 그때그때 짧게라도 말해둬. 참는 게 효도라는 생각부터 내려놓아야 관계가 편해져.",
    재성: "부모님과는 돈 문제로 갈등이 생기기 쉬워. 금전 얘기는 애매하게 넘기지 말고, 처음부터 조건을 명확히 정해두는 게 갈등을 막아. 가족 간이라 더 확실히 문서로 남겨두는 게 안전해.",
    비겁: "부모님과는 주도권 다툼으로 부딪히기 쉬워. 이기려 하지 말고 한발 물러서는 쪽이 결국 관계를 지켜. 옳고 그름을 따지기보다 그냥 넘어가는 것도 관계를 위한 선택이야.",
  })
  const independenceTimingText = nextDaeun
    ? "독립이나 거리두기는 대운이 바뀌는 시점 전후가 적기야. 그 전까지는 감정적으로 부딪히기보다 물리적 거리를 조금씩 넓혀가는 연습을 해둬."
    : "독립은 마음의 준비가 됐을 때가 적기야. 갑자기 멀어지기보다 단계적으로 거리를 넓히는 쪽이 관계도 안 상하고 나도 덜 불안해."
  const spouseConflictAvoidText = ({
    재성: "배우자와는 돈 문제로 부딪히기 쉬워. 가계부를 따로 안 쓰면 오해가 쌓이니, 처음부터 공동, 개인 지출 기준을 정해둬. 애매하게 넘긴 지출 하나가 나중엔 큰 싸움으로 번져.",
    관성: "배우자와는 원칙과 책임 분담으로 부딪히기 쉬워. 누가 뭘 맡을지를 말로 정확히 정해두면 갈등이 확 줄어. 암묵적으로 떠넘기지 말고 역할을 소리 내어 정해둬야 해.",
    인성: "배우자와는 표현 부족으로 오해가 쌓이기 쉬워. 마음은 있어도 티가 안 나는 타입이라, 말로 자주 표현해야 관계가 편해져. 알아서 알아줄 거란 기대는 내려놓는 게 나아.",
    식상: "배우자와는 감정 기복으로 부딪히기 쉬워. 기분이 안 좋을 때 바로 말하기보다, 진정된 뒤 얘기하는 습관을 들여. 즉흥적으로 던진 말이 배우자한텐 오래 남을 수 있어.",
    비겁: "배우자와는 주도권 다툼으로 부딪히기 쉬워. 대등한 관계일수록 오히려 내가 맞다는 고집을 조금 내려놔야 해. 이기고 지는 문제가 아니라는 걸 자주 되새겨야 해.",
  })[_spouseEastLabel.key] || "배우자와는 사소한 습관 차이로 부딪히기 쉬워. 큰 갈등이 되기 전에 불편한 건 그때그때 짧게 말해두는 게 안전해."

  // 애정운 솔로 전용 (VII)
  const isSolo = d.isSolo !== false
  const hasYeokma = (d.sinsal || []).some(s => (s.name || "").includes("역마"))
  const soloTimingText = curDaeun
    ? `${nextDaeun ? `${nextDaeun.label?.replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim()} 대운` : "다가오는 대운"}에서 제대로 된 인연이 들어올 가능성이 높아. 세운으로 보면 ${bestLoveYear ? `${bestLoveYear.year}년` : "향후 몇 년"}이 애정운 피크야. 억지로 만들려고 하면 안 맞는 사람이 와. 지금은 나를 쌓아가는 시간이야.`
    : "인연이 들어오는 시기가 따로 있어. 지금은 나를 쌓아가는 시간이야."
  const hasDohwa = (d.sinsal || []).some(s => (s.name || "").includes("도화"))
  const hasHwagae = (d.sinsal || []).some(s => (s.name || "").includes("화개"))
  const soloPlaceText = hasYeokma
    ? "역마살이 있어서 이동하고 변화하는 환경에서 인연을 만나. 여행, 이직, 이사 같이 뭔가 바뀌는 시점이야. 앱이나 소개팅보다 일 관련 자리, 스터디, 전문직 모임에서 자연스럽게 만나는 인연이 오래가."
    : hasDohwa
    ? "도화살이 있어서 사람이 몰리는 자리에서 유독 인연이 잘 붙어. 모임, 회식, 사람 많은 행사처럼 대인관계가 활발한 자리일수록 눈에 띄는 타입이야. 다만 스쳐가는 호감과 진짜 인연을 구분하는 게 관건이야."
    : hasHwagae
    ? "화개살이 있어서 시끌벅적한 자리보다 혼자만의 공간, 취향이 통하는 소수의 모임에서 인연이 시작될 확률이 커. 전시, 공연, 독서모임처럼 취향 기반의 자리가 잘 맞아. 억지로 나서기보다 좋아하는 걸 하다 보면 자연스럽게 인연이 스며들어."
    : "일상적인 관계 속에서 인연이 자라나는 구조야. 급하게 새로운 사람을 만나려 하기보다, 이미 아는 사람들 사이에서 뜻밖의 인연이 시작될 가능성이 커."
  const soloTypeText = (idealType && idealType.length < 70 ? idealType + " 그런 사람 앞에서 자연스러워지는 게 진짜 인연의 신호야." : idealType) || (yongsinA ? `${yongsinD} 기운이 강한 사람이 인연이야. 따뜻하고 믿음직한 분위기, 화려하지 않아도 존재감이 있는 사람이 진짜 인연이야.` : "말보다 행동으로 보여주는 사람이 인연이야.")
  // 연애운1/2/4 페이지 보강용 3종 (리뷰 반영: 다른 카테고리 첫 페이지 대비 블록이 얇다는 지적)
  const someSignalText = isSingang
    ? "관심이 생기면 먼저 확 다가가기보다, 그 사람 앞에서 자꾸 여유 있는 척하게 돼. 편하게 대하다가도 유독 그 사람 얘기만 나오면 말이 많아지는 게 이 사주의 썸 신호야."
    : "관심이 생기면 겉으로 표는 잘 안 나는 편인데, 그 사람 이야기가 나오면 리액션이 커지고 자꾸 눈으로 좇게 돼. 티 안 내려다 오히려 더 티가 나는 타입이야."
  const FIRST_DATE_IMPRESSION = {
    목: "처음 만나면 에너지 넘치고 적극적인 인상을 줘. 대화를 이끌어가는 힘이 있어서 상대가 편하게 마음을 열어.",
    화: "처음 만나면 밝고 화사한 인상을 줘. 리액션이 좋아서 대화가 잘 통한다는 느낌을 상대가 바로 받게 돼.",
    토: "처음 만나면 편안하고 안정적인 인상을 줘. 서두르지 않는 태도에서 신뢰가 먼저 쌓여.",
    금: "처음 만나면 깔끔하고 반듯한 인상을 줘. 예의 바른 태도가 오히려 진지한 사람이라는 신뢰를 줘.",
    수: "처음 만나면 잔잔하고 신비로운 인상을 줘. 말수는 적어도 눈빛에 담긴 깊이가 상대를 궁금하게 만들어.",
  }
  const firstDateImpressionText = FIRST_DATE_IMPRESSION[dominant] || FIRST_DATE_IMPRESSION["토"]
  const pushPullText = isSingang
    ? "밀당에서는 미는 쪽이야. 관심 있어도 먼저 확 다가가기보다 여지를 주며 상대가 다가오게 만드는 편이 이 사주엔 잘 맞아."
    : "밀당에서는 당기는 쪽이야. 상대가 리드하게 두면서 자연스럽게 마음을 열어가는 편이 이 사주엔 맞아."
  const soloApproachText = ({
    나무: "서두르지 말고 천천히 신뢰를 쌓아. 급하게 밀어붙이면 바로 닫혀. 곁에서 함께 자라듯 꾸준히 있어주는 사람한테 마음이 열려.",
    불: "밝고 솔직하게 다가가는 게 통해. 단, 너무 뜨겁게 몰아붙이면 부담스러워하니 상대 속도를 봐가며 열기를 조절하는 게 관건이야.",
    흙: "말보다 한결같은 행동으로 곁을 지켜. 화려한 이벤트보다 '변하지 않는 사람'이라는 믿음을 줄 때 비로소 마음이 열려.",
    금: "선을 지키며 예의 있게 다가가. 가볍게 굴면 신뢰를 안 주는 상대라, 진중하고 분명한 태도가 오히려 매력으로 먹혀.",
    물: "천천히 스며들 듯 다가가. 몰아붙이면 도망가니, 편안한 대화와 여백을 주면서 자연스럽게 거리를 좁히는 게 유일하게 통해. 재촉하지 마.",
  })[_domOhKr] || "처음엔 절대 티 내지 마. 천천히 신뢰를 쌓아야 해. 빠르게 밀어붙이면 바로 닫혀. 말보다 행동으로, 꾸준하게, 부담 없이 곁에 있어주는 방식이 유일하게 먹혀."

  // 업무운 2 - 수성 교차, 회사 궁합
  const mercurySign = a.mercury && a.mercury !== "분석 중" ? zodiacFix(a.mercury) : null
  const mercuryText = mercurySign ? mug(a.mercuryDesc || "") : "수성 위치를 읽는 중이야."
  const companyFitText = yongsinA
    ? `회사 업종이 ${yongsinD} 방향인지 먼저 봐. ${(YONGSIN_DETAIL[yongsinA] || YONGSIN_DETAIL[yongsinA?.split("·")[0]] || {})["업종"] || yongsinJobMap[yongsinA] || ""} 계열 회사가 맞아. ${gisinA ? `${gisinD} 방향인 ${(GISIN_DETAIL[gisinA]||{})["업종"] || "회사"}는 아무리 조건이 좋아도 에너지가 지속적으로 새.` : ""}`
    : ""

  // 관계운 2 - 소진 패턴, 그림자
  const drainPatternText = pick5({
    관성: "남의 기대에 부응하려 무리하게 떠안다 기가 빠져. '거절하면 실망시킨다'는 부담이 나를 갉으니, 못 하는 건 못 한다고 말하는 게 기를 지키는 법이야. 다 해주려는 마음을 조금 내려놓으면, 오히려 관계가 더 편해지는 걸 느끼게 돼.",
    인성: "주변의 감정을 쉽게 흡수하는 구조야. 힘든 사람 곁에 있으면 나도 같이 가라앉으니, 받는 것 없이 주기만 하는 관계는 일찍 정리해야 해. 남의 감정과 내 감정 사이에 선을 긋는 연습이 기를 지키는 가장 확실한 방법이야.",
    식상: "재밌으면 끝을 안 보고 쏟아붓다 소진돼. 신나서 달릴 때 스스로 브레이크를 못 거는 게 함정이니, 에너지 총량을 정해두고 쓰는 게 필요해. 흥이 오를 때일수록 잠깐 멈춰서 숨을 고르는 습관이 오래 가는 힘을 만들어줘.",
    비겁: "남의 부탁을 거절 못 하고 내 몫 아닌 것까지 짊어지다 지쳐. 다 떠안는 패턴을 알아채고 선을 긋는 게 먼저야. 내가 아니어도 되는 일까지 붙들고 있진 않은지, 한 번씩 점검해보는 게 기를 지키는 시작이야.",
    재성: "여러 사람과 여러 일을 다 관리하려다 진이 빠져. 손 안의 걸 다 붙들려는 마음을 놓고, 놓아도 되는 건 놓는 연습이 기를 지켜. 다 관리하지 않아도 일은 굴러간다는 걸 믿는 게 생각보다 큰 회복을 가져다줘.",
  })
  const shadowText = challenges.length
    ? `기신 구간에 들어서면 평소 약점이 유독 크게 도드라져. 스트레스가 쌓일수록 예민해지고 시야가 좁아지니, 이럴 때일수록 의식적으로 힘을 빼고 유연함을 연습하는 게 이 시기를 무사히 넘기는 법이야.`
    : "본인은 원칙을 지킨다고 생각하는데 타인 눈에는 고집스럽게 보이는 경우가 있어. 의식적으로 유연함을 연습해야 해."

  // ── 챕터 구성 ──
  // 사주 분석 챕터 (일반/경계 공통 빌더) — 오행 분석 먼저, 그다음 일주 분석
  const mkSajuChapter = (opts) => ({
    label: opts.label, accent: opts.accent,
    tag: opts.tag, tagColor: opts.tagColor, tagText: opts.tagText,
    title: opts.title,
    subtitle: "사주 명식, 오행 분석",
    extra: <MangseDonutRow pillars={opts.pillars} noTime={d.noTime} ohaeng={opts.ohaeng || ohaeng} dominant={opts.dominant || dominant} />,
    blocks: [
      { h: "오행 분석", text: opts.ohaengFull || ohaengFull, accent: opts.accent },
      { h: "일주 분석", text: opts.iljuDesc || "분석 중이야.", accent: opts.accent },
      { h: "타고난 기운", jsxContent: sinsalJSX, accent: opts.accent },
    ],
  })
  // 경계 mid 명식(pillarsB)의 오행 분포 계산
  const calcOhaengFromPillars = (pills) => {
    if (!pills) return null
    const GAN = { 갑:"목",을:"목",병:"화",정:"화",무:"토",기:"토",경:"금",신:"금",임:"수",계:"수" }
    const JI = { 자:"수",축:"토",인:"목",묘:"목",진:"토",사:"화",오:"화",미:"토",신:"금",유:"금",술:"토",해:"수" }
    const o = { 목:0,화:0,토:0,금:0,수:0 }
    pills.forEach(p => { if(GAN[p.gan.ko])o[GAN[p.gan.ko]]++; if(JI[p.ji.ko])o[JI[p.ji.ko]]++ })
    return o
  }
  const _midOhaeng = isBnd ? calcOhaengFromPillars(d.pillarsB) : null
  const _midDominant = _midOhaeng ? Object.entries(_midOhaeng).sort((a,b)=>b[1]-a[1])[0][0] : dominant
  const _midOhaengFull = _midOhaeng ? mkOhaengFull(_midOhaeng, _midDominant) : ohaengFull

  const bndChapters = isBnd ? [
    {
      label: "경계의 사주", accent: C.iris,
      tag: "경계 사주", tagColor: C.plum, tagText: C.lavender,
      title: "특별한 사주.",
      subtitle: "두 기운을 동시에 품고 태어났어.",
      blocks: [
        { h: "동시에 품은 두 기운", text: "태어난 시간이 자정 경계에 딱 걸렸어. 어떤 학파는 한쪽으로, 어떤 학파는 다른 쪽으로 읽어. 틀린 게 아니야. 두 기운을 한 몸에 품고 태어난 거야.", accent: C.iris },
        { h: "더 맞는 쪽", text: "둘 다 천천히 읽어봐. 어느 쪽이 더 내 얘기 같은지는 본인이 제일 잘 알아. 둘 다 맞기도 해. 그게 경계 사주만의 특징이야.", accent: C.iris },
      ],
    },
    mkSajuChapter({ label: `${bnd.stdIlju || ""} 첫 번째 해석`, accent: C.caramel, tag: bnd.stdIlju || "첫째", tagColor: C.mahogany, tagText: C.sand, title: "첫 번째 해석,\n나와 더 닮은 쪽.", pillars: d.pillars, iljuDesc: iljuDescStd }),
    mkSajuChapter({ label: `${bnd.midIlju || ""} 두 번째 해석`, accent: C.iris, tag: bnd.midIlju || "둘째", tagColor: C.abyss, tagText: C.lavender, title: "두 번째 해석,\n겉과 속의 차이.", pillars: d.pillarsB || d.pillars, iljuDesc: iljuDescMid, ohaeng: _midOhaeng, dominant: _midDominant, ohaengFull: _midOhaengFull }),
  ] : [
    mkSajuChapter({ label: "사주 분석", accent: C.caramel, tag: sajuTag, tagColor: C.mahogany, tagText: C.sand, title: `${sajuTag}.\n타고난 판이 이렇게 짜여 있어.`, pillars: d.pillars, iljuDesc: iljuDescStd }),
  ]

  // I. 사주 풀이 (신설 무료 첫 페이지 · 특별함/위로/해결방안 3문단, 헤더 없음, 실제 사주 데이터 기반 동적 생성)
  const _page1Special = isBnd
    ? `자시에 걸친 경계사주야. 하필 하루의 기운이 갈리는 그 한가운데서 태어났어. 흔한 사주 아니야.`
    : `${sajuTag} 사주야. 여덟 글자가 짜인 결이 뚜렷해서, 타고난 방향이 분명하게 보이는 구조야.`
  const _page1SpecialJae = _jaeStruct === "편재" ? " 편재가 강해서, 큰돈이 오가는 배포를 타고났어."
    : _jaeStruct === "정재" ? " 정재가 두드러져서, 꾸준히 쌓아가는 재물 감각을 타고났어."
    : _jaeStruct === "과다" ? " 재성이 넘쳐서, 기회는 많은데 관리가 관건인 구조야."
    : _jaeStruct === "없음" ? " 재성은 약한 대신, 실력과 자리로 승부하는 구조야."
    : ""
  const _obstacleByOh = {
    목: "근데 그거 알아? 뻗어나가는 나무 앞에 가로막힌 벽이 하나 있어. 속도가 안 나서 답답했던 시기가 있었을 거야.",
    화: "근데 그거 알아? 활활 타오르다가도 훅 꺼지는 순간이 있어. 열정만큼 결과가 안 따라와 허탈했던 시기가 있었을 거야.",
    토: "근데 그거 알아? 단단한 만큼 무거워서 못 움직이는 순간이 있어. 다지기만 하다 못 나선 시기가 있었을 거야.",
    금: "근데 그거 알아? 날이 선 만큼 자꾸 부딪히는 순간이 있어. 확신했는데 마찰만 생겼던 시기가 있었을 거야.",
    수: "근데 그거 알아? 물 앞에 산이 가로막은 형상이야. 앞이 막혀서 답답했던 시기가 있었을 거야.",
  }
  const page1Special = `${_page1Special}${_page1SpecialJae} ${_obstacleByOh[dominant] || _obstacleByOh["토"]}`
  const page1Comfort = isBnd
    ? `이런 순간이 있다고 나쁜 게 아니야. 잠시 멈춰서 방향을 다시 보라는 신호야. 경계사주는 원래 스스로도 헷갈리는 순간이 많아. 우유부단한 게 아니라 두 기운을 동시에 쥐고 있어서 그런 거야.`
    : missingOh.length
    ? `이런 순간이 있다고 나쁜 게 아니야. 잠시 멈춰서 방향을 다시 보라는 신호야. ${missingOh.map(k => OHK_KR[k]).join(", ")} 기운이 없어서 가끔 안 채워지는 느낌이 들었을 거야. 부족해서가 아니라 타고난 구조가 원래 그런 거야.`
    : `이런 순간이 있다고 나쁜 게 아니야. 잠시 멈춰서 방향을 다시 보라는 신호야. 오행이 고르게 갖춰진 구조라 유연하게 대응하는 편이야. 뚜렷한 색깔이 없어 보인다고 답답했을 수도 있지만, 그건 약점이 아니라 균형이야.`
  const page1Action = `${_actionByOh[dominant] || _actionByOh["토"]} 지금 대운 흐름이 바뀌는 시점부터 이 기운이 제대로 풀려.`
  const page1Chapter = {
    label: "사주 풀이", accent: C.caramel,
    tag: "무료", tagColor: C.walnut, tagText: C.sand,
    title: "타고난 배경.",
    subtitle: "사주가 하는 말",
    noDvd: true,
    blocks: [
      { text: page1Special, accent: C.caramel },
      { text: page1Comfort, accent: C.caramel },
      { text: page1Action, accent: C.caramel },
    ],
  }

  // II. 성격 요약 (무료 두 번째 페이지 · 원래 4헤더 구조)
  const personaChapter = {
    label: "성격 요약", accent: C.caramel,
    tag: "무료", tagColor: C.walnut, tagText: C.sand,
    title: "너라는 사람.",
    subtitle: "타고난 기질",
    blocks: [
      { h: "타고난 기질", text: personaHook || "분석 중이야.", accent: C.caramel },
      strengths.length ? { h: "숨은 강점", text: strengths.join(" "), accent: C.caramel } : null,
      challenges.length ? { h: "발목 잡는 것", text: challenges.join(" "), accent: C.caramel } : null,
      { h: "올해 흐름", text: personaYear || "올해 흐름을 읽는 중이야.", accent: C.caramel },
    ].filter(Boolean),
  }

  const freeChapters = [
    page1Chapter,
    personaChapter,
    ...bndChapters,
  ]

  // 인연 시기 관성 대운/세운 기반
  const loveYears = (() => {
    if (!daeun.length) return ""
    const cur = daeun.find(dv => dv.cur)
    const curIdx = daeun.indexOf(cur)
    const nearby = daeun.slice(Math.max(0, curIdx-1), curIdx+3)
    // 관성(화·금 등) 대운 찾기 단순화
    const hot = nearby.filter(dv => dv.ohaeng && ["화","금","목","수"].includes(dv.ohaeng))
    if (hot.length) return `${hot.map(dv => dv.period || dv.label).join(", ")} 대운 구간에 인연이 강하게 들어와.`
    return "지금 대운 흐름에서 인연이 읽혀. 세운이 맞물리는 해를 봐야 해."
  })()

  // 용신 업종



  const yongsinJob = yongsinJobMap[yongsinA] || yongsinJobMap[yongsinA?.split("·")[0]] || ""

  // 재물 상세
  const reomulType = _jaeStruct === "편재"
    ? `큰돈이 오가는 구조야. 벌 때 시원하게 벌고 나갈 때도 크게 나가서 통장이 롤러코스터지. 한 방을 보는 감각은 좋은데, 들어올 때 일부를 딱 묶어두는 습관이 없으면 손에 안 남아. 흐름을 타되 안전판을 만드는 게 이 사주가 돈을 쥐는 법이야.`
    : _jaeStruct === "정재"
    ? `돈이 또박또박 들어오는 구조야. 한 방보다 꾸준히 쌓을 때 빛나는 사주라 월급이나 고정수입 같은 안정적인 흐름이 잘 맞아. 조급하게 큰 걸 노리다 리듬을 잃으니, 복리처럼 천천히 불리는 게 정답이야.`
    : _jaeStruct === "과다"
    ? `돈 기회는 넘치는데 그만큼 새는 구조야. 벌 데도 많지만 쓸 데도 나눌 데도 많아서 늘 바쁜데 안 남아. 다 붙잡으려 하면 전부 흩어지니, 핵심 파이프 하나만 남기고 정리하는 게 돈을 쥐는 법이야.`
    : _jaeStruct === "없음"
    ? `재성이 약해서 돈 자체를 좇으면 오히려 안 풀리는 구조야. 돈보다 실력, 명예, 자리가 먼저 서면 돈이 뒤따라오는 흐름이라, 눈앞의 액수보다 '내 값어치'를 올리는 데 집중할 때 크게 벌려.`
    : isSingang
    ? `에너지가 집중된 구조야. 방향만 잡히면 돈을 오래 쥐고 있어. 근데 욕심이 화근이라, 더 크게 더 빨리 가지려다 한 번에 날리는 패턴이 함정이야. 크게 버는 것보다 잃지 않는 구조를 먼저 만들어.`
    : `에너지가 분산된 구조야. 열심히 하는데 왜 안 쌓이나 싶었지? 여러 가지를 동시에 하면 전부 흩어지는 구조라, 하나를 깊게 파는 게 돈을 쌓는 유일한 방법이야. 선택과 집중, 이게 답이야.`
  const _yd = YONGSIN_DETAIL[yongsinA] || YONGSIN_DETAIL[yongsinA?.split("·")[0]] || {}
  const reomulSurviveIntro = yongsinA
    ? `${yongsinD} 기운이 이 사주를 살려. 이 방향으로 가야 돈이 따라오고, 에너지가 살아나. 거슬러 가면 아무리 열심히 해도 제자리야.`
    : ""
  const reomulSurviveItems = yongsinA ? {
    "맞는 업종": _yd["업종"] || yongsinJobMap[yongsinA] || yongsinD + " 방향의 분야",
    "일상": _yd["행동"] || "용신 방향의 활동을 늘리는 것",
    "취미": _yd["취미"] || "이 기운을 살리는 활동",
    "주의": _yd["피해야할것"] || "이 기운을 거스르는 방향으로 가는 것",
  } : null
  const reomulSurviveJSX = reomulSurviveItems ? React.createElement("div", null,
    ...Object.entries(reomulSurviveItems).map(([k, v], i, arr) =>
      React.createElement("div", { key: k, style: { marginBottom: i < arr.length - 1 ? 10 : 0, textAlign: "justify" } },
        React.createElement("span", { style: { color: C.caramel, fontFamily: FONT, fontWeight: 600, fontSize: 15 } }, k),
        React.createElement("span", { style: { color: C.parchment, fontFamily: FONT, fontSize: 14, lineHeight: 1.8 } }, ` ${v}`)
      )
    )
  ) : null
  const reomulSurvive = yongsinA
    ? `${yongsinD} 기운이 이 사주를 살려. 이 방향으로 가야 돈이 따라오고, 에너지가 살아나. 거슬러 가면 아무리 열심히 해도 제자리야. 지금 하는 일이 이 방향인지 한번 봐. 맞으면 계속 가고, 아니면 방향을 틀어야 해.\n맞는 업종은 ${(_yd["업종"] || yongsinJobMap[yongsinA] || yongsinD + " 방향의 분야")} 쪽이야. 이런 분야에서 열심히 한 만큼 결과가 나와. 일상에서는 ${_yd["행동"] || "용신 방향의 활동을 늘리면 좋아."} 취미도 ${_yd["취미"] || "이 기운을 살리는 활동"}으로 채워. ${yongsinD} 기운이 필요하니까, 작은 것부터 이 기운을 늘려가는 게 재물을 쌓는 가장 빠른 길이야. 반대로 조심할 건 ${_yd["피해야할것"] || "이 기운을 거스르는 방향으로 가는 거야."}`
    : ""
  const reomulAvoid = reomulGisin
  const reomulInvest = _jaeStruct === "편재"
    ? "크게 베팅하고 크게 회수하는 스타일이 맞아. 감각은 좋은데 한 방에 몰빵하면 위험하니, 번 것의 일부는 반드시 안전자산에 묶어둬. 큰 기회가 와도 전 재산을 걸진 말고, 잃어도 되는 돈의 크기를 미리 정해두는 게 이 사주가 오래 버는 법이야."
    : _jaeStruct === "정재"
    ? "차곡차곡 적립하고 복리로 굴리는 안정형이 맞아. 한 번에 크게 노리다 리듬을 잃으니, 지루해도 꾸준한 게 정답이야. 남들이 단타로 크게 버는 걸 봐도 흔들리지 말고, 시간을 내 편으로 만드는 장기 투자가 결국 이 사주를 부자로 만들어."
    : _jaeStruct === "과다"
    ? "여러 곳에 분산하는 감각은 좋은데 관리가 관건이야. 벌인 걸 다 못 쫓으면 전부 새니, 핵심만 남기고 정리하는 게 이득이야. 종목이든 계좌든 손이 닿는 범위로 줄이고, 정기적으로 점검하는 습관을 들여야 새는 돈을 막을 수 있어."
    : _jaeStruct === "없음"
    ? "투기보다 저축과 현금흐름이 먼저인 구조야. 무리한 투자는 이 사주엔 독이니, 지키는 재테크부터 다지는 게 맞아. 큰돈을 굴리기보다 비상금과 안정된 수입원을 먼저 만들고, 투자는 공부가 충분히 쌓인 뒤에 소액으로 시작해."
    : isSingang
    ? "적극적으로 투자하고 확장하는 스타일이 맞아. 근데 리스크 관리를 못 하면 한 방에 날려. 욕심의 크기를 조절하는 게 관건이야. 수익이 날 때일수록 목표가를 정해 일부는 챙겨두고, 빚내서 하는 투자는 이 사주에선 특히 조심해야 해."
    : "안정적으로 쌓아가는 스타일이 맞아. 한 번에 크게 가려다 다 잃는 경우가 많아. 꾸준히 쌓는 게 이 구조의 정답이야. 조급함에 무리한 승부를 걸기보다, 매달 정해진 만큼 착실히 넣는 자동 적립이 이 사주엔 가장 잘 맞아."

  // 자산군별 투자 풀이 (오행 기반)
  const ASSET_CLASS_BY_OH = {
    목: { 현금: "현금을 마냥 쌓아두면 답답해하는 성향이야. 유동성은 최소한만 쥐고 나머지는 굴려야 몸이 편해. 여기서 자주 놓치는 게, 성장이 안 보이는데도 습관적으로 예금만 늘리다 기회비용을 놓치는 거야.", 부동산: "장기로 눌러앉는 부동산보다 성장성 있는 신흥 지역이 더 잘 맞아. 다만 이런 실수가 잦아. 이미 다 오른 안정된 입지에 뒤늦게 들어가 상승 여력을 못 누리는 거야.", 금: "안전자산으로 쟁여두기보다는 소량만 보험처럼 들고 가는 편이 나아. 그런데 여기서 흔히, 지루하다고 아예 안 담았다가 하락장에서 완충 장치 없이 흔들리는 거야.", 채권: "고정된 이자만 받는 채권은 답답하게 느껴질 수 있어. 포트폴리오의 일부로만 담아둬. 이 지점에서 자주 실수해. 답답하다고 아예 안 담아서 변동성을 못 줄이는 거야.", 주식: "성장주, 신사업 쪽에 감이 좋아. 다만 너무 빨리 갈아타는 습관은 주의해. 여기서 자주 걸려 넘어지는 게, 오르는 흐름에서 조급하게 이익 실현하고 진짜 상승은 놓치는 거야.", 코인: "새로운 걸 먼저 잡는 감각이 있어서 신생 자산에 끌리기 쉬운데, 손절 타이밍을 정해두고 들어가야 해. 특히 조심할 건, 신념만 믿고 손절선 없이 물타기를 반복하는 거야." },
    화: { 현금: "현금은 손에 있으면 금방 쓰고 싶어지는 타입이야. 자동이체로 강제 저축이 필요해. 여기서 자주 놓치는 게, 이번 달만 쓰고 다음 달부터 모으겠다는 다짐을 매달 반복하는 거야.", 부동산: "실거주 겸 자기표현이 되는 곳(상권, 브랜드 아파트)에 끌리는 편이야. 다만 이런 실수가 잦아. 남들 시선을 의식해 감당 안 되는 대출을 끌어서 무리하게 들어가는 거야.", 금: "화려한 자산보다 안 보이는 안전자산이 어색하지만, 소량은 꼭 챙겨둬. 그런데 여기서 흔히, 재미없다는 이유로 끝까지 안 담아서 위기장에 방어선이 하나도 없는 거야.", 채권: "지루하게 느껴지지만 포트폴리오의 브레이크 역할로 꼭 필요해. 이 지점에서 자주 실수해. 화려한 종목만 좇다가 변동성을 낮춰줄 자산을 하나도 안 두는 거야.", 주식: "테마주, 이슈주에 민감하게 반응해. 열기 식기 전에 나오는 타이밍이 관건이야. 여기서 자주 걸려 넘어지는 게, 이미 다 퍼진 뉴스를 보고 뒤늦게 들어가 상투를 잡는 거야.", 코인: "변동성 큰 자산에 감정적으로 몰입하기 쉬워. 정해둔 금액 이상은 넣지 마. 특히 조심할 건, 오르는 걸 보고 흥분해서 원래 정한 금액을 넘겨 계속 추가 매수하는 거야." },
    토: { 현금: "현금 보유 자체를 안정감으로 느끼는 타입이야. 그게 나쁜 게 아니라 이 사주의 강점이야. 여기서 자주 놓치는 게, 안정감에 취해 너무 오래 현금만 쥐고 있다가 물가 상승분을 못 따라가는 거야.", 부동산: "가장 잘 맞는 자산군이야. 오래 쥐고 있을수록 결실이 커. 다만 이런 실수가 잦아. 잘 맞는다고 무리한 대출까지 끌어 한 곳에 자산을 몰빵하는 거야.", 금: "안전자산 선호도가 높아. 꾸준히 모아가는 방식이 잘 맞아. 그런데 여기서 흔히, 안전하다는 이유만으로 비중을 과하게 늘려 정작 수익 기회를 놓치는 거야.", 채권: "변동성보다 안정적인 수익을 좋아해서 채권 비중을 높게 가져가도 괜찮아. 이 지점에서 자주 실수해. 금리가 낮아지는 시기에도 관성적으로 계속 채권만 늘리는 거야.", 주식: "우량주, 배당주처럼 흔들림 적은 종목이 잘 맞아. 단타는 이 사주엔 안 맞아. 여기서 자주 걸려 넘어지는 게, 남들이 단타로 버는 걸 보고 성향에 안 맞는 방식을 무리하게 따라 하는 거야.", 코인: "변동성이 너무 커서 스트레스만 받는 자산군이야. 최소 비중으로만 접근해. 특히 조심할 건, 스트레스받으면서도 남들 다 하니까 감당 안 되는 비중을 넣는 거야." },
    금: { 현금: "필요할 때 딱 필요한 만큼만 쥐고 있는 걸 선호해. 불필요한 유동성은 바로 굴려. 여기서 자주 놓치는 게, 완벽한 타이밍을 재느라 현금을 너무 오래 굴리지 않고 묵혀두는 거야.", 부동산: "따지고 분석해서 들어가는 스타일이라 시세차익형 투자에 강해. 다만 이런 실수가 잦아. 분석에 너무 오래 매달리다 정작 좋은 매수 타이밍을 놓치는 거야.", 금: "원칙적으로 안전자산을 선호해서 금 비중을 자연스럽게 늘리는 편이야. 그런데 여기서 흔히, 원칙을 지킨다는 이유로 시장 상황이 바뀌어도 비중을 안 조정하는 거야.", 채권: "구조가 명확한 채권과 잘 맞아. 조건 좋은 걸 골라내는 눈이 있어. 이 지점에서 자주 실수해. 조건만 따지다 유동성이 필요한 순간에 못 빼는 상품에 묶이는 거야.", 주식: "가치주, 재무구조 탄탄한 종목을 선호해. 감으로 안 사고 분석해서 사. 여기서 자주 걸려 넘어지는 게, 분석 결과에 대한 확신이 지나쳐서 손절 시점을 놓치는 거야.", 코인: "근거 없는 자산은 본능적으로 거리를 둬. 들어가더라도 철저히 분석 후에만 움직여. 특히 조심할 건, 분석할 데이터가 부족한 신생 코인에 예외적으로 감정이 앞서는 거야." },
    수: { 현금: "유동성을 확보해두는 걸 편하게 느껴. 현금 비중이 높아도 불안해하지 않는 타입이야. 여기서 자주 놓치는 게, 편하다는 이유로 굴릴 수 있는 자금까지 계속 현금으로만 쥐고 있는 거야.", 부동산: "묶이는 자산에 답답함을 느낄 수 있어. 유동화 쉬운 소형 자산이 잘 맞아. 다만 이런 실수가 잦아. 답답함을 못 참고 장기적으로 유리한 자산을 너무 일찍 처분하는 거야.", 금: "촉이 좋아서 매수, 매도 타이밍을 직관적으로 잘 잡아. 그런데 여기서 흔히, 촉을 과신해서 근거 없이 몰빵하듯 큰 비중을 한 번에 넣는 거야.", 채권: "안정과 유동성 사이 균형을 잘 잡는 편이라 단기채가 잘 맞아. 이 지점에서 자주 실수해. 균형을 잡는다면서 이도 저도 아닌 애매한 비중으로 계속 분산만 하는 거야.", 주식: "흐름을 읽는 감각이 좋아. 다만 확신이 안 설 때 우유부단해질 수 있어. 여기서 자주 걸려 넘어지는 게, 판단이 서있는데도 망설이다 타이밍을 다 놓치고 뒤늦게 따라 들어가는 거야.", 코인: "변동성 있는 자산의 흐름을 직관적으로 잘 타. 대신 과신은 금물이야. 특히 조심할 건, 몇 번 감이 맞았다고 이후엔 근거 없이 감으로만 베팅하는 거야." },
  }
  const assetClass = ASSET_CLASS_BY_OH[dominant] || ASSET_CLASS_BY_OH["토"]
  const assetClassJSX = React.createElement("div", null,
    ...Object.entries(assetClass).map(([k, v], i, arr) =>
      React.createElement("div", { key: k, style: { marginBottom: i < arr.length - 1 ? 14 : 0, textAlign: "justify" } },
        React.createElement("span", { style: { color: C.caramel, fontFamily: FONT, fontWeight: 600, fontSize: 15 } }, k),
        React.createElement("span", { style: { color: C.parchment, fontFamily: FONT, fontSize: 14, lineHeight: 1.8 } }, ` ${v}`)
      )
    )
  )

  // 매력적인 순간 — 상대가 나한테 끌리는 포인트 (내 매력 분석)
  const ATTRACTIVE_BY_OH = {
    목: "말 안 해도 느껴지는 추진력에 상대가 끌려. 망설임 없이 밀고 나가는 태도가, 곁에 있는 사람한테는 든든함으로 다가가.",
    화: "존재감과 에너지 자체가 매력이야. 같이 있으면 분위기가 사는 느낌을 줘서, 상대는 자꾸 곁에 있고 싶어 해.",
    토: "흔들리지 않는 안정감에 끌려. 오래 봐도 편안한 사람이라는 인상을 줘서, 상대는 이 사람 앞에서 긴장을 풀게 돼.",
    금: "분명한 기준과 태도에서 신뢰를 느껴. 흐리지 않고 확실한 게 매력이라, 상대는 이 사람 말은 믿을 수 있다는 확신을 갖게 돼.",
    수: "잔잔한 분위기 속 깊이에 끌려. 알아갈수록 매력이 드러나는 타입이라, 상대는 시간이 지날수록 더 빠져들어. 처음보다 나중이 좋은 사람이야.",
  }
  const attractiveText = ATTRACTIVE_BY_OH[dominant] || ATTRACTIVE_BY_OH["토"]
  // 십성 카운트 (재성/관성/인성) — 여러 챕터에서 공용
  const _sc = d.sibsongAnalysis?.counts || {}
  const _gwanCnt = (_sc["정관"] || 0) + (_sc["편관"] || 0)   // 관성 = 직장·인정
  const _inCnt = (_sc["정인"] || 0) + (_sc["편인"] || 0)     // 인성 = 문서
  const _jaeCnt = (_sc["정재"] || 0) + (_sc["편재"] || 0)     // 재성 = 재물·연봉
  // 부모의 지원 (재정 = 재성 / 정서 = 인성)
  const parentSupportText = (() => {
    const money = _jaeCnt >= 2
      ? "재성이 두둑한 사주라 부모나 집안의 물질적 뒷받침을 받을 구조야."
      : _jaeCnt === 0
      ? "재성이 약해서 부모의 물질적 도움은 크게 기대하기 어려운 구조야. 일찍부터 자수성가형이야."
      : "재성이 적당히 있어서 부모 도움이 아주 없진 않지만, 결정적인 고비엔 결국 내 힘으로 서야 해."
    const mind = _inCnt >= 2
      ? "인성이 두터워 기댈 언덕이 있는 집안이야. 힘들 때 돌아갈 뿌리가 있어."
      : _inCnt === 0
      ? "인성이 약해 정신적 지지를 스스로 채워야 하는 구조야. 일찍 마음을 다독이는 법을 익혔어."
      : "인성이 적당해 지지가 아주 없진 않지만, 스스로 다독이는 힘도 길렀어."
    return money + " " + mind
  })()
  const reomulHabitText = _jaeCnt >= 3
    ? "재성이 넘치는 사주라 돈 들어오는 길이 여러 개인데, 새는 구멍도 많아. 계좌를 목적별로 쪼개고 자동 저축부터 걸어둬. 관리만 잡히면 재물이 가장 빠르게 불어나는 구조야."
    : _jaeCnt === 2
    ? "재성이 두둑해 돈 들어오는 길이 여러 개인데, 새는 구멍이 문제야. 고정 지출부터 점검하고 통장을 목적별로 쪼개. 지키는 습관만 붙이면 재물이 확 불어나."
    : _jaeCnt === 1
    ? "재성이 하나라 큰돈보단 꾸준한 흐름으로 쌓이는 구조야. 확장보다 지키며 조금씩 늘리는 방식이 잘 맞아. 정기 저축과 소비 기록만 붙여도 흐름이 보이기 시작해."
    : "재성이 약한 편이라 큰돈이 저절로 굴러오진 않아. 새는 걸 막고 작게 자주 모으는 데서 승부가 나. 충동 소비부터 끊고, 매달 조금씩 쌓는 게 부자 되는 길이야."

  // 연애 상세
  // 나와 갈등이 생기는 조건 (신강/신약 + 표현 방식 기반)
  const loveConflictHow = isSingang
    ? "연애에서는 주도권을 뺏기거나 내 방식을 부정당할 때 불이 붙어. 사랑싸움에서도 지고는 못 배기는 자존심이 관건이라, 이기는 것보다 져주는 연습이 이 연애의 숙제야."
    : "연애에서는 상대가 내 속도를 무시하고 몰아붙일 때 지쳐. 서운한 걸 삼키다 어느 날 갑자기 애정이 훅 꺼지는 식이라, 다툼보다 참고 쌓인 게 한꺼번에 터지는 게 진짜 위험이야."
  const loveTiming = `인연이 들어오는 시기가 따로 있어. 대운과 세운이 맞아야 제대로 된 사람이 와. 아무리 노력해도 안 되는 시기가 있고, 가만 있어도 오는 시기가 있어.`
  const loveWarn = idealType2 ? `근데 주의해. ${mug(d.mbti?.challenges?.[1] || d.mbti?.challenges?.[0] || "")} 이 약점이 관계에서도 그대로 나타나.` : ""
  // 커플 전용 관계 심화 (연애중일 때 '더 깊어지는 법')
  const coupleSelfText = (isSingang
    ? "지금 관계에서는 앞장서서 이끌고 챙기는 쪽이야. 든든한 버팀목이지만, 책임감이 지나치면 상대 몫까지 다 떠안아 혼자 지쳐."
    : "지금 관계에서는 상대에게 맞춰주고 배려하는 쪽이야. 그 다정함이 관계를 편안하게 만들지만, 바람을 자꾸 미루다 서운함이 고여."
  ) + ({
    편재: " 데이트나 이벤트에 아낌없이 쓰는 스타일이기도 해.",
    정재: " 관계에서도 알뜰하고 계획적인 편이야.",
    과다: " 챙길 게 많아서 정작 자기 자신은 뒷전이 되기 쉬워.",
    없음: " 물질보다 마음과 시간을 내주는 쪽으로 애정을 표현해.",
    균형: " 상황에 맞게 유연하게 조율하는 힘이 있어.",
  }[_jaeStruct] || "")
  const coupleOpenText = "이미 곁에 있는 사람이 새삼스럽게 나를 알아봐 줄 때 마음이 훅 깊어져. 거창한 이벤트보다 '이 사람이 나를 보고 있구나' 싶은 순간에 애정이 다시 차올라."
  const coupleDeepenText = (isSingang
    ? "이 관계를 더 깊게 만들려면, 주도하려는 힘을 조금 내려놓는 게 열쇠야. 고맙고 미안한 말을 그때그때 입 밖으로 내면 관계가 눈에 띄게 깊어져."
    : "이 관계를 더 깊게 만들려면, 속마음을 미루지 말고 그때그때 꺼내는 게 열쇠야. 표현하지 않으면 상대는 정말 몰라."
  ) + (yongsinA ? ({
    목: ` 특히 같이 새로운 걸 시작할 때 관계가 살아나.`,
    화: ` 특히 감정을 확실하게 표현해줄 때 관계가 살아나.`,
    토: ` 특히 안정적인 루틴을 함께 만들 때 관계가 단단해져.`,
    금: ` 특히 서로 간의 약속을 분명히 지킬 때 관계가 단단해져.`,
    수: ` 특히 말 안 해도 이해받는다는 느낌일 때 관계가 깊어져.`,
  }[yongsinA?.split("·")[0]] || "") : "")
  // 커플 전용 결혼·동거 타이밍
  const _bestYearGap = bestLoveYear ? bestLoveYear.year - new Date().getFullYear() : null
  const marriageTimingText = `결혼이나 동거 같은 큰 결정은 대운과 세운이 맞물릴 때 자연스럽게 무르익어. ${
    _bestYearGap !== null && _bestYearGap <= 2
      ? `세운으로 보면 바로 ${bestLoveYear.year}년 전후가 관계를 진전시키기 좋은 흐름이야.`
      : _bestYearGap !== null
      ? `세운으로 보면 ${bestLoveYear.year}년 전후가 관계를 진전시키기 좋은 흐름이야.`
      : "향후 몇 년 안에 관계를 정리하고 다음 단계로 넘어갈 결정적인 시기가 와."
  } 애정 흐름에서 점수가 높은 달을 골라 중요한 이야기를 꺼내면 성공률이 훨씬 높아.`
  const matchOhaengText = `오행으로 궁합을 따지면, 나를 살려주는 ${yongsinA ? yongsinD + " 기운" : "용신 기운"}을 지닌 사람과 만날 때 관계가 순풍을 타. 반대로 만날수록 지치고 나답지 않아지는 사람은, 조건이 좋아도 결이 안 맞는 거야.`
  const slumpText = `권태기는 애정이 사라져서가 아니라, 익숙함에 서로를 새로 안 보게 될 때 찾아와. ${isSingang ? "상대에게 리드할 자리를 내주면 다시 생기가 돌아." : "참기보다 바라는 걸 솔직히 말하면 오히려 관계가 살아나."} ${pick5({
    관성: "책임감에 짓눌려 관계마저 '해내야 할 일'처럼 느껴질 때가 위험 신호야.",
    인성: "머리로만 이해하려다 마음이 못 따라갈 때가 위험 신호야.",
    식상: "표현이 습관처럼 반복되면 진심이 옅어 보일 수 있어.",
    비겁: "혼자만의 공간을 지키려다 상대를 자꾸 밀어내는 게 위험 신호야.",
    재성: "각자 챙기기 바빠 관계가 뒷전으로 밀릴 때가 위험 신호야.",
  })}`
  // 커리어 상세
  const careerStrength = (() => {
    const cc = d.sibsongAnalysis?.counts || {}
    const parts = []
    if (_gwanCnt >= 1) parts.push("책임을 맡고 조직을 안정적으로 끌고 가는 힘")
    if (_inCnt >= 1) parts.push("깊이 파고들어 전문성으로 쌓는 힘")
    if ((cc["식신"] || 0) + (cc["상관"] || 0) >= 1) parts.push("아이디어를 표현하고 새로 만들어내는 힘")
    if (_jaeCnt >= 1) parts.push("현실 감각으로 실속 있는 결과를 만드는 힘")
    if ((cc["비견"] || 0) + (cc["겁재"] || 0) >= 1) parts.push("스스로 밀고 나가 주도하는 힘")
    return parts.length
      ? `일에서 특히 빛나는 건 ${parts.slice(0, 2).join("과 ")}이야. 이 강점이 살아나는 자리에 있을 때 실력이 제대로 인정받아.`
      : `${yongsinD || ""} 기운이 강한 분야에서 실력이 빛나.`
  })()
  const careerWeak = isSingang
    ? "일에서 발목 잡는 건 혼자 다 떠안고 밀어붙이다 소진되는 패턴이야."
    : "일에서 발목 잡는 건 자기 실력을 낮춰 보고 선뜻 나서지 못하는 소극성이야."
  const careerBest = yongsinA ? `${yongsinD} 기운이 살아있는 직종이야. 이 방향이 맞아. 돈도 따라오고 실력도 인정받아.` : ""
  const careerTiming = `지금 대운이 커리어에 유리한 시기인지, 내부를 다지는 시기인지가 중요해. 타이밍을 잘못 읽으면 아무리 잘해도 결과가 안 나와.`

  // ── 업무운 재구성: 관성(직장·인정)/인성(문서)/재성(연봉) 십성 기반 ──
  const jikjangText = _gwanCnt >= 2
    ? `관성이 ${_gwanCnt}개나 박혀 있어. 조직 안에서 인정받고 자리를 잡는 힘을 타고났어. 책임 있는 자리가 어울리고, 윗사람 눈에 드는 재주가 있어. 승진이나 감투가 자연스럽게 따라와. 올해는 이 관성 기운을 밀어붙일 때야. 나서서 책임을 맡아라. 그게 곧 자리로 이어져.`
    : _gwanCnt === 1
    ? `관성이 하나 있어. 직장운은 무난한 편인데, 크게 터지기보다 꾸준히 쌓아야 인정받는 구조야. 튀려고 애쓰기보다 맡은 걸 확실히 해내는 게 이 사주의 승진 공식이야. 올해는 조급해하지 말고 신뢰를 쌓아둬. 그게 다음 자리를 만든다.`
    : `관성이 없어. 타고나길 조직 체질은 아니야. 억지로 감투 쓰려 하면 오히려 답답해져. 이런 사주는 대운과 세운에서 관성이 들어올 때 확 치고 나가. 그 시기를 노려서 승부를 봐. 평소엔 실력을 갈아두는 게 맞고, 조직보다 전문성으로 승부하는 길도 열려 있어.`
  const munseoText = _inCnt >= 2
    ? `인성이 ${_inCnt}개 있어. 문서운이 강해. 자격증, 합격, 계약, 발령 같은 '도장 찍는 일'이 잘 풀려. 공부하면 결실이 나오고, 시험운도 받쳐줘. 미뤄둔 자격증이나 계약이 있으면 올해 밀어붙여. 도장 찍을 일이 생기는 흐름이야.`
    : _inCnt === 1
    ? `인성이 하나 있어. 문서운은 그럭저럭이야. 큰 노력 없이 굴러오진 않지만, 준비한 만큼은 결실이 나와. 자격이나 계약 건은 세운 좋은 달을 골라서 진행해.`
    : `인성이 없어. 문서운은 타고나길 약한 편이야. 합격이나 계약이 저절로 굴러오진 않으니, 될 때까지 파고드는 끈기로 메워야 해. 대운에서 인성이 들어올 때 자격증이나 시험을 몰아치는 게 전략이야.`
  const yeonbongText = _jaeCnt >= 2
    ? `재성이 ${_jaeCnt}개로 두둑해. 연봉 협상이나 성과급에서 제 몫을 챙기는 감각이 있어. 요구할 줄 아는 게 이 사주의 무기야.`
    : _jaeCnt === 1
    ? `재성이 하나 있어. 연봉은 근거를 쌓아서 협상하는 쪽이 잘 맞아. 성과를 미리 정리해두면 유리해져.`
    : `재성이 없어. 돈 얘기를 꺼내는 게 어색할 수 있어. 데이터와 성과로 근거를 만들어서 담담하게 요구하는 연습이 필요해.`
  const jikjangYearText = `올해 직장운을 십성으로 보면, ${_gwanCnt >= 1 ? "관성이 받쳐줘서 인정받고 올라설 여지가 있어." : "관성이 약해서 실력을 다지는 해야."} ${_inCnt >= 1 ? "인성도 들어와 합격운이 같이 열려." : "문서운은 잔잔해."} ${yeonbongText}`
  // 사내 정치 대처법, 상사·동료 갈등, 연봉·승진 협상 화법 — 실전 액션 3종 (리뷰 반영: 오행 진단만 있고 액션이 없다는 지적)
  const politicsText = pick5({
    관성: "위계 안에서 줄을 서야 할지 고민되면, 실력으로 증명하는 쪽에 걸어. 파벌보다 결과물이 오래 가는 사주야. 자리보다 성과표가 먼저 말해주는 구조라, 조급하게 줄부터 서지 마.",
    식상: "말이 빠른 만큼 뒷말도 빨리 퍼져. 사석에서 한 얘기가 그대로 전달될 수 있으니 편들기는 신중하게 해. 재미로 던진 한마디가 편 가르기로 번질 수 있으니 늘 한 톤 낮춰.",
    인성: "굳이 편을 안 갈라도 되는 자리야. 정보는 쥐고 있되 티 내지 않는 쪽이 오래 살아남아. 누가 물어도 판단은 끝까지 유보하는 게 이 사주엔 오히려 안전해.",
    재성: "이득 되는 줄에 서고 싶은 마음이 들기 쉬운데, 단기 이득보다 신뢰를 쌓는 쪽이 결국 더 크게 돌아와. 눈앞의 편의보다 평판이 결국 더 큰 자산이 되는 구조야.",
    비겁: "누구 편도 안 드는 게 제일 안전해. 혼자 힘으로 밀고 나가는 스타일이라 파벌 자체가 안 맞아. 무리에 안 끼어도 결과로 존재감을 만드는 게 이 사주의 방식이야.",
  })
  const conflictSolveText = isSingang
    ? "부딪혔을 땐 먼저 숙이지 않는 편인데, 그럴수록 감정보다 사실관계로 짚어야 유리해. 논리로 밀면 이기는 구조야. 감정이 앞선 순간엔 하루만 묵혔다 다시 얘기해도 늦지 않아."
    : "부딪히는 걸 피하려다 마음에만 담아두는 편인데, 그 순간들이 쌓이면 어느 날 갑자기 확 틀어질 수 있어. 짧게라도 먼저 말을 꺼내는 쪽이 결국 덜 지치는 길이야."
  const negotiationScriptText = _jaeCnt >= 1
    ? "협상 테이블에선 숫자와 성과를 먼저 꺼내. '이만큼 기여했으니'로 운을 떼면 유독 잘 통하는 사주야. 감정보다 근거 자료를 먼저 내미는 쪽이 훨씬 유리하게 흘러가."
    : "숫자보다 관계와 신뢰를 앞세워 말을 꺼내는 게 편해. '그동안 함께해온 만큼'으로 시작하면 더 자연스럽게 풀려. 급하게 숫자부터 들이밀면 오히려 이 사주엔 안 맞아."
  const promoText = `${_gwanCnt >= 1 ? "관성이 받쳐줘서 조직에서 치고 올라갈 힘이 있어. " : "관성이 약해 승진 정공법보다 실력으로 존재감을 만드는 게 빨라. "}${nextDaeun ? "대운이 바뀌는 전환기 즈음에 자리와 직책이 크게 움직이니, 그때를 노려 성과를 몰아쳐." : "지금 대운 안에서도 세운 점수가 높은 해에 인정과 승진이 몰리니, 아래 흐름에서 좋은 해에 승부를 걸어."} 조용히 쌓은 게 한 번에 인정받는 흐름이라, 티 나게 밀기보다 결과로 증명하는 게 이 사주의 승진법이야.`
  const burnoutText = `${isSingang ? "혼자 다 짊어지다 어느 순간 방전되는 게 번아웃 신호야. 다 잘하려 말고 맡길 건 맡겨." : "거절을 잘 못 해서 이것저것 다 떠안다가 어느 순간 훅 지쳐버리는 게 이 사주의 패턴이야. 내 한계를 인정하고 선을 긋는 연습이 필요해."} ${gisinA ? `특히 ${gisinD} 기운이 강해지는 시기엔 유독 지치니, 새 일보다 몸과 마음을 정비해.` : "무리가 겹치는 시기엔 성과보다 회복을 우선해."}`
  // 이직운 (관성 + 역마 + 대운)
  const transitionPrepText = pick5({
    관성: "대운 전환기엔 무리하게 새 책임을 떠안기보다, 지금 자리를 정리하고 다음 판을 볼 준비를 해. 조급하게 밀면 탈이 나니 흐름을 읽고 미리 방향만 틀어둬. 지금 이 자리에서 정리할 것과 남길 것을 미리 나눠두면 전환기가 훨씬 수월해져.",
    인성: "대운 전환기는 배우고 채우기 좋은 때야. 큰일을 벌이기보다 실력과 자격을 쌓아 다음 흐름에 올라탈 준비를 하면, 전환기가 도약의 발판이 돼. 지금 쌓아둔 것들이 다음 대운에서 예상보다 훨씬 크게 빛을 발하게 돼.",
    식상: "대운 전환기엔 벌여둔 걸 정리하고 진짜 하고 싶은 하나에 집중해. 다 붙들면 전부 어정쩡해지니, 흐름이 바뀔 때 과감히 선택하는 게 관건이야. 미련 없이 덜어내는 용기가 다음 흐름에서 더 크게 뻗어나갈 힘을 만들어줘.",
    비겁: "대운 전환기엔 혼자 다 짊어지려 말고 힘을 아껴. 변화를 두려워만 하면 기회도 지나가니, 믿을 사람과 손잡고 흐름을 함께 넘는 게 나아. 혼자 버티는 것보다 곁을 내주는 게 이 전환기를 훨씬 가볍게 만들어줘.",
    재성: "대운 전환기엔 벌인 판을 가볍게 정리하고 다음 기회를 노려. 흐름을 읽고 미리 방향을 틀어두면 전환기가 오히려 크게 버는 발판이 돼. 지금 정리하는 손해가 다음 대운에서는 더 큰 이득으로 돌아올 거야.",
  })
  const jikjangRole = careerWeak + (recovery ? " " + mug(recovery) : "")
  // 회사운 / 취업운 (입사일 유무 분기)
  const hasJoin = !!d.joinDate
  const _joinYear = d.joinDate?.year
  const _compEl = d.companyElement || ""
  const _foundYear = d.foundDate?.year
  const hasCompanyInfo = hasJoin || !!_compEl || !!_foundYear
  const companyFitText2 = (() => {
    if (!hasCompanyInfo) return ""
    const elFit = _compEl ? (_yongList.includes(_compEl) ? "good" : _giList.includes(_compEl) ? "bad" : "neutral") : null
    const joinFit = hasJoin ? (_gwanCnt >= 1 ? "good" : "weak") : null
    const k = _compEl ? _ohKr(_compEl) : ""
    let verdict = ""
    if (joinFit && elFit && elFit !== "neutral") {
      if (elFit === "good" && joinFit === "good") verdict = `업종이 나를 살리는 ${k} 기운이라 잘 맞고, 들어온 때의 궁합도 좋아. 이 회사에선 실력이 제대로 인정받고 오래 갈수록 빛나는 궁합이야.`
      else if (elFit === "good" && joinFit === "weak") verdict = `업종은 나를 살리는 ${k} 기운이라 잘 맞는데, 들어온 시기의 궁합이 살짝 아쉬워. 처음엔 인정이 더디게 느껴져도, 버티며 자리를 지킬수록 이 업이 나를 키워주는 흐름이야.`
      else if (elFit === "bad" && joinFit === "good") verdict = `들어온 때는 나쁘지 않은데, 업종 자체가 내 기신인 ${k} 기운이라 결이 어긋나. 조직에선 인정받아도 분야가 계속 기운을 갉으니, 실력을 쌓아 더 맞는 자리로 옮겨갈 발판으로 삼는 게 현명해.`
      else verdict = `솔직히 업종도 들어온 때도 딱 맞물리는 궁합은 아니야. ${k} 기운이 나와 어긋나는 데다 시기도 아쉬워서, 여기서 다 채우려 하기보다 실력과 경력을 쌓는 발판으로 삼는 게 나아.`
    } else if (elFit) {
      verdict = elFit === "good" ? `업종을 보면 이 회사는 나를 살리는 ${k} 기운이라, 오래 다닐수록 자리가 나를 키워주는 궁합이야.`
        : elFit === "bad" ? `업종을 보면 이 회사는 내 기신인 ${k} 기운이라, 조건이 좋아 보여도 은근히 기운이 새. 오래 머물 곳인지 신중히 봐.`
        : `업종을 보면 이 회사는 ${k} 기운인데 나와 상생도 상극도 아닌 중립이라, 실무 조건과 사람으로 판단하면 돼.`
      if (hasJoin) verdict = `${_joinYear}년에 들어간 회사야. ` + verdict
    } else if (joinFit) {
      verdict = `${_joinYear}년에 들어간 회사야. ${joinFit === "good" ? "입사한 해의 기운이 이 사주와 맞물려서 자리를 잡고 인정받을 수 있는 궁합이야. 버티면 열매가 있어." : "입사한 해의 궁합이 딱 맞물리진 않아. 다 채우려 하기보다 실력을 쌓는 발판으로 삼는 게 현명해."}`
    }
    let ageTail = ""
    if (_foundYear) {
      const age = (new Date().getFullYear()) - _foundYear
      ageTail = ` 참고로 ${_foundYear}년에 세워진 회사인데, ${age < 5 ? "아직 어린 조직이야. 안정성은 덜해도 함께 자리 잡는 재미가 있어." : age < 15 ? "한창 성장하는 조직이라 체계와 기회가 함께 있어." : "충분히 자리 잡은 조직이라 안정적이지만 변화 속도는 느릴 수 있어."}`
    }
    return (verdict + ageTail + " 큰 결정을 내리기 전엔 대운 흐름을 먼저 보는 게 좋아.").trim()
  })()
  const chwiupText = `${hasJoin ? "취업과 이직운을 보면," : "아직 다니는 회사가 없거나 입사일을 안 넣었으니 취업운으로 봐줄게."} 서류 통과와 합격은 인성이 좌우하는데, ${_inCnt >= 1 ? "인성이 받쳐줘서 준비한 만큼 결실이 나와." : "인성이 약하니 붙을 때까지 두드리는 끈기가 필요해."} 아래 12개월 흐름에서 점수 높은 달에 원서를 몰아 넣는 게 합격률을 가장 확실히 올리는 방법이야.`
  // ── 취업운 확장 (조직유형 / 면접·전략 / 이직·상사·방해) ──
  const orgFitText = _gwanCnt >= 3
    ? "관성이 아주 강해서 위계와 규율이 뚜렷한 조직에 있을 때 오히려 힘을 못 빼고 최고의 실력을 발휘해. 공직, 군, 대기업 본사처럼 체계가 확실한 곳이 잘 맞고, 오히려 자유가 너무 많으면 방향을 잃어. 규칙 안에서 최고가 되는 타입이야."
    : _gwanCnt === 2
    ? "관성이 강해서 체계가 잡힌 큰 조직, 위계가 분명한 곳에서 오히려 안정감을 느끼고 실력을 발휘해. 대기업, 공공기관, 오래된 조직처럼 규칙과 절차가 뚜렷한 데가 잘 맞아. 반대로 모든 걸 스스로 정해야 하는 무질서한 곳에선 힘이 빠져."
    : _gwanCnt === 0
    ? "관성이 약해서 규칙에 꽉 매인 대형 조직보다, 자율성이 큰 작은 조직이나 실력으로 승부하는 곳이 잘 맞아. 스타트업, 전문직, 프리랜서처럼 내 재량이 넓은 자리에서 빛나. 위계가 강한 곳에 억지로 들어가면 금세 답답해져."
    : "관성이 적당해서 너무 경직된 곳도, 너무 느슨한 곳도 아닌 중간 규모 조직이 잘 맞아. 체계는 있되 개인 재량도 어느 정도 인정되는 데가 최적이야."
  const interviewText = pick5({
    관성: "면접에선 '책임감 있고 신뢰 가는 사람' 이미지가 먹혀. 튀는 개성보다 안정감과 성실함을 앞세워. 하나를 끝까지 해낸 완수 경험을 강조하면 유리해. 급하게 어필하기보다 차분하게 신뢰를 쌓아가는 태도가 면접관에게 더 오래 남아.",
    식상: "면접에선 말솜씨와 순발력이 무기야. 짜인 답보다 상황에 맞게 풀어내는 힘이 강점이라, 대화형 면접이나 발표에서 빛나. 창의성과 표현력을 보여줘. 자연스러운 순발력을 살려 예상 못 한 질문에도 여유 있게 답하는 게 이 사주의 강점이야.",
    인성: "면접에선 차분함과 준비된 태도가 강점이야. 즉흥보다 미리 탄탄히 준비했을 때 실력이 나오니, 예상 질문을 충분히 연습하고 들어가면 합격률이 확 올라가. 꼼꼼하게 준비한 티가 나면 그 자체로 신뢰를 얻는 유형이야.",
    재성: "면접에선 실전 감각과 성과로 승부해. 추상적인 포부보다 무엇을 얼마나 만들어냈는가를 숫자와 결과로 보여줄 때, 실무형이라는 인상이 강하게 박혀. 구체적인 사례 하나가 열 마디 다짐보다 훨씬 설득력 있게 먹혀.",
    비겁: "면접에선 뚝심과 주도성이 강점이야. 주눅 들지 않는 태도와 '맡겨만 주면 해낸다'는 자신감이 먹히니, 위축되지 말고 당당하게 밀어붙여. 스스로를 낮추기보다 확신 있게 말하는 태도가 오히려 신뢰를 만들어.",
  })
  const jobStrategyText = _inCnt >= 1
    ? "인성이 받쳐줘서 자격증, 공채, 시험처럼 준비한 만큼 결과가 나오는 정공법이 잘 맞아. 스펙을 차곡차곡 쌓아 서류에서 승부 보는 전략이 유리해."
    : _jaeCnt >= 2
    ? "재성이 강해서 시험보다 실무 경험과 사람을 통한 기회가 더 잘 통해. 인턴, 프로젝트, 소개처럼 실전에서 능력을 보여주고 네트워크로 연결되는 수시 채용이 유리해."
    : "정공법과 실전을 병행하는 게 나아. 기본 스펙은 갖추되, 그걸 실제로 써먹은 경험을 함께 보여줄 때 경쟁력이 확 올라가. 서류와 실무 둘 다 놓치지 마."
  const _yearTrendUp = (yearForecast[1]?.score || 0) >= (yearForecast[0]?.score || 0)
  const jobMoveText = nextDaeun
    ? (_yearTrendUp
        ? "이직은 아무 때나가 아니라 대운 흐름이 바뀌는 길목에서 크게 열려. 마침 다음 대운으로 넘어가는 전환기가 가까운 데다, 세운 흐름도 상승세라 지금이 판을 갈아타기 아주 좋은 타이밍이야. 준비만 됐다면 망설이지 말고 움직여."
        : "대운이 바뀌는 전환기가 다가오고 있어 판을 갈아탈 기회는 열려 있는데, 당장의 세운 흐름은 주춤한 편이야. 지금 무리하게 던지기보다 전환기 초입까지 조금만 더 다지면서 준비하는 게 안전해.")
    : (_yearTrendUp
        ? "지금 대운 안에 머물러 있지만 세운 점수가 오르는 흐름이라, 대운 전환을 기다리지 않아도 지금이 이직 적기야. 흐름 좋을 때 움직이는 게 이득이야."
        : "지금 대운 안에서도 세운 점수가 높은 해가 이직 적기야. 흐름이 가라앉은 해에 조급하게 옮기면 비슷한 문제를 반복하니, 아래 세운 흐름에서 점수 높은 시기를 노려서 움직여.")
  const bossText = _inCnt >= 2
    ? (_gwanCnt >= 1
        ? "나를 알아봐 주는 상사는 가르치고 키워주는 걸 좋아하는 타입이야. 인성이 강해서 배울 게 많은 윗사람 밑에서 특히 크게 성장하고, 동시에 관성도 있어서 그런 상사에게 자리와 기회까지 받게 될 확률이 높아. 좋은 사수를 만나는 게 곧 커리어 전체를 바꾸는 사주야."
        : "나를 알아봐 주는 상사는 가르치고 키워주는 걸 좋아하는 타입이야. 인성이 강해서 배우는 관계에서 특히 크게 성장해. 다만 관성이 약해 자리는 스스로 만들어야 하니, 실력을 키워주는 상사를 만나는 게 곧 다음 기회로 이어져."
        )
    : _inCnt === 1
    ? "나를 알아봐 주는 상사는 성과를 겉으로 티 내는 타입보다, 묵묵히 하는 걸 지켜보고 인정해 주는 사람이야. 배우고 성장할 여지가 있는 곳에서 준비한 만큼 결실이 나와. 반대로 감정 기복이 심하거나 공을 가로채는 상사 밑에서는 유독 힘이 빠지니, 조직을 고를 때 사람도 함께 봐."
    : (_gwanCnt >= 1
        ? "나를 알아봐 주는 상사는 결과로 말하는 실무형이야. 인성이 약해 누가 가르쳐주길 기다리기보다 스스로 부딪히며 배우는 편이 맞고, 관성이 있어 성과만 내면 자리는 따라와. 실력으로 증명하는 상사와 궁합이 좋아."
        : "나를 알아봐 주는 상사는 결과로 말하는 실무형이야. 실력으로 인정받는 구조라, 화려한 말보다 결과를 정확히 봐주는 상사와 잘 맞아. 반대로 감정 기복이 심하거나 공을 가로채는 상사 밑에서는 유독 힘이 빠지니, 조직을 고를 때 사람도 함께 봐."
        )
  const jobBlockText = gisinA
    ? `취업을 방해하는 결은 ${gisinD} 기운이 강해지는 시기와 환경이야. 이 기운이 세지면 판단이 흐려지고 엉뚱한 자리에 힘을 쏟기 쉬워. ${gisinD} 성향이 강한 업종이나 분위기의 회사는 조건이 좋아 보여도 오래 못 버티니, 급할수록 신중하게 골라.`
    : "특별히 취업을 크게 막는 기운은 없어. 다만 조급함이 제일 큰 방해라, 초조하게 아무 데나 넣기보다 흐름이 좋은 시기를 기다렸다 움직이는 게 이득이야."
  // 이력서 어필 포인트, 면접관 유형별 공략법, 계약 조건 체크리스트 — 실전 액션 3종 (리뷰 반영)
  const resumeAppealText = pick5({
    관성: "이력서엔 '맡은 일을 끝까지 완수했다'는 경험을 앞세워. 책임감과 신뢰가 이 사주의 진짜 무기야.",
    식상: "이력서엔 숫자보다 스토리로 어필해. 어떤 아이디어를 냈고 어떻게 풀어냈는지 서술형으로 풀 때 강해져.",
    인성: "이력서엔 자격증, 교육 이수 같은 '검증된 준비'를 앞세워. 꾸준히 쌓아온 티가 나야 신뢰를 얻어.",
    재성: "이력서엔 숫자와 성과를 앞세워. '매출 몇 퍼센트 증가' 같은 구체적 결과가 이 사주의 강점을 제일 잘 보여줘.",
    비겁: "이력서엔 혼자 주도해서 이끈 프로젝트를 앞세워. 리더십과 추진력이 드러나는 경험이 잘 먹혀.",
  })
  const interviewerTypeText = "면접관이 딱딱하고 원칙적인 타입이면 안정감과 근거를 앞세워. 반대로 편하게 대화하듯 묻는 타입이면 순발력과 태도로 승부해. 면접 초반 5분 안에 상대 스타일을 읽는 게 이 사주의 숨은 무기야."
  const contractCheckText = gisinA
    ? `계약서에 도장 찍기 전에 ${gisinD} 기운이 강한 조건(급여 체계, 근무 시간)은 특히 꼼꼼히 확인해. 애매하면 말로 넘기지 말고 서면으로 다시 확인받아.`
    : "계약서에 도장 찍기 전에 급여, 근무시간, 수습기간 조건은 말보다 문서로 다시 확인해. 애매한 조건은 나중에 반드시 문제가 돼."

  // ── 관계운 3페이지용 추가 ──
  const relSocialStyle = pick5({
    관성: "관계에서 책임지고 조율하는 쪽이야. 모임에서 총대 메고 챙기는 역할을 맡는데, 그 부담을 혼자 지다 지쳐. 다 감당하려 말고 나눌 줄도 알아야 해. 누군가는 나를 대신해줘도 괜찮다는 걸 받아들이면 관계가 훨씬 편해져.",
    인성: "관계에서 받는 걸 어려워하는 쪽이야. 남 챙기는 건 잘하는데 정작 내 얘기는 잘 안 꺼내. 깊은 관계는 소수랑만 맺고, 그 소수한테는 뭐든 내주는 사람이야. 넓게 퍼지기보다 깊게 파고드는 관계가 이 사람을 진짜 채워줘.",
    식상: "관계에서 분위기를 띄우고 이끄는 쪽이야. 말과 표현으로 사람을 끌어당기는데, 에너지를 다 쏟고 혼자 방전되기 쉬우니 회복 시간을 꼭 챙겨. 신나게 놀아준 만큼 혼자만의 시간으로 채워주는 균형이 필요해.",
    비겁: "관계에서 대등하게 어울리는 쪽이야. 친구는 많은데 주도권을 두고 은근히 겨루기도 해. 지지 않으려는 마음을 내려놓으면 관계가 훨씬 편해져. 이기고 지는 게 아니라 그냥 같이 있는 거라는 걸 받아들이는 게 관건이야.",
    재성: "관계에서 사람을 잘 관리하고 챙기는 쪽이야. 인맥을 넓게 쓰는 감각이 좋은데, 정 주는 만큼 통제하려 들면 멀어지니 적당한 거리가 필요해. 챙기는 것과 관리하려는 것 사이의 선을 스스로 자주 점검해봐.",
  })
  const relConflictStyle = "부딪힐 땐 정면으로 싸우기보다 조용히 거리를 둬. 겉으론 아무렇지 않은 척하지만 속으로 이미 정리에 들어간 거야. 이 방식이 편하긴 한데, 오해를 키우기도 해. 진짜 아끼는 관계라면 닫기 전에 한 번은 말로 풀어."

  // ── 건강운 3페이지용 추가 ──
  const healthLifeText = pick5({
    관성: "긴장을 안고 사는 기질이라 몸이 늘 살짝 굳어 있어. 스트레스가 소화기나 근육 긴장으로 오기 쉬우니, 규칙적으로 몸을 푸는 루틴이 곧 보약이야. 마음을 놓는 연습이 곧 몸을 지키는 연습이라는 걸 잊지 마.",
    인성: "타고난 체력이 넘치는 편은 아니야. 대신 무리만 안 하면 잔병 없이 오래 가는 구조라, 몸이 보내는 신호에 예민한 게 강점이야. 초기에 잡으면 큰 병으로 안 커지니, 작은 이상도 그냥 넘기지 말고 챙겨봐.",
    식상: "에너지를 몰아 쓰다 한 번에 방전되는 리듬이라, 몰입과 휴식의 낙차가 커. 달릴 때와 쉴 때를 미리 정해두는 규칙이 몸을 지켜. 즐거움에 취해 무리하다 한꺼번에 무너지지 않도록 스스로 브레이크를 걸어둬.",
    비겁: "몸을 계속 쓰려 드는 기질이라 젊을 땐 체력으로 버텨. 근데 그게 독이야. 누적된 피로가 삼사십대에 터지기 쉬우니, 멈출 줄 아는 게 장수 비결이야. 지금 버티는 힘을 아껴야 나중에도 오래 쓸 수 있어.",
    재성: "여러 일을 벌이며 몸을 과하게 굴리는 편이야. 바쁠수록 끼니와 잠이 무너지기 쉬우니, 기본 리듬을 지키는 게 가장 큰 재테크이자 건강법이야. 몸이 밑천이라는 걸 잊지 않는 게 결국 가장 남는 장사야.",
  })
  const HEALTH_MIND_BY_OH = {
    목: "간과 근육 쪽이 예민한 사주라, 스트레스를 받으면 마음보다 몸이 먼저 뻐근하게 반응해. 억지로 참지 말고 몸을 움직여서 푸는 게 가장 빠른 회복법이야.",
    화: "심장과 혈이 예민한 사주라, 감정이 확 올라오면 몸이 바로 반응하는 타입이야. 흥분하거나 열받는 순간을 빨리 가라앉히는 게 건강의 핵심이야.",
    토: "위장과 소화기가 예민한 사주라, 스트레스가 제일 먼저 배로 내려가는 타입이야. 규칙적인 식사와 마음의 안정이 몸 상태를 그대로 좌우해.",
    금: "폐와 호흡기가 예민한 사주라, 마음이 답답할 때 숨부터 얕아지는 타입이야. 감정을 억누르지 말고 제때 풀어주는 게 몸을 지키는 길이야.",
    수: "몸보다 마음이 먼저 지치는 사주야. 스트레스가 몸으로 내려오기 전에 마음을 비우는 루틴을 만들어. 혼자만의 회복 시간이 약보다 중요해.",
  }
  const healthMindLifeText = HEALTH_MIND_BY_OH[dominant] || HEALTH_MIND_BY_OH["수"]

  // ── 대운 인생지도용 ──
  const _daeunScore = (dv) => {
    const o = _HANJA2KR_D[dv.ohaeng] || dv.ohaeng
    if ((yongsinA || "").split("·").includes(o)) return 85
    if ((gisinA || "").split("·").includes(o)) return 45
    return 65
  }
  const daeunLifeMap = daeun.map(dv => ({
    label: (dv.label || "").replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim(),
    period: dv.period || "",
    year: _daeunYear ? null : null,
    startYear: _birthYear && dv.period ? _birthYear + (parseInt((dv.period.match(/만\s*(\d+)/) || [])[1] || "0")) : null,
    score: _daeunScore(dv),
    cur: dv.cur,
  }))
  const _peakDaeun = [...daeunLifeMap].sort((a, b) => b.score - a.score)[0]
  const _peakLabelClean = _peakDaeun ? (_peakDaeun.label || "").replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").replace(/[（(）)]/g, "").trim() : ""
  const _peakRange = _peakDaeun && _peakDaeun.startYear ? `${_peakDaeun.startYear}년~${_peakDaeun.startYear + 9}년` : ""
  const daeunGoldenText = _peakDaeun
    ? `인생 전체 대운을 펼쳐 보면, ${_peakLabelClean} 대운${_peakRange ? `(${_peakRange})` : ""}이 가장 크게 열리는 황금기야. 이 구간에 인생의 승부를 걸어. 여기서 벌인 일이 평생을 먹여 살려.`
    : ""
  // 인생 4구간 (나이 고정 · 12운성처럼 4단계) — 계절 비유 없이 나이순이라 순서가 절대 안 바뀜
  const _lifeStages = [
    { name: "초년", label: "만 0~19세", min: 0, max: 19 },
    { name: "청년", label: "만 20~39세", min: 20, max: 39 },
    { name: "중년", label: "만 40~59세", min: 40, max: 59 },
    { name: "말년", label: "만 60세~", min: 60, max: 200 },
  ]
  const _stageAvgPhase = (min, max) => {
    const arr = daeun.filter((dv, i) => {
      const sy = daeunLifeMap[i]?.startYear
      const age = sy && _birthYear ? sy - _birthYear : null
      return age != null && age >= min && age <= max
    })
    if (!arr.length) return ""
    const avg = arr.reduce((s, dv) => s + _daeunScore(dv), 0) / arr.length
    return avg >= 75 ? "크게 열려 순풍이 부는" : avg >= 58 ? "무난하게 흐르는" : "버티고 다지며 힘을 쌓는"
  }
  const _phaseEarly = _stageAvgPhase(0, 19)
  const _phaseYoung = _stageAvgPhase(20, 39)
  const _phaseMid = _stageAvgPhase(40, 59)
  const _phaseLate = _stageAvgPhase(60, 200) || (() => {
    const l = daeun.length ? daeun[daeun.length - 1] : null
    if (!l) return "무난하게 흐르는"
    const sc = _daeunScore(l)
    return sc >= 75 ? "크게 열려 순풍이 부는" : sc >= 58 ? "무난하게 흐르는" : "버티고 다지며 힘을 쌓는"
  })()
  const lifeEarlyText = _phaseEarly ? `초년기는 ${_phaseEarly} 기운 속에 있어. ${_phaseEarly.includes("버티") ? "일찍부터 크고 작은 고생을 겪으며 뿌리를 내리는 시기였을 거야. 몸으로 부딪혀 배운 게 평생 밑천이 돼." : "받쳐주는 기운 속에서 비교적 사랑과 관심을 받고 컸을 가능성이 커. 이때 쌓인 안정감이 평생 정서의 바탕이 돼."}` : ""
  const lifeYoungText = _phaseYoung ? `청년기는 ${_phaseYoung} 기운 속에 있어. ${_phaseYoung.includes("크게 열려") ? "치고 나갈 힘이 제대로 실려. 겁내지 말고 판을 벌여도 되는 시기야." : _phaseYoung.includes("버티") ? "당장 결과가 안 나와도 조급해하지 마. 이때 버틴 힘이 나중에 한꺼번에 터져." : "요란하진 않아도 꾸준히 밀면 착실하게 기반이 잡혀."} 인생의 큰 뼈대가 이 시기에 잡혀.` : ""
  const lifeMidText = _phaseMid ? `중년기는 ${_phaseMid} 기운 속에 있어. ${_phaseMid.includes("크게 열려") ? "인생의 정점이 바로 여기 있어. 이 황금기를 놓치지 마." : _phaseMid.includes("버티") ? "무리하게 판을 키우기보다 지킬 걸 단단히 지키는 게 이득이야." : "쌓아온 만큼 안정적으로 성과가 돌아와."} 성취만큼 건강과 관계도 함께 챙겨.` : ""
  const lifeLateText = _phaseLate ? `말년기는 ${_phaseLate} 기운 속에 있어. ${_phaseLate.includes("크게 열려") ? "늦게 피는 꽃이라 후반이 오히려 화려한 사주야." : _phaseLate.includes("버티") ? "욕심을 내려놓고 지금 가진 걸 지키는 데 집중할 시기야." : "안정 속에서 결실을 천천히 누리는 때야."} 물질보다 마음의 평화와 사람과의 정이 더 큰 자산이 돼.` : ""
  // 대운별 인생 테마 — 4구간으로 묶어 줄바꿈 (같은 어미 반복 나열 제거)
  const _daeunTheme = (dv) => {
    const o = _HANJA2KR_D[dv.ohaeng] || dv.ohaeng
    const map = {
      "목": "새로 싹트고 뻗어나가는 성장의 시기", "화": "열정을 태우고 이름을 알리는 확장의 시기",
      "토": "기반을 다지고 중심을 세우는 안정의 시기", "금": "결실을 거두고 정리하는 수확의 시기",
      "수": "깊이 사색하고 준비하는 재충전의 시기",
    }
    return map[o] || "흐름을 다지는 시기"
  }
  const daeunThemeText = (() => {
    if (!daeunLifeMap.length) return ""
    const out = []
    for (const st of _lifeStages) {
      const items = daeunLifeMap
        .map((dv, i) => ({ dv, i, age: dv.startYear && _birthYear ? dv.startYear - _birthYear : null }))
        .filter(({ age }) => age != null && age >= st.min && age <= st.max)
      if (!items.length) continue
      out.push(`${st.name} (${st.label})`)
      for (const { dv, i, age } of items) {
        out.push(`${dv.label} 대운(만 ${age}세~) ${_daeunTheme(daeun[i] || {})}`)
      }
    }
    return out.join("\n")
  })()
  // 대운 전환기 대비 (전환점마다 무슨 일 / 뭘 준비)
  const daeunTransitionText = (() => {
    if (!daeun.length) return ""
    const cur = daeun.find(dv => dv.cur)
    const curIdx = cur ? daeun.indexOf(cur) : 0
    const next = daeun[curIdx + 1]
    const nextAge = next && _birthYear && daeunLifeMap[curIdx + 1]?.startYear ? daeunLifeMap[curIdx + 1].startYear - _birthYear : null
    const nextYear = daeunLifeMap[curIdx + 1]?.startYear
    if (!next) return "지금 대운이 인생 후반의 큰 흐름이야. 이 대운을 잘 마무리하는 게 남은 삶의 질을 결정해."
    const nextScore = _daeunScore(next)
    const dir = nextScore >= 70 ? "up" : nextScore <= 50 ? "down" : "flat"
    const _nextLabelClean = (next.label || "").replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").replace(/[（(）)]/g, "").trim()
    const head = `${nextYear ? `${nextYear}년부터` : "다음 대운에"} 대운이 ${_nextLabelClean}로 바뀌어. 대운이 바뀌는 전후 2~3년은 인생의 환절기라, 속에서 판이 크게 흔들려. `
    const body = dir === "up"
      ? "다행히 다음 대운은 기운이 트이는 흐름이야. 이 전환기에 이사, 이직, 새 도전을 준비해두면 탄력을 받아."
      : dir === "down"
      ? "다음 대운은 기운을 아껴야 하는 흐름이야. 무리하게 판을 벌이면 탈이 나니, 지금 벌여둔 일을 정리해둬."
      : "다음 대운은 무난하게 흐르는 편이야. 큰 욕심보다 지금 쌓은 걸 안정적으로 이어가는 데 집중해."
    return head + body
  })()
  // 대운 × 세운 교차 황금기 (진짜 터지는 해)
  const _daeunSaeunPeak = (() => {
    const goods = yearForecast.filter(y => (y.score || 0) >= 72).slice(0, 3)
    const cur = daeun.find(dv => dv.cur)
    const curGood = cur && _daeunScore(cur) >= 65
    const _AREA_MSG = {
      재물: "돈이 실제로 움직이는 재물운이 제일 두드러지는 해야. 투자, 계약, 큰 거래처럼 실속으로 이어지는 결정을 이때 걸면 결과가 크게 돌아와.",
      애정: "인연과 애정운이 활짝 열리는 해야. 새 인연이든 지금 관계의 진전이든, 마음 쓰는 일이 이때 가장 잘 풀려.",
      커리어: "일과 커리어운이 강하게 트이는 해야. 승진, 이직, 중요한 프로젝트처럼 판을 키우는 승부를 이때 몰면 크게 인정받아.",
      건강: "몸과 컨디션이 든든하게 받쳐주는 해야. 체력이 올라오는 만큼 미뤄둔 일을 몰아서 밀어붙이기 좋아.",
      관계: "사람과 관계운이 좋은 해야. 귀인을 만나거나 인맥이 넓어져서, 사람을 통해 기회가 들어오는 흐름이야.",
    }
    if (!goods.length) return { none: "앞으로 몇 년은 대운과 세운이 크게 겹치는 초강세 구간은 뚜렷하지 않아. 대신 이런 시기엔 무리한 승부보다 실력과 기반을 다지는 게 정답이야. 조용히 힘을 모아두면 다음 황금기에 크게 터뜨릴 수 있어." }
    const used = new Set()
    const years = goods.map(y => {
      const ranked = Object.entries(y.areas || {}).sort((a, b) => (b[1] || 0) - (a[1] || 0))
      const pick = ranked.find(([k]) => !used.has(k)) || ranked[0]
      if (pick) used.add(pick[0])
      return { year: y.year, score: y.areas?.[pick?.[0]] ?? y.score, area: pick?.[0] || "", msg: _AREA_MSG[pick?.[0]] || "여러 영역이 고르게 받쳐줘서, 뭘 벌여도 손해가 적은 해야." }
    })
    const intro = `대운과 세운이 겹쳐서 진짜 크게 터지는 해를 짚어보면 ${goods.map(y => y.year).join(", ")}년이야. ${curGood ? "지금 대운 자체가 든든하게 받쳐주는 데다" : "대운의 큰 흐름 속에서도"} 이 해들은 세운까지 힘을 보태서 평소보다 몇 배 큰 결과를 낼 수 있어. 그런데 같은 황금기라도 해마다 트이는 문이 조금씩 달라.`
    const closing = `이렇게 해마다 강해지는 영역이 다르니까, 큰 결정도 그 해의 결에 맞춰 골라 던지면 성공률이 훨씬 높아져. 승부수는 이 해들로 몰되, 한 해에 다 쏟기보다 영역별로 나눠서 노리는 게 이 기회의 창을 제대로 쓰는 법이야.`
    return { intro, years, closing }
  })()

  // 올해 세운 (연간지 → 일간 기준 십성) — "그래서 올해는?"을 십성으로 풀어줌
  const _GAN_ARR = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"]
  const _JI_ARR = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"]
  const _GAN_OH = { 갑: "목", 을: "목", 병: "화", 정: "화", 무: "토", 기: "토", 경: "금", 신: "금", 임: "수", 계: "수" }
  const _GAN_YANG = { 갑: 1, 병: 1, 무: 1, 경: 1, 임: 1, 을: 0, 정: 0, 기: 0, 신: 0, 계: 0 }
  const _SAENG = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" }
  const _GEUK = { 목: "토", 토: "수", 수: "화", 화: "금", 금: "목" }
  const _sibsongOf = (ilKo, tgtKo) => {
    const io = _GAN_OH[ilKo], to = _GAN_OH[tgtKo]
    if (!io || !to) return ""
    const same = _GAN_YANG[ilKo] === _GAN_YANG[tgtKo]
    if (io === to) return same ? "비견" : "겁재"
    if (_SAENG[io] === to) return same ? "식신" : "상관"
    if (_GEUK[io] === to) return same ? "편재" : "정재"
    if (_GEUK[to] === io) return same ? "편관" : "정관"
    if (_SAENG[to] === io) return same ? "편인" : "정인"
    return ""
  }
  const _thisYearNum = thisYear.year || new Date().getFullYear()
  const _yGan = _GAN_ARR[((_thisYearNum - 4) % 10 + 10) % 10]
  const _yJi = _JI_ARR[((_thisYearNum - 4) % 12 + 12) % 12]
  const _ilganKo = d.pillars?.[2]?.gan?.ko || dominant
  const _saeunSibsong = _sibsongOf(_ilganKo, _yGan)
  const _SAEUN_CAT = { 비견: "비겁", 겁재: "비겁", 식신: "식상", 상관: "식상", 편재: "재성", 정재: "재성", 편관: "관성", 정관: "관성", 편인: "인성", 정인: "인성" }
  const _SAEUN_MSG = {
    비겁: "올해는 남한테 기대기보다 내 힘으로 밀어붙일 때 결과가 나는 흐름이야. 창업이나 이직처럼 주도권을 쥐는 결정에 유리한데, 동업이나 큰돈 거래는 한 번 더 따져봐야 해.",
    식상: "올해는 표현하고 만들어내는 기운이 활짝 열리는 흐름이야. 새 프로젝트나 창작, 자기표현이 유독 잘 풀려. 다만 말이 많아지는 만큼 구설도 따라오니 조심해.",
    재성: "올해는 돈과 기회가 실제로 움직이는 흐름이야. 재테크와 거래에 적극적으로 나서면 결과가 나와. 다만 한 번에 크게 먹으려는 과욕이 이 해의 함정이야.",
    관성: "올해는 책임이 커지는 대신 그만큼 자리와 인정이 따라오는 흐름이야. 승진이나 시험, 자격에 운이 열려. 다만 짐이 무거워지는 만큼 건강도 같이 챙겨.",
    인성: "올해는 배우고 채우는 기운이 강한 흐름이야. 공부나 자격증, 계약이 술술 풀려. 다만 생각만 많아지고 실행이 늦어지기 쉬우니 미루지 마.",
  }
  const _saeunCat = _SAEUN_CAT[_saeunSibsong]
  const saeunYearText = _saeunSibsong
    ? `올해는 ${_thisYearNum}년, ${_yGan}${_yJi}년이야. ${_SAEUN_MSG[_saeunCat]} ${thisYear.score ? `종합 흐름은 ${thisYear.score}점 정도로 봐.` : ""}`
    : `올해는 ${_thisYearNum}년, ${_yGan}${_yJi}년이야. 달마다 기운의 결이 갈리니, 점수가 높은 달을 골라 중요한 결정을 몰아주는 게 좋아.`

  // 육친과 나 — 가족 배치를 "나에 대한 이해"로 되돌림 (#13)
  const _famScores = {
    재성: (_sc["정재"] || 0) + (_sc["편재"] || 0),
    관성: _gwanCnt,
    인성: _inCnt,
    식상: (_sc["식신"] || 0) + (_sc["상관"] || 0),
    비겁: (_sc["비견"] || 0) + (_sc["겁재"] || 0),
  }
  const _famPattern = {
    재성: "가족을 부양하고 통제 안에 두려는 책임감이 몸에 배어 있어. 챙기는 게 사랑이라 믿어서, 마음을 나누는 건 서툴 때가 있어.",
    관성: "규율과 기대 속에서 자라 스스로에게 엄격한 패턴이 남았어. 인정받아야 안심하는 마음이 지금도 따라와.",
    인성: "보살핌을 넉넉히 받은 만큼 안정과 의존의 욕구가 커. 홀로 서는 걸 자꾸 미루게 되는 약점도 함께 있어.",
    식상: "표현하고 돌보는 기운이 강해서, 관계에서 늘 먼저 베푸는 쪽이야. 주는 건 잘하는데 받는 법은 안 배웠어.",
    비겁: "형제나 또래 기운이 강해 일찍 독립심을 키웠어. 기대면 지는 것 같은 마음이 관계를 외롭게 만들기도 해.",
  }
  const _famTop = Object.entries(_famScores).sort((a, b) => b[1] - a[1])[0]
  const _famLack = Object.entries(_famScores).filter(([, v]) => !v).map(([k]) => k)
  const yukchinSelfText = `이 명식에서 ${_famTop && _famTop[1] ? _famTop[0] : "육친"} 기운이 가장 도드라지는데, 그게 지금의 나를 이렇게 만들었어. ${_famTop && _famTop[1] ? _famPattern[_famTop[0]] : "육친이 특정 자리에 쏠리지 않고 고르게 퍼져 있어, 관계마다 다른 얼굴을 꺼내 쓰는 편이야."}`
  const yukchinLoopText = pick5({
    관성: "관계에서 상대의 기대와 규칙에 나를 맞추는 패턴을 반복해. 가족 안에서 '잘해야 사랑받는다'고 몸에 밴 방식이 어른이 된 지금도 따라와. 그 패턴을 알아차리는 순간, 조건 없이도 사랑받을 자격이 있다는 걸 알게 돼. 애써 증명하지 않아도 곁에 남는 사람이 진짜라는 걸 배우는 게 이번 생의 과제야.",
    인성: "관계에서 받기보다 먼저 주고 희생하는 패턴을 반복해. 가족 안에서 '내가 챙겨야 한다'고 몸에 밴 방식이 지금도 따라와. 그 패턴을 알아차리는 순간, 나도 기대고 받아도 된다는 걸 배우게 돼. 주기만 하는 관계에서 받는 법을 익히는 게 이번 생의 숙제야.",
    식상: "관계에서 내가 앞장서 이끌고 분위기를 책임지는 패턴을 반복해. 가족 안에서 '내가 나서야 굴러간다'고 몸에 밴 방식이 지금도 따라와. 그 패턴을 내려놓는 순간, 남에게 맡기고 기대는 편안함도 알게 돼. 안 끌어도 관계는 굴러간다는 걸 믿는 연습이 필요해.",
    비겁: "관계에서 지지 않으려 하고 주도권을 두고 힘겨루기하는 패턴을 반복해. 가족 안에서 '내 몫은 내가 지킨다'고 몸에 밴 방식이 지금도 따라와. 그 패턴을 알아차리는 순간, 이겨야만 하는 게 아니란 걸 알게 돼. 힘을 빼고 그냥 함께 있는 법을 배우는 게 관건이야.",
    재성: "관계에서 상대를 챙기고 은근히 통제하려는 패턴을 반복해. 가족 안에서 '내가 관리해야 안심된다'고 몸에 밴 방식이 지금도 따라와. 그 패턴을 알아차리는 순간, 놓아줘도 관계가 무너지지 않는다는 걸 알게 돼. 통제하지 않아도 관계는 지켜진다는 믿음이 이번 생의 숙제야.",
  })

  // 인간관계 상세
  const relGuardian = yongsinA ? `${yongsinD} 기운을 가진 사람이 귀인이야. 이 에너지가 나를 살려. 직관적으로 편한 사람, 같이 있으면 뭔가 잘 풀리는 사람이 그 타입이야.` : ""
  // 귀인/독을 구체적 분위기·성격으로 (오행 이름 대신 사람 묘사)
  const _guardianByYong = {
    "목": "새로운 걸 시작하게 밀어주는 사람이야. 옆에 있으면 자꾸 뭔가 벌이고 싶어지고, 게을러질 틈을 안 줘. 활기차고 아이디어가 많은, 봄기운 같은 사람",
    "화": "곁에 있으면 기분이 밝아지는 사람이야. 표현이 시원시원하고 정이 많아서, 위축됐을 때 끌어올려 줘. 사교적이고 따뜻한, 햇살 같은 사람",
    "토": "말없이 든든하게 받쳐주는 사람이야. 요란하진 않아도 약속을 지키고, 흔들릴 때 중심을 잡아줘. 진중하고 믿음직한, 큰 산 같은 사람",
    "금": "칼같이 정리해주는 사람이야. 우유부단할 때 결단을 내려주고, 아닌 건 아니라고 말해줘. 원칙 있고 깔끔한, 서늘하지만 신뢰 가는 사람",
    "수": "속을 알아주는 사람이야. 말 안 해도 분위기를 읽고, 지혜롭게 방향을 짚어줘. 조용하고 깊은, 물 같은 사람",
  }
  const _poisonByGi = {
    "목": "자꾸 일을 벌여놓고 수습을 떠넘기는 사람이야. 처음엔 활기차 보이는데 같이 있으면 내가 뒷정리만 하게 돼. 산만하고 벌이기만 하는 사람",
    "화": "감정 기복으로 주변을 휘두르는 사람이야. 화려하고 재밌는데, 곁에 오래 있으면 내 에너지가 다 타버려. 자극적이고 소모적인 사람",
    "토": "고집으로 꽉 막힌 사람이야. 안정적으로 보이지만 변화를 거부해서, 같이 있으면 나까지 정체돼. 답답하고 무겁게 누르는 사람",
    "금": "날 선 말로 상처 주는 사람이야. 맞는 말인데 정 없이 찔러서, 옆에 있으면 자꾸 위축돼. 차갑고 비판적인 사람",
    "수": "속을 알 수 없는 사람이야. 잡힐 듯 안 잡히고 말이 자주 바뀌어서, 함께면 내가 계속 불안해져. 종잡을 수 없고 일관성 없는 사람",
  }
  const _yongFirst = (yongsinA || "").split("·")[0]
  const _giFirst = (gisinA || "").split("·")[0]
  const guardianDetailText = _yongFirst
    ? `${_guardianByYong[_yongFirst] || "곁에 있으면 이유 없이 편하고 일이 잘 풀리는 사람이야"}. 만나고 나면 이상하게 기운이 나고 막힌 게 뚫려. 그런 사람을 만나면 놓치지 마.`
    : "곁에 있으면 이유 없이 편하고 일이 잘 풀리는 사람이 귀인이야. 만나고 나면 기운이 나는 사람, 그게 귀인이야."
  const poisonDetailText = _giFirst
    ? `${_poisonByGi[_giFirst] || "같이 있으면 이유 없이 지치는 사람이야"}. 나쁜 사람이라는 게 아니야. 유독 나랑은 기운이 안 맞아서, 가까이 둘수록 내가 소모돼.`
    : "유독 나랑 기운이 안 맞아서 같이 있으면 지치는 사람이 있어. 나쁜 사람이 아니라 결이 안 맞는 거야. 적당한 거리를 둬."
  const relPoison = gisinA ? `일이든 모임이든 ${gisinD} 기운이 센 사람 곁에 오래 있으면 이유 없이 진이 빠져. 그 사람이 나빠서가 아니라 에너지 파장이 어긋나는 거야. 손절까지는 아니어도, 그런 사람과는 일정한 거리와 내 속도를 지키는 게 나를 소모하지 않는 법이야.` : "유독 나랑 결이 안 맞아 곁에 있으면 진이 빠지는 사람이 있어. 나빠서가 아니라 파장이 어긋나는 거라, 적당한 거리를 지키는 게 나를 지키는 길이야."
  // 직장(공적)과 친구(사적) 모습 — 서로 다른 각도로
  const relWorkFace = `${dayMask || dayImp || "처음엔 다가가기 어려운 인상을 줘."} 공적인 자리에서는 감정을 잘 안 드러내고, 맡은 몫을 확실히 해내는 사람으로 보여.`
  const relFriendFace = isSingang
    ? "편한 사람들 앞에서는 완전히 다른 스위치가 켜져. 눌러뒀던 장난기랑 에너지가 그대로 터져 나와서, 분위기를 주도하고 판을 이끄는 쪽이야. 좋아하는 사람한텐 화끈하게 챙겨."
    : "밖에서는 무던하고 있는 듯 없는 듯한데, 진짜 편한 사람 앞에서만 스위치가 켜져. 시답잖은 농담에 제일 크게 웃고, 응석도 어리광도 그제야 나와. 아는 친구들은 '알고 보면 제일 웃긴 애'라고 해."

  const yearDetail = yearForecast.slice(0, 5).map(y => {
    const score = y.score || 0
    const areas = y.areas || {}
    const areaStr = Object.entries(areas).map(([k,v]) => `${k} ${v}점`).join(" / ")
    return `${y.year}년 종합 ${score}점\n${areaStr}\n${mug(y.summary || "")}`
  }).join("\n\n")

  // 유료 사주 요약 (동서양종합1) — 공통 3문장 + 일간풀이 2문장(경계면 표준/한밤 각 2문장, 총 7 / 아니면 5)
  const _sajuCommon3 = [
    `이 사주는 ${OHK_KR[dominant] || dominant} 기운이 가장 강한 구조야.`,
    _jaeStruct === "편재" ? "재성 중에서도 편재가 두드러져서, 큰돈이 오가는 배포를 타고났어."
      : _jaeStruct === "정재" ? "정재가 뚜렷해서, 꾸준히 쌓아가는 재물 감각을 타고났어."
      : _jaeStruct === "과다" ? "재성이 넘칠 만큼 많아서, 기회는 많은데 관리가 관건인 구조야."
      : _jaeStruct === "없음" ? "재성은 약한 대신, 실력과 자리로 승부하는 구조야."
      : "재성이 균형 잡혀 있어서, 상황에 따라 유연하게 대응하는 구조야.",
  ].join(" ")
  const _take2Sent = (str) => (str || "").split(/(?<=[.?!])\s+/).filter(Boolean).slice(0, 1)
  // 물상풀이(ILJU_CHAR) 대신 신강/신약 기반 기질 텍스트 사용 — 사주분석 페이지의 "일주 분석"과 중복 방지
  const _stdIlganKo = d.pillars?.[2]?.gan?.ko || _ilganKo
  const _midIlganKo = isBnd ? (d.pillarsB?.[2]?.gan?.ko || _stdIlganKo) : null
  const _traitOf = (ilganKo) => {
    const gd = ILGAN_DESC[ilganKo] || {}
    return mug(isSingang ? (gd.strong || gd.core || "") : (gd.weak || gd.core || ""))
  }
  const _std2 = _take2Sent(_traitOf(_stdIlganKo))
  const _mid2 = isBnd ? _take2Sent(_traitOf(_midIlganKo)) : []
  const sajuYoyakText = isBnd
    ? `${_sajuCommon3} ${bnd.stdIlju ? bnd.stdIlju + " 쪽으로 보면, " : ""}${_std2.join(" ")} ${bnd.midIlju ? bnd.midIlju + " 쪽으로 보면, " : ""}${_mid2.join(" ")}`.trim()
    : `${_sajuCommon3} ${_std2.join(" ")}`.trim()

  const _sibsongTop1 = d.sibsongAnalysis?.top?.[0]
  const _sinsalDayItem = (d.sinsal12 || []).find(s => s.label === "일") || (d.sinsal12 || [])[2]
  const _unseongDayItem = (d.unseong12 || []).find(s => s.label === "일") || (d.unseong12 || [])[2]
  const _SIBSONG_MOOD = {
    비견: "내 힘으로 밀고 나가려는 마음", 겁재: "지지 않고 앞서려는 마음",
    식신: "즐기면서 표현하려는 마음", 상관: "틀을 깨고 드러내려는 마음",
    편재: "기회를 잡고 판을 키우려는 마음", 정재: "차곡차곡 쌓고 지키려는 마음",
    편관: "부딪히며 돌파하려는 마음", 정관: "책임지고 자리를 지키려는 마음",
    편인: "낯선 것을 배우려는 마음", 정인: "익숙한 것을 채우려는 마음",
  }
  const _SINSAL_SPEED = {
    월살: "노력한 티는 늦게 나는 스타일이야", 화개살: "노력한 티는 늦게 나는 스타일이야",
    육해살: "노력한 티는 늦게 나는 스타일이야", 천살: "노력한 티는 늦게 나는 스타일이야",
    역마살: "결과가 바로바로 드러나는 스타일이야", 장성살: "결과가 바로바로 드러나는 스타일이야",
    망신살: "결과가 바로바로 드러나는 스타일이야", 겁살: "결과가 바로바로 드러나는 스타일이야",
    지살: "꾸준히 쌓이면서 가는 스타일이야", 연살: "꾸준히 쌓이면서 가는 스타일이야",
    반안살: "꾸준히 쌓이면서 가는 스타일이야", 재살: "꾸준히 쌓이면서 가는 스타일이야",
  }
  const _UNSEONG_PHASE = {
    절: ["이제 막 준비하는 때야", "지금은 시작하고, 조금씩 만들어가면 돼"],
    태: ["이제 막 준비하는 때야", "지금은 시작하고, 조금씩 만들어가면 돼"],
    양: ["이제 막 준비하는 때야", "지금은 시작하고, 조금씩 만들어가면 돼"],
    장생: ["한창 자라나는 때야", "지금은 키우고, 시간이 지날수록 단단해져"],
    목욕: ["한창 자라나는 때야", "지금은 키우고, 시간이 지날수록 단단해져"],
    관대: ["한창 자라나는 때야", "지금은 키우고, 시간이 지날수록 단단해져"],
    건록: ["제일 크게 펼칠 때야", "지금은 펼치고, 최대한 크게 가져가면 돼"],
    제왕: ["제일 크게 펼칠 때야", "지금은 펼치고, 최대한 크게 가져가면 돼"],
    쇠: ["잠시 쉬어가며 정리할 때야", "지금은 쉬고, 다음 기회를 준비하면 돼"],
    병: ["잠시 쉬어가며 정리할 때야", "지금은 쉬고, 다음 기회를 준비하면 돼"],
    사: ["잠시 쉬어가며 정리할 때야", "지금은 쉬고, 다음 기회를 준비하면 돼"],
    묘: ["아끼면서 기초를 다질 때야", "지금은 다지고, 나중에 크게 온다"],
  }
  const _sibsongKey = _sibsongTop1?.key || _sibsongTop1?.label
  const _sinsalName = (_sinsalDayItem?.name || "").replace(/\(.*\)/, "").trim()
  const _unseongStage = (_unseongDayItem?.stage || "").replace(/\(.*\)/, "").trim()
  const _mood = _SIBSONG_MOOD[_sibsongKey] || "기회를 잡고 판을 키우려는 마음"
  const _speed = _SINSAL_SPEED[_sinsalName] || "꾸준히 쌓이면서 가는 스타일이야"
  const _phase = _UNSEONG_PHASE[_unseongStage] || ["아끼면서 기초를 다질 때야", "지금은 다지고, 나중에 크게 온다"]
  const sajuSummaryText = `이 사주는 ${_mood}이 제일 강해. ${_speed}. 지금은 ${_phase[0]}. 결국 하나야. ${_phase[1]}.`

  const TEMPO_BY_SIGN = {
    양자리: "양자리는 불 원소에 활동궁이 겹친 별자리야. 생각과 동시에 몸이 움직여서, 망설임 없이 시작하는 추진력이 남달라. 다만 지속력이 부족해지니 끝까지 챙기는 습관이 필요해.",
    황소자리: "황소자리는 흙 원소에 고정궁이 겹친 별자리야. 현실적인 감각과 지속하는 힘이 동시에 있어, 시간이 걸려도 반드시 성과를 만들어내는 뚝심이 있어.",
    쌍둥이자리: "쌍둥이자리는 바람 원소에 변동궁이 겹친 별자리야. 소통하는 힘과 적응하는 힘이 동시에 있어, 여러 가지를 동시에 굴리면서도 안 지치는 순발력이 있어.",
    게자리: "게자리는 물 원소에 활동궁이 겹친 별자리야. 감정적인 섬세함과 시작하는 힘이 동시에 있어, 마음이 가는 곳에 망설임 없이 다가가는 힘이 있어.",
    사자자리: "사자자리는 불 원소에 고정궁이 겹친 별자리야. 강렬함과 지속하는 힘이 동시에 있어, 한번 마음먹은 걸 화려하게 그리고 끝까지 밀어붙여.",
    처녀자리: "처녀자리는 흙 원소에 변동궁이 겹친 별자리야. 실속을 챙기는 힘과 유연하게 대응하는 힘이 동시에 있어, 디테일을 놓치지 않으면서도 빠르게 수정해.",
    천칭자리: "천칭자리는 바람 원소에 활동궁이 겹친 별자리야. 조율하는 힘과 시작하는 힘이 동시에 있어, 갈등이 생기기 전에 먼저 나서서 관계를 정리하는 감각이 있어.",
    전갈자리: "전갈자리는 물 원소에 고정궁이 겹친 별자리야. 깊이 있는 통찰과 지속하는 힘이 동시에 있어, 한번 몰입한 건 끝까지 파고드는 집중력이 있어.",
    사수자리: "사수자리는 불 원소에 변동궁이 겹친 별자리야. 열정적인 힘과 유연한 힘이 동시에 있어, 새로운 걸 향해 나아가면서도 방향을 바꾸는 유연함이 있어.",
    염소자리: "염소자리는 흙 원소에 활동궁이 겹친 별자리야. 결과를 내는 힘과 시작하는 힘이 동시에 있어, 벌인 일을 실제로 완성까지 끌고 가는 추진력이 남달라.",
    물병자리: "물병자리는 바람 원소에 고정궁이 겹친 별자리야. 독창적인 발상과 지속하는 힘이 동시에 있어, 남들과 다른 길을 택해도 흔들리지 않고 끝까지 밀고 가.",
    물고기자리: "물고기자리는 물 원소에 변동궁이 겹친 별자리야. 섬세한 공감력과 유연한 적응력이 동시에 있어, 주변 분위기를 빠르게 읽고 자연스럽게 스며드는 힘이 있어.",
  }
  const tempoText = TEMPO_BY_SIGN[sunSign] || ""

  // ★ 데칸 (Decan) — 별자리 3등분, 같은 원소의 다른 별자리 영향
  const SIGN_TRAIT_SHORT = {
    양자리: "망설임 없이 먼저 움직이는 추진력", 황소자리: "현실적인 감각으로 끝까지 밀고 나가는 뚝심",
    쌍둥이자리: "빠르게 정보를 주고받는 순발력", 게자리: "감정을 먼저 살피는 섬세함",
    사자자리: "존재감을 강하게 드러내는 힘", 처녀자리: "디테일을 놓치지 않는 꼼꼼함",
    천칭자리: "관계의 균형을 맞추는 감각", 전갈자리: "한번 몰입하면 끝까지 파고드는 집중력",
    사수자리: "새로운 걸 향해 거침없이 나아가는 열정", 염소자리: "목표를 향해 묵묵히 쌓아가는 책임감",
    물병자리: "남다른 발상으로 독창적인 길을 가는 힘", 물고기자리: "주변 분위기를 빠르게 읽는 공감력",
  }
  const decan = a.decan || {}
  const decanText = sunSign && decan.num ? (
    decan.num === 1
      ? `${sunSign} 1데칸은 ${sunSign} 기운이 순도 100%로 실린 구간이야. ${SIGN_TRAIT_SHORT[sunSign] || ""}이 다른 데칸보다 훨씬 진하게 나타나. 같은 ${sunSign}여도 이 구간에서 태어난 사람이 그 별자리다운 색깔을 제일 강하게 띠어. 장점도 약점도 더 또렷하게 드러나는 구조야.`
      : `${sunSign} ${decan.num}데칸은 ${sunSign}에 ${decan.influenceSign} 기운이 섞인 구간이야. 기본 바탕엔 ${SIGN_TRAIT_SHORT[sunSign] || ""}이 깔려있고, 거기에 ${SIGN_TRAIT_SHORT[decan.influenceSign] || ""}이 더해져. 평소엔 ${sunSign}답게 행동하다가도, 결정적인 순간이나 압박이 오면 ${decan.influenceSign}의 기질이 불쑥 튀어나오는 식으로 나타나.`
  ) : ""

  // ★ 문페이즈 (달의 위상) — 태어날 때 감정 사이클의 시작점
  const MOONPHASE_TEXT = {
    신월: "태어난 날이 신월이야. 새로운 사이클이 막 시작되는 지점에서 태어났다는 뜻이야. 뭔가를 처음부터 개척하고 시작하는 데 타고난 감각이 있어. 아무것도 없는 상태에서 씨앗을 심는 역할이 잘 맞고, 남이 만들어둔 길보다 스스로 판을 짜는 쪽에서 힘을 발휘해.",
    초승달: "태어난 날이 초승달이야. 의도가 막 싹트기 시작하는 지점에서 태어났다는 뜻이야. 확신이 없어도 일단 움직이면서 방향을 잡아가는 타입이야. 완벽한 계획을 기다리기보다, 작게라도 시작하고 부딪히면서 배우는 게 이 사이클의 힘이야.",
    상현달: "태어난 날이 상현달이야. 결단을 내리고 행동으로 옮기는 지점에서 태어났다는 뜻이야. 갈등이나 장애물 앞에서 오히려 힘이 나는 타입이라, 위기가 닥쳐야 진짜 실력이 나와. 망설이는 시간보다 부딪혀서 뚫는 시간이 더 잘 맞아.",
    상현망: "태어난 날이 상현망이야. 만들어온 걸 다듬고 조정하는 지점에서 태어났다는 뜻이야. 처음 세운 계획을 현실에 맞게 수정하고 보완하는 감각이 좋아. 완벽하게 시작 못 했어도, 가는 길에 계속 손보면서 결국 완성해내는 힘이 있어.",
    보름달: "태어난 날이 보름달이야. 그동안 쌓아온 게 드러나고 완성되는 지점에서 태어났다는 뜻이야. 결과와 성과가 눈에 보이는 순간에 특히 강한 타입이야. 감정도 사건도 극적으로 차오르는 경향이 있어서, 삶의 굴곡이 뚜렷하게 느껴질 수 있어.",
    하현망: "태어난 날이 하현망이야. 얻은 걸 나누고 세상에 돌려주는 지점에서 태어났다는 뜻이야. 혼자만 쌓아두기보다 가르치고 나누는 데서 의미를 찾는 타입이야. 경험을 정리해서 남에게 전달하는 역할이 자연스럽게 따라와.",
    하현달: "태어난 날이 하현달이야. 놓아주고 다시 평가하는 지점에서 태어났다는 뜻이야. 안 맞는 걸 붙잡고 있기보다 정리하고 돌아서는 결단력이 있어. 위기 상황에서 미련 없이 방향을 트는 게 오히려 이 사이클의 강점이야.",
    그믐달: "태어난 날이 그믐달이야. 한 사이클이 끝나고 다음을 준비하는 지점에서 태어났다는 뜻이야. 조용히 물러나 있는 시간 속에서 다음 판을 그리는 타입이야. 겉으로 드러나는 활동보다, 안 보이는 데서 준비하는 힘이 훨씬 강해.",
  }
  const moonPhaseText = MOONPHASE_TEXT[a.moonPhase] || ""

  // ★ 역행행성 (수성/금성/화성) — 서비스 초기 타겟 연령대(1966~2006년생)만 노출, 정밀 궤도계산 기반
  const _retroBirthYear = d.birthYear
  const _showRetro = _retroBirthYear && _retroBirthYear >= 1966 && _retroBirthYear <= 2006
  const RETRO_TEXT = {
    수성: { true: "태어날 때 수성이 역행 중이었어. 남들과 다른 방식으로 생각하고 표현하는 타입이야. 말보다 글이 편하거나, 생각을 정리하는 데 시간이 좀 더 필요한 편이야. 대신 한번 정리된 생각은 남들이 못 본 각도에서 나와.",
      false: "태어날 때 수성이 순행 중이었어. 생각한 걸 바로바로 말이나 글로 옮기는 데 능숙한 타입이야. 소통이 막힘없이 흘러가는 편이라, 정보를 주고받고 사람을 연결하는 역할에서 편안함을 느껴." },
    금성: { true: "태어날 때 금성이 역행 중이었어. 사랑과 관계를 남들과 다른 방식으로 이해하는 타입이야. 첫인상보다 시간을 들여 진짜를 알아보는 편이고, 관계에 대한 자기만의 기준이 뚜렷해. 흔한 방식이 안 맞는다고 느꼈다면 이유가 있었던 거야.",
      false: "태어날 때 금성이 순행 중이었어. 사랑과 관계를 자연스럽고 무난하게 풀어가는 타입이야. 호감을 표현하고 관계를 맺는 흐름이 비교적 매끄럽고, 사회적으로 무난하게 받아들여지는 방식으로 사랑을 주고받아." },
    화성: { true: "태어날 때 화성이 역행 중이었어. 추진력과 화를 표현하는 방식이 남들과 달라. 겉으로 바로 터뜨리기보다 안에서 오래 눌러뒀다가 예상 못한 순간에 터지는 편이야. 자기만의 속도로 움직여야 진짜 힘이 나오는 타입이야.",
      false: "태어날 때 화성이 순행 중이었어. 하고 싶은 걸 바로 행동으로 옮기는 데 거침이 없는 타입이야. 화나 욕구를 숨기지 않고 그때그때 표현하는 편이라, 감정이 오래 쌓이지 않는 대신 즉흥적으로 부딪히는 경우가 있어." },
  }
  const retro = a.retrograde || {}
  const spouseTypeText = (sunSign && decan.num) ? (() => {
    const isVenusRetro = !!(retro && retro.금성)
    const venusPart = isVenusRetro ? "천천히 알아갈수록 깊어지는 사람에게 끌려" : "첫인상에서 바로 끌리는 사람에게 마음이 열려"
    return `동양 사주가 가리키는 배우자 자리는 ${_spouseEastLabel.key}형, ${_spouseEastLabel.desc} 짝이야. 여기에 서양 점성을 겹쳐보면, 금성이 ${isVenusRetro ? "역행" : "순행"} 중에 태어나 ${venusPart}. 결국 ${_spouseEastLabel.desc} 사람에게 자연스럽게 끌리는 쪽으로 동양과 서양이 같은 결론을 가리켜.`
  })() : ""

  // ★ 각 파트(재물운·연애운·애정운·직장운·취업운·관계운·건강운·가족운·평생운)용 서양점성 확장 페이지
  // 데칸/문페이즈/역행행성은 "동서양 종합 4"와 같은 데이터를 쓰되, 카테고리 관점의 짧은 해석으로 재구성 (70~150자)
  const _josa = (word, withBatchim, noBatchim) => {
    if (!word) return noBatchim
    const code = word.charCodeAt(word.length - 1) - 0xAC00
    if (code < 0 || code > 11171) return noBatchim
    return (code % 28) !== 0 ? withBatchim : noBatchim
  }
  const MOONPHASE_SHORT = {
    신월: "새로운 사이클을 처음부터 개척하는 힘", 초승달: "확신 없이도 일단 움직이며 방향을 잡는 힘",
    상현달: "갈등과 장애물 앞에서 오히려 힘이 나는 뚝심", 상현망: "세운 계획을 현실에 맞게 다듬고 보완하는 감각",
    보름달: "쌓아온 것이 눈에 보이게 드러나는 힘", 하현망: "얻은 걸 나누고 세상에 돌려주는 힘",
    하현달: "미련 없이 정리하고 방향을 트는 결단력", 그믐달: "보이지 않는 곳에서 다음을 준비하는 힘",
  }
  const RETRO_SHORT = {
    수성: { true: "생각과 말을 정리하는 방식이 남들과 다른 타입이야", false: "생각을 바로바로 말과 글로 옮기는 편이라 소통이 막힘없어" },
    금성: { true: "사랑과 관계를 자기만의 기준과 속도로 천천히 이해하는 타입이야", false: "호감과 관계를 무난하고 자연스럽게 풀어가는 타입이야" },
    화성: { true: "추진력과 화를 안에서 눌렀다 한번에 터뜨리는 타입이야", false: "하고 싶은 걸 망설임 없이 바로 행동으로 옮기는 타입이야" },
  }
  const CATEGORY_DECAN_SUFFIX = {
    재물운: "이 기질 그대로 돈 버는 방식과 투자 판단에 드러나. 과감하게 베팅할지 신중하게 굴지가 이 기질 하나로 갈려.",
    연애운: "이 기질 그대로 마음을 여는 방식에 드러나. 먼저 다가갈지 기다릴지가 이 기질에서 결정 나.",
    애정운: "관계 안에서도 이 기질이 그대로 나와. 갈등이 생겼을 때 먼저 손 내미는지 아닌지가 여기서 갈려.",
    직장운: "일하는 스타일에서 이 기질이 제일 뚜렷해. 지시를 기다리는지 먼저 나서는지가 이 기질로 갈려.",
    취업운: "면접이나 자기 PR에서 이 기질이 강점이 돼. 자기소개서에도 이 기질을 앞세우면 먹혀.",
    관계운: "사람을 대하는 태도에 이 기질이 배어있어. 낯선 자리에서 먼저 말을 거는지 지켜보는지가 갈려.",
    건강운: "몸과 마음을 돌보는 방식에도 이 기질이 반영돼. 스트레스를 몸으로 푸는지 생각으로 삭이는지가 여기서 갈려.",
    가족운: "가족 안에서 맡는 역할에 이 기질이 묻어나. 집안 대소사를 이끄는지 따르는지가 이 기질로 갈려.",
    평생운: "평생 반복되는 선택의 패턴이 여기서 나와. 진로든 관계든, 갈림길마다 이 기질이 무의식중에 방향을 정해줘. 그걸 의식하고 쓰느냐가 평생의 성패를 가르는 지점이야.",
  }
  const CATEGORY_MOON_SUFFIX = {
    재물운: "돈을 벌고 쓰는 타이밍 감각이 여기서 나와. 돈이 들어올 때 바로 쓰는지 묵히는지도 이 리듬과 연결돼.",
    연애운: "마음을 여는 타이밍이 이 리듬을 따라가. 관계 초반에 빨리 뜨거워지는지 천천히 데워지는지도 이 리듬이야.",
    애정운: "관계가 깊어지는 속도가 이 리듬과 닮아있어. 권태기가 왔을 때 회복하는 속도도 이 리듬을 따라가.",
    직장운: "일을 벌이고 마무리하는 타이밍이 이 흐름이야. 새 프로젝트를 시작하는 타이밍도 이 리듬에 맞추는 게 유리해.",
    취업운: "도전하고 준비하는 타이밍이 이 리듬을 따라. 지원서를 내는 타이밍도 이 리듬이 맞을 때 결과가 좋아.",
    관계운: "사람과 가까워지고 멀어지는 리듬이 여기서 나와. 모임에서 먼저 다가가는지 기다리는지도 이 리듬을 따라.",
    건강운: "컨디션을 회복하는 리듬이 이와 비슷해. 몸이 힘들 때 바로 쉬는지 참고 버티는지도 이 리듬과 닮아있어.",
    가족운: "가족과 거리를 조절하는 리듬이 여기서 나와. 명절이나 모임에서 먼저 연락하는지도 이 리듬을 따라.",
    평생운: "인생의 큰 전환점들이 이 리듬을 타고 와. 새로운 국면이 열리기 직전엔 늘 이 감정의 결이 먼저 신호를 보내니, 그 낌새를 알아채는 사람이 흐름을 놓치지 않아.",
  }
  const CATEGORY_RETRO_SUFFIX = {
    재물운: { 수성: "돈 얘기는 신중하게, 결정은 확실하게 해. 계약서는 두 번 읽고 서명해.", 금성: "소비도 자기만의 기준으로 확실하게 결정해. 충동구매 전에 하루만 묵혀봐.", 화성: "투자 타이밍은 한 박자 늦게 잡는 편이 나아. 급등할 때일수록 한 박자 쉬어가." },
    연애운: { 수성: "고백이나 표현보다 행동으로 마음을 보여줘. 문자보다 직접 만나서 얘기할 때 진심이 더 잘 전해져.", 금성: "쉽게 안 끌리는 대신 한번 빠지면 깊어. 소개팅보다 자연스러운 만남에서 인연이 더 잘 풀려.", 화성: "적극적인 어필보다 은근한 신호가 편해. 좋아하는 티는 서서히 내는 게 잘 맞아." },
    애정운: { 수성: "싸워도 바로 말하기보다 곱씹은 뒤에 풀어. 문자로 오해가 생기면 만나서 얘기로 풀어야 해.", 금성: "권태기가 와도 자기만의 방식으로 극복해나가. 이벤트보다 꾸준한 대화가 더 효과적이야.", 화성: "서운함을 쌓아두다 한번에 터뜨리지 않게 조심해. 그날그날 짧게라도 말해두는 게 안전해." },
    직장운: { 수성: "보고나 발표는 미리 정리해두는 게 안전해. 중요한 지시는 한 번 더 확인하고 움직여.", 금성: "동료 관계는 서두르지 않고 천천히 쌓아. 회식보다 업무로 신뢰를 먼저 쌓는 편이 잘 맞아.", 화성: "화가 나도 바로 티내기보다 정리해서 표현해. 하루 묵혔다가 얘기하는 게 안전해." },
    취업운: { 수성: "자기소개서는 여러 번 다듬을수록 강점이 살아. 면접 답변도 리허설할수록 자연스러워져.", 금성: "면접관과의 궁합보다 준비된 내용으로 승부해. 첫인상보다 포트폴리오가 더 강한 무기야.", 화성: "불합격에 낙담하기보다 다음 기회로 에너지를 모아. 탈락 이유를 분석하는 데 힘을 써." },
    관계운: { 수성: "오해가 생기면 글로 정리해서 풀어가는 게 나아. 중요한 얘기는 메시지로 남겨둬.", 금성: "친해지는 데 시간이 걸려도 관계는 오래가. 첫 만남보다 두세 번째 만남에서 진짜 매력이 드러나.", 화성: "서운함을 참다 갑자기 거리 두지 않게 조심해. 화가 쌓이기 전에 짧게라도 표현해." },
    건강운: { 수성: "스트레스는 말보다 글로 풀어내는 게 도움 돼. 일기나 메모로 감정을 정리하는 습관을 들여.", 금성: "몸을 아끼는 방식도 남들과 다르게 스스로 찾아. 남들 다 하는 운동법보다 내 몸에 맞는 방식을 찾아야 해.", 화성: "화를 참는 습관이 몸에 쌓이지 않게 풀어줘야 해. 격한 운동으로 정기적으로 풀어줘." },
    가족운: { 수성: "가족과는 대화보다 행동으로 마음을 표현하는 편이야. 서운한 말도 문자로 남기면 더 잘 전달될 때가 있어.", 금성: "가족애를 표현하는 속도가 남들보다 느릴 뿐이야. 명절 인사도 늦더라도 진심이면 충분해.", 화성: "쌓인 서운함이 갑자기 터지지 않게 미리 풀어. 명절마다 쌓인 감정은 그때그때 짧게라도 얘기해." },
    평생운: { 수성: "평생 남다른 관점으로 생각하고 표현하며 살아가. 남들이 뻔하다고 여기는 걸 다르게 보는 눈이, 나이가 들수록 오히려 더 큰 자산이 돼.", 금성: "평생 자기만의 속도로 사랑하고 관계 맺어. 남과 비교하며 조급해하지 않는 게, 결국 오래가는 관계를 만드는 이 사주의 힘이야.", 화성: "평생 눌러뒀던 힘이 결정적 순간 크게 터져. 평소엔 잠잠하다가도, 정말 중요한 고비에서 폭발적인 뒷심을 내는 게 이 기질의 진짜 무기야." },
  }
  // 카테고리별로 실제 연관성 있는 요소만 골라 보여줌 (전 카테고리에 데칸+문페이즈+역행 3종 풀세트를 반복하면
  // "복사-붙여넣기 양판형"으로 느껴지는 문제가 있어, 카테고리 성격에 맞는 1~2개 요소만 선별)
  const CATEGORY_ASTRO_ELEMENTS = {
    재물운: ["decan", "moon"],
    연애운: ["moon", "금성"],
    애정운: ["금성", "decan"],
    직장운: ["decan", "수성"],
    취업운: ["수성", "화성"],
    관계운: ["수성", "금성"],
    건강운: ["moon", "화성"],
    가족운: ["decan", "moon"],
    평생운: ["decan", "moon", "수성", "금성", "화성"],
  }
  // 카테고리별 데칸 오프닝 — 기존엔 문장 골격이 같고 마지막 문장만 바뀌어 "돌려막기"로 보이는 문제가 있었음.
  // 이제 카테고리마다 첫 문장부터 아예 다른 문장으로 시작하도록 재작성함 (2026-07-27).
  const CATEGORY_DECAN_OPEN = {
    재물운: "돈을 대하는 태도부터 태어난 순간의 별자리 자리, 데칸에 새겨져 있어.",
    애정운: "연애할 때 드러나는 색깔은 별자리 안에서도 한 번 더 갈려. 그 갈림의 정체가 데칸이야.",
    직장운: "일할 때 나오는 태도는 별자리보다 한 단계 더 들어간 데칸에서 갈려.",
    가족운: "가족 안에서 맡는 역할까지도 태어난 순간의 데칸이 미리 정해놓은 셈이야.",
    평생운: "평생 반복되는 선택의 결은 데칸에서부터 이미 시작돼.",
  }
  const CATEGORY_MOON_OPEN = {
    재물운: "돈을 벌고 쓰는 리듬부터 태어난 날 밤하늘의 달 위상에 새겨져 있어.",
    연애운: "마음이 열리는 속도는 사실 태어난 날의 달 모양에서 이미 정해졌어.",
    건강운: "몸이 지치고 회복되는 리듬도 태어난 날의 달 위상에서 갈려.",
    가족운: "가족과 거리를 두고 좁히는 리듬은 태어난 날의 달 위상과 닮아있어.",
    평생운: "인생의 전환점을 알아채는 감각은 태어난 날의 달 위상에서 시작돼.",
  }
  const CATEGORY_RETRO_OPEN = {
    연애운: "연애 스타일의 숨은 결은 행성의 순행, 역행에서 갈려.",
    애정운: "관계에서 반복되는 습관은 태어날 때 행성이 어느 방향으로 돌고 있었는지에서 나와.",
    직장운: "일하는 방식의 미세한 차이는 태어날 때 행성의 순행, 역행에서 갈려.",
    취업운: "면접과 도전 앞에서 나오는 태도는 행성의 순행, 역행에 이미 새겨져 있어.",
    관계운: "사람을 대할 때 습관은 태어날 때 행성이 어느 방향으로 돌고 있었는지와 이어져.",
    건강운: "몸과 감정을 다루는 방식은 태어날 때 행성의 순행, 역행에서도 갈려.",
    평생운: "평생 가는 습관의 뿌리는 태어날 때 행성이 어느 방향으로 돌고 있었는지에 있어.",
  }
  const buildCategoryAstroBlocks = (category) => {
    const dSuf = CATEGORY_DECAN_SUFFIX[category], mSuf = CATEGORY_MOON_SUFFIX[category], rSuf = CATEGORY_RETRO_SUFFIX[category]
    const catDecanBody = sunSign && decan.num ? (
      decan.num === 1
        ? `${sunSign} 1데칸은 ${sunSign} 기운이 순도 100%로 실린 구간이라 ${SIGN_TRAIT_SHORT[sunSign]}${_josa(SIGN_TRAIT_SHORT[sunSign], "이", "가")} 유난히 강하게 나타나. ${dSuf}`
        : `${sunSign} ${decan.num}데칸은 ${decan.influenceSign} 기운이 섞여 ${SIGN_TRAIT_SHORT[sunSign]}에 ${SIGN_TRAIT_SHORT[decan.influenceSign]}까지 더해진 구간이야. ${dSuf}`
    ) : ""
    const catMoonBody = MOONPHASE_SHORT[a.moonPhase]
      ? `태어난 날이 ${a.moonPhase}이야. 태생적으로 ${MOONPHASE_SHORT[a.moonPhase]}${_josa(MOONPHASE_SHORT[a.moonPhase], "을", "를")} 감정의 리듬으로 타고났어. ${mSuf}`
      : ""
    const catRetroBody = (planet) => {
      if (!_showRetro) return ""
      const isR = String(!!retro[planet])
      return `태어날 때 ${planet}이 ${isR === "true" ? "역행" : "순행"} 중이었어. ${RETRO_SHORT[planet][isR]}. ${rSuf[planet]}`
    }
    const elements = CATEGORY_ASTRO_ELEMENTS[category] || ["decan", "moon"]
    let retroOpenUsed = false
    return elements.map((el) => {
      if (el === "decan") return catDecanBody ? { h: `데칸, ${sunSign} ${decan.num}데칸`, text: `${CATEGORY_DECAN_OPEN[category] || ""} ${catDecanBody}`, accent: C.iris } : null
      if (el === "moon") return catMoonBody ? { h: `문페이즈, ${a.moonPhase}`, text: `${CATEGORY_MOON_OPEN[category] || ""} ${catMoonBody}`, accent: C.iris } : null
      if (!_showRetro) return null
      const body = catRetroBody(el)
      if (!body) return null
      const open = retroOpenUsed ? "" : (CATEGORY_RETRO_OPEN[category] || "")
      retroOpenUsed = true
      return { h: el, text: open ? `${open} ${body}` : body, accent: C.iris }
    }).filter(Boolean)
  }
  const CATEGORY_EXT_META = {
    재물운: { title: "우주가 보는\n돈의 감각.", accentKey: "sand" },
    연애운: { title: "우주가 보는\n마음이 열리는 방식.", accentKey: "lavender" },
    애정운: { title: "우주가 보는\n관계의 결.", accentKey: "lavender" },
    직장운: { title: "우주가 보는\n일하는 스타일.", accentKey: "caramel" },
    취업운: { title: "우주가 보는\n도전과 타이밍.", accentKey: "caramel" },
    관계운: { title: "우주가 보는\n사람을 대하는 태도.", accentKey: "iris" },
    건강운: { title: "우주가 보는\n몸과 마음의 리듬.", accentKey: "iris" },
    가족운: { title: "우주가 보는\n가족 안의 나.", accentKey: "sand" },
    평생운: { title: "우주가 보는\n평생 반복되는 결.", accentKey: "iris" },
  }
  const ASTRO_ELEMENT_LABEL = { decan: "데칸", moon: "문페이즈", 수성: "수성", 금성: "금성", 화성: "화성" }
  const buildCategoryAstroChapter = (category, label) => ({
    label, accent: C[CATEGORY_EXT_META[category].accentKey],
    category,
    tag: "유료", tagColor: C.plum, tagText: C.lavender,
    title: CATEGORY_EXT_META[category].title,
    subtitle: (CATEGORY_ASTRO_ELEMENTS[category] || []).map(el => ASTRO_ELEMENT_LABEL[el]).join(", "),
    blocks: buildCategoryAstroBlocks(category),
  })

  const lockedChapters = [
    // ★ 십성 · 12신살 · 12운성 · 요약 (3페이지로 분리 — 십성/신살 스크롤이 길어 따로 나눔)
    {
      label: "십성 1", accent: C.plum,
      category: "사주 심화",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "타고난 재능과\n기질의 뿌리.",
      subtitle: "사주 십성",
      blocks: [
        { text: "십성은 이 사주가 가진 재능의 뿌리를 그대로 보여줘. 겉으로 드러난 성격 말고, 태어날 때부터 갖고 온 힘의 방향이 여기 다 나와있어.", accent: C.plum },
        { h: "가장 강한 십성 세 가지", jsxContent: React.createElement("div", null, ...sibsongJSX), accent: C.plum },
      ],
    },
    {
      label: "신살 2", accent: C.plum,
      category: "사주 심화",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "타고난 기질 속\n숨은 무기.",
      subtitle: "12신살",
      blocks: [
        { text: "신살 중엔 이름이 세서 부담스럽게 느껴지는 것도 섞여 있을 수 있어. 근데 이름이 강하다고 나쁜 신살은 없어. 어떻게 다루느냐에 따라 오히려 남들한테 없는 무기가 돼.", accent: C.plum },
        { h: "사주 네 기둥의 12신살", jsxContent: React.createElement("div", null, ...sinsal12JSX), accent: C.plum },
      ],
    },
    {
      label: "운성 3", accent: C.plum,
      category: "사주 심화",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "태어나 자라고 스러지는\n열두 단계의 기질.",
      subtitle: "일간 기준 12운성, 종합 요약",
      blocks: [
        { text: "운성은 태어나 자라고 스러지는 열두 단계 중 지금 이 사주가 정확히 어디 서 있는지 보여줘. 지금 위치를 모르면 다음 방향도 못 잡아.", accent: C.plum },
        { h: "일간 기준 12운성", jsxContent: React.createElement("div", null, ...unseong12JSX), accent: C.plum },
        { h: "종합 요약", text: sajuSummaryText, accent: C.plum },
      ],
    },
    // ★ 동양이 읽는 나의 결 (사주 요약 인용 + 당사주 · 토정비결 · 주역)
    {
      label: "동서양 종합 1", accent: C.iris,
      category: "사주 심화",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "동양이 읽는\n나의 결.",
      subtitle: "사주, 당사주, 토정비결, 주역",
      blocks: [
        { text: "지금부터 같은 사람을 다섯 개의 다른 언어로 읽어볼 거야. 먼저 동양의 눈부터 시작해.", accent: C.iris },
        { h: "사주", text: sajuYoyakText, accent: C.iris },
        dansajuText ? { h: "당사주", text: dansajuText, accent: C.iris } : null,
        { h: "토정비결", kw: tojungKw || null, text: tojungDesc, accent: C.iris },
        { h: "주역", kw: ichingKw || null, text: ichingBodyText, accent: C.iris },
      ].filter(Boolean),
    },
    // ★ 동서양 종합 (별자리)
    {
      label: "동서양 종합 2", accent: C.iris,
      category: "사주 심화",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "별자리가\n비추는 나.",
      subtitle: "태양, 달, 상승 별자리",
      blocks: [
        { text: "이번엔 서양의 눈이야. 사주가 기운으로 읽었다면, 별자리는 하늘의 자리로 같은 사람을 그려.", accent: C.iris },
        sunSign ? { h: `태양 ${sunSign}`, text: astroSunText, accent: C.iris } : null,
        moonSign ? { h: `달 ${moonSign}`, text: astroMoonText, accent: C.iris } : null,
        ascSign ? { h: `상승 ${ascSign}`, text: astroAscText, accent: C.iris } : null,
        (!sunSign && !moonSign) ? { h: "별자리", text: "태어난 시간 정보가 없어 별자리는 생략했어. 동양 명식만으로도 충분히 결이 읽혀.", accent: C.iris } : null,
      ].filter(Boolean),
    },
    // ★ 동서양 종합 3 (재구성 · 타로 상단 / 타고난 템포 하단, 생명숫자 삭제)
    {
      label: "동서양 종합 3", accent: C.iris,
      category: "사주 심화",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "타로가 말하는 것과\n타고난 템포.",
      subtitle: "타로 카드, 4원소×3특질",
      blocks: [
        { text: "타로와 4원소는 상징과 리듬으로 또 한 번 같은 사람의 결을 비춰줘. 표현만 다를 뿐 가리키는 방향은 같아.", accent: C.iris },
        { h: `타로 카드, ${tarotCardName}`, text: tarotSoulText || "분석 중이야.", accent: C.iris },
        tempoText ? { h: "타고난 템포", text: tempoText, accent: C.iris } : null,
      ].filter(Boolean),
    },
    // ★ 동서양 종합 4 (신설 · 데칸 / 문페이즈 / 역행행성)
    {
      label: "동서양 종합 4", accent: C.iris,
      category: "사주 심화",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "태어난 순간의\n우주 배치.",
      subtitle: "데칸, 문페이즈, 역행행성",
      blocks: [
        { text: "마지막은 태어난 정확한 순간의 우주 배치야. 다섯 관점을 다 모으면 다음 페이지에서 하나로 겹쳐서 봐.", accent: C.iris },
        decanText ? { h: `데칸, ${sunSign} ${decan.num}데칸`, text: decanText, accent: C.iris } : null,
        moonPhaseText ? { h: `문페이즈, ${a.moonPhase}`, text: moonPhaseText, accent: C.iris } : null,
        _showRetro ? { h: "수성", text: RETRO_TEXT.수성[String(!!retro.수성)], accent: C.iris } : null,
        _showRetro ? { h: "금성", text: RETRO_TEXT.금성[String(!!retro.금성)], accent: C.iris } : null,
        _showRetro ? { h: "화성", text: RETRO_TEXT.화성[String(!!retro.화성)], accent: C.iris } : null,
      ].filter(Boolean),
    },
    // ★ 동서양 다섯 관점 (신설 · 결론 + 엇갈릴 때 통합)
    {
      label: "동서양 다섯 관점", accent: C.iris,
      category: "사주 심화",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "다섯 관점이\n하나로 모이고, 엇갈리는 곳.",
      subtitle: "종합 결론, 충돌 지점",
      blocks: [
        { h: "다섯 관점의 결론", text: `${fiveViewText}\n${fiveViewTensionText}`, accent: C.iris },
      ].filter(Boolean),
    },
    // IX. 평생운 5블록 (사주심화 바로 뒤로 이동)
    {
      label: "대운 1", accent: C.iris,
      category: "평생운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "내 인생 전체 지도와\n황금기의 자리.",
      subtitle: "대운 흐름, 전성기",
      blocks: [
        { h: "인생 대운 흐름", jsxContent: <DaeunMap daeun={daeunLifeMap} />, accent: C.iris },
        { h: "인생의 황금기", text: daeunGoldenText, accent: C.iris },
      ].filter(Boolean),
    },
    {
      label: "대운 2", accent: C.iris,
      category: "평생운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "인생 네 구간으로 보는\n대운의 장면들.",
      subtitle: "초년, 청년, 중년, 말년",
      blocks: [
        lifeEarlyText ? { h: "초년 (만 0~19세)", text: lifeEarlyText, accent: C.iris } : null,
        lifeYoungText ? { h: "청년 (만 20~39세)", text: lifeYoungText, accent: C.iris } : null,
        lifeMidText ? { h: "중년 (만 40~59세)", text: lifeMidText, accent: C.iris } : null,
        lifeLateText ? { h: "말년 (만 60세~)", text: lifeLateText, accent: C.iris } : null,
      ].filter(Boolean),
    },
    {
      label: "대운 3", accent: C.iris,
      category: "평생운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "지금 이 10년과\n다가올 전환점.",
      subtitle: "현재 대운, 전환기 대비",
      blocks: [
        { h: "지금 대운", text: daeunCurText, accent: C.iris },
        { h: "다음 전환점", text: daeunNextText || `대운이 바뀌는 시점이 곧 온다는 것만 알아도 지금 준비하는 방식이 달라져.`, accent: C.iris },
        { h: "대운이 바뀌는 환절기", text: daeunTransitionText, accent: C.iris },
        { h: "전환기를 준비하는 법", text: transitionPrepText, accent: C.iris },
      ].filter(Boolean),
    },
    {
      label: "세운 1", accent: C.iris,
      category: "평생운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "올해라는\n해의 정체.",
      subtitle: "올해 세운, 십성 흐름",
      blocks: [
        { h: `${_thisYearNum}년, ${_yGan}${_yJi}년`, text: saeunYearText, accent: C.iris },
        { h: "올해 종합 흐름", jsxContent: <CategoryScore months={monthForecast} category="종합" thisYearScore={thisYear?.score || 0} label="종합운" />, accent: C.iris },
      ].filter(Boolean),
    },
    {
      label: "세운 2", accent: C.iris,
      category: "평생운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "진짜 크게 터지는\n결정적인 해.",
      subtitle: "대운 × 세운 교차, 승부의 해",
      blocks: [
        { h: "대운과 세운이 겹치는 해", jsxContent: <PeakYears data={_daeunSaeunPeak} />, accent: C.iris },
      ].filter(Boolean),
    },
    buildCategoryAstroChapter("평생운", "평생운 6"),
    // III. 재물운 4블록
    {
      label: "재물운 1", accent: C.sand,
      category: "재물운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "돈이 안 쌓이는\n진짜 이유.",
      subtitle: "재물 구조 진단",
      blocks: [
        { h: "돈의 구조", text: reomulType, accent: C.sand },
        { h: "반복된 패턴", text: wealthPatternText, accent: C.sand },
      ],
    },
    {
      label: "재물운 2", accent: C.sand,
      category: "재물운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "살길과\n피해야 할 길.",
      subtitle: "용신 기신 방향 분석",
      blocks: [
        reomulSurviveIntro ? { h: "살길", text: reomulSurviveIntro, accent: C.sand } : null,
        reomulSurviveJSX ? { jsxContent: reomulSurviveJSX, accent: C.sand } : null,
        reomulAvoid ? { h: "피해야 할 방향", text: reomulAvoid, accent: C.sand } : null,
      ].filter(Boolean),
    },
    {
      label: "재물운 3", accent: C.sand,
      category: "재물운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "자산군별로 보는\n투자 체질.",
      subtitle: "현금, 부동산, 금, 채권, 주식, 코인",
      blocks: [
        { h: "자산군별 풀이", jsxContent: assetClassJSX, accent: C.sand },
        { h: "투자 체질 총평", text: reomulInvest, accent: C.sand },
      ],
    },
    {
      label: "재물운 4", accent: C.sand,
      category: "재물운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "재물을\n강화하는 법.",
      subtitle: "재물 습관, 올해 흐름",
      blocks: [
        { h: "재물을 실제로 키우는 습관", text: reomulHabitText, accent: C.sand },
        { h: "올해 재물 흐름", jsxContent: <CategoryScore months={monthForecast} category="재물" thisYearScore={thisYear?.areas?.재물 || 0} label="재물운" />, accent: C.sand },
      ].filter(Boolean),
    },
    buildCategoryAstroChapter("재물운", "재물운 5"),
    // IV. 연애운(솔로) / 애정운(연애중)
    // [검토용] isSolo 게이팅 임시 해제 — 솔로/커플 애정 챕터 모두 노출 (실서비스 전 원복 필요)
    ...[
      {
        label: "연애운 1", accent: C.lavender,
        category: "연애운",
        tag: "유료", tagColor: C.plum, tagText: C.lavender,
        title: "혼자인 지금,\n마음이 열리는 순간.",
        subtitle: "솔로, 마음이 열리는 순간",
        blocks: [
          { h: "연애할 때 나", text: desire ? desire + (desire2 ? "\n\n" + desire2 : "") : `겉으로는 별로 안 원하는 척해. 근데 속은 달라. 진심으로 알아봐 주는 사람을 원해. 말 안 해도 알아채고, 기대 없이 챙겨주는 사람. 그런 사람한테 한번 마음 열면 끝까지 열어.`, accent: C.lavender },
          { h: "마음이 열리는 순간", text: (() => {
            if (!triggers.length) return `오래 지켜봐 온 사람이 구체적으로 알아봐 줄 때. 그 순간 완전히 무너져.`
            let out = triggers[0]
            if (out.length < 70 && triggers[1]) out += " " + triggers[1]
            return out
          })(), accent: C.lavender },
          { h: "썸 탈 때 나타나는 신호", text: someSignalText, accent: C.lavender },
        ].filter(Boolean),
      },
      {
        label: "연애운 2", accent: C.lavender,
        category: "연애운",
        tag: "유료", tagColor: C.plum, tagText: C.lavender,
        title: "내가 가진 매력과\n인연이 오는 자리.",
        subtitle: "매력적인 순간, 인연의 장소",
        blocks: [
          { h: "매력적인 순간", text: attractiveText, accent: C.lavender },
          { h: "첫 만남에서 주는 인상", text: firstDateImpressionText, accent: C.lavender },
          { h: "인연이 오는 곳", text: soloPlaceText, accent: C.lavender },
        ].filter(Boolean),
      },
      {
        label: "연애운 3", accent: C.lavender,
        category: "연애운",
        tag: "유료", tagColor: C.plum, tagText: C.lavender,
        title: "맞는 사람과\n다가가는 법.",
        subtitle: "궁합, 접근법, 피해야 할 상대",
        blocks: [
          { h: "잘 맞는 상대", text: soloTypeText, accent: C.lavender },
          { h: "다가가는 법", text: soloApproachText, accent: C.lavender },
          { h: "피해야 할 상대", text: poisonDetailText, accent: C.lavender },
        ].filter(Boolean),
      },
      {
        label: "연애운 4", accent: C.lavender,
        category: "연애운",
        tag: "유료", tagColor: C.plum, tagText: C.lavender,
        title: "오행으로 보는 궁합과\n인연이 열리는 때.",
        subtitle: "오행 궁합, 올해 흐름",
        blocks: [
          { h: "오행으로 보는 궁합", text: matchOhaengText, accent: C.lavender },
          { h: "밀당 성향", text: pushPullText, accent: C.lavender },
          { h: "올해 애정 흐름", jsxContent: <CategoryScore months={monthForecast} category="애정" thisYearScore={thisYear?.areas?.애정 || 0} label="애정운" />, accent: C.lavender },
        ].filter(Boolean),
      },
      buildCategoryAstroChapter("연애운", "연애운 5"),
    ],
    ...[
      {
        label: "애정운 1", accent: C.lavender,
        category: "애정운",
        tag: "유료", tagColor: C.plum, tagText: C.lavender,
        title: "지금 만나는 사람과\n나의 관계 구조.",
        subtitle: "연애 중, 관계 진단",
        blocks: [
          { h: "지금 관계에서의 나", text: coupleSelfText, accent: C.lavender },
          { h: "부딪히는 순간", text: loveConflictHow, accent: C.lavender },
          { h: "이번 생 연애 과제", text: loveWarn || "표현하는 법을 배우는 거야. 속에서 많은 게 일어나도 겉으론 안 보여. 먼저 말하지 않으면 혼자 지치고 닫히는 패턴이 반복돼.", accent: C.lavender },
        ].filter(Boolean),
      },
      {
        label: "애정운 2", accent: C.lavender,
        category: "애정운",
        tag: "유료", tagColor: C.plum, tagText: C.lavender,
        title: "이 관계를\n더 깊게 만드는 법.",
        subtitle: "관계 심화, 상대 이해",
        blocks: [
          { h: "관계가 깊어지는 순간", text: coupleOpenText, accent: C.lavender },
          { h: "더 깊어지는 법", text: coupleDeepenText, accent: C.lavender },
        ].filter(Boolean),
      },
      {
        label: "애정운 3", accent: C.lavender,
        category: "애정운",
        tag: "유료", tagColor: C.plum, tagText: C.lavender,
        title: "관계가 무르익는\n결정적인 시기.",
        subtitle: "결혼 시기, 점수",
        blocks: [
          { h: "결혼, 동거가 무르익는 때", text: marriageTimingText, accent: C.lavender },
          { h: "권태기, 정체를 넘는 법", text: slumpText, accent: C.lavender },
          { h: "올해 애정 흐름", jsxContent: <CategoryScore months={monthForecast} category="애정" thisYearScore={thisYear?.areas?.애정 || 0} label="애정운" />, accent: C.lavender },
        ].filter(Boolean),
      },
      buildCategoryAstroChapter("애정운", "애정운 4"),
    ],
    // V. 업무운 3블록 (직장운/문서운/역할 + 취업·회사운)
    // ━━ TODO 메모 (2026-07-27 세션, 미착수) ━━
    // 리뷰에서 반복 지적된 "직장운 vs 취업운 중복" 문제, 아래는 다음 세션에 이어서 할 작업 목록:
    //
    // 1) 그래프 X축 연도 표기 (CategoryScore 컴포넌트, 이 파일 상단 ~line 445)
    //    지금 v.label.split(".")[1]로 월만 뽑아 써서 "7,8,9...1,2..." 로만 나옴 — 어느 해 몇 월인지 안 보임.
    //    "26.07, 26.08...27.06" 처럼 2자리 연도+월로 바꾸고, "이 중 XX월이 제일 강해" 문장도
    //    "조회일 기준 향후 12개월 중, OOOO년 O월이 제일 강해"처럼 범위를 명시하는 문구로 교체할 것.
    //
    // 2) 직장운/취업운 액션 플랜 블록 보강 (가장 중요 — 재직하며 이직 준비하는 유저가 둘 다 결제할 확률이 높아서,
    //    지금처럼 관성/인성 진단이 겹치면 환불·별점 리스크가 큼. chwiupText 하나만 고쳐선 부족하고, 아래처럼
    //    각 카테고리에 실질적인 새 액션 블록을 추가해야 함):
    //    - 직장운에 추가할 것: "사내 정치 대처법"(누구 편도 안 들기 vs 줄서기, 십성 기반), "상사/동료와 갈등 풀기"
    //      (직접 부딪히는 타입 vs 시간 두고 푸는 타입), "연봉·승진 협상 타이밍과 화법"(promoText/yeonbongText와
    //      다르게 "협상 대화 스크립트" 수준까지 구체화)
    //    - 취업운에 추가할 것: "이력서/포트폴리오에서 어필할 포인트"(interviewText와 구분되게 서류 단계 전용),
    //      "면접관 유형별 공략법"(관성형 면접관엔 안정감, 식상형 면접관엔 순발력 등), "계약 조건 확인 시
    //      주의할 점"(재성/기신 방향과 연결해서 급여·조건 협상 체크리스트)
    //    두 카테고리 다 지금 있는 오행/십성 진단 문장은 1줄로 줄이고, 새로 추가하는 블록은 실전 팁 비중을 높일 것.
    //
    // 3) 온보딩 상태 분기 (재직 중 / 이직 준비 중 / 취준생) — 이건 리포트 텍스트 수정이 아니라 MoraIntro.jsx
    //    폼 입력 단계부터 새 필드가 필요한 구조적 변경이라 별도 스코프로 논의 필요. 지금은 손 안 댐.
    //
    // 4) 세운2 페이지 타이틀 "2-유료" 텍스트 깨짐 의심 — 코드 레벨(label/tag 구조, JSX)에선 특별한 문제가
    //    안 보였음. 실제 브라우저 렌더링에서 겹쳐 보이는 CSS 문제일 수 있어서, 스크린샷으로 재확인 필요.
    {
      label: "직장운 1", accent: C.caramel,
      category: "직장운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "실력이 빛나는\n나의 무대.",
      subtitle: "타고난 직업 강점",
      blocks: [
        { h: "타고난 강점", text: careerStrength, accent: C.caramel },
        careerBest ? { h: "맞는 환경과 업종", text: careerBest + (bestEnv ? " " + mug(bestEnv) : ""), accent: C.caramel } : null,
        { h: "나한테 맞는 역할", text: jikjangRole, accent: C.caramel },
      ].filter(Boolean),
    },
    {
      label: "직장운 2", accent: C.caramel,
      category: "직장운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "직장운과 문서운,\n지금 회사 궁합.",
      subtitle: "관성, 인성, 궁합",
      blocks: [
        { h: "직장운과 인정운", text: jikjangText, accent: C.caramel },
        { h: "문서운", text: munseoText, accent: C.caramel },
        hasCompanyInfo ? { h: "지금 회사 궁합", text: companyFitText2, accent: C.caramel } : null,
      ].filter(Boolean),
    },
    {
      label: "직장운 3", accent: C.caramel,
      category: "직장운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "치고 올라갈 때와\n지칠 때.",
      subtitle: "승진 타이밍, 번아웃, 흐름",
      blocks: [
        { h: "승진, 인정 타이밍", text: promoText, accent: C.caramel },
        { h: "번아웃, 슬럼프 주의", text: burnoutText, accent: C.caramel },
        { h: "올해 직장 흐름", text: jikjangYearText, accent: C.caramel },
      ].filter(Boolean),
    },
    {
      label: "직장운 4", accent: C.caramel,
      category: "직장운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "사내 정치, 갈등, 협상.\n실전에서 바로 쓰는 법.",
      subtitle: "사내 정치, 갈등 해결, 연봉 협상 화법",
      blocks: [
        { h: "사내 정치 대처법", text: politicsText, accent: C.caramel },
        { h: "상사, 동료와 갈등 풀기", text: conflictSolveText, accent: C.caramel },
        { h: "연봉, 승진 협상 화법", text: negotiationScriptText, accent: C.caramel },
      ].filter(Boolean),
    },
    buildCategoryAstroChapter("직장운", "직장운 5"),
    {
      label: "취업운 1", accent: C.caramel,
      category: "취업운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "언제 어디로\n취업이 열리는지.",
      subtitle: "합격 성향, 맞는 조직",
      blocks: [
        { h: "취업 기본운", text: chwiupText, accent: C.caramel },
        { h: "잘 맞는 조직 유형, 규모", text: orgFitText, accent: C.caramel },
      ].filter(Boolean),
    },
    {
      label: "취업운 2", accent: C.caramel,
      category: "취업운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "붙는 사람은\n이렇게 준비해.",
      subtitle: "면접 강점, 준비 전략",
      blocks: [
        { h: "면접, 서류에서 미는 강점", text: interviewText, accent: C.caramel },
        { h: "나에게 맞는 취업 전략", text: jobStrategyText, accent: C.caramel },
      ].filter(Boolean),
    },
    {
      label: "취업운 3", accent: C.caramel,
      category: "취업운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "옮길 때와\n나를 알아줄 자리.",
      subtitle: "이직 타이밍, 상사, 점수",
      blocks: [
        { h: "이직 타이밍", text: jobMoveText, accent: C.caramel },
        { h: "나를 뽑고 싶어하는 상사", text: bossText, accent: C.caramel },
        { h: "취업을 막는 결", text: jobBlockText, accent: C.caramel },
        { h: "올해 커리어 흐름", jsxContent: <CategoryScore months={monthForecast} category="커리어" thisYearScore={thisYear?.areas?.커리어 || 0} label={hasJoin ? "회사운" : "취업운"} />, accent: C.caramel },
      ].filter(Boolean),
    },
    {
      label: "취업운 4", accent: C.caramel,
      category: "취업운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "서류부터 계약서까지,\n실전에서 바로 쓰는 법.",
      subtitle: "이력서 어필, 면접관 공략, 계약 조건 체크",
      blocks: [
        { h: "이력서, 포트폴리오 어필 포인트", text: resumeAppealText, accent: C.caramel },
        { h: "면접관 유형별 공략법", text: interviewerTypeText, accent: C.caramel },
        { h: "계약 조건 확인 체크리스트", text: contractCheckText, accent: C.caramel },
      ].filter(Boolean),
    },
    buildCategoryAstroChapter("취업운", "취업운 5"),
    // VI. 관계운 3블록
    {
      label: "관계운 1", accent: C.iris,
      category: "관계운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "직장에서와 친구 앞에서,\n다른 두 얼굴.",
      subtitle: "겉모습과 속모습",
      blocks: [
        { h: "직장에서 보이는 나", text: relWorkFace, accent: C.iris },
        { h: "친구 앞에서 나", text: relFriendFace, accent: C.iris },
      ].filter(Boolean),
    },
    {
      label: "관계운 2", accent: C.iris,
      category: "관계운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "귀인과 독,\n곁에 둘 사람 밀어낼 사람.",
      subtitle: "귀인, 조심할 관계",
      blocks: [
        { h: "귀인은 이런 사람", text: guardianDetailText, accent: C.iris },
        { h: "조심할 사람", text: relPoison, accent: C.iris },
      ].filter(Boolean),
    },
    {
      label: "관계운 3", accent: C.iris,
      category: "관계운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "관계 속 나의 자리와\n소진되는 패턴.",
      subtitle: "관계 스타일, 그림자, 점수",
      blocks: [
        { h: "관계에서 나의 자리", text: relSocialStyle, accent: C.iris },
        { h: "갈등이 생길 때", text: relConflictStyle, accent: C.iris },
        { h: "나를 소진시키는 패턴", text: drainPatternText, accent: C.iris },
        { h: "올해 관계 흐름", jsxContent: <CategoryScore months={monthForecast} category="관계" thisYearScore={thisYear?.areas?.관계 || 0} label="관계운" />, accent: C.iris },
      ].filter(Boolean),
    },
    buildCategoryAstroChapter("관계운", "관계운 4"),
    // VII. 건강운 3블록
    {
      label: "건강운 1", accent: C.iris,
      category: "건강운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "타고나게 약한 곳과\n몸이 보내는 신호.",
      subtitle: "약한 장기, 취약 계절",
      blocks: [
        { h: "타고나게 약한 장기", text: healthWeakText, accent: C.iris },
        { h: "주의해야 할 계절", text: healthSeasonText, accent: C.iris },
      ].filter(Boolean),
    },
    {
      label: "건강운 2", accent: C.iris,
      category: "건강운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "맞는 운동과 식이,\n정신 건강.",
      subtitle: "생활 관리",
      blocks: [
        { h: "맞는 운동", text: healthExerciseText, accent: C.iris },
        { h: "맞는 식이 방향", text: healthFoodText, accent: C.iris },
        { h: "정신 건강", text: healthMentalText, accent: C.iris },
      ].filter(Boolean),
    },
    {
      label: "건강운 3", accent: C.iris,
      category: "건강운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "평생 건강 관리와\n올해 흐름.",
      subtitle: "생애 건강, 점수",
      blocks: [
        { h: "나이 들며 조심할 것", text: healthLifeText, accent: C.iris },
        { h: "먼저 챙길 마음 건강", text: healthMindLifeText, accent: C.iris },
        { h: "올해 건강 흐름", jsxContent: <CategoryScore months={monthForecast} category="건강" thisYearScore={thisYear?.areas?.건강 || 0} label="건강운" />, accent: C.iris },
      ].filter(Boolean),
    },
    buildCategoryAstroChapter("건강운", "건강운 4"),
    // VIII. 가족운 3블록
    {
      label: "가족운 1", accent: C.sand,
      category: "가족운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "부모와 형제, 배우자,\n네 기둥이 품은 가족.",
      subtitle: "부모, 유년기, 형제 자녀, 배우자궁",
      blocks: [
        { h: "부모와의 관계", text: parentText, accent: C.sand },
        { h: "자라온 가정 분위기", text: childhoodText, accent: C.sand },
        { h: "부모에게 받은 것", text: parentSupportText, accent: C.sand },
        { h: "형제와 자녀", text: siblingText, accent: C.sand },
      ].filter(Boolean),
    },
    {
      label: "가족운 2", accent: C.sand,
      category: "가족운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "가족이라는 자리가\n나를 만든 방식.",
      subtitle: "배우자궁, 육친 십성, 나에 대한 이해",
      blocks: [
        { h: "배우자 자리", text: spousePalaceText, accent: C.sand },
        spouseTypeText ? { h: "동서양이 함께 가리키는 끌리는 배우자상", text: spouseTypeText, accent: C.sand } : null,
        { h: "네 기둥이 만든 나", text: yukchinSelfText, accent: C.sand },
        { h: "반복하는 관계 패턴", text: yukchinLoopText, accent: C.sand },
      ].filter(Boolean),
    },
    {
      label: "가족운 3", accent: C.sand,
      category: "가족운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "집안 내림과\n이번 생의 과제.",
      subtitle: "집안 패턴, 전생 업보",
      blocks: [
        { h: "집안 업보 패턴", text: familyKarmaText, accent: C.sand },
        { h: "대를 잇는 내림", text: familyLineageText, accent: C.sand },
        { h: "전생업보와 이번 생의 과제", text: missionText, accent: C.sand },
      ],
    },
    {
      label: "가족운 4", accent: C.sand,
      category: "가족운",
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "부모님, 독립, 배우자.\n안 부딪히는 실전 팁.",
      subtitle: "부모 갈등 회피, 독립 타이밍, 배우자 갈등 회피",
      blocks: [
        { h: "부모님과 갈등 안 만드는 법", text: parentConflictText, accent: C.sand },
        { h: "독립, 거리두기 타이밍", text: independenceTimingText, accent: C.sand },
        { h: "배우자와 안 부딪히는 법", text: spouseConflictAvoidText, accent: C.sand },
      ].filter(Boolean),
    },
    buildCategoryAstroChapter("가족운", "가족운 5"),
  ]

  // 유료 카테고리 순서 (등장 순서 유지, 중복 제거)
  const categoryOrder = []
  lockedChapters.forEach(c => { if (c.category && !categoryOrder.includes(c.category)) categoryOrder.push(c.category) })

  // 카테고리 목록 페이지 (4페이지=무료 마지막 뒤에 신설)
  const categoryListChapter = { _categoryList: true }
  const chapters = [...freeChapters, categoryListChapter, ...lockedChapters]
  const freeCount = freeChapters.length // 목록 페이지 인덱스 = freeCount (무료 바로 다음)

  // 카테고리명 → 해당 카테고리 첫 챕터의 chapters 내 인덱스
  const categoryFirstIndex = {}
  chapters.forEach((c, i) => {
    if (c.category && !(c.category in categoryFirstIndex)) categoryFirstIndex[c.category] = i
  })
  const categoryList = categoryOrder.map(name => ({ name }))

  const ch = chapters[current]
  // 현재 탭(카테고리) 구간의 시작/끝 인덱스 — 페이지 인디케이터와 다음 버튼(구간 끝에서 숨김)에서 공용으로 사용
  let sectionStart, sectionEnd
  if (current <= freeCount) { sectionStart = 0; sectionEnd = freeCount }
  else {
    sectionStart = current
    while (sectionStart > 0 && chapters[sectionStart - 1]?.category === ch?.category) sectionStart--
    sectionEnd = current
    while (sectionEnd < chapters.length - 1 && chapters[sectionEnd + 1]?.category === ch?.category) sectionEnd++
  }

  // PDF 모드: 전체 챕터를 세로로 쌓아서 렌더
  if (pdfMode) {
    return (
      <div style={{ background: C.void, padding: "16px", fontFamily: FONT, color: C.parchment, width: 480, boxSizing: "border-box" }}>
        <div style={{ textAlign: "center", color: C.caramel, fontSize: 11, letterSpacing: 4, padding: "8px 0 16px", fontFamily: FONT_SANS }}>
          MORA {d.name}님의 운명 분석
        </div>
        {chapters.filter(c => !c._categoryList).map((c, i) => (
          <div key={i} data-pdf-chapter="1" style={{ marginBottom: 20, breakInside: "avoid", background: C.void, padding: "4px 0" }}>
            <div style={{ fontSize: 10, color: c.tag === "유료" ? C.plum : C.fog, fontFamily: FONT_SANS, marginBottom: 4 }}>
              {c.label}{c.tag === "유료" ? " · 유료" : ""}
            </div>
            <ChapterCard {...c} flipping={false} flipDir={null} locked={c.tag === "유료" && !unlockedCategories.includes(c.category)} onUnlock={null} />
          </div>
        ))}
        <div style={{ textAlign: "center", color: C.fog, fontSize: 10, padding: "12px 0", fontFamily: FONT_SANS }}>
          ✦ Mora fortuneyam.netlify.app
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: C.void, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 16px 40px", fontFamily: FONT, color: C.parchment, userSelect: "none" }}>
      <div style={{ width: "100%", maxWidth: 480, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: C.caramel, textTransform: "uppercase", fontFamily: FONT_SANS, fontWeight: 400 }}>Mora</div>
        <div style={{ fontSize: 12, color: C.ash, fontFamily: FONT_SANS, textAlign: "center", fontWeight: 400 }}>
          <div>{d.name}</div>
          <div style={{ fontSize: 10, color: C.fog }}>{d.gender}성</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {onSavePDF && <button onClick={onSavePDF} disabled={pdfLoading} style={{ background: "none", border: "none", color: pdfLoading ? C.fog : C.caramel, fontSize: 16, cursor: pdfLoading ? "default" : "pointer", padding: 0, opacity: pdfLoading ? 0.5 : 1 }}>{pdfLoading ? "⏳" : "📥"}</button>}
          <button onClick={() => setCurrent(0)} style={{ background: "none", border: "none", color: C.caramel, fontSize: 18, cursor: "pointer", padding: 0 }}>🏠</button>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 480, marginBottom: 14 }}>
        {CATEGORY_NAV_ROWS.map((row, ri) => (
          <div key={ri} style={{ display: "flex", gap: 4, marginBottom: ri === 0 ? 4 : 0 }}>
            {row.map((name) => {
              const idx = categoryFirstIndex[name]
              const isActive = ch?.category === name
              return (
                <button key={name} onClick={() => idx != null && jumpTo(idx)} disabled={idx == null}
                  style={{
                    flex: 1, minWidth: 0, background: isActive ? C.plum : C.ember, border: `1px solid ${isActive ? C.iris : C.walnut}`,
                    borderRadius: 8, padding: "7px 2px", color: isActive ? C.parchment : C.ash, fontSize: 10.5, fontFamily: FONT_SANS,
                    fontWeight: isActive ? 600 : 400, cursor: idx == null ? "default" : "pointer", whiteSpace: "nowrap", overflow: "hidden",
                    textOverflow: "ellipsis", transition: "all 0.2s",
                  }}>{name}</button>
              )
            })}
          </div>
        ))}
      </div>

      {(() => {
        const sectionLocalPos = current - sectionStart + 1
        const sectionLocalTotal = sectionEnd - sectionStart + 1
        return (
          <div style={{ width: "100%", maxWidth: 480, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {Array.from({ length: sectionLocalTotal }, (_, j) => sectionStart + j).map((i) => (
                <div key={i} style={{ width: i === current ? 18 : 5, height: 4, borderRadius: 2, background: i > freeCount ? C.plum : i === current ? C.caramel : C.ember, transition: "all 0.3s ease" }} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: C.fog, fontFamily: FONT_SANS, fontWeight: 400 }}>{sectionLocalPos} / {sectionLocalTotal}</div>
          </div>
        )
      })()}

      <div style={{ width: "100%", maxWidth: 480, perspective: 1200, flex: 1 }}>
        {ch._categoryList ? (
          <CategoryListPage
            categories={categoryList}
            unlockedCategories={unlockedCategories}
            onSelect={(cat) => {
              handleUnlock(cat.name)
              const idx = categoryFirstIndex[cat.name]
              if (idx != null) setTimeout(() => jumpTo(idx), 950)
            }}
          />
        ) : (
          <ChapterCard {...ch} flipping={flipping} flipDir={flipDir} locked={ch.tag === "유료" && !unlockedCategories.includes(ch.category)} onUnlock={handleUnlock} />
        )}
      </div>

      <div style={{ width: "100%", maxWidth: 480, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
        <button onClick={() => goTo(-1)} disabled={current === 0} style={{ background: current === 0 ? "transparent" : C.ember, border: `1px solid ${current === 0 ? C.fog : C.walnut}`, borderRadius: 10, padding: "11px 18px", color: current === 0 ? C.fog : C.sand, fontSize: 13, cursor: current === 0 ? "default" : "pointer", fontFamily: FONT_SANS, fontWeight: 400, transition: "all 0.2s" }}>이전</button>
        <div style={{ fontSize: 10, color: C.fog, fontFamily: FONT_SANS, textAlign: "center", fontWeight: 400 }}>
          {ch._categoryList ? "유료 콘텐츠 안내" : <>{ch.label}{current > freeCount && <span style={{ color: C.plum }}> 유료</span>}</>}
        </div>
        {current === sectionEnd
          ? <div style={{ width: 74 }} />
          : <button onClick={() => goTo(1)} style={{ background: C.walnut, border: `1px solid ${C.caramel}`, borderRadius: 10, padding: "11px 18px", color: C.parchment, fontSize: 13, cursor: "pointer", fontFamily: FONT_SANS, fontWeight: 400, transition: "all 0.2s" }}>다음</button>}
      </div>

      {current === 0 && <div style={{ marginTop: 10, fontSize: 11, color: C.fog, fontFamily: FONT_SANS, letterSpacing: 1, textAlign: "center", fontWeight: 400 }}>버튼을 눌러 챕터를 넘겨봐</div>}
    </div>
  )
}
