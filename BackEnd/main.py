from fastapi import FastAPI, HTTPException
from bson import ObjectId
from datetime import datetime
from database import users_col, families_col, items_col, products_col
from schemas import (
    CreateUserSchema, LoginSchema, LinkGoogleSchema,
    CreateFamilySchema, AddItemSchema, ScanItemSchema
)
from helpers import is_family_member, can_share_family, calc_notify_date
from passlib.hash import bcrypt

app = FastAPI()

# ---------- CREATE ACCOUNT ----------
@app.post("/users")
def create_account(data: CreateUserSchema):
    if data.googleId:
        if users_col.find_one({"googleId": data.googleId}):
            raise HTTPException(status_code=400, detail="Google account already exists")
        user = {
            "_id": ObjectId(), 
            "username": data.username,
            "googleId": data.googleId, 
            "createdAt": datetime.utcnow()
        }
    elif data.email and data.password:
        if users_col.find_one({"email": data.email}):
            raise HTTPException(status_code=400, detail="Email already exists")
        user = {
            "_id": ObjectId(), 
            "email": data.email,
            "username": data.username, 
            "password": bcrypt.hash(data.password), 
            "createdAt": datetime.utcnow()
        }
    else:
        raise HTTPException(status_code=400, detail="Must provide GoogleId or Email+Password")
    users_col.insert_one(user)
    return {
        "_id": str(user["_id"]),
        "message": "user created"
    }

# ---------- LOGIN ----------
@app.post("/login")
def login(data: LoginSchema):
    if data.googleId:
        user = users_col.find_one({"googleId": data.googleId})
        if not user:
            raise HTTPException(status_code=404, detail="Google user not found")
        login_method = "google"
    elif data.email and data.password:
        user = users_col.find_one({"email": data.email})
        if not user or not user.get("password") or not bcrypt.verify(data.password, user["password"]):
            raise HTTPException(status_code=403, detail="Invalid email or password")
        login_method = "email"
    else:
        raise HTTPException(status_code=400, detail="Must provide GoogleId or Email+Password")
    return {
        "_id": str(user["_id"]), 
        "username": user["username"], 
        "login_method": login_method
    }

# ---------- LINK GOOGLE ----------
@app.post("/users/link-google")
def link_google(data: LinkGoogleSchema):
    user_id = ObjectId(data.user_id)
    if users_col.find_one({"googleId": data.googleId}):
        raise HTTPException(status_code=400, detail="Google account already linked with another user")
    result = users_col.update_one({"_id": user_id}, {"$set": {"googleId": data.googleId}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "_id": str(user_id), 
        "message": "Google account linked successfully"
    }

# ---------- FAMILIES ----------
@app.post("/families")
def create_family(data: CreateFamilySchema):
    owner_id = ObjectId(data.user_id)
    if families_col.find_one({"owner_id": owner_id, "name": data.name}):
        raise HTTPException(status_code=400, detail="Family name already exists for this user")
    if not can_share_family(data.login_method):
        raise HTTPException(status_code=403, detail="Must use Google login to share family")
    family = {
        "_id": ObjectId(),
        "name": data.name,
        "type": data.type.value,
        "owner_id": owner_id,
        "members": [{"user_id": owner_id, "role": "owner"}], 
        "createdAt": datetime.utcnow()
    }
    families_col.insert_one(family)
    return {
        "_id": str(family["_id"]),
        "message": "family created"
    }

# ---------- ITEMS ----------
@app.post("/items")
def add_item(data: AddItemSchema):
    family_id = ObjectId(data.family_id)
    user_id = ObjectId(data.user_id)
    if not is_family_member(family_id, user_id):
        raise HTTPException(status_code=403, detail="Not family member")
    notify_date = calc_notify_date(data.expirationDate, data.beforeDays, data.notify)
    item = {
        "_id": ObjectId(),
        "family_id": family_id,
        "name": data.name,
        "barcode": data.barcode,
        "expirationDate": data.expirationDate,
        "notify": {
            "enabled": data.notify,
            "beforeDays": data.beforeDays,
            "notifyDate": notify_date
        },
        "createdBy": user_id,
        "deletedBy": None, 
        "storage": data.storage, 
        "photo": data.photo,
        "createdAt": datetime.utcnow()
    }
    if items_col.find_one({"family_id": family_id, "name": data.name}):
        raise HTTPException(status_code=400, detail="Item with this name already exists in family")
    items_col.insert_one(item)
    return {
        "_id": str(item["_id"]), 
        "message": "item added"
    }

# ---------- SCAN BARCODE ----------
@app.get("/scan/{barcode}")
def scan_item(barcode: str, family_id: str):
    family_oid = ObjectId(family_id)
    item = items_col.find_one({"family_id": family_oid, "barcode": barcode})
    if not item:
        return {"found": False}
    product = products_col.find_one({"barcode": barcode})
    return {
        "found": True,
        "item": {
            "name": item["name"],
            "storage": item.get("storage"),
            "photo": item.get("photo"),
            "product_name": product["name"] if product else None,
            "product_brand": product.get("brand") if product else None
        }
    }

# ---------- PRODUCTS ----------
@app.get("/products/{barcode}")
def get_product(barcode: str):
    product = products_col.find_one({"barcode": barcode})
    if not product:
        return {"found": False}
    product["_id"] = str(product["_id"])
    return {"found": True, "product": product}

@app.post("/products")
def create_product(barcode: str, name: str, brand: str = None):
    if products_col.find_one({"barcode": barcode}):
        raise HTTPException(status_code=400, detail="Product barcode already exists")
    product = {
        "_id": ObjectId(), 
        "barcode": barcode, 
        "name": name, 
        "brand": brand, 
        "createdAt": datetime.utcnow()
    }
    products_col.insert_one(product)
    return {"_id": str(product["_id"]), "message": "product created"}
