


const API_BASE = "http://127.0.0.1:5000";

window.addEventListener("load", function() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("date").value = today;
});

function showAlert(message, type) {
  const box = document.getElementById("alertMsg");
  box.textContent   = message;
  box.className     = "alert " + type;
  box.style.display = "block";
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function clearForm() {
  document.getElementById("title").value    = "";
  document.getElementById("amount").value   = "";
  document.getElementById("category").value = "";
  document.getElementById("note").value     = "";
  document.getElementById("date").value = new Date().toISOString().split("T")[0];
}

function validate(title, amount, category, date) {
  if (!title)              return "Please enter an expense title.";
  if (title.length < 2)   return "Title must be at least 2 characters.";
  if (!amount)             return "Please enter an amount.";
  if (isNaN(amount) || Number(amount) <= 0) return "Amount must be a positive number.";
  if (!category)           return "Please select a category.";
  if (!date)               return "Please select a date.";
  return null; 
}

function submitExpense() {
  const title    = document.getElementById("title").value.trim();
  const amount   = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const date     = document.getElementById("date").value;
  const note     = document.getElementById("note").value.trim();

  const error = validate(title, amount, category, date);
  if (error) {
    showAlert("❌ " + error, "error");
    return;
  }

  const body = {
    title:    title,
    amount:   parseFloat(amount),
    category: category,
    date:     date,
    note:     note
  };

  const btn = document.getElementById("submitBtn");
  btn.textContent = "Sending…";
  btn.disabled    = true;

  fetch(API_BASE + "/expenses", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body)
  })
    .then(function(res)  { return res.json(); })
    .then(function(data) {
      btn.textContent = "➕ Add Expense";
      btn.disabled    = false;

      if (data.success) {
        showAlert("✅ " + data.message + "  (Expense ID: " + data.expense.id + ")", "success");
        clearForm();
      } else {
        showAlert("❌ " + data.error, "error");
      }
    })
    .catch(function(err) {
      btn.textContent = "➕ Add Expense";
      btn.disabled    = false;
      showAlert("⚠️ Cannot reach backend. Make sure Flask is running on http://localhost:5000", "error");
      console.error(err);
    });
}

document.getElementById("hamburger").addEventListener("click", function() {
  document.getElementById("navLinks").classList.toggle("open");
});
