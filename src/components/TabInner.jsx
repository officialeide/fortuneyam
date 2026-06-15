// components/TabInner.jsx
import React, { useState, useRef, useEffect } from 'react';
import { cleanText } from '../data/constants.js';
import { callNetlify } from '../utils/callNetlify.js';
import { buildInnerPrompt, DEEP_CARDS, buildDeepPrompt } from '../utils/prompts.js';
import { S, ST } from './ui.jsx';


function TabInner({d,parentInnerAI,setParentInnerAI}){
  const cacheKey=k=>`fy_inner_${k}_${d.birth}`;
  const dn=d.daynight;

  // ── 기본 inner 상태 (부모→d._innerAI→sessionStorage 순) ──
  const [innerAI,setInnerAI]=React.useState(()=>{
    if(parentInnerAI) return parentInnerAI;
    if(d._innerAI) return d._innerAI;
    try{const s=sessionStorage.getItem(`fy_inner_v2_${d.birth}`);return s?JSON.parse(s):null;}catch{return null;}
  });
  // innerLoading: 데이터 없으면 true로 시작해서 즉시 스켈레톤 표시
  const [innerLoading,setInnerLoading]=React.useState(()=>{
    if(parentInnerAI||d._innerAI) return false;
    try{return !sessionStorage.getItem(`fy_inner_v2_${d.birth}`);}catch{return true;}
  });
  const [innerErr,setInnerErr]=React.useState(false);

  // 기본 4개 아코디언 열림 상태
  const [basicOpen,setBasicOpen]=React.useState({rhythm:true,vitality:false});

  // ── 딥카드 4개 상태 ──
  const [deepData,setDeepData]=React.useState(()=>{
    const init={};
    DEEP_CARDS.forEach(c=>{
      try{const s=sessionStorage.getItem(cacheKey(c.key));if(s)init[c.key]=JSON.parse(s);}catch{}
    });
    return init;
  });
  const [deepLoading,setDeepLoading]=React.useState({});
  const [deepErr,setDeepErr]=React.useState({});
  const [deepOpen,setDeepOpen]=React.useState({});
  const renderedGroups=React.useRef(new Set());

  // 부모 상태 동기화
  React.useEffect(()=>{
    if(innerAI&&setParentInnerAI) setParentInnerAI(innerAI);
  },[innerAI]);

  // 재시도 가능한 fetch 함수
  async function runInnerFetch(){
    setInnerLoading(true);setInnerErr(false);
    try{
      const text=await callNetlify({model:"claude-haiku-4-5-20251001",max_tokens:3000,messages:[{role:"user",content:buildInnerPrompt(d)}]});
      const parsed=JSON.parse(text);
      setInnerAI(parsed);
      if(setParentInnerAI) setParentInnerAI(parsed);
      try{sessionStorage.setItem(`fy_inner_v2_${d.birth}`,JSON.stringify(parsed));}catch{}
    }catch(e){console.error("inner:",e);setInnerErr(true);}
    setInnerLoading(false);
  }

  // 탭 진입 시 자동 fetch
  React.useEffect(()=>{
    if(innerAI){setInnerLoading(false);return;}
    let cancelled=false;
    async function run(){
      setInnerLoading(true);setInnerErr(false);
      try{
        const text=await callNetlify({model:"claude-haiku-4-5-20251001",max_tokens:3000,messages:[{role:"user",content:buildInnerPrompt(d)}]});
        const parsed=JSON.parse(text);
        if(!cancelled){
          setInnerAI(parsed);
          if(setParentInnerAI) setParentInnerAI(parsed);
          try{sessionStorage.setItem(`fy_inner_v2_${d.birth}`,JSON.stringify(parsed));}catch{}
        }
      }catch(e){console.error("inner:",e);if(!cancelled)setInnerErr(true);}
      if(!cancelled)setInnerLoading(false);
    }
    run();
    return()=>{cancelled=true;};
  },[d.birth]);

  // 딥카드 개별 fetch
  async function fetchDeep(key){
    if(deepData[key]||deepLoading[key]) return;
    setDeepLoading(p=>({...p,[key]:true}));
    setDeepErr(p=>({...p,[key]:false}));
    try{
      const text=await callNetlify({model:"claude-haiku-4-5-20251001",max_tokens:1200,messages:[{role:"user",content:buildDeepPrompt(key,d)}]});
      const parsed=JSON.parse(text);
      setDeepData(p=>({...p,[key]:parsed}));
      try{sessionStorage.setItem(cacheKey(key),JSON.stringify(parsed));}catch{}
    }catch(e){console.error("deep:",e);setDeepErr(p=>({...p,[key]:true}));}
    setDeepLoading(p=>({...p,[key]:false}));
  }

  function toggleDeep(key){
    const next=!deepOpen[key];
    setDeepOpen(p=>({...p,[key]:next}));
    if(next) fetchDeep(key);
  }

  // 공통 스켈레톤
  const shimmerStyle=`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`;
  const Skel=({w="100%",h=11})=><div style={{height:h,width:w,background:"linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)",backgroundSize:"200% 100%",borderRadius:99,marginBottom:5,animation:"shimmer 1.4s infinite"}}/>;
  const SkelBlock=({err,onRetry})=>(
    <div style={{padding:"4px 0 8px",display:"flex",flexDirection:"column",gap:4}}>
      {err
        ?<div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-start"}}>
            <p style={{fontSize:12,color:"#ef5350",margin:0}}>분석 중 오류가 생겼어요.</p>
            {onRetry&&<button onClick={onRetry} style={{fontSize:11,fontWeight:700,color:"#e65100",background:"#fff3e0",border:"1px solid #ffcc80",padding:"5px 12px",borderRadius:8,cursor:"pointer",fontFamily:"inherit"}}>다시 시도</button>}
          </div>
        :[100,90,95,80,85,70].map((w,i)=><Skel key={i} w={`${w}%`}/>)
      }
    </div>
  );

  // 아코디언 헤더 — 내면의 리듬과 동일한 흰색 서식 통일
  const AccHead=({open,onToggle,icon,title})=>(
    <div onClick={onToggle} style={{
      display:"flex",alignItems:"center",justifyContent:"space-between",
      padding:"14px 16px",background:"#fff",
      border:"1px solid #ebebeb",
      borderRadius:open?"12px 12px 0 0":"12px",
      cursor:"pointer",transition:"border-radius 0.2s",
    }}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:18}}>{icon}</span>
        <span style={{fontSize:14,fontWeight:800,color:"#111"}}>{title}</span>
      </div>
      <span style={{fontSize:11,color:"#ccc",transform:open?"rotate(180deg)":"none",transition:"transform 0.2s"}}>▼</span>
    </div>
  );

  // 딥카드 바디
  const DeepBody=({cardKey,bg,border,dark})=>{
    const data=deepData[cardKey];
    const loading=deepLoading[cardKey];
    const err=deepErr[cardKey];
    return(
      <div style={{padding:"14px 16px",background:"#fff",border:"1px solid #ebebeb",borderTop:"none",borderRadius:"0 0 12px 12px"}}>
        {(loading||(!data&&!err))
          ?<SkelBlock err={false}/>
          :err?<SkelBlock err={true}/>
          :<>
            <p style={{fontSize:12,color:"#444",lineHeight:1.85,margin:"0 0 10px",textAlign:"justify"}}>{data.para1}</p>
            <p style={{fontSize:12,color:"#444",lineHeight:1.85,margin:"0 0 10px",textAlign:"justify"}}>{data.para2}</p>
            <p style={{fontSize:12,fontWeight:800,color:"#111",lineHeight:1.75,margin:0,textAlign:"justify"}}>{data.conclusion}</p>
          </>
        }
      </div>
    );
  };

  renderedGroups.current=new Set();

  return <>
    <style>{shimmerStyle}</style>

    {/* ─── 낮의 나 ─── */}
    <section style={S.card}>
      <ST icon="☀️" title="낮의 나: 사회적 페르소나"/>
      <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
        {[
          {t:"첫인상",c:"#e3f2fd",tc:"#0d47a1",v:dn.day.impression},
          {t:"사회에서 쓰는 가면",c:"#f3e5f5",tc:"#4a148c",v:dn.day.mask},
        ].map(({t,c,tc,v})=>(
          <div key={t} style={{minHeight:72,padding:"10px 14px",background:c,borderRadius:11,display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <div style={{fontSize:11,fontWeight:800,color:tc,marginBottom:v?4:0}}>{t}</div>
            {v&&<p style={{fontSize:12,color:"#333",margin:0,lineHeight:1.75,textAlign:"justify"}}>{v}</p>}
          </div>
        ))}
      </div>
    </section>

    {/* ─── 밤의 나 ─── */}
    <section style={S.card}>
      <ST icon="🌙" title="밤의 나: 숨겨진 본능과 욕망"/>
      <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
        {/* 내면 결핍·욕망 */}
        <div style={{padding:"10px 14px",background:"#1a1a2e",borderRadius:11}}>
          <div style={{fontSize:11,fontWeight:800,color:"#a78bfa",marginBottom:5}}>내면의 결핍과 진짜 욕망</div>
          {dn.night.desire&&<p style={{fontSize:12,color:"#e8e8f0",margin:0,lineHeight:1.75}}>{dn.night.desire}</p>}
          {dn.night.desire2&&<p style={{fontSize:12,color:"#d8b4fe",margin:"8px 0 0",lineHeight:1.75,borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:8}}>{dn.night.desire2}</p>}
        </div>
        {/* 매력·이상형·궁합 통합 */}
        <div style={{padding:"10px 14px",background:"#1e1b4b",borderRadius:11}}>
          <div style={{fontSize:11,fontWeight:800,color:"#818cf8",marginBottom:8}}>관계 에너지</div>
          {dn.night.attraction&&<div style={{marginBottom:8}}>
            <div style={{fontSize:10,color:"#c4b5fd",fontWeight:700,marginBottom:3}}>매력</div>
            <p style={{fontSize:12,color:"#e8e8f0",margin:0,lineHeight:1.75}}>{dn.night.attraction}</p>
          </div>}
          {dn.night.idealType&&<div style={{marginBottom:8,paddingTop:8,borderTop:"1px solid rgba(255,255,255,0.1)"}}>
            <div style={{fontSize:10,color:"#7dd3fc",fontWeight:700,marginBottom:3}}>이상형</div>
            <p style={{fontSize:12,color:"#e8e8f0",margin:0,lineHeight:1.75}}>{dn.night.idealType}</p>
          </div>}
          {dn.night.idealType2&&<div style={{paddingTop:8,borderTop:"1px solid rgba(255,255,255,0.1)"}}>
            <div style={{fontSize:10,color:"#86efac",fontWeight:700,marginBottom:3}}>실제 궁합</div>
            <p style={{fontSize:12,color:"#e8e8f0",margin:0,lineHeight:1.75}}>{dn.night.idealType2}</p>
          </div>}
        </div>
      </div>
    </section>

    {/* ─── 내면의 리듬 — 아코디언, 디폴트 열림 ─── */}
    {(()=>{
      const open=basicOpen.rhythm;
      return(
        <div>
          <AccHead open={open} onToggle={()=>setBasicOpen(p=>({...p,rhythm:!p.rhythm}))} icon="🌊" title="내면의 리듬"/>
          {open&&(
            <div style={{padding:"14px 16px",background:"#fff",border:"1px solid #ebebeb",borderTop:"none",borderRadius:"0 0 12px 12px"}}>
              {innerLoading
                ?<SkelBlock err={false}/>
                :innerErr
                  ?<SkelBlock err={true} onRetry={runInnerFetch}/>
                  :innerAI
                    ?<>{cleanText(innerAI.innerRhythm||"").split("\n\n").map((para,i)=>(
                        <p key={i} style={{fontSize:12,color:"#444",lineHeight:1.85,margin:i>0?"10px 0 0":"0",textAlign:"justify",whiteSpace:"pre-line"}}>{para}</p>
                      ))}</>
                    :<SkelBlock err={false}/>
              }
            </div>
          )}
        </div>
      );
    })()}

    {/* ─── 활력 충전법 (운동+취미 통합) ─── */}
    {(()=>{
      const open=basicOpen.vitality;
      return(
        <div>
          <AccHead open={open} onToggle={()=>setBasicOpen(p=>({...p,vitality:!p.vitality}))} icon="⚡" title="활력 충전법"/>
          {open&&(
            <div style={{padding:"14px 16px",background:"#fff",border:"1px solid #ebebeb",borderTop:"none",borderRadius:"0 0 12px 12px"}}>
              {!innerAI?<SkelBlock err={innerErr} onRetry={innerErr?runInnerFetch:undefined}/>:<>
                <div style={{fontSize:11,fontWeight:800,color:"#166534",marginBottom:8}}>🏃 운동</div>
                <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
                  {(innerAI.exercise||[]).map((ex,i)=>(
                    <div key={i} style={{padding:"10px 13px",background:"#f0fdf4",borderRadius:10,border:"1px solid #bbf7d0"}}>
                      <div style={{fontSize:12,fontWeight:900,color:"#166534",marginBottom:4,wordBreak:"keep-all"}}>{ex.name}</div>
                      <p style={{fontSize:12,color:"#444",margin:0,lineHeight:1.7}}>{cleanText(ex.reason)}</p>
                    </div>
                  ))}
                </div>
                <div style={{fontSize:11,fontWeight:800,color:"#6b21a8",marginBottom:8}}>🎨 취미</div>
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {(innerAI.hobby||[]).map((h,i)=>(
                    <div key={i} style={{padding:"10px 13px",background:"#fdf4ff",borderRadius:10,border:"1px solid #e9d5ff"}}>
                      <div style={{fontSize:12,fontWeight:900,color:"#6b21a8",marginBottom:4,wordBreak:"keep-all"}}>{h.name}</div>
                      <p style={{fontSize:12,color:"#444",margin:0,lineHeight:1.7}}>{cleanText(h.reason)}</p>
                    </div>
                  ))}
                </div>
              </>}
            </div>
          )}
        </div>
      );
    })()}

    {/* ─── 딥카드 4개 ─── */}
    {DEEP_CARDS.map(card=>{
      const open=deepOpen[card.key];
      return(
        <div key={card.key}>
          <AccHead open={open} onToggle={()=>toggleDeep(card.key)} icon={card.icon} title={card.title}/>
          {open&&<DeepBody cardKey={card.key} bg={card.bg} border={card.border} dark={card.dark}/>}
        </div>
      );
    })}
  </>;
}


export default TabInner;
