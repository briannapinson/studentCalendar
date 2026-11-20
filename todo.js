/* todo.js - add, check off, delete, and filter tasks (saved in localStorage) */

const TODOS_KEY = "todos";
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const todoForm = document.getElementById("todo-form");
const todoList = document.getElementById("todo-list");
const todoCount = document.getElementById("todo-count");
const todoEmpty = document.getElementById("todo-empty");
const monthSelect = document.getElementById("month");
const yearSelect = document.getElementById("year");
const statusSelect = document.getElementById("status");

/* ---------- Storage ---------- */
function loadTodos() {
  try {
    const saved = localStorage.getItem(TODOS_KEY);
    if (saved !== null) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Could not read saved tasks:", error);
  }
  return [];
}

function saveTodos() {
  try {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error("Could not save tasks:", error);
  }
}

let todos = loadTodos();
saveTodos();

/* ---------- Helpers ---------- */
function pad(number) {
  return String(number).padStart(2, "0");
}

function todayKey() {
  const now = new Date();
  return now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
}

function shortDate(key) {
  const parts = key.split("-");
  return MONTH_NAMES[Number(parts[1]) - 1].slice(0, 3) + " " + Number(parts[2]);
}

/* ---------- Rendering ---------- */
function matchesFilters(todo) {
  if (statusSelect.value === "active" && todo.done) return false;
  if (statusSelect.value === "done" && !todo.done) return false;

  if (monthSelect.value !== "all") {
    if (!todo.due) return false;
    if (Number(todo.due.split("-")[1]) - 1 !== Number(monthSelect.value)) return false;
  }

  if (yearSelect.value !== "all") {
    if (!todo.due) return false;
    if (todo.due.split("-")[0] !== yearSelect.value) return false;
  }

  return true;
}

function makeItem(todo) {
  const item = document.createElement("li");
  if (todo.done) item.className = "done";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "task-" + todo.id;
  checkbox.checked = todo.done;
  checkbox.addEventListener("change", function () {
    todo.done = checkbox.checked;
    saveTodos();
    renderTodos();
  });

  const label = document.createElement("label");
  label.htmlFor = checkbox.id;
  label.textContent = todo.task;

  const meta = document.createElement("span");
  meta.className = "task-meta";
  const details = [];
  if (todo.due) details.push("Due " + shortDate(todo.due));
  details.push(todo.priority + " priority");
  meta.textContent = details.join(" | ");

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "todo-delete";
  removeButton.textContent = "Delete";
  removeButton.setAttribute("aria-label", "Delete task: " + todo.task);
  removeButton.addEventListener("click", function () {
    if (!confirm('Delete "' + todo.task + '"?')) return;
    todos = todos.filter(function (other) { return other.id !== todo.id; });
    saveTodos();
    renderTodos();
  });

  item.appendChild(checkbox);
  item.appendChild(label);
  item.appendChild(meta);

  if (todo.due && todo.due < todayKey() && !todo.done) {
    const overdue = document.createElement("span");
    overdue.className = "overdue";
    overdue.textContent = "Overdue";
    item.appendChild(overdue);
  }

  item.appendChild(removeButton);
  return item;
}

function renderTodos() {
  todoList.innerHTML = "";

  const visible = todos
    .filter(matchesFilters)
    .sort(function (a, b) {
      if (!a.due && !b.due) return 0;
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due.localeCompare(b.due);
    });

  visible.forEach(function (todo) {
    todoList.appendChild(makeItem(todo));
  });

  const remaining = todos.filter(function (todo) { return !todo.done; }).length;
  todoCount.textContent = remaining + " of " + todos.length + " tasks remaining";
  todoEmpty.hidden = visible.length > 0;
}

/* ---------- Add task ---------- */
todoForm.addEventListener("submit", function (submitEvent) {
  submitEvent.preventDefault();

  todos.push({
    id: Date.now(),
    task: document.getElementById("task-name").value.trim(),
    due: document.getElementById("task-due").value,
    priority: document.getElementById("task-priority").value,
    done: false
  });
  saveTodos();

  // Clear the filters so the new task is always visible
  statusSelect.value = "all";
  monthSelect.value = "all";
  yearSelect.value = "all";

  todoForm.reset();
  renderTodos();
});

/* ---------- Filters ---------- */
statusSelect.addEventListener("change", renderTodos);
monthSelect.addEventListener("change", renderTodos);
yearSelect.addEventListener("change", renderTodos);

/* ---------- Start ---------- */
renderTodos();