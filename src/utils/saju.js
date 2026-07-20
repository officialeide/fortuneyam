// utils/saju.js
import { deriveIching64 } from '../data/iching64.js';
import { GL, JL, GH, JH, OHK, GWAN_O, ILGAN_TITLE, ILGAN_PHILOSOPHY,
  SAMHAP, YUKHAP, CHUNG, calcHapChungHyeong, TRIGRAM, TOJUNG_SAJA, SIBSONG_ROLE,
  BASE, JASI_START, JASI_END, toJDN, idxToGJ, calcIlju, calcBnd, yearToGJ, mToGJ,
  getToday, CY, CM, CD, bYS, bMS, calcSeunScore, calcSeunAreas,
  BYEOLSEONG, STAGES, getStage, getIching, GAN_OE, getSibsong, calcWolju, calcSiju,
  calcYeonju, getMonthJi, getTimeJi, calcOhaengDist, STAGE_DESC,
  _GANO, _JIO, normO, JI_OE, isYang, isYangJ, YONGSIN_TABLE,
  ILGAN_DESC, ILJU_CHAR, stripLead } from '../data/constants.js';

function calcSinsal(ilgan,yearJi,monthJi,dayJi,timeJi,noTime){
  if(noTime) timeJi=null;
  const result=[];
  const taeul={갑:["축","미"],무:["축","미"],경:["축","미"],을:["자","신"],기:["자","신"],병:["해","유"],정:["해","유"],임:["묘","사"],계:["묘","사"],신:["오","인"]};
  const tj=taeul[ilgan]||[];
  const tf=[yearJi,monthJi,dayJi,timeJi].filter(j=>tj.includes(j));
  if(tf.length>0)result.push({name:"천을귀인",hanja:"天乙貴人",found:tf.join("·"),easy:"귀인이 곁에 있는 축복받은 구조야.",desc:"위기마다 반드시 조력자가 나타나. 혼자인 것 같아도 결정적인 순간엔 누군가 손을 내밀어."});
  const mc={갑:"사",을:"오",병:"신",정:"유",무:"신",기:"유",경:"해",신:"자",임:"인",계:"묘"};
  if(mc[ilgan]&&[yearJi,monthJi,dayJi,timeJi].includes(mc[ilgan]))result.push({name:"문창귀인",hanja:"文昌貴人",found:mc[ilgan],easy:"학문·글·시험에서 두각을 나타내는 에너지야.",desc:"글재주와 언변이 타고난 편이야. 말과 글로 사람을 움직이는 능력이 있어."});
  const dh={해:"자",묘:"자",미:"자",신:"유",자:"유",진:"유",인:"묘",오:"묘",술:"묘",사:"오",유:"오",축:"오"};
  if(dh[dayJi]&&[yearJi,monthJi,timeJi].includes(dh[dayJi]))result.push({name:"도화살",hanja:"桃花殺",found:dh[dayJi],easy:"타고난 자연스러운 흡인력이 있어.",desc:"자신도 모르게 눈에 띄고 기억에 남는 사람이야. 억지로 꾸미지 않아도 끌려오게 되어 있어."});
  const ym={신:"인",자:"인",진:"인",인:"신",오:"신",술:"신",사:"해",유:"해",축:"해",해:"사",묘:"사",미:"사"};
  if(ym[yearJi]&&[monthJi,dayJi,timeJi].includes(ym[yearJi]))result.push({name:"역마살",hanja:"驛馬殺",found:ym[yearJi],easy:"이동, 변화, 해외 에너지가 강해.",desc:"한 곳에 오래 머물면 답답해. 움직임 속에서 에너지가 살아나는 구조야."});
  const hy={갑:"오",을:"오",병:"인",정:"미",무:"진",기:"진",경:"술",신:"유",임:"자",계:"신"};
  if(hy[ilgan]&&[yearJi,monthJi,dayJi,timeJi].includes(hy[ilgan]))result.push({name:"홍염살",hanja:"紅艶殺",found:hy[ilgan],easy:"타고난 매력과 색기가 도는 에너지야.",desc:"본인은 의식하지 않아도 주변에서 먼저 끌려. 관계에서 늘 주목받는 자리에 서게 되는 구조야."});
  const hc=["묘","오","신","미"];
  if(hc.includes(dayJi)&&(hc.includes(monthJi)||hc.includes(yearJi)))result.push({name:"현침살",hanja:"懸針殺",found:dayJi,easy:"예리하고 정확한 판단력을 타고났어.",desc:"바늘처럼 날카롭게 핵심을 짚어내는 힘이 있어. 말과 판단이 정확한 대신, 그만큼 스스로에게도 엄격해지기 쉬워."});
  const cw=["해","축","인","사","신","술"];
  const cwCount=[yearJi,monthJi,dayJi,timeJi].filter(j=>cw.includes(j)).length;
  if(cwCount>=2)result.push({name:"천문성",hanja:"天門星",found:`${cwCount}개`,easy:"직관과 영감이 예민하게 열려 있어.",desc:"보이지 않는 흐름을 먼저 감지하는 감각이 있어. 종교, 철학, 치유, 상담 쪽 기운과 잘 통하는 구조야."});
  // 금여성 (일간 기준 록의 다음 지지)
  const geum={갑:"진",을:"사",병:"미",정:"신",무:"미",기:"신",경:"술",신:"해",임:"축",계:"인"};
  if(geum[ilgan]&&[yearJi,monthJi,dayJi,timeJi].includes(geum[ilgan]))result.push({name:"금여성",hanja:"金輿星",found:geum[ilgan],easy:"품위와 복을 타고난 귀한 기운이야.",desc:"주변의 도움과 좋은 인연이 자연스럽게 따라붙어. 배우자 복, 재물 복이 은근히 두터운 구조야."});
  // 태극귀인 (일간 기준)
  const taegeuk={갑:["자","오"],을:["자","오"],병:["묘","유"],정:["묘","유"],무:["진","술","축","미"],기:["진","술","축","미"],경:["인","해"],신:["인","해"],임:["사","신"],계:["사","신"]};
  const tgFound=[yearJi,monthJi,dayJi,timeJi].filter(j=>(taegeuk[ilgan]||[]).includes(j));
  if(tgFound.length)result.push({name:"태극귀인",hanja:"太極貴人",found:tgFound.join("·"),easy:"끝을 맺고 완성하는 대기만성의 기운이야.",desc:"한번 붙잡은 것을 끝까지 물고 늘어져 결국 완성해내. 늦게라도 크게 이루는 힘이 있어."});
  // 천의성 (월지 바로 앞 지지) — 의료, 치유의 별
  const _jiOrder=["자","축","인","묘","진","사","오","미","신","유","술","해"];
  const _mi=_jiOrder.indexOf(monthJi);
  const cheonui=_mi>=0?_jiOrder[(_mi+11)%12]:null;
  if(cheonui&&[yearJi,dayJi,timeJi].includes(cheonui))result.push({name:"천의성",hanja:"天醫星",found:cheonui,easy:"남을 살리고 돌보는 치유의 기운이야.",desc:"의료, 상담, 돌봄 쪽으로 타고난 감각이 있어. 사람을 낫게 하고 어루만지는 자리에서 빛나."});
  // 관귀학관 (일간 기준) — 관운, 학문의 별
  const gwan={갑:"사",을:"사",병:"신",정:"신",무:"해",기:"해",경:"인",신:"인",임:"신",계:"신"};
  if(gwan[ilgan]&&[yearJi,monthJi,dayJi,timeJi].includes(gwan[ilgan]))result.push({name:"관귀학관",hanja:"官貴學館",found:gwan[ilgan],easy:"학문과 관직으로 이름을 얻는 기운이야.",desc:"공부와 시험, 자격, 승진 쪽으로 힘이 실려. 배움을 통해 자리를 잡는 구조야."});
  return result;
}

// ━━ 12신살 (연지 또는 일지 삼합국 기준) ━━
const SINSAL12_ORDER=["겁살","재살","천살","지살","연살","월살","망신살","장성살","반안살","역마살","육해살","화개살"];
const SINSAL12_START={ // 각 삼합국의 겁살 시작 지지
  신:"사",자:"사",진:"사",  // 수국(신자진) → 겁살=사
  인:"해",오:"해",술:"해",  // 화국(인오술) → 겁살=해
  사:"인",유:"인",축:"인",  // 금국(사유축) → 겁살=인
  해:"신",묘:"신",미:"신",  // 목국(해묘미) → 겁살=신
};
const SINSAL12_DESC={
  겁살:{hanja:"劫殺",easy:"빼앗기고 흔들리는 자리야.",desc:"예상치 못한 일로 판이 흔들리기 쉬워. 근데 그 흔들림이 오히려 낡은 걸 걷어내고 새 판을 깔아. 위기를 기회로 뒤집는 순발력이 이 살의 진짜 힘이야."},
  재살:{hanja:"災殺",easy:"송곳 같은 승부의 자리야.",desc:"권력과 다툼의 기운이야. 밀어붙이면 크게 이기고, 방심하면 크게 당해. 감정보다 냉정한 계산으로 움직여야 살아남는 자리야."},
  천살:{hanja:"天殺",easy:"내 힘 밖의 일이 닥치는 자리야.",desc:"노력으로 어쩔 수 없는 변수가 끼어들어. 하늘이 정한 흐름이라 여기고, 버틸 땐 버티고 굽힐 땐 굽혀. 오만할수록 크게 꺾여."},
  지살:{hanja:"地殺",easy:"움직이고 개척하는 자리야.",desc:"한자리에 머물면 답답해. 이동, 이사, 새 출발 속에서 길이 열려. 발로 뛰는 만큼 기회가 붙는 구조야."},
  연살:{hanja:"年殺",easy:"사람을 끌어당기는 매력의 자리야.",desc:"도화의 기운이라 어디서든 눈에 띄어. 관계와 인기가 무기인데, 휘둘리면 구설에 오르니 선을 잘 지켜야 해."},
  월살:{hanja:"月殺",easy:"메마르고 지치기 쉬운 자리야.",desc:"애써도 결실이 더디게 오는 시기야. 조급하게 몰아붙이지 말고 힘을 아껴. 쉬어가는 게 지는 게 아니라 다음을 위한 준비야."},
  망신살:{hanja:"亡身殺",easy:"드러나고 까발려지는 자리야.",desc:"감추려던 게 오히려 드러나기 쉬워. 근데 그게 꼭 나쁜 것만은 아니야. 솔직하게 내보이면 오히려 신뢰를 얻어. 숨기려 할수록 탈이 나."},
  장성살:{hanja:"將星殺",easy:"칼을 쥔 장수의 자리야.",desc:"타고난 리더의 기운이야. 주도권을 쥐고 밀어붙일 때 가장 빛나. 대신 고집이 세지면 주변을 다 적으로 돌리니 힘을 쓸 때와 뺄 때를 알아야 해."},
  반안살:{hanja:"攀鞍殺",easy:"말안장에 오르는 출세의 자리야.",desc:"승진, 합격, 인정이 따라붙는 기운이야. 실력을 쌓아두면 결정적인 순간에 자리가 열려. 겸손하게 때를 기다리는 자가 크게 올라타."},
  역마살:{hanja:"驛馬殺",easy:"쉼 없이 움직이는 자리야.",desc:"이동, 여행, 해외의 기운이 강해. 한 곳에 묶이면 시들고, 움직일수록 살아나. 변화를 두려워하지 말고 올라타."},
  육해살:{hanja:"六害殺",easy:"발목 잡히고 얽매이는 자리야.",desc:"건강이나 관계에서 은근히 소모되기 쉬워. 근데 그만큼 눈치가 빠르고 위기를 미리 감지해. 무리하지 말고 몸과 마음을 먼저 챙겨."},
  화개살:{hanja:"華蓋殺",easy:"홀로 깊어지는 예술과 수행의 자리야.",desc:"고독을 견디는 힘 속에서 재능이 피어나. 예술, 학문, 종교, 영성 쪽으로 타고난 깊이가 있어. 외로움이 곧 이 사주의 무기야."},
};
function calc12Sinsal(baseJi, targetJi){
  const start=SINSAL12_START[baseJi];
  if(!start||!targetJi) return null;
  const order=["자","축","인","묘","진","사","오","미","신","유","술","해"];
  const si=order.indexOf(start), ti=order.indexOf(targetJi);
  if(si<0||ti<0) return null;
  const idx=((ti-si)%12+12)%12;
  return SINSAL12_ORDER[idx];
}

