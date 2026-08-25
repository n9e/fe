const id_ID = {
  "explorer": {
    "execute": "Kueri",
    "query": "Kondisi kueri",
    "query_required": "Kondisi kueri tidak boleh kosong",
    "query_lanaguage_docs": "Dokumentasi bahasa kueri",
    "limit": "Batas jumlah",
    "hits": "Hasil pencocokan",
    "graph_settings": {
      "title": "Pengaturan grafik",
      "stacked": "Tumpuk",
      "fill": "Isian"
    },
    "view": {
      "group": "Grup",
      "table": "Tabel",
      "json": "JSON"
    },
    "total_logs_returned": "Total log yang dikembalikan",
    "total_groups": "Total grup",
    "page_size": "Jumlah per halaman",
    "page_size_all": "Semua",
    "expand_all": "Bentangkan semua",
    "collapse_all": "Ciutkan semua",
    "group_view": {
      "ungrouped": "Tanpa grup",
      "group_by_field": "Dikelompokkan menurut \"{{field}}\"",
      "entries": "entri",
      "show_field_tip": "Field yang ditampilkan",
      "hide_field_tip": "Sembunyikan field",
      "group_by_field_icon_tip": "Kelompokkan menurut field ini"
    },
    "group_view_settings": {
      "title": "Pengaturan tampilan grup",
      "group_by_field": "Field pengelompokan",
      "group_by_field_help": "Pilih sebuah field untuk mengelompokkan log; bawaannya _stream",
      "ungrouped": "Jangan kelompokkan",
      "display_fields": "Field yang ditampilkan",
      "display_fields_help": "Pilih field yang ditampilkan; bawaannya _msg",
      "date_format": "Format tanggal",
      "date_format_help01": "Tetapkan format tanggal, misalnya YYYY-MM-DD HH:mm:ss. <a>Lihat dokumentasi ini untuk selengkapnya</a>",
      "date_format_help02": "Format tanggalmu saat ini: {{dateFormat}}"
    },
    "table_view_settings": {
      "title": "Pengaturan tampilan tabel",
      "customize_columns": "Kolom khusus",
      "search_columns": "Cari kolom",
      "check_all": "Pilih semua"
    },
    "copy_json": "Salin JSON",
    "parse_failed": "Tidak dapat diurai",
    "timeseries": {
      "value_field": "Field nilai",
      "value_field_tip": "Field numerik untuk menggambar grafik deret waktu; beberapa field boleh diisi",
      "value_field_required": "Pilih field nilai",
      "label_field": "Field label",
      "label_field_tip": "Field label untuk membedakan antar seri; beberapa field boleh diisi",
      "unit": "Satuan"
    }
  },
  "builder": {
    "filter": "Filter",
    "add": "Tambah",
    "field": "Field",
    "operator": "Operator",
    "value": "Nilai",
    "function": "Fungsi",
    "quantile": "Persentil",
    "alias": "Alias",
    "order_by": "Urutan",
    "direction": "Urutan",
    "field_placeholder": "Masukkan field",
    "value_placeholder": "Masukkan sebuah nilai",
    "operator_placeholder": "Pilih operator",
    "function_placeholder": "Pilih fungsi",
    "alias_placeholder": "Masukkan alias",
    "select_field": "Pilih field",
    "select_operator": "Pilih operator",
    "input_value": "Masukkan sebuah nilai",
    "select_function": "Pilih fungsi",
    "input_field": "Masukkan field",
    "input_quantile": "Masukkan persentilnya",
    "select_direction": "Pilih pengurutan",
    "aggregation": "Agregasi",
    "aggregation_required": "Konfigurasikan setidaknya satu agregasi",
    "display": "Tampilan",
    "filter_relation_tip": "Antar semua filter berlaku hubungan DAN.",
    "statistical_value": "Nilai statistik",
    "timeseries": "Grafik deret waktu",
    "group_by": "Grup",
    "limit": "Batas jumlah",
    "execute": "Kueri",
    "preview_ql": "Pratinjau kueri",
    "pin": "Tetap",
    "unpin": "Lepas sematan"
  },
  "datasource": {},
  "alert": {
    "query_warning_no_time": "Sangat disarankan membatasi rentang waktu secara eksplisit dengan _time, yaitu field waktu, di dalam kueri; tanpa itu bisa timbul masalah seperti <b>beban penyimpanan yang tidak wajar dan kueri alert yang melewati batas waktu</b>"
  }
};

export default id_ID;
