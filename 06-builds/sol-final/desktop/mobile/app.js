function renderRows(targetId, rows, label, value, detail) {
  const target = document.querySelector(`#${targetId}`);
  target.replaceChildren();
  if (!rows.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Nothing scheduled.";
    target.append(empty);
    return;
  }
  for (const row of rows) {
    const container = document.createElement("div");
    container.className = "row";
    const text = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = label(row);
    text.append(strong);
    const extra = detail(row);
    if (extra) {
      const small = document.createElement("small");
      small.textContent = extra;
      text.append(small);
    }
    const time = document.createElement("span");
    time.className = "time";
    time.textContent = value(row);
    container.append(text, time);
    target.append(container);
  }
}

async function load() {
  const date = new Date().toISOString().slice(0, 10);
  document.querySelector("#today").textContent = new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
  }).format(new Date());
  const [scheduleResponse, announcementsResponse, zmanimResponse] = await Promise.all([
    fetch("/api/schedule"),
    fetch("/api/announcements"),
    fetch(`/api/zmanim/${date}`),
  ]);
  const schedule = await scheduleResponse.json();
  const announcements = await announcementsResponse.json();
  const zmanimPayload = await zmanimResponse.json();
  const zmanim = Array.isArray(zmanimPayload.zmanim)
    ? zmanimPayload.zmanim
    : Object.entries(zmanimPayload.zmanim || {}).map(([name, time]) => ({ name, time }));

  renderRows(
    "schedule",
    schedule.schedules || [],
    (entry) => entry.name || entry.hebrewName || "Minyan",
    (entry) => entry.fixedTime || entry.baseZman || "—",
    (entry) => entry.room || "",
  );
  renderRows(
    "announcements",
    announcements.announcements || [],
    (entry) => entry.title || "Announcement",
    () => "",
    (entry) => entry.content || "",
  );
  renderRows(
    "zmanim",
    zmanim,
    (entry) => entry.label || entry.name || entry.type || "Zman",
    (entry) => entry.time || entry.value || "—",
    () => "",
  );
}

if ("serviceWorker" in navigator) void navigator.serviceWorker.register("./sw.js");
void load();
setInterval(() => void load(), 60_000);
