const btn = document.getElementById("checkBtn");
const input = document.getElementById("modpackInput");
const result = document.getElementById("result");

btn.addEventListener("click", async () => {
  const modpackId = input.value.trim();
  if (!modpackId) return;

  btn.disabled = true;
  result.textContent = "กำลังเช็ค...";

  try {
    const res = await fetch(`/api/modpacks/${modpackId}/server-pack`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");

    if (data.type === "official") {
      showLink(data.downloadUrl, "มี server pack สำเร็จรูปอยู่แล้ว");
    } else if (data.type === "generating") {
      result.textContent = "ไม่มี server pack สำเร็จรูป กำลังสร้างให้...";
      pollJob(data.jobId);
    }
  } catch (err) {
    result.textContent = `ผิดพลาด: ${err.message}`;
    btn.disabled = false;
  }
});

// เรียกซ้ำทุก 2 วินาที จนกว่า job จะเสร็จ (นี่คือเทคนิค "polling")
function pollJob(jobId) {
  const interval = setInterval(async () => {
    const res = await fetch(`/api/jobs/${jobId}`);
    const job = await res.json();

    if (job.status === "done") {
      clearInterval(interval);
      showLink(job.resultUrl, "สร้าง server pack เสร็จแล้ว");
    } else if (job.status === "failed") {
      clearInterval(interval);
      result.textContent = "สร้าง server pack ไม่สำเร็จ";
      btn.disabled = false;
    }
    // ถ้ายัง processing อยู่ ก็ปล่อยให้ interval มันเรียกซ้ำต่อไป
  }, 2000);
}

function showLink(url, label) {
  result.innerHTML = `${label}: <a href="${url}" target="_blank">${url}</a>`;
  btn.disabled = false;
}
