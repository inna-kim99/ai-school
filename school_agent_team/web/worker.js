const MODEL = "gpt-4.1-mini";

const SYSTEM_PROMPT = `
너는 "학교팀 AI 에이전트 시스템"의 웹 버전이다.
한국어로 답변하고, 시험 대비가 아니라 전문가 성장형 학습을 돕는다.
사용자가 처음 목표나 장기 계획을 말하면 6개월 로드맵으로 정리한다.
일상 질문은 짧게 답하되 현재 학습 흐름과 실제 실습, 제품, 프로젝트로 연결한다.
전기, 배터리, 고전압, 분해 작업의 위험이 있으면 반드시 안전 경고를 포함한다.
답변 마지막에는 짧은 학습 기록 요약을 포함한다.
참여 에이전트가 여러 명이면 각 에이전트가 자기 역할과 성격에 맞게 직접 사용자에게 말하는 형식으로 답한다.
예: "학습 설계자:", "개념 교수:", "안전 관리자:"처럼 말하는 사람을 분명히 표시한다.
각 에이전트는 같은 톤이 아니라 조금씩 다른 성격을 가진다. 단, 장난스럽게 흐르지 말고 학습에 도움이 되는 선을 지킨다.
성격 기준:
- 학교팀 매니저: 차분하고 방향을 잡아주는 담임
- 학습 설계자: 체계적이고 우선순위를 잘 잡는 계획가
- 개념 교수: 다정하고 쉬운 비유를 쓰는 설명가
- 원리 해석가: 탐정처럼 원인을 파고드는 분석가
- 실습 코치: 격려하면서 단계를 작게 나누는 현장 코치
- 설계 엔지니어: 꼼꼼하고 현실적인 제작자
- 프로젝트 멘토: 결과물과 포트폴리오를 생각하는 멘토
- 안전 관리자: 단호하고 보수적인 안전 담당
- 성장 기록 관리자: 배운 점과 개선점을 정리하는 기록 담당
- 학습 아카이브 관리자: 내용을 분류하고 요약 노트를 남기는 사서
- 자료 시각화 큐레이터: 그래프, 사진, 참고자료, 검색 키워드, 관찰 포인트를 안내하는 시각 자료 담당
`;

