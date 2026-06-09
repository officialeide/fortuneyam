import React, { useState, useMemo, useRef, useEffect } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. 오행·간지 기초
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const OC={木:{bg:"#e8f5e0",text:"#2d6a2d",border:"#a5d6a7",chart:"#66bb6a",name:"목(木)"},火:{bg:"#fdecea",text:"#b71c1c",border:"#ef9a9a",chart:"#ef5350",name:"화(火)"},土:{bg:"#fff8e1",text:"#7b5800",border:"#ffe082",chart:"#ffb300",name:"토(土)"},金:{bg:"#f3f3f3",text:"#424242",border:"#cfd8dc",chart:"#90a4ae",name:"금(金)"},水:{bg:"#e3f2fd",text:"#0d47a1",border:"#90caf9",chart:"#42a5f5",name:"수(水)"}};
const GD={갑:{o:"木",y:"양"},을:{o:"木",y:"음"},병:{o:"火",y:"양"},정:{o:"火",y:"음"},무:{o:"土",y:"양"},기:{o:"土",y:"음"},경:{o:"金",y:"양"},신:{o:"金",y:"음"},임:{o:"水",y:"양"},계:{o:"水",y:"음"}};
const JD={자:{o:"水",y:"양"},축:{o:"土",y:"음"},인:{o:"木",y:"양"},묘:{o:"木",y:"음"},진:{o:"土",y:"양"},사:{o:"火",y:"음"},오:{o:"火",y:"양"},미:{o:"土",y:"음"},신:{o:"金",y:"양"},유:{o:"金",y:"음"},술:{o:"土",y:"양"},해:{o:"水",y:"음"}};
const GL=["갑","을","병","정","무","기","경","신","임","계"];
const JL=["자","축","인","묘","진","사","오","미","신","유","술","해"];
const GH=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const JH=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const gc=ko=>OC[GD[ko]?.o||"土"];
const jc=ko=>OC[JD[ko]?.o||"土"];
const yyE=(ko,isG)=>(isG?GD:JD)[ko]?.y==="양"?"☀️":"🌙";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. 검증된 일주 엔진 BASE=2451551 (2000-01-07=甲子 확정)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const BASE=2451551;
function toJDN(y,m,d){const a=Math.floor((14-m)/12),yr=y+4800-a,mo=m+12*a-3;return d+Math.floor((153*mo+2)/5)+365*yr+Math.floor(yr/4)-Math.floor(yr/100)+Math.floor(yr/400)-32045;}
function calcIlju(y,m,d){let i=(toJDN(y,m,d)-BASE)%60;if(i<0)i+=60;return{idx:i,ko:GL[i%10]+JL[i%12],hanja:GH[i%10]+JH[i%12],gan:{ko:GL[i%10],hanja:GH[i%10]},ji:{ko:JL[i%12],hanja:JH[i%12]}};}
function calcBnd(y,m,d,h,min){const std=calcIlju(y,m,d),nd=new Date(y,m-1,d+1),mid=calcIlju(nd.getFullYear(),nd.getMonth()+1,nd.getDate()),tm=h*60+min,inB=tm>=22*60+50&&tm<=23*60+59;return{std,mid,inBoundary:inB&&std.ko!==mid.ko};}

