const input = document.getElementById("modpackInput");
const suggestionsBox = document.getElementById("suggestions");
const versionWrap = document.getElementById("versionWrap");
const versionSelect = document.getElementById("versionSelect");
const checkBtn = document.getElementById("checkBtn");
const result = document.getElementById("result");
const langToggle = document.getElementById("langToggle");

let selectedModpackId = null;
let debounceTimer = null;

langToggle.addEventListener("click", toggleLanguage);
applyTranslations();

input.addEventListener("input", () => {
  selectedModpackId = null;
  checkBtn.disabled = true;
  versionWrap.classList.add("hidden");

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
  const data = await res.json();
  if (!res.ok) {
    toast(tError(data.error), "error");
    return;
  }
  renderSuggestions(data);
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

async function selectModpack(mod) {
  selectedModpackId = mod.id;
  input.value = mod.name;
  hideSuggestions();
  checkBtn.disabled = true;
  result.classList.add("hidden");

  versionWrap.classList.remove("hidden");
  versionSelect.innerHTML = `<option>${t("loadingVersions")}</option>`;

  try {
    const res = await fetch(`/api/modpacks/${mod.id}/files`);
    const data = await res.json();
    if (!res.ok) throw new Error(tError(data.error));
    renderVersionOptions(data);
  } catch (err) {
    toast(err.message, "error");
  }
}

function renderVersionOptions(files) {
  versionSelect.innerHTML = "";
  files.forEach((file) => {
    const opt = document.createElement("option");
    opt.value = file.id;
    const badge = file.hasServerPack ? `✓ ${t("versionHasServerPack")}` : t("versionNeedsGeneration");
    opt.textContent = `${file.displayName} (${file.gameVersion}) — ${badge}`;
    versionSelect.appendChild(opt);
  });
  checkBtn.disabled = files.length === 0;
}

function hideSuggestions() {
  suggestionsBox.classList.add("hidden");
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-wrap")) hideSuggestions();
});

checkBtn.addEventListener("click", async () => {
  if (!selectedModpackId) {
    toast(t("selectFirst"), "error");
    return;
  }

  const fileId = versionSelect.value;
  checkBtn.disabled = true;
  result.classList.add("hidden");
  toast(t("toastChecking"), "info");

  try {
    const res = await fetch(
      `/api/modpacks/${selectedModpackId}/server-pack?fileId=${encodeURIComponent(fileId)}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(tError(data.error));

    if (data.type === "official") {
      toast(t("statusOfficial"), "success");
      showLink(data.downloadUrl, t("statusOfficial"));
    } else {
      toast(t("toastGenerating"), "info");
      showResult(t("statusGenerating"));
      pollJob(data.jobId);
    }
  } catch (err) {
    toast(err.message, "error");
    showResult(err.message);
    checkBtn.disabled = false;
  }
});

function pollJob(jobId) {
  const interval = setInterval(async () => {
    const res = await fetch(`/api/jobs/${jobId}`);
    const job = await res.json();

    if (!res.ok) {
      clearInterval(interval);
      toast(tError(job.error), "error");
      showResult(tError(job.error));
      checkBtn.disabled = false;
      return;
    }

    if (job.status === "done") {
      clearInterval(interval);
      toast(t("toastDone"), "success");
      showLink(job.resultUrl, t("statusDone"));
    } else if (job.status === "failed") {
      clearInterval(interval);
      toast(t("toastFailed"), "error");
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

function toast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.textContent = message;
  container.appendChild(el);

  requestAnimationFrame(() => el.classList.add("show"));

  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 4000);
}