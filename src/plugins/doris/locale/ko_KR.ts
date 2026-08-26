const ko_KR = {
  "quick_query": "빠른 조회",
  "quick_query_tip": "빠른 조회는 정해진 SQL 템플릿으로 쿼리문을 빠르게 만들어 줍니다. 예를 들어 필드 A가 0보다 크다는 조건은 A > 0만 입력하면 됩니다. 이 버튼을 누르면 사용자 지정 모드로 옮겨 가 SQL을 보고 고칠 수 있습니다",
  "custom_query": "사용자 지정 조회",
  "custom_query_tip": "사용자 지정 조회에서는 SQL 문법으로 쿼리문을 직접 작성할 수 있습니다",
  "current_database": "현재 데이터베이스",
  "table": "테이블",
  "database_table_required": "먼저 데이터베이스와 테이블을 선택하세요",
  "enrich_queries": {
    "title": "추가 조회"
  },
  "query": {
    "mode": {
      "query": "Query 모드",
      "sql": "SQL 모드"
    },
    "submode": {
      "raw": "원본 로그",
      "timeSeries": "시계열 그래프"
    },
    "query_tip": "SQL 예시:<br />\n    1. 최근 5분 로그 행 수 조회: SELECT count() as cnt from database.table WHERE date >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)<br />\n    2. 고른 시간 구간의 로그 행 수 조회: SELECT COUNT(*) AS `cnt` FROM `database`.`table` WHERE $__timeFilter(`timestamp`)<br />\n    SQL 모드에 대한 자세한 설명은 <a>Doris SQL 모드 안내</a>를 보세요",
    "query_placeholder": "SELECT count(*) as count FROM db_name.table_name WHERE ts >= now() - 5m",
    "execute": "쿼리",
    "database": "데이터베이스",
    "database_msg": "데이터베이스를 선택하세요",
    "table": "테이블",
    "table_msg": "테이블을 선택하세요",
    "time_field": "날짜 필드",
    "time_field_msg": "날짜 필드를 선택하세요",
    "time_field_tip": "<span>조회 조건에 시간 매크로를 써야 이 시간 선택기가 반영됩니다</span><br/>시간 매크로 사용법: <a>자세히</a>",
    "query": "조회 조건",
    "query_required": "조회 조건은 비워 둘 수 없습니다",
    "advancedSettings": {
      "title": "보조 설정",
      "tags_placeholder": "Enter로 여러 개 입력",
      "valueKey": "값 필드",
      "valueKey_tip": "SQL 조회 결과에는 보통 여러 열이 있으며, 어떤 열의 값을 그래프의 시계열로 그릴지 지정할 수 있습니다",
      "valueKey_required": "값 필드는 비워 둘 수 없습니다",
      "labelKey": "레이블 필드",
      "labelKey_tip": "SQL 조회 결과에는 보통 여러 열이 있으며, 어떤 열을 시계열의 레이블 메타데이터로 쓸지 지정할 수 있습니다"
    },
    "get_index_fail": "테이블 인덱스를 가져오지 못했습니다",
    "warn_message_btn_1": "그대로 조회 실행",
    "warn_message_btn_2": "돌아가서 수정",
    "warn_message": "조회 조건에 시간 매크로가 없어 고른 시간 구간이 적용되지 않습니다.",
    "warn_message_content_1": "이 조회는 테이블 전체를 훑을 수 있습니다. 저장소 성능에 미칠 영향을 가늠해 본 뒤 그대로 실행할지, 돌아가서 시간 매크로를 넣을지 정하세요.",
    "warn_message_content_2": "자주 쓰는 시간 매크로: ",
    "warn_message_content_3": "예:",
    "warn_message_content_4": "시간 매크로 사용법: <a>자세히</a>",
    "editMode": {
      "switch_to_builder_confirm_title": "빌더 모드로 전환",
      "switch_to_builder_confirm_content": "지금의 SQL은 빌더 설정으로 바꿀 수 없어 전환하면 편집한 SQL이 사라집니다. 계속할까요?",
      "no_builder_config": "먼저 조회 조건을 설정하세요",
      "require_db_table": "먼저 데이터베이스와 테이블을 선택하세요",
      "build_sql_failed": "SQL을 만들지 못했습니다"
    },
    "dashboard": {
      "mode": {
        "label": "조회 모드",
        "table": "시계열이 아닌 데이터",
        "timeSeries": "시계열 데이터"
      }
    },
    "stackByField": "누적 필드",
    "stack_disabled_tip": "고유 값이 하나뿐이거나 열 개를 넘으면 누적 그래프를 켤 수 없습니다",
    "stack_tip_pin": "누적 그래프 켜기",
    "stack_tip_unpin": "누적 그래프 끄기",
    "stack_group_by_tip": "이 필드 값으로 누적 추세 그래프를 표시합니다",
    "sql_format": {
      "title": "SQL 미리보기",
      "tip": "필드의 최댓값, 최솟값, 백분위수 같은 복잡한 SQL은 왼쪽 필드 목록에서 눌러 볼 수 있습니다.",
      "origin": "원본 로그 보기",
      "origin_tip": "테이블 구조 뷰의 표 모드로 복사해 데이터를 볼 수 있습니다",
      "timeseries": "시계열 그래프 보기",
      "timeseries_tip": "테이블 구조 뷰의 시계열 그래프 모드로 복사해 데이터를 보거나, 대시보드에서 Doris 데이터로 시계열 그래프를 그리는 데 쓸 수 있습니다.",
      "table": "통계 값 보기",
      "table_tip": "Doris의 알림 규칙과 레코딩 규칙을 만들고 Polaris 지표를 만드는 데 쓸 수 있습니다."
    },
    "defaultSearchField": "기본 검색 필드",
    "default_search_tip_1": "기본 검색 필드로 지정",
    "default_search_tip_2": "기본 검색 필드 해제",
    "default_search_by_tip": "기본 검색 필드",
    "datasource_disabled_tip": "먼저 데이터 소스를 선택하세요",
    "interval": "조회 구간",
    "interval_tip": "조회 구간 설정은 SQL에서 $__timeFilter 시간 매크로를 쓸 때만 적용됩니다.<br />알림 시스템은 그 시간 창으로 훑을 데이터를 제한해 알림의 신속성과 데이터베이스 성능을 지킵니다",
    "offset": "지연 조회",
    "offset_tip": "현재 조회 시각을 정한 초만큼 앞으로 옮긴 뒤 조회를 실행하며 PromQL의 offset과 비슷합니다.<br />데이터 기록이나 전달이 늦어지는 상황에서 아직 도착하지 않은 데이터 때문에 잘못된 알림이 나가는 것을 막을 때 흔히 씁니다",
    "sql_warning_1": "WHERE 절에서 $__timeFilter(시간 필드)로 시간 범위를 분명히 제한하기를 강력히 권합니다. 그러지 않으면 <b>데이터베이스 부하가 비정상적으로 커지거나 알림 조회가 시간 초과되는</b> 문제가 생길 수 있습니다",
    "sql_warning_2": "SQL에 $__timeGroup을 써서 이 조회는 여러 시점의 데이터를 돌려줍니다. 이때 <b>시스템은 가장 최근 시점의 결과만 사용합니다</b>",
    "duration": "소요 시간",
    "count": "건수",
    "click_doc": "<a>조회 조건</a> 문서를 보려면 클릭하세요",
    "navMode": {
      "fields": "필드 뷰",
      "schema": "테이블 구조 뷰"
    },
    "syntax": {
      "query": "Query 모드",
      "sql": "SQL 모드"
    },
    "sqlVizType": {
      "table": "표",
      "timeseries": "시계열 그래프"
    },
    "add_to": {
      "btn": "추가할 곳…",
      "recording_rule": "레코딩 규칙에 추가",
      "add_recording_rule_title": "레코딩 규칙 추가"
    }
  },
  "builder": {
    "to_pinned_btn": "고정",
    "open_builder": "빌더 열기",
    "config_required": "빌더 설정은 비워 둘 수 없습니다",
    "to_unpinned_btn": "고정 해제",
    "database_table": {
      "label": "데이터베이스와 테이블",
      "database": "데이터베이스",
      "table": "테이블"
    },
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
      "disabled": "사용 안 함",
      "tip_1": "이 필드에는 NGram BloomFilter 인덱스가 없어 테이블 전체를 훑을 수 있습니다. 인덱스를 추가하거나 다른 연산자를 고르세요"
    },
    "aggregates": {
      "label": "집계",
      "add": "추가",
      "func": "집계 함수",
      "func_placeholder": "집계 함수를 선택하세요",
      "field": "필드",
      "field_placeholder": "필드를 선택하세요",
      "percentile": "백분위수",
      "percentile_placeholder": "백분위수를 입력하세요",
      "precision": "정밀도",
      "precision_placeholder": "정밀도를 입력하세요",
      "n": "N 값",
      "n_placeholder": "N 값을 입력하세요",
      "alias": "별칭",
      "alias_placeholder": "별칭을 입력하세요",
      "options": {
        "COUNT": "로그 수",
        "CPS": "초당 건수",
        "AVG": "평균",
        "SUM": "합계",
        "MIN": "최솟값",
        "MAX": "최댓값",
        "PERCENTILE": "백분위수",
        "UNIQUE_COUNT": "고유 값 개수",
        "EXIST_RATIO": "이 리소스가 있는 로그의 비율",
        "TOPN": "상위 N개 값"
      }
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
    "excute": "쿼리",
    "preview_sql": "SQL 미리보기",
    "btn_tip": "누르면 SQL 입력란의 내용이 덮어써집니다",
    "btn_failed_tip": "변환하지 못했습니다. 다시 시도하거나 폼을 고치세요",
    "preview_and_run": "SQL 미리보고 조회",
    "builder_content_modified": "빌더 내용이 바뀌었습니다. 최신 SQL을 미리 보세요"
  }
};

export default ko_KR;
