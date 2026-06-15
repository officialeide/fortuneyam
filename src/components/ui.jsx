// components/ui.jsx
import React, { useState, useEffect } from 'react';
import { OC, gc, jc, yyE } from '../data/constants.js';

const GT=({children})=><p style={{fontSize:12,color:"#666",lineHeight:1.78,margin:"8px 0 0",borderLeft:"3px solid #e8e8e8",paddingLeft:10,textAlign:"justify"}}>{children}</p>;
const ST=({icon,title,sub})=><div style={{marginBottom:6}}><div style={{fontSize:15,fontWeight:800,color:"#1a1a1a",display:"flex",alignItems:"center",gap:6}}><span>{icon}</span><span>{title}</span></div>{sub&&<div style={{fontSize:10,color:"#aaa",marginTop:1}}>{sub}</div>}</div>;
const Ring=({score,size=52})=>{const r=18,c2=2*Math.PI*r,col=score>=75?"#4caf50":score>=60?"#ffb300":"#ef5350";return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flexShrink:0}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#eee" strokeWidth={3.5}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={3.5} strokeDasharray={`${(score/100)*c2} ${c2}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/><text x={size/2} y={size/2+4} textAnchor="middle" fontSize={size<=44?10:12} fontWeight={800} fill={col}>{score}</text></svg>;};
const sc=s=>s>=75?"#2e7d32":s>=60?"#e65100":"#b71c1c";
const scBg=s=>s>=75?"#e8f5e0":s>=60?"#fff8e1":"#fdecea";
function GCard({g,s}){
  const c=gc(g.ko);
  return <div style={{width:"100%",borderRadius:11,padding:"11px 4px 8px",border:`1.5px solid ${c.border}`,background:c.bg,color:c.text,textAlign:"center",position:"relative",boxSizing:"border-box"}}>
    <span style={{position:"absolute",top:3,right:4,fontSize:13}}>{yyE(g.ko,true)}</span>
    <div style={{fontSize:9,opacity:.6,fontWeight:600,marginBottom:1}}>{s}</div>
    <div style={{fontSize:24,fontWeight:900,lineHeight:1.1}}>{g.hanja}</div>
    <div style={{fontSize:10,fontWeight:700,marginTop:2}}>{g.ko}</div>
  </div>;
}
function JCard({j,s}){
  const c=jc(j.ko);
  return <div style={{width:"100%",borderRadius:11,padding:"11px 4px 8px",border:`1.5px solid ${c.border}`,background:c.bg,color:c.text,textAlign:"center",position:"relative",boxSizing:"border-box"}}>
    <span style={{position:"absolute",top:3,right:4,fontSize:13}}>{yyE(j.ko,false)}</span>
    <div style={{fontSize:9,opacity:.6,fontWeight:600,marginBottom:1}}>{s}</div>
    <div style={{fontSize:24,fontWeight:900,lineHeight:1.1}}>{j.hanja}</div>
    <div style={{fontSize:10,fontWeight:700,marginTop:2}}>{j.ko}</div>
  </div>;
}
function Acc({items}){
  const [o,setO]=useState(null);
  return <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:12}}>
    {items.map((item,i)=>{
      const op=o===i;
      return <div key={i} style={{borderRadius:12,border:"1px solid #eee",overflow:"hidden"}}>
        <button onClick={()=>setO(op?null:i)}
          style={{width:"100%",background:"#fafafa",border:"none",padding:"12px 14px",cursor:"pointer",textAlign:"left",display:"block"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              {item.badge&&<span style={{fontSize:10,background:item.badge.bg,color:item.badge.text,padding:"2px 7px",borderRadius:99,fontWeight:700,marginRight:6,display:"inline-block",marginBottom:3}}>{item.badge.label}</span>}
              <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap",marginBottom:2}}>
                <span style={{fontSize:13,fontWeight:800,color:"#111"}}>{item.title}</span>
                {item.sub&&<span style={{fontSize:10,color:"#bbb"}}>({item.sub})</span>}
              </div>
              {item.easy&&<div style={{fontSize:11,color:"#e65100",fontWeight:600}}>{item.easy}</div>}
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,marginLeft:8}}>
              {item.tag&&<span style={{fontSize:10,color:"#e65100",background:"#fff3e0",padding:"2px 8px",borderRadius:99,fontWeight:700,whiteSpace:"nowrap"}}>{item.tag}</span>}
              <span style={{fontSize:12,color:"#ccc"}}>{op?"▲":"▼"}</span>
            </div>
          </div>
        </button>
        {op&&<div style={{padding:"12px 14px",background:"#fff",fontSize:12,color:"#444",lineHeight:1.85,borderTop:"1px solid #f0f0f0"}}>{item.desc}</div>}
      </div>;
    })}
  </div>;
}

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

