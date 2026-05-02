

const API_BASE = "http://localhost:5000";

// Budget limit – we compare total spending against this
const MONTHLY_BUDGET = 10000;

// All categories we track
const ALL_CATEGORIES = [
  "Food", "Travel", "Rent", "Shopping",
  "Health", "Education", "Entertainment", "Other"
];

// ── Format number as Indian Rupees ─────────────────────────────────
function formatRupees(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

// ── Sum amounts by category ────────────────────────────────────────
function getCategoryTotals(expenses) {
  const totals = {};
  expenses.forEach(function(expense) {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
  });
  return totals;
}


function getMonthlyTotals(expenses) {
  const monthly = {}; 
  expenses.forEach(function(expense) {
    const month = expense.date.slice(0, 7);  
    if (!monthly[month]) {
      monthly[month] = { count: 0, total: 0 };
    }
    monthly[month].count += 1;
    monthly[month].total += expense.amount;
  });

  return monthly;
}

// ── Create one insight card using DOM manipulation ──────────────────
function createInsightCard(icon, title, message, type) {
  // type can be: "" (green), "warning" (orange), "danger" (red)
  const card = document.createElement("div");
  card.className = "insight-card " + type;

  card.innerHTML = `
    <div class="insight-icon">${icon}</div>
    <div>
      <h4>${title}</h4>
      <p>${message}</p>
    </div>
  `;

  return card;
}

// ── Apply all rules and generate insights ──────────────────────────
function generateInsights(expenses) {
  const insightsGrid = document.getElementById("insightsGrid");
  insightsGrid.innerHTML = "";   // Clear previous cards

  const totalSpent     = expenses.reduce(function(sum, e) { return sum + e.amount; }, 0);
  const categoryTotals = getCategoryTotals(expenses);
  const monthlyTotals  = getMonthlyTotals(expenses);

  // ── Rule 1: Check if budget is exceeded ────────────────────────
  if (totalSpent > MONTHLY_BUDGET) {
    insightsGrid.appendChild(createInsightCard(
      "🚨",
      "Budget Exceeded!",
      `You have spent ${formatRupees(totalSpent)}, which is over your budget of ${formatRupees(MONTHLY_BUDGET)}. Try to cut back!`,
      "danger"
    ));
  } else {
    const remaining = MONTHLY_BUDGET - totalSpent;
    insightsGrid.appendChild(createInsightCard(
      "✅",
      "Budget On Track",
      `You have spent ${formatRupees(totalSpent)} so far. You still have ${formatRupees(remaining)} left in your budget.`,
      ""
    ));
  }

  // ── Rule 2: Highlight the highest spending category ─────────────
  let topCategory = "-";
  let topAmount   = 0;
  for (let cat in categoryTotals) {
    if (categoryTotals[cat] > topAmount) {
      topAmount   = categoryTotals[cat];
      topCategory = cat;
    }
  }
  if (topCategory !== "-") {
    insightsGrid.appendChild(createInsightCard(
      "🏆",
      "Highest Spending Category",
      `You spent the most on "${topCategory}" — a total of ${formatRupees(topAmount)}. Consider whether this is necessary.`,
      "warning"
    ));
  }

  // ── Rule 3: Check if rent is taking more than 50% of budget ─────
  if (categoryTotals["Rent"] && categoryTotals["Rent"] > (MONTHLY_BUDGET * 0.5)) {
    insightsGrid.appendChild(createInsightCard(
      "🏠",
      "High Rent Spending",
      `Your rent (${formatRupees(categoryTotals["Rent"])}) is more than 50% of your monthly budget. You may want to reconsider.`,
      "warning"
    ));
  }

  // ── Rule 4: Suggest categories with no expenses ──────────────────
  const unusedCategories = ALL_CATEGORIES.filter(function(cat) {
    return !categoryTotals[cat];
  });
  if (unusedCategories.length > 0) {
    insightsGrid.appendChild(createInsightCard(
      "📭",
      "Categories Not Used",
      `You have no expenses in: ${unusedCategories.join(", ")}. Make sure you're recording all expenses!`,
      ""
    ));
  }

  // ── Rule 5: Count of expenses ────────────────────────────────────
  if (expenses.length > 10) {
    insightsGrid.appendChild(createInsightCard(
      "📋",
      "Many Expenses Recorded",
      `You have ${expenses.length} expenses recorded. Great job tracking your spending!`,
      ""
    ));
  } else {
    insightsGrid.appendChild(createInsightCard(
      "📝",
      "Keep Tracking!",
      `You only have ${expenses.length} expense(s) so far. Try adding more entries for better insights.`,
      ""
    ));
  }

  // ── Rule 6: Average expense per entry ────────────────────────────
  if (expenses.length > 0) {
    const average = totalSpent / expenses.length;
    insightsGrid.appendChild(createInsightCard(
      "📐",
      "Average Expense",
      `Your average expense is ${formatRupees(Math.round(average))} per entry.`,
      ""
    ));
  }

  insightsGrid.style.display = "grid";
}

// ── Build monthly summary table ────────────────────────────────────
function buildMonthlyTable(expenses) {
  const monthly = getMonthlyTotals(expenses);
  const tbody   = document.getElementById("monthlyTable");
  tbody.innerHTML = "";

  // Sort months so latest comes first
  const sortedMonths = Object.keys(monthly).sort().reverse();

  sortedMonths.forEach(function(month) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${month}</td>
      <td>${monthly[month].count}</td>
      <td>${formatRupees(monthly[month].total)}</td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("summarySection").style.display = "block";
}

// ── Fetch data and run everything ─────────────────────────────────
function loadInsights() {
  const spinner    = document.getElementById("spinner");
  const errorState = document.getElementById("errorState");

  spinner.style.display = "flex";

  fetch(API_BASE + "/expenses")
    .then(function(response) { return response.json(); })
    .then(function(data) {
      spinner.style.display = "none";

      if (!data.success) {
        errorState.style.display = "block";
        return;
      }

      const expenses = data.expenses;

      if (expenses.length === 0) {
        errorState.innerHTML = `
          <div class="icon">📭</div>
          <p>No expenses to analyse. <a href="add-expense.html">Add some first!</a></p>
        `;
        errorState.style.display = "block";
        return;
      }

      generateInsights(expenses);
      buildMonthlyTable(expenses);
    })
    .catch(function(error) {
      spinner.style.display = "none";
      errorState.style.display = "block";
      console.error("Error loading insights:", error);
    });
}

// ── Hamburger menu ─────────────────────────────────────────────────
document.getElementById("hamburger").addEventListener("click", function() {
  document.getElementById("navLinks").classList.toggle("open");
});

// ── Run on page load ───────────────────────────────────────────────
loadInsights();
