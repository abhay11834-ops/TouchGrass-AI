
"use strict";

// =============================================
// TOUCHGRASS AI — Application logic
// =============================================

const OLLAMA_URL = "http://127.0.0.1:11434/api/chat";
const MODEL = "qwen2.5:3b";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const KEYS = {
  stats: "touchgrass_stats_v1",
  saved: "touchgrass_saved_v1",
  completed: "touchgrass_completed_v1",
  current: "touchgrass_current_v1"
};

const defaultStats = {
  minutes: 0,
  completed: 0,
  dates: []
};

let stats = load(KEYS.stats, defaultStats);
let savedMissions = load(KEYS.saved, []);
let completedMissions = load(KEYS.completed, []);
let currentMission = load(KEYS.current, null);

let mood = "curious";
let duration = 10;
let timerRemaining = 0;
let timerInterval = null;
let toastTimeout = null;
let requestInProgress = false;

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function store(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    showToast("Browser storage is unavailable or full.");
    return false;
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateString, amount) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return todayKey(date);
}

function getStreak() {
  const dates = new Set(stats.dates || []);
  let day = todayKey();

  if (!dates.has(day)) day = addDays(day, -1);
  if (!dates.has(day)) return 0;

  let streak = 0;
  while (dates.has(day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

function renderStats() {
  $("#minutesStat").textContent = stats.minutes || 0;
  $("#completedStat").textContent = stats.completed || 0;
  $("#streakStat").textContent = getStreak();

  $("#minutesBar").style.width =
    `${Math.min(100, ((stats.minutes || 0) / 120) * 100)}%`;

  $("#completedBar").style.width =
    `${Math.min(100, ((stats.completed || 0) / 10) * 100)}%`;

  $("#streakBar").style.width =
    `${Math.min(100, (getStreak() / 7) * 100)}%`;
}

function renderDate() {
  $("#todayDate").textContent = new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(new Date()).toUpperCase();
}

function setModelStatus(text, connected = false) {
  $("#modelStatus").textContent = text;
  const dot = $(".model-pill .live-dot");
  dot.style.background = connected ? "#b6ef77" : "#d9ae64";
  dot.style.boxShadow = connected ? "0 0 10px #b6ef7770" : "none";
}

// =============================================
// Test whether Ollama and the model are available
// =============================================

async function checkAI() {
  try {
    const response = await fetch("http://127.0.0.1:11434/api/tags", {
      signal: AbortSignal.timeout(4000)
    });

    if (!response.ok) throw new Error("Ollama unavailable");

    const data = await response.json();
    const models = (data.models || []).map((item) => item.name);
    const found = models.some((name) =>
      name === MODEL || name.startsWith(MODEL + ":")
    );

    if (found) {
      setModelStatus("Qwen 3B · Local", true);
    } else {
      setModelStatus("Model not installed");
    }
  } catch {
    setModelStatus("AI disconnected");
  }
}

// =============================================
// Mood and duration selectors
// =============================================

$("#moodChoices").addEventListener("click", (event) => {
  const button = event.target.closest("[data-mood]");
  if (!button) return;

  mood = button.dataset.mood;

  $$("#moodChoices .choice").forEach((item) => {
    item.classList.toggle("active", item === button);
  });
});

$("#timeChoices").addEventListener("click", (event) => {
  const button = event.target.closest("[data-time]");
  if (!button) return;

  duration = Number(button.dataset.time);

  $$("#timeChoices .choice").forEach((item) => {
    item.classList.toggle("active", item === button);
  });
});

// =============================================
// Generate a REAL AI mission with Ollama
// =============================================

function extractJSON(content) {
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/, "");

  try {
    return JSON.parse(cleaned);
  } catch {
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");

    if (first === -1 || last <= first) {
      throw new Error("The AI returned an invalid response.");
    }

    return JSON.parse(cleaned.slice(first, last + 1));
  }
}

function validateMission(raw) {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid mission data.");
  }

  const title = String(raw.title || "").trim().slice(0, 100);
  const description = String(raw.description || "").trim().slice(0, 500);
  const tasks = Array.isArray(raw.tasks)
    ? raw.tasks.map((task) => String(task).trim().slice(0, 180))
        .filter(Boolean).slice(0, 6)
    : [];

  if (!title || !description || tasks.length < 2) {
    throw new Error("The AI generated an incomplete mission. Try again.");
  }

  return {
    id: crypto.randomUUID(),
    title,
    description,
    tasks,
    tip: String(raw.tip || "Stay aware of your surroundings.")
      .trim().slice(0, 300),
    duration,
    mood,
    activity: $("#activitySelect").value,
    location: $("#locationInput").value.trim().slice(0, 100),
    createdAt: new Date().toISOString(),
    completed: false,
    checked: []
  };
}

async function generateMission() {
  if (requestInProgress) return;

  requestInProgress = true;
  const button = $("#generateButton");
  button.disabled = true;
  button.innerHTML = '<span>✳</span> Your adventure is taking shape...';

  setModelStatus("Generating locally...");

  const activity = $("#activitySelect").value;
  const location = $("#locationInput").value.trim() || "an accessible outdoor area";
  const moodInstructions = {
    curious: "Make it exploratory, observant, and full of little discoveries.",
    stressed: "Make it calm, gentle, mindful, and free of pressure.",
    energetic: "Make it active and lively but safe and appropriate.",
    bored: "Make it playful, surprising, and a little unusual."
  };

  const prompt = `
You are TouchGrass, an outdoor activity designer.
Create one practical outdoor mission for a real person.

USER PREFERENCES
Mood: ${mood}
Mood guidance: ${moodInstructions[mood]}
Available time: ${duration} minutes
Activity: ${activity}
Outdoor setting: ${location}

RULES
- The total activity must fit within ${duration} minutes.
- Create 3 to 5 clear, actionable tasks.
- The person should spend most of the time away from the phone.
- Do not require paid equipment or a specific destination.
- Do not invent local trails, wildlife sightings, weather, or location facts.
- Do not encourage approaching wild animals, eating wild plants, trespassing,
  entering roads, or touching unknown fungi or plants.
- Provide a sensible indoor or sheltered alternative if conditions are unsafe.
- Be encouraging, specific, original, and concise.
- Return ONLY valid JSON, without markdown or extra text.
- Required structure:
{
  "title": "Short mission title",
  "description": "A friendly description",
  "tasks": ["First task", "Second task", "Third task"],
  "tip": "One practical safety or exploration tip"
}
`;

  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(120000),
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You create safe, realistic outdoor missions. Follow the requested JSON format."
          },
          { role: "user", content: prompt }
        ],
        format: "json",
        stream: false,
        options: { temperature: 0.85 }
      })
    });

    if (!response.ok) {
      throw new Error(
        `Ollama returned HTTP ${response.status}. Check the local AI service.`
      );
    }

    const data = await response.json();

    if (!data.message?.content) {
      throw new Error("The model returned an empty response.");
    }

    const raw = extractJSON(data.message.content);
    const mission = validateMission(raw);

    currentMission = mission;
    store(KEYS.current, currentMission);

    renderMission(currentMission);
    setModelStatus("Qwen 3B · Local", true);
    $("#missionPanel").scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });

  } catch (error) {
    console.error("Mission generation failed:", error);

    setModelStatus("AI disconnected");

    if (error.name === "TimeoutError") {
      showToast("AI took too long. Try a shorter mission.");
    } else if (error instanceof TypeError) {
      showToast("Can't reach Ollama. Check that it is running and CORS is configured.");
    } else {
      showToast(error.message || "Could not generate a mission.");
    }
  } finally {
    requestInProgress = false;
    button.disabled = false;
    button.innerHTML =
      '<span>✳</span> Generate my mission <span class="button-arrow">↗</span>';
  }
}

