const input = document.getElementById("modpackInput");
const suggestionsBox = document.getElementById("suggestions");
const checkBtn = document.getElementById("checkBtn");
const result = document.getElementById("result");
const langToggle = document.getElementById("langToggle");

let selectedModpackId = null;
let debounceTimer = null;

langToggle.addEventListener("click", toggleLanguage);
applyTranslations();

// พิมพ์แล้วรอ 300ms ก่อนยิง request (กันยิงถี่เกินทุกตัวอักษร)
input.addEventListener("input", () => {
  selectedModpackId = null;
  checkBtn.disabled = true;

  const query = input.value.trim();
  clearTimeout(debounceTimer);

  if (query.length < 2) {
    hideSuggestions();
    return;
  }

  debounceTimer = setTimeout(() => searchModpacks(query), 300);
});

async function searchModpacks(query) {
  const res = await fetch(`/api/modpacks/search?q=${encodeURIComponent(query)}`);
  const results = await res.json();
  renderSuggestions(results);
}

function renderSuggestions(results) {
  suggestionsBox.innerHTML = "";

  if (results.length === 0) {
    const empty = document.createElement("div");
    empty.className = "suggestion-empty";
    empty.textContent = t("noResults");
    suggestionsBox.appendChild(empty);
    suggestionsBox.classList.remove("hidden");
    return;
  }

  results.forEach((mod) => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    item.textContent = mod.name;
    item.addEventListener("click", () => selectModpack(mod));
    suggestionsBox.appendChild(item);
  });

  suggestionsBox.classList.remove("hidden");
}

function selectModpack(mod) {
  selectedModpackId = mod.id;
  input.value = mod.name;
  checkBtn.disabled = false;
  hideSuggestions();
}

function hideSuggestions() {
  suggestionsBox.classList.add("hidden");
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-wrap")) hideSuggestions();
});

checkBtn.addEventListener("click", async () => {
  if (!selectedModpackId) {
    showResult(t("selectFirst"));
    return;
  }

  checkBtn.disabled = true;
  showResult(t("statusChecking"));

  try {
    const res = await fetch(`/api/modpacks/${selectedModpackId}/server-pack`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t("statusError"));

    if (data.type === "official") {
      showLink(data.downloadUrl, t("statusOfficial"));
    } else {
      showResult(t("statusGenerating"));
      pollJob(data.jobId);
    }
  } catch (err) {
    showResult(`${t("statusError")}: ${err.message}`);
    checkBtn.disabled = false;
  }
});

function pollJob(jobId) {
  const interval = setInterval(async () => {
    const res = await fetch(`/api/jobs/${jobId}`);
    const job = await res.json();

    if (job.status === "done") {
      clearInterval(interval);
      showLink(job.resultUrl, t("statusDone"));
    } else if (job.status === "failed") {
      clearInterval(interval);
      showResult(t("statusFailed"));
      checkBtn.disabled = false;
    }
  }, 2000);
}

function showResult(text) {
  result.textContent = text;
  result.classList.remove("hidden");
}

function showLink(url, label) {
  result.innerHTML = `${label}: <a href="${url}" target="_blank">${url}</a>`;
  result.classList.remove("hidden");
  checkBtn.disabled = false;
}
