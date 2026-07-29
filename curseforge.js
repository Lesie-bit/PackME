// ไฟล์นี้คือ "จุดสลับ" เดียวของทั้งระบบ
// ตอนนี้ยังไม่มี CURSEFORGE_API_KEY -> ใช้ข้อมูลปลอม (mock)
// พอสมัคร key ได้แล้ว ใส่ค่าใน .env -> ระบบจะเรียกของจริงทันทีโดยไม่ต้องแก้ที่อื่นเลย

const CF_BASE = "https://api.curseforge.com/v1";
const mockMods = require("./mockMods");

// ถ้า input เป็นลิงก์หน้า modpack ของ CurseForge ให้ดึง slug ออกมา
function extractSlugFromUrl(input) {
  const match = input.match(/curseforge\.com\/minecraft\/modpacks\/([a-z0-9-]+)/i);
  return match ? match[1] : null;
}

// ค้นหา modpack จากชื่อ (หรือวาง URL ก็ได้) ใช้เติมช่อง autocomplete บนหน้าเว็บ
async function searchMods(query) {
  const apiKey = process.env.CURSEFORGE_API_KEY;
  const slug = extractSlugFromUrl(query);

  if (!apiKey) {
    const q = (slug || query).toLowerCase();
    return mockMods.filter((m) => m.name.toLowerCase().includes(q));
  }

  // ถ้าเป็น URL -> ค้นหาแบบตรงเป๊ะด้วย slug (แม่นสุด ไม่ปนกับชื่อคล้ายกัน)
  // ถ้าเป็นคำค้นทั่วไป -> ค้นแบบ searchFilter แล้วเรียงตามความนิยมก่อน (sortField=2 = Popularity)
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

async function checkCurseForge(modpackId) {
  const apiKey = process.env.CURSEFORGE_API_KEY;

  if (!apiKey) {
    return mockCheck(modpackId);
  }

  return realCheck(modpackId, apiKey);
}

// ข้อมูลปลอม: id ลงท้ายเลขคู่ = มี server pack แล้ว, เลขคี่ = ต้องสร้างเอง
function mockCheck(modpackId) {
  const hasServerPack = Number(modpackId) % 2 === 0;
  return {
    hasServerPack,
    downloadUrl: hasServerPack
      ? `https://example.com/fake-official/${modpackId}.zip`
      : null,
    // ใช้ตอนไม่มี server pack สำเร็จรูป -> ส่งให้ worker ไปดาวน์โหลด client pack มาแปลง
    clientDownloadUrl: `https://example.com/fake-client/${modpackId}.zip`,
  };
}

// ของจริง: เรียก CurseForge API ตามที่คุยกันไว้ตอนออกแบบระบบ
async function realCheck(modpackId, apiKey) {
  const headers = { "x-api-key": apiKey, Accept: "application/json" };

  const modRes = await fetch(`${CF_BASE}/mods/${modpackId}`, { headers });
  if (!modRes.ok) throw new Error(`curseforge mod lookup failed: ${modRes.status}`);
  const modData = await modRes.json();
  const mainFileId = modData.data.mainFileId;

  const fileRes = await fetch(`${CF_BASE}/mods/${modpackId}/files/${mainFileId}`, { headers });
  if (!fileRes.ok) throw new Error(`curseforge file lookup failed: ${fileRes.status}`);
  const fileData = await fileRes.json();
  const serverPackFileId = fileData.data.serverPackFileId;

  if (!serverPackFileId) {
    // ไม่มี server pack สำเร็จรูป -> ส่ง downloadUrl ของ client pack เองกลับไปด้วย
    return {
      hasServerPack: false,
      downloadUrl: null,
      clientDownloadUrl: fileData.data.downloadUrl,
    };
  }

  const downloadRes = await fetch(
    `${CF_BASE}/mods/${modpackId}/files/${serverPackFileId}/download-url`,
    { headers }
  );
  if (!downloadRes.ok) throw new Error(`curseforge download url failed: ${downloadRes.status}`);
  const downloadData = await downloadRes.json();

  return { hasServerPack: true, downloadUrl: downloadData.data, clientDownloadUrl: null };
}

module.exports = { checkCurseForge, searchMods };