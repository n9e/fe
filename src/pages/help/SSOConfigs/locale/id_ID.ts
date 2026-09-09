const id_ID = {
  "title": "Manajemen single sign-on",
  "LDAP": "LDAP",
  "CAS": "CAS",
  "OIDC": "OIDC",
  "OAuth2": "OAuth2",
  "dingtalk": "DingTalk",
  "feishu": "Feishu",
  "callback_url": "URL callback",
  "feishu_setting": {
    "app_id_tip": "Identitas unik aplikasi pada platform terbuka Feishu, dibuat otomatis saat aplikasi dibuat dan tidak dapat diubah. app_id bisa dilihat di halaman Kredensial dan informasi dasar pada <1>konsol pengembang</1>",
    "app_secret_tip": "Kunci rahasia aplikasi, dibuat otomatis saat aplikasi dibuat",
    "cover_attributes_tip": "Setiap kali pengguna masuk, bila datanya berubah, informasi dari Feishu menimpa data pengguna di Nightingale, yaitu nomor telepon dan email"
  },
  "dingtalk_setting": {
    "enable": "Aktifkan",
    "display_name": "Nama tampilan",
    "corpId": "ID organisasi",
    "corpId_tip": "ID organisasi; CorpId dapat dilihat di beranda platform terbuka DingTalk",
    "client_id": "Client ID",
    "client_secret": "Client secret",
    "cover_attributes": "Perbarui data pengguna",
    "cover_attributes_tip": "Setiap kali pengguna masuk, bila datanya berubah, informasi dari DingTalk menimpa data pengguna di Nightingale, yaitu nomor telepon dan email",
    "username_field": "Field nama pengguna",
    "default_team": "Tim bawaan",
    "username_field_map": {
      "phone": "Nomor telepon",
      "name": "Nama",
      "email": "Email",
      "userid": "ID pengguna"
    },
    "default_roles": "Peran bawaan",
    "auth_url": "URL autentikasi masuk",
    "proxy": "Alamat proksi",
    "use_member_info": "Detail pengguna",
    "use_member_info_tip": "Aktifkan bila email dan nomor telepon karyawan perlu diambil dari direktori kontak. Fitur ini menuntut izin detail pengguna direktori kontak, yang harus ditambahkan di platform terbuka DingTalk",
    "dingtalk_api": "API DingTalk",
    "dingtalk_api_tip": "Tetapkan endpoint API untuk menanyakan data karyawan di direktori kontak"
  }
};

export default id_ID;
