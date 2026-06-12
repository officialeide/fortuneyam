// components/TabSaju.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { jc, gc, OC } from '../data/constants.js';
import { BndBanner, S, Acc, ST, GT, Manseryeok, Ohaeng } from './ui.jsx';


function TabSaju({d,reportData}){
  return <>
    <BndBanner b={d.boundary}/>
    <Manseryeok d={d}/>
    <Ohaeng d={d}/>
    <section style={S.card}>
      <ST icon="⭐" title="신살(神殺)"/>
      <GT>신살은 사주 글자들의 특정 조합에서 발생하는 특수한 기운입니다. 타고난 재능이나 삶에서 반복되는 패턴으로 나타납니다.</GT>
      <Acc items={(d.sinsal||[]).map(s=>({title:s.name,sub:s.hanja,easy:s.easy,desc:s.desc,tag:s.found}))}/>
    </section>
    {((d.hap||[]).length>0||(d.hyeong||[]).length>0||(d.chung||[]).length>0)&&<section style={S.card}>
      <ST icon="🔗" title="합(合)·충(沖)·형(刑)"/>
      <GT>사주 글자들은 서로 끌어당기거나(합), 충돌하거나(충), 마찰을 일으킵니다(형). 성격·인간관계·삶의 패턴에 직접 영향을 줍니다.</GT>
      <Acc items={[
        ...d.hap.map(h=>({title:h.pair,easy:h.easy,desc:h.desc,badge:{label:h.type,bg:"#e8f5e0",text:"#2d6a2d"}})),
        ...(d.chung||[]).map(h=>({title:h.pair,desc:h.desc,badge:{label:h.type,bg:"#fdecea",text:"#b71c1c"}})),
        ...(d.hyeong||[]).map(h=>({title:h.name,desc:h.desc,badge:{label:h.type,bg:"#fff3e0",text:"#e65100"}})),
      ]}/>
      {(d.chung||[]).length===0&&<div style={{marginTop:10,padding:"10px 14px",background:"#f9fbe7",borderRadius:10,fontSize:12,color:"#558b2f",lineHeight:1.75}}>✅ 충(沖) 없음: 원국 내 큰 충돌 에너지가 없는 구조예요.</div>}
    </section>}
    <section style={S.card}>
      <ST icon="🌊" title="대운(大運)" sub={`${d.daeunDir} · 만 ${d.daeunStart}세 시작`}/>
      <GT>대운은 10년마다 교체되는 외부 에너지입니다. {d.daeunDir}으로 흐르며 만 {d.daeunStart}세에 시작합니다.</GT>
      <div style={{position:"relative",marginTop:16,paddingLeft:38}}>
        <div style={{position:"absolute",left:16,top:8,bottom:8,width:2,background:"linear-gradient(to bottom,#ffb300,#e0e0e0)",borderRadius:99}}/>
        {(d.daeun||[]).map((dv,i)=>{
          const g=gc(dv.label[0]),j=jc(dv.label[1]);
          return (
            <div key={i} style={{position:"relative",marginBottom:i<d.daeun.length-1?12:0}}>
              <div style={{position:"absolute",left:-28,top:14,width:14,height:14,borderRadius:"50%",
                background:dv.cur?"#e65100":"#ddd",
                border:`2.5px solid ${dv.cur?"#ffb300":"#ccc"}`,
                zIndex:1,boxShadow:dv.cur?"0 0 0 3px rgba(230,81,0,.15)":"none"}}/>
              <div style={{...S.dCard,...(dv.cur?{border:"2px solid #ffb300",background:"#fffde7"}:{})}}>
                {dv.cur&&<span style={{position:"absolute",top:-10,left:12,background:"#e65100",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 9px",borderRadius:99}}>현재 대운</span>}
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <div style={{display:"flex",gap:4}}>
                    <span style={{...S.dBadge,background:g.bg,color:g.text,borderColor:g.border}}>{dv.hanja[0]}({dv.label[0]})</span>
                    <span style={{...S.dBadge,background:j.bg,color:j.text,borderColor:j.border}}>{dv.hanja[1]}({dv.label[1]})</span>
                  </div>
                  <div>
                    <div style={{fontSize:11,fontWeight:800,color:"#222"}}>{dv.period}</div>
                    <div style={{fontSize:10,color:"#999"}}>{OC[dv.ohaeng]?.name} 기운</div>
                  </div>
                </div>
                <p style={{fontSize:11,color:"#555",margin:0,lineHeight:1.75,textAlign:"justify"}}>{dv.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  </>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7+8. 내면 해부 탭 (낮과 밤 + 내면 분석 통합)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default TabSaju;
