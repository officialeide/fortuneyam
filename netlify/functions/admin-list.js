const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { pw, page = 0 } = JSON.parse(event.body);

    // 비밀번호 검증 (ADMIN_PW 환경변수 — VITE_ 없이 서버에서만 읽힘)
    if (!pw || pw !== process.env.ADMIN_PW) {
      return { statusCode: 401, body: JSON.stringify({ error: "unauthorized" }) };
    }

    // service_role 키로 Supabase 연결 (RLS 우회 가능)
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,       // Netlify에 있는 기존 변수 그대로 사용
      process.env.SUPABASE_SERVICE_KEY      // 새로 추가한 service_role 키
    );

    const PAGE_SIZE = 50;
    const { data, error } = await supabase
      .from("reports")
      .select("id,created_at,full_data_json,users(name,gender,birth_date,birth_time,city)")
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data || []),
    };
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
  }
};
