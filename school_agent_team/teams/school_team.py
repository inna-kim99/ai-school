"""Agent definitions and orchestration for the school team."""

from __future__ import annotations

from agents import Agent, Runner

from utils.prompts import (
    CONCEPT_TEACHER_PROMPT,
    DESIGN_ENGINEER_PROMPT,
    FINAL_SUMMARY_PROMPT,
    GROWTH_RECORD_MANAGER_PROMPT,
    LEARNING_ARCHIVE_MANAGER_PROMPT,
    LEARNING_DESIGNER_PROMPT,
    PRACTICE_COACH_PROMPT,
    PRINCIPLE_ANALYST_PROMPT,
    PROJECT_MENTOR_PROMPT,
    SAFETY_MANAGER_PROMPT,
    SCHOOL_MANAGER_PROMPT,
    TEARDOWN_ANALYST_PROMPT,
    TROUBLESHOOTING_COACH_PROMPT,
)


TEAM_MEETING_TRIGGERS = (
    "팀 회의",
    "여러 선생님 의견",
    "학교팀 전체",
    "다 같이 검토",
    "전문가처럼 분석",
    "프로젝트로 연결",
    "로드맵까지",
    "직접 만들 수 있게",
)


school_manager = Agent(name="학교팀 매니저", instructions=SCHOOL_MANAGER_PROMPT)
learning_designer = Agent(name="학습 설계자", instructions=LEARNING_DESIGNER_PROMPT)
concept_teacher = Agent(name="개념 교수", instructions=CONCEPT_TEACHER_PROMPT)
principle_analyst = Agent(name="원리 해석가", instructions=PRINCIPLE_ANALYST_PROMPT)
teardown_analyst = Agent(name="분해/분석 전문가", instructions=TEARDOWN_ANALYST_PROMPT)
practice_coach = Agent(name="실습 코치", instructions=PRACTICE_COACH_PROMPT)
design_engineer = Agent(name="설계 엔지니어", instructions=DESIGN_ENGINEER_PROMPT)
project_mentor = Agent(name="프로젝트 멘토", instructions=PROJECT_MENTOR_PROMPT)
troubleshooting_coach = Agent(name="문제해결 코치", instructions=TROUBLESHOOTING_COACH_PROMPT)
safety_manager = Agent(name="안전 관리자", instructions=SAFETY_MANAGER_PROMPT)
growth_record_manager = Agent(name="성장 기록 관리자", instructions=GROWTH_RECORD_MANAGER_PROMPT)
learning_archive_manager = Agent(name="학습 아카이브 관리자", instructions=LEARNING_ARCHIVE_MANAGER_PROMPT)


def should_run_school_meeting(user_input: str) -> bool:
    """Return True when the user asks for a full team-style answer."""
    return any(trigger in user_input for trigger in TEAM_MEETING_TRIGGERS)


async def run_manager_answer(user_input: str, current_goal: str | None = None) -> str:
    """Run a direct manager-centered answer for simple questions."""
    prompt = _build_context_prompt(user_input, current_goal)
    result = await Runner.run(school_manager, prompt)
    return result.final_output


async def _run_agent_opinion(agent: Agent, user_input: str, context: str = "", current_goal: str | None = None) -> str:
    """Ask one team member for a concise expert opinion."""
    prompt = f"""
현재 장기 학습 목표:
{current_goal or "아직 명확히 정해지지 않음"}

사용자 요청:
{user_input}

이전 회의 맥락:
{context if context else "아직 없음"}

너의 역할에 집중해서 핵심 의견을 제시해라.
중복 설명은 줄이고, 실제 학습/실습/제작에 도움이 되는 내용만 정리해라.
학습 흐름에서 벗어난 질문도 짧게 답한 뒤 현재 목표와 연결해라.
"""
    result = await Runner.run(agent, prompt)
    return result.final_output


async def run_school_meeting(user_input: str, current_goal: str | None = None) -> str:
    """Run a sequential team meeting and let the manager produce the final answer."""
    meeting_agents = [
        learning_designer,
        concept_teacher,
        principle_analyst,
        practice_coach,
        design_engineer,
        project_mentor,
        safety_manager,
        growth_record_manager,
        learning_archive_manager,
    ]

    opinions: list[str] = []
    context = ""

    # Sequential execution makes each team member's contribution explicit and easy to extend.
    for agent in meeting_agents:
        opinion = await _run_agent_opinion(agent, user_input, context, current_goal)
        formatted_opinion = f"## {agent.name}\n{opinion}"
        opinions.append(formatted_opinion)
        context = "\n\n".join(opinions)

    final_prompt = f"""
{FINAL_SUMMARY_PROMPT}

현재 장기 학습 목표:
{current_goal or "아직 명확히 정해지지 않음"}

사용자 요청:
{user_input}

학교팀 회의 내용:
{context}
"""
    result = await Runner.run(school_manager, final_prompt)
    return result.final_output


async def create_archive_summary(user_input: str, answer: str, current_goal: str | None = None) -> str:
    """Create a compact markdown archive note from the latest lesson."""
    prompt = f"""
현재 장기 학습 목표:
{current_goal or "아직 명확히 정해지지 않음"}

사용자 질문:
{user_input}

학교팀 답변:
{answer}

위 내용을 복습과 포트폴리오에 쓰기 좋은 markdown 학습 기록으로 요약해라.
"""
    result = await Runner.run(learning_archive_manager, prompt)
    return result.final_output


async def answer_with_school_team(user_input: str, current_goal: str | None = None) -> str:
    """Route the request to either the manager or the full school meeting."""
    if should_run_school_meeting(user_input):
        return await run_school_meeting(user_input, current_goal)
    return await run_manager_answer(user_input, current_goal)


def _build_context_prompt(user_input: str, current_goal: str | None) -> str:
    """Attach the current long-term goal so casual questions stay in the learning flow."""
    return f"""
현재 장기 학습 목표:
{current_goal or "아직 명확히 정해지지 않음"}

사용자 요청:
{user_input}

사용자가 장기 계획이나 처음 목표를 말한 경우에는 6개월 로드맵을 제안해라.
일상적인 질문이면 질문에 답하되 현재 학습 목표와 연결하고, 지금 단계에서 알면 충분한 수준을 알려줘라.
"""
