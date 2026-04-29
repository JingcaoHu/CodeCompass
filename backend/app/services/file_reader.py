from pathlib import Path
from app.utils.file_filter import get_language, should_ignore_dir
from app.config import MAX_FILE_CHARS, MAX_IMPORTANT_FILES, MAX_SUPPORTED_FILES


IMPORTANT_FILENAMES = {
    "README.md",
    "package.json",
    "requirements.txt",
    "pyproject.toml",
    "main.py",
    "app.py",
    "server.py",
    "index.js",
    "index.ts",
    "App.tsx",
    "App.jsx",
    "main.tsx",
    "main.jsx",
}


def score_file(path: Path) -> int:
    name = path.name
    path_text = str(path).lower()
    score = 0

    if name in IMPORTANT_FILENAMES:
        score += 10
    if "main" in name.lower():
        score += 4
    if "app" in name.lower():
        score += 4
    if "route" in path_text:
        score += 3
    if "api" in path_text:
        score += 3
    if "component" in path_text:
        score += 2
    if path.suffix in {".py", ".ts", ".tsx", ".js", ".jsx"}:
        score += 2

    return score


def collect_supported_files(repo_path: Path):
    files = []

    for path in repo_path.rglob("*"):
        if not path.is_file():
            continue

        if any(should_ignore_dir(part) for part in path.parts):
            continue

        language = get_language(path.name)

        if language == "Unknown":
            continue

        try:
            size = path.stat().st_size
        except OSError:
            continue

        if size > 300_000:
            continue

        files.append(path)

        if len(files) >= MAX_SUPPORTED_FILES:
            break

    return files


def read_important_files(repo_path: Path):
    files = collect_supported_files(repo_path)
    ranked = sorted(files, key=score_file, reverse=True)
    selected = ranked[:MAX_IMPORTANT_FILES]

    results = []

    for path in selected:
        try:
            content = path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue

        relative_path = str(path.relative_to(repo_path))

        results.append(
            {
                "path": relative_path,
                "language": get_language(path.name),
                "content": content[:MAX_FILE_CHARS],
                "chars_read": min(len(content), MAX_FILE_CHARS),
            }
        )

    return results