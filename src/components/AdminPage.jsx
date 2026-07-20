// components/AdminPage.jsx
import React, { useState } from 'react';
import { SajuReport_Preview } from './SajuReportPreview.jsx';

function AdminPage({onClose}){
  const [pw,setPw]=useState("");
  const [token,setToken]=useState(null);   // 인증 후 받은 단기 토큰
  const [authed,setAuthed]=useState(false);
  const [list,setList]=useState([]);
  const [loading,setLoading]=useState(false);
  const [sel,setSel]=useState(null);
  const [page,setPage]=useState(0);
  const [hasMore,setHasMore]=useState(false);
  const PAGE_SIZE=50;

  async function tryLogin(){
    try{
      const res=await fetch("/.netlify/functions/admin-auth",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({pw})
      });
      const data=await res.json().catch(()=>({}));
      if(res.ok && data.token){
        setToken(data.token);
        setPw("");              // 인증 후 비밀번호는 메모리에서 비움
        setAuthed(true);
        loadList(0, data.token);
      }
      else alert("비밀번호가 틀렸어요.");
    }catch{alert("인증 오류가 발생했어요.");}
  }

  async function loadList(pg=0, tk=token){
    if(!tk){ alert("인증이 만료됐어요. 다시 로그인해주세요."); setAuthed(false); return; }
    setLoading(true);
    try{
      const res=await fetch("/.netlify/functions/admin-list",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({token:tk,page:pg})
      });
      if(res.status===401){
        // 토큰 만료/무효 → 재로그인 유도
        alert("인증이 만료됐어요. 다시 로그인해주세요.");
        setToken(null); setAuthed(false); setLoading(false); return;
      }
      const data=await res.json();
      if(pg===0) setList(data||[]);
      else setList(prev=>[...prev,...(data||[])]);
      setHasMore((data||[]).length===PAGE_SIZE);
      setPage(pg);
    }catch(e){alert("불러오기 실패: "+e.message);}
    setLoading(false);
  }

  if(sel) return(
    <div style={{position:"fixed",inset:0,zIndex:100,background:"#f4f4f6",overflowY:"auto"}}>
      <div style={{position:"sticky",top:0,background:"#fff",borderBottom:"1px solid #eee",padding:"12px 16px",display:"flex",alignItems:"center",gap:12,zIndex:10}}>
        <button onClick={()=>setSel(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#333"}}>‹</button>
        <div style={{fontSize:13,fontWeight:700}}>관리자: {sel.users?.name}</div>
      </div>
      <SajuReport_Preview data={sel.full_data_json} createdAt={sel.created_at} onBack={()=>setSel(null)}/>
    </div>
  );

  if(!authed) return(
    <div style={{position:"fixed",inset:0,zIndex:100,background:"#f4f4f6",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#fff",borderRadius:20,padding:"32px 24px",width:320,boxShadow:"0 8px 32px rgba(0,0,0,0.12)"}}>
        <div style={{fontSize:20,fontWeight:900,color:"#111",marginBottom:6}}>🔐 관리자</div>
        <div style={{fontSize:12,color:"#888",marginBottom:20}}>Fortuneyam 분석 데이터 조회</div>
        <input type="password" placeholder="비밀번호" value={pw}
          onChange={e=>setPw(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&tryLogin()}
          style={{width:"100%",padding:"12px 14px",borderRadius:12,border:"1.5px solid #e0e0e0",fontSize:14,boxSizing:"border-box",outline:"none",marginBottom:10,fontFamily:"inherit"}}/>
        <button onClick={tryLogin}
          style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:"#e65100",color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
          입장
        </button>
        <button onClick={onClose}
          style={{width:"100%",padding:"10px",marginTop:8,borderRadius:12,border:"none",background:"#f5f5f5",color:"#555",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
          닫기
        </button>
      </div>
    </div>
  );

  return(
    <div style={{position:"fixed",inset:0,zIndex:100,background:"#f4f4f6",overflowY:"auto"}}>
      <div style={{position:"sticky",top:0,background:"#fff",borderBottom:"1px solid #eee",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:10}}>
        <div style={{fontSize:15,fontWeight:800}}>관리자: 분석 목록</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>loadList(0)} style={{padding:"6px 12px",borderRadius:8,border:"1px solid #e0e0e0",background:"#fff",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>🔄 새로고침</button>
          <button onClick={onClose} style={{padding:"6px 12px",borderRadius:8,border:"none",background:"#e65100",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>닫기</button>
        </div>
      </div>
      <div style={{padding:"16px"}}>
        {list.length>0&&<div style={{fontSize:10,color:"#aaa",marginBottom:8,textAlign:"right"}}>총 {list.length}개 표시 중</div>}
        {loading&&page===0&&<div style={{textAlign:"center",padding:"40px",color:"#aaa"}}>불러오는 중...</div>}
        {!loading&&list.length===0&&<div style={{textAlign:"center",padding:"40px",color:"#aaa"}}>분석 데이터가 없어요.</div>}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {list.map((r,i)=>(
            <button key={i} onClick={()=>setSel(r)}
              style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:"#fff",border:"1px solid #eee",borderRadius:14,cursor:"pointer",textAlign:"left",fontFamily:"inherit",width:"100%"}}>
              <span style={{fontSize:22}}>{r.users?.gender==="여"?"👩":"👨"}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:800,color:"#111"}}>{r.users?.name}</div>
                <div style={{fontSize:10,color:"#888",marginTop:2}}>{r.users?.birth_date} · {r.users?.city}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:10,color:"#aaa"}}>{new Date(r.created_at).toLocaleDateString("ko")}</div>
                <div style={{fontSize:10,color:"#ccc",marginTop:1}}>{new Date(r.created_at).toLocaleTimeString("ko",{hour:"2-digit",minute:"2-digit"})}</div>
              </div>
              <span style={{fontSize:15,color:"#ddd"}}>›</span>
            </button>
          ))}
        </div>
        {hasMore&&<button onClick={()=>loadList(page+1)} disabled={loading}
          style={{width:"100%",marginTop:12,padding:"12px",borderRadius:12,border:"1px solid #e0e0e0",background:"#fff",fontSize:12,fontWeight:700,color:"#555",cursor:"pointer",fontFamily:"inherit"}}>
          {loading?"불러오는 중...":"더 보기 (+50개)"}
        </button>}
        {!hasMore&&list.length>0&&<div style={{textAlign:"center",padding:"16px 0",fontSize:10,color:"#ccc"}}>전체 {list.length}개 · 끝</div>}
      </div>
    </div>
  );
}

// 관리자용 리포트 미리보기 (탭 없이 전체 표시)

export { AdminPage };
