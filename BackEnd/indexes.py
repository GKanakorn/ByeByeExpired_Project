from database import users_col, families_col, items_col, products_col

# ---------- USERS ----------
users_col.create_index("email", unique=True, sparse=True)
users_col.create_index("googleId", unique=True, sparse=True)

# ---------- FAMILIES ----------
families_col.create_index("owner_id")
families_col.create_index("members.user_id")
families_col.create_index([("owner_id", 1), ("name", 1)], unique=True)  # ป้องกัน duplicate family name ต่อ owner

# ---------- ITEMS ----------
items_col.create_index("family_id")
items_col.create_index("expirationDate")
items_col.create_index([("family_id", 1), ("name", 1)], unique=True)  # ป้องกัน duplicate item name ต่อ family

# ---------- PRODUCTS ----------
products_col.create_index("barcode", unique=True)

print("Indexes created")
