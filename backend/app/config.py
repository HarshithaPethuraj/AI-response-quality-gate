from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Loads config from environment / .env. One source of truth."""
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    primary_provider: str = "mock"
    primary_model: str = "mock-small"
    fallback_provider: str = "mock"
    fallback_model: str = "mock-large"
    judge_provider: str = "mock"
    judge_model: str = "mock-judge"

    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
<<<<<<< HEAD
    groq_api_key: str | None = None
=======
>>>>>>> a7d0c06 (Initial commit: AI Response Quality Gate POC (FastAPI backend + React debugger))

    grounding_threshold: float = 0.7
    completeness_threshold: float = 0.7
    quality_threshold: float = 0.7
    max_retries: int = 3


settings = Settings()
