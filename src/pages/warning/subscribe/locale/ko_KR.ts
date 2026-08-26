const ko_KR = {
  "title": "구독 규칙",
  "search_placeholder": "구독 이름, 구독한 규칙, 구독 레이블, 알림 수신 그룹 검색",
  "rule_name": "구독한 규칙",
  "sub_rule_name": "구독할 알림 규칙",
  "sub_rule_selected": "선택한 규칙",
  "tags": "구독 레이블",
  "user_groups": "알림 수신 그룹",
  "notify_rule_ids": "통지 규칙",
  "tag": {
    "key": {
      "label": "구독 이벤트 레이블 key",
      "tip": "여기서 말하는 레이블은 알림 이벤트의 레이블이며, 아래 일치 규칙으로 알림 이벤트를 걸러 냅니다",
      "required": "레이블 key는 비워 둘 수 없습니다",
      "placeholder": "레이블 key를 입력하세요"
    },
    "func": {
      "label": "연산자"
    },
    "value": {
      "label": "레이블 값",
      "equal_placeholder": "값을 입력하세요",
      "include_placeholder": "값을 여러 개 입력할 수 있으며 Enter로 구분합니다",
      "regex_placeholder": "일치시킬 정규식을 입력하세요",
      "required": "레이블 값은 비워 둘 수 없습니다"
    }
  },
  "group": {
    "key": {
      "label": "구독할 비즈니스 그룹",
      "placeholder": "비즈니스 그룹"
    },
    "func": {
      "label": "연산자"
    },
    "value": {
      "label": "값",
      "required": "값은 비워 둘 수 없습니다"
    }
  },
  "redefine_severity": "알림 등급 다시 지정",
  "redefine_channels": "통지 매체 다시 지정",
  "redefine_webhooks": "콜백 주소 다시 지정",
  "user_group_ids": "구독할 알림 수신 그룹",
  "for_duration": "이벤트 지속 시간이 다음을 넘을 때 구독 (초)",
  "for_duration_tip": "예를 들어 300으로 설정했다면, 같은 알림 이벤트가 처음 구독에 걸릴 때는 조건에 맞지 않습니다. 이후 다시 걸릴 때 그 시점의 발생 시각과 처음 걸렸을 때의 발생 시각 차이를 계산해, 300초를 넘으면 구독 조건을 만족해 통지 로직을 타고, 300초보다 작으면 구독에 걸리지 않습니다. 이 기능은 통지 에스컬레이션으로도 쓸 수 있습니다. 팀 책임자가 지속 시간 1시간(3600초)이 넘는 구독을 만들고 수신자를 자기 자신으로 두면, 최종 책임자로서 모든 알림에 누군가는 반드시 대응하도록 보장할 수 있습니다.",
  "webhooks": "새 콜백 주소",
  "webhooks_msg": "콜백 주소는 비워 둘 수 없습니다",
  "prod": "모니터링 유형",
  "subscribe_btn": "구독",
  "basic_configs": "기본 설정",
  "severities": "구독할 이벤트 등급",
  "severities_msg": "구독할 이벤트 등급은 비워 둘 수 없습니다",
  "tags_groups_require": "레이블이나 수신 그룹 가운데 최소 하나는 입력해야 합니다",
  "note": "구독 이름",
  "filter_configs": "필터 설정",
  "notify_configs": "통지 설정",
  "and": "그리고",
  "btn_add_rule": "규칙 추가",
  "basic_configs_desc": "구독 규칙의 이름과 사용 상태이며 이름은 위 설정으로 자동으로 만들 수 있습니다",
  "filter_configs_desc": "어떤 알림 이벤트가 이 구독에 걸릴지 정합니다. 아래 조건 사이는 그리고로 이어지며, 전부 비워 두면 모든 알림 이벤트가 걸립니다",
  "notify_configs_desc": "걸린 알림 이벤트를 아래 통지 규칙으로 한 번 더 통지합니다. 알림을 올리거나 다른 팀에 넘길 때 흔히 씁니다",
  "no_filter_warning": "필터가 하나도 설정되어 있지 않아 이 구독은 모든 알림 이벤트에 걸립니다",
  "sub_rule_select": "알림 규칙 선택",
  "for_duration_placeholder": "비워 두거나 0을 넣으면 제한하지 않습니다",
  "note_msg": "구독 이름은 비워 둘 수 없습니다",
  "notify_rule_ids_msg": "통지 규칙을 최소 하나는 고르세요. 그렇지 않으면 구독에 걸린 이벤트가 전송되지 않습니다",
  "name_auto": {
    "tip": "이름은 위의 필터와 통지 설정을 바탕으로 자동으로 만들어지며 언제든 직접 고칠 수 있습니다",
    "all": "모든 알림",
    "escalation": "에스컬레이션",
    "separator": ", ",
    "joiner": "-",
    "clone_suffix": "-사본"
  },
  "section_summary": {
    "severities_all": "모든 등급",
    "severities_none": "등급을 고르지 않아 어떤 이벤트에도 맞지 않습니다",
    "rules_count": "규칙 {{count}}개",
    "busi_groups_count": "비즈니스 그룹 조건 {{count}}개",
    "tags_count": "레이블 조건 {{count}}개",
    "for_duration": "{{count}}초 넘게 지속",
    "no_extra": "그 밖의 조건 없음",
    "notify_rules_none": "통지 규칙을 고르지 않았습니다",
    "user_groups_none": "수신 그룹을 고르지 않았습니다",
    "unnamed": "이름 없음",
    "enabled": "켜짐",
    "disabled": "꺼짐"
  },
  "empty_guide": {
    "title": "아직 구독 규칙이 없습니다",
    "doc": "사용 문서 보기"
  },
  "scenario_tips": {
    "title": "구독 규칙은 다음 세 가지 상황에 알맞습니다",
    "cross_team": "다른 팀의 알림 구독하기: 내가 의존하는 하위 서비스를 다른 팀이 맡고 있지만 그 장애가 나에게도 영향을 주니 그쪽 SLI 알림을 받고 싶을 때",
    "escalation": "에스컬레이션 안전망: 1시간 동안 복구되지 않은 알림을 팀 책임자에게 한 번 더 통지하기",
    "global_callback": "전역 콜백: 모든 알림 이벤트를 웹훅 하나로 보내 자동화에 쓰기",
    "more": "자세히 보기"
  },
  "filter_disabled": {
    "0": "사용 중",
    "1": "사용 안 함",
    "placeholder": "사용 상태"
  }
};

export default ko_KR;
