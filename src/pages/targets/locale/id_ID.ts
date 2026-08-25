const id_ID = {
  "title": "Daftar mesin",
  "default_filter": "Filter bawaan",
  "ungrouped_targets": "Mesin tanpa grup",
  "all_targets": "Semua mesin",
  "datasource": "Sumber data",
  "search_placeholder": "Cari isi tabel secara longgar (pisahkan beberapa kata kunci dengan spasi)",
  "filterDowntime": "Pembaruan detak jantung",
  "filterDowntimeNegative": "Detak jantung diperbarui",
  "filterDowntimePositive": "Detak jantung tidak diperbarui",
  "filterDowntimeNegativeMin": "Diperbarui dalam {{count}} menit terakhir",
  "filterDowntimePositiveMin": "Tidak diperbarui dalam {{count}} menit terakhir",
  "ident_copy_success": "{{num}} catatan berhasil disalin",
  "not_grouped": "Tanpa grup",
  "host_ip": "IP",
  "host_tags": "Label yang dikirim",
  "tags": "Label khusus",
  "group_obj": "Grup bisnis",
  "target_up": "Status",
  "mem_util": "Memori",
  "cpu_util": "CPU",
  "cpu_num": "Jumlah inti",
  "offset": "Penyimpangan waktu",
  "offset_tip": "Dihitung dengan mengurangkan waktu mesin categraf dari waktu mesin tempat Nightingale terpasang",
  "os": "Sistem operasi",
  "arch": "Arsitektur CPU",
  "update_at": "Diperbarui pada",
  "update_at_tip": "\n    Detak jantung dalam 1 menit terakhir: hijau <1 />\n    Detak jantung dalam 3 menit terakhir: kuning <1 />\n    Tanpa detak jantung selama 3 menit: merah\n  ",
  "remote_addr": "IP asal",
  "remote_addr_tip": "IP asal diambil dari header HTTP, jadi bila permintaan melewati proksi, ia belum tentu IP yang sebenarnya",
  "agent_version": "Versi agen",
  "note": "Catatan",
  "unknown_tip": "Metadata mesin ditampilkan mulai categraf versi di atas 0.2.35",
  "view_related_collects": "Lihat konfigurasi pengumpulan terkait",
  "organize_columns": {
    "title": "Kolom yang ditampilkan"
  },
  "targets": "Objek pemantauan",
  "targets_placeholder": "Masukkan metrik objek pemantauan, satu per baris",
  "copy": {
    "current_page": "Salin halaman ini",
    "all": "Salin semua",
    "selected": "Salin yang dipilih",
    "no_data": "Tidak ada data untuk disalin"
  },
  "bind_tag": {
    "title": "Kaitkan label",
    "placeholder": "Label berformat key=value, dipisahkan dengan Enter atau spasi",
    "msg1": "Isi setidaknya satu label!",
    "msg2": "Format label tidak valid, periksa kembali!",
    "msg3": "Kunci label tidak boleh berulang",
    "render_tip1": "Panjang label maksimal 64 karakter",
    "render_tip2": "Label harus berformat key=value, dan kuncinya diawali huruf atau garis bawah serta hanya berisi huruf, angka, dan garis bawah."
  },
  "unbind_tag": {
    "title": "Lepaskan label",
    "placeholder": "Pilih label yang akan dilepaskan",
    "msg": "Isi setidaknya satu label!"
  },
  "update_busi": {
    "title": "Ubah grup bisnis",
    "label": "Grup bisnis pemilik",
    "mode": {
      "label": "Mode",
      "reset": "Timpa",
      "add": "Tambah",
      "del": "Hapus"
    },
    "tags": "Kaitkan label",
    "tags_tip": "Bila dikosongkan, label sebelumnya tidak ditimpa"
  },
  "remove_busi": {
    "title": "Keluarkan dari grup bisnis",
    "msg": "Perhatian: setelah dikeluarkan dari grup bisnisnya, pengelola grup itu tidak lagi berwenang atas objek-objek pemantauan ini. Kamu mungkin perlu mengosongkan label dan catatannya terlebih dahulu.",
    "btn": "Keluarkan"
  },
  "update_note": {
    "title": "Ubah catatan",
    "placeholder": "Isi yang kosong berarti catatannya dihapus"
  },
  "batch_delete": {
    "title": "Hapus massal",
    "msg": "Perhatian: tindakan ini menghapus objek pemantauan dari sistem secara permanen. Sangat berisiko, lakukan dengan hati-hati!",
    "btn": "Hapus"
  },
  "meta_tip": "Lihat metadata",
  "meta_title": "Metadata",
  "meta_desc_key": "Nama metadata",
  "meta_desc_value": "Nilai metadata",
  "meta_value_click_to_copy": "Klik untuk menyalin",
  "meta_expand": "Bentangkan",
  "meta_collapse": "Ciutkan",
  "meta_no_data": "Belum ada data",
  "all_no_data": "Belum memasang pengumpul data? Ikuti <a>panduan pemasangan</a> untuk menyiapkannya",
  "categraf_doc": "Dokumentasi categraf",
  "hosts_select": {
    "placeholder": "Identitas mesin atau IP",
    "modal_title": "Masukkan identitas mesin atau IP",
    "modal_placeholder": "Satu identitas mesin atau IP per baris"
  }
};

export default id_ID;
