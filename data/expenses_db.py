expenses = [
    {
        "id": 1,
        "title": "Grocery Shopping",
        "amount": 850.0,
        "category": "Food",
        "date": "2025-05-01",
        "note": "Weekly groceries from market"
    },
    {
        "id": 2,
        "title": "Monthly Bus Pass",
        "amount": 400.0,
        "category": "Travel",
        "date": "2025-05-01",
        "note": "DTC monthly pass"
    },
    {
        "id": 3,
        "title": "Room Rent",
        "amount": 6000.0,
        "category": "Rent",
        "date": "2025-05-01",
        "note": "PG rent for May"
    },
    {
        "id": 4,
        "title": "Movie Tickets",
        "amount": 350.0,
        "category": "Entertainment",
        "date": "2025-05-03",
        "note": "Weekend movie with friends"
    },
    {
        "id": 5,
        "title": "Python Book",
        "amount": 499.0,
        "category": "Education",
        "date": "2025-05-04",
        "note": "Python for beginners"
    },
    {
        "id": 6,
        "title": "Doctor Visit",
        "amount": 500.0,
        "category": "Health",
        "date": "2025-05-05",
        "note": "Regular checkup"
    },
    {
        "id": 7,
        "title": "Dinner with Family",
        "amount": 1200.0,
        "category": "Food",
        "date": "2025-05-07",
        "note": "Restaurant outing"
    },
    {
        "id": 8,
        "title": "Gym Membership",
        "amount": 800.0,
        "category": "Health",
        "date": "2025-05-01",
        "note": "Monthly gym fee"
    }
]


next_id = 9


VALID_CATEGORIES = [
    "Food", "Travel", "Rent", "Shopping",
    "Health", "Education", "Entertainment", "Other"
]


def find_by_id(expense_id):
    for expense in expenses:
        if expense["id"] == expense_id:
            return expense
    return None  


def get_total():
    return round(sum(e["amount"] for e in expenses), 2)
