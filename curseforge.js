// ไฟล์นี้คือ "จุดสลับ" เดียวของทั้งระบบ
// ตอนนี้ยังไม่มี CURSEFORGE_API_KEY -> ใช้ข้อมูลปลอม (mock)
// พอสมัคร key ได้แล้ว ใส่ค่าใน .env -> ระบบจะเรียกของจริงทันทีโดยไม่ต้องแก้ที่อื่นเลย

const CF_BASE = "https://api.curseforge.com/v1";

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
    return { hasServerPack: false, downloadUrl: null };
  }

  const downloadRes = await fetch(
    `${CF_BASE}/mods/${modpackId}/files/${serverPackFileId}/download-url`,
    { headers }
  );
  if (!downloadRes.ok) throw new Error(`curseforge download url failed: ${downloadRes.status}`);
  const downloadData = await downloadRes.json();

  return { hasServerPack: true, downloadUrl: downloadData.data };
}

module.exports = { checkCurseForge };