// ━━ 12운성 기질 해석 (일간 기준, getStage 결과 활용) ━━
const STAGE12_DESC={
  "장생(長生)":{easy:"막 태어나 뻗어나가는 자리야.",desc:"새싹처럼 순수하고 성장 에너지가 가득해. 배우고 시작하는 데 강하고, 사람들이 자연스럽게 돕고 싶어 하는 기운이야."},
  "목욕(沐浴)":{easy:"몸을 씻는 개구쟁이의 자리야.",desc:"호기심이 넘치고 변화무쌍해. 재미와 멋을 좇는 팔방미인 기질인데, 끈기가 약해서 마무리가 흐지부지되기 쉬워. 표현하는 일에서 빛나."},
  "관대(冠帶)":{easy:"갓 쓰고 세상에 나서는 자리야.",desc:"자기를 드러내고 인정받고 싶은 기운이 강해. 패기와 자존심이 넘치는데, 아직 다듬어지지 않아 부딪히며 배우는 시기야."},
  "건록(建祿)":{easy:"제 몫을 단단히 세우는 자리야.",desc:"자립심과 책임감이 강해. 스스로 일어서서 자기 자리를 만드는 힘이 있어. 남에게 기대지 않고 정도로 밀고 나가는 구조야."},
  "제왕(帝旺)":{easy:"기운이 정점에 오른 왕의 자리야.",desc:"에너지가 가장 강하게 뻗치는 자리야. 주도권을 쥐고 이끄는 힘이 남다른데, 지나치면 독선이 되니 힘을 나눌 줄 알아야 해."},
  "쇠(衰)":{easy:"정점을 지나 물러서는 자리야.",desc:"화려함보다 노련함의 기운이야. 앞장서기보다 뒤에서 조율하고 관리하는 데 강해. 무리하지 않고 안정을 지키는 지혜가 있어."},
  "병(病)":{easy:"쉬어가며 살피는 자리야.",desc:"섬세하고 공감 능력이 깊어. 남의 아픔을 잘 읽어내는 대신 스스로 지치기 쉬워. 예술이나 돌봄 쪽으로 타고난 감각이 있어."},
  "사(死)":{easy:"한 흐름이 끝나는 자리야.",desc:"한 가지를 깊게 파고드는 몰입의 기운이야. 겉은 조용해도 속은 치밀해. 연구, 전문 기술처럼 깊이가 필요한 일에서 진가가 나와."},
  "묘(墓)":{easy:"거두어 갈무리하는 무덤의 자리야.",desc:"모으고 지키는 데 강한 근검절약의 기운이야. 쓰기보다 쌓는 걸 좋아해서 금융, 관리 쪽에 잘 맞아. 한번 들어온 건 잘 안 놔."},
  "절(絶)":{easy:"끊어졌다 다시 잇는 자리야.",desc:"낡은 걸 끊고 완전히 새로 시작하는 기운이야. 변화를 두려워하지 않고, 극단을 오가며 재탄생해. 최신 흐름에 민감한 얼리어답터 기질이야."},
  "태(胎)":{easy:"새 생명이 잉태되는 자리야.",desc:"아직 세상에 안 나온 씨앗처럼 순수하고 상상력이 풍부해. 새로운 걸 잘 받아들이는데, 끈기가 약해 뒷심이 필요해."},
  "양(養)":{easy:"품에서 길러지는 자리야.",desc:"온순하고 낙천적이야. 사람들 사이에서 무난하게 어울리며 도움을 잘 받아. 큰 굴곡 없이 꾸준히 자라나는 안정적인 기운이야."},
};

// ━━ 십성 10종 성격, 재능 해석 (유료 분석용) ━━
const SIBSONG_CHAR={
  비견:{key:"비견",label:"자립과 주체성",desc:"내 힘으로 서는 기운이야. 남한테 기대는 걸 싫어하고, 내 방식대로 밀고 나가는 뚝심이 있어. 독립심과 추진력이 강한 대신, 고집이 세지고 남과 부딪히기도 쉬워. 동업이나 공동 작업에선 주도권 다툼을 조심해야 해."},
  겁재:{key:"겁재",label:"경쟁과 승부욕",desc:"지기 싫어하는 승부의 기운이야. 목표가 생기면 물불 안 가리고 달려들어. 추진력과 배짱이 남다른 대신, 욕심이 앞서면 무리하다 손해를 봐. 돈 관리랑 사람 관계에서 특히 절제가 필요해."},
  식신:{key:"식신",label:"표현과 여유",desc:"타고난 표현력과 여유의 기운이야. 먹고 즐기고 만들어내는 걸 좋아하고, 재능을 자연스럽게 펼쳐. 사람들을 편하게 만드는 매력이 있어. 다만 편한 걸 좇다 늘어지기 쉬운데, 꾸준함만 지키면 재능이 확 살아나."},
  상관:{key:"상관",label:"창의와 재능",desc:"틀을 깨는 창의의 기운이야. 머리가 빠르고 말재주, 손재주가 뛰어나. 남들이 못 보는 걸 만들어내는 재능이 있어. 대신 기존 질서나 권위랑 부딪히기 쉽고, 말이 앞서면 구설에 오르니 조심해야 해."},
  편재:{key:"편재",label:"기회와 확장",desc:"큰 판을 보는 재물의 기운이야. 돈 냄새를 잘 맡고, 기회를 포착하는 감각이 뛰어나. 활동적이고 사교적이라 사람과 돈이 모여. 다만 벌인 만큼 나가기도 쉬우니, 욕심만 잘 다스리면 끝맺음도 야무져져."},
  정재:{key:"정재",label:"안정과 축적",desc:"착실하게 쌓는 재물의 기운이야. 성실하고 계획적이라, 꾸준한 노력이 확실한 결실로 쌓여. 현실 감각과 관리 능력이 뛰어나. 대신 지나치면 인색해지거나 새로운 도전을 두려워할 수 있어."},
  편관:{key:"편관",label:"도전과 카리스마",desc:"압박을 이겨내는 강단의 기운이야. 위기 앞에서 오히려 강해지고, 결단력과 카리스마가 있어. 책임이 무거운 자리를 감당해내. 대신 스스로를 몰아붙이다 지치기 쉽고, 욱하는 성질을 다스려야 해."},
  정관:{key:"정관",label:"명예와 책임",desc:"원칙과 명예의 기운이야. 규칙을 지키고 책임을 다하는 반듯함이 있어. 조직과 사회에서 신뢰받고 자리를 잡는 힘이 강해. 대신 지나치면 융통성이 없고, 체면에 얽매여 스스로를 옭아맬 수 있어."},
  편인:{key:"편인",label:"직관과 재충전",desc:"남다른 직관의 기운이야. 독특한 관점으로 세상을 보고, 한 분야를 깊이 파고들어. 예술, 학문, 영성 쪽 감각이 뛰어나. 대신 생각이 많아 실행이 늦고, 혼자만의 세계에 빠지기 쉬워."},
  정인:{key:"정인",label:"배움과 보호",desc:"받아들이고 품는 기운이야. 배움이 깊고, 어질고 따뜻해서 주변의 신뢰와 도움을 받아. 문서, 자격, 학문 운이 좋아. 대신 의존적이 되거나, 받는 데 익숙해져 결단이 늦어질 수 있어."},
};
function analyzeSibsong(pillars, noTime){
  const cnt={};
  const cols=noTime?pillars.slice(0,3):pillars;
  cols.forEach(p=>{
    for(const s of [p.gan.sibsong,p.ji.sibsong]){
      if(s&&s!=="일간") cnt[s]=(cnt[s]||0)+1;
    }
  });
  // 개수 많은 순 상위 3개
  const sorted=Object.entries(cnt).sort((a,b)=>b[1]-a[1]);
  const top=sorted.slice(0,3).map(([name,n])=>({...(SIBSONG_CHAR[name]||{key:name,label:name,desc:""}),count:n}));
  return {counts:cnt, top};
}

function calcLifePath(y,m,d){
  const s=[...String(y),...String(m).padStart(2,"0"),...String(d).padStart(2,"0")].map(Number).reduce((a,b)=>a+b,0);
  let n=s;
  while(n>9&&![11,22,33].includes(n))n=String(n).split("").reduce((a,b)=>a+parseInt(b),0);
  return{lp:n,calc:`${[...String(y),...String(m).padStart(2,"0"),...String(d).padStart(2,"0")].join("+")}=${s}→${n}`};
}

const CITY_OFFSET={"서울":-2,"부산":3,"대구":0,"인천":-3,"광주":-11,"대전":-5,"울산":4,"세종":-5,"경기":-2,"강원":4,"충북":-4,"충남":-7,"전북":-10,"전남":-12,"경북":2,"경남":1,"제주":-19,"경북 경산":-25,"경북 포항":5,"경북 구미":-3,"경북 안동":0,"경남 창원":0,"경남 진주":-4,"전남 순천":-10,"전북 전주":-10};
// 한국 표준시(동경 135도) - 실제 국토 중심(동경 127.5도) = 30분. 모든 출생시각에서 30분을 뺀다.
const STANDARD_TIME_OFFSET=-30;

