const ko_KR = {
  "explorer": {
    "execute": "쿼리",
    "query": "조회 조건",
    "query_required": "조회 조건은 비워 둘 수 없습니다",
    "query_lanaguage_docs": "쿼리 언어 문서",
    "limit": "개수 제한",
    "hits": "일치 결과",
    "graph_settings": {
      "title": "그래프 설정",
      "stacked": "누적",
      "fill": "채우기"
    },
    "view": {
      "group": "그룹",
      "table": "표",
      "json": "JSON"
    },
    "total_logs_returned": "반환된 전체 로그 수",
    "total_groups": "전체 그룹 수",
    "page_size": "쪽당 개수",
    "page_size_all": "전체",
    "expand_all": "전부 펼치기",
    "collapse_all": "전부 접기",
    "group_view": {
      "ungrouped": "그룹 없음",
      "group_by_field": "\"{{field}}\" 기준으로 그룹화",
      "entries": "항목",
      "show_field_tip": "표시할 필드",
      "hide_field_tip": "필드 숨기기",
      "group_by_field_icon_tip": "이 필드로 그룹화"
    },
    "group_view_settings": {
      "title": "그룹 뷰 설정",
      "group_by_field": "그룹화 필드",
      "group_by_field_help": "로그를 묶을 필드를 하나 고르세요 (기본값: _stream)",
      "ungrouped": "그룹화 안 함",
      "display_fields": "표시할 필드",
      "display_fields_help": "표시할 필드를 고르세요 (기본값: _msg)",
      "date_format": "날짜 형식",
      "date_format_help01": "날짜 형식을 지정하세요 (예: YYYY-MM-DD HH:mm:ss). <a>자세한 내용은 이 문서를 보세요</a>",
      "date_format_help02": "현재 날짜 형식: {{dateFormat}}"
    },
    "table_view_settings": {
      "title": "표 뷰 설정",
      "customize_columns": "사용자 지정 열",
      "search_columns": "열 검색",
      "check_all": "전체 선택"
    },
    "copy_json": "JSON 복사",
    "parse_failed": "해석할 수 없습니다",
    "timeseries": {
      "value_field": "값 필드",
      "value_field_tip": "시계열 그래프를 그릴 숫자 필드이며 여러 개를 입력할 수 있습니다",
      "value_field_required": "값 필드를 선택하세요",
      "label_field": "레이블 필드",
      "label_field_tip": "시계열을 구분할 레이블 필드이며 여러 개를 입력할 수 있습니다",
      "unit": "단위"
    }
  },
  "builder": {
    "filter": "필터",
    "add": "추가",
    "field": "필드",
    "operator": "연산자",
    "value": "값",
    "function": "함수",
    "quantile": "백분위수",
    "alias": "별칭",
    "order_by": "정렬",
    "direction": "정렬",
    "field_placeholder": "필드를 입력하세요",
    "value_placeholder": "값을 입력하세요",
    "operator_placeholder": "연산자를 선택하세요",
    "function_placeholder": "함수를 선택하세요",
    "alias_placeholder": "별칭을 입력하세요",
    "select_field": "필드를 선택하세요",
    "select_operator": "연산자를 선택하세요",
    "input_value": "값을 입력하세요",
    "select_function": "함수를 선택하세요",
    "input_field": "필드를 입력하세요",
    "input_quantile": "백분위수를 입력하세요",
    "select_direction": "정렬을 선택하세요",
    "aggregation": "집계",
    "aggregation_required": "집계를 최소 하나는 설정하세요",
    "display": "표시",
    "filter_relation_tip": "모든 필터 조건은 그리고로 이어집니다.",
    "statistical_value": "통계 값",
    "timeseries": "시계열 그래프",
    "group_by": "그룹",
    "limit": "개수 제한",
    "execute": "쿼리",
    "preview_ql": "쿼리 미리보기",
    "pin": "고정",
    "unpin": "고정 해제"
  },
  "datasource": {},
  "alert": {
    "query_warning_no_time": "조회 조건에서 시간 필드인 _time으로 시간 범위를 분명히 제한하기를 강력히 권합니다. 그러지 않으면 <b>저장소 부하가 비정상적으로 커지거나 알림 조회가 시간 초과되는</b> 문제가 생길 수 있습니다"
  }
};

export default ko_KR;
