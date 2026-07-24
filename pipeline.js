require("dotenv/config");
const { updateJob } = require("./db");

// จุดสลับเดียว: ไม่มี GITHUB_TOKEN -> จำลองงาน, มี -> สั่ง GitHub Actions จริง
async function startGeneration(jobId, modpackId, downloadUrl) {
  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    // จำลองว่างานใช้เวลา 5 วินาที (เหมือนเดิม)
    setTimeout(() => {
      updateJob(jobId, "done", `https://example.com/generated/${modpackId}.zip`);
    }, 5000);
    return;
  }

  // ของจริง: สั่ง GitHub Actions ให้เริ่มรัน workflow generate-server-pack.yml
  const res = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/dispatches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event_type: "generate-server-pack",
      client_payload: {
        job_id: jobId,
        modpack_id: modpackId,
        download_url: downloadUrl,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`สั่งงาน GitHub Actions ไม่สำเร็จ: ${res.status}`);
  }
}

module.exports = { startGeneration };