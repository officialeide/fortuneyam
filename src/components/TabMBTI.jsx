// components/TabMBTI.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { S, ST, OHAENG_LOADING } from './ui.jsx';

function TabMBTI({d}){
  const m=d.mbti;
  return <>
    <section style={{...S.card,background:"linear-gradient(135deg,#1e1b4b,#312e81)",borderColor:"#4338ca"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
        <div style={{width:64,height:64,borderRadius:16,background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:"#fff",flexShrink:0,textAlign:"center",lineHeight:1.3}}>
          {m.estimated}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:10,color:"#a5b4fc",marginBottom:3}}>사주 기반 추정 MBTI</div>
          <div style={{fontSize:20,fontWeight:900,color:"#e0e7ff"}}>{m.estimated}</div>
        </div>
      </div>
      {/* 사주분석 MBTI | 자가보고 MBTI 나란히 */}
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <div style={{flex:1,padding:"12px 10px",background:"rgba(255,255,255,0.08)",borderRadius:10,border:"1px solid #7c3aed55",textAlign:"center"}}>
          <div style={{fontSize:10,color:"#a5b4fc",marginBottom:4}}>사주분석 MBTI</div>
          <div style={{fontSize:18,fontWeight:900,color:"#c4b5fd"}}>{m.estimated}</div>
        </div>
        <div style={{flex:1,padding:"12px 10px",background:"rgba(255,255,255,0.08)",borderRadius:10,border:"1px solid #2563eb55",textAlign:"center"}}>
          <div style={{fontSize:10,color:"#93c5fd",marginBottom:4}}>자가보고 MBTI</div>
          <div style={{fontSize:18,fontWeight:900,color:m.userType&&m.userType!=="모름"?(m.userType===m.estimated?"#86efac":"#fca5a5"):"#94a3b8"}}>{m.userType&&m.userType!=="모름"?m.userType:"미입력"}</div>
        </div>
      </div>
      {m.userType&&m.userType!=="모름"&&(
        <div style={{padding:"10px 12px",background:"rgba(255,255,255,0.07)",borderRadius:10,marginBottom:10,fontSize:11,color:"#c4b5fd",lineHeight:1.7}}>
          {m.userType===m.estimated
            ? `✓ 자가보고(${m.userType})와 사주 분석(${m.estimated})이 일치해요. 타고난 기질과 스스로 인식하는 모습이 잘 맞아떨어지는 경우예요.`
            : `💡 자가보고(${m.userType})와 사주 분석(${m.estimated})이 달라요. 겉으로 드러내는 모습(${m.userType})과 타고난 기질(${m.estimated})이 다른 경우로, 두 유형의 특성을 모두 가지고 있을 가능성이 높아요.`}
        </div>
      )}
      <p style={{fontSize:11,color:"#c4b5fd",lineHeight:1.75,margin:0}}>{m.basis}</p>
    </section>
    <section style={S.card}>
      <ST icon="🧠" title="4축 분석"/>
      <p style={{fontSize:11,color:"#888",margin:"6px 0 12px",lineHeight:1.6}}>{`사주 8글자 오행·음양 비율, 일간 기질, 일지 십이운성, 월간 음양${m.userType?", 입력한 MBTI":""}을 교차 분석했어요.`}</p>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {(m.axes||[]).map((ax,i)=>{
          const pct=ax.score,c=pct>=70?"#5e35b1":"#0d47a1";
          return <div key={i} style={{padding:"12px 14px",background:"#fafafa",borderRadius:11,border:"1px solid #eee"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:44,height:44,borderRadius:10,background:"linear-gradient(135deg,#e8eaf6,#c5cae9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:"#1a237e",flexShrink:0}}>
                {ax.axis.split(" ")[0]}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:800,color:"#111"}}>{ax.axis}</div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                  <div style={{flex:1,height:6,background:"#e8eaf6",borderRadius:99,overflow:"hidden"}}>
                    <div style={{width:`${pct}%`,height:"100%",background:c,borderRadius:99}}/>
                  </div>
                  <span style={{fontSize:11,fontWeight:800,color:c}}>{pct}%</span>
                </div>
              </div>
            </div>
          </div>;
        })}
      </div>
    </section>
    <section style={S.card}>
      <ST icon="🌟" title="강점·과제·최적 환경"/>
      <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:10}}>
        <div style={{padding:"12px 14px",background:"#e8f5e0",borderRadius:11}}><div style={{fontSize:11,fontWeight:800,color:"#2d6a2d",marginBottom:7}}>강점(Strengths)</div>{(m.strengths||[]).map((s,i)=><div key={i} style={{fontSize:12,color:"#333",padding:"4px 0",borderBottom:i<m.strengths.length-1?"1px dashed #c8e6c9":"none",lineHeight:1.7,textAlign:"justify"}}><span style={{color:"#4caf50",fontWeight:700,marginRight:6}}>✓</span>{s}</div>)}</div>
        <div style={{padding:"12px 14px",background:"#fdecea",borderRadius:11}}><div style={{fontSize:11,fontWeight:800,color:"#b71c1c",marginBottom:7}}>성장 과제(Challenges)</div>{(m.challenges||[]).map((s,i)=><div key={i} style={{fontSize:12,color:"#333",padding:"4px 0",borderBottom:i<m.challenges.length-1?"1px dashed #ffcdd2":"none",lineHeight:1.7,textAlign:"justify"}}><span style={{color:"#ef5350",fontWeight:700,marginRight:6}}>△</span>{s}</div>)}</div>
        <div style={{padding:"12px 14px",background:"#e3f2fd",borderRadius:11}}><div style={{fontSize:11,fontWeight:800,color:"#0d47a1",marginBottom:5}}>최적 환경</div><p style={{fontSize:12,color:"#333",margin:0,lineHeight:1.75,textAlign:"justify"}}>{m.bestEnv}</p></div>
        <div style={{padding:"12px 14px",background:"#f3e5f5",borderRadius:11}}><div style={{fontSize:11,fontWeight:800,color:"#4a148c",marginBottom:5}}>회복 방법</div><p style={{fontSize:12,color:"#333",margin:0,lineHeight:1.75,textAlign:"justify"}}>{m.recovery}</p></div>
      </div>
    </section>
  </>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 11. 메인
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 로딩 화면 컴포넌트
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


export default TabMBTI;
