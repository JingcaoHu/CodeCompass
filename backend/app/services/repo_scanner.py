from pathlib import Path
from app.utils.file_filter import (
    should_ignore_dir,
    should_ignore_file,
    get_language,
)


MAX_DEPTH = 5
MAX_CHILDREN_PER_FOLDER = 40


def create_file_summary(file_path: Path, repo_root: Path) -> str:
    relative_path = str(file_path.relative_to(repo_root))

    try:
        size = file_path.stat().st_size
    except OSError:
        size = 0

    if size > 300_000:
        return "This file is large, so CodeCompass skipped deep content reading for the MVP."

    language = get_language(file_path.name)

    return f"This is a {language} file located at {relative_path}."


def scan_directory(path: Path, repo_root: Path, depth: int = 0):
    if depth > MAX_DEPTH:
        return []

    nodes = []

    try:
        items = sorted(path.iterdir(), key=lambda item: (item.is_file(), item.name.lower()))
    except PermissionError:
        return []

    count = 0

    for item in items:
        if count >= MAX_CHILDREN_PER_FOLDER:
            break

        if item.is_dir():
            if should_ignore_dir(item.name):
                continue

            children = scan_directory(item, repo_root, depth + 1)

            nodes.append(
                {
                    "name": item.name,
                    "type": "folder",
                    "path": str(item.relative_to(repo_root)),
                    "children": children,
                }
            )

            count += 1

        elif item.is_file():
            if should_ignore_file(item.name):
                continue

            language = get_language(item.name)

            if language == "Unknown":
                continue

            nodes.append(
                {
                    "name": item.name,
                    "type": "file",
                    "path": str(item.relative_to(repo_root)),
                    "language": language,
                    "summary": create_file_summary(item, repo_root),
                }
            )

            count += 1

    return nodes


def flatten_files(nodes):
    files = []

    for node in nodes:
        if node["type"] == "file":
            files.append(node)
        elif node.get("children"):
            files.extend(flatten_files(node["children"]))

    return files


def build_file_summaries(file_tree):
    files = flatten_files(file_tree)

    important_files = files[:12]

    return [
        {
            "filePath": file["path"],
            "summary": file.get("summary", "No summary available."),
        }
        for file in important_files
    ]


def scan_repo(repo_path: Path):
    file_tree = scan_directory(repo_path, repo_path)
    file_summaries = build_file_summaries(file_tree)

    return {
        "file_tree": file_tree,
        "file_summaries": file_summaries,
    }