require("dotenv/config");
const express = require("express");
const { checkCurseForge } = require("./curseforge");

const app = express();
app.use(express.static("public"));

// เก็บสถานะ job ไว้ในตัวแปรธรรมดา (in-memory)
// ข้อเสีย: ถ้า restart server ข้อมูลหายหมด แต่พอสำหรับตอนนี้
// ทีหลังถ้าจะ deploy จริงจัง ค่อยย้ายไป database (เช่น SQLite/Postgres)
const jobs = {};
let jobCounter = 1;

// endpoint หลัก: เช็คว่า modpack นี้มี server pack สำเร็จรูปหรือไม่
app.get("/api/modpacks/:id/server-pack", async (req, res) => {
  const modpackId = req.params.id;

  try {
    const info = await checkCurseForge(modpackId);

    if (info.hasServerPack) {
      // กรณีมีอยู่แล้ว -> ส่งลิงก์กลับตรงๆ ไม่ต้องสร้าง job
      return res.json({ type: "official", downloadUrl: info.downloadUrl });
    }

    // กรณีไม่มี -> สร้าง job แล้วเริ่ม "ปลอมการสร้าง" เบื้องหลัง
    const jobId = String(jobCounter++);
    jobs[jobId] = { status: "processing", resultUrl: null };

    // จำลองว่างานใช้เวลา 5 วินาที (ของจริงตรงนี้จะเป็นการเรียก ServerPackCreator)
    setTimeout(() => {
      jobs[jobId] = {
        status: "done",
        resultUrl: `https://example.com/generated/${modpackId}.zip`,
      };
    }, 5000);

    return res.json({ type: "generating", jobId });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: "ตรวจสอบข้อมูล modpack ไม่สำเร็จ" });
  }
});

// endpoint ให้ frontend เรียกวนซ้ำ (polling) เพื่อเช็คว่า job เสร็จหรือยัง
app.get("/api/jobs/:jobId", (req, res) => {
  const job = jobs[req.params.jobId];
  if (!job) return res.status(404).json({ error: "ไม่พบ job นี้" });
  res.json(job);
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`PackME running at http://localhost:${port}`);
});
