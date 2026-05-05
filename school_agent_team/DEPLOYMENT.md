# GitHub + Cloudflare 배포 안내

현재 프로젝트에는 Cloudflare Workers에 올릴 수 있는 웹 버전이 포함되어 있습니다.

## 현재 상태

- 웹 UI 파일: `web/worker.js`
- Wrangler 설정: `web/wrangler.toml`
- Cloudflare Workers 서브도메인 생성 완료: `inna-kim99-school-ai.workers.dev`
- 배포 대상 Worker 이름: `school-agent-team`
- Cloudflare Pages 프로젝트 생성 완료: `ai-school`
- Cloudflare Pages GitHub 연결 완료: `inna-kim99/ai-school`
- Cloudflare Pages 기본 도메인: `ai-school-alb.pages.dev`

## 배포 전 필수 조건

1. Cloudflare 계정 이메일 인증
   - Cloudflare API가 현재 `Your user email must been verified` 오류로 배포를 막고 있습니다.
   - Cloudflare 대시보드에서 이메일 인증을 먼저 완료해야 합니다.

2. GitHub 저장소 접근 권한
   - Cloudflare Pages는 `inna-kim99/ai-school` 저장소에 연결되었습니다.
   - 다만 Codex GitHub 앱 설치 목록과 접근 가능한 저장소는 아직 비어 있습니다.
   - Codex가 파일을 직접 push하려면 Codex GitHub 앱에 `inna-kim99/ai-school` 저장소 접근 권한을 부여해야 합니다.

3. OpenAI API 키
   - 웹 버전의 `/api/chat`은 Cloudflare Worker secret `OPENAI_API_KEY`를 사용합니다.
   - 키를 클라이언트에 노출하지 않도록 Worker secret으로 설정해야 합니다.

## Cloudflare CLI로 직접 배포하는 방법

로컬에 `wrangler`가 설치되어 있다면 아래처럼 배포할 수 있습니다.

```bash
cd school_agent_team/web
wrangler secret put OPENAI_API_KEY
wrangler deploy
```

배포 후 예상 URL:

```text
https://school-agent-team.inna-kim99-school-ai.workers.dev
```

## Cloudflare 대시보드에서 해야 할 일

1. Cloudflare에 로그인합니다.
2. 이메일 인증을 완료합니다.
3. Workers & Pages로 이동합니다.
4. `school-agent-team` Worker를 배포합니다.
5. Worker Settings에서 `OPENAI_API_KEY` secret을 추가합니다.

## GitHub 연결 배포를 위한 준비

1. GitHub에서 `school-agent-team` 저장소를 만듭니다.
2. Codex GitHub 앱 또는 Cloudflare Pages GitHub 앱에 저장소 접근 권한을 부여합니다.
3. 이 프로젝트 파일을 저장소에 push합니다.
4. Cloudflare Pages에서 GitHub 저장소를 연결합니다.

Cloudflare Pages로 연결할 경우 Python CLI 앱은 서버리스 런타임과 맞지 않으므로, 웹 배포에는 `web/worker.js` 또는 별도 프론트엔드 빌드 결과를 사용해야 합니다.
