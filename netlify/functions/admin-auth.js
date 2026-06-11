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
};