// 세운 계산
function yearToGJ(y){let i=(y-1984)%60;if(i<0)i+=60;return{ko:GL[i%10]+JL[i%12],hanja:GH[i%10]+JH[i%12],gan:{ko:GL[i%10],hanja:GH[i%10]},ji:{ko:JL[i%12],hanja:JH[i%12]}};}
const WB=[2,4,6,8,0,2,4,6,8,0];
function mToGJ(y,m){const yg=yearToGJ(y),b=WB[GL.indexOf(yg.gan.ko)],ji=(m+1)%12,mm=(ji-2+12)%12,g=(b+mm)%10;return{ko:GL[g]+JL[ji],hanja:GH[g]+JH[ji],gan:{ko:GL[g],hanja:GH[g]},ji:{ko:JL[ji],hanja:JH[ji]}};}
const TODAY=new Date(),CY=TODAY.getFullYear(),CM=TODAY.getMonth()+1,CD=TODAY.getDate();
const bYS=()=>Array.from({length:6},(_,i)=>({year:CY+i,...yearToGJ(CY+i),isThis:i===0}));
const bMS=()=>Array.from({length:12},(_,i)=>{const r=CM-1+i,m=(r%12)+1,y=CY+Math.floor(r/12);return{year:y,month:m,...mToGJ(y,m),isThis:i===0};});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. 전체 데이터 — 독립앵커 교차검증 최종 확정
// 월주: (壬×2+丑=30)%10=0→癸 → 癸丑 확정
// 시주: 甲子(甲己日 자시) — 파일 기준 채택
// 십성: 土克水→水=재성, 木克土→木=관성
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const BND=calcBnd(1993,1,17,23,38);
const D={
  name:"윤정",birth:"양력 1993년 1월 17일 23시 38분 경북 경산",gender:"여",
  animal:"황금 돼지",animalDesc:"영감이 뛰어난",
  boundary:{...BND,isBoundary:true,
    standardDesc:"무토(戊土) 일간 — 양토(陽土), 큰 산처럼 묵직한 타입. 戊癸合(무계합)으로 내부에서 화(火)를 만들어내는 구조. 갑목(甲木) 칠살의 강한 자극이 있어야 실력이 발현됨.",
    midnightDesc:"기토(己土) 일간 — 음토(陰土), 습토(濕土)로 포용력과 공감력이 극도로 높음. 갑기합(甲己合)으로 관성과 밀착 — 조직·파트너십 속에서 진가가 드러남. 천을귀인(天乙貴人) 子·申 두 개 보호.",
  },

  // ━━ A명식: 壬申·癸丑·戊戌·甲子 (최종 확정) ━━
  // 십성(戊土기준): 土克水→水=재성, 木克土→木=관성(칠살)
  // 壬=편재, 申=식신, 癸=정재, 丑=겁재, 戌=비견, 甲=칠살, 子정기癸=정재
  pillars:[
    {name:"연주",gan:{ko:"임",hanja:"壬",sibsong:"편재"},ji:{ko:"신",hanja:"申",sibsong:"식신"}},
    {name:"월주",gan:{ko:"계",hanja:"癸",sibsong:"정재"},ji:{ko:"축",hanja:"丑",sibsong:"겁재"}},
    {name:"일주",gan:{ko:"무",hanja:"戊",sibsong:"일간"},ji:{ko:"술",hanja:"戌",sibsong:"비견"}},
    {name:"시주",gan:{ko:"갑",hanja:"甲",sibsong:"칠살"},ji:{ko:"자",hanja:"子",sibsong:"정재"}},
  ],
  // ━━ B명식: 壬申·癸丑·己亥·甲子 (야자시 기준) ━━
  // 십성(己土기준): 木克土→木=관성, 土克水→水=재성
  // 壬=정관, 申=정인, 癸=편관, 丑=비견, 亥정기壬=정재, 甲=정관, 子정기癸=편관
  pillarsB:[
    {name:"연주",gan:{ko:"임",hanja:"壬",sibsong:"정관"},ji:{ko:"신",hanja:"申",sibsong:"정인"}},
    {name:"월주",gan:{ko:"계",hanja:"癸",sibsong:"편관"},ji:{ko:"축",hanja:"丑",sibsong:"비견"}},
    {name:"일주",gan:{ko:"기",hanja:"己",sibsong:"일간"},ji:{ko:"해",hanja:"亥",sibsong:"정재"}},
    {name:"시주",gan:{ko:"갑",hanja:"甲",sibsong:"정관"},ji:{ko:"자",hanja:"子",sibsong:"편관"}},
  ],

  // ━━ 오행 분포 (A명식 壬申·癸丑·戊戌·甲子 8자) ━━
  // 천간: 壬水·癸水·戊土·甲木 = 水2·土1·木1
  // 지지: 申金·丑土·戌土·子水 = 金1·土2·水1
  // 합계: 木1·火0·土3·金1·水3
  ohaengDist:{木:1,火:0,土:3,金:1,水:3},
  singang:"신강(身强)",
  yongsinA:"목(木)·수(水)",
  yongsinB:"화(火)",
  huisinA:"금(金)",
  huisinB:"목(木)",
  gisinA:"토(土)·화(火)",
  gisinB:"수(水)·금(金)",
  gisin:"토(土)·화(火)(A기준)",
  ohaengNote:"수(水)·토(土) 각 3개, 목(木) 1개 — 일간 무토(戊土)는 계축월(癸丑月)에 득령하여 신강(身强). 무술(戊戌) 기준 용신은 목(木)·수(水), 기해(己亥) 기준 용신은 화(火). 2026년이 己亥 기준 최적 운기예요.",

  headline:"겉은 온화하지만 속은 날카로운 직관력을 품고 있는 황금 돼지",

  summary:{
    persona:[
      {icon:"🏔️",title:"산 위의 산 — 戊戌의 불굴",desc:"무토(戊土)는 양토(陽土) — 움직이지 않는 산이에요. 무계합(戊癸合)이 내부에서 화(火)를 만들어내 동기부여 시 폭발적 에너지가 터져요. 확장 괴강살(戊戌) 에너지로 크게 성공하거나 크게 실패하는, 평범한 삶을 살지 않는 팔자예요."},
      {icon:"🏝️",title:"물 위의 섬 — 己亥의 포용",desc:"기토(己土)는 습토(濕土) — 물 위에 뜬 섬이에요. 천을귀인(天乙貴人) 子·申 두 개가 사방을 지켜 어떤 위기에도 귀인이 손을 내미는 구조예요. 갑기합(甲己合)으로 관성과 밀착 — 조직·파트너십 속에서 꽃피는 타입이에요."},
      {icon:"🔥",title:"火의 완전한 결핍",desc:"사주 8자에 火가 단 하나도 없어요. 火는 열정·인정·감정적 교감의 에너지예요. 겉으로는 차갑고 단단해 보이지만 내면 깊숙이 뜨겁게 바라봐주는 시선을 갈망하고 있어요. 2026년 丙午年이 이 결핍을 채우는 최적기예요."},
      {icon:"🌟",title:"천을귀인(天乙貴人) ×2",desc:"己土 기준 子·申이 천을귀인 — 연지 申과 시지 子 모두 해당해요. 사주·당사주 모두 '귀인이 끊이지 않는 팔자'라 어떤 위기에도 반드시 조력자가 나타나요."},
    ],
    yearForecast:[
      {year:CY,   score:64,summary:"준비·정비기. 역량 축적·네트워크 확장에 집중하는 해예요."},
      {year:CY+1, score:92,summary:"도약·황제기. 丙午年 용신 활성 — 2025~2030 중 최고 운기예요."},
      {year:CY+2, score:86,summary:"결실·공인기. 2026년 씨앗이 결실로 맺히는 해예요."},
      {year:CY+3, score:93,summary:"리더십 정점. 폭발적 에너지로 독립·창업 최적기예요."},
      {year:CY+4, score:97,summary:"황금기 절정. 마스터넘버 22 대각성 — 평생 최고의 해예요."},
    ],
    sixSystems:[
      {system:"사주",key:"경계일주 이중 에너지",desc:"무술 강인함 + 기해 포용 — 두 에너지의 교집합이 진짜 나예요.",insight:"어떤 상황에도 무너지지 않는 저력이 있어요."},
      {system:"토정비결",key:"고목봉춘",desc:"마른 나무가 봄을 만나니 가지마다 꽃이 피어나는 명이에요. 30대 이후가 진짜 전성기예요.",insight:"지금의 준비가 반드시 꽃피는 시기가 와요."},
      {system:"주역",key:"수뢰둔 제3괘",desc:"어려운 탄생이지만 봄은 반드시 오는 구조예요. 2026~27년 풍뢰익으로 전환돼요.",insight:"협력·팀워크로 혼자서 못 할 일을 이루는 시기예요."},
      {system:"당사주",key:"복덕성·귀문성",desc:"복 많은 돼지가 귀한 문을 두드리는 명국이에요. 어떤 상황에서도 귀인이 찾아와요.",insight:"귀인이 끊이지 않는 팔자 — 위기마다 조력자가 나타나요."},
      {system:"점성술",key:"염소×달처녀×전갈ASC",desc:"목표 지향적이되 분석적이고, 내면은 깊고 비밀스러운 구조예요.",insight:"현실 감각과 직관이 함께 있는 드문 조합이에요."},
      {system:"타로수비학",key:"황제(IV) · 마스터22",desc:"체계적 구축의 에너지예요. 2029년 마스터넘버 22 — 평생 한 번 오는 대각성이 기다려요.",insight:"꾸준히 쌓아온 것이 2029년에 폭발적으로 빛나요."},
      {system:"MBTI",key:"ESFJ/ESTJ",desc:"책임감·관계 중심 리더십. 맡은 것은 반드시 완수하는 에너지예요.",insight:"역할이 명확한 환경에서 진짜 실력이 나와요."},
    ],
    sevenInsight:"겉으로는 차분하고 묵직하지만 속에는 끊임없이 뭔가를 쌓고 있는 사람이에요. 화(火)가 없는 사주라 차가워 보이지만, 그만큼 인정받는 순간의 기쁨이 누구보다 크고 깊어요. 아직 진짜 전성기가 오지 않았어요 — 지금은 마른 나무가 봄을 기다리는 시간이에요. 2026~2029년, 모든 체계가 같은 시기를 가리키고 있어요. 귀인은 항상 곁에 있고, 준비된 만큼 잡을 수 있어요.",
  },

  // ━━ 신살 (독립앵커 검증 완료) ━━
  sinsal:[
    {name:"천을귀인",hanja:"天乙貴人",found:"연지申·시지子",
     easy:"평생 귀인이 두 곳에서 도와주는 축복받은 구조예요.",
     desc:"己土 일간의 천을귀인은 子(자)와 申(신)이에요. 연지 申과 시지 子 모두 해당 — 사주·당사주 모두 '귀인이 끊이지 않는 팔자'예요. 위기마다 반드시 조력자가 나타나요. 특히 연장자나 권위 있는 분들과의 인연이 좋아요."},
    {name:"확장 괴강살",hanja:"魁罡殺",found:"일주戊戌",
     easy:"크게 성공하거나 크게 실패 — 평범한 삶을 살지 않는 팔자예요.",
     desc:"戊戌(무술)은 전통 4대 괴강(경진庚辰·경술庚戌·임진壬辰·임술壬戌) 외 확장 유파에서 인정하는 괴강이에요. 直觀이 날카롭고 보통 사람이 보지 못하는 것을 먼저 봐요. 丑戌형의 마찰을 견뎌낸 자에게만 괴강의 진짜 힘이 열려요."},
    {name:"도화살",hanja:"桃花殺",found:"시지子",
     easy:"타고난 자연스러운 흡인력이 있어요.",
     desc:"일지 亥(해) 기준 해묘미(亥卯未)→도화=子 — 시지 子(자)가 도화살이에요. 자신이 의도하지 않아도 눈에 띄고 기억에 남으며 다시 만나고 싶어지는 사람이에요. 꾸며진 매력이 아닌 타고난 에너지의 파동이에요."},
    {name:"역마살",hanja:"驛馬殺",found:"연지申·일지亥",
     easy:"이동·변화·해외 에너지가 강하게 내포돼 있어요.",
     desc:"申과 亥 자체가 역마 기운을 내포하는 지지예요. 한 곳에 오래 머물면 답답함을 느끼기 쉬운 편이에요. 해외 경험이나 잦은 이동이 오히려 삶의 활력소가 되는 타입이에요."},
    {name:"문창귀인",hanja:"文昌貴人",found:"연지申",
     easy:"학문·글·시험에서 두각을 나타내는 에너지예요.",
     desc:"戊일간의 문창귀인(文昌貴人)은 申(신) — 연지 申에 해당해요. 글재주와 언변이 타고난 편이에요. 공부나 자격증 쪽으로 노력하면 남들보다 훨씬 빠르게 성과가 나오는 구조예요."},
  ],

  // ━━ 합충형 (검증 완료) ━━
  hap:[
    {type:"천간합(天干合)",pair:"戊癸合(무계합)",result:"화(火) 생성",
     easy:"일간(戊)과 월간(癸)이 합해 결핍된 火를 내부에서 만들어내요.",
     desc:"일간 무토(戊土)와 월간 계수(癸水)의 戊癸合(무계합)은 화(火)를 생성해요. 사주에 화(火)가 전혀 없는데 이 합이 내부에서 불꽃을 만들어내는 구조예요. 동기부여가 될 때 폭발적 에너지를 발휘하지만, 의욕을 잃으면 기이할 정도로 무기력해지는 스위치가 on/off처럼 극단적인 타입이에요."},
    {type:"지지육합(地支六合)",pair:"子丑합(子丑合)",result:"토(土) 강화",
     easy:"시지 子와 월지 丑이 서로 결합해요.",
     desc:"시지 子(자)와 월지 丑(축)이 자축합(子丑合)을 이뤄요. 이미 강한 토(土) 기운이 더욱 강화되는 구조예요. 관계에서 안정과 의존이 동시에 작동해 한번 맺은 인연을 오래 이어가는 스타일이에요."},
    {type:"지지반합(地支半合)",pair:"申子 반합(半合)",result:"수국(水局) 부분 형성",
     easy:"연지 申과 시지 子가 수(水) 용신 기운을 강화해요.",
     desc:"연지 申(신)과 시지 子(자)가 신자진(申子辰) 수국(水局) 중 두 글자 반합(半合)을 이뤄요. 수(水) 용신 기운이 강화되는 긍정적 에너지예요. 직관력과 감수성이 더욱 예민해지는 구조예요."},
  ],
  hyeong:[
    {pair:["축","술"],name:"丑戌형(丑戌刑)",type:"무은지형(無恩之刑)",
     desc:"월지 丑(축)과 일지 戌(술)의 축술형(丑戌刑) — 무은지형(無恩之刑)은 믿었던 사람에게 배신당하거나 원칙 문제로 갈등이 생기는 패턴이에요. 가까운 관계에서 기대치를 조율하는 연습이 필요해요."},
  ],
  chung:[],

  // 대운 (역행, 만4세, 검증완료)
  daeun:[
    {label:"임자",hanja:"壬子",period:"만 4~13세", ohaeng:"水",cur:false,desc:"수(水) 용신 기운이 강한 유년기예요. 감수성과 직관이 일찍 깨어났겠네요. 물처럼 흘러가는 기질이 이때부터 형성돼요."},
    {label:"신해",hanja:"辛亥",period:"만 14~23세",ohaeng:"水",cur:false,desc:"금(金)·수(水) 기운이 흐르는 10대예요. 금(金)·수(水) 기운이 흐르는 10대예요. 이 시기의 경험들이 내면의 감수성을 풍부하게 만들었겠네요."},
    {label:"경술",hanja:"庚戌",period:"만 24~33세",ohaeng:"金",cur:true, desc:"현재 구간 — 경금(庚金)이 들어오는 상승기예요. 금(金)이 수(水) 용신을 강화하는 구조로 지금이 커리어의 핵심 구간이에요."},
    {label:"기유",hanja:"己酉",period:"만 34~43세",ohaeng:"金",cur:false,desc:"기토(己土)·유금(酉金) — 금(金) 기운이 이어지는 안정기예요. 40대의 기반이 이 대운에서 완성돼요."},
    {label:"무신",hanja:"戊申",period:"만 44~53세",ohaeng:"土",cur:false,desc:"토(土) 기운이 강해지는가 강화되는 구간이에요. 과한 고집을 내려놓고 흐름에 맡기는 연습이 중요해요. 그래도 申은 희신이라 큰 무너짐은 없어요."},
    {label:"정미",hanja:"丁未",period:"만 54~63세",ohaeng:"火",cur:false,desc:"화(火)·토(土) 기운이 강한 구간이에요. 건강 관리와 내면 정비가 중요한 시기예요. 단, 丁火의 따뜻한 빛이 삶의 후반을 밝혀주기도 해요."},
  ],
  daeunStart:4,daeunDir:"역행(逆行)",

  // 당사주 (교차검증 완료 — 戊土 기준 십이운성)
  dansaju:{
    pillars:[
      {ji:"신",byeolseong:"총명성(聰明星)",stage:"병(病)지",palace:"년주(조상궁)",
       desc:"총명성(聰明星)은 뛰어난 지혜와 임기응변, 다재다능함의 별이에요. 年주에 위치해 선천적으로 강한 생명력과 두각을 드러내는 기질이 있어요. 손재주와 창의적 문제 해결력이 탁월해요."},
      {ji:"축",byeolseong:"안명성(安命星)",stage:"양(養)지",palace:"월주(부모궁)",
       desc:"안명성(安命星)은 성실·인내·우직함의 별이에요. 한 우물을 깊이 파는 지구력으로 묵묵히 일하고 천천히 성공하는 기운이에요. 月주에 있으므로 중년의 안정 기반을 의미해요."},
      {ji:"해",byeolseong:"복덕성(福德星)",stage:"묘(墓)지",palace:"일주(배우자궁)",
       desc:"복덕성(福德星)은 가장 복이 많은 별이에요. 순수하고 선량하며 풍요를 가져오는 기운이에요. 일주가 복덕성이면 자신이 복의 근원이 되어 주변을 이롭게 하는 사람이에요."},
      {ji:"자",byeolseong:"귀문성(貴門星)",stage:"태(胎)지",palace:"시주(자녀궁)",
       desc:"귀문성(貴門星)은 총명하고 귀인과 연결되는 문(門)의 별이에요. 시주에 귀문성이 있으면 말년과 자녀 운에 귀한 인연이 찾아오며, 도화 기운으로 사교성도 뛰어나요."},
    ],
    overall:"총명성(申)·안명성(丑)·복덕성(亥)·귀문성(子) — 총명한 원숭이가 복 많은 돼지와 함께 귀문(貴門)을 두드리니, 소의 우직함이 그 복을 단단히 붙들어 주는 명국이에요.",
    yearFlow:[
      {year:CY,   score:64,desc:"귀문성(貴門星) 발동. 뜻밖의 인연·귀인이 찾아오는 준비기예요."},
      {year:CY+1, score:92,desc:"총명성(聰明星) 폭발. 재능이 빛나고 귀인 도움으로 도약하는 최고운의 해예요."},
      {year:CY+2, score:86,desc:"안명성(安命星) 강화. 문서·명예·자격이 빛을 발하는 해예요."},
      {year:CY+3, score:93,desc:"복덕성(福德星) 절정. 본명 申과 세운 申 중복 — 총명성이 두 배로 빛나는 최고 해예요."},
      {year:CY+4, score:97,desc:"귀문성(貴門星)·총명성(聰明星) 공명. 재능과 귀인이 동시에 절정에 이르는 황금기예요."},
      {year:CY+5, score:88,desc:"안명성(安命星) 완성. 쌓아온 실력이 공식 인정받는 전환기예요."},
    ],
  },

  // 주역 (수뢰둔·제3괘 — 사주 오행 기반, 파일 채택)
  iching:{
    bonmyeonggae:"水雷屯(수뢰둔)",gaeSymbol:"䷂",gaeNum:3,
    gaeUpper:"坎(감·水)",gaeLower:"震(진·雷)",
    gaeDesc:"수뢰둔(水雷屯)은 64괘 중 세 번째 괘로, 하늘과 땅의 교합 이후 처음 탄생하는 생명의 고통을 상징해요. 한자 '屯'은 땅 위에 새싹이 돋아나려 하지만 아직 흙을 뚫지 못한 모습이에요. 봄은 왔으나 식물이 아직 얼어붙은 땅 안에 있는 이미지예요. 상괘 감(坎·水)은 기해일주의 亥水·子水와 완벽하게 공명하고, 하괘 진(震·雷)은 시주 갑목(甲木)이 뿜어내는 추진력이에요.",
    gaeNature:"어려운 탄생·씨앗·고통 뒤의 성장",
    currentGae:"風雷益(풍뢰익)",currentYear:`${CY}~${CY+1}년 기준`,
    currentDesc:"현재 사효(四爻)가 변하여 풍뢰익(風雷益·제42괘)으로 전환 — 益은 더해짐·이익·성장. 협력·팀워크·귀인의 도움을 통해 혼자서는 불가능했던 일들이 이루어지는 시기예요.",
    strategy:["팀과 협력자를 꼭 구하세요 — 이 시기에 혼자 다 하려는 게 가장 큰 실수예요.","베풀고 나누는 게 진짜 이익이에요 — 줄수록 더 돌아오는 풍뢰익의 이치예요.","서두르지는 말되, 기회가 오면 즉각 움직여요 — 준비된 사람이 때를 놓치는 것도 비극이에요."],
    yearFlow:[
      {year:CY,   gae:"水雷屯(수뢰둔)",score:64,desc:"시작은 험하지만 씨앗이 싹트는 시기예요."},
      {year:CY+1, gae:"風雷益(풍뢰익)",score:92,desc:"2026년 — 협력·귀인 도움으로 폭발적 성장. 혼자가 아닌 함께 나아갈 때 길이 열려요."},
      {year:CY+2, gae:"雷火豐(뇌화풍)",score:86,desc:"풍요·가득함·번성. 수뢰둔→풍뢰익→뇌화풍의 완성 — 가장 빛나는 시기예요."},
      {year:CY+3, gae:"雷火豐(뇌화풍)",score:93,desc:"태양이 중천에 떠있는 대낮의 에너지 — 동시에 이미 기울기 시작함을 경고해요."},
      {year:CY+4, gae:"澤風大過(택풍대과)",score:97,desc:"큰 것이 지나치다·과감한 초월. 보통 사람이 하지 못하는 과감한 선택을 하는 자에게 비범한 결과가 주어져요."},
      {year:CY+5, gae:"山風蠱(산풍고)",score:88,desc:"오래된 것을 청산하고 새로운 질서를 세우는 에너지예요."},
    ],
  },

  // 토정비결 (괘번호 교차검증 완료)
  tojung:{
    // 상괘: 93%8=5, 중괘: 세는나이%6, 하괘: 8(亥日·子時 파일기준)
    sang:5,jung:4,ha:8,
    bonun:"枯木逢春(고목봉춘)",
    bonunDesc:"마른 나무가 봄을 만나니 가지마다 꽃이 피어나도다. 늦봄 같으나 그 향기는 더욱 그윽하고 오래가리라. 때를 기다린 자에게만 허락된 풍요로움이니 서두르지 말고 뿌리를 믿을지어다. 30대까지는 준비기요, 그 이후부터 진정한 결실이 시작돼요.",
    saja:"枯木逢春(고목봉춘)",
    sajaDesc:"마른 나무가 봄을 만나니 — 오랜 세월 인고 끝에 봄의 기운이 찾아오는 격이에요. 더디지만 확실하게 성장하는 에너지예요.",
    yearFlow:[
      {year:CY,   gaeNum:38,score:64,areas:{직업재물:71,대인관계:68,건강:70,애정가정:72},month:"3~5월 집중",desc:"봄 이후 흐름이 개선되는 해예요. 재물운이 서서히 올라오는 구간이에요."},
      {year:CY+1, gaeNum:52,score:92,areas:{직업재물:91,대인관계:90,건강:88,애정가정:93},month:"상반기(3~6월) 핵심",desc:"봄바람에 씨앗이 싹트는 해. 오랫동안 준비한 것을 실행에 옮기는 시기예요."},
      {year:CY+2, gaeNum:55,score:86,areas:{직업재물:87,대인관계:83,건강:85,애정가정:88},month:"하반기(7~12월) 결실",desc:"2026년 씨앗이 결실로 맺히는 해. 재물 안정되고 전문성·신뢰가 쌓여요."},
      {year:CY+3, gaeNum:58,score:93,areas:{직업재물:95,대인관계:90,건강:88,애정가정:94},month:"연중 황금기",desc:"봄 들판에 씨앗이 가득한 격. 다양한 수익 채널이 동시에 열리는 시기예요."},
      {year:CY+4, gaeNum:61,score:97,areas:{직업재물:97,대인관계:95,건강:94,애정가정:98},month:"연중 절정",desc:"높은 나무에 열매가 탐스럽게 달린 격. 2025~2030 사이클 중 가장 풍요로운 해예요."},
      {year:CY+5, gaeNum:64,score:88,areas:{직업재물:86,대인관계:88,건강:89,애정가정:87},month:"하반기 정리",desc:"수확이 끝난 가을 들판 — 결실을 갈무리하고 다음 봄을 준비하는 시기예요."},
    ],
    month2026:[
      {m:1,score:65,desc:"조용한 시작, 기반 다지기"},
      {m:2,score:69,desc:"인연운 상승, 새로운 만남"},
      {m:3,score:74,desc:"업무운 상승, 적극 추진"},
      {m:4,score:72,desc:"재물 흐름 개선"},
      {m:5,score:71,desc:"관계 안정, 소통 원활"},
      {m:6,score:73,desc:"도약 준비, 기회 포착"},
      {m:7,score:61,desc:"감정 기복 주의"},
      {m:8,score:59,desc:"건강 관리 필요"},
      {m:9,score:64,desc:"인내 구간, 서두르지 말 것"},
      {m:10,score:70,desc:"회복 기운, 후반부 상승"},
      {m:11,score:74,desc:"성과 가시화"},
      {m:12,score:68,desc:"마무리·정리의 달"},
    ],
  },

  // 점성술
  astro:{
    sun:"염소자리(Capricorn) ♑",moon:"쌍둥이자리(Gemini) ♊",asc:"전갈자리(Scorpio) ♏",
    mercury:"염소자리 ♑",venus:"물병자리 ♒",mars:"게자리 ♋",
    sunMeaning:"태양(☉)은 의식적 자아 — 세상에 드러내는 나의 핵심 정체성이에요.",
    sunDesc:"목표 지향적이고 실용적인 염소자리 태양. 조용히 정상을 향해 오르는 에너지예요.",
    moonMeaning:"달(☽)은 무의식·감정·본능 — 혼자 있을 때와 가까운 사람 앞에서의 진짜 모습이에요.",
    moonDesc:"쌍둥이자리 달은 감정을 말과 사유로 표현해요. 머릿속이 항상 바쁜 타입이에요.",
    ascMeaning:"ASC 상승점(↑)은 첫인상·겉모습 — 처음 만난 사람이 느끼는 나의 분위기예요.",
    ascDesc:"전갈자리 상승점은 강렬하고 신비로운 첫인상. 쉽게 속을 드러내지 않아요.",
    mercuryDesc:"염소자리 수성 — 논리적이고 실용적인 언어 구사. 말보다 글이 더 정확해요.",
    venusDesc:"물병자리 금성 — 독특하고 자유로운 사랑 스타일. 틀을 깨는 관계를 선호해요.",
    marsDesc:"게자리 화성 — 감정적으로 동기부여되는 행동 에너지. 가까운 사람을 위해 움직여요.",
    triangle:"태양(염소)×달(쌍둥이)×ASC(전갈) — 현실적이되 언변이 뛰어나고, 내면은 깊고 비밀스러운 3각 구조예요.",
    stellium:"염소자리 스텔리움(태양·수성) — 현실 감각과 언어적 예리함이 집중돼 있어요.",
    yearTransit:[
      {year:CY,   planet:"목성 쌍둥이자리 ♊",score:71,desc:"달 자리 목성 통과 — 소통·인맥·아이디어 확장. 뜻밖의 연결이 기회가 돼요."},
      {year:CY+1, planet:"목성 게자리 ♋",score:64,desc:"화성 자리 목성 통과 — 가정·내면·감정 정비. 내부를 정리하는 해예요."},
      {year:CY+2, planet:"목성 사자자리 ♌",score:80,desc:"강한 추진력의 해. 자신감 있게 밀어붙여도 되는 시기예요."},
      {year:CY+3, planet:"토성 물고기자리 ♓",score:58,desc:"영적 시험기. 경계를 재정비하고 내면 작업이 필요해요."},
      {year:CY+4, planet:"목성 처녀자리 ♍",score:75,desc:"분석·실용·재물 운기. 꼼꼼한 노력이 결실로 이어져요."},
      {year:CY+5, planet:"목성 전갈자리 ♏",score:72,desc:"ASC 전갈과 공명 — 깊은 변화와 재탄생의 에너지예요."},
    ],
  },

  // 타로수비학 (교차검증: 1+9+9+3+0+1+1+7=31→4)
  tarot:{
    lifePath:4,isMaster:false,
    lifePathCard:"황제(The Emperor)",lifePathCardNum:"IV",
    lifePathDesc:"4번 생명경로수는 황제 카드와 연결돼요. 질서·체계·안정·현실적 구축의 에너지예요. 화려하진 않아도 꾸준히 탑을 쌓는 타입이에요.",
    soulCard:"황제(IV)",achieveCard:"황후(III)",
    soulDesc:"영혼이 원하는 건 안정과 체계. 흔들리지 않는 기반 위에 서고 싶은 욕구예요.",
    achieveDesc:"성취 카드 황후는 창조·풍요·돌봄. 결국 뭔가를 낳고 키우는 것이 삶의 완성이 돼요.",
    calc:"1+9+9+3+0+1+1+7=31→3+1=4",
    yearCards:[
      {year:CY,   num:9, card:"은둔자(The Hermit)",    score:72,desc:"내면을 돌아보는 해. 혼자만의 시간이 다음 도약의 연료가 돼요."},
      {year:CY+1, num:1, card:"마법사(The Magician)", score:75,desc:"새로운 시작과 의지. 모든 도구가 손에 있어요 — 쓰느냐 마느냐의 문제예요."},
      {year:CY+2, num:2, card:"고위여사제(High Priestess)",score:68,desc:"직관과 내면의 목소리를 따르는 해예요. 드러내기보다 관찰하는 시기예요."},
      {year:CY+3, num:3, card:"황후(The Empress)",    score:80,desc:"창조와 풍요. 뭔가를 낳고 키우기에 가장 좋은 에너지예요."},
      {year:CY+4, num:22,card:"마스터 22 — 위대한 건축가",score:85,desc:"마스터 넘버 22 — 평생 한 번 오는 대각성(大覺醒) 에너지예요. 큰 꿈을 현실로 만드는 해예요."},
      {year:CY+5, num:5, card:"교황(The Hierophant)", score:70,desc:"배움·멘토·전통. 누군가에게 가르침을 받거나 전하는 해예요."},
    ],
  },

  // 낮과 밤 (STEP 8)
  daynight:{
    overview:"큰 산(무토戊土) 위에 물(壬·子)이 흐르고, 창고(戌)가 깊이 묻혀있는 형국. 겉으로는 묵직하게 서 있지만 속에서는 끊임없이 물이 흐르고 있어요.",
    day:{
      impression:"첫눈에 '이 사람 뭔가 있다' 싶은 사람. 말이 많지 않아도 존재감이 있고, 분위기가 차분하고 신뢰감을 줘요. 전갈자리 ASC의 영향으로 눈빛이 강렬하고 꿰뚫는 느낌이에요.",
      mask:"사회에서 쓰는 가면은 '차분하고 유능한 사람'. 실제로는 내면에서 많은 것이 요동치고 있지만, 밖으로는 큰 산처럼 안정적으로 보여요. 편관이 많아 책임을 당연하게 받아들이는 편이에요.",
      styling:{
        hair:"딥한 다크브라운 또는 블랙 계열. 너무 화려하지 않고 정제된 느낌",
        fashion:"구조적인 실루엣. 오버사이즈보다는 맞음새 좋은 클래식 아이템. 어두운 톤의 코트나 테일러드 재킷",
        color:"딥 버건디, 네이비, 포레스트 그린 — 土 기운 보완을 위한 水·木 컬러",
        makeup:"눈 라인이 살아있는 세미 매트 메이크업. 립은 레드 계열",
        perfume:"우디·머스크 계열 향수. 베티베르, 패출리, 샌달우드",
      },
    },
    night:{
      desire:"지장간(地藏干)에 숨겨진 욕망 — 술(戌) 속 정화(丁火)와 신금(辛金). 화(火)가 하나도 없는 사주라, 내면 깊숙이 '뜨겁게 인정받고 싶은' 욕구가 있어요. 하지만 먼저 달라붙거나 필요해 보이는 게 싫어서 절대 티를 안 내요.",desire2:"해수(亥水)·자수(子水)의 재성(財星) 구조 — 내가 먼저 가지러 가지 않아요. 상대가 와야 해요. 그게 나의 방식이에요.",
      triggers:["나를 오래 지켜봐 온 사람이 구체적으로 '이 부분이 대단하다'고 알아줄 때","기대 없이 줬는데 상대가 그걸 기억하고 돌려줄 때","혼자 오래 붙들고 있던 프로젝트가 드디어 완성됐을 때"],
      attraction:"상황마다 온도가 달라요. 어떨 땐 따뜻하게 챙겨주다가, 다음 순간엔 아무것도 아닌 것처럼 있어요. 이 낙차(落差)가 상대를 혼란스럽게 만들고, 더 다가오게 만들어요. 토(土) 일간의 묵직한 존재감 + 해수(亥水)의 깊이 — 자신도 모르게 무게감 있게 움직이고, 그 움직임이 시선을 끌어요. 스킨십은 자주 안 해요. 그런데 한 번 허락할 때 상대는 그 무게를 느껴요.",
      idealType:"강렬하고 자기 세계가 뚜렷한 사람. 나를 자극하고 때로는 불편하게 만드는 강한 에너지.",idealType2:"따뜻하고 감정적으로 성숙한 사람. 나의 기복을 담아줄 수 있는 넉넉함. 화(火) 일간(병·정)이 찰떡 궁합이에요 — 결핍을 채워주는 구조예요.",
    },
    advice:"낮의 차분함과 밤의 강렬함을 모두 인정하세요. 산처럼 묵직한 외면을 유지하되, 내면의 물(水)이 막히지 않게 창작·글·대화로 흘려보내는 루틴이 필요해요. 핵심 한 줄: 멈추면 썩고, 흐르면 강이 된다.",
  },

  // MBTI (STEP 9)
  mbti:{
    estimated:"ESFJ/ESTJ",
    estType:"ESFJ",
    esType:"ESTJ",
    basis:"사주 교차 분석 결과 — 戊土 일간(외향적 책임형) + 계축월(癸丑月) 정관(규범·사회적 역할) + 천을귀인(天乙貴人)×2(관계 중심) + 도화살(사교성) + 수뢰둔(인내와 성장) + 생명경로수 4(체계·책임)",
    axes:[
      {axis:"E (외향)",score:68,basis:"도화살(子)의 자연스러운 흡인력 + 천을귀인의 인연 에너지. 겉으로는 차분해 보여도 관계 속에서 에너지를 얻는 타입. 戊土의 묵직함이 E처럼 요란하지 않게 만들 뿐이에요."},
      {axis:"S (감각)",score:72,basis:"戊土 일간의 현실 감각 + 癸丑 정관의 규범·절차 중시. 추상보다 구체적이고 지금 당장 쓸 수 있는 것에 집중하는 경향이에요."},
      {axis:"F/T 경계",score:60,basis:"ESFJ라면 F(감정·관계 우선), ESTJ라면 T(원칙·효율 우선). 戊土의 원칙주의(T)와 亥水·子水의 공감력(F)이 공존해 상황마다 달라요. 가까운 사람 앞에서 F, 일할 때 T가 발동해요."},
      {axis:"J (판단)",score:82,basis:"생명경로수 4의 체계 지향 + 戊癸合의 계획성 + 괴강살의 결단력. 즉흥보다 계획, 모호함보다 명확한 결론을 선호해요."},
    ],
    borderline:"ESFJ↔ESTJ 경계: 역할과 상황에 따라 전환돼요. 리더·업무 모드에서는 ESTJ(원칙·효율), 관계·돌봄 모드에서는 ESFJ(공감·조화)가 발동해요. 두 유형의 공통 핵심은 '책임감' — 이게 진짜 본질이에요.",
    strengths:["책임감과 신뢰성 — 맡은 것은 반드시 완수하는 에너지","관계 속에서 조직을 이끄는 리더십 (천을귀인의 인덕)","현실적 판단력과 실행력의 조합 (戊土의 대지 에너지)"],
    challenges:["타인의 기대에 지나치게 부응하려는 경향 — 丑戌형의 배신 에너지와 맞물려 소진될 수 있어요","'내가 다 해야 해' 마인드 — 괴강살의 고집이 위임을 어렵게 만들어요","감정을 억누르다 폭발하는 패턴 — 火의 결핍이 만드는 내면의 에너지 축적"],
    bestEnv:"팀과 역할이 명확한 환경. 내가 기여하는 게 보이는 프로젝트. 신뢰할 수 있는 소수와의 협업.",
    recovery:"규칙적인 루틴 + 인정받는 경험 + 가까운 사람과의 깊은 대화 — 화(火) 결핍을 채우는 가장 빠른 방법이에요.",
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. 공통 UI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const GT=({children})=><p style={{fontSize:13,color:"#666",lineHeight:1.78,margin:"8px 0 0",borderLeft:"3px solid #e8e8e8",paddingLeft:10}}>{children}</p>;
const ST=({icon,title,sub})=><div style={{marginBottom:6}}><div style={{fontSize:16,fontWeight:800,color:"#1a1a1a",display:"flex",alignItems:"center",gap:6}}><span>{icon}</span><span>{title}</span></div>{sub&&<div style={{fontSize:11,color:"#aaa",marginTop:1}}>{sub}</div>}</div>;
const Ring=({score,size=52})=>{const r=18,c2=2*Math.PI*r,col=score>=75?"#4caf50":score>=60?"#ffb300":"#ef5350";return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flexShrink:0}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#eee" strokeWidth={3.5}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={3.5} strokeDasharray={`${(score/100)*c2} ${c2}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/><text x={size/2} y={size/2+4} textAnchor="middle" fontSize={size<=44?10:12} fontWeight={800} fill={col}>{score}</text></svg>;};
const sc=s=>s>=75?"#2e7d32":s>=60?"#e65100":"#b71c1c";
const scBg=s=>s>=75?"#e8f5e0":s>=60?"#fff8e1":"#fdecea";
function GCard({g,s}){
  const c=gc(g.ko);
  return <div style={{width:"100%",borderRadius:11,padding:"11px 4px 8px",border:`1.5px solid ${c.border}`,background:c.bg,color:c.text,textAlign:"center",position:"relative",boxSizing:"border-box"}}>
    <span style={{position:"absolute",top:3,right:4,fontSize:14}}>{yyE(g.ko,true)}</span>
    <div style={{fontSize:9,opacity:.6,fontWeight:600,marginBottom:1}}>{s}</div>
    <div style={{fontSize:24,fontWeight:900,lineHeight:1.1}}>{g.hanja}</div>
    <div style={{fontSize:10,fontWeight:700,marginTop:2}}>{g.ko}</div>
  </div>;
}
function JCard({j,s}){
  const c=jc(j.ko);
  return <div style={{width:"100%",borderRadius:11,padding:"11px 4px 8px",border:`1.5px solid ${c.border}`,background:c.bg,color:c.text,textAlign:"center",position:"relative",boxSizing:"border-box"}}>
    <span style={{position:"absolute",top:3,right:4,fontSize:14}}>{yyE(j.ko,false)}</span>
    <div style={{fontSize:9,opacity:.6,fontWeight:600,marginBottom:1}}>{s}</div>
    <div style={{fontSize:24,fontWeight:900,lineHeight:1.1}}>{j.hanja}</div>
    <div style={{fontSize:10,fontWeight:700,marginTop:2}}>{j.ko}</div>
  </div>;
}
function Acc({items}){
  const [o,setO]=useState(null);
  return <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:12}}>
    {items.map((item,i)=>{
      const op=o===i;
      return <div key={i} style={{borderRadius:12,border:"1px solid #eee",overflow:"hidden"}}>
        <button onClick={()=>setO(op?null:i)}
          style={{width:"100%",background:"#fafafa",border:"none",padding:"12px 14px",cursor:"pointer",textAlign:"left",display:"block"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              {item.badge&&<span style={{fontSize:10,background:item.badge.bg,color:item.badge.text,padding:"2px 7px",borderRadius:99,fontWeight:700,marginRight:6,display:"inline-block",marginBottom:3}}>{item.badge.label}</span>}
              <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap",marginBottom:2}}>
                <span style={{fontSize:14,fontWeight:800,color:"#111"}}>{item.title}</span>
                {item.sub&&<span style={{fontSize:11,color:"#bbb"}}>({item.sub})</span>}
              </div>
              {item.easy&&<div style={{fontSize:12,color:"#e65100",fontWeight:600}}>{item.easy}</div>}
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,marginLeft:8}}>
              {item.tag&&<span style={{fontSize:10,color:"#e65100",background:"#fff3e0",padding:"2px 8px",borderRadius:99,fontWeight:700,whiteSpace:"nowrap"}}>{item.tag}</span>}
              <span style={{fontSize:13,color:"#ccc"}}>{op?"▲":"▼"}</span>
            </div>
          </div>
        </button>
        {op&&<div style={{padding:"12px 14px",background:"#fff",fontSize:13,color:"#444",lineHeight:1.85,borderTop:"1px solid #f0f0f0"}}>{item.desc}</div>}
      </div>;
    })}
  </div>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. 요약 탭
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TabSummary({d,changeTab}){return <>
  <section style={{...S.card,background:"linear-gradient(135deg,#fffde7,#fff3e0)",borderColor:"#ffe082"}}>
    <div style={{fontSize:11,color:"#7b5800",fontWeight:600,marginBottom:4}}>윤정님은</div>
    <div style={{fontSize:20,fontWeight:900,color:"#e65100",lineHeight:1.4,marginBottom:10}}>{d.animalDesc} {d.animal}</div>
    <p style={{margin:0,fontSize:13,color:"#5d4037",lineHeight:1.85}}>{d.headline}</p>
    <p style={{margin:"10px 0 0",fontSize:13,color:"#7b5800",lineHeight:1.85,borderTop:"1px solid #ffe08244",paddingTop:10}}>{d.daynight.overview}</p>
  </section>
  <section style={S.card}>
    <ST icon="🔮" title="사주 성격 요약"/>
    <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:12}}>
      {d.summary.persona.map((p,i)=><div key={i} style={{display:"flex",gap:10,padding:"11px 13px",background:"#fafafa",borderRadius:11,border:"1px solid #f0f0f0"}}><span style={{fontSize:20,flexShrink:0}}>{p.icon}</span><div><div style={{fontSize:13,fontWeight:800,color:"#111",marginBottom:2}}>{p.title}</div><div style={{fontSize:12,color:"#555",lineHeight:1.75}}>{p.desc}</div></div></div>)}
    </div>
  </section>
  <section style={S.card}>
    <ST icon="🌐" title="7체계 종합 분석" sub="사주·토정비결·주역·당사주·점성술·타로수비학·MBTI"/>
    <GT>일곱 가지 운명 분석 체계가 공통으로 가리키는 핵심 주제입니다.</GT>
    <div style={{marginTop:10,padding:"14px 16px",background:"linear-gradient(135deg,#1e1b4b,#312e81)",borderRadius:12,marginBottom:10}}>
      <p style={{fontSize:13,color:"#e0e7ff",lineHeight:1.9,margin:0}}>{d.summary.sevenInsight}</p>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {d.summary.sixSystems.map((s,i)=>(
        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",background:"#fafafa",borderRadius:10,border:"1px solid #eee"}}>
          <div style={{width:60,fontSize:10,fontWeight:700,color:"#e65100",background:"#fff3e0",padding:"3px 5px",borderRadius:6,textAlign:"center",flexShrink:0,lineHeight:1.5}}>{s.system}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:800,color:"#111",marginBottom:2}}>{s.key}</div>
            <div style={{fontSize:12,color:"#666",lineHeight:1.5}}>{s.desc}</div>
          </div>
        </div>
      ))}
    </div>
  </section>
  <section style={S.card}>
    <ST icon="📆" title={`향후 5년 흐름 (${CY}~${CY+4})`}/>
    <GT>6체계 교차 분석 종합 운기 점수입니다.</GT>
    <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:12}}>
      {d.summary.yearForecast.map((yf,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:scBg(yf.score),borderRadius:11}}><Ring score={yf.score} size={46}/><div style={{flex:1}}><div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}><span style={{fontSize:14,fontWeight:900,color:yf.year===CY?"#2e7d32":"#111"}}>{yf.year}년</span>{yf.year===CY&&<span style={{fontSize:10,background:"#4caf50",color:"#fff",padding:"2px 6px",borderRadius:99,fontWeight:700}}>올해</span>}</div><div style={{fontSize:12,color:"#444",lineHeight:1.6}}>{yf.summary}</div></div></div>)}
    </div>
  </section>
  <section style={S.card}>
    <ST icon="🗂️" title="상세 분석 바로가기"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:12}}>
      {[["사주","📋","명식·신살·대운·세운"],["낮과 밤","🌙","심층 심리·욕망"],["토정·주역","📜","토정비결·주역·당사주"],["별자리·타로","✨","점성술·타로수비학"],["MBTI","🧠","성격 분석"]].map(([t,ic,desc])=><button key={t} onClick={()=>changeTab(t)} style={{padding:"12px",background:"#fafafa",border:"1px solid #eee",borderRadius:12,cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}><div style={{fontSize:18,marginBottom:4}}>{ic}</div><div style={{fontSize:13,fontWeight:800,color:"#111"}}>{t}</div><div style={{fontSize:11,color:"#888",marginTop:2}}>{desc}</div></button>)}
    </div>
  </section>
</>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. 사주 탭
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function BndBanner({b}){
  if(!b?.isBoundary) return null;
  return <div style={{background:"#fff8e1",border:"1.5px solid #ffb300",borderRadius:12,padding:"12px 14px"}}>
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
      <span>⚠️</span><span style={{fontSize:13,fontWeight:800,color:"#7b5800"}}>경계 일주 감지</span>
      <span style={{fontSize:9,background:"#e65100",color:"#fff",padding:"2px 7px",borderRadius:99,fontWeight:700,marginLeft:"auto"}}>자시(子時) 경계</span>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:8}}>
      {[{l:"자정 기준",g:b.std,c:"#1565c0",bg:"#e3f2fd"},{l:"야자시 기준",g:b.mid,c:"#7b5800",bg:"#fff8e1"}].map(({l,g,c,bg})=><div key={l} style={{flex:1,padding:"8px 10px",background:bg,borderRadius:9}}><div style={{fontSize:10,color:"#888",marginBottom:2}}>{l}</div><div style={{fontSize:15,fontWeight:900,color:c}}>{g.hanja}({g.ko})</div></div>)}
    </div>
    <p style={{fontSize:12,color:"#7b5800",margin:0,lineHeight:1.75}}>23:38 출생 — 자시(子時) 경계 구간. 두 일주 에너지를 모두 가진 복합형으로, 상황에 따라 번갈아 발동해요.</p>
  </div>;
}

