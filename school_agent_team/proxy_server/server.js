import http from "node:http";

const PORT = Number(process.env.PORT || 3000);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, OPTIONS, GET",
    "access-control-allow-headers": "content-type"
  });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, { ok: true, service: "school-agent-team-openai-proxy" });
    return;
  }

  if (request.method !== "POST" || !["/api/chat", "/chat", "/"].includes(request.url || "")) {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  if (!OPENAI_API_KEY) {
    sendJson(response, 500, { error: "OPENAI_API_KEY is not configured on the proxy server." });
    return;
  }

  try {
    const body = await readJson(request);
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (!messages.length) {
      sendJson(response, 400, { error: "messages 배열이 필요합니다." });
      return;
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${OPENAI_API_KEY}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: body.model || OPENAI_MODEL,
        messages,
        temperature: typeof body.temperature === "number" ? body.temperature : 0.45
      })
    });

    const data = await openaiResponse.json().catch(() => ({}));
    if (!openaiResponse.ok) {
      sendJson(response, openaiResponse.status, {
        error: (data.error && data.error.message) || "OpenAI API request failed."
      });
      return;
    }

    sendJson(response, 200, {
      answer:
        (data.choices &&
          data.choices[0] &&
          data.choices[0].message &&
          data.choices[0].message.content) ||
        "답변을 생성하지 못했습니다.",
      usage: data.usage
    });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Proxy server error."
    });
  }
});

server.listen(PORT, () => {
  console.log(`School Agent Team OpenAI proxy is running on port ${PORT}`);
});
