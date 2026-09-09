const ko_KR = {
  "title": "지표 뷰",
  "name": "지표 이름",
  "collector": "분류",
  "typ": "컴포넌트 유형",
  "expression_type": "수식 유형",
  "expression_type_metric_name": "지표 이름",
  "expression_type_promql": "PromQL",
  "metric_type": "지표 유형",
  "metric_type_gauge": "Gauge",
  "metric_type_counter": "Counter",
  "metric_type_histogram": "Histogram",
  "extra_fields": "사용자 지정 필드",
  "extra_fields_name": "이름",
  "extra_fields_value": "값",
  "laset_over_time": "마지막 보고 시각",
  "unit": "단위",
  "unit_tip": "그래프를 그릴 때 지표 단위에 맞춰 값의 서식을 자동으로 맞춥니다",
  "note": "설명",
  "note_preview": "설명 미리보기",
  "expression": "PromQL",
  "add_btn": "지표 만들기",
  "clone_title": "지표 복제",
  "edit_title": "지표 수정",
  "explorer": "쿼리",
  "closePanelsBelow": "아래 패널 닫기",
  "addPanel": "패널 추가",
  "translation": "지표 설명",
  "batch": {
    "not_select": "먼저 지표를 선택하세요",
    "export": {
      "title": "지표 내보내기"
    },
    "import": {
      "title": "지표 가져오기",
      "name": "지표 이름",
      "result": "가져오기 결과",
      "errmsg": "오류 메시지"
    }
  },
  "filter": {
    "title": "필터 조건",
    "title_tip": "필터는 오른쪽 지표를 눌러 데이터를 볼 때 조회 범위를 좁혀 줍니다. 필터 {ident=\"n9e01\"}을 설정하고 고르면 cpu_usage_idle을 조회할 때 실제로는 cpu_usage_idle{ident=\"n9e01\"}로 조회되어 가져오는 시계열 수가 크게 줄어듭니다",
    "add_title": "필터 추가",
    "edit_title": "필터 수정",
    "import_title": "필터 가져오기",
    "name": "이름",
    "datasource": "데이터 소스",
    "datasource_tip": "필터 조회를 돕는 데이터 소스",
    "configs": "필터 조건",
    "groups_perm": "권한을 가진 팀",
    "groups_perm_gid_msg": "권한을 줄 팀을 선택하세요",
    "perm": {
      "0": "읽기 전용",
      "1": "읽기·쓰기"
    },
    "build_labelfilter_and_expression_error": "레이블 필터와 수식을 만들지 못했습니다",
    "filter_label_msg": "레이블은 비워 둘 수 없습니다",
    "filter_oper_msg": "연산자는 비워 둘 수 없습니다",
    "filter_value_msg": "레이블 값은 비워 둘 수 없습니다"
  }
};

export default ko_KR;
