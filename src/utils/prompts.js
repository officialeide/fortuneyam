// utils/prompts.js

function buildAstroPrompt(pillarsStr, ilganKo, ilganHanja, birth){
  return `사주 명식: ${pillarsStr}. 일간(나 자신): ${ilganKo}. 생년월일: ${birth}.
이 사람의 서양 점성술 네이탈 차트를 사주 오행 에너지와 교차 분석해줘.
출생 데이터를 기반으로 가장 가능성 높은 행성 위치를 추정하고, 각 행성이 사주 일간의 기질과 어떻게 공명하는지 설명해줘.
각 행성 설명은 2~3문장. 삼각 핵심 분석(태양·달·ASC 관계)은 3~4문장.

[필수 말투 규칙]
반드시 ~이야, ~해, ~야 체로만 작성해. ~에요, ~아요, ~해요 절대 금지.
콜론(:) 사용 절대 금지. 대시(-) 사용 절대 금지.
한자 절대 사용 금지. 영어 절대 사용 금지.

[별자리 이름 규칙]
반드시 서양 별자리 이름만 써. 예: 염소자리, 물병자리, 물고기자리, 양자리, 황소자리, 쌍둥이자리, 게자리, 사자자리, 처녀자리, 천칭자리, 전갈자리, 궁수자리.
쥐자리, 소자리, 범자리, 토끼자리, 용자리, 뱀자리, 말자리, 원숭이자리, 닭자리, 개자리, 돼지자리 같은 띠 이름 절대 금지.
도수(숫자), 궁(宮), 영어 표기 절대 금지.

이모지나 특수문자 사용 금지.
JSON만 응답 (다른 텍스트 없음):
{"sun":"○○자리","sunDesc":"..","moon":"○○자리","moonDesc":"..","asc":"○○자리","ascDesc":"..","mercury":"○○자리","mercuryDesc":"..","venus":"○○자리","venusDesc":"..","mars":"○○자리","marsDesc":"..","triangle":".."}`;
}

function buildTarotPrompt(tarot, ilganKo, ilganHanja){
  return `생명경로수: ${tarot?.lifePath}. 본명 타로 카드: ${tarot?.lifePathCard}. 영혼 카드(Soul Card): ${tarot?.soulCard}. 성취 카드(Achievement Card): ${tarot?.achieveCard}. 사주 일간: ${ilganKo}(${ilganHanja}).
이 사람의 성취 에너지를 사주 일간과 타로 성취 카드를 연결해서 딱 2문장으로 설명해줘.
반드시 ~이야, ~해 체로 작성해줘. 한 문장은 어떤 방식으로 성취하는지, 한 문장은 어떤 환경에서 빛나는지.
JSON만 응답 (다른 텍스트 없음): {"achieveDesc":"..."}`;
}

