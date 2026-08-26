const ko_KR = {
  "精确": "정확히",
  "正则": "정규식",
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
    "compass_btn_tip": "클릭해서 테이블 데이터 보기"
  },
  "trigger": {
    "title": "알림 조건",
    "value_msg": "수식 값을 입력하세요"
  },
  "datasource": {
    "shards": {
      "title": "데이터 소스 기본 정보",
      "title_tip": "데이터베이스에 닿을 수 있는지는 DBA가 해당 DB 사용자에게 권한을 주었는지에 달려 있습니다. 그 때문에 연결되지 않더라도 나머지 설정을 먼저 마치고 나중에 확인해도 됩니다.",
      "addr": "데이터베이스 주소",
      "addr_tip": "데이터베이스 주소는 고유해야 합니다",
      "user": "사용자 이름",
      "password": "비밀번호",
      "help": "안내: 다음 단계를 진행하려면 계정에 해당 데이터베이스의 읽기 권한이 있어야 합니다. 다른 계정으로 바꾼다면 되도록 읽기 전용 계정을 쓰세요."
    },
    "max_query_rows": "한 번의 요청으로 가져올 수 있는 최대 행 수",
    "max_idle_conns": "최대 유휴 연결 수",
    "max_open_conns": "최대 열린 연결 수",
    "conn_max_lifetime": "연결 최대 수명 (초)",
    "timeout": "제한 시간 (초)"
  }
};

export default ko_KR;
