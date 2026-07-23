require("dotenv/config");
const express = require("express");
const { checkCurseForge, searchMods } = require("./curseforge");
const { createJob, updateJob, getJob } = require("./db");

const app = express();
app.use(express.static("public"));

let jobCounter = 1;

// endpoint ค้นหา modpack เอาไว้เติม dropdown แบบพิมพ์ชื่อ
app.get("/api/modpacks/search", async (req, res) => {
  const query = req.query.q || "";
  if (query.length < 2) return res.json([]);

  try {
    const results = await searchMods(query);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "ค้นหาไม่สำเร็จ" });
  }
});

// endpoint หลัก: เช็คว่า modpack นี้มี server pack สำเร็จรูปหรือไม่
app.get("/api/modpacks/:id/server-pack", async (req, res) => {
  const modpackId = req.params.id;

  try {
    const info = await checkCurseForge(modpackId);

    if (info.hasServerPack) {
      return res.json({ type: "official", downloadUrl: info.downloadUrl });
    }

const jobId = String(jobCounter++);
    await createJob(jobId, modpackId);

    setTimeout(async () => {
      await updateJob(jobId, "done", `https://example.com/generated/${modpackId}.zip`);
    }, 5000);

    return res.json({ type: "generating", jobId });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: "ตรวจสอบข้อมูล modpack ไม่สำเร็จ" });
  }
});

// endpoint ให้ frontend เรียกวนซ้ำ (polling) เพื่อเช็คว่า job เสร็จหรือยัง
app.get("/api/jobs/:jobId", async (req, res) => {
  const job = await getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: "ไม่พบ job นี้" });
  res.json({ status: job.status, resultUrl: job.result_url });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`PackME running at http://localhost:${port}`);
});
