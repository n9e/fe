const ko_KR = {
  "es": {
    "ref": "이름",
    "index": "인덱스",
    "index_tip": "\n      여러 가지 설정 방식을 지원합니다\n      <1 />\n      1. 인덱스 하나 지정: gb는 gb 인덱스의 모든 문서를 검색합니다\n      <1 />\n      2. 인덱스 여러 개 지정: gb,us는 gb와 us 인덱스의 모든 문서를 검색합니다\n      <1 />\n      3. 인덱스 접두사 지정: g*,u*는 g 또는 u로 시작하는 모든 인덱스의 문서를 검색합니다\n      <1 />\n      ",
    "index_msg": "인덱스는 비워 둘 수 없습니다",
    "indexPattern": "인덱스 패턴",
    "indexPatterns": "인덱스 패턴",
    "indexPattern_msg": "인덱스 패턴은 비워 둘 수 없습니다",
    "indexPatterns_manage": "인덱스 패턴 관리",
    "filter": "필터 조건",
    "index_placeholder": "인덱스 log-* (와일드카드 지원)",
    "index_pattern_placeholder": "인덱스 패턴 선택",
    "filter_placeholder": "필터 조건 status:500 AND method:GET",
    "syntax": "문법",
    "time_label": "시간 단위",
    "date_field": "날짜 필드",
    "date_field_msg": "날짜 필드는 비워 둘 수 없습니다",
    "interval": "시간 간격",
    "value": "값 추출",
    "func": "함수",
    "funcField": "필드 이름",
    "histogram": {
      "interval": "간격"
    },
    "terms": {
      "label": "지정한 field로 그룹화",
      "more": "고급 설정",
      "size": "일치 개수",
      "min_doc_count": "문서 최솟값"
    },
    "raw": {
      "limit": "로그 건수",
      "date_format": "날짜 형식",
      "date_format_tip": "Moment.js 형식 패턴을 사용합니다. 예: YYYY-MM-DD HH:mm:ss.SSS"
    },
    "alert": {
      "query": {
        "title": "조회 통계",
        "preview": "데이터 미리보기"
      },
      "trigger": {
        "title": "알림 조건",
        "builder": "간단 모드",
        "code": "수식 모드",
        "label": "연결 Label"
      },
      "prom_eval_interval_tip": "{{num}}초마다 백엔드 저장소를 조회합니다",
      "prom_for_duration_tip": "보통 지속 시간은 실행 주기보다 깁니다. 지속 시간 동안 실행 주기마다 조회가 여러 번 이뤄지고 매번 조건에 걸려야 알림이 생깁니다. 지속 시간이 0이면 한 번만 조건에 걸려도 알림이 생깁니다",
      "advancedSettings": "고급 설정",
      "delay": "지연 실행"
    },
    "event": {
      "groupBy": "{{field}}(으)로 그룹화하며 일치 개수는 {{size}}, 문서 최솟값은 {{min_doc_count}}입니다",
      "logs": {
        "title": "로그 상세",
        "size": "결과 수",
        "fields": "필터 필드",
        "jsonParseError": "해석하지 못했습니다"
      }
    },
    "syntaxOptions": "문법 옵션",
    "queryFailed": "조회에 실패했습니다. 잠시 후 다시 시도하세요",
    "offset_tip": "지정한 기간 이전의 데이터를 조회할 때 사용하며 PromQL의 offset과 비슷합니다. 단위는 초입니다"
  },
  "datasource": {
    "max_query_rows": "한 번의 요청으로 가져올 수 있는 최대 행 수",
    "max_idle_conns": "최대 유휴 연결 수",
    "max_open_conns": "최대 열린 연결 수",
    "conn_max_lifetime": "연결 최대 수명 (초)",
    "timeout": "제한 시간 (초)",
    "timeout_ms": "제한 시간 (밀리초)"
  },
  "query": {
    "title": "조회 통계",
    "execute": "쿼리",
    "query": "조회 조건",
    "query_required": "조회 조건은 비워 둘 수 없습니다",
    "query_placeholder": "SQL을 입력해 조회하며 Shift+Enter로 줄을 바꿉니다",
    "query_placeholder2": "Shift+Enter로 줄 바꾸기",
    "advancedSettings": {
      "title": "보조 설정",
      "tags_placeholder": "Enter로 여러 개 입력",
      "valueKey": "값 필드",
      "valueKey_tip": "SQL 조회 결과에는 보통 여러 열이 있으며, 어떤 열의 값을 그래프의 계열로 그릴지 지정할 수 있습니다",
      "valueKey_required": "값 필드는 비워 둘 수 없습니다",
      "labelKey": "레이블 필드",
      "labelKey_tip": "SQL 조회 결과에는 보통 여러 열이 있으며, 어떤 열을 계열의 레이블 메타데이터로 쓸지 지정할 수 있습니다"
    }
  }
};

export default ko_KR;
