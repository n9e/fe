const ko_KR = {
  "title": "알림 전송 규칙",
  "empty_guide": {
    "title": "아직 알림 전송 규칙이 없습니다",
    "desc": "알림 전송 규칙은 알림을 누구에게 어떤 매체로 보낼지 정합니다. 이 규칙이 있어야 알림 이벤트가 DingTalk나 이메일 같은 채널로 실제로 전달됩니다.",
    "config_channel": "먼저 알림 매체를 설정하세요"
  },
  "rule_select": {
    "label": "알림 전송 규칙",
    "select": "알림 전송 규칙 선택",
    "create": "새 알림 전송 규칙",
    "view": "보기",
    "manage": "알림 전송 규칙 관리",
    "total": "총 {{total}}건",
    "footer_total": "총 {{total}}개 규칙",
    "quick_create": {
      "action": "빠른 생성",
      "title": "알림 전송 규칙 빠르게 만들기",
      "hint": "메신저 봇의 Webhook URL이나 integration_key가 들어간 Flashduty 통합 주소를 붙여 넣으세요. DingTalk, WeCom, Feishu 카드, Lark 카드, Flashduty 가운데 무엇인지 자동으로 알아내고, 중복을 확인해 기존 규칙을 다시 쓰거나 새로 만듭니다.",
      "url_label": "Webhook 또는 통합 주소",
      "url_placeholder": "예: https://oapi.dingtalk.com/robot/send?access_token=xxx\n또는: https://api.flashcat.cloud/event/push/alert/n9e?integration_key=xxx",
      "url_required": "Webhook URL이나 Flashduty 통합 주소를 붙여 넣으세요",
      "name_label": "알림 전송 규칙 이름",
      "name_placeholder": "Webhook을 붙여 넣으면 자동으로 만들어지며 고칠 수 있습니다",
      "name_required": "알림 전송 규칙 이름을 입력하세요",
      "user_group_required": "권한을 줄 팀을 선택하세요",
      "user_group_placeholder": "권한을 줄 팀을 선택하세요",
      "detected": "{{channel}}(으)로 인식했습니다 (끝자리 {{suffix}})",
      "invalid_url": "URL 형식이 올바르지 않습니다",
      "missing_param": "URL에 {{key}}이(가) 없습니다",
      "unrecognized": "유형을 알아내지 못했습니다. DingTalk, WeCom, Feishu 카드, Lark 카드, Flashduty를 지원합니다",
      "reused_rule": "같은 토큰을 쓰는 알림 전송 규칙이 이미 있어 자동으로 선택했습니다",
      "created": "알림 전송 규칙을 만들고 선택했습니다",
      "create_channel_no_perm": "{{channel}} 알림 매체가 없고 지금 사용자에게는 만들 권한이 없습니다. 관리자에게 먼저 만들어 달라고 요청하세요",
      "create_channel_failed": "알림 매체를 만들지 못했습니다: {{channel}}",
      "create_rule_failed": "알림 전송 규칙을 만들지 못했습니다",
      "channel_description": "빠른 생성으로 자동으로 만들어짐",
      "rule_description": "빠른 생성이 Webhook URL을 바탕으로 만듦",
      "submit": "만들기"
    }
  },
  "basic_configuration": "기본 설정",
  "basic_configuration_desc": "알림 전송 규칙의 이름, 권한을 가진 팀, 메모",
  "name_auto_tip": "알림 매체와 수신 팀을 고르면 이름이 자동으로 만들어지며 언제든 고칠 수 있습니다",
  "name_auto_separator": "、",
  "add_note_btn": "메모 추가",
  "user_group_ids": "권한을 가진 팀",
  "user_group_ids_tip": "여기 적은 팀의 사용자가 이 알림 전송 규칙을 관리하거나 볼 수 있습니다",
  "enabled_tip": "이 알림 전송 규칙을 쓸지 정합니다",
  "note_tip": "이 알림 전송 규칙의 자세한 정보나 설명을 적어 두면 나중에 관리하기 좋습니다",
  "notification_configuration": {
    "title": "알림 전송 설정",
    "section_desc": "알림을 누구에게 어떤 매체로 보낼지 정합니다. 알림 매체, 메시지 템플릿, 수신 대상을 고르며 여러 개를 추가할 수 있습니다",
    "item_title": "알림 전송 설정",
    "add_btn": "알림 설정 추가",
    "filters": {
      "title": "필터 조건",
      "tip": "이 알림 설정이 조건에 맞는 알림 이벤트에만 적용되도록 제한합니다. 등급, 시간대, 레이블, 속성이 그 조건이며 비워 두면 제한하지 않습니다",
      "severities_all": "모든 등급",
      "severities_none": "등급을 하나도 고르지 않아 어떤 이벤트에도 맞지 않습니다",
      "time_ranges_count": "시간대 {{count}}개",
      "label_keys_count": "레이블 조건 {{count}}개",
      "attributes_count": "속성 조건 {{count}}개",
      "no_extra": "시간대, 레이블, 속성 제한 없음"
    },
    "test_mode": {
      "history": "지난 이벤트 선택",
      "mock": "시뮬레이션 이벤트 사용"
    },
    "mock_test": {
      "empty_alert": "이 환경에는 아직 알림 이벤트가 없습니다. 시뮬레이션 이벤트로 알림 채널을 바로 테스트할 수 있습니다",
      "switch_btn": "시뮬레이션 이벤트 사용하기",
      "desc": "이 알림 설정의 매체와 수신 대상에게 내장 시뮬레이션 알림 이벤트를 한 건 보내 채널이 동작하는지 확인합니다. 시뮬레이션 테스트에서는 필터를 검사하지 않습니다",
      "preview_title": "시뮬레이션 이벤트 미리보기",
      "preview_rule_name": "규칙 이름",
      "preview_severity": "알림 등급",
      "preview_tags": "레이블",
      "rule_name": "알림 테스트용 시뮬레이션 이벤트"
    },
    "channel": "알림 매체",
    "channel_tip": "알림 이벤트를 어떤 매체로 보낼지 고릅니다. 기존 매체로 부족하면 관리자에게 새 매체를 만들어 달라고 요청하세요",
    "channel_msg": "알림 매체를 선택하세요",
    "template": "메시지 템플릿",
    "template_tip": "알림 내용의 템플릿이며 상황에 따라 다른 템플릿을 쓸 수 있습니다",
    "template_msg": "메시지 템플릿을 선택하세요",
    "severities": "적용 등급",
    "severities_tip": "어떤 등급의 알림 이벤트를 전송할지 고릅니다. 고른 등급만 전송되며, 세 등급 모두 고르지 않으면 이 매체는 어떤 이벤트와도 맞지 않아 사실상 꺼 둔 것과 같습니다",
    "time_ranges": "적용 시간대",
    "time_ranges_tip": "알림 전송 규칙을 특정 시간대에만 적용되도록 제한할 수 있으며 비워 두면 제한하지 않습니다",
    "effective_time_start": "시작 시각",
    "effective_time_end": "종료 시각",
    "effective_time_week_msg": "적용할 요일을 선택하세요",
    "effective_time_start_msg": "시작 시각을 선택하세요",
    "effective_time_end_msg": "종료 시각을 선택하세요",
    "fetch_integration_key_failed_remove": "다음 PagerDuty 키를 가져오지 못했습니다: {list}. 다시 눌러 선택해 보세요",
    "label_keys": "적용 레이블",
    "label_keys_tip": "알림 전송 규칙을 이벤트 레이블로 걸러 낸 알림 이벤트에만 적용되도록 제한할 수 있으며 비워 두면 제한하지 않습니다",
    "attributes": "적용 속성",
    "attributes_value": "속성 값",
    "attributes_tip": "알림 전송 규칙을 특정 이벤트 속성에 맞는 알림 이벤트에만 적용되도록 제한할 수 있으며 비워 두면 제한하지 않습니다",
    "attributes_options": {
      "group_name": "비즈니스 그룹",
      "cluster": "데이터 소스",
      "is_recovered": "복구 이벤트인지",
      "rule_id": "알림 규칙",
      "severity": "알림 등급",
      "target_group": "머신 비즈니스 그룹"
    },
    "run_test_btn": "알림 테스트",
    "run_test_btn_tip": "이미 생긴 이벤트를 몇 개 골라 이 알림 설정이 맞는지 확인할 수 있습니다. 설정이 맞다면 알림 메시지가 도착할 것입니다",
    "run_test_request_result": "테스트 알림을 보냈으며 전송 대상의 응답은 다음과 같습니다:",
    "user_info": {
      "user_ids": "수신자",
      "user_group_ids": "수신 팀",
      "error": "수신자와 수신 팀을 모두 비워 둘 수는 없습니다"
    },
    "flashduty": {
      "ids": "협업 공간"
    },
    "pagerduty": {
      "services": "서비스/통합"
    }
  },
  "user_group_id_invalid_tip": "권한을 가진 팀이 없습니다",
  "channel_invalid_tip": "알림 매체가 없습니다",
  "disabled": "사용 중지",
  "pipeline_configuration": {
    "title": "이벤트 처리 워크플로",
    "section_desc": "알림을 보내기 전에 이벤트 처리 워크플로가 알림 이벤트를 다듬습니다. 레이블 붙이기, 보강, 잡음 줄이기 같은 일입니다",
    "manage_btn": "이벤트 처리 워크플로 관리",
    "name_placeholder": "이벤트 처리 워크플로를 선택하세요",
    "name_required": "이벤트 처리 워크플로는 비워 둘 수 없습니다",
    "add_btn": "이벤트 처리 워크플로 추가",
    "disable": "사용 안 함",
    "enable": "사용"
  },
  "escalations": {
    "title": "에스컬레이션 설정",
    "section_desc": "알림이 오래 복구되지 않거나 담당이 정해지지 않으면 지정한 채널로 알림을 올려 아무도 챙기지 않는 일을 막습니다",
    "title_tip": "알림이 정한 시간을 넘도록 복구되지 않으면 아래 조건에 따라 지정한 채널로 알림을 올려 오래 방치되지 않게 합니다. 자세한 설정은 <a>사용 문서</a>를 보세요",
    "item_title": "알림 에스컬레이션",
    "item_add_btn": "알림 에스컬레이션 추가",
    "interval": "점검 주기",
    "interval_required": "점검 주기는 비워 둘 수 없습니다",
    "duration_required": "지속 시간은 비워 둘 수 없습니다",
    "duration_1": "이상 이벤트가",
    "duration_2": "을(를) 넘었고 여전히",
    "duration_3": "상태일 때 이 설정으로 알림을 보냅니다.",
    "repeating_notification": "반복 알림 설정",
    "repeating_notification_tip": "이 옵션을 끄면 같은 이벤트에 대한 에스컬레이션 알림을 한 번만 보냅니다",
    "repeating_notification_1": "간격",
    "repeating_notification_2": "분마다 한 번씩 알리며 최대",
    "repeating_notification_3": "회",
    "notification_interval_required": "알림 간격은 비워 둘 수 없습니다",
    "notification_max_times_required": "최대 반복 알림 횟수는 비워 둘 수 없습니다",
    "event_status_options": {
      "0": "복구되지 않음",
      "1": "복구되지 않고 담당도 없음"
    },
    "time_ranges": {
      "label_tip": "고른 요일과 시간대에만 에스컬레이션이 일어나도록 제한할 수 있으며 비워 두면 제한하지 않습니다"
    },
    "labels_filter": {
      "label_tip": "이 레이블 조건에 맞는 알림 이벤트만 에스컬레이션해 영향 범위를 좁힙니다. 비워 두면 제한하지 않습니다. 기존 레이블 key를 목록에서 고르는 방법을 권하며 직접 입력할 수도 있습니다"
    },
    "attributes_filter": {
      "label_tip": "이 속성들에 모두 맞는 알림만 에스컬레이션합니다. 비워 두면 제한하지 않으며 조건 사이는 그리고로 이어집니다"
    }
  },
  "notify_aggr_configs": {
    "title": "집계 설정",
    "section_desc": "비슷한 알림을 레이블이나 속성 차원으로 묶어 하나의 알림으로 보내 방해를 줄입니다",
    "enable": "집계 켜기",
    "group_enable": "세밀한 집계",
    "group_title": "세밀한 집계",
    "group_add_btn": "세밀한 집계 추가",
    "group_tip1": "다음 조건을 만족하면",
    "group_tip2": "다음 차원으로 묶어 한 건의 알림으로 보냅니다",
    "group_label_keys": "레이블",
    "group_label_keys_required": "레이블은 비워 둘 수 없습니다",
    "group_attribute_keys": "속성",
    "group_attribute_keys_required": "속성은 비워 둘 수 없습니다",
    "group_keys_at_least_one_required": "레이블이나 속성 가운데 최소 하나는 입력해야 합니다",
    "group_duration_1": "알림을 받은 뒤",
    "group_duration_2": "초 안에 들어온 같은 그룹의 알림을 묶어 함께 보냅니다",
    "group_duration_required": "집계 지속 시간은 비워 둘 수 없습니다",
    "default_title": "기본 차원",
    "default_tip": "위 필터에 맞지 않으면 <b>다음 차원으로 묶어 한 건의 알림으로 보냅니다</b>",
    "default_duration_tip": "집계 간격이 너무 크면 알림이 늦게 전송된다는 점에 유의하세요",
    "default_duration_tip2": "최대 집계 간격은 3600초를 넘을 수 없습니다",
    "attribute_keys_map": {
      "cluster": "데이터 소스",
      "cate": "데이터 소스 유형",
      "group_name": "비즈니스 그룹",
      "rule_id": "알림 규칙",
      "rule_prod": "모니터링 유형",
      "severity": "알림 등급",
      "is_recovered": "복구 여부"
    },
    "enable_tip": "켜면 조건에 맞는 알림이 차원별로 묶여 한 건의 알림이 됩니다 <a>사용 문서</a>",
    "labels_filter": {
      "label_tip": "이 레이블 조건에 맞는 알림 이벤트만 묶어 보내 영향 범위를 좁힙니다. 비워 두면 제한하지 않습니다. 기존 레이블 key를 목록에서 고르는 방법을 권하며 직접 입력할 수도 있습니다"
    },
    "attributes_filter": {
      "label_tip": "이 레이블 필터에 맞는 알림만 집계에 참여하며 맞지 않는 알림은 이 규칙의 영향을 받지 않습니다<br />조건 사이는 그리고로 이어지며 아래의 속성 필터와도 그리고로 이어집니다"
    },
    "label_keys": {
      "tip": "ident를 지정하면 ident가 같은 이벤트를 한 그룹으로 묶어 메시지 한 건으로 보냅니다. SMS나 메신저의 잡음을 줄일 때 흔히 씁니다",
      "placeholder": "예: ident, app. 기존 레이블 key를 목록에서 고르는 방법을 권하며 직접 입력할 수도 있습니다"
    },
    "attribute_keys": {
      "tip": "비즈니스 그룹을 지정하면 같은 비즈니스 그룹의 이벤트를 한 그룹으로 묶어 메시지 한 건으로 보냅니다",
      "placeholder": "예: 비즈니스 그룹"
    }
  },
  "statistics": {
    "total_notify_events": "최근 {{days}}일 알림 전송 횟수",
    "total_notify_events_tip": "실제로 전송된 알림만 셉니다. <b>묶이거나 억제되거나 음소거된</b> 이벤트는 포함하지 않습니다",
    "escalation_events": "최근 {{days}}일 에스컬레이션된 이벤트 수",
    "escalation_events_tip": "에스컬레이션 규칙에 걸려 우선순위가 올라간 이벤트 수입니다. 이 수가 많다면 대개 처리 시간이 길다는 뜻이므로 <b>대응 SLA, 에스컬레이션 임계값, 알림 억제 전략</b>을 손볼 필요가 있습니다",
    "noise_reduction_ratio": "최근 {{days}}일 잡음 감소율",
    "noise_reduction_ratio_tip": "잡음 감소율 = <b>(1 − 실제 전송한 알림 수 ÷ 원래 알림 이벤트 수) × 100%</b>. <b>100%</b>에 가까울수록 <b>잡음이 잘 줄어든 것</b>입니다"
  },
  "tabs": {
    "events": "이벤트 목록",
    "rules": "알림 규칙",
    "sub_rules": "구독 규칙"
  }
};

export default ko_KR;
