const ko_KR = {
  "title": "로그 검색",
  "tab": {
    "rename": "이름 변경"
  },
  "query": "조회 조건",
  "query_is_required": "조회 조건은 비워 둘 수 없습니다",
  "execute": "쿼리",
  "mode": {
    "label": "모드",
    "raw_logs": "원본 로그",
    "statistical_charts": "통계 그래프"
  },
  "mode_switch": {
    "confirm_title": "모드 전환 확인",
    "confirm_content": "지금의 통계 그래프 모드 조회문에는 파이프 기호(|)가 들어 있는데, 이 문법은 원본 로그 모드에서 쓸 수 없습니다. 모드를 바꾸면 조회 조건이 비워집니다. 계속할까요?",
    "confirm_ok": "계속 전환",
    "confirm_cancel": "취소"
  },
  "before_query": "<b>조회</b>를 눌러 데이터를 표시하세요",
  "loading": "데이터를 불러오는 중…",
  "no_data": "조회 결과가 없습니다",
  "histogram_hide": "그래프 숨기기",
  "histogram_show": "그래프 표시",
  "share_btn": "공유 링크",
  "share_tip": "클릭해서 공유 링크 복사",
  "log_viewer_drawer_trigger_tip": "클릭해서 로그 상세 보기",
  "log_viewer_drawer_title": "로그 상세",
  "copy_to_clipboard": "클립보드에 복사",
  "unindexable": "이 필드는 통계가 꺼져 있어 통계 분석을 할 수 없습니다",
  "topn_no_data": "데이터 없음",
  "stats": {
    "unique_count": "고유 값 개수",
    "min": "최솟값",
    "max": "최댓값",
    "sum": "합계",
    "avg": "평균",
    "exist_ratio": "이 필드가 있는 로그의 비율",
    "median": "중앙값",
    "p95": "백분위수 (P95)"
  },
  "field_popover_info_alert": "값을 누르면 통계 그래프와 SQL을 볼 수 있습니다",
  "field_search_placeholder": "필드 검색",
  "field_list": {
    "show_fields": "표시할 필드",
    "available_fields": "사용 가능한 필드"
  },
  "field_actions": {
    "and": "이번 검색에 추가",
    "not": "이번 검색에서 제외",
    "exists": "이 필드가 있는 문서만 걸러 내기"
  },
  "field_values_topn": {
    "title": "상위 {{n}}개 값",
    "settings": {
      "title": "상위 N개 값 설정"
    },
    "no_data": "이 필드는 매핑에는 있지만 표시된 문서 500건에는 없습니다",
    "quick_view_count": "로그 수",
    "quick_view_ratio": "비율"
  },
  "empty_value_not_supported_tip": "빈 값 검색은 아직 지원하지 않습니다",
  "unsupported_datasource_type": "지원하지 않는 데이터 소스 유형이라 표시할 수 없습니다: {{type}}",
  "no_supported_datasource_types_title": "사용할 수 있는 데이터 소스 유형이 없습니다",
  "no_supported_datasource_types_desc": "<a>데이터 소스 관리</a> 페이지에서 설정하거나 관리자에게 요청하세요. 현재 지원하는 데이터 소스 유형은 {{types}}이며,",
  "field_tip": "클릭해서 통계 보기",
  "field_value_statistic": {
    "view_statistic": "통계 값 보기",
    "view_timeseries": "시계열 그래프 보기"
  },
  "field_type": "유형",
  "field_type_map": {
    "float": "부동소수점 수",
    "float64": "64비트 부동소수점 수",
    "scaled_float": "스케일드 부동소수점 수",
    "double": "배정밀도 부동소수점 수",
    "integer": "정수",
    "int64": "64비트 정수",
    "long": "긴 정수",
    "date": "날짜",
    "date_nanos": "나노초 날짜",
    "string": "문자열",
    "text": "문자열",
    "nested": "중첩 객체",
    "histogram": "히스토그램",
    "boolean": "불리언"
  },
  "logs": {
    "title": "로그 데이터",
    "stream_fields_count": "{{count}}개",
    "text": "로그 텍스트",
    "duration": "소요 시간",
    "count": "건수",
    "filter_fields": "필터 필드",
    "settings": {
      "mode": {
        "origin": "원본",
        "table": "표",
        "timeseries": "시계열 그래프",
        "clustering": "군집화"
      },
      "breakLine": "줄 바꿈",
      "reverse": "시간",
      "lines": "행 번호",
      "time": "로그 시각",
      "organizeFields": {
        "title": "필드 열 설정",
        "allFields": "사용 가능한 필드",
        "showFields": "표시할 필드",
        "showFields_empty": "로그는 기본적으로 모든 필드를 표시합니다",
        "tip": "지금은 필드 {{fields}}만 표시합니다. 설정 아이콘을 눌러 모든 필드를 표시할 수 있습니다"
      },
      "jsonSettings": {
        "title": "JSON 설정",
        "displayMode": "기본 표시 방식",
        "displayMode_tree": "트리 표시",
        "displayMode_string": "문자열 표시",
        "expandLevel": "기본 펼침 단계"
      },
      "pageLoadMode": {
        "title": "페이지 이동 방식",
        "pagination": "페이지 나누기",
        "infiniteScroll": "스크롤해서 더 불러오기"
      },
      "topNSettings": {
        "title": "상위 N개 값 설정"
      }
    },
    "fieldLabelTip": "이 필드는 통계가 꺼져 있어 통계 분석을 할 수 없습니다",
    "filterAnd": "\"{{token}}\"을(를) 이번 검색에 추가",
    "filterNot": "\"{{token}}\"을(를) 이번 검색에서 제외",
    "filterAllAnd": "전부 이번 검색에 추가",
    "filterAllNot": "전부 이번 검색에서 제외",
    "filterExists": "이 필드가 있는 문서만 걸러 내기",
    "add_drilldown_link": "드릴다운 링크 추가",
    "drilldown_link_default_name": "드릴다운 링크",
    "total": "로그 건수",
    "stack_group_by_tip": "이 필드 값으로 누적 추세 그래프를 표시합니다",
    "collapse": "접기",
    "expand": "펼치기",
    "copy_field_value": "필드 값 복사"
  },
  "clustering": {
    "count": "개수",
    "log_data": "로그 데이터",
    "row_number": "행 번호",
    "log_statistics": "로그 통계",
    "back_to_all_logs": "모든 로그로 돌아가기",
    "all_log_statistics": "전체 로그 통계",
    "current_page_field": "현재 쪽의 필드",
    "aggregate": "을(를) 군집화했으며,",
    "cannot_aggregate": "아직 군집화할 수 없습니다:",
    "full_aggregate_logs": "전체 로그 군집화",
    "need_aggregate": "전체",
    "click_to_aggregate": "건의 로그를 군집화하려면 다음을 누르세요",
    "full_aggregate": "전체 군집화",
    "field_label": "군집화 필드",
    "scope_current_page": "현재 쪽",
    "scope_current_page_desc": "현재 쪽의 필드만 군집화합니다",
    "scope_full": "전체 군집화",
    "scope_full_desc_prefix": "이번 조회 결과",
    "scope_full_desc_disable_prefix": "조회된 다음 건수는 아직 군집화할 수 없습니다:",
    "scope_full_desc_suffix": "건의 로그",
    "scope_label": "범위",
    "aggregate_field": "군집화 필드:",
    "log_count": "로그 양:",
    "duration": "소요 시간:",
    "top5_title": "상위 5개 값",
    "no_data": "데이터가 없습니다",
    "loading_title": "군집 분석 중입니다. 잠시 기다리세요",
    "loading_info": "군집화한 로그 양:",
    "loading_field": "군집화 필드:",
    "loading_tip": "이 페이지를 닫지 마세요. 새로 조회하려면",
    "loading_new_tab": "새 탭을 열어",
    "loading_tip_suffix": "로그를 검색하세요",
    "sampled_tip": "로그가 너무 많아 이번 군집 결과는 표본 로그로 만들었습니다"
  },
  "view_placeholder": "로그 뷰"
};

export default ko_KR;
