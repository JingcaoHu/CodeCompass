IGNORE_DIRS = {
    ".git",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv",
    "dist",
    "build",
    ".next",
    ".cache",
    ".pytest_cache",
    ".mypy_cache",
}

IGNORE_FILES = {
    ".DS_Store",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
}

SUPPORTED_EXTENSIONS = {
    ".py": "Python",
    ".js": "JavaScript",
    ".jsx": "JavaScript React",
    ".ts": "TypeScript",
    ".tsx": "TypeScript React",
    ".json": "JSON",
    ".md": "Markdown",
    ".html": "HTML",
    ".css": "CSS",
    ".java": "Java",
    ".sql": "SQL",
    ".yml": "YAML",
    ".yaml": "YAML",
    ".txt": "Text",
}


def should_ignore_dir(dirname: str) -> bool:
    return dirname in IGNORE_DIRS


def should_ignore_file(filename: str) -> bool:
    return filename in IGNORE_FILES


def get_language(filename: str) -> str:
    for extension, language in SUPPORTED_EXTENSIONS.items():
        if filename.endswith(extension):
            return language
    return "Unknown"