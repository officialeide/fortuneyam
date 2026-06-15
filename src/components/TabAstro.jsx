// components/TabAstro.jsx
import { useState, useRef, useEffect } from 'react';
import { CY, stripDegree, cleanText } from '../data/constants.js';
import { callNetlify } from '../utils/callNetlify.js';
import { buildTarotPrompt, buildAstroPrompt } from '../utils/prompts.js';
import { S, ST, HJ, GT, sc, Ring } from './ui.jsx';


function TabAstro({d,parentAstroAI,setParentAstroAI,parentTarotAI,setParentTarotAI}){
  const a=d.astro,t=d.tarot;
  // 부모 상태 우선 → d._astroAI → null 순서
  const astroAI=parentAstroAI||d._astroAI||null;
  const tarotAI=parentTarotAI||d._tarotAI||null;
  const setAstroAI=(v)=>{if(setParentAstroAI)setParentAstroAI(v);};
  const setTarotAI=(v)=>{if(setParentTarotAI)setParentTarotAI(v);};
  const [loadingAstro,setLoadingAstro]=React.useState(!astroAI);
  const [loadingTarot,setLoadingTarot]=React.useState(!tarotAI);
  const [errAstro,setErrAstro]=React.useState(false);
  const [errTarot,setErrTarot]=React.useState(false);
  const fetchNatalRef=React.useRef(null);
  const fetchTarotRef=React.useRef(null);

  React.useEffect(()=>{
    // 부모에 이미 데이터 있으면 API 재호출 불필요
    if(astroAI && tarotAI){setLoadingAstro(false);setLoadingTarot(false);return;}
    let cancelled=false;
    async function fetchNatal(){
      if(astroAI){setLoadingAstro(false);return;}
      setLoadingAstro(true);
      setErrAstro(false);
      try{
        const pillarsStr=d.pillars?.map(p=>`${p.name} ${p.gan.hanja}${p.ji.hanja}`).join(", ")||"";
        const ilganKo=d.pillars?.[2]?.gan?.ko||"무";
        const ilganHanja=d.pillars?.[2]?.gan?.hanja||"戊";
        const prompt=buildAstroPrompt(pillarsStr,ilganKo,ilganHanja,d.birth);
        const text=await callNetlify({model:"claude-haiku-4-5-20251001",max_tokens:1200,messages:[{role:"user",content:prompt}]});
        const parsed=JSON.parse(text);
        if(!cancelled) setAstroAI(parsed);
      }catch(e){console.error("astro:",e);if(!cancelled)setErrAstro(true);}
      if(!cancelled) setLoadingAstro(false);
    }
    async function fetchTarot(){
      if(tarotAI){setLoadingTarot(false);return;}
      setLoadingTarot(true);
      setErrTarot(false);
      try{
        const ilganKo=d.pillars?.[2]?.gan?.ko||"무";
        const ilganHanja=d.pillars?.[2]?.gan?.hanja||"戊";
        const prompt=buildTarotPrompt(t,ilganKo,ilganHanja);
        const text=await callNetlify({model:"claude-haiku-4-5-20251001",max_tokens:250,messages:[{role:"user",content:prompt}]});
        const parsed=JSON.parse(text);
        if(!cancelled) setTarotAI(parsed);
      }catch(e){console.error("tarot:",e);if(!cancelled)setErrTarot(true);}
      if(!cancelled) setLoadingTarot(false);
    }
    fetchNatalRef.current=fetchNatal;
    fetchTarotRef.current=fetchTarot;
    Promise.all([fetchNatal(), fetchTarot()]);
    return()=>{cancelled=true;};
  },[d.birth]);

  const sunData=astroAI||a;
  const achieveDesc=tarotAI?.achieveDesc||t.achieveDesc;

  // 스켈레톤 컴포넌트
  const Skel=({h=12,w="100%",r=6})=><div style={{height:h,width:w,background:"linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)",backgroundSize:"200% 100%",borderRadius:r,animation:"shimmer 1.4s infinite",marginBottom:4}}/>;
  const shimmerStyle=`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`;

  return <>
    <style>{shimmerStyle}</style>
    <section style={S.card}>
      <ST icon="✨" title="서양 점성술 네이탈 차트"/>
      <GT>{"출생 시각과 장소를 기준으로 행성의 위치를 분석합니다."}<br/>{"태양·달·ASC 삼각 관계가 성격의 핵심 구조를 이룹니다."}</GT>
      <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:7}}>
        {[
          {l:"태양 ☉",v:sunData.sun,meaning:a.sunMeaning,desc:sunData.sunDesc,bg:"#fff8e1",c:"#f57f17"},
          {l:"달 ☽",v:sunData.moon,meaning:a.moonMeaning,desc:sunData.moonDesc,bg:"#e8f5e0",c:"#2e7d32"},
          {l:"ASC 상승점",v:sunData.asc,meaning:a.ascMeaning,desc:sunData.ascDesc,bg:"#fce4ec",c:"#880e4f"},
          {l:"수성 ☿",v:sunData.mercury,meaning:"언어·사고·소통 방식",desc:sunData.mercuryDesc,bg:"#f3f3f3",c:"#424242"},
          {l:"금성 ♀",v:sunData.venus,meaning:"사랑·가치관·매력",desc:sunData.venusDesc,bg:"#fce4ec",c:"#c62828"},
          {l:"화성 ♂",v:sunData.mars,meaning:"행동력·에너지·욕망",desc:sunData.marsDesc,bg:"#fdecea",c:"#b71c1c"},
        ].map((item,i)=>(
          <div key={i} style={{padding:"10px 13px",background:item.bg,borderRadius:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
              <span style={{fontSize:10,fontWeight:700,color:item.c,minWidth:72,flexShrink:0}}>{item.l}</span>
              {loadingAstro
                ? <Skel h={14} w="60%" r={4}/>
                : <span style={{fontSize:12,fontWeight:900,color:"#111"}}>{stripDegree(cleanText(item.v))}</span>}
            </div>
            <div style={{fontSize:10,color:"#999",marginBottom:4}}>{item.meaning}</div>
            {loadingAstro
              ? <><Skel h={11} w="100%"/><Skel h={11} w="80%"/></>
              : <p style={{fontSize:11,color:"#555",margin:0,lineHeight:1.65,textAlign:"justify"}}>{cleanText(item.desc)}</p>}
          </div>
        ))}
      </div>
      <div style={{marginTop:10,padding:"11px 13px",background:"#f3e5f5",borderRadius:10}}>
        <div style={{fontSize:10,color:"#4a148c",fontWeight:700,marginBottom:4}}>삼각 핵심 분석</div>
        {loadingAstro
          ? <><Skel h={12} w="100%"/><Skel h={12} w="90%"/><Skel h={12} w="70%"/></>
          : <p style={{fontSize:12,color:"#444",margin:0,lineHeight:1.8,textAlign:"justify"}}><HJ>{cleanText(astroAI?.triangle||a.triangle)}</HJ></p>}
      </div>
      {errAstro&&<div style={{marginTop:8,padding:"11px 12px",background:"#fdecea",borderRadius:10,fontSize:11,color:"#b71c1c",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>네이탈 차트 분석을 불러오지 못했어요.</span>
        <button onClick={()=>fetchNatalRef.current&&fetchNatalRef.current()} style={{fontSize:10,fontWeight:700,color:"#b71c1c",background:"none",border:"1px solid #b71c1c",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontFamily:"inherit"}}>다시 시도</button>
      </div>}
      {(a.yearTransit||[]).length>0&&<div style={{marginTop:12}}><div style={{fontSize:11,fontWeight:800,color:"#333",marginBottom:8}}>주요 트랜짓 {CY}~{CY+4}</div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {a.yearTransit.map((y,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#fafafa",borderRadius:10,border:"1px solid #eee"}}><Ring score={y.score} size={44}/><div style={{flex:1}}><div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2,flexWrap:"wrap"}}><span style={{fontSize:12,fontWeight:900,color:"#111"}}>{y.year}년</span><span style={{fontSize:10,color:"#5e35b1",fontWeight:700}}>{y.planet}</span></div><div style={{fontSize:11,color:"#555",lineHeight:1.6,textAlign:"justify"}}>{y.desc}</div></div></div>)}
        </div>
      </div>}
    </section>
    <section style={S.card}>
      <ST icon="🃏" title="타로수비학"/>
      <p style={{fontSize:12,color:"#666",lineHeight:1.78,margin:"10px 0 12px",borderLeft:"3px solid #e8e8e8",paddingLeft:10,textAlign:"justify"}}>{t.calc}</p>
      <div style={{display:"flex",gap:10,marginBottom:10}}>
        <div style={{flex:1,padding:"13px",background:"linear-gradient(135deg,#e3f2fd,#f3e5f5)",borderRadius:12,textAlign:"center"}}>
          <div style={{fontSize:10,color:"#555",marginBottom:3}}>생명경로수</div>
          <div style={{fontSize:34,fontWeight:900,color:"#1565c0"}}>{t.lifePath}</div>
        </div>
        <div style={{flex:2,padding:"13px",background:"#fafafa",borderRadius:12,border:"1px solid #eee"}}>
          <div style={{fontSize:10,color:"#888",marginBottom:3}}>본명 타로 카드</div>
          <div style={{fontSize:14,fontWeight:900,color:"#111"}}>{t.lifePathCard}</div>
          <div style={{fontSize:20,fontWeight:900,color:"#5e35b1",marginTop:2}}>{t.lifePathCardNum}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <div style={{flex:1,padding:"10px 11px",background:"#e3f2fd",borderRadius:10}}>
          <div style={{fontSize:10,color:"#0d47a1",fontWeight:700,marginBottom:2}}>영혼 카드(Soul)</div>
          <div style={{fontSize:12,fontWeight:800,color:"#1565c0"}}>{t.soulCard}</div>
          <div style={{fontSize:10,color:"#555",marginTop:3,textAlign:"justify",lineHeight:1.7}}>{cleanText(t.soulDesc)}</div>
        </div>
        <div style={{flex:1,padding:"10px 11px",background:"#e8f5e0",borderRadius:10}}>
          <div style={{fontSize:10,color:"#2d6a2d",fontWeight:700,marginBottom:2}}>성취 카드(Achievement)</div>
          <div style={{fontSize:12,fontWeight:800,color:"#1b5e20"}}>{t.achieveCard}</div>
          <div style={{fontSize:10,color:"#555",marginTop:3,textAlign:"justify",lineHeight:1.7}}>
            {loadingTarot
              ? <><Skel h={11} w="100%"/><Skel h={11} w="90%"/><Skel h={11} w="70%"/></>
              : cleanText(achieveDesc)}
          </div>
          {errTarot&&<div style={{fontSize:10,color:"#b71c1c",marginTop:4,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span>분석 실패</span>
            <button onClick={()=>fetchTarotRef.current&&fetchTarotRef.current()} style={{fontSize:10,fontWeight:700,color:"#b71c1c",background:"none",border:"1px solid #b71c1c",borderRadius:5,padding:"2px 6px",cursor:"pointer",fontFamily:"inherit"}}>재시도</button>
          </div>}
        </div>
      </div>
      <div style={{fontSize:11,fontWeight:800,color:"#333",marginBottom:8}}>연도별 개인연도수 & 타로</div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {(t.yearCards||[]).map((y,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
            background:y.num===22?"linear-gradient(135deg,#7c3aed,#4f46e5)":"#fafafa",
            borderRadius:10,border:y.num===22?"none":"1px solid #eee"}}>
            <div style={{minWidth:28,height:28,borderRadius:"50%",
              background:y.num===22?"#ffd700":"linear-gradient(135deg,#7c4dff,#e040fb)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:10,fontWeight:900,color:y.num===22?"#1a1a1a":"#fff",flexShrink:0}}>{y.num}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2,flexWrap:"wrap"}}>
                <span style={{fontSize:12,fontWeight:900,color:y.num===22?"#ffd700":"#111"}}>{y.year}년</span>
                <span style={{fontSize:10,color:y.num===22?"#c4b5fd":"#5e35b1",fontWeight:700}}>{y.card}</span>
                <span style={{fontSize:11,fontWeight:900,color:sc(y.score)}}>{y.score}점</span>
              </div>
              <div style={{fontSize:11,color:y.num===22?"#e0e7ff":"#555",lineHeight:1.6,textAlign:"justify"}}>{y.desc}</div>
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

export default TabAstro;
