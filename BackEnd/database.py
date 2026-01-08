from pymongo import MongoClient, ASCENDING
import certifi

MONGO_URL = "mongodb+srv://guy91084_db_user:wGXzqb9sTyIlXuwZ@cluster0.bbc76lx.mongodb.net/?appName=Cluster0"

client = MongoClient(MONGO_URL,tlsCAFile=certifi.where())
db = client["byebyeexpired"]

# ===== Collections =====
users_col = db["users"]
families_col = db["families"]
items_col = db["items"]
products_col = db["product_master"]
