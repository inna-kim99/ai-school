import http from "http";

const PORT = Number(process.env.PORT || 3000);
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const now = () => new Date().toISOString();

const agentRows = [
["learning_manager","학습 매니저","response","common","전체 학습 흐름 조율","목표 시작 로드맵 계획 진도"],
["curriculum_designer","커리큘럼 설계자","response","common","기간과 수준에 맞는 커리큘럼 설계","커리큘럼 로드맵 단계 순서"],
["concept_teacher","개념 설명자","response","common","어려운 개념을 쉽게 설명","개념 뭐야 정의 이해 설명"],
["practice_coach","실습 코치","response","common","직접 따라 할 수 있는 실습 안내","실습 연습 따라 해보기"],
["feedback_coach","피드백 코치","response","common","결과물 피드백과 개선점 제시","피드백 검토 봐줘 평가"],
["problem_solver","문제해결 코치","response","common","막힌 부분의 원인 분석","안돼 오류 문제 고장 실패 막힘"],
["project_mentor","프로젝트 멘토","response","common","학습을 프로젝트와 포트폴리오로 연결","프로젝트 결과물 포트폴리오 완성"],
["resource_curator","자료 안내자","response","common","사진 그래프 참고자료 검색 키워드 안내","자료 참고 사진 그림 그래프 시각자료 예시"],
["archive_manager","학습 기록 관리자","background","common","학습 내용 요약과 기록","기록 요약 노트 저장"],
["progress_manager","진도 관리자","background","common","진도율과 단계 업데이트","진도 퍼센트 단계 근황"],
["review_manager","복습 관리자","background","common","복습 질문과 확인 항목 생성","복습 다시 정리 퀴즈"],
["classifier","자료 분류 관리자","background","common","노트와 자료 저장 위치 분류","분류 카테고리 폴더"],
["safety_manager","안전 관리자","response","common","안전 위험과 대체 실습 안내","안전 위험 220V 배터리 전원부 공구 통증"],
["conversation_partner","회화 파트너","response","language","실제 대화 연습 상대","영어 회화 대화 말하기"],
["pronunciation_coach","발음/억양 코치","response","language","발음과 억양 연습","발음 억양 강세 소리"],
["grammar_corrector","문법 교정자","response","language","문법과 문장 교정","문법 교정 맞아 고쳐줘"],
["expression_coach","표현 확장 코치","response","language","자연스러운 표현 확장","표현 자연스럽게 뉘앙스"],
["roleplay_coach","상황극 코치","response","language","상황별 역할극 연습","상황극 롤플레이 역할극"],
["routine_designer","운동 루틴 설계자","response","fitness","운동 루틴 설계","운동 요가 루틴 헬스"],
["posture_coach","자세 코치","response","fitness","자세와 폼 점검","자세 폼 통증 정렬"],
["recovery_coach","회복 코치","response","fitness","휴식 회복 전략 안내","회복 휴식 근육통 피로"],
["difficulty_adjuster","난이도 조절자","response","fitness","난이도와 강도 조절","난이도 강도 어려워 쉬워"],
["injury_prevention_manager","부상 예방 관리자","background","fitness","부상 위험 점검","부상 통증 무리"],
["investment_basics_teacher","투자 기초 설명자","response","investment","투자 기본 개념 설명","투자 주식 ETF 수익률"],
["chart_coach","차트 분석 코치","response","investment","차트 읽는 기준 설명","차트 캔들 거래량 추세"],
["financial_statement_analyst","재무제표 해석가","response","investment","재무제표 항목 해석","재무제표 매출 영업이익 현금흐름"],
["economy_interpreter","경제 흐름 해석가","response","investment","금리 물가 환율 시장 흐름 설명","경제 금리 물가 환율"],
["risk_manager","리스크 관리자","response","investment","투자 위험과 손실 가능성 점검","리스크 손실 매수 매도 비중"],
["investment_journal_manager","투자일지 관리자","background","investment","투자 학습 일지 정리","일지 기록 복기"],
["decision_coach","의사결정 코치","response","investment","판단 기준과 선택지 정리","판단 결정 기준"],
["maker_basics_teacher","제작 기초 선생님","response","maker","제작 재료 도구 공정 기초","제작 메이커 목공 소잉"],
["material_expert","재료 전문가","response","maker","재료 특성과 선택 기준","재료 원단 나무 금속 플라스틱"],
["tool_coach","도구 사용 코치","response","maker","도구 사용법과 안전","도구 공구 드릴 톱"],
["build_sequence_designer","제작 순서 설계자","response","maker","제작 절차와 공정 설계","순서 공정 절차 만드는 법"],
["quality_checker","품질 검사자","response","maker","품질 기준과 완성도 점검","품질 검사 완성 마감"],
["failure_analyst","실패 원인 분석가","response","maker","제작 실패 원인 분석","실패 망했 안맞아 부러짐"],
["design_basics_teacher","설계 기초 선생님","response","engineering","설계 기본 개념 설명","설계 도면 공학 구조"],
["drawing_interpreter","도면 해석가","response","engineering","도면 기호 치수 해석","도면 치수 기호 단면"],
["tolerance_coach","치수/공차 코치","response","engineering","치수와 공차 설명","공차 치수 오차 끼워맞춤"],
["structure_analyst","구조 분석가","response","engineering","구조와 힘 흐름 분석","구조 하중 강도 파손"],
["manufacturability_reviewer","제작 가능성 검토자","response","engineering","제작 가능성 검토","제작 가능 가공 조립 양산"],
["design_reviewer","설계 리뷰어","response","engineering","설계 검토와 개선점","설계 리뷰 검토 개선"],
["standard_guide","표준/규격 안내자","response","engineering","표준 규격 확인 방향 안내","표준 규격 인증 ISO KS"],
["three_d_basics_teacher","3D 기초 선생님","response","3d","3D 작업 기본 개념","3D 모델링 CAD 렌더링"],
["modeling_coach","3D 모델링 코치","response","3d","모델링 절차 안내","모델링 스케치 메쉬 형상"],
["cad_3d_coach","CAD/3D 실습 코치","response","3d","CAD 3D 실습 안내","CAD Fusion Blender 실습"],
["shape_analyst","형상 분석가","response","3d","형상을 모델링 단위로 분석","형상 모양 곡면 분석"],
["workflow_designer","모델링 워크플로우 설계자","response","3d","3D 작업 순서 설계","워크플로우 작업순서 파이프라인"],
["rendering_coach","렌더링 코치","response","3d","렌더링 조명 재질 안내","렌더링 조명 재질 카메라"],
["printability_reviewer","출력 가능성 검토자","response","3d","3D 출력 가능성 점검","출력 서포트 오버행 STL"],
["result_reviewer","결과물 리뷰어","response","3d","결과물 완성도 리뷰","결과물 리뷰 완성도"],
["tech_concept_teacher","기술 개념 설명자","response","tech","IT와 프로그래밍 개념 설명","기술 API 서버 클라우드 AI"],
["coding_tutor","코딩 튜터","response","tech","코딩 실습과 구현 도움","코딩 Python JavaScript 함수 구현"],
["architecture_designer","아키텍처 설계자","response","tech","시스템 구조 설계","아키텍처 구조 백엔드 프론트엔드"],
["debugging_coach","디버깅 코치","response","tech","오류 원인 좁히기","디버깅 에러 버그 로그"],
["code_reviewer","코드 리뷰어","response","tech","코드 품질과 위험 리뷰","코드 리뷰 리팩터링 검토"],
["documentation_manager","문서화 관리자","background","tech","기술 문서 정리","문서 README 설명서"],
["content_planner","콘텐츠 기획자","response","content","콘텐츠 주제와 구성 기획","콘텐츠 기획 영상 블로그"],
["storytelling_coach","스토리텔링 코치","response","content","이야기 구조 설계","스토리 대본 이야기"],
["editing_coach","편집 코치","response","content","영상 편집 흐름 제안","편집 컷 쇼츠 영상"],
["design_critic","디자인 리뷰어","response","content","시각 디자인 리뷰","디자인 썸네일 레이아웃 색"],
["platform_strategist","플랫폼 전략가","response","content","플랫폼별 운영 전략","유튜브 블로그 인스타 플랫폼"],
["content_record_manager","콘텐츠 기록 관리자","background","content","콘텐츠 제작 기록 정리","콘텐츠 기록 아이디어 발행"],
["job_mentor","직무 멘토","response","career","직무 성장 방향 안내","직무 커리어 취업 이직"],
["workflow_interpreter","실무 프로세스 해석가","response","career","실무 절차와 맥락 설명","실무 프로세스 업무 워크플로우"],
["document_writing_coach","문서 작성 코치","response","career","업무 문서 작성 도움","문서 보고서 이메일 제안서"],
["case_analyst","사례 분석가","response","career","실제 사례 분석","사례 케이스 분석"],
["interview_coach","면접 코치","response","career","면접 준비와 답변 피드백","면접 자기소개 질문 답변"],
["portfolio_manager","포트폴리오 관리자","background","career","성과 포트폴리오 정리","포트폴리오 이력서 성과"],
["work_risk_reviewer","실무 리스크 검토자","response","career","실무 위험과 주의점","리스크 주의 법 보안"],
["academic_concept_explainer","개념 해설자","response","academic","학문 개념 설명","학문 개념 이론 정의"],
["context_explainer","맥락 설명자","response","academic","배경과 맥락 설명","맥락 배경 역사 왜"],
["critical_thinking_coach","비판적 사고 코치","response","academic","주장 근거 비판 검토","비판 논리 근거 반박"],
["debate_partner","토론 파트너","response","academic","토론과 관점 확장","토론 논쟁 찬반 의견"],
["question_generator","질문 생성자","background","academic","탐구 질문 생성","질문 퀴즈 생각"],
["writing_coach","글쓰기 코치","response","academic","글 구조와 표현 개선","글쓰기 에세이 문장 논문"],
["reading_record_manager","독서 기록 관리자","background","academic","독서 노트 정리","독서 책 읽기 기록"],
["life_skill_coach","생활기술 코치","response","life","생활기술 실행 안내","생활 취미 자기관리"],
["step_execution_coach","단계별 실행 코치","response","life","작은 실행 단계 설계","단계 실행 루틴"],
["prep_manager","재료/준비물 관리자","background","life","준비물과 비용 정리","준비물 재료 비용"],
["habit_manager","습관 관리자","background","life","습관화와 반복 관리","습관 루틴 반복"],
["record_manager","기록 관리자","background","life","실행 기록 정리","기록 로그 일지"]
];
const AGENTS = agentRows.map(([slug,name,type,group,role,triggers]) => ({ slug, id: slug, name, role, description: role, agent_type: type, type, category_group: group, is_default: ["learning_manager","curriculum_designer","concept_teacher","practice_coach","project_mentor","resource_curator","archive_manager","progress_manager","safety_manager"].includes(slug) ? 1 : 0, triggers: triggers.split(" ").filter(Boolean) }));
const CATEGORIES = [
["language","언어·커뮤니케이션","외국어, 회화, 발음, 문법, 표현",["영어회화","일본어 회화","비즈니스 이메일"],["learning_manager","curriculum_designer","conversation_partner","pronunciation_coach","grammar_corrector","expression_coach","roleplay_coach","feedback_coach","review_manager","archive_manager"]],
["fitness","신체활동·건강·운동","운동, 요가, 스트레칭, 자세, 회복",["요가","헬스","러닝"],["learning_manager","curriculum_designer","routine_designer","posture_coach","recovery_coach","difficulty_adjuster","injury_prevention_manager","safety_manager","progress_manager","archive_manager"]],
["investment","금융·투자·경제","주식, ETF, 경제, 재무제표",["주식","ETF","재무제표"],["learning_manager","curriculum_designer","investment_basics_teacher","chart_coach","financial_statement_analyst","economy_interpreter","risk_manager","decision_coach","investment_journal_manager","review_manager","archive_manager"]],
["maker","제작·메이커·수공예","목공, 소잉, 공구, 재료, 제작",["소잉","목공","가죽공예"],["learning_manager","curriculum_designer","maker_basics_teacher","material_expert","tool_coach","build_sequence_designer","quality_checker","failure_analyst","project_mentor","safety_manager","archive_manager"]],
["engineering","설계·도면·공학","도면, 구조, 치수, 공차, 설계",["설계도","기계 구조","공차"],["learning_manager","curriculum_designer","design_basics_teacher","drawing_interpreter","tolerance_coach","structure_analyst","manufacturability_reviewer","design_reviewer","standard_guide","project_mentor","safety_manager","archive_manager"]],
["3d","3D·디지털 제작","3D 모델링, CAD, 렌더링, 출력",["3D 작업","CAD","Blender"],["learning_manager","curriculum_designer","three_d_basics_teacher","modeling_coach","cad_3d_coach","shape_analyst","workflow_designer","rendering_coach","printability_reviewer","result_reviewer","archive_manager"]],
["tech","기술·IT·프로그래밍","프로그래밍, AI, 웹, 서버, API",["AI 에이전트 만들기","Python","웹 개발"],["learning_manager","curriculum_designer","tech_concept_teacher","coding_tutor","architecture_designer","debugging_coach","code_reviewer","project_mentor","documentation_manager","resource_curator","archive_manager","progress_manager"]],
["content","디지털 창작·콘텐츠","영상, 글, 디자인, 플랫폼 운영",["영상 편집","블로그","유튜브"],["learning_manager","curriculum_designer","content_planner","storytelling_coach","editing_coach","design_critic","platform_strategist","feedback_coach","content_record_manager","project_mentor","archive_manager"]],
["career","직무·커리어·실무역량","직무, 실무 프로세스, 문서, 면접",["의료기기 RA","면접","보고서"],["learning_manager","curriculum_designer","job_mentor","workflow_interpreter","document_writing_coach","case_analyst","interview_coach","portfolio_manager","work_risk_reviewer","archive_manager"]],
["academic","학문·지식탐구","이론, 독서, 글쓰기, 토론",["철학","역사","독서"],["learning_manager","curriculum_designer","academic_concept_explainer","context_explainer","critical_thinking_coach","debate_partner","question_generator","writing_coach","reading_record_manager","archive_manager"]],
["life","생활기술·취미·자기관리","생활기술, 취미, 습관, 자기관리",["요리","정리","습관"],["learning_manager","curriculum_designer","life_skill_coach","step_execution_coach","prep_manager","habit_manager","problem_solver","record_manager","review_manager"]]
].map(([id,name,description,examples,recommended_agent_slugs]) => ({ id, name, description, examples, recommended_agent_slugs, recommended_agent_ids: recommended_agent_slugs, safety_notes: [] }));

