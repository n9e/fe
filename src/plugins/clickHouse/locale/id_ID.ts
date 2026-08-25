const id_ID = {
  "preview": "Pratinjau data",
  "query": {
    "title": "Statistik kueri",
    "execute": "Kueri",
    "query": "SQL",
    "query_required": "SQL tidak boleh kosong",
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
    },
    "schema": "Metadata",
    "document": "Dokumentasi",
    "dashboard": {
      "mode": {
        "label": "Mode kueri",
        "table": "Data non-deret waktu",
        "timeSeries": "Data deret waktu"
      }
    },
    "historicalRecords": {
      "button": "Riwayat",
      "searchPlaceholder": "Riwayat pencarian"
    },
    "compass_btn_tip": "Klik untuk melihat data tabel",
    "database": "Basis data",
    "database_msg": "Pilih basis data",
    "table": "Tabel",
    "table_msg": "Pilih tabel",
    "time_field": "Field tanggal",
    "time_field_msg": "Pilih field tanggal",
    "duration": "Durasi",
    "count": "Jumlah",
    "navMode": {
      "fields": "Tampilan field",
      "schema": "Tampilan struktur tabel"
    },
    "add_to": {
      "btn": "Tambahkan ke…",
      "recording_rule": "Tambahkan ke aturan perekaman",
      "add_recording_rule_title": "Tambah aturan perekaman"
    },
    "sql_format": {
      "title": "Pratinjau SQL",
      "tip": "SQL yang lebih rumit seperti nilai maksimum, minimum, dan persentil sebuah field bisa dilihat dengan mengeklik field di daftar sebelah kiri.",
      "origin": "Lihat log mentah",
      "origin_tip": "Bisa disalin ke Tampilan struktur tabel -> mode Tabel untuk melihat datanya",
      "timeseries": "Lihat grafik deret waktu",
      "timeseries_tip": "Bisa disalin ke Tampilan struktur tabel -> mode Grafik deret waktu untuk melihat datanya, atau dipakai di dasbor untuk menggambar grafik deret waktu dari data ClickHouse.",
      "table": "Lihat nilai statistik",
      "table_tip": "Bisa dipakai membuat aturan alert dan aturan perekaman ClickHouse, serta metrik Polaris."
    },
    "warn_message_btn_1": "Tetap jalankan kueri",
    "warn_message_btn_2": "Kembali dan ubah",
    "warn_message": "Kueri ini tidak memuat makro waktu, sehingga rentang waktu yang kamu pilih tidak berlaku!",
    "warn_message_content_1": "Kueri ini berpotensi memindai seluruh tabel. Pertimbangkan dampaknya terhadap performa penyimpanan, lalu putuskan untuk melanjutkan atau kembali menambahkan makro waktu.",
    "warn_message_content_2": "Makro waktu yang umum: ",
    "warn_message_content_3": "Contoh:",
    "warn_message_content_4": "Cara memakai makro waktu: <a>selengkapnya</a>",
    "default_search_by_tip": "Field pencarian bawaan",
    "default_search_tip_1": "Jadikan field pencarian bawaan",
    "default_search_tip_2": "Batalkan sebagai field pencarian bawaan",
    "stack_disabled_tip": "Grafik bertumpuk tidak tersedia bila jumlah nilai uniknya hanya satu atau lebih dari sepuluh",
    "stack_tip_pin": "Aktifkan grafik bertumpuk",
    "stack_tip_unpin": "Matikan grafik bertumpuk",
    "stack_group_by_tip": "Tampilkan grafik tren bertumpuk berdasarkan nilai field ini",
    "syntax": {
      "query": "Mode Query",
      "sql": "Mode SQL"
    },
    "sqlVizType": {
      "table": "Tabel",
      "timeseries": "Grafik deret waktu"
    }
  },
  "builder": {
    "to_pinned_btn": "Tetap",
    "to_unpinned_btn": "Lepas sematan",
    "database_table": {
      "label": "Basis data dan tabel",
      "database": "Basis data",
      "table": "Tabel"
    },
    "filters": {
      "label": "Filter",
      "label_tip": "Antar semua filter berlaku hubungan DAN.",
      "add": "Tambah",
      "field": "Field",
      "field_placeholder": "Pilih field",
      "operator": "Operator",
      "operator_placeholder": "Pilih operator",
      "value": "Nilai",
      "value_placeholder": "Pilih sebuah nilai",
      "disabled": "Nonaktifkan",
      "tip_1": "Field ini tidak punya indeks NGram BloomFilter sehingga bisa memicu pemindaian seluruh tabel. Sebaiknya tambahkan indeks atau pilih operator lain"
    },
    "aggregates": {
      "label": "Agregasi",
      "add": "Tambah",
      "func": "Fungsi agregasi",
      "func_placeholder": "Pilih fungsi agregasi",
      "field": "Field",
      "field_placeholder": "Pilih field",
      "percentile": "Persentil",
      "percentile_placeholder": "Masukkan persentilnya",
      "precision": "Presisi",
      "precision_placeholder": "Masukkan presisinya",
      "n": "Nilai N",
      "n_placeholder": "Masukkan nilai N",
      "alias": "Alias",
      "alias_placeholder": "Masukkan alias",
      "options": {
        "COUNT": "Jumlah log",
        "CPS": "Hitungan per detik",
        "AVG": "Rata-rata",
        "SUM": "Jumlah",
        "MIN": "Minimum",
        "MAX": "Maksimum",
        "PERCENTILE": "Persentil",
        "UNIQUE_COUNT": "Jumlah nilai unik",
        "EXIST_RATIO": "Proporsi log yang memuat sumber daya ini",
        "TOPN": "N nilai teratas",
        "RATIO": "Proporsi",
        "VARIANCE": "Varians",
        "STDDEV": "Simpangan baku"
      }
    },
    "display_label": "Tampilan",
    "mode": {
      "table": "Nilai statistik",
      "timeseries": "Grafik deret waktu"
    },
    "group_by": "Grup",
    "order_by": {
      "label": "Urutan",
      "add": "Tambah",
      "field": "Field",
      "field_placeholder": "Pilih field",
      "direction": "Arah pengurutan",
      "direction_placeholder": "Pilih arah pengurutan",
      "asc": "Menaik",
      "desc": "Menurun"
    },
    "limit": "Batas jumlah",
    "excute": "Kueri",
    "preview_sql": "Pratinjau SQL",
    "btn_tip": "Setelah diklik, isi kotak SQL akan ditimpa",
    "btn_failed_tip": "Konversi gagal. Coba lagi, atau ubah formulirnya",
    "preview_and_run": "Pratinjau SQL lalu jalankan",
    "builder_content_modified": "Isi builder telah berubah. Pratinjau SQL terbarunya"
  },
  "trigger": {
    "title": "Kondisi alert",
    "value_msg": "Masukkan nilai ekspresi"
  }
};

export default id_ID;
