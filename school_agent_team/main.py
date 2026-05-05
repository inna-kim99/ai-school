"""CLI entry point for the school team AI agent system."""

from __future__ import annotations

import asyncio
import os
from datetime import datetime

from dotenv import load_dotenv

from teams.school_team import answer_with_school_team, create_archive_summary
from utils.archive import save_markdown_archive, sanitize_filename


def has_api_key() -> bool:
    """Check whether the OpenAI API key is available."""
    return bool(os.getenv("OPENAI_API_KEY"))


def print_help() -> None:
    """Print available CLI commands."""
    print(
        """
사용 가능한 명령어
- /archive on      : 학습 기록 저장 켜기
- /archive off     : 학습 기록 저장 끄기
- /archive status  : 현재 저장 상태 확인
- /roadmap         : 현재 학습 목표 기준 6개월 로드맵 요청
- /help            : 도움말 보기
- exit 또는 quit   : 종료
""".strip()
    )


def looks_like_learning_goal(user_input: str) -> bool:
    """Heuristically detect a long-term learning goal from a user message."""
    goal_keywords = ("되고 싶", "배우고 싶", "목표", "로드맵", "전문가", "수준", "시작")
    return any(keyword in user_input for keyword in goal_keywords)


def build_archive_category(current_goal: str | None) -> list[str]:
    """Create a simple archive category path from the current learning goal."""
    if not current_goal:
        return ["일반_학습", "자동기록"]
    topic = sanitize_filename(current_goal[:30])
    return [topic, "자동기록"]


def build_archive_title(user_input: str) -> str:
    """Create a compact archive title from the user input and current time."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    short_question = sanitize_filename(user_input[:24])
    return f"{timestamp}_{short_question}"


async def save_lesson_archive(user_input: str, answer: str, current_goal: str | None) -> str:
    """Ask the archive manager for a summary and save it as markdown."""
    archive_content = await create_archive_summary(user_input, answer, current_goal)
    category_path = build_archive_category(current_goal)
    title = build_archive_title(user_input)
    return save_markdown_archive(category_path, title, archive_content)


async def chat_loop() -> None:
    """Run the command-line chat loop."""
    archive_enabled = True
    current_goal: str | None = None

    print("학교팀 AI 에이전트가 시작되었습니다.")
    print("배우고 싶은 주제나 목표를 입력하세요.")
    print("종료하려면 exit 또는 quit을 입력하세요.")
    print("명령어를 보려면 /help 를 입력하세요.")
    print()

    while True:
        user_input = input("사용자> ").strip()

        if not user_input:
            continue

        lowered = user_input.lower()
        if lowered in {"exit", "quit"}:
            print("학교팀 AI 에이전트를 종료합니다.")
            break

        if lowered == "/help":
            print_help()
            continue

        if lowered == "/archive on":
            archive_enabled = True
            print("학습 기록 저장을 켰습니다.")
            continue

        if lowered == "/archive off":
            archive_enabled = False
            print("학습 기록 저장을 껐습니다.")
            continue

        if lowered == "/archive status":
            status = "켜짐" if archive_enabled else "꺼짐"
            print(f"현재 학습 기록 저장 상태: {status}")
            continue

        is_roadmap_command = lowered == "/roadmap"
        if is_roadmap_command:
            if not current_goal:
                print("아직 현재 학습 목표가 없습니다. 먼저 배우고 싶은 목표를 입력해 주세요.")
                continue
            user_input = f"현재 학습 목표 '{current_goal}'를 기준으로 6개월 전문가 성장 로드맵을 만들어줘."

        if not is_roadmap_command and looks_like_learning_goal(user_input):
            current_goal = user_input

        try:
            answer = await answer_with_school_team(user_input, current_goal)
            print()
            print("학교팀>")
            print(answer)

            if archive_enabled:
                saved_path = await save_lesson_archive(user_input, answer, current_goal)
                print()
                print(f"학습 기록 저장 완료: {saved_path}")

            print()
        except Exception as exc:
            print()
            print("답변을 생성하는 중 문제가 발생했습니다.")
            print(f"오류 내용: {exc}")
            print("잠시 후 다시 시도하거나, OPENAI_API_KEY 설정을 확인해 주세요.")
            print()


def main() -> None:
    """Load environment variables and start the CLI."""
    load_dotenv()

    if not has_api_key():
        print("OPENAI_API_KEY가 설정되어 있지 않습니다.")
        print(".env 파일을 만들고 아래처럼 API 키를 입력해 주세요.")
        print("OPENAI_API_KEY=your_openai_api_key_here")
        return

    asyncio.run(chat_loop())


if __name__ == "__main__":
    main()
