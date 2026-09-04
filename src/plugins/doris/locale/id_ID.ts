const id_ID = {
  "quick_query": "Kueri cepat",
  "quick_query_tip": "Kueri cepat membuat pernyataan kueri dari templat SQL yang tetap; misalnya untuk field A lebih dari 0, cukup ketik A > 0. Tombol ini juga membawa Anda ke mode khusus, tempat SQL-nya bisa dilihat dan diubah",
  "custom_query": "Kueri khusus",
  "custom_query_tip": "Kueri khusus memungkinkan Anda menulis pernyataan kueri sendiri dengan sintaks SQL",
  "current_database": "Basis data saat ini",
  "table": "Tabel",
  "database_table_required": "Pilih dulu basis data dan tabelnya",
  "enrich_queries": {
    "title": "Kueri tambahan"
  },
  "query": {
    "mode": {
      "query": "Mode Query",
      "sql": "Mode SQL"
    },
    "submode": {
      "raw": "Log mentah",
      "timeSeries": "Grafik deret waktu"
    },
    "query_tip": "Contoh SQL:<br />\n    1. Menghitung baris log 5 menit terakhir: SELECT count() as cnt from database.table WHERE date >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)<br />\n    2. Menghitung baris log pada rentang waktu yang dipilih: SELECT COUNT(*) AS `cnt` FROM `database`.`table` WHERE $__timeFilter(`timestamp`)<br />\n    Penjelasan mode SQL selengkapnya ada di <a>panduan mode SQL Doris</a>",
    "query_placeholder": "SELECT count(*) as count FROM db_name.table_name WHERE ts >= now() - 5m",
    "execute": "Kueri",
    "database": "Basis data",
    "database_msg": "Pilih basis data",
    "table": "Tabel",
    "table_msg": "Pilih tabel",
    "time_field": "Field tanggal",
    "time_field_msg": "Pilih field tanggal",
    "time_field_tip": "<span>Makro waktu harus dipakai di dalam kueri agar pemilih waktu ini berpengaruh</span><br/>Cara memakai makro waktu: <a>selengkapnya</a>",
    "query": "Kondisi kueri",
    "query_required": "Kondisi kueri tidak boleh kosong",
    "advancedSettings": {
      "title": "Konfigurasi tambahan",
      "tags_placeholder": "Tekan Enter untuk menambahkan beberapa",
      "valueKey": "Field nilai",
      "valueKey_tip": "Hasil kueri SQL biasanya punya beberapa kolom; tentukan kolom mana yang nilainya digambar pada grafik",
      "valueKey_required": "Field nilai tidak boleh kosong",
      "labelKey": "Field label",
      "labelKey_tip": "Hasil kueri SQL biasanya punya beberapa kolom; tentukan kolom mana yang menjadi label seri"
    },
    "get_index_fail": "Gagal mengambil indeks tabel",
    "warn_message_btn_1": "Tetap jalankan kueri",
    "warn_message_btn_2": "Kembali dan ubah",
    "warn_message": "Kueri ini tidak memuat makro waktu, sehingga rentang waktu yang Anda pilih tidak berlaku!",
    "warn_message_content_1": "Kueri ini berpotensi memindai seluruh tabel. Pertimbangkan dampaknya terhadap performa penyimpanan, lalu putuskan untuk melanjutkan atau kembali menambahkan makro waktu.",
    "warn_message_content_2": "Makro waktu yang umum: ",
    "warn_message_content_3": "Contoh:",
    "warn_message_content_4": "Cara memakai makro waktu: <a>selengkapnya</a>",
    "editMode": {
      "switch_to_builder_confirm_title": "Beralih ke mode builder",
      "switch_to_builder_confirm_content": "Pernyataan SQL saat ini tidak bisa diubah menjadi pengaturan builder, sehingga suntingan SQL-mu akan hilang setelah berpindah. Lanjutkan?",
      "no_builder_config": "Konfigurasikan kuerinya terlebih dahulu",
      "require_db_table": "Pilih dulu basis data dan tabelnya",
      "build_sql_failed": "Gagal membuat SQL"
    },
    "dashboard": {
      "mode": {
        "label": "Mode kueri",
        "table": "Data non-deret waktu",
        "timeSeries": "Data deret waktu"
      }
    },
    "stackByField": "Field penumpukan",
    "stack_disabled_tip": "Grafik bertumpuk tidak tersedia bila jumlah nilai uniknya hanya satu atau lebih dari sepuluh",
    "stack_tip_pin": "Aktifkan grafik bertumpuk",
    "stack_tip_unpin": "Matikan grafik bertumpuk",
    "stack_group_by_tip": "Tampilkan grafik tren bertumpuk berdasarkan nilai field ini",
    "sql_format": {
      "title": "Pratinjau SQL",
      "tip": "SQL yang lebih rumit seperti nilai maksimum, minimum, dan persentil sebuah field bisa dilihat dengan mengeklik field di daftar sebelah kiri.",
      "origin": "Lihat log mentah",
      "origin_tip": "Bisa disalin ke Tampilan struktur tabel -> mode Tabel untuk melihat datanya",
      "timeseries": "Lihat grafik deret waktu",
      "timeseries_tip": "Bisa disalin ke Tampilan struktur tabel -> mode Grafik deret waktu untuk melihat datanya, atau dipakai di dasbor untuk menggambar grafik deret waktu dari data Doris.",
      "table": "Lihat nilai statistik",
      "table_tip": "Bisa dipakai membuat aturan alert dan recording rule Doris, serta metrik Northstar."
    },
    "defaultSearchField": "Field pencarian bawaan",
    "default_search_tip_1": "Jadikan field pencarian bawaan",
    "default_search_tip_2": "Batalkan sebagai field pencarian bawaan",
    "default_search_by_tip": "Field pencarian bawaan",
    "datasource_disabled_tip": "Pilih sumber datanya terlebih dahulu",
    "interval": "Rentang kueri",
    "interval_tip": "Pengaturan rentang kueri hanya berlaku bila makro waktu $__timeFilter dipakai di dalam SQL.<br />Sistem alert memakai jendela waktu itu untuk membatasi data yang dipindai, demi menjaga ketepatan waktu alert dan performa basis data",
    "offset": "Kueri tertunda",
    "offset_tip": "Kueri dijalankan setelah waktunya digeser mundur sekian detik dari waktu kueri saat ini, mirip offset pada PromQL.<br />Ini kerap dipakai saat penulisan data atau jalur pengirimannya tertunda, agar data yang belum tiba tidak memicu alert palsu",
    "sql_warning_1": "Sangat disarankan membatasi rentang waktu secara eksplisit dengan $__timeFilter(field waktu) pada klausa WHERE; tanpa itu bisa timbul masalah seperti <b>beban basis data yang tidak wajar dan kueri alert yang melewati batas waktu</b>",
    "sql_warning_2": "SQL ini memakai $__timeGroup sehingga kuerinya mengembalikan data dari beberapa titik waktu. Dalam hal ini, <b>sistem hanya memakai hasil dari titik waktu terbaru</b>",
    "duration": "Durasi",
    "count": "Jumlah",
    "click_doc": "Klik untuk membuka dokumentasi <a>kondisi kueri</a>",
    "navMode": {
      "fields": "Tampilan field",
      "schema": "Tampilan struktur tabel"
    },
    "syntax": {
      "query": "Mode Query",
      "sql": "Mode SQL"
    },
    "sqlVizType": {
      "table": "Tabel",
      "timeseries": "Grafik deret waktu"
    },
    "add_to": {
      "btn": "Tambahkan ke…",
      "recording_rule": "Tambahkan ke recording rule",
      "add_recording_rule_title": "Tambah recording rule"
    }
  },
  "builder": {
    "to_pinned_btn": "Tetap",
    "open_builder": "Buka builder",
    "config_required": "Konfigurasi builder tidak boleh kosong",
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
        "TOPN": "N nilai teratas"
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
  }
};

export default id_ID;