function Manseryeok({d}){
  const [w,setW]=useState("A");
  const active=[...(w==="A"?d.pillars:d.pillarsB)].reverse();
  const b=d.boundary;
  return <section style={S.card}>
    <ST icon="📋" title="사주 명식" sub="태어난 연·월·일·시의 네 기둥"/>
    <GT>사주는 태어난 연·월·일·시 — 네 개의 기둥으로 이루어집니다. 이 중 <strong>일주</strong>가 나 자신을 나타내는 중심이에요.</GT>
    {b.isBoundary&&<div style={{display:"flex",gap:6,marginTop:10}}>{[{k:"A",l:`자정 ${b.std.hanja}`},{k:"B",l:`야자시 ${b.mid.hanja}`}].map(o=><button key={o.k} onClick={()=>setW(o.k)} style={{flex:1,padding:"7px 6px",borderRadius:9,border:"1.5px solid #ffb300",fontSize:11,fontWeight:700,cursor:"pointer",background:w===o.k?"#7b5800":"#fff",color:w===o.k?"#fff":"#7b5800"}}>{o.l}</button>)}</div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginTop:10}}>
      {active.map((p,i)=>{const isI=p.name==="일주";return <div key={i} style={{display:"flex",flexDirection:"column",gap:5,alignItems:"center",position:"relative",...(isI?{border:"2px solid #ffb300",borderRadius:15,background:"#fffde7",padding:"4px 3px 7px"}:{})}}>{isI&&<div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:"#e65100",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:99,zIndex:1,whiteSpace:"nowrap"}}>나</div>}<div style={{fontSize:10,color:"#aaa",fontWeight:600}}>{p.name}</div><GCard g={p.gan} s={p.gan.sibsong}/><JCard j={p.ji} s={p.ji.sibsong}/></div>;})}
    </div>
    {b.isBoundary&&<div style={{marginTop:10,padding:"10px 12px",background:"#f9f9f9",borderRadius:9,fontSize:12,color:"#555",lineHeight:1.78,borderLeft:"3px solid #ffb300"}}>{w==="A"?b.standardDesc:b.midnightDesc}</div>}
    <div style={{marginTop:8,fontSize:11,color:"#ccc",textAlign:"center"}}>☀️ 양(陽) 적극·외향 &nbsp;·&nbsp; 🌙 음(陰) 수용·내향</div>
  </section>;
}

