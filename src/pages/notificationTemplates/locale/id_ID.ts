const id_ID = {
  "title": "Templat pesan",
  "add_title": "Tambah templat pesan",
  "edit_title": "Ubah templat pesan",
  "clone_title": "Klon templat pesan",
  "user_group_ids": "Tim yang diberi izin",
  "private": {
    "0": "Umum",
    "1": "Privat",
    "title": "Mode tampilan"
  },
  "notify_channel_ident": "Jenis media",
  "content": {
    "add_title": "Tambah field templat",
    "edit_title": "Ubah field templat",
    "preview": "Pratinjau isi templat",
    "contentKey": "Identitas field",
    "tip": "Field yang bisa dipakai di media notifikasi; isinya dirujuk lewat $tpl.{{contentKey}}",
    "prompt": "Isinya telah berubah. Buang perubahan tersebut?",
    "value_msg": "Masukkan isi field",
    "ai_generate": "Buat dengan AI"
  },
  "preview": {
    "mode": {
      "history": "Event historis",
      "mock": "Event simulasi"
    },
    "empty_alert": "Lingkungan ini belum punya event alert historis",
    "switch_btn": "Pratinjau dengan event simulasi",
    "select_events": "Pilih event alert",
    "result": "Pratinjau hasil"
  },
  "starter": {
    "rule_name": "Aturan",
    "severity": "Tingkat keparahan",
    "status": "Status",
    "firing": "Terpicu",
    "recovered": "Pulih",
    "tags": "Label",
    "trigger_value": "Nilai saat terpicu",
    "time": "Waktu",
    "detail": "Detail"
  },
  "empty_guide": {
    "title": "Buat templat pesan pertamamu",
    "desc": "Templat pesan menentukan tata isi notifikasi alert. Saat dibuat, sebuah templat siap pakai dihasilkan otomatis sesuai media notifikasi yang dipilih, dan kamu bisa menyesuaikannya dari sana."
  },
  "fields_panel": {
    "desc": "Variabel event alert yang bisa dirujuk di dalam templat. Klik salah satunya untuk menyalin, lalu tempelkan di editor sebelah kiri.",
    "fields": {
      "event": "Seluruh objek event alert, berguna untuk memeriksa semua fieldnya saat menelusuri masalah",
      "labels": "Pemetaan label event, setara dengan $event.TagsMap",
      "value": "Nilai saat terpicu, setara dengan $event.TriggerValue",
      "domain": "Alamat situs, dipakai menyusun tautan detail event",
      "timestamp": "Waktu saat ini, biasanya dipakai sebagai waktu pengiriman pesan",
      "timeformat": "Memformat stempel waktu menjadi waktu yang terbaca; bisa diganti dengan field waktu mana pun",
      "Id": "ID event alert",
      "Cate": "Kategori alert, misalnya 'prometheus'",
      "Cluster": "Nama sumber data",
      "DatasourceId": "ID sumber data",
      "GroupId": "ID grup bisnis",
      "GroupName": "Nama grup bisnis",
      "Hash": "Hash event alert",
      "RuleId": "ID aturan",
      "RuleName": "Nama aturan",
      "RuleNote": "Catatan aturan",
      "RuleHash": "Hash aturan",
      "Severity": "Tingkat alert (1-3)",
      "Status": "Status alert",
      "PromQl": "Kueri alert",
      "PromForDuration": "Durasi (detik)",
      "PromEvalInterval": "Interval evaluasi (detik)",
      "SubRuleId": "ID aturan langganan",
      "TriggerTime": "Stempel waktu saat terpicu",
      "TriggerValue": "Nilai saat terpicu",
      "TriggerValues": "Nilai saat terpicu (format mentah)",
      "FirstTriggerTime": "Pertama kali terpicu",
      "IsRecovered": "Sudah pulih",
      "NotifyCurNumber": "Jumlah notifikasi saat ini",
      "LastEvalTime": "Waktu evaluasi terakhir",
      "LastSentTime": "Waktu pengiriman terakhir",
      "TagsJSON": "Larik label",
      "TagsMap": "Pemetaan pasangan kunci-nilai label",
      "TagsMap_instance": "Mengambil satu label tertentu; ganti instance dengan nama labelmu",
      "AnnotationsJSON": "Pemetaan pasangan kunci-nilai anotasi",
      "AnnotationsJSON_summary": "Mengambil satu anotasi tertentu; ganti summary dengan nama anotasimu",
      "TargetIdent": "Identitas target",
      "TargetNote": "Catatan target",
      "NotifyRecovered": "Beritahukan pemulihan",
      "NotifyChannelsJSON": "Daftar kanal notifikasi",
      "NotifyGroupsJSON": "Daftar grup notifikasi",
      "NotifyRuleIds": "Daftar ID aturan notifikasi",
      "CallbacksJSON": "Daftar URL callback",
      "ExtraConfig": "Informasi konfigurasi tambahan",
      "ExtraInfo": "Daftar informasi tambahan",
      "ExtraInfoMap": "Pemetaan informasi tambahan"
    },
    "search_placeholder": "Cari field",
    "no_match": "Tidak ada field yang cocok",
    "copy_tip": "Klik untuk menyalin",
    "groups": {
      "common": "Sering dipakai",
      "basic": "Informasi dasar",
      "trigger": "Terkait pemicu",
      "tags": "Label dan anotasi",
      "target": "Terkait mesin",
      "notify": "Terkait notifikasi",
      "extra": "Callback dan perluasan"
    }
  }
};

export default id_ID;