const OHAENG_LOADING=[
  {img:"/characters/wood.png",  color:"#4caf50", name:"목", label:"목 기운 분석 중"},
  {img:"/characters/fire.png",  color:"#ef5350", name:"화", label:"화 기운 분석 중"},
  {img:"/characters/earth.png", color:"#ffb300", name:"토", label:"토 기운 분석 중"},
  {img:"/characters/metal.png", color:"#78909c", name:"금", label:"금 기운 분석 중"},
  {img:"/characters/water.png", color:"#5c6bc0", name:"수", label:"수 기운 분석 중"},
];
function LoadingScreen({name}){
  const [idx,setIdx]=useState(0);
  const [visible,setVisible]=useState(true);
  useEffect(()=>{
    const iv=setInterval(()=>{
      setVisible(false);
      setTimeout(()=>{setIdx(i=>(i+1)%OHAENG_LOADING.length);setVisible(true);},300);
    },1200);
    return()=>clearInterval(iv);
  },[]);
  const cur=OHAENG_LOADING[idx];
  return(
    <div style={{position:"fixed",inset:0,background:"#fafafa",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:50}}>
      <div style={{
        width:100,height:100,borderRadius:30,
        display:"flex",alignItems:"center",justifyContent:"center",
        marginBottom:20,
        transition:"opacity 0.35s, transform 0.35s",
        opacity:visible?1:0,
        transform:visible?"scale(1)":"scale(0.88)",
      }}>
        <img
          src={cur.img}
          alt={cur.name}
          style={{width:100,height:100,objectFit:"contain"}}
        />
      </div>
      <div style={{
        fontSize:18,fontWeight:900,color:cur.color,
        marginBottom:4,
        transition:"opacity 0.35s",
        opacity:visible?1:0,
      }}>{cur.label}</div>
      <div style={{fontSize:12,color:"#888",fontWeight:600,marginBottom:4}}>{name||""}님의 사주를 분석하고 있어요</div>
      <div style={{fontSize:10,color:"#bbb",marginBottom:16}}>별자리·타로수비학까지 모두 준비할게요</div>
      <div style={{display:"flex",gap:8,marginTop:4}}>
        {OHAENG_LOADING.map((o,i)=>(
          <div key={i} style={{
            width:i===idx?20:6,height:6,borderRadius:99,
            background:i===idx?OHAENG_LOADING[i].color:"#ddd",
            transition:"all 0.3s"
          }}/>
        ))}
      </div>
    </div>
  );
}

