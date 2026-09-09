const id_ID = {
  "append_tags_msg": "Format label tidak valid, periksa kembali!",
  "append_tags_msg1": "Panjang label maksimal 64 karakter",
  "append_tags_msg2": "Label harus berformat key=value, dan kuncinya diawali huruf atau garis bawah serta hanya berisi huruf, angka, dan garis bawah.",
  "append_tags_placeholder": "Label berformat key=value, dipisahkan dengan Enter atau spasi",
  "tag": {
    "key": {
      "label": "Nama label",
      "msg": "Nama label tidak boleh kosong",
      "duplicate_error": "Kunci yang sama tidak boleh diulang; hal itu membuat event tidak pernah cocok",
      "placeholder": "Ketik atau pilih kunci label yang dipakai untuk pencocokan, misalnya app / cluster / alertname"
    },
    "func": {
      "label": "Operator",
      "label_tip": "Beberapa operator pencocokan tersedia:\n- `==` cocok dengan satu nilai label tertentu; hanya menerima satu nilai. Untuk beberapa nilai sekaligus, gunakan operator `in`\n- `=~` menerima ekspresi reguler sehingga pencocokan lebih fleksibel\n- `in` cocok dengan beberapa nilai label, seperti `in` pada SQL\n- `not in` mengecualikan beberapa nilai label, seperti `not in` pada SQL\n- `!=` tidak sama dengan, untuk mengecualikan satu nilai tertentu\n- `!~` ekspresi reguler negatif: semua nilai yang cocok dengannya dikecualikan, seperti `!~` pada PromQL",
      "msg": "Operator tidak boleh kosong"
    },
    "value": {
      "label": "Nilai label",
      "placeholder": "Ketik sendiri atau pilih dari daftar nilai label yang dipakai untuk pencocokan",
      "placeholder2": "Masukkan ekspresi reguler agar pencocokan nilai atribut lebih fleksibel",
      "msg": "Nilai label tidak boleh kosong"
    },
    "add": "Tambah label"
  },
  "attr": {
    "key": {
      "label": "Nama atribut",
      "msg": "Nama atribut tidak boleh kosong",
      "duplicate_error": "Nama atribut tidak boleh berulang"
    }
  }
};

export default id_ID;
