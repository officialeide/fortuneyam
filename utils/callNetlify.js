// utils/callNetlify.js
export async function callNetlify(body){
  const res=await fetch("/.netlify/functions/claude",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify(body)
  });
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  const data=await res.json();
  if(data.error) throw new Error(data.error.message||"API 오류");
  const text=data.content?.map(c=>c.text||"").join("").replace(/```json|```/g,"").trim();
  if(!text) throw new Error('빈 응답');
  return text;
}