const HTML = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>학교팀 AI 에이전트</title>
  <style>
    :root {
      --bg: #f5f7f2;
      --panel: #ffffff;
      --ink: #18201c;
      --muted: #667085;
      --line: #d8ded2;
      --accent: #1f7a5a;
      --accent-2: #d95f43;
      --soft: #eaf2e7;
      --warn: #fff1df;
      --shadow: 0 18px 45px rgba(31, 57, 44, 0.13);
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background:
        linear-gradient(130deg, rgba(31, 122, 90, 0.12), transparent 38%),
        linear-gradient(310deg, rgba(217, 95, 67, 0.11), transparent 42%),
        var(--bg);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .app {
      width: min(1440px, calc(100% - 28px));
      min-height: 100vh;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 310px minmax(0, 1fr) 330px;
      gap: 16px;
      padding: 18px 0;
    }

    aside, main, .panel {
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow);
    }

    aside, .right { display: grid; gap: 12px; align-self: start; }
    .section { padding: 16px; }
    h1 { margin: 0 0 8px; font-size: 27px; line-height: 1.12; letter-spacing: 0; }
    h2 { margin: 0 0 10px; font-size: 15px; letter-spacing: 0; }
    p { margin: 0; line-height: 1.58; }
    .muted { color: var(--muted); }
    .badge {
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      padding: 0 10px;
      border-radius: 999px;
      background: var(--soft);
      color: #23523f;
      font-size: 13px;
      font-weight: 800;
      margin-bottom: 14px;
    }

    main {
      min-height: calc(100vh - 36px);
      display: grid;
      grid-template-rows: auto 1fr auto;
      overflow: hidden;
    }

    .topbar {
      padding: 16px 18px;
      border-bottom: 1px solid var(--line);
      display: flex;
      justify-content: space-between;
      gap: 14px;
      align-items: center;
    }
    .topbar strong { font-size: 18px; }
    .status { font-size: 13px; color: var(--muted); text-align: right; }

    .messages {
      padding: 18px;
      overflow: auto;
      display: flex;
      flex-direction: column;
      gap: 13px;
    }
    .message {
      max-width: 88%;
      border-radius: 8px;
      padding: 14px 16px;
      line-height: 1.62;
      white-space: pre-wrap;
      border: 1px solid var(--line);
    }
    .user { align-self: flex-end; background: var(--accent); color: #fff; border-color: var(--accent); }
    .assistant { align-self: flex-start; background: #fff; }
    .speaker-row {
      display: grid;
      grid-template-columns: 42px minmax(0, 1fr);
      gap: 10px;
      align-items: start;
      max-width: 88%;
      align-self: flex-start;
    }
    .speaker-row.user-row {
      display: flex;
      justify-content: flex-end;
      max-width: 100%;
      align-self: stretch;
    }
    .speaker-face {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #fff;
      box-shadow: 0 0 0 1px var(--line);
    }
    .speaker-name {
      font-size: 12px;
      color: var(--muted);
      margin: 0 0 4px;
      font-weight: 800;
    }
    .speaker-bubble {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px 14px;
      line-height: 1.62;
      white-space: pre-wrap;
      background: #fff;
    }
    .user-bubble {
      max-width: 82%;
      border-radius: 8px;
      padding: 12px 14px;
      line-height: 1.62;
      white-space: pre-wrap;
      background: var(--accent);
      color: #fff;
    }

    form {
      border-top: 1px solid var(--line);
      padding: 14px;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
      background: #fbfcfa;
    }
    textarea {
      width: 100%;
      min-height: 54px;
      max-height: 160px;
      resize: vertical;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      font: inherit;
      color: var(--ink);
      background: #fff;
    }
    button {
      border: 0;
      border-radius: 8px;
      background: var(--accent);
      color: #fff;
      font-weight: 800;
      min-width: 88px;
      padding: 0 14px;
      cursor: pointer;
    }
    button:disabled { opacity: 0.55; cursor: wait; }
    .ghost {
      background: #fff;
      color: var(--ink);
      border: 1px solid var(--line);
      min-height: 38px;
    }

    .profiles { display: grid; gap: 8px; max-height: 500px; overflow: auto; padding-right: 2px; }
    .profile {
      display: grid;
      grid-template-columns: 46px 1fr;
      gap: 10px;
      align-items: center;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 9px;
      background: #fbfcfa;
      cursor: pointer;
    }
    .profile.active { border-color: var(--accent); background: var(--soft); }
    .avatar {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #fff;
      box-shadow: 0 0 0 1px var(--line);
    }
    .profile strong { display: block; font-size: 13px; margin-bottom: 2px; }
    .profile span { color: var(--muted); font-size: 12px; line-height: 1.35; }

    .progress-head { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
    .bar { height: 10px; background: #edf1ea; border-radius: 999px; overflow: hidden; }
    .fill { height: 100%; width: 0%; background: var(--accent); transition: width 0.2s ease; }
    .stage { margin-top: 10px; border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: #fbfcfa; }
    .stage strong { font-size: 13px; }
    .stage p { color: var(--muted); font-size: 13px; margin-top: 4px; }
    .reason { margin-top: 8px; color: var(--muted); font-size: 12px; line-height: 1.45; }

    .activity, .notes { display: grid; gap: 8px; max-height: 235px; overflow: auto; }
    .log, .note {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 10px;
      background: #fff;
      font-size: 13px;
      line-height: 1.45;
    }
    .log strong, .note strong { display: block; margin-bottom: 3px; }
    .log span, .note span { color: var(--muted); }
    .note-actions { display: flex; gap: 8px; margin-top: 10px; }

    .starter { display: grid; gap: 8px; margin-top: 12px; }
    .starter-item { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: #fbfcfa; }
    .starter-item strong { display: block; font-size: 13px; margin-bottom: 4px; }
    .starter-item span { color: var(--muted); font-size: 12px; line-height: 1.4; }

    dialog {
      width: min(760px, calc(100% - 28px));
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow);
      padding: 0;
    }
    dialog::backdrop { background: rgba(24, 32, 28, 0.28); }
    .modal-head { padding: 16px; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; gap: 12px; }
    .modal-body { padding: 16px; max-height: 70vh; overflow: auto; white-space: pre-wrap; line-height: 1.62; }

    @media (max-width: 1120px) {
      .app { grid-template-columns: 1fr; }
      main { min-height: 72vh; }
      .right { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 720px) {
      .app { width: min(100% - 20px, 720px); }
      .right { grid-template-columns: 1fr; }
      form { grid-template-columns: 1fr; }
      button { min-height: 44px; }
      .message { max-width: 96%; }
    }
  </style>
</head>
<body>
  <div class="app">
    <aside>
      <section class="section panel">
        <h2>학교팀 프로필</h2>
        <div class="profiles" id="profiles">
          <button class="profile active" type="button"><img class="avatar" alt="학교팀 매니저 캐릭터 프로필" src="https://api.dicebear.com/9.x/personas/svg?seed=manager&backgroundColor=eaf2e7"><div><strong>학교팀 매니저</strong><span>중재형 · 차분한 담임. 목표와 결론 정리</span></div></button>
          <button class="profile" type="button"><img class="avatar" alt="학습 설계자 캐릭터 프로필" src="https://api.dicebear.com/9.x/personas/svg?seed=planner&backgroundColor=dbeafe"><div><strong>학습 설계자</strong><span>체계형 · 6개월 로드맵과 우선순위</span></div></button>
          <button class="profile" type="button"><img class="avatar" alt="개념 교수 캐릭터 프로필" src="https://api.dicebear.com/9.x/personas/svg?seed=teacher&backgroundColor=ede9fe"><div><strong>개념 교수</strong><span>다정형 · 쉬운 비유와 예시</span></div></button>
          <button class="profile" type="button"><img class="avatar" alt="원리 해석가 캐릭터 프로필" src="https://api.dicebear.com/9.x/personas/svg?seed=analyst&backgroundColor=ffedd5"><div><strong>원리 해석가</strong><span>탐구형 · 작동 원리 분석</span></div></button>
          <button class="profile" type="button"><img class="avatar" alt="실습 코치 캐릭터 프로필" src="https://api.dicebear.com/9.x/personas/svg?seed=coach&backgroundColor=fee2e2"><div><strong>실습 코치</strong><span>격려형 · 작은 단계 실습</span></div></button>
          <button class="profile" type="button"><img class="avatar" alt="자료 시각화 큐레이터 캐릭터 프로필" src="https://api.dicebear.com/9.x/personas/svg?seed=curator&backgroundColor=dcfce7"><div><strong>자료 시각화 큐레이터</strong><span>시각형 · 그래프, 사진, 참고자료 안내</span></div></button>
        </div>
      </section>
    </aside>

    <main>
      <div class="topbar">
        <div>
          <strong>6개월 로드맵 수업</strong>
          <div class="status" id="selected-agent">학교팀 매니저가 대기 중</div>
        </div>
        <div class="status" id="status">준비됨</div>
      </div>
      <div class="messages" id="messages"></div>
      <form id="chat-form">
        <textarea id="input" placeholder="예: 전자기기를 이해하고 간단한 장치를 직접 만들 수 있는 수준이 되고 싶어." required></textarea>
        <button id="send" type="submit">전송</button>
      </form>
    </main>

    <div class="right">
      <section class="section panel">
        <div class="progress-head">
          <h2>현재 진도</h2>
          <span class="status" id="progress-percent">0%</span>
        </div>
        <div class="bar"><div class="fill" id="progress-fill"></div></div>
        <div class="stage">
          <strong id="stage-title">1개월차: 기초 개념 이해</strong>
          <p id="stage-detail">아직 학습 목표가 확정되지 않았습니다.</p>
          <div class="reason" id="progress-reason">진도 0%: 아직 질문이나 학습 목표가 입력되지 않았기 때문입니다.</div>
        </div>
      </section>

      <section class="section panel">
        <h2>에이전트 활동 히스토리</h2>
        <div class="activity" id="activity"></div>
      </section>

      <section class="section panel">
        <h2>요약 노트</h2>
        <div class="notes" id="notes"></div>
        <div class="note-actions">
          <button class="ghost" type="button" id="open-notes">노트 열기</button>
          <button class="ghost" type="button" id="clear-notes">초기화</button>
        </div>
      </section>
    </div>
  </div>

  <dialog id="note-dialog">
    <div class="modal-head">
      <strong>학습 요약 노트</strong>
      <button class="ghost" type="button" id="close-notes">닫기</button>
    </div>
    <div class="modal-body" id="note-full"></div>
  </dialog>

  <script>
    const agents = [
      ["학교팀 매니저", "차분한 담임. 목표를 잡고 실행 순서를 정리", "https://api.dicebear.com/9.x/personas/svg?seed=manager&backgroundColor=eaf2e7&hair=shortCombover&facialHairProbability=0", "중재형"],
      ["학습 설계자", "계획적인 코치. 6개월 로드맵과 우선순위 담당", "https://api.dicebear.com/9.x/personas/svg?seed=planner&backgroundColor=dbeafe&hair=bobBangs&facialHairProbability=0", "체계형"],
      ["개념 교수", "친절한 설명가. 비유와 예시로 쉽게 풀어줌", "https://api.dicebear.com/9.x/personas/svg?seed=teacher&backgroundColor=ede9fe&hair=curly&facialHairProbability=0", "다정형"],
      ["원리 해석가", "탐정 같은 분석가. 왜 작동하는지 파고듦", "https://api.dicebear.com/9.x/personas/svg?seed=analyst&backgroundColor=ffedd5&hair=shortCurls&facialHairProbability=20", "탐구형"],
      ["실습 코치", "현장형 코치. 준비물과 단계별 실습을 작게 쪼갬", "https://api.dicebear.com/9.x/personas/svg?seed=coach&backgroundColor=fee2e2&hair=bun&facialHairProbability=0", "격려형"],
      ["설계 엔지니어", "꼼꼼한 제작자. 부품과 구조를 현실적으로 설계", "https://api.dicebear.com/9.x/personas/svg?seed=engineer&backgroundColor=ccfbf1&hair=fade&facialHairProbability=15", "정밀형"],
      ["프로젝트 멘토", "결과물 중심 멘토. 배운 것을 포트폴리오로 연결", "https://api.dicebear.com/9.x/personas/svg?seed=mentor&backgroundColor=ecfccb&hair=long&facialHairProbability=0", "비전형"],
      ["안전 관리자", "단호한 안전 담당. 위험 작업을 먼저 멈춰 세움", "https://api.dicebear.com/9.x/personas/svg?seed=safety&backgroundColor=fee2e2&hair=shortFlat&facialHairProbability=0", "단호형"],
      ["성장 기록 관리자", "기록 담당. 배운 점, 실패 원인, 개선점을 정리", "https://api.dicebear.com/9.x/personas/svg?seed=record&backgroundColor=e5e7eb&hair=pixie&facialHairProbability=0", "정리형"],
      ["학습 아카이브 관리자", "도서관 사서 같은 분류 담당. 요약 노트를 계층화", "https://api.dicebear.com/9.x/personas/svg?seed=archive&backgroundColor=fef3c7&hair=longBangs&facialHairProbability=0", "분류형"],
      ["자료 시각화 큐레이터", "그래프, 사진, 참고자료, 검색 키워드를 안내", "https://api.dicebear.com/9.x/personas/svg?seed=curator&backgroundColor=dcfce7&hair=shaggy&facialHairProbability=0", "시각형"]
    ];

    const stages = [
      ["1개월차: 기초 개념 이해", "기본 용어, 도구, 준비물, 안전수칙을 잡는 단계입니다."],
      ["2개월차: 기본 구조와 작동 원리 이해", "제품을 기능 단위로 나누고 주요 부품의 흐름을 봅니다."],
      ["3개월차: 기초 제작 및 실습", "작은 회로와 장치를 만들며 실패 원인을 기록합니다."],
      ["4개월차: 응용 제작 및 문제 해결", "센서, 모터, 제어 요소를 붙이고 오류를 분석합니다."],
      ["5개월차: 실제 제품 분석 및 재현", "기존 제품의 설계 의도를 분석하고 유사 기능을 구현합니다."],
      ["6개월차: 개인 프로젝트 완성 및 포트폴리오화", "설계, 제작, 테스트, 개선 과정을 결과물로 정리합니다."]
    ];

    const form = document.querySelector("#chat-form");
    const input = document.querySelector("#input");
    const send = document.querySelector("#send");
    const messages = document.querySelector("#messages");
    const status = document.querySelector("#status");
    const selectedAgent = document.querySelector("#selected-agent");
    const profiles = document.querySelector("#profiles");
    const activity = document.querySelector("#activity");
    const notes = document.querySelector("#notes");
    const noteDialog = document.querySelector("#note-dialog");
    const noteFull = document.querySelector("#note-full");
    const progressFill = document.querySelector("#progress-fill");
    const progressPercent = document.querySelector("#progress-percent");
    const stageTitle = document.querySelector("#stage-title");
    const stageDetail = document.querySelector("#stage-detail");
    const progressReason = document.querySelector("#progress-reason");

    const history = [];
    const noteList = [];
    const activityList = [];
    let turnCount = 0;
    let currentStageIndex = 0;
    let currentPercent = 0;
    let currentReason = "진도 0%: 아직 질문이나 학습 목표가 입력되지 않았기 때문입니다.";

    function renderProfiles(activeName = "학교팀 매니저") {
      profiles.innerHTML = "";
      agents.forEach(([name, role, image, personality]) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "profile" + (name === activeName ? " active" : "");
        item.innerHTML = '<img class="avatar" alt="' + name + ' 캐릭터 프로필" src="' + image + '"><div><strong>' + name + '</strong><span>' + personality + " · " + role + '</span></div>';
        item.onclick = () => {
          selectedAgent.textContent = name + " - " + personality + " · " + role;
          renderProfiles(name);
        };
        profiles.appendChild(item);
      });
    }

    function addMessage(role, text) {
      if (role === "assistant") {
        addAssistantMessages(text);
        return;
      }
      const el = document.createElement("div");
      el.className = "speaker-row user-row";
      const bubble = document.createElement("div");
      bubble.className = "user-bubble";
      bubble.textContent = text;
      el.appendChild(bubble);
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
    }

    function getAgentImage(name) {
      const found = agents.find(([agentName]) => agentName === name);
      return found?.[2] || agents[0][2];
    }

    function addAgentBubble(agentName, text) {
      const row = document.createElement("div");
      row.className = "speaker-row";
      const img = document.createElement("img");
      img.className = "speaker-face";
      img.alt = agentName + " 프로필";
      img.src = getAgentImage(agentName);
      const wrap = document.createElement("div");
      const name = document.createElement("div");
      name.className = "speaker-name";
      name.textContent = agentName;
      const bubble = document.createElement("div");
      bubble.className = "speaker-bubble";
      bubble.textContent = text.trim();
      wrap.appendChild(name);
      wrap.appendChild(bubble);
      row.appendChild(img);
      row.appendChild(wrap);
      messages.appendChild(row);
      messages.scrollTop = messages.scrollHeight;
    }

    function addAssistantMessages(text) {
      const names = agents.map(([name]) => name);
      const pattern = new RegExp("^(" + names.join("|") + ")\\\\s*[:：]\\\\s*", "gm");
      const matches = [...text.matchAll(pattern)];

      if (!matches.length) {
        addAgentBubble("학교팀 매니저", text);
        return;
      }

      matches.forEach((match, index) => {
        const start = match.index + match[0].length;
        const end = index + 1 < matches.length ? matches[index + 1].index : text.length;
        const content = text.slice(start, end).trim();
        if (content) addAgentBubble(match[1], content);
      });
    }

    function addPlainMessage(role, text) {
      const el = document.createElement("div");
      el.className = "message " + role;
      el.textContent = text;
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
    }

    function addActivity(agent, detail) {
      activityList.unshift({ agent, detail });
      renderActivity();
      saveState();
    }

    function renderActivity() {
      activity.innerHTML = "";
      activityList.slice(0, 30).forEach(({ agent, detail }) => {
        const el = document.createElement("div");
        el.className = "log";
        el.innerHTML = "<strong>" + agent + "</strong><span>" + detail + "</span>";
        activity.appendChild(el);
      });
    }

    function addActivityViewOnly(agent, detail) {
      const el = document.createElement("div");
      el.className = "log";
      el.innerHTML = "<strong>" + agent + "</strong><span>" + detail + "</span>";
      activity.prepend(el);
    }

    function chooseAgents(text) {
      const selected = ["학교팀 매니저"];
      if (/로드맵|시작|목표|전문가|수준|6개월/.test(text)) selected.push("학습 설계자");
      if (/뭐야|개념|원리|왜|설명/.test(text)) selected.push("개념 교수", "원리 해석가");
      if (/뜯|분해|고장|배터리|220V|전원/.test(text)) selected.push("안전 관리자");
      if (/만들|실습|프로젝트|회로|부품|설계/.test(text)) selected.push("실습 코치", "설계 엔지니어", "프로젝트 멘토");
      if (/그래프|사진|그림|이미지|자료|참고|도표|차트|시각/.test(text)) selected.push("자료 시각화 큐레이터");
      selected.push("자료 시각화 큐레이터", "성장 기록 관리자", "학습 아카이브 관리자");
      return [...new Set(selected)];
    }

    function updateProgress(text) {
      turnCount += 1;
      const lower = text.toLowerCase();
      let stageIndex = Math.min(5, Math.floor(turnCount / 3));
      if (/응용|문제|오류|센서|모터/.test(lower)) stageIndex = Math.max(stageIndex, 3);
      if (/제품|재현|분석/.test(lower)) stageIndex = Math.max(stageIndex, 4);
      if (/포트폴리오|최종|개인 프로젝트/.test(lower)) stageIndex = 5;
      const percent = Math.min(100, Math.max(5, Math.round(((stageIndex + 0.35) / 6) * 100)));
      progressFill.style.width = percent + "%";
      progressPercent.textContent = percent + "%";
      stageTitle.textContent = stages[stageIndex][0];
      stageDetail.textContent = stages[stageIndex][1];
      currentStageIndex = stageIndex;
      currentPercent = percent;
      currentReason =
        "진도 " + percent + "%: 질문 " + turnCount + "회, 현재 단계 '" + stages[stageIndex][0] +
        "' 기준입니다. 개념 질문은 초반 단계, 제작/분석/포트폴리오 질문은 뒤 단계 가중치로 계산합니다.";
      progressReason.textContent = currentReason;
    }

    function makeNote(question, answer, activeAgents) {
      const title = question.length > 28 ? question.slice(0, 28) + "..." : question;
      const note = "# 학습 기록 요약\\n\\n## 질문\\n- " + question + "\\n\\n## 참여 에이전트\\n- " + activeAgents.join("\\n- ") + "\\n\\n## 핵심 요약\\n" + answer.slice(0, 520) + (answer.length > 520 ? "..." : "") + "\\n\\n## 다음 복습\\n- 현재 진도 패널의 단계와 연결해서 실습 하나를 고르기";
      noteList.unshift({ title, note });
      renderNotes();
      saveState();
    }

    function renderNotes() {
      notes.innerHTML = "";
      if (!noteList.length) {
        notes.innerHTML = '<div class="note"><strong>아직 노트가 없습니다</strong><span>질문을 보내면 자동으로 요약 노트가 생깁니다.</span></div>';
        return;
      }
      noteList.slice(0, 4).forEach((item, index) => {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "note";
        el.innerHTML = "<strong>" + item.title + "</strong><span>클릭해서 전체 노트 보기</span>";
        el.onclick = () => openNote(index);
        notes.appendChild(el);
      });
    }

    function saveState() {
      const state = {
        history,
        noteList,
        activityList,
        turnCount,
        currentStageIndex,
        currentPercent,
        currentReason
      };
      localStorage.setItem("schoolAgentTeamState", JSON.stringify(state));
    }

    function loadState() {
      const raw = localStorage.getItem("schoolAgentTeamState");
      if (!raw) return false;
      try {
        const state = JSON.parse(raw);
        history.splice(0, history.length, ...(state.history || []));
        noteList.splice(0, noteList.length, ...(state.noteList || []));
        activityList.splice(0, activityList.length, ...(state.activityList || []));
        turnCount = state.turnCount || 0;
        currentStageIndex = state.currentStageIndex || 0;
        currentPercent = state.currentPercent || 0;
        currentReason = state.currentReason || "진도 0%: 아직 질문이나 학습 목표가 입력되지 않았기 때문입니다.";
        return true;
      } catch {
        return false;
      }
    }

    function renderSavedMessages() {
      messages.innerHTML = "";
      if (!history.length) {
        addMessage("assistant", "학교팀 매니저: 오늘은 6개월 로드맵부터 시작하겠습니다. 먼저 1개월차에는 기초 용어, 도구, 안전수칙을 잡고, 2개월차에는 실제 제품 구조와 작동 원리를 봅니다. 3개월차부터는 작은 제작 실습으로 넘어가며, 6개월차에는 개인 프로젝트를 포트폴리오로 정리하는 흐름입니다.\\n\\n학습 설계자: 지금 배울 내용은 1) 기본 개념, 2) 제품 구조 분석, 3) 기초 제작, 4) 문제 해결, 5) 제품 기능 재현, 6) 개인 프로젝트입니다. 원하는 분야를 말해주면 이 로드맵을 당신의 목표에 맞게 바꿔드릴게요.");
        return;
      }
      history.forEach((item) => addMessage(item.role === "user" ? "user" : "assistant", item.content));
    }

    function renderProgressFromState() {
      progressFill.style.width = currentPercent + "%";
      progressPercent.textContent = currentPercent + "%";
      stageTitle.textContent = stages[currentStageIndex][0];
      stageDetail.textContent = currentPercent === 0 ? "아직 학습 목표가 확정되지 않았습니다." : stages[currentStageIndex][1];
      progressReason.textContent = currentReason;
    }

    function openNote(index = 0) {
      noteFull.textContent = noteList[index]?.note || "아직 저장된 요약 노트가 없습니다.";
      noteDialog.showModal();
    }

    async function ask(text) {
      const activeAgents = chooseAgents(text);
      renderProfiles(activeAgents[0]);
      selectedAgent.textContent = activeAgents.join(" -> ");
      activeAgents.forEach((agent) => addActivity(agent, "이번 질문에서 역할 수행"));
      updateProgress(text);

      addMessage("user", text);
      history.push({ role: "user", content: text });
      saveState();
      input.value = "";
      send.disabled = true;
      status.textContent = "답변 생성 중";

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: text, history: history.slice(-8), activeAgents })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "답변 생성 실패");
        addMessage("assistant", data.answer);
        history.push({ role: "assistant", content: data.answer });
        makeNote(text, data.answer, activeAgents);
        addActivity("학습 아카이브 관리자", "요약 노트 생성");
        saveState();
        status.textContent = "준비됨";
      } catch (error) {
        addMessage("assistant", "문제가 발생했습니다: " + error.message);
        addActivity("문제해결 코치", "오류 확인: " + error.message);
        status.textContent = "오류";
      } finally {
        send.disabled = false;
        input.focus();
      }
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (text) ask(text);
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        const text = input.value.trim();
        if (text && !send.disabled) ask(text);
      }
    });

    document.querySelector("#open-notes").onclick = () => openNote(0);
    document.querySelector("#close-notes").onclick = () => noteDialog.close();
    document.querySelector("#clear-notes").onclick = () => {
      noteList.length = 0;
      saveState();
      renderNotes();
      addActivity("성장 기록 관리자", "요약 노트 초기화");
    };

    loadState();
    renderProfiles();
    renderSavedMessages();
    renderNotes();
    renderActivity();
    renderProgressFromState();
    if (!activityList.length) addActivity("학교팀 매니저", "6개월 로드맵 수업 준비 완료");
  </script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/chat") {
      return handleChat(request, env);
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({ ok: true, service: "school-agent-team-web" });
    }

    return new Response(HTML, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  }
};

