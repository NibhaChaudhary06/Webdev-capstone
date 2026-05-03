
const API_BASE = "http://127.0.0.1:5000";

const CAT_EMOJI = {
  Food: "🍔", Travel: "🚌", Rent: "🏠", Shopping: "🛍️",
  Health: "💊", Education: "📚", Entertainment: "🎬", Other: "📦"
};

function formatRupees(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function showBudgetAlert(msg, type) {
  const box = document.getElementById("budgetAlert");
  box.textContent   = msg;
  box.className     = "alert " + type;
  box.style.display = "block";
}

function showUserAlert(msg, type) {
  const box = document.getElementById("userAlert");
  box.textContent   = msg;
  box.className     = "alert " + type;
  box.style.display = "block";
}

function createBudgetItem(category, limit, spent) {
  const div = document.createElement("div");
  div.className = "budget-item";

  const pct     = limit > 0 ? Math.round((spent / limit) * 100) : 0;
  const barPct  = Math.min(pct, 100);

  let barClass  = "";    
  let pctClass  = "ok";
  let pctLabel  = pct + "% used";
  if (pct >= 100) { barClass = "over"; pctClass = "over"; pctLabel = "⚠️ Over budget!"; }
  else if (pct >= 75) { barClass = "near"; pctClass = "near"; pctLabel = pct + "% used — almost!"; }

  const remaining = limit - spent;

  div.innerHTML = `
    <div class="budget-item-header">
      <span class="cat-name">${CAT_EMOJI[category] || "📦"} ${category}</span>
      <span class="amounts">
        <strong>${formatRupees(spent)}</strong> / ${formatRupees(limit)}
      </span>
    </div>
    <div class="progress-bar-bg">
      <div class="progress-bar-fill ${barClass}" style="width:${barPct}%;"></div>
    </div>
    <div class="budget-status">
      <small>${remaining >= 0 ? formatRupees(remaining) + " left" : formatRupees(Math.abs(remaining)) + " over"}</small>
      <span class="pct ${pctClass}">${pctLabel}</span>
    </div>
  `;

  return div;
}

function loadBudgets() {
  const spinner  = document.getElementById("spinner1");
  const itemsDiv = document.getElementById("budgetItems");

  spinner.style.display = "flex";
  itemsDiv.style.display = "none";

  Promise.all([
    fetch(API_BASE + "/budgets").then(function(r) { return r.json(); }),
    fetch(API_BASE + "/expenses").then(function(r) { return r.json(); })
  ])
    .then(function(results) {
      spinner.style.display = "none";

      const budgetData  = results[0];   
      const expenseData = results[1];   

      if (!budgetData.success) return;

      const spent = {};
      if (expenseData.success) {
        expenseData.expenses.forEach(function(e) {
          spent[e.category] = (spent[e.category] || 0) + e.amount;
        });
      }

      const totalBudget = budgetData.total_budget;
      const totalSpent  = expenseData.success
        ? expenseData.expenses.reduce(function(s, e) { return s + e.amount; }, 0)
        : 0;
      const remaining   = totalBudget - totalSpent;
      const overCount   = budgetData.budgets.filter(function(b) {
        return (spent[b.category] || 0) > b.limit;
      }).length;

      document.getElementById("totalBudget").textContent     = formatRupees(totalBudget);
      document.getElementById("budgetTotalSpent").textContent = formatRupees(totalSpent);
      document.getElementById("budgetRemaining").textContent  = formatRupees(remaining);
      document.getElementById("overCount").textContent        = overCount + " categor" + (overCount === 1 ? "y" : "ies");

      itemsDiv.innerHTML = "";
      budgetData.budgets.forEach(function(b) {
        const catSpent = spent[b.category] || 0;
        itemsDiv.appendChild(createBudgetItem(b.category, b.limit, catSpent));
      });

      itemsDiv.style.display = "flex";
    })
    .catch(function(err) {
      spinner.style.display = "none";
      console.error("Budget load error:", err);
    });
}
function saveBudget() {
  const category = document.getElementById("budgetCategory").value;
  const limit    = document.getElementById("budgetLimit").value;

  if (!category) { showBudgetAlert("❌ Please select a category.", "error"); return; }
  if (!limit || Number(limit) < 0) { showBudgetAlert("❌ Please enter a valid limit.", "error"); return; }

  fetch(API_BASE + "/budgets", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ category: category, limit: parseFloat(limit) })
  })
    .then(function(r)    { return r.json(); })
    .then(function(data) {
      if (data.success) {
        showBudgetAlert("✅ " + data.message, "success");
        document.getElementById("budgetCategory").value = "";
        document.getElementById("budgetLimit").value    = "";
        loadBudgets();  
      } else {
        showBudgetAlert("❌ " + data.error, "error");
      }
    })
    .catch(function(err) {
      showBudgetAlert("⚠️ Backend not reachable.", "error");
      console.error(err);
    });
}

