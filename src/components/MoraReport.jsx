// MoraReport.jsx v7.1 도넛차트, 카테고리 재편, 무당체 완전 통일
import React, { useState, useEffect } from 'react'
import { cleanText } from '../data/constants.js'
import { buildAstroPrompt, buildTarotPrompt } from '../utils/prompts.js'
import { callNetlify } from '../utils/callNetlify.js'

const C = {
  void: "#0D0A0F", dusk: "#1A1220", ember: "#241830",
  mahogany: "#3D2016", walnut: "#6B3A2A", caramel: "#A0522D",
  sand: "#C8956C", abyss: "#1E1028", plum: "#4A2060",
  iris: "#7B4FA6", lavender: "#B89FCC", parchment: "#F0E8DC",
  ash: "#9E8F8A", fog: "#5C5158",
}

const OHK_KR = { 목: "나무", 화: "불", 토: "흙", 금: "쇠", 수: "물" }
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

// 오행이 과다할 때(dominant) 성향 — 강점과 그림자를 함께
const OHK_STRONG_TRAIT = {
  목: "새로운 걸 시작하고 밀어붙이는 추진력이 남달라. 자라나려는 본능이 강해서 한번 방향을 잡으면 거침없이 뻗어나가. 대신 이 기운이 넘치면 벌여놓기만 하고 마무리를 못 해. 속도가 주변을 앞질러버려서 혼자 지치는 게 약점이야.",
  화: "표현력과 존재감이 강해서 어디 있든 눈에 띄어. 사람을 끌어당기는 열기가 있고 직관도 빨라. 근데 타오르는 만큼 식는 것도 빨라서 지속성이 문제야. 감정 기복이 크고, 이 기운이 넘치면 자기 자신을 태워버려.",
  토: "어떤 상황에서도 흔들리지 않는 무게가 있어. 주변을 안정시키고 신뢰를 주는 힘이 강해. 대신 그 무게를 혼자 다 짊어지려는 게 문제야. 변화에 느리고, 한번 굳으면 안 바뀌어서 지나치면 정체가 돼.",
  금: "원칙이 뚜렷하고 결단이 빨라. 불필요한 걸 잘라내고 핵심에 꽂히는 능력이 강해. 근데 날이 서있는 만큼 부딪히기 쉬워. 타협을 못 하는 게 강점이자 약점이라, 이 기운이 넘치면 차갑게 보여.",
  수: "겉은 잔잔한데 속이 깊어. 직관이 예리하고 남들이 못 보는 걸 먼저 감지해. 어디에도 유연하게 스며들지만, 이 기운이 넘치면 생각만 깊어지고 행동이 느려져. 감정을 혼자 담아두다 무너지는 게 이 기운의 함정이야.",
}
// 오행이 없을 때 부족한 부분
const OHK_MISSING_TRAIT = {
  목: "새로 시작하고 밀어붙이는 추진력",
  화: "열정을 드러내고 표현하는 힘",
  토: "중심을 잡고 버티는 안정감",
  금: "끊고 정리하는 결단력",
  수: "깊이 사고하고 유연하게 적응하는 감각",
}

const YONGSIN_DETAIL = {"목": {"업종": "교육, 출판, 작가, 콘텐츠 창작, 인테리어, 조경, 의류, 패션, 기획, 스타트업, 코칭", "행동": "새로운 것을 배우고 시작해. 독서, 강의 듣기, 새 프로젝트 시작", "취미": "등산, 원예, 독서, 글쓰기, 악기 배우기", "피해야할것": "너무 많이 시작하고 마무리 못 하는 패턴. 한 가지에 집중해."}, "화": {"업종": "방송, 엔터테인먼트, 뷰티, 마케팅, 강연, 홍보, 요식업, 전기, 에너지", "행동": "사람들 앞에 나서. 발표하고 빛나는 자리에 있어. 네트워킹 적극적으로 해.", "취미": "댄스, 노래, 요리, 사진, 유튜브, 공연 관람", "피해야할것": "너무 빠르게 소진되는 것. 충전 없이 계속 태우면 번아웃이 와."}, "토": {"업종": "부동산, 건축, 토목, 농업, 의료, 컨설팅, 중개업, 유통, 식품, 요양, 복지", "행동": "기반을 다져. 부동산 공부, 자격증 취득, 저축, 안정적인 루틴 만들기", "취미": "요리, 텃밭 가꾸기, 도예, 봉사활동, 명상", "피해야할것": "변화에 너무 느리게 반응하는 것. 한번 굳으면 바꾸기 어려운 게 약점이야."}, "금": {"업종": "법, 금융, 제조, 기계, 외과, 군경, 스포츠, 정밀 기계, 귀금속, IT 하드웨어", "행동": "원칙을 세우고 지켜. 계약서 꼼꼼히 보기, 법률 공부, 재테크, 규칙적인 운동", "취미": "격투기, 검도, 퍼즐, 정밀 공작, 수집", "피해야할것": "너무 날이 서있는 것. 타협 못 하면 주변과 마찰이 생겨."}, "수": {"업종": "무역, 유통, 해운, 여행, IT, 연구, 심리상담, 예술, 영성, 물 관련 사업", "행동": "유연하게 적응해. 새로운 정보 수집하기, 여행, 네트워크 만들기", "취미": "수영, 낚시, 요가, 명상, 글쓰기, 여행", "피해야할것": "방향 없이 흘러가는 것. 목표가 없으면 에너지가 흩어져."}, "화·토": {"업종": "의료, 요식업, 부동산, 에너지, 마케팅, 유통, 건설, 뷰티, 교육", "행동": "열정적으로 일하되 안정적인 기반을 쌓아. 자격증 취득, 꾸준한 저축, 인맥 관리", "취미": "요리, 원예, 댄스, 봉사활동", "피해야할것": "시작만 하고 마무리 못 하는 것."}, "목·화": {"업종": "교육, 출판, 창작, 방송, 마케팅, 강연, 기획, 콘텐츠 제작", "행동": "배우고 나눠. 가르치고, 발표하고, 새로운 프로젝트를 사람들과 함께 해.", "취미": "독서, 강의, 글쓰기, 퍼포먼스, 유튜브", "피해야할것": "산만하게 에너지를 흩뿌리는 것."}, "금·수": {"업종": "금융, IT, 무역, 연구, 귀금속, 해운, 데이터 분석, 컨설팅", "행동": "분석하고 판단해. 투자 공부, 자격증, 해외 네트워크 만들기", "취미": "바둑, 체스, 코딩, 독서, 여행", "피해야할것": "너무 냉정하게만 판단하는 것."}, "수·목": {"업종": "IT, 교육, 여행, 창작, 연구, 심리상담, 플랫폼, 미디어", "행동": "배우고 흘려보내. 지식을 쌓고 나누는 순환이 이 사람의 에너지야.", "취미": "독서, 여행, 수영, 글쓰기, 강의 듣기", "피해야할것": "계속 배우기만 하고 실행 안 하는 것."}, "토·금": {"업종": "건축, 법, 금융, 제조, 농업, 컨설팅, 의료, 부동산, 물류", "행동": "기반을 다지고 원칙을 지켜. 계약서, 법률, 재테크, 자격증", "취미": "도예, 정밀 공작, 격투기, 명상, 요리", "피해야할것": "너무 보수적으로만 가는 것."}}

