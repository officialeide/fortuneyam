// netlify/functions/claude.js
// Anthropic API 프록시 — fetch 내장 (Node 18+) + fallback https 모듈

exports.handler = async (event) => {
  const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // OPTIONS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY 미설정");
    return {
      statusCode: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: { message: "ANTHROPIC_API_KEY 환경변수가 설정되지 않았어요." } }),
    };
  }

  let reqBody;
  try {
    reqBody = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: { message: "잘못된 요청 형식이에요." } }),
    };
  }

  const payload = JSON.stringify({
    model: reqBody.model || "claude-haiku-4-5-20251001",
    max_tokens: reqBody.max_tokens || 1000,
    messages: reqBody.messages,
  });

  // Node.js 내장 https 모듈 사용 (버전 무관 동작 보장)
  const https = require("https");

  const result = await new Promise((resolve, reject) => {
    const options = {
      hostname: "api.anthropic.com",
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        resolve({ statusCode: res.statusCode, body: data });
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });

  return {
    statusCode: result.statusCode,
    headers: { ...CORS, "Content-Type": "application/json" },
    body: result.body,
  };
};
