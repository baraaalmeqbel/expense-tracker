const API_URL = "http://localhost:3000/api/expenses";

const spinner = document.getElementById("spinner");
const errorAlert = document.getElementById("errorAlert");
const expensesTableBody = document.getElementById("expensesTableBody");

const totalExpenses = document.getElementById("totalExpenses");
const expensesCount = document.getElementById("expensesCount");
const highestExpense = document.getElementById("highestExpense");

const expenseForm = document.getElementById("expenseForm");

const titleInput = document.getElementById("titleInput");
const amountInput = document.getElementById("amountInput");
const categoryInput = document.getElementById("categoryInput");
const dateInput = document.getElementById("dateInput");

// Category Filter
const categoryFilter = document.getElementById("categoryFilter");

// Save all expenses here
let allExpenses = [];

// Add Form Errors

const titleError = document.getElementById("titleError");
const amountError = document.getElementById("amountError");
const categoryError = document.getElementById("categoryError");
const dateError = document.getElementById("dateError");

// Edit Form

const editExpenseModal = new bootstrap.Modal(
  document.getElementById("editExpenseModal"),
);

const editExpenseForm = document.getElementById("editExpenseForm");

const editTitleInput = document.getElementById("editTitleInput");
const editAmountInput = document.getElementById("editAmountInput");
const editCategoryInput = document.getElementById("editCategoryInput");
const editDateInput = document.getElementById("editDateInput");

const editTitleError = document.getElementById("editTitleError");
const editAmountError = document.getElementById("editAmountError");
const editCategoryError = document.getElementById("editCategoryError");
const editDateError = document.getElementById("editDateError");

let editingExpenseId = null;

// Get Expenses

async function getExpenses() {
  try {
    spinner.classList.remove("d-none");

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to load expenses.");
    }

    const expenses = await response.json();

    // Save all expenses
    allExpenses = expenses;

    // Summary

    expensesCount.textContent = expenses.length;

    // Total
    const total = expenses.reduce(function (sum, expense) {
      return sum + Number(expense.amount);
    }, 0);

    totalExpenses.textContent = `${total.toFixed(2)} JOD`;

    // Highest Expense
    const highest =
      expenses.length > 0
        ? Math.max(
            ...expenses.map(function (expense) {
              return Number(expense.amount);
            }),
          )
        : 0;

    highestExpense.textContent = `${highest.toFixed(2)} JOD`;

    // Show all expenses
    displayExpenses(expenses);
  } catch (error) {
    console.error(error);

    errorAlert.textContent = error.message;
    errorAlert.classList.remove("d-none");
  } finally {
    spinner.classList.add("d-none");
  }
}

// Display Expenses

