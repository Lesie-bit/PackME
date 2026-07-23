# PackME

หา หรือสร้าง server pack ให้ modpack จาก CurseForge โดยอัตโนมัติ

- ถ้า modpack มี server pack สำเร็จรูปอยู่แล้ว → ส่งลิงก์ดาวน์โหลดกลับทันที
- ถ้าไม่มี → ระบบสร้างงานคิว แล้วแจ้งสถานะจนกว่าจะเสร็จ

## สถานะปัจจุบัน

ระบบทำงานครบทุกส่วนแล้ว **ยกเว้นจุดเดียว**: ยังไม่มี CurseForge API key จริง
ตอนนี้ใช้ข้อมูลปลอม (mock) แทนอยู่ในไฟล์ `curseforge.js` — ดู mock data ได้จาก
logic ง่ายๆ: modpack ID ลงท้ายเลขคู่ = มี server pack แล้ว, เลขคี่ = ต้องสร้างเอง (จำลอง 5 วิ)

พอได้ API key จริง แค่ใส่ค่าใน `.env` → ระบบจะสลับไปเรียกของจริงเองอัตโนมัติ
โดยไม่ต้องแก้โค้ดที่อื่นเลย (ดูฟังก์ชัน `realCheck` ใน `curseforge.js`)

## โครงสร้างไฟล์

```
PackME/
├── server.js        เซิร์ฟเวอร์หลัก (Express) มี endpoint และ in-memory job tracking
├── curseforge.js     จุดสลับ mock <-> ของจริง (CurseForge API)
├── public/
│   ├── index.html    หน้าเว็บ
│   ├── style.css      สไตล์
│   └── script.js       เรียก API + polling สถานะ job
├── .env.example       template ตัวแปรลับ
└── .gitignore          กัน node_modules และ .env หลุดขึ้น GitHub
```

## วิธีรัน

```
npm install
npm start
```

เปิด http://localhost:4000 แล้วลองใส่ modpack ID (เลขคู่/คี่ ดูผลต่างกัน)

## ขั้นต่อไป (เมื่อได้ CurseForge API key)

1. สมัคร key ที่ https://console.curseforge.com
2. คัดลอก `.env.example` เป็น `.env` แล้วใส่ค่า `CURSEFORGE_API_KEY`
3. รันใหม่ — ระบบจะเรียกข้อมูลจริงแทน mock ทันที

## ข้อจำกัดที่รู้อยู่แล้ว (ต่อยอดได้ในอนาคต)

- สถานะ job เก็บใน memory เฉยๆ — restart server แล้วข้อมูลหาย (พอ deploy จริงจัง ค่อยย้ายไป database)
- ยังไม่ได้ต่อ ServerPackCreator จริงสำหรับสร้าง server pack เมื่อไม่มีไฟล์สำเร็จรูป (ตอนนี้ปลอม resultUrl ไว้)
