

onst API_BASE = "http://127.0.0.1:5000";

const ALL_CATEGORIES = [
  "Food", "Travel", "Rent", "Shopping",
  "Health", "Education", "Entertainment", "Other"
];

function formatRupees(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}
function getCategoryTotals(expenses) {
  const totals = {};
  expenses.forEach(function(e) {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });
  return totals;
}

function getMonthlyTotals(expenses) {
  const monthly = {};
  expenses.forEach(function(e) {
    const month = e.date.slice(0, 7);
    if (!monthly[month]) monthly[month] = { count: 0, total: 0 };
    monthly[month].count += 1;
    monthly[month].total += e.amount;
  });
  return monthly;
}

function createInsightCard(icon, title, message, type) {
  const card = document.createElement("div");
  card.className = "insight-card " + (type || "");
  card.innerHTML = `
    <div class="insight-icon">${icon}</div>
    <div><h4>${title}</h4><p>${message}</p></div>
  `;
  return card;
}

function generateInsights(expenses, budgets) {
  const grid   = document.getElementById("insightsGrid");
  grid.innerHTML = "";

  const totalSpent     = expenses.reduce(function(s, e) { return s + e.amount; }, 0);
  const categoryTotals = getCategoryTotals(expenses);
  const budgetMap = {};
  budgets.forEach(function(b) { budgetMap[b.category] = b.limit; });

  const totalBudget = budgets.reduce(function(s, b) { return s + b.limit; }, 0);
  if (totalSpent > totalBudget) {
    grid.appendChild(createInsightCard(
      "🚨", "Total Budget Exceeded!",
      `You've spent ${formatRupees(totalSpent)}, which is over your total budget of ${formatRupees(totalBudget)}.`,
      "danger"
    ));
  } else {
    grid.appendChild(createInsightCard(
      "✅", "Budget On Track",
      `You've spent ${formatRupees(totalSpent)} out of your ${formatRupees(totalBudget)} total budget. ${formatRupees(totalBudget - totalSpent)} remaining!`,
      ""
    ));
  }

  let overBudgetCount = 0;
  for (let cat in categoryTotals) {
    if (budgetMap[cat] && categoryTotals[cat] > budgetMap[cat]) {
      overBudgetCount++;
      const over = categoryTotals[cat] - budgetMap[cat];
      grid.appendChild(createInsightCard(
        "❗", cat + " Over Budget!",
        `You set ₹${budgetMap[cat].toLocaleString("en-IN")} for ${cat} but spent ${formatRupees(categoryTotals[cat])} — that's ${formatRupees(over)} over your limit.`,
        "danger"
      ));
    }
  }
  if (overBudgetCount === 0) {
    grid.appendChild(createInsightCard(
      "🎉", "All Categories Within Limit",
      "Great job! None of your spending categories have exceeded their budget limits.",
      ""
    ));
  }
  let topCat = "-", topAmt = 0;
  for (let cat in categoryTotals) {
    if (categoryTotals[cat] > topAmt) { topAmt = categoryTotals[cat]; topCat = cat; }
  }
  if (topCat !== "-") {
    grid.appendChild(createInsightCard(
      "🏆", "Highest Spending: " + topCat,
      `You spent the most on ${topCat} — ${formatRupees(topAmt)} in total.`,
      "warning"
    ));
  }
  const unused = ALL_CATEGORIES.filter(function(c) { return !categoryTotals[c]; });
  if (unused.length > 0) {
    grid.appendChild(createInsightCard(
      "📭", "Unused Categories",
      `No expenses in: ${unused.join(", ")}. Are you recording everything?`,
      ""
    ));
  }

  if (categoryTotals["Rent"] && categoryTotals["Rent"] > totalBudget * 0.4) {
    grid.appendChild(createInsightCard(
      "🏠", "High Rent Ratio",
      `Rent takes ${Math.round((categoryTotals["Rent"] / totalBudget) * 100)}% of your total budget. This is quite high.`,
      "warning"
    ));
  }

  const avg = expenses.length > 0 ? Math.round(totalSpent / expenses.length) : 0;
  grid.appendChild(createInsightCard(
    "📐", "Average Expense",
    `Your average expense is ${formatRupees(avg)} per entry across ${expenses.length} total records.`,
    ""
  ));

  grid.style.display = "grid";
}

function buildMonthlyTable(expenses) {
  const monthly = getMonthlyTotals(expenses);
  const tbody   = document.getElementById("monthlyTable");
  tbody.innerHTML = "";

  Object.keys(monthly).sort().reverse().forEach(function(month) {
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

function loadInsights() {
  const spinner    = document.getElementById("spinner");
  const errorState = document.getElementById("errorState");

  spinner.style.display = "flex";

  Promise.all([
    fetch(API_BASE + "/expenses").then(function(r) { return r.json(); }),
    fetch(API_BASE + "/budgets").then(function(r)  { return r.json(); })
  ])
    .then(function(results) {
      spinner.style.display = "none";

      const expenseData = results[0];
      const budgetData  = results[1];

      if (!expenseData.success) { errorState.style.display = "block"; return; }

      if (expenseData.expenses.length === 0) {
        errorState.innerHTML = `<div class="icon">📭</div><p>No expenses yet. <a href="add-expense.html">Add some!</a></p>`;
        errorState.style.display = "block";
        return;
      }

      const budgets = budgetData.success ? budgetData.budgets : [];

      generateInsights(expenseData.expenses, budgets);
      buildMonthlyTable(expenseData.expenses);
    })
    .catch(function(err) {
      spinner.style.display = "none";
      errorState.style.display = "block";
      console.error(err);
    });
}

document.getElementById("hamburger").addEventListener("click", function() {
  document.getElementById("navLinks").classList.toggle("open");
});

loadInsights();
