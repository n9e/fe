const ko_KR = {
  "title": "알림 매체",
  "basic_configuration": "기본 설정",
  "default_values": {
    "access_key_id": "실제 access_key_id로 바꾸세요",
    "access_key_secret": "실제 access_key_secret으로 바꾸세요",
    "show_number": "실제 show_number로 바꾸세요. 비워 두면 표시되지 않습니다",
    "voice_code": "실제 voice_code로 바꾸세요",
    "sign_name": "실제 서명으로 바꾸세요",
    "template_id": "실제 템플릿 ID로 바꾸세요",
    "secret_id": "실제 secret_id로 바꾸세요",
    "secret_key": "실제 secret_key로 바꾸세요",
    "region": "실제 region으로 바꾸세요",
    "app_id": "실제 appid로 바꾸세요",
    "ali_voice_tts_param": "장애 {{$tpl.incident}}입니다. 담당을 맡으려면 1번을 누르세요",
    "ali_sms_template_param": "장애 {{$tpl.incident}}입니다. 빨리 대응해 주세요"
  },
  "ident": "매체 유형",
  "ident_tip": "알림 매체의 분류입니다. 예를 들어 DingTalk 매체가 여러 개라도 유형은 모두 dingtalk으로 둘 수 있습니다. 유형은 목록에 있는 값에 매이지 않고 직접 입력할 수 있으며, 알림 매체와 메시지 템플릿은 이 유형 필드로 이어집니다",
  "note_tip": "이 알림 매체에 대한 보충 설명이나 쓰임새를 적어 두면 나중에 관리하거나 함께 일할 때 도움이 됩니다",
  "enable_tip": "이 알림 매체 설정을 쓸지 정합니다. 끄면 설정이 잠시 멈춰 알림을 보내지 않습니다",
  "advanced_settings": "고급 설정",
  "variable_configuration": {
    "title": "변수 설정",
    "contact_key": "연락 수단",
    "contact_key_tip": "사용자와 조직 - 사용자 관리에 있는 연락 수단과 대응하며 알림을 보낼 방법을 고르는 데 씁니다. 예를 들어 \"Phone\"은 사용자의 전화번호를 콜백 요청이나 콜백 스크립트로 넘긴다는 뜻입니다. 새로운 연락 수단 유형은 사용자와 조직 - 연락 수단 페이지에서 추가할 수 있습니다",
    "params": {
      "title": "매개변수 설정",
      "title_tip": "이 알림 매체에 필요한 사용자 지정 매개변수를 정합니다. DingTalk 봇 토큰이나 API 키 같은 것들입니다. 알림 전송 규칙에서 매체를 고를 때 값도 함께 입력할 수 있습니다",
      "key": "매개변수 식별자",
      "key_required": "매개변수 식별자는 비워 둘 수 없습니다",
      "cname": "매개변수 이름",
      "cname_required": "매개변수 이름은 비워 둘 수 없습니다"
    }
  },
  "request_configuration": {
    "http": "HTTP 설정",
    "smtp": "SMTP 설정",
    "script": "스크립트 설정",
    "flashduty": "FlashDuty 설정",
    "pagerduty": "PagerDuty 설정",
    "dingtalkapp": "DingTalk 앱 설정",
    "wecomapp": "WeCom 앱 설정",
    "feishuapp": "Feishu 앱 설정"
  },
  "request_type": "전송 방식",
  "http_request_config": {
    "title": "HTTP",
    "url": "URL",
    "url_tip": "알림 요청을 받을 대상 주소",
    "method": "요청 메서드",
    "header": "요청 헤더",
    "header_tip": "요청에 함께 보낼 사용자 지정 HTTP 헤더이며 BasicAuth 자격 증명 같은 것이 여기 들어갑니다. URL, 헤더, 매개변수 값, 요청 본문 모두 {{.변수이름}} 형태로 시스템 설정 - 변수 설정의 변수를 참조할 수 있으므로 토큰 같은 자격 증명을 여기에 그대로 적지 않아도 됩니다",
    "header_key": "매개변수 이름",
    "header_value": "매개변수 값",
    "timeout": "제한 시간 (밀리초)",
    "concurrency": "동시 실행 수",
    "concurrency_tip": "동시에 보내는 최대 요청 수입니다. 알맞게 늘리면 전송이 빨라지지만 대상 서비스가 감당할 수 있는지 살펴야 합니다",
    "retry_times": "재시도 횟수",
    "retry_interval": "재시도 간격 (밀리초)",
    "insecure_skip_verify": "인증서 검증 건너뛰기",
    "proxy": "프록시",
    "proxy_tip": "프록시가 필요한 경우에 쓰는 HTTP 프록시 주소",
    "params": "요청 매개변수",
    "params_key": "매개변수 이름",
    "params_value": "매개변수 값",
    "body": "요청 본문"
  },
  "smtp_request_config": {
    "title": "SMTP",
    "host": "서버",
    "host_tip": "메일을 보낼 SMTP 서버 주소를 적습니다. 예: smtp.example.com",
    "port": "포트",
    "port_tip": "SMTP 서버의 포트 번호입니다. 흔히 25, 465(SSL), 587(STARTTLS)을 쓰며 정확한 포트는 서비스 제공자에게 확인하세요",
    "username": "사용자 이름",
    "username_tip": "SMTP 서버에 로그인할 사용자 이름이며 보통 메일 주소입니다",
    "password": "비밀번호",
    "password_tip": "그 SMTP 사용자 이름의 비밀번호나 앱 비밀번호이며 보안을 위해 앱 비밀번호를 권합니다",
    "from": "보내는 사람",
    "from_tip": "메일에 표시되는 보내는 사람 이름이나 메일 별칭이며 받는 사람이 출처를 알아보기 쉽게 합니다. 형식 예: Flashcat <no-reply@notice.flashcat.cloud>",
    "insecure_skip_verify": "인증서 검증 건너뛰기",
    "insecure_skip_verify_tip": "켜면 SMTP 서버의 인증서 검증을 건너뜁니다. 주로 테스트나 자체 서명 인증서 환경에서 씁니다",
    "batch": "묶음 전송",
    "batch_tip": "한 번의 SMTP 연결에서 메일을 몇 통 보낼지"
  },
  "script_request_config": {
    "title": "Script",
    "script": {
      "option": "스크립트 사용",
      "label": "스크립트 내용"
    },
    "path": {
      "option": "파일 경로 사용",
      "label": "파일 경로"
    },
    "timeout": "제한 시간 (밀리초)"
  },
  "flashduty_request_config": {
    "title": "FlashDuty",
    "integration_url": "URL",
    "integration_url_tip": "Flashduty 통합 센터에서 만든 통합 주소를 적습니다. https://console.flashcat.cloud/settings/source/alert/add/n9e 에서 만들 수 있습니다",
    "proxy": "프록시",
    "proxy_tip": "프록시가 필요한 경우에 쓰는 HTTP 프록시 주소",
    "timeout": "제한 시간 (밀리초)",
    "retry_times": "재시도 횟수"
  },
  "pagerduty_request_config": {
    "title": "PagerDuty",
    "api_key": "API Key",
    "api_key_tip": "PagerDuty의 통합 API 키를 적습니다. 발급 방법은 https://developer.pagerduty.com/docs/authentication 문서를 보세요",
    "proxy": "프록시",
    "proxy_tip": "프록시가 필요한 경우에 쓰는 HTTP 프록시 주소",
    "timeout": "제한 시간 (밀리초)",
    "retry_times": "재시도 횟수"
  },
  "dingtalkapp_request_config": {
    "app_key": "앱 고유 식별자",
    "app_secret": "앱 비밀 키",
    "alert_shot_tip": "알림에 이미지를 넣어야 한다면 문서를 보고 DingTalk 앱을 등록한 뒤 관련 정보를 입력하세요"
  },
  "wecomapp_request_config": {
    "corp_id": "기업 ID",
    "corp_secret": "기업 비밀 키",
    "agentid": "Agent ID"
  },
  "feishuapp_request_config": {
    "app_id": "앱 ID",
    "app_secret": "앱 비밀 키",
    "receive_id_type": "수신자 ID 유형",
    "alert_shot_tip": "알림에 이미지를 넣어야 한다면 문서를 보고 Feishu 앱을 등록한 뒤 관련 정보를 입력하세요",
    "lark_alert_shot_tip": "알림에 이미지를 넣어야 한다면 문서를 보고 Lark 앱을 등록한 뒤 관련 정보를 입력하세요"
  },
  "types_search_placeholder": "유형으로 검색",
  "name_search_placeholder": "이름으로 검색",
  "disabled": "사용 중지",
  "status_select": {
    "placeholder": "상태",
    "enable": "사용",
    "disable": "사용 중지"
  },
  "types_select_placeholder": "유형",
  "types": {
    "flashduty": "FlashDuty",
    "callback": "콜백",
    "email": "이메일",
    "dingtalk": "DingTalk",
    "dingtalkapp": "DingTalk 앱",
    "wecom": "WeCom",
    "wecomapp": "WeCom 앱",
    "feishucard": "Feishu 카드",
    "feishu": "Feishu",
    "feishuapp": "Feishu 앱",
    "larkcard": "Lark 카드",
    "lark": "Lark",
    "telegram": "Telegram",
    "ali-voice": "Alibaba Cloud 음성",
    "ali-sms": "Alibaba Cloud SMS",
    "tx-voice": "Tencent Cloud 음성",
    "tx-sms": "Tencent Cloud SMS",
    "slackbot": "Slack Bot",
    "slackwebhook": "Slack Webhook",
    "mattermostbot": "Mattermost Bot",
    "mattermostwebhook": "Mattermost Webhook",
    "discord": "Discord",
    "jsm_alert": "JSM Alert",
    "jira": "JIRA",
    "pagerduty": "PagerDuty",
    "script": "Script"
  },
  "test": {
    "btn": "테스트",
    "run": "테스트 전송",
    "back": "돌아가서 수정",
    "desc": "지금 폼에 있는 설정 그대로 메시지를 실제로 한 통 보냅니다. 먼저 저장하지 않아도 되며 주소, 키, 네트워크가 제대로 동작하는지 확인하는 데 씁니다.",
    "script_blocked": "스크립트 매체는 먼저 저장한 뒤에 테스트할 수 있습니다",
    "params_title": "매체 매개변수",
    "receivers_title": "수신자",
    "pagerduty_keys_title": "Integration Key",
    "pagerduty_keys_tip": "PagerDuty는 integration key로 전달합니다. 저장한 뒤에는 알림 전송 규칙에서 서비스/통합으로 고를 수 있으며, 지금은 직접 입력하세요. 여러 개도 됩니다.",
    "pagerduty_keys_placeholder": "integration key를 입력하고 Enter를 누르세요",
    "user_ids": "사용자 선택",
    "user_group_ids": "팀 선택",
    "mode": {
      "history": "지난 이벤트",
      "mock": "시뮬레이션 이벤트"
    },
    "empty_alert": "이 환경에는 아직 지난 알림 이벤트가 없습니다",
    "switch_btn": "시뮬레이션 이벤트로 테스트",
    "result_success": "전송했습니다",
    "result_success_desc": "해당 채팅방이나 메일함에서 메시지가 도착했는지 확인하세요",
    "result_failed": "전송에 실패했습니다"
  }
};

export default ko_KR;
