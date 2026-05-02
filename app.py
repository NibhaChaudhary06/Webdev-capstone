from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  


    {
        "id": 1,
        "title": "Grocery Shopping",
        "amount": 850,
        "category": "Food",
        "date": "2025-05-01",
        "note": "Weekly groceries from market"
    },
    {
        "id": 2,
        "title": "Monthly Bus Pass",
        "amount": 400,
        "category": "Travel",
        "date": "2025-05-01",
        "note": "DTC monthly pass"
    },
    {
        "id": 3,
        "title": "Room Rent",
        "amount": 6000,
        "category": "Rent",
        "date": "2025-05-01",
        "note": "PG rent for May"
    },
    {
        "id": 4,
        "title": "Movie Tickets",
        "amount": 350,
        "category": "Entertainment",
        "date": "2025-05-03",
        "note": "Weekend movie with friends"
    },
    {
        "id": 5,
        "title": "Python Book",
        "amount": 499,
        "category": "Education",
        "date": "2025-05-04",
        "note": "Python for beginners"
    },
    {
        "id": 6,
        "title": "Doctor Visit",
        "amount": 500,
        "category": "Health",
        "date": "2025-05-05",
        "note": "Regular checkup"
    }
]

next_id = 7  

VALID_CATEGORIES = [
    "Food", "Travel", "Rent", "Shopping",
    "Health", "Education", "Entertainment", "Other"
]



def find_expense(expense_id):
    for expense in expenses:
        if expense["id"] == expense_id:
            return expense
    return None



@app.route('/expenses', methods=['GET'])
def get_expenses():
    return jsonify({
        "success": True,
        "count": len(expenses),
        "expenses": expenses
    })



@app.route('/expenses/<int:expense_id>', methods=['GET'])
def get_expense(expense_id):
    expense = find_expense(expense_id)
    if expense is None:
        return jsonify({"success": False, "error": "Expense not found"}), 404
    return jsonify({"success": True, "expense": expense})



@app.route('/expenses', methods=['POST'])
def add_expense():
    global next_id

    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "Please send JSON data"}), 400

    
    title = data.get('title', '').strip()
    if not title:
        return jsonify({"success": False, "error": "Title is required"}), 400
    if len(title) < 2:
        return jsonify({"success": False, "error": "Title must be at least 2 characters"}), 400

    # Amount
    raw_amount = data.get('amount')
    if raw_amount is None or raw_amount == '':
        return jsonify({"success": False, "error": "Amount is required"}), 400
    try:
        amount = float(raw_amount)
        if amount <= 0:
            return jsonify({"success": False, "error": "Amount must be greater than zero"}), 400
    except (ValueError, TypeError):
        return jsonify({"success": False, "error": "Amount must be a valid number"}), 400

    # Category
    category = data.get('category', '').strip()
    if not category:
        return jsonify({"success": False, "error": "Category is required"}), 400
    if category not in VALID_CATEGORIES:
        return jsonify({
            "success": False,
            "error": f"Category must be one of: {', '.join(VALID_CATEGORIES)}"
        }), 400

    #Date
    date = data.get('date', '').strip()
    if not date:
        return jsonify({"success": False, "error": "Date is required"}), 400

    # ── All good – create the expense ──────────────────────────────────────
    new_expense = {
        "id": next_id,
        "title": title,
        "amount": round(amount, 2),
        "category": category,
        "date": date,
        "note": data.get('note', '').strip()
    }

    expenses.append(new_expense)
    next_id += 1

    return jsonify({
        "success": True,
        "message": "Expense added successfully!",
        "expense": new_expense
    }), 201


# ── DELETE /expenses/<id>  – remove an expense (optional / bonus) ──────────
@app.route('/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    expense = find_expense(expense_id)
    if expense is None:
        return jsonify({"success": False, "error": "Expense not found"}), 404
    expenses.remove(expense)
    return jsonify({"success": True, "message": "Expense deleted successfully"})


# ── Run the server ──────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("Smart Expense Tracker Backend is running!")
    print("Visit http://localhost:5000/expenses to test the GET API")
    app.run(debug=True, port=5000)
