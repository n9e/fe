const ko_KR = {
  "title": "메시지 템플릿",
  "add_title": "메시지 템플릿 추가",
  "edit_title": "메시지 템플릿 수정",
  "clone_title": "메시지 템플릿 복제",
  "user_group_ids": "권한을 가진 팀",
  "private": {
    "0": "공용",
    "1": "비공개",
    "title": "표시 모드"
  },
  "notify_channel_ident": "매체 유형",
  "content": {
    "add_title": "템플릿 필드 추가",
    "edit_title": "템플릿 필드 수정",
    "preview": "템플릿 내용 미리보기",
    "contentKey": "필드 식별자",
    "tip": "알림 매체에서 쓸 수 있는 필드이며 $tpl.{{contentKey}}로 그 내용을 참조합니다",
    "prompt": "내용이 바뀌었습니다. 변경 내용을 버릴까요?",
    "value_msg": "필드 내용을 입력하세요",
    "ai_generate": "AI로 생성"
  },
  "preview": {
    "mode": {
      "history": "지난 이벤트",
      "mock": "시뮬레이션 이벤트"
    },
    "empty_alert": "이 환경에는 아직 지난 알림 이벤트가 없습니다",
    "switch_btn": "시뮬레이션 이벤트로 미리보기",
    "select_events": "알림 이벤트 선택",
    "result": "미리보기 결과"
  },
  "starter": {
    "rule_name": "규칙",
    "severity": "등급",
    "status": "상태",
    "firing": "발생",
    "recovered": "복구됨",
    "tags": "레이블",
    "trigger_value": "발생 당시 값",
    "time": "시간",
    "detail": "상세"
  },
  "empty_guide": {
    "title": "첫 메시지 템플릿 만들기",
    "desc": "메시지 템플릿은 알림 내용의 짜임새를 정합니다. 새로 만들 때 고른 알림 매체에 맞춰 바로 쓸 수 있는 템플릿이 자동으로 만들어지며 거기서부터 다듬으면 됩니다."
  },
  "fields_panel": {
    "desc": "템플릿에서 참조할 수 있는 알림 이벤트 변수입니다. 아무 변수나 누르면 복사되며 왼쪽 편집기에 붙여 넣어 쓰면 됩니다.",
    "fields": {
      "event": "알림 이벤트 객체 전체이며 모든 필드를 살펴볼 때 씁니다",
      "labels": "이벤트 레이블 매핑이며 $event.TagsMap과 같습니다",
      "value": "발생 당시 값이며 $event.TriggerValue와 같습니다",
      "domain": "사이트 주소이며 이벤트 상세 링크를 만들 때 씁니다",
      "timestamp": "현재 시각이며 보통 메시지를 보낸 시각으로 씁니다",
      "timeformat": "타임스탬프를 읽기 쉬운 시각으로 바꿉니다. 어떤 시간 필드로도 바꿔 쓸 수 있습니다",
      "Id": "알림 이벤트 ID",
      "Cate": "알림 분류이며 예로 'prometheus'가 있습니다",
      "Cluster": "데이터 소스 이름",
      "DatasourceId": "데이터 소스 ID",
      "GroupId": "비즈니스 그룹 ID",
      "GroupName": "비즈니스 그룹 이름",
      "Hash": "알림 이벤트 해시",
      "RuleId": "규칙 ID",
      "RuleName": "규칙 이름",
      "RuleNote": "규칙 메모",
      "RuleHash": "규칙 해시 값",
      "Severity": "알림 등급 (1-3)",
      "Status": "알림 상태",
      "PromQl": "알림 쿼리문",
      "PromForDuration": "지속 시간 (초)",
      "PromEvalInterval": "평가 간격 (초)",
      "SubRuleId": "구독 규칙 ID",
      "TriggerTime": "발생 타임스탬프",
      "TriggerValue": "발생 당시 값",
      "TriggerValues": "발생 당시 값 (원본 형식)",
      "FirstTriggerTime": "최초 발생 시각",
      "IsRecovered": "복구 여부",
      "NotifyCurNumber": "현재까지 알린 횟수",
      "LastEvalTime": "마지막 평가 시각",
      "LastSentTime": "마지막 전송 시각",
      "TagsJSON": "레이블 배열",
      "TagsMap": "레이블 키-값 매핑",
      "TagsMap_instance": "특정 레이블 하나를 가져오며 instance를 원하는 레이블 이름으로 바꿔 쓰세요",
      "AnnotationsJSON": "주석 키-값 매핑",
      "AnnotationsJSON_summary": "특정 주석 하나를 가져오며 summary를 원하는 주석 이름으로 바꿔 쓰세요",
      "TargetIdent": "대상 식별자",
      "TargetNote": "대상 메모",
      "NotifyRecovered": "복구 알림 여부",
      "NotifyChannelsJSON": "알림 채널 목록",
      "NotifyGroupsJSON": "알림 그룹 목록",
      "NotifyRuleIds": "알림 전송 규칙 ID 목록",
      "CallbacksJSON": "콜백 URL 목록",
      "ExtraConfig": "추가 설정 정보",
      "ExtraInfo": "추가 정보 목록",
      "ExtraInfoMap": "추가 정보 매핑"
    },
    "search_placeholder": "필드 검색",
    "no_match": "일치하는 필드가 없습니다",
    "copy_tip": "클릭해서 복사",
    "groups": {
      "common": "자주 쓰는 항목",
      "basic": "기본 정보",
      "trigger": "발생 관련",
      "tags": "레이블과 주석",
      "target": "머신 관련",
      "notify": "알림 관련",
      "extra": "콜백과 확장"
    }
  }
};

export default ko_KR;
