const id_ID = {
  "title": "Aturan langganan",
  "search_placeholder": "Cari nama langganan, aturan yang dilanggan, label langganan, atau grup penerima alert",
  "rule_name": "Aturan yang dilanggan",
  "sub_rule_name": "Langganan aturan alert",
  "sub_rule_selected": "Aturan yang dipilih",
  "tags": "Label langganan",
  "user_groups": "Grup penerima alert",
  "notify_rule_ids": "Aturan notifikasi",
  "tag": {
    "key": {
      "label": "Kunci label event langganan",
      "tip": "Label di sini adalah label pada event alert, yang dipakai memfilter event lewat aturan pencocokan berikut",
      "required": "Kunci label tidak boleh kosong",
      "placeholder": "Masukkan kunci label"
    },
    "func": {
      "label": "Operator"
    },
    "value": {
      "label": "Nilai label",
      "equal_placeholder": "Masukkan sebuah nilai",
      "include_placeholder": "Beberapa nilai bisa diisi, dipisahkan dengan Enter",
      "regex_placeholder": "Masukkan ekspresi reguler untuk dicocokkan",
      "required": "Nilai label tidak boleh kosong"
    }
  },
  "group": {
    "key": {
      "label": "Grup bisnis langganan",
      "placeholder": "Grup bisnis"
    },
    "func": {
      "label": "Operator"
    },
    "value": {
      "label": "Nilai",
      "required": "Nilai tidak boleh kosong"
    }
  },
  "redefine_severity": "Tetapkan ulang tingkat alert",
  "redefine_channels": "Tetapkan ulang media notifikasi",
  "redefine_webhooks": "Tetapkan ulang URL callback",
  "user_group_ids": "Grup penerima alert langganan",
  "for_duration": "Langganan berlaku bila event bertahan lebih dari (detik)",
  "for_duration_tip": "Contoh: dengan nilai 300, saat sebuah event alert pertama kali terjaring langganan, ia belum dianggap cocok. Pada penjaringan berikutnya, selisih antara waktu pemicu event saat itu dan waktu pemicu ketika ia pertama kali terjaring dihitung; bila selisihnya melebihi 300 detik, kondisi langganan terpenuhi dan notifikasinya dijalankan, sedangkan bila kurang dari 300 detik, langganan tidak cocok. Fitur ini bisa dipakai sebagai eskalasi alert: penanggung jawab tim membuat langganan dengan durasi lebih dari satu jam (3600 detik) dan menjadikan dirinya penerima, sebagai jaring pengaman agar setiap alert pasti ada yang menindaklanjuti.",
  "webhooks": "URL callback baru",
  "webhooks_msg": "URL callback tidak boleh kosong",
  "prod": "Jenis pemantauan",
  "subscribe_btn": "Langganan",
  "basic_configs": "Konfigurasi dasar",
  "severities": "Tingkat event langganan",
  "severities_msg": "Tingkat event langganan tidak boleh kosong",
  "tags_groups_require": "Setidaknya salah satu dari label atau grup penerima harus diisi",
  "note": "Nama langganan",
  "filter_configs": "Konfigurasi filter",
  "notify_configs": "Konfigurasi notifikasi",
  "and": "Dan",
  "btn_add_rule": "Tambah aturan",
  "basic_configs_desc": "Nama aturan langganan dan status aktifnya; namanya bisa dibuat otomatis dari konfigurasi di atas",
  "filter_configs_desc": "Menentukan event alert mana yang terjaring langganan ini. Antar kondisi di bawah berlaku DAN, dan bila semuanya dikosongkan, seluruh event alert ikut terjaring",
  "notify_configs_desc": "Event alert yang terjaring diberitahukan sekali lagi lewat aturan notifikasi di bawah; ini kerap dipakai untuk mengeskalasi alert atau mengalihkannya ke tim lain",
  "no_filter_warning": "Belum ada filter yang dikonfigurasi, jadi langganan ini menjaring semua event alert",
  "sub_rule_select": "Pilih aturan alert",
  "for_duration_placeholder": "Kosongkan atau isi 0 untuk tanpa batas",
  "note_msg": "Nama langganan tidak boleh kosong",
  "notify_rule_ids_msg": "Pilih setidaknya satu aturan notifikasi, jika tidak event yang terjaring tidak akan diberitahukan",
  "name_auto": {
    "tip": "Nama dibuat otomatis dari konfigurasi filter dan notifikasi di atas, dan boleh diubah kapan saja",
    "all": "Semua alert",
    "escalation": "Eskalasi",
    "separator": "、",
    "joiner": "-",
    "clone_suffix": "-salinan"
  },
  "section_summary": {
    "severities_all": "Semua tingkat",
    "severities_none": "Tidak ada tingkat yang dipilih, sehingga tidak ada event yang cocok",
    "rules_count": "{{count}} aturan",
    "busi_groups_count": "{{count}} kondisi grup bisnis",
    "tags_count": "{{count}} kondisi label",
    "for_duration": "Bertahan lebih dari {{count}} detik",
    "no_extra": "Tidak ada kondisi lain",
    "notify_rules_none": "Tidak ada aturan notifikasi yang dipilih",
    "user_groups_none": "Tidak ada grup penerima yang dipilih",
    "unnamed": "Tanpa nama",
    "enabled": "Aktif",
    "disabled": "Nonaktif"
  },
  "empty_guide": {
    "title": "Belum ada aturan langganan",
    "doc": "Lihat dokumentasi"
  },
  "scenario_tips": {
    "title": "Aturan langganan cocok untuk tiga jenis skenario",
    "cross_team": "Melanggan alert milik orang lain: layanan hilir yang kamu andalkan dikelola tim lain, tetapi gangguannya berdampak padamu, sehingga kamu ingin menerima alert SLI-nya",
    "escalation": "Jaring pengaman eskalasi: alert yang belum pulih selama satu jam diberitahukan sekali lagi ke penanggung jawab tim",
    "global_callback": "Callback global: semua event alert dikirim ke sebuah webhook untuk keperluan otomasi",
    "more": "Pelajari lebih lanjut"
  },
  "filter_disabled": {
    "0": "Aktifkan",
    "1": "Nonaktifkan",
    "placeholder": "Status aktif"
  }
};

export default id_ID;