// ━━━━━━━━━━ 별자리(점성술) 로컬 계산 ━━━━━━━━━━
const ZODIAC_ORDER=["양자리","황소자리","쌍둥이자리","게자리","사자자리","처녀자리","천칭자리","전갈자리","사수자리","염소자리","물병자리","물고기자리"];
// 태양별자리: 날짜로 100% 정확
function calcSunSign(month, day){
  const table={1:["염소자리","물병자리",20],2:["물병자리","물고기자리",19],3:["물고기자리","양자리",21],
    4:["양자리","황소자리",20],5:["황소자리","쌍둥이자리",21],6:["쌍둥이자리","게자리",22],
    7:["게자리","사자자리",23],8:["사자자리","처녀자리",23],9:["처녀자리","천칭자리",23],
    10:["천칭자리","전갈자리",23],11:["전갈자리","사수자리",22],12:["사수자리","염소자리",22]};
  const [before,after,bound]=table[month]||table[1];
  return day<bound?before:after;
}
// 달별자리: 간이 계산 (평균 이동 기반 근사, 정확도 약 80~90%)
function calcMoonSign(year, month, day, hour){
  const jdn=(y,m,d)=>{const a=Math.floor((14-m)/12);const yy=y+4800-a;const mm=m+12*a-3;
    return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;};
  const days=jdn(year,month,day)-jdn(2000,1,6)+((hour||12)/24);
  let lon=(118.0+13.176396*days)%360;
  if(lon<0)lon+=360;
  const idx=Math.floor(lon/30)%12;
  return ZODIAC_ORDER[idx];
}
// 상승별자리(ASC): 시간+장소 필요. 간이 계산
function calcAscSign(sunSign, hour, minute){
  const sunIdx=ZODIAC_ORDER.indexOf(sunSign);
  if(sunIdx<0)return null;
  const t=(hour||0)+((minute||0)/60);
  const shift=Math.floor((((t-6+24)%24))/2);
  return ZODIAC_ORDER[(sunIdx+shift)%12];
}
const ZODIAC_DESC={
  "양자리":{sun:"불꽃 같은 추진력을 타고났어. 하고 싶은 게 생기면 앞뒤 안 재고 돌진하는 순수한 에너지야. 시작하는 힘은 열두 별자리 중 최고라, 남들이 재고 망설이는 사이에 이미 저질러버려. 경쟁이 붙으면 눈빛부터 달라지고, 지는 걸 못 견뎌서 어떻게든 앞서 나가. 대신 마무리에서 힘이 빠지는 게 약점이야. 불이 확 타올랐다 금세 사그라들듯, 흥미가 식으면 벌여놓은 걸 두고 다음으로 넘어가버려. 이 열정을 끝까지 끌고 가는 뒷심만 붙으면 누구도 못 막는 사람이 돼.",moon:"감정이 즉각적이고 솔직해. 화도 빨리 나고 푸는 것도 빨라서, 속에 담아두질 못하는 대신 뒤끝은 없어. 기분이 표정과 행동에 그대로 드러나서 숨기질 못해. 답답하게 억눌리는 상황이나 관계에선 금방 숨이 막혀. 자유롭게 움직이고 즉흥적으로 부딪힐 때 마음이 살아나는 구조야. 다만 욱하는 순간의 말과 행동이 관계를 상하게 할 때가 있으니, 화가 확 올라올 때 딱 몇 초만 멈추는 연습이 이 별의 평생 숙제야.",asc:"첫인상이 강렬하고 에너지가 넘쳐 보여. 어딜 가나 존재감이 확 드러나고, 걸음걸이나 말투에서 자신감이 뿜어져 나와. 처음 보는 사람도 활기찬 사람이라는 인상을 받아. 눈치 보지 않고 먼저 다가가는 시원시원함이 매력이라, 사람들이 쉽게 마음을 열어. 다만 그 강한 기운이 가끔은 부담스럽거나 성급해 보일 수 있어. 속도를 살짝만 늦추면 강렬함에 여유까지 더해져서 훨씬 편하게 다가가는 사람이 돼."},
  "황소자리":{sun:"뚝심과 끈기의 별이야. 한번 정하면 우직하게 밀고 나가고, 쉽게 흔들리지 않는 단단함이 있어. 변화를 싫어하는 대신 하나를 오래 쌓아 올리는 힘은 누구도 못 따라와. 눈에 보이고 손에 잡히는 실속을 중요하게 여겨서, 헛된 걸 좇지 않고 현실적으로 움직여. 감각이 예민해서 좋은 것, 편안한 것을 알아보는 안목도 뛰어나. 대신 한번 굳으면 고집이 되고, 익숙한 자리에 머무르려다 기회를 놓칠 때가 있어. 가끔은 안전지대 밖으로 한 발 내딛는 용기가 이 별을 더 크게 키워.",moon:"감정이 느긋하고 안정적이야. 웬만해선 흔들리지 않는 대신, 한번 삐지거나 서운하면 오래가는 편이야. 갑작스러운 변화나 불안정한 상황에선 유독 스트레스를 받아. 편안하고 익숙한 환경, 안정된 관계 속에서 마음이 채워지는 구조야. 먹는 것, 만지는 것, 포근한 공간처럼 실제 감각에서 위로를 받아. 다만 감정을 안으로 쌓아두다 무거워질 수 있으니, 좋아하는 사람한테 속마음을 조금씩 꺼내놓는 게 마음을 가볍게 하는 법이야.",asc:"차분하고 믿음직한 인상을 줘. 서두르지 않는 여유가 상대를 편하게 만들고, 옆에 있으면 이상하게 안정감이 느껴지는 타입이야. 말이나 행동이 진중해서 신뢰가 빨리 쌓여. 화려하게 튀진 않아도 은근히 감각 있는 분위기가 배어나와. 처음엔 다가가기 조금 어려워 보여도, 한번 마음을 열면 오래 곁을 지키는 사람이라는 게 전해져. 그 한결같음이 시간이 갈수록 더 큰 매력이 돼."},
  "쌍둥이자리":{sun:"머리 회전이 빠르고 호기심이 끝이 없어. 말재주와 재치가 무기라, 어떤 자리에서도 대화를 살리고 분위기를 가볍게 만들어. 새로운 정보와 자극을 먹고 사는 사람이라 배우고 연결하고 퍼뜨리는 일에 강해. 여러 가지를 동시에 다루는 멀티 능력도 뛰어나. 대신 관심이 자주 옮겨가서 한 우물을 깊게 파는 게 숙제야. 흥미가 식으면 금방 다른 데로 눈을 돌려서, 벌인 걸 끝맺는 힘이 약해. 산만한 에너지를 한 방향으로만 모으면 재능이 진짜 실력으로 바뀌어.",moon:"감정이 머리로 먼저 가. 느끼기 전에 분석부터 하는 편이라, 스스로도 자기 감정을 헷갈려할 때가 있어. 같은 자리에 오래 머무는 걸 못 견뎌서, 변화와 새로운 자극이 있어야 마음이 살아나. 답답하고 반복되는 일상에선 금방 지루해져. 말로 풀고 대화로 정리할 때 감정이 소화되는 구조라, 속을 털어놓을 대화 상대가 꼭 필요해. 다만 생각이 너무 많아지면 불안으로 번지니, 머릿속을 비우고 몸을 움직이는 시간이 균형을 잡아줘.",asc:"밝고 사교적인 인상이야. 말을 잘 걸고 분위기를 가볍게 만드는 재주가 있어서, 처음 보는 사람과도 금방 편해져. 표정이 살아있고 반응이 빨라서 함께 있으면 지루할 틈이 없어. 어려 보이고 트렌디한 분위기를 풍기는 것도 이 별의 특징이야. 다만 관심사가 자주 바뀌어서 종잡을 수 없어 보이거나 가벼워 보일 수도 있어. 한 사람, 한 주제에 진득하게 집중하는 모습을 보여주면 재치에 깊이까지 더해져."},
  "게자리":{sun:"정이 많고 품이 넓은 별이야. 내 사람이라고 정한 사람은 끝까지 챙기고 지키는 따뜻함이 있어. 공감 능력이 깊어서 남의 아픔을 그냥 지나치질 못해. 가족이나 가까운 사람을 향한 마음이 유독 각별하고, 그들을 위해서라면 강해지는 사람이야. 감수성이 풍부한 만큼 상처도 깊게 받는 게 약점이야. 서운한 걸 담아두고 혼자 곱씹다 마음이 무거워지곤 해. 그 여린 마음을 지키려면 모두를 품으려 하기보다, 진짜 내 사람에게 에너지를 아끼는 지혜가 필요해.",moon:"감정의 깊이가 남달라. 공감 능력이 뛰어나서 가까운 사람의 기분을 그대로 흡수하고, 분위기만으로도 상대의 마음을 읽어. 안전한 울타리 안에서 마음이 놓이는 구조라, 편안한 집과 믿을 수 있는 사람이 곁에 있을 때 가장 안정돼. 감정 기복이 달의 위상처럼 오르내려서, 이유 없이 가라앉는 날도 있어. 그럴 땐 억지로 밝으려 하지 말고, 나를 이해해주는 사람 곁에서 쉬는 게 약이야. 마음을 나눌 안전한 관계 하나가 이 별에겐 세상 전부야.",asc:"부드럽고 다정한 인상이야. 처음엔 낯을 가리고 조심스러워 보여도, 한번 마음을 열면 따뜻하게 품어주는 사람이라는 게 느껴져. 상대를 편하게 배려하는 세심함이 자연스럽게 배어나와. 눈빛이나 표정에 정이 담겨 있어서 사람들이 무의식적으로 기대게 돼. 다만 낯선 자리에선 방어적으로 보일 수 있어. 그 조심스러움 안에 얼마나 깊은 정이 있는지 알아봐 주는 사람에게, 이 별은 평생의 곁을 내줘."},
  "사자자리":{sun:"타고난 주인공이야. 빛나는 자리가 어울리고, 사람을 끌어당기고 이끄는 카리스마가 있어. 당당하고 자존심이 강해서 위축되기보다 정면으로 부딪히는 걸 택해. 한번 마음먹으면 화끈하게 밀어붙이고, 사람에게도 아낌없이 베푸는 큰 그릇이야. 인정받고 싶은 욕구가 크다는 게 특징이자 약점이라, 반응이 없거나 무시당하면 유독 크게 상처받아. 그 인정을 밖에서만 찾다 보면 휘둘리기 쉬워. 스스로 자기 가치를 알아주는 순간, 이 별은 누구보다 단단하고 눈부시게 빛나.",moon:"감정 표현이 화려하고 당당해. 사랑도 크게 주고 크게 받길 원하는 뜨거운 마음이야. 인정받고 주목받을 때 마음이 가장 충만해지고, 반대로 무시당하거나 존재감이 흐려질 때 깊이 위축돼. 자존심이 감정의 핵심이라, 자존심이 상하면 겉으론 당당한 척해도 속으론 오래 앓아. 좋아하는 사람 앞에선 숨김없이 표현하는 솔직함이 매력이야. 다만 인정 욕구가 클수록 상처도 커지니, 남의 박수가 아니라 스스로의 만족에서 채워지는 법을 익히면 훨씬 편안해져.",asc:"화려하고 당당한 인상이야. 가만히 있어도 눈길이 가는 존재감을 뿜어내고, 자세나 표정에서 자신감이 자연스럽게 드러나. 사람들 앞에 서는 게 어색하지 않아서, 어느 자리에 가든 중심으로 끌려 들어가는 타입이야. 밝고 시원시원한 매력이 사람을 끌어당겨. 다만 그 당당함이 가끔은 세 보이거나 부담스러워 보일 수 있어. 강한 인상 뒤에 따뜻하고 여린 면을 살짝 내비치면, 화려함에 인간미까지 더해져서 훨씬 사랑받아."},
  "처녀자리":{sun:"섬세하고 완벽을 추구하는 별이야. 디테일을 놓치지 않고, 뭐든 제대로 해내려는 성실함이 몸에 배어 있어. 문제를 분석하고 정리하고 개선하는 능력이 탁월해서, 어디서든 없으면 안 되는 사람이 돼. 남을 돕고 실질적으로 챙기는 데서 보람을 느끼는 따뜻함도 있어. 대신 자신한테도 남한테도 지나치게 엄격한 게 약점이야. 작은 흠도 그냥 못 넘겨서 스스로를 몰아붙이다 지쳐. 완벽하지 않아도 괜찮다는 걸 받아들이는 순간, 이 별의 유능함이 여유까지 갖추게 돼.",moon:"감정을 분석하고 정리하려 해. 느끼는 대로 두기보다 왜 이런 기분인지 따지는 편이라, 걱정이 많고 예민해. 그만큼 주변을 세심하게 챙기고 미리 대비하는 힘이 강해. 정돈되고 예측 가능한 환경에서 마음이 안정되는 구조라, 어수선하거나 통제 안 되는 상황에선 불안이 커져. 스스로를 향한 잔소리가 유독 심해서, 잘하고도 부족하다고 느끼곤 해. 그럴 땐 스스로에게 이만하면 충분하다고 말해주는 연습이 이 별의 마음을 지켜줘.",asc:"단정하고 깔끔한 인상이야. 빈틈없어 보이면서도 은근히 친근한 매력이 있어서 신뢰가 빨리 쌓여. 말과 행동에 군더더기가 없고, 상대를 세심하게 배려하는 게 자연스럽게 드러나. 차분하고 정돈된 분위기가 믿을 만한 사람이라는 인상을 줘. 다만 완벽해 보이려는 긴장이 상대에게 살짝 거리감을 줄 수도 있어. 조금 흐트러진 모습이나 솔직한 실수를 편하게 내보이면, 완벽함에 인간적인 친근함까지 더해져서 사람들이 더 편하게 다가와."},
  "천칭자리":{sun:"균형과 조화의 별이야. 사람 사이를 매끄럽게 조율하고, 어느 한쪽으로 치우치지 않으려는 공정함이 있어. 미적 감각이 뛰어나서 아름다운 것, 세련된 것을 알아보고 만들어내는 재능이 있어. 혼자보다 함께일 때 빛나는 관계 지향형이라, 파트너십이 삶의 중요한 축이야. 대신 결정을 못 내리고 재기만 하는 게 약점이야. 모두를 만족시키려다 정작 내가 뭘 원하는지 놓칠 때가 있어. 남의 눈치보다 내 기준을 먼저 세우는 연습을 하면, 조화로움에 중심까지 생겨.",moon:"관계 속에서 마음이 안정돼. 갈등을 싫어하고 평화를 지키려는 성향이 강해서, 부딪힐 상황을 미리 피하거나 맞춰주는 편이야. 혼자 있는 것보다 마음 맞는 사람과 함께일 때 편안해지는 구조야. 공정하지 못한 상황이나 험한 분위기에 유독 예민하게 반응해. 다만 갈등을 피하려다 자기감정을 뒤로 미루는 게 문제야. 참고 맞춰주다 어느 순간 서운함이 쌓여. 불편한 마음도 부드럽게 표현하는 법을 익히면 관계도 나도 함께 지킬 수 있어.",asc:"세련되고 우아한 인상이야. 부드러운 매너와 균형 잡힌 분위기로 상대를 편하게 만드는 재주가 있어. 표정이나 말투에 은은한 품위가 배어 있어서 첫인상에서 호감을 쉽게 얻어. 사람을 대하는 태도가 공평하고 친절해서 적을 잘 안 만들어. 다만 모두에게 좋게 보이려다 속을 알기 어려워 보일 수 있어. 가끔은 내 취향과 의견을 분명히 드러내면, 우아함에 진솔함까지 더해져서 훨씬 매력적인 사람이 돼."},
  "전갈자리":{sun:"강렬하고 깊이 있는 별이야. 한번 빠지면 끝을 보는 몰입력과, 겉으론 차분해도 속엔 뜨거운 게 끓는 이중성이 있어. 통찰력이 날카로워서 표면 아래 숨은 진짜를 꿰뚫어 봐. 어설픈 관계나 얕은 관심엔 흥미가 없고, 전부를 걸 만한 깊은 연결을 원해. 감정과 의지가 강한 만큼 집착이나 극단으로 흐를 수 있는 게 약점이야. 상처받으면 오래 담아두고, 배신엔 냉정하게 돌아서. 그 강한 에너지를 파괴가 아니라 몰입과 재생의 방향으로 쓰면 누구보다 깊고 단단한 사람이 돼.",moon:"감정이 깊고 강렬해. 쉽게 드러내지 않지만 한번 마음을 주면 전부를 거는 사람이야. 신뢰가 감정의 핵심이라, 믿음이 쌓이면 끝까지 지키지만 신뢰가 무너지면 돌아서는 것도 확실해. 속을 잘 안 보여줘서 가까운 사람도 그 깊이를 다 알기 어려워. 감정을 안으로 삭이다 혼자 무거워지는 경우가 많아. 위기나 극한의 상황에서 오히려 침착해지는 강함도 있어. 그 깊은 마음을 안전하게 털어놓을 단 한 사람이 있으면, 이 별은 비로소 편안해져.",asc:"신비롭고 묘한 인상이야. 쉽게 속을 안 보여줘서 더 끌리는 타입이라, 첫인상부터 궁금증을 자아내. 눈빛에 힘이 있고, 말수가 적어도 존재감이 묵직해. 가볍게 다가오는 사람에겐 벽을 두지만, 진심이 느껴지는 사람에겐 서서히 깊이를 내줘. 다만 그 경계심이 차갑거나 다가가기 어려워 보일 수 있어. 가끔 먼저 마음을 살짝 열어 보이면, 신비로움에 따뜻함까지 더해져서 사람을 강하게 붙잡는 매력이 돼."},
  "사수자리":{sun:"자유와 모험의 별이야. 넓은 세상을 향한 갈망이 커서, 익숙한 자리에 머무는 걸 못 견뎌. 낙천적이고 솔직해서 마음에 담아두는 게 없고, 어디서든 긍정적인 기운을 퍼뜨려. 새로운 경험과 배움, 여행과 도전에서 살아나는 사람이야. 큰 그림을 그리고 의미를 좇는 철학적인 면도 있어. 대신 얽매이는 걸 못 견디고, 세부적인 것과 마무리에 약한 게 약점이야. 벌인 일을 두고 다음 모험으로 떠나버리곤 해. 자유를 지키되 책임까지 끌어안으면, 이 별의 낙천이 진짜 지혜가 돼.",moon:"감정이 낙천적이고 시원시원해. 우울해도 금방 털고 일어나는 회복력이 있어서, 무거운 감정을 오래 붙들지 않아. 새로운 경험과 자유가 보장될 때 마음이 살아나는 구조라, 갇히고 통제받는 상황에선 숨이 막혀. 솔직해서 감정을 숨기지 못하는데, 가끔 그 직설이 상대에게 상처가 될 수도 있어. 답답할 땐 훌쩍 떠나거나 몸을 움직여야 풀리는 타입이야. 다만 가벼워 보이는 낙천 뒤에 외로움이 숨을 수 있으니, 진짜 속마음을 나눌 사람도 곁에 둬야 해.",asc:"밝고 활기찬 인상이야. 스스럼없이 다가가는 친화력으로 어딜 가나 잘 어울리고, 함께 있으면 기분이 가벼워지는 사람이야. 솔직하고 유쾌한 말투가 벽을 금방 허물어. 자유로운 분위기와 열린 태도가 사람들을 편하게 만들어. 다만 그 솔직함이 가끔은 조심성 없어 보이거나 산만해 보일 수 있어. 상대의 속도에 맞춰 한 박자 기다려주는 세심함을 더하면, 활기에 배려까지 갖춰져서 훨씬 신뢰받는 사람이 돼."},
  "염소자리":{sun:"책임감과 인내의 별이야. 목표를 향해 묵묵히 오르는 등산가 기질이라, 느려도 결국 정상에 서는 사람이야. 현실적이고 계획적이어서, 헛된 꿈보다 실현 가능한 목표를 하나씩 이뤄가. 참을성과 자기 관리가 뛰어나서 긴 승부에 강해. 사회적 성취와 인정에서 삶의 의미를 찾는 편이야. 대신 감정 표현이 서툴고, 자신을 몰아붙이며 쉬는 걸 죄처럼 느끼는 게 약점이야. 책임을 혼자 다 지려다 어깨가 무거워져. 가끔은 힘을 빼고 지금을 즐기는 여유가 이 별의 단단함을 더 오래가게 해.",moon:"감정을 잘 드러내지 않고 안으로 삼켜. 진중하고 무게감 있어 보이지만, 속으로는 외로움과 부담을 많이 지고 사는 편이야. 성취하고 인정받을 때 안정을 느끼는 구조라, 스스로에게 요구하는 기준이 늘 높아. 약한 모습을 보이는 걸 자존심이 허락하지 않아서, 힘들어도 혼자 버티다 곪을 때가 있어. 감정보다 책임을 앞세우다 정작 자기 마음을 놓치기 쉬워. 믿을 수 있는 사람 앞에서만이라도 무거운 걸 내려놓고 기대는 연습이, 이 별에겐 꼭 필요한 회복이야.",asc:"진중하고 어른스러운 인상이야. 쉽게 흔들리지 않는 단단함이 신뢰를 주고, 나이보다 성숙해 보이는 무게감이 있어. 말과 행동이 신중해서 함부로 대하기 어려운 분위기를 자연스럽게 풍겨. 책임감 있어 보여서 일과 관계 모두에서 믿음을 빨리 얻어. 다만 그 진지함이 딱딱하거나 다가가기 어려워 보일 수 있어. 가끔 웃음이나 농담으로 틈을 보이면, 그 반전이 상대를 확 무장 해제시켜서 훨씬 친근한 사람이 돼."},
  "물병자리":{sun:"독창적이고 자유로운 별이야. 남들과 다른 시선으로 세상을 보고, 틀에 갇히는 걸 거부하는 개성이 뚜렷해. 관습에 얽매이지 않고 왜 꼭 그래야 하냐고 묻는 혁신가 기질이 있어. 사람을 편견 없이 대하고, 넓은 인류애와 공동체 감각도 강해. 지적 호기심이 많아 늘 새로운 아이디어를 좇아. 대신 감정보다 이성이 앞서서 거리를 두는 것처럼 보이는 게 약점이야. 독특함을 고집하다 외따로 떨어질 수도 있어. 자유로움에 따뜻한 연결까지 더하면, 이 별의 개성이 진짜 영향력이 돼.",moon:"감정을 객관적으로 봐. 한 발 떨어져 관찰하는 편이라 차가워 보이기도 하지만, 실은 감정에 휩쓸리지 않으려는 자기 방어야. 자유와 독립이 보장될 때 마음이 편해지는 구조라, 속박하거나 지나치게 밀착하는 관계엔 숨이 막혀. 남들과 다른 자기만의 방식을 존중받고 싶은 마음이 커. 감정을 표현하기보다 머리로 이해하려다, 정작 자기 기분을 놓칠 때가 있어. 이성으로만 다루지 말고 가끔은 그냥 느끼도록 허락하는 게, 이 별의 마음을 자유롭게 해.",asc:"독특하고 개성 있는 인상이야. 어딘가 남다른 분위기로 사람들의 호기심을 끌고, 흔한 틀에 안 갇히는 자유로움이 매력이야. 편견 없이 사람을 대해서 누구와도 스스럼없이 어울려. 쿨하고 시원한 태도가 세련돼 보여. 다만 그 거리감이 정 없어 보이거나 속을 알기 어려워 보일 수 있어. 가끔 따뜻한 관심이나 사적인 마음을 살짝 내비치면, 개성에 인간미까지 더해져서 사람들이 더 가깝게 느껴."},
  "물고기자리":{sun:"감수성과 상상력의 별이야. 공감 능력이 깊고 예술적 기질이 강해서, 남이 못 느끼는 결까지 섬세하게 잡아내. 경계가 흐릿해서 타인의 감정에 쉽게 스며들고, 그만큼 따뜻하게 품어주는 힘이 있어. 현실 너머의 아름다움과 의미를 좇는 몽상가이자, 상처받은 사람을 그냥 지나치지 못하는 치유자야. 대신 그 경계 없음이 약점이라, 남의 감정에 휩쓸리다 나를 잃기 쉬워. 현실을 회피하거나 우유부단해질 때도 있어. 여린 마음을 지킬 나만의 울타리를 세우면, 감수성이 진짜 재능으로 피어나.",moon:"감정이 바다처럼 깊고 넓어. 타인의 아픔을 내 것처럼 느끼는 공감력이 강해서, 주변 분위기를 그대로 흡수해버려. 꿈과 예술, 음악과 물처럼 부드러운 것 속에서 마음이 치유되는 구조야. 감정의 파도가 크게 오르내려서, 이유 없이 벅차거나 가라앉는 날이 많아. 상처를 오래 담아두고 혼자 삭이는 경향도 있어. 남의 감정과 내 감정이 뒤섞여 지칠 땐, 잠시 혼자만의 고요 속으로 들어가 나를 비워내는 시간이 꼭 필요해. 그게 이 별의 회복법이야.",asc:"부드럽고 몽환적인 인상이야. 어딘가 신비롭고 포근한 분위기로 사람을 끌어당기고, 함께 있으면 마음이 편안해지는 사람이야. 눈빛이 따뜻하고 상대를 잘 받아줘서, 사람들이 무장 해제되고 속마음을 털어놓게 돼. 예술적이고 감성적인 기운이 자연스럽게 배어나와. 다만 그 부드러움이 우유부단하거나 경계 없어 보일 수 있어. 가끔 분명한 태도나 선을 보여주면, 몽환적인 매력에 단단함까지 더해져서 훨씬 신뢰받는 사람이 돼."}
};
function buildAstro(year, month, day, hour, minute, noTime){
  const sun=calcSunSign(month, day);
  const moon=calcMoonSign(year, month, day, hour);
  const asc=noTime?null:calcAscSign(sun, hour, minute);
  return { sun, moon, asc,
    sunDesc:ZODIAC_DESC[sun]?.sun||"", moonDesc:ZODIAC_DESC[moon]?.moon||"",
    ascDesc:asc?(ZODIAC_DESC[asc]?.asc||""):"" };
}

