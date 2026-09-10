const ko_KR = {
  "preview": "데이터 미리보기",
  "query": {
    "title": "조회 통계",
    "execute": "쿼리",
    "project": "프로젝트",
    "project_msg": "프로젝트를 선택하세요",
    "project_tip": "\n      <1>프로젝트는 로그 서비스의 리소스 관리 단위이자 사용자 격리와 접근 제어의 주된 경계입니다. 자세한 내용은 다음을 보세요<1>\n      <2>프로젝트</2>\n    ",
    "logstore": "로그스토어",
    "logstore_msg": "로그스토어를 선택하세요",
    "logstore_tip": "\n      <1>로그스토어는 로그 서비스에서 로그 데이터를 수집하고 저장하고 조회하는 단위입니다. 자세한 내용은 다음을 보세요<1>\n      <2>로그스토어</2>\n    ",
    "range": "조회 구간",
    "power_sql": "SQL 확장",
    "query": "SQL",
    "query_msg": "SQL을 입력하세요",
    "query_tip1": "TDengine 쿼리 문법은 다음을 참고하세요",
    "query_tip2": "공식 문서",
    "sqlTemplates": "쿼리 템플릿",
    "sqlTemplates_tip": "아래 SQL은 참고용이며 실제로 쓸 때는 $변수를 실제 값으로 바꿔야 합니다",
    "mode": {
      "timeSeries": "시계열 값",
      "raw": "원본 로그"
    },
    "advancedSettings": {
      "title": "보조 설정",
      "metricKey_label": "값 필드",
      "metricKey_tip": "SQL 조회 결과에는 보통 여러 열이 있으며, 어떤 열의 값을 그래프의 시계열로 그릴지 지정할 수 있습니다",
      "tags_placeholder": "Enter로 여러 개 입력",
      "labelKey_label": "레이블 필드",
      "labelKey_tip": "SQL 조회 결과에는 보통 여러 열이 있으며, 어떤 열을 시계열의 레이블 메타데이터로 쓸지 지정할 수 있습니다",
      "timeKey_tip": "어떤 필드가 시간 필드인지 지정하며 그래프의 X축으로 쓰입니다",
      "timeFormat_tip": "시간 형식이며 이 형식에 따라 시각을 타임스탬프로 바꿉니다"
    },
    "schema": "메타데이터",
    "table": "일반 테이블",
    "stable": "슈퍼 테이블"
  },
  "trigger": {
    "title": "알림 조건",
    "value_msg": "수식 값을 입력하세요"
  }
};

export default ko_KR;
