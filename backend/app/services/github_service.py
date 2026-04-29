import shutil
import tempfile
from pathlib import Path
from git import Repo


def get_project_name(repo_url: str) -> str:
    clean_url = repo_url.rstrip("/")
    name = clean_url.split("/")[-1]

    if name.endswith(".git"):
        name = name[:-4]

    return name


def clone_github_repo(repo_url: str) -> Path:
    temp_dir = tempfile.mkdtemp(prefix="codecompass_")
    project_path = Path(temp_dir) / get_project_name(repo_url)

    Repo.clone_from(repo_url, project_path, depth=1)

    return project_path


def cleanup_repo(repo_path: Path):
    temp_root = repo_path.parent

    if temp_root.exists():
        shutil.rmtree(temp_root, ignore_errors=True)