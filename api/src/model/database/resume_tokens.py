from collections.abc import Mapping
from typing import Any

from beanie import Document, Indexed
from pydantic import Field


class ABListener1ResumeToken(Document):
    listener: Indexed(str, unique=True) = Field(default="aspint")
    resume_token: Mapping[str, Any]

    class Settings:
        name = "ab_listener1_resume_token"

class ABListener2ResumeToken(Document):
    listener: Indexed(str, unique=True) = Field(default="aspint")
    resume_token: Mapping[str, Any]

    class Settings:
        name = "ab_listener2_resume_token"

