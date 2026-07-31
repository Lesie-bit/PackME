require("dotenv/config");
const crypto = require("crypto");
const express = require("express");
const { checkCurseForge, searchMods, listFiles } = require("./curseforge");
const { createJob, updateJob, getJob } = require("./db");
const { startGeneration } = require("./pipeline");

const app = express();
app.use(express.static("public"));

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

app.get("/api/modpacks/:id/files", async (req, res) => {
  try {
    const files = await listFiles(req.params.id);
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "โหลดรายการเวอร์ชันไม่สำเร็จ" });
  }
});

app.get("/api/modpacks/:id/server-pack", async (req, res) => {
  const modpackId = req.params.id;
  const fileId = req.query.fileId || null;

  try {
    const info = await checkCurseForge(modpackId, fileId);

    if (info.hasServerPack) {
      return res.json({ type: "official", downloadUrl: info.downloadUrl });
    }

    if (!info.clientDownloadUrl) {
      return res.status(502).json({ error: "ไม่พบลิงก์ดาวน์โหลด modpack จาก CurseForge" });
    }

    const jobId = crypto.randomUUID();
    await createJob(jobId, modpackId);
    await startGeneration(jobId, modpackId, info.clientDownloadUrl);

    return res.json({ type: "generating", jobId });
  } catch (err) {
    console.error(err);
    if (err.code === "DISTRIBUTION_DISABLED") {
      return res.status(403).json({
        error: "modpack นี้ไม่อนุญาตให้เข้าถึงผ่าน third-party API (เจ้าของปิดสิทธิ์นี้ไว้)",
      });
    }
    return res.status(502).json({ error: "ตรวจสอบข้อมูล modpack ไม่สำเร็จ" });
  }
});

app.get("/api/jobs/:jobId", async (req, res) => {
  const job = await getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: "ไม่พบ job นี้" });
  res.json({ status: job.status, resultUrl: job.result_url });
});

app.post("/api/jobs/:jobId/complete", express.json(), async (req, res) => {
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${process.env.PACKME_WORKER_SECRET}`) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    await updateJob(req.params.jobId, "done", req.body.resultUrl);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "อัปเดตสถานะ job ไม่สำเร็จ" });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`PackME running at http://localhost:${port}`);
});