function displayExpenses(expenses) {
  expensesTableBody.innerHTML = "";

  expenses.forEach(function (expense) {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>
                ${expense.title}
            </td>

            <td>
                ${Number(expense.amount).toFixed(2)} JOD
            </td>

            <td>
                <span class="category-badge ${expense.category.toLowerCase()}">
                    ${expense.category}
                </span>
            </td>

            <td>
                ${new Date(expense.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
            </td>

            <td>

                <button
                    type="button"
                    class="edit-btn"
                    data-id="${expense.id}">
                    Edit
                </button>

                <button
                    type="button"
                    class="delete-btn"
                    data-id="${expense.id}">
                    Delete
                </button>

            </td>
        `;

    expensesTableBody.appendChild(row);
  });

  // Add events to buttons
  addButtonEvents();
}

// Edit & Delete Buttons

function addButtonEvents() {
  const editButtons = document.querySelectorAll(".edit-btn");

  editButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const id = Number(button.dataset.id);

      editExpense(id);
    });
  });

  const deleteButtons = document.querySelectorAll(".delete-btn");

  deleteButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const id = Number(button.dataset.id);

      deleteExpense(id);
    });
  });
}

// Category Filter

function filterExpenses() {
  const selectedCategory = categoryFilter.value;

  // Show all
 if (selectedCategory === "all") {
    displayExpenses(allExpenses);
    return;
}
  // Show selected category
  const filteredExpenses = allExpenses.filter(function (expense) {
    return expense.category === selectedCategory;
  });

  displayExpenses(filteredExpenses);
}

// Run filter when category changes
categoryFilter.addEventListener("change", filterExpenses);

// Clear Add Form Validation

function clearValidation() {
  titleError.textContent = "";
  amountError.textContent = "";
  categoryError.textContent = "";
  dateError.textContent = "";

  titleInput.classList.remove("input-error");
  amountInput.classList.remove("input-error");
  categoryInput.classList.remove("input-error");
  dateInput.classList.remove("input-error");
}

// Validate Add Form

function validateForm() {
  let hasError = false;

  clearValidation();

  // Title
  if (!titleInput.value.trim()) {
    titleError.textContent = "Title is required.";

    titleInput.classList.add("input-error");

    hasError = true;
  }

  // Amount
  if (!amountInput.value) {
    amountError.textContent = "Amount is required.";

    amountInput.classList.add("input-error");

    hasError = true;
  } else if (Number(amountInput.value) <= 0) {
    amountError.textContent = "Amount must be greater than 0.";

    amountInput.classList.add("input-error");

    hasError = true;
  }

  // Category
  if (!categoryInput.value) {
    categoryError.textContent = "Choose a category.";

    categoryInput.classList.add("input-error");

    hasError = true;
  }

  // Date
  if (!dateInput.value) {
    dateError.textContent = "Date is required.";

    dateInput.classList.add("input-error");

    hasError = true;
  }

  return !hasError;
}

// Add Expense

expenseForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  // Check validation
  if (!validateForm()) {
    return;
  }

  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  try {
    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        title: title,
        amount: amount,
        category: category,
        date: date,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to add expense.");
    }

    // Clear form
    expenseForm.reset();

    clearValidation();

    errorAlert.classList.add("d-none");

    // Update table
    await getExpenses();
  } catch (error) {
    console.error(error);

    errorAlert.textContent = error.message;

    errorAlert.classList.remove("d-none");
  }
});

// Delete Expense

async function deleteExpense(id) {
  const confirmDelete = confirm(
    "Are you sure you want to delete this expense?",
  );

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to delete expense.");
    }

    // Update table
    await getExpenses();
  } catch (error) {
    console.error(error);

    errorAlert.textContent = error.message;

    errorAlert.classList.remove("d-none");
  }
}

// Open Edit Form

async function editExpense(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);

    const expense = await response.json();

    if (!response.ok) {
      throw new Error(expense.error || "Failed to get expense.");
    }

    // Save ID
    editingExpenseId = id;

    // Put old data in form
    editTitleInput.value = expense.title;
    editAmountInput.value = expense.amount;
    editCategoryInput.value = expense.category;

    editDateInput.value = String(expense.date).substring(0, 10);

    // Clear errors
    editTitleError.textContent = "";
    editAmountError.textContent = "";
    editCategoryError.textContent = "";
    editDateError.textContent = "";

    // Open modal
    editExpenseModal.show();
  } catch (error) {
    console.error(error);

    errorAlert.textContent = error.message;

    errorAlert.classList.remove("d-none");
  }
}

// Save Edited Expense

editExpenseForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  // Clear old errors
  editTitleError.textContent = "";
  editAmountError.textContent = "";
  editCategoryError.textContent = "";
  editDateError.textContent = "";

  const title = editTitleInput.value.trim();
  const amount = Number(editAmountInput.value);
  const category = editCategoryInput.value;
  const date = editDateInput.value;

  let hasError = false;

  // Title
  if (!title) {
    editTitleError.textContent = "Title is required.";

    hasError = true;
  }

  // Amount
  if (!editAmountInput.value) {
    editAmountError.textContent = "Amount is required.";

    hasError = true;
  } else if (amount <= 0) {
    editAmountError.textContent = "Amount must be greater than 0.";

    hasError = true;
  }

  // Category
  if (!category) {
    editCategoryError.textContent = "Choose a category.";

    hasError = true;
  }

  // Date
  if (!date) {
    editDateError.textContent = "Date is required.";

    hasError = true;
  }

  // Stop if there is an error
  if (hasError) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${editingExpenseId}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        title: title,
        amount: amount,
        category: category,
        date: date,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update expense.");
    }

    // Close modal
    editExpenseModal.hide();

    // Update table without browser refresh
    await getExpenses();
  } catch (error) {
    console.error(error);

    errorAlert.textContent = error.message;

    errorAlert.classList.remove("d-none");
  }
});

getExpenses();

const darkModeBtn = document.getElementById("darkModeBtn");

const savedMode = localStorage.getItem("darkMode");

if (savedMode === "enabled") {
  document.body.classList.add("dark-mode");

  darkModeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

darkModeBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "enabled");

    darkModeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    localStorage.setItem("darkMode", "disabled");

    darkModeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
});
