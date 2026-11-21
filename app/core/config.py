
from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "order management sys"

    APP_ENV: Literal[
        "development",
        "testing",
        "production"
    ] = "development"

    DATABASE_URL: str
    DEBUG: bool = True
    TEST_DATABASE_URL: str | None = None
    MIGRATION_DATABASE_URL: str| None = None

    @model_validator(mode="after")
    def validate_production_settings(self):
        if self.APP_ENV == "production" and self.DEBUG:
            raise ValueError("DEBUG must be False in production")

        return self

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()  # type: ignore
