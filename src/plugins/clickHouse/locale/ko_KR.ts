const ko_KR = {
  "preview": "데이터 미리보기",
  "query": {
    "title": "조회 통계",
    "execute": "쿼리",
    "query": "SQL",
    "query_required": "SQL은 비워 둘 수 없습니다",
    "query_placeholder": "SQL을 입력해 조회하며 Shift+Enter로 줄을 바꿉니다",
    "query_placeholder2": "Shift+Enter로 줄 바꾸기",
    "advancedSettings": {
      "title": "보조 설정",
      "tags_placeholder": "Enter로 여러 개 입력",
      "valueKey": "값 필드",
      "valueKey_tip": "SQL 조회 결과에는 보통 여러 열이 있으며, 어떤 열의 값을 그래프의 시계열로 그릴지 지정할 수 있습니다",
      "valueKey_required": "값 필드는 비워 둘 수 없습니다",
      "labelKey": "레이블 필드",
      "labelKey_tip": "SQL 조회 결과에는 보통 여러 열이 있으며, 어떤 열을 시계열의 레이블 메타데이터로 쓸지 지정할 수 있습니다"
    },
    "schema": "메타데이터",
    "document": "사용 문서",
    "dashboard": {
      "mode": {
        "label": "조회 모드",
        "table": "시계열이 아닌 데이터",
        "timeSeries": "시계열 데이터"
      }
    },
    "historicalRecords": {
      "button": "기록",
      "searchPlaceholder": "검색 기록"
    },
    "compass_btn_tip": "클릭해서 테이블 데이터 보기",
    "database": "데이터베이스",
    "database_msg": "데이터베이스를 선택하세요",
    "table": "테이블",
    "table_msg": "테이블을 선택하세요",
    "time_field": "날짜 필드",
    "time_field_msg": "날짜 필드를 선택하세요",
    "duration": "소요 시간",
    "count": "건수",
    "navMode": {
      "fields": "필드 뷰",
      "schema": "테이블 구조 뷰"
    },
    "add_to": {
      "btn": "추가할 곳…",
      "recording_rule": "레코딩 규칙에 추가",
      "add_recording_rule_title": "레코딩 규칙 추가"
    },
    "sql_format": {
      "title": "SQL 미리보기",
      "tip": "필드의 최댓값, 최솟값, 백분위수 같은 복잡한 SQL은 왼쪽 필드 목록에서 눌러 볼 수 있습니다.",
      "origin": "원본 로그 보기",
      "origin_tip": "테이블 구조 뷰의 표 모드로 복사해 데이터를 볼 수 있습니다",
      "timeseries": "시계열 그래프 보기",
      "timeseries_tip": "테이블 구조 뷰의 시계열 그래프 모드로 복사해 데이터를 보거나, 대시보드에서 ClickHouse 데이터로 시계열 그래프를 그리는 데 쓸 수 있습니다.",
      "table": "통계 값 보기",
      "table_tip": "ClickHouse의 알림 규칙과 레코딩 규칙을 만들고 Polaris 지표를 만드는 데 쓸 수 있습니다."
    },
    "warn_message_btn_1": "그대로 조회 실행",
    "warn_message_btn_2": "돌아가서 수정",
    "warn_message": "조회 조건에 시간 매크로가 없어 고른 시간 구간이 적용되지 않습니다.",
    "warn_message_content_1": "이 조회는 테이블 전체를 훑을 수 있습니다. 저장소 성능에 미칠 영향을 가늠해 본 뒤 그대로 실행할지, 돌아가서 시간 매크로를 넣을지 정하세요.",
    "warn_message_content_2": "자주 쓰는 시간 매크로: ",
    "warn_message_content_3": "예:",
    "warn_message_content_4": "시간 매크로 사용법: <a>자세히</a>",
    "default_search_by_tip": "기본 검색 필드",
    "default_search_tip_1": "기본 검색 필드로 지정",
    "default_search_tip_2": "기본 검색 필드 해제",
    "stack_disabled_tip": "고유 값이 하나뿐이거나 열 개를 넘으면 누적 그래프를 켤 수 없습니다",
    "stack_tip_pin": "누적 그래프 켜기",
    "stack_tip_unpin": "누적 그래프 끄기",
    "stack_group_by_tip": "이 필드 값으로 누적 추세 그래프를 표시합니다",
    "syntax": {
      "query": "Query 모드",
      "sql": "SQL 모드"
    },
    "sqlVizType": {
      "table": "표",
      "timeseries": "시계열 그래프"
    }
  },
  "builder": {
    "to_pinned_btn": "고정",
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
        "TOPN": "상위 N개 값",
        "RATIO": "비율",
        "VARIANCE": "분산",
        "STDDEV": "표준편차"
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
  },
  "trigger": {
    "title": "알림 조건",
    "value_msg": "수식 값을 입력하세요"
  }
};

export default ko_KR;
