const crypto = require("crypto");

// ── HMAC 서명 토큰 발급 ──
// 형식: base64url(payload).base64url(signature)
// payload = { exp: 만료시각(ms) }
// 비밀키: ADMIN_TOKEN_SECRET (없으면 ADMIN_PW로 폴백)
function issueToken(ttlMs) {
  const secret = process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PW;
  const payload = JSON.stringify({ exp: Date.now() + ttlMs });
  const payloadB64 = Buffer.from(payload).toString("base64url");
  const sig = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${sig}`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  try {
    const { pw } = JSON.parse(event.body);
    if (pw !== process.env.ADMIN_PW) {
      return { statusCode: 401, body: JSON.stringify({ ok: false }) };
    }
    // 2시간 유효 토큰 발급
    const token = issueToken(2 * 60 * 60 * 1000);
    return { statusCode: 200, body: JSON.stringify({ ok: true, token }) };
  } catch {
    return { statusCode: 400, body: "Bad Request" };
  }
};
