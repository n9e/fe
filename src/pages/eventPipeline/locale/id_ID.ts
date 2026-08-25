const id_ID = {
  "title": "Alur kerja",
  "title_add": "Tambah alur kerja",
  "title_edit": "Ubah alur kerja",
  "title_clone": "Klon alur kerja",
  "teams": "Tim yang diberi izin",
  "teams_tip": "Menentukan anggota tim mana yang boleh melihat dan mengubah konfigurasi ini; beberapa tim bisa dikaitkan sekaligus<br />Contoh: bila konfigurasi diberikan ke infra-team, hanya anggota infra-team yang bisa mengakses atau menyesuaikannya.",
  "basic_configuration": "Konfigurasi dasar",
  "filter_enable": "Filter",
  "label_filters": "Label yang berlaku",
  "label_filters_tip": "Menetapkan filter label untuk pemrosesan event: hanya event yang labelnya cocok dengan konfigurasi ini yang diproses.<br />Contoh: dengan service=mon, hanya event berlabel service=mon yang masuk ke alur ini.",
  "attribute_filters": "Atribut yang berlaku",
  "attribute_filters_tip": "Menetapkan filter atribut untuk pemrosesan event: hanya event yang atributnya cocok dengan konfigurasi ini yang diproses.<br />Contoh: dengan grup bisnis == DefaultBusiGroup, hanya event yang atribut grup bisnisnya DefaultBusiGroup yang masuk ke alur ini.",
  "attribute_filters_value": "Nilai atribut",
  "attribute_filters_options": {
    "group_name": "Grup bisnis",
    "cluster": "Sumber data",
    "is_recovered": "Apakah event pemulihan?",
    "severity": "Tingkat keparahan alert"
  },
  "use_case": {
    "label": "Kegunaan",
    "firemap": "Peta pemadaman",
    "event_pipeline": "Pemrosesan event"
  },
  "processors_col": "Pemroses",
  "clone_suffix": "-salinan",
  "unsaved_confirm": "Ada perubahan yang belum disimpan. Tetap tutup?",
  "search_placeholder": "Cari nama, catatan, atau jenis pemroses",
  "empty_guide": {
    "title": "Belum ada alur kerja",
    "doc": "Lihat dokumentasi",
    "mount_hint": "Alur kerja tidak langsung berjalan setelah dibuat; ia baru dijalankan setelah dirujuk oleh aturan alert atau aturan notifikasi"
  },
  "scenario_tips": {
    "title": "Alur kerja cocok untuk tiga jenis skenario",
    "denoise": "Mengurangi kebisingan: alert bertingkat rendah atau berulang dibuang maupun ditekan sebelum diberitahukan",
    "enrich": "Pengayaan: melengkapi alert dengan label bisnis, ringkasan AI, atau konteks dari hasil kueri",
    "dispatch": "Panggilan keluar: meneruskan alert ke sistem tiket atau otomasi, maupun memicu skrip pemulihan otomatis",
    "more": "Pelajari lebih lanjut"
  },
  "trigger_mode": {
    "label": "Mode pemicu",
    "event": "Dipicu event",
    "api": "Dipicu API"
  },
  "disabled": {
    "filter_placeholder": "Status aktif",
    "form_label": "Aktifkan",
    "label": "Aktifkan",
    "false": "Aktifkan",
    "true": "Nonaktifkan"
  },
  "inputs": {
    "label": "Variabel awal",
    "help": "Variabel awal bisa dirujuk oleh pemroses di bawah lewat {{$inputs.nama_variabel}}. Misalnya, tetapkan variabel ident lalu rujuk sebagai {{$inputs.ident}} di dalam pemroses untuk menentukan mesin tempat skrip dijalankan.",
    "add_btn": "Tambah variabel",
    "key": "Nama variabel",
    "key_required": "Nama variabel tidak boleh kosong",
    "value": "Nilai bawaan variabel",
    "description": "Deskripsi variabel"
  },
  "executions": {
    "title": "Catatan eksekusi",
    "search_placeholder": "Masukkan kata kunci pencarian",
    "status": {
      "label": "Status",
      "running": "Sedang berjalan",
      "success": "Berhasil",
      "failed": "Gagal",
      "terminated": "Dihentikan",
      "skipped": "Dilewati",
      "streaming": "Sedang mengalirkan keluaran"
    },
    "id": "ID eksekusi",
    "pipeline_name": "Nama alur kerja",
    "mode": "Mode pemicu",
    "created_at": "Mulai",
    "finished_at": "Selesai",
    "duration_ms": "Durasi eksekusi",
    "trigger_by": "Dipicu oleh",
    "detail_title": "Detail eksekusi",
    "detail_basic_info": "Informasi dasar",
    "error_message": "Pesan kesalahan",
    "message": "Pesan eksekusi",
    "error_node": "Node yang gagal",
    "inputs_snapshot": "Cuplikan variabel masukan",
    "node_results_parsed_title": "Hasil eksekusi node",
    "event_id": "ID event",
    "view_all": "Lihat semua",
    "filtered_by": "Alur kerja: {{name}}",
    "trigger_by_alert_rule": "Aturan alert #{{id}}",
    "trigger_by_notify_rule": "Aturan notifikasi #{{id}}",
    "empty_guide": {
      "title": "Tidak ada catatan eksekusi pada periode ini",
      "desc": "Setiap kali alur kerja dipicu oleh aturan alert atau aturan notifikasi, eksekusinya dicatat di sini. Coba perlebar rentang waktu di atas atau longgarkan filternya."
    }
  },
  "test_modal": {
    "title": {
      "settings": "Pilih event uji",
      "result": "Hasil uji coba"
    },
    "result_success": "Eksekusi berhasil",
    "result_failed": "Eksekusi gagal",
    "dropped": "Event dibuang atau ditekan pada tahap ini, sehingga pemroses berikutnya tidak dijalankan dan tidak ada notifikasi yang muncul",
    "steps_title": "Hasil eksekusi per node",
    "event_preview_title": "Event setelah diproses",
    "back_btn": "Pilih event lain",
    "back_btn_mock": "Konfigurasikan ulang event contoh",
    "fidelity_note": "Uji coba memakai jalur pemicu API dan melewati sebagian alur produksi, misalnya penilaian filter, sehingga hasilnya bisa berbeda dari alert sungguhan. Berpeganglah pada event nyata.",
    "fidelity_note_mock": "Uji coba memakai jalur pemicu API dan melewati sebagian alur produksi, misalnya penilaian filter. Kali ini yang dipakai adalah event contoh, bukan alert sungguhan, jadi verifikasi sekali lagi dengan event nyata sebelum dipakai di produksi.",
    "mode": {
      "history": "Event historis",
      "mock": "Event contoh"
    },
    "mock": {
      "desc": "Event contoh dibuat oleh sistem dan tidak disimpan ke basis data, sehingga konfigurasi pemroses tetap bisa diverifikasi di lingkungan baru yang belum punya alert historis. Tingkat dan status pemulihannya bisa diubah untuk menguji pemroses yang bercabang menurut keduanya.",
      "preview_title": "Event contoh",
      "severity": "Tingkat keparahan alert",
      "is_recovered": "Event pemulihan",
      "tags": "Label event",
      "empty_alert": "Tidak ada event alert historis pada periode ini",
      "switch_btn": "Uji coba dengan event contoh"
    }
  },
  "batch": {
    "not_select": "Pilih dulu alur kerja yang akan dikenai tindakan",
    "export": {
      "title": "Ekspor massal"
    },
    "delete": "Hapus massal",
    "enable": "Aktifkan massal",
    "disable": "Nonaktifkan massal",
    "already_enabled": "Semua alur kerja yang dipilih sudah aktif",
    "already_disabled": "Semua alur kerja yang dipilih sudah nonaktif",
    "enable_confirm": "Aktifkan {{count}} alur kerja yang dipilih?",
    "disable_confirm": "Nonaktifkan {{count}} alur kerja yang dipilih?",
    "delete_enabled_confirm": "{{count}} di antaranya masih aktif dan akan dinonaktifkan sebelum dihapus. Lanjutkan?",
    "delete_confirm": "Hapus {{count}} alur kerja yang dipilih? Aturan alert dan notifikasi yang merujuknya akan berhenti bekerja."
  },
  "relabel_fields": {
    "action": "Tindakan",
    "target_label": "Label tujuan",
    "replacement": "Nilai label",
    "source_labels": "Label sumber",
    "separator": "Pemisah",
    "regex": "Regex",
    "replace_hint": "replace: mengambil nilai dari Label sumber lewat Regex lalu menulisnya ke Label tujuan. Bila hanya label tujuan dan nilainya yang diisi, event mendapat label tetap. Pemroses ini tidak berbuat apa pun bila label tujuan dikosongkan."
  },
  "processor_message": {
    "drop_hit": "Kondisi pembuangan terpenuhi, sehingga event dibuang",
    "drop_miss": "Kondisi pembuangan tidak terpenuhi, sehingga event berlanjut",
    "no_change": "Tidak ada perubahan"
  },
  "processor": {
    "title": "Pemroses",
    "add_btn": "Tambah pemroses",
    "typ": "Jenis",
    "typ_required": "Pilih jenis pemroses; pemroses tanpa jenis akan gagal pada setiap event",
    "help_btn": "Petunjuk penggunaan",
    "options": {
      "relabel": "Penulisan ulang label event",
      "label_enrich": "Pengayaan label event",
      "inhibit": "Penekanan event",
      "event_drop": "Pembuangan event",
      "event_update": "Pembaruan event",
      "inhibit_qd": "Penekanan event berbasis kueri",
      "annotation_qd": "Pengayaan informasi tambahan event berbasis kueri",
      "callback": "Callback webhook",
      "ai_summary": "Pembuatan ringkasan AI",
      "script": "Eksekusi skrip",
      "event_recover": "Pemulihan otomatis",
      "alert_shot": "Tangkapan layar alert"
    },
    "category": {
      "rewrite": "Menulis ulang event",
      "denoise": "Mengurangi kebisingan",
      "enrich": "Pengayaan",
      "dispatch": "Panggilan keluar dan eksekusi",
      "other": "Lainnya"
    },
    "options_desc": {
      "relabel": "Ubah, tambah, atau hapus label event",
      "event_drop": "Buang event menurut kondisi tertentu, tanpa pemrosesan lanjutan",
      "event_update": "Panggil API HTTP dan perbarui event dengan nilai balikannya",
      "callback": "Teruskan event ke sistem luar seperti tiket atau otomasi",
      "ai_summary": "Buat ringkasan event dengan model bahasa besar",
      "label_enrich": "Lengkapi label event memakai kamus bawaan",
      "script": "Jalankan skrip untuk memproses event",
      "inhibit": "Tekan notifikasi ini bila ada alert aktif yang tingkatnya lebih tinggi",
      "inhibit_qd": "Tekan event menurut hasil kueri data",
      "annotation_qd": "Lampirkan informasi ke event menurut hasil kueri data",
      "event_recover": "Picu tugas pemulihan otomatis",
      "alert_shot": "Tangkap layar dasbor atau halaman web lalu lampirkan ke alert"
    },
    "delete_confirm": "Hapus pemroses ini?",
    "switch_type_confirm": "Mengganti jenis akan menghapus konfigurasi pemroses ini. Lanjutkan?",
    "drag_tip": "Seret untuk mengurutkan",
    "move_up": "Naikkan",
    "move_down": "Turunkan",
    "copy_tip": "Salin pemroses ini"
  },
  "form_section": {
    "filter": {
      "title": "Cakupan pemrosesan",
      "desc": "Menentukan event alert mana yang masuk ke alur kerja ini. Antar kondisi berlaku DAN, dan bila semuanya dikosongkan, seluruh event ikut tercakup"
    },
    "processor": {
      "title": "Pemroses",
      "desc": "Event melewati pemroses satu per satu dari atas ke bawah"
    },
    "basic": {
      "title": "Informasi dasar",
      "desc": "Nama alur kerja, tim yang diberi izin, dan status aktifnya"
    }
  },
  "no_filter_warning": "Belum ada filter yang dikonfigurasi, jadi alur kerja ini memproses semua event alert",
  "section_summary": {
    "label_count": "{{count}} kondisi label",
    "attr_count": "{{count}} kondisi atribut",
    "no_filter": "Mencakup semua event",
    "processor_count": "{{count}} pemroses",
    "unnamed": "Tanpa nama",
    "enabled": "Aktif",
    "disabled": "Nonaktif"
  },
  "name_auto": {
    "tip": "Nama dibuat otomatis dari cakupan pemrosesan dan pemroses di atas, dan boleh diubah kapan saja",
    "all": "Semua alert",
    "arrow": "→",
    "joiner": "-"
  },
  "saved_guide": {
    "title": "Alur kerja tersimpan",
    "hint": "Alur kerja ini belum berjalan: event baru melewatinya setelah ia dirujuk oleh sebuah aturan notifikasi.",
    "to_notify_rule": "Kaitkan pada aturan notifikasi",
    "done": "Selesai"
  },
  "label_enrich": {
    "label_source_type": {
      "label": "Sumber label",
      "options": {
        "built_in_mapping": "Kamus label bawaan"
      }
    },
    "label_mapping_id": "Nama kamus",
    "help": "Kamus dicari memakai label yang ditunjuk pada Label sumber, lalu field hasilnya dilampirkan ke event alert sesuai konfigurasi Label baru",
    "source_keys": {
      "label": "Label sumber",
      "text": "Field <strong>{{field}}</strong> pada kamus dipetakan ke label pada event",
      "target_key_placeholder": "Kunci label",
      "target_key_required": "Kunci label tidak boleh kosong"
    },
    "append_keys": {
      "label": "Tambah label",
      "source_key_placeholder": "Field pada kamus",
      "rename_key": "Ganti nama kunci label",
      "target_key_placeholder": "Kunci label"
    }
  },
  "callback": {
    "url": "URL",
    "advanced_settings": "Pengaturan lanjutan",
    "basic_auth_user": "Nama pengguna autentikasi",
    "basic_auth_user_placeholder": "Masukkan nama pengguna autentikasi",
    "basic_auth_pass": "Kata sandi autentikasi",
    "basic_auth_pass_placeholder": "Masukkan kata sandi autentikasi"
  },
  "event_drop": {
    "hint": "Event dibuang bila templat menghasilkan true; keluaran lain apa pun meloloskannya. Variabel yang tersedia: $event.Severity (1/2/3), $event.IsRecovered, $event.RuleName, dan $event.TagsMap.nama_label",
    "snippets_label": "Sisipkan contoh",
    "snippets": {
      "severity": "Buang alert tingkat info S3",
      "recovered": "Buang notifikasi pemulihan",
      "tag": "Buang menurut label",
      "rule_name": "Buang menurut nama aturan"
    },
    "replace_confirm": "Logika penilaian saat ini akan diganti oleh contoh. Lanjutkan?",
    "content": "Logika penilaian",
    "content_placeholder": "Memakai sintaks go template: bila hasil akhirnya true, event dibuang pada tahap ini"
  },
  "ai_summary": {
    "llm_config": "Gunakan kembali konfigurasi LLM",
    "llm_config_placeholder": "Pilih LLM yang sudah dikonfigurasi, atau kosongkan untuk mengisi parameternya sendiri di bawah",
    "llm_config_tip": "Pilih konfigurasi model yang sudah ada di Konfigurasi AI - Konfigurasi LLM untuk memakai ulang model, kunci, dan alamatnya. Bila dikosongkan, parameter yang kamu isi di bawah yang dipakai.",
    "url_placeholder": "Masukkan URL layanan API",
    "url_required": "Masukkan URL",
    "api_key_placeholder": "Kunci API",
    "api_key_required": "Masukkan kunci API",
    "model_name": "Nama model",
    "model_name_placeholder": "Misalnya deepseek-chat",
    "model_name_required": "Masukkan nama model",
    "prompt_template": "Templat prompt",
    "prompt_template_required": "Masukkan templat prompt",
    "advanced_config": "Konfigurasi lanjutan",
    "custom_params": "Konfigurasi parameter model AI",
    "custom_params_key_label": "Nama parameter (misalnya temperature)",
    "custom_params_value_label": "Nilai parameter (misalnya 0.7)",
    "proxy_placeholder": "Misalnya http://proxy.example.com:8080",
    "timeout_placeholder": "Batas waktu (detik)",
    "timeout_required": "Masukkan batas waktu",
    "url_tip": "- **Keterangan**: URL API layanan AI\n- **Contoh**: `https://api.deepseek.com/v1/chat/completions`",
    "api_key_tip": "- **Keterangan**: kunci API dari penyedia layanan AI\n- **Cara memperolehnya**:\n  - OpenAI: ajukan lewat situs resmi OpenAI\n  - DeepSeek: daftar di situs resmi DeepSeek",
    "model_name_tip": "- **Keterangan**: nama model AI yang dipakai\n- **Model yang umum**:\n  - `gpt-3.5-turbo` (OpenAI)\n  - `gpt-4` (OpenAI)\n  - `deepseek-chat` (DeepSeek)",
    "prompt_template_tip": "Templat prompt adalah inti dari analisis AI. Gunakan {{$event}} untuk merujuk field-field event; struktur lengkapnya dijelaskan di [tabel riwayat alert](https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/events/alert-history/). Untuk permulaan, templat bawaannya sudah memadai",
    "prompt_template_placeholder": "Analisis informasi event alert berikut dan buat ringkasan singkat dalam bahasa Indonesia:\nAturan alert: {{$event.RuleName}}\nTingkat keparahan: {{$event.Severity}}\nStatus alert: {{if $event.IsRecovered}}Recovered{{else}}{{$event.Severity}} Triggered{{end}}       \nWaktu terpicu: {{$event.TriggerTime}}\nNilai saat terpicu: {{$event.TriggerValue}}\nKeterangan aturan: {{$event.RuleNote}}\nLabel: {{$event.Tags}}\nAnotasi: {{$event.Annotations}}\n\nBerikan ringkasan berbahasa Indonesia sepanjang maksimal 100 kata yang menyoroti:\n1. Sistem atau layanan apa yang bermasalah dan masalahnya apa\n2. Seberapa parah masalahnya\n3. Dampak yang mungkin timbul\n4. Saran penanganan singkat\nRingkasan harus jelas dan ringkas agar tim operasional cepat memahami situasinya.",
    "custom_params_tip": "Untuk menyetel perilaku model AI secara halus:\n\n| Parameter | Keterangan | Nilai yang disarankan | Contoh |\n|--------|------|--------|------|\n| temperature | Mengatur keacakan jawaban | 0.3-0.7 | 0.7 |\n| max_tokens | Jumlah token keluaran maksimum | 200-500 | 300 |\n| top_p | Ambang probabilitas pengambilan sampel | 0.8-1.0 | 0.9 |\n\n**Cara mengonfigurasi**:\n1. Klik tombol + di samping \"Custom Params\"\n2. Isi nama parameter pada kolom Nama parameter, misalnya temperature\n3. Isi nilainya pada kolom Nilai parameter, misalnya 0.7"
  },
  "script": {
    "timeout": "Batas waktu (milidetik)",
    "timeout_tooltip": "Batas waktu maksimum eksekusi skrip; melewatinya, skrip dihentikan",
    "timeout_placeholder": "Masukkan batas waktu",
    "content": "Isi skrip",
    "content_tooltip": "Tulis kode skrip untuk memproses event. Event alert diteruskan ke skrip lewat stdin, dan skrip harus menulis event itu kembali sebagai objek JSON ke stdout",
    "content_placeholder": "Masukkan isi skrip"
  },
  "inhibit": {
    "help": "Pemroses penekanan event mencegah notifikasi sebuah alert saat alert lain sedang dikirim, sehingga jumlah notifikasi berkurang. Contoh yang umum: selama ada gangguan aktif tingkat P1 pada aturan yang sama, notifikasi tingkat P2 dan P3 diabaikan. Selengkapnya di <a>dokumentasi</a>",
    "tip1": "Bila <b>alert baru</b> memenuhi kondisi berikut",
    "tip2": "Dan",
    "tip3": "detik terakhir terdapat <b>alert aktif</b> yang memenuhi kondisi berikut",
    "tip4": "dan <b>alert baru</b> serta <b>alert aktif</b> sama pada hal-hal berikut",
    "tip5": "Bila seluruh kondisi di atas terpenuhi, alert ini ditekan dan tidak diberitahukan",
    "duration_required": "Durasi penekanan tidak boleh kosong",
    "duration_max": "Durasi penekanan tidak boleh melebihi 600 detik",
    "match_label_keys": "Label",
    "match_label_keys_required": "Label tidak boleh kosong",
    "match_attribute_keys": "Atribut",
    "match_attribute_keys_required": "Atribut tidak boleh kosong",
    "keys_at_least_one_required": "Setidaknya satu label atau atribut dibutuhkan",
    "labels_conflict": "Nilai label {{label}} berbeda, sehingga penekanan tidak bisa dilakukan",
    "attributes_conflict": "Nilai atribut {{attribute}} berbeda, sehingga penekanan tidak bisa dilakukan",
    "preview": "Pratinjau aturan: bila ada «<b>alert baru: {{newAlertLabelsAttrs}}</b>» dan dalam «<b>{{duration}} detik</b>» terakhir terdapat «<b>alert aktif: {{activeAlertLabelsAttrs}}</b>», serta keduanya sama pada «<b>{{matchLabelsAttrs}}</b>», maka notifikasi alert baru ditekan.",
    "labels_filter": {
      "label": "Label",
      "label_tip": "Hanya event alert yang cocok dengan kondisi label ini yang ditekan, sehingga cakupannya menyempit; bila dikosongkan, tidak ada pembatasan. Kunci label yang sudah ada bisa dipilih dari daftar, cara yang disarankan, atau diketik sendiri",
      "label_placeholder": "Ketik atau pilih kunci label yang dipakai untuk pencocokan, misalnya app / cluster / alertname"
    },
    "labels_filter_value_placeholder": "Ketik atau pilih nilai label untuk dicocokkan",
    "attributes_filter": {
      "label": "Atribut",
      "label_tip": "Batasi cakupan penekanan menurut atribut event: hanya alert yang cocok dengan semua atribut ini yang ditekan. Bila dikosongkan, berlaku untuk semua alert"
    },
    "active_event_labels_filter": {
      "label": "Label",
      "label_tip": "**Membatasi cakupan alert aktif**\n- Bila dikosongkan: label tidak dipakai untuk memfilter\n- Bila diisi: kunci label yang sudah ada bisa dipilih dari daftar, cara yang disarankan, atau diketik sendiri. Hanya alert aktif yang memenuhi semua kondisi label ini yang masuk ke cakupan.\n\nContoh: dengan service=mon, hanya event berlabel service=mon yang ikut ke logika penekanan berikutnya."
    },
    "active_event_attributes_filter": {
      "label": "Atribut",
      "label_tip": "**Membatasi cakupan alert aktif**\n- Bila dikosongkan: atribut tidak dipakai untuk memfilter\n- Bila diisi: hanya alert aktif yang memenuhi semua kondisi atribut ini yang terpilih.\n\nContoh: dengan grup bisnis == DefaultBusiGroup, hanya event aktif yang atribut grup bisnisnya DefaultBusiGroup yang terpilih untuk alur penekanan event berikutnya"
    }
  },
  "inhibit_qd": {
    "help": "Menekan event menurut hasil kueri: saat alert terpicu, kueri data di bawah dijalankan. Bila setidaknya satu baris dikembalikan, alert ini ditekan dan tidak diberitahukan; bila tidak ada data, notifikasi berjalan seperti biasa. Selengkapnya di <a>dokumentasi</a>",
    "t_1": "dan kueri mengembalikan <b>data</b> berikut"
  },
  "annotation_qd": {
    "help": "Pemroses kueri tambahan memperkaya alert: saat alert terpicu, ia mengambil informasi terkait dari sumber data, misalnya log, lalu melampirkannya ke alert. Selengkapnya di <a>dokumentasi</a>",
    "query_configs": "Kueri data",
    "use_event_datasource": "Gunakan sumber data event alert",
    "use_event_datasource_help": "Bila diaktifkan, hanya event alert contoh dengan tipe sumber data yang cocok yang bisa dipilih",
    "datasource_cate_required": "Jenis sumber data tidak boleh kosong",
    "datasource_ids_required": "Sumber data tidak boleh kosong",
    "select_alert_event_btn": "Pilih event alert contoh",
    "select_alert_event_tip": "Pilih event alert contoh untuk merender variabel di dalam kueri dan melihat pratinjau datanya",
    "select_alert_event_label": "Event alert contoh yang dipilih",
    "query_required": "Kondisi kueri tidak boleh kosong",
    "sql_limit_valid": "Kueri SQL harus memuat klausa LIMIT",
    "oracle_sql_limit_valid": "Kueri SQL harus memuat klausa ROWNUM",
    "annotation_configs": "Penambahan data",
    "annotation_configs_tip": "Atur pasangan kunci dan nilai untuk menambahkan hasil kueri ke informasi alert",
    "annotation_key_tip": "Tentukan kunci field baru; sebaiknya memakai huruf Latin",
    "annotation_val_tip": "Templat nilai field baru; contoh penulisannya ada di dokumentasi",
    "annotation_key_placeholder": "Nama field tambahan",
    "annotation_val_placeholder": "Isi field tambahan; sintaks templat didukung agar hasil kueri bisa diisikan lewat variabel",
    "annotation_key_required": "Nama field tambahan tidak boleh kosong",
    "annotation_val_required": "Isi field tambahan tidak boleh kosong",
    "data_preview": "Pratinjau data",
    "data_preview_query": "Kueri",
    "data_preview_no_eventid": "Pilih event alertnya terlebih dahulu",
    "query_limit": "Batas jumlah baris"
  },
  "event_recover": {
    "help": "Pemroses pemulihan otomatis menjalankan skrip shell di mesin saat alert terpicu, baik untuk mengumpulkan informasi terkait maupun menjalankan tugas pemulihan. <a>Dokumentasi</a>",
    "title": "Pemulihan otomatis alert",
    "create_btn": "Buat templat pemulihan otomatis",
    "tpl_id": "Templat pemulihan otomatis",
    "tpl_id_required": "Templat pemulihan otomatis tidak boleh kosong",
    "host": "Mesin eksekusi",
    "host_placeholder": "Boleh dikosongkan; bila kosong, mesin eksekusi diambil dari label ident pada event",
    "args": "Parameter",
    "args_tip": "Argumen yang diteruskan ke skrip; pisahkan beberapa argumen dengan koma ganda, misalnya arg1,,arg2,,arg3",
    "save_result": "Simpan hasil eksekusi",
    "save_result_tip": "Simpan hasil eksekusi skrip ke dalam event alert",
    "timeout": "Waktu tunggu eksekusi",
    "timeout_tip": "Bila skrip belum selesai dalam waktu tunggu ini, hasilnya tidak ditunggu",
    "timeout_max_warning": "Waktu tunggu eksekusi tidak boleh melebihi 60 detik",
    "select_host": "Filter mesin"
  },
  "alert_shot": {
    "help": "<a>Dokumentasi</a>",
    "title": "Tangkapan layar alert",
    "shot_type": {
      "label": "Jenis objek",
      "options": {
        "board": "Dasbor",
        "url": "URL"
      }
    },
    "advanced_settings": "Pengaturan lanjutan",
    "board_shot_opts": {
      "busi_group": "Grup bisnis",
      "board_id": "Dasbor",
      "board_url": "URL dasbor",
      "timeout": "Batas waktu (milidetik)",
      "width": "Lebar gambar"
    },
    "url_shot_opts": {
      "url": "URL",
      "headers": "Header permintaan",
      "proxy": "Pengaturan proksi",
      "insecure_skip_verify": "Lewati verifikasi sertifikat",
      "timeout": "Batas waktu (milidetik)",
      "width": "Lebar gambar"
    }
  }
};

export default id_ID;
