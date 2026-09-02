const ko_KR = {
  "title": "모니터링 대시보드",
  "list": "대시보드 목록",
  "back_icon_tip": "이전 페이지로 돌아가며, 없으면 대시보드 목록으로 갑니다",
  "back_icon_tip_is_built_in": "이전 페이지로 돌아가며, 없으면 템플릿 센터로 갑니다",
  "name": "대시보드 이름",
  "tags": "분류 레이블",
  "ident": "영문 식별자",
  "ident_msg": "영문자, 숫자, 하이픈을 입력하세요",
  "search_placeholder": "대시보드 이름 또는 분류 레이블",
  "empty_guide": {
    "title": "아직 대시보드가 없습니다",
    "desc": "대시보드를 하나 만들거나 내장 대시보드 템플릿을 한 번에 가져오세요.",
    "from_template": "템플릿에서 가져오기"
  },
  "refresh_tip": "새로 고침 간격이 step({{num}}초)보다 짧으면 데이터가 갱신되지 않습니다",
  "refresh_btn": "새로 고침",
  "share_btn": "공유",
  "export_btn": "내보내기 (CSV)",
  "clear_cache_btn": "캐시 지우기",
  "clear_cache_btn_tip": "표 열 너비 캐시를 지우며 페이지를 새로 고치면 적용됩니다",
  "inspect_btn": "문제 확인",
  "table_upgrade": {
    "switch_title": "TableNG로 업그레이드",
    "switch_content": "이전 Table 설정을 자동으로 옮길까요?",
    "auto_upgrade": "자동 업그레이드",
    "switch_only": "유형만 변경"
  },
  "public": {
    "name": "공개",
    "unpublic": "비공개",
    "public_cate": "유형",
    "cate": {
      "0": "익명 접근",
      "1": "로그인 필요",
      "2": "권한 기반 접근"
    },
    "bgids": "권한을 가진 비즈니스 그룹",
    "theme_link": {
      "dark": "다크 테마 링크",
      "light": "라이트 테마 링크"
    }
  },
  "sharing_link": {
    "title": "공유 링크 만들기",
    "title_anonymous": "공유 링크 만들기 (익명 접근)",
    "allow_anonymous": "로그인 없이 익명 접근 허용",
    "expire_at": "유효 기간",
    "theme": "테마",
    "theme_default": "시스템 설정 따르기",
    "theme_dark": "다크",
    "theme_light": "라이트",
    "note": "메모",
    "note_placeholder": "메모 (필수). 예: 고객에게 보여 주기 위함",
    "generate": "링크 만들기",
    "link": "공유 링크",
    "expire_time": "만료 시각",
    "expired": "만료됨",
    "create_by": "만든 사람",
    "revoke": "폐기",
    "revoke_confirm": "폐기하면 이 링크는 즉시 쓸 수 없게 됩니다. 계속할까요?",
    "revoked": "폐기됨",
    "anonymous_tip": "익명 링크는 유효 기간 동안 로그인 없이 이 대시보드를 볼 수 있게 하고 참조하는 데이터 소스의 데이터도 조회할 수 있게 하므로 신중히 공유하세요",
    "recommend_tip": "익명 접근은 아래 링크로 이뤄집니다. 유효 기간 동안 로그인 없이 이 대시보드를 볼 수 있으며, 오래 공개하려면 유효 기간을 년 단위로 설정하세요",
    "unit_hour": "시간",
    "unit_day": "일",
    "unit_month": "개월",
    "unit_year": "년",
    "fetch_failed": "공유 링크 목록을 가져오지 못했습니다",
    "generate_failed": "공유 링크를 만들지 못했습니다",
    "expire_out_of_range": "유효 기간이 표시 가능한 범위를 벗어났습니다(사실상 무기한). 해지 후 다시 생성하세요",
    "set_public_confirm_title": "이 대시보드를 \"공개 - 익명 접근\"으로도 설정할까요?",
    "set_public_confirm_content":
      "공유 링크는 생성 즉시 로그인 없이 이 대시보드를 열 수 있으며, 공개 설정과 무관하게 유효합니다. 공개 설정을 함께 변경하지 않으면 목록의 \"공개\" 열에 익명 접근으로 표시되지 않아 관리자가 대시보드가 외부에 노출된 사실을 알 수 없습니다. 확인하면 공개 설정을 \"공개 - 익명 접근\"으로 먼저 저장한 뒤 링크를 생성합니다.",
    "set_public_confirm_ok": "익명 접근으로 설정하고 생성",
    "set_public_failed": "공개 설정 저장에 실패하여 공유 링크를 생성하지 않았습니다",
    "revoke_failed": "공유 링크를 폐기하지 못했습니다",
    "config_load_failed": "대시보드 설정을 읽지 못해 익명 접근을 설정할 수 없습니다. 닫고 다시 시도하세요",
    "revoke_all_confirm_title": "익명 공유 링크를 모두 폐기할까요?",
    "revoke_all_confirm_content": "이 대시보드에는 아직 유효한 익명 공유 링크가 {{num}}개 있습니다. 링크의 유효성은 공개 설정과 무관하므로 유형을 바꿔도 여전히 로그인 없이 이 대시보드를 열 수 있습니다. 계속하면 이 대시보드의 모든 공유 링크를 폐기하고 설정을 저장하며, 폐기는 되돌릴 수 없습니다.",
    "revoke_all_ok": "폐기하고 저장",
    "revoke_all_check_failed": "이 대시보드에 익명 공유 링크가 남아 있는지 확인하지 못했습니다. 공개 설정은 저장되었으니 공유 링크 창을 열어 직접 확인하세요"
  },
  "default_filter": {
    "title": "미리 정의된 필터",
    "public": "공개 대시보드",
    "all": "내 비즈니스 그룹 대시보드",
    "all_tip": "이 옵션은 내가 속한 비즈니스 그룹에 연결된 모든 대시보드를 보여 줍니다"
  },
  "create_title": "대시보드 만들기",
  "edit_title": "대시보드 수정",
  "add_panel": "그래프 추가",
  "cluster": "클러스터",
  "full_screen": "전체 화면",
  "exit_full_screen": "전체 화면 끝내기",
  "copyPanelTip": "그래프 설정을 복사했습니다. \"그래프 추가\" > \"그래프 붙여넣기\"를 눌러 JSON을 붙여 넣으면 그래프가 만들어집니다",
  "batch": {
    "import": "Nightingale 대시보드 JSON 가져오기",
    "label": "대시보드 JSON",
    "import_grafana": "Grafana 대시보드 가져오기 (권장하지 않음)",
    "import_grafana_tip": "Prometheus 데이터 소스를 쓰는 대시보드만, 그것도 Nightingale이 지원하는 그래프 유형과 기능 범위 안에서만 가져올 수 있습니다 <a>문제 신고</a>",
    "import_grafana_tip_version_error": "v7 미만 버전의 대시보드 설정은 가져올 수 없습니다",
    "import_grafana_tip_version_warning": "v8 미만 버전의 대시보드 설정을 가져오면 일부 그래프가 지원되지 않거나 제대로 표시되지 않을 수 있습니다",
    "import_grafana_url": "Grafana 대시보드 링크 (권장)",
    "import_grafana_url_label": "Grafana 대시보드 링크",
    "continueToImport": "계속 가져오기",
    "noSelected": "대시보드를 선택하세요",
    "import_builtin": "내장 대시보드 가져오기",
    "import_builtin_board": "내장 대시보드",
    "clone": {
      "name": "이름",
      "result": "결과",
      "errmsg": "오류 메시지"
    }
  },
  "link": {
    "title": "대시보드 링크",
    "name": "링크 이름",
    "url": "링크 주소",
    "isNewBlank": "새 창에서 열기",
    "dashboardIds_placeholder": "대시보드를 선택하세요"
  },
  "var": {
    "vars": "변수",
    "btn": "변수 추가",
    "title": {
      "list": "변수 목록",
      "add": "변수 추가",
      "edit": "변수 수정"
    },
    "name": "변수 이름",
    "name_msg": "영문자, 숫자, 밑줄만 사용할 수 있습니다",
    "name_repeat_msg": "이미 있는 변수 이름입니다",
    "label": "표시 이름",
    "type": "변수 유형",
    "type_map": {
      "query": "쿼리 (Query)",
      "custom": "사용자 지정 (Custom)",
      "textbox": "텍스트 상자 (Text box)",
      "constant": "상수 (Constant)",
      "datasource": "데이터 소스 (Datasource)",
      "datasourceIdentifier": "데이터 소스 식별자 (Datasource identifier)",
      "hostIdent": "머신 식별자 (Host ident)"
    },
    "hide": "변수 숨기기",
    "hide_map": {
      "yes": "예",
      "no": "아니요"
    },
    "definition": "변수 정의",
    "definition_msg1": "변수 정의를 입력하세요",
    "definition_msg2": "변수 정의는 올바른 JSON이어야 합니다",
    "reg": "정규식",
    "reg_tip": "선택 사항입니다. 정규식으로 선택지를 걸러 낼 수 있습니다. 여기에는 <a>정규식 리터럴</a>, 즉 슬래시로 감싼 패턴을 적습니다",
    "reg_tip2": "선택지의 일부만 뽑아내려면 <a>이름 있는 캡처 그룹으로 표시 텍스트와 값을 나눌 수 있습니다</a>",
    "multi": "다중 선택",
    "allOption": "전체 선택 항목 포함",
    "allValue": "전체 선택 값 지정",
    "width": "너비",
    "width_tip": "변수 선택 상자의 너비이며 비워 두면 기본값 180px을 씁니다",
    "textbox": {
      "defaultValue": "기본값",
      "defaultValue_tip": "선택 사항이며 처음 불러올 때의 기본값으로만 쓰입니다"
    },
    "custom": {
      "definition": "쉼표로 구분한 사용자 지정 값"
    },
    "constant": {
      "definition": "상수 값",
      "defaultValue_tip": "숨겨진 상수 값을 정의합니다"
    },
    "datasource": {
      "definition": "데이터 소스 유형",
      "defaultValue": "기본값",
      "regex": "데이터 소스 필터",
      "regex_tip": "선택 사항입니다. 정규식으로 선택지를 걸러 낼 수 있습니다. 여기에는 <a>정규식 리터럴</a>, 즉 슬래시로 감싼 패턴을 적습니다."
    },
    "hostIdent": {
      "invalid": "머신 식별자는 권한이 필요한 항목이라 익명 모드의 대시보드에서는 접근에 실패합니다",
      "invalid2": "이 대시보드는 머신 식별자 변수를 쓰고 있어 익명으로 접근할 수 없습니다"
    },
    "help_tip": "\n      변수 사용 안내\n      <1 />\n      ${variable_name}: 대시보드 변수 값\n      <1 />\n      ${__field.name}: 범례 이름\n      <1 />\n      ${__field.value}: 범례 값\n      <1 />\n      ${__field.labels.X}: 레이블 값\n      <1 />\n      ${__field.labels.__name__}: 지표 이름\n      <1 />\n      ${__interval}: 시간 간격(초), 예를 들어 15s이며 기본값은 step입니다\n      <1 />\n      ${__interval_ms}: 시간 간격(밀리초), 예를 들어 15000\n      <1 />\n      ${__range}: 시간 범위(초), 예를 들어 3600s\n      <1 />\n      ${__range_ms}: 시간 범위(밀리초), 예를 들어 3600000\n      <1 />\n      ${__rate_interval}: 시간 간격(초), __interval * 4\n      <1 />\n      ${__from}: 시작 시각(밀리초)\n      <1 />\n      ${__from_date_seconds}: 시작 시각(초)\n      <1 />\n      ${__from_date_iso}: 시작 시각, ISO 8601/RFC 3339\n      <1 />\n      위 문법은 ${__to}에도 그대로 적용됩니다\n    ",
    "help_tip_table_ng": "\n      변수 사용 안내\n      <br />\n      ${variable_name}: 대시보드 변수 값\n      <br />\n      ${__row.column_name}: 행 데이터의 특정 열 값\n      <br />\n      ${__interval}: 시간 간격(초), 예를 들어 15s이며 기본값은 step입니다\n      <br />\n      ${__interval_ms}: 시간 간격(밀리초), 예를 들어 15000\n      <br />\n      ${__range}: 시간 범위(초), 예를 들어 3600s\n      <br />\n      ${__range_ms}: 시간 범위(밀리초), 예를 들어 3600000\n      <br />\n      ${__rate_interval}: 시간 간격(초), __interval * 4\n      <br />\n      ${__from}: 시작 시각(밀리초)\n      <br />\n      ${__from_date_seconds}: 시작 시각(초)\n      <br />\n      ${__from_date_iso}: 시작 시각, ISO 8601/RFC 3339\n      <br />\n      위 문법은 ${__to}에도 그대로 적용됩니다\n    "
  },
  "row": {
    "edit_title": "그룹 수정",
    "delete_title": "그룹 삭제",
    "name": "그룹 이름",
    "delete_confirm": "이 그룹을 삭제할까요?",
    "cancel": "취소",
    "ok": "그룹과 그래프 함께 삭제",
    "ok2": "그룹만 삭제",
    "panels": "그래프 {{count}}개",
    "panels_plural": "그래프 {{count}}개"
  },
  "panel": {
    "title": {
      "add": "그래프 추가",
      "edit": "그래프 수정"
    },
    "base": {
      "title": "패널 설정",
      "name": "제목",
      "name_tip": "표 형식의 그래프에는 제목이 있어야 합니다. 없으면 패널 편집이 표 머리글과 겹칩니다",
      "link": {
        "label": "링크",
        "label_tip": "\n          변수 사용 안내<br />\n          ${variable_name}: 대시보드 변수 값\n        ",
        "btn": "추가",
        "name": "링크 이름",
        "name_msg": "링크 이름을 입력하세요",
        "url": "링크 주소",
        "url_msg": "링크 주소를 입력하세요",
        "isNewBlank": "새 창에서 열기"
      },
      "description": "메모",
      "repeatOptions": {
        "title": "그래프 반복",
        "byVariable": "변수",
        "byVariableTip": "변수 값마다 그래프를 반복해서 그립니다",
        "maxPerRow": "한 줄에 최대"
      }
    },
    "options": {
      "legend": {
        "displayMode": {
          "label": "표시 모드",
          "table": "표",
          "list": "목록",
          "hidden": "숨김"
        },
        "placement": "위치",
        "max": "최댓값",
        "min": "최솟값",
        "avg": "평균",
        "sum": "합계",
        "last": "현재 값",
        "variance": "분산",
        "stdDev": "표준편차",
        "series": "계열",
        "seriesFilter": "계열 필터",
        "columns": "표시할 열",
        "none": "없음",
        "behaviour": {
          "label": "클릭했을 때의 동작",
          "showItem": "항목 표시",
          "hideItem": "항목 숨기기"
        },
        "selectMode": {
          "label": "선택 모드",
          "single": "단일 선택",
          "multiple": "다중 선택"
        },
        "heightInPercentage": "높이 비율",
        "sortBy": "정렬 기준 열",
        "sortBy_tip": "어떤 통계 열로 정렬할지 고르며, 고르지 않으면 정렬하지 않습니다",
        "sortDir": "정렬 방향",
        "sortDirAsc": "오름차순",
        "sortDirDesc": "내림차순",
        "heightInPercentage_tip": "범례가 차지할 수 있는 패널 높이의 최대 비율이며 20%에서 80% 사이입니다",
        "widthInPercentage": "너비 비율",
        "widthInPercentage_tip": "범례가 차지할 수 있는 패널 너비의 최대 비율이며 20%에서 80% 사이입니다"
      },
      "thresholds": {
        "title": "임계값",
        "btn": "임계값 추가",
        "mode": {
          "label": "임계값 모드",
          "tip": "백분율 모드 계산식: Y축 최솟값 + (Y축 최댓값 − Y축 최솟값) × (백분율 / 100)",
          "absolute": "절댓값",
          "percentage": "백분율"
        }
      },
      "thresholdsStyle": {
        "label": "임계값 표시 방식",
        "off": "사용 안 함",
        "line": "선",
        "dashed": "점선",
        "line+area": "선과 영역",
        "dashed+area": "점선과 영역"
      },
      "tooltip": {
        "mode": "모드",
        "sort": "정렬"
      },
      "valueMappings": {
        "title": "값 매핑",
        "btn": "추가",
        "type": "조건",
        "type_tip": "\n          <0>범위 기본값: from=-Infinity, to=Infinity </0>\n          <1>특수 값 Null 설명: null, undefined, 데이터 없음과 일치합니다</1>\n        ",
        "type_map": {
          "special": "고정 값 (숫자)",
          "textValue": "고정 값 (텍스트)",
          "range": "범위 값",
          "specialValue": "특수 값"
        },
        "value_placeholder": "정확히 일치하는 값",
        "text": "표시할 문구",
        "text_placeholder": "선택 사항",
        "color": "색상",
        "operations": "작업"
      },
      "colors": {
        "name": "색상 설정",
        "scheme": "색상 구성",
        "reverse": "색상 반전"
      },
      "links": {
        "label": "링크",
        "add_btn": "링크 추가",
        "edit_btn": "링크 수정",
        "title": "링크 제목",
        "title_required": "링크 제목은 비워 둘 수 없습니다",
        "url": "링크 주소",
        "url_required": "링크 주소는 비워 둘 수 없습니다",
        "target_blank": "새 창에서 열기"
      }
    },
    "standardOptions": {
      "title": "고급 설정",
      "unit": "단위",
      "unit_tip": "\n        <0>기본적으로 SI 접두사를 적용하며, 원하지 않으면 none을 골라 끌 수 있습니다</0>\n        <1>Data(SI): 기준은 1000이며 단위는 B, kB, MB, GB, TB, PB, EB, ZB, YB입니다</1>\n        <2>Data(IEC): 기준은 1024이며 단위는 B, KiB, MiB, GiB, TiB, PiB, EiB, ZiB, YiB입니다</2>\n        <3>bit: b</3>\n        <4>byte: B</4>\n      ",
      "datetime": "시간 형식",
      "min": "최솟값",
      "max": "최댓값",
      "decimals": "소수 자릿수",
      "displayName": "표시 이름",
      "displayName_tip": "시계열 이름 지정"
    },
    "overrides": {
      "columnWidth": "열 너비",
      "matcher": {
        "id": "일치 방식",
        "byFrameRefID": {
          "option": "조회 조건 이름 기준",
          "name": "조회 조건 이름"
        },
        "byName": {
          "option": "필드 이름 기준",
          "name": "필드 이름"
        }
      }
    },
    "custom": {
      "title": "그래프 스타일",
      "calc": "값 계산",
      "calc_tip": "시계열 데이터는 모든 시점의 값을 하나로 계산해야 하며, 시계열이 아닌 데이터에는 이 설정이 적용되지 않습니다",
      "maxValue": "최댓값",
      "baseColor": "기본 색상",
      "serieWidth": "이름 너비",
      "sortOrder": "정렬",
      "textMode": "표시할 내용",
      "valueAndName": "값과 이름",
      "value": "값",
      "name": "이름",
      "background": "배경",
      "colorMode": "색상 모드",
      "valueField": "값 필드",
      "valueField_tip": "Value는 예약어이며 시계열 데이터를 계산한 뒤의 필드 이름으로 쓰입니다",
      "valueField_tip2": "값이 숫자인 필드를 골라야 합니다",
      "nameField": "이름 필드",
      "nameField_tip": "이름 필드의 값을 시계열 이름으로 씁니다",
      "colSpan": "한 줄에 최대",
      "colSpanTip": "곧 없어집니다. \"자동\"을 고르면 아래의 배치 방향 설정을 따릅니다",
      "colSpanAuto": "자동",
      "textSize": {
        "title": "제목 글자 크기",
        "value": "값 글자 크기"
      },
      "colorRange": "색상",
      "reverseColorOrder": "색상 반전",
      "colorDomainAuto": "최소·최대 자동 설정",
      "colorDomainAuto_tip": "기본적으로 시계열에서 최솟값과 최댓값을 자동으로 가져옵니다",
      "fontBackground": "글자 배경색",
      "detailName": "링크 이름",
      "detailUrl": "링크 주소",
      "stat": {
        "graphMode": "그래프 모드",
        "none": "표시 안 함",
        "area": "스파크라인",
        "orientation": "배치 방향",
        "orientationTip": "\"자동\"을 고르면 그래프의 너비와 높이에 따라 배치 방향이 정해집니다",
        "orientationValueMap": {
          "auto": "자동",
          "vertical": "세로",
          "horizontal": "가로"
        }
      },
      "pie": {
        "countOfValueField": "값 필드 개수 세기",
        "countOfValueField_tip": "켜면 \"값 필드\"의 값을 세어 표시하고, 끄면 그 값을 그대로 보여 줍니다",
        "legengPosition": "범례 위치",
        "max": "최대 블록 수",
        "max_tip": "넘치는 블록은 기타로 묶어 표시합니다",
        "donut": "도넛 모드",
        "labelWithName": "레이블에 이름 포함",
        "labelWithValue": "레이블에 지표 값 표시",
        "detailName": "링크 이름",
        "detailUrl": "링크 주소"
      },
      "table": {
        "displayMode": "표시 모드",
        "showHeader": "머리글 표시",
        "seriesToRows": "행마다 시계열 값 표시",
        "labelsOfSeriesToRows": "행마다 레이블 값 표시",
        "labelValuesToRows": "행마다 지정한 집계 차원의 값 표시",
        "columns": "표시할 열",
        "aggrDimension": "표시할 차원",
        "sortColumn": "기본 정렬 열",
        "sortOrder": "기본 정렬",
        "link": {
          "mode": "링크 모드",
          "cellLink": "셀 링크",
          "appendLinkColumn": "링크 열 추가"
        },
        "tableLayout": {
          "label": "표 배치",
          "label_tip": "고정 배치에서는 열 너비가 열 개수에 따라 균등하게 나뉘어 가로 스크롤이 생기지 않습니다. 자동 배치에서는 열의 기본 최대 너비가 150px이라 내용이 넘쳐 가로 스크롤이 생길 수 있습니다.",
          "auto": "자동",
          "fixed": "고정"
        },
        "nowrap": "셀에서 줄 바꾸지 않기",
        "organizeFields": "필드 정리",
        "colorMode_tip": "색상 모드는 \"값 필드\"의 색을 지정합니다. 값 모드에서는 값 글자에, 배경 모드에서는 해당 셀의 배경에 색이 적용됩니다.",
        "pageLimit": "쪽당 행 수"
      },
      "tableNG": {
        "enablePagination": "페이지 나누기 사용",
        "showHeader": "머리글 표시",
        "filterable": "열 필터 사용",
        "sortColumn": "기본 정렬 열",
        "sortOrder": "기본 정렬",
        "enableRowDetail": "행 상세 사용",
        "enableRowDetail_tip": "켜면 표의 첫 열에 상세 아이콘이 나타납니다. 아이콘을 누르면 오른쪽 서랍에서 그 행의 모든 필드와 값을 볼 수 있고 행 전체나 개별 필드를 복사할 수 있습니다.",
        "rowDetail": {
          "triggerTip": "행 상세 보기",
          "title": "상세",
          "tableTab": "표",
          "jsonTab": "JSON",
          "field": "필드",
          "value": "값",
          "copyRow": "행 전체 복사",
          "copyFieldAndValue": "필드와 값 복사",
          "copyFieldValue": "필드 값 복사"
        },
        "cellOptions": {
          "type": {
            "label": "셀 유형",
            "options": {
              "none": "기본",
              "color-text": "색상 글자",
              "color-background": "색상 배경",
              "gauge": "게이지 (Gauge)"
            }
          },
          "wrapText": "글자 줄 바꿈",
          "wrapText_tip": "켜면 셀 글자가 자동으로 줄바꿈되고 줄 수에 맞춰 행 높이가 조절됩니다. 데이터가 많으면 성능에 영향을 줄 수 있습니다",
          "color-background": {
            "mode": {
              "label": "색상 모드",
              "options": {
                "basic": "기본",
                "gradient": "그라데이션"
              }
            }
          },
          "gauge": {
            "mode": {
              "label": "모드",
              "options": {
                "basic": "기본",
                "gradient": "그라데이션",
                "lcd": "LCD"
              }
            },
            "valueDisplayMode": {
              "label": "값 표시",
              "options": {
                "color": "색상",
                "text": "텍스트",
                "hidden": "숨김"
              }
            }
          }
        }
      },
      "text": {
        "textColor": "글자 색상",
        "textDarkColor": "다크 테마 글자 색상",
        "bgColor": "배경 색상",
        "textSize": "글자 크기",
        "justifyContent": {
          "name": "가로 정렬",
          "unset": "설정 안 함",
          "flexStart": "왼쪽 정렬",
          "center": "가운데 정렬",
          "flexEnd": "오른쪽 정렬"
        },
        "alignItems": {
          "name": "세로 정렬",
          "unset": "설정 안 함",
          "flexStart": "위쪽 정렬",
          "center": "가운데 정렬",
          "flexEnd": "아래쪽 정렬"
        },
        "content": "내용",
        "content_placeholder": "Markdown과 HTML을 지원합니다",
        "content_tip": "\n          <0>기본은 간단 모드이며 위쪽 설정으로 카드 모양을 간단히 조절할 수 있습니다</0>\n          <1>Markdown과 HTML을 지원합니다</1>\n          <2>Markdown이나 HTML을 입력한다면 위쪽 정렬 설정은 꺼 두는 편이 좋습니다</2>\n        "
      },
      "timeseries": {
        "drawStyle": "그리기 모드",
        "lineInterpolation": "선 보간",
        "spanNulls": "빈 값 잇기",
        "spanNulls_0": "사용 안 함",
        "spanNulls_1": "사용",
        "lineWidth": "선 굵기",
        "fillOpacity": "투명도",
        "gradientMode": "그라데이션",
        "gradientMode_opacity": "사용",
        "gradientMode_none": "사용 안 함",
        "stack": "누적",
        "stack_normal": "사용",
        "stack_off": "사용 안 함",
        "yAxis": {
          "title": "Y축 설정",
          "rightYAxis": {
            "label": "오른쪽 Y축 표시",
            "normal": "사용",
            "off": "사용 안 함"
          }
        },
        "showPoints": "점 표시",
        "showPoints_always": "표시",
        "showPoints_none": "표시 안 함",
        "pointSize": "점 크기"
      },
      "iframe": {
        "src": "iframe 주소"
      },
      "heatmap": {
        "xAxisField": "X축",
        "yAxisField": "Y축",
        "valueField": "값 열"
      },
      "barchart": {
        "xAxisField": "X축",
        "yAxisField": "Y축",
        "colorField": "색상 필드",
        "barMaxWidth": "막대 최대 너비",
        "colorField_tip": "Name은 예약어이며 시계열 이름이 담긴 필드의 이름입니다"
      },
      "barGauge": {
        "topn": "최대 순위 수",
        "combine_other": "기타",
        "combine_other_tip": "순위 밖의 데이터는 기타 항목 하나로 묶입니다",
        "otherPosition": {
          "label": "기타 항목 위치",
          "tip": "기타 항목의 위치이며 맨 앞이나 맨 뒤를 고를 수 있습니다",
          "options": {
            "none": "기본",
            "top": "맨 앞",
            "bottom": "맨 뒤"
          }
        },
        "displayMode": "표시 모드",
        "valueMode": {
          "label": "값 표시",
          "color": "표시",
          "hidden": "숨기기"
        }
      }
    },
    "inspect": {
      "title": "문제 확인",
      "query": "쿼리",
      "json": "그래프 설정"
    }
  },
  "export": {
    "copy": "JSON 내용을 클립보드에 복사"
  },
  "query": {
    "title": "조회 조건",
    "add_query_btn": "조회 조건 추가",
    "add_expression_btn": "수식 추가",
    "transform": "데이터 변환",
    "datasource_placeholder": "데이터 소스를 선택하세요",
    "datasource_msg": "데이터 소스를 선택하세요",
    "time": "시간 선택",
    "time_tip": "시간 범위를 따로 지정할 수 있으며 기본값은 대시보드의 전역 시간 범위입니다",
    "es": {
      "field_key_msg": "field key를 입력해야 합니다"
    },
    "prometheus": {
      "query": "쿼리문 (PromQL)",
      "maxDataPoints": {
        "tip": "시계열 하나의 최대 점 개수이며 기본값은 패널 너비, 새로 만들 때는 240입니다. 계산식은 step = (end − start) / maxDataPoints입니다",
        "tip_2": "시계열 하나의 최대 점 개수이며 기본값은 패널 너비입니다. 계산식은 step = (end − start) / maxDataPoints입니다"
      },
      "minStep": {
        "label": "최소 간격 (Min step)",
        "tip": "최소 간격이며 기본값은 15입니다. 계산식은 step = max(step, minStep, safeStep)이고 safeStep = (end − start) / 11000입니다"
      },
      "step": {
        "tag_tip": "계산식은 step = max((end − start) / maxDataPoints, minStep, safeStep)이고 safeStep = (end − start) / 11000입니다"
      },
      "instant": {
        "label": "즉시 조회 (Instant)",
        "tip": "\"종료\" 시점의 데이터만 조회하므로 값이 하나뿐입니다"
      }
    },
    "expression_placeholder": "하나 이상의 조회 결과에 수학 연산을 합니다. ${refId}로 조회를 참조하며 $A, $B, $C처럼 씁니다. 스칼라 두 값을 더하는 예: $A + $B > 10",
    "legend": "범례 (Legend)",
    "legendTip": "범례 이름을 덮어쓰거나 템플릿으로 지정합니다. 예를 들어 {{hostname}}은 hostname 레이블의 값으로 바뀝니다",
    "legendTip2": "범례 이름을 덮어쓰거나 템플릿으로 지정합니다. 예를 들어 {{hostname}}은 hostname 레이블의 값으로 바뀌며 현재는 시계열 데이터에만 적용됩니다",
    "options": "조회 옵션",
    "options_max_data_points": "최대 데이터 포인트 수",
    "options_max_data_points_tip": "시계열 하나의 최대 점 개수이며 기본값은 패널 너비, 새로 만들 때는 240입니다. step = (end − start) / maxDataPoints 계산에 쓰입니다",
    "options_time": "조회 시간 범위",
    "options_time_tip": "조회 시간 범위를 따로 지정할 수 있으며 기본값은 대시보드의 전역 시간 범위입니다",
    "copy_query": "조회 복사",
    "mixed_datasource": "데이터 소스 혼합",
    "hide_response": "조회 결과 숨기기"
  },
  "migrate": {
    "title": "대시보드 마이그레이션",
    "close_and_dismiss": "닫고 다시 표시하지 않기",
    "batch_migrate": "대시보드 일괄 마이그레이션으로 이동",
    "migrate_current": "이 대시보드 마이그레이션",
    "desc_1": "v6에서는 전역 Prometheus 클러스터 전환을 더 이상 지원하지 않으며, 새 버전에서는 그래프를 데이터 소스 변수에 연결해 같은 일을 합니다.",
    "desc_2": "마이그레이션 도구가 데이터 소스 변수를 만들고 데이터 소스가 없는 모든 그래프를 거기에 연결합니다."
  },
  "detail": {
    "ai_analysis": "AI 분석",
    "datasource_empty": "데이터 소스 정보가 없습니다. 먼저 데이터 소스를 설정하세요",
    "invalidTimeRange": "__from과 __to 값이 잘못되었습니다",
    "invalidDatasource": "잘못된 데이터 소스입니다",
    "invalidPanelConfig": "잘못된 그래프 설정입니다",
    "deletePanel_confirm": "그래프 {{name}}을(를) 삭제할까요?",
    "invalidPanelType": "잘못된 그래프 유형입니다",
    "fullscreen": {
      "notification": {
        "esc": "ESC를 누르면 전체 화면이 끝납니다",
        "theme": "테마 전환"
      }
    },
    "saved": "저장했습니다",
    "expired": "다른 사람이 이 대시보드를 수정했습니다. 서로 덮어쓰지 않도록 새로 고쳐 최신 설정과 데이터를 확인하세요",
    "prompt": {
      "title": "저장되지 않은 변경이 있습니다",
      "message": "변경 내용을 저장할까요?",
      "cancelText": "취소",
      "discardText": "버리기",
      "okText": "저장"
    },
    "importPanel": {
      "invalidJSON": "그래프 설정 JSON 형식이 올바르지 않습니다",
      "placeholder": "그래프 설정 JSON을 붙여 넣으세요. JSON은 그래프 패널 오른쪽 위 추가 작업의 \"복사\"에서 얻을 수 있습니다"
    }
  },
  "settings": {
    "graphTooltip": {
      "label": "툴팁 (Tooltip)",
      "tip": "모든 그래프의 툴팁 동작을 조절합니다",
      "default": "기본",
      "sharedCrosshair": "십자선 공유",
      "sharedTooltip": "툴팁 공유"
    },
    "graphZoom": {
      "label": "확대·축소 동작",
      "tip": "모든 그래프의 확대·축소 동작을 조절합니다",
      "default": "기본",
      "updateTimeRange": "시간 범위 갱신"
    },
    "save": "대시보드 저장"
  },
  "visualizations": {
    "timeseries": "시계열 그래프",
    "barchart": "막대 그래프",
    "stat": "지표 값",
    "table": "표",
    "tableNG": "표 NG (Beta)",
    "pie": "원 그래프",
    "hexbin": "벌집 그래프",
    "barGauge": "순위표",
    "text": "텍스트 카드",
    "gauge": "게이지 그래프",
    "heatmap": "색상 블록 그래프",
    "iframe": "삽입 문서 (iframe)",
    "row": "그룹",
    "importPanel": "그래프 붙여넣기"
  },
  "calcs": {
    "lastNotNull": "마지막 빈값 아닌 값",
    "last": "마지막 값",
    "firstNotNull": "첫 번째 빈값 아닌 값",
    "first": "첫 번째 값",
    "min": "최솟값",
    "max": "최댓값",
    "avg": "평균",
    "sum": "합계",
    "count": "개수",
    "origin": "원본 값",
    "variance": "분산",
    "stdDev": "표준편차"
  },
  "annotation": {
    "add": "주석 추가",
    "edit": "주석 수정",
    "description": "설명",
    "tags": "레이블",
    "updated": "주석을 수정했습니다",
    "deleted": "주석을 삭제했습니다"
  },
  "transformations": {
    "organize": {
      "title": "Organize fields by name",
      "desc": "필드를 재정렬하거나 숨기거나 이름을 바꿉니다"
    },
    "merge": {
      "title": "Merge tables",
      "desc": "여러 표를 하나로 합칩니다"
    },
    "joinByField": {
      "title": "Join by field",
      "desc": "관련 필드를 기준으로 여러 표의 행을 합칩니다",
      "mode": "모드",
      "byField": "필드"
    },
    "timeSeriesTable": {
      "title": "Time series to table",
      "desc": "시계열 데이터의 각 시점 값을 하나의 값으로 계산합니다",
      "fieldName": "필드",
      "functions": "방식"
    },
    "groupedAggregateTable": {
      "title": "Grouped aggregate table",
      "desc": "표를 하나 이상의 필드로 묶고 나머지 필드를 집계합니다",
      "operation_map": {
        "aggregate": "계산",
        "groupby": "그룹"
      }
    }
  },
  "add_transformation": "데이터 변환 추가"
};

export default ko_KR;
