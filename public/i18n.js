const translations = {
  th: {
    title: "PackME",
    tagline: "หา หรือสร้าง server pack ให้ modpack จาก CurseForge",
    searchPlaceholder: "พิมพ์ชื่อ หรือวางลิงก์ CurseForge เช่น RLCraft",
    checkBtn: "เช็ค",
    noResults: "ไม่พบ modpack ที่ตรงกับคำค้นหา",
    statusChecking: "กำลังเช็ค...",
    statusOfficial: "มี server pack สำเร็จรูปอยู่แล้ว",
    statusGenerating: "ไม่มี server pack สำเร็จรูป กำลังสร้างให้...",
    statusDone: "สร้าง server pack เสร็จแล้ว",
    statusFailed: "สร้าง server pack ไม่สำเร็จ",
    statusError: "เกิดข้อผิดพลาด",
    selectFirst: "เลือก modpack จากรายการก่อน",
    selectVersion: "เลือกเวอร์ชัน",
    loadingVersions: "กำลังโหลดรายชื่อเวอร์ชัน...",
    versionHasServerPack: "มี server pack แล้ว",
    versionNeedsGeneration: "ต้องสร้างใหม่",
    toastChecking: "กำลังเช็ค modpack...",
    toastGenerating: "ไม่มี server pack สำเร็จรูป กำลังสร้างให้ (อาจใช้เวลาสักครู่)",
    toastDone: "สร้าง server pack เสร็จแล้ว 🎉",
    toastFailed: "สร้าง server pack ไม่สำเร็จ",
    SEARCH_FAILED: "ค้นหาไม่สำเร็จ",
    FILES_LOAD_FAILED: "โหลดรายการเวอร์ชันไม่สำเร็จ",
    NO_DOWNLOAD_URL: "ไม่พบลิงก์ดาวน์โหลด modpack จาก CurseForge",
    CHECK_FAILED: "ตรวจสอบข้อมูล modpack ไม่สำเร็จ",
    DISTRIBUTION_DISABLED: "modpack นี้ไม่อนุญาตให้เข้าถึงผ่าน third-party API (เจ้าของปิดสิทธิ์นี้ไว้)",
    JOB_NOT_FOUND: "ไม่พบงานนี้",
  },
  en: {
    title: "PackME",
    tagline: "Find or generate a server pack for any CurseForge modpack",
    searchPlaceholder: "Type a name or paste a CurseForge link, e.g. RLCraft",
    checkBtn: "Check",
    noResults: "No modpacks match your search",
    statusChecking: "Checking...",
    statusOfficial: "An official server pack is available",
    statusGenerating: "No official server pack — generating one for you...",
    statusDone: "Server pack generation complete",
    statusFailed: "Server pack generation failed",
    statusError: "Something went wrong",
    selectFirst: "Please select a modpack from the list first",
    selectVersion: "Select version",
    loadingVersions: "Loading versions...",
    versionHasServerPack: "Server pack available",
    versionNeedsGeneration: "Needs generation",
    toastChecking: "Checking modpack...",
    toastGenerating: "No official server pack — generating one (this may take a moment)",
    toastDone: "Server pack generation complete 🎉",
    toastFailed: "Server pack generation failed",
    SEARCH_FAILED: "Search failed",
    FILES_LOAD_FAILED: "Failed to load version list",
    NO_DOWNLOAD_URL: "Could not find a CurseForge download link for this modpack",
    CHECK_FAILED: "Failed to check modpack",
    DISTRIBUTION_DISABLED: "This modpack owner has disabled third-party API access",
    JOB_NOT_FOUND: "Job not found",
  },
};

let currentLang = localStorage.getItem("packme_lang") || "th";

function t(key) {
  return translations[currentLang][key] || key;
}

// แปล error code จาก backend เป็นข้อความตามภาษาปัจจุบัน
function tError(code) {
  return translations[currentLang][code] || t("statusError");
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
  });
  document.getElementById("langToggle").textContent =
    currentLang === "th" ? "EN" : "ไทย";
}

function toggleLanguage() {
  currentLang = currentLang === "th" ? "en" : "th";
  localStorage.setItem("packme_lang", currentLang);
  applyTranslations();
}