
users = [
    {
        "id": 1,
        "name": "Arjun Sharma",
        "email": "arjun@example.com",
        "joined": "2025-04-01"
    },
    {
        "id": 2,
        "name": "Priya Singh",
        "email": "priya@example.com",
        "joined": "2025-04-15"
    }
]


next_user_id = 3

def find_user_by_id(user_id):
    for user in users:
        if user["id"] == user_id:
            return user
    return None

def email_exists(email):
    for user in users:
        if user["email"].lower() == email.lower():
            return True
    return False