function buildSajuData(input){
  const{name,year:ys,month:ms,day:ds,hour:hs,minute:mns="0",gender,city}=input;
  const y=parseInt(ys),m=parseInt(ms),d=parseInt(ds);
  const rawH=parseInt(hs),rawM=parseInt(mns);
  const _cityOff = CITY_OFFSET[city] ?? CITY_OFFSET[String(city || "").split(" ")[0]] ?? 0;
  const offset=_cityOff+STANDARD_TIME_OFFSET;
  const totalMin=rawH*60+rawM+offset;
  // 보정으로 자정을 넘겨 전날로 밀리면 날짜도 하루 당겨서 계산
  const dayShift=Math.floor(totalMin/1440);
  const _corr=new Date(y,m-1,d+dayShift);
  const cy=_corr.getFullYear(),cm=_corr.getMonth()+1,cd=_corr.getDate();
  const h=Math.floor(((totalMin%1440)+1440)%1440/60);
  const corrMin=((totalMin%1440)+1440)%1440;

  const yeonju=calcYeonju(cy,cm,cd);
  const monthJi=getMonthJi(cm,cd);
  const wolju=calcWolju(yeonju.gan.ko,monthJi);
  const bnd=calcBnd(cy,cm,cd,h,corrMin%60);
  const ilju=bnd.std;
  const iljuB=bnd.mid;
  const siJi=getTimeJi(h);
  const siju=calcSiju(ilju.gan.ko,siJi);
  const sijuB=calcSiju(iljuB.gan.ko,siJi);

  const mkG=(gko,ghanja,ilg)=>({ko:gko,hanja:ghanja,sibsong:getSibsong(ilg,gko,true)});
  const mkJ=(jko,jhanja,ilg)=>({ko:jko,hanja:jhanja,sibsong:getSibsong(ilg,jko,false)});
  const ilgan=ilju.gan.ko,ilganB=iljuB.gan.ko;

  const pillars=[
    {name:"연주",gan:mkG(yeonju.gan.ko,yeonju.gan.hanja,ilgan),ji:mkJ(yeonju.ji.ko,yeonju.ji.hanja,ilgan)},
    {name:"월주",gan:mkG(wolju.gan.ko,wolju.gan.hanja,ilgan),ji:mkJ(wolju.ji.ko,wolju.ji.hanja,ilgan)},
    {name:"일주",gan:{ko:ilgan,hanja:ilju.gan.hanja,sibsong:"일간"},ji:mkJ(ilju.ji.ko,ilju.ji.hanja,ilgan)},
    {name:"시주",gan:mkG(siju.gan.ko,siju.gan.hanja,ilgan),ji:mkJ(siju.ji.ko,siju.ji.hanja,ilgan)},
  ];
  const pillarsB=[
    {name:"연주",gan:mkG(yeonju.gan.ko,yeonju.gan.hanja,ilganB),ji:mkJ(yeonju.ji.ko,yeonju.ji.hanja,ilganB)},
    {name:"월주",gan:mkG(wolju.gan.ko,wolju.gan.hanja,ilganB),ji:mkJ(wolju.ji.ko,wolju.ji.hanja,ilganB)},
    {name:"일주",gan:{ko:ilganB,hanja:iljuB.gan.hanja,sibsong:"일간"},ji:mkJ(iljuB.ji.ko,iljuB.ji.hanja,ilganB)},
    {name:"시주",gan:mkG(sijuB.gan.ko,sijuB.gan.hanja,ilganB),ji:mkJ(sijuB.ji.ko,sijuB.ji.hanja,ilganB)},
  ];

  const ohaengDist=calcOhaengDist(pillars);
  const ilO=normO(GAN_OE[ilgan]);
  const monthO=normO(JI_OE[wolju.ji.ko]);
  const genCycle={木:"火",火:"土",土:"金",金:"水",水:"木"};
  // ━ 신강/신약: 월령만이 아니라 여덟 글자를 가중 합산 ━
  //   일간을 돕는 기운(비겁=같은 오행, 인성=일간을 생하는 오행) vs 빼앗는 기운(식상·재·관)
  const helpsIl=o=>(o===ilO)||(genCycle[o]===ilO); // 비겁 or 인성
  const support=(()=>{
    let s=0;
    pillars.forEach(p=>{
      const go=normO(GAN_OE[p.gan.ko]),jo=normO(JI_OE[p.ji.ko]);
      if(helpsIl(go))s++;
      if(helpsIl(jo))s++;
    });
    // 월령(月支)은 영향이 커서 가중치 +1
    if(helpsIl(monthO))s++;
    return s;
  })();
  const totalSlots=8+1; // 8글자 + 월령 가중
  const monthHelps=support>=Math.ceil(totalSlots/2); // 과반이면 신강
  const singang=monthHelps?"신강(身强)":"신약(身弱)";
  // 주역 상괘용: 일간 오행 1개 제외 후 최다 오행
  const domOForIching=(()=>{
    const excl={...ohaengDist};
    if(excl[ilO]>0) excl[ilO]--;
    const sorted=Object.entries(excl).sort((a,b)=>b[1]-a[1]||["水","木","火","土","金"].indexOf(a[0])-["水","木","火","土","金"].indexOf(b[0]));
    return sorted[0][0];
  })();

  const noTime=input?.noTime===true;
  const sinsal=calcSinsal(ilgan,yeonju.ji.ko,wolju.ji.ko,ilju.ji.ko,siJi,noTime);

  // 12신살 (연지 기준 삼합국) — 각 기둥 지지에 배치
  const _yJi=yeonju.ji.ko;
  const sinsal12=[
    {pos:"연지",label:"조상, 초년",ji:_yJi,name:calc12Sinsal(_yJi,_yJi)},
    {pos:"월지",label:"부모, 청년",ji:wolju.ji.ko,name:calc12Sinsal(_yJi,wolju.ji.ko)},
    {pos:"일지",label:"자신, 중년",ji:ilju.ji.ko,name:calc12Sinsal(_yJi,ilju.ji.ko)},
    ...(noTime?[]:[{pos:"시지",label:"자녀, 말년",ji:siJi,name:calc12Sinsal(_yJi,siJi)}]),
  ].filter(s=>s.name).map(s=>({...s,...(SINSAL12_DESC[s.name]||{})}));

  // 12운성 (일간 기준 각 지지)
  const _stage=(jji)=>{const st=getStage(ilgan,jji);return st;};
  const unseong12=[
    {pos:"연지",label:"조상, 초년",ji:_yJi,stage:_stage(_yJi)},
    {pos:"월지",label:"부모, 청년",ji:wolju.ji.ko,stage:_stage(wolju.ji.ko)},
    {pos:"일지",label:"자신, 중년",ji:ilju.ji.ko,stage:_stage(ilju.ji.ko)},
    ...(noTime?[]:[{pos:"시지",label:"자녀, 말년",ji:siJi,stage:_stage(siJi)}]),
  ].filter(s=>s.stage).map(s=>({...s,...(STAGE12_DESC[s.stage]||{})}));


  const yearGanYang=isYang(yeonju.gan.ko);
  const forward=(yearGanYang&&gender==="남")||(!yearGanYang&&gender==="여");
  // ━━ 대운 시작 나이 (표준 만세력 공식) ━━
  //   순행: 생일 → 다음 절입(節入)까지 날수 ÷ 3
  //   역행: 직전 절입 → 생일까지 날수 ÷ 3
  //   (날수 3일 = 대운 1년, 1일 = 4개월)
  const calcDaeunStartAge=(()=>{
    // 12절기(월의 시작) 양력 근사일: 입춘(2/4)~소한(1/6)
    // [월, 일] 인월 시작=입춘(2/4), 묘월=경칩(3/6)...
    const JEOLIP=[
      [2,4],   // 입춘 → 인월
      [3,6],   // 경칩 → 묘월
      [4,5],   // 청명 → 진월
      [5,6],   // 입하 → 사월
      [6,6],   // 망종 → 오월
      [7,7],   // 소서 → 미월
      [8,8],   // 입추 → 신월
      [9,8],   // 백로 → 유월
      [10,8],  // 한로 → 술월
      [11,7],  // 입동 → 해월
      [12,7],  // 대설 → 자월
      [1,6],   // 소한 → 축월
    ];
    const birth=new Date(cy,cm-1,cd);
    const MS=1000*60*60*24;
    // 출생일 기준 직전/직후 절입일 찾기
    const candidates=[];
    for(let yy=cy-1;yy<=cy+1;yy++){
      for(const [jm,jd] of JEOLIP){
        candidates.push(new Date(yy,jm-1,jd));
      }
    }
    candidates.sort((a,b)=>a-b);
    let prevJeol=null,nextJeol=null;
    for(const c of candidates){
      if(c<=birth) prevJeol=c;
      if(c>birth && !nextJeol) nextJeol=c;
    }
    let distDays;
    if(forward){
      distDays=Math.round((nextJeol-birth)/MS);
    } else {
      distDays=Math.round((birth-prevJeol)/MS);
    }
    // 절입 간격은 약 29~31일이므로 distDays는 0~31 범위 → ÷3 = 0~10세
    const age=Math.max(1,Math.round(distDays/3));
    return Math.min(age,10); // 안전 상한
  })();
  const startAge=calcDaeunStartAge;
  const wGi=GL.indexOf(wolju.gan.ko),wJi=JL.indexOf(wolju.ji.ko);
  // 용신/희신/기신 오행 리스트 (대운 역할, 세운 점수에 사용)
  const yongDB0=YONGSIN_TABLE[ilO]||YONGSIN_TABLE["土"];
  const vsKey0=monthHelps?"strong":"weak";
  const parseO=str=>(str||"").replace(/[^가-힣·]/g,"").split("·").map(x=>x.trim()).filter(o=>["목","화","토","금","수"].includes(o));
  const _yongO=parseO(yongDB0[vsKey0].yongsin),_huiO=parseO(yongDB0[vsKey0].huisin),_giO=parseO(yongDB0[vsKey0].gisin);
  const daeun=Array.from({length:6},(_,i)=>{
    const gi=forward?(wGi+i+1)%10:((wGi-i-1+10)%10);
    const ji=forward?(wJi+i+1)%12:((wJi-i-1+12)%12);
    const age=startAge+i*10;
    const dGanKo=GL[gi],dJiKo=JL[ji];
    const ohaeng=normO(GAN_OE[dGanKo])||normO(JI_OE[dJiKo]);
    const dGanO=_GANO[dGanKo]; // 한글 오행
    const fav=_yongO.includes(dGanO)?"도와주는":_giO.includes(dGanO)?"조절이 필요한":"흐름을 바꾸는";
    const sib=getSibsong(ilgan,dGanKo,true);
    const role=SIBSONG_ROLE[sib]||"";
    return{label:dGanKo+dJiKo,hanja:GH[gi]+JH[ji],period:`만 ${age}~${age+9}세`,ohaeng,cur:CY>=cy+age&&CY<cy+age+10,
      desc:`${GH[gi]+JH[ji]}(${dGanKo+dJiKo}) 대운: ${OHK[ohaeng]} 기운이 ${fav} 시기야. ${role}`};
  });

  const{lp,calc}=calcLifePath(y,m,d);

  // ━━ MBTI 동적 계산 (오행비율 + 신강신약 보정 + 자가보고 반영) ━━
  const MBTI_DESC_MAP={
    갑:"목의 리더십 + 강한 추진력: 전략적 사고와 실행력이 강한 타입이야.",
    을:"목의 유연함 + 공감력: 사람과 가능성에서 에너지를 얻는 타입이야.",
    병:"화의 열정 + 외향성: 활기차고 현재를 즐기는 에너지가 넘치는 타입이야.",
    정:"화의 섬세함 + 내향성: 깊은 감성과 이상을 추구하는 타입이야.",
    무:"현실 안정을 추구하며 원칙을 엄격히 지키는 리더 타입이야. 계획 없는 일을 싫어하고 맡은 일은 끝까지 해내.",
    기:"토의 포용 + 관계: 따뜻한 배려와 협력으로 빛나는 타입이야.",
    경:"금의 날카로움 + 독립: 전략적이고 독립적인 완벽주의자 타입이야.",
    신:"금의 섬세함 + 배려: 헌신적이고 실용적인 지원자 타입이야.",
    임:"수의 통찰 + 분석: 논리적이고 독창적인 사상가 타입이야.",
    계:"수의 공감 + 직관: 깊은 통찰과 사명감을 가진 타입이야.",
  };
  // 오행 분포 합계
  const _od=ohaengDist;
  const _total=Object.values(_od).reduce((a,b)=>a+b,0)||1;
  // 목화 vs 금수 비율 → N↔S
  const _mokHwa=((_od["木"]||0)+(_od["火"]||0))/_total;
  const _geumSu=((_od["金"]||0)+(_od["水"]||0))/_total;
  const _yangGan=["갑","병","무","경","임"];
  const _eumGan=["을","정","기","신","계"];
  const _allGan=pillars.map(p=>p.gan.ko); // 4주 천간
  const _yangCnt=_allGan.filter(g=>_yangGan.includes(g)).length;
  const _eumCnt=_allGan.filter(g=>_eumGan.includes(g)).length;
  // 신강→T·S 보정, 신약→F·N 보정
  const _isSingang=singang.includes("신강");
  const _sBonus=_isSingang?0.07:-0.07;

  // ━━ E↔I: 천간 4개, 일간 2배 가중 (총 5점), 양간 비율로 판정 ━━
  // 일간은 "나 자신"이므로 가중치 2배 부여
  const _eYangScore=_allGan.reduce((acc,g,i)=>{
    const w=(i===2)?2:1; // 인덱스2=일간, 2배
    return acc+((_yangGan.includes(g)?w:0));
  },0);
  const _eTotalScore=5; // 일간 2배 포함 항상 5점
  const _eRaw=(_eYangScore/_eTotalScore)*100;
  const _eWins=_eRaw>=50;
  const _eScore=Math.round(Math.min(92,Math.max(52,_eRaw)));

  // N↔S: 목화 vs 금수 오행 비율 + 신강신약 보정
  const _nBase=_mokHwa-_geumSu+_sBonus*-1;
  const _nRaw=(0.55+_nBase*0.6)*100;
  const _nWins=_nRaw>=50;
  const _nScore=Math.round(Math.min(92,Math.max(52,_nRaw)));

  // F↔T: 음간 vs 양간 + 신강신약 보정
  const _fBase=(_eumCnt-_yangCnt)/(_allGan.length||4);
  const _fRaw=(0.5+_fBase*0.5+_sBonus*-1)*100;
  const _fWins=_fRaw>=50;
  const _fScore=Math.round(Math.min(92,Math.max(52,_fRaw)));

  // ━━ J↔P: 일지 십이운성(60%) + 월간 음양(40%) ━━
  const STAGE_JP={
    "장생(長生)":-2,"목욕(沐浴)":-1,"관대(冠帶)":-1,"건록(建祿)":-1,"제왕(帝旺)":-2,
    "태(胎)":-1,"양(養)":-1,
    "쇠(衰)":1,"병(病)":2,"사(死)":2,"묘(墓)":1,"절(絶)":2,
  };
  const _iljiStage=getStage(ilgan,ilju.ji.ko);
  const _stageScore=STAGE_JP[_iljiStage]||0; // -2~+2
  const _monthGanYang=_yangGan.includes(wolju.gan.ko); // 월간 양간=J, 음간=P
  const _monthScore=_monthGanYang?1:-1;
  // 합산: 일지 60% + 월간 40%, 범위 -2~+1.6 → 0~100 변환
  const _jCombined=_stageScore*0.6+_monthScore*0.4;
  const _jRaw=(0.5+_jCombined/6)*100; // 최대 범위 ±3.6이면 충분
  const _jWins=_jRaw>=50;
  const _jScore=Math.round(Math.min(92,Math.max(52,Math.abs(_jRaw-50)+50)));

  // 자가보고 블렌딩 E/I만 20%, 나머지 10%
  const _userMbti=(input?.mbti||"").toUpperCase().trim();
  const _validMbti=/^[EI][NS][FT][JP]$/.test(_userMbti);
  const _blend=(sajuScore,axis,userType,ratio=0.1)=>{
    if(!_validMbti) return sajuScore;
    const userWins=(userType==="E"&&_userMbti[0]==="E")||(userType==="N"&&_userMbti[1]==="N")||
      (userType==="F"&&_userMbti[2]==="F")||(userType==="J"&&_userMbti[3]==="J");
    return Math.round(sajuScore*(1-ratio)+(userWins?75:25)*ratio);
  };
  const _eBlend=_blend(_eScore,"E","E",0.2); // E/I만 20%
  const _nBlend=_blend(_nScore,"N","N",0.1);
  const _fBlend=_blend(_fScore,"F","F",0.1);
  const _jBlend=_blend(_jScore,"J","J",0.1);
  // 최종 MBTI (승패는 원시값 기준)
  const mbtiType=`${_eWins?"E":"I"}${_nWins?"N":"S"}${_fWins?"F":"T"}${_jWins?"J":"P"}`;
  const mbtiDesc=MBTI_DESC_MAP[ilgan]||"사주 교차 분석 중이야.";
  const mbtiAxes=[
    {axis:`${_eWins?"E (외향)":"I (내향)"}`,score:_eBlend>=50?_eBlend:100-_eBlend,
      basis:`사주 4기둥 천간 중 양간 ${_eYangScore}개/5점 (나를 나타내는 일간 ${ilgan} 2배 반영)${_validMbti?", 입력한 MBTI 20% 반영":""}이야.`},
    {axis:`${_nWins?"N (직관)":"S (감각)"}`,score:_nBlend>=50?_nBlend:100-_nBlend,
      basis:`사주 전체 목·화 오행(${Math.round(_mokHwa*100)}%) vs 금·수 오행(${Math.round(_geumSu*100)}%) 비율이야.`},
    {axis:`${_fWins?"F (감정)":"T (사고)"}`,score:_fBlend>=50?_fBlend:100-_fBlend,
      basis:`천간 음간 ${_eumCnt}개 vs 양간 ${_yangCnt}개, ${_isSingang?"에너지가 강한 신강":"에너지가 약한 신약"} 구조 반영이야.`},
    {axis:`${_jWins?"J (판단)":"P (인식)"}`,score:_jBlend>=50?_jBlend:100-_jBlend,
      basis:`태어난 날의 지지 십이운성 ${_iljiStage} (60%), 태어난 달 천간 ${wolju.gan.ko}(${_monthGanYang?"양간, 주도적":"음간, 수용적"}) (40%) 반영이야.`},
  ];
  // 타로 연도별 개인연도수
  function getPersonalYear(yr){
    const digits=[...String(yr),...String(m).padStart(2,"0"),...String(d).padStart(2,"0")].map(Number);
    let s=digits.reduce((a,b)=>a+b,0);
    while(s>9&&![11,22,33].includes(s))s=String(s).split("").reduce((a,b)=>a+parseInt(b),0);
    return s;
  }
  const TAROT_CARDS_MAP={1:"마법사",2:"고위여사제",3:"황후",4:"황제",5:"교황",6:"연인",7:"전차",8:"힘",9:"은둔자",10:"운명의 수레바퀴",11:"정의",22:"위대한 건축가(마스터 22)"};
  const TAROT_DESC_MAP={1:"새로운 시작과 의지의 해야.",2:"직관과 내면의 목소리를 따르는 해야.",3:"창조와 풍요의 해야.",4:"기반을 다지고 체계를 세우는 해야.",5:"배움과 멘토의 해야.",6:"선택과 관계의 해야.",7:"의지와 승리의 해야.",8:"내면의 힘을 발휘하는 해야.",9:"내면을 돌아보는 해야.",10:"예상치 못한 전환의 해야.",11:"균형과 공정의 해야.",22:"대각성의 해: 큰 꿈이 현실이 돼."};

  // ━━ DB에서 텍스트 가져오기 ━━
  const ilganDB = ILGAN_DESC[ilgan] || ILGAN_DESC["무"];
  const iljuKey = ilju.ko;
  const iljuCharDesc = ILJU_CHAR[iljuKey] || `${ilju.hanja}(${ilju.ko}) 일주야.`;
  const vsKey = singang==="신강(身强)"?"strong":"weak";
  const yongDB = YONGSIN_TABLE[ilO] || YONGSIN_TABLE["土"];
  const yongsinA_val = yongDB[vsKey].yongsin;
  const huisinA_val = yongDB[vsKey].huisin;
  const gisinA_val = yongDB[vsKey].gisin;
  const yearCards=[CY,CY+1,CY+2,CY+3,CY+4].map((yr,i)=>{
    const py=getPersonalYear(yr);
    const score=Math.min(90,Math.max(55,65+(py===22?25:py===11?15:py===lp?10:0)+(i<2?5:0)));
    return{year:yr,num:py,card:TAROT_CARDS_MAP[py]||String(py),score,desc:TAROT_DESC_MAP[py]||`${py}번 에너지의 해야.`};
  });
  // 생명경로수 타로 카드
  const LP_CARDS={1:"마법사(The Magician)",2:"고위여사제(High Priestess)",3:"황후(The Empress)",4:"황제(The Emperor)",5:"교황(The Hierophant)",6:"연인(The Lovers)",7:"전차(The Chariot)",8:"힘(Strength)",9:"은둔자(The Hermit)",11:"정의(Justice)",22:"위대한 건축가"};
  const LP_DESC2={1:"의지와 실행으로 아이디어를 현실로 만드는 마법사 카드야.",2:"보이지 않는 것을 읽어내는 직관과 신비의 고위여사제 카드야.",3:"무언가를 낳고 키우고 표현하는 게 삶의 핵심인 황후 카드야.",4:"꾸준히 쌓아 탑을 세우는 질서와 체계의 황제 카드야.",5:"경험을 통해 성장하는 자유와 변화의 교황 카드야.",6:"관계 속에서 꽃피는 책임과 사랑의 연인 카드야.",7:"깊이 파고들어 본질을 캐내는 탐구와 지혜의 전차 카드야.",8:"현실적인 성공을 향해 밀어붙이는 힘과 성취의 힘 카드야.",9:"세상에 나눠주고 마무리 짓는 완성과 봉사의 은둔자 카드야.",11:"특별한 사명을 품은 영감과 이상의 정의 카드야. 마스터 넘버라 기운이 특히 강해.",22:"꿈을 현실의 구조로 세우는 대건축가 카드야. 마스터 넘버라 그릇이 남달라.",33:"조건 없는 사랑으로 세상을 품는 마스터 넘버 카드야."};
  const lifePathCard=LP_CARDS[lp]||`${lp}번 카드`;
  const lifePathDesc=LP_DESC2[lp]||`생명경로수 ${lp}번의 에너지야.`;
  // 영혼 카드 긴 설명 (성취 카드와 유사한 분량)
  const SOUL_DESC={
    1:"내면 깊은 곳에 '내 힘으로 무언가를 시작하고 싶다'는 강한 의지가 자리해. 누군가 정해준 길을 따라가기보다, 스스로 첫 발자국을 찍을 때 비로소 살아있음을 느끼는 영혼이야. 혼자 결정하고 책임지는 것을 두려워하지 않고, 오히려 그 과정에서 자신의 본질을 확인해. 다만 모든 걸 혼자 짊어지려다 지칠 수 있으니, 의지할 줄 아는 것도 성장의 일부야.",
    2:"겉으로 드러내기보다 조용히 느끼고 헤아리는 데서 안정을 얻는 영혼이야. 말로 다 표현되지 않는 미묘한 감정과 분위기를 예민하게 감지하고, 사람과 사람 사이를 부드럽게 잇는 역할에서 깊은 보람을 느껴. 직관이 곧 나침반이라, 머리로 따지기 전에 마음이 먼저 답을 알아. 다만 타인의 감정에 너무 깊이 물들지 않도록 자기만의 중심을 지키는 것이 중요해.",
    3:"무언가를 만들어내고 표현할 때 영혼이 가장 환하게 빛나. 감정과 생각을 안에만 담아두면 답답해지고, 그것을 말·글·작품, 관계로 풀어낼 때 비로소 자유로워져. 사람들을 즐겁게 하고 분위기를 살리는 타고난 감각이 있어. 다만 가볍게 흩어지기 쉬운 에너지라, 하나에 깊이 몰입하는 연습이 더 큰 결실을 만들어줘.",
    4:"질서와 안정 속에서 마음이 편안해지는 영혼이야. 단단한 기초를 다지고 하나하나 쌓아 올릴 때 깊은 만족을 느끼고, 약속과 책임을 지키는 것에서 자기 가치를 확인해. 화려함보다 꾸준함, 즉흥보다 계획을 신뢰하는 성실한 본성이 있어. 다만 너무 틀에 갇히면 숨이 막힐 수 있으니, 가끔은 변화를 허용하는 유연함이 필요해.",
    5:"자유롭게 움직이고 새로운 것을 경험할 때 영혼이 숨을 쉬어. 한 자리에 오래 묶여 있으면 답답함을 느끼고, 변화와 모험 속에서 자신을 발견하는 타입이야. 호기심이 넘쳐 다양한 세계를 탐험하며 끊임없이 성장해. 다만 모든 가능성을 열어두려다 정작 깊이 뿌리내리지 못할 수 있으니, 진짜 중요한 것에는 머무를 줄 아는 지혜가 필요해.",
    6:"사랑하고 보살피는 관계 속에서 영혼이 완성되는 타입이야. 가까운 사람을 챙기고 책임지는 데서 깊은 의미를 찾고, 따뜻함과 조화를 만들어내는 능력이 탁월해. 누군가에게 기댈 곳이 되어줄 때 가장 자기다움을 느껴. 다만 타인을 위하느라 자신을 잃지 않도록, 나를 돌보는 것도 사랑임을 기억하는 게 중요해.",
    7:"홀로 깊이 사유하고 본질을 파고들 때 영혼이 충만해지는 타입이야. 표면적인 답에 만족하지 못하고, 보이지 않는 원리와 진실을 탐구하는 데서 기쁨을 느껴. 혼자만의 고요한 시간이 곧 에너지의 원천이야. 다만 너무 안으로만 침잠하면 세상과 멀어질 수 있으니, 깨달은 것을 나누는 연결도 필요해.",
    8:"현실에서 구체적인 성취를 이뤄낼 때 영혼이 살아나는 타입이야. 막연한 이상보다 손에 잡히는 결과를 만들고, 자신의 힘으로 영향력과 풍요를 일궈낼 때 깊은 만족을 느껴. 강한 추진력과 현실 감각이 타고난 무기야. 다만 성과에만 몰두하다 내면의 균형을 놓치지 않도록, 무엇을 위한 성공인지 늘 되묻는 게 중요해.",
    9:"세상에 베풀고 더 큰 가치에 기여할 때 영혼이 빛나는 타입이야. 개인의 이익을 넘어 모두를 위한 무언가를 할 때 깊은 의미를 느끼고, 따뜻한 이해심과 넓은 시야를 가졌어. 많은 것을 품고 놓아줄 줄 아는 성숙함이 본성이야. 다만 모두를 끌어안으려다 지칠 수 있으니, 내려놓는 것도 사랑임을 아는 게 필요해.",
    11:"영감과 이상을 좇으며 사람들에게 빛을 비추는 영혼이야. 마스터 넘버 11로서, 직관이 남달리 예민하고 보이지 않는 가능성을 먼저 감지해. 자신보다 큰 무언가와 연결되어 있다는 감각이 늘 마음 깊은 곳에 있어. 다만 높은 이상과 현실의 간극에서 흔들릴 수 있으니, 한 걸음씩 땅을 딛는 균형이 중요해.",
    22:"꿈을 현실의 구조물로 빚어내는 위대한 건축가의 영혼이야. 마스터 넘버 22로서, 거대한 비전을 품으면서도 그것을 실제로 세워낼 수 있는 드문 힘을 가졌어. 많은 사람에게 영향을 미치는 일에서 깊은 사명감을 느껴. 다만 너무 큰 책임에 짓눌리지 않도록, 작은 성취들을 차곡차곡 쌓는 인내가 필요해.",
  };
  const soulDesc_val=SOUL_DESC[lp]||LP_DESC2[lp]||`생명경로수 ${lp}번의 영혼 에너지야.`;
  const currentAge=CY-y+1;
  const sang=(y%100)%8||8,jung=currentAge%6||6,ha=8;
  const sajaDB=TOJUNG_SAJA[sang]||TOJUNG_SAJA[5];
  const personaTitle=ILGAN_TITLE[ilgan]||"고유한 기운의 사람";


  // 당사주 별성
  const dansajuPillars = [
    {ji:yeonju.ji.ko,palace:"년주(조상궁)"},
    {ji:wolju.ji.ko,palace:"월주(부모궁)"},
    {ji:ilju.ji.ko,palace:"일주(배우자궁)"},
    {ji:siJi,palace:"시주(자녀궁)"},
  ].map(({ji,palace})=>{
    const bs = BYEOLSEONG[ji] || {name:"분석 중",kw:"",desc:""};
    const stage = getStage(ilgan,ji);
    return {ji,byeolseong:bs.name,kw:bs.kw||"",stage,stageDesc:STAGE_DESC[stage]||"",palace,desc:bs.desc};
  });
  // 주역 본명괘 — 매화역수 시간괘식(4지지)으로 64괘 전체 도달
  const _ich64 = deriveIching64(yeonju.ji.ko, wolju.ji.ko, ilju.ji.ko, siJi);
  const ichingData = _ich64;
  const domO_kor = _ich64.upNat || "";
  const relO_kor = _ich64.lowNat || "";
  const relO = _ich64.lowO;

  // 낮과 밤 텍스트
  const dn_day = ilganDB.day || {impression:"분석 중",mask:"분석 중"};
  const dn_night = ilganDB.night || {desire:"분석 중",desire2:"",triggers:[],attraction:"분석 중",idealType:"분석 중",idealType2:"분석 중"};

  // 성격 요약 persona (3개: 일주 / 일간 / 신살) 타이틀에 한자 있으니 본문 반복 없음
  const ilju_persona_desc = stripLead(ILJU_CHAR[iljuKey]) || `${OHK[ilO]} 기운의 일주야.`;
  const ilgan_persona_desc = stripLead(ilganDB[vsKey]) || stripLead(ilganDB.core);
  const persona = [
    {icon:"🔮",title:`${ilju.hanja}(${ilju.ko}) 일주`,desc:ilju_persona_desc},
    {icon:"⭐",title:`${ilgan} 일간 (${OHK[ilO]} 기운)`,desc:ilgan_persona_desc},
    {icon:"✨",title:"신살(神殺)",desc:sinsal.length>0?sinsal.map(s=>s.name).join("·")+" 발동":"특별한 신살이 없는 안정적인 구조야."},
  ];

  // 종합 기질 토정비결+주역+당사주+일간 인사이트형 통합 (~300자)
  const _dsName=n=>n.split("(")[0];
  const _ilganTitle=ILGAN_TITLE[ilgan]||"";
  const _ichNature=ichingData?.nature||"";
  const _sajaName=sajaDB?.saja||"";
  const _iljiStar=_dsName(dansajuPillars[2].byeolseong);
  const dansajuOverall=`${_ilganTitle} 같은 ${OHK[ilO]} 일간의 ${singang.replace(/\(.*\)/,"")} 기질과 어우러져, ${ilganDB.core.replace(/^[^:]*:\s*/,"")} 토정비결 ${_sajaName}의 흐름은 ${sajaDB?.desc||""} 주역 ${ichingData?.name||""}(${_ichNature})의 기운이 이 흐름을 뒷받침해. 당사주 일주의 ${_iljiStar}이 삶의 중심축이 되고, 나머지 세 별이 시기별로 그 기운을 거들어.`;


  // ━━ 세운 점수 메타 sajaDB, ichingData, dansajuPillars 모두 정의된 후에 계산 ━━
  const curDaeun=daeun.find(dv=>dv.cur);
  const TOJUNG_BONUS={"일출동방(日出東方)":5,"입신양명(立身揚名)":5,"순풍거범(順風擧帆)":4,"고목봉춘(枯木逢春)":4,"대기만성(大器晩成)":3,"운개견일(雲開見日)":3,"금상첨화(錦上添花)":2,"고진감래(苦盡甘來)":2};
  const ICHING_BONUS_MAP={"완성, 성취, 균형의 유지":3,"형통, 소통, 막힘이 뚫림":3,"포용, 수용, 대지의 힘":3,"기쁨, 열정, 준비된 행동":3,"연대, 협력, 친밀한 관계":2,"해방, 풀림, 막혔던 것이 해소":2,"회복·새 출발, 본래로 돌아감":2,"기다림, 준비, 때를 기다리는 지혜":1,"조직, 리더십, 군중을 이끄는 힘":1,"어려운 탄생, 씨앗, 고통 뒤의 성장":-2,"위험, 도전, 거듭되는 시련":-3,"빛이 가려짐, 인내, 내면의 빛을 지킴":-2};
  const STAGE_BONUS={"장생(長生)":3,"관대(冠帶)":2,"건록(建祿)":3,"제왕(帝旺)":3,"목욕(沐浴)":1,"쇠(衰)":-1,"병(病)":-2,"사(死)":-2,"묘(墓)":-1,"절(絶)":-3,"태(胎)":1,"양(養)":2};
  const pyNow=(()=>{const digits=[...String(CY),...String(m).padStart(2,"0"),...String(d).padStart(2,"0")].map(Number);let sv=digits.reduce((a,b)=>a+b,0);while(sv>9&&![11,22,33].includes(sv))sv=String(sv).split("").reduce((a,b)=>a+parseInt(b),0);return sv;})();
  const scoreMeta={
    yongsinO:_yongO, huisinO:_huiO, gisinO:_giO,
    daeunO: curDaeun?_GANO[curDaeun.label[0]]:"",
    dayJi: ilju.ji.ko,
    tojungBonus: TOJUNG_BONUS[sajaDB?.saja]||0,
    ichingBonus: ICHING_BONUS_MAP[ichingData?.nature]||0,
    dansajuBonus: STAGE_BONUS[dansajuPillars[2]?.stage]||0,
    tarotBonus: pyNow===lp?4:pyNow===22||pyNow===11?3:[1,lp+1,lp-1].includes(pyNow)?2:0,
  };
  // 사주탭 전용: 다체계 보정 없이 사주 기반만 (탭별 점수 분리)
  const scoreMetaSaju={
    yongsinO:_yongO, huisinO:_huiO, gisinO:_giO,
    daeunO: curDaeun?_GANO[curDaeun.label[0]]:"",
    dayJi: ilju.ji.ko,
    tojungBonus:0, ichingBonus:0, dansajuBonus:0, tarotBonus:0,
  };
  const YEAR_SUMMARIES={high:"용신 기운이 살아나는 해야. 준비한 것이 결실을 맺기 좋은 시기야.",mid:"흐름이 무난한 해야. 큰 욕심 없이 꾸준히 나아가면 좋아.",low:"기신 기운이 강한 해야. 무리한 확장보다 내실을 다지는 시기야."};
  const bandSummary=sc=>sc>=82?YEAR_SUMMARIES.high:sc>=66?YEAR_SUMMARIES.mid:YEAR_SUMMARIES.low;
  const yearForecast=[CY,CY+1,CY+2,CY+3,CY+4].map(yr=>{
    const sc=calcSeunScore(yr,0,scoreMeta);
    return{year:yr,score:sc,summary:bandSummary(sc),areas:calcSeunAreas(yr,0,scoreMeta)};
  });
  const monthForecast=Array.from({length:12},(_,i)=>{
    const r=CM+i,mo=(r-1)%12+1,yr=CY+Math.floor((CM-1+i)/12);
    const sc=calcSeunScore(yr,mo,scoreMeta);
    const gj=mToGJ(yr,mo,15);
    return{year:yr,month:mo,label:`${yr}.${mo}`,ganji:gj.ko,score:sc,summary:bandSummary(sc),areas:calcSeunAreas(yr,mo,scoreMeta),isThis:i===0};
  });

  // ━━ 연도별 흐름/월별 길흉 (사주탭 전용 사주 기반만) ━━
  const yrs5=[CY,CY+1,CY+2,CY+3,CY+4];
  const tojungYearFlow=yrs5.map(yr=>{
    const sc=calcSeunScore(yr,0,scoreMetaSaju);
    return{year:yr,score:sc,month:sc>=82?"대길":sc>=66?"평운":"주의",desc:bandSummary(sc),areas:calcSeunAreas(yr,0,scoreMetaSaju)};
  });
  const tojungMonth2026=Array.from({length:12},(_,i)=>{
    const mo=i+1,sc=calcSeunScore(CY,mo,scoreMetaSaju);
    return{m:mo,score:sc,desc:sc>=80?"길":sc>=64?"평":"주의"};
  });
  const ichingYearFlow=yrs5.map(yr=>{
    const sc=calcSeunScore(yr,0,scoreMetaSaju);
    const yg=yearToGJ(yr);
    const yi=deriveIching64(yg.ji.ko,wolju.ji.ko,ilju.ji.ko,siJi);
    return{year:yr,score:sc,gae:yi.name,desc:`${yi.nature}의 기운이 흐르는 해야.`};
  });
  const dansajuYearFlow=yrs5.map(yr=>{
    const sc=calcSeunScore(yr,0,scoreMetaSaju);
    const yji=yearToGJ(yr).ji.ko,bs=BYEOLSEONG[yji];
    return{year:yr,score:sc,desc:`${_dsName(bs?.name||"")} 기운이 들어오는 해야. ${bandSummary(sc)}`};
  });

  const jiArr=[yeonju.ji.ko, wolju.ji.ko, ilju.ji.ko, siJi];
  const hapChungHyeong=calcHapChungHyeong(jiArr);

  return{
    name,birth:`양력 ${y}년 ${m}월 ${d}일 ${rawH}시 ${String(rawM).padStart(2,"0")}분 ${city}`,gender,
    isSolo: input?.isSolo !== false,
    joinDate: input?.joinDate || null,
    companyElement: input?.companyElement || "",
    foundDate: input?.foundDate || null,
    astro: buildAstro(y, m, d, rawH, rawM, input?.noTime === true),
    personaTitle,scoreMeta:scoreMetaSaju,
    boundary:{...bnd,isBoundary:bnd.inBoundary,
      stdIlju:ilju.ko, midIlju:iljuB.ko,
      standardDesc:`${stripLead(ILJU_CHAR[iljuKey])||OHK[ilO]+" 기운의 일주야."} ${stripLead(ilganDB.core)}`,
      midnightDesc:`${stripLead(ILJU_CHAR[iljuB.ko])||OHK[normO(GAN_OE[ilganB])]+" 기운의 일주야."} ${stripLead((ILGAN_DESC[ilganB]||ILGAN_DESC["기"]).core)}`,
    },
    pillars,pillarsB,
    ohaengDist,singang,
    yongsinA:yongsinA_val, yongsinB:"분석 중",
    huisinA:huisinA_val, huisinB:"분석 중",
    gisinA:gisinA_val, gisinB:"분석 중",
    ohaengNote:`${Object.entries(ohaengDist).map(([k,v])=>`${OHK[k]} ${v}개`).join(" · ")}. 일간 ${ilju.ko}(${ilju.hanja})은 ${monthHelps?"태어난 달이 일간을 든든히 받쳐주어":"태어난 달의 기운이 일간과 달라 균형이 필요한 구조라"} ${singang}이야.`,
    summary:{
      persona,
      yearForecast,
      monthForecast,
      sixSystems:[
        {system:"사주",key:`${ilju.ko} 일주`,desc:ILGAN_PHILOSOPHY[ilgan]||ilganDB.core,insight:""},
        {system:"토정비결",key:sajaDB.saja,desc:sajaDB.desc,insight:""},
        {system:"주역",key:ichingData.name,desc:ichingData.nature,insight:""},
        {system:"당사주",key:dansajuPillars.map(p=>p.byeolseong.split("(")[0]).join("·"),desc:`일주의 ${_dsName(dansajuPillars[2].byeolseong)}이 삶의 중심축이야. ${dansajuPillars[0].kw}의 ${_dsName(dansajuPillars[0].byeolseong)}(년), ${dansajuPillars[1].kw}의 ${_dsName(dansajuPillars[1].byeolseong)}(월), ${dansajuPillars[3].kw}의 ${_dsName(dansajuPillars[3].byeolseong)}(시)이 뒷받침해.`,insight:""},
        {system:"점성술",key:"출생 차트",desc:"출생 시각 기반 행성 배치야.",insight:""},
        {system:"타로수비학",key:`생명경로수 ${lp}`,desc:lifePathDesc,insight:""},
        {system:"MBTI",key:mbtiType,desc:mbtiDesc,insight:""},
      ],
      sevenInsight:(()=>{
        // 점수 정렬: 최고점 / 2등 연도 파악
        const sorted=[...yearForecast].sort((a,b)=>b.score-a.score);
        const today=yearForecast[0];
        const best=sorted[0];
        const second=sorted[1];
        // 올해가 최고점이면 2등 연도 사용
        const highlight=best.year===today.year?second:best;
        const hlAreas=highlight.areas?Object.entries(highlight.areas).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k,v])=>`${k} ${v}점`).join(", "):"";
        const todayAreas=today.areas?Object.entries(today.areas).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k,v])=>`${k} ${v}점`).join(", "):"";

        // 7체계 통합 성격 결론 (사주+토정+주역+당사주+타로+MBTI 핵심 교차)
        const charConclusion=`${OHK[ilO]} 기운의 ${singang} 구조로, ${ILGAN_PHILOSOPHY[ilgan]||ilganDB.core} 토정비결의 ${sajaDB.saja}(${sajaDB.desc.slice(0,20)}…), 주역의 ${ichingData.name}(${ichingData.nature})이 이 흐름을 뒷받침해. 당사주의 ${_dsName(dansajuPillars[2].byeolseong)}이 삶의 중심축이 되고, 생명경로수 ${lp}의 에너지와 ${mbtiType}의 기질이 더해져 ${OHK[ilO]} 일간 특유의 ${singang==="신강(身强)"?"강한 추진력과 실행력":"조용하지만 깊은 내면의 저력"}이 삶 전체를 관통해.`;

        // 올해 운세
        const todayPart=`올해 ${today.year}년(${today.score}점)은 ${today.summary}${todayAreas?` 특히 ${todayAreas} 영역이 활발해.`:" 꾸준히 나아가는 것이 중요해."}`;

        // 하이라이트 연도 운세
        const hlPart=`향후 가장 빛나는 시기는 ${highlight.year}년(${highlight.score}점)으로${hlAreas?`, ${hlAreas} 영역을 중심으로`:""} 지금까지 쌓아온 것들이 가장 크게 꽃피는 해야. 지금은 그 해를 향해 씨앗을 심는 시기야.`;

        return `${charConclusion}\n\n${todayPart} ${hlPart}`;
      })(),
    },
    sinsal,sinsal12,unseong12,sibsongAnalysis:analyzeSibsong(pillars,noTime),noTime,hap:hapChungHyeong.hap,hyeong:hapChungHyeong.hyeong,chung:hapChungHyeong.chung,
    daeun,daeunStart:startAge,daeunDir:forward?"순행(順行)":"역행(逆行)",
    dansaju:{pillars:dansajuPillars,overall:dansajuOverall,yearFlow:dansajuYearFlow},
    iching:{bonmyeonggae:ichingData.name,gaeSymbol:_ich64.symbol||"☯",gaeNum:ichingData.num||0,gaeUpper:`${_ich64.upT}·${_ich64.upNat}`,gaeLower:`${_ich64.lowT}·${_ich64.lowNat}`,gaeUpperO:_ich64.upO,gaeLowerO:_ich64.lowO,gaeDesc:ichingData.desc,gaeNature:ichingData.nature,currentGae:ichingData.currentGae||"",currentYear:`${CY}년`,currentDesc:ichingData.currentDesc||"",strategy:ichingData.strategy||[],yearFlow:ichingYearFlow,donghyo:_ich64.donghyo},
    tojung:{sang,jung,ha,saja:sajaDB.saja,sajaDesc:sajaDB.desc,bonun:sajaDB.saja,bonunDesc:sajaDB.desc,yearFlow:tojungYearFlow,month2026:tojungMonth2026},
    tarot:{lifePath:lp,isMaster:[11,22,33].includes(lp),lifePathCard,lifePathCardNum:String(lp),lifePathDesc,soulCard:LP_CARDS[lp]||"분석 중",achieveCard:LP_CARDS[(lp+1)>9?1:lp+1]||"분석 중",soulDesc:soulDesc_val,achieveDesc:"성취 에너지 분석 중이야.",calc,yearCards},
    daynight:{overview:`${stripLead(ilganDB.core)} ${singang==="신강(身强)"?"강한 에너지를 가진 만큼, 그것을 흘려보내는 방법을 찾는 것이 중요해.":"내면의 에너지를 충전하는 루틴이 필요해."}`,
      day:{impression:dn_day.impression||"",mask:dn_day.mask||"",styling:{hair:"",fashion:"",color:"",makeup:"",perfume:""}},
      night:{desire:dn_night.desire||"",desire2:dn_night.desire2||"",triggers:dn_night.triggers||[],attraction:dn_night.attraction||"",idealType:dn_night.idealType||"",idealType2:dn_night.idealType2||""}},
    mbti:{estimated:mbtiType,userType:input?.mbti||"",basis:mbtiDesc,axes:mbtiAxes,borderline:`${mbtiType[2]==='F'?'F':'T'}↔${mbtiType[2]==='F'?'T':'F'} 경계: 상황에 따라 유연하게 전환돼.`,strengths:ilganDB.strengths||[`${OHK[ilO]} 일간의 강점이 발휘되는 환경에서 최고의 실력이 나와.`],challenges:ilganDB.challenges||[`용신 ${yongsinA_val} 기운이 부족하면 균형이 깨질 수 있어.`],bestEnv:ilganDB.bestEnv||`${OHK[ilO]} 에너지가 잘 발휘되는 환경이야.`,recovery:ilganDB.recovery||`용신인 ${yongsinA_val}를 활용한 루틴이 도움이 돼.`},
  };
}

export { calcSinsal, calcLifePath, buildSajuData };
