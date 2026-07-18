// utils/saju.js
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
  if(ym[yearJi]&&[monthJi,dayJi,timeJi].includes(ym[yearJi]))result.push({name:"역마살",hanja:"驛馬殺",found:ym[yearJi],easy:"이동·변화·해외 에너지가 강해.",desc:"한 곳에 오래 머물면 답답해. 움직임 속에서 에너지가 살아나는 구조야."});
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
  // 천의성 (월지 바로 앞 지지) — 의료·치유의 별
  const _jiOrder=["자","축","인","묘","진","사","오","미","신","유","술","해"];
  const _mi=_jiOrder.indexOf(monthJi);
  const cheonui=_mi>=0?_jiOrder[(_mi+11)%12]:null;
  if(cheonui&&[yearJi,dayJi,timeJi].includes(cheonui))result.push({name:"천의성",hanja:"天醫星",found:cheonui,easy:"남을 살리고 돌보는 치유의 기운이야.",desc:"의료, 상담, 돌봄 쪽으로 타고난 감각이 있어. 사람을 낫게 하고 어루만지는 자리에서 빛나."});
  // 관귀학관 (일간 기준) — 관운·학문의 별
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
  화개살:{hanja:"華蓋殺",easy:"홀로 깊어지는 예술과 수행의 자리야.",desc:"고독을 견디는 힘 속에서 재능이 피어나. 예술, 학문, 종교, 영성 쪽으로 타고난 깊이가 있어. 외로움이 곧 이 사람의 무기야."},
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


function calcLifePath(y,m,d){
  const s=[...String(y),...String(m).padStart(2,"0"),...String(d).padStart(2,"0")].map(Number).reduce((a,b)=>a+b,0);
  let n=s;
  while(n>9&&![11,22,33].includes(n))n=String(n).split("").reduce((a,b)=>a+parseInt(b),0);
  return{lp:n,calc:`${[...String(y),...String(m).padStart(2,"0"),...String(d).padStart(2,"0")].join("+")}=${s}→${n}`};
}

const CITY_OFFSET={"서울":-2,"부산":3,"대구":0,"인천":-3,"광주":-11,"대전":-5,"울산":4,"세종":-5,"경기":-2,"강원":4,"충북":-4,"충남":-7,"전북":-10,"전남":-12,"경북":2,"경남":1,"제주":-19,"경북 경산":-25,"경북 포항":5,"경북 구미":-3,"경북 안동":0,"경남 창원":0,"경남 진주":-4,"전남 순천":-10,"전북 전주":-10};
// 한국 표준시(동경 135도) - 실제 국토 중심(동경 127.5도) = 30분. 모든 출생시각에서 30분을 뺀다.
const STANDARD_TIME_OFFSET=-30;

