const id_ID = {
  "title": "Pengaturan notifikasi",
  "disabled": "Nonaktifkan",
  "webhooks": {
    "help_content": "Callback menghubungkan Nightingale dengan sistem lain. Setiap event alert yang dihasilkan Nightingale dikirim ke tiap URL callback, jadi Anda bisa membuat API HTTP sendiri, mendaftarkannya di sini, menerima event alert Nightingale, lalu menjalankan logika otomatis atau khusus di atasnya. Nightingale memanggilnya dengan metode HTTP POST dan menaruh isi event dalam format JSON di body permintaan; struktur datanya bisa dilihat [di sini](https://github.com/ccfos/nightingale/blob/main/models/alert_cur_event.go#L19). Untuk mencobanya, siapkan sebuah mesin yang terjangkau jaringan Nightingale, misalnya beralamat IP 10.1.2.3, lalu buka sebuah porta dengan nc, misalnya `nc -k -l 4321` agar nc mendengarkan di porta 4321. Daftarkan `http://10.1.2.3:4321` sebagai URL callback, buat satu aturan alert, dan begitu alert terpicu Nightingale akan memanggil alamat itu sehingga format data lengkapnya terlihat pada keluaran perintah nc.",
    "title": "URL callback",
    "enable": "Aktifkan",
    "note": "Catatan",
    "url": "URL",
    "timeout": "Batas waktu (dtk)",
    "basic_auth_user": "Nama pengguna (Basic Auth)",
    "basic_auth_password": "Kata sandi (Basic Auth)",
    "skip_verify": "Lewati verifikasi SSL",
    "add": "Tambah",
    "help": "\n      Bila Anda ingin meneruskan seluruh event alert Nightingale ke platform lain, URL callback global di sini adalah caranya.\n      <br />\n      <br />\n      Umumnya sistem pemantauan berfokus pada pengumpulan, penyimpanan, dan analisis data serta pembuatan event alert, sementara distribusi, pengurangan noise, klaim, eskalasi, penjadwalan jaga, dan kolaborasi atas event ditangani produk tersendiri. Produk semacam itu disebut produk OnCall, dan banyak dipakai perusahaan yang menerapkan prinsip SRE.\n      <br />\n      <br />\n      Produk OnCall biasanya bisa terhubung ke berbagai sistem pemantauan seperti Prometheus, Nightingale, Zabbix, ElastAlert, BlueKing, dan berbagai layanan pemantauan awan. Tiap sistem mengirimkan event alert ke pusat OnCall lewat webhook, lalu distribusi, penyaringan, dan penanganannya diselesaikan di sana.\n      <br />\n      <br />\n      Di kancah internasional, <a1>PagerDuty</a1> adalah pilihan utama, sedangkan di Tiongkok <a2>FlashDuty</a2>; keduanya bisa dicoba gratis setelah mendaftar.\n    "
  },
  "script": {
    "title": "Skrip notifikasi",
    "enable": "Aktifkan",
    "timeout": "Batas waktu (dtk)",
    "type": [
      "Gunakan skrip",
      "Gunakan jalur berkas"
    ],
    "path": "Jalur berkas",
    "content": "Isi skrip"
  },
  "channels": {
    "title": "Media notifikasi",
    "name": "Nama",
    "ident": "Identitas",
    "ident_msg1": "Identitas hanya boleh memuat huruf, angka, garis bawah, dan tanda hubung",
    "ident_msg2": "Identitas sudah dipakai",
    "hide": "Sembunyikan",
    "add": "Tambah",
    "add_title": "Tambah media notifikasi",
    "edit_title": "Ubah media notifikasi",
    "enabled": "Aktifkan"
  },
  "contacts": {
    "title": "Kontak",
    "add_title": "Tambah kontak",
    "edit_title": "Ubah kontak"
  },
  "smtp": {
    "title": "Pengaturan SMTP",
    "testMessage": "Email uji telah dikirim; silakan periksa kotak masuk"
  },
  "ibex": {
    "title": "Konfigurasi pemulihan otomatis"
  }
};

export default id_ID;
