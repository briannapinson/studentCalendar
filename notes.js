/* notes.js - note cards, filters, search, note popup, delete */

const NOTES_KEY = "notes";

const sampleNotes = [
  {
    id: 1,
    title: "Final Project Ideas",
    course: "IST 4654",
    body: "Student calendar with notes, to-do, and calendar pages. Use a shared nav bar, one stylesheet, and sample data for the demo."
  },
  {
    id: 2,
    title: "CSS Flexbox Review",
    course: "IST 4654",
    body: "Flex container, justify-content, align-items, and flex-wrap. Use flexbox for the nav bar and grid for the note cards."
  },
  {
    id: 3,
    title: "Thanksgiving Break",
    course: "Personal",
    body: "Drive home Wednesday, pack laptop and charger for studying, and finish the essay outline before leaving."
  }
];

const notesList = document.getElementById("notes-list");
const notesEmpty = document.getElementById("notes-empty");
const searchBox = document.getElementById("search");
const filterButtons = document.querySelectorAll("#note-tools [data-filter]");
const noteView = document.getElementById("note-view");
const viewTitle = document.getElementById("note-view-title");
const viewCourse = document.getElementById("note-view-course");
const viewBody = document.getElementById("note-view-body");
const viewEdit = document.getElementById("note-view-edit");
const viewDelete = document.getElementById("note-view-delete");

let activeFilter = "all";
let openNoteId = null;

/* ---------- Storage ---------- */
function loadNotes() {
  try {
    const saved = localStorage.getItem(NOTES_KEY);
    if (saved !== null) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Could not read saved notes:", error);
  }
  return sampleNotes.slice();
}

function saveNotes() {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("Could not save notes:", error);
  }
}

let notes = loadNotes();

/* ---------- Cards ---------- */
function makeCard(note) {
  const card = document.createElement("article");

  const title = document.createElement("h2");
  title.textContent = note.title;

  const course = document.createElement("p");
  course.className = "course";
  course.textContent = "Class: " + note.course;

  const preview = document.createElement("p");
  const shortText = note.body.length > 90 ? note.body.slice(0, 90) + "..." : note.body;
  preview.textContent = shortText;

  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.textContent = "Open";
  openButton.addEventListener("click", function () {
    openNote(note.id);
  });

  card.appendChild(title);
  card.appendChild(course);
  card.appendChild(preview);
  card.appendChild(openButton);
  return card;
}

function renderNotes() {
  const term = searchBox.value.trim().toLowerCase();
  notesList.innerHTML = "";

  const visible = notes.filter(function (note) {
    const matchesFilter = activeFilter === "all" || note.course === activeFilter;
    const text = (note.title + " " + note.course + " " + note.body).toLowerCase();
    return matchesFilter && text.includes(term);
  });

  visible.forEach(function (note) {
    notesList.appendChild(makeCard(note));
  });

  notesEmpty.hidden = visible.length > 0;
}

/* ---------- Popup ---------- */
function openNote(id) {
  const note = notes.find(function (item) { return item.id === id; });
  if (!note) return;

  openNoteId = id;
  viewTitle.textContent = note.title;
  viewCourse.textContent = "Class: " + note.course;
  viewBody.textContent = note.body;
  viewEdit.href = "newNote.html?id=" + id;
  noteView.showPopover();
}

viewDelete.addEventListener("click", function () {
  if (openNoteId === null) return;
  if (!confirm("Delete this note?")) return;

  notes = notes.filter(function (note) { return note.id !== openNoteId; });
  saveNotes();
  openNoteId = null;
  noteView.hidePopover();
  renderNotes();
});

/* ---------- Filters and search ---------- */
filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    activeFilter = button.dataset.filter;
    filterButtons.forEach(function (other) {
      other.setAttribute("aria-pressed", other === button ? "true" : "false");
    });
    renderNotes();
  });
});

searchBox.addEventListener("input", renderNotes);

/* ---------- Start ---------- */
renderNotes();