function createUserCard(user) {
  const card = document.createElement("div");
  card.className = "user-card";
  card.id = "user-" + user.id;

  const initials = user.name.charAt(0).toUpperCase();

  card.innerHTML = `
    <div class="user-avatar">${initials}</div>
    <div class="user-info" style="flex:1;">
      <h4>${user.name}</h4>
      <p>${user.email}</p>
      <small>Joined: ${user.joined}</small>
    </div>
    <button class="btn-delete" onclick="removeUser(${user.id})" title="Remove user">✕</button>
  `;

  return card;
}

function loadUsers() {
  const spinner  = document.getElementById("spinner2");
  const grid     = document.getElementById("usersGrid");

  spinner.style.display = "flex";
  grid.style.display    = "none";

  fetch(API_BASE + "/users")
    .then(function(r)    { return r.json(); })
    .then(function(data) {
      spinner.style.display = "none";

      if (!data.success) return;

      grid.innerHTML = "";

      if (data.users.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="icon">👤</div><p>No users yet. Add one below!</p></div>`;
      } else {
        data.users.forEach(function(user) {
          grid.appendChild(createUserCard(user));
        });
      }

      grid.style.display = "grid";
    })
    .catch(function(err) {
      spinner.style.display = "none";
      console.error("Users load error:", err);
    });
}
function addUser() {
  const name   = document.getElementById("userName").value.trim();
  const email  = document.getElementById("userEmail").value.trim();
  const joined = document.getElementById("userJoined").value;

  if (!name)   { showUserAlert("❌ Please enter a name.", "error"); return; }
  if (!email)  { showUserAlert("❌ Please enter an email.", "error"); return; }
  if (!joined) { showUserAlert("❌ Please select a joined date.", "error"); return; }

  fetch(API_BASE + "/users", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ name: name, email: email, joined: joined })
  })
    .then(function(r)    { return r.json(); })
    .then(function(data) {
      if (data.success) {
        showUserAlert("✅ " + data.message, "success");
        document.getElementById("userName").value   = "";
        document.getElementById("userEmail").value  = "";
        document.getElementById("userJoined").value = "";
        loadUsers();   
      } else {
        showUserAlert("❌ " + data.error, "error");
      }
    })
    .catch(function(err) {
      showUserAlert("⚠️ Backend not reachable.", "error");
      console.error(err);
    });
}

function removeUser(id) {
  if (!confirm("Remove this user?")) return;

  fetch(API_BASE + "/users/" + id, { method: "DELETE" })
    .then(function(r)    { return r.json(); })
    .then(function(data) {
      if (data.success) {
        const card = document.getElementById("user-" + id);
        if (card) card.remove();
      } else {
        alert("Error: " + data.error);
      }
    })
    .catch(function(err) { console.error(err); });
}

window.addEventListener("load", function() {
  document.getElementById("userJoined").value = new Date().toISOString().split("T")[0];
});

document.getElementById("hamburger").addEventListener("click", function() {
  document.getElementById("navLinks").classList.toggle("open");
});

loadBudgets();
loadUsers();
