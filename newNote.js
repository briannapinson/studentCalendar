/* newNote.js - create a new note, or edit one when the URL has ?id=3 */

const NOTES_KEY = "notes";

// Keep this list identical to the one in notes.js
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

const form = document.getElementById("note-form");
const formTitle = document.getElementById("form-title");
const saveButton = document.getElementById("save-note");
const titleInput = document.getElementById("title");
const courseInput = document.getElementById("course");
const bodyInput = document.getElementById("body");

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

function saveNotes(list) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(list));
  } catch (error) {
    console.error("Could not save notes:", error);
  }
}

/* ---------- Edit mode ---------- */
const params = new URLSearchParams(window.location.search);
const editId = params.get("id") ? Number(params.get("id")) : null;

if (editId !== null) {
  const existing = loadNotes().find(function (note) { return note.id === editId; });

  if (existing) {
    document.title = "Edit Note | Student Calendar";
    formTitle.textContent = "Edit Note";
    saveButton.textContent = "Save Changes";
    titleInput.value = existing.title;
    courseInput.value = existing.course;
    if (!courseInput.value) {
      courseInput.selectedIndex = 0;
    }
    bodyInput.value = existing.body;
  } else {
    // Bad or old id: fall back to creating a new note
    window.location.replace("newNote.html");
  }
}

/* ---------- Save ---------- */
form.addEventListener("submit", function (submitEvent) {
  submitEvent.preventDefault();

  const notes = loadNotes();
  const title = titleInput.value.trim();
  const course = courseInput.value;
  const body = bodyInput.value.trim();

  if (editId !== null) {
    const note = notes.find(function (item) { return item.id === editId; });
    if (note) {
      note.title = title;
      note.course = course;
      note.body = body;
    }
  } else {
    notes.push({ id: Date.now(), title: title, course: course, body: body });
  }

  saveNotes(notes);
  window.location.href = "notes.html";
});