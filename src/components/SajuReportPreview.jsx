// components/SajuReportPreview.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { S } from './ui.jsx';

function SajuReport_Preview({data}){
  const [tab,setTab]=useState("요약");
  // Preview 전용 local state — 부모 SajuReport의 state와 무관
  const [previewAstroAI,setPreviewAstroAI]=useState(data?._astroAI||null);
  const [previewTarotAI,setPreviewTarotAI]=useState(data?._tarotAI||null);
  const [previewInnerAI,setPreviewInnerAI]=useState(data?._innerAI||null);
  const TABS=["요약","사주","토정·주역","별자리·타로수비학","MBTI","내면 해부"];
  if(!data) return <div style={{padding:20,color:"#aaa"}}>데이터 없음</div>;
  return(
    <div style={{maxWidth:480,margin:"0 auto"}}>
      <div style={{padding:"10px 16px",background:"#fff3e0",fontSize:11,color:"#e65100",textAlign:"center",fontWeight:700}}>
        관리자 미리보기: {data.name} ({data.birth})
      </div>
      <div style={{...S.tabBar,overflowX:"auto"}}>
        {TABS.map(t=><button key={t} onClick={()=>setTab(t)} style={{...S.tab,whiteSpace:"nowrap",...(tab===t?S.tabA:{})}}>{t}</button>)}
      </div>
      <div style={S.content}>
        {tab==="요약"        && <TabSummary d={data} changeTab={setTab}/>}
        {tab==="사주"        && <TabSaju d={data} reportData={data}/>}
        {tab==="내면 해부"   && <TabInner d={data} parentInnerAI={previewInnerAI} setParentInnerAI={setPreviewInnerAI}/>}
        {tab==="토정·주역"   && <TabTojung d={data}/>}
        {tab==="별자리·타로수비학" && <TabAstro d={data} parentAstroAI={previewAstroAI} setParentAstroAI={setPreviewAstroAI} parentTarotAI={previewTarotAI} setParentTarotAI={setPreviewTarotAI}/>}
        {tab==="MBTI"        && <TabMBTI d={data}/>}
      </div>
    </div>
  );
}

function SajuInputForm({onSubmit}){
  const [step,setStep]=useState(1);
  const [calType,setCalType]=useState("solar");
  const [form,setForm]=useState({
    name:"",year:"",month:"",day:"",
    hour:"12",minute:"00",
    gender:"여",city:"서울",
    mbti:"",
  });
  const [err,setErr]=useState({});
  const [dateDone,setDateDone]=useState(false);
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
      const converted=lunarToSolar(y,m,d);
      if(!converted){ e.year="해당 음력 날짜를 변환할 수 없어요 (1990~2025 지원)"; }
      else { up("year",String(converted.year)); up("month",String(converted.month)); up("day",String(converted.day)); }
    }
    setErr(e);
    return Object.keys(e).length===0;
  }
  function next(){if(step===1&&validate1()) setStep(2); else if(step===2) setStep(3);}

  const OC2={여:{bg:"#fce4ec",c:"#880e4f"},남:{bg:"#e3f2fd",c:"#0d47a1"}};


export { SajuReport_Preview };
