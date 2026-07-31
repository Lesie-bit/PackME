// ไฟล์นี้คือ "จุดสลับ" เดียวของทั้งระบบ
// ตอนนี้ยังไม่มี CURSEFORGE_API_KEY -> ใช้ข้อมูลปลอม (mock)
// พอสมัคร key ได้แล้ว ใส่ค่าใน .env -> ระบบจะเรียกของจริงทันทีโดยไม่ต้องแก้ที่อื่นเลย

const CF_BASE = "https://api.curseforge.com/v1";
const mockMods = require("./mockMods");

function extractSlugFromUrl(input) {
  const match = input.match(/curseforge\.com\/minecraft\/modpacks\/([a-z0-9-]+)/i);
  return match ? match[1] : null;
}

async function searchMods(query) {
  const apiKey = process.env.CURSEFORGE_API_KEY;
  const slug = extractSlugFromUrl(query);

  if (!apiKey) {
    const q = (slug || query).toLowerCase();
    return mockMods.filter((m) => m.name.toLowerCase().includes(q));
  }

  const url = slug
    ? `${CF_BASE}/mods/search?gameId=432&classId=4471&slug=${encodeURIComponent(slug)}`
    : `${CF_BASE}/mods/search?gameId=432&classId=4471&searchFilter=${encodeURIComponent(
        query
      )}&sortField=2&sortOrder=desc&pageSize=10`;

  const res = await fetch(url, {
    headers: { "x-api-key": apiKey, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`curseforge search failed: ${res.status}`);
  const data = await res.json();
  return data.data.map((m) => ({ id: String(m.id), name: m.name }));
}

// ดึงรายชื่อทุกเวอร์ชันของ modpack มาให้ผู้ใช้เลือก
async function listFiles(modpackId) {
  const apiKey = process.env.CURSEFORGE_API_KEY;

  if (!apiKey) {
    return [
      { id: modpackId + "01", displayName: "เวอร์ชันล่าสุด (ปลอม)", gameVersion: "1.20.1", hasServerPack: false },
      { id: modpackId + "02", displayName: "เวอร์ชันก่อนหน้า (ปลอม)", gameVersion: "1.19.2", hasServerPack: true },
    ];
  }

  const headers = { "x-api-key": apiKey, Accept: "application/json" };
  const res = await fetch(`${CF_BASE}/mods/${modpackId}/files?pageSize=20`, { headers });
  if (!res.ok) throw new Error(`curseforge file list failed: ${res.status}`);
  const data = await res.json();
  return data.data.map((f) => ({
    id: String(f.id),
    displayName: f.displayName,
    gameVersion: (f.gameVersions && f.gameVersions[0]) || "",
    hasServerPack: !!f.serverPackFileId,
  }));
}

async function checkCurseForge(modpackId, fileId) {
  const apiKey = process.env.CURSEFORGE_API_KEY;
  if (!apiKey) return mockCheck(modpackId, fileId);
  return realCheck(modpackId, apiKey, fileId);
}

function mockCheck(modpackId, fileId) {
  const targetId = String(fileId || modpackId);
  const hasServerPack = Number(targetId.slice(-1)) % 2 === 0;
  return {
    hasServerPack,
    downloadUrl: hasServerPack ? `https://example.com/fake-official/${targetId}.zip` : null,
    clientDownloadUrl: `https://example.com/fake-client/${targetId}.zip`,
  };
}

async function realCheck(modpackId, apiKey, overrideFileId) {
  const headers = { "x-api-key": apiKey, Accept: "application/json" };
  let mainFileId = overrideFileId;

  if (!mainFileId) {
    const modRes = await fetch(`${CF_BASE}/mods/${modpackId}`, { headers });
    if (!modRes.ok) throw new Error(`curseforge mod lookup failed: ${modRes.status}`);
    const modData = await modRes.json();
    mainFileId = modData.data.mainFileId;
  }

  const fileRes = await fetch(`${CF_BASE}/mods/${modpackId}/files/${mainFileId}`, { headers });
  if (!fileRes.ok) throw new Error(`curseforge file lookup failed: ${fileRes.status}`);
  const fileData = await fileRes.json();
  const serverPackFileId = fileData.data.serverPackFileId;

  if (!serverPackFileId) {
    const clientDownloadRes = await fetch(
      `${CF_BASE}/mods/${modpackId}/files/${mainFileId}/download-url`,
      { headers }
    );
    if (clientDownloadRes.status === 403) {
      const err = new Error("DISTRIBUTION_DISABLED");
      err.code = "DISTRIBUTION_DISABLED";
      throw err;
    }
    if (!clientDownloadRes.ok) {
      throw new Error(`curseforge client download url failed: ${clientDownloadRes.status}`);
    }
    const clientDownloadData = await clientDownloadRes.json();
    return { hasServerPack: false, downloadUrl: null, clientDownloadUrl: clientDownloadData.data };
  }

  const downloadRes = await fetch(
    `${CF_BASE}/mods/${modpackId}/files/${serverPackFileId}/download-url`,
    { headers }
  );
  if (downloadRes.status === 403) {
    const err = new Error("DISTRIBUTION_DISABLED");
    err.code = "DISTRIBUTION_DISABLED";
    throw err;
  }
  if (!downloadRes.ok) throw new Error(`curseforge download url failed: ${downloadRes.status}`);
  const downloadData = await downloadRes.json();
  return { hasServerPack: true, downloadUrl: downloadData.data, clientDownloadUrl: null };
}

module.exports = { checkCurseForge, searchMods, listFiles };