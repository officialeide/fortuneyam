// components/TabSummary.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {OC, cleanText,  CY } from '../data/constants.js';
import { GT, ST, Ring, sc, scBg, GCard, JCard, S, HJ } from './ui.jsx';

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
function BndBanner({b}){
  if(!b?.isBoundary) return null;
  return <div style={{background:"#fff8e1",border:"1.5px solid #ffb300",borderRadius:12,padding:"12px 14px"}}>
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
      <span>⚠️</span><span style={{fontSize:12,fontWeight:800,color:"#7b5800"}}>경계 일주 감지</span>
      <span style={{fontSize:9,background:"#e65100",color:"#fff",padding:"2px 7px",borderRadius:99,fontWeight:700,marginLeft:"auto"}}>자시(子時) 경계</span>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:8}}>
      {[{l:"자정 기준",g:b.std,c:"#1565c0",bg:"#e3f2fd"},{l:"야자시 기준",g:b.mid,c:"#7b5800",bg:"#fff8e1"}].map(({l,g,c,bg})=><div key={l} style={{flex:1,padding:"8px 10px",background:bg,borderRadius:9}}><div style={{fontSize:10,color:"#888",marginBottom:2}}>{l}</div><div style={{fontSize:14,fontWeight:900,color:c}}>{g.hanja}({g.ko})</div></div>)}
    </div>
    <p style={{fontSize:11,color:"#7b5800",margin:0,lineHeight:1.75}}>자시(子時) 경계 구간: 두 일주 에너지를 모두 가진 복합형으로, 상황에 따라 번갈아 발동해요.</p>
  </div>;
}

function Manseryeok({d}){
  const [w,setW]=useState("A");
  const active=[...(w==="A"?d.pillars:d.pillarsB)].reverse();
  const b=d.boundary;
  return <section style={S.card}>
    <ST icon="📋" title="사주 명식" sub="태어난 연·월·일·시의 네 기둥"/>
    <GT>사주는 태어난 연·월·일·시 네 개의 기둥으로 이루어져요. 이 중 <strong>일주</strong>가 나 자신을 나타내는 중심이에요.</GT>
    {b.isBoundary&&<div style={{display:"flex",gap:6,marginTop:10}}>{[{k:"A",l:`자정 ${b.std.hanja}`},{k:"B",l:`야자시 ${b.mid.hanja}`}].map(o=><button key={o.k} onClick={()=>setW(o.k)} style={{flex:1,padding:"7px 6px",borderRadius:9,border:"1.5px solid #ffb300",fontSize:10,fontWeight:700,cursor:"pointer",background:w===o.k?"#7b5800":"#fff",color:w===o.k?"#fff":"#7b5800"}}>{o.l}</button>)}</div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginTop:10}}>
      {active.map((p,i)=>{const isI=p.name==="일주";return <div key={i} style={{display:"flex",flexDirection:"column",gap:5,alignItems:"center",position:"relative",...(isI?{border:"2px solid #ffb300",borderRadius:15,background:"#fffde7",padding:"4px 3px 7px"}:{})}}>{isI&&<div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:"#e65100",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:99,zIndex:1,whiteSpace:"nowrap"}}>나</div>}<div style={{fontSize:10,color:"#aaa",fontWeight:600}}>{p.name}</div><GCard g={p.gan} s={p.gan.sibsong}/><JCard j={p.ji} s={p.ji.sibsong}/></div>;})}
    </div>
    {b.isBoundary&&<div style={{marginTop:10,padding:"10px 12px",background:"#f9f9f9",borderRadius:9,fontSize:11,color:"#555",lineHeight:1.78,borderLeft:"3px solid #ffb300"}}>{w==="A"?b.standardDesc:b.midnightDesc}</div>}
    <div style={{marginTop:8,fontSize:10,color:"#ccc",textAlign:"center"}}>☀️ 양(陽) 적극·외향 &nbsp;·&nbsp; 🌙 음(陰) 수용·내향</div>
  </section>;
}

