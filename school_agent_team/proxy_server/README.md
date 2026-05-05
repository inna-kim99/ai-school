# OpenAI 지원 지역 프록시 백엔드

Cloudflare Worker에서 OpenAI API를 직접 호출했을 때 `Country, region, or territory not supported` 오류가 나면, OpenAI가 지원되는 지역의 별도 백엔드를 하나 두고 Worker가 그 백엔드를 호출하게 만들 수 있습니다.

이 폴더는 가장 단순한 Node.js 프록시 서버 예제입니다.

## 로컬 실행

```bash
cd proxy_server
cp .env.example .env
npm start
```

PowerShell에서는 환경변수를 직접 넣어 실행할 수 있습니다.

```powershell
$env:OPENAI_API_KEY="sk-..."
npm start
```

헬스 체크:

```bash
curl http://localhost:3000/health
```

## 배포 위치

Render, Fly.io, Railway, Vercel Serverless Function, AWS Lambda, Google Cloud Run처럼 OpenAI API가 지원되는 지역을 선택할 수 있는 곳에 배포하세요.

배포한 뒤 공개 HTTPS 엔드포인트가 예를 들어 아래처럼 생겼다면:

```text
https://your-openai-proxy.example.com/api/chat
```

Cloudflare Worker secret에 이 값을 넣습니다.

```bash
cd ../web
wrangler secret put OPENAI_PROXY_URL
wrangler deploy
```

이후 흐름은 다음과 같습니다.

```text
브라우저
  -> Cloudflare Worker
  -> OPENAI_PROXY_URL 백엔드
  -> OpenAI API
```

`OPENAI_API_KEY`는 프록시 백엔드에만 있어도 됩니다. Cloudflare Worker에는 `OPENAI_PROXY_URL`만 있어도 실제 AI 답변을 받을 수 있습니다.
