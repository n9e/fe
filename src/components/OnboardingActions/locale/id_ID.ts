const id_ID = {
  "close": "Tutup",
  "card": {
    "title": "Langkah berikutnya",
    "later": "Anda juga bisa melanjutkannya nanti dari daftar mesin",
    "optional": "Opsional",
    "dismiss": "Jangan tampilkan lagi",
    "rows": {
      "collect": {
        "title": "Konfigurasi pengumpulan",
        "desc": "Metrik dasar sistem operasi sudah dikumpulkan otomatis; basis data dan middleware dikonfigurasi sesuai kebutuhan",
        "action": "Konfigurasikan"
      },
      "pack": {
        "title": "Terapkan dasbor host dan aktifkan alert host",
        "desc": "Impor dasbor dan aturan alert bawaan dengan satu klik",
        "action": "Aktifkan dengan satu klik"
      },
      "notify": {
        "title": "Kaitkan notifikasi",
        "desc": "Cukup tempel webhook bot DingTalk, Feishu, atau WeCom",
        "action": "Buat cepat"
      },
      "test": {
        "title": "Kirim alert uji",
        "desc": "Pastikan alert benar-benar sampai kepada Anda",
        "action": "Kirim"
      }
    }
  },
  "pack": {
    "title": "Aktifkan paket dasar pemantauan host",
    "intro": "Yang akan diimpor dan diaktifkan:",
    "boards": "Dasbor",
    "rules": "Aturan alert",
    "boards_count": "Dasbor × {{count}}",
    "rules_count": "Aturan alert × {{count}}, aktif begitu diimpor",
    "preview": "Pratinjau dan pilih",
    "existing": "(sudah ada)",
    "existing_skipped": "Grup bisnis tujuan sudah punya dasbor dengan nama ini, jadi dilewati",
    "rule_existing_skipped": "Grup bisnis tujuan sudah punya aturan alert dengan nama ini, jadi dilewati dan konfigurasi yang ada tidak ditimpa",
    "already_imported": "Semua dasbor yang dipilih sudah ada di grup bisnis ini; hanya aturan alert yang akan ditambahkan",
    "boards_incomplete": "Tidak ada templat dasbor host bawaan yang cocok; buka \"Pratinjau dan pilih\" lalu pilih sendiri",
    "notify_rules": "Aturan notifikasi",
    "notify_rules_tip": "Tanpa aturan notifikasi yang dikaitkan, alert tetap menghasilkan event tetapi tidak dikirim ke siapa pun",
    "notify_rules_placeholder": "Pilih aturan notifikasi yang sudah ada, atau klik \"Buat cepat\" di atas untuk membuat yang baru",
    "quick_create": "Buat cepat",
    "submit": "Aktifkan dengan satu klik",
    "view_board": "Lihat dasbor host",
    "next_test": "Kirim alert uji",
    "no_notify_warning": "Aturan alert ini belum dikaitkan dengan aturan notifikasi, jadi tidak akan memberi tahu siapa pun saat terpicu",
    "go_bind_notify": "Buka daftar aturan alert dan kaitkan secara massal",
    "component_missing": "Integrasi Linux bawaan tidak ditemukan, jadi tidak bisa diaktifkan dengan satu klik",
    "load_failed": "Gagal membaca templat bawaan",
    "go_components": "Impor manual dari Pusat Integrasi",
    "bad_template": "Gagal mengurai templat bawaan",
    "unknown_error": "Kesalahan tidak dikenal"
  },
  "notify": {
    "bind_hint": "Aturan notifikasi sudah dibuat, tetapi alert host yang aktif belum dikaitkan dengannya, sehingga alert sungguhan tetap tidak memberi tahu siapa pun"
  },
  "test": {
    "title": "Kirim alert uji",
    "rule_label": "Aturan notifikasi mana yang dipakai untuk mengirim",
    "send": "Kirim alert uji",
    "result_title": "Hasil pengiriman",
    "sent": "Media notifikasi telah dipanggil dan mengembalikan hasil berikut",
    "sent_hint": "Periksa di grup atau email apakah pesan uji sudah masuk — hanya dengan begitu jalur notifikasi terbukti berfungsi",
    "no_rule": "Belum ada aturan notifikasi yang dikonfigurasi",
    "go_create_rule": "Buat aturan notifikasi",
    "rule_without_config": "Aturan notifikasi ini belum punya media notifikasi, jadi tidak bisa mengirim",
    "no_channel": "Belum ada media notifikasi yang dipilih",
    "channel_fallback": "Media notifikasi {{index}}",
    "go_check_channel": "Periksa media notifikasi",
    "channel_doc": "Lihat dokumentasi konfigurasi",
    "unknown_error": "Pengiriman gagal: kesalahan tidak dikenal"
  }
};

export default id_ID;
