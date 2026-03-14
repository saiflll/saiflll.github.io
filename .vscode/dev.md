📘 Rekap Panduan — Sistem Portfolio
🏷️ Kategori → Tab

category
Tab Engineering	Tab Development	Index
hardware	✅	❌	✅
logic	❌	✅	✅
support	❌	✅	✅
✏️ Cara Set Kategori (Pilih salah satu)
A. Edit langsung 

repos_data.json
 (paling pasti):

json
{ "name": "RepoKamu", "category": "hardware" }
B. Otomatis via description di GitHub — script mendeteksi keyword:

hardware → esp32, stm, firmware, plc, c++, modbus, pcb...
support → dashboard, monitor, web, admin, management...
logic → default jika tidak masuk dua di atas
🖼️ Gambar Otomatis Terdeteksi
Di repo GitHub kamu, buat folder img/ dan upload screenshot:

NamaRepo/
  └── img/
        └── preview.jpg   ← akan otomatis terdeteksi
Format didukung: .jpg .jpeg .png .webp .gif

Setelah jalankan python update_repos.py, field img akan terisi URL raw GitHub-nya.

🔒 Manual Override Aman
Apapun yang sudah kamu edit manual di 

repos_data.json
 tidak akan ditimpa script — kecuali nilainya masih kosong/default.