$("#generateButton").addEventListener("click", generateMission);

// =============================================
// Render mission and interactive task checklist
// =============================================

function renderMission(mission) {
  stopTimer();

  $("#emptyState").hidden = true;
  $("#missionResult").hidden = false;

  const tasks = mission.tasks.map((task, index) => `
    <li class="task-item ${mission.checked?.includes(index) ? "done" : ""}">
      <input
        type="checkbox"
        data-task-index="${index}"
        ${mission.checked?.includes(index) ? "checked" : ""}
        aria-label="Complete task ${index + 1}"
      >
      <span>${escapeHTML(task)}</span>
    </li>
  `).join("");

  $("#missionResult").innerHTML = `
    <div class="mission-result">
      <div class="result-top">
        <span class="result-label">✳ YOUR AI-GENERATED MISSION</span>
        <div class="result-actions">
          <button class="icon-button" id="saveMission" aria-label="Save mission" title="Save mission">♡</button>
          <button class="icon-button" id="newMission" aria-label="Generate another mission" title="New mission">↻</button>
        </div>
      </div>
      <h3 class="result-title">${escapeHTML(mission.title)}</h3>
      <p class="result-description">${escapeHTML(mission.description)}</p>
      <div class="result-meta">
        <span class="meta-chip">◷ ${mission.duration} minutes</span>
        <span class="meta-chip">✳ ${escapeHTML(mission.activity)}</span>
      </div>
      <div class="result-subheading">YOUR CHECKLIST</div>
      <ul class="task-list">${tasks}</ul>
      <div class="mission-tip">✦ ${escapeHTML(mission.tip)}</div>
      <div class="timer-box">
        <div>
          <div class="timer-display" id="timerDisplay">${formatTime(mission.duration * 60)}</div>
          <div class="timer-caption" id="timerCaption">YOUR OUTDOOR TIME STARTS HERE</div>
        </div>
        <div class="timer-controls">
          <button class="small-button primary" id="startTimer">Start</button>
          <button class="small-button" id="resetTimer">Reset</button>
        </div>
      </div>
      <button class="complete-button" id="completeMission">✓ Complete adventure</button>
    </div>
  `;

  timerRemaining = mission.duration * 60;

  $("#missionResult").querySelectorAll("[data-task-index]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const index = Number(checkbox.dataset.taskIndex);
      mission.checked = mission.checked || [];

      if (checkbox.checked) {
        if (!mission.checked.includes(index)) mission.checked.push(index);
      } else {
        mission.checked = mission.checked.filter((item) => item !== index);
      }

      checkbox.closest(".task-item").classList.toggle("done", checkbox.checked);
      store(KEYS.current, mission);
    });
  });

  $("#saveMission").addEventListener("click", () => saveMission(mission));
  $("#newMission").addEventListener("click", generateMission);
  $("#startTimer").addEventListener("click", startTimer);
  $("#resetTimer").addEventListener("click", resetTimer);
  $("#completeMission").addEventListener("click", () => completeMission(mission));

  if (savedMissions.some((item) => item.id === mission.id)) {
    $("#saveMission").textContent = "♥";
  }
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

