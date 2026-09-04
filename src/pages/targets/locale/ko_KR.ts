const ko_KR = {
  "title": "머신 목록",
  "default_filter": "미리 정의된 필터",
  "ungrouped_targets": "그룹 없는 머신",
  "all_targets": "모든 머신",
  "datasource": "데이터 소스",
  "search_placeholder": "표 내용을 부분 일치로 검색합니다 (키워드가 여러 개면 공백으로 구분)",
  "filterDowntime": "하트비트 갱신",
  "filterDowntimeNegative": "하트비트가 갱신됨",
  "filterDowntimePositive": "하트비트가 갱신되지 않음",
  "filterDowntimeNegativeMin": "최근 {{count}}분 안에 갱신됨",
  "filterDowntimePositiveMin": "최근 {{count}}분 안에 갱신되지 않음",
  "ident_copy_success": "{{num}}건을 복사했습니다",
  "not_grouped": "그룹 없음",
  "host_ip": "IP",
  "host_tags": "전송된 레이블",
  "tags": "사용자 지정 레이블",
  "group_obj": "비즈니스 그룹",
  "target_up": "상태",
  "mem_util": "메모리",
  "cpu_util": "CPU",
  "cpu_num": "코어 수",
  "offset": "시각 차이",
  "offset_tip": "Nightingale이 설치된 머신의 시각에서 categraf가 설치된 머신의 시각을 뺀 값입니다",
  "os": "운영체제",
  "arch": "CPU 아키텍처",
  "update_at": "수정 시각",
  "update_at_tip": "\n    최근 1분 안에 하트비트가 있었으면 초록색 <1 />\n    최근 3분 안에 하트비트가 있었으면 노란색 <1 />\n    3분 동안 하트비트가 없으면 빨간색\n  ",
  "remote_addr": "출처 IP",
  "remote_addr_tip": "출처 IP는 HTTP 헤더에서 가져오므로 프록시를 거쳤다면 실제 IP가 아닐 수 있습니다",
  "agent_version": "에이전트 버전",
  "note": "메모",
  "unknown_tip": "머신 메타데이터 표시는 categraf 0.2.35보다 높은 버전이 필요합니다",
  "view_related_collects": "연결된 수집 설정 보기",
  "organize_columns": {
    "title": "표시할 열"
  },
  "targets": "모니터링 대상",
  "targets_placeholder": "모니터링 대상의 지표를 한 줄에 하나씩 입력하세요",
  "copy": {
    "current_page": "현재 쪽 복사",
    "all": "전체 복사",
    "selected": "선택 항목 복사",
    "no_data": "복사할 데이터가 없습니다"
  },
  "bind_tag": {
    "title": "레이블 연결",
    "placeholder": "레이블 형식은 key=value이며 Enter나 공백으로 구분합니다",
    "msg1": "레이블을 최소 하나는 입력하세요.",
    "msg2": "레이블 형식이 올바르지 않습니다. 확인하세요.",
    "msg3": "레이블 key는 중복될 수 없습니다",
    "render_tip1": "레이블 길이는 64자 이하여야 합니다",
    "render_tip2": "레이블 형식은 key=value여야 하며, key는 영문자나 밑줄로 시작하고 영문자, 숫자, 밑줄로 이루어져야 합니다."
  },
  "unbind_tag": {
    "title": "레이블 연결 해제",
    "placeholder": "연결을 해제할 레이블을 선택하세요",
    "msg": "레이블을 최소 하나는 입력하세요."
  },
  "update_busi": {
    "title": "비즈니스 그룹 수정",
    "label": "소속 비즈니스 그룹",
    "mode": {
      "label": "모드",
      "reset": "덮어쓰기",
      "add": "추가",
      "del": "삭제"
    },
    "tags": "레이블 연결",
    "tags_tip": "비워 두면 기존 레이블을 덮어쓰지 않습니다"
  },
  "remove_busi": {
    "title": "비즈니스 그룹에서 빼기",
    "msg": "주의: 비즈니스 그룹에서 빼면 그 그룹의 관리자는 이 모니터링 대상들을 다룰 권한을 잃습니다. 미리 이들의 레이블과 메모를 정리해야 할 수도 있습니다.",
    "btn": "빼기"
  },
  "update_note": {
    "title": "메모 수정",
    "placeholder": "내용을 비우면 메모를 지운다는 뜻입니다"
  },
  "batch_delete": {
    "title": "일괄 삭제",
    "msg": "주의: 이 작업은 모니터링 대상을 시스템에서 완전히 지웁니다. 매우 위험하니 신중히 하세요.",
    "btn": "삭제"
  },
  "meta_tip": "메타데이터 보기",
  "meta_title": "메타데이터",
  "meta_desc_key": "메타데이터 이름",
  "meta_desc_value": "메타데이터 값",
  "meta_value_click_to_copy": "클릭해서 복사",
  "meta_expand": "펼치기",
  "meta_collapse": "접기",
  "meta_no_data": "데이터가 없습니다",
  "all_no_data": "수집기가 아직 없나요? <a>설치 안내서</a>를 보고 준비하세요",
  "categraf_doc": "categraf 문서",
  "hosts_select": {
    "placeholder": "머신 식별자 또는 IP",
    "modal_title": "머신 식별자나 IP를 입력하세요",
    "modal_placeholder": "한 줄에 머신 식별자나 IP 하나씩"
  }
};

export default ko_KR;
