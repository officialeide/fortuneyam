// components/ui.jsx
import React from 'react';
import { OC, GD, JD, JL, JH, cleanText, HJ } from '../data/constants.js';

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. 요약 탭
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TabSummary({d,changeTab}){return <>

const S={
  root:{fontFamily:"'Noto Sans KR','Apple SD Gothic Neo',sans-serif",maxWidth:480,margin:"0 auto",background:"#f4f4f6",minHeight:"100vh",paddingBottom:48,textAlign:"justify"},
  header:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:"#fff",borderBottom:"1px solid #eee",position:"sticky",top:0,zIndex:20},
  navBtn:{background:"none",border:"none",fontSize:22,color:"#333",cursor:"pointer",width:32,padding:0},
  headerTitle:{fontSize:15,fontWeight:700,color:"#111"},
  profileBar:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 18px",background:"#fff",borderBottom:"1px solid #f0f0f0"},
  pName:{fontSize:22,fontWeight:900,color:"#111",letterSpacing:-.5},
  pBirth:{fontSize:11,color:"#999",marginTop:2},
  tabBar:{display:"flex",background:"#fff",borderBottom:"2px solid #f0f0f0",position:"sticky",top:49,zIndex:19,justifyContent:"space-around"},
  tab:{flex:"0 0 auto",padding:"11px 6px",fontSize:10,fontWeight:600,background:"none",border:"none",color:"#bbb",cursor:"pointer",borderBottom:"2.5px solid transparent",marginBottom:-2,transition:"color .2s,border-color .2s",textAlign:"center",letterSpacing:"-0.2px"},
  tabA:{color:"#e65100",borderBottomColor:"#e65100"},
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

export { GT, ST, Ring, sc, scBg, GCard, JCard, Acc, S, SF, HJ };
