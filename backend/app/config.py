import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.4-mini")
MAX_IMPORTANT_FILES = int(os.getenv("MAX_IMPORTANT_FILES", "8"))
MAX_FILE_CHARS = int(os.getenv("MAX_FILE_CHARS", "6000"))
MAX_SUPPORTED_FILES = int(os.getenv("MAX_SUPPORTED_FILES", "300"))