function send(res, status, obj) { res.writeHead(status, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS", "access-control-allow-headers": "content-type" }); res.end(JSON.stringify(obj)); }
function fail(res, status, message) { send(res, status, { answer: null, error: message }); }
async function read(req) { const chunks=[]; let n=0; for await (const c of req) { n += c.length; if (n > 262144) throw Error("REQUEST_TOO_LARGE"); chunks.push(c); } return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {}; }
function hasDb() { return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY); }
async function db(path, opt={}) { if (!hasDb()) throw Object.assign(Error("SUPABASE_NOT_CONFIGURED"), { status: 503 }); const r = await fetch(`${SUPABASE_URL}/rest/v1${path}`, { method: opt.method || "GET", headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "content-type": "application/json", prefer: opt.prefer || "return=representation", ...(opt.headers || {}) }, body: opt.body === undefined ? undefined : JSON.stringify(opt.body) }); const t = await r.text(); const d = t ? JSON.parse(t) : null; if (!r.ok) throw Object.assign(Error((d && d.message) || "Supabase 요청 실패"), { status: r.status }); return d; }
async function seed() { if (!hasDb()) return; await db("/agents?on_conflict=slug", { method: "POST", prefer: "resolution=merge-duplicates,return=minimal", body: AGENTS.map(a => ({ slug: a.slug, name: a.name, role: a.role, description: a.description, agent_type: a.agent_type, category_group: a.category_group, is_default: Boolean(a.is_default) })) }); }
function rec(cat) { const c = CATEGORIES.find(x => x.id === cat || x.name === cat); return c ? c.recommended_agent_slugs : ["learning_manager","curriculum_designer","concept_teacher","practice_coach","archive_manager"]; }
function roadmap(t) { const d = `${t.duration_value || ""}${t.duration_unit || ""}`; const base = `주제: ${t.name}\n목표: ${t.goal || "실행 가능한 수준까지 성장"}\n방식: ${t.learning_style || "균형형"}`; if (d.includes("2주")) return `${base}\n1주차: 핵심 개념과 기본 감각\n2주차: 작은 실습과 결과물`; if (d.includes("1개월")) return `${base}\n1주차: 기초 개념\n2주차: 기본 실습\n3주차: 응용 과제\n4주차: 미니 프로젝트`; if (d.includes("3개월")) return `${base}\n1개월차: 기초와 도구\n2개월차: 응용 실습과 문제 해결\n3개월차: 개인 프로젝트`; if (d.includes("6개월") || d.includes("1년")) return `${base}\n1단계: 기초 개념\n2단계: 구조와 원리\n3단계: 기초 실습\n4단계: 응용 제작\n5단계: 실제 사례 분석\n6단계: 개인 프로젝트와 포트폴리오`; return `${base}\n1단계: 핵심 용어\n2단계: 기본 예제\n3단계: 응용 과제\n4단계: 실제 적용\n5단계: 결과물 정리`; }
function safety(t,q){const s=`${t.category||""} ${t.name||""} ${q}`;if(/주식|투자|ETF|차트|재무제표|금리/.test(s))return"투자 내용은 학습 목적이며 특정 종목 매수/매도 지시나 수익 보장을 제공하지 않습니다.";if(/요가|운동|자세|통증/.test(s))return"통증이 있으면 즉시 중단하고 필요하면 전문가와 상담하세요.";if(/목공|공구|제작|절단|분진|소음/.test(s))return"보호구를 착용하고 절단, 분진, 소음, 전동공구 위험을 확인하세요.";if(/전자|전기|220V|배터리|전원부|리튬|커패시터|분해/.test(s))return"220V, 전원부, 리튬 배터리, 고전압 커패시터 분해는 위험합니다. 저전압 실습으로 대체하세요.";return"";}
function route(q,t,en){const pool=en.length?en:AGENTS.filter(a=>rec(t.category).includes(a.slug));const out=new Map();const add=ids=>ids.forEach(id=>{const a=pool.find(x=>(x.slug||x.id)===id);if(a)out.set(a.slug||a.id,a)});add(["learning_manager"]);pool.forEach(a=>{if((a.triggers||[]).some(k=>q.includes(k)))out.set(a.slug||a.id,a)});if(/개념|뭐야|정의|이해/.test(q))add(["concept_teacher","tech_concept_teacher","academic_concept_explainer"]);if(/자료|사진|그림|그래프|참고/.test(q))add(["resource_curator"]);if(/실습|연습|따라/.test(q))add(["practice_coach","cad_3d_coach","conversation_partner"]);if(/제작|만들|프로젝트|완성/.test(q))add(["build_sequence_designer","project_mentor"]);if(/오류|문제|막힘|안 돼/.test(q))add(["problem_solver","failure_analyst","debugging_coach"]);if(/위험|220V|배터리|공구|통증|투자|주식/.test(q))add(["safety_manager","risk_manager"]);if(!out.size)add(rec(t.category).slice(0,4));return [...out.values()].filter(a=>(a.agent_type||a.type)==="response").slice(0,5);}
async function ai(messages){if(!OPENAI_API_KEY)throw Object.assign(Error("OPENAI_API_KEY가 Render 환경변수에 설정되어 있지 않습니다."),{status:500});const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{authorization:`Bearer ${OPENAI_API_KEY}`,"content-type":"application/json"},body:JSON.stringify({model:OPENAI_MODEL,messages,temperature:0.45})});const d=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(Error((d.error&&d.error.message)||"OpenAI API 요청 실패"),{status:r.status});return{answer:d.choices?.[0]?.message?.content||"답변을 생성하지 못했습니다.",model:OPENAI_MODEL,usage:d.usage||null};}
async function topic(id){const r=await db(`/topics?select=*&id=eq.${id}&limit=1`,{headers:{prefer:""}});return r&&r[0];}
async function enabled(id){const r=await db(`/topic_agents?select=agent_id,is_enabled,agents(*)&topic_id=eq.${id}&is_enabled=eq.true`,{headers:{prefer:""}});return(r||[]).map(x=>x.agents).filter(Boolean);}
function meta(t,q){let c=/실습|연습/.test(q)?"04_실습기록":/프로젝트|제작|완성/.test(q)?"05_프로젝트":/오류|문제|막힘/.test(q)?"06_문제해결":"01_기초개념";const title=q.replace(/[^\p{L}\p{N}\s_-]/gu,"").trim().slice(0,36).replace(/\s+/g,"_")||"학습_기록";return{category:c,subcategory:t.category||"general",title,file_path:`learning_archive/${t.name}/${c}/${title}.md`};}
async function createTopic(b){await seed();const rm=roadmap(b);const rows=await db("/topics",{method:"POST",body:{category:b.category,name:b.name,description:`## 초기 커리큘럼\n${rm}`,goal:b.goal,target_level:b.target_level,current_level:b.current_level,duration_value:b.duration_value,duration_unit:b.duration_unit,learning_style:b.learning_style,progress_percent:0,current_stage:"시작: 목표 설정과 기초 진단",created_at:now(),updated_at:now()}});const t=rows[0];const slugs=b.agent_slugs?.length?b.agent_slugs:rec(b.category);const as=await db(`/agents?select=id,slug&slug=in.(${slugs.map(encodeURIComponent).join(",")})`,{headers:{prefer:""}});if(as.length)await db("/topic_agents",{method:"POST",body:as.map(a=>({topic_id:t.id,agent_id:a.id,is_enabled:true}))});return{topic:t,roadmap:rm};}
async function learn(b){const t=await topic(b.topic_id);if(!t)throw Object.assign(Error("학습 주제를 찾을 수 없습니다."),{status:404});const en=await enabled(t.id);const selected=b.auto_route===false?en.filter(a=>a.agent_type==="response").slice(0,5):route(b.user_input,t,en);const warn=safety(t,b.user_input);const prompt=["너는 개인용 AI 학습관리 에이전트다. 시험 대비보다 실제 이해와 실행 능력 향상을 목표로 한다. 한국어로 답변한다.","질문에 답하되 현재 학습 흐름과 목표에서 벗어나지 않게 한다.","형식: 1. 핵심 답변 2. 현재 학습 주제와의 연결 3. 지금 단계에서 알아야 할 수준 4. 직접 해볼 수 있는 것 5. 다음 학습 방향 6. 저장/진도 업데이트 정보",warn,`주제: ${t.name}`,`목표: ${t.goal||""}`,`현재 단계: ${t.current_stage||""}`,`진도율: ${t.progress_percent||0}%`,`참여 에이전트: ${selected.map(a=>`${a.name}(${a.role})`).join(", ")}`].filter(Boolean).join("\n\n");const out=await ai([{role:"system",content:prompt},{role:"user",content:b.user_input}]);const m=meta(t,b.user_input);const used=selected.map(a=>a.name);const delta=b.auto_progress===false?0:/프로젝트|완성|제작/.test(b.user_input)?3:/실습|연습/.test(b.user_input)?2:1;const prev=Number(t.progress_percent||0),next=Math.min(100,prev+delta);let lesson=null;if(b.auto_save!==false){lesson=(await db("/lessons",{method:"POST",body:{topic_id:t.id,title:m.title,user_input:b.user_input,ai_response:out.answer,summary:out.answer.slice(0,500),used_agents:JSON.stringify(used),created_at:now()}}))[0];await db("/archive_notes",{method:"POST",body:{topic_id:t.id,lesson_id:lesson.id,category:m.category,subcategory:m.subcategory,title:m.title,content:`# ${m.title}\n\n## 질문\n${b.user_input}\n\n## 답변\n${out.answer}`,file_path:m.file_path,created_at:now()}});}if(delta){const stage=next>=50?"응용 실습과 문제 해결":next>=20?"기초 실습과 구조 이해":"기초 개념 이해";await db(`/topics?id=eq.${t.id}`,{method:"PATCH",body:{progress_percent:next,current_stage:stage,updated_at:now()}});await db("/progress_logs",{method:"POST",body:{topic_id:t.id,lesson_id:lesson&&lesson.id,previous_progress:prev,new_progress:next,stage,progress_note:`질문과 답변 완료로 ${delta}%p 업데이트`,created_at:now()}});}return{answer:out.answer,used_agents:used,summary:out.answer.slice(0,500),archive_title:m.title,archive_category:m.category,archive_subcategory:m.subcategory,archive_path:m.file_path,progress_note:delta?`${prev}% → ${next}%`:"자동 진도 업데이트 꺼짐",progress_delta:delta,safety_note:warn,model:out.model,usage:out.usage,error:null};}
async function handle(req,res){const u=new URL(req.url||"/",`http://${req.headers.host}`),p=u.pathname;if(req.method==="GET"&&p==="/health")return send(res,200,{ok:true,service:"school-agent-team-openai-proxy",model:OPENAI_MODEL,supabase:hasDb(),agents:AGENTS.length,categories:CATEGORIES.length,error:null});if(req.method==="GET"&&p==="/api/bootstrap"){await seed();return send(res,200,{agents:AGENTS,categories:CATEGORIES,supabase:hasDb(),error:null});}if(req.method==="GET"&&p==="/api/topics")return send(res,200,{topics:await db("/topics?select=*&order=updated_at.desc",{headers:{prefer:""}}),error:null});if(req.method==="POST"&&p==="/api/topics"){const b=await read(req);if(!b.name||!b.category)return fail(res,400,"category와 name은 필수입니다.");return send(res,200,{...(await createTopic(b)),error:null});}const m=p.match(/^\/api\/topics\/(\d+)(?:\/(agents|lessons|archive|progress))?$/);if(m){const id=m[1],child=m[2];if(req.method==="GET"&&!child)return send(res,200,{topic:await topic(id),error:null});if(req.method==="GET"&&child==="agents")return send(res,200,{agents:await enabled(id),error:null});if(req.method==="POST"&&child==="agents"){const b=await read(req);await db(`/topic_agents?topic_id=eq.${id}`,{method:"DELETE",prefer:"return=minimal"});const slugs=b.agent_slugs||[];const as=slugs.length?await db(`/agents?select=id,slug&slug=in.(${slugs.map(encodeURIComponent).join(",")})`,{headers:{prefer:""}}):[];if(as.length)await db("/topic_agents",{method:"POST",body:as.map(a=>({topic_id:Number(id),agent_id:a.id,is_enabled:true}))});return send(res,200,{ok:true,error:null});}if(req.method==="GET"&&child==="lessons")return send(res,200,{lessons:await db(`/lessons?select=*&topic_id=eq.${id}&order=created_at.desc`,{headers:{prefer:""}}),error:null});if(req.method==="GET"&&child==="archive")return send(res,200,{notes:await db(`/archive_notes?select=*&topic_id=eq.${id}&order=created_at.desc`,{headers:{prefer:""}}),error:null});if(req.method==="GET"&&child==="progress")return send(res,200,{logs:await db(`/progress_logs?select=*&topic_id=eq.${id}&order=created_at.desc`,{headers:{prefer:""}}),error:null});}if(req.method==="POST"&&p==="/api/learn")return send(res,200,await learn(await read(req)));if(req.method==="POST"&&["/api/chat","/chat","/"].includes(p)){const b=await read(req);const r=await ai(b.messages||[]);return send(res,200,{...r,error:null});}fail(res,404,"요청한 경로를 찾을 수 없습니다.");}
http.createServer(async(req,res)=>{if(req.method==="OPTIONS")return send(res,200,{ok:true,error:null});try{await handle(req,res);}catch(e){if(e.message==="REQUEST_TOO_LARGE")return fail(res,413,"요청 본문이 너무 큽니다.");if(e.message==="SUPABASE_NOT_CONFIGURED")return fail(res,503,"SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 Render 환경변수에 설정되어 있지 않습니다.");fail(res,e.status||500,e.message||"서버 오류가 발생했습니다.");}}).listen(PORT,()=>console.log(`Personal learning agent backend on ${PORT}`));
