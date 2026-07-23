const translations = {
  th: {
    title: "PackME",
    tagline: "หา หรือสร้าง server pack ให้ modpack จาก CurseForge",
    searchPlaceholder: "พิมพ์ชื่อ modpack เช่น RLCraft",
    checkBtn: "เช็ค",
    noResults: "ไม่พบ modpack ที่ตรงกับคำค้นหา",
    statusChecking: "กำลังเช็ค...",
    statusOfficial: "มี server pack สำเร็จรูปอยู่แล้ว",
    statusGenerating: "ไม่มี server pack สำเร็จรูป กำลังสร้างให้...",
    statusDone: "สร้าง server pack เสร็จแล้ว",
    statusFailed: "สร้าง server pack ไม่สำเร็จ",
    statusError: "เกิดข้อผิดพลาด",
    selectFirst: "เลือก modpack จากรายการก่อน",
  },
  en: {
    title: "PackME",
    tagline: "Find or generate a server pack for any CurseForge modpack",
    searchPlaceholder: "Type a modpack name, e.g. RLCraft",
    checkBtn: "Check",
    noResults: "No modpacks match your search",
    statusChecking: "Checking...",
    statusOfficial: "An official server pack is available",
    statusGenerating: "No official server pack — generating one for you...",
    statusDone: "Server pack generation complete",
    statusFailed: "Server pack generation failed",
    statusError: "Something went wrong",
    selectFirst: "Please select a modpack from the list first",
  },
};

let currentLang = localStorage.getItem("packme_lang") || "th";

function t(key) {
  return translations[currentLang][key] || key;
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
