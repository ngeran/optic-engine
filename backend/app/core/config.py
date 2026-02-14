"""Application configuration using Pydantic Settings."""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # JSNAPy paths
    jsnapy_config_path: str = "/etc/jsnapy/jsnapy.cfg"
    config_dir: str = "/app/config"
    snapshots_dir: str = "/app/snapshots"
    testfiles_dir: str = "/app/testfiles"

    # Device credentials (from env or defaults)
    jnos_device_ip: str = "127.0.0.1"
    jnos_username: str = "admin"
    jnos_password: str = "admin123"
    jnos_test_file: str = "test_version.yaml"

    # API settings
    api_title: str = "Optic Engine API"
    api_version: str = "1.0.0"
    api_prefix: str = ""

    # CORS
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:8000"]

    # Logging
    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


# Global settings instance
settings = Settings()
