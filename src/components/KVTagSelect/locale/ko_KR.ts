const ko_KR = {
  "append_tags_msg": "레이블 형식이 올바르지 않습니다. 확인하세요.",
  "append_tags_msg1": "레이블 길이는 64자 이하여야 합니다",
  "append_tags_msg2": "레이블 형식은 key=value여야 하며, key는 영문자나 밑줄로 시작하고 영문자, 숫자, 밑줄로 이루어져야 합니다.",
  "append_tags_placeholder": "레이블 형식은 key=value이며 Enter나 공백으로 구분합니다",
  "tag": {
    "key": {
      "label": "레이블 이름",
      "msg": "레이블 이름은 비워 둘 수 없습니다",
      "duplicate_error": "같은 key를 중복해서 쓸 수 없습니다. 이벤트가 일치하지 않게 됩니다",
      "placeholder": "일치에 사용할 레이블 key를 입력하거나 선택하세요. 예: app, cluster, alertname"
    },
    "func": {
      "label": "연산자",
      "label_tip": "여러 일치 연산자를 지원하며 각각의 뜻은 다음과 같습니다:\n- `==` 특정 레이블 값 하나와 일치시킵니다. 여러 값을 동시에 맞추려면 `in`을 사용하세요\n- `=~` 정규식을 입력해 레이블 값을 유연하게 일치시킵니다\n- `in` 여러 레이블 값과 일치시키며 SQL의 `in`과 비슷합니다\n- `not in` 여러 레이블 값을 제외하며 SQL의 `not in`과 비슷합니다\n- `!=` 같지 않음을 뜻하며 특정 레이블 값 하나를 제외할 때 씁니다\n- `!~` 정규식과 일치하지 않음을 뜻하며, 이 정규식에 맞는 레이블 값은 모두 제외됩니다. PromQL의 `!~`와 같습니다",
      "msg": "연산자는 비워 둘 수 없습니다"
    },
    "value": {
      "label": "레이블 값",
      "placeholder": "일치에 사용할 레이블 값을 직접 입력하거나 목록에서 선택하세요",
      "placeholder2": "정규식을 입력해 속성 값을 유연하게 일치시키세요",
      "msg": "레이블 값은 비워 둘 수 없습니다"
    },
    "add": "레이블 추가"
  },
  "attr": {
    "key": {
      "label": "속성 이름",
      "msg": "속성 이름은 비워 둘 수 없습니다",
      "duplicate_error": "속성 이름은 중복될 수 없습니다"
    }
  }
};

export default ko_KR;
