from pydantic import BaseModel, EmailStr
from enum import Enum

# ---------- LOGIN / USER ----------
class LoginMethod(str, Enum):
    EMAIL = "email"
    GOOGLE = "google"

class CreateUserSchema(BaseModel):
    email: EmailStr | None = None
    username: str
    password: str | None = None
    googleId: str | None = None

class LoginSchema(BaseModel):
    email: str | None = None
    password: str | None = None
    googleId: str | None = None

class LinkGoogleSchema(BaseModel):
    user_id: str
    googleId: str

# ---------- FAMILIES ----------
class FamilyType(str, Enum):
    HOME = "home"
    OFFICE = "office"

class CreateFamilySchema(BaseModel):
    name: str
    type: FamilyType
    user_id: str
    login_method: LoginMethod

# ---------- ITEMS ----------
class AddItemSchema(BaseModel):
    family_id: str
    user_id: str
    login_method: LoginMethod
    name: str
    barcode: str
    expirationDate: str
    notify: bool
    beforeDays: int
    storage: str | None = None
    photo: str | None = None

# ---------- SCAN BARCODE ----------
class ScanItemSchema(BaseModel):
    family_id: str
    barcode: str
    user_id: str
