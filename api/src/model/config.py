from beanie import Document


class Config(Document):
    # refresh interval for appointment table check
    refresh_interval: int

    class Settings:
        name = "config"

