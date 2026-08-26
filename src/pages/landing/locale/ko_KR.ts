const ko_KR = {
  "pageTitle": "Nightingale에 오신 것을 환영합니다",
  "onboarding": {
    "dismiss": "다시 표시하지 않기",
    "title": "시작 가이드",
    "subtitle": "이 단계들만 따라 하면 몇 분 안에 모니터링을 시작할 수 있습니다",
    "progress": "{{total}}단계 가운데 {{done}}단계 완료",
    "hostTrack": "호스트 모니터링 경로",
    "dataTrack": "데이터 연동 경로",
    "aiTrack": "AI 활용",
    "optional": "선택 사항",
    "steps": {
      "machine": {
        "title": "수집기를 설치해 호스트 연결",
        "desc": "호스트에 Categraf를 설치하면 머신이 장비 목록에 저절로 나타납니다"
      },
      "collectVerified": {
        "title": "수집을 설정하고 데이터 확인",
        "desc": "컴포넌트별로 Categraf 설정을 만들고 지표가 들어왔는지 확인합니다"
      },
      "hostDashboard": {
        "title": "호스트 모니터링 대시보드 적용",
        "desc": "내장 호스트 대시보드를 한 번에 가져와 머신 데이터를 바로 확인합니다"
      },
      "hostAlert": {
        "title": "호스트 알림 켜기",
        "desc": "내장 호스트 알림 규칙을 한 번에 가져와 켭니다"
      },
      "testDelivered": {
        "title": "테스트 알림 보내기",
        "desc": "시뮬레이션 이벤트로 알림이 실제로 도착하는지 확인합니다"
      },
      "datasource": {
        "title": "데이터 소스 설정",
        "desc": "Prometheus, VictoriaMetrics 같은 데이터 소스를 연결합니다"
      },
      "dashboard": {
        "title": "대시보드 만들기",
        "desc": "관심 있는 지표를 대시보드로 시각화합니다"
      },
      "alert": {
        "title": "알림 규칙 설정",
        "desc": "핵심 지표에 첫 알림 규칙을 만듭니다"
      },
      "notification": {
        "title": "알림 전송 설정",
        "desc": "DingTalk나 이메일 같은 매체로 알림이 실제로 나가게 합니다"
      },
      "llm": {
        "title": "LLM 연결",
        "desc": "LLM을 설정해 AI 어시스턴트와 지능형 분석을 사용합니다"
      }
    }
  },
  "hero": {
    "badge": "오픈 소스 · 올인원 모니터링 및 알림 플랫폼",
    "highlight": "모니터링을 더 쉽고 똑똑하게",
    "description": "지표와 로그를 한곳에서 수집하고 분석하며, 알림 관리와 시각화 대시보드, 지능형 어시스턴트를 바로 쓸 수 있고 클라우드 네이티브 환경에도 잘 맞습니다.",
    "primaryAction": "문서 보기",
    "secondaryAction": "AI에게 묻기"
  },
  "matrix": {
    "headerKicker": "기능 한눈에 보기",
    "headerSubtitle": "데이터 수집과 통합부터 통합 관측과 알림 전송까지 아우르는 관측 플랫폼",
    "scenarioTag": "시나리오 · 통합 알림",
    "observabilityTag": "플랫폼 · 통합 관측",
    "notificationTag": "전달 · 알림 매체",
    "collectionTag": "데이터 · 통합 수집",
    "integrationTag": "데이터 · 통합 연동",
    "integrationBrowseAll": "70개가 넘는 내장 통합 둘러보기",
    "infrastructureTag": "기업 서비스 인프라",
    "dataIngestArrow": "데이터 · 통합 연결",
    "alertEventArrow": "알림 이벤트",
    "scenario": {
      "businessGroups": {
        "title": "비즈니스 그룹",
        "description": "멀티테넌시와 리소스 격리"
      },
      "alertGovernance": {
        "title": "알림 관리",
        "description": "규칙 · 음소거 · 구독"
      },
      "eventHistory": {
        "title": "지난 이벤트",
        "description": "전체 이벤트 회고 분석"
      },
      "aiAssistant": {
        "title": "AI 지능화",
        "description": "LLM으로 구현한 지능형 기능"
      }
    },
    "observability": {
      "dashboard": "대시보드",
      "metricExplorer": "지표 분석",
      "logExplorer": "로그 분석",
      "alertRules": "알림 규칙",
      "alertMutes": "알림 음소거",
      "alertSubscribes": "알림 구독",
      "objectExplorer": "모니터링 대상",
      "recordingRules": "레코딩 규칙"
    },
    "collection": {
      "description": "올인원 오픈 소스 수집기",
      "footer": "지표와 로그를 한 번에 수집"
    },
    "infrastructure": {
      "components": "기본 컴포넌트",
      "microservice": "마이크로서비스",
      "apiFunctions": "API와 기능",
      "endpoints": "클라이언트",
      "publicCloud": "퍼블릭 클라우드",
      "privateCloud": "프라이빗 클라우드",
      "containers": "컨테이너와 가상 머신",
      "devices": "장비",
      "network": "네트워크"
    },
    "notification": {
      "rules": {
        "title": "알림 전송 규칙",
        "description": "세밀한 배분 라우팅"
      },
      "templates": {
        "title": "알림 템플릿",
        "description": "일관된 메시지 서식"
      },
      "channels": {
        "title": "알림 매체",
        "description": "여러 채널로 전달"
      },
      "users": {
        "title": "사용자와 팀",
        "description": "수신자 조직 관리"
      }
    },
    "footnotes": {
      "scenario": [
        "멀티테넌시와 비즈니스 그룹 격리",
        "알림 규칙 · 음소거 · 구독",
        "대규모 언어 모델 기반 분석 지원"
      ],
      "observability": "통합 관측 플랫폼 기능",
      "integration": "널리 쓰이는 오픈 소스 데이터 소스",
      "notification": [
        "알림 센터",
        "알림과 구독"
      ]
    }
  },
  "quickStart": {
    "title": "빠르게 시작하기",
    "viewAll": "전체 문서 보기",
    "askAi": "AI가 답해 드립니다",
    "ingest": {
      "title": "통합 연결",
      "description": "설치와 데이터 연결을 빠르게 마칩니다",
      "links": [
        "Categraf 수집기는 어떻게 설치하나요?",
        "데이터 소스는 어떻게 설정하나요?"
      ]
    },
    "observe": {
      "title": "통합 관측",
      "description": "지표와 로그를 한곳에서 분석",
      "links": [
        "대시보드로 업무 지표를 어떻게 시각화하나요?",
        "지표 분석에서 PromQL 쿼리는 어떻게 작성하나요?"
      ]
    },
    "alert": {
      "title": "알림 관리",
      "description": "알림 규칙 설정과 알림 전달",
      "links": [
        "첫 알림 규칙은 어떻게 만드나요?",
        "사내 메신저를 연결해 알림을 받으려면 어떻게 하나요?"
      ]
    },
    "ai": {
      "title": "AI 지능화",
      "description": "LLM과 에이전트",
      "links": [
        "Nightingale에는 어떤 스킬이 들어 있나요?",
        "에이전트로 알림을 자동으로 분석하려면 어떻게 하나요?"
      ]
    }
  },
  "aiAssistant": {
    "title": "Nightingale AI 어시스턴트",
    "description": "대규모 언어 모델을 바탕으로 일상 언어만으로 플랫폼을 조작하고 데이터를 조회하며 알림의 근본 원인을 분석합니다.",
    "capabilities": [
      "일상 언어로 조회",
      "알림 근본 원인 분석",
      "PromQL / LogQL 생성",
      "문서 기반 질의응답"
    ],
    "action": "AI 어시스턴트 바로 써 보기"
  }
};

export default ko_KR;
