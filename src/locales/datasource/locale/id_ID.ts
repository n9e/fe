const id_ID = {
  "es": {
    "ref": "Nama",
    "index": "Indeks",
    "index_tip": "\n      Beberapa cara konfigurasi didukung\n      <1 />\n      1. Satu indeks: gb mencari semua dokumen di indeks gb\n      <1 />\n      2. Beberapa indeks: gb,us mencari semua dokumen di indeks gb dan us\n      <1 />\n      3. Awalan indeks: g*,u* mencari semua dokumen di indeks mana pun yang diawali g atau u\n      <1 />\n      ",
    "index_msg": "Indeks tidak boleh kosong",
    "indexPattern": "Pola indeks",
    "indexPatterns": "Pola indeks",
    "indexPattern_msg": "Pola indeks tidak boleh kosong",
    "indexPatterns_manage": "Kelola pola indeks",
    "filter": "Filter",
    "index_placeholder": "Indeks log-* (wildcard didukung)",
    "index_pattern_placeholder": "Pilih pola indeks",
    "filter_placeholder": "Filter status:500 AND method:GET",
    "syntax": "Sintaks",
    "time_label": "Granularitas waktu",
    "date_field": "Field tanggal",
    "date_field_msg": "Field tanggal tidak boleh kosong",
    "interval": "Interval",
    "value": "Ekstraksi nilai",
    "func": "Fungsi",
    "funcField": "Nama field",
    "histogram": {
      "interval": "Langkah"
    },
    "terms": {
      "label": "Kelompokkan berdasarkan field yang ditentukan",
      "more": "Pengaturan lanjutan",
      "size": "Jumlah kecocokan",
      "min_doc_count": "Minimum dokumen"
    },
    "raw": {
      "limit": "Jumlah log",
      "date_format": "Format tanggal",
      "date_format_tip": "Gunakan pola format Moment.js, misalnya YYYY-MM-DD HH:mm:ss.SSS"
    },
    "alert": {
      "query": {
        "title": "Statistik kueri",
        "preview": "Pratinjau data"
      },
      "trigger": {
        "title": "Kondisi alert",
        "builder": "Mode sederhana",
        "code": "Mode ekspresi",
        "label": "Label terkait"
      },
      "prom_eval_interval_tip": "Menanyakan penyimpanan setiap {{num}} detik",
      "prom_for_duration_tip": "Biasanya durasi lebih besar daripada frekuensi eksekusi: dalam rentang durasi itu kueri dijalankan beberapa kali dan alert baru muncul jika semuanya terpicu. Dengan durasi 0, satu kali kueri memenuhi kondisi sudah cukup untuk memunculkan alert",
      "advancedSettings": "Pengaturan lanjutan",
      "delay": "Eksekusi tertunda"
    },
    "event": {
      "groupBy": "Dikelompokkan berdasarkan {{field}}, {{size}} kecocokan, minimum {{min_doc_count}} dokumen",
      "logs": {
        "title": "Detail log",
        "size": "Jumlah hasil",
        "fields": "Field filter",
        "jsonParseError": "Gagal mengurai"
      }
    },
    "syntaxOptions": "Opsi sintaks",
    "queryFailed": "Kueri gagal. Coba lagi nanti",
    "offset_tip": "Menanyakan data sebelum periode yang ditentukan, seperti offset pada PromQL, dalam detik"
  },
  "datasource": {
    "max_query_rows": "Jumlah baris maksimum yang dikembalikan satu permintaan",
    "max_idle_conns": "Maksimum koneksi menganggur",
    "max_open_conns": "Maksimum koneksi terbuka",
    "conn_max_lifetime": "Masa hidup maksimum koneksi (detik)",
    "timeout": "Batas waktu (detik)",
    "timeout_ms": "Batas waktu (milidetik)"
  },
  "query": {
    "title": "Statistik kueri",
    "execute": "Kueri",
    "query": "Kondisi kueri",
    "query_required": "Kondisi kueri tidak boleh kosong",
    "query_placeholder": "Ketik SQL kueri; gunakan Shift+Enter untuk baris baru",
    "query_placeholder2": "Gunakan Shift+Enter untuk baris baru",
    "advancedSettings": {
      "title": "Konfigurasi tambahan",
      "tags_placeholder": "Tekan Enter untuk menambahkan beberapa",
      "valueKey": "Field nilai",
      "valueKey_tip": "Hasil kueri SQL biasanya punya beberapa kolom; tentukan kolom mana yang nilainya digambar pada grafik",
      "valueKey_required": "Field nilai tidak boleh kosong",
      "labelKey": "Field label",
      "labelKey_tip": "Hasil kueri SQL biasanya punya beberapa kolom; tentukan kolom mana yang menjadi label seri"
    }
  }
};

export default id_ID;
