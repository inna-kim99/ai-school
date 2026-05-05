"""Utilities for saving learning archive markdown files."""

from __future__ import annotations

import re
from pathlib import Path

ARCHIVE_ROOT = Path("learning_archive")


def sanitize_filename(name: str) -> str:
    """Return a filesystem-safe Korean/English filename segment."""
    cleaned = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", name.strip())
    cleaned = re.sub(r"\s+", "_", cleaned)
    cleaned = cleaned.strip("._ ")
    return cleaned or "untitled"


def save_markdown_archive(category_path: list[str], title: str, content: str) -> str:
    """Save markdown content under ./learning_archive and return the saved path."""
    safe_parts = [sanitize_filename(part) for part in category_path if part.strip()]
    directory = ARCHIVE_ROOT.joinpath(*safe_parts)
    directory.mkdir(parents=True, exist_ok=True)

    safe_title = sanitize_filename(title)
    file_path = directory / f"{safe_title}.md"
    file_path.write_text(content, encoding="utf-8")
    return str(file_path)
