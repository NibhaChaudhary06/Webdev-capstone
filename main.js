

const API_BASE = "http://127.0.0.1:5000";
function formatRupees(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function getBadgeClass(cat) {
  const map = {
    Food: "badge-food", Travel: "badge-travel", Rent: "badge-rent",
    Shopping: "badge-shopping", Health: "badge-health",
    Education: "badge-education", Entertainment: "badge-entertainment",
    Other: "badge-other"
  };
  return map[cat] || "badge-other";
}

function getTopCategory(expenses) {
  const totals = {};
  expenses.forEach(function(e) {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });
  let top = "-", max = 0;
  for (let cat in totals) {
    if (totals[cat] > max) { max = totals[cat]; top = cat; }
  }
  return top;
}

function getLatestDate(expenses) {
  if (!expenses.length) return "-";
  return expenses.map(function(e) { return e.date; }).sort().reverse()[0];
}

function createRow(expense, num) {
  const row = document.createElement("tr");
  row.id = "row-" + expense.id;
  row.innerHTML = `
    <td>${num}</td>
    <td><strong>${expense.title}</strong></td>
    <td>${formatRupees(expense.amount)}</td>
    <td><span class="badge ${getBadgeClass(expense.category)}">${expense.category}</span></td>
    <td>${expense.date}</td>
    <td>${expense.note || "—"}</td>
    <td><button class="btn-delete" onclick="deleteExpense(${expense.id})">🗑 Delete</button></td>
  `;
  return row;
}

function updateCards(expenses) {
  const total = expenses.reduce(function(s, e) { return s + e.amount; }, 0);
  document.getElementById("totalAmount").textContent  = formatRupees(total);
  document.getElementById("totalCount").textContent   = expenses.length;
  document.getElementById("topCategory").textContent  = getTopCategory(expenses);
  document.getElementById("latestDate").textContent   = getLatestDate(expenses);
}

function loadExpenses() {
  const spinner   = document.getElementById("spinner");
  const wrapper   = document.getElementById("tableWrapper");
  const empty     = document.getElementById("emptyState");
  const tbody     = document.getElementById("expenseTableBody");

  spinner.style.display = "flex";
  wrapper.style.display = "none";
  empty.style.display   = "none";

  fetch(API_BASE + "/expenses")
    .then(function(res) { return res.json(); })
    .then(function(data) {
      spinner.style.display = "none";

      if (!data.success) { empty.style.display = "block"; return; }

      updateCards(data.expenses);

      if (data.expenses.length === 0) {
        empty.style.display = "block";
        return;
      }

      tbody.innerHTML = "";
      data.expenses.forEach(function(expense, index) {
        tbody.appendChild(createRow(expense, index + 1));
      });

      wrapper.style.display = "block";
    })
    .catch(function(err) {
      spinner.style.display = "none";
      empty.style.display = "block";
      empty.innerHTML = `
        <div class="icon">⚠️</div>
        <p><strong>Backend not reachable.</strong><br>
        Start Flask: <code>cd backend &amp;&amp; python app.py</code></p>
      `;
      console.error(err);
    });
}

function deleteExpense(id) {
  if (!confirm("Delete this expense? This cannot be undone.")) return;

  fetch(API_BASE + "/expenses/" + id, { method: "DELETE" })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        const row = document.getElementById("row-" + id);
        if (row) row.remove();
        loadExpenses();
      } else {
        alert("Error: " + data.error);
      }
    })
    .catch(function(err) {
      alert("Delete failed — check backend is running.");
      console.error(err);
    });
}
document.getElementById("hamburger").addEventListener("click", function() {
  document.getElementById("navLinks").classList.toggle("open");
});


loadExpenses();
