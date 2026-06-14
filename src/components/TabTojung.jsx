// components/TabTojung.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { JH, jc, JL } from '../data/constants.js';
import { getComboDesc } from '../data/comboDB.js';
import { S, ST, GT } from './ui.jsx';


function TabTojung({d}){
  const tj=d.tojung,ic=d.iching,ds=d.dansaju;
  const [showM,setShowM]=useState(false);
  return <>
    {/* 토정비결 */}
    <section style={S.card}>
      <ST icon="📜" title="토정비결(土亭秘訣)"/>
      <GT>토정비결은 조선 중기 이지함 선생이 집대성한 민간 예언서입니다. 사주를 수리화하여 한 해의 길흉과 본명 총운을 사자성어로 풀어냅니다.</GT>
      <div style={{marginTop:10,padding:"14px 15px",background:"#e8f5e0",borderRadius:11,border:"1px solid #a5d6a7"}}>
        <div style={{fontSize:10,color:"#2d6a2d",fontWeight:700,marginBottom:5}}>본명 총운 사자성어</div>
        <div style={{fontSize:20,fontWeight:900,color:"#1b5e20",marginBottom:6}}>{tj.saja}</div>
        <p style={{fontSize:12,color:"#388e3c",margin:0,lineHeight:1.78,textAlign:"justify"}}>{tj.bonunDesc}</p>
      </div>
    </section>
    {/* 주역 */}
    <section style={S.card}>
      <ST icon="☯️" title="주역(周易) 본명괘"/>
      <GT>{"주역은 64괘(卦)로 우주의 변화와 인간의 운명을 해석하는 동양 철학 체계입니다."}<br/>{"사주 오행 기반 도출법 적용: 사주 최다 오행(일간 제외)이 상괘 "}{ic.gaeUpper}{", 일간을 극하는 관성 오행이 하괘 "}{ic.gaeLower}{"가 되어 본명괘 "}{ic.bonmyeonggae}{"가 도출됩니다."}</GT>
      <div style={{marginTop:12,padding:"16px",background:"linear-gradient(135deg,#e3f2fd,#e8eaf6)",borderRadius:12,textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:4,letterSpacing:4}}>{ic.gaeSymbol}</div>
        <div style={{fontSize:18,fontWeight:900,color:"#1565c0"}}>{ic.bonmyeonggae}</div>
        <div style={{fontSize:10,color:"#5c6bc0",marginTop:3}}>{ic.gaeNature}</div>
        <div style={{fontSize:10,color:"#888",marginTop:4}}>상괘 {ic.gaeUpper} / 하괘 {ic.gaeLower}</div>
      </div>
      <p style={{fontSize:12,color:"#444",lineHeight:1.85,textAlign:"justify",margin:"10px 0 0"}}>{ic.gaeDesc}</p>
      <div style={{marginTop:10,padding:"11px 13px",background:"#e3f2fd",borderRadius:10}}><div style={{fontSize:10,color:"#0d47a1",fontWeight:700,marginBottom:3}}>현재 변괘 ({ic.currentYear})</div><div style={{fontSize:14,fontWeight:900,color:"#1565c0"}}>{ic.currentGae}</div><p style={{fontSize:11,color:"#555",margin:"5px 0 0",lineHeight:1.7,textAlign:"justify"}}>{ic.currentDesc}</p></div>
      <div style={{marginTop:10,padding:"11px 13px",background:"#f9f9f9",borderRadius:10}}><div style={{fontSize:11,fontWeight:800,color:"#333",marginBottom:7}}>주역이 전하는 인생 전략 3가지</div>{(ic.strategy||[]).map((s,i)=><div key={i} style={{fontSize:12,color:"#555",padding:"5px 0",borderBottom:i<2?"1px dashed #eee":"none",lineHeight:1.7,textAlign:"justify"}}><span style={{fontWeight:700,color:"#e65100",marginRight:6}}>{i+1}.</span>{s}</div>)}</div>
    </section>
    {/* 당사주 */}
    <section style={S.card}>
      <ST icon="⭐" title="당사주(唐四柱)"/>
      <GT>당사주는 사주의 네 기둥(년·월·일·시지)에 각각 하나의 별성(別星)이 깃든다고 봅니다. 년주(조상·뿌리), 월주(부모·성장기), 일주(나·배우자), 시주(자녀·말년)에 놓인 네 별이 시기별로 다른 역할을 하며, 그중 일주의 별이 삶의 중심 색깔을 만듭니다. 일간 {d.pillars?.[2]?.gan?.hanja||""}({d.pillars?.[2]?.gan?.ko||""}) 기준 십이운성(十二運星)을 함께 적용합니다.</GT>
      <div style={{display:"flex",flexDirection:"column",gap:9,marginTop:12}}>
        {ds.pillars.map((p,i)=>{
          const jColor=jc(p.ji);
          return <div key={i} style={{padding:"12px 14px",background:"#fafafa",borderRadius:12,border:"1px solid #eee"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
              <div style={{width:36,height:36,borderRadius:10,background:jColor.bg,border:`1.5px solid ${jColor.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontSize:13,fontWeight:900,color:jColor.text}}>{JH[JL.indexOf(p.ji)]}</div>
                <div style={{fontSize:9,color:jColor.text,opacity:.7}}>{p.ji}</div>
              </div>
              <div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:2}}>
                  <span style={{fontSize:12,fontWeight:800,color:"#111"}}>{p.byeolseong}</span>
                  <span style={{fontSize:10,color:"#e65100",background:"#fff3e0",padding:"1px 7px",borderRadius:99,fontWeight:700}}>{p.stage}</span>
                </div>
                <div style={{fontSize:10,color:"#888"}}>{p.palace}</div>
              </div>
            </div>
            <p style={{fontSize:11,color:"#555",margin:0,lineHeight:1.75,textAlign:"justify"}}>{p.desc}</p>
            {p.stageDesc&&<p style={{fontSize:10,color:"#888",margin:"6px 0 0",lineHeight:1.7,textAlign:"justify",paddingTop:6,borderTop:"1px dashed #eee"}}><span style={{color:"#e65100",fontWeight:700}}>{p.stage} </span>{p.stageDesc}</p>}
            {(()=>{const combo=getComboDesc(p.byeolseong,p.stage);return combo?<p style={{fontSize:10,color:"#5c6bc0",margin:"5px 0 0",lineHeight:1.75,textAlign:"justify",paddingTop:5,borderTop:"1px dashed #e8eaf6"}}><span style={{fontWeight:700,color:"#3949ab"}}>✦ 조합 </span>{combo}</p>:null;})()}
          </div>;
        })}
      </div>
      <div style={{marginTop:10,padding:"11px 13px",background:"#e8f5e0",borderRadius:10}}>
        <div style={{fontSize:11,fontWeight:800,color:"#2d6a2d",marginBottom:5}}>종합 기질</div>
        <p style={{fontSize:12,color:"#333",margin:0,lineHeight:1.8,textAlign:"justify",wordBreak:"keep-all",whiteSpace:"pre-wrap"}}>{ds.overall}</p>
      </div>
    </section>
  </>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9. 별자리·타로수비학 탭
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default TabTojung;
