// SajuReport.jsx — 메인 진입점 v2
import React, { useState, useMemo, useRef } from 'react';
import { lunarToSolar, getLeapMonth } from './utils/lunar.js';
import { saveUser, saveReport, findCachedReport, PROMPT_VERSION } from './supabase.js';
import { buildSajuData } from './utils/saju.js';
import { callNetlify } from './utils/callNetlify.js';
import { buildInnerPrompt, buildAstroPrompt, buildTarotPrompt } from './utils/prompts.js';
import { CY, CM, CD, stripDegree, _GANO } from './data/constants.js';
import { S, SF, LoadingScreen } from './components/ui.jsx';
import TabSummary from './components/TabSummary.jsx';
import TabSaju from './components/TabSaju.jsx';
import TabInner from './components/TabInner.jsx';
import TabTojung from './components/TabTojung.jsx';
import TabAstro from './components/TabAstro.jsx';
import TabMBTI from './components/TabMBTI.jsx';
import { AdminPage } from './components/AdminPage.jsx';
import MoraIntro from './components/MoraIntro.jsx';
import MoraReport from './components/MoraReport.jsx';

export default function SajuReport(){
  // sessionStorage 복원
  const _saved = useMemo(()=>{
    try{
      const r=sessionStorage.getItem("fy_report_v2");
      const t=sessionStorage.getItem("fy_tab");
      return r?{data:JSON.parse(r),tab:t||"요약"}:null;
    }catch{return null;}
  },[]);

  const [tab,setTab]=useState(_saved?.tab||"요약");
  const [phase,setPhase]=useState(_saved?"report":"intro");
  const [opacity,setOpacity]=useState(1);
  const [reportData,setReportData]=useState(_saved?.data||null);
  const [showAdmin,setShowAdmin]=useState(()=>new URLSearchParams(window.location.search).has("admin"));
  // AI 상태를 부모에서 관리 (탭 전환·새로고침해도 재로딩 안 됨)
  const [parentAstroAI,setParentAstroAI]=useState(()=>{
    if(_saved?.data?._astroAI) return _saved.data._astroAI;
    try{const k=_saved?.data?.birth?`fy_astro_v5_${_saved.data.birth}`:null;return k?JSON.parse(sessionStorage.getItem(k)||"null"):null;}catch{return null;}
  });
  const [parentTarotAI,setParentTarotAI]=useState(()=>{
    if(_saved?.data?._tarotAI) return _saved.data._tarotAI;
    try{const k=_saved?.data?.birth?`fy_tarot_v5_${_saved.data.birth}`:null;return k?JSON.parse(sessionStorage.getItem(k)||"null"):null;}catch{return null;}
  });
  const [parentInnerAI,setParentInnerAI]=useState(()=>{
    if(_saved?.data?._innerAI) return _saved.data._innerAI;
    try{const k=_saved?.data?.birth?`fy_inner_v2_${_saved.data.birth}`:null;return k?JSON.parse(sessionStorage.getItem(k)||"null"):null;}catch{return null;}
  });
  const TABS=["요약","사주","토정·주역","별자리·타로수비학","MBTI","내면 해부"];

  function changeTab(t){
    setTab(t);
    try{sessionStorage.setItem("fy_tab",t);}catch{}
    window.scrollTo({top:0,behavior:"instant"});
  }

  function handleFormSubmit(formInput){
    setOpacity(0);
    setTimeout(async()=>{
      // 0. Supabase에서 동일 생년월일+시간+성별+도시 레포트 조회 (1년 이내)
      try{
        const cached = await findCachedReport(formInput);
        if(cached){
          const cachedWithName = {...cached, name: formInput.name};
          setReportData(cachedWithName);
          if(cached._astroAI) setParentAstroAI(cached._astroAI);
          if(cached._tarotAI) setParentTarotAI(cached._tarotAI);
          if(cached._innerAI) setParentInnerAI(cached._innerAI);
          try{
            sessionStorage.setItem("fy_report_v2", JSON.stringify(cachedWithName));
            sessionStorage.setItem("fy_tab", "요약");
          }catch{}
          setPhase("report");
          setTab("요약");
          setOpacity(1);
          window.scrollTo({top:0});
          return;
        }
      }catch(e){console.warn("캐시 조회 실패:", e.message);}

      // 1. 사주 계산
      let data;
      try{
        data=buildSajuData(formInput);
      }catch(e){
        console.error("buildSajuData 오류:", e);
        setPhase("intro");
        setOpacity(1);
        alert("분석 중 오류가 발생했어. 입력값을 확인해줘.");
        return;
      }
      setReportData(data);
      setPhase("loading");
      setOpacity(1);

      // 2. saveUser 미리 실행해서 userId 확보 (saveReport는 enrichedData 완성 후)
      let savedUserId=null;
      (async()=>{
        try{const {userId}=await saveUser(formInput);savedUserId=userId;}
        catch(e){console.warn("saveUser 실패:", e.message);}
      })();

      // 3. 네이탈차트 + 성취카드 API 병렬 호출 (로딩 중)
      const cacheKey=`fy_astro_v5_${data.birth}`;
      const cacheTarotKey=`fy_tarot_v5_${data.birth}`;
      let astroResult=null, tarotResult=null;

      // sessionStorage 캐시 확인
      try{
        const ca=sessionStorage.getItem(cacheKey);
        const ct=sessionStorage.getItem(cacheTarotKey);
        if(ca) astroResult=JSON.parse(ca);
        if(ct) tarotResult=JSON.parse(ct);
      }catch{}

      const pillarsStr=data.pillars?.map(p=>`${p.name} ${p.gan.hanja}${p.ji.hanja}`).join(", ")||"";
      const ilganKo=data.pillars?.[2]?.gan?.ko||"무";
      const ilganHanja=data.pillars?.[2]?.gan?.hanja||"戊";
      const t=data.tarot;

      const fetchAstro=async()=>{
        if(astroResult) return;
        try{
          const prompt=buildAstroPrompt(pillarsStr,ilganKo,ilganHanja,data.birth);
          const text=await callNetlify({model:"claude-haiku-4-5-20251001",max_tokens:1200,messages:[{role:"user",content:prompt}]});
          astroResult=JSON.parse(text);
          try{sessionStorage.setItem(cacheKey,JSON.stringify(astroResult));}catch{}
        }catch(e){console.warn("astro API:", e);}
      };

      const fetchTarot=async()=>{
        if(tarotResult) return;
        try{
          const prompt=buildTarotPrompt(t,ilganKo,ilganHanja);
          const text=await callNetlify({model:"claude-haiku-4-5-20251001",max_tokens:250,messages:[{role:"user",content:prompt}]});
          tarotResult=JSON.parse(text);
          try{sessionStorage.setItem(cacheTarotKey,JSON.stringify(tarotResult));}catch{}
        }catch(e){console.warn("tarot API:", e);}
      };

      const cacheSevenKey=`fy_seven_v6_${data.birth}`;
      let sevenResult=null;
      try{const cs=sessionStorage.getItem(cacheSevenKey);if(cs)sevenResult=JSON.parse(cs);}catch{}

      const fetchSeven=async()=>{
        if(sevenResult) return;
        try{
          const sj=data.summary;
          const sys=sj?.sixSystems||[];
          const yf=sj?.yearForecast||[];
          const today=yf[0]||{};
          const best=[...yf].sort((a,b)=>b.score-a.score)[0]||{};
          const astroDesc=astroResult?`태양 ${stripDegree(astroResult.sun||"")} — ${(astroResult.sunDesc||"").slice(0,60)}`:"(분석 중)";
          const prompt=`다음은 ${data.name}님의 7가지 운명 분석 결과야.
사주 일주: ${sys[0]?.key||""} / ${sys[0]?.desc||""}
토정비결 총운: ${sys[1]?.key||""} — ${sys[1]?.desc||""}
주역 본명괘: ${sys[2]?.key||""} — ${sys[2]?.desc||""}
당사주: ${sys[3]?.key||""} / ${sys[3]?.desc||""}
점성술: ${astroDesc}
타로수비학: ${sys[5]?.key||""} / ${sys[5]?.desc||""}
MBTI: ${sys[6]?.key||""} / ${sys[6]?.desc||""}
올해(${today.year||CY}년) 운세: ${today.score||""}점
향후 가장 빛나는 해: ${best.year||""}년 ${best.score||""}점

이 7가지 체계를 깊이 교차 분석해서 ${data.name}님의 본질을 운세 에세이처럼 써줘.

[규칙 — 반드시 지킬 것]
1. 반드시 ~이야, ~해, ~야 체로만 작성해. ~에요, ~아요, ~해요, 세요 절대 금지. 콜론(:)·대시(-) 사용 절대 금지.
2. 총 400자 내외. 첫 문단(성격·성향 130자): 7체계 공통 메시지를 하나의 인물 서사로 녹여서 서술. "ENTJ와 무술 일주와 당사주의…" 같은 단순 나열 절대 금지. ${data.name}님이 어떤 사람인지를 한 편의 글처럼 자연스럽게 써줘. "당신" 대신 반드시 "${data.name}님"으로 지칭해줘.
3. 둘째 문단(운세 흐름 270자): 올해부터 가장 빛나는 해까지의 흐름을 연결된 서사로 써줘. 연도를 나열하지 말고, 지금 어떤 시기인지 → 어떻게 변화하는지 → 언제 정점을 맞는지를 흐름으로 표현해줘. 구체적인 조언 1개 포함. "당신" 대신 반드시 "${data.name}님"으로 지칭해줘.
4. 두 문단 사이에 빈 줄 하나
5. 마크다운, 이모지, 특수문자, 한자 단독 사용 금지
JSON만 응답: {"sevenInsight":"..."}`;
          const text=await callNetlify({model:"claude-haiku-4-5-20251001",max_tokens:700,messages:[{role:"user",content:prompt}]});
          sevenResult=JSON.parse(text);
          try{sessionStorage.setItem(cacheSevenKey,JSON.stringify(sevenResult));}catch{}
        }catch(e){console.warn("seven API:", e);}
      };

      const cacheInnerKey=`fy_inner_v2_${data.birth}`;
      let innerResult=null;
      try{const ci=sessionStorage.getItem(cacheInnerKey);if(ci)innerResult=JSON.parse(ci);}catch{}

      const fetchInner=async()=>{
        if(innerResult) return;
        try{
          const prompt=buildInnerPrompt(data);
          const text=await callNetlify({model:"claude-haiku-4-5-20251001",max_tokens:3000,messages:[{role:"user",content:prompt}]});
          innerResult=JSON.parse(text);
          try{sessionStorage.setItem(cacheInnerKey,JSON.stringify(innerResult));}catch{}
        }catch(e){console.warn("inner API:", e);}
      };

      // AI 호출 제거: 리포트(MoraReport)는 전부 로컬 계산(d.astro/d.tarot/d.daynight/d.mbti)만 사용하므로
      // astro/tarot/inner/seven API는 화면에 반영되지 않아 대기시간만 발생시켰음. sessionStorage 캐시가 있으면 그대로 사용.
      void fetchAstro; void fetchTarot; void fetchInner; void fetchSeven;

      // 4. API 결과를 reportData에 합쳐서 저장
      // 앞 2문장만 추출
      const take2=(s)=>{const arr=(s||"").split(/([.!?。])\s+/).reduce((acc,t,i,a)=>{if(i%2===0)acc.push(t+(a[i+1]||""));return acc;},[]).filter(Boolean);return arr.slice(0,2).join(" ").trim();};
      const updatedSixSystems=(data.summary?.sixSystems||[]).map(s=>{
        if(s.system!=="점성술") return s;
        if(!astroResult) return s;
        return {
          ...s,
          key:`태양 ${stripDegree(astroResult.sun)||""}`.trim(),
          desc:take2(astroResult.sunDesc)||astroResult.sunDesc||"",
        };
      });
      const enrichedData={
        ...data,
        _astroAI: astroResult,
        _tarotAI: tarotResult,
        _sevenAI: sevenResult,
        _innerAI: innerResult,
        summary:{
          ...data.summary,
          sixSystems: updatedSixSystems,
          sevenInsight: sevenResult?.sevenInsight || data.summary?.sevenInsight || "",
        },
      };
      setReportData(enrichedData);
      // 부모 AI 상태 업데이트 → 탭 전환·새로고침 시 재로딩 방지
      if(astroResult) setParentAstroAI(astroResult);
      if(tarotResult) setParentTarotAI(tarotResult);
      if(innerResult) setParentInnerAI(innerResult);
      try{
        sessionStorage.setItem("fy_report_v2",JSON.stringify(enrichedData));
        sessionStorage.setItem("fy_tab","요약");
      }catch{}

      // AI 포함된 완성 데이터로 Supabase 저장
      (async()=>{
        try{
          if(!savedUserId){const {userId}=await saveUser(formInput);savedUserId=userId;}
          await saveReport(savedUserId, enrichedData);
        }catch(e){console.warn("저장 실패:", e.message);}
      })();

      // 5. 로딩 종료 → 요약 탭
      setOpacity(0);
      setTimeout(()=>{
        setPhase("report");
        setTab("요약");
        setOpacity(1);
        window.scrollTo({top:0});
      },300);
    },350);
  }

  function goToForm(){
    setOpacity(0);
    try{sessionStorage.removeItem("fy_report_v2");sessionStorage.removeItem("fy_tab");}catch{}
    setTimeout(()=>{setPhase("intro");setOpacity(1);},300);
  }

  const [pdfLoading,setPdfLoading]=React.useState(false);

  async function handleSavePDF(){
    if(pdfLoading) return;
    setPdfLoading(true);
    try{
      const loadScript=(src)=>new Promise((res,rej)=>{
        if(document.querySelector(`script[src="${src}"]`)){res();return;}
        const s=document.createElement("script");
        s.src=src;s.onload=res;s.onerror=rej;
        document.head.appendChild(s);
      });
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");

      const container=document.createElement("div");
      container.style.cssText="position:fixed;left:-9999px;top:0;width:480px;background:#0D0A0F;font-family:'Noto Sans KR',sans-serif;box-sizing:border-box;";
      document.body.appendChild(container);

      const {createRoot}=await import("react-dom/client");
      const ce=React.createElement;
      const root=createRoot(container);
      await new Promise(res=>{root.render(ce(MoraReport,{d,onHome:()=>{},onSavePDF:null,pdfLoading:false,pdfMode:true,parentAstroAI,parentTarotAI}));setTimeout(res,1800);});

      const {jsPDF}=window.jspdf;
      const pdf=new jsPDF({orientation:"portrait",unit:"px",format:"a4"});
      const pageW=pdf.internal.pageSize.getWidth();
      const pageH=pdf.internal.pageSize.getHeight();
      const margin=16;

      // 각 챕터 = 1페이지. 가로폭은 (페이지폭 - 여백)에 고정해서 모든 장의 가로 스케일을 동일하게.
      // 내용이 짧으면 위쪽 정렬 + 아래는 배경색으로 채움. 아주 긴 챕터만 예외적으로 세로에 맞춰 축소.
      const chapterEls=container.querySelectorAll("[data-pdf-chapter]");
      const availW=pageW-margin*2;
      const availH=pageH-margin*2;
      let first=true;
      for(const el of chapterEls){
        const canvas=await window.html2canvas(el,{scale:2,useCORS:true,allowTaint:true,backgroundColor:"#0D0A0F"});
        let imgW=availW;
        let imgH=(canvas.height*imgW)/canvas.width;
        // 페이지보다 길면 세로 기준으로 축소 (가로 중앙정렬)
        if(imgH>availH){ imgH=availH; imgW=(canvas.width*imgH)/canvas.height; }
        const x=(pageW-imgW)/2;
        if(!first) pdf.addPage();
        first=false;
        // 배경색으로 페이지 전체를 먼저 채움 (짧은 페이지 빈 공간 처리)
        pdf.setFillColor(13,10,15);
        pdf.rect(0,0,pageW,pageH,"F");
        pdf.addImage(canvas.toDataURL("image/jpeg",0.92),"JPEG",x,margin,imgW,imgH);
      }
      root.unmount();
      document.body.removeChild(container);
      pdf.save(`${d.name}_운세종합.pdf`);
    }catch(e){
      console.error("PDF 오류:",e);
      alert("PDF 저장 중 오류가 발생했어.");
    }finally{
      setPdfLoading(false);
    }
  }

  const wrapStyle={transition:"opacity 0.35s ease",opacity};
  const d=reportData;

  if(showAdmin) return <AdminPage onClose={()=>setShowAdmin(false)}/>;
  if(phase==="loading") return <LoadingScreen name={reportData?.name||""}/>;
  if(phase==="intro") return <MoraIntro onEnter={(formInput)=>handleFormSubmit(formInput)}/>;
  if(!d) return null;

  return <MoraReport d={d} onHome={goToForm} onSavePDF={handleSavePDF} pdfLoading={pdfLoading} parentAstroAI={parentAstroAI} setParentAstroAI={setParentAstroAI} parentTarotAI={parentTarotAI} setParentTarotAI={setParentTarotAI}/>;
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 입력 폼 컴포넌트
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━



// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 입력 폼 컴포넌트 (이름·성별·생년월일·시간·출생지·MBTI)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SajuInputForm({onSubmit}){
  const [step,setStep]=useState(1);
  const [calType,setCalType]=useState("solar");
  const [isLeap,setIsLeap]=useState(false);
  const [form,setForm]=useState({
    name:"",year:"",month:"",day:"",
    hour:"12",minute:"00",
    gender:"여",city:"서울",
    mbti:"",
  });
  const [err,setErr]=useState({});
  const up=(k,v)=>setForm(f=>({...f,[k]:v}));
  const timeInputRef=useRef(null);
  const timeFieldRef=useRef(null);

  function validate1(){
    const e={};
    if(!form.name.trim()) e.name="이름을 입력해주세요";
    const y=parseInt(form.year),m=parseInt(form.month),d=parseInt(form.day);
    if(!form.year||!form.birthRaw||y<1931||y>2030) e.year="생년월일 6자리를 입력해주세요";
    if(!form.month||m<1||m>12) e.month="월을 확인해주세요";
    if(!form.day||d<1||d>31) e.day="일을 확인해주세요";
    if(!Object.keys(e).length && calType==="lunar"){
      const converted=lunarToSolar(y,m,d,isLeap);
      if(!converted){
        e.year = isLeap
          ? `${m}월에는 윤달이 없어요. 윤달 여부를 확인해주세요`
          : "해당 음력 날짜를 변환할 수 없어요";
      }
      else { up("year",String(converted.year)); up("month",String(converted.month)); up("day",String(converted.day)); }
    }
    setErr(e);
    return Object.keys(e).length===0;
  }
  function next(){if(step===1&&validate1()) setStep(2); else if(step===2) setStep(3);}

  const OC2={여:{bg:"#fce4ec",c:"#880e4f"},남:{bg:"#e3f2fd",c:"#0d47a1"}};

  // 스텝 1: 기본 정보 (이름·성별·생년월일·시간·출생지 한 페이지)
  if(step===1) return(
    <div style={SF.root}>
      <div style={SF.header}>
        <div style={{width:32}}/>
        <div style={SF.title}>Fortuneyam</div>
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
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
            <div style={SF.label}>생년월일</div>
            <div style={{display:"flex",gap:4}}>
              {["solar","lunar"].map(t=>(
                <button key={t} onClick={()=>{setCalType(t);if(t==="solar")setIsLeap(false);}}
                  style={{padding:"4px 12px",borderRadius:99,border:"1.5px solid #e65100",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",
                    background:calType===t?"#e65100":"#fff",color:calType===t?"#fff":"#e65100"}}>
                  {t==="solar"?"양력":"음력"}
                </button>
              ))}
            </div>
          </div>
          <input style={{...SF.input,...((err.year||err.month||err.day)?SF.inputErr:{})}}
            placeholder="90.01.01" value={form.birthRaw||""} maxLength={8} inputMode="numeric"
            onChange={ev=>{
              const raw=ev.target.value.replace(/\D/g,"");
              let fmt=raw;
              if(raw.length>2) fmt=raw.slice(0,2)+"."+raw.slice(2);
              if(raw.length>4) fmt=raw.slice(0,2)+"."+raw.slice(2,4)+"."+raw.slice(4);
              up("birthRaw",fmt);
              if(raw.length>=6){
                const yy=parseInt(raw.slice(0,2));
                up("year",String(yy<=30?2000+yy:1900+yy));
                up("month",String(parseInt(raw.slice(2,4))));
                up("day",String(parseInt(raw.slice(4,6))));
                setIsLeap(false); // 날짜 다시 입력하면 평달로 초기화
                // 모바일 대응: focus() 대신 하이라이트 + scrollIntoView
                setTimeout(()=>{
                  timeInputRef.current?.focus();
                  timeFieldRef.current?.scrollIntoView({behavior:"smooth",block:"center"});
                },80);
              }
            }}/>
          {(err.year||err.month||err.day)&&<div style={SF.errMsg}>{err.year||err.month||err.day}</div>}
          <div style={SF.hint}>{calType==="solar"?"양력 기준":"음력 기준: 양력으로 자동 변환돼요"}</div>
          {calType==="lunar"&&(()=>{
            const ly=parseInt(form.year);
            const lm=(form.year&&form.month)?getLeapMonth(ly):null;
            // 입력한 달에 윤달이 존재할 때만 평달/윤달 선택 노출
            if(lm && parseInt(form.month)===lm){
              return (
                <div style={{marginTop:8}}>
                  <div style={{fontSize:10,color:"#888",marginBottom:6,lineHeight:1.6}}>
                    {ly}년 {lm}월에는 윤달이 있어요. 어느 쪽 태생인가요?
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    {[{v:false,l:"평달"},{v:true,l:`윤${lm}월`}].map(o=>(
                      <button key={o.l} onClick={()=>setIsLeap(o.v)}
                        style={{flex:1,padding:"8px 0",borderRadius:8,border:"1.5px solid #e65100",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",
                          background:isLeap===o.v?"#e65100":"#fff",color:isLeap===o.v?"#fff":"#e65100"}}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* 태어난 시간 */}
        <div ref={timeFieldRef} style={SF.field}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
            <div style={SF.label}>태어난 시간</div>
            <span style={{fontSize:10,color:"#aaa",fontWeight:400}}>모르면 비워도 돼요</span>
          </div>
          <input ref={timeInputRef} style={{...SF.input,...(err.time?SF.inputErr:{})}}
            placeholder="22:25" value={form.timeRaw||""} maxLength={5} inputMode="numeric"
            onChange={ev=>{
              const raw=ev.target.value.replace(/\D/g,"");
              let fmt=raw;
              if(raw.length>2) fmt=raw.slice(0,2)+":"+raw.slice(2);
              up("timeRaw",fmt);
              if(raw.length>=4){
                const h=parseInt(raw.slice(0,2)),m2=parseInt(raw.slice(2,4));
                if(h>=0&&h<=23&&m2>=0&&m2<=59){ up("hour",String(h).padStart(2,"0")); up("minute",String(m2).padStart(2,"0")); }
              } else if(raw.length===0){ up("hour","12"); up("minute","00"); }
            }}/>
          {err.time&&<div style={SF.errMsg}>{err.time}</div>}
          {(form.hour==="23"||form.hour==="00")&&(
            <div style={{marginTop:6,padding:"8px 11px",background:"#fff8e1",borderRadius:9,border:"1px solid #ffb300",fontSize:10,color:"#7b5800",lineHeight:1.6}}>
              ⚠️ 자시(子時) 경계 구간: 두 가지 일주를 함께 분석해드려요.
            </div>
          )}
        </div>

        {/* 출생지 */}
        <div style={SF.field}>
          <div style={SF.label}>태어난 곳</div>
          <select style={SF.select} value={form.city} onChange={e=>up("city",e.target.value)}>
            {CITIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>

        <button style={SF.btn} onClick={next}>다음 →</button>
      </div>
    </div>
  );

  // 스텝 2: MBTI
  if(step===2) return(
    <div style={SF.root}>
      <div style={SF.header}>
        <button style={SF.back} onClick={()=>setStep(1)}>‹</button>
        <div style={SF.title}>Fortuneyam</div>
        <div style={{width:32}}/>
      </div>
      <div style={SF.progress}>
        {[1,2,3].map(s=><div key={s} style={{...SF.dot,background:s<=step?"#e65100":"#e0e0e0"}}/>)}
      </div>
      <div style={SF.content}>
        <div style={SF.stepLabel}>STEP 2 · MBTI</div>
        <div style={SF.heading}>MBTI를 알고 있나요?</div>
        <div style={{...SF.field}}>
          <div style={{...SF.label,display:"flex",justifyContent:"space-between"}}>
            <span>MBTI</span>
            <span style={{fontSize:10,color:"#aaa",fontWeight:400}}>선택사항</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
            {["ISTJ","ISFJ","INFJ","INTJ","ISTP","ISFP","INFP","INTP","ESTP","ESFP","ENFP","ENTP","ESTJ","ESFJ","ENFJ","ENTJ"].map(t=>(
              <button key={t} onClick={()=>up("mbti",form.mbti===t?"":t)}
                style={{padding:"7px 0",borderRadius:8,border:"1.5px solid #e0e0e0",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textAlign:"center",
                  background:form.mbti===t?"#e65100":"#fff",color:form.mbti===t?"#fff":"#666"}}>
                {t}
              </button>
            ))}
            <button onClick={()=>up("mbti",form.mbti==="모름"?"":"모름")}
              style={{gridColumn:"span 4",padding:"7px 0",borderRadius:8,border:"1.5px solid #e0e0e0",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",
                background:form.mbti==="모름"?"#888":"#fff",color:form.mbti==="모름"?"#fff":"#999"}}>
              잘 모르겠어요
            </button>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginTop:16}}>
          <button style={{...SF.btn,flex:1,background:"#f5f5f5",color:"#555"}} onClick={()=>setStep(1)}>← 이전</button>
          <button style={{...SF.btn,flex:2}} onClick={next}>다음 →</button>
        </div>
      </div>
    </div>
  );

  // 스텝 3: 확인
  const birthStr=`양력 ${form.year}년 ${form.month}월 ${form.day}일 ${form.hour}시 ${form.minute}분`;
  return(
    <div style={SF.root}>
      <div style={SF.header}>
        <button style={SF.back} onClick={()=>setStep(2)}>‹</button>
        <div style={SF.title}>Fortuneyam</div>
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
            {icon:"👤",label:"이름",value:form.name,s:1},
            {icon:form.gender==="여"?"👩":"👨",label:"성별",value:form.gender==="여"?"여성":"남성",s:1},
            {icon:"📅",label:"생년월일",value:`${form.year}.${form.month.padStart(2,"0")}.${form.day.padStart(2,"0")}`,s:1},
            {icon:"🕐",label:"태어난 시간",value:`${form.hour}시 ${form.minute}분`,s:1},
            {icon:"📍",label:"태어난 곳",value:form.city,s:1},
            ...(form.mbti&&form.mbti!=="모름"?[{icon:"🧠",label:"MBTI",value:form.mbti,s:2}]:[]),
          ].map(({icon,label,value,s},i,arr)=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none"}}>
              <span style={{fontSize:18,width:24}}>{icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:"#aaa",fontWeight:600}}>{label}</div>
                <div style={{fontSize:14,fontWeight:800,color:"#111",marginTop:1}}>{value}</div>
              </div>
              <button onClick={()=>setStep(s)}
                style={{fontSize:10,color:"#e65100",background:"#fff3e0",border:"none",padding:"4px 10px",borderRadius:99,cursor:"pointer",fontWeight:700}}>
                수정
              </button>
            </div>
          ))}
        </div>
        <div style={{padding:"12px 14px",background:"#e3f2fd",borderRadius:12,marginBottom:16,fontSize:11,color:"#0d47a1",lineHeight:1.7}}>
          ✨ 입력 정보로 사주팔자를 계산하고 종합 운세 리포트를 생성해요.
        </div>
        <button style={{...SF.btn,fontSize:15,padding:"16px 0",background:"linear-gradient(135deg,#e65100,#bf360c)"}}
          onClick={()=>onSubmit(form)}>
          🔮 Fortuneyam 보기
        </button>
        <button style={{...SF.btn,background:"#f5f5f5",color:"#555",marginTop:8}} onClick={()=>setStep(1)}>
          ← 다시 입력
        </button>
      </div>
    </div>
  );
}

