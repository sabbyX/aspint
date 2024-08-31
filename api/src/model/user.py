from typing import Literal

from beanie import Document


class User(Document):
    name: str

    email: str
    password: str

    status: Literal["active", "inactive", "error"]
    status_text: str