function buildSajuData(input){
  const{name,year:ys,month:ms,day:ds,hour:hs,minute:mns="0",gender,city}=input;
  const y=parseInt(ys),m=parseInt(ms),d=parseInt(ds);
  const rawH=parseInt(hs),rawM=parseInt(mns);
  const offset=(CITY_OFFSET[city]||0)+STANDARD_TIME_OFFSET;
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
    {pos:"연지",label:"조상·초년",ji:_yJi,name:calc12Sinsal(_yJi,_yJi)},
    {pos:"월지",label:"부모·청년",ji:wolju.ji.ko,name:calc12Sinsal(_yJi,wolju.ji.ko)},
    {pos:"일지",label:"자신·중년",ji:ilju.ji.ko,name:calc12Sinsal(_yJi,ilju.ji.ko)},
    ...(noTime?[]:[{pos:"시지",label:"자녀·말년",ji:siJi,name:calc12Sinsal(_yJi,siJi)}]),
  ].filter(s=>s.name).map(s=>({...s,...(SINSAL12_DESC[s.name]||{})}));

  // 12운성 (일간 기준 각 지지)
  const _stage=(jji)=>{const st=getStage(ilgan,jji);return st;};
  const unseong12=[
    {pos:"연지",label:"조상·초년",ji:_yJi,stage:_stage(_yJi)},
    {pos:"월지",label:"부모·청년",ji:wolju.ji.ko,stage:_stage(wolju.ji.ko)},
    {pos:"일지",label:"자신·중년",ji:ilju.ji.ko,stage:_stage(ilju.ji.ko)},
    ...(noTime?[]:[{pos:"시지",label:"자녀·말년",ji:siJi,stage:_stage(siJi)}]),
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
  // 용신/희신/기신 오행 리스트 (대운 역할·세운 점수에 사용)
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
      basis:`태어난 날의 지지 십이운성 ${_iljiStage} (60%), 태어난 달 천간 ${wolju.gan.ko}(${_monthGanYang?"양간·주도적":"음간·수용적"}) (40%) 반영이야.`},
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
  const LP_DESC2={1:"의지와 실행으로 아이디어를 현실로 만드는 마법사야.",2:"보이지 않는 것을 읽어내는 직관과 신비의 조율자야.",3:"무언가를 낳고 키우고 표현하는 게 삶의 핵심인 창조자야.",4:"꾸준히 쌓아 탑을 세우는 질서와 체계의 황제야.",5:"경험을 통해 성장하는 자유와 변화의 모험가야.",6:"관계 속에서 꽃피는 책임과 사랑의 조력자야.",7:"깊이 파고들어 본질을 캐내는 탐구와 지혜의 분석가야.",8:"현실적인 성공을 향해 밀어붙이는 힘과 성취의 사람이야.",9:"세상에 나눠주고 마무리 짓는 완성과 봉사의 사람이야.",11:"특별한 사명을 품은 영감과 이상의 마스터 넘버야.",22:"꿈을 현실의 구조로 세우는 대건축가의 마스터 넘버야.",33:"조건 없는 사랑으로 세상을 품는 마스터 넘버야."};
  const lifePathCard=LP_CARDS[lp]||`${lp}번 카드`;
  const lifePathDesc=LP_DESC2[lp]||`생명경로수 ${lp}번의 에너지야.`;
  // 영혼 카드 긴 설명 (성취 카드와 유사한 분량)
  const SOUL_DESC={
    1:"내면 깊은 곳에 '내 힘으로 무언가를 시작하고 싶다'는 강한 의지가 자리해. 누군가 정해준 길을 따라가기보다, 스스로 첫 발자국을 찍을 때 비로소 살아있음을 느끼는 영혼이야. 혼자 결정하고 책임지는 것을 두려워하지 않고, 오히려 그 과정에서 자신의 본질을 확인해. 다만 모든 걸 혼자 짊어지려다 지칠 수 있으니, 의지할 줄 아는 것도 성장의 일부야.",
    2:"겉으로 드러내기보다 조용히 느끼고 헤아리는 데서 안정을 얻는 영혼이야. 말로 다 표현되지 않는 미묘한 감정과 분위기를 예민하게 감지하고, 사람과 사람 사이를 부드럽게 잇는 역할에서 깊은 보람을 느껴. 직관이 곧 나침반이라, 머리로 따지기 전에 마음이 먼저 답을 알아. 다만 타인의 감정에 너무 깊이 물들지 않도록 자기만의 중심을 지키는 것이 중요해.",
    3:"무언가를 만들어내고 표현할 때 영혼이 가장 환하게 빛나. 감정과 생각을 안에만 담아두면 답답해지고, 그것을 말·글·작품·관계로 풀어낼 때 비로소 자유로워져. 사람들을 즐겁게 하고 분위기를 살리는 타고난 감각이 있어. 다만 가볍게 흩어지기 쉬운 에너지라, 하나에 깊이 몰입하는 연습이 더 큰 결실을 만들어줘.",
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
  // 주역 본명괘
  const KOR_TO_HANJA={목:"木",화:"火",토:"土",금:"金",수:"水"};
  const relO_kor = GWAN_O[OHK[ilO]] || "목";
  const relO = KOR_TO_HANJA[relO_kor] || "木";
  const domO_kor = OHK[domOForIching] || "목";
  const ichingData = getIching(domOForIching, relO);

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
  const ICHING_BONUS_MAP={"완성·성취·균형의 유지":3,"형통·소통·막힘이 뚫림":3,"포용·수용·대지의 힘":3,"기쁨·열정·준비된 행동":3,"연대·협력·친밀한 관계":2,"해방·풀림·막혔던 것이 해소":2,"회복·새 출발·본래로 돌아감":2,"기다림·준비·때를 기다리는 지혜":1,"조직·리더십·군중을 이끄는 힘":1,"어려운 탄생·씨앗·고통 뒤의 성장":-2,"위험·도전·거듭되는 시련":-3,"빛이 가려짐·인내·내면의 빛을 지킴":-2};
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
    const yg=yearToGJ(yr),yO=normO(GAN_OE[yg.gan.ko]);
    const yi=getIching(yO,relO);
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
    sinsal,sinsal12,unseong12,noTime,hap:hapChungHyeong.hap,hyeong:hapChungHyeong.hyeong,chung:hapChungHyeong.chung,
    daeun,daeunStart:startAge,daeunDir:forward?"순행(順行)":"역행(逆行)",
    dansaju:{pillars:dansajuPillars,overall:dansajuOverall,yearFlow:dansajuYearFlow},
    iching:{bonmyeonggae:ichingData.name,gaeSymbol:ichingData.symbol||"☯",gaeNum:ichingData.num||0,gaeUpper:`${TRIGRAM[domO_kor]||""}·${domO_kor}`,gaeLower:`${TRIGRAM[relO_kor]||""}·${relO_kor}(관성)`,gaeUpperO:domOForIching,gaeLowerO:relO,gaeDesc:ichingData.desc,gaeNature:ichingData.nature,currentGae:ichingData.currentGae||"분석 중",currentYear:`${CY}년`,currentDesc:ichingData.currentDesc||"",strategy:ichingData.strategy||[],yearFlow:ichingYearFlow},
    tojung:{sang,jung,ha,saja:sajaDB.saja,sajaDesc:sajaDB.desc,bonun:sajaDB.saja,bonunDesc:sajaDB.desc,yearFlow:tojungYearFlow,month2026:tojungMonth2026},
    astro:{sun:"분석 중",moon:"분석 중",asc:"분석 중",mercury:"분석 중",venus:"분석 중",mars:"분석 중",sunMeaning:"의식적 자아",moonMeaning:"감정·본능",ascMeaning:"첫인상",sunDesc:"점성술 분석 중이야.",moonDesc:"점성술 분석 중이야.",ascDesc:"점성술 분석 중이야.",mercuryDesc:"분석 중",venusDesc:"분석 중",marsDesc:"분석 중",triangle:"",stellium:"",yearTransit:[]},
    tarot:{lifePath:lp,isMaster:[11,22,33].includes(lp),lifePathCard,lifePathCardNum:String(lp),lifePathDesc,soulCard:LP_CARDS[lp]||"분석 중",achieveCard:LP_CARDS[(lp+1)>9?1:lp+1]||"분석 중",soulDesc:soulDesc_val,achieveDesc:"성취 에너지 분석 중이야.",calc,yearCards},
    daynight:{overview:`${stripLead(ilganDB.core)} ${singang==="신강(身强)"?"강한 에너지를 가진 만큼, 그것을 흘려보내는 방법을 찾는 것이 중요해.":"내면의 에너지를 충전하는 루틴이 필요해."}`,
      day:{impression:dn_day.impression||"",mask:dn_day.mask||"",styling:{hair:"",fashion:"",color:"",makeup:"",perfume:""}},
      night:{desire:dn_night.desire||"",desire2:dn_night.desire2||"",triggers:dn_night.triggers||[],attraction:dn_night.attraction||"",idealType:dn_night.idealType||"",idealType2:dn_night.idealType2||""}},
    mbti:{estimated:mbtiType,userType:input?.mbti||"",basis:mbtiDesc,axes:mbtiAxes,borderline:`${mbtiType[2]==='F'?'F':'T'}↔${mbtiType[2]==='F'?'T':'F'} 경계: 상황에 따라 유연하게 전환돼.`,strengths:ilganDB.strengths||[`${OHK[ilO]} 일간의 강점이 발휘되는 환경에서 최고의 실력이 나와.`],challenges:ilganDB.challenges||[`용신 ${yongsinA_val} 기운이 부족하면 균형이 깨질 수 있어.`],bestEnv:ilganDB.bestEnv||`${OHK[ilO]} 에너지가 잘 발휘되는 환경이야.`,recovery:ilganDB.recovery||`용신인 ${yongsinA_val}를 활용한 루틴이 도움이 돼.`},
  };
}

export { calcSinsal, calcLifePath, buildSajuData };
