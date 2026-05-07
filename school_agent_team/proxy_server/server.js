import http from "node:http";

const PORT = Number(process.env.PORT || 3000);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const MAX_BODY_BYTES = Number(process.env.MAX_BODY_BYTES || 128 * 1024);
const MAX_MESSAGES = Number(process.env.MAX_MESSAGES || 24);
const MAX_CONTENT_CHARS = Number(process.env.MAX_CONTENT_CHARS || 24000);

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, OPTIONS, GET",
    "access-control-allow-headers": "content-type"
  });
  response.end(JSON.stringify(payload));
}

function sendError(response, status, message) {
  sendJson(response, status, {
    answer: null,
    error: message
  });
}

async function readJson(request) {
  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    totalBytes += chunk.length;
    if (totalBytes > MAX_BODY_BYTES) {
      throw new Error("REQUEST_TOO_LARGE");
    }
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "messages 배열이 필요합니다.";
  }

  if (messages.length > MAX_MESSAGES) {
    return `messages는 최대 ${MAX_MESSAGES}개까지만 보낼 수 있습니다.`;
  }

  const totalChars = messages.reduce((sum, message) => {
    return sum + (typeof message.content === "string" ? message.content.length : 0);
  }, 0);

  if (totalChars > MAX_CONTENT_CHARS) {
    return "요청 내용이 너무 깁니다. 대화 기록을 줄여 주세요.";
  }

  for (const message of messages) {
    if (!message || !["system", "user", "assistant"].includes(message.role)) {
      return "messages에는 system, user, assistant 역할만 사용할 수 있습니다.";
    }
    if (typeof message.content !== "string" || !message.content.trim()) {
      return "각 message.content는 비어 있지 않은 문자열이어야 합니다.";
    }
  }

  return null;
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 200, { ok: true, error: null });
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, {
      ok: true,
      service: "school-agent-team-openai-proxy",
      model: OPENAI_MODEL,
      error: null
    });
    return;
  }

  if (request.method !== "POST" || !["/api/chat", "/chat", "/"].includes(request.url || "")) {
    sendError(response, 404, "요청한 경로를 찾을 수 없습니다.");
    return;
  }

  if (!OPENAI_API_KEY) {
    sendError(response, 500, "OPENAI_API_KEY가 Render 환경변수에 설정되어 있지 않습니다.");
    return;
  }

  try {
    const body = await readJson(request);
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const validationError = validateMessages(messages);

    if (validationError) {
      sendError(response, 400, validationError);
      return;
    }

    const model = typeof body.model === "string" && body.model.trim() ? body.model.trim() : OPENAI_MODEL;
    const temperature = typeof body.temperature === "number" ? body.temperature : 0.45;

    // TODO: Responses API로 전환할 경우 이 fetch 호출부를 교체하면 됩니다.
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${OPENAI_API_KEY}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature
      })
    });

    const data = await openaiResponse.json().catch(() => ({}));
    if (!openaiResponse.ok) {
      sendJson(response, openaiResponse.status, {
        answer: null,
        error: (data.error && data.error.message) || "OpenAI API 요청에 실패했습니다."
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
      model,
      usage: data.usage || null,
      error: null
    });
  } catch (error) {
    if (error instanceof Error && error.message === "REQUEST_TOO_LARGE") {
      sendError(response, 413, "요청 본문이 너무 큽니다.");
      return;
    }

    sendError(response, 500, "프록시 서버에서 요청을 처리하는 중 문제가 발생했습니다.");
  }
});

server.listen(PORT, () => {
  console.log(`School Agent Team OpenAI proxy is running on port ${PORT}`);
});