async function handleChat(request, env) {
  const body = await request.json().catch(() => ({}));
  const message = String(body.message || "").trim();
  const history = Array.isArray(body.history) ? body.history : [];
  const activeAgents = Array.isArray(body.activeAgents) ? body.activeAgents.join(", ") : "학교팀 매니저";

  if (!message) {
    return Response.json({ error: "질문을 입력해 주세요." }, { status: 400 });
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT + "\\n이번 질문의 화면상 참여 에이전트: " + activeAgents },
    ...history
      .filter((item) => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
      .slice(-8),
    { role: "user", content: message }
  ];

  const chatPayload = {
    model: MODEL,
    messages,
    temperature: 0.45
  };

  // OPENAI_PROXY_URL이 있으면 OpenAI 지원 지역에 둔 별도 백엔드를 먼저 사용합니다.
  if (env.OPENAI_PROXY_URL) {
    const proxyResult = await callOpenAIProxy(env.OPENAI_PROXY_URL, chatPayload);
    if (proxyResult.ok) {
      return Response.json({ answer: proxyResult.answer });
    }

    // 프록시가 잠시 실패해도 앱이 완전히 멈추지 않도록 직접 호출 또는 기본 답변으로 이어갑니다.
    if (!env.OPENAI_API_KEY) {
      return Response.json({
        answer: buildLocalFallbackAnswer(message, activeAgents)
      });
    }
  }

  if (!env.OPENAI_API_KEY) {
    return Response.json({
      answer: buildLocalFallbackAnswer(message, activeAgents)
    });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(chatPayload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const apiErrorMessage = data.error?.message || "";
    if (apiErrorMessage.toLowerCase().includes("country") && apiErrorMessage.toLowerCase().includes("not supported")) {
      return Response.json({
        answer: buildLocalFallbackAnswer(message, activeAgents)
      });
    }

    return Response.json(
      { error: apiErrorMessage || "OpenAI API 호출에 실패했습니다." },
      { status: response.status }
    );
  }

  return Response.json({
    answer: data.choices?.[0]?.message?.content || "답변을 생성하지 못했습니다."
  });
}

async function callOpenAIProxy(proxyUrl, chatPayload) {
  try {
    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(chatPayload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        error: data.error || "OpenAI proxy request failed."
      };
    }

    return {
      ok: true,
      answer:
        data.answer ||
        data.choices?.[0]?.message?.content ||
        "답변을 생성하지 못했습니다."
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "OpenAI proxy request failed."
    };
  }
}

