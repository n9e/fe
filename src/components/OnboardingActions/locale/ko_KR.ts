const ko_KR = {
  "close": "닫기",
  "card": {
    "title": "다음 단계",
    "later": "나중에 머신 목록에서 언제든 이어서 할 수 있습니다",
    "optional": "선택 사항",
    "dismiss": "다시 표시하지 않기",
    "rows": {
      "collect": {
        "title": "수집 설정",
        "desc": "OS 기본 지표는 자동으로 수집되며, 데이터베이스와 미들웨어는 필요에 따라 설정합니다",
        "action": "설정하기"
      },
      "pack": {
        "title": "호스트 대시보드를 적용하고 호스트 알림을 켜기",
        "desc": "내장 대시보드와 알림 규칙을 한 번에 가져오기",
        "action": "한 번에 켜기"
      },
      "notify": {
        "title": "통지 연결",
        "desc": "DingTalk, Feishu, WeCom 봇의 Webhook 주소를 붙여 넣기만 하면 됩니다",
        "action": "빠른 생성"
      },
      "test": {
        "title": "테스트 통지 보내기",
        "desc": "알림이 실제로 도착하는지 확인하기",
        "action": "보내기"
      }
    }
  },
  "pack": {
    "title": "호스트 모니터링 기본 패키지 켜기",
    "intro": "다음 항목을 가져와서 켭니다:",
    "boards": "대시보드",
    "rules": "알림 규칙",
    "boards_count": "대시보드 {{count}}개",
    "rules_count": "알림 규칙 {{count}}개이며 가져오는 즉시 켜집니다",
    "preview": "미리보고 고르기",
    "existing": "(이미 있음)",
    "existing_skipped": "대상 비즈니스 그룹에 같은 이름의 대시보드가 있어 이번에는 건너뜁니다",
    "rule_existing_skipped": "대상 비즈니스 그룹에 같은 이름의 알림 규칙이 있어 이번에는 건너뛰며 기존 설정을 덮어쓰지 않습니다",
    "already_imported": "선택한 대시보드가 모두 이 비즈니스 그룹에 이미 있어 이번에는 알림 규칙만 채웁니다",
    "boards_incomplete": "일치하는 내장 호스트 대시보드 템플릿이 없습니다. 미리보고 고르기를 펼쳐 직접 선택하세요",
    "notify_rules": "통지 규칙",
    "notify_rules_tip": "통지 규칙을 연결하지 않으면 이벤트는 생기지만 아무에게도 전달되지 않습니다",
    "notify_rules_placeholder": "기존 통지 규칙을 고르거나 위쪽 빠른 생성으로 새로 만드세요",
    "quick_create": "빠른 생성",
    "submit": "한 번에 켜기",
    "view_board": "호스트 대시보드 보기",
    "next_test": "테스트 통지 보내기",
    "no_notify_warning": "이 알림 규칙들에는 통지 규칙이 연결되어 있지 않아, 발생해도 아무에게도 전달되지 않습니다",
    "go_bind_notify": "알림 규칙 목록에서 한꺼번에 연결하기",
    "component_missing": "내장 Linux 통합을 찾지 못해 한 번에 켤 수 없습니다",
    "load_failed": "내장 템플릿을 읽지 못했습니다",
    "go_components": "통합 센터에서 직접 가져오기",
    "bad_template": "내장 템플릿을 해석하지 못했습니다",
    "unknown_error": "알 수 없는 오류"
  },
  "notify": {
    "bind_hint": "통지 규칙을 만들었지만 켜져 있는 호스트 알림에 아직 연결되지 않아, 실제 알림은 여전히 아무에게도 전달되지 않습니다"
  },
  "test": {
    "title": "테스트 통지 보내기",
    "rule_label": "어떤 통지 규칙으로 보낼지",
    "send": "테스트 통지 보내기",
    "result_title": "전송 결과",
    "sent": "통지 매체를 호출했으며 응답은 다음과 같습니다",
    "sent_hint": "채팅방이나 메일함에서 이 테스트 메시지가 도착했는지 확인하세요. 도착해야 통지 경로가 실제로 연결된 것입니다",
    "no_rule": "아직 통지 규칙이 없습니다",
    "go_create_rule": "통지 규칙 만들기",
    "rule_without_config": "이 통지 규칙에는 통지 매체가 없어 보낼 수 없습니다",
    "no_channel": "통지 매체를 선택하지 않았습니다",
    "channel_fallback": "통지 매체 {{index}}",
    "go_check_channel": "통지 매체 확인하기",
    "channel_doc": "설정 문서 보기",
    "unknown_error": "전송에 실패했습니다. 알 수 없는 오류입니다"
  }
};

export default ko_KR;