const yongsinJobMap = {"목": "교육, 출판, 의류, 인테리어, 조경, 원예, 목재, 가구, 창작, 기획, 성장 관련 분야야. 새로운 걸 시작하고 키우는 일이 맞아.", "화": "방송, 엔터테인먼트, 뷰티, 조명, 전기, 에너지, 요식업, 마케팅, 강연, 홍보 분야야. 빛을 내고 사람들 앞에 서는 일이 맞아.", "토": "부동산, 건축, 토목, 농업, 의료, 컨설팅, 중개업, 유통, 식품 분야야. 실체가 있는 것을 다루고 안정적인 기반을 만드는 일이 맞아.", "금": "법, 금융, 제조, 기계, 외과, 군경, 스포츠, 정밀 기계, 귀금속 분야야. 원칙이 명확하고 결과가 바로 나타나는 일이 맞아.", "수": "무역, 유통, 해운, 여행, IT, 연구, 심리상담, 예술, 영성 분야야. 흐르고 연결되는 성질의 일이 맞아.", "목·화": "교육, 출판, 창작, 방송, 마케팅, 강연, 기획 분야야. 새로운 것을 만들고 알리는 일이 맞아.", "화·토": "의료, 요식업, 부동산, 에너지, 마케팅, 유통, 건설 분야야. 실체 있는 것을 빛나게 만드는 일이 맞아.", "토·금": "건축, 법, 금융, 제조, 농업, 컨설팅, 의료 분야야. 안정적이고 원칙이 있는 일이 맞아.", "금·수": "금융, IT, 무역, 연구, 귀금속, 해운 분야야. 정밀하고 유연하게 흐르는 일이 맞아.", "수·목": "IT, 교육, 여행, 창작, 연구, 심리상담 분야야. 지식을 쌓고 나누는 일이 맞아."}
const GISIN_DETAIL = {"목": {"업종": "교육, 출판, 창작, 인테리어, 의류, 기획 분야", "행동": "새로운 시작을 자꾸 벌이는 것, 산만하게 에너지를 흩뿌리는 것", "사람": "시작은 잘하지만 마무리가 약한 사람, 변화가 잦은 사람"}, "화": {"업종": "방송, 엔터, 마케팅, 화려한 것을 쫓는 분야", "행동": "충동적인 결정, 과도한 네트워킹, 에너지 소진", "사람": "화려하고 자극적인 사람, 감정 기복이 큰 사람"}, "토": {"업종": "부동산 무분별한 투자, 중개업 섣불리 진입", "행동": "고집 부리기, 변화 거부, 무거운 책임을 혼자 짊어지기", "사람": "고집이 너무 강한 사람, 변화를 거부하는 사람"}, "금": {"업종": "법, 제조, 금융 쪽에서 원칙 없이 진입", "행동": "무조건적인 결단, 타협 없는 고집, 강압적인 방식", "사람": "냉정하고 날이 선 사람, 원칙만 따지는 사람"}, "수": {"업종": "무역, 해운, 물 관련 사업에 무분별하게 뛰어들기", "행동": "방향 없이 흘러다니기, 너무 많은 정보에 휩쓸리기", "사람": "일관성 없는 사람, 종잡을 수 없는 사람"}, "수·금": {"업종": "금융, IT, 무역, 정밀 분야에서 무리하게 투자", "행동": "냉정한 계산만 따르기, 감성 없는 판단, 방향 없이 흘러다니기", "사람": "차갑고 계산적인 사람, 일관성 없는 사람"}, "목·토": {"업종": "기획, 부동산, 농업, 중개업에서 섣불리 시작", "행동": "시작만 하고 마무리 못 하기, 너무 많은 책임 짊어지기", "사람": "변덕스러운 사람, 고집이 너무 강한 사람"}, "금·토": {"업종": "제조, 건설, 법 분야에서 무리하게 진입", "행동": "지나친 원칙주의, 변화 거부, 무거운 짐 혼자 짊어지기", "사람": "너무 딱딱하고 융통성 없는 사람"}, "목·수": {"업종": "창작, IT, 교육에서 방향 없이 뛰어들기", "행동": "산만하게 이것저것 시작하기, 방향 잃고 흘러다니기", "사람": "일관성 없는 사람, 시작만 하는 사람"}, "화·금": {"업종": "방송, 제조, 에너지 분야에서 충동적으로 진입", "행동": "충동적인 결정과 냉정한 판단이 충돌하는 상황", "사람": "감정 기복이 크면서 날이 선 사람"}}

const OHK_ORGAN = {
  목: "간과 담낭", 화: "심장과 소장, 혈액순환", 토: "비장과 위, 소화기",
  금: "폐와 대장, 호흡기", 수: "신장과 방광, 생식·비뇨기",
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
  목: "봄이 제일 취약해. 목 기운이 약하면 봄에 간 담낭이 먼저 약해지고 춘곤증이 심하게 오거나 피로가 만성적으로 쌓여.",
  화: "여름이 제일 취약해. 화 기운이 약하면 여름에 심장과 혈액순환에 부담이 올 수 있어. 수분을 충분히 하고 과격한 운동은 피해야 해.",
  토: "환절기가 제일 취약해. 토 기운이 약하면 계절이 바뀔 때마다 소화기와 컨디션이 흔들려. 규칙적인 식사가 중요해.",
  금: "가을이 제일 취약해. 금 기운이 약하면 가을에 폐와 대장이 약해질 수 있어. 호흡기 관리가 필요해.",
  수: "겨울이 제일 취약해. 수 기운이 약하면 겨울에 체력이 빨리 떨어져. 체온 유지와 규칙적인 생활 리듬이 중요해.",
}
const OHK_FOOD = {
  목: "초록 채소, 신맛 나는 과일, 나물류",
  화: "토마토, 붉은 과일, 적당히 매콤한 음식",
  토: "고구마, 호박, 잡곡밥, 대추, 생강처럼 따뜻하고 노란 음식",
  금: "무, 배, 마늘, 흰 살 생선처럼 담백한 음식",
  수: "검은콩, 미역, 해조류, 견과류",
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
  비견: "부모가 원칙과 자립을 중요하게 여기는 분위기였을 가능성이 커. 각자의 영역을 존중하는 대신, 살가운 감정 표현은 적었을 수 있어.",
  겁재: "형제 같은 부모, 또는 경쟁과 비교가 있던 환경이었을 수 있어. 정을 주면서도 은근한 긴장이 있는 관계야.",
  식신: "여유 있고 편안한 분위기에서 자랐을 가능성이 커. 부모가 표현을 잘 해주는 편이라 정서적으로 안정된 기반을 받았을 수 있어.",
  상관: "부모의 기대와 자신의 개성이 부딪히는 지점이 있었을 거야. 자유롭게 크고 싶은데 틀에 맞추길 바라는 환경과 부딪혔을 수 있어.",
  편재: "현실적이고 능동적인 부모 밑에서 자랐을 가능성이 커. 물질적으로는 안정됐지만 감정적으로 바쁜 분위기였을 수 있어.",
  정재: "성실하고 계획적인 부모야. 안정적인 기반을 물려받았지만, 그만큼 규칙과 기대도 명확했을 거야.",
  편관: "엄격하거나 규율이 강한 분위기에서 자랐을 가능성이 커. 그 압박이 지금의 책임감과 맷집을 만든 배경이야.",
  정관: "원칙적이고 책임감 있는 부모야. 잘 돌봐주는데 따뜻함보다 규범이 앞섰을 수 있어. 감정적으로 연결되는 게 어색했을 수 있어.",
  편인: "독립적이고 개인적인 공간을 존중하는 분위기, 또는 부모와 물리적·정서적 거리가 있었을 가능성이 커.",
  정인: "보호받고 배려받는 분위기에서 자랐을 가능성이 커. 다만 그 보호가 지나치면 스스로 결정하는 힘을 늦게 배웠을 수 있어.",
}
const SIBSONG_SIBLING = {
  비견: "형제와는 대등한 관계야. 각자의 길을 존중하는 편이라 부딪힐 일은 적어도 깊이 얽히지도 않아.",
  겁재: "형제와 경쟁하거나 비교당하는 에너지가 있어. 사이가 좋으면 가장 강한 지원군이 되고, 틀어지면 오래가는 앙금이 남아.",
  식신: "형제와는 편안하고 다정한 관계야. 같이 있으면 여유롭고 즐거운 시간을 보내는 사이야.",
  상관: "형제와 티격태격하면서도 서로 자극을 주는 관계야. 각자 개성이 뚜렷해서 부딪힐 때도 있어.",
  편재: "형제와는 현실적인 관계야. 감정보다 실리로 얽히는 경우가 많고, 각자 자기 몫을 챙기는 편이야.",
  정재: "형제와 안정적이고 무난한 관계야. 큰 갈등 없이 각자 자리에서 성실하게 지내는 사이야.",
  편관: "형제 중 한 명이 유독 엄하거나 부담을 주는 존재였을 수 있어. 그만큼 서로에게 자극이 되기도 해.",
  정관: "형제와 서로의 역할을 인정하는 관계야. 큰 마찰 없이 각자 책임을 다하는 편이야.",
  편인: "형제와는 거리가 있는 관계일 수 있어. 각자의 세계가 뚜렷해서 자주 안 봐도 어색하지 않은 사이야.",
  정인: "형제와 서로 돌봐주는 관계야. 힘들 때 가장 먼저 손을 내미는 사이가 형제일 가능성이 커.",
}

