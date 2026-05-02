

const API_BASE = "http://localhost:5000";


const COLORS = [
  "#2D6A4F", "#52B788", "#95D5B2", "#F4A261",
  "#E63946", "#457B9D", "#A8DADC", "#F1FAEE"
];

// ── Group expenses by category and sum amounts ─────────────────────
function groupByCategory(expenses) {
  const totals = {};

  expenses.forEach(function(expense) {
    if (totals[expense.category]) {
      totals[expense.category] += expense.amount;
    } else {
      totals[expense.category] = expense.amount;
    }
  });

  // Convert object into two arrays: labels and values
  const labels = Object.keys(totals);
  const values = Object.values(totals);

  return { labels, values };
}

// ── Draw the Pie Chart ─────────────────────────────────────────────
function drawPieChart(labels, values) {
  const ctx = document.getElementById("pieChart").getContext("2d");

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: COLORS,
        borderWidth: 2,
        borderColor: "#ffffff"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 12,
            font: { size: 12, family: "Poppins" }
          }
        },
        tooltip: {
          callbacks: {
            
            label: function(context) {
              return " ₹" + context.parsed.toLocaleString("en-IN");
            }
          }
        }
      }
    }
  });
}

// ── Draw the Bar Chart ────────────────────────────────────────
function drawBarChart(labels, values) {
  const ctx = document.getElementById("barChart").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Amount Spent (₹)",
        data: values,
        backgroundColor: COLORS,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return " ₹" + context.parsed.y.toLocaleString("en-IN");
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return "₹" + value.toLocaleString("en-IN");
            },
            font: { family: "Poppins" }
          },
          grid: { color: "#e8f5e9" }
        },
        x: {
          ticks: { font: { family: "Poppins" } },
          grid: { display: false }
        }
      }
    }
  });
}

// ── Fetch data and build the charts ───────────────────────────
function loadCharts() {
  const spinner    = document.getElementById("spinner");
  const chartsGrid = document.getElementById("chartsGrid");
  const errorState = document.getElementById("errorState");

  spinner.style.display = "flex";

  fetch(API_BASE + "/expenses")
    .then(function(response) { return response.json(); })
    .then(function(data) {
      spinner.style.display = "none";

      if (!data.success || data.expenses.length === 0) {
        errorState.innerHTML = `
          <div class="icon">📭</div>
          <p>No expenses found. <a href="add-expense.html">Add some first!</a></p>
        `;
        errorState.style.display = "block";
        return;
      }

      const { labels, values } = groupByCategory(data.expenses);

      chartsGrid.style.display = "grid";
      drawPieChart(labels, values);
      drawBarChart(labels, values);
    })
    .catch(function(error) {
      spinner.style.display = "none";
      errorState.style.display = "block";
      console.error("Error loading chart data:", error);
    });
}

// ── Hamburger menu ─────────────────────────────────────────────────
document.getElementById("hamburger").addEventListener("click", function() {
  document.getElementById("navLinks").classList.toggle("open");
});

// ── Run on page load ───────────────────────────────────────────────
loadCharts();
