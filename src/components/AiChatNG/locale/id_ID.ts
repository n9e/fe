const id_ID = {
  "toolbar": {
    "current_chat": "Sesi saat ini",
    "new_chat": "Sesi baru",
    "history": "Riwayat sesi",
    "share": "Bagikan",
    "share_copied": "Tautan berbagi disalin",
    "switch_to_drawer": "Beralih ke mode panel samping",
    "switch_to_floating": "Beralih ke mode jendela mengambang"
  },
  "history": {
    "untitled": "Sesi baru",
    "today": "Hari ini",
    "yesterday": "Kemarin",
    "earlier": "Lebih lama",
    "unknown_time": "--:--",
    "delete_confirm": "Hapus sesi ini?",
    "empty": "Belum ada sesi dalam riwayat",
    "search_placeholder": "Cari sesi",
    "share": "Bagikan sesi",
    "rename": "Ganti nama",
    "more_actions": "Tindakan sesi lainnya"
  },
  "nightingale": {
    "title": "Nightingale AI",
    "new_chat": "Sesi baru",
    "sessions": "Sesi",
    "llm_configs": "Manajemen LLM",
    "skills": "Manajemen skill",
    "mcp_servers": "Manajemen MCP",
    "ai_task": "Kanal tugas",
    "collapse_sidebar": "Ciutkan panel AI",
    "expand_sidebar": "Bentangkan panel AI",
    "welcome_cards": {
      "overview": {
        "title": "Kenali Nightingale dengan cepat",
        "description": "Pahami dalam satu menit apa yang bisa dilakukan produk ini dan asisten AI-nya",
        "prompt": "Jelaskan dalam satu menit fitur utama Nightingale dan apa yang bisa kamu bantu"
      },
      "alerts": {
        "title": "Tinjau alert saya",
        "description": "Aturan mana yang paling sering berbunyi dan mana yang belum pernah terpicu",
        "prompt": "Tinjau aturan alert saya: mana yang paling sering terpicu dalam 7 hari terakhir dan mana yang belum pernah terpicu sama sekali"
      },
      "create_alert": {
        "title": "Buat satu alert lewat satu kalimat",
        "description": "Ceritakan skenarionya dan saya buatkan PromQL beserta ambang batasnya",
        "prompt": "Buatkan aturan alert: berbunyi jika penggunaan CPU host di atas 80% selama 5 menit"
      }
    }
  },
  "input": {
    "placeholder": "Ketik pertanyaan Anda. Enter untuk mengirim, Shift + Enter untuk baris baru",
    "share_readonly_placeholder": "Mode berbagi hanya-baca"
  },
  "query": {
    "title": "Kueri",
    "copied": "Kueri disalin",
    "copy": "Salin",
    "execute": "Jalankan kueri",
    "execute_disabled": "Tidak ada callback eksekusi yang diberikan, jadi hanya penyalinan yang tersedia"
  },
  "action": {
    "query_generator": "Buat kueri"
  },
  "message": {
    "generating": "Sedang berpikir...",
    "processing": "Masih diproses",
    "hint": "Petunjuk",
    "no_llm_title": "Belum ada model bahasa yang dikonfigurasi di lingkungan ini",
    "no_llm_content": "Buka halaman <a>Manajemen LLM</a> untuk menambahkan konfigurasi model",
    "stopped": "Pembuatan dihentikan",
    "request_failed": "Permintaan gagal",
    "cancelled": "Balasan ini dibatalkan.",
    "retry_later": "Coba lagi nanti.",
    "empty_response": "Belum ada balasan",
    "thinking": "Proses berpikir",
    "unsupported_type": "Jenis konten belum didukung: {{type}}"
  },
  "form_select": {
    "title": "Lengkapi data berikut untuk melanjutkan:",
    "approval_title": "Konfirmasi apakah tindakan di atas akan dijalankan:",
    "busi_group": "Grup bisnis",
    "datasource": "Sumber data",
    "team": "Tim",
    "skill_scope": "Visibilitas",
    "placeholder_select": "Pilih",
    "confirm": "Konfirmasi"
  },
  "alert_rule": {
    "title": "Aturan alert",
    "copy": "Salin",
    "copied": "ID aturan disalin",
    "duration_seconds": "Selama {{seconds}} detik",
    "field": {
      "id": "ID aturan",
      "name": "Nama aturan",
      "group": "Grup bisnis",
      "datasource": "Sumber data",
      "cate": "Jenis sumber data",
      "severity": "Tingkat keparahan alert",
      "metric": "Metrik yang dipantau",
      "condition": "Kondisi pemicu",
      "note": "Isi alert"
    },
    "severity": {
      "critical": "Critical",
      "warning": "Warning",
      "info": "Info"
    }
  },
  "dashboard": {
    "title": "Dasbor",
    "copied": "ID dasbor disalin",
    "field": {
      "id": "ID dasbor",
      "name": "Nama",
      "group": "Grup bisnis",
      "datasource": "Sumber data bawaan",
      "panels_count": "Panel",
      "variables_count": "Variabel",
      "tags": "Label"
    }
  },
  "empty": {
    "greeting_prefix": "Halo, saya"
  },
  panel: {
    open: 'Buat kueri dengan AI',
    untitled: 'Dibuat AI',
    based_on: 'berdasarkan {{name}}',
    running: 'Memproses',
    adopted: 'Dipakai',
    failed: 'Tidak ada hasil',
    close: 'Tutup',
    step: {
      command: 'Menjalankan perintah',
      read_file: 'Membaca berkas',
      edit_file: 'Menulis berkas',
    },
    written_back: 'Ditulis ke kolom di atas dan dijalankan',
    undo: 'Urungkan',
    regenerate: 'Buat ulang',
    another_way: 'Cara lain',
    another_way_prompt: 'Tulis dengan cara lain — ekspresi setara, dirumuskan berbeda',
    ask_first: 'Ajukan pertanyaan dulu',
    send: 'Kirim',
    follow_up_placeholder: 'Lanjutkan, mis. "kelompokkan per pod"',
    nothing_delivered: 'Tidak ada ekspresi yang bisa dipakai',
    timeout: 'Waktu habis, coba lagi',
  },
};

export default id_ID;