// =============================================
// Countdown timer
// =============================================

function startTimer() {
  if (timerInterval) return;

  if (timerRemaining <= 0) {
    showToast("Reset the timer to start again.");
    return;
  }

  $("#startTimer").textContent = "Pause";
  $("#timerCaption").textContent = "ONE MOMENT AT A TIME";

  timerInterval = setInterval(() => {
    timerRemaining--;

    const display = $("#timerDisplay");
    if (display) display.textContent = formatTime(timerRemaining);

    if (timerRemaining <= 0) {
      stopTimer();
      $("#timerCaption").textContent = "TIME TO CHECK IN";
      $("#startTimer").textContent = "Finished";
      showToast("Mission timer finished! Check in with yourself.");
    }
  }, 1000);

  $("#startTimer").textContent = "Pause";
  $("#startTimer").onclick = pauseTimer;
}

function pauseTimer() {
  stopTimer();
  const button = $("#startTimer");
  if (button) {
    button.textContent = "Resume";
    button.onclick = startTimer;
  }

  const caption = $("#timerCaption");
  if (caption) caption.textContent = "TIMER PAUSED";
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  stopTimer();
  timerRemaining = (currentMission?.duration || duration) * 60;

  const display = $("#timerDisplay");
  const caption = $("#timerCaption");
  const button = $("#startTimer");

  if (display) display.textContent = formatTime(timerRemaining);
  if (caption) caption.textContent = "YOUR OUTDOOR TIME STARTS HERE";

  if (button) {
    button.textContent = "Start";
    button.onclick = startTimer;
  }
}

// =============================================
// Save missions
// =============================================

function saveMission(mission) {
  if (savedMissions.some((item) => item.id === mission.id)) {
    showToast("This mission is already saved.");
    return;
  }

  savedMissions.unshift({ ...mission });
  savedMissions = savedMissions.slice(0, 30);

  store(KEYS.saved, savedMissions);
  renderSaved();

  $("#saveMission").textContent = "♥";
  showToast("Adventure saved for another day.");
}

