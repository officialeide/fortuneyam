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

const OHK_KR = { 목: "나무", 화: "불", 토: "흙", 금: "금", 수: "물" }
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

const YONGSIN_DETAIL = {
  "목": {"업종": "교육, 출판, 작가, 콘텐츠 창작, 인테리어, 조경, 의류, 패션, 기획, 스타트업, 코칭", "행동": "새로운 걸 배우고 시작하는 데서 기운이 살아나. 책을 읽고, 강의를 듣고, 안 해본 프로젝트에 손을 대.", "취미": "등산, 원예, 독서, 글쓰기, 악기 배우기", "피해야할것": "너무 많이 벌여놓고 마무리를 못 하는 거야. 한 가지에 집중해야 결실이 나."},
  "화": {"업종": "방송, 엔터테인먼트, 뷰티, 마케팅, 강연, 홍보, 요식업, 전기, 에너지", "행동": "사람들 앞에 나서는 데서 기운이 살아나. 발표하고, 빛나는 자리에 서고, 적극적으로 사람을 만나.", "취미": "댄스, 노래, 요리, 사진, 유튜브, 공연 관람", "피해야할것": "너무 빠르게 소진되는 거야. 충전 없이 계속 태우면 번아웃이 와."},
  "토": {"업종": "부동산, 건축, 토목, 농업, 의료, 컨설팅, 중개업, 유통, 식품, 요양, 복지", "행동": "기반을 다지는 데서 기운이 살아나. 부동산을 공부하고, 자격증을 따고, 꾸준히 저축하며 안정적인 루틴을 만들어.", "취미": "요리, 텃밭 가꾸기, 도예, 봉사활동, 명상", "피해야할것": "변화에 너무 느리게 반응하는 거야. 한번 굳으면 안 바뀌는 게 약점이야."},
  "금": {"업종": "법, 금융, 제조, 기계, 외과, 군경, 스포츠, 정밀 기계, 귀금속, IT 하드웨어", "행동": "원칙을 세우고 지키는 데서 기운이 살아나. 계약서를 꼼꼼히 보고, 법을 공부하고, 규칙적으로 몸을 단련해.", "취미": "격투기, 검도, 퍼즐, 정밀 공작, 수집", "피해야할것": "너무 날이 서있는 거야. 타협을 못 하면 주변과 부딪혀."},
  "수": {"업종": "무역, 유통, 해운, 여행, IT, 연구, 심리상담, 예술, 영성, 물 관련 사업", "행동": "유연하게 흐르는 데서 기운이 살아나. 새로운 정보를 모으고, 여행을 다니고, 사람들과 넓게 연결돼.", "취미": "수영, 낚시, 요가, 명상, 글쓰기, 여행", "피해야할것": "방향 없이 흘러다니는 거야. 목표가 없으면 에너지가 흩어져."},
  "화·토": {"업종": "의료, 요식업, 부동산, 에너지, 마케팅, 유통, 건설, 뷰티, 교육", "행동": "열정적으로 일하되 안정적인 기반을 쌓는 게 맞아. 자격증을 따고, 꾸준히 저축하고, 사람들과의 인연을 잘 관리해.", "취미": "요리, 원예, 댄스, 봉사활동", "피해야할것": "시작만 하고 마무리를 못 하는 거야."},
  "목·화": {"업종": "교육, 출판, 창작, 방송, 마케팅, 강연, 기획, 콘텐츠 제작", "행동": "배우고 나누는 데서 기운이 살아나. 가르치고, 발표하고, 사람들과 함께 새 프로젝트를 벌여.", "취미": "독서, 강의, 글쓰기, 퍼포먼스, 유튜브", "피해야할것": "산만하게 에너지를 흩뿌리는 거야."},
  "금·수": {"업종": "금융, IT, 무역, 연구, 귀금속, 해운, 데이터 분석, 컨설팅", "행동": "분석하고 판단하는 데서 기운이 살아나. 투자를 공부하고, 자격증을 따고, 해외로 네트워크를 넓혀.", "취미": "바둑, 체스, 코딩, 독서, 여행", "피해야할것": "너무 냉정하게만 판단하는 거야."},
  "수·목": {"업종": "IT, 교육, 여행, 창작, 연구, 심리상담, 플랫폼, 미디어", "행동": "배우고 흘려보내는 순환에서 기운이 살아나. 지식을 쌓고 그걸 다시 나누는 흐름이 이 사주를 살려.", "취미": "독서, 여행, 수영, 글쓰기, 강의 듣기", "피해야할것": "계속 배우기만 하고 실행을 안 하는 거야."},
  "토·금": {"업종": "건축, 법, 금융, 제조, 농업, 컨설팅, 의료, 부동산, 물류", "행동": "기반을 다지고 원칙을 지키는 데서 기운이 살아나. 계약과 법을 챙기고, 재테크와 자격증으로 실체를 쌓아.", "취미": "도예, 정밀 공작, 격투기, 명상, 요리", "피해야할것": "너무 보수적으로만 가는 거야."}
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
  목: "목 기운이 약한데, 봄에는 간과 담낭이 먼저 지쳐. 춘곤증이 유독 심하게 오거나 피로가 만성적으로 쌓이기 쉬우니 이 시기에 무리하지 마.",
  화: "화 기운이 약한데, 여름에는 심장과 혈액순환에 부담이 와. 수분을 충분히 챙기고 과격한 운동은 피하는 게 좋아.",
  토: "토 기운이 약한데, 환절기마다 소화기와 컨디션이 흔들려. 계절이 바뀔 때일수록 규칙적으로 챙겨 먹어야 해.",
  금: "금 기운이 약한데, 가을에는 폐와 대장이 약해져. 호흡기 관리에 특히 신경 써.",
  수: "수 기운이 약한데, 겨울에는 체력이 빨리 떨어져. 체온 유지랑 규칙적인 생활 리듬이 중요해.",
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
  편인: "독립적이고 개인적인 공간을 존중하는 분위기, 또는 부모와 물리적, 정서적 거리가 있었을 가능성이 커.",
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
function MangseTable({ pillars, noTime, highlightIlju }) {
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
  // 일주(index 2) 글자색 강조 (배경 없음)
  const iljuCol = (i) => ({})
  const iljuHanja = (i) => (highlightIlju && i === 2) ? { ...hanjaStyle, color: C.caramel } : hanjaStyle
  const iljuKo = (i) => (highlightIlju && i === 2) ? { ...koStyle, color: C.caramel } : koStyle
  return (
    <div style={{ marginBottom: 16, background: C.dusk, borderRadius: 12, padding: "12px 8px", border: `1px solid ${C.ember}` }}>
      <div style={{ display: "flex" }}>
        {cols.map(i => (
          <div key={"h" + i} style={{ ...cell, fontSize: 10, color: (highlightIlju && i === 2) ? C.caramel : C.fog, fontFamily: FONT_SANS, fontWeight: (highlightIlju && i === 2) ? 600 : 400 }}>{colHead[i]}</div>
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
      <div style={{ height: 1, background: C.ember, margin: "8px 0" }} />
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
        <div style={{ fontSize: 12, color: C.sand, fontFamily: FONT_SANS, marginTop: 4 }}>{best.ganji || ""} · {best.score}점</div>
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
      <div style={{ fontSize: 12, color: C.fog, fontFamily: FONT_SANS, textAlign: "center" }}>막대가 높을수록 크게 열리는 대운이야. 밝게 빛나는 막대가 지금 대운.</div>
    </div>
  )
}

function CategoryScore({ months, category, thisYearScore, label }) {
  // months: monthForecast 배열, category: '재물'|'애정'|'커리어'|'건강'|'관계'
  const vals = (months || []).map(m => ({ label: m.label, ganji: m.ganji, score: category === "종합" ? (m.score || 0) : ((m.areas && m.areas[category]) || 0), isThis: m.isThis }))
  const best = vals.reduce((a, b) => (b.score > (a?.score || 0) ? b : a), null)
  const col = (s) => s >= 80 ? C.lavender : s >= 65 ? C.iris : C.walnut
  const yr = thisYearScore || 0
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: C.ash, fontFamily: FONT_SANS }}>올해 {label}</span>
        <span style={{ fontSize: 28, color: col(yr) === C.walnut ? C.sand : col(yr), fontFamily: FONT, fontWeight: 600 }}>{yr}</span>
        <span style={{ fontSize: 13, color: C.ash, fontFamily: FONT_SANS }}>점</span>
      </div>
      <div style={{ fontSize: 11, color: C.fog, fontFamily: FONT_SANS, marginBottom: 8 }}>앞으로 12개월 흐름</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 70, marginBottom: 8 }}>
        {vals.map((v, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <div style={{ width: "70%", height: `${Math.max(6, v.score)}%`, background: v.isThis ? C.sand : col(v.score), borderRadius: 3 }} />
            <div style={{ fontSize: 8, color: v.isThis ? C.sand : C.fog, fontFamily: FONT_SANS, marginTop: 3 }}>{(v.label || "").split(".")[1] || ""}</div>
          </div>
        ))}
      </div>
      {best && (
        <div style={{ fontSize: 13, color: C.parchment, fontFamily: FONT, lineHeight: 1.7, marginTop: 8 }}>
          이 중 {best.label?.replace(".", "년 ")}월이 {yr >= 70 ? "제일 강해" : "그나마 가장 나아"}. {ACTION_HINT[category] || "중요한 일을 벌일 거면 이때를 노려."}
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

function Block({ h, text, kw, jsxContent, accent, last }) {
  if (!text && !h && !jsxContent) return null
  return (
    <div style={last ? {} : dvd}>
      {h && <div style={hdg(accent || C.caramel)}>{h}</div>}
      {kw && <div style={{ fontSize: 15, color: C.caramel, fontFamily: FONT, fontWeight: 600, marginBottom: 6, letterSpacing: 1 }}>{kw}</div>}
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

export default function MoraReport({ d, onHome, onSavePDF, pdfLoading, pdfMode, parentAstroAI, setParentAstroAI, parentTarotAI, setParentTarotAI }) {
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
  // 본문 표시용: 오행 두 개 병기 시 가운뎃점 대신 콤마 (조회/분기 로직은 원본 yongsinA/gisinA 유지)
  const yongsinD = yongsinA.replace(/·/g, ", ")
  const gisinD = gisinA.replace(/·/g, ", ")

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
  const ichingBodyText = `지금 이 사주에는 ${_ichingNatureRaw}의 기운이 흐르고 있어.${ichingStrategy.length ? " " + ichingStrategy.join(" ") : ""}`

  // 일주 설명
  const iljuDescStd = mug(isBnd ? bnd.standardDesc : (sajuSys.desc || ""))
  const iljuDescMid = mug(bnd?.midnightDesc || "")

  // 당사주
  const dansajuPillars = d.dansaju?.pillars || []
  const dansajuText = (() => {
    if (!dansajuPillars.length) return ""
    const stars = dansajuPillars.map(p => p.byeolseong?.split("(")[0].replace(/\([^)]*\)/g, "").trim() || "").filter(Boolean)
    const kws = dansajuPillars.map(p => p.kw || "").filter(Boolean)
    return `별이 네 개야. ${stars.join(", ")} 순서로 흘러가. ${kws.slice(0, 2).map(k => k.replace(/·/g, ", ")).join("과 ")}의 기운이 삶의 뼈대를 만드네.`
  })()

  // 별자리 텍스트 한자 완전 제거
  const astroSunText = sunSign ? mug(a.sunDesc || "") : ""
  const astroMoonText = moonSign ? mug(a.moonDesc || "") : ""
  const astroAscText = ascSign ? mug(a.ascDesc || "") : ""

  // 타로
  const tarotLifeText = mug(t.lifePathDesc || tarotSys.desc || "")
  const tarotSoulText = mug(t.soulDesc || "")
  const tarotCardName = (t.lifePathCard || "본명 카드").replace(/\([^)]*\)/g, "").trim()
  // 동서양 종합 결론 (다섯 관점 통합)
  const fiveViewText = `사주는 ${dominant ? OHK_KR[dominant] : ""} 기운의 사람이라 말하고, 당사주와 토정비결도 비슷한 결을 짚어. 서양 별자리는 태양 ${sunSign || "별자리"}로 같은 기질을 다른 언어로 그려내고, 타로 생명경로수는 ${tarotCardName} 카드로 그 삶의 방향을 다시 확인해. 동양은 기운으로, 서양은 별과 상징으로 읽었지만, 다섯 관점이 가리키는 건 결국 한 사람이야. 서로 다른 지도가 같은 목적지를 가리킬 때, 그게 진짜라는 증거야. 어느 하나에 매이지 말고, 다섯이 겹쳐 말하는 큰 방향을 믿고 가.`

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
    const sajuLabel = sajuStable ? "기반을 다지고 지키는 안정" : dominant === "수" ? "깊이 사색하고 유연하게 흐르는" : "새로 벌이고 밀어붙이는 확장"
    // 별자리(원소) 성향
    const elem = sunSign ? _SUN_ELEM[sunSign] : null
    const astroOutward = elem === "불" || elem === "공기"
    const astroLabel = !elem ? null : astroOutward ? "밖으로 뻗고 변화를 좇는" : "안으로 다지고 안정을 찾는"
    // 타로 생명경로수 성향
    const lp = parseInt(t.lifePath || "0")
    const tarotDrive = [1, 3, 5].includes(lp) ? "개척" : [2, 4, 6, 8].includes(lp) ? "안정" : lp ? "성찰" : null
    // 사주 vs 별자리 긴장
    const clash = astroLabel && (sajuStable === !astroOutward ? false : true)
    let body
    if (!elem) {
      body = `이 사주는 ${sajuLabel} 기운이 중심이야. 다만 태어난 시간이 없어 별자리까지 겹쳐 볼 수는 없으니, 동양의 결 안에서도 서로 밀고 당기는 두 힘을 함께 봐. 안정을 원하면서 동시에 더 뻗고 싶은 마음, 그 사이의 진폭이 이 사람의 입체감이야.`
    } else if (clash) {
      body = `사주는 ${sajuLabel}을 말하는데, 별자리는 ${astroLabel} 기질을 가리켜. 방향이 정반대로 엇갈리지. 근데 이 어긋남이 결함이 아니야. 한쪽으로만 쏠린 사람은 납작한데, 이 사주는 두 힘이 팽팽하게 당겨서 입체가 생겨. ${tarotDrive ? `타로 생명경로수는 ${tarotDrive}의 결이라 여기에 또 다른 각도를 얹어. ` : ""}겉으로 안정을 지키면서 속으로는 딴 세상을 꿈꾸는 사람, 그 낙차가 매력이자 평생의 숙제야. 하지만 이 간극을 억지로 하나로 누르지 마. 두 힘을 다 쓰는 법을 익히는 게 이번 생의 과제야.`
    } else {
      body = `사주도 별자리도 ${sajuLabel} 쪽으로 결이 비슷하게 모여. 드물게 안팎이 한 방향인 구조라, 흔들려도 결국 제자리를 찾아와. ${tarotDrive ? `타로 생명경로수의 ${tarotDrive} 기운만 살짝 다른 각을 주는데, ` : ""}그 작은 어긋남이 지루함을 깨는 변주야. 하지만 방향이 뚜렷한 만큼 한번 어긋난 길로 가면 스스로도 못 견뎌. 큰 방향을 믿고 가되, 가끔은 딴길의 신호도 무시하지 마.`
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
  const personaHook = isSingang
    ? `겉으론 강해 보여도 속은 안 그래. 남들 앞에선 다 괜찮은 척, 알아서 잘하는 척하지만 정작 속마음은 아무한테도 안 보여주지. 책임감 때문에 혼자 다 짊어지고, 힘들어도 티 안 내다가 안에서 곪아. 맞지? 싫은 소리 못 하고 끌어안다가 정작 자기를 놓치는 순간이 많아. 근데 그게 타고난 그릇이야. 무너질 것 같아도 결국 버텨내고 마는 사람. 그 뚝심이 이 사주의 진짜 힘이야.`
    : `겉은 무던하고 유순해 보여도 속은 훨씬 복잡해. 생각이 많고, 남들은 그냥 넘기는 걸 혼자 곱씹고 담아두지. 정 주면 끝까지 주는데, 상처받으면 표현 없이 조용히 마음을 닫아. 맞지? 남 눈치는 빠르면서 정작 자기 마음은 스스로도 잘 모를 때가 많아. 근데 그 깊이가 무기야. 남들이 못 보는 걸 먼저 읽어내고, 결국 자기 길을 찾아가는 사람. 그게 이 사주의 결이야.`
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
  const reomulStructure = isSingang
    ? `에너지가 집중된 구조야. 돈 잡으면 오래 쥐고 있어. 근데 욕심이 화근이야. 한 번에 다 가지려다 날리는 패턴, 이미 경험했지?`
    : `에너지가 분산된 구조야. 돈이 들어와도 손에 안 남아. 구조가 그래. 잘못이 아닌데 이 패턴 모르면 평생 반복돼.`
  const reomulYongsin = yongsinA ? `살길은 ${yongsinD} 기운이야. 이 방향으로 가야 돈이 따라와. 거슬러 가면 아무리 열심히 해도 제자리야.` : ""
  const _gd = GISIN_DETAIL[gisinA] || GISIN_DETAIL[gisinA?.split("·")[0]] || {}
  const reomulGisin = gisinA
    ? `${gisinD} 기운은 돈을 새게 만들어. 이쪽으로 가면 힘만 빼는 거야.\n피해야 할 업종은 ${_gd["업종"] || gisinD + " 방향의 분야"} 쪽이야. 아무리 조건이 좋아도 이 방향은 에너지가 새.\n하지 말아야 할 건 ${_gd["행동"] || "이 기운의 방향으로 무리하게 가는 거야."}\n조심해야 할 사람은 ${_gd["사람"] || gisinD + " 기운이 강한 사람"}이야. 가까이 둘수록 재물이 막혀.`
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
  const _daeunLabel = curDaeun ? (curDaeun.label?.replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim()) : ""
  // 이 대운의 의미 — 대운 오행이 용신/기신 중 무엇인지로 판단
  const _HANJA2KR_D = { 木:"목",火:"화",土:"토",金:"금",水:"수" }
  const _curDaeunO = curDaeun ? (_HANJA2KR_D[curDaeun.ohaeng] || curDaeun.ohaeng || "") : ""
  const _yongList = (yongsinA || "").split("·")
  const _giList = (gisinA || "").split("·")
  const daeunMeaning = curDaeun
    ? (_yongList.includes(_curDaeunO)
        ? `이 대운은 용신인 ${_curDaeunO} 기운이 들어오는 구간이야. 십 년 중 가장 크게 치고 나갈 수 있는 시기라, 미뤄뒀던 일을 벌이고 판을 키워야 해. 이때 쌓은 게 평생 가.`
        : _giList.includes(_curDaeunO)
        ? `이 대운은 기신인 ${_curDaeunO} 기운이 강해지는 구간이야. 무리하게 확장하면 힘만 빠져. 새 판을 벌이기보다 실력을 다지고 다음 대운을 준비하는 게 이 십 년을 잘 쓰는 법이야.`
        : `이 대운의 ${_curDaeunO} 기운은 용신도 기신도 아닌 중립 구간이야. 크게 흔들리지 않는 대신 저절로 풀리지도 않아. 스스로 방향을 정하고 꾸준히 밀고 가는 사람이 결과를 만들어.`)
    : ""
  const _curDaeunTheme = curDaeun ? (() => {
    const map = { "목":"새로 싹트고 뻗어나가는 성장", "화":"재능을 드러내고 이름을 알리는 표현과 확장", "토":"기반을 다지고 중심을 세우는 안정", "금":"결실을 거두고 매듭짓는 수확", "수":"깊이 사색하고 다음을 준비하는 재충전" }
    return map[_curDaeunO] || "흐름을 다지는"
  })() : ""
  const daeunCurText = curDaeun
    ? `지금은 ${_daeunLabel} 대운이야 (${curDaeun.period || ""}). ${_curDaeunTheme}의 시기라 타고난 재능을 펼쳐 보이기 좋은 흐름이야. ${daeunMeaning}`
    : "대운 읽는 중이야."
  const _birthYear = parseInt((d.birth || "").match(/(\d{4})년/)?.[1] || "0")
  const _ageStart = (pd) => { const mch = (pd || "").match(/만\s*(\d+)/); return mch ? parseInt(mch[1]) : null }
  const _daeunYear = (pd) => { const a = _ageStart(pd); return (_birthYear && a != null) ? _birthYear + a : null }
  const _nextStartYear = nextDaeun ? _daeunYear(nextDaeun.period) : null
  const daeunNextText = nextDaeun
    ? `다음은 ${nextDaeun.label?.replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim()} 대운이야. ${_nextStartYear ? `${_nextStartYear}년(${nextDaeun.period})부터 흐름이 바뀌어. ` : ""}그 전에 지금 대운에서 쌓아둔 게 다음 십 년을 결정해. 전환점이 오기 전에 지금 이 시기를 알차게 써야 해. 미뤄둔 게 있으면 이 대운 안에 끝내라는 뜻이야.`
    : "곧 대운이 바뀌는 시점이 와. 지금 쌓아둔 게 다음 십 년을 결정하니까, 이 시기를 알차게 써야 해."
  const daeunFlow = futureDaeun.map(dv => { const lb = dv.label?.replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim(); const pd = dv.period || (dv.startAge ? `만 ${dv.startAge}~${Number(dv.startAge)+9}세` : ""); const yr = _daeunYear(pd); return `${lb} ${yr ? yr + "년~ " : ""}${pd}${dv.cur ? " (지금)" : ""}` }).join("\n")
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
  // 임의의 명식(경계 mid 포함)에 대해 오행 분석 풀버전을 동일 포맷으로 생성 — 첫째/둘째 해석 길이 일관성
  const mkOhaengFull = (ohMap, dom) => {
    if (!ohMap) return ohaengFull
    const missing = ["목", "화", "토", "금", "수"].filter(k => !ohMap[k])
    const domCnt = ohMap[dom] || 0
    const domTrait = OHK_STRONG_TRAIT[dom] || OHK_DESC[dom] || ""
    const missTraits = missing.map(k => OHK_MISSING_TRAIT[k]).filter(Boolean)
    const missPart = missing.length
      ? ` 대신 ${missing.map(k => OHK_KR[k]).join(", ")} 기운이 아예 없어. ${_josaIga(missTraits.join(", "))} 비어있는 구조라, 이 부분을 의식적으로 채워야 균형이 잡혀.`
      : " 오행이 크게 치우치지 않고 고르게 갖춰진 편이라, 상황에 맞게 여러 기운을 꺼내 쓸 수 있는 구조야."
    return `${_josaEunNeun(OHK_KR[dom] || dom)} ${domCnt}개로 이 명식에서 가장 강한 기운이야. ${domTrait}${missPart}`
  }

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
  const healthYearText = `${thisYear.year || new Date().getFullYear()}년 건강 ${healthYearScore}점이야. ${gisinA ? `${gisinD} 기운이 강해지는 시기엔 ${OHK_ORGAN[gisinA?.split("·")[0]] || "몸"}에 부담이 갈 수 있어.` : ""} 잘 때 잘 자는 게 제일 중요해. 수면이 무너지면 다 무너지는 구조야.`
  const healthExercise = OHK_EXERCISE[yongsinA] || OHK_EXERCISE[yongsinA?.split("·")[0]] || "규칙적인 유산소와 스트레칭"
  const healthExerciseText = `달이 ${moonSign || "감정의 별자리"}에 있는 만큼, 규칙적인 생활 리듬이 건강의 핵심이야. ${healthExercise}${_hasJong(healthExercise) ? "이" : "가"} 맞아. 강도보다 꾸준함이 훨씬 중요해.`
  const healthSeasonText = healthWeakOh.map(k => OHK_SEASON_WARN[k]).filter(Boolean).join("\n") || "특별히 취약한 계절 없이 사계절 무난하게 지나가는 구조야."
  const healthFoodText = `${yongsinD || ""} 기운을 올려주는 음식이 맞아. ${OHK_FOOD[yongsinA] || OHK_FOOD[yongsinA?.split("·")[0]] || "제철 음식"}. 따뜻하게 먹는 것이 중요해. 커피는 하루 한 잔 이하로 줄이는 게 좋고, 과음은 이 사주에서 건강을 제일 빠르게 망가뜨려.`
  const healthMentalText = isSingang
    ? "에너지가 밖으로 향하는 구조라, 쉬지 않고 계속 움직이려는 경향이 있어. 의식적으로 멈추는 연습이 정신 건강 관리야. 몸을 쉬게 하는 것도 능력이야."
    : "혼자 담아두는 것이 많은 구조야. 표현하지 않으면 몸으로 나와. 글쓰기, 일기, 가까운 사람한테 털어놓기가 정신 건강 관리야. 의식적으로 혼자만의 회복 시간이 필요해."

  // 가족운 + 전생업보 (IX)
  const yeonSibsong = d.pillars?.[0]?.gan?.sibsong || ""
  const wolSibsong = d.pillars?.[1]?.gan?.sibsong || ""
  const parentText = SIBSONG_PARENT[yeonSibsong] || "부모와의 관계는 태어난 환경에 따라 다양한 모양을 가져. 지금의 나를 만든 뿌리 중 하나야."
  const siblingText = SIBSONG_SIBLING[wolSibsong] || SIBSONG_SIBLING[yeonSibsong] || "형제자매와는 각자의 속도로 살아가는 관계야."
  const familyKarmaText = `${dominant ? OHK_KR[dominant] : ""} 기운이 강한 집안에서 태어났어. ${(OHK_STRONG_TRAIT[dominant] || "").split(".")[0]}. 이런 기질이 대대로 이어져 내려온 흐름일 가능성이 커. 이게 개인만의 문제가 아니라 집안 전체에 흐르는 결이라는 얘기야.`
  // 가족운 3페이지 확장용
  const childhoodText = (() => {
    const yj = d.pillars?.[0]?.ji?.sibsong || ""
    if (["편인","정인"].includes(yj)) return "유년기에 보살핌과 관심을 넉넉히 받고 자란 편이야. 부모나 조부모의 사랑이 두터웠고, 그 안정감이 지금의 뿌리가 됐어. 대신 기대와 간섭이 함께 컸을 수도 있어."
    if (["편관","정관"].includes(yj)) return "유년기에 규율과 기대 속에서 자란 편이야. 엄한 분위기나 책임감 있는 환경이 일찍 철들게 만들었어. 어른스러웠던 만큼 어리광을 부릴 틈은 적었을 수 있어."
    if (["편재","정재"].includes(yj)) return "유년기에 현실적이고 활기찬 가정에서 자란 편이야. 부모가 바쁘게 움직이며 살림을 꾸렸고, 그 속에서 생활력을 일찍 배웠어."
    if (["식신","상관"].includes(yj)) return "유년기에 자유롭고 표현이 허용되는 분위기에서 자란 편이야. 하고 싶은 걸 펼칠 여지가 있었고, 그게 지금의 창의성으로 이어졌어."
    return "유년기의 가정 분위기가 지금의 정서적 뿌리를 만들었어. 그 시절의 경험이 관계를 맺는 방식에 그대로 남아 있어."
  })()
  const spousePalaceText = (() => {
    const ilji = d.pillars?.[2]?.ji?.sibsong || ""
    if (["편재","정재"].includes(ilji)) return "배우자 자리에 재성이 앉아 있어. 현실적이고 생활력 있는 짝을 만날 가능성이 커. 배우자가 재물운을 밀어주는 구조라 결혼 후 경제적으로 안정되는 흐름이야."
    if (["편관","정관"].includes(ilji)) return "배우자 자리에 관성이 앉아 있어. 듬직하고 책임감 있는 짝, 사회적으로 인정받는 상대를 만날 가능성이 커. 배우자가 나를 세워주는 구조야."
    if (["편인","정인"].includes(ilji)) return "배우자 자리에 인성이 앉아 있어. 따뜻하고 나를 챙겨주는 짝, 정신적으로 기댈 수 있는 상대를 만날 가능성이 커."
    if (["식신","상관"].includes(ilji)) return "배우자 자리에 식상이 앉아 있어. 표현이 풍부하고 함께 있으면 즐거운 짝을 만날 가능성이 커. 대신 서로의 자유를 존중해야 오래가."
    return "배우자 자리의 기운을 보면, 서로 다른 결을 채워주는 짝과 인연이 깊어. 나에게 없는 걸 가진 사람에게 끌려."
  })()
  const familyLineageText = `집안 내림을 보면, ${dominant ? OHK_KR[dominant] : ""} 기운의 장점과 그늘이 대를 이어 흐르고 있어. 윗대에서 못다 푼 숙제가 나에게 넘어온 셈인데, 그걸 알아차리고 끊어내는 게 이번 생에서 내가 맡은 몫이야. 같은 패턴을 반복하지 않는 것, 그게 가문의 흐름을 바꾸는 시작이야.`
  const missionText = missingOh.length
    ? `${missingOh.map(k => OHK_KR[k]).join(", ")} 기운이 비어있는 구조야. 전생에서 ${OHK_KR[dominant]} 기운은 충분히 쌓았다면, 이번 생의 과제는 부족한 그 기운을 채우는 거야. ${_missTraits.length ? _josaEul(_missTraits.join(", ")) + " 이번 생에서 배우고 익히라고 이렇게 태어난 거야." : "그 기운을 이번 생에서 배우고 익히라고 이렇게 태어난 거야."}`
    : "오행이 고르게 갖춰진 채로 태어났어. 전생에 어느 한쪽으로 치우쳤던 걸 이미 다 풀어냈다는 뜻이야. 이번 생의 과제는 이 균형을 잘 지키면서 그릇을 더 키우는 거야."

  // 애정운 솔로 전용 (VII)
  const isSolo = d.isSolo !== false
  const hasYeokma = (d.sinsal || []).some(s => (s.name || "").includes("역마"))
  const soloTimingText = curDaeun
    ? `${nextDaeun ? `${nextDaeun.label?.replace(/[一-龯\u4E00-\u9FFF（(][^）)]*[）)]/g, "").trim()} 대운` : "다가오는 대운"}에서 제대로 된 인연이 들어올 가능성이 높아. 세운으로 보면 ${bestYear ? `${bestYear.year}년` : "향후 몇 년"}이 애정운 피크야. 억지로 만들려고 하면 안 맞는 사람이 와. 지금은 나를 쌓아가는 시간이야.`
    : "인연이 들어오는 시기가 따로 있어. 지금은 나를 쌓아가는 시간이야."
  const soloPlaceText = hasYeokma
    ? "역마살이 있어서 이동하고 변화하는 환경에서 인연을 만나. 여행, 이직, 이사 같이 뭔가 바뀌는 시점이야. 앱이나 소개팅보다 일 관련 자리, 스터디, 전문직 모임에서 자연스럽게 만나는 인연이 오래가."
    : "일상적인 관계 속에서 인연이 자라나는 구조야. 급하게 새로운 사람을 만나려 하기보다, 이미 아는 사람들 사이에서 뜻밖의 인연이 시작될 가능성이 커."
  const soloTypeText = idealType || (yongsinA ? `${yongsinD} 기운이 강한 사람이 인연이야. 따뜻한 인상, 믿음직한 분위기, 화려하지 않아도 존재감이 있는 사람. 처음엔 밋밋해 보여도 알수록 깊어지는 사람이 진짜 인연이야.` : "말보다 행동으로 보여주는 사람이 인연이야.")
  const soloApproachText = "처음엔 절대 티 내지 마. 천천히 신뢰를 쌓아야 해. 빠르게 밀어붙이면 바로 닫혀. 말보다 행동으로, 꾸준하게, 부담 없이 곁에 있어주는 방식이 유일하게 먹혀."

  // 업무운 2 - 수성 교차, 회사 궁합
  const mercurySign = a.mercury && a.mercury !== "분석 중" ? zodiacFix(a.mercury) : null
  const mercuryText = mercurySign ? mug(a.mercuryDesc || "") : "수성 위치를 읽는 중이야."
  const companyFitText = yongsinA
    ? `회사 업종이 ${yongsinD} 방향인지 먼저 봐. ${(YONGSIN_DETAIL[yongsinA] || YONGSIN_DETAIL[yongsinA?.split("·")[0]] || {})["업종"] || yongsinJobMap[yongsinA] || ""} 계열 회사가 맞아. ${gisinA ? `${gisinD} 방향인 ${(GISIN_DETAIL[gisinA]||{})["업종"] || "회사"}는 아무리 조건이 좋아도 에너지가 지속적으로 새.` : ""}`
    : ""

  // 관계운 2 - 소진 패턴, 그림자
  const drainPatternText = isSingang
    ? "에너지가 밖으로 향하는 구조라, 남의 부탁을 거절 못 하고 계속 떠안다가 소진돼. 내 몫이 아닌 것까지 짊어지는 패턴을 알아채는 게 먼저야."
    : "주변의 감정을 쉽게 흡수하는 구조야. 감정적으로 힘든 사람 곁에 있으면 나도 모르게 같이 힘들어져. 받는 것 없이 주기만 하는 관계는 일찍 정리해야 해."
  const shadowText = challenges.length
    ? `${challenges[0]} 기신 구간에서 스트레스를 받을 때 이게 더 강하게 나와. 의식적으로 유연함을 연습해야 해.`
    : "본인은 원칙을 지킨다고 생각하는데 타인 눈에는 고집스럽게 보이는 경우가 있어. 의식적으로 유연함을 연습해야 해."

  // ── 챕터 구성 ──
  // 사주 분석 챕터 (일반/경계 공통 빌더) — 오행 분석 먼저, 그다음 일주 분석
  const mkSajuChapter = (opts) => ({
    label: opts.label, accent: opts.accent,
    tag: opts.tag, tagColor: opts.tagColor, tagText: opts.tagText,
    title: opts.title,
    subtitle: "사주 명식 · 오행 분석",
    extra: <><MangseTable pillars={opts.pillars} noTime={d.noTime} highlightIlju /><DonutChart ohaeng={opts.ohaeng || ohaeng} dominant={opts.dominant || dominant} hideDesc /></>,
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
        { h: "더 맞는 쪽", text: "둘 다 읽어봐. 어느 쪽이 더 내 얘기 같은지는 본인이 제일 잘 알아. 둘 다 맞기도 해. 그게 경계 사주야.", accent: C.iris },
      ],
    },
    mkSajuChapter({ label: `${bnd.stdIlju || ""} 첫 번째 해석`, accent: C.caramel, tag: bnd.stdIlju || "첫째", tagColor: C.mahogany, tagText: C.sand, title: "첫 번째 해석,\n나와 더 닮은 쪽.", pillars: d.pillars, iljuDesc: iljuDescStd }),
    mkSajuChapter({ label: `${bnd.midIlju || ""} 두 번째 해석`, accent: C.iris, tag: bnd.midIlju || "둘째", tagColor: C.abyss, tagText: C.lavender, title: "두 번째 해석,\n겉과 속의 차이.", pillars: d.pillarsB || d.pillars, iljuDesc: iljuDescMid, ohaeng: _midOhaeng, dominant: _midDominant, ohaengFull: _midOhaengFull }),
  ] : [
    mkSajuChapter({ label: "사주 분석", accent: C.caramel, tag: sajuTag, tagColor: C.mahogany, tagText: C.sand, title: `${sajuTag}.\n타고난 판이 이렇게 짜여 있어.`, pillars: d.pillars, iljuDesc: iljuDescStd }),
  ]

  // I. 성격 요약 (무료 첫 페이지 · 후킹용 보편화)
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
  const reomulType = isSingang
    ? `에너지가 집중된 구조야. 일단 방향이 잡히면 돈을 잡고 오래 쥐고 있어. 근데 그게 양날의 검이야. 한번 욕심이 생기면 멈추질 못해. 더 크게, 더 빨리 가지려다 한 번에 날리는 패턴이 이 구조의 함정이야. 이미 경험해봤지? 문제는 그게 한 번으로 안 끝난다는 거야. 모르면 계속 반복돼. 지금 당장 크게 버는 것보다 잃지 않는 구조를 만드는 게 먼저야. 욕심의 크기를 조절하는 것이 이 사주의 핵심 과제야.`
    : `에너지가 분산된 구조야. 돈이 들어오는 경로가 여러 개인 것 같은데, 정작 어디서 들어오고 어디서 나가는지 파악이 안 돼. 열심히 하는데 왜 안 쌓이나 싶었지? 구조가 그래. 잘못이 아니야. 근데 이 구조를 모르면 평생 이 패턴이 반복돼. 에너지를 한 곳에 모아야 해. 여러 가지를 동시에 하면 전부 흩어져. 하나를 깊게 파는 것이 이 사주에서 돈을 쌓는 유일한 방법이야. 선택과 집중, 이게 돈의 답이야.`
  const _yd = YONGSIN_DETAIL[yongsinA] || YONGSIN_DETAIL[yongsinA?.split("·")[0]] || {}
  const reomulSurvive = yongsinA
    ? `${yongsinD} 기운이 이 사주를 살려. 이 방향으로 가야 돈이 따라오고, 에너지가 살아나. 거슬러 가면 아무리 열심히 해도 제자리야. 지금 하는 일이 이 방향인지 한번 봐. 맞으면 계속 가고, 아니면 방향을 틀어야 해.\n맞는 업종은 ${(_yd["업종"] || yongsinJobMap[yongsinA] || yongsinD + " 방향의 분야")} 쪽이야. 이런 분야에서 열심히 한 만큼 결과가 나와. 일상에서는 ${_yd["행동"] || "용신 방향의 활동을 늘리면 좋아."} 취미도 ${_yd["취미"] || "이 기운을 살리는 활동"}으로 채워. ${yongsinD} 기운이 필요하니까, 작은 것부터 이 기운을 늘려가는 게 재물을 쌓는 가장 빠른 길이야. 반대로 조심할 건 ${_yd["피해야할것"] || "이 기운을 거스르는 방향으로 가는 거야."}`
    : ""
  const reomulAvoid = reomulGisin
  const reomulInvest = isSingang
    ? "적극적으로 투자하고 확장하는 스타일이 맞아. 근데 리스크 관리를 못 하면 한 방에 날려. 욕심의 크기를 조절하는 게 관건이야."
    : "안정적으로 쌓아가는 스타일이 맞아. 한 번에 크게 가려다 다 잃는 경우가 많아. 꾸준히 쌓는 게 이 구조의 정답이야."
  // 십성 카운트 (재성/관성/인성) — 여러 챕터에서 공용
  const _sc = d.sibsongAnalysis?.counts || {}
  const _gwanCnt = (_sc["정관"] || 0) + (_sc["편관"] || 0)   // 관성 = 직장·인정
  const _inCnt = (_sc["정인"] || 0) + (_sc["편인"] || 0)     // 인성 = 문서
  const _jaeCnt = (_sc["정재"] || 0) + (_sc["편재"] || 0)     // 재성 = 재물·연봉
  const reomulHabitText = _jaeCnt >= 2
    ? "재성이 두둑한 사주라 돈이 들어오는 길은 여러 개야. 문제는 새는 구멍이야. 들어오는 것보다 나가는 걸 먼저 틀어막아. 고정 지출을 점검하고, 통장을 목적별로 쪼개. 버는 재주는 타고났으니 지키는 습관만 붙이면 재물이 확 불어나."
    : "재성이 약한 편이라 큰돈이 저절로 굴러오진 않아. 대신 새는 걸 막고 작게 자주 모으는 데서 승부가 나. 자동 저축을 걸어두고, 충동적으로 지르는 습관부터 끊어. 한 방을 노리기보다 매달 조금씩 쌓는 게 이 사주가 부자 되는 유일한 길이야."

  // 연애 상세
  // 나와 갈등이 생기는 조건 (신강/신약 + 표현 방식 기반)
  const loveConflictHow = isSingang
    ? "내 방식을 밀어붙이려 하거나 주도권을 뺏으려 들면 바로 부딪혀. 통제받는다고 느끼는 순간 마음이 닫혀. 그리고 무시당했다고 느끼면 겉으론 잠잠해도 속으로 관계를 정리하기 시작해. 자존심을 건드리는 게 나랑 싸우는 가장 빠른 길이야."
    : "속마음을 안 알아주고 재촉하면 지쳐. 표현을 안 하니까 상대는 모르는데, 나는 이미 여러 번 참은 상태라 어느 순간 확 식어버려. 감정을 몰아세우거나 다그치면 오히려 더 입을 닫아. 말 안 해도 알아주길 바라는 마음을 몰라줄 때 갈등이 터져."
  const loveTiming = `인연이 들어오는 시기가 따로 있어. 대운과 세운이 맞아야 제대로 된 사람이 와. 아무리 노력해도 안 되는 시기가 있고, 가만 있어도 오는 시기가 있어.`
  const loveWarn = idealType2 ? `근데 주의해. ${mug(d.mbti?.challenges?.[0] || "")} 이 약점이 관계에서도 그대로 나타나.` : ""
  // 커플 전용 관계 심화 (연애중일 때 '더 깊어지는 법')
  const coupleDeepenText = isSingang
    ? "이 관계를 더 깊게 만들려면, 주도하려는 힘을 조금 내려놓는 게 열쇠야. 상대를 이끌고 챙기는 건 강점인데, 그게 지나치면 상대는 '내 자리가 없다'고 느껴. 크고 작은 결정을 같이 내리고, 가끔은 상대에게 기대는 모습을 보여줘. 강한 사람이 약한 틈을 내보일 때 관계는 오히려 단단해져. 하지만 표현까지 아끼면 안 돼. 고맙고 미안한 말을 그때그때 입 밖으로 내는 것만으로도, 이 관계는 눈에 띄게 깊어져."
    : "이 관계를 더 깊게 만들려면, 속마음을 미루지 말고 그때그때 꺼내는 게 열쇠야. 서운한 걸 담아뒀다 한 번에 터뜨리는 게 이 사주의 약점이라, 작은 감정도 말로 풀어야 오해가 안 쌓여. 상대는 표현하지 않으면 정말 몰라. 좋아하는 마음도 서운한 마음도 솔직하게 전하고, 혼자 삭이는 시간을 줄일수록 관계가 안정돼. 하지만 조급해할 필요는 없어. 곁을 오래 지키는 네 진심이 전해지면, 이 관계는 시간이 갈수록 저절로 깊어지는 구조야."

  // 커리어 상세
  const careerStrength = (d.mbti?.strengths || []).slice(0,2).map(mug).join(" ") || `${yongsinD || ""} 기운이 강한 분야에서 실력이 빛나.`
  const careerWeak = (d.mbti?.challenges || []).slice(0,1).map(mug).join("") || "약점을 알고 보완하는 게 커리어의 핵심이야."
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
    ? `재성이 ${_jaeCnt}개로 두둑해. 연봉 협상이나 성과급에서 제 몫을 챙기는 감각이 있어. 돈 얘기 앞에서 물러서지 마라. 요구할 줄 아는 게 이 사주의 무기야.`
    : `재성이 ${_jaeCnt}개야. 연봉은 크게 욕심내기보다 안정적으로 쌓는 흐름이야. 한 방보다 꾸준한 상승을 노리는 게 맞아.`
  const jikjangYearText = `올해 직장운을 십성으로 보면, ${_gwanCnt >= 1 ? "관성이 자리를 받쳐줘서 인정받고 올라설 여지가 있어." : "관성이 약해서 자리보다 실력을 다지는 해야."} ${_inCnt >= 1 ? "인성도 들어와 문서, 합격 운이 같이 열려." : "문서운은 잔잔하니 큰 계약은 때를 봐."} ${yeonbongText}`
  // 이직운 (관성 + 역마 + 대운)
  const jikjangRole = careerWeak + (recovery ? " " + mug(recovery) : "")
  // 회사운 / 취업운 (입사일 유무 분기)
  const hasJoin = !!d.joinDate
  const _joinYear = d.joinDate?.year
  const companyFitText2 = hasJoin
    ? `${_joinYear}년에 들어간 회사야. 입사한 해의 기운과 이 사주를 맞춰 보면, ${_gwanCnt >= 1 ? "관성이 살아 있어서 이 조직에서 자리를 잡고 인정받을 수 있는 궁합이야. 버티면 열매가 있어." : "조직과 딱 맞물리는 궁합은 아니야. 여기서 다 채우려 하기보다, 실력을 쌓는 발판으로 삼는 게 현명해."} 지금 회사에서 뭔가 답답하다면, 그건 본인 문제가 아니라 기운의 결이 조금 다른 거야. 큰 결정을 내리기 전에 대운 흐름을 먼저 봐.`
    : ""
  const chwiupText = !hasJoin
    ? `아직 다니는 회사가 없거나 입사일을 안 넣었으니 취업운으로 봐줄게. ${_gwanCnt >= 1 ? "관성이 있어서 조직에 붙는 힘은 있어. 자기소개서나 면접에서 '책임감 있고 신뢰 가는 사람'으로 밀면 먹혀." : "관성이 약해서 대형 조직에 정공법으로 붙기보다, 전문성이나 실무 능력을 앞세우는 게 유리해. 작은 조직이나 실력 중심의 자리가 더 잘 맞아."} 합격운은 인성이 좌우하는데, ${_inCnt >= 1 ? "인성이 받쳐줘서 준비한 만큼 결실이 나와. 시험, 서류 운이 나쁘지 않아." : "인성이 약하니 붙을 때까지 두드리는 끈기가 필요해."} 아래 12개월 흐름에서 점수 높은 달에 원서를 넣어.`
    : ""

  // ── 관계운 3페이지용 추가 ──
  const relSocialStyle = isSingang
    ? "관계에서 주는 쪽이야. 먼저 다가가고, 챙기고, 판을 벌이는 역할을 맡아. 사람이 모이는 중심에 서지만, 정작 힘들 때 기댈 사람은 적은 게 함정이야. 다 퍼주고 정작 나는 못 채우는 구조라, 받는 연습도 필요해."
    : "관계에서 받는 걸 어려워하는 쪽이야. 남 챙기는 건 잘하는데 정작 내 얘기는 잘 안 꺼내. 깊은 관계는 소수랑만 맺고, 넓게 얕게는 잘 안 돼. 그 소수한테는 뭐든 내주는 사람이야."
  const relConflictStyle = "부딪힐 땐 정면으로 싸우기보다 조용히 거리를 둬. 겉으론 아무렇지 않은 척하지만 속으로 이미 정리에 들어간 거야. 이 방식이 편하긴 한데, 오해를 키우기도 해. 진짜 아끼는 관계라면 닫기 전에 한 번은 말로 풀어."

  // ── 건강운 3페이지용 추가 ──
  const healthLifeText = isSingang
    ? "몸을 계속 쓰려 드는 기질이라, 젊을 땐 체력으로 버텨. 근데 그게 독이야. 삼사십대에 누적된 피로가 한 번에 터지기 쉬우니, 지금부터 쉬는 습관을 들여. 멈출 줄 아는 게 이 사주의 장수 비결이야."
    : "타고난 체력이 넘치는 편은 아니야. 대신 무리만 안 하면 잔병 없이 오래 가는 구조야. 몸이 보내는 신호에 예민한 게 강점이니, 초기에 잡으면 큰 병으로 안 커져. 규칙적인 생활이 곧 보약이야."
  const healthMindLifeText = "몸보다 마음이 먼저 지치는 사주야. 스트레스가 몸으로 내려오기 전에 마음을 비우는 루틴을 만들어. 명상이든 산책이든 혼자만의 회복 시간이 약보다 중요해."

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
  const daeunGoldenText = _peakDaeun
    ? `인생 전체 대운을 펼쳐 보면, ${_peakDaeun.label} 대운(${_peakDaeun.startYear ? _peakDaeun.startYear + "년~ " : ""}${_peakDaeun.period})이 가장 크게 열리는 황금기야. 이 구간에 인생의 승부를 걸어. 여기서 벌인 일이 평생을 먹여 살려. 지금이 그 전이라면 이 시기를 위해 실탄을 모으고, 이미 지났다면 그때 쌓은 걸 어떻게 굴릴지가 관건이야.`
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
  const _phaseLate = _stageAvgPhase(60, 200)
  const lifeEarlyText = _phaseEarly ? `초년(만 0~19세)은 ${_phaseEarly} 흐름이야. ${_phaseEarly.includes("버티") ? "일찍부터 크고 작은 고생을 겪으며 뿌리를 내리는 시기라, 마냥 편하진 않았을 거야. 하지만 이때 몸으로 부딪혀 배운 것들이 평생 밑천이 돼. 남들보다 일찍 철이 들고, 스스로를 지키는 힘을 이 시절에 익혀." : "받쳐주는 기운 속에서 자라나는 시기라, 비교적 사랑과 관심 속에서 컸을 가능성이 커. 이때 쌓인 안정감이 평생 정서의 바탕이 되고, 어릴 적 경험이 삶의 방향을 자연스럽게 잡아줘."} 부모나 집안의 영향을 강하게 받는 구간이라, 그 안에서 만들어진 습관과 태도가 어른이 된 뒤에도 오래 남아. 하지만 이 시절의 결핍이든 사랑이든, 그게 지금의 나를 만든 원형이라는 걸 기억해. 좋았든 아팠든 다 나를 이루는 재료였어.` : ""
  const lifeYoungText = _phaseYoung ? `청년(만 20~39세)은 ${_phaseYoung} 흐름이야. 세상에 나가 부딪히며 자기 자리를 만들어가는 가장 치열한 구간이라, ${_phaseYoung.includes("크게 열려") ? "치고 나갈 힘이 제대로 실려. 겁내지 말고 판을 벌여도 되는 시기야. 이때 도전한 게 인생 후반의 발판이 되니까, 안정만 좇다 기회를 흘려보내지 마." : _phaseYoung.includes("버티") ? "당장 눈에 띄는 결과가 안 나와도 조급해하지 마. 지금은 실력과 사람을 쌓아두는 시기라, 이때 버틴 힘이 나중에 한꺼번에 터져." : "요란하진 않아도 꾸준히 밀면 착실하게 기반이 잡히는 흐름이야. 큰 승부보다 하나씩 쌓는 게 이 구간의 정답이야."} 일이든 사랑이든 돈이든, 인생의 큰 뼈대가 대부분 이 시기에 잡혀. 하지만 조급하게 남과 비교하다 방향을 잃기 쉬운 때이기도 하니, 내 속도를 지키는 게 이 구간 전체를 좌우하는 관건이야.` : ""
  const lifeMidText = _phaseMid ? `중년(만 40~59세)은 ${_phaseMid} 흐름이야. 그동안 쌓아온 걸 실제로 거둬들이는 결실의 구간이라, ${_phaseMid.includes("크게 열려") ? "인생의 정점이 바로 여기 있어. 능력도 인맥도 무르익어서 마음먹은 걸 가장 크게 펼칠 수 있는 시기니까, 이 황금기를 절대 흘려보내지 마." : _phaseMid.includes("버티") ? "무리하게 판을 키우기보다 지킬 걸 단단히 지키는 게 이득인 시기야. 욕심내 벌인 일이 탈이 나기 쉬우니, 내실을 다지며 다음 흐름을 기다려." : "요란하진 않아도 쌓아온 만큼 안정적으로 성과가 돌아오는 흐름이야. 꾸준함이 신뢰로 바뀌는 시기야."} 사회적으로 자리를 잡고 책임도 가장 무거워지는 때라, 일과 가정 사이 균형이 중요해져. 하지만 여기서 방심하거나 몸을 혹사하면 후반이 흔들리니, 성취만큼 건강과 관계를 함께 챙기는 게 오래 가는 비결이야.` : ""
  const lifeLateText = _phaseLate ? `말년(만 60세~)은 ${_phaseLate} 흐름이야. ${_phaseLate.includes("크게 열려") ? "늦게 피는 꽃이라 오히려 후반이 화려한 사주야. 젊을 때보다 지금이 더 편하고 풍요로울 수 있어서, 그동안의 고생을 보상받는 시기야. 새로 뭘 시작해도 늦지 않아." : _phaseLate.includes("버티") ? "욕심을 내려놓고 지금 가진 걸 지키는 데 집중할 시기야. 크게 벌이기보다 몸과 마음의 평안을 우선하면, 조용하지만 단단한 후반을 보낼 수 있어." : "안정 속에서 그동안의 결실을 천천히 누리는 때야. 서두를 것 없이, 쌓아온 것들이 주는 여유를 즐기면 돼."} 이 시기엔 물질적인 성취보다 마음의 평화와 사람과의 정이 더 큰 자산이 돼. 하지만 이 시절의 평안은 그냥 오는 게 아니라, 앞선 세 구간을 어떻게 살아왔느냐가 고스란히 결정해. 지금 잘 살아두는 게 곧 노년의 나를 위한 준비야.` : ""
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
    const head = `${nextAge ? `만 ${nextAge}세 무렵(${nextYear}년경)` : "다음 대운"}에 대운이 ${next.label}로 바뀌어. 대운이 바뀌는 전후 2~3년은 인생의 환절기라, 겉으론 멀쩡해 보여도 속에서 판이 크게 흔들려. `
    const body = dir === "up"
      ? "다행히 다음 대운은 기운이 트이는 흐름이야. 이 전환기에 이사, 이직, 새 도전을 준비해두면 대운이 바뀌면서 탄력을 받아. 지금부터 실탄을 모으고 기회를 살펴둬."
      : dir === "down"
      ? "다음 대운은 기운을 아껴야 하는 흐름이야. 이 전환기에 무리하게 판을 벌이면 탈이 나. 지금 대운이 끝나기 전에 벌여둔 일을 정리하고, 안전벨트를 매둬. 건강 관리도 이때부터 신경 써."
      : "다음 대운은 무난하게 흐르는 편이야. 큰 욕심보다 지금 쌓은 걸 안정적으로 이어가는 데 집중해. 전환기의 흔들림만 잘 넘기면 돼."
    return head + body
  })()
  // 대운 × 세운 교차 황금기 (진짜 터지는 해)
  const daeunSaeunPeakText = (() => {
    const goods = yearForecast.filter(y => (y.score || 0) >= 72).slice(0, 3)
    const cur = daeun.find(dv => dv.cur)
    const curGood = cur && _daeunScore(cur) >= 65
    const _AREA_MSG = {
      재물: "돈이 실제로 움직이는 재물운이 제일 두드러지는 해야. 투자, 계약, 큰 거래처럼 실속으로 이어지는 결정을 이때 걸면 결과가 크게 돌아와",
      애정: "인연과 애정운이 활짝 열리는 해야. 새 인연이든 지금 관계의 진전이든, 마음 쓰는 일이 이때 가장 잘 풀려",
      커리어: "일과 커리어운이 강하게 트이는 해야. 승진, 이직, 중요한 프로젝트처럼 판을 키우는 승부를 이때 몰면 크게 인정받아",
      건강: "몸과 컨디션이 든든하게 받쳐주는 해야. 체력이 올라오는 만큼 미뤄둔 일을 몰아서 밀어붙이기 좋아",
      관계: "사람과 관계운이 좋은 해야. 귀인을 만나거나 인맥이 넓어져서, 사람을 통해 기회가 들어오는 흐름이야",
    }
    if (goods.length) {
      const lines = goods.map(y => {
        const areas = y.areas || {}
        const top = Object.entries(areas).sort((a, b) => (b[1] || 0) - (a[1] || 0))[0]
        const msg = _AREA_MSG[top?.[0]] || "여러 영역이 고르게 받쳐줘서, 뭘 벌여도 손해가 적은 해야"
        return `· ${y.year}년(${y.score}점): ${msg}.`
      })
      return `대운과 세운이 겹쳐서 진짜 크게 터지는 해를 짚어보면 ${goods.map(y => y.year).join(", ")}년이야. ${curGood ? "지금 대운 자체가 든든하게 받쳐주는 데다" : "대운의 큰 흐름 속에서도"} 이 해들은 세운까지 힘을 보태서 평소보다 몇 배 큰 결과를 낼 수 있어. 그런데 같은 황금기라도 해마다 트이는 문이 달라.\n${lines.join("\n")}\n이렇게 해마다 강해지는 영역이 다르니까, 큰 결정도 그 해의 결에 맞춰 골라 던지면 성공률이 훨씬 높아져. 승부수는 이 해들로 몰되, 한 해에 다 쏟기보다 영역별로 나눠서 노리는 게 이 기회의 창을 제대로 쓰는 법이야.`
    }
    return `앞으로 몇 년은 대운과 세운이 크게 겹치는 초강세 구간은 뚜렷하지 않아. 대신 이런 시기엔 무리한 승부보다 실력과 기반을 다지는 게 정답이야. 조용히 힘을 모아두면 다음 황금기에 크게 터뜨릴 수 있어.`
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
    비겁: "올해는 남한테 기대기보다 내 힘으로 밀어붙일 때 결과가 나는 흐름이야. 경쟁심과 독립심이 강해지는 해라, 혼자서라도 판을 벌이고 싶은 마음이 커져. 창업이나 이직처럼 스스로 주도권을 쥐는 결정에 유리한 시기야. 다만 이럴 때일수록 동업이나 큰돈 거래는 한 번 더 따져봐야 해. 믿었던 사람과 돈 문제로 어긋나기 쉬운 해거든. 내 페이스대로 가되, 돈과 사람은 분리해서 관리하는 게 올해의 핵심이야.",
    식상: "올해는 표현하고 만들어내는 기운이 활짝 열리는 흐름이야. 속에 담아뒀던 아이디어를 밖으로 꺼내기 좋은 해라, 새 프로젝트나 창작, 콘텐츠, 자기표현이 유독 잘 풀려. 사람들 앞에 나서거나 내 이름을 거는 일에 기회가 붙어. 다만 말과 표현이 많아지는 만큼 구설도 따라오니, 감정이 앞설 때 한 박자 참는 연습이 필요해. 벌인 일을 끝까지 마무리하는 것까지가 올해의 숙제야.",
    재성: "올해는 돈과 기회가 실제로 움직이는 흐름이야. 계획만 세우던 일이 현금이나 계약 같은 실속으로 연결되기 좋은 해라, 재테크와 거래, 부수입에 적극적으로 나서면 손에 잡히는 결과가 나와. 사람 인연을 통해 기회가 들어오는 경우도 많아. 다만 흐름이 좋을수록 과욕이 화근이야. 한 번에 크게 먹으려다 벌여둔 것까지 날리는 게 이 해의 함정이니, 욕심의 크기를 조절하는 게 관건이야.",
    관성: "올해는 책임과 압박이 커지는 대신 그만큼 자리와 인정이 따라오는 흐름이야. 승진이나 이직, 시험, 자격처럼 관문을 통과하는 일에 운이 열려서, 노력한 만큼 사회적으로 인정받기 좋은 해야. 위에서 나를 끌어주는 사람이 생기기도 해. 다만 어깨에 얹히는 짐이 무거워지는 만큼 몸이 먼저 지치기 쉬워. 다 떠안기보다 중요한 관문에 힘을 몰아주고, 건강 관리를 같이 챙겨야 오래 가.",
    인성: "올해는 배우고 채우는 기운이 강한 흐름이야. 공부나 자격증, 계약, 문서처럼 도장 찍는 일이 술술 풀리는 해라, 실력을 한 단계 끌어올리거나 새로운 걸 익히기에 최적이야. 귀인의 도움이나 윗사람의 조언이 들어오기도 해. 다만 안으로 채우는 기운이 강한 만큼 생각만 많아지고 실행이 늦어지기 쉬워. 배운 걸 실제로 써먹고 결정을 미루지 않는 게 올해를 알차게 쓰는 법이야.",
  }
  const _saeunCat = _SAEUN_CAT[_saeunSibsong]
  const saeunYearText = _saeunSibsong
    ? `올해는 ${_thisYearNum}년, ${_yGan}${_yJi}년이야. 이 사주로 올해를 짚어보면, ${_SAEUN_MSG[_saeunCat]} ${thisYear.score ? `올해 종합 흐름은 ${thisYear.score}점 정도로 봐. ` : ""}그리고 한 해 안에서도 달마다 기운의 결이 갈려. 같은 해라도 확 트이는 달이 있고 숨 고르는 달이 따로 있으니, 아래 달별 흐름에서 점수가 높은 달을 골라 중요한 승부나 결정을 몰아주는 게 좋아. 큰일은 흐름이 받쳐줄 때 밀어붙여야 힘이 실려.`
    : `올해는 ${_thisYearNum}년, ${_yGan}${_yJi}년이야. 한 해 안에서도 달마다 기운의 결이 갈리니, 아래 달별 흐름에서 점수가 높은 달을 골라 중요한 결정을 몰아주는 게 좋아.`

  // 육친과 나 — 가족 배치를 "나에 대한 이해"로 되돌림 (#13)
  const _famScores = {
    재성: (_sc["정재"] || 0) + (_sc["편재"] || 0),
    관성: _gwanCnt,
    인성: _inCnt,
    식상: (_sc["식신"] || 0) + (_sc["상관"] || 0),
    비겁: (_sc["비견"] || 0) + (_sc["겁재"] || 0),
  }
  const _famPattern = {
    재성: "가족을 부양하고 통제 안에 두려는 책임감이 몸에 배어 있어. 챙기는 게 곧 사랑이라 믿어서, 정작 마음을 나누는 건 서툴 때가 있어.",
    관성: "규율과 기대 속에서 자라 스스로에게 엄격한 패턴이 남았어. 인정받아야 안심하는 마음이, 어른이 된 지금도 일과 관계에 그대로 따라와.",
    인성: "보살핌을 넉넉히 받은 만큼 안정과 의존의 욕구가 커. 기대는 게 익숙한 만큼, 홀로 서는 걸 자꾸 미루게 되는 약점도 함께 있어.",
    식상: "표현하고 돌보는 기운이 강해서, 관계에서 늘 먼저 베푸는 쪽이야. 주는 건 잘하는데 받는 법은 안 배워서 혼자 소진되기 쉬워.",
    비겁: "형제나 또래 기운이 강해 일찍 독립심을 키웠어. 스스로 해결하는 힘이 강한 대신, 기대면 지는 것 같은 마음이 관계를 외롭게 만들기도 해.",
  }
  const _famTop = Object.entries(_famScores).sort((a, b) => b[1] - a[1])[0]
  const _famLack = Object.entries(_famScores).filter(([, v]) => !v).map(([k]) => k)
  const yukchinSelfText = `사주를 보는 건 결국 나를 이해하는 일이야. 가족이라는 자리도 그래. 이 명식에서 ${_famTop && _famTop[1] ? _famTop[0] : "육친"} 기운이 가장 도드라지는데, 그게 어떤 가족 안에서 컸는지를 넘어 지금의 나를 이렇게 만들었어. ${_famTop && _famTop[1] ? _famPattern[_famTop[0]] : "육친이 특정 자리에 쏠리지 않고 고르게 퍼져 있어, 한 패턴에 갇히지 않고 관계마다 다른 얼굴을 꺼내 쓰는 편이야."}${_famLack.length ? ` 반대로 ${_famLack.join(", ")} 자리가 비어서, 그 결핍을 채워줄 사람에게 유독 끌리고 또 유독 상처받아. 하지만 그 자리를 남이 아니라 스스로 채우는 게 이번 생의 관계 숙제야.` : " 큰 결핍 없이 갖춰진 편이라, 관계에서 균형을 잡는 힘은 타고났어."}`
  const yukchinLoopText = isSingang
    ? "관계에서 내가 주도하고 책임지려는 패턴을 반복해. 부모 자리에서 익힌 '내가 중심을 잡아야 한다'는 각본이 연애와 직장에도 그대로 재생돼. 하지만 그 각본을 알아차리는 순간, 처음으로 기대고 나눌 여지가 생겨."
    : "관계에서 상대를 먼저 맞추고 내 욕구는 뒤로 미루는 패턴을 반복해. 가족 안에서 익힌 '조용히 맞춰야 편하다'는 각본이 어른이 된 지금도 따라와. 하지만 그 각본을 알아차리는 순간, 비로소 내 몫을 요구할 수 있게 돼."

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
    ? `${_guardianByYong[_yongFirst] || "곁에 있으면 이유 없이 편하고 일이 잘 풀리는 사람이야"}. 처음엔 특별해 보이지 않을 수 있어. 근데 만나고 나면 이상하게 기운이 나고 막힌 게 뚫려. 그런 사람을 만나면 놓치지 마. 그게 이 삶의 귀인이야.`
    : "곁에 있으면 이유 없이 편하고 일이 잘 풀리는 사람이 귀인이야. 만나고 나면 기운이 나는 사람, 그게 귀인이야."
  const poisonDetailText = _giFirst
    ? `${_poisonByGi[_giFirst] || "같이 있으면 이유 없이 지치는 사람이야"}. 나쁜 사람이라는 게 아니야. 남한테는 좋은 사람일 수도 있어. 근데 유독 나랑은 기운이 안 맞아서, 가까이 둘수록 내가 소모돼. 이런 결의 사람과는 적당한 거리를 둬.`
    : "유독 나랑 기운이 안 맞아서 같이 있으면 지치는 사람이 있어. 나쁜 사람이 아니라 결이 안 맞는 거야. 적당한 거리를 둬."
  const relPoison = gisinA ? `${gisinD} 기운이 강한 사람과 가까이 있으면 이유 없이 지쳐. 나쁜 사람이 아닐 수 있어. 그냥 에너지가 안 맞는 거야. 가까이 할수록 손해야.` : ""
  // 직장(공적)과 친구(사적) 모습 — 서로 다른 각도로
  const relWorkFace = `${dayMask || dayImp || "처음엔 다가가기 어려운 인상을 줘."} 공적인 자리에서는 감정을 잘 드러내지 않고, 맡은 몫을 확실히 해내는 사람으로 보여.`
  const relFriendFace = isSingang
    ? "편한 사람들 앞에서는 완전히 다른 사람이 돼. 공적인 자리에서 눌러뒀던 장난기랑 에너지가 그대로 터져나와서, 분위기를 주도하고 판을 이끄는 쪽이야. 좋아하는 사람한테는 표현도 확실하고, 챙길 땐 화끈하게 챙겨. 손해 보는 걸 알면서도 내 사람이다 싶으면 아낌없이 퍼줘. 하지만 한번 선을 넘거나 신뢰를 깨는 사람한테는 냉정하게 등을 돌려. 겉으로 보이는 차분함만 아는 사람은 이 반전을 상상도 못 해. 직장에서의 나와 친구 앞에서의 내가 이렇게까지 다른데, 이 두 얼굴을 다 아는 사람이 진짜 내 편이야."
    : "가까운 사이에서는 경계를 완전히 풀어. 밖에서는 무던하고 조용해 보여도, 편한 사람 앞에서는 은근히 응석도 부리고 어리광도 나와. 말수는 적어도 곁을 오래 지키는 타입이라, 친구들 사이에서 '있는 듯 없는 듯 늘 그 자리에 있는 사람'으로 통해. 한번 마음을 준 사람한테는 깊고 오래가고, 티 안 나게 챙기는 세심함이 있어. 하지만 상처받으면 표현 안 하고 혼자 삭이다가 조용히 멀어지는 게 약점이야. 겉의 무던함만 보는 사람은 속에 이렇게 섬세한 결이 있는 줄 몰라. 이 온도 차를 아는 사람만 진짜 나를 본 거야."

  const yearDetail = yearForecast.slice(0, 5).map(y => {
    const score = y.score || 0
    const areas = y.areas || {}
    const areaStr = Object.entries(areas).map(([k,v]) => `${k} ${v}점`).join(" / ")
    return `${y.year}년 종합 ${score}점\n${areaStr}\n${mug(y.summary || "")}`
  }).join("\n\n")

  const lockedChapters = [
    // ★ 십성 · 12신살 · 12운성 (사주 구성 심화)
    {
      label: "십성 분석", accent: C.plum,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "타고난 재능과\n기질의 뿌리.",
      subtitle: "사주 십성 분석",
      blocks: [
        { h: "가장 강한 십성 세 가지", jsxContent: React.createElement("div", null, ...sibsongJSX), accent: C.plum },
      ],
    },
    {
      label: "12신살", accent: C.plum,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "사주 네 기둥에 박힌\n열두 신살의 자리.",
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
    // II. 동서양 종합 3블록
    {
      label: "동서양 종합 1", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "동양이 읽는\n나의 결.",
      subtitle: "사주 · 당사주 · 토정비결 · 주역",
      blocks: [
        dansajuText ? { h: "당사주", text: dansajuText, accent: C.iris } : null,
        { h: "토정비결", kw: tojungKw || null, text: tojungDesc, accent: C.iris },
        { h: "주역", kw: ichingKw || null, text: ichingBodyText, accent: C.iris },
      ].filter(Boolean),
    },
    {
      label: "동서양 종합 2", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "별자리가\n비추는 나.",
      subtitle: "태양 · 달 · 상승 별자리",
      blocks: [
        sunSign ? { h: `태양 ${sunSign}`, text: astroSunText, accent: C.iris } : null,
        moonSign ? { h: `달 ${moonSign}`, text: astroMoonText, accent: C.iris } : null,
        ascSign ? { h: `상승 ${ascSign}`, text: astroAscText, accent: C.iris } : null,
        (!sunSign && !moonSign) ? { h: "별자리", text: "태어난 시간 정보가 없어 별자리는 생략했어. 동양 명식만으로도 충분히 결이 읽혀.", accent: C.iris } : null,
      ].filter(Boolean),
    },
    {
      label: "동서양 종합 3", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "타로와 다섯 관점이\n하나로 모이는 곳.",
      subtitle: "타로 · 종합 결론",
      blocks: [
        { h: `생명경로수 ${t.lifePath || ""} · ${tarotCardName}`, text: `${tarotLifeText || ""}\n\n${tarotSoulText || ""}`.trim() || "분석 중이야.", accent: C.iris },
        { h: "다섯 관점의 결론", text: fiveViewText, accent: C.iris },
      ].filter(Boolean),
    },
    {
      label: "동서양 종합 4", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "다섯 관점이\n엇갈리는 지점.",
      subtitle: "충돌 · 긴장 · 입체감",
      blocks: [
        { h: "서로 다른 지도가 어긋날 때", text: fiveViewTensionText, accent: C.iris },
      ].filter(Boolean),
    },
    // III. 재물운 3블록
    {
      label: "재물운 1", accent: C.sand,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "돈이 안 쌓이는\n진짜 구조.",
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
      ].filter(Boolean),
    },
    {
      label: "재물운 3", accent: C.sand,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "투자 체질과\n재물을 강화하는 법.",
      subtitle: "투자 체질 · 재물 강화 · 향후 흐름",
      blocks: [
        { h: "투자 체질", text: reomulInvest, accent: C.sand },
        { h: "재물을 실제로 키우는 습관", text: reomulHabitText, accent: C.sand },
        { h: "올해 재물 흐름", jsxContent: <CategoryScore months={monthForecast} category="재물" thisYearScore={thisYear?.areas?.재물 || 0} label="재물운" />, accent: C.sand },
      ].filter(Boolean),
    },
    // IV. 연애운 3블록
    // IV. 연애운(솔로) / 애정운(연애중) — 분기
    ...(isSolo ? [
      {
        label: "연애운 1", accent: C.lavender,
        tag: "유료", tagColor: C.plum, tagText: C.lavender,
        title: "혼자인 지금,\n다가오는 인연.",
        subtitle: "솔로 · 인연의 결",
        blocks: [
          { h: "연애할 때 나", text: desire ? desire + (desire2 ? "\n\n" + desire2 : "") : `겉으로는 별로 안 원하는 척해. 근데 속은 달라. 진심으로 알아봐 주는 사람을 원해. 말 안 해도 알아채고, 기대 없이 챙겨주는 사람. 그런 사람한테 한번 마음 열면 끝까지 열어.`, accent: C.lavender },
          { h: "끌리는 순간", text: attraction || "말보다 행동으로 보여주는 사람한테 흔들려. 요란한 고백보다 조용히 곁을 지키는 쪽에 마음이 가.", accent: C.lavender },
          { h: "무너지는 지점", text: triggers.length ? triggers.join(" ") : `오래 지켜봐 온 사람이 구체적으로 알아봐 줄 때. 피상적인 칭찬 말고 진짜로 봤다는 느낌. 그 순간 완전히 무너져.`, accent: C.lavender },
        ].filter(Boolean),
      },
      {
        label: "연애운 2", accent: C.lavender,
        tag: "유료", tagColor: C.plum, tagText: C.lavender,
        title: "인연의 자리와\n맞는 사람.",
        subtitle: "인연의 장소 · 상대",
        blocks: [
          { h: "인연이 오는 곳", text: soloPlaceText, accent: C.lavender },
          { h: "잘 맞는 상대", text: soloTypeText, accent: C.lavender },
          { h: "피해야 할 상대", text: poisonDetailText, accent: C.lavender },
        ].filter(Boolean),
      },
      {
        label: "연애운 3", accent: C.lavender,
        tag: "유료", tagColor: C.plum, tagText: C.lavender,
        title: "다가가는 법과\n인연이 열리는 때.",
        subtitle: "접근법 · 인연 시기 · 점수",
        blocks: [
          { h: "다가가는 법", text: soloApproachText, accent: C.lavender },
          { h: "인연 만나기 좋은 달", jsxContent: <BestMonth months={monthForecast} category="애정" label="인연" />, accent: C.lavender },
          { h: "올해 애정 흐름", jsxContent: <CategoryScore months={monthForecast} category="애정" thisYearScore={thisYear?.areas?.애정 || 0} label="애정운" />, accent: C.lavender },
        ].filter(Boolean),
      },
    ] : [
      {
        label: "애정운 1", accent: C.lavender,
        tag: "유료", tagColor: C.plum, tagText: C.lavender,
        title: "지금 만나는 사람과\n나의 관계 구조.",
        subtitle: "연애 중 · 관계 진단",
        blocks: [
          { h: "연애할 때 나", text: desire ? desire + (desire2 ? "\n\n" + desire2 : "") : `속으로는 진심으로 알아봐 주는 사람을 원해. 말 안 해도 알아채고 기대 없이 챙겨주는 사람. 그런 사람한테 한번 마음 열면 끝까지 열어.`, accent: C.lavender },
          { h: "부딪히는 순간", text: loveConflictHow, accent: C.lavender },
          { h: "관계가 깊어지는 결", text: loveTiming, accent: C.lavender },
        ].filter(Boolean),
      },
      {
        label: "애정운 2", accent: C.lavender,
        tag: "유료", tagColor: C.plum, tagText: C.lavender,
        title: "이 관계를\n더 깊게 만드는 법.",
        subtitle: "관계 심화 · 상대 이해",
        blocks: [
          { h: "마음이 열리는 순간", text: triggers.length ? triggers.join(" ") : `오래 지켜봐 온 사람이 구체적으로 알아봐 줄 때 완전히 무너져. 피상적인 칭찬 말고 진짜로 봤다는 느낌 말이야.`, accent: C.lavender },
          { h: "더 깊어지는 법", text: coupleDeepenText, accent: C.lavender },
          { h: "이번 생 연애 과제", text: loveWarn || "표현하는 법을 배우는 거야. 속에서 많은 게 일어나도 겉으론 안 보여. 먼저 말하지 않으면 혼자 지치고 닫히는 패턴이 반복돼.", accent: C.lavender },
        ].filter(Boolean),
      },
      {
        label: "애정운 3", accent: C.lavender,
        tag: "유료", tagColor: C.plum, tagText: C.lavender,
        title: "관계가 무르익는\n결정적인 시기.",
        subtitle: "결혼 시기 · 점수",
        blocks: [
          { h: "결혼, 동거 좋은 달", jsxContent: <BestMonth months={monthForecast} category="애정" label="관계 진전" />, accent: C.lavender },
          { h: "올해 애정 흐름", jsxContent: <CategoryScore months={monthForecast} category="애정" thisYearScore={thisYear?.areas?.애정 || 0} label="애정운" />, accent: C.lavender },
        ].filter(Boolean),
      },
    ]),
    // V. 업무운 3블록 (직장운/문서운/역할 + 취업·회사운)
    {
      label: "업무운 1", accent: C.caramel,
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
      label: "업무운 2", accent: C.caramel,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "직장운과 문서운,\n올해 흐름.",
      subtitle: "관성 · 인성 · 연봉",
      blocks: [
        { h: "직장운과 인정운", text: jikjangText, accent: C.caramel },
        { h: "문서운", text: munseoText, accent: C.caramel },
        { h: "올해 직장 흐름", text: jikjangYearText, accent: C.caramel },
      ].filter(Boolean),
    },
    {
      label: hasJoin ? "회사운" : "취업운", accent: C.caramel,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: hasJoin ? "지금 회사와\n나의 궁합." : "언제 어디로\n취업이 열리는지.",
      subtitle: hasJoin ? "현 직장 궁합 · 점수" : "취업 흐름 · 점수",
      blocks: [
        hasJoin
          ? { h: "지금 회사 궁합", text: companyFitText2, accent: C.caramel }
          : { h: "취업운", text: chwiupText, accent: C.caramel },
        { h: "올해 커리어 흐름", jsxContent: <CategoryScore months={monthForecast} category="커리어" thisYearScore={thisYear?.areas?.커리어 || 0} label={hasJoin ? "회사운" : "취업운"} />, accent: C.caramel },
      ].filter(Boolean),
    },
    // VI. 관계운 3블록
    {
      label: "관계운 1", accent: C.iris,
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
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "귀인과 독,\n곁에 둘 사람 밀어낼 사람.",
      subtitle: "귀인 · 조심할 관계",
      blocks: [
        { h: "귀인은 이런 사람", text: guardianDetailText, accent: C.iris },
        { h: "조심할 사람", text: poisonDetailText, accent: C.iris },
      ].filter(Boolean),
    },
    {
      label: "관계운 3", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "관계 속 나의 자리와\n소진되는 패턴.",
      subtitle: "관계 스타일 · 그림자 · 점수",
      blocks: [
        { h: "관계에서 나의 자리", text: relSocialStyle, accent: C.iris },
        { h: "갈등이 생길 때", text: relConflictStyle, accent: C.iris },
        { h: "나를 소진시키는 패턴", text: drainPatternText, accent: C.iris },
        { h: "올해 관계 흐름", jsxContent: <CategoryScore months={monthForecast} category="관계" thisYearScore={thisYear?.areas?.관계 || 0} label="관계운" />, accent: C.iris },
      ].filter(Boolean),
    },
    // VII. 건강운 3블록
    {
      label: "건강운 1", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "타고나게 약한 곳과\n몸이 보내는 신호.",
      subtitle: "약한 장기 · 취약 계절",
      blocks: [
        { h: "타고나게 약한 장기", text: healthWeakText, accent: C.iris },
        { h: "주의해야 할 계절", text: healthSeasonText, accent: C.iris },
      ].filter(Boolean),
    },
    {
      label: "건강운 2", accent: C.iris,
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
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "평생 건강 관리와\n올해 흐름.",
      subtitle: "생애 건강 · 점수",
      blocks: [
        { h: "나이 들며 조심할 것", text: healthLifeText, accent: C.iris },
        { h: "먼저 챙길 마음 건강", text: healthMindLifeText, accent: C.iris },
        { h: "올해 건강 흐름", jsxContent: <CategoryScore months={monthForecast} category="건강" thisYearScore={thisYear?.areas?.건강 || 0} label="건강운" />, accent: C.iris },
      ].filter(Boolean),
    },
    // VIII. 가족운 3블록
    {
      label: "가족운 1", accent: C.sand,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "부모와 형제, 배우자,\n네 기둥이 품은 가족.",
      subtitle: "부모 · 유년기 · 형제 자녀 · 배우자궁",
      blocks: [
        { h: "부모와의 관계", text: parentText, accent: C.sand },
        { h: "자라온 가정 분위기", text: childhoodText, accent: C.sand },
        { h: "형제와 자녀", text: siblingText, accent: C.sand },
        { h: "배우자 자리", text: spousePalaceText, accent: C.sand },
      ],
    },
    {
      label: "육친과 나", accent: C.sand,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "가족이라는 자리가\n나를 만든 방식.",
      subtitle: "육친 십성 · 나에 대한 이해",
      blocks: [
        { h: "네 기둥이 만든 나", text: yukchinSelfText, accent: C.sand },
        { h: "반복하는 관계 각본", text: yukchinLoopText, accent: C.sand },
      ].filter(Boolean),
    },
    {
      label: "가족운 3", accent: C.sand,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "집안 내림과\n이번 생의 과제.",
      subtitle: "집안 패턴 · 전생 업보",
      blocks: [
        { h: "집안 업보 패턴", text: familyKarmaText, accent: C.sand },
        { h: "대를 잇는 내림", text: familyLineageText, accent: C.sand },
        { h: "전생업보와 이번 생의 과제", text: missionText, accent: C.sand },
      ],
    },
    // IX. 대운세운 5블록 = 인생 내비게이션
    {
      label: "인생 대운 지도", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "내 인생 전체 지도와\n황금기의 자리.",
      subtitle: "대운 흐름 · 전성기",
      blocks: [
        { h: "인생 대운 흐름", jsxContent: <DaeunMap daeun={daeunLifeMap} />, accent: C.iris },
        { h: "인생의 황금기", text: daeunGoldenText, accent: C.iris },
      ].filter(Boolean),
    },
    {
      label: "대운 인생 테마", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "인생 네 구간으로 보는\n대운의 장면들.",
      subtitle: "초년 · 청년 · 중년 · 말년",
      blocks: [
        lifeEarlyText ? { h: "초년 (만 0~19세)", text: lifeEarlyText, accent: C.iris } : null,
        lifeYoungText ? { h: "청년 (만 20~39세)", text: lifeYoungText, accent: C.iris } : null,
        lifeMidText ? { h: "중년 (만 40~59세)", text: lifeMidText, accent: C.iris } : null,
        lifeLateText ? { h: "말년 (만 60세~)", text: lifeLateText, accent: C.iris } : null,
      ].filter(Boolean),
    },
    {
      label: "지금 대운과 전환기", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "지금 이 10년과\n다가올 전환점.",
      subtitle: "현재 대운 · 전환기 대비",
      blocks: [
        { h: "지금 대운", text: daeunCurText, accent: C.iris },
        { h: "다음 전환점", text: daeunNextText || `대운이 바뀌는 시점이 곧 온다는 것만 알아도 지금 준비하는 방식이 달라져.`, accent: C.iris },
        { h: "대운이 바뀌는 환절기", text: daeunTransitionText, accent: C.iris },
        { h: "전환기를 준비하는 법", text: "대운의 전환기엔 억지로 큰일을 벌이기보다, 몸과 마음을 정비하고 다음 흐름에 올라탈 준비를 하는 게 핵심이야. 하지만 변화를 두려워만 하면 기회도 같이 지나가니, 흐름을 읽고 미리 방향을 틀어두면 전환기가 오히려 도약의 발판이 돼.", accent: C.iris },
      ].filter(Boolean),
    },
    {
      label: "올해 세운", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "올해라는\n해의 정체.",
      subtitle: "올해 세운 · 십성 흐름",
      blocks: [
        { h: `${_thisYearNum}년 · ${_yGan}${_yJi}년`, text: saeunYearText, accent: C.iris },
        { h: "올해 종합 흐름", jsxContent: <CategoryScore months={monthForecast} category="종합" thisYearScore={thisYear?.score || 0} label="종합운" />, accent: C.iris },
      ].filter(Boolean),
    },
    {
      label: "대운 세운 교차 황금기", accent: C.iris,
      tag: "유료", tagColor: C.plum, tagText: C.lavender,
      title: "진짜 크게 터지는\n결정적인 해.",
      subtitle: "대운 × 세운 교차 · 승부의 해",
      blocks: [
        { h: "대운과 세운이 겹치는 해", text: daeunSaeunPeakText, accent: C.iris },
      ].filter(Boolean),
    },
  ]

  const chapters = [...freeChapters, ...lockedChapters]
  const freeCount = freeChapters.length
  const ch = chapters[current]

  // PDF 모드: 전체 챕터를 세로로 쌓아서 렌더
  if (pdfMode) {
    return (
      <div style={{ background: C.void, padding: "16px", fontFamily: FONT, color: C.parchment, width: 480, boxSizing: "border-box" }}>
        <div style={{ textAlign: "center", color: C.caramel, fontSize: 11, letterSpacing: 4, padding: "8px 0 16px", fontFamily: FONT_SANS }}>
          MORA · {d.name}님의 운명 분석
        </div>
        {chapters.map((c, i) => (
          <div key={i} data-pdf-chapter="1" style={{ marginBottom: 20, breakInside: "avoid", background: C.void, padding: "4px 0" }}>
            <div style={{ fontSize: 10, color: i >= freeCount ? C.plum : C.fog, fontFamily: FONT_SANS, marginBottom: 4 }}>
              {i + 1} / {chapters.length} · {c.label}{i >= freeCount ? " · 유료" : ""}
            </div>
            <ChapterCard {...c} flipping={false} flipDir={null} />
          </div>
        ))}
        <div style={{ textAlign: "center", color: C.fog, fontSize: 10, padding: "12px 0", fontFamily: FONT_SANS }}>
          ✦ Mora · fortuneyam.netlify.app
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
