const ko_KR = {
  "title": "워크플로",
  "title_add": "워크플로 추가",
  "title_edit": "워크플로 수정",
  "title_clone": "워크플로 복제",
  "teams": "권한을 가진 팀",
  "teams_tip": "어떤 팀의 구성원이 이 설정을 보고 수정할 수 있는지 정하며 여러 팀을 연결할 수 있습니다<br />예를 들어 infra-team에 권한을 주면 infra-team 구성원만 이 설정에 접근하거나 손댈 수 있습니다.",
  "basic_configuration": "기본 설정",
  "filter_enable": "필터 조건",
  "label_filters": "적용 레이블",
  "label_filters_tip": "이벤트 처리에 쓸 레이블 필터를 지정합니다. 여기 설정과 맞는 레이블을 가진 이벤트만 처리됩니다.<br />예를 들어 service=mon을 적으면 service=mon 레이블이 있는 이벤트만 이 처리 흐름에 들어옵니다.",
  "attribute_filters": "적용 속성",
  "attribute_filters_tip": "이벤트 처리에 쓸 속성 필터를 지정합니다. 여기 설정과 맞는 속성을 가진 이벤트만 처리됩니다.<br />예를 들어 비즈니스 그룹 == DefaultBusiGroup을 적으면 비즈니스 그룹 속성이 DefaultBusiGroup인 이벤트만 이 처리 흐름에 들어옵니다.",
  "attribute_filters_value": "속성 값",
  "attribute_filters_options": {
    "group_name": "비즈니스 그룹",
    "cluster": "데이터 소스",
    "is_recovered": "복구 이벤트인지",
    "severity": "알림 등급 구분"
  },
  "use_case": {
    "label": "용도",
    "firemap": "Firemap",
    "event_pipeline": "이벤트 처리"
  },
  "processors_col": "프로세서",
  "clone_suffix": "-사본",
  "unsaved_confirm": "저장되지 않은 변경이 있습니다. 그래도 닫을까요?",
  "search_placeholder": "이름, 메모, 프로세서 유형 검색",
  "empty_guide": {
    "title": "아직 워크플로가 없습니다",
    "doc": "사용 문서 보기",
    "mount_hint": "워크플로는 만들었다고 바로 동작하지 않습니다. 알림 규칙이나 통지 규칙에서 참조해야 실행됩니다"
  },
  "scenario_tips": {
    "title": "워크플로는 다음 세 가지 상황에 알맞습니다",
    "denoise": "잡음 줄이기: 등급이 낮거나 반복되는 알림을 통지 전에 버리거나 억제합니다",
    "enrich": "보강: 알림에 업무 레이블, AI 요약, 조회한 맥락 정보를 덧붙입니다",
    "dispatch": "외부 호출: 알림을 티켓이나 자동화 시스템으로 넘기거나 복구 스크립트를 실행합니다",
    "more": "자세히 보기"
  },
  "trigger_mode": {
    "label": "실행 방식",
    "event": "이벤트로 실행",
    "api": "API로 실행"
  },
  "disabled": {
    "filter_placeholder": "사용 상태",
    "form_label": "사용",
    "label": "사용",
    "false": "사용",
    "true": "사용 중지"
  },
  "inputs": {
    "label": "사전 변수",
    "help": "사전 변수는 아래 프로세서에서 {{$inputs.변수이름}} 형태로 참조할 수 있습니다. 예를 들어 ident 변수를 만들어 두고 프로세서에서 {{$inputs.ident}}로 참조해 스크립트를 실행할 머신을 지정할 수 있습니다.",
    "add_btn": "변수 추가",
    "key": "변수 이름",
    "key_required": "변수 이름은 비워 둘 수 없습니다",
    "value": "변수 기본값",
    "description": "변수 설명"
  },
  "executions": {
    "title": "실행 기록",
    "search_placeholder": "검색어를 입력하세요",
    "status": {
      "label": "상태",
      "running": "실행 중",
      "success": "성공",
      "failed": "실패",
      "terminated": "중단됨",
      "skipped": "건너뜀",
      "streaming": "스트리밍 출력 중"
    },
    "id": "실행 ID",
    "pipeline_name": "워크플로 이름",
    "mode": "실행 방식",
    "created_at": "시작 시각",
    "finished_at": "종료 시각",
    "duration_ms": "실행 소요 시간",
    "trigger_by": "실행 주체",
    "detail_title": "실행 상세",
    "detail_basic_info": "기본 정보",
    "error_message": "오류 메시지",
    "message": "실행 메시지",
    "error_node": "오류가 난 노드",
    "inputs_snapshot": "입력 변수 스냅숏",
    "node_results_parsed_title": "노드 실행 결과",
    "event_id": "이벤트 ID",
    "view_all": "전체 보기",
    "filtered_by": "워크플로: {{name}}",
    "trigger_by_alert_rule": "알림 규칙 #{{id}}",
    "trigger_by_notify_rule": "통지 규칙 #{{id}}",
    "empty_guide": {
      "title": "이 기간에는 실행 기록이 없습니다",
      "desc": "알림 규칙이나 통지 규칙이 워크플로를 실행할 때마다 여기에 기록이 남습니다. 위쪽 시간 범위를 넓히거나 필터를 느슨하게 해 보세요."
    }
  },
  "test_modal": {
    "title": {
      "settings": "테스트 이벤트 선택",
      "result": "시험 실행 결과"
    },
    "result_success": "실행에 성공했습니다",
    "result_failed": "실행에 실패했습니다",
    "dropped": "이 단계에서 이벤트가 버려지거나 억제되어 이후 프로세서는 실행되지 않고 통지도 나가지 않습니다",
    "steps_title": "노드별 실행 결과",
    "event_preview_title": "처리한 뒤의 이벤트",
    "back_btn": "다른 이벤트 선택",
    "back_btn_mock": "예시 이벤트 다시 설정",
    "fidelity_note": "시험 실행은 API 실행 경로를 타기 때문에 필터 판정 같은 운영 단계 일부를 건너뜁니다. 그래서 결과가 실제 알림과 다를 수 있으니 실제 이벤트를 기준으로 삼으세요.",
    "fidelity_note_mock": "시험 실행은 API 실행 경로를 타기 때문에 필터 판정 같은 운영 단계 일부를 건너뜁니다. 이번에는 실제 알림이 아니라 예시 이벤트를 썼으니 운영에 반영하기 전에 실제 이벤트로 한 번 더 확인하세요.",
    "mode": {
      "history": "지난 이벤트",
      "mock": "예시 이벤트"
    },
    "mock": {
      "desc": "예시 이벤트는 시스템이 만들어 낸 것이라 데이터베이스에 저장되지 않으므로, 지난 알림이 없는 새 환경에서도 프로세서 설정을 확인할 수 있습니다. 등급과 복구 상태를 바꿀 수 있어 둘에 따라 갈라지는 프로세서도 시험해 볼 수 있습니다.",
      "preview_title": "예시 이벤트",
      "severity": "알림 등급",
      "is_recovered": "복구 이벤트",
      "tags": "이벤트 레이블",
      "empty_alert": "이 기간에는 지난 알림 이벤트가 없습니다",
      "switch_btn": "예시 이벤트로 시험 실행"
    }
  },
  "batch": {
    "not_select": "먼저 작업할 워크플로를 선택하세요",
    "export": {
      "title": "일괄 내보내기"
    },
    "delete": "일괄 삭제",
    "enable": "일괄 사용",
    "disable": "일괄 중지",
    "already_enabled": "선택한 워크플로는 모두 이미 켜져 있습니다",
    "already_disabled": "선택한 워크플로는 모두 이미 꺼져 있습니다",
    "enable_confirm": "선택한 워크플로 {{count}}개를 켤까요?",
    "disable_confirm": "선택한 워크플로 {{count}}개를 끌까요?",
    "delete_enabled_confirm": "그중 {{count}}개는 아직 켜져 있어 먼저 끈 뒤 삭제합니다. 계속할까요?",
    "delete_confirm": "선택한 워크플로 {{count}}개를 삭제할까요? 이를 참조하는 알림 규칙과 통지 규칙이 동작을 멈춥니다."
  },
  "relabel_fields": {
    "action": "동작",
    "target_label": "대상 레이블",
    "replacement": "레이블 값",
    "source_labels": "원본 레이블",
    "separator": "연결 문자",
    "regex": "정규식",
    "replace_hint": "replace는 원본 레이블의 값을 정규식으로 뽑아내 대상 레이블에 씁니다. 대상 레이블과 값만 채우면 이벤트에 고정 레이블을 붙이는 셈입니다. 대상 레이블을 비워 두면 이 프로세서는 아무 일도 하지 않습니다."
  },
  "processor_message": {
    "drop_hit": "버리기 조건에 걸려 이벤트를 버렸습니다",
    "drop_miss": "버리기 조건에 걸리지 않아 이벤트가 다음 단계로 넘어갑니다",
    "no_change": "변경 없음"
  },
  "processor": {
    "title": "프로세서",
    "add_btn": "프로세서 추가",
    "typ": "유형",
    "typ_required": "프로세서 유형을 선택하세요. 유형이 없는 프로세서는 모든 이벤트에서 실행에 실패합니다",
    "help_btn": "사용 안내",
    "options": {
      "relabel": "이벤트 레이블 재작성",
      "label_enrich": "이벤트 레이블 보강",
      "inhibit": "이벤트 억제",
      "event_drop": "이벤트 버리기",
      "event_update": "이벤트 갱신",
      "inhibit_qd": "이벤트 억제 (조회 기반)",
      "annotation_qd": "이벤트 추가 정보 보강 (조회 기반)",
      "callback": "Webhook 콜백",
      "ai_summary": "AI 요약 생성",
      "script": "스크립트 실행",
      "event_recover": "자동 복구",
      "alert_shot": "알림 화면 캡처"
    },
    "category": {
      "rewrite": "이벤트 고치기",
      "denoise": "잡음 줄이기",
      "enrich": "보강",
      "dispatch": "외부 호출과 실행",
      "other": "기타"
    },
    "options_desc": {
      "relabel": "이벤트 레이블을 수정, 추가, 삭제합니다",
      "event_drop": "조건에 따라 이벤트를 버리고 더 처리하지 않습니다",
      "event_update": "HTTP API를 호출해 그 반환값으로 이벤트를 갱신합니다",
      "callback": "이벤트를 티켓이나 자동화 같은 외부 시스템으로 넘깁니다",
      "ai_summary": "LLM으로 이벤트 요약을 생성합니다",
      "label_enrich": "내장 사전으로 이벤트 레이블을 채웁니다",
      "script": "스크립트를 실행해 이벤트를 처리합니다",
      "inhibit": "더 높은 등급의 활성 알림이 있으면 이 통지를 억제합니다",
      "inhibit_qd": "데이터 조회 결과에 따라 이벤트를 억제합니다",
      "annotation_qd": "데이터 조회 결과를 이벤트에 덧붙입니다",
      "event_recover": "자동 복구 작업을 실행합니다",
      "alert_shot": "대시보드나 웹 페이지를 캡처해 알림에 붙입니다"
    },
    "delete_confirm": "이 프로세서를 삭제할까요?",
    "switch_type_confirm": "유형을 바꾸면 이 프로세서의 설정이 지워집니다. 계속할까요?",
    "drag_tip": "끌어서 순서 바꾸기",
    "move_up": "위로",
    "move_down": "아래로",
    "copy_tip": "이 프로세서 복사"
  },
  "form_section": {
    "filter": {
      "title": "처리 범위",
      "desc": "어떤 알림 이벤트가 이 워크플로에 들어올지 정합니다. 조건 사이는 그리고로 이어지며, 전부 비워 두면 모든 이벤트가 들어옵니다"
    },
    "processor": {
      "title": "프로세서",
      "desc": "이벤트는 위에서 아래 순서로 프로세서를 하나씩 거칩니다"
    },
    "basic": {
      "title": "기본 정보",
      "desc": "워크플로의 이름, 권한을 가진 팀, 사용 상태"
    }
  },
  "no_filter_warning": "필터가 하나도 설정되어 있지 않아 이 워크플로는 모든 알림 이벤트를 처리합니다",
  "section_summary": {
    "label_count": "레이블 조건 {{count}}개",
    "attr_count": "속성 조건 {{count}}개",
    "no_filter": "모든 이벤트 포함",
    "processor_count": "프로세서 {{count}}개",
    "unnamed": "이름 없음",
    "enabled": "켜짐",
    "disabled": "꺼짐"
  },
  "name_auto": {
    "tip": "이름은 위의 처리 범위와 프로세서를 바탕으로 자동으로 만들어지며 언제든 직접 고칠 수 있습니다",
    "all": "모든 알림",
    "arrow": "→",
    "joiner": "-"
  },
  "saved_guide": {
    "title": "워크플로를 저장했습니다",
    "hint": "아직 동작하지는 않습니다. 통지 규칙에서 이 워크플로를 참조해야 이벤트가 여기를 거칩니다.",
    "to_notify_rule": "통지 규칙에 연결하기",
    "done": "완료"
  },
  "label_enrich": {
    "label_source_type": {
      "label": "레이블 출처",
      "options": {
        "built_in_mapping": "내장 레이블 사전"
      }
    },
    "label_mapping_id": "사전 이름",
    "help": "원본 레이블에서 지정한 레이블로 사전을 조회하고, 찾아낸 필드를 \"레이블 추가\" 설정에 따라 알림 이벤트에 덧붙입니다",
    "source_keys": {
      "label": "원본 레이블",
      "text": "사전의 필드 <strong>{{field}}</strong>이(가) 이벤트의 레이블에 대응합니다",
      "target_key_placeholder": "레이블 Key",
      "target_key_required": "레이블 Key는 비워 둘 수 없습니다"
    },
    "append_keys": {
      "label": "레이블 추가",
      "source_key_placeholder": "사전의 필드",
      "rename_key": "레이블 Key 이름 바꾸기",
      "target_key_placeholder": "레이블 Key"
    }
  },
  "callback": {
    "url": "URL",
    "advanced_settings": "고급 설정",
    "basic_auth_user": "인증 사용자 이름",
    "basic_auth_user_placeholder": "인증 사용자 이름을 입력하세요",
    "basic_auth_pass": "인증 비밀번호",
    "basic_auth_pass_placeholder": "인증 비밀번호를 입력하세요"
  },
  "event_drop": {
    "hint": "템플릿의 최종 출력이 true이면 이벤트를 버리고, 그 밖의 값이면 통과시킵니다. 쓸 수 있는 변수는 $event.Severity(1/2/3), $event.IsRecovered, $event.RuleName, $event.TagsMap.레이블이름입니다",
    "snippets_label": "예시 넣기",
    "snippets": {
      "severity": "S3 정보 등급 알림 버리기",
      "recovered": "복구 통지 버리기",
      "tag": "레이블 기준으로 버리기",
      "rule_name": "규칙 이름 기준으로 버리기"
    },
    "replace_confirm": "지금의 판정 로직이 예시로 바뀝니다. 계속할까요?",
    "content": "판정 로직",
    "content_placeholder": "go template 문법을 사용하며 최종 결과가 true이면 이 단계에서 이벤트를 버립니다"
  },
  "ai_summary": {
    "llm_config": "기존 LLM 설정 사용",
    "llm_config_placeholder": "이미 설정된 LLM을 고르거나, 비워 두고 아래 매개변수를 직접 채우세요",
    "llm_config_tip": "AI 설정 - LLM 설정에 있는 모델 설정을 골라 모델, 키, 주소 등을 그대로 씁니다. 비워 두면 아래에 직접 입력한 매개변수를 사용합니다.",
    "url_placeholder": "API 서비스 주소를 입력하세요",
    "url_required": "URL을 입력하세요",
    "api_key_placeholder": "API 키",
    "api_key_required": "API 키를 입력하세요",
    "model_name": "모델 이름",
    "model_name_placeholder": "예: deepseek-chat",
    "model_name_required": "모델 이름을 입력하세요",
    "prompt_template": "프롬프트 템플릿",
    "prompt_template_required": "프롬프트 템플릿을 입력하세요",
    "advanced_config": "고급 설정",
    "custom_params": "AI 모델 매개변수 설정",
    "custom_params_key_label": "매개변수 이름 (예: temperature)",
    "custom_params_value_label": "매개변수 값 (예: 0.7)",
    "proxy_placeholder": "예: http://proxy.example.com:8080",
    "timeout_placeholder": "제한 시간 (초)",
    "timeout_required": "제한 시간을 입력하세요",
    "url_tip": "- **설명**: AI 서비스의 API 주소\n- **예시**: `https://api.deepseek.com/v1/chat/completions`",
    "api_key_tip": "- **설명**: AI 서비스 공급자의 API 키\n- **얻는 방법**:\n  - OpenAI: OpenAI 공식 사이트에서 신청\n  - DeepSeek: DeepSeek 공식 사이트에 가입해 발급",
    "model_name_tip": "- **설명**: 사용할 AI 모델 이름\n- **자주 쓰는 모델**:\n  - `gpt-3.5-turbo` (OpenAI)\n  - `gpt-4` (OpenAI)\n  - `deepseek-chat` (DeepSeek)",
    "prompt_template_tip": "프롬프트 템플릿은 AI 분석의 핵심입니다. {{$event}}로 이벤트의 각 필드를 참조할 수 있으며, 자세한 구조는 [알림 이력 표](https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/events/alert-history/) 문서를 보세요. 처음에는 기본 템플릿만으로도 충분합니다",
    "prompt_template_placeholder": "다음 알림 이벤트 정보를 분석해 한국어로 간결한 요약을 작성해 주세요:\n알림 규칙: {{$event.RuleName}}\n심각도: {{$event.Severity}}\n알림 상태: {{if $event.IsRecovered}}Recovered{{else}}{{$event.Severity}} Triggered{{end}}       \n발생 시각: {{$event.TriggerTime}}\n발생 당시 값: {{$event.TriggerValue}}\n규칙 설명: {{$event.RuleNote}}\n레이블: {{$event.Tags}}\n주석: {{$event.Annotations}}\n\n다음 내용을 중심으로 100자 이내의 한국어 요약을 작성해 주세요:\n1. 어떤 시스템이나 서비스에 어떤 문제가 생겼는지\n2. 문제가 얼마나 심각한지\n3. 어떤 영향이 있을 수 있는지\n4. 간단한 대응 방법\n운영 담당자가 상황을 빠르게 파악할 수 있도록 간결하고 분명하게 써 주세요.",
    "custom_params_tip": "AI 모델의 동작을 세밀하게 조정할 때 씁니다:\n\n| 매개변수 | 설명 | 권장 값 | 예시 |\n|--------|------|--------|------|\n| temperature | 답변의 무작위성 조절 | 0.3-0.7 | 0.7 |\n| max_tokens | 최대 출력 토큰 수 | 200-500 | 300 |\n| top_p | 샘플링 확률 임계값 | 0.8-1.0 | 0.9 |\n\n**설정 방법**:\n1. \"Custom Params\" 옆의 + 버튼을 누릅니다\n2. 매개변수 이름 칸에 이름을 입력합니다 (예: temperature)\n3. 매개변수 값 칸에 값을 입력합니다 (예: 0.7)"
  },
  "script": {
    "timeout": "제한 시간 (밀리초)",
    "timeout_tooltip": "스크립트 실행의 최대 제한 시간이며 이를 넘으면 스크립트를 중단합니다",
    "timeout_placeholder": "제한 시간을 입력하세요",
    "content": "스크립트 내용",
    "content_tooltip": "이벤트를 처리할 스크립트 코드를 작성하세요. 알림 이벤트는 stdin으로 전달되며, 스크립트는 그 이벤트를 JSON 객체로 stdout에 출력해야 합니다",
    "content_placeholder": "스크립트 내용을 입력하세요"
  },
  "inhibit": {
    "help": "이벤트 억제 프로세서는 어떤 알림이 전송될 때 다른 알림 이벤트의 통지를 막아 통지 수를 줄입니다. 예를 들어 같은 알림 규칙에 P1 등급의 활성 장애가 있으면 P2와 P3 등급의 통지를 무시합니다. 자세한 내용은 <a>사용 문서</a>를 보세요",
    "tip1": "<b>새 알림</b>이 다음 조건에 맞고",
    "tip2": "그리고",
    "tip3": "초 안에 다음 조건에 맞는 <b>활성 알림</b>이 있으며",
    "tip4": "<b>새 알림</b>과 <b>활성 알림</b>이 다음 항목에서 같을 때",
    "tip5": "위 조건을 모두 만족하면 이 알림은 억제되어 통지되지 않습니다",
    "duration_required": "억제 시간은 비워 둘 수 없습니다",
    "duration_max": "억제 시간은 600초를 넘을 수 없습니다",
    "match_label_keys": "레이블",
    "match_label_keys_required": "레이블은 비워 둘 수 없습니다",
    "match_attribute_keys": "속성",
    "match_attribute_keys_required": "속성은 비워 둘 수 없습니다",
    "keys_at_least_one_required": "레이블이나 속성이 최소 하나는 있어야 합니다",
    "labels_conflict": "레이블 {{label}}의 값이 달라 억제할 수 없습니다",
    "attributes_conflict": "속성 {{attribute}}의 값이 달라 억제할 수 없습니다",
    "preview": "규칙 미리보기: 「<b>새 알림: {{newAlertLabelsAttrs}}</b>」이 있고 지난 「<b>{{duration}}초</b>」 안에 「<b>활성 알림: {{activeAlertLabelsAttrs}}</b>」이 있으며, 두 알림이 「<b>{{matchLabelsAttrs}}</b>」에서 같다면 새 알림의 전송을 억제합니다.",
    "labels_filter": {
      "label": "레이블",
      "label_tip": "이 레이블 조건에 맞는 알림 이벤트만 억제해 영향 범위를 좁힙니다. 비워 두면 제한하지 않습니다. 기존 레이블 key를 목록에서 고르는 방법을 권하며 직접 입력할 수도 있습니다",
      "label_placeholder": "일치에 사용할 레이블 key를 입력하거나 선택하세요. 예: app, cluster, alertname"
    },
    "labels_filter_value_placeholder": "일치에 쓸 레이블 값을 직접 입력하거나 고르세요",
    "attributes_filter": {
      "label": "속성",
      "label_tip": "이벤트 속성으로 억제 범위를 좁힙니다. 이 속성들에 모두 맞는 알림만 억제되며, 비워 두면 모든 알림에 적용됩니다"
    },
    "active_event_labels_filter": {
      "label": "레이블",
      "label_tip": "**활성 알림의 범위를 좁히는 데 씁니다**\n- 비워 두면: 레이블로 걸러 내지 않습니다\n- 채우면: 기존 레이블 key를 목록에서 고르거나 직접 입력할 수 있으며, 이 레이블 조건을 모두 만족하는 활성 알림만 범위에 들어옵니다.\n\n예를 들어 service=mon을 적으면 service=mon 레이블이 있는 이벤트만 이후 억제 로직에 참여합니다."
    },
    "active_event_attributes_filter": {
      "label": "속성",
      "label_tip": "**활성 알림의 범위를 좁히는 데 씁니다**\n- 비워 두면: 속성으로 걸러 내지 않습니다\n- 채우면: 이 속성 조건을 모두 만족하는 활성 알림만 골라냅니다.\n\n예를 들어 비즈니스 그룹 == DefaultBusiGroup을 적으면 비즈니스 그룹 속성이 DefaultBusiGroup인 활성 이벤트만 골라 이후 이벤트 억제 흐름에 씁니다"
    }
  },
  "inhibit_qd": {
    "help": "조회 결과로 이벤트를 억제합니다. 알림이 발생하면 아래 데이터 조회를 실행하고, 한 건이라도 결과가 있으면 이번 알림을 억제해 통지하지 않으며, 결과가 없으면 평소대로 통지합니다. 자세한 내용은 <a>사용 문서</a>를 보세요",
    "t_1": "그리고 다음 <b>데이터</b>가 조회될 때"
  },
  "annotation_qd": {
    "help": "추가 조회 프로세서는 알림을 풍부하게 만드는 방법입니다. 알림이 발생하면 데이터 소스에서 로그 같은 관련 정보를 조회해 알림에 붙입니다. 자세한 내용은 <a>사용 문서</a>를 보세요",
    "query_configs": "데이터 조회",
    "use_event_datasource": "알림 이벤트의 데이터 소스 사용",
    "use_event_datasource_help": "켜면 데이터 소스 유형이 맞는 알림 예시 이벤트만 고를 수 있습니다",
    "datasource_cate_required": "데이터 소스 유형은 비워 둘 수 없습니다",
    "datasource_ids_required": "데이터 소스는 비워 둘 수 없습니다",
    "select_alert_event_btn": "알림 예시 이벤트 선택",
    "select_alert_event_tip": "쿼리문의 변수를 채우고 데이터를 미리 볼 수 있도록 알림 예시 이벤트를 고르세요",
    "select_alert_event_label": "선택한 알림 예시 이벤트",
    "query_required": "조회 조건은 비워 둘 수 없습니다",
    "sql_limit_valid": "SQL 쿼리문에는 LIMIT 절이 있어야 합니다",
    "oracle_sql_limit_valid": "SQL 쿼리문에는 ROWNUM 절이 있어야 합니다",
    "annotation_configs": "데이터 덧붙이기",
    "annotation_configs_tip": "키와 값을 설정해 조회 결과를 알림 정보에 덧붙입니다",
    "annotation_key_tip": "새 필드의 키를 정합니다. 영문자로 짓기를 권합니다",
    "annotation_val_tip": "새 필드의 값 템플릿이며 작성 방법은 사용 문서를 참고하세요",
    "annotation_key_placeholder": "추가 필드 이름",
    "annotation_val_placeholder": "추가 필드의 내용이며 템플릿 문법을 지원해 조회 결과를 변수로 채울 수 있습니다",
    "annotation_key_required": "추가 필드 이름은 비워 둘 수 없습니다",
    "annotation_val_required": "추가 필드 내용은 비워 둘 수 없습니다",
    "data_preview": "데이터 미리보기",
    "data_preview_query": "쿼리문",
    "data_preview_no_eventid": "먼저 알림 이벤트를 선택하세요",
    "query_limit": "반환 건수 제한"
  },
  "event_recover": {
    "help": "자동 복구 프로세서는 알림이 발생했을 때 머신에서 셸 스크립트를 실행합니다. 관련 정보를 모으거나 복구 작업을 수행하는 데 씁니다. <a>사용 문서</a>",
    "title": "자동 복구",
    "create_btn": "자동 복구 템플릿 만들기",
    "tpl_id": "자동 복구 템플릿",
    "tpl_id_required": "자동 복구 템플릿은 비워 둘 수 없습니다",
    "host": "실행 머신",
    "host_placeholder": "비워 둘 수 있으며, 비어 있으면 이벤트의 ident 레이블에서 실행할 머신을 가져옵니다",
    "args": "매개변수",
    "args_tip": "스크립트에 전달할 인자이며 여러 개일 때는 쉼표 두 개로 구분합니다. 예: arg1,,arg2,,arg3",
    "save_result": "실행 결과 저장",
    "save_result_tip": "스크립트 실행 결과를 알림 이벤트에 저장합니다",
    "timeout": "실행 대기 시간",
    "timeout_tip": "스크립트가 대기 시간 안에 끝나지 않으면 결과를 기다리지 않습니다",
    "timeout_max_warning": "실행 대기 시간은 60초를 넘을 수 없습니다",
    "select_host": "머신 필터"
  },
  "alert_shot": {
    "help": "<a>사용 문서</a>",
    "title": "알림 화면 캡처",
    "shot_type": {
      "label": "대상 유형",
      "options": {
        "board": "대시보드",
        "url": "URL 주소"
      }
    },
    "advanced_settings": "고급 설정",
    "board_shot_opts": {
      "busi_group": "비즈니스 그룹",
      "board_id": "대시보드",
      "board_url": "대시보드 URL",
      "timeout": "제한 시간 (밀리초)",
      "width": "이미지 너비"
    },
    "url_shot_opts": {
      "url": "URL 주소",
      "headers": "요청 헤더",
      "proxy": "프록시 설정",
      "insecure_skip_verify": "인증서 검증 건너뛰기",
      "timeout": "제한 시간 (밀리초)",
      "width": "이미지 너비"
    }
  }
};

export default ko_KR;
