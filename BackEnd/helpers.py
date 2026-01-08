from bson import ObjectId
from database import families_col, items_col

def is_family_member(family_id: ObjectId, user_id: ObjectId) -> bool:
    family = families_col.find_one({"_id": family_id, "members.user_id": user_id})
    return bool(family)

def can_share_family(login_method: str) -> bool:
    return login_method == "google"

def calc_notify_date(expiration_date: str, before_days: int, notify: bool):
    from datetime import datetime, timedelta
    if not notify:
        return None
    exp_date = datetime.strptime(expiration_date, "%Y-%m-%d")
    return exp_date - timedelta(days=before_days)
