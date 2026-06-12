const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

// ── HMAC 토큰 검증 ──
// 서명 일치 + 만료 전이면 true
function verifyToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return false;
  const secret = process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PW;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return false;

  // 서명 재계산 후 타이밍 안전 비교
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  // 만료 확인
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    if (!payload.exp || Date.now() > payload.exp) return false;
  } catch {
    return false;
  }
  return true;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Bad Request" };
  }

  const { token, page = 0 } = body;
  // 토큰 검증 (평문 비밀번호 더 이상 받지 않음)
  if (!verifyToken(token)) {
    return { statusCode: 401, body: JSON.stringify({ error: "unauthorized" }) };
  }

  // service key로 Supabase 직접 조회 (RLS 우회)
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
  const PAGE_SIZE = 50;
  const { data, error } = await supabase
    .from("reports")
    .select(
      "id,created_at,full_data_json,users(name,gender,birth_date,birth_time,city)"
    )
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
  return { statusCode: 200, body: JSON.stringify(data) };
};