function buildInnerPrompt(data){
  const dn=data.daynight;
  const mb=data.mbti;
  const ilgan=data.pillars?.[2]?.gan?.ko||"";
  const ilju=ilgan+(data.pillars?.[2]?.ji?.ko||"");
  const sinsal=(data.sinsal||[]).map(s=>s.name).join(", ")||"없음";
  const yongsin=data.yongsinA||"";
  const gisin=data.gisinA||"";
  const lp=data.tarot?.lifePath||"";
  const triggers=(dn?.night?.triggers||[]).join(" / ");
  return `다음은 ${data.name}님의 사주·심리 데이터야.
일주: ${ilju} / 일간: ${ilgan} / 신강신약: ${data.singang||""} / MBTI: ${mb?.estimated||""} (${mb?.userType||""})
용신(도움되는 기운): ${yongsin} / 기신(피할 기운): ${gisin}
감정 폭발 상황: ${triggers}
낮의 자아: ${dn?.day?.impression||""} / 밤의 욕구: ${dn?.night?.desire||""}
신살: ${sinsal} / 생명경로수: ${lp}

위 데이터로 아래 3가지를 각각 분석해줘.
한자 절대 사용 금지. 전문 용어 쓰면 반드시 쉽게 풀어서 설명해줘.
반드시 ~이야, ~해 체. "${data.name}님"으로 지칭. 이모지·마크다운 금지.

1. innerRhythm (string): 감정 패턴·내면의 그림자·자기 객관화를 통합한 내면 분석 에세이.
   문단1(2문장): 어떤 구체적인 상황(예: "인정받지 못할 때", "예상치 못한 변화가 생길 때")에서 감정이 크게 움직이는지 묘사. "감정이 폭발해" 같은 부정적 표현 금지 — "감동을 받아", "마음이 크게 흔들려요" 같은 중립·긍정 표현 사용.
   문단2(2문장): 회복 방식과 자기 객관화 포인트. 가볍고 공감되는 톤으로. "억눌린 화" 같은 부정적 표현 대신 "에너지가 내면으로 향해" 같은 표현 사용.
   결론(1문장): 핵심 통찰 + 위로.
   전체 300자 이내. "폭발", "폭발하려", "억누르" 등 부정적 단어 절대 사용 금지.

2. exercise (array, 3개): 개운 운동 추천. 각각 {"name":"운동명","reason":"왜 이 사람한테 맞는지 2문장. 사주 근거 포함."}
3. hobby (array, 3개): 개운 취미 추천. 각각 {"name":"취미명","reason":"왜 이 사람한테 맞는지 2문장. 사주 근거 포함."}

JSON만 응답:
{"innerRhythm":"문단1\\n\\n문단2\\n\\n결론","exercise":[{"name":"...","reason":"..."}],"hobby":[{"name":"...","reason":"..."}]}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 딥카드 프롬프트 헬퍼
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function buildDeepPrompt(key, data){
  const ilgan=data.pillars?.[2]?.gan?.ko||"";
  const ilju=ilgan+(data.pillars?.[2]?.ji?.ko||"");
  const base=`[입력 정보]
생년월일: ${data.birth} / 성별: ${data.gender} / 일주: ${ilju} / 일간: ${ilgan}
신강신약: ${data.singang||""} / MBTI: ${data.mbti?.estimated||""} / 생명경로수: ${data.tarot?.lifePath||""}
용신: ${data.yongsinA||""} / 기신: ${data.gisinA||""} / 신살: ${(data.sinsal||[]).map(s=>s.name).join(", ")||"없음"}
태양별자리: ${data._astroAI?.sun||data.astro?.sun||""} / 달별자리: ${data._astroAI?.moon||data.astro?.moon||""} / ASC: ${data._astroAI?.asc||data.astro?.asc||""}
당사주: ${(data.dansaju?.pillars||[]).map(p=>p.byeolseong).join(", ")||""}
토정비결: ${data.tojung?.saja||""}`;

  const TOPIC={
    talent:      {title:"숨겨진 재능",         combo:"사주 용신 × 네이탈 MC × 수비학 표현수"},
    monthRelease:{title:"이번달 에너지", combo:"주역 × 타로 월간 × 수비학 개인월. '과도한 욕심'이 있다면 어떤 종류의 욕심인지(예: 인정 욕구, 빠른 성과, 관계 집착 등) 구체적으로 서술해줘. 일반론 금지, 이 사람의 데이터에 맞는 구체적 사례로 써줘."},
    soulMission: {title:"소울 미션",           combo:"사주 일주 × 타로 메이저 × 당사주 전생궁 × 네이탈 노스노드 × 수비학 생명수. 전생에서 가져온 업과 이번 생에서 완성해야 할 미션을 연결해서 분석해줘."},
    guardian:    {title:"수호 에너지",       combo:"사주 용신 × 네이탈 수호성 × 타로 수호 × 당사주. 아래 항성(Fixed Star) 중 이 사람의 네이탈 차트와 가장 가까운 항성의 에너지를 반드시 언급해줘: 알파 스피카(Spica·처녀자리·창의·행운), 레굴루스(Regulus·사자자리·왕의 기운·리더십), 알데바란(Aldebaran·황소자리·용기·강인함), 안타레스(Antares·전갈자리·집중·극단적 에너지), 시리우스(Sirius·큰개자리·충성·지혜), 베가(Vega·거문고자리·예술·감수성), 포말하우트(Fomalhaut·물고기자리·꿈·이상주의). 사주 용신과 수호 항성 에너지가 어떻게 연결되는지 통합 분석해줘. 수호별과 수호 에너지를 함께 통합 분석해줘."},
  };
  const topic=TOPIC[key];
  if(!topic) throw new Error(`buildDeepPrompt: unknown key '${key}'`);
  return `당신은 사주, 주역, 토정비결, 당사주, 네이탈차트, 타로, 수비학, MBTI를 통합해서 운세를 분석하는 전문가야.

${base}

위 정보를 바탕으로 [${topic.title}]을 분석해줘. (조합 근거: ${topic.combo})

[출력 형식 — 반드시 준수]
- 말투: 반드시 ~이야, ~해, ~야 체로만 작성해. ~에요, ~아요, ~해요, 세요 절대 금지. 콜론(:)·대시(-) 사용 절대 금지. "${data.name}님"으로 지칭. 한자·이모지·마크다운 금지.
- 구조: 문단1(2문장) + 문단2(2문장) + 결론(1문장, 핵심 통찰 + 위로)
- 전체 300자 이내. 계산 과정 없이 결론만. 쉬운 설명.

JSON만 응답 (다른 텍스트 없이):
{"para1":"...","para2":"...","conclusion":"..."}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 딥카드 메타데이터
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DEEP_CARDS=[
  {group:"GROUP A", icon:"🧬",title:"숨겨진 재능",      key:"talent",        bg:"#f0fdf4",border:"#bbf7d0",tc:"#166534"},
  {group:"GROUP B", icon:"📅",title:"이번달 에너지",     key:"monthRelease",  bg:"#fdf4ff",border:"#e9d5ff",tc:"#6b21a8"},
  {group:"GROUP C", icon:"✨",title:"소울 미션",          key:"soulMission",   bg:"#1e1b4b",border:"#4c1d95",tc:"#c4b5fd",dark:true},
  {group:"GROUP D", icon:"⭐",title:"수호 에너지",        key:"guardian",      bg:"#fff8e1",border:"#fde68a",tc:"#b45309"},
];

export { buildAstroPrompt, buildTarotPrompt, buildInnerPrompt, buildDeepPrompt, DEEP_CARDS };