function Ohaeng({d}){
  const dist=d.ohaengDist,order=["水","木","火","土","金"],total=Object.values(dist).reduce((a,b)=>a+b,0)||1;
  const R=54,r=32,cx=68,cy=68;let cum=-Math.PI/2;
  const slices=order.map(o=>{const v=dist[o]||0,a=(v/total)*2*Math.PI,x1=cx+R*Math.cos(cum),y1=cy+R*Math.sin(cum);cum+=a;const x2=cx+R*Math.cos(cum),y2=cy+R*Math.sin(cum),ix1=cx+r*Math.cos(cum-a),iy1=cy+r*Math.sin(cum-a),ix2=cx+r*Math.cos(cum),iy2=cy+r*Math.sin(cum),lg=a>Math.PI?1:0;return{o,v,path:v===0?null:`M${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R} 0 ${lg},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${ix2.toFixed(2)},${iy2.toFixed(2)} A${r},${r} 0 ${lg},0 ${ix1.toFixed(2)},${iy1.toFixed(2)} Z`};});
  const dom=order.reduce((a,b)=>(dist[a]||0)>=(dist[b]||0)?a:b);
  return <section style={S.card}>
    <ST icon="🌿" title="오행(五行) 분포" sub="다섯 기운의 균형"/>
    <GT>오행은 목(木)·화(火)·토(土)·금(金)·수(水) 다섯 가지 기운입니다. 사주 8글자에 담긴 분포로 타고난 기질을 파악합니다.</GT>
    <div style={{display:"flex",alignItems:"center",gap:14,marginTop:12}}>
      <svg width={136} height={136} viewBox="0 0 136 136" style={{flexShrink:0}}>
        {slices.map(s=>s.path&&<path key={s.o} d={s.path} fill={OC[s.o].chart} stroke="#fff" strokeWidth={2}/>)}
        <text x={cx} y={cy-8} textAnchor="middle" fontSize={10} fill="#999">{OC[dom].name}</text>
        <text x={cx} y={cy+9} textAnchor="middle" fontSize={20} fontWeight={900} fill={OC[dom].text}>{dist[dom]||0}개</text>
        <text x={cx} y={cy+24} textAnchor="middle" fontSize={10} fill="#bbb">{Math.round(((dist[dom]||0)/total)*100)}%</text>
      </svg>
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
        {order.map(o=>{const c=OC[o],v=dist[o]||0,p=Math.round((v/total)*100);return <div key={o} style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:9,height:9,borderRadius:2,background:c.chart,flexShrink:0}}/><div style={{fontSize:12,color:c.text,fontWeight:700,minWidth:44}}>{c.name}</div><div style={{flex:1,height:5,background:"#f0f0f0",borderRadius:99,overflow:"hidden"}}><div style={{width:`${p}%`,height:"100%",background:c.chart,borderRadius:99}}/></div><div style={{fontSize:12,color:"#888",minWidth:24,textAlign:"right"}}>{v}개</div></div>;})}
      </div>
    </div>
    <div style={{marginTop:10,padding:"10px 14px",background:"#e3f2fd",borderRadius:10,fontSize:13,color:"#0d47a1",lineHeight:1.75}}>{d.ohaengNote}</div>
    <div style={{marginTop:8,padding:"9px 12px",background:"#fafafa",borderRadius:10,display:"flex",alignItems:"center",gap:8,border:"1px solid #eee",marginBottom:8}}><span style={{fontSize:12,color:"#aaa"}}>신강·신약</span><span style={{fontSize:15,fontWeight:900,color:"#1565c0"}}>{d.singang}</span><span style={{fontSize:12,color:"#888"}}>— 癸축월(丑月) 득령, 신강 사주예요</span></div>
    <div style={{fontSize:10,color:"#aaa",fontWeight:600,marginBottom:8,letterSpacing:.5}}>용신(도움되는 기운) · 희신(간접 도움) · 기신(피할 기운)</div>
    <div style={{display:"flex",flexDirection:"column",gap:7}}>
      {[
        {label:"戊戌 기준 (자정)",bg:"#f1f8e9",border:"#c5e1a5",items:[
          {name:"용신",val:d.yongsinA,pillBg:"#33691e",pillTc:"#fff",valC:"#333"},
          {name:"희신",val:d.huisinA,pillBg:"#e8f5e0",pillTc:"#2d6a2d",valC:"#444"},
          {name:"기신",val:d.gisinA,pillBg:"#fdecea",pillTc:"#b71c1c",valC:"#444"},
        ]},
        {label:"己亥 기준 (야자시)",bg:"#fff8e1",border:"#ffe082",items:[
          {name:"용신",val:d.yongsinB,pillBg:"#e65100",pillTc:"#fff",valC:"#333"},
          {name:"희신",val:d.huisinB,pillBg:"#fff3e0",pillTc:"#7b5800",valC:"#444"},
          {name:"기신",val:d.gisinB,pillBg:"#fdecea",pillTc:"#b71c1c",valC:"#444"},
        ]},
      ].map(({label,bg,border,items})=>(
        <div key={label} style={{padding:"10px 12px",background:bg,borderRadius:10,border:`1px solid ${border}`}}>
          <div style={{fontSize:10,color:"#888",fontWeight:600,marginBottom:8}}>{label}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {items.map(({name,val,pillBg,pillTc,valC})=>(
              <div key={name} style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{background:pillBg,color:pillTc,fontSize:11,fontWeight:800,padding:"5px 11px",borderRadius:99}}>{name}</span>
                <span style={{fontSize:12,fontWeight:900,color:valC}}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>;
}

// 세운 바텀시트
const AREAS=[{k:"건강",i:"💪"},{k:"재물",i:"💰"},{k:"커리어",i:"💼"},{k:"관계",i:"🤝"},{k:"애정",i:"💕"}];
const MON=["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const YMEMO={
  [CY]:"준비·정비기 (64점) — 역량 축적·네트워크 확장에 집중. 섣부른 이직보다 현장 실력 강화가 현명해요.",
  [CY+1]:"도약·황제기 (92점) — 丙午년 용신 활성. 귀인 등장, 승진·프로젝트 수주 집중. 상반기(3~6월)가 핵심이에요.",
  [CY+2]:"결실·공인기 (86점) — 씨앗이 결실. 자격·수상·강의·출판 등 외부 활동이 커리어를 도약시켜요.",
  [CY+3]:"리더십 정점 (93점) — 기획·전략·팀 운영 역할 확대. 괴강살 에너지가 결단력·카리스마로 빛나요.",
  [CY+4]:"황금기 절정 (97점) — 마스터넘버 22 대각성. 전문성과 실적이 공식 인정받는 최고조의 해예요.",
  [CY+5]:"전환·새 출발 (88점) — 쌓아온 것을 정리·계승. 새로운 10년 사이클 설계도를 그리는 해예요."
};
// 월별 한 줄 요약 — 간지별 특성 기반
const MMEMO={
  "을미":"未土 기운 — 조화와 협력이 필요한 달이에요. 관계에서 먼저 손 내밀면 좋겠네요.",
  "병신":"丙火 들어오는 달 — 용신 활성! 적극적으로 움직이기 좋은 타이밍이에요.",
  "정유":"丁火 입장 — 내면의 열정이 표면으로 올라오는 달이에요. 창의적 작업에 집중해요.",
  "무술":"戊土 비견 — 의지가 강해지는 달이에요. 혼자서 밀어붙이기보다 팀과 함께 가세요.",
  "기해":"己亥 일주 에너지 반복 — 직관이 예리해지는 달이에요. 느껴지는 대로 움직여도 돼요.",
  "경자":"庚金 들어오는 달 — 희신 활성! 실력이 인정받고 새로운 기회가 열리는 달이에요.",
  "신축":"辛金 설기 — 에너지를 아끼고 내실을 다지는 달이에요. 무리하지 않는 게 좋겠네요.",
  "임인":"壬水 편재 — 재물 기운이 움직이는 달이에요. 투자나 계약에 신경 쓸 타이밍이에요.",
  "계묘":"癸水 정재 — 꼼꼼하게 재무를 정리하기 좋은 달이에요. 지출 점검 필수예요.",
  "갑진":"갑목(甲木) 칠살 — 도전과 자극이 오는 달이에요. 긴장감을 성장의 연료로 쓰면 좋아요.",
  "을사":"乙木 편관 — 경쟁 에너지가 생기는 달이에요. 실력으로 승부하면 돼요.",
  "병오":"丙午 용신 절정 — 1년 중 가장 강한 에너지! 중요한 일을 이 달에 집중시키세요.",
  "정미":"丁未 희신 — 따뜻한 기운이 흐르는 달이에요. 관계에서 좋은 소식이 올 수 있어요.",
  "무신":"戊申 비견·식신 — 창의력이 올라오는 달이에요. 표현하고 싶은 것을 꺼내보세요.",
  "기유":"己酉 비견·정인 — 배움과 성장의 달이에요. 새로운 것을 익히기에 좋아요.",
  "경술":"庚戌 식신 — 현재 대운 기운과 공명! 실력 발휘 기회가 찾아오는 달이에요.",
  "신해":"辛亥 편인 — 직관과 영감의 달이에요. 평소 떠오르는 아이디어를 기록해두세요.",
  "임자":"壬子 편재 — 재물·인맥 두 가지가 동시에 움직이는 달이에요. 기회를 잡아요.",
  "계축":"癸丑 정재·겁재 — 월주와 동일한 에너지! 안정을 다지되 경쟁에 주의하세요.",
};
function getMonthMemo(gj){return MMEMO[gj]||"이 달의 에너지를 타고 유연하게 움직이는 게 좋겠네요.";}
// 연도별 점수: 파일 기준 2025=64,2026=92,2027=86,2028=93,2029=97,2030=88
const YEAR_SCORES={[CY]:64,[CY+1]:92,[CY+2]:86,[CY+3]:93,[CY+4]:97,[CY+5]:88};
function dS(y,m=0){
  if(!m&&YEAR_SCORES[y]) return YEAR_SCORES[y];
  const base=YEAR_SCORES[y]||75;
  return Math.min(95,Math.max(48,base+(Math.round(Math.sin(m*1.3)*8))));
}
function dD(y,m){return Object.fromEntries(AREAS.map(a=>[a.k,Math.min(90,Math.max(48,dS(y,m)+(Math.round(Math.random()*12)-6)))]));}

function SeunSheet({item,onClose}){
  if(!item) return null;
  const score=dS(item.year,item.month||0),detail=dD(item.year,item.month||0);
  const title=item.month?`${item.year}년 ${item.month}월`:`${item.year}년`;
  const gj=item.month?mToGJ(item.year,item.month):yearToGJ(item.year);
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:100,display:"flex",alignItems:"flex-end"}} onClick={onClose}>
    <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"12px 20px 36px",width:"100%",maxWidth:480,margin:"0 auto",maxHeight:"88vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
      <div style={{width:36,height:4,background:"#e0e0e0",borderRadius:99,margin:"0 auto 16px"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div><div style={{fontSize:11,color:"#aaa",marginBottom:2}}>{title} 세운(歲運)</div>
          <div style={{fontSize:18,fontWeight:900,color:"#111"}}>{item.hanja||gj.hanja}({item.ko||gj.ko})</div></div>
        <Ring score={score} size={50}/>
      </div>
      {/* 간지 설명 */}
      {item.month&&<div style={{display:"flex",gap:8,marginBottom:10}}>
        {[{g:gj.gan,isG:true,c:gc(gj.gan.ko)},{g:gj.ji,isG:false,c:jc(gj.ji.ko)}].map(({g,isG,c},pi)=><div key={pi} style={{flex:1,padding:"8px 10px",background:c.bg,borderRadius:9,border:`1px solid ${c.border}`,textAlign:"center"}}><div style={{fontSize:10,color:c.text,fontWeight:600,marginBottom:2}}>{isG?"천간(天干)":"지지(地支)"}</div><div style={{fontSize:16,fontWeight:900,color:c.text}}>{g.hanja}({g.ko})</div></div>)}
      </div>}
      <p style={{fontSize:13,color:"#444",lineHeight:1.85,margin:"0 0 14px",background:"#fafafa",padding:"11px 13px",borderRadius:10}}>{YMEMO[item.year]||`${item.hanja||gj.hanja}(${item.ko||gj.ko}) 에너지가 흐르는 시기예요. 흐름을 타고 유연하게 움직이는 게 좋겠네요.`}</p>
      <div style={{fontSize:12,color:"#aaa",fontWeight:700,marginBottom:9}}>분야별 운기</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {AREAS.map(a=>{const s=detail[a.k],c=s>=75?"#4caf50":s>=60?"#ffb300":"#ef5350";return <div key={a.k} style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:18,width:24}}>{a.i}</span><span style={{fontSize:13,fontWeight:700,width:46,color:"#333"}}>{a.k}</span><div style={{flex:1,height:8,background:"#f0f0f0",borderRadius:99,overflow:"hidden"}}><div style={{width:`${s}%`,height:"100%",background:c,borderRadius:99}}/></div><span style={{fontSize:13,fontWeight:800,color:c,width:26,textAlign:"right"}}>{s}</span></div>;})}
      </div>
      <button style={{marginTop:20,width:"100%",padding:"13px 0",background:"#f5f5f5",border:"none",borderRadius:12,fontSize:14,fontWeight:700,color:"#555",cursor:"pointer"}} onClick={onClose}>닫기</button>
    </div>
  </div>;
}

function Seun(){
  const [st,setSt]=useState("year"),[sel,setSel]=useState(null);
  const ys=useMemo(()=>bYS(),[]),ms=useMemo(()=>bMS(),[]);
  return <>
    <section style={S.card}>
      <ST icon="📅" title="세운(歲運)" sub={`Today ${CY}.${CM}.${CD} 기준 자동 계산`}/>
      <GT>세운은 매년·매월 바뀌는 간지(干支) 에너지입니다. 오늘 날짜 기준으로 자동 계산됩니다.</GT>
      <div style={{display:"flex",gap:6,marginTop:10}}>{[["year",`연도별 ${CY}~${CY+5}`],["month","월별 12개월"]].map(([k,l])=><button key={k} onClick={()=>setSt(k)} style={{flex:1,padding:"7px 0",borderRadius:9,border:"1.5px solid #e65100",fontSize:12,fontWeight:700,cursor:"pointer",background:st===k?"#e65100":"#fff",color:st===k?"#fff":"#e65100"}}>{l}</button>)}</div>
      {st==="year"&&<div style={{display:"flex",flexDirection:"column",gap:8,marginTop:12}}>
        {ys.map((s,i)=>{
          const score=dS(s.year),cg=gc(s.gan.ko);
          return <button key={i} onClick={()=>setSel(s)}
            style={{...S.sRow,cursor:"pointer",textAlign:"left",width:"100%",fontFamily:"inherit",...(s.isThis?{border:"2px solid #4caf50",background:"#f9fff8"}:{})}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Ring score={score} size={48}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2,flexWrap:"wrap"}}>
                  <span style={{fontSize:14,fontWeight:900,color:"#111"}}>{s.year}년</span>
                  <span style={{fontSize:11,fontWeight:700,padding:"2px 7px",borderRadius:7,background:cg.bg,color:cg.text}}>{s.hanja}({s.ko})</span>
                  {s.isThis&&<span style={{fontSize:10,background:"#4caf50",color:"#fff",padding:"2px 6px",borderRadius:99,fontWeight:700}}>올해</span>}
                </div>
                <div style={{fontSize:12,color:"#555",lineHeight:1.5}}>{YMEMO[s.year]||"간지 에너지 흐름"}</div>
              </div>
              <span style={{fontSize:17,color:"#d0d0d0"}}>›</span>
            </div>
          </button>;
        })}
      </div>}
      {st==="month"&&<div style={{display:"flex",flexDirection:"column",gap:7,marginTop:12}}>
        {ms.map((s,i)=>{
          const score=dS(s.year,s.month),cg=gc(s.gan.ko),cj=jc(s.ji.ko);
          const memo=getMonthMemo(s.ko);
          return <button key={i} onClick={()=>setSel({...s,memo})}
            style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:11,
              border:s.isThis?"2px solid #4caf50":"1px solid #ebebeb",
              background:s.isThis?"#f9fff8":"#fafafa",
              cursor:"pointer",textAlign:"left",width:"100%",fontFamily:"inherit"}}>
            <div style={{minWidth:44,textAlign:"center",flexShrink:0}}>
              <div style={{fontSize:10,color:"#aaa",fontWeight:600}}>{s.year}</div>
              <div style={{fontSize:13,fontWeight:900,color:s.isThis?"#2e7d32":"#111"}}>{MON[s.month-1]}</div>
              {s.isThis&&<div style={{fontSize:9,background:"#4caf50",color:"#fff",borderRadius:99,padding:"1px 5px",marginTop:1,fontWeight:700}}>현재</div>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:4,marginBottom:4}}>
                {[{g:s.gan,isG:true,c:cg},{g:s.ji,isG:false,c:cj}].map(({g,isG,c},pi)=>(
                  <div key={pi} style={{background:c.bg,color:c.text,border:`1px solid ${c.border}`,fontSize:11,padding:"4px 7px",borderRadius:7,fontWeight:700,position:"relative",paddingTop:12}}>
                    <span style={{position:"absolute",top:1,right:2,fontSize:9}}>{yyE(g.ko,isG)}</span>
                    {g.hanja}({g.ko})
                  </div>
                ))}
              </div>
              <div style={{fontSize:11,color:"#555",lineHeight:1.5}}>{memo}</div>
            </div>
            <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:4}}>
              <Ring score={score} size={42}/>
              <span style={{fontSize:16,color:"#d0d0d0"}}>›</span>
            </div>
          </button>;
        })}
      </div>}
    </section>
    <SeunSheet item={sel} onClose={()=>setSel(null)}/>
  </>;
}

