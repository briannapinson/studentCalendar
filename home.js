/* home.js - mini calendar, upcoming events, task preview, recent notes.
   Reads the same localStorage keys the other pages save to. */

const EVENTS_KEY = "calendarEvents";
const NOTES_KEY = "notes";
const TODOS_KEY = "todos";
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const today = new Date();

/* ---------- Helpers ---------- */
function readList(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Could not read " + key + ":", error);
  }
  return fallback;
}

function pad(number) {
  return String(number).padStart(2, "0");
}

function dateKey(year, month, day) {
  return year + "-" + pad(month + 1) + "-" + pad(day);
}

function shortDate(key) {
  const parts = key.split("-");
  return MONTH_NAMES[Number(parts[1]) - 1].slice(0, 3) + " " + Number(parts[2]);
}

function addEmptyMessage(list, text) {
  const item = document.createElement("li");
  item.textContent = text;
  list.appendChild(item);
}

const events = readList(EVENTS_KEY, []);
const notes = readList(NOTES_KEY, []);
const todos = readList(TODOS_KEY, []);

/* ---------- Mini calendar ---------- */
function renderMiniCalendar() {
  const year = today.getFullYear();
  const month = today.getMonth();
  const title = MONTH_NAMES[month] + " " + year;
  const body = document.getElementById("home-calendar-body");
  const todayKey = dateKey(year, month, today.getDate());

  document.getElementById("home-calendar-caption").textContent = title;
  body.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let day = 1;

  for (let week = 0; week < 6 && day <= daysInMonth; week++) {
    const row = document.createElement("tr");

    for (let col = 0; col < 7; col++) {
      const cell = document.createElement("td");

      if ((week === 0 && col < firstDay) || day > daysInMonth) {
        cell.className = "empty";
      } else {
        const key = dateKey(year, month, day);
        const dayEvents = events.filter(function (event) { return event.date === key; });

        if (key === todayKey) {
          cell.className = "today";
        }

        if (dayEvents.length > 0) {
          const link = document.createElement("a");
          link.href = "calendar.html";
          link.textContent = day;
          link.className = "has-events";
          link.title = dayEvents.map(function (event) { return event.name; }).join(", ");
          link.setAttribute(
            "aria-label",
            MONTH_NAMES[month] + " " + day + ": " + dayEvents.length +
            (dayEvents.length === 1 ? " event" : " events")
          );
          cell.appendChild(link);
        } else {
          cell.textContent = day;
        }

        if (key === todayKey) {
          cell.appendChild(document.createElement("br"));
          const label = document.createElement("small");
          label.textContent = "Today";
          cell.appendChild(label);
        }

        day++;
      }

      row.appendChild(cell);
    }

    body.appendChild(row);
  }
}

/* ---------- Upcoming events ---------- */
function renderUpcoming() {
  const list = document.getElementById("home-upcoming");
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
  list.innerHTML = "";

  const upcoming = events
    .filter(function (event) { return event.date >= todayKey; })
    .sort(function (a, b) { return a.date.localeCompare(b.date); })
    .slice(0, 5);

  if (upcoming.length === 0) {
    addEmptyMessage(list, "No upcoming events.");
    return;
  }

  upcoming.forEach(function (event) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = "calendar.html";
    link.textContent = shortDate(event.date) + ": " + event.name;
    item.appendChild(link);
    list.appendChild(item);
  });
}

/* ---------- To-do preview ---------- */
function renderTodos() {
  const list = document.getElementById("home-todo-list");
  list.innerHTML = "";

  const active = todos
    .filter(function (todo) { return !todo.done; })
    .sort(function (a, b) {
      if (!a.due && !b.due) return 0;
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due.localeCompare(b.due);
    })
    .slice(0, 4);

  if (active.length === 0) {
    addEmptyMessage(list, todos.length === 0 ? "No tasks yet." : "All tasks are done!");
    return;
  }

  active.forEach(function (todo) {
    const item = document.createElement("li");
    item.textContent = todo.task + (todo.due ? " (due " + shortDate(todo.due) + ")" : "");
    list.appendChild(item);
  });
}

/* ---------- Recent notes ---------- */
function renderNotes() {
  const container = document.getElementById("home-notes-list");
  container.innerHTML = "";

  // Newest notes have the largest ids
  const recent = notes
    .slice()
    .sort(function (a, b) { return b.id - a.id; })
    .slice(0, 3);

  if (recent.length === 0) {
    const message = document.createElement("p");
    message.textContent = "No notes yet.";
    container.appendChild(message);
    return;
  }

  recent.forEach(function (note) {
    const card = document.createElement("article");

    const heading = document.createElement("h3");
    const link = document.createElement("a");
    link.href = "notes.html";
    link.textContent = note.title;
    heading.appendChild(link);

    const course = document.createElement("p");
    course.className = "course";
    course.textContent = "Category: " + note.course;

    const preview = document.createElement("p");
    preview.textContent = note.body.length > 90 ? note.body.slice(0, 90) + "..." : note.body;

    card.appendChild(heading);
    card.appendChild(course);
    card.appendChild(preview);
    container.appendChild(card);
  });
}

/* ---------- Start ---------- */
renderMiniCalendar();
renderUpcoming();
renderTodos();
renderNotes();