const S={
  root:{fontFamily:"'Noto Sans KR','Apple SD Gothic Neo',sans-serif",maxWidth:480,margin:"0 auto",background:"#f4f4f6",minHeight:"100vh",paddingBottom:48,textAlign:"justify"},
  header:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:"#fff",borderBottom:"1px solid #eee",position:"sticky",top:0,zIndex:20},
  navBtn:{background:"none",border:"none",fontSize:22,color:"#333",cursor:"pointer",width:32,padding:0},
  headerTitle:{fontSize:15,fontWeight:700,color:"#111"},
  profileBar:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 18px",background:"#fff"},
  pName:{fontSize:22,fontWeight:900,color:"#111",letterSpacing:-.5},
  pBirth:{fontSize:11,color:"#999",marginTop:2},
  tabBar:{display:"flex",background:"#fff",position:"sticky",top:49,zIndex:19,justifyContent:"space-around"},
  tab:{flex:"0 0 auto",padding:"11px 6px 8.5px",fontSize:10,fontWeight:600,background:"none",border:"none",borderBottom:"2.5px solid transparent",color:"#bbb",cursor:"pointer",transition:"color .2s,border-color .2s",textAlign:"center",letterSpacing:"-0.2px",outline:"none",WebkitTapHighlightColor:"transparent"},
  tabA:{color:"#e65100"},
  content:{padding:"12px 14px",display:"flex",flexDirection:"column",gap:11},
  card:{background:"#fff",borderRadius:16,padding:"16px",border:"1px solid #ebebeb",boxShadow:"0 1px 5px rgba(0,0,0,0.04)"},
  dCard:{background:"#fafafa",borderRadius:12,padding:"13px",border:"1px solid #eee",position:"relative"},
  dBadge:{fontSize:11,fontWeight:700,padding:"4px 7px",borderRadius:8,border:"1px solid"},
  sRow:{background:"#fafafa",borderRadius:12,padding:"13px",border:"1px solid #ebebeb"},
};

const SF={
  root:{fontFamily:"'Noto Sans KR','Apple SD Gothic Neo',sans-serif",maxWidth:480,margin:"0 auto",background:"#f4f4f6",minHeight:"100vh"},
  header:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:"#fff",borderBottom:"1px solid #eee",position:"sticky",top:0,zIndex:20},
  back:{background:"none",border:"none",fontSize:22,color:"#333",cursor:"pointer",width:32,padding:0},
  title:{fontSize:15,fontWeight:700,color:"#111"},
  progress:{display:"flex",gap:6,justifyContent:"center",padding:"12px 0 4px"},
  dot:{width:28,height:4,borderRadius:99,transition:"background .3s"},
  content:{padding:"20px 16px"},
  stepLabel:{fontSize:10,color:"#e65100",fontWeight:700,letterSpacing:1,marginBottom:4},
  heading:{fontSize:22,fontWeight:900,color:"#111",marginBottom:20,lineHeight:1.3},
  field:{marginBottom:18},
  label:{fontSize:12,fontWeight:700,color:"#444",marginBottom:7},
  input:{width:"100%",padding:"13px 14px",borderRadius:12,border:"1.5px solid #e0e0e0",fontSize:15,boxSizing:"border-box",outline:"none",fontFamily:"inherit",background:"#fff"},
  inputErr:{borderColor:"#ef5350",background:"#fff8f8"},
  errMsg:{fontSize:10,color:"#ef5350",marginTop:4,fontWeight:600},
  hint:{fontSize:10,color:"#aaa",marginTop:5},
  select:{width:"100%",padding:"13px 14px",borderRadius:12,border:"1.5px solid #e0e0e0",fontSize:14,background:"#fff",outline:"none",fontFamily:"inherit",appearance:"none",WebkitAppearance:"none"},
  gBtn:{flex:1,padding:"13px 0",borderRadius:12,border:"1.5px solid #e0e0e0",fontSize:13,fontWeight:600,cursor:"pointer",background:"#fff",color:"#555",fontFamily:"inherit"},
  btn:{width:"100%",padding:"14px 0",borderRadius:14,border:"none",fontSize:13,fontWeight:800,cursor:"pointer",background:"#e65100",color:"#fff",fontFamily:"inherit"},
};


const HJ=({children,color})=>{
  if(!children) return null;
  const parts=String(children).split(/(\([^)]+\))/g);
  return <>{parts.map((p,i)=>i%2===1
    ?<span key={i} style={{color:color||"inherit",opacity:0.42,fontSize:"0.92em"}}>{p}</span>
    :p
  )}</>;
};

export { GT, ST, Ring, sc, scBg, GCard, JCard, Acc, S, SF, HJ, BndBanner, Manseryeok, Ohaeng, LoadingScreen };
