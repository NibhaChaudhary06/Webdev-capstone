from flask import Flask, jsonify, request
from flask_cors import CORS

from data import expenses_db
from data import budgets_db
from data import users_db

app = Flask(__name__)
CORS(app) 


@app.route('/expenses', methods=['GET'])
def get_all_expenses():
    return jsonify({
        "success": True,
        "count":   len(expenses_db.expenses),
        "total":   expenses_db.get_total(),
        "expenses": expenses_db.expenses
    })


@app.route('/expenses/<int:expense_id>', methods=['GET'])
def get_one_expense(expense_id):
    expense = expenses_db.find_by_id(expense_id)
    if expense is None:
        return jsonify({"success": False, "error": "Expense not found"}), 404
    return jsonify({"success": True, "expense": expense})


@app.route('/expenses', methods=['POST'])
def add_expense():
    global expenses_db 

    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "Please send JSON data"}), 400

    title = data.get('title', '').strip()
    if not title:
        return jsonify({"success": False, "error": "Title is required"}), 400
    if len(title) < 2:
        return jsonify({"success": False, "error": "Title must be at least 2 characters"}), 400
    raw_amount = data.get('amount')
    if raw_amount is None:
        return jsonify({"success": False, "error": "Amount is required"}), 400
    try:
        amount = float(raw_amount)
        if amount <= 0:
            return jsonify({"success": False, "error": "Amount must be greater than zero"}), 400
    except (ValueError, TypeError):
        return jsonify({"success": False, "error": "Amount must be a valid number"}), 400

    category = data.get('category', '').strip()
    if not category:
        return jsonify({"success": False, "error": "Category is required"}), 400
    if category not in expenses_db.VALID_CATEGORIES:
        return jsonify({
            "success": False,
            "error": f"Category must be one of: {', '.join(expenses_db.VALID_CATEGORIES)}"
        }), 400

    date = data.get('date', '').strip()
    if not date:
        return jsonify({"success": False, "error": "Date is required"}), 400
    new_expense = {
        "id":       expenses_db.next_id,
        "title":    title,
        "amount":   round(amount, 2),
        "category": category,
        "date":     date,
        "note":     data.get('note', '').strip()
    }

    expenses_db.expenses.append(new_expense)
    expenses_db.next_id += 1

    return jsonify({
        "success": True,
        "message": "Expense added successfully!",
        "expense": new_expense
    }), 201

@app.route('/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    expense = expenses_db.find_by_id(expense_id)
    if expense is None:
        return jsonify({"success": False, "error": "Expense not found"}), 404
    expenses_db.expenses.remove(expense)
    return jsonify({"success": True, "message": "Expense deleted successfully!"})


@app.route('/budgets', methods=['GET'])
def get_all_budgets():
    return jsonify({
        "success":      True,
        "total_budget": budgets_db.get_total_budget(),
        "budgets":      budgets_db.get_all_as_list()
    })


@app.route('/budgets', methods=['POST'])
def set_budget():
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "Please send JSON data"}), 400

    category = data.get('category', '').strip()
    if not category:
        return jsonify({"success": False, "error": "Category is required"}), 400
    if category not in budgets_db.VALID_CATEGORIES:
        return jsonify({
            "success": False,
            "error": f"Category must be one of: {', '.join(budgets_db.VALID_CATEGORIES)}"
        }), 400


    raw_limit = data.get('limit')
    if raw_limit is None:
        return jsonify({"success": False, "error": "Budget limit is required"}), 400
    try:
        limit = float(raw_limit)
        if limit < 0:
            return jsonify({"success": False, "error": "Budget limit cannot be negative"}), 400
    except (ValueError, TypeError):
        return jsonify({"success": False, "error": "Budget limit must be a valid number"}), 400


    budgets_db.budgets[category] = round(limit, 2)

    return jsonify({
        "success":  True,
        "message":  f"Budget for {category} updated to ₹{limit}!",
        "category": category,
        "limit":    round(limit, 2)
    })


@app.route('/users', methods=['GET'])
def get_all_users():
    return jsonify({
        "success": True,
        "count":   len(users_db.users),
        "users":   users_db.users
    })


@app.route('/users/<int:user_id>', methods=['GET'])
def get_one_user(user_id):
    user = users_db.find_user_by_id(user_id)
    if user is None:
        return jsonify({"success": False, "error": "User not found"}), 404
    return jsonify({"success": True, "user": user})



@app.route('/users', methods=['POST'])
def add_user():
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "Please send JSON data"}), 400


    name = data.get('name', '').strip()
    if not name:
        return jsonify({"success": False, "error": "Name is required"}), 400
    if len(name) < 2:
        return jsonify({"success": False, "error": "Name must be at least 2 characters"}), 400


    email = data.get('email', '').strip()
    if not email:
        return jsonify({"success": False, "error": "Email is required"}), 400
    if '@' not in email or '.' not in email:
        return jsonify({"success": False, "error": "Please enter a valid email address"}), 400


    if users_db.email_exists(email):
        return jsonify({"success": False, "error": "This email is already registered"}), 400


    joined = data.get('joined', '').strip()
    if not joined:
        return jsonify({"success": False, "error": "Joined date is required"}), 400


    new_user = {
        "id":     users_db.next_user_id,
        "name":   name,
        "email":  email,
        "joined": joined
    }

    users_db.users.append(new_user)
    users_db.next_user_id += 1

    return jsonify({
        "success": True,
        "message": f"User {name} registered successfully!",
        "user":    new_user
    }), 201

@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = users_db.find_user_by_id(user_id)
    if user is None:
        return jsonify({"success": False, "error": "User not found"}), 404
    users_db.users.remove(user)
    return jsonify({"success": True, "message": "User removed successfully!"})

if __name__ == '__main__':
    print("=" * 50)
    print("  Smart Expense Tracker — Flask Backend")
    print("=" * 50)
    print("  Expenses API → http://localhost:5000/expenses")
    print("  Budgets  API → http://localhost:5000/budgets")
    print("  Users    API → http://localhost:5000/users")
    print("=" * 50)
    app.run(debug=True, host="0.0.0.0", port=5000)