function TabSaju({d}){
  return <>
    <BndBanner b={d.boundary}/>
    <Manseryeok d={d}/>
    <Ohaeng d={d}/>
    <section style={S.card}>
      <ST icon="⭐" title="신살(神殺)"/>
      <GT>신살은 사주 글자들의 특정 조합에서 발생하는 특수한 기운입니다. 타고난 재능이나 삶에서 반복되는 패턴으로 나타납니다.</GT>
      <Acc items={d.sinsal.map(s=>({title:s.name,sub:s.hanja,easy:s.easy,desc:s.desc,tag:s.found}))}/>
    </section>
    <section style={S.card}>
      <ST icon="🔗" title="합(合)·충(沖)·형(刑)"/>
      <GT>사주 글자들은 서로 끌어당기거나(합), 충돌하거나(충), 마찰을 일으킵니다(형). 성격·인간관계·삶의 패턴에 직접 영향을 줍니다.</GT>
      <Acc items={[
        ...d.hap.map(h=>({title:h.pair,easy:h.easy,desc:h.desc,badge:{label:h.type,bg:"#e8f5e0",text:"#2d6a2d"}})),
        ...d.hyeong.map(h=>({title:h.name,easy:"무은지형 — 믿는 사람에게 배신당하는 에너지",desc:h.desc,badge:{label:h.type,bg:"#fdecea",text:"#b71c1c"}})),
      ]}/>
      {d.chung.length===0&&<div style={{marginTop:10,padding:"10px 14px",background:"#f9fbe7",borderRadius:10,fontSize:13,color:"#558b2f",lineHeight:1.75}}>✅ 충(沖) 없음 — 원국 내 큰 충돌 에너지가 없는 구조예요.</div>}
    </section>
    <section style={S.card}>
      <ST icon="🌊" title="대운(大運)" sub={`${d.daeunDir} · 만 ${d.daeunStart}세 시작`}/>
      <GT>대운은 10년마다 교체되는 외부 에너지입니다. 임(壬)년생 여성은 음양역순으로 역행(逆行)하며, 소한(小寒·1/6)까지 11일 ÷ 3 = 만 {d.daeunStart}세에 시작합니다.</GT>
      <div style={{position:"relative",marginTop:16,paddingLeft:38}}>
        <div style={{position:"absolute",left:16,top:8,bottom:8,width:2,background:"linear-gradient(to bottom,#ffb300,#e0e0e0)",borderRadius:99}}/>
        {d.daeun.map((dv,i)=>{
          const g=gc(dv.label[0]),j=jc(dv.label[1]);
          return (
            <div key={i} style={{position:"relative",marginBottom:i<d.daeun.length-1?12:0}}>
              <div style={{position:"absolute",left:-28,top:14,width:14,height:14,borderRadius:"50%",
                background:dv.cur?"#e65100":"#ddd",
                border:`2.5px solid ${dv.cur?"#ffb300":"#ccc"}`,
                zIndex:1,boxShadow:dv.cur?"0 0 0 3px rgba(230,81,0,.15)":"none"}}/>
              <div style={{...S.dCard,...(dv.cur?{border:"2px solid #ffb300",background:"#fffde7"}:{})}}>
                {dv.cur&&<span style={{position:"absolute",top:-10,left:12,background:"#e65100",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 9px",borderRadius:99}}>현재 대운</span>}
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <div style={{display:"flex",gap:4}}>
                    <span style={{...S.dBadge,background:g.bg,color:g.text,borderColor:g.border}}>{dv.hanja[0]}({dv.label[0]})</span>
                    <span style={{...S.dBadge,background:j.bg,color:j.text,borderColor:j.border}}>{dv.hanja[1]}({dv.label[1]})</span>
                  </div>
                  <div>
                    <div style={{fontSize:12,fontWeight:800,color:"#222"}}>{dv.period}</div>
                    <div style={{fontSize:10,color:"#999"}}>{OC[dv.ohaeng]?.name} 기운</div>
                  </div>
                </div>
                <p style={{fontSize:12,color:"#555",margin:0,lineHeight:1.75}}>{dv.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
    <Seun/>
  </>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. 낮과 밤 탭
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TabDayNight({d}){
  const dn=d.daynight,st=dn.day.styling;
  return <>
    <section style={{...S.card,background:"linear-gradient(135deg,#fff8e1,#fffde7)",borderColor:"#ffe082"}}>
      <ST icon="☯️" title="낮과 밤 — 심층 심리·욕망 분석"/>
      <p style={{fontSize:13,color:"#7b5800",lineHeight:1.85,margin:"10px 0 0"}}>{dn.overview}</p>
    </section>
    <section style={S.card}>
      <ST icon="☀️" title="낮의 나 — 사회적 페르소나"/>
      <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:10}}>
        {[{t:"첫인상",c:"#e3f2fd",tc:"#0d47a1",v:dn.day.impression},{t:"사회에서 쓰는 가면",c:"#f3e5f5",tc:"#4a148c",v:dn.day.mask}].map(({t,c,tc,v})=><div key={t} style={{padding:"12px 14px",background:c,borderRadius:11}}><div style={{fontSize:12,fontWeight:800,color:tc,marginBottom:5}}>{t}</div><p style={{fontSize:13,color:"#444",margin:0,lineHeight:1.8}}>{v}</p></div>)}

      </div>
    </section>
    <section style={S.card}>
      <ST icon="🌙" title="밤의 나 — 숨겨진 본능과 욕망"/>
      <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:10}}>
        <div style={{padding:"12px 14px",background:"#1a1a2e",borderRadius:11}}>
          <div style={{fontSize:12,fontWeight:800,color:"#a78bfa",marginBottom:8}}>내면의 결핍과 진짜 욕망</div>
          <p style={{fontSize:13,color:"#ddd",margin:"0 0 10px",lineHeight:1.8}}>{dn.night.desire}</p>
          <p style={{fontSize:13,color:"#c4b5fd",margin:0,lineHeight:1.8,borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:10}}>{dn.night.desire2}</p>
        </div>
        <div style={{padding:"12px 14px",background:"#1e1b4b",borderRadius:11}}><div style={{fontSize:12,fontWeight:800,color:"#818cf8",marginBottom:8}}>본능이 폭발하는 트리거 3가지</div>{dn.night.triggers.map((t,i)=><div key={i} style={{fontSize:13,color:"#e0e7ff",padding:"5px 0",borderBottom:i<2?"1px dashed #ffffff22":"none",lineHeight:1.7}}><span style={{color:"#a78bfa",fontWeight:700,marginRight:6}}>{i+1}.</span>{t}</div>)}</div>
        <div style={{padding:"12px 14px",background:"#312e81",borderRadius:11}}><div style={{fontSize:12,fontWeight:800,color:"#c4b5fd",marginBottom:5}}>이성에게 치명적인 은밀한 매력</div><p style={{fontSize:13,color:"#e0e7ff",margin:0,lineHeight:1.8}}>{dn.night.attraction}</p></div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{padding:"12px 14px",background:"#1e293b",borderRadius:11}}>
            <div style={{fontSize:12,fontWeight:800,color:"#7dd3fc",marginBottom:5}}>이상형</div>
            <p style={{fontSize:13,color:"#e2e8f0",margin:0,lineHeight:1.8}}>{dn.night.idealType}</p>
          </div>
          <div style={{padding:"12px 14px",background:"#0f172a",borderRadius:11}}>
            <div style={{fontSize:12,fontWeight:800,color:"#86efac",marginBottom:5}}>실제 궁합</div>
            <p style={{fontSize:13,color:"#e2e8f0",margin:0,lineHeight:1.8}}>{dn.night.idealType2}</p>
          </div>
        </div>
      </div>
    </section>

  </>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8. 토정·주역·당사주 탭
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TabTojung({d}){
  const tj=d.tojung,ic=d.iching,ds=d.dansaju;
  const [showM,setShowM]=useState(false);
  return <>
    {/* 토정비결 */}
    <section style={S.card}>
      <ST icon="📜" title="토정비결(土亭秘訣)"/>
      <GT>토정비결은 조선 중기 이지함(李之菡) 선생이 집대성한 민간 예언서입니다. 년주·월주·시주를 수리화하여 상괘(上卦)·중괘(中卦)·하괘(下卦)를 산출합니다.</GT>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        {[{l:"상괘(上卦)",v:tj.sang},{l:"중괘(中卦)",v:tj.jung},{l:"하괘(下卦)",v:tj.ha}].map(({l,v})=><div key={l} style={{flex:1,padding:"10px",background:"#fff8e1",borderRadius:10,textAlign:"center",border:"1px solid #ffe082"}}><div style={{fontSize:10,color:"#7b5800",fontWeight:700,marginBottom:3}}>{l}</div><div style={{fontSize:22,fontWeight:900,color:"#e65100"}}>{v}</div></div>)}
      </div>
      <div style={{marginTop:10,padding:"14px 15px",background:"#e8f5e0",borderRadius:11,border:"1px solid #a5d6a7"}}>
        <div style={{fontSize:11,color:"#2d6a2d",fontWeight:700,marginBottom:5}}>본명 총운(總運) 사자성어</div>
        <div style={{fontSize:20,fontWeight:900,color:"#1b5e20",marginBottom:6}}>{tj.saja}</div>
        <p style={{fontSize:13,color:"#388e3c",margin:0,lineHeight:1.78}}>{tj.bonunDesc}</p>
      </div>
      <div style={{marginTop:12}}><div style={{fontSize:12,fontWeight:800,color:"#333",marginBottom:8}}>연도별 운세 ({CY}~{CY+5})</div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {tj.yearFlow.map((y,i)=><div key={i} style={{padding:"11px 13px",background:"#fafafa",borderRadius:10,border:"1px solid #eee"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}><Ring score={y.score} size={46}/><div style={{flex:1}}><div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:2}}><span style={{fontSize:14,fontWeight:900,color:y.year===CY?"#2e7d32":"#111"}}>{y.year}년</span>{y.year===CY&&<span style={{fontSize:9,background:"#4caf50",color:"#fff",padding:"2px 6px",borderRadius:99,fontWeight:700}}>올해</span>}<span style={{fontSize:10,background:"#fff8e1",color:"#7b5800",padding:"2px 7px",borderRadius:99,fontWeight:700}}>{y.month}</span></div><div style={{fontSize:12,color:"#555"}}>{y.desc}</div></div></div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{Object.entries(y.areas).map(([k,v])=><div key={k} style={{fontSize:11,padding:"2px 8px",borderRadius:99,background:scBg(v),color:sc(v),fontWeight:700}}>{k} {v}점</div>)}</div>
          </div>)}
        </div>
      </div>
      <div style={{marginTop:12}}><button onClick={()=>setShowM(!showM)} style={{width:"100%",padding:"10px 14px",background:"#f5f5f5",border:"1px solid #e0e0e0",borderRadius:10,fontSize:13,fontWeight:700,color:"#333",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"inherit"}}><span>2026년 월별 길흉</span><span style={{fontSize:14,color:"#aaa"}}>{showM?"▲":"▼"}</span></button>
        {showM&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginTop:8}}>{tj.month2026.map((m,i)=><div key={i} style={{padding:"8px",background:scBg(m.score),borderRadius:9,textAlign:"center"}}><div style={{fontSize:11,fontWeight:800,color:sc(m.score)}}>{m.m}월</div><div style={{fontSize:18,fontWeight:900,color:sc(m.score)}}>{m.score}</div><div style={{fontSize:10,color:"#666",marginTop:2,lineHeight:1.4}}>{m.desc}</div></div>)}</div>}
      </div>
    </section>
    {/* 주역 */}
    <section style={S.card}>
      <ST icon="☯️" title="주역(周易) 본명괘"/>
      <GT>주역은 64괘(卦)로 우주의 변화와 인간의 운명을 해석하는 동양 철학 체계입니다. 사주 오행 기반 도출법 적용 — 사주 최다 오행(수水)→상괘 坎(감), 일간 관성 오행(목木)→하괘 震(진). 坎+震 = 수뢰둔(水雷屯) 제3괘.</GT>
      <div style={{marginTop:12,padding:"16px",background:"linear-gradient(135deg,#e3f2fd,#e8eaf6)",borderRadius:12,textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:4,letterSpacing:4}}>{ic.gaeSymbol}</div>
        <div style={{fontSize:18,fontWeight:900,color:"#1565c0"}}>{ic.bonmyeonggae}</div>
        <div style={{fontSize:11,color:"#5c6bc0",marginTop:3}}>{ic.gaeNature}</div>
        <div style={{fontSize:11,color:"#888",marginTop:4}}>상괘 {ic.gaeUpper} / 하괘 {ic.gaeLower}</div>
      </div>
      <p style={{fontSize:13,color:"#444",lineHeight:1.85,margin:"10px 0 0"}}>{ic.gaeDesc}</p>
      <div style={{marginTop:10,padding:"11px 13px",background:"#e3f2fd",borderRadius:10}}><div style={{fontSize:11,color:"#0d47a1",fontWeight:700,marginBottom:3}}>현재 변괘 ({ic.currentYear})</div><div style={{fontSize:15,fontWeight:900,color:"#1565c0"}}>{ic.currentGae}</div><p style={{fontSize:12,color:"#555",margin:"5px 0 0",lineHeight:1.7}}>{ic.currentDesc}</p></div>
      <div style={{marginTop:10,padding:"11px 13px",background:"#f9f9f9",borderRadius:10}}><div style={{fontSize:12,fontWeight:800,color:"#333",marginBottom:7}}>주역이 전하는 인생 전략 3가지</div>{ic.strategy.map((s,i)=><div key={i} style={{fontSize:13,color:"#555",padding:"5px 0",borderBottom:i<2?"1px dashed #eee":"none",lineHeight:1.7}}><span style={{fontWeight:700,color:"#e65100",marginRight:6}}>{i+1}.</span>{s}</div>)}</div>
      <div style={{marginTop:10}}><div style={{fontSize:12,fontWeight:800,color:"#333",marginBottom:8}}>연도별 괘 에너지</div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {ic.yearFlow.map((y,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#fafafa",borderRadius:10,border:"1px solid #eee"}}><Ring score={y.score} size={44}/><div style={{flex:1}}><div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2,flexWrap:"wrap"}}><span style={{fontSize:13,fontWeight:900,color:"#111"}}>{y.year}년</span><span style={{fontSize:11,color:"#888"}}>{y.gae}</span></div><div style={{fontSize:12,color:"#555",lineHeight:1.6}}>{y.desc}</div></div></div>)}
        </div>
      </div>
    </section>
    {/* 당사주 */}
    <section style={S.card}>
      <ST icon="⭐" title="당사주(唐四柱)"/>
      <GT>당사주는 년지·월지·일지·시지의 12지지를 기준으로 별성(別星)과 십이운성(十二運星)을 분석합니다. 일간 무토(戊土) 기준 십이운성을 적용합니다.</GT>
      <div style={{display:"flex",flexDirection:"column",gap:9,marginTop:12}}>
        {ds.pillars.map((p,i)=>{
          const jColor=jc(p.ji);
          return <div key={i} style={{padding:"12px 14px",background:"#fafafa",borderRadius:12,border:"1px solid #eee"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
              <div style={{width:36,height:36,borderRadius:10,background:jColor.bg,border:`1.5px solid ${jColor.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontSize:14,fontWeight:900,color:jColor.text}}>{JH[JL.indexOf(p.ji)]}</div>
                <div style={{fontSize:9,color:jColor.text,opacity:.7}}>{p.ji}</div>
              </div>
              <div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:2}}>
                  <span style={{fontSize:13,fontWeight:800,color:"#111"}}>{p.byeolseong}</span>
                  <span style={{fontSize:11,color:"#e65100",background:"#fff3e0",padding:"1px 7px",borderRadius:99,fontWeight:700}}>{p.stage}</span>
                </div>
                <div style={{fontSize:11,color:"#888"}}>{p.palace}</div>
              </div>
            </div>
            <p style={{fontSize:12,color:"#555",margin:0,lineHeight:1.75}}>{p.desc}</p>
          </div>;
        })}
      </div>
      <div style={{marginTop:10,padding:"11px 13px",background:"#e8f5e0",borderRadius:10}}><div style={{fontSize:12,fontWeight:800,color:"#2d6a2d",marginBottom:5}}>당사주 종합 기질</div><p style={{fontSize:13,color:"#333",margin:0,lineHeight:1.8}}>{ds.overall}</p></div>
      <div style={{marginTop:10}}><div style={{fontSize:12,fontWeight:800,color:"#333",marginBottom:8}}>연도별 운세</div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {ds.yearFlow.map((y,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#fafafa",borderRadius:10,border:"1px solid #eee"}}><Ring score={y.score} size={44}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:900,color:"#111",marginBottom:2}}>{y.year}년</div><div style={{fontSize:12,color:"#555",lineHeight:1.6}}>{y.desc}</div></div></div>)}
        </div>
      </div>
    </section>
  </>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9. 별자리·타로 탭
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TabAstro({d}){
  const a=d.astro,t=d.tarot;
  return <>
    <section style={S.card}>
      <ST icon="✨" title="서양 점성술 네이탈 차트"/>
      <GT>출생 시각과 장소를 기준으로 행성의 위치를 분석합니다. 태양·달·ASC 삼각 관계가 성격의 핵심 구조를 이룹니다.</GT>
      <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:7}}>
        {[
          {l:"태양 ☉",v:a.sun,meaning:a.sunMeaning,desc:a.sunDesc,bg:"#fff8e1",c:"#f57f17"},
          {l:"달 ☽",v:a.moon,meaning:a.moonMeaning,desc:a.moonDesc,bg:"#e8f5e0",c:"#2e7d32"},
          {l:"ASC 상승점",v:a.asc,meaning:a.ascMeaning,desc:a.ascDesc,bg:"#fce4ec",c:"#880e4f"},
          {l:"수성 ☿",v:a.mercury,meaning:"언어·사고·소통 방식",desc:a.mercuryDesc,bg:"#f3f3f3",c:"#424242"},
          {l:"금성 ♀",v:a.venus,meaning:"사랑·가치관·매력",desc:a.venusDesc,bg:"#fce4ec",c:"#c62828"},
          {l:"화성 ♂",v:a.mars,meaning:"행동력·에너지·욕망",desc:a.marsDesc,bg:"#fdecea",c:"#b71c1c"},
        ].map((item,i)=>(
          <div key={i} style={{padding:"10px 13px",background:item.bg,borderRadius:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
              <span style={{fontSize:11,fontWeight:700,color:item.c,minWidth:72,flexShrink:0}}>{item.l}</span>
              <span style={{fontSize:13,fontWeight:900,color:"#111"}}>{item.v}</span>
            </div>
            <div style={{fontSize:10,color:"#999",marginBottom:4}}>{item.meaning}</div>
            <p style={{fontSize:12,color:"#555",margin:0,lineHeight:1.65}}>{item.desc}</p>
          </div>
        ))}
      </div>
      <div style={{marginTop:10,padding:"11px 13px",background:"#f3e5f5",borderRadius:10}}><div style={{fontSize:11,color:"#4a148c",fontWeight:700,marginBottom:4}}>삼각 핵심 분석</div><p style={{fontSize:13,color:"#444",margin:0,lineHeight:1.8}}>{a.triangle}</p></div>
      <div style={{marginTop:8,padding:"10px 13px",background:"#e8f5e0",borderRadius:10}}><div style={{fontSize:11,color:"#2d6a2d",fontWeight:700,marginBottom:3}}>스텔리움(Stellium)</div><p style={{fontSize:13,color:"#333",margin:0,lineHeight:1.7}}>{a.stellium}</p></div>
      <div style={{marginTop:12}}><div style={{fontSize:12,fontWeight:800,color:"#333",marginBottom:8}}>주요 트랜짓 {CY}~{CY+5}</div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {a.yearTransit.map((y,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#fafafa",borderRadius:10,border:"1px solid #eee"}}><Ring score={y.score} size={44}/><div style={{flex:1}}><div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2,flexWrap:"wrap"}}><span style={{fontSize:13,fontWeight:900,color:"#111"}}>{y.year}년</span><span style={{fontSize:11,color:"#5e35b1",fontWeight:700}}>{y.planet}</span></div><div style={{fontSize:12,color:"#555",lineHeight:1.6}}>{y.desc}</div></div></div>)}
        </div>
      </div>
    </section>
    <section style={S.card}>
      <ST icon="🃏" title="타로 · 수비학"/>
      <p style={{fontSize:13,color:"#666",lineHeight:1.78,margin:"10px 0 12px",borderLeft:"3px solid #e8e8e8",paddingLeft:10}}>{t.calc}</p>
      <div style={{display:"flex",gap:10,marginBottom:10}}>
        <div style={{flex:1,padding:"13px",background:"linear-gradient(135deg,#e3f2fd,#f3e5f5)",borderRadius:12,textAlign:"center"}}>
          <div style={{fontSize:10,color:"#555",marginBottom:3}}>생명경로수</div>
          <div style={{fontSize:34,fontWeight:900,color:"#1565c0"}}>{t.lifePath}</div>
        </div>
        <div style={{flex:2,padding:"13px",background:"#fafafa",borderRadius:12,border:"1px solid #eee"}}>
          <div style={{fontSize:11,color:"#888",marginBottom:3}}>본명 타로 카드</div>
          <div style={{fontSize:15,fontWeight:900,color:"#111"}}>{t.lifePathCard}</div>
          <div style={{fontSize:20,fontWeight:900,color:"#5e35b1",marginTop:2}}>{t.lifePathCardNum}</div>
        </div>
      </div>
      <p style={{fontSize:13,color:"#444",lineHeight:1.85,margin:"0 0 10px"}}>{t.lifePathDesc}</p>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <div style={{flex:1,padding:"10px 11px",background:"#e3f2fd",borderRadius:10}}>
          <div style={{fontSize:10,color:"#0d47a1",fontWeight:700,marginBottom:2}}>영혼 카드(Soul)</div>
          <div style={{fontSize:13,fontWeight:800,color:"#1565c0"}}>{t.soulCard}</div>
          <div style={{fontSize:11,color:"#555",marginTop:3}}>{t.soulDesc}</div>
        </div>
        <div style={{flex:1,padding:"10px 11px",background:"#e8f5e0",borderRadius:10}}>
          <div style={{fontSize:10,color:"#2d6a2d",fontWeight:700,marginBottom:2}}>성취 카드(Achievement)</div>
          <div style={{fontSize:13,fontWeight:800,color:"#1b5e20"}}>{t.achieveCard}</div>
          <div style={{fontSize:11,color:"#555",marginTop:3}}>{t.achieveDesc}</div>
        </div>
      </div>
      <div style={{fontSize:12,fontWeight:800,color:"#333",marginBottom:8}}>연도별 개인연도수 & 타로</div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {t.yearCards.map((y,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
            background:y.num===22?"linear-gradient(135deg,#7c3aed,#4f46e5)":"#fafafa",
            borderRadius:10,border:y.num===22?"none":"1px solid #eee"}}>
            <div style={{minWidth:28,height:28,borderRadius:"50%",
              background:y.num===22?"#ffd700":"linear-gradient(135deg,#7c4dff,#e040fb)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:11,fontWeight:900,color:y.num===22?"#1a1a1a":"#fff",flexShrink:0}}>{y.num}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2,flexWrap:"wrap"}}>
                <span style={{fontSize:13,fontWeight:900,color:y.num===22?"#ffd700":"#111"}}>{y.year}년</span>
                <span style={{fontSize:11,color:y.num===22?"#c4b5fd":"#5e35b1",fontWeight:700}}>{y.card}</span>
                <span style={{fontSize:12,fontWeight:900,color:sc(y.score)}}>{y.score}점</span>
              </div>
              <div style={{fontSize:12,color:y.num===22?"#e0e7ff":"#555",lineHeight:1.6}}>{y.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  </>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 10. MBTI 탭
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TabMBTI({d}){
  const m=d.mbti;
  return <>
    <section style={{...S.card,background:"linear-gradient(135deg,#1e1b4b,#312e81)",borderColor:"#4338ca"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
        <div style={{width:64,height:64,borderRadius:16,background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:"#fff",flexShrink:0,textAlign:"center",lineHeight:1.3}}>
          {m.estType}<br/><span style={{fontSize:10,opacity:.8}}>/ESTJ</span>
        </div>
        <div>
          <div style={{fontSize:11,color:"#a5b4fc",marginBottom:3}}>사주 교차 분석 MBTI</div>
          <div style={{fontSize:20,fontWeight:900,color:"#e0e7ff"}}>{m.estimated}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        {[{type:m.estType,color:"#7c3aed",desc:"공감·조화·관계 중심. 가까운 사람을 돌보고 분위기를 맞추는 에너지예요."},{type:m.esType,color:"#2563eb",desc:"원칙·효율·책임 중심. 역할이 명확한 환경에서 최대치를 발휘해요."}].map(({type,color,desc})=>(
          <div key={type} style={{flex:1,padding:"10px",background:"rgba(255,255,255,0.08)",borderRadius:10,border:`1px solid ${color}55`}}>
            <div style={{fontSize:14,fontWeight:900,color,marginBottom:4}}>{type}</div>
            <div style={{fontSize:11,color:"#c4b5fd",lineHeight:1.6}}>{desc}</div>
          </div>
        ))}
      </div>
      <p style={{fontSize:12,color:"#c4b5fd",lineHeight:1.75,margin:0}}>{m.basis}</p>
    </section>
    <section style={S.card}>
      <ST icon="🧠" title="4축 분석"/>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:12}}>
        {m.axes.map((ax,i)=>{
          const pct=ax.score,c=pct>=70?"#5e35b1":"#0d47a1";
          return <div key={i} style={{padding:"12px 14px",background:"#fafafa",borderRadius:11,border:"1px solid #eee"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <div style={{width:44,height:44,borderRadius:10,background:"linear-gradient(135deg,#e8eaf6,#c5cae9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:"#1a237e",flexShrink:0}}>
                {ax.axis.split(" ")[0]}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:800,color:"#111"}}>{ax.axis}</div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                  <div style={{flex:1,height:6,background:"#e8eaf6",borderRadius:99,overflow:"hidden"}}>
                    <div style={{width:`${pct}%`,height:"100%",background:c,borderRadius:99}}/>
                  </div>
                  <span style={{fontSize:12,fontWeight:800,color:c}}>{pct}%</span>
                </div>
              </div>
            </div>
            <div style={{fontSize:12,color:"#555",lineHeight:1.7}}>{ax.basis}</div>
          </div>;
        })}
      </div>
    </section>
    <section style={S.card}>
      <ST icon="⚡" title="경계 기능 (F↔T)"/>
      <div style={{padding:"12px 14px",background:"#fff8e1",borderRadius:11,border:"1px solid #ffe082",marginTop:10}}><p style={{fontSize:13,color:"#5d4037",margin:0,lineHeight:1.8}}>{m.borderline}</p></div>
    </section>
    <section style={S.card}>
      <ST icon="🌟" title="강점·과제·최적 환경"/>
      <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:10}}>
        <div style={{padding:"12px 14px",background:"#e8f5e0",borderRadius:11}}><div style={{fontSize:12,fontWeight:800,color:"#2d6a2d",marginBottom:7}}>강점(Strengths)</div>{m.strengths.map((s,i)=><div key={i} style={{fontSize:13,color:"#333",padding:"4px 0",borderBottom:i<m.strengths.length-1?"1px dashed #c8e6c9":"none",lineHeight:1.7}}><span style={{color:"#4caf50",fontWeight:700,marginRight:6}}>✓</span>{s}</div>)}</div>
        <div style={{padding:"12px 14px",background:"#fdecea",borderRadius:11}}><div style={{fontSize:12,fontWeight:800,color:"#b71c1c",marginBottom:7}}>성장 과제(Challenges)</div>{m.challenges.map((s,i)=><div key={i} style={{fontSize:13,color:"#333",padding:"4px 0",borderBottom:i<m.challenges.length-1?"1px dashed #ffcdd2":"none",lineHeight:1.7}}><span style={{color:"#ef5350",fontWeight:700,marginRight:6}}>△</span>{s}</div>)}</div>
        <div style={{padding:"12px 14px",background:"#e3f2fd",borderRadius:11}}><div style={{fontSize:12,fontWeight:800,color:"#0d47a1",marginBottom:5}}>최적 환경</div><p style={{fontSize:13,color:"#333",margin:0,lineHeight:1.75}}>{m.bestEnv}</p></div>
        <div style={{padding:"12px 14px",background:"#f3e5f5",borderRadius:11}}><div style={{fontSize:12,fontWeight:800,color:"#4a148c",marginBottom:5}}>회복 방법</div><p style={{fontSize:13,color:"#333",margin:0,lineHeight:1.75}}>{m.recovery}</p></div>
      </div>
    </section>
  </>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 11. 메인
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 로딩 화면 컴포넌트
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const OHAENG_LOADING=[
  {symbol:"木",color:"#66bb6a",bg:"#e8f5e0",name:"목"},
  {symbol:"火",color:"#ef5350",bg:"#fdecea",name:"화"},
  {symbol:"土",color:"#ffb300",bg:"#fff8e1",name:"토"},
  {symbol:"金",color:"#90a4ae",bg:"#f3f3f3",name:"금"},
  {symbol:"水",color:"#42a5f5",bg:"#e3f2fd",name:"수"},
];

function LoadingScreen({name}){
  const [idx,setIdx]=useState(0);
  const [visible,setVisible]=useState(true);
  useEffect(()=>{
    const iv=setInterval(()=>{
      setVisible(false);
      setTimeout(()=>{setIdx(i=>(i+1)%5);setVisible(true);},300);
    },900);
    return()=>clearInterval(iv);
  },[]);
  const cur=OHAENG_LOADING[idx];
  return(
    <div style={{position:"fixed",inset:0,background:"#f4f4f6",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:50}}>
      <div style={{
        width:120,height:120,borderRadius:32,background:cur.bg,
        display:"flex",alignItems:"center",justifyContent:"center",
        marginBottom:24,
        transition:"opacity 0.3s, transform 0.3s",
        opacity:visible?1:0,
        transform:visible?"scale(1)":"scale(0.9)",
        boxShadow:`0 8px 32px ${cur.color}40`,
      }}>
        <span style={{fontSize:56,fontWeight:900,color:cur.color,fontFamily:"serif"}}>{cur.symbol}</span>
      </div>
      <div style={{fontSize:14,color:"#888",fontWeight:600,marginBottom:6}}>{name||""}님의 사주를 분석하고 있어요</div>
      <div style={{display:"flex",gap:6,marginTop:4}}>
        {OHAENG_LOADING.map((_,i)=>(
          <div key={i} style={{width:6,height:6,borderRadius:99,background:i===idx?OHAENG_LOADING[i].color:"#ddd",transition:"background 0.3s"}}/>
        ))}
      </div>
    </div>
  );
}

export default function SajuReport(){
  const [tab,setTab]=useState("요약");
  const [phase,setPhase]=useState("form"); // "form"|"loading"|"report"
  const [opacity,setOpacity]=useState(1);
  const [userName,setUserName]=useState("");
  const TABS=["요약","사주","낮과 밤","토정·주역","별자리·타로","MBTI"];
  const contentRef=useRef(null);

  function changeTab(t){
    setTab(t);
    setTimeout(()=>{
      window.scrollTo({top:0,behavior:"smooth"});
    },10);
  }

  function handleFormSubmit(name){
    setUserName(name||"");
    // 폼 페이드아웃
    setOpacity(0);
    setTimeout(()=>{
      setPhase("loading");
      setOpacity(1);
      // 로딩 1.8초 후 리포트 페이드인
      setTimeout(()=>{
        setOpacity(0);
        setTimeout(()=>{
          setPhase("report");
          setTab("요약");
          setOpacity(1);
          window.scrollTo({top:0});
        },300);
      },1800);
    },350);
  }

  function goToForm(){
    setOpacity(0);
    setTimeout(()=>{
      setPhase("form");
      setOpacity(1);
    },300);
  }

  const wrapStyle={transition:"opacity 0.35s ease",opacity};

  if(phase==="loading") return <LoadingScreen name={userName}/>;

  if(phase==="form") return(
    <div style={wrapStyle}>
      <SajuInputForm onSubmit={handleFormSubmit}/>
    </div>
  );

  return <div style={{...wrapStyle,...S.root}}>
    <div style={S.header}><button style={S.navBtn} onClick={goToForm}>‹</button><div style={S.headerTitle}>fortuneyam</div><button style={S.navBtn} onClick={()=>changeTab("요약")}>⌂</button></div>
    <div style={S.profileBar}><div><div style={{display:"flex",alignItems:"baseline",gap:8}}><div style={S.pName}>윤정</div><div style={{fontSize:12,color:"#e65100",fontWeight:700,background:"#fff3e0",padding:"2px 8px",borderRadius:99}}>황금 돼지</div></div><div style={S.pBirth}>양력 1993년 1월 17일 23시 38분 경북 경산 生</div></div><div style={{padding:"4px 12px",borderRadius:99,fontSize:13,fontWeight:700,background:"#fce4ec",color:"#880e4f"}}>여성</div></div>
    <div style={{...S.tabBar,overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
      {TABS.map(t=><button key={t} onClick={()=>changeTab(t)} style={{...S.tab,minWidth:60,whiteSpace:"nowrap",...(tab===t?S.tabA:{})}}>{t}</button>)}
    </div>
    <div style={S.content}>
      {tab==="요약"       && <TabSummary d={D} changeTab={changeTab}/>}
      {tab==="사주"       && <TabSaju d={D}/>}
      {tab==="낮과 밤"    && <TabDayNight d={D}/>}
      {tab==="토정·주역"  && <TabTojung d={D}/>}
      {tab==="별자리·타로"&& <TabAstro d={D}/>}
      {tab==="MBTI"       && <TabMBTI d={D}/>}
    </div>
    <div style={{textAlign:"center",fontSize:10,color:"#ccc",padding:"20px 0 8px"}}>
      ✦ 윤정 1993.01.17 경북경산 · 壬申·癸丑·戊戌/己亥·甲子 · 수뢰둔(水雷屯) · 고목봉춘(枯木逢春) · Today {CY}.{String(CM).padStart(2,"0")}.{String(CD).padStart(2,"0")}
    </div>
  </div>;
}

const S={
  root:{fontFamily:"'Noto Sans KR','Apple SD Gothic Neo',sans-serif",maxWidth:480,margin:"0 auto",background:"#f4f4f6",minHeight:"100vh",paddingBottom:48},
  header:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:"#fff",borderBottom:"1px solid #eee",position:"sticky",top:0,zIndex:20},
  navBtn:{background:"none",border:"none",fontSize:22,color:"#333",cursor:"pointer",width:32,padding:0},
  headerTitle:{fontSize:16,fontWeight:700,color:"#111"},
  profileBar:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 18px",background:"#fff",borderBottom:"1px solid #f0f0f0"},
  pName:{fontSize:22,fontWeight:900,color:"#111",letterSpacing:-.5},
  pBirth:{fontSize:12,color:"#999",marginTop:2},
  tabBar:{display:"flex",background:"#fff",borderBottom:"2px solid #f0f0f0",position:"sticky",top:49,zIndex:19},
  tab:{flex:1,padding:"11px 0",fontSize:11,fontWeight:600,background:"none",border:"none",color:"#bbb",cursor:"pointer",borderBottom:"2.5px solid transparent",marginBottom:-2,transition:"color .2s,border-color .2s"},
  tabA:{color:"#e65100",borderBottomColor:"#e65100"},
  content:{padding:"12px 14px",display:"flex",flexDirection:"column",gap:11},
  card:{background:"#fff",borderRadius:16,padding:"16px",border:"1px solid #ebebeb",boxShadow:"0 1px 5px rgba(0,0,0,0.04)"},
  dCard:{background:"#fafafa",borderRadius:12,padding:"13px",border:"1px solid #eee",position:"relative"},
  dBadge:{fontSize:12,fontWeight:700,padding:"4px 7px",borderRadius:8,border:"1px solid"},
  sRow:{background:"#fafafa",borderRadius:12,padding:"13px",border:"1px solid #ebebeb"},
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 입력 폼 컴포넌트
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CITIES=[
  "서울","부산","대구","인천","광주","대전","울산","세종",
  "경기","강원","충북","충남","전북","전남","경북","경남","제주",
  "경북 경산","경북 포항","경북 구미","경북 안동",
  "경남 창원","경남 진주","전남 순천","전북 전주",
];
const HOURS=Array.from({length:24},(_,i)=>String(i).padStart(2,"0"));
const MINS=["00","10","20","30","40","50"].flatMap(m=>[m]);
const MINS_ALL=Array.from({length:60},(_,i)=>String(i).padStart(2,"0"));

function SajuInputForm({onSubmit}){
  const [step,setStep]=useState(1); // 1=기본정보 2=시간 3=확인
  const [form,setForm]=useState({
    name:"",year:"",month:"",day:"",
    hour:"23",minute:"38",
    gender:"여",city:"경북 경산",
  });
  const [err,setErr]=useState({});
  const up=(k,v)=>setForm(f=>({...f,[k]:v}));

  function validate1(){
    const e={};
    if(!form.name.trim()) e.name="이름을 입력해주세요";
    const y=parseInt(form.year),m=parseInt(form.month),d=parseInt(form.day);
    if(!form.year||y<1900||y>2010) e.year="연도를 확인해주세요";
    if(!form.month||m<1||m>12) e.month="월을 확인해주세요";
    if(!form.day||d<1||d>31) e.day="일을 확인해주세요";
    setErr(e);
    return Object.keys(e).length===0;
  }
  function next(){if(step===1&&validate1()) setStep(2); else if(step===2) setStep(3);}

  const OC2={여:{bg:"#fce4ec",c:"#880e4f"},남:{bg:"#e3f2fd",c:"#0d47a1"}};
  const gc2=form.gender==="여"?OC2.여:OC2.남;

  // 스텝 1 — 기본 정보
  if(step===1) return(
    <div style={SF.root}>
      <div style={SF.header}>
        <button style={SF.back} onClick={()=>onSubmit(form.name)}>‹</button>
        <div style={SF.title}>fortuneyam</div>
        <div style={{width:32}}/>
      </div>
      <div style={SF.progress}>
        {[1,2,3].map(s=><div key={s} style={{...SF.dot,background:s<=step?"#e65100":"#e0e0e0"}}/>)}
      </div>
      <div style={SF.content}>
        <div style={SF.stepLabel}>STEP 1 · 기본 정보</div>
        <div style={SF.heading}>어떤 분을 분석할까요?</div>

        {/* 이름 */}
        <div style={SF.field}>
          <div style={SF.label}>이름</div>
          <input style={{...SF.input,...(err.name?SF.inputErr:{})}}
            placeholder="홍길동" value={form.name}
            onChange={e=>up("name",e.target.value)}/>
          {err.name&&<div style={SF.errMsg}>{err.name}</div>}
        </div>

        {/* 성별 */}
        <div style={SF.field}>
          <div style={SF.label}>성별</div>
          <div style={{display:"flex",gap:10}}>
            {["여","남"].map(g=>(
              <button key={g} onClick={()=>up("gender",g)}
                style={{...SF.gBtn,...(form.gender===g?{background:OC2[g].bg,color:OC2[g].c,border:`2px solid ${OC2[g].c}`,fontWeight:800}:{})}}>
                {g==="여"?"👩 여성":"👨 남성"}
              </button>
            ))}
          </div>
        </div>

        {/* 생년월일 */}
        <div style={SF.field}>
          <div style={SF.label}>생년월일 (양력)</div>
          <div style={{display:"flex",gap:8}}>
            {[
              {k:"year",ph:"1993",w:"40%",max:4,err:err.year},
              {k:"month",ph:"01",w:"28%",max:2,err:err.month},
              {k:"day",ph:"17",w:"28%",max:2,err:err.day},
            ].map(({k,ph,w,max,err:e})=>(
              <div key={k} style={{width:w}}>
                <input style={{...SF.input,width:"100%",boxSizing:"border-box",...(e?SF.inputErr:{})}}
                  placeholder={ph} value={form[k]} maxLength={max}
                  inputMode="numeric"
                  onChange={ev=>up(k,ev.target.value.replace(/\D/g,""))}/>
                {e&&<div style={SF.errMsg}>{e}</div>}
              </div>
            ))}
          </div>
          <div style={SF.hint}>연도 · 월 · 일 순서로 입력</div>
        </div>

        {/* 출생지 */}
        <div style={SF.field}>
          <div style={SF.label}>출생지</div>
          <select style={SF.select} value={form.city} onChange={e=>up("city",e.target.value)}>
            {CITIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>

        <button style={SF.btn} onClick={next}>다음 →</button>
      </div>
    </div>
  );

  // 스텝 2 — 출생 시간
  if(step===2) return(
    <div style={SF.root}>
      <div style={SF.header}>
        <button style={SF.back} onClick={()=>setStep(1)}>‹</button>
        <div style={SF.title}>fortuneyam</div>
        <div style={{width:32}}/>
      </div>
      <div style={SF.progress}>
        {[1,2,3].map(s=><div key={s} style={{...SF.dot,background:s<=step?"#e65100":"#e0e0e0"}}/>)}
      </div>
      <div style={SF.content}>
        <div style={SF.stepLabel}>STEP 2 · 출생 시간</div>
        <div style={SF.heading}>태어난 시간을 알고 있나요?</div>

        <div style={{padding:"12px 14px",background:"#fff8e1",borderRadius:12,border:"1px solid #ffe082",marginBottom:16}}>
          <div style={{fontSize:12,color:"#7b5800",lineHeight:1.7}}>
            💡 출생 시간은 시주(時柱)를 결정해요. 모른다면 정오(12:00)로 설정해두고 나중에 수정할 수 있어요.
          </div>
        </div>

        {/* 시간 선택 — 드럼롤 느낌의 큰 선택 */}
        <div style={SF.field}>
          <div style={SF.label}>출생 시간</div>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:"#aaa",marginBottom:4,textAlign:"center"}}>시(時)</div>
              <select style={{...SF.select,textAlign:"center",fontSize:20,fontWeight:900,padding:"14px 0",color:"#e65100"}}
                value={form.hour} onChange={e=>up("hour",e.target.value)}>
                {HOURS.map(h=><option key={h} value={h}>{h}시</option>)}
              </select>
            </div>
            <div style={{fontSize:24,color:"#ddd",fontWeight:300,paddingTop:20}}>:</div>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:"#aaa",marginBottom:4,textAlign:"center"}}>분(分)</div>
              <select style={{...SF.select,textAlign:"center",fontSize:20,fontWeight:900,padding:"14px 0",color:"#e65100"}}
                value={form.minute} onChange={e=>up("minute",e.target.value)}>
                {MINS_ALL.map(m=><option key={m} value={m}>{m}분</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 자시 경계 안내 */}
        {(form.hour==="23"||form.hour==="00") &&(
          <div style={{padding:"11px 13px",background:"#fff8e1",borderRadius:11,border:"1px solid #ffb300",marginTop:8}}>
            <div style={{fontSize:12,fontWeight:800,color:"#7b5800",marginBottom:3}}>⚠️ 자시(子時) 경계 구간</div>
            <div style={{fontSize:12,color:"#7b5800",lineHeight:1.65}}>
              밤 11시~자정은 일주(日柱)가 바뀌는 경계 시간이에요. 두 가지 일주를 함께 분석해드릴게요.
            </div>
          </div>
        )}

        <div style={{display:"flex",gap:8,marginTop:16}}>
          <button style={{...SF.btn,flex:1,background:"#f5f5f5",color:"#555"}} onClick={()=>setStep(1)}>← 이전</button>
          <button style={{...SF.btn,flex:2}} onClick={next}>다음 →</button>
        </div>
      </div>
    </div>
  );

  // 스텝 3 — 확인
  const birthStr=`양력 ${form.year}년 ${form.month}월 ${form.day}일 ${form.hour}시 ${form.minute}분`;
  return(
    <div style={SF.root}>
      <div style={SF.header}>
        <button style={SF.back} onClick={()=>setStep(2)}>‹</button>
        <div style={SF.title}>fortuneyam</div>
        <div style={{width:32}}/>
      </div>
      <div style={SF.progress}>
        {[1,2,3].map(s=><div key={s} style={{...SF.dot,background:s<=step?"#e65100":"#e0e0e0"}}/>)}
      </div>
      <div style={SF.content}>
        <div style={SF.stepLabel}>STEP 3 · 확인</div>
        <div style={SF.heading}>입력 정보를 확인해주세요</div>

        <div style={{background:"#fff",borderRadius:16,border:"1px solid #ebebeb",overflow:"hidden",marginBottom:16}}>
          {[
            {icon:"👤",label:"이름",value:form.name},
            {icon:form.gender==="여"?"👩":"👨",label:"성별",value:form.gender==="여"?"여성":"남성"},
            {icon:"📅",label:"생년월일",value:`${form.year}.${form.month.padStart(2,"0")}.${form.day.padStart(2,"0")}`},
            {icon:"🕐",label:"출생 시간",value:`${form.hour}시 ${form.minute}분`},
            {icon:"📍",label:"출생지",value:form.city},
          ].map(({icon,label,value},i,arr)=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}>
              <span style={{fontSize:18,width:24}}>{icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:"#aaa",fontWeight:600}}>{label}</div>
                <div style={{fontSize:15,fontWeight:800,color:"#111",marginTop:1}}>{value}</div>
              </div>
              <button onClick={()=>setStep(i<3?1:i===3?2:1)}
                style={{fontSize:11,color:"#e65100",background:"#fff3e0",border:"none",padding:"4px 10px",borderRadius:99,cursor:"pointer",fontWeight:700}}>
                수정
              </button>
            </div>
          ))}
        </div>

        <div style={{padding:"12px 14px",background:"#e3f2fd",borderRadius:12,marginBottom:16,fontSize:12,color:"#0d47a1",lineHeight:1.7}}>
          ✨ 입력 정보로 사주 8자를 계산하고 종합 운세 리포트를 생성해요. 분석에는 약 3~5초가 걸려요.
        </div>

        <button style={{...SF.btn,fontSize:16,padding:"16px 0",background:"linear-gradient(135deg,#e65100,#bf360c)"}}
          onClick={()=>onSubmit(form.name)}>
          🔮 fortuneyam 보기
        </button>
        <button style={{...SF.btn,background:"#f5f5f5",color:"#555",marginTop:8}} onClick={()=>setStep(1)}>
          ← 다시 입력
        </button>
      </div>
    </div>
  );
}

const SF={
  root:{fontFamily:"'Noto Sans KR','Apple SD Gothic Neo',sans-serif",maxWidth:480,margin:"0 auto",background:"#f4f4f6",minHeight:"100vh"},
  header:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:"#fff",borderBottom:"1px solid #eee",position:"sticky",top:0,zIndex:20},
  back:{background:"none",border:"none",fontSize:22,color:"#333",cursor:"pointer",width:32,padding:0},
  title:{fontSize:16,fontWeight:700,color:"#111"},
  progress:{display:"flex",gap:6,justifyContent:"center",padding:"12px 0 4px"},
  dot:{width:28,height:4,borderRadius:99,transition:"background .3s"},
  content:{padding:"20px 16px"},
  stepLabel:{fontSize:11,color:"#e65100",fontWeight:700,letterSpacing:1,marginBottom:4},
  heading:{fontSize:22,fontWeight:900,color:"#111",marginBottom:20,lineHeight:1.3},
  field:{marginBottom:18},
  label:{fontSize:13,fontWeight:700,color:"#444",marginBottom:7},
  input:{width:"100%",padding:"13px 14px",borderRadius:12,border:"1.5px solid #e0e0e0",fontSize:16,boxSizing:"border-box",outline:"none",fontFamily:"inherit",background:"#fff"},
  inputErr:{borderColor:"#ef5350",background:"#fff8f8"},
  errMsg:{fontSize:11,color:"#ef5350",marginTop:4,fontWeight:600},
  hint:{fontSize:11,color:"#aaa",marginTop:5},
  select:{width:"100%",padding:"13px 14px",borderRadius:12,border:"1.5px solid #e0e0e0",fontSize:15,background:"#fff",outline:"none",fontFamily:"inherit",appearance:"none",WebkitAppearance:"none"},
  gBtn:{flex:1,padding:"13px 0",borderRadius:12,border:"1.5px solid #e0e0e0",fontSize:14,fontWeight:600,cursor:"pointer",background:"#fff",color:"#555",fontFamily:"inherit"},
  btn:{width:"100%",padding:"14px 0",borderRadius:14,border:"none",fontSize:14,fontWeight:800,cursor:"pointer",background:"#e65100",color:"#fff",fontFamily:"inherit"},
};