const FONT = "'Nanum Myeongjo', 'Noto Serif KR', Georgia, serif"
const FONT_SANS = "'Nanum Gothic', 'Apple SD Gothic Neo', sans-serif"
const txt = { fontSize: 14, color: C.parchment, lineHeight: 1.9, fontWeight: 400, fontFamily: FONT, whiteSpace: "pre-line" }
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
function MangseTable({ pillars, noTime }) {
  if (!pillars || pillars.length < 4) return null
  // 궁성(가족) 라벨: [연, 월, 일, 시]
  const ganFam = ["조부", "부친", "자신", "아들"]
  const jiFam = ["조모", "모친", "배우자", "딸"]
  const colHead = ["연주", "월주", "일주", "시주"]
  const cell = { flex: 1, textAlign: "center", padding: "6px 2px" }
  const famStyle = { fontSize: 9, color: C.fog, fontFamily: FONT_SANS, marginTop: 2 }
  const sibStyle = { fontSize: 9, color: C.ash, fontFamily: FONT_SANS }
  const hanjaStyle = { fontSize: 20, color: C.parchment, fontFamily: FONT, lineHeight: 1.1 }
  const koStyle = { fontSize: 10, color: C.sand, fontFamily: FONT_SANS }
  const showTime = !noTime
  const cols = showTime ? [0, 1, 2, 3] : [0, 1, 2]
  return (
    <div style={{ marginBottom: 16, background: C.dusk, borderRadius: 12, padding: "12px 8px", border: `1px solid ${C.ember}` }}>
      <div style={{ display: "flex" }}>
        {cols.map(i => (
          <div key={"h" + i} style={{ ...cell, ...{ fontSize: 10, color: C.fog, fontFamily: FONT_SANS } }}>{colHead[i]}</div>
        ))}
      </div>
      {/* 천간 */}
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        {cols.map(i => (
          <div key={"g" + i} style={cell}>
            <div style={sibStyle}>{pillars[i].gan.sibsong}</div>
            <div style={hanjaStyle}>{pillars[i].gan.hanja}</div>
            <div style={koStyle}>{pillars[i].gan.ko}</div>
            <div style={famStyle}>{ganFam[i]}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: C.ember, margin: "8px 0" }} />
      {/* 지지 */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {cols.map(i => (
          <div key={"j" + i} style={cell}>
            <div style={hanjaStyle}>{pillars[i].ji.hanja}</div>
            <div style={koStyle}>{pillars[i].ji.ko}</div>
            <div style={sibStyle}>{pillars[i].ji.sibsong}</div>
            <div style={famStyle}>{jiFam[i]}</div>
          </div>
        ))}
      </div>
      {noTime && (
        <div style={{ fontSize: 10, color: C.fog, fontFamily: FONT_SANS, textAlign: "center", marginTop: 8 }}>
          태어난 시간을 몰라서 시주는 빼고 봤어.
        </div>
      )}
    </div>
  )
}

function DonutChart({ ohaeng, dominant, hideDesc }) {
  const total = Object.values(ohaeng).reduce((a, b) => a + b, 0)
  if (!total) return null
  const size = 80; const r = 28; const cx = 40; const cy = 40; const stroke = 10
  let cumAngle = -90
  const slices = Object.entries(ohaeng).filter(([,v])=>v>0).map(([k,v])=>{
    const angle = (v/total)*360
    const startA = cumAngle; cumAngle += angle
    return {k, v, startA, angle, color: OHK_COLOR[k]||"#888"}
  })
  const polar = (a) => {
    const rad = (a*Math.PI)/180
    return [cx + r*Math.cos(rad), cy + r*Math.sin(rad)]
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
        <svg width={size} height={size} viewBox="0 0 80 80" style={{ flexShrink: 0 }}>
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
          <text x={cx} y={cy-3} textAnchor="middle" fill={OHK_COLOR[dominant]||C.sand} fontSize="11" fontFamily={FONT_SANS} fontWeight="400">
            {OHK_KR[dominant]||dominant}
          </text>
          <text x={cx} y={cy+11} textAnchor="middle" fill={C.ash} fontSize="9" fontFamily={FONT_SANS}>
            {ohaeng[dominant]||0}개
          </text>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: C.fog, fontFamily: FONT_SANS, fontWeight: 400 }}>
            {Object.entries(ohaeng).filter(([,v])=>v>0).map(([k,v])=>(
              <span key={k} style={{ marginRight: 8 }}>
                <span style={{ color: OHK_COLOR[k]||C.fog }}>■</span> {OHK_KR[k]||k} {v}
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
    ? `흐름이 좋은 달이야.${yongsinA ? ` 용신 ${yongsinA} 방향으로 움직이면 결과가 나와.` : " 적극적으로 움직여도 좋아."}`
    : m.score >= 65
    ? "무난한 달이야. 꾸준히 나아가면 좋아."
    : `${gisinA ? `기신 ${gisinA} ` : "기신 "}기운이 강한 달이야. 큰 결정은 미루는 게 좋아.`
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

function Block({ h, text, jsxContent, highlight, accent, last }) {
  if (!text && !h && !jsxContent) return null
  const hl = (highlight || "").trim()
  return (
    <div style={last ? {} : dvd}>
      {h && <div style={hdg(accent || C.caramel)}>{h}</div>}
      {hl && (
        <span style={{
          display: "inline-block", color: C.sand, fontSize: 13, fontFamily: FONT_SANS, fontWeight: 500,
          letterSpacing: 1, background: C.mahogany, borderRadius: 6, padding: "2px 8px", marginBottom: 6,
        }}>{hl}</span>
      )}
      {text && <div style={txt}>{text}</div>}
      {jsxContent && <div>{jsxContent}</div>}
    </div>
  )
}

function ChapterCard({ label, tag, tagColor, tagText, accent, title, subtitle, blocks, extra, flipping, flipDir }) {
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
        {blocks.filter(Boolean).map((b, i) => (
          <Block key={i} {...b} last={i === blocks.filter(Boolean).length - 1} />
        ))}
      </div>
    </div>
  )
}

export default function MoraReport({ d, onHome, onSavePDF, pdfLoading, parentAstroAI, setParentAstroAI, parentTarotAI, setParentTarotAI }) {
  const [current, setCurrent] = useState(0)
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

  useEffect(() => {
    if (astroAI) { setLoadingAstro(false); return }
    let cancelled = false
    async function fetchAstro() {
      setLoadingAstro(true)
      try {
        const pillarsStr = d.pillars?.map(p => `${p.name} ${p.gan.hanja}${p.ji.hanja}`).join(", ") || ""
        const ilganKo = d.pillars?.[2]?.gan?.ko || "무"
        const ilganHanja = d.pillars?.[2]?.gan?.hanja || "戊"
        const prompt = buildAstroPrompt(pillarsStr, ilganKo, ilganHanja, d.birth)
        const text = await callNetlify({ model: "claude-haiku-4-5-20251001", max_tokens: 1200, messages: [{ role: "user", content: prompt }] })
        const parsed = JSON.parse(text)
        if (!cancelled) { setAstroAI(parsed); if (setParentAstroAI) setParentAstroAI(parsed) }
      } catch (e) { console.error("astro:", e) }
      if (!cancelled) setLoadingAstro(false)
    }
    fetchAstro()
    return () => { cancelled = true }
  }, [d.birth])

  useEffect(() => {
    if (tarotAI) return
    let cancelled = false
    async function fetchTarot() {
      try {
        const ilganKo = d.pillars?.[2]?.gan?.ko || "무"
        const ilganHanja = d.pillars?.[2]?.gan?.hanja || "戊"
        const prompt = buildTarotPrompt(d.tarot, ilganKo, ilganHanja)
        const text = await callNetlify({ model: "claude-haiku-4-5-20251001", max_tokens: 250, messages: [{ role: "user", content: prompt }] })
        const parsed = JSON.parse(text)
        if (!cancelled) { setTarotAI(parsed); if (setParentTarotAI) setParentTarotAI(parsed) }
      } catch (e) { console.error("tarot:", e) }
    }
    fetchTarot()
    return () => { cancelled = true }
  }, [d.birth])

  // ── 데이터 추출 ──
  const bnd = d.boundary
  const isBnd = bnd?.isBoundary
  const ss = d.summary?.sixSystems || []
  const sajuSys = ss.find(s => s.system === "사주") || {}
  const tojungSys = ss.find(s => s.system === "토정비결") || {}
  const juyeokSys = ss.find(s => s.system === "주역") || {}
  const tarotSys = ss.find(s => s.system === "타로수비학") || {}
  const mbtiSys = ss.find(s => s.system === "MBTI") || {}
  const a = astroAI || d.astro || {}
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
  const sunSign = a.sun && a.sun !== "분석 중" ? zodiacFix(a.sun) : null
  const moonSign = a.moon && a.moon !== "분석 중" ? zodiacFix(a.moon) : null
  const ascSign = a.asc && a.asc !== "분석 중" ? zodiacFix(a.asc) : null

  // 신살 한 박스, 엔터 구분, 마침표
  // 신살 JSX로 렌더링 (이름 색상 + 설명 인라인)
  const sinsalJSX = d.sinsal?.length
    ? d.sinsal.map((s, i) => {
        const nm = s.name.replace(/\([^)]*\)/g, "").trim()
        const desc = s.kw ? ` ${mug(s.kw)}` : ""
        const fullDesc = s.desc ? ` ${mug(s.desc).slice(0, 80)}` : ""
        return React.createElement("div", { key: i, style: { marginBottom: i < d.sinsal.length - 1 ? 10 : 0 } },
          React.createElement("span", { style: { color: C.sand, fontSize: 14, fontFamily: FONT, fontWeight: 400 } }, nm),
          React.createElement("span", { style: { color: C.parchment, fontSize: 14, fontFamily: FONT, fontWeight: 400 } }, desc + fullDesc)
        )
      })
    : [React.createElement("div", { key: 0, style: { color: C.parchment, fontSize: 14, fontFamily: FONT } }, "특별한 신살 없어. 안정적인 구조야. 튀지 않는 대신 오래 가.")]
  const sinsalText = ""

  // 12신살 JSX (각 기둥별)
  const mkPillarBlock = (arr, titleKey) => (arr && arr.length)
    ? arr.map((s, i) => React.createElement("div", { key: i, style: { marginBottom: i < arr.length - 1 ? 12 : 0 } },
        React.createElement("div", { style: { fontSize: 11, color: C.fog, fontFamily: FONT_SANS, marginBottom: 2 } }, `${s.label} · ${s.ji}`),
        React.createElement("span", { style: { color: C.sand, fontSize: 14, fontFamily: FONT } }, s[titleKey]),
        React.createElement("span", { style: { color: C.parchment, fontSize: 14, fontFamily: FONT } }, ` ${mug(s.desc || s.easy || "")}`)
      ))
    : [React.createElement("div", { key: 0, style: { color: C.parchment, fontSize: 14, fontFamily: FONT } }, "분석 중이야.")]
  const sinsal12JSX = mkPillarBlock(d.sinsal12, "name")
  const unseong12JSX = mkPillarBlock(d.unseong12, "stage")


  // 토정비결
  const tojungKw = tojungSys.key?.replace(/[（(][一-龯\u4E00-\u9FFF]+[）)]/g, "").trim() || ""
  const tojungDesc = noColon(tojungSys.desc || "").replace(/^[\n\r]+/, "")

  // 주역 콜론 완전 제거 — 괘명은 괄호 안 한글(예: 수뢰둔)만 세미타이틀로
  const _ichingRaw = (juyeokSys.key || d.iching?.bonmyeonggae || "")
  const _ichingKoMatch = _ichingRaw.match(/[（(]([가-힣]+)[）)]/)
  const ichingKw = _ichingKoMatch ? _ichingKoMatch[1] : _ichingRaw.replace(/[.:：]/g, "").replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim()
  const ichingNature = noColon(juyeokSys.desc || d.iching?.gaeNature || "").replace(/^[\n\r]+/, "")
  const ichingStrategy = (d.iching?.strategy || []).slice(0, 2).map(noColon)
  const ichingText = `${ichingNature}${ichingStrategy.length ? " " + ichingStrategy.join(" ") : ""}`

  // 일주 설명
  const iljuDescStd = mug(isBnd ? bnd.standardDesc : (sajuSys.desc || ""))
  const iljuDescMid = mug(bnd?.midnightDesc || "")

  // 당사주
  const dansajuPillars = d.dansaju?.pillars || []
  const dansajuText = (() => {
    if (!dansajuPillars.length) return ""
    const stars = dansajuPillars.map(p => p.byeolseong?.split("(")[0].replace(/\([^)]*\)/g, "").trim() || "").filter(Boolean)
    const kws = dansajuPillars.map(p => p.kw || "").filter(Boolean)
    return `별이 네 개야. ${stars.join(", ")} 순서로 흘러가. ${kws.slice(0, 2).join("과 ")}의 기운이 삶의 뼈대를 만드네.`
  })()

  // 별자리 텍스트 한자 완전 제거
  const astroSunText = sunSign ? mug(a.sunDesc || a.triangle || "") : "별자리 분석 불러오는 중이야."
  const astroMoonText = moonSign ? mug(a.moonDesc || "") : "잠시 후 나타나."

  // 타로
  const tarotLifeText = mug(t.lifePathDesc || tarotSys.desc || "")
  const tarotSoulText = mug(tarotAI?.soulDesc || t.soulDesc || "")
  const tarotCardName = (t.lifePathCard || "본명 카드").replace(/\([^)]*\)/g, "").trim()

  // 성격 요약 (MBTI 대체)
  const strengths = (d.mbti?.strengths || []).map(mug).filter(Boolean).slice(0, 2)
  const challenges = (d.mbti?.challenges || []).map(mug).filter(Boolean).slice(0, 2)
  const mbtiType = mbtiSys.key || d.mbti?.estimated || ""
  const mbtiDesc = mug(mbtiSys.desc || d.mbti?.basis || "")
  const dayImpression = mug(dn.day?.impression || "")
  const daymask = mug(dn.day?.mask || "")

  // 재물
  const yearForecast = d.summary?.yearForecast || []
  const thisYear = yearForecast[0] || {}
  const jaemuScore = thisYear?.areas?.재물 || 0
  const bestYear = [...yearForecast].sort((a, b) => (b.areas?.재물 || 0) - (a.areas?.재물 || 0))[0]
  const reomulStructure = isSingang
    ? `에너지가 집중된 구조야. 돈 잡으면 오래 쥐고 있어. 근데 욕심이 화근이야. 한 번에 다 가지려다 날리는 패턴, 이미 경험했지?`
    : `에너지가 분산된 구조야. 돈이 들어와도 손에 안 남아. 구조가 그래. 네 잘못이 아닌데 이 패턴 모르면 평생 반복돼.`
  const reomulYongsin = yongsinA ? `살길은 ${yongsinA} 기운이야. 이 방향으로 가야 돈이 따라와. 거슬러 가면 아무리 열심히 해도 제자리야.` : ""
  const _gd = GISIN_DETAIL[gisinA] || GISIN_DETAIL[gisinA?.split("·")[0]] || {}
  const reomulGisin = gisinA
    ? `${gisinA} 기운은 돈을 새게 만들어. 이쪽으로 가면 힘만 빼는 거야.\n\n피해야 할 업종은 ${_gd["업종"] || gisinA + " 방향의 사업"} 쪽이야. 아무리 조건이 좋아도 이 방향은 에너지가 새.\n\n하지 말아야 할 건 ${_gd["행동"] || "이 기운의 방향으로 무리하게 가는 거야."} 이런 행동이 돈을 흘려보내.\n\n조심해야 할 사람은 ${_gd["사람"] || gisinA + " 기운이 강한 사람"}이야. 가까이 둘수록 재물이 막혀.`
    : ""
  const reomulYear = jaemuScore ? `올해 재물 흐름 ${jaemuScore}점이야. ${mug(thisYear.summary || "")}` : ""
  const reomulBest = bestYear && bestYear.year !== thisYear.year
    ? `향후 5년 중 ${bestYear.year}년이 재물 흐름이 제일 강해. 그때를 노려야 해.` : ""
  const reomulFlow = yearForecast.slice(0, 5).map(y => `${y.year}년 ${y.areas?.재물 || 0}점`).join(" · ")

  // 연애
  const desire = mug(night.desire || "")
  const desire2 = mug(night.desire2 || "")
  const attraction = mug(night.attraction || "")
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
  const daeunCurText = curDaeun ? `지금 ${curDaeun.label?.replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim()} 대운이야 (${curDaeun.period || ""}). ${mug(curDaeun.desc || "")}` : "대운 읽는 중이야."
  const daeunNextText = nextDaeun ? `다음 대운은 ${nextDaeun.label?.replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim()}이야. 이 전환점이 오기 전에 지금을 써야 해.` : ""
  const daeunFlow = futureDaeun.map(dv => { const lb = dv.label?.replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim(); const pd = dv.period || (dv.startAge ? `만 ${dv.startAge}~${Number(dv.startAge)+9}세` : ""); return `${lb} ${pd}` }).join("\n")
  const yearFlowText = yearForecast.slice(0, 5).map(y => `${y.year}년 ${y.score}점 ${mug(y.summary || "")}`).join("\n")

  const sajuTag = (sajuSys.key || "").replace(/[（(][一-龯\u4E00-\u9FFF]+[）)]/g, "").trim()

  // 오행 서술 (I-2 오행분포용) — 카테고리 분리 없이 줄글 하나로
  const ohEntries = Object.entries(ohaeng).sort((x, y) => y[1] - x[1])
  const missingOh = Object.entries(ohaeng).filter(([, v]) => !v).map(([k]) => k)
  const _domCnt = ohaeng[dominant] || 0
  const _domTrait = OHK_STRONG_TRAIT[dominant] || OHK_DESC[dominant] || ""
  const _missTraits = missingOh.map(k => OHK_MISSING_TRAIT[k]).filter(Boolean)
  const _missPart = missingOh.length
    ? ` 대신 ${missingOh.map(k => OHK_KR[k]).join(", ")} 기운이 아예 없어. ${_josaIga(_missTraits.join(", "))} 비어있는 구조라, 이 부분을 의식적으로 채워야 균형이 잡혀.`
    : " 오행이 크게 치우치지 않고 고르게 갖춰진 편이라, 상황에 맞게 여러 기운을 꺼내 쓸 수 있는 구조야."
  const ohaengFull = `${_josaEunNeun(OHK_KR[dominant] || dominant)} ${_domCnt}개로 이 사주에서 가장 강한 기운이야. ${_domTrait}${_missPart}`

  // 월별 세운 (X-2)
  const monthForecast = d.summary?.monthForecast || []

  // 건강운 (VIII)
  const healthWeakOh = missingOh.length ? missingOh : [ohEntries[ohEntries.length - 1]?.[0]].filter(Boolean)
  const healthOrgan = healthWeakOh.map(k => OHK_ORGAN[k]).filter(Boolean).join(", ")
  const healthSign = healthWeakOh.map(k => OHK_ORGAN_SIGN[k]).filter(Boolean)[0] || ""
  const healthYearScore = thisYear?.areas?.건강 || 0
  const healthWeakText = healthOrgan
    ? `${healthWeakOh.map(k => OHK_KR[k]).join(", ")}이 ${healthWeakOh.length > 1 ? "아예 없어" : "부족해"}. ${healthWeakOh.map(k=>OHK_ORGAN[k]).join(", ")}과 연결되는 자리라 이 부분이 구조적으로 약해. ${healthSign}. 이런 신호가 오면 몸이 과부하 상태라는 거야.`
    : "오행이 고르게 갖춰져 있어. 특별히 취약한 장기 없이 안정적인 구조야."
  const healthYearText = `${thisYear.year || new Date().getFullYear()}년 건강 ${healthYearScore}점이야. ${gisinA ? `${gisinA} 기운이 강해지는 시기엔 ${OHK_ORGAN[gisinA?.split("·")[0]] || "몸"}에 부담이 갈 수 있어.` : ""} 잘 때 잘 자는 게 제일 중요해. 수면이 무너지면 다 무너지는 구조야.`
  const healthExercise = OHK_EXERCISE[yongsinA] || OHK_EXERCISE[yongsinA?.split("·")[0]] || "규칙적인 유산소와 스트레칭"
  const healthExerciseText = `달에 ${moonSign || "감정의 별자리"}가 있어. 규칙적인 생활 리듬이 건강의 핵심이야. ${healthExercise}가 맞아. 강도보다 꾸준함이 훨씬 중요해.`
  const healthSeasonText = healthWeakOh.map(k => OHK_SEASON_WARN[k]).filter(Boolean).join("\n\n") || "특별히 취약한 계절 없이 사계절 무난하게 지나가는 구조야."
  const healthFoodText = `${yongsinA || ""} 기운을 올려주는 음식이 맞아. ${OHK_FOOD[yongsinA] || OHK_FOOD[yongsinA?.split("·")[0]] || "제철 음식"}. 따뜻하게 먹는 것이 중요해. 커피는 하루 한 잔 이하로 줄이는 게 좋고, 과음은 이 사주에서 건강을 제일 빠르게 망가뜨려.`
  const healthMentalText = isSingang
    ? "에너지가 밖으로 향하는 구조라, 쉬지 않고 계속 움직이려는 경향이 있어. 의식적으로 멈추는 연습이 정신 건강 관리야. 몸을 쉬게 하는 것도 능력이야."
    : "혼자 담아두는 것이 많은 구조야. 표현하지 않으면 몸으로 나와. 글쓰기, 일기, 가까운 사람한테 털어놓기가 정신 건강 관리야. 의식적으로 혼자만의 회복 시간이 필요해."

  // 가족운 + 전생업보 (IX)
  const yeonSibsong = d.pillars?.[0]?.gan?.sibsong || ""
  const wolSibsong = d.pillars?.[1]?.gan?.sibsong || ""
  const parentText = SIBSONG_PARENT[yeonSibsong] || "부모와의 관계는 태어난 환경에 따라 다양한 모양을 가져. 지금의 나를 만든 뿌리 중 하나야."
  const siblingText = SIBSONG_SIBLING[wolSibsong] || SIBSONG_SIBLING[yeonSibsong] || "형제자매와는 각자의 속도로 살아가는 관계야."
  const familyKarmaText = `${dominant ? OHK_KR[dominant] : ""} 기운이 강한 집안이야. ${OHK_DESC[dominant]?.split(".")[0] || ""}는 흐름이 대대로 이어져 왔을 가능성이 커. 이게 이 사람만의 문제가 아니라 집안에서 내려온 흐름일 수 있어.`
  const missionText = missingOh.length
    ? `${missingOh.map(k => OHK_KR[k]).join(", ")} 기운이 없는 구조야. 전생에서 ${OHK_KR[dominant]} 기운을 충분히 쌓았다면, 이번 생의 과제는 부족한 기운을 채우는 거야. ${missingOh.map(k => OHK_DESC[k]?.split(".")[1]).filter(Boolean).join(" ")}`
    : `오행이 고르게 갖춰진 채로 태어났어. 이번 생의 과제는 균형을 유지하며 그릇을 키우는 거야.`

  // 애정운 솔로 전용 (VII)
  const isSolo = d.isSolo !== false
  const hasYeokma = (d.sinsal || []).some(s => (s.name || "").includes("역마"))
  const soloTimingText = curDaeun
    ? `${nextDaeun ? `${nextDaeun.label?.replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim()} 대운` : "다가오는 대운"}에서 제대로 된 인연이 들어올 가능성이 높아. 세운으로 보면 ${bestYear ? `${bestYear.year}년` : "향후 몇 년"}이 애정운 피크야. 억지로 만들려고 하면 안 맞는 사람이 와. 지금은 나를 쌓아가는 시간이야.`
    : "인연이 들어오는 시기가 따로 있어. 지금은 나를 쌓아가는 시간이야."
  const soloPlaceText = hasYeokma
    ? "역마살이 있어서 이동하고 변화하는 환경에서 인연을 만나. 여행, 이직, 이사 같이 뭔가 바뀌는 시점이야. 앱이나 소개팅보다 일 관련 자리, 스터디, 전문직 모임에서 자연스럽게 만나는 인연이 오래가."
    : "일상적인 관계 속에서 인연이 자라나는 구조야. 급하게 새로운 사람을 만나려 하기보다, 이미 아는 사람들 사이에서 뜻밖의 인연이 시작될 가능성이 커."
  const soloTypeText = idealType || (yongsinA ? `${yongsinA} 기운이 강한 사람이 인연이야. 따뜻한 인상, 믿음직한 분위기, 화려하지 않아도 존재감이 있는 사람. 처음엔 밋밋해 보여도 알수록 깊어지는 사람이 진짜 인연이야.` : "말보다 행동으로 보여주는 사람이 인연이야.")
  const soloApproachText = "처음엔 절대 티 내지 마. 천천히 신뢰를 쌓아야 해. 빠르게 밀어붙이면 바로 닫혀. 말보다 행동으로, 꾸준하게, 부담 없이 곁에 있어주는 방식이 유일하게 먹혀."

  // 업무운 2 - 수성 교차, 회사 궁합
  const mercurySign = a.mercury && a.mercury !== "분석 중" ? zodiacFix(a.mercury) : null
  const mercuryText = mercurySign ? mug(a.mercuryDesc || "") : "수성 위치를 읽는 중이야."
  const companyFitText = yongsinA
    ? `회사 업종이 ${yongsinA} 방향인지 먼저 봐. ${(YONGSIN_DETAIL[yongsinA] || YONGSIN_DETAIL[yongsinA?.split("·")[0]] || {})["업종"] || yongsinJobMap[yongsinA] || ""} 계열 회사가 맞아. ${gisinA ? `${gisinA} 방향인 ${(GISIN_DETAIL[gisinA]||{})["업종"] || "회사"}는 아무리 조건이 좋아도 에너지가 지속적으로 새.` : ""}`
    : ""

  // 관계운 2 - 소진 패턴, 그림자
  const drainPatternText = isSingang
    ? "에너지가 밖으로 향하는 구조라, 남의 부탁을 거절 못 하고 계속 떠안다가 소진돼. 내 몫이 아닌 것까지 짊어지는 패턴을 알아채는 게 먼저야."
    : "주변의 감정을 쉽게 흡수하는 구조야. 감정적으로 힘든 사람 곁에 있으면 나도 모르게 같이 힘들어져. 받는 것 없이 주기만 하는 관계는 일찍 정리해야 해."
  const shadowText = challenges.length
    ? `${challenges[0]} 기신 구간에서 스트레스를 받을 때 이게 더 강하게 나와. 의식적으로 유연함을 연습해야 해.`
    : "본인은 원칙을 지킨다고 생각하는데 타인 눈에는 고집스럽게 보이는 경우가 있어. 의식적으로 유연함을 연습해야 해."

  // ── 챕터 구성 ──
  const bndChapters = isBnd ? [
    {
      label: "경계의 사주", accent: C.iris,
      tag: "경계 사주", tagColor: C.plum, tagText: C.lavender,
      title: "넌 특별한 사주야.",
      subtitle: "두 기운을 동시에 품고 태어났어.",
      blocks: [
        { h: "두 기운을 동시에", text: "태어난 시간이 자정 경계에 걸쳐 있어. 어떤 학파는 한쪽, 어떤 학파는 다른 쪽으로 읽어. 틀린 게 아니야. 두 기운을 동시에 품고 태어난 거야.", accent: C.iris },
        { h: "어느 쪽이 맞을까", text: "둘 다 읽어봐. 어느 쪽이 더 내 얘기처럼 느껴지는지 본인이 제일 잘 알아. 둘 다 맞는 경우도 있어. 그게 경계 사주야.", accent: C.iris },
      ],
    },
    {
      label: "무술 첫 번째 해석", accent: C.caramel,
      tag: "무술", tagColor: C.mahogany, tagText: C.sand,
      title: "흙 위에 흙.\n버티는 게 무기인 사람이야.",
      subtitle: "사주 · 오행 분포",
      extra: <><MangseTable pillars={d.pillars} noTime={d.noTime} /><DonutChart ohaeng={ohaeng} dominant={dominant} /></>,
      blocks: [
        { h: "일주 본질", text: iljuDescStd || "흙 위에 흙이 쌓인 구조야. 산이 두 개야, 이 사람은.", accent: C.caramel },
        { h: "타고난 에너지", jsxContent: sinsalJSX, accent: C.caramel },
      ],
    },
    {
      label: "기해 두 번째 해석", accent: C.iris,
      tag: "기해", tagColor: C.abyss, tagText: C.lavender,
      title: "흙 아래 물.\n겉이랑 속이 달라.",
      subtitle: "사주 · 오행 분포",
      extra: <><MangseTable pillars={d.pillars} noTime={d.noTime} /><DonutChart ohaeng={ohaeng} dominant={dominant} /></>,
      blocks: [
        { h: "일주 본질", text: iljuDescMid || "부드러운 흙 아래 깊은 물이 흐르는 구조야.", accent: C.iris },
        { h: "타고난 에너지", jsxContent: sinsalJSX, accent: C.iris },
      ],
    },
  ] : [
    {
      label: "일주 본질", accent: C.caramel,
      tag: sajuTag, tagColor: C.mahogany, tagText: C.sand,
      title: `${sajuTag}.\n태어날 때부터 이렇게 설계됐어.`,
      subtitle: "사주 명식 · 오행 분포",
      extra: <><MangseTable pillars={d.pillars} noTime={d.noTime} /><DonutChart ohaeng={ohaeng} dominant={dominant} /></>,
      blocks: [
        { h: "본질", text: iljuDescStd || "분석 중이야.", accent: C.caramel },
        { h: "타고난 에너지", jsxContent: sinsalJSX, accent: C.caramel },
      ],
    },
  ]

  const freeChapters = [
    ...bndChapters,
    // I. 성격 요약
    {
      label: "성격 요약", accent: C.caramel,
      tag: mbtiType, tagColor: C.walnut, tagText: C.parchment,
      title: "한 줄로 설명하면\n이래.",
      subtitle: "동서양 종합",
      blocks: [
        { h: "핵심 기질", text: mbtiDesc || "분석 중이야.", accent: C.caramel },
        strengths.length ? { h: "기질의 강점", text: strengths.join(" "), accent: C.caramel } : null,
        challenges.length ? { h: "기질의 약점", text: challenges.join(" "), accent: C.caramel } : null,
        thisYear ? { h: "올해 흐름", text: `${thisYear.year || new Date().getFullYear()}년 종합 ${thisYear.score || 0}점이야. ${mug(thisYear.summary || "")}`, accent: C.caramel } : null,
      ].filter(Boolean),
    },
    // I-2. 오행 분포
    {
      label: "오행 분포", accent: C.caramel,
      tag: "무료", tagColor: C.walnut, tagText: C.sand,
      title: "태어날 때부터\n이 기운을 가지고 왔어.",
      subtitle: "오행 기질 분석",
      extra: <DonutChart ohaeng={ohaeng} dominant={dominant} hideDesc />,
      blocks: [
        { h: "오행 기질 강점과 약점", text: ohaengFull, accent: C.caramel },
      ],
    },
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
  const reomulType = isSingang
    ? `에너지가 집중된 구조야. 일단 방향이 잡히면 돈을 잡고 오래 쥐고 있어. 근데 그게 양날의 검이야. 한번 욕심이 생기면 멈추질 못해. 더 크게, 더 빨리 가지려다 한 번에 날리는 패턴이 이 구조의 함정이야. 이미 경험해봤지? 문제는 그게 한 번으로 안 끝난다는 거야. 모르면 계속 반복돼. 지금 당장 크게 버는 것보다 잃지 않는 구조를 만드는 게 먼저야. 욕심의 크기를 조절하는 것이 이 사주의 핵심 과제야.`
    : `에너지가 분산된 구조야. 돈이 들어오는 경로가 여러 개인 것 같은데, 정작 어디서 들어오고 어디서 나가는지 파악이 안 돼. 열심히 하는데 왜 안 쌓이나 싶었지? 구조가 그래. 네 잘못이 아니야. 근데 이 구조를 모르면 평생 이 패턴이 반복돼. 에너지를 한 곳에 모아야 해. 여러 가지를 동시에 하면 전부 흩어져. 하나를 깊게 파는 것이 이 사주에서 돈을 쌓는 유일한 방법이야. 선택과 집중, 이게 돈의 답이야.`
  const _yd = YONGSIN_DETAIL[yongsinA] || YONGSIN_DETAIL[yongsinA?.split("·")[0]] || {}
  const reomulSurvive = yongsinA
    ? `${yongsinA} 기운이 이 사람을 살려. 이 방향으로 가야 돈이 따라오고, 에너지가 살아나. 거슬러 가면 아무리 열심히 해도 제자리야. 지금 하는 일이 이 방향인지 한번 봐. 맞으면 계속 가고, 아니면 방향을 틀어야 해.\n\n맞는 업종은 ${(_yd["업종"] || yongsinJobMap[yongsinA] || yongsinA + " 방향의 분야")} 쪽이야. 이런 분야에서 열심히 한 만큼 결과가 나와.\n\n일상에서는 ${_yd["행동"] || "용신 방향의 활동을 늘려."} 취미도 ${_yd["취미"] || "이 기운을 살리는 활동"}으로 채워. 작은 것부터 이 기운을 늘려가는 게 재물을 쌓는 가장 빠른 길이야.\n\n조심할 건 ${_yd["피해야할것"] || "이 기운을 거스르는 방향으로 가는 거야."}`
    : ""
  const reomulAvoid = reomulGisin
  const reomulInvest = isSingang
    ? "적극적으로 투자하고 확장하는 스타일이 맞아. 근데 리스크 관리를 못 하면 한 방에 날려. 욕심의 크기를 조절하는 게 관건이야."
    : "안정적으로 쌓아가는 스타일이 맞아. 한 번에 크게 가려다 다 잃는 경우가 많아. 꾸준히 쌓는 게 이 구조의 정답이야."

  // 연애 상세
  // 나와 갈등이 생기는 조건 (신강/신약 + 표현 방식 기반)
  const loveConflictHow = isSingang
    ? "내 방식을 밀어붙이려 하거나 주도권을 뺏으려 들면 바로 부딪혀. 통제받는다고 느끼는 순간 마음이 닫혀. 그리고 무시당했다고 느끼면 겉으론 잠잠해도 속으로 관계를 정리하기 시작해. 자존심을 건드리는 게 나랑 싸우는 가장 빠른 길이야."
    : "속마음을 안 알아주고 재촉하면 지쳐. 표현을 안 하니까 상대는 모르는데, 나는 이미 여러 번 참은 상태라 어느 순간 확 식어버려. 감정을 몰아세우거나 다그치면 오히려 더 입을 닫아. 말 안 해도 알아주길 바라는 마음을 몰라줄 때 갈등이 터져."
  const loveTiming = `인연이 들어오는 시기가 따로 있어. 대운과 세운이 맞아야 제대로 된 사람이 와. 아무리 노력해도 안 되는 시기가 있고, 가만 있어도 오는 시기가 있어.`
  const loveWarn = idealType2 ? `근데 주의해. ${mug(d.mbti?.challenges?.[0] || "")} 이 약점이 관계에서도 그대로 나타나.` : ""

  // 커리어 상세
  const careerStrength = (d.mbti?.strengths || []).slice(0,2).map(mug).join(" ") || `${yongsinA || ""} 기운이 강한 분야에서 실력이 빛나.`
  const careerWeak = (d.mbti?.challenges || []).slice(0,1).map(mug).join("") || "약점을 알고 보완하는 게 커리어의 핵심이야."
  const careerBest = yongsinA ? `${yongsinA} 기운이 살아있는 직종이야. 이 방향이 맞아. 돈도 따라오고 실력도 인정받아.` : ""
  const careerTiming = `지금 대운이 커리어에 유리한 시기인지, 내부를 다지는 시기인지가 중요해. 타이밍을 잘못 읽으면 아무리 잘해도 결과가 안 나와.`

  // 인간관계 상세
  const relGuardian = yongsinA ? `${yongsinA} 기운을 가진 사람이 귀인이야. 이 에너지가 나를 살려. 직관적으로 편한 사람, 같이 있으면 뭔가 잘 풀리는 사람이 그 타입이야.` : ""
  const relPoison = gisinA ? `${gisinA} 기운이 강한 사람과 가까이 있으면 이유 없이 지쳐. 나쁜 사람이 아닐 수 있어. 그냥 에너지가 안 맞는 거야. 가까이 할수록 손해야.` : ""
  // 직장(공적)과 친구(사적) 모습 — 서로 다른 각도로
  const relWorkFace = `${dayImp || "처음엔 다가가기 어려운 인상을 줘."}${dayMask ? " " + dayMask : ""} 공적인 자리에서는 감정을 잘 드러내지 않고, 맡은 몫을 확실히 해내는 사람으로 보여.`
  const relFriendFace = isSingang
    ? "편한 사람들 앞에서는 의외로 장난기가 많고 주도적으로 판을 이끌어. 좋아하는 사람한테는 표현도 확실하고, 챙길 땐 화끈하게 챙겨. 공적인 자리의 차분함과는 완전히 다른 모습이라, 이 반전을 아는 사람만 진짜 나를 봐."
    : "가까운 사이에서는 경계를 풀고 은근히 응석도 부려. 말수는 적어도 곁을 잘 지키고, 한번 마음 준 사람한테는 깊고 오래가. 겉의 무던함과 달리 속은 섬세해서, 이 온도 차를 아는 사람만 진짜 나를 봐."

  // 이 대운의 의미 — 대운 오행이 용신/기신 중 무엇인지로 판단 (desc와 겹치지 않게)
  const _HANJA2KR_D = { 木:"목",火:"화",土:"토",金:"금",水:"수" }
  const _curDaeunO = curDaeun ? (_HANJA2KR_D[curDaeun.ohaeng] || curDaeun.ohaeng || "") : ""
  const _yongList = (yongsinA || "").split("·")
  const _giList = (gisinA || "").split("·")
  const daeunMeaning = curDaeun
    ? (_yongList.includes(_curDaeunO)
        ? `이번 대운은 용신인 ${_curDaeunO} 기운이 들어오는 구간이야. 십 년 중 가장 크게 치고 나갈 수 있는 시기라, 미뤄뒀던 일을 벌이고 판을 키워야 해. 이때 쌓은 게 평생 간다.`
        : _giList.includes(_curDaeunO)
        ? `이번 대운은 기신인 ${_curDaeunO} 기운이 강해지는 구간이야. 무리하게 확장하면 힘만 빠져. 새 판을 벌이기보다 실력을 다지고 다음 대운을 준비하는 게 이 십 년을 잘 쓰는 법이야.`
        : `이번 대운의 ${_curDaeunO} 기운은 용신도 기신도 아닌 중립 구간이야. 크게 흔들리지 않는 대신 저절로 풀리지도 않아. 스스로 방향을 정하고 꾸준히 밀고 가는 사람이 결과를 만들어.`)
    : ""
  const yearDetail = yearForecast.slice(0, 5).map(y => {
    const score = y.score || 0
    const areas = y.areas || {}
    const areaStr = Object.entries(areas).map(([k,v]) => `${k} ${v}점`).join(" / ")
    return `${y.year}년 종합 ${score}점\n${areaStr}\n${mug(y.summary || "")}`
  }).join("\n\n")

  const lockedChapters = [
    // ★ 12신살 · 12운성 (당사주 앞)
    {
      label: "12신살", accent: C.plum,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "네 기둥에 박힌\n열두 신살의 자리.",
      subtitle: "연지 기준 12신살",
      blocks: [
        { jsxContent: React.createElement("div", null, ...sinsal12JSX), accent: C.plum },
      ],
    },
    {
      label: "12운성", accent: C.plum,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "태어나 자라고 스러지는\n열두 단계의 기질.",
      subtitle: "일간 기준 12운성",
      blocks: [
        { jsxContent: React.createElement("div", null, ...unseong12JSX), accent: C.plum },
      ],
    },
    // II. 동서양 종합
    {
      label: "동서양 종합 1", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "동서양이 가리키는 건\n결국 같은 사람이야.",
      subtitle: "사주 · 당사주 · 토정비결 · 주역",
      blocks: [
        dansajuText ? { h: "당사주", text: dansajuText, accent: C.iris } : null,
        { h: "토정비결", text: tojungDesc, accent: C.iris, highlight: tojungKw + " " },
        { h: "주역", text: ichingText, accent: C.iris, highlight: ichingKw },
      ].filter(Boolean),
    },
    {
      label: "동서양 종합 2", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "별자리와 타로가\n말하는 이 사람.",
      subtitle: "별자리 심화 · 타로 교차",
      blocks: loadingAstro
        ? [{ h: "분석 중", text: "모라가 별자리를 읽고 있어. 잠깐만 기다려.", accent: C.iris }]
        : [
          sunSign ? { h: `태양 ${sunSign} · 달 ${moonSign || ""} · 상승 ${ascSign || ""}`, text: astroSunText, accent: C.iris } : null,
          moonSign ? { h: "감정과 첫인상", text: astroMoonText, accent: C.iris } : null,
          mercurySign ? { h: `수성 ${mercurySign}`, text: mercuryText, accent: C.iris } : null,
          { h: `생명경로수 ${t.lifePath || ""} · ${tarotCardName}`, text: `${tarotLifeText || ""}\n\n${tarotSoulText || ""}`.trim() || "분석 중이야.", accent: C.iris },
        ].filter(Boolean),
    },
    // III. 재물운 3블록
    {
      label: "재물운 1", accent: C.sand,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "돈이 왜 안 쌓이는지\n구조가 보여.",
      subtitle: "재물 구조 진단",
      blocks: [
        { h: "돈의 구조", text: reomulType, accent: C.sand },
        { h: "반복된 패턴", text: "능력은 있어. 인정도 받아. 근데 돈으로 연결이 안 돼. 방향이 맞으면 돈이 따라오는데, 방향이 틀리면 아무리 열심히 해도 제자리야. 지금까지 에너지가 살아났던 일과 지쳤던 일을 돌아봐. 살아난 쪽이 용신 방향이야.", accent: C.sand },
      ],
    },
    {
      label: "재물운 2", accent: C.sand,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "살길과\n피해야 할 길.",
      subtitle: "용신 기신 방향 분석",
      blocks: [
        reomulSurvive ? { h: "살길", text: reomulSurvive, accent: C.sand } : null,
        reomulAvoid ? { h: "피해야 할 방향", text: reomulAvoid, accent: C.sand } : null,
        reomulYear ? { h: "올해 재물", text: reomulYear, accent: C.sand } : null,
      ].filter(Boolean),
    },
    {
      label: "재물운 3", accent: C.sand,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "투자 체질과\n재물을 강화하는 법.",
      subtitle: "투자 체질 · 재물 강화 · 향후 흐름",
      blocks: [
        { h: "투자 체질", text: reomulInvest, accent: C.sand },
        { h: "재물을 실제로 강화하는 법", text: `${_yd["행동"] || "용신 방향의 행동을 늘려"}. 취미도 ${_yd["취미"] || "이 기운을 살리는 활동"}으로 채워. 작은 것부터 이 기운을 늘려가는 게 재물을 쌓는 가장 빠른 길이야.`, accent: C.sand },
        reomulBest ? { h: "향후 재물 피크", text: reomulBest, accent: C.sand } : null,
      ].filter(Boolean),
    },
    // IV. 연애운 3블록
    {
      label: "연애운 1", accent: C.lavender,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "지금 만나는 사람과의\n관계 구조.",
      subtitle: "연애 심층 분석 1",
      blocks: [
        { h: "연애 진단", text: desire ? desire + (desire2 ? "\n\n" + desire2 : "") : `겉으로는 별로 안 원하는 척 해. 근데 속은 달라. 진심으로 알아봐 주는 사람을 원해. 말 안 해도 알아채고, 기대 없이 챙겨주는 사람. 그런 사람한테 한번 마음 열면 완전히 열어.`, accent: C.lavender },
        { h: "나랑 부딪히는 순간", text: loveConflictHow, accent: C.lavender },
        { h: "관계가 깊어지는 시기와 위기", text: loveTiming + (loveYears ? "\n\n" + loveYears : ""), accent: C.lavender },
      ].filter(Boolean),
    },
    {
      label: "연애운 2", accent: C.lavender,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "끌리는 순간과\n잘 맞는 상대.",
      subtitle: "이상형 · 매력 분석",
      blocks: [
        attraction ? { h: "끌리는 순간", text: attraction, accent: C.lavender } : null,
        { h: "잘 맞는 상대", text: idealType ? idealType + (idealType2 ? "\n\n" + idealType2 : "") : `리드하되 강요하지 않는 사람이야. 통제받는 순간 바로 닫히는 구조라, 자연스럽게 따라가게 만드는 사람이 맞아.`, accent: C.lavender },
        relPoison ? { h: "맞지 않는 상대", text: relPoison, accent: C.lavender } : null,
      ].filter(Boolean),
    },
    {
      label: "연애운 3", accent: C.lavender,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "관계가 깊어지는 법과\n이번 생 연애 과제.",
      subtitle: "연애 심화 · 결혼 시기",
      blocks: [
        { h: "마음이 열리는 순간", text: triggers.length ? triggers.join(" ") : `나를 오래 지켜봐 온 사람이 구체적으로 알아봐 줄 때. 피상적인 칭찬이 아닌 진짜로 봤다는 느낌. 그 순간 이 사람은 완전히 무너져.`, accent: C.lavender },
        { h: "이번 생 연애 과제", text: loveWarn || "표현하는 법을 배우는 거야. 속에서 많은 게 일어나도 겉으론 안 보여. 먼저 말하는 게 어렵지만, 그걸 안 하면 계속 혼자 지치고 닫히는 패턴이 반복돼.", accent: C.lavender },
        { h: "결혼 동거 적합 시기", text: loveYears || "대운과 세운이 맞아야 제대로 된 관계가 깊어져. 지금은 성급하게 결정하기보다 관계를 쌓아가는 시기야.", accent: C.lavender },
      ].filter(Boolean),
    },
    // V. 업무운 2블록
    {
      label: "업무운 1", accent: C.caramel,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "어떤 환경에서\n실력이 빛나는지.",
      subtitle: "커리어 · 인복 · 이직운",
      blocks: [
        { h: "강점", text: careerStrength, accent: C.caramel },
        careerBest ? { h: "맞는 환경과 업종", text: careerBest + (bestEnv ? " " + mug(bestEnv) : ""), accent: C.caramel } : null,
        relGuardian ? { h: "인복과 상사운 팀복", text: relGuardian, accent: C.caramel } : null,
        { h: "이직운", text: careerTiming, accent: C.caramel },
      ].filter(Boolean),
    },
    {
      label: "업무운 2", accent: C.caramel,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "나한테 맞는 역할과\n회사 궁합.",
      subtitle: "역할 분석 · 회사 궁합",
      blocks: [
        { h: "나한테 맞는 역할", text: careerWeak + (recovery ? " " + mug(recovery) : ""), accent: C.caramel },
        companyFitText ? { h: "회사 궁합", text: companyFitText, accent: C.caramel } : null,
        mercurySign ? { h: "수성 교차", text: mercuryText, accent: C.caramel } : null,
      ].filter(Boolean),
    },
    // VI. 관계운 2블록
    {
      label: "관계운 1", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "직장에서 보이는 나와\n친구한테 보이는 내가 달라.",
      subtitle: "인간관계 심층 분석",
      blocks: [
        { h: "직장에서 보이는 나", text: relWorkFace, accent: C.iris },
        { h: "친구한테 보이는 나", text: relFriendFace, accent: C.iris },
      ].filter(Boolean),
    },
    {
      label: "관계운 2", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "귀인과 독,\n나를 소진시키는 관계.",
      subtitle: "귀인 · 관계 패턴 · 그림자",
      blocks: [
        { h: "귀인의 조건", text: relGuardian || `용신 방향의 에너지를 가진 사람이야. 같이 있으면 뭔가 잘 풀리고, 이유 없이 편한 사람. 그게 귀인이야.`, accent: C.iris },
        { h: "조심해야 할 관계", text: relPoison || `기신 방향의 에너지가 강한 사람이야. 나쁜 사람이 아닐 수 있어. 그냥 에너지가 안 맞는 거야.`, accent: C.iris },
        { h: "나를 소진시키는 패턴", text: drainPatternText, accent: C.iris },
        { h: "내가 모르는 내 모습", text: shadowText, accent: C.iris },
      ].filter(Boolean),
    },
    // VII. 애정운 (솔로 전용)
    {
      label: "애정운", accent: C.lavender,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: isSolo ? "지금 혼자라면\n언제 어떤 사람이 오는지." : "지금 관계를\n어떻게 더 깊게 만드는지.",
      subtitle: isSolo ? "솔로 전용 · 인연 시기" : "연애 중 · 관계 심화",
      blocks: isSolo ? [
        { h: "인연이 오는 시기", text: soloTimingText, accent: C.lavender },
        { h: "어디서 어떻게 만나는지", text: soloPlaceText, accent: C.lavender },
        { h: "상대의 특징", text: soloTypeText, accent: C.lavender },
        { h: "다가오는 법", text: soloApproachText, accent: C.lavender },
      ] : [
        { h: "지금 관계의 흐름", text: `${loveTiming} ${loveYears || ""}`.trim(), accent: C.lavender },
        { h: "더 깊어지는 법", text: soloApproachText, accent: C.lavender },
      ],
    },
    // VIII. 건강운 2블록
    {
      label: "건강운 1", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "타고나게 약한 부분과\n올해 조심해야 할 것.",
      subtitle: "건강 심층 분석",
      blocks: [
        { h: "타고나게 약한 장기", text: healthWeakText, accent: C.iris },
        { h: "올해 조심할 것", text: healthYearText, accent: C.iris },
        { h: "별자리 교차와 맞는 운동", text: healthExerciseText, accent: C.iris },
      ],
    },
    {
      label: "건강운 2", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "주의해야 할 계절과\n식이 방향.",
      subtitle: "계절 건강 · 식이 · 정신 건강",
      blocks: [
        { h: "주의해야 할 계절", text: healthSeasonText, accent: C.iris },
        { h: "맞는 식이 방향", text: healthFoodText, accent: C.iris },
        { h: "정신 건강", text: healthMentalText, accent: C.iris },
      ],
    },
    // IX. 가족운 + 전생업보
    {
      label: "가족운 전생업보", accent: C.sand,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "가족과의 관계와\n이번 생의 과제.",
      subtitle: "가족운 · 전생 업보 · 집안 패턴",
      blocks: [
        { h: "부모와의 관계", text: parentText, accent: C.sand },
        { h: "형제와 자녀", text: siblingText, accent: C.sand },
        { h: "집안 업보 패턴", text: familyKarmaText, accent: C.sand },
        { h: "전생업보와 이번 생의 과제", text: missionText, accent: C.sand },
      ],
    },
    // X. 대운 · 세운
    {
      label: "대운 흐름", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "언제 치고 나가고\n언제 버텨야 하는지.",
      subtitle: "대운 심층 분석",
      blocks: [
        { h: "지금 대운", text: daeunCurText, accent: C.iris },
        { h: "이 대운의 의미", text: daeunMeaning, accent: C.iris },
        { h: "다음 전환점", text: daeunNextText || `대운이 바뀌는 시점이 곧 온다는 것만 알아도 지금 준비하는 방식이 달라져.`, accent: C.iris },
        daeunFlow ? { h: "대운 전체 흐름", text: daeunFlow, accent: C.iris } : null,
      ].filter(Boolean),
    },
    {
      label: "월별 세운", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "이번 달부터 12개월\n카테고리별로 다 보여.",
      subtitle: "세운 월별 분석",
      blocks: [
        { jsxContent: <Monthly months={monthForecast} yongsinA={yongsinA} gisinA={gisinA} />, accent: C.iris },
      ],
    },
  ]

  const chapters = [...freeChapters, ...lockedChapters]
  const freeCount = freeChapters.length
  const ch = chapters[current]

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
          <button onClick={onHome} style={{ background: "none", border: "none", color: C.caramel, fontSize: 18, cursor: "pointer", padding: 0 }}>🏠</button>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 480, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {chapters.map((_, i) => (
            <div key={i} style={{ width: i === current ? 18 : 5, height: 4, borderRadius: 2, background: i >= freeCount ? C.plum : i === current ? C.caramel : C.ember, transition: "all 0.3s ease" }} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.fog, fontFamily: FONT_SANS, fontWeight: 400 }}>{current + 1} / {chapters.length}</div>
      </div>

      <div style={{ width: "100%", maxWidth: 480, perspective: 1200, flex: 1 }}>
        <ChapterCard {...ch} flipping={flipping} flipDir={flipDir} />
      </div>

      <div style={{ width: "100%", maxWidth: 480, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
        <button onClick={() => goTo(-1)} disabled={current === 0} style={{ background: current === 0 ? "transparent" : C.ember, border: `1px solid ${current === 0 ? C.fog : C.walnut}`, borderRadius: 10, padding: "11px 18px", color: current === 0 ? C.fog : C.sand, fontSize: 13, cursor: current === 0 ? "default" : "pointer", fontFamily: FONT_SANS, fontWeight: 400, transition: "all 0.2s" }}>이전</button>
        <div style={{ fontSize: 10, color: C.fog, fontFamily: FONT_SANS, textAlign: "center", fontWeight: 400 }}>
          {ch.label}{current >= freeCount && <span style={{ color: C.plum }}> · 유료</span>}
        </div>
        <button onClick={() => goTo(1)} disabled={current === chapters.length - 1} style={{ background: current === chapters.length - 1 ? "transparent" : C.walnut, border: `1px solid ${current === chapters.length - 1 ? C.fog : C.caramel}`, borderRadius: 10, padding: "11px 18px", color: current === chapters.length - 1 ? C.fog : C.parchment, fontSize: 13, cursor: current === chapters.length - 1 ? "default" : "pointer", fontFamily: FONT_SANS, fontWeight: 400, transition: "all 0.2s" }}>다음</button>
      </div>

      {current === 0 && <div style={{ marginTop: 10, fontSize: 11, color: C.fog, fontFamily: FONT_SANS, letterSpacing: 1, textAlign: "center", fontWeight: 400 }}>버튼을 눌러 챕터를 넘겨봐</div>}
    </div>
  )
}
