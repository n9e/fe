const id_ID = {
  "title": "Dasbor pemantauan",
  "list": "Daftar dasbor",
  "back_icon_tip": "Kembali ke halaman sebelumnya, atau ke daftar dasbor bila tidak ada",
  "back_icon_tip_is_built_in": "Kembali ke halaman sebelumnya, atau ke pusat templat bila tidak ada",
  "name": "Nama dasbor",
  "tags": "Label kategori",
  "ident": "Identitas dalam huruf Latin",
  "ident_msg": "Gunakan huruf, angka, dan tanda hubung",
  "search_placeholder": "Nama dasbor atau label kategori",
  "empty_guide": {
    "title": "Belum ada dasbor",
    "desc": "Buat satu dasbor, atau impor templat dasbor bawaan sekali klik.",
    "from_template": "Impor dari templat"
  },
  "refresh_tip": "Interval muat ulang yang lebih kecil dari step ({{num}} dtk) tidak akan memperbarui data",
  "refresh_btn": "Muat ulang",
  "share_btn": "Bagikan",
  "export_btn": "Ekspor (CSV)",
  "clear_cache_btn": "Bersihkan cache",
  "clear_cache_btn_tip": "Bersihkan cache lebar kolom tabel; berlaku setelah halaman dimuat ulang",
  "inspect_btn": "Telusuri masalah",
  "table_upgrade": {
    "switch_title": "Tingkatkan ke TableNG",
    "switch_content": "Migrasikan konfigurasi Table versi lama secara otomatis?",
    "auto_upgrade": "Tingkatkan otomatis",
    "switch_only": "Hanya ganti jenisnya"
  },
  "public": {
    "name": "Publik",
    "unpublic": "Tidak publik",
    "public_cate": "Jenis",
    "cate": {
      "0": "Akses anonim",
      "1": "Perlu masuk",
      "2": "Akses berdasarkan izin"
    },
    "bgids": "Grup bisnis yang diberi izin",
    "theme_link": {
      "dark": "Tautan tema gelap",
      "light": "Tautan tema terang"
    }
  },
  "sharing_link": {
    "title": "Buat tautan berbagi",
    "title_anonymous": "Buat tautan berbagi (akses anonim)",
    "allow_anonymous": "Izinkan akses anonim tanpa masuk",
    "expire_at": "Masa berlaku",
    "theme": "Tema",
    "theme_default": "Ikuti sistem",
    "theme_dark": "Gelap",
    "theme_light": "Terang",
    "note": "Catatan",
    "note_placeholder": "Catatan (wajib), misalnya untuk ditinjau pelanggan",
    "generate": "Buat tautan",
    "link": "Tautan berbagi",
    "expire_time": "Kedaluwarsa pada",
    "expired": "Kedaluwarsa",
    "create_by": "Dibuat oleh",
    "revoke": "Cabut",
    "revoke_confirm": "Tautan langsung tidak berlaku setelah dicabut. Lanjutkan?",
    "revoked": "Dicabut",
    "anonymous_tip": "Selama masa berlakunya, tautan anonim memungkinkan siapa pun melihat dasbor ini tanpa masuk dan mengueri data dari sumber data yang dirujuknya, jadi bagikan dengan hati-hati",
    "recommend_tip": "Akses anonim berjalan lewat tautan di bawah: selama masa berlakunya, dasbor bisa dibuka tanpa masuk. Untuk akses publik jangka panjang, setel masa berlaku ke satuan tahun",
    "unit_hour": "Jam",
    "unit_day": "Hari",
    "unit_month": "Bulan",
    "unit_year": "Tahun",
    "fetch_failed": "Gagal mengambil daftar tautan berbagi",
    "generate_failed": "Gagal membuat tautan berbagi",
    "revoke_failed": "Gagal mencabut tautan berbagi",
    "config_load_failed": "Gagal membaca konfigurasi dasbor, sehingga akses anonim belum bisa diatur. Tutup dan coba lagi",
    "revoke_all_confirm_title": "Cabut semua tautan berbagi anonim?",
    "revoke_all_confirm_content": "Dasbor ini masih punya {{num}} tautan berbagi anonim yang berlaku. Keberlakuan tautan tidak bergantung pada pengaturan visibilitas, jadi setelah jenisnya diubah pun tautan itu tetap membuka dasbor ini tanpa perlu masuk. Melanjutkan akan mencabut semua tautan berbagi dasbor ini dan menyimpan pengaturannya; pencabutan tidak bisa dibatalkan.",
    "revoke_all_ok": "Cabut lalu simpan",
    "revoke_all_check_failed": "Tidak dapat memastikan apakah dasbor ini masih punya tautan berbagi anonim. Pengaturan visibilitas sudah disimpan; buka dialog tautan berbagi untuk memeriksanya secara manual"
  },
  "default_filter": {
    "title": "Filter bawaan",
    "public": "Dasbor publik",
    "all": "Dasbor grup bisnis saya",
    "all_tip": "Opsi ini menampilkan semua dasbor yang terkait dengan grup bisnis Anda"
  },
  "create_title": "Buat dasbor",
  "edit_title": "Ubah dasbor",
  "add_panel": "Tambah grafik",
  "cluster": "Kluster",
  "full_screen": "Layar penuh",
  "exit_full_screen": "Keluar dari layar penuh",
  "copyPanelTip": "Konfigurasi grafik telah disalin. Klik \"Tambah grafik\" > \"Tempel grafik\" untuk menempelkan JSON-nya dan membuat grafik",
  "batch": {
    "import": "Impor JSON dasbor Nightingale",
    "label": "JSON dasbor",
    "import_grafana": "Impor dasbor Grafana (tidak disarankan)",
    "import_grafana_tip": "Hanya dasbor dengan sumber data Prometheus yang bisa diimpor, sebatas jenis grafik dan fitur yang didukung Nightingale <a>Laporkan masalah</a>",
    "import_grafana_tip_version_error": "Konfigurasi dasbor di bawah v7 tidak bisa diimpor",
    "import_grafana_tip_version_warning": "Saat mengimpor konfigurasi dasbor di bawah v8, sebagian grafik mungkin tidak didukung atau tidak tampil dengan benar",
    "import_grafana_url": "Tautan dasbor Grafana (disarankan)",
    "import_grafana_url_label": "Tautan dasbor Grafana",
    "continueToImport": "Lanjutkan impor",
    "noSelected": "Pilih dasbor",
    "import_builtin": "Impor dasbor bawaan",
    "import_builtin_board": "Dasbor bawaan",
    "clone": {
      "name": "Nama",
      "result": "Hasil",
      "errmsg": "Pesan kesalahan"
    }
  },
  "link": {
    "title": "Tautan dasbor",
    "name": "Nama tautan",
    "url": "URL tautan",
    "isNewBlank": "Buka di jendela baru",
    "dashboardIds_placeholder": "Pilih dasbor"
  },
  "var": {
    "vars": "Variabel",
    "btn": "Tambah variabel",
    "title": {
      "list": "Daftar variabel",
      "add": "Tambah variabel",
      "edit": "Ubah variabel"
    },
    "name": "Nama variabel",
    "name_msg": "Hanya huruf, angka, dan garis bawah yang diizinkan",
    "name_repeat_msg": "Nama variabel sudah dipakai",
    "label": "Nama tampilan",
    "type": "Jenis variabel",
    "type_map": {
      "query": "Kueri (Query)",
      "custom": "Khusus (Custom)",
      "textbox": "Kotak teks (Text box)",
      "constant": "Konstanta (Constant)",
      "datasource": "Sumber data (Datasource)",
      "datasourceIdentifier": "Identitas sumber data (Datasource identifier)",
      "hostIdent": "Identitas mesin (Host ident)"
    },
    "hide": "Sembunyikan variabel",
    "hide_map": {
      "yes": "Ya",
      "no": "Tidak"
    },
    "definition": "Definisi variabel",
    "definition_msg1": "Masukkan definisi variabel",
    "definition_msg2": "Definisi variabel harus berupa JSON yang valid",
    "reg": "Regex",
    "reg_tip": "Opsional: regex untuk menyaring pilihan. Isikan <a>literal ekspresi reguler</a>, yaitu pola yang diapit garis miring",
    "reg_tip2": "Untuk mengambil sebagian dari sebuah pilihan, <a>grup tangkapan bernama bisa memisahkan teks tampilan dari nilainya</a>",
    "multi": "Pilihan ganda",
    "allOption": "Sertakan opsi Semua",
    "allValue": "Nilai khusus untuk opsi Semua",
    "width": "Lebar",
    "width_tip": "Lebar kotak pilihan variabel; kosongkan untuk memakai lebar bawaan 180px",
    "textbox": {
      "defaultValue": "Nilai bawaan",
      "defaultValue_tip": "Opsional: hanya dipakai sebagai nilai bawaan saat pemuatan pertama"
    },
    "custom": {
      "definition": "Nilai khusus dipisahkan koma"
    },
    "constant": {
      "definition": "Nilai konstanta",
      "defaultValue_tip": "Tentukan sebuah nilai konstanta tersembunyi"
    },
    "datasource": {
      "definition": "Jenis sumber data",
      "defaultValue": "Nilai bawaan",
      "regex": "Filter sumber data",
      "regex_tip": "Opsional: regex untuk menyaring pilihan. Isikan <a>literal ekspresi reguler</a>, yaitu pola yang diapit garis miring."
    },
    "hostIdent": {
      "invalid": "Identitas mesin membutuhkan akses berizin, sehingga dasbor dalam mode anonim akan gagal dibuka",
      "invalid2": "Dasbor ini memakai variabel identitas mesin sehingga tidak bisa diakses secara anonim"
    },
    "help_tip": "\n      Cara memakai variabel\n      <1 />\n      ${variable_name}: nilai variabel dasbor\n      <1 />\n      ${__field.name}: nama legenda\n      <1 />\n      ${__field.value}: nilai legenda\n      <1 />\n      ${__field.labels.X}: nilai label\n      <1 />\n      ${__field.labels.__name__}: nama metrik\n      <1 />\n      ${__interval}: interval waktu dalam detik, misalnya 15s, bawaannya step\n      <1 />\n      ${__interval_ms}: interval waktu dalam milidetik, misalnya 15000\n      <1 />\n      ${__range}: rentang waktu dalam detik, misalnya 3600s\n      <1 />\n      ${__range_ms}: rentang waktu dalam milidetik, misalnya 3600000\n      <1 />\n      ${__rate_interval}: interval waktu dalam detik, __interval * 4\n      <1 />\n      ${__from}: waktu mulai dalam milidetik\n      <1 />\n      ${__from_date_seconds}: waktu mulai dalam detik\n      <1 />\n      ${__from_date_iso}: waktu mulai, ISO 8601/RFC 3339\n      <1 />\n      Sintaks di atas berlaku juga untuk ${__to}\n    ",
    "help_tip_table_ng": "\n      Cara memakai variabel\n      <br />\n      ${variable_name}: nilai variabel dasbor\n      <br />\n      ${__row.column_name}: nilai salah satu kolom pada baris data\n      <br />\n      ${__interval}: interval waktu dalam detik, misalnya 15s, bawaannya step\n      <br />\n      ${__interval_ms}: interval waktu dalam milidetik, misalnya 15000\n      <br />\n      ${__range}: rentang waktu dalam detik, misalnya 3600s\n      <br />\n      ${__range_ms}: rentang waktu dalam milidetik, misalnya 3600000\n      <br />\n      ${__rate_interval}: interval waktu dalam detik, __interval * 4\n      <br />\n      ${__from}: waktu mulai dalam milidetik\n      <br />\n      ${__from_date_seconds}: waktu mulai dalam detik\n      <br />\n      ${__from_date_iso}: waktu mulai, ISO 8601/RFC 3339\n      <br />\n      Sintaks di atas berlaku juga untuk ${__to}\n    "
  },
  "row": {
    "edit_title": "Ubah grup",
    "delete_title": "Hapus grup",
    "name": "Nama grup",
    "delete_confirm": "Yakin ingin menghapus grup ini?",
    "cancel": "Batal",
    "ok": "Hapus grup beserta grafiknya",
    "ok2": "Hapus grupnya saja",
    "panels": "{{count}} grafik",
    "panels_plural": "{{count}} grafik"
  },
  "panel": {
    "title": {
      "add": "Tambah grafik",
      "edit": "Ubah grafik"
    },
    "base": {
      "title": "Konfigurasi panel",
      "name": "Judul",
      "name_tip": "Grafik bertipe tabel wajib punya judul, jika tidak penyuntingan panel akan bentrok dengan header tabel",
      "link": {
        "label": "Tautan",
        "label_tip": "\n          Cara memakai variabel<br />\n          ${variable_name}: nilai variabel dasbor\n        ",
        "btn": "Tambah",
        "name": "Nama tautan",
        "name_msg": "Masukkan nama tautan",
        "url": "URL tautan",
        "url_msg": "Masukkan URL tautan",
        "isNewBlank": "Buka di jendela baru"
      },
      "description": "Catatan",
      "repeatOptions": {
        "title": "Ulangi grafik",
        "byVariable": "Variabel",
        "byVariableTip": "Ulangi grafik untuk tiap nilai variabel",
        "maxPerRow": "Maksimum per baris"
      }
    },
    "options": {
      "legend": {
        "displayMode": {
          "label": "Mode tampilan",
          "table": "Tabel",
          "list": "Daftar",
          "hidden": "Tersembunyi"
        },
        "placement": "Posisi",
        "max": "Maksimum",
        "min": "Minimum",
        "avg": "Rata-rata",
        "sum": "Total",
        "last": "Nilai saat ini",
        "variance": "Varians",
        "stdDev": "Simpangan baku",
        "series": "Seri",
        "seriesFilter": "Filter seri",
        "columns": "Kolom yang ditampilkan",
        "none": "Tidak ada",
        "behaviour": {
          "label": "Perilaku saat diklik",
          "showItem": "Tampilkan item",
          "hideItem": "Sembunyikan item"
        },
        "selectMode": {
          "label": "Mode pemilihan",
          "single": "Pilihan tunggal",
          "multiple": "Pilihan ganda"
        },
        "heightInPercentage": "Persentase tinggi",
        "sortBy": "Kolom pengurutan",
        "sortBy_tip": "Pilih kolom statistik untuk pengurutan; kosongkan agar tidak diurutkan",
        "sortDir": "Arah pengurutan",
        "sortDirAsc": "Menaik",
        "sortDirDesc": "Menurun",
        "heightInPercentage_tip": "Persentase tinggi panel maksimum yang boleh dipakai legenda, antara 20% dan 80%",
        "widthInPercentage": "Persentase lebar",
        "widthInPercentage_tip": "Persentase lebar panel maksimum yang boleh dipakai legenda, antara 20% dan 80%"
      },
      "thresholds": {
        "title": "Ambang batas",
        "btn": "Tambah ambang batas",
        "mode": {
          "label": "Mode ambang batas",
          "tip": "Rumus mode persentase: minimum sumbu Y + (maksimum sumbu Y − minimum sumbu Y) × (persentase / 100)",
          "absolute": "Nilai absolut",
          "percentage": "Persentase"
        }
      },
      "thresholdsStyle": {
        "label": "Gaya ambang batas",
        "off": "Nonaktif",
        "line": "Garis",
        "dashed": "Garis putus-putus",
        "line+area": "Garis dan area",
        "dashed+area": "Garis putus-putus dan area"
      },
      "tooltip": {
        "mode": "Mode",
        "sort": "Urutan"
      },
      "valueMappings": {
        "title": "Pemetaan nilai",
        "btn": "Tambah",
        "type": "Kondisi",
        "type_tip": "\n          <0>Nilai bawaan rentang: from=-Infinity; to=Infinity </0>\n          <1>Tentang nilai khusus Null: cocok dengan null, undefined, atau tanpa data</1>\n        ",
        "type_map": {
          "special": "Nilai tetap (angka)",
          "textValue": "Nilai tetap (teks)",
          "range": "Rentang nilai",
          "specialValue": "Nilai khusus"
        },
        "value_placeholder": "Nilai yang cocok persis",
        "text": "Teks tampilan",
        "text_placeholder": "Opsional",
        "color": "Warna",
        "operations": "Tindakan"
      },
      "colors": {
        "name": "Pengaturan warna",
        "scheme": "Skema warna",
        "reverse": "Balik warna"
      },
      "links": {
        "label": "Tautan",
        "add_btn": "Tambah tautan",
        "edit_btn": "Ubah tautan",
        "title": "Judul tautan",
        "title_required": "Judul tautan tidak boleh kosong",
        "url": "URL tautan",
        "url_required": "URL tautan tidak boleh kosong",
        "target_blank": "Buka di jendela baru"
      }
    },
    "standardOptions": {
      "title": "Pengaturan lanjutan",
      "unit": "Satuan",
      "unit_tip": "\n        <0>Awalan SI diterapkan secara bawaan; pilih none untuk mematikannya</0>\n        <1>Data (SI): basis 1000, dengan satuan B, kB, MB, GB, TB, PB, EB, ZB, YB</1>\n        <2>Data (IEC): basis 1024, dengan satuan B, KiB, MiB, GiB, TiB, PiB, EiB, ZiB, YiB</2>\n        <3>bit: b</3>\n        <4>byte: B</4>\n      ",
      "datetime": "Format waktu",
      "min": "Minimum",
      "max": "Maksimum",
      "decimals": "Jumlah desimal",
      "displayName": "Nama tampilan",
      "displayName_tip": "Nama seri khusus"
    },
    "overrides": {
      "columnWidth": "Lebar kolom",
      "matcher": {
        "id": "Jenis pencocokan",
        "byFrameRefID": {
          "option": "Menurut nama kueri",
          "name": "Nama kueri"
        },
        "byName": {
          "option": "Menurut nama field",
          "name": "Nama field"
        }
      }
    },
    "custom": {
      "title": "Gaya grafik",
      "calc": "Perhitungan nilai",
      "calc_tip": "Data deret waktu perlu diringkas menjadi satu nilai dari seluruh titik waktu; pengaturan ini diabaikan untuk data non-deret waktu",
      "maxValue": "Maksimum",
      "baseColor": "Warna dasar",
      "serieWidth": "Lebar nama",
      "sortOrder": "Urutan",
      "textMode": "Yang ditampilkan",
      "valueAndName": "Nilai dan nama",
      "value": "Nilai",
      "name": "Nama",
      "background": "Latar",
      "colorMode": "Mode warna",
      "valueField": "Field nilai",
      "valueField_tip": "Value adalah kata kunci khusus, yaitu nama field hasil perhitungan nilai pada data deret waktu",
      "valueField_tip2": "Pilih field yang nilainya bertipe angka",
      "nameField": "Field nama",
      "nameField_tip": "Gunakan nilai field nama sebagai nama seri",
      "colSpan": "Maksimum per baris",
      "colSpanTip": "Akan segera dihentikan; memilih \"Otomatis\" akan memakai pengaturan arah tata letak di bawah",
      "colSpanAuto": "Otomatis",
      "textSize": {
        "title": "Ukuran huruf judul",
        "value": "Ukuran huruf nilai"
      },
      "colorRange": "Warna",
      "reverseColorOrder": "Balik warna",
      "colorDomainAuto": "Nilai min/maks otomatis",
      "colorDomainAuto_tip": "Nilai minimum dan maksimum secara bawaan diambil otomatis dari serinya",
      "fontBackground": "Warna latar teks",
      "detailName": "Nama tautan",
      "detailUrl": "URL tautan",
      "stat": {
        "graphMode": "Mode grafik",
        "none": "Sembunyikan",
        "area": "Sparkline",
        "orientation": "Arah tata letak",
        "orientationTip": "Dengan \"Otomatis\", arah tata letak dipilih sendiri berdasarkan lebar dan tinggi grafik",
        "orientationValueMap": {
          "auto": "Otomatis",
          "vertical": "Vertikal",
          "horizontal": "Horizontal"
        }
      },
      "pie": {
        "countOfValueField": "Hitung field nilai",
        "countOfValueField_tip": "Bila diaktifkan, nilai pada \"field nilai\" dihitung jumlahnya; jika tidak, nilainya ditampilkan apa adanya",
        "legengPosition": "Posisi legenda",
        "max": "Jumlah blok maksimum",
        "max_tip": "Blok selebihnya digabungkan menjadi Lainnya",
        "donut": "Mode donat",
        "labelWithName": "Sertakan nama pada label",
        "labelWithValue": "Tampilkan nilai metrik pada label",
        "detailName": "Nama tautan",
        "detailUrl": "URL tautan"
      },
      "table": {
        "displayMode": "Mode tampilan",
        "showHeader": "Tampilkan header tabel",
        "seriesToRows": "Setiap baris menampilkan nilai seri",
        "labelsOfSeriesToRows": "Setiap baris menampilkan nilai label",
        "labelValuesToRows": "Setiap baris menampilkan nilai dimensi agregasi yang dipilih",
        "columns": "Kolom yang ditampilkan",
        "aggrDimension": "Dimensi yang ditampilkan",
        "sortColumn": "Kolom pengurutan bawaan",
        "sortOrder": "Pengurutan bawaan",
        "link": {
          "mode": "Mode tautan",
          "cellLink": "Tautan pada sel",
          "appendLinkColumn": "Tambahkan kolom tautan"
        },
        "tableLayout": {
          "label": "Tata letak tabel",
          "label_tip": "Pada tata letak tetap, lebar kolom dibagi rata sesuai jumlah kolom sehingga tidak muncul gulir horizontal. Pada tata letak otomatis, lebar maksimum kolom adalah 150px sehingga isinya bisa meluap dan memunculkan gulir horizontal.",
          "auto": "Otomatis",
          "fixed": "Tetap"
        },
        "nowrap": "Jangan bungkus teks sel",
        "organizeFields": "Penataan field",
        "colorMode_tip": "Mode warna mengatur pewarnaan \"field nilai\". Pada mode nilai, warna mengenai teks nilainya; pada mode latar, warna mengenai latar sel field tersebut.",
        "pageLimit": "Baris per halaman"
      },
      "tableNG": {
        "enablePagination": "Aktifkan penomoran halaman",
        "showHeader": "Tampilkan header tabel",
        "filterable": "Aktifkan filter kolom",
        "sortColumn": "Kolom pengurutan bawaan",
        "sortOrder": "Pengurutan bawaan",
        "enableRowDetail": "Aktifkan detail baris",
        "enableRowDetail_tip": "Bila diaktifkan, kolom pertama tabel menampilkan ikon detail. Mengekliknya membuka panel geser di kanan yang memuat seluruh field dan nilai baris itu, lengkap dengan opsi menyalin satu baris atau satu field.",
        "rowDetail": {
          "triggerTip": "Lihat detail baris",
          "title": "Detail",
          "tableTab": "Tabel",
          "jsonTab": "JSON",
          "field": "Field",
          "value": "Nilai",
          "copyRow": "Salin seluruh baris",
          "copyFieldAndValue": "Salin field beserta nilainya",
          "copyFieldValue": "Salin nilai field"
        },
        "cellOptions": {
          "type": {
            "label": "Jenis sel",
            "options": {
              "none": "Bawaan",
              "color-text": "Teks berwarna",
              "color-background": "Latar berwarna",
              "gauge": "Pengukur (Gauge)"
            }
          },
          "wrapText": "Bungkus teks",
          "wrapText_tip": "Bila diaktifkan, teks sel dibungkus otomatis dan tinggi baris menyesuaikan jumlah barisnya. Pada data yang besar, ini bisa memengaruhi performa",
          "color-background": {
            "mode": {
              "label": "Mode warna",
              "options": {
                "basic": "Dasar",
                "gradient": "Gradien"
              }
            }
          },
          "gauge": {
            "mode": {
              "label": "Mode",
              "options": {
                "basic": "Dasar",
                "gradient": "Gradien",
                "lcd": "LCD"
              }
            },
            "valueDisplayMode": {
              "label": "Tampilan nilai",
              "options": {
                "color": "Warna",
                "text": "Teks",
                "hidden": "Tersembunyi"
              }
            }
          }
        }
      },
      "text": {
        "textColor": "Warna teks",
        "textDarkColor": "Warna teks pada tema gelap",
        "bgColor": "Warna latar",
        "textSize": "Ukuran teks",
        "justifyContent": {
          "name": "Perataan horizontal",
          "unset": "Tidak diatur",
          "flexStart": "Rata kiri",
          "center": "Rata tengah",
          "flexEnd": "Rata kanan"
        },
        "alignItems": {
          "name": "Perataan vertikal",
          "unset": "Tidak diatur",
          "flexStart": "Rata atas",
          "center": "Rata tengah",
          "flexEnd": "Rata bawah"
        },
        "content": "Isi",
        "content_placeholder": "Markdown dan HTML didukung",
        "content_tip": "\n          <0>Mode sederhana adalah bawaannya; gaya kartu bisa diatur lewat opsi di atas</0>\n          <1>Markdown dan HTML didukung</1>\n          <2>Bila mengetik Markdown atau HTML, sebaiknya matikan pengaturan perataan di atas</2>\n        "
      },
      "timeseries": {
        "drawStyle": "Mode gambar",
        "lineInterpolation": "Interpolasi garis",
        "spanNulls": "Sambungkan nilai kosong",
        "spanNulls_0": "Nonaktif",
        "spanNulls_1": "Aktif",
        "lineWidth": "Ketebalan garis",
        "fillOpacity": "Transparansi",
        "gradientMode": "Gradien",
        "gradientMode_opacity": "Aktif",
        "gradientMode_none": "Nonaktif",
        "stack": "Tumpuk",
        "stack_normal": "Aktif",
        "stack_off": "Nonaktif",
        "yAxis": {
          "title": "Pengaturan sumbu Y",
          "rightYAxis": {
            "label": "Tampilkan sumbu Y kanan",
            "normal": "Aktif",
            "off": "Nonaktif"
          }
        },
        "showPoints": "Tampilkan titik",
        "showPoints_always": "Tampilkan",
        "showPoints_none": "Jangan tampilkan",
        "pointSize": "Ukuran titik"
      },
      "iframe": {
        "src": "URL iframe"
      },
      "heatmap": {
        "xAxisField": "Sumbu X",
        "yAxisField": "Sumbu Y",
        "valueField": "Kolom nilai"
      },
      "barchart": {
        "xAxisField": "Sumbu X",
        "yAxisField": "Sumbu Y",
        "colorField": "Field warna",
        "barMaxWidth": "Lebar batang maksimum",
        "colorField_tip": "Name adalah kata kunci khusus, yaitu nama field yang memuat nama seri"
      },
      "barGauge": {
        "topn": "Peringkat maksimum",
        "combine_other": "Lainnya",
        "combine_other_tip": "Data di luar peringkat teratas digabungkan menjadi satu item Lainnya",
        "otherPosition": {
          "label": "Posisi item Lainnya",
          "tip": "Posisi item Lainnya, di awal atau di akhir",
          "options": {
            "none": "Bawaan",
            "top": "Di awal",
            "bottom": "Di akhir"
          }
        },
        "displayMode": "Mode tampilan",
        "valueMode": {
          "label": "Tampilan nilai",
          "color": "Tampilkan",
          "hidden": "Sembunyikan"
        }
      }
    },
    "inspect": {
      "title": "Telusuri masalah",
      "query": "Kueri",
      "json": "Konfigurasi grafik"
    }
  },
  "export": {
    "copy": "Salin isi JSON ke papan klip"
  },
  "query": {
    "title": "Kondisi kueri",
    "add_query_btn": "Tambah kueri",
    "add_expression_btn": "Tambah ekspresi",
    "transform": "Transformasi data",
    "datasource_placeholder": "Pilih sumber data",
    "datasource_msg": "Pilih sumber data",
    "time": "Pemilihan waktu",
    "time_tip": "Rentang waktu boleh ditentukan sendiri; bawaannya rentang waktu global dasbor",
    "es": {
      "field_key_msg": "Kunci field wajib diisi"
    },
    "prometheus": {
      "query": "Kueri (PromQL)",
      "maxDataPoints": {
        "tip": "Jumlah titik maksimum per seri, bawaannya selebar panel (240 untuk panel baru). Rumusnya step = (end − start) / maxDataPoints",
        "tip_2": "Jumlah titik maksimum per seri, bawaannya selebar panel. Rumusnya step = (end − start) / maxDataPoints"
      },
      "minStep": {
        "label": "Langkah minimum (Min step)",
        "tip": "Langkah minimum, bawaannya 15. Rumusnya step = max(step, minStep, safeStep), dengan safeStep = (end − start) / 11000"
      },
      "step": {
        "tag_tip": "Rumusnya step = max((end − start) / maxDataPoints, minStep, safeStep), dengan safeStep = (end − start) / 11000"
      },
      "instant": {
        "label": "Kueri sesaat (Instant)",
        "tip": "Menanyakan data pada titik waktu \"selesai\" saja, sehingga hasilnya satu nilai"
      }
    },
    "expression_placeholder": "Lakukan operasi matematika atas satu kueri atau lebih. Rujuk kueri lewat ${refId}, yaitu $A, $B, $C, dan seterusnya. Contoh penjumlahan dua skalar: $A + $B > 10",
    "legend": "Legenda (Legend)",
    "legendTip": "Penimpa atau templat nama legenda; misalnya {{hostname}} diganti dengan nilai label hostname",
    "legendTip2": "Penimpa atau templat nama legenda; misalnya {{hostname}} diganti dengan nilai label hostname. Saat ini hanya berlaku untuk data deret waktu",
    "options": "Opsi kueri",
    "options_max_data_points": "Jumlah titik data maksimum",
    "options_max_data_points_tip": "Jumlah titik maksimum per seri, bawaannya selebar panel (240 untuk panel baru). Dipakai menghitung step = (end − start) / maxDataPoints",
    "options_time": "Rentang waktu kueri",
    "options_time_tip": "Rentang waktu kueri boleh ditentukan sendiri; bawaannya rentang waktu global dasbor",
    "copy_query": "Salin kueri",
    "mixed_datasource": "Campur sumber data",
    "hide_response": "Sembunyikan hasil kueri"
  },
  "migrate": {
    "title": "Migrasikan dasbor",
    "close_and_dismiss": "Tutup dan jangan tampilkan lagi",
    "batch_migrate": "Buka migrasi dasbor massal",
    "migrate_current": "Migrasikan dasbor ini",
    "desc_1": "Versi 6 tidak lagi mendukung peralihan kluster Prometheus global; pada versi baru, kemampuan itu dicapai dengan mengaitkan grafik ke variabel sumber data.",
    "desc_2": "Alat migrasi akan membuat variabel sumber data dan mengaitkannya ke semua grafik yang belum punya sumber data."
  },
  "detail": {
    "ai_analysis": "Analisis AI",
    "datasource_empty": "Tidak ada informasi sumber data. Konfigurasikan sumber data terlebih dahulu",
    "invalidTimeRange": "Nilai __from dan __to tidak valid",
    "invalidDatasource": "Sumber data tidak valid",
    "invalidPanelConfig": "Konfigurasi grafik tidak valid",
    "deletePanel_confirm": "Hapus grafik {{name}}?",
    "invalidPanelType": "Jenis grafik tidak valid",
    "fullscreen": {
      "notification": {
        "esc": "Tekan ESC untuk keluar dari layar penuh",
        "theme": "Ganti tema"
      }
    },
    "saved": "Berhasil disimpan",
    "expired": "Dasbor ini telah diubah orang lain. Muat ulang dasbor untuk melihat konfigurasi dan data terbaru agar perubahan tidak saling menimpa",
    "prompt": {
      "title": "Ada perubahan yang belum disimpan",
      "message": "Simpan perubahannya?",
      "cancelText": "Batal",
      "discardText": "Buang",
      "okText": "Simpan"
    },
    "importPanel": {
      "invalidJSON": "Format JSON konfigurasi grafik tidak benar",
      "placeholder": "Tempelkan JSON konfigurasi grafik. JSON-nya bisa diambil lewat \"Salin\" pada menu Tindakan lainnya di pojok kanan atas panel grafik"
    }
  },
  "settings": {
    "graphTooltip": {
      "label": "Tooltip",
      "tip": "Mengatur perilaku tooltip pada semua grafik",
      "default": "Bawaan",
      "sharedCrosshair": "Bagikan crosshair",
      "sharedTooltip": "Bagikan tooltip"
    },
    "graphZoom": {
      "label": "Perilaku zoom",
      "tip": "Mengatur perilaku zoom pada semua grafik",
      "default": "Bawaan",
      "updateTimeRange": "Perbarui rentang waktu"
    },
    "save": "Simpan dasbor"
  },
  "visualizations": {
    "timeseries": "Grafik deret waktu",
    "barchart": "Diagram batang",
    "stat": "Nilai metrik",
    "table": "Tabel",
    "tableNG": "Tabel NG (Beta)",
    "pie": "Diagram lingkaran",
    "hexbin": "Peta sarang lebah",
    "barGauge": "Papan peringkat",
    "text": "Kartu teks",
    "gauge": "Diagram pengukur",
    "heatmap": "Peta blok warna",
    "iframe": "Dokumen tersemat (iframe)",
    "row": "Grup",
    "importPanel": "Tempel grafik"
  },
  "calcs": {
    "lastNotNull": "Nilai terakhir yang tidak kosong",
    "last": "Nilai terakhir",
    "firstNotNull": "Nilai pertama yang tidak kosong",
    "first": "Nilai pertama",
    "min": "Minimum",
    "max": "Maksimum",
    "avg": "Rata-rata",
    "sum": "Jumlah",
    "count": "Cacah",
    "origin": "Nilai mentah",
    "variance": "Varians",
    "stdDev": "Simpangan baku"
  },
  "annotation": {
    "add": "Tambah anotasi",
    "edit": "Ubah anotasi",
    "description": "Deskripsi",
    "tags": "Label",
    "updated": "Anotasi diperbarui",
    "deleted": "Anotasi dihapus"
  },
  "transformations": {
    "organize": {
      "title": "Organize fields by name",
      "desc": "Urutkan ulang, sembunyikan, atau ganti nama field"
    },
    "merge": {
      "title": "Merge tables",
      "desc": "Gabungkan beberapa tabel menjadi satu"
    },
    "joinByField": {
      "title": "Join by field",
      "desc": "Gabungkan baris dari beberapa tabel berdasarkan field yang berkaitan",
      "mode": "Mode",
      "byField": "Field"
    },
    "timeSeriesTable": {
      "title": "Time series to table",
      "desc": "Ringkas nilai tiap titik waktu pada data deret waktu menjadi satu nilai",
      "fieldName": "Field",
      "functions": "Metode"
    },
    "groupedAggregateTable": {
      "title": "Grouped aggregate table",
      "desc": "Kelompokkan tabel berdasarkan satu field atau lebih, lalu agregasikan field lainnya",
      "operation_map": {
        "aggregate": "Perhitungan",
        "groupby": "Grup"
      }
    }
  },
  "add_transformation": "Tambah transformasi data"
};

export default id_ID;
