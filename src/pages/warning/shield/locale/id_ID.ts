const id_ID = {
  "title": "Aturan pembisuan",
  "edit_missing_params": "Parameter yang dibutuhkan tidak lengkap sehingga tidak bisa disunting. Hubungi administrator",
  "search_placeholder": "Cari judul aturan, label, atau alasan pembisuan",
  "datasource_type": "Jenis sumber data",
  "datasource_id": "Sumber data",
  "cause": "Alasan pembisuan",
  "cause_tip": "Catat latar belakang pembisuan ini agar rekan tim paham alasannya dan kapan bisa dicabut",
  "cause_placeholder": "Misalnya: rilis layanan pesanan, diperkirakan selesai dalam 1 jam",
  "time": "Waktu pembisuan",
  "note": "Judul aturan",
  "btime": "Waktu mulai pembisuan",
  "btime_msg": "Waktu mulai pembisuan tidak boleh kosong",
  "duration": "Durasi pembisuan",
  "duration_quick": "Durasi cepat",
  "duration_quick_tip": "Waktu selesai dihitung dari Waktu mulai pembisuan; waktu mulai dan selesai di bawah juga bisa langsung diubah",
  "etime": "Waktu selesai pembisuan",
  "etime_msg": "Waktu selesai pembisuan tidak boleh kosong",
  "etime_before_btime_msg": "Waktu selesai pembisuan harus setelah waktu mulainya",
  "expired_tip": "Aturan ini sudah kedaluwarsa dan kini tidak membisukan alert apa pun. Untuk memberlakukannya lagi, pilih durasi cepat atau ubah waktu selesainya",
  "long_duration_tip": "Pembisuan berlangsung lebih dari {{days}} hari, sehingga alert selama itu lama tidak terlihat. Pastikan ini memang yang kamu maksud",
  "prod": "Jenis pemantauan",
  "severities": "Tingkat event",
  "severities_tip": "Hanya tingkat yang dicentang yang dibisukan; tingkat lainnya tetap memicu alert seperti biasa",
  "severities_msg": "Tingkat event tidak boleh kosong",
  "scope_unlimited_tip": "Sumber data dan label event belum dikonfigurasi, sehingga aturan ini membisukan semua event alert di grup bisnis yang dipilih. Pastikan ini memang yang kamu maksud",
  "mute_type": {
    "0": "Waktu tetap",
    "1": "Waktu berulang",
    "label": "Jenis waktu pembisuan",
    "days_of_week": "Waktu pembisuan",
    "days_preset": {
      "everyday": "Setiap hari",
      "workday": "Hari kerja",
      "weekend": "Akhir pekan"
    },
    "start": "Mulai",
    "start_msg": "Waktu mulai tidak boleh kosong",
    "end": "Selesai",
    "end_msg": "Waktu selesai tidak boleh kosong",
    "periodic_tip": "Pembisuan berulang berlaku terus-menerus: setiap minggu, alert yang jatuh pada periode di atas dibisukan. Waktu mulai yang sama dengan waktu selesai berarti sepanjang hari"
  },
  "mute_method": {
    "0": "Bisukan event dan notifikasi",
    "1": "Bisukan notifikasi saja",
    "hint_title": "Cara memilih di antara dua mode pembisuan",
    "hint_notify_only": "Bisukan notifikasi saja: event tetap muncul dan tercatat, hanya notifikasinya yang tidak dikirim. Cocok untuk mulai ulang mesin atau pekerjaan pemeliharaan, karena anomali selama periode itu masih bisa ditinjau kemudian.",
    "hint_all": "Bisukan event dan notifikasi: eventnya pun tidak dibuat. Cocok untuk kebisingan yang sudah dipastikan tidak perlu diperhatikan.",
    "hint_dismiss": "Jangan tampilkan lagi",
    "label": "Mode pembisuan",
    "0_desc": "(event tidak dibuat dan notifikasi tidak dikirim)",
    "1_desc": "(event tetap tercatat, hanya notifikasi yang tidak dikirim)",
    "tip": "Dengan Bisukan notifikasi saja, alert yang cocok selama periode pembisuan tetap menghasilkan event dan tercatat, hanya notifikasinya yang ditahan. Ini memudahkanmu melihat apakah ada anomali selama masa perubahan, lalu mencabut pembisuannya setelah semuanya pulih."
  },
  "tag": {
    "key": {
      "label": "Label event",
      "tip": "Label di sini adalah label pada event alert, yang dipakai memfilter event lewat aturan pencocokan berikut. Beberapa operator didukung:\n\n- `==` mencocokkan satu nilai label tertentu; hanya satu nilai boleh diisi, dan untuk beberapa nilai sekaligus gunakan operator `in`\n- `=~` menerima ekspresi reguler untuk mencocokkan nilai label secara fleksibel\n- `in` mencocokkan beberapa nilai label, mirip operasi `in` pada SQL\n- `not in` mengecualikan beberapa nilai label sekaligus, mirip operasi `not in` pada SQL\n- `!=` tidak sama dengan, untuk mengecualikan satu nilai label tertentu\n- `!~` tidak cocok dengan regex: semua nilai label yang cocok dengan regex ini dikecualikan, seperti `!~` pada PromQL"
    }
  },
  "name_auto_tip": "Judul dibuat otomatis dari filter di atas, dan boleh diubah kapan saja",
  "name_auto_template": "Bisukan {{scope}}",
  "name_auto_separator": "、",
  "name_auto_all_alerts": "Semua alert",
  "summary": {
    "severities_all": "Semua tingkat",
    "tags_none": "Label tidak dibatasi",
    "tags_count": "{{count}} kondisi label",
    "periodic_count": "{{count}} periode waktu"
  },
  "basic_configs": "Informasi dasar",
  "basic_configs_desc": "Judul aturan dan alasan pembisuan, agar tim mudah berkoordinasi dan menemukannya kembali",
  "filter_configs": "Filter",
  "filter_configs_desc": "Menentukan event alert mana yang dibisukan: grup bisnis, sumber data, tingkat event, dan label event. Antar kondisi berlaku DAN, dan yang dikosongkan tidak membatasi apa pun",
  "mute_configs": "Pengaturan pembisuan",
  "mute_configs_desc": "Menentukan kapan pembisuan berlaku dan sejauh apa: sebuah rentang waktu tetap, atau periode yang berulang tiap minggu",
  "alert_content": "Agar aturan yang salah konfigurasi tidak membisukan seluruh alert perusahaan, aturan ini hanya berlaku bagi event alert di grup bisnis tertentu",
  "preview_muted_title": "Pratinjau event terkait",
  "preview_muted_desc": "Berikut event alert yang sudah ada dan cocok dengan filter aturan ini. Setelah disimpan, event sejenis yang baru akan dibisukan, sedangkan event yang sudah ada tidak hilang sendiri dan bisa dihapus sekaligus di sini.",
  "preview_muted_save_only": "Simpan saja",
  "preview_muted_save_and_delete": "Simpan dan hapus event terkait",
  "expired": "Kedaluwarsa",
  "empty_guide": {
    "title": "Belum ada aturan pembisuan",
    "desc": "Selama rilis, pemeliharaan, atau latihan, aturan pembisuan menahan sementara alert yang sudah diketahui agar rekan yang berjaga tidak terganggu. Aturannya berakhir sendiri saat kedaluwarsa, tanpa perlu dicabut manual.",
    "select_busi_group": "Pilih dulu sebuah grup bisnis di kiri sebelum membuat aturan pembisuan"
  },
  "delete_mutes": {
    "title": "Pembersihan aturan pembisuan",
    "alert_message": "Data yang dihapus tidak bisa dikembalikan. Lakukan dengan hati-hati!",
    "timestamp": "Filter waktu",
    "timestamp_options": {
      "1": "Lebih dari 1 bulan lalu",
      "3": "Lebih dari 3 bulan lalu",
      "6": "Lebih dari 6 bulan lalu",
      "12": "Lebih dari 1 tahun lalu"
    }
  },
  "filter_disabled": {
    "0": "Aktifkan",
    "1": "Nonaktifkan",
    "placeholder": "Status aktif"
  }
};

export default id_ID;
