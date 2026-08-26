const id_ID = {
  "title": "Pencarian log",
  "tab": {
    "rename": "Ganti nama"
  },
  "query": "Kondisi kueri",
  "query_is_required": "Kondisi kueri tidak boleh kosong",
  "execute": "Kueri",
  "mode": {
    "label": "Mode",
    "raw_logs": "Log mentah",
    "statistical_charts": "Grafik statistik"
  },
  "mode_switch": {
    "confirm_title": "Konfirmasi pergantian mode",
    "confirm_content": "Kueri pada mode grafik statistik saat ini memuat tanda pipa (|), yang tidak tersedia pada mode log mentah. Berpindah mode akan mengosongkan kuerinya. Lanjutkan?",
    "confirm_ok": "Lanjutkan berpindah",
    "confirm_cancel": "Batal"
  },
  "before_query": "Klik <b>Kueri</b> untuk menampilkan datanya",
  "loading": "Memuat data…",
  "no_data": "Kueri tidak mengembalikan data",
  "histogram_hide": "Sembunyikan grafik",
  "histogram_show": "Tampilkan grafik",
  "share_btn": "Tautan berbagi",
  "share_tip": "Klik untuk menyalin tautan berbagi",
  "log_viewer_drawer_trigger_tip": "Klik untuk melihat detail log",
  "log_viewer_drawer_title": "Detail log",
  "copy_to_clipboard": "Salin ke papan klip",
  "unindexable": "Statistik tidak aktif pada field ini, sehingga analisis statistik tidak bisa dilakukan",
  "topn_no_data": "Tidak ada data",
  "stats": {
    "unique_count": "Jumlah nilai unik",
    "min": "Minimum",
    "max": "Maksimum",
    "sum": "Jumlah",
    "avg": "Rata-rata",
    "exist_ratio": "Proporsi log yang memuat field ini",
    "median": "Median",
    "p95": "Persentil (P95)"
  },
  "field_popover_info_alert": "Klik sebuah nilai untuk melihat grafik statistik dan SQL-nya",
  "field_search_placeholder": "Cari field",
  "field_list": {
    "show_fields": "Field yang ditampilkan",
    "available_fields": "Field yang tersedia"
  },
  "field_actions": {
    "and": "Tambahkan ke pencarian ini",
    "not": "Kecualikan dari pencarian ini",
    "exists": "Saring dokumen yang memuat field ini"
  },
  "field_values_topn": {
    "title": "{{n}} nilai teratas",
    "settings": {
      "title": "Pengaturan N nilai teratas"
    },
    "no_data": "Field ini ada di mapping, tetapi tidak muncul di 500 dokumen yang ditampilkan",
    "quick_view_count": "Jumlah log",
    "quick_view_ratio": "Proporsi"
  },
  "empty_value_not_supported_tip": "Pencarian atas nilai kosong belum didukung",
  "unsupported_datasource_type": "Jenis sumber data {{type}} tidak didukung sehingga tidak bisa ditampilkan",
  "no_supported_datasource_types_title": "Tidak ada jenis sumber data yang tersedia",
  "no_supported_datasource_types_desc": "Konfigurasikan di halaman <a>manajemen sumber data</a> atau minta administrator melakukannya. Jenis sumber data yang saat ini didukung: {{types}},",
  "field_tip": "Klik untuk melihat statistiknya",
  "field_value_statistic": {
    "view_statistic": "Lihat nilai statistik",
    "view_timeseries": "Lihat grafik deret waktu"
  },
  "field_type": "Jenis",
  "field_type_map": {
    "float": "Bilangan pecahan",
    "float64": "Bilangan pecahan 64-bit",
    "scaled_float": "Bilangan pecahan terskala",
    "double": "Bilangan pecahan presisi ganda",
    "integer": "Bilangan bulat",
    "int64": "Bilangan bulat 64-bit",
    "long": "Bilangan bulat panjang",
    "date": "Tanggal",
    "date_nanos": "Tanggal nanodetik",
    "string": "Teks",
    "text": "Teks",
    "nested": "Objek bersarang",
    "histogram": "Histogram",
    "boolean": "Boolean"
  },
  "logs": {
    "title": "Data log",
    "stream_fields_count": "{{count}}",
    "text": "Teks log",
    "duration": "Durasi",
    "count": "Jumlah",
    "filter_fields": "Field filter",
    "settings": {
      "mode": {
        "origin": "Mentah",
        "table": "Tabel",
        "timeseries": "Grafik deret waktu",
        "clustering": "Pengelompokan"
      },
      "breakLine": "Bungkus baris",
      "reverse": "Waktu",
      "lines": "Nomor baris",
      "time": "Waktu log",
      "organizeFields": {
        "title": "Pengaturan kolom field",
        "allFields": "Field yang tersedia",
        "showFields": "Field yang ditampilkan",
        "showFields_empty": "Secara bawaan semua field log ditampilkan",
        "tip": "Saat ini hanya field {{fields}} yang tampil; klik ikon pengaturan untuk menampilkan semuanya"
      },
      "jsonSettings": {
        "title": "Pengaturan JSON",
        "displayMode": "Jenis tampilan bawaan",
        "displayMode_tree": "Tampilan pohon",
        "displayMode_string": "Tampilan teks",
        "expandLevel": "Kedalaman bentang bawaan"
      },
      "pageLoadMode": {
        "title": "Mode penomoran halaman",
        "pagination": "Penomoran halaman",
        "infiniteScroll": "Muat lebih banyak saat digulir"
      },
      "topNSettings": {
        "title": "Pengaturan N nilai teratas"
      }
    },
    "fieldLabelTip": "Statistik tidak aktif pada field ini, sehingga analisis statistik tidak bisa dilakukan",
    "filterAnd": "Tambahkan \"{{token}}\" ke pencarian ini",
    "filterNot": "Kecualikan \"{{token}}\" dari pencarian ini",
    "filterAllAnd": "Tambahkan semuanya ke pencarian ini",
    "filterAllNot": "Kecualikan semuanya dari pencarian ini",
    "filterExists": "Saring dokumen yang memuat field ini",
    "add_drilldown_link": "Tambah tautan telusur",
    "drilldown_link_default_name": "Tautan telusur",
    "total": "Jumlah log",
    "stack_group_by_tip": "Tampilkan grafik tren bertumpuk berdasarkan nilai field ini",
    "collapse": "Ciutkan",
    "expand": "Bentangkan",
    "copy_field_value": "Salin nilai field"
  },
  "clustering": {
    "count": "Cacah",
    "log_data": "Data log",
    "row_number": "Nomor baris",
    "log_statistics": "Statistik log",
    "back_to_all_logs": "Kembali ke semua log",
    "all_log_statistics": "Statistik semua log",
    "current_page_field": "Saat ini field pada halaman ini",
    "aggregate": "dikelompokkan,",
    "cannot_aggregate": "belum bisa dikelompokkan untuk",
    "full_aggregate_logs": "Pengelompokan seluruh log",
    "need_aggregate": "Bila Anda ingin mengelompokkan seluruh",
    "click_to_aggregate": "log, klik",
    "full_aggregate": "Kelompokkan semuanya",
    "field_label": "Field pengelompokan",
    "scope_current_page": "Halaman ini",
    "scope_current_page_desc": "Hanya field pada halaman ini yang dikelompokkan",
    "scope_full": "Kelompokkan semuanya",
    "scope_full_desc_prefix": "Dari hasil kueri saat ini",
    "scope_full_desc_disable_prefix": "Belum bisa dikelompokkan untuk hasil kueri sebanyak",
    "scope_full_desc_suffix": "log",
    "scope_label": "Cakupan",
    "aggregate_field": "Field pengelompokan:",
    "log_count": "Jumlah log:",
    "duration": "Durasi:",
    "top5_title": "5 nilai teratas",
    "no_data": "Belum ada data",
    "loading_title": "Sedang menganalisis pengelompokan, mohon tunggu",
    "loading_info": "Jumlah log yang dikelompokkan:",
    "loading_field": "Field pengelompokan:",
    "loading_tip": "Jangan tutup halaman ini. Untuk kueri baru,",
    "loading_new_tab": "buka tab baru",
    "loading_tip_suffix": "untuk mencari log",
    "sampled_tip": "Jumlah lognya terlalu banyak, jadi hasil pengelompokan ini dibuat dari sampel log"
  },
  "view_placeholder": "Tampilan log"
};

export default id_ID;
