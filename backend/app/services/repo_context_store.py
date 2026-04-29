repo_memory: dict[str, list[dict]] = {}


def save_repo_context(repo_url: str, important_files: list[dict]):
    repo_memory[repo_url] = important_files


def get_repo_context(repo_url: str):
    return repo_memory.get(repo_url, [])
