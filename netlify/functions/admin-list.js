exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  try {
    const { pw } = JSON.parse(event.body);
    if (pw !== process.env.ADMIN_PW) {
      return { statusCode: 401, body: JSON.stringify({ ok: false }) };
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch {
    return { statusCode: 400, body: "Bad Request" };
  }
};const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  // 비밀번호 검증
  const { pw, page = 0 } = JSON.parse(event.body);
  if (pw !== process.env.ADMIN_PW) {
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
    .select("id,created_at,full_data_json,users(name,gender,birth_date,birth_time,city)")
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  return { statusCode: 200, body: JSON.stringify(data) };
};