// components/SajuReportPreview.jsx
import React, {{ useState, useMemo, useRef, useEffect }} from 'react';
import {{ GT, ST, Ring, sc, scBg, GCard, JCard, Acc, S, SF, HJ }} from './ui.jsx';
import {{ OC, GD, JD, GL, JL, GH, JH, gc, jc, yyE, OHK, cleanText, stripDegree,
  ILGAN_TITLE, ILGAN_PHILOSOPHY, GWAN_O, CY, CM, CD, TRIGRAM,
  BYEOLSEONG, STAGES, STAGE_DESC, TOJUNG_SAJA }} from '../data/constants.js';
import {{ getComboDesc }} from '../data/comboDB.js';
import {{ callNetlify }} from '../utils/callNetlify.js';
import {{ buildInnerPrompt, buildDeepPrompt, DEEP_CARDS }} from '../utils/prompts.js';

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

export { SajuReport_Preview };
