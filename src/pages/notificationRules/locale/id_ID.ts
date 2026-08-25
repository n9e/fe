const id_ID = {
  "title": "Aturan notifikasi",
  "empty_guide": {
    "title": "Belum ada aturan notifikasi",
    "desc": "Aturan notifikasi menentukan kepada siapa alert dikirim dan lewat media apa. Tanpa aturan, event alert tidak benar-benar sampai ke kanal seperti DingTalk atau email.",
    "config_channel": "Konfigurasikan media notifikasi dulu"
  },
  "rule_select": {
    "label": "Aturan notifikasi",
    "select": "Pilih aturan notifikasi",
    "create": "Aturan notifikasi baru",
    "view": "Lihat",
    "manage": "Manajemen aturan notifikasi",
    "total": "Total {{total}}",
    "footer_total": "Total {{total}} aturan",
    "quick_create": {
      "action": "Buat cepat",
      "title": "Buat aturan notifikasi dengan cepat",
      "hint": "Tempelkan URL webhook bot pesan instan atau URL integrasi Flashduty yang memuat integration_key. Sistem mengenali sendiri apakah itu DingTalk, WeCom, kartu Feishu, kartu Lark, atau Flashduty, lalu memakai ulang aturan yang sudah ada atau membuat yang baru.",
      "url_label": "URL webhook atau integrasi",
      "url_placeholder": "Misalnya: https://oapi.dingtalk.com/robot/send?access_token=xxx\natau: https://api.flashcat.cloud/event/push/alert/n9e?integration_key=xxx",
      "url_required": "Tempelkan URL webhook atau URL integrasi Flashduty",
      "name_label": "Nama aturan notifikasi",
      "name_placeholder": "Dibuat otomatis setelah webhook ditempelkan, dan boleh diubah",
      "name_required": "Masukkan nama aturan notifikasi",
      "user_group_required": "Pilih tim yang diberi izin",
      "user_group_placeholder": "Pilih tim yang diberi izin",
      "detected": "Dikenali sebagai {{channel}} (berakhiran {{suffix}})",
      "invalid_url": "Format URL tidak benar",
      "missing_param": "URL tidak memuat {{key}}",
      "unrecognized": "Jenisnya tidak dikenali; yang didukung adalah DingTalk, WeCom, kartu Feishu, kartu Lark, dan Flashduty",
      "reused_rule": "Sudah ada aturan notifikasi dengan token yang sama, dan aturan itu dipilih otomatis",
      "created": "Aturan notifikasi dibuat dan dipilih",
      "create_channel_no_perm": "Media notifikasi {{channel}} belum ada dan kamu tidak punya izin membuatnya. Minta administrator membuatnya lebih dulu",
      "create_channel_failed": "Gagal membuat media notifikasi: {{channel}}",
      "create_rule_failed": "Gagal membuat aturan notifikasi",
      "channel_description": "Dibuat otomatis lewat Buat dengan cepat",
      "rule_description": "Dibuat lewat Buat dengan cepat berdasarkan URL webhook",
      "submit": "Buat"
    }
  },
  "basic_configuration": "Konfigurasi dasar",
  "basic_configuration_desc": "Nama aturan notifikasi, tim yang diberi izin, dan catatannya",
  "name_auto_tip": "Nama dibuat otomatis setelah media notifikasi dan tim penerima dipilih, dan boleh diubah kapan saja",
  "name_auto_separator": "、",
  "add_note_btn": "Tambah catatan",
  "user_group_ids": "Tim yang diberi izin",
  "user_group_ids_tip": "Anggota tim yang diisikan di sini berwenang mengelola atau melihat aturan notifikasi ini",
  "enabled_tip": "Menentukan apakah aturan notifikasi ini aktif",
  "note_tip": "Tempat menambahkan detail atau keterangan aturan notifikasi ini agar mudah dirawat kelak",
  "notification_configuration": {
    "title": "Konfigurasi notifikasi",
    "section_desc": "Menentukan kepada siapa alert dikirim dan lewat media apa: pilih media notifikasi, templat pesan, dan penerimanya; beberapa entri bisa ditambahkan",
    "item_title": "Konfigurasi notifikasi",
    "add_btn": "Tambah konfigurasi notifikasi",
    "filters": {
      "title": "Filter",
      "tip": "Membatasi konfigurasi notifikasi ini hanya pada event alert yang memenuhi syarat, yaitu tingkat, periode waktu, label, dan atribut. Bila dikosongkan, tidak ada pembatasan",
      "severities_all": "Semua tingkat",
      "severities_none": "Tidak ada tingkat yang dicentang, sehingga tidak ada event yang cocok",
      "time_ranges_count": "{{count}} periode waktu",
      "label_keys_count": "{{count}} kondisi label",
      "attributes_count": "{{count}} kondisi atribut",
      "no_extra": "Periode waktu, label, dan atribut tidak dibatasi"
    },
    "test_mode": {
      "history": "Pilih event historis",
      "mock": "Gunakan event simulasi"
    },
    "mock_test": {
      "empty_alert": "Lingkungan ini belum punya event alert; gunakan event simulasi untuk langsung menguji kanal notifikasinya",
      "switch_btn": "Gunakan event simulasi",
      "desc": "Sebuah event alert simulasi bawaan dikirim ke media dan penerima pada konfigurasi notifikasi ini untuk memastikan kanalnya berfungsi. Pengujian simulasi tidak memeriksa filter",
      "preview_title": "Pratinjau event simulasi",
      "preview_rule_name": "Nama aturan",
      "preview_severity": "Tingkat keparahan alert",
      "preview_tags": "Label",
      "rule_name": "Event simulasi untuk uji notifikasi"
    },
    "channel": "Media notifikasi",
    "channel_tip": "Pilih media yang dipakai mengirim notifikasi event alert. Bila media yang ada belum memadai, minta administrator membuat yang baru",
    "channel_msg": "Pilih media notifikasi",
    "template": "Templat pesan",
    "template_tip": "Templat isi notifikasi; templat berbeda bisa dipakai untuk skenario berbeda",
    "template_msg": "Pilih templat pesan",
    "severities": "Tingkat yang berlaku",
    "severities_tip": "Pilih tingkat event alert mana yang diberitahukan; hanya tingkat yang dicentang yang dikirim. Bila tidak satu pun dari ketiga tingkat dicentang, media ini tidak akan cocok dengan event apa pun, sama saja dengan menonaktifkannya",
    "time_ranges": "Periode waktu yang berlaku",
    "time_ranges_tip": "Aturan notifikasi bisa dibatasi agar hanya berlaku pada periode waktu tertentu; bila dikosongkan, tidak ada pembatasan",
    "effective_time_start": "Mulai",
    "effective_time_end": "Selesai",
    "effective_time_week_msg": "Pilih hari berlakunya",
    "effective_time_start_msg": "Pilih waktu mulai",
    "effective_time_end_msg": "Pilih waktu selesai",
    "fetch_integration_key_failed_remove": "Gagal mengambil kunci PagerDuty berikut: {list}. Coba pilih ulang",
    "label_keys": "Label yang berlaku",
    "label_keys_tip": "Aturan notifikasi bisa dibatasi agar hanya berlaku pada event alert yang cocok, disaring lewat label event; bila dikosongkan, tidak ada pembatasan",
    "attributes": "Atribut yang berlaku",
    "attributes_value": "Nilai atribut",
    "attributes_tip": "Aturan notifikasi bisa dibatasi agar hanya berlaku pada event alert dengan atribut tertentu; bila dikosongkan, tidak ada pembatasan",
    "attributes_options": {
      "group_name": "Grup bisnis",
      "cluster": "Sumber data",
      "is_recovered": "Apakah event pemulihan?",
      "rule_id": "Aturan alert",
      "severity": "Tingkat alert",
      "target_group": "Grup bisnis mesin"
    },
    "run_test_btn": "Uji notifikasi",
    "run_test_btn_tip": "Pilih beberapa event yang sudah terjadi untuk menguji apakah konfigurasi notifikasi ini benar; bila benar, pesan notifikasinya akan sampai",
    "run_test_request_result": "Notifikasi uji telah dikirim, dan tujuan notifikasi memberi respons berikut:",
    "user_info": {
      "user_ids": "Penerima",
      "user_group_ids": "Tim penerima",
      "error": "Penerima dan tim penerima tidak boleh sama-sama kosong"
    },
    "flashduty": {
      "ids": "Ruang kolaborasi"
    },
    "pagerduty": {
      "services": "Layanan/integrasi"
    }
  },
  "user_group_id_invalid_tip": "Tim yang diberi izin tidak ada",
  "channel_invalid_tip": "Media notifikasi tidak ada",
  "disabled": "Nonaktifkan",
  "pipeline_configuration": {
    "title": "Alur kerja pemrosesan event",
    "section_desc": "Sebelum notifikasi dikirim, event alert diproses dulu oleh alur kerja pemrosesan event, misalnya diberi label, diperkaya, atau disaring",
    "manage_btn": "Kelola alur kerja pemrosesan event",
    "name_placeholder": "Pilih alur kerja pemrosesan event",
    "name_required": "Alur kerja pemrosesan event tidak boleh kosong",
    "add_btn": "Tambah alur kerja pemrosesan event",
    "disable": "Nonaktifkan",
    "enable": "Aktifkan"
  },
  "escalations": {
    "title": "Konfigurasi eskalasi",
    "section_desc": "Bila alert lama tidak pulih atau tidak diklaim, notifikasinya dieskalasi ke kanal tertentu agar tidak ada yang terlewat",
    "title_tip": "Bila alert melewati durasi yang ditentukan dan belum pulih, sistem mengeskalasi notifikasinya ke kanal tertentu sesuai kondisi di bawah, agar tidak lama terabaikan. Selengkapnya di <a>dokumentasi</a>",
    "item_title": "Eskalasi notifikasi",
    "item_add_btn": "Tambah eskalasi notifikasi",
    "interval": "Siklus pemeriksaan",
    "interval_required": "Siklus pemeriksaan tidak boleh kosong",
    "duration_required": "Durasi tidak boleh kosong",
    "duration_1": "Event anomali telah melewati",
    "duration_2": "dan masih berstatus",
    "duration_3": "maka notifikasi dikirim memakai konfigurasi ini.",
    "repeating_notification": "Pengaturan notifikasi berulang",
    "repeating_notification_tip": "Bila dimatikan, notifikasi eskalasi untuk event yang sama hanya dikirim sekali",
    "repeating_notification_1": "Setiap",
    "repeating_notification_2": "menit sekali, dengan maksimum",
    "repeating_notification_3": "kali",
    "notification_interval_required": "Interval notifikasi tidak boleh kosong",
    "notification_max_times_required": "Jumlah maksimum notifikasi berulang tidak boleh kosong",
    "event_status_options": {
      "0": "Belum pulih",
      "1": "Belum pulih dan belum diklaim"
    },
    "time_ranges": {
      "label_tip": "Eskalasi bisa dibatasi agar hanya terpicu pada hari dan jam yang dicentang; bila dikosongkan, tidak ada pembatasan"
    },
    "labels_filter": {
      "label_tip": "Hanya event alert yang memenuhi kondisi label ini yang dieskalasi, sehingga cakupannya menyempit; bila dikosongkan, tidak ada pembatasan. Kunci label yang sudah ada bisa dipilih dari daftar, cara yang disarankan, atau diketik sendiri"
    },
    "attributes_filter": {
      "label_tip": "Eskalasi hanya berlaku bagi alert yang cocok dengan semua atribut ini; bila dikosongkan, tidak ada pembatasan. Antar kondisi berlaku DAN"
    }
  },
  "notify_aggr_configs": {
    "title": "Konfigurasi agregasi",
    "section_desc": "Menggabungkan alert sejenis menjadi satu notifikasi menurut dimensi label atau atribut, agar tidak terlalu mengganggu",
    "enable": "Aktifkan agregasi",
    "group_enable": "Agregasi terperinci",
    "group_title": "Agregasi terperinci",
    "group_add_btn": "Tambah agregasi terperinci",
    "group_tip1": "Bila kondisi berikut terpenuhi",
    "group_tip2": "gabungkan menjadi satu grup notifikasi menurut dimensi berikut",
    "group_label_keys": "Label",
    "group_label_keys_required": "Label tidak boleh kosong",
    "group_attribute_keys": "Atribut",
    "group_attribute_keys_required": "Atribut tidak boleh kosong",
    "group_keys_at_least_one_required": "Setidaknya satu label atau atribut harus diisi",
    "group_duration_1": "Setelah sebuah alert diterima, alert sekelompok yang datang dalam",
    "group_duration_2": "detik berikutnya digabungkan dan dikirim bersama",
    "group_duration_required": "Durasi agregasi tidak boleh kosong",
    "default_title": "Dimensi bawaan",
    "default_tip": "Bila filter di atas tidak terpenuhi, <b>gabungkan menjadi satu grup notifikasi menurut dimensi berikut</b>",
    "default_duration_tip": "Perlu diingat, interval agregasi yang terlalu besar membuat alert terkirim terlambat",
    "default_duration_tip2": "Interval agregasi maksimum tidak boleh melebihi 3600 detik",
    "attribute_keys_map": {
      "cluster": "Sumber data",
      "cate": "Jenis sumber data",
      "group_name": "Grup bisnis",
      "rule_id": "Aturan alert",
      "rule_prod": "Jenis pemantauan",
      "severity": "Tingkat alert",
      "is_recovered": "Sudah pulih"
    },
    "enable_tip": "Bila diaktifkan, alert yang cocok digabungkan menjadi satu notifikasi menurut dimensinya <a>Dokumentasi</a>",
    "labels_filter": {
      "label_tip": "Hanya event alert yang memenuhi kondisi label ini yang digabungkan, sehingga cakupannya menyempit; bila dikosongkan, tidak ada pembatasan. Kunci label yang sudah ada bisa dipilih dari daftar, cara yang disarankan, atau diketik sendiri"
    },
    "attributes_filter": {
      "label_tip": "Hanya alert yang cocok dengan filter label ini yang ikut diagregasi; alert lain tidak terpengaruh aturan ini<br />Antar kondisi berlaku DAN, begitu pula terhadap filter atribut di bawah"
    },
    "label_keys": {
      "tip": "Bila diisi ident, event dengan ident yang sama digabungkan menjadi satu grup dan dikirim sebagai satu pesan; ini kerap dipakai untuk mengurangi kebisingan SMS dan pesan instan",
      "placeholder": "Misalnya ident atau app. Kunci label yang sudah ada bisa dipilih dari daftar, cara yang disarankan, atau diketik sendiri"
    },
    "attribute_keys": {
      "tip": "Bila diisi grup bisnis, event dari grup bisnis yang sama digabungkan menjadi satu grup dan dikirim sebagai satu pesan",
      "placeholder": "Misalnya grup bisnis"
    }
  },
  "statistics": {
    "total_notify_events": "Jumlah notifikasi terkirim dalam {{days}} hari terakhir",
    "total_notify_events_tip": "Menghitung notifikasi yang benar-benar terkirim; event yang <b>digabungkan, ditekan, atau dibisukan</b> tidak dihitung",
    "escalation_events": "Jumlah event yang dieskalasi dalam {{days}} hari terakhir",
    "escalation_events_tip": "Jumlah event yang memenuhi aturan eskalasi dan naik prioritasnya. Angka yang tinggi biasanya menandakan waktu penanganan yang lama, sehingga <b>SLA respons, ambang eskalasi, atau strategi penekanan alert</b> perlu diperbaiki",
    "noise_reduction_ratio": "Rasio pengurangan kebisingan dalam {{days}} hari terakhir",
    "noise_reduction_ratio_tip": "Rasio pengurangan kebisingan = <b>(1 − jumlah notifikasi terkirim ÷ jumlah event alert asli) × 100%</b>. Makin dekat ke <b>100%</b>, makin baik <b>pengurangan kebisingannya</b>"
  },
  "tabs": {
    "events": "Daftar event",
    "rules": "Aturan alert",
    "sub_rules": "Aturan langganan"
  }
};

export default id_ID;
