

const API_BASE = "http://localhost:5000";

window.addEventListener("load", function() {
  const today = new Date().toISOString().split("T")[0];  
  document.getElementById("date").value = today;
});

// ── Show alert message ────────────────────────────────────────
function showAlert(message, type) {
  const alertBox = document.getElementById("alertMsg");
  alertBox.textContent = message;
  alertBox.className = "alert " + type;  
  alertBox.style.display = "block";

  // Scroll down to see the message
  alertBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ── Clear all form fields ────────────────────────────────────
function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("category").value = "";
  document.getElementById("note").value = "";

  // Keep today's date
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("date").value = today;
}

// ── Frontend Validation (before calling the API) ───────────────
function validateForm(title, amount, category, date) {
  if (!title || title.trim() === "") {
    return "Please enter an expense title.";
  }
  if (title.trim().length < 2) {
    return "Title must be at least 2 characters long.";
  }
  if (!amount || amount === "") {
    return "Please enter the amount.";
  }
  if (isNaN(amount) || Number(amount) <= 0) {
    return "Amount must be a positive number.";
  }
  if (!category) {
    return "Please select a category.";
  }
  if (!date) {
    return "Please select a date.";
  }
  return null;  
}

// ── Submit the form via POST API ───────────────────────────────────
function submitExpense() {
  
  
  const title    = document.getElementById("title").value.trim();
  const amount   = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const date     = document.getElementById("date").value;
  const note     = document.getElementById("note").value.trim();

  // Step 1: Validate on the frontend first
  const errorMsg = validateForm(title, amount, category, date);
  if (errorMsg) {
    showAlert("❌ " + errorMsg, "error");
    return;  
  }

  // Step 2: Build the data object to send to the backend
  const expenseData = {
    title:    title,
    amount:   parseFloat(amount),
    category: category,
    date:     date,
    note:     note
  };

  // Step 3: Disable button while we wait for the response
  const btn = document.getElementById("submitBtn");
  btn.textContent = "Sending…";
  btn.disabled = true;

  // Step 4: Call the POST API
  fetch(API_BASE + "/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"   
    },
    body: JSON.stringify(expenseData)      
  })
    .then(function(response) {
      return response.json();              
    })
    .then(function(data) {
      // Re-enable the button
      btn.textContent = "➕ Add Expense";
      btn.disabled = false;

      if (data.success) {
        // SUCCESS – show green message and clear the form
        showAlert("✅ " + data.message + " (ID: " + data.expense.id + ")", "success");
        clearForm();
      } else {
        // Server returned an error (e.g. validation failed on backend)
        showAlert("❌ " + data.error, "error");
      }
    })
    .catch(function(error) {
      // Network error – backend probably not running
      btn.textContent = "➕ Add Expense";
      btn.disabled = false;
      showAlert("⚠️ Cannot connect to backend. Make sure Flask is running on http://localhost:5000", "error");
      console.error("Error:", error);
    });
}

// ── Hamburger menu toggle ───────────────────────────────────
document.getElementById("hamburger").addEventListener("click", function() {
  document.getElementById("navLinks").classList.toggle("open");
});
