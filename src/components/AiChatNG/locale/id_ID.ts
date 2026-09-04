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
    intro: 'Sebutkan apa yang ingin Anda lihat dengan bahasa biasa. Saya memverifikasinya pada sumber data ini sebelum mengisikannya ke kotak di atas dan menjalankannya.',
    based_on: 'berdasarkan {{name}}',
    running: 'Memproses',
    adopted: 'Dipakai',
    failed: 'Tidak ada hasil',
    close: 'Tutup',
    step: {
      command: 'Menjalankan {{count}} perintah',
      read_file: 'Membaca {{count}} berkas',
      edit_file: 'Menulis {{count}} berkas',
      separator: ' · ',
    },
    written_back: 'Ditulis ke kolom di atas dan dijalankan',
    undo: 'Urungkan',
    regenerate: 'Buat ulang',
    send: 'Kirim',
    follow_up_placeholder: 'Lanjutkan, mis. "kelompokkan per pod"',
    answer_below: 'Jawab di bawah untuk melanjutkan',
    needs_answer: 'Butuh jawaban',
    error_detail: 'Detail galat',
    nothing_delivered: 'Tidak ada ekspresi yang bisa dipakai',
    failed_title: "Generation failed",
    failed_hint: "Try again; if it keeps failing, check the AI model configuration.",
    retry: "Retry",
    stop: "Stop",
    refill: "Fill in again",
    restored: "Your original content is back",
    understanding: "Reading your question…",
    verified_by: "Checked by: {{detail}}",
    first_placeholder: "What do you want to see?",
    answer_placeholder: "Answer the question above…",
    timeout: 'Waktu habis, coba lagi',
    stopped: "Stopped",
    stopped_hint: "Stopped. The field above is unchanged.",
    copy: "Copy",
    field_changed: "The field has been edited",
    timeout_title: "{{minutes}} minutes with no result",
    unreachable_title: "Cannot reach the AI service",
    unreachable_hint: "Check the network and try again.",
    no_model_hint: "No AI model is available. Ask an administrator to add or enable one.",
    example_fallback: "CPU usage per host",
    unchanged: "Same as what the field already held — nothing changed",
    no_context: "Select a data source first",

  },
};

export default id_ID;