function renderSaved() {
  $("#savedCount").textContent = `${savedMissions.length} SAVED`;

  if (!savedMissions.length) {
    $("#savedGrid").innerHTML =
      '<div class="saved-empty">Your next adventure could live here. Generate a mission and save it for later.</div>';
    return;
  }

  $("#savedGrid").innerHTML = savedMissions.map((mission) => `
    <article class="saved-card">
      <span class="result-label">✳ ${escapeHTML(mission.mood || "ADVENTURE")}</span>
      <h3>${escapeHTML(mission.title)}</h3>
      <p>${escapeHTML(mission.description)}</p>
      <div class="saved-card-bottom">
        <span>◷ ${mission.duration} min</span>
        <button data-open-saved="${escapeHTML(mission.id)}">Open ↗</button>
        <button data-delete-saved="${escapeHTML(mission.id)}" aria-label="Delete saved mission">✕</button>
      </div>
    </article>
  `).join("");

  $("#savedGrid").querySelectorAll("[data-open-saved]").forEach((button) => {
    button.addEventListener("click", () => {
      const mission = savedMissions.find((item) => item.id === button.dataset.openSaved);
      if (!mission) return;

      currentMission = {
        ...mission,
        id: crypto.randomUUID(),
        checked: [],
        completed: false
      };

      store(KEYS.current, currentMission);
      renderMission(currentMission);
      $("#generator").scrollIntoView({ behavior: "smooth" });
    });
  });

  $("#savedGrid").querySelectorAll("[data-delete-saved]").forEach((button) => {
    button.addEventListener("click", () => {
      savedMissions = savedMissions.filter(
        (item) => item.id !== button.dataset.deleteSaved
      );

      store(KEYS.saved, savedMissions);
      renderSaved();
      showToast("Saved mission removed.");
    });
  });
}

// =============================================
// Complete mission and record outdoor minutes
// =============================================

function completeMission(mission) {
  if (!mission || mission.completed) {
    showToast("This mission has already been completed.");
    return;
  }

  const confirmed = window.confirm(
    `Did you complete your ${mission.duration}-minute outdoor mission? Only confirm if you actually did it.`
  );

  if (!confirmed) return;

  const day = todayKey();
  const alreadyRecordedToday = (stats.dates || []).includes(day);

  stats.minutes = (stats.minutes || 0) + mission.duration;
  stats.completed = (stats.completed || 0) + 1;
  stats.dates = [...new Set([...(stats.dates || []), day])];

  mission.completed = true;
  completedMissions.unshift({
    id: mission.id,
    title: mission.title,
    duration: mission.duration,
    completedAt: new Date().toISOString()
  });

  completedMissions = completedMissions.slice(0, 200);

  const statsSaved = store(KEYS.stats, stats);
  const historySaved = store(KEYS.completed, completedMissions);
  store(KEYS.current, mission);

  stopTimer();
  renderStats();

  $("#completeMission").disabled = true;
  $("#completeMission").textContent = "✓ Adventure completed";

  showToast(
    alreadyRecordedToday
      ? "Adventure logged. Keep exploring!"
      : "Well done! Your outdoor journey is growing."
  );

  if (!statsSaved || !historySaved) {
    showToast("Progress updated for this session, but storage may be full.");
  }
}

// =============================================
// Inspiration cards and keyboard usability
// =============================================

$$(".idea-card").forEach((card) => {
  card.addEventListener("click", () => {
    mood = card.dataset.mood;
    duration = Number(card.dataset.time);

    $$("#moodChoices .choice").forEach((button) => {
      button.classList.toggle("active", button.dataset.mood === mood);
    });

    $$("#timeChoices .choice").forEach((button) => {
      button.classList.toggle("active", Number(button.dataset.time) === duration);
    });

    $("#activitySelect").value = card.dataset.activity;
    $("#generator").scrollIntoView({ behavior: "smooth" });

    showToast("Your preferences are ready. Generate your adventure!");
  });
});

$("#profileButton").addEventListener("click", () => {
  showToast("Your adventures are saved in this browser.");
});

// =============================================
// App initialization
// =============================================

function init() {
  renderDate();
  renderStats();
  renderSaved();
  checkAI();

  if (currentMission && !currentMission.completed) {
    renderMission(currentMission);
  }
}

init();