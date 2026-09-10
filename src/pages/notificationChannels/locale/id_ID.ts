const id_ID = {
  "title": "Media notifikasi",
  "basic_configuration": "Konfigurasi dasar",
  "default_values": {
    "access_key_id": "Ganti dengan access_key_id yang sebenarnya",
    "access_key_secret": "Ganti dengan access_key_secret yang sebenarnya",
    "show_number": "Ganti dengan show_number yang sebenarnya; bila kosong, nomornya tidak ditampilkan",
    "voice_code": "Ganti dengan voice_code yang sebenarnya",
    "sign_name": "Ganti dengan tanda tangan yang sebenarnya",
    "template_id": "Ganti dengan ID templat yang sebenarnya",
    "secret_id": "Ganti dengan secret_id yang sebenarnya",
    "secret_key": "Ganti dengan secret_key yang sebenarnya",
    "region": "Ganti dengan region yang sebenarnya",
    "app_id": "Ganti dengan appid yang sebenarnya",
    "ali_voice_tts_param": "Gangguan {{$tpl.incident}}. Tekan 1 untuk mengklaimnya",
    "ali_sms_template_param": "Gangguan {{$tpl.incident}}. Mohon segera ditangani"
  },
  "ident": "Jenis media",
  "ident_tip": "Kategori media notifikasi; misalnya beberapa media DingTalk bisa sama-sama bertipe dingtalk. Jenisnya boleh diketik sendiri dan tidak terbatas pada pilihan di daftar. Media notifikasi dan templat pesan dikaitkan lewat field jenis ini",
  "note_tip": "Tempat menuliskan keterangan tambahan atau skenario pemakaian media ini, agar mudah dipahami saat dirawat atau dikerjakan bersama",
  "enable_tip": "Menentukan apakah konfigurasi media notifikasi ini aktif. Bila dimatikan, konfigurasinya berhenti berlaku sementara dan tidak ada notifikasi yang dikirim",
  "advanced_settings": "Pengaturan lanjutan",
  "variable_configuration": {
    "title": "Konfigurasi variabel",
    "contact_key": "Kontak",
    "contact_key_tip": "Sesuai dengan kontak di Orang dan organisasi - Manajemen pengguna, dipakai untuk memilih cara notifikasi dikirim; misalnya \"Phone\" berarti nomor telepon pengguna diteruskan ke permintaan atau skrip callback. Jenis kontak baru bisa ditambahkan di halaman Orang dan organisasi - Kontak",
    "params": {
      "title": "Konfigurasi parameter",
      "title_tip": "Tetapkan parameter khusus yang dibutuhkan media ini, misalnya token bot DingTalk atau kunci API. Nilainya bisa diisi bersamaan saat media dipilih di aturan notifikasi",
      "key": "Identitas parameter",
      "key_required": "Identitas parameter tidak boleh kosong",
      "cname": "Nama parameter",
      "cname_required": "Nama parameter tidak boleh kosong"
    }
  },
  "request_configuration": {
    "http": "Konfigurasi HTTP",
    "smtp": "Konfigurasi SMTP",
    "script": "Konfigurasi skrip",
    "flashduty": "Konfigurasi FlashDuty",
    "pagerduty": "Konfigurasi PagerDuty",
    "dingtalkapp": "Konfigurasi aplikasi DingTalk",
    "wecomapp": "Konfigurasi aplikasi WeCom",
    "feishuapp": "Konfigurasi aplikasi Feishu"
  },
  "request_type": "Jenis pengiriman",
  "http_request_config": {
    "title": "HTTP",
    "url": "URL",
    "url_tip": "Alamat tujuan yang menerima permintaan notifikasi",
    "method": "Metode permintaan",
    "header": "Header permintaan",
    "header_tip": "Header HTTP khusus yang perlu disertakan pada permintaan, misalnya kredensial BasicAuth. URL, header, nilai parameter, dan body permintaan semuanya bisa merujuk variabel dari Konfigurasi sistem - Konfigurasi variabel lewat {{.nama_variabel}}, sehingga kredensial seperti token tidak perlu ditulis terbuka di sini",
    "header_key": "Nama parameter",
    "header_value": "Nilai parameter",
    "timeout": "Batas waktu (milidetik)",
    "concurrency": "Tingkat paralelisme",
    "concurrency_tip": "Jumlah permintaan paralel maksimum. Menaikkannya secukupnya mempercepat pengiriman, tetapi perhatikan kemampuan layanan tujuan",
    "retry_times": "Jumlah percobaan ulang",
    "retry_interval": "Jeda antar percobaan ulang (milidetik)",
    "insecure_skip_verify": "Lewati verifikasi sertifikat",
    "proxy": "Proksi",
    "proxy_tip": "Alamat proksi HTTP, untuk situasi yang memerlukan proksi",
    "params": "Parameter permintaan",
    "params_key": "Nama parameter",
    "params_value": "Nilai parameter",
    "body": "Body permintaan"
  },
  "smtp_request_config": {
    "title": "SMTP",
    "host": "Server",
    "host_tip": "Alamat server SMTP yang dipakai mengirim email, misalnya smtp.example.com",
    "port": "Porta",
    "port_tip": "Nomor porta server SMTP. Yang umum adalah 25, 465 (SSL), dan 587 (STARTTLS); pastikan portanya ke penyedia layanan Anda",
    "username": "Nama pengguna",
    "username_tip": "Nama pengguna untuk masuk ke server SMTP, biasanya berupa alamat email",
    "password": "Kata sandi",
    "password_tip": "Kata sandi atau kode otorisasi untuk nama pengguna SMTP tersebut; kode otorisasi lebih disarankan demi keamanan",
    "from": "Pengirim",
    "from_tip": "Nama pengirim atau alias email yang tampil pada pesan, agar penerima lebih mudah mengenali asalnya. Contoh formatnya: Flashcat <no-reply@notice.flashcat.cloud>",
    "insecure_skip_verify": "Lewati verifikasi sertifikat",
    "insecure_skip_verify_tip": "Bila diaktifkan, verifikasi sertifikat server SMTP diabaikan; biasanya dipakai saat pengujian atau dengan sertifikat yang ditandatangani sendiri",
    "batch": "Pengiriman massal",
    "batch_tip": "Berapa email yang dikirim dalam satu koneksi SMTP"
  },
  "script_request_config": {
    "title": "Script",
    "script": {
      "option": "Gunakan skrip",
      "label": "Isi skrip"
    },
    "path": {
      "option": "Gunakan jalur berkas",
      "label": "Jalur berkas"
    },
    "timeout": "Batas waktu (milidetik)"
  },
  "flashduty_request_config": {
    "title": "FlashDuty",
    "integration_url": "URL",
    "integration_url_tip": "Isikan URL integrasi yang dibuat di pusat integrasi Flashduty; buat di https://console.flashcat.cloud/settings/source/alert/add/n9e",
    "proxy": "Proksi",
    "proxy_tip": "Alamat proksi HTTP, untuk situasi yang memerlukan proksi",
    "timeout": "Batas waktu (milidetik)",
    "retry_times": "Jumlah percobaan ulang"
  },
  "pagerduty_request_config": {
    "title": "PagerDuty",
    "api_key": "API Key",
    "api_key_tip": "Isikan kunci API integrasi PagerDuty; cara memperolehnya dijelaskan di https://developer.pagerduty.com/docs/authentication",
    "proxy": "Proksi",
    "proxy_tip": "Alamat proksi HTTP, untuk situasi yang memerlukan proksi",
    "timeout": "Batas waktu (milidetik)",
    "retry_times": "Jumlah percobaan ulang"
  },
  "dingtalkapp_request_config": {
    "app_key": "Identitas unik aplikasi",
    "app_secret": "Kunci rahasia aplikasi",
    "alert_shot_tip": "Bila alert perlu menyertakan gambar, daftarkan aplikasi DingTalk sesuai dokumentasi lalu isi datanya di sini"
  },
  "wecomapp_request_config": {
    "corp_id": "ID perusahaan",
    "corp_secret": "Kunci rahasia perusahaan",
    "agentid": "Agent ID"
  },
  "feishuapp_request_config": {
    "app_id": "ID aplikasi",
    "app_secret": "Kunci rahasia aplikasi",
    "receive_id_type": "Jenis ID penerima",
    "alert_shot_tip": "Bila alert perlu menyertakan gambar, daftarkan aplikasi Feishu sesuai dokumentasi lalu isi datanya di sini",
    "lark_alert_shot_tip": "Bila alert perlu menyertakan gambar, daftarkan aplikasi Lark sesuai dokumentasi lalu isi datanya di sini"
  },
  "types_search_placeholder": "Cari menurut jenis",
  "name_search_placeholder": "Cari menurut nama",
  "disabled": "Nonaktifkan",
  "status_select": {
    "placeholder": "Status",
    "enable": "Aktifkan",
    "disable": "Nonaktifkan"
  },
  "types_select_placeholder": "Jenis",
  "types": {
    "flashduty": "FlashDuty",
    "callback": "Callback",
    "email": "Email",
    "dingtalk": "DingTalk",
    "dingtalkapp": "Aplikasi DingTalk",
    "wecom": "WeCom",
    "wecomapp": "Aplikasi WeCom",
    "feishucard": "Kartu Feishu",
    "feishu": "Feishu",
    "feishuapp": "Aplikasi Feishu",
    "larkcard": "Kartu Lark",
    "lark": "Lark",
    "telegram": "Telegram",
    "ali-voice": "Panggilan suara Alibaba Cloud",
    "ali-sms": "SMS Alibaba Cloud",
    "tx-voice": "Panggilan suara Tencent Cloud",
    "tx-sms": "SMS Tencent Cloud",
    "slackbot": "Slack Bot",
    "slackwebhook": "Slack Webhook",
    "mattermostbot": "Mattermost Bot",
    "mattermostwebhook": "Mattermost Webhook",
    "discord": "Discord",
    "jsm_alert": "JSM Alert",
    "jira": "JIRA",
    "pagerduty": "PagerDuty",
    "script": "Script"
  },
  "test": {
    "btn": "Uji",
    "run": "Kirim uji coba",
    "back": "Kembali dan ubah",
    "desc": "Sebuah pesan sungguhan dikirim memakai konfigurasi pada formulir ini, tanpa perlu disimpan lebih dulu. Berguna untuk memastikan alamat, kunci, dan jaringannya berfungsi.",
    "script_blocked": "Media berbasis skrip harus disimpan dulu sebelum diuji",
    "params_title": "Parameter media",
    "receivers_title": "Penerima",
    "pagerduty_keys_title": "Integration Key",
    "pagerduty_keys_tip": "PagerDuty mengirim berdasarkan integration key. Setelah disimpan, Anda bisa memilihnya lewat Layanan/integrasi di aturan notifikasi; untuk sekarang isikan sendiri di sini, boleh lebih dari satu.",
    "pagerduty_keys_placeholder": "Ketik integration key lalu tekan Enter",
    "user_ids": "Pilih pengguna",
    "user_group_ids": "Pilih tim",
    "mode": {
      "history": "Event historis",
      "mock": "Event simulasi"
    },
    "empty_alert": "Lingkungan ini belum punya event alert historis",
    "switch_btn": "Uji dengan event simulasi",
    "result_success": "Berhasil dikirim",
    "result_success_desc": "Periksa grup atau kotak masuk terkait untuk memastikan pesannya sampai",
    "result_failed": "Gagal dikirim"
  }
};

export default id_ID;
