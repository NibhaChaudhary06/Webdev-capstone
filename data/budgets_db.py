
budgets = {
    "Food":          3000.0,
    "Travel":        1000.0,
    "Rent":          7000.0,
    "Shopping":      2000.0,
    "Health":        1500.0,
    "Education":     1000.0,
    "Entertainment": 1000.0,
    "Other":         500.0
}

VALID_CATEGORIES = [
    "Food", "Travel", "Rent", "Shopping",
    "Health", "Education", "Entertainment", "Other"
]

def get_budget_for(category):
    return budgets.get(category, 0.0)

def get_all_as_list():
    result = []
    for category, limit in budgets.items():
        result.append({
            "category": category,
            "limit": limit
        })
    return result

def get_total_budget():
    return round(sum(budgets.values()), 2)
