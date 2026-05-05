# OpenAI 지원 지역 프록시 백엔드 구성

Cloudflare Worker에서 OpenAI API를 직접 호출할 때 `Country, region, or territory not supported` 오류가 나면, OpenAI가 지원되는 지역에 별도 백엔드를 두고 Worker가 그 백엔드를 호출하도록 구성합니다.

이번 프로젝트에는 예제 백엔드를 `proxy_server/`에 추가했습니다.

## 요청 흐름

```text
브라우저
  -> Cloudflare Worker
  -> OPENAI_PROXY_URL 백엔드
  -> OpenAI API
```

## 1. 프록시 백엔드 배포

`school_agent_team/proxy_server`를 Render, Railway, Fly.io, Google Cloud Run, AWS Lambda 등 OpenAI 지원 지역을 선택할 수 있는 서비스에 배포합니다.

Render를 쓰는 경우 `proxy_server/render.yaml`을 포함해 두었으므로 GitHub 저장소를 Render에 연결하고 Blueprint 배포를 선택하면 됩니다.

Docker 기반 서비스에서는 `proxy_server/Dockerfile`을 사용하면 됩니다.

백엔드 환경변수:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
PORT=3000
```

배포 후 헬스 체크:

```text
https://your-openai-proxy.example.com/health
```

채팅 엔드포인트:

```text
https://your-openai-proxy.example.com/api/chat
```

## 2. Cloudflare Worker에 프록시 주소 연결

Cloudflare Worker에는 API 키 대신 프록시 주소를 secret으로 넣습니다.

```bash
cd school_agent_team/web
wrangler secret put OPENAI_PROXY_URL
wrangler deploy
```

값 예시:

```text
https://your-openai-proxy.example.com/api/chat
```

## 3. 동작 방식

- `OPENAI_PROXY_URL`이 있으면 Worker는 OpenAI를 직접 호출하지 않고 프록시 백엔드를 먼저 호출합니다.
- 프록시 백엔드는 OpenAI 지원 지역에서 OpenAI API를 호출합니다.
- `OPENAI_API_KEY`는 프록시 백엔드에만 보관해도 됩니다.
- 프록시가 일시적으로 실패하면 Worker는 기존 직접 호출 또는 기본 안내 답변으로 앱이 멈추지 않도록 처리합니다.

## 4. 현재 프로젝트 변경 사항

- `web/worker.js`: `OPENAI_PROXY_URL` 우선 라우팅 추가
- `proxy_server/server.js`: OpenAI API 프록시 서버 추가
- `proxy_server/.env.example`: 프록시용 환경변수 예시 추가
- `proxy_server/README.md`: 프록시 실행 및 배포 안내 추가
