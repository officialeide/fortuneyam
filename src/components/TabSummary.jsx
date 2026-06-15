// components/TabSummary.jsx
import React, { useState } from 'react';
import { CY, cleanText } from '../data/constants.js';
import { S, ST, HJ, scBg, GT, sc, Ring } from './ui.jsx';


function TabSummary({d,changeTab}){return <>
  <section style={S.card}>
    <ST icon="🌐" title="7체계 종합 분석" sub="사주·토정비결·주역·당사주·점성술·타로수비학·MBTI"/>
    <GT>일곱 가지 운명 분석 체계가 공통으로 가리키는 핵심 주제입니다.</GT>
    <div style={{marginTop:10,padding:"14px 16px",background:"linear-gradient(135deg,#1e1b4b,#312e81)",borderRadius:12,marginBottom:10}}>
      {cleanText(d.summary?.sevenInsight||"").split("\n\n").map((para,i)=>(
        <p key={i} style={{fontSize:12,color:"#e0e7ff",lineHeight:1.9,margin:i>0?"12px 0 0":"0",textAlign:"justify",whiteSpace:"pre-line"}}><HJ color="#e0e7ff">{para}</HJ></p>
      ))}
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {(d.summary?.sixSystems||[]).map((s,i)=>(
        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",background:"#fafafa",borderRadius:10,border:"1px solid #eee"}}>
          <div style={{width:60,fontSize:10,fontWeight:700,color:"#e65100",background:"#fff3e0",padding:"3px 5px",borderRadius:6,textAlign:"center",flexShrink:0,lineHeight:1.5}}>{s.system}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:800,color:"#111",marginBottom:2}}>{s.key}</div>
            <div style={{fontSize:12,color:"#666",lineHeight:1.5,whiteSpace:"pre-line"}}>{s.desc}</div>
          </div>
        </div>
      ))}
    </div>
  </section>
  <section style={S.card}>
    {(()=>{
      const [open,setOpen]=React.useState(false);
      return <>
        <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
          <ST icon="📆" title="향후 5년 흐름"/>
          <span style={{fontSize:11,color:"#bbb",transform:open?"rotate(180deg)":"none",transition:"transform 0.2s",marginLeft:8}}>▼</span>
        </div>
        <GT>사주·토정비결·주역·당사주·타로수비학 통합 운기 점수예요.</GT>
        {open&&<div style={{display:"flex",flexDirection:"column",gap:8,marginTop:12}}>
          {(d.summary?.yearForecast||[]).map((yf,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",gap:6,padding:"10px 12px",background:scBg(yf.score),borderRadius:11,border:`1px solid ${yf.score>=75?"#a5d6a7":yf.score>=60?"#ffe082":"#ef9a9a"}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Ring score={yf.score} size={44}/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
                    <span style={{fontSize:13,fontWeight:900,color:yf.year===CY?"#2e7d32":"#111"}}>{yf.year}년</span>
                    {yf.year===CY&&<span style={{fontSize:10,background:"#4caf50",color:"#fff",padding:"2px 6px",borderRadius:99,fontWeight:700}}>올해</span>}
                  </div>
                  <div style={{fontSize:11,color:"#444",lineHeight:1.6,textAlign:"justify"}}>{yf.summary}</div>
                </div>
              </div>
              {yf.areas&&<div style={{display:"flex",gap:4,flexWrap:"wrap",paddingTop:4,borderTop:"1px solid rgba(0,0,0,0.08)"}}>
                {Object.entries(yf.areas).map(([k,v])=><div key={k} style={{fontSize:10,padding:"2px 6px",borderRadius:99,background:"rgba(255,255,255,0.85)",color:sc(v),fontWeight:800,border:`1px solid ${sc(v)}44`}}>{k.slice(0,3)} {v}</div>)}
              </div>}
            </div>
          ))}
        </div>}
      </>;
    })()}
  </section>
  <section style={S.card}>
    {(()=>{
      const [open,setOpen]=React.useState(false);
      return <>
        <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
          <ST icon="📆" title="향후 1년 흐름"/>
          <span style={{fontSize:11,color:"#bbb",transform:open?"rotate(180deg)":"none",transition:"transform 0.2s",marginLeft:8}}>▼</span>
        </div>
        <GT>사주·토정비결·주역·당사주·타로수비학 통합 월별 운기 점수예요.</GT>
        {open&&<div style={{display:"flex",flexDirection:"column",gap:6,marginTop:12}}>
          {(d.summary?.monthForecast||[]).map((mf,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",gap:4,padding:"10px 12px",background:scBg(mf.score),borderRadius:11,border:`1px solid ${mf.score>=75?"#a5d6a7":mf.score>=60?"#ffe082":"#ef9a9a"}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Ring score={mf.score} size={40}/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2}}>
                    <span style={{fontSize:12,fontWeight:900,color:mf.isThis?"#2e7d32":"#111"}}>{mf.year}년 {mf.month}월</span>
                    <span style={{fontSize:10,color:"#888"}}>{mf.ganji}</span>
                    {mf.isThis&&<span style={{fontSize:10,background:"#4caf50",color:"#fff",padding:"2px 6px",borderRadius:99,fontWeight:700}}>이번 달</span>}
                  </div>
                  <div style={{fontSize:10,color:"#555",lineHeight:1.5}}>{mf.summary}</div>
                </div>
              </div>
              {mf.areas&&<div style={{display:"flex",gap:4,flexWrap:"wrap",paddingTop:4,borderTop:"1px solid rgba(0,0,0,0.08)"}}>
                {Object.entries(mf.areas).map(([k,v])=><div key={k} style={{fontSize:10,padding:"2px 6px",borderRadius:99,background:"rgba(255,255,255,0.85)",color:sc(v),fontWeight:800,border:`1px solid ${sc(v)}44`}}>{k.slice(0,3)} {v}</div>)}
              </div>}
            </div>
          ))}
        </div>}
      </>;
    })()}
  </section>

</>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. 사주 탭
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default TabSummary;
