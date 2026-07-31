# PackME

🇹🇭 [ภาษาไทย](#ภาษาไทย) | 🇬🇧 [English](#english)

---

## ภาษาไทย

หา หรือสร้าง server pack ให้ modpack จาก CurseForge โดยอัตโนมัติ

🔗 **Live demo:** https://packme-x3j7.onrender.com

### ฟีเจอร์

- ค้นหา modpack แบบพิมพ์ชื่อ หรือวางลิงก์ CurseForge ได้เลย
- เลือกได้ทุกเวอร์ชันของ modpack ไม่ใช่แค่เวอร์ชันล่าสุด
- ถ้า modpack มี server pack สำเร็จรูปอยู่แล้ว → ลิงก์ตรงไปที่ CurseForge ทันที
- ถ้าไม่มี → สร้างให้อัตโนมัติผ่าน GitHub Actions แล้วแจกผ่าน GitHub Releases
- รองรับ 2 ภาษา (ไทย/อังกฤษ)

### วิธีทำงาน
ผู้ใช้ค้นหา modpack → เช็คผ่าน CurseForge API
├─ มี server pack แล้ว → ลิงก์ตรงไปที่ CurseForge
└─ ไม่มี → GitHub Actions รัน mcpacker แปลง client pack
เป็น server pack → อัปโหลดเป็น GitHub Release
→ แจ้งกลับมาอัปเดตสถานะ
### Tech stack

- **Backend:** Node.js + Express
- **Database:** Supabase (Postgres)
- **Server pack generation:** [mcpacker](https://github.com/littlepenguin66/mcpacker) รันบน GitHub Actions
- **File hosting:** GitHub Releases
- **Deploy:** Render

### รันในเครื่อง

```bash
npm install
cp .env.example .env   # แล้วใส่ค่าจริงตามด้านล่าง
npm start
```

เปิด http://localhost:4000

### ตัวแปรที่ต้องตั้งค่า (`.env`)

| ตัวแปร | ใช้ทำอะไร |
|---|---|
| `CURSEFORGE_API_KEY` | เรียก CurseForge API (สมัครที่ console.curseforge.com) |
| `SUPABASE_URL` / `SUPABASE_KEY` | เก็บสถานะ job |
| `GITHUB_TOKEN` | สั่งงาน GitHub Actions worker |
| `GITHUB_REPO` | เช่น `username/PackME` |
| `PACKME_WORKER_SECRET` | รหัสลับยืนยันระหว่าง backend กับ worker |

ถ้าไม่ตั้งค่า `CURSEFORGE_API_KEY`/`GITHUB_TOKEN` ระบบจะใช้ข้อมูลปลอม (mock) แทนอัตโนมัติ เหมาะกับตอน dev

### ข้อจำกัดที่รู้อยู่แล้ว

- Modpack ขนาดใหญ่มาก (เช่น Stoneblock 4) อาจสร้างไม่สำเร็จหรือรันไม่ได้ เพราะข้อจำกัดทรัพยากรของ GitHub Actions runner
- ถ้ามี mod ตัวใดตัวหนึ่งในรายการดาวน์โหลดไม่สำเร็จ (ไฟล์ถูกลบ/เจ้าของปิดสิทธิ์ third-party) จะทำให้สร้าง server pack ทั้งชุดไม่สำเร็จ
- Server pack ที่สร้างเองเก็บไว้ที่ GitHub Releases ชั่วคราว (ลบอัตโนมัติหลัง 30 วัน)

### สนับสนุนโปรเจกต์

ถ้า PackME มีประโยชน์ สนับสนุนค่า hosting ได้ที่ [Ko-fi](https://ko-fi.com/ใส่ชื่อคุณ) — ไม่มีการซื้อ/ขายฟีเจอร์ใดๆ เป็นการสนับสนุนแบบสมัครใจล้วนๆ

### License

โค้ดในโปรเจกต์นี้ใช้ AGPL 3.0 (ดู `LICENSE`) — ดู `NOTICE.md` สำหรับเครดิตของ dependency ภายนอก

---

## English

Find or automatically generate a server pack for any CurseForge modpack.

🔗 **Live demo:** (https://packme-x3j7.onrender.com)

### Features

- Search modpacks by name, or paste a CurseForge link directly
- Choose from any version of a modpack, not just the latest
- If the modpack already has an official server pack, link straight to it on CurseForge
- If not, one is generated automatically via GitHub Actions and distributed through GitHub Releases
- Bilingual interface (Thai/English)

### How it works
User searches for a modpack → checked via the CurseForge API
├─ Official server pack exists → link straight to CurseForge
└─ None exists → GitHub Actions runs mcpacker to convert the
client pack into a server pack → uploads it
as a GitHub Release → notifies the backend
### Tech stack

- **Backend:** Node.js + Express
- **Database:** Supabase (Postgres)
- **Server pack generation:** [mcpacker](https://github.com/littlepenguin66/mcpacker), run on GitHub Actions
- **File hosting:** GitHub Releases
- **Deploy:** Render

### Running locally

```bash
npm install
cp .env.example .env   # fill in real values, see below
npm start
```

Open http://localhost:4000

### Environment variables (`.env`)

| Variable | Purpose |
|---|---|
| `CURSEFORGE_API_KEY` | Calls the CurseForge API (get one at console.curseforge.com) |
| `SUPABASE_URL` / `SUPABASE_KEY` | Stores job status |
| `GITHUB_TOKEN` | Triggers the GitHub Actions worker |
| `GITHUB_REPO` | e.g. `username/PackME` |
| `PACKME_WORKER_SECRET` | Shared secret between backend and worker |

If `CURSEFORGE_API_KEY`/`GITHUB_TOKEN` are not set, the app automatically falls back to mock data — useful for local development.

### Known limitations

- Very large modpacks (e.g. Stoneblock 4) may fail to generate or fail to run, due to GitHub Actions runner resource limits
- If any single mod fails to download (file removed, or the owner disabled third-party access), the entire server pack generation fails
- Self-generated server packs are hosted temporarily on GitHub Releases (auto-deleted after 30 days)

### Support this project

If PackME has been useful to you, you can support hosting costs on [Ko-fi](https://ko-fi.com/your-name) — this is a purely voluntary contribution, no features are sold or gated.

### License

Code in this repository is AGPL 3.0 licensed (see `LICENSE`) — see `NOTICE.md` for third-party dependency credits.
