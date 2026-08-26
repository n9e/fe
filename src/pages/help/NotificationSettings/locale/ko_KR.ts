const ko_KR = {
  "title": "통지 설정",
  "disabled": "사용 중지",
  "webhooks": {
    "help_content": "콜백은 Nightingale과 다른 시스템을 잇는 방법입니다. Nightingale이 알림 이벤트를 만들면 각 콜백 주소로 보내므로, HTTP API를 직접 만들어 여기에 등록하면 알림 이벤트를 받아 자동화하거나 맞춤 로직을 실행할 수 있습니다. 콜백은 HTTP POST 메서드를 쓰며 이벤트 내용을 JSON 형식으로 요청 본문에 담습니다. 데이터 구조는 [여기](https://github.com/ccfos/nightingale/blob/main/models/alert_cur_event.go#L19)를 보세요. 시험해 보려면 Nightingale과 네트워크가 통하는 머신을 하나 준비하고, 예를 들어 IP가 10.1.2.3이라면 그 위에서 `nc -k -l 4321`처럼 nc로 4321 포트를 열어 두세요. 그런 다음 `http://10.1.2.3:4321`을 콜백 주소로 등록하고 알림 규칙을 하나 만들면, 알림이 발생하는 순간 Nightingale이 그 주소를 호출하므로 nc 명령의 출력에서 자세한 데이터 형식을 볼 수 있습니다.",
    "title": "콜백 주소",
    "enable": "사용",
    "note": "메모",
    "url": "URL",
    "timeout": "제한 시간 (초)",
    "basic_auth_user": "사용자 이름 (Basic Auth)",
    "basic_auth_password": "비밀번호 (Basic Auth)",
    "skip_verify": "SSL 검증 건너뛰기",
    "add": "추가",
    "help": "\n      Nightingale의 알림 이벤트를 전부 다른 플랫폼으로 넘겨 처리하고 싶다면 여기의 전역 콜백 주소를 쓰면 됩니다.\n      <br />\n      <br />\n      보통 모니터링 시스템은 데이터 수집·저장·분석과 알림 이벤트 생성에 집중하고, 이벤트의 배분, 잡음 줄이기, 담당 지정, 에스컬레이션, 당직 편성, 협업은 별도 제품이 맡습니다. 이런 제품을 OnCall 제품이라 부르며 SRE를 실천하는 회사에서 널리 씁니다.\n      <br />\n      <br />\n      OnCall 제품은 대개 Prometheus, Nightingale, Zabbix, ElastAlert, BlueKing, 각종 클라우드 모니터링 등 여러 모니터링 시스템과 연동됩니다. 각 시스템이 웹훅으로 알림 이벤트를 OnCall 센터에 보내면 사용자는 그곳에서 배분과 잡음 줄이기, 처리를 이어 갑니다.\n      <br />\n      <br />\n      해외에서는 <a1>PagerDuty</a1>, 중국에서는 <a2>FlashDuty</a2>가 대표적이며 둘 다 무료로 가입해 써 볼 수 있습니다.\n    "
  },
  "script": {
    "title": "통지 스크립트",
    "enable": "사용",
    "timeout": "제한 시간 (초)",
    "type": [
      "스크립트 사용",
      "파일 경로 사용"
    ],
    "path": "파일 경로",
    "content": "스크립트 내용"
  },
  "channels": {
    "title": "통지 매체",
    "name": "이름",
    "ident": "식별자",
    "ident_msg1": "식별자에는 영문자, 숫자, 밑줄, 하이픈만 쓸 수 있습니다",
    "ident_msg2": "이미 있는 식별자입니다",
    "hide": "숨기기",
    "add": "추가",
    "add_title": "통지 매체 추가",
    "edit_title": "통지 매체 수정",
    "enabled": "사용"
  },
  "contacts": {
    "title": "연락 수단",
    "add_title": "연락 수단 추가",
    "edit_title": "연락 수단 수정"
  },
  "smtp": {
    "title": "SMTP 설정",
    "testMessage": "테스트 메일을 보냈습니다. 확인하세요"
  },
  "ibex": {
    "title": "자동 복구 설정"
  }
};

export default ko_KR;
