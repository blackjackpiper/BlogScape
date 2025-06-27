from pydantic import BaseModel
from fastapi import Form

class UserSignup(BaseModel):
    username: str
    email: str
    password: str

    @classmethod
    def as_form(
        cls,
        username: str = Form(...),
        email: str = Form(...),
        password: str = Form(...)
    ):
        return cls(username=username, email=email, password=password)

class UserLogin(BaseModel):
    email: str
    password: str

    @classmethod
    def as_form(
        cls,
        email: str = Form(...),
        password: str = Form(...)
    ):
        return cls(email=email, password=password)

class Blog(BaseModel):
    title: str
    content: str
    public: bool =True
    likes: int = 0
    @classmethod
    def as_form(
        cls,
        title: str = Form(...),
        content: str = Form(...),
        public: bool = Form(True)
    ):
        return cls(title=title, content=content, public=public)

