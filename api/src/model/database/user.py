from beanie import Document

class User(Document):
    name: str
    username: str
    hashed_password: str

    class Settings:
        name = "service_users"
