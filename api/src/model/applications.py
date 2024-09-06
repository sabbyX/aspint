from typing import Literal

from beanie import Document


class Applications(Document):
    name: str

    email: str
    password: str

    status: Literal["active", "completed", "error"]
    status_text: str

    class Setting:
        name = "applications"