function Ohaeng({d}){
  const dist=d.ohaengDist,order=["水","木","火","土","金"],total=Object.values(dist).reduce((a,b)=>a+b,0)||1;
  const R=54,r=32,cx=68,cy=68;let cum=-Math.PI/2;
  const slices=order.map(o=>{const v=dist[o]||0,a=(v/total)*2*Math.PI,x1=cx+R*Math.cos(cum),y1=cy+R*Math.sin(cum);cum+=a;const x2=cx+R*Math.cos(cum),y2=cy+R*Math.sin(cum),ix1=cx+r*Math.cos(cum-a),iy1=cy+r*Math.sin(cum-a),ix2=cx+r*Math.cos(cum),iy2=cy+r*Math.sin(cum),lg=a>Math.PI?1:0;return{o,v,path:v===0?null:`M${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R} 0 ${lg},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${ix2.toFixed(2)},${iy2.toFixed(2)} A${r},${r} 0 ${lg},0 ${ix1.toFixed(2)},${iy1.toFixed(2)} Z`};});
  const dom=order.reduce((a,b)=>(dist[a]||0)>=(dist[b]||0)?a:b);
  return <section style={S.card}>
    <ST icon="🌿" title="오행(五行) 분포" sub="다섯 기운의 균형"/>
    <GT>오행은 목·화·토·금·수 다섯 가지 기운입니다. 사주 8글자에 담긴 분포로 타고난 기질을 파악합니다.</GT>
    <div style={{display:"flex",alignItems:"center",gap:14,marginTop:12}}>
      <svg width={136} height={136} viewBox="0 0 136 136" style={{flexShrink:0}}>
        {slices.map(s=>s.path&&<path key={s.o} d={s.path} fill={OC[s.o].chart} stroke="#fff" strokeWidth={2}/>)}
        <text x={cx} y={cy-4} textAnchor="middle" fontSize={10} fill="#999">{OC[dom].name}</text>
        <text x={cx} y={cy+14} textAnchor="middle" fontSize={20} fontWeight={900} fill={OC[dom].text}>{dist[dom]||0}개</text>
      </svg>
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
        {order.map(o=>{const c=OC[o],v=dist[o]||0,p=Math.round((v/total)*100);return <div key={o} style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:9,height:9,borderRadius:2,background:c.chart,flexShrink:0}}/><div style={{fontSize:11,color:c.text,fontWeight:700,minWidth:44}}>{c.name}</div><div style={{flex:1,height:5,background:"#f0f0f0",borderRadius:99,overflow:"hidden"}}><div style={{width:`${p}%`,height:"100%",background:c.chart,borderRadius:99}}/></div><div style={{fontSize:11,color:"#888",minWidth:24,textAlign:"right"}}>{v}개</div></div>;})}
      </div>
    </div>
    <div style={{marginTop:10,padding:"10px 14px",background:"#e3f2fd",borderRadius:10,fontSize:12,color:"#0d47a1",lineHeight:1.75}}>{d.ohaengNote||""}</div>
    <div style={{marginTop:8,padding:"10px 12px",background:"#f0f4ff",borderRadius:10,border:"1px solid #c5cae9",marginBottom:8}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"nowrap"}}>
        <span style={{fontSize:10,color:"#5c6bc0",fontWeight:700,whiteSpace:"nowrap"}}>신강·신약</span>
        <span style={{fontSize:12,fontWeight:900,color:"#1565c0",whiteSpace:"nowrap"}}>{d.singang}</span>
      </div>
      <div style={{fontSize:10,color:"#555",lineHeight:1.7}}>{d.singang==="신강(身强)"?"일간을 돕는 기운이 넉넉한 구조예요.":"사주 8글자 중 나를 도와주는 기운보다 소모시키는 기운이 더 많은 구조예요. 에너지를 쓰는 만큼 채우는 것이 중요한 체질이에요."}</div>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:7}}>
      {[
        {label:"",bg:"#f1f8e9",border:"#c5e1a5",items:[
          {name:"용신",val:d.yongsinA,pillBg:"#33691e",pillTc:"#fff",valC:"#1b5e20",desc:"도움되는 기운",descTc:"#2d6a2d"},
          {name:"희신",val:d.huisinA,pillBg:"#558b2f",pillTc:"#fff",valC:"#33691e",desc:"간접 도움",descTc:"#558b2f"},
          {name:"기신",val:d.gisinA,pillBg:"#b71c1c",pillTc:"#fff",valC:"#b71c1c",desc:"피할 기운",descTc:"#b71c1c"},
        ]},
        ...(d.yongsinB&&d.yongsinB!=="분석 중"?[{label:"야자시 기준",bg:"#fff8e1",border:"#ffe082",items:[
          {name:"용신",val:d.yongsinB,pillBg:"#e65100",pillTc:"#fff",valC:"#bf360c",desc:"도움되는 기운",descTc:"#e65100"},
          {name:"희신",val:d.huisinB,pillBg:"#f57f17",pillTc:"#fff",valC:"#7b5800",desc:"간접 도움",descTc:"#f57f17"},
          {name:"기신",val:d.gisinB,pillBg:"#b71c1c",pillTc:"#fff",valC:"#b71c1c",desc:"피할 기운",descTc:"#b71c1c"},
        ]}]:[]),
      ].map(({label,bg,border,items})=>(
        <div key={label||"main"} style={{padding:"8px 12px",background:bg,borderRadius:10,border:`1px solid ${border}`}}>
          {label&&<div style={{fontSize:10,color:"#888",fontWeight:600,marginBottom:6}}>{label}</div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
            {items.map(({name,val,pillBg,pillTc,valC,desc,descTc})=>(
              <div key={name} style={{display:"flex",flexDirection:"column",gap:3}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{background:pillBg,color:pillTc,fontSize:10,fontWeight:800,padding:"2px 7px",borderRadius:5,whiteSpace:"nowrap"}}>{name}</span>
                  <span style={{fontSize:14,fontWeight:900,color:valC,whiteSpace:"nowrap"}}>{val}</span>
                </div>
                <span style={{fontSize:10,color:descTc,paddingLeft:2}}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>;
}

// 세운 바텀시트
const MON=["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
// YMEMO: reportData에서 동적으로 생성 (SeunSheet에서 사용)
// buildSajuData의 yearForecast.summary 참조
function getYMEMO(yr, reportData){
  if(reportData?.summary?.yearForecast){
    const yf=reportData.summary.yearForecast.find(f=>f.year===yr);
    if(yf) return yf.summary;
  }
  return `${yr}년: 세운 에너지를 타고 유연하게 움직이는 게 좋겠네요.`;
}
// 월별 한 줄 요약: 오행 기반 동적 생성
function getMonthMemo_dynamic(ganKo, jiKo, reportData){
  try{
    const ganO=_GANO[ganKo]||"";
    const jiO=_JIO[jiKo]||"";
    if(!reportData) return "이 달의 에너지를 타고 유연하게 움직이는 게 좋겠네요.";
    const yon=reportData.yongsinA||"";
    const gi=reportData.gisinA||"";
    const isYong=yon.includes(ganO)||yon.includes(jiO);
    const isGi=gi.includes(ganO)||gi.includes(jiO);
    if(isYong) return "용신 활성: 적극적으로 움직이기 좋은 달이에요.";
    if(isGi) return `기신 에너지 주의: 무리하지 않고 내실을 다지는 게 좋겠네요.`;
    return "흐름이 무난한 달이에요. 꾸준히 나아가는 것이 중요해요.";
  }catch{return "이 달의 에너지를 타고 유연하게 움직이는 게 좋겠네요.";}
}



export default TabSummary;
