const ko_KR = {
  "query": {
    "range": "Query range",
    "sql_required": "SQL is required",
    "mode": "검색 방식",
    "mode_indices": "Indices",
    "mode_index_patterns": "Index patterns",
    "indices_tip": "인덱스 조회 관리",
    "allow_hide_system_indices": "숨겨진 인덱스 포함",
    "index": "인덱스",
    "index_required": "인덱스는 비워 둘 수 없습니다",
    "date_field": "날짜 필드",
    "date_field_required": "날짜 필드는 비워 둘 수 없습니다",
    "index_pattern": "인덱스 패턴",
    "index_pattern_required": "인덱스 패턴은 비워 둘 수 없습니다",
    "index_pattern_tip": "인덱스 패턴 관리",
    "syntax_kuery": "KQL",
    "syntax_lucene": "Lucene",
    "interval_label": "집계 단위",
    "syntax": "문법",
    "sql": "SQL",
    "query": "조회 조건",
    "index_placeholder": "인덱스 log-* (와일드카드 지원)",
    "index_pattern_placeholder": "인덱스 패턴 선택",
    "filter_placeholder": "필터 조건 status:500 AND method:GET",
    "filters": "필터",
    "duration": "소요 시간",
    "count": "건수",
    "advancedSettings": {
      "title": "보조 설정",
      "tags_placeholder": "Enter로 여러 개 입력",
      "valueKey": "값 필드",
      "valueKey_tip": "SQL 조회 결과에는 보통 여러 열이 있으며, 어떤 열의 값을 그래프의 시계열로 그릴지 지정할 수 있습니다",
      "valueKey_required": "값 필드는 비워 둘 수 없습니다",
      "labelKey": "레이블 필드",
      "labelKey_tip": "SQL 조회 결과에는 보통 여러 열이 있으며, 어떤 열을 시계열의 레이블 메타데이터로 쓸지 지정할 수 있습니다"
    },
    "sqlVizType": {
      "table": "표",
      "timeseries": "시계열 그래프"
    },
    "dashboard": {
      "mode": {
        "timeSeries": "시계열 데이터",
        "table": "비시계열 데이터"
      }
    },
    "add_to": {
      "btn": "추가할 곳",
      "recording_rule": "레코딩 규칙",
      "add_recording_rule_title": "레코딩 규칙에 추가"
    }
  },
  "builder": {
    "title": "Builder",
    "code": "Code",
    "open_builder": "Open builder",
    "switch_to_builder_confirm_title": "Switch to Builder",
    "switch_to_builder_confirm_content": "Switching will clear the current SQL and builder configuration.",
    "to_pinned_btn": "고정",
    "to_unpinned_btn": "고정 해제",
    "filters": {
      "label": "필터",
      "label_tip": "모든 필터 조건은 그리고로 이어집니다.",
      "add": "추가",
      "field": "필드",
      "field_placeholder": "필드를 선택하세요",
      "operator": "연산자",
      "operator_placeholder": "연산자를 선택하세요",
      "value": "값",
      "value_placeholder": "값을 선택하세요",
      "disabled": "사용 안 함"
    },
    "aggregates": {
      "label": "집계",
      "add": "추가",
      "func": "집계 함수",
      "func_placeholder": "집계 함수를 선택하세요",
      "field": "필드",
      "field_placeholder": "필드를 선택하세요",
      "alias": "별칭",
      "alias_placeholder": "별칭을 입력하세요"
    },
    "display_label": "표시",
    "mode": {
      "table": "통계 값",
      "timeseries": "시계열 그래프"
    },
    "group_by": "그룹",
    "order_by": {
      "label": "정렬",
      "add": "추가",
      "field": "필드",
      "field_placeholder": "필드를 선택하세요",
      "direction": "정렬 방향",
      "direction_placeholder": "정렬 방향을 선택하세요",
      "asc": "오름차순",
      "desc": "내림차순"
    },
    "limit": "개수 제한",
    "execute": "쿼리",
    "preview_sql": "SQL 미리보기",
    "btn_tip": "누르면 SQL 입력란의 내용이 덮어써집니다",
    "btn_failed_tip": "변환하지 못했습니다. 다시 시도하거나 폼을 고치세요",
    "range_required": "먼저 시간 범위를 선택하세요",
    "preview_sql_failed": "SQL 미리보기를 만들지 못했습니다",
    "execute_failed": "조회에 실패했습니다"
  }
};

export default ko_KR;