function buildLocalFallbackAnswer(message, activeAgents) {
  const wantsVisual = /그래프|사진|그림|이미지|자료|참고|도표|차트|시각|원리|구조/.test(message);
  const wantsSafety = /뜯|분해|고장|배터리|220V|전원/.test(message);
  const wantsBuild = /만들|실습|프로젝트|회로|부품|설계/.test(message);

  const parts = [
    "학교팀 매니저: 지금은 기본 수업 모드로 답변할게요. 먼저 목표를 6개월 과정으로 잡고, 오늘 질문은 현재 단계에서 바로 이해하고 실습으로 이어질 수 있게 정리하겠습니다.",
    "학습 설계자: 1개월차는 기초 개념과 안전수칙, 2개월차는 실제 제품 구조 분석, 3개월차는 작은 제작 실습입니다. 이후 4개월차에는 문제 해결, 5개월차에는 제품 기능 재현, 6개월차에는 개인 프로젝트와 포트폴리오로 이어갑니다.",
    "개념 교수: 지금 단계에서는 어려운 계산보다 '무엇이 어떤 역할을 하는지'를 먼저 잡으면 됩니다. 모르는 용어가 나오면 정의, 실제 제품 예시, 지금 알아야 할 수준으로 나눠서 보면 길을 잃지 않습니다."
  ];

  if (wantsVisual) {
    parts.push("자료 시각화 큐레이터: 이 주제는 구조도, 흐름도, 실제 제품 내부 사진을 같이 보면 훨씬 쉽습니다. 검색 키워드는 'block diagram', 'teardown', 'circuit explanation', 'how it works'를 주제명과 함께 넣어보세요. 그래프로는 입력 -> 처리 -> 출력 흐름도를 먼저 그리는 것을 추천합니다.");
  }

  if (wantsBuild) {
    parts.push("실습 코치: 바로 만들고 싶다면 LED 회로, 버튼 입력, 센서 값 읽기처럼 실패해도 안전한 작은 실습부터 시작하세요. 성공 기준은 '회로가 켜진다'보다 '왜 켜지는지 설명할 수 있다'로 잡는 게 좋습니다.");
    parts.push("설계 엔지니어: 제작 전에는 전원, 입력, 처리, 출력 네 블록으로 나눠 보세요. 부품을 고를 때는 전압, 전류, 신호 방식, 연결 난이도를 먼저 확인하면 시행착오가 줄어듭니다.");
  }

  if (wantsSafety) {
    parts.push("안전 관리자: 220V 전원, 리튬 배터리, 전원부, 고전압 커패시터가 있는 제품은 직접 분해하지 않는 쪽이 안전합니다. 원리를 배우고 싶다면 저전압 DC 모터, 건전지, 브레드보드 기반 실습으로 대체하세요.");
  }

  parts.push("학습 아카이브 관리자: 오늘 노트에는 질문, 핵심 개념, 실제 제품 연결, 실습 아이디어, 다음 복습 항목을 남기면 됩니다. 다음 질문에서는 배우고 싶은 분야와 만들고 싶은 결과물을 함께 말해주면 로드맵을 더 정확히 맞출 수 있습니다.");

  return parts.join("\\n\\n");
}
