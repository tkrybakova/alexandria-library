from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Alexandria Library"
    DEBUG: bool = False
    DATABASE_URL: str

    model_config = {
        "env_file": ".env.example",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
