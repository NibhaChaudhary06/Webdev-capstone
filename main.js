

// The backend base URL
const API_BASE = "http://localhost:5000";

// ── Helper: format number as Indian Rupees ─────────────────────────
function formatRupees(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

// ── Helper: get badge class from category name ─────────────────────
function getBadgeClass(category) {
  const map = {
    "Food":          "badge-food",
    "Travel":        "badge-travel",
    "Rent":          "badge-rent",
    "Shopping":      "badge-shopping",
    "Health":        "badge-health",
    "Education":     "badge-education",
    "Entertainment": "badge-entertainment",
    "Other":         "badge-other"
  };
  return map[category] || "badge-other";
}

// ── Helper: find the category with highest total spending ──────────
function getTopCategory(expenses) {
  const totals = {};   // e.g. { "Food": 850, "Travel": 400 }

  expenses.forEach(function(expense) {
    if (totals[expense.category]) {
      totals[expense.category] += expense.amount;
    } else {
      totals[expense.category] = expense.amount;
    }
  });

  // Find the category with max total
  let topCategory = "-";
  let maxAmount = 0;

  for (let category in totals) {
    if (totals[category] > maxAmount) {
      maxAmount = totals[category];
      topCategory = category;
    }
  }

  return topCategory;
}

// ── Helper: get the most recent date from expenses ─────────────────
function getLatestDate(expenses) {
  if (expenses.length === 0) return "-";

  // Sort dates descending and pick the first one
  const sorted = expenses
    .map(function(e) { return e.date; })
    .sort()
    .reverse();

  return sorted[0];
}

// ── Create one <tr> row for an expense ────────────────────────────
function createRow(expense, rowNumber) {
  const row = document.createElement("tr");
  row.id = "row-" + expense.id;

  row.innerHTML = `
    <td>${rowNumber}</td>
    <td><strong>${expense.title}</strong></td>
    <td>${formatRupees(expense.amount)}</td>
    <td>
      <span class="badge ${getBadgeClass(expense.category)}">
        ${expense.category}
      </span>
    </td>
    <td>${expense.date}</td>
    <td>${expense.note || "—"}</td>
    <td>
      <button class="btn-delete" onclick="deleteExpense(${expense.id})">
        🗑 Delete
      </button>
    </td>
  `;

  return row;
}

// ── Update summary cards with data ────────────────────────────────
function updateSummaryCards(expenses) {
  // Total amount
  const total = expenses.reduce(function(sum, e) { return sum + e.amount; }, 0);
  document.getElementById("totalAmount").textContent = formatRupees(total);

  // Total count
  document.getElementById("totalCount").textContent = expenses.length;

  // Top category
  document.getElementById("topCategory").textContent = getTopCategory(expenses);

  // Latest date
  document.getElementById("latestDate").textContent = getLatestDate(expenses);
}

// ── Fetch all expenses from backend and display ────────────────────
function loadExpenses() {
  const spinner      = document.getElementById("spinner");
  const tableWrapper = document.getElementById("tableWrapper");
  const emptyState   = document.getElementById("emptyState");
  const tbody        = document.getElementById("expenseTableBody");

  // Show spinner while loading
  spinner.style.display = "flex";
  tableWrapper.style.display = "none";
  emptyState.style.display = "none";

  // Call the GET API
  fetch(API_BASE + "/expenses")
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      // Hide spinner
      spinner.style.display = "none";

      if (!data.success) {
        alert("Failed to load expenses.");
        return;
      }

      const expenses = data.expenses;

      // Update the summary cards
      updateSummaryCards(expenses);

      if (expenses.length === 0) {
        // Show empty state if no expenses
        emptyState.style.display = "block";
        return;
      }

      // Clear old rows
      tbody.innerHTML = "";

      // Create a row for each expense using DOM manipulation
      expenses.forEach(function(expense, index) {
        const row = createRow(expense, index + 1);
        tbody.appendChild(row);
      });

      // Show the table
      tableWrapper.style.display = "block";
    })
    .catch(function(error) {
      // This happens if the backend server is not running
      spinner.style.display = "none";
      emptyState.style.display = "block";
      emptyState.innerHTML = `
        <div class="icon">⚠️</div>
        <p><strong>Cannot connect to backend.</strong><br>
        Make sure your Flask server is running on <code>http://localhost:5000</code></p>
      `;
      console.error("Error fetching expenses:", error);
    });
}

// ── Delete an expense by id ────────────────────────────────────────
function deleteExpense(id) {
  // Ask the user to confirm before deleting
  const confirmed = confirm("Are you sure you want to delete this expense?");
  if (!confirmed) return;

  fetch(API_BASE + "/expenses/" + id, {
    method: "DELETE"
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if (data.success) {
        // Remove the row from the table without reloading the page
        const row = document.getElementById("row-" + id);
        if (row) row.remove();

        // Reload to refresh summary cards
        loadExpenses();
      } else {
        alert("Could not delete: " + data.error);
      }
    })
    .catch(function(error) {
      alert("Delete failed. Check that the backend is running.");
      console.error(error);
    });
}

// ── Hamburger menu toggle (mobile) ────────────────────────────────
document.getElementById("hamburger").addEventListener("click", function() {
  document.getElementById("navLinks").classList.toggle("open");
});

// ── Run when page loads ────────────────────────────────────────────
loadExpenses();
