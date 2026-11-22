# Screenshot Annotator — Chrome Extension (Manifest V3)

> **Screenshot Annotator** adalah ekstensi browser Chrome modern berbasis Manifest V3 untuk mengambil screenshot halaman website, memberikan anotasi visual, blur informasi sensitif, dan mengekspor hasilnya langsung tanpa memerlukan aplikasi pengeditan eksternal.

---

## 🚀 Fitur Utama

### 1. Mode Tangkapan Layar (Capture Modes)
- **Visible Area**: Mengambil screenshot viewport website yang sedang aktif secara instan menggunakan `chrome.tabs.captureVisibleTab`.
- **Full Page Screenshot**: Otomatis menggulir (scroll) seluruh halaman web, mengambil setiap bagian, dan menyatukannya (*stitch*) menjadi satu gambar penuh.
- **Selected Area**: Overlay seleksi area interaktif dengan mouse drag, ukuran piksel live (*real-time dimensions*), serta tombol cancel/capture.

### 2. Annotation & Feedback Tools
- **Select / Move (V)**: Memilih objek anotasi, memindahkan posisi (*drag & drop*), duplikasi (*duplicate*), atau menghapus (*delete*).
- **Arrow Tool (A)**: Membuat panah penunjuk feedback yang presisi dengan kepala panah dinamis.
- **Rectangle Tool (R)**: Kotak penanda area atau highlight komponen.
- **Circle Tool (C)**: Lingkaran/elips untuk fokus area tertentu.
- **Pen / Freehand (P)**: Menggambar bebas secara halus (*smooth vector points*).
- **Text Annotation (T)**: Menambahkan teks catatan feedback langsung di atas screenshot dengan pengaturan ukuran font.
- **Highlight Tool (H)**: Marker transparan untuk menandai paragraf atau teks website.
- **Privacy Blur (B)**: Pixelation / blur filter manual untuk menyamarkan data sensitif seperti email, nomor telepon, atau data pribadi.
- **Numbered Marker (M)**: Penanda angka urutan (1, 2, 3...) otomatis bertambah untuk feedback langkah perbaikan bertahap.

### 3. Editing Controls & Storage
- **Undo / Redo**: History stack state management lengkap (`Ctrl+Z`, `Ctrl+Y`).
- **IndexedDB Local Storage**: Semua project, tangkapan screenshot, dan layer anotasi tersimpan secara aman di browser lokal pengguna (tidak ada pengiriman ke server eksternal / 100% offline & privat).
- **Autosave**: Perubahan langsung tersimpan otomatis.
- **Zoom & Viewport**: Zoom In, Zoom Out, dan Fit to Screen.

### 4. Ekspor & Berbagi (Export & Sharing)
- **Export PNG & JPG**: Menggabungkan screenshot dan semua anotasi ke gambar beresolusi tinggi.
- **Copy to Clipboard**: Satu klik menyalin hasil gambar ke clipboard untuk langsung di-paste ke Slack, WhatsApp, Jira, Discord, dll.
- **Export JSON**: Menyimpan metadata proyek & anotasi untuk backup atau restore.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Build Tool**: Vite 8
- **Styling**: Tailwind CSS
- **Icons**: Lucide Icons
- **Storage**: IndexedDB API
- **Rendering Engine**: HTML5 Canvas 2D API
- **Extension Architecture**: Chrome Extension Manifest V3 (Service Worker, Content Script, Popup, Editor Tab)

---

## 📂 Struktur Folder

```
screenshot-annotator/
├── dist/                          # Hasil build produksi (dimuat ke Chrome)
├── public/
│   ├── icons/                     # Icon ekstensi (16, 48, 128)
│   └── manifest.json              # Chrome Manifest V3
├── src/
│   ├── background/
│   │   └── service-worker.ts      # Service worker untuk tab capture & orchestrator
│   ├── content/
│   │   ├── full-page-capture.ts   # Script scroll & hitung viewport
│   │   └── selection-overlay.ts   # Overlay selection interactive
│   ├── editor/
│   │   ├── canvas/
│   │   │   └── renderers.ts       # Canvas renderer untuk semua tools & pixelate blur
│   │   ├── components/
│   │   │   ├── EditorApp.tsx      # Main state container, history & export
│   │   │   ├── LeftToolbar.tsx    # Palette tool selector
│   │   │   ├── PropertiesPanel.tsx# Color, stroke, text & opacity controls
│   │   │   ├── TopNavbar.tsx      # Project rename, undo/redo, zoom, export
│   │   │   └── WorkspaceCanvas.tsx# Canvas layer & mouse interaction
│   │   └── index.tsx
│   ├── popup/
│   │   ├── components/
│   │   │   └── PopupApp.tsx       # Popup extension & riwayat recent projects
│   │   └── index.tsx
│   ├── shared/
│   │   └── types/                 # Interface & TypeScript types
│   ├── storage/
│   │   └── indexed-db.ts          # IndexedDB wrapper untuk simpan project
│   └── index.css                  # Tailwind styles
├── editor.html                    # Halaman editor anotasi
├── popup.html                     # Halaman popup ekstensi
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 📦 Cara Membangun Proyek (Build)

1. Pastikan Anda memiliki Node.js (v18+ / v20+ / v24+).
2. Masuk ke folder proyek:
   ```bash
   cd /home/fiqtor/AppDevelopment/screenshot-annotator
   ```
3. Install dependensi (jika belum):
   ```bash
   npm install
   ```
4. Jalankan perintah build:
   ```bash
   npm run build
   ```
5. Hasil build yang siap digunakan browser akan berada di folder **`dist/`**.

---

## 🌐 Cara Memasang Ekstensi di Google Chrome (Developer Mode)

1. Buka browser **Google Chrome**.
2. Masuk ke halaman ekstensi dengan mengetikkan:
   ```
   chrome://extensions/
   ```
   di bilah alamat (URL bar) lalu tekan Enter.
3. Aktifkan **Developer mode** melalui sakelar (toggle switch) di pojok kanan atas.
4. Klik tombol **Load unpacked** (Muat yang belum dibongkar) di pojok kiri atas.
5. Arahkan dan pilih folder:
   ```
   /home/fiqtor/AppDevelopment/screenshot-annotator/dist
   ```
6. Ekstensi **Screenshot Annotator** akan langsung aktif dan muncul di daftar ekstensi Chrome Anda!
7. Klik ikon *Pin* di samping nama Screenshot Annotator pada toolbar browser agar mudah diakses.

---

## ⌨️ Shortcut Keyboard di Editor

| Shortcut | Aksi |
|---|---|
| `V` | Select / Move Tool |
| `A` | Arrow Tool |
| `R` | Rectangle Tool |
| `C` | Circle Tool |
| `P` | Pen / Freehand Tool |
| `T` | Text Tool |
| `H` | Highlight Tool |
| `B` | Privacy Blur Tool |
| `M` | Numbered Marker Tool |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Redo |
| `Delete` / `Backspace` | Hapus objek anotasi yang dipilih |
| `Ctrl + D` | Duplikasi objek anotasi |

