const fs = require("fs");
const path = require("path");

// เก็บข้อมูลเป็นไฟล์ JSON ธรรมดา ไม่ต้องติดตั้ง database engine แยก
// ข้อดี: ไม่มี native module ให้ compile พัง ใช้งานได้ทุกเครื่องทันที
// ข้อจำกัด: เหมาะกับข้อมูลจำนวนไม่เยอะ ถ้าจะรองรับผู้ใช้เยอะจริงจัง ค่อยย้ายไป Postgres ทีหลัง
const DB_FILE = path.join(__dirname, "packme.db.json");

function readAll() {
  if (!fs.existsSync(DB_FILE)) return { jobs: {} };
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function writeAll(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function createJob(id, modpackId) {
  const data = readAll();
  data.jobs[id] = {
    modpackId,
    status: "processing",
    resultUrl: null,
    createdAt: new Date().toISOString(),
  };
  writeAll(data);
}

function updateJob(id, status, resultUrl) {
  const data = readAll();
  if (!data.jobs[id]) return;
  data.jobs[id].status = status;
  data.jobs[id].resultUrl = resultUrl;
  writeAll(data);
}

function getJob(id) {
  const data = readAll();
  const job = data.jobs[id];
  if (!job) return null;
  return { status: job.status, result_url: job.resultUrl };
}

module.exports = { createJob, updateJob, getJob };
