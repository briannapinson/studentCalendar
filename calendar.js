/* calendar.js - month grid, month arrows, add / edit / delete events, upcoming list */

const EVENTS_KEY = "calendarEvents";
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const today = new Date();
let viewYear = today.getFullYear();
let viewMonth = today.getMonth();
let editingId = null;

const monthTitle = document.getElementById("month-title");
const caption = document.getElementById("calendar-caption");
const calendarBody = document.getElementById("calendar-body");
const upcomingList = document.getElementById("upcoming-list");
const eventForm = document.getElementById("event-form");
const eventPopup = document.getElementById("event-popup");
const popupTitle = document.getElementById("event-popup-title");
const saveButton = document.getElementById("save-event");
const deleteButton = document.getElementById("delete-event");

/* ---------- Storage ---------- */
function loadEvents() {
  let list = [];
  try {
    const saved = localStorage.getItem(EVENTS_KEY);
    if (saved !== null) {
      list = JSON.parse(saved);
    }
  } catch (error) {
    console.error("Could not read saved events:", error);
  }

  // Give every event an id (older saved events may not have one)
  list.forEach(function (event, index) {
    if (!event.id) {
      event.id = Date.now() + index;
    }
  });
  return list;
}

function saveEvents() {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch (error) {
    console.error("Could not save events:", error);
  }
}

let events = loadEvents();
saveEvents();

/* ---------- Helpers ---------- */
function pad(number) {
  return String(number).padStart(2, "0");
}

function dateKey(year, month, day) {
  return year + "-" + pad(month + 1) + "-" + pad(day);
}

/* ---------- Calendar grid ---------- */
function renderCalendar() {
  const title = MONTH_NAMES[viewMonth] + " " + viewYear;
  monthTitle.textContent = title;
  caption.textContent = title;
  calendarBody.innerHTML = "";

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
  let day = 1;

  for (let week = 0; week < 6 && day <= daysInMonth; week++) {
    const row = document.createElement("tr");

    for (let col = 0; col < 7; col++) {
      const cell = document.createElement("td");

      if ((week === 0 && col < firstDay) || day > daysInMonth) {
        cell.className = "empty";
      } else {
        const key = dateKey(viewYear, viewMonth, day);
        cell.appendChild(document.createTextNode(day));

        if (key === todayKey) {
          cell.className = "today";
          const label = document.createElement("strong");
          label.textContent = " (Today)";
          cell.appendChild(label);
        }

        events
          .filter(function (event) { return event.date === key; })
          .forEach(function (event) {
            const tag = document.createElement("button");
            tag.type = "button";
            tag.className = "event";
            tag.textContent = event.name;
            tag.setAttribute("aria-label", "Edit event: " + event.name);

            const details = [event.priority + " priority"];
            if (event.location) details.push(event.location);
            if (event.description) details.push(event.description);
            tag.title = details.join(" | ");

            tag.addEventListener("click", function () {
              openEditor(event.id);
            });

            cell.appendChild(tag);
          });

        day++;
      }

      row.appendChild(cell);
    }

    calendarBody.appendChild(row);
  }
}

/* ---------- Upcoming list ---------- */
function renderUpcoming() {
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
  upcomingList.innerHTML = "";

  const upcoming = events
    .filter(function (event) { return event.date >= todayKey; })
    .sort(function (a, b) { return a.date.localeCompare(b.date); })
    .slice(0, 5);

  if (upcoming.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No upcoming events.";
    upcomingList.appendChild(item);
    return;
  }

  upcoming.forEach(function (event) {
    const parts = event.date.split("-");
    const monthShort = MONTH_NAMES[Number(parts[1]) - 1].slice(0, 3);
    const item = document.createElement("li");
    item.textContent = monthShort + " " + Number(parts[2]) + ": " + event.name;
    upcomingList.appendChild(item);
  });
}

/* ---------- Month arrows ---------- */
document.getElementById("prev-month").addEventListener("click", function () {
  viewMonth--;
  if (viewMonth < 0) {
    viewMonth = 11;
    viewYear--;
  }
  renderCalendar();
});

document.getElementById("next-month").addEventListener("click", function () {
  viewMonth++;
  if (viewMonth > 11) {
    viewMonth = 0;
    viewYear++;
  }
  renderCalendar();
});

/* ---------- Add / edit popup ---------- */
function openEditor(id) {
  const event = events.find(function (item) { return item.id === id; });
  if (!event) return;

  editingId = id;
  popupTitle.textContent = "Edit Event";
  saveButton.textContent = "Save Changes";
  deleteButton.hidden = false;

  document.getElementById("event-name").value = event.name;
  document.getElementById("event-priority").value = event.priority;
  document.getElementById("event-date").value = event.date;
  document.getElementById("event-location").value = event.location;
  document.getElementById("event-description").value = event.description;

  eventPopup.showPopover();
}

// Whenever the popup closes, go back to "new event" mode with an empty form
eventPopup.addEventListener("toggle", function (toggleEvent) {
  if (toggleEvent.newState === "closed") {
    editingId = null;
    popupTitle.textContent = "New Event";
    saveButton.textContent = "Save";
    deleteButton.hidden = true;
    eventForm.reset();
  }
});

eventForm.addEventListener("submit", function (submitEvent) {
  submitEvent.preventDefault();

  const values = {
    name: document.getElementById("event-name").value.trim(),
    priority: document.getElementById("event-priority").value,
    date: document.getElementById("event-date").value,
    location: document.getElementById("event-location").value.trim(),
    description: document.getElementById("event-description").value.trim()
  };

  if (editingId !== null) {
    const event = events.find(function (item) { return item.id === editingId; });
    if (event) {
      Object.assign(event, values);
    }
  } else {
    values.id = Date.now();
    events.push(values);
  }

  saveEvents();

  // Jump to the saved event's month so you can see it
  const parts = values.date.split("-");
  viewYear = Number(parts[0]);
  viewMonth = Number(parts[1]) - 1;

  eventPopup.hidePopover();
  renderCalendar();
  renderUpcoming();
});

deleteButton.addEventListener("click", function () {
  if (editingId === null) return;
  if (!confirm("Delete this event?")) return;

  events = events.filter(function (item) { return item.id !== editingId; });
  saveEvents();

  eventPopup.hidePopover();
  renderCalendar();
  renderUpcoming();
});

/* ---------- Start ---------- */
renderCalendar();
renderUpcoming();