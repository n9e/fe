const ko_KR = {
  "toolbar": {
    "current_chat": "현재 대화",
    "new_chat": "새 대화",
    "history": "대화 기록",
    "share": "공유",
    "share_copied": "공유 링크를 복사했습니다",
    "switch_to_drawer": "서랍 모드로 전환",
    "switch_to_floating": "플로팅 창 모드로 전환"
  },
  "history": {
    "untitled": "새 대화",
    "today": "오늘",
    "yesterday": "어제",
    "earlier": "이전",
    "unknown_time": "--:--",
    "delete_confirm": "이 대화를 삭제할까요?",
    "empty": "대화 기록이 없습니다",
    "search_placeholder": "대화 검색",
    "share": "대화 공유",
    "rename": "이름 변경",
    "more_actions": "대화 관련 추가 작업"
  },
  "nightingale": {
    "title": "Nightingale AI",
    "new_chat": "새 대화",
    "sessions": "대화",
    "llm_configs": "LLM 관리",
    "skills": "스킬 관리",
    "mcp_servers": "MCP 관리",
    "ai_task": "작업 채널",
    "collapse_sidebar": "AI 사이드바 접기",
    "expand_sidebar": "AI 사이드바 펼치기",
    "welcome_cards": {
      "overview": {
        "title": "Nightingale 빠르게 알아보기",
        "description": "제품과 AI 어시스턴트로 무엇을 할 수 있는지 1분 만에 파악하기",
        "prompt": "Nightingale 모니터링의 핵심 기능과 네가 도와줄 수 있는 일을 1분 안에 설명해 줘"
      },
      "alerts": {
        "title": "내 알림 점검하기",
        "description": "어떤 규칙이 가장 시끄럽고, 어떤 규칙은 한 번도 발생하지 않았는지",
        "prompt": "현재 알림 규칙을 점검해 줘. 최근 7일 동안 가장 자주 발생한 규칙과 한 번도 발생하지 않은 규칙을 알려 줘"
      },
      "create_alert": {
        "title": "한 문장으로 알림 만들기",
        "description": "상황을 설명하면 PromQL과 임계값을 만들어 드립니다",
        "prompt": "알림 규칙을 만들어 줘. 호스트 CPU 사용률이 5분 동안 80%를 넘으면 알림이 발생하도록"
      }
    }
  },
  "input": {
    "placeholder": "질문을 입력하세요. Enter로 전송하고 Shift + Enter로 줄을 바꿉니다",
    "share_readonly_placeholder": "읽기 전용 공유 모드입니다"
  },
  "query": {
    "title": "쿼리문",
    "copied": "쿼리문을 복사했습니다",
    "copy": "복사",
    "execute": "쿼리 실행",
    "execute_disabled": "실행 콜백이 전달되지 않아 복사만 지원합니다"
  },
  "action": {
    "query_generator": "쿼리문 생성"
  },
  "message": {
    "generating": "생각하는 중…",
    "processing": "아직 처리 중입니다",
    "hint": "안내",
    "no_llm_title": "이 환경에는 LLM 설정이 없습니다",
    "no_llm_content": "<a>LLM 관리</a> 페이지에서 LLM 설정을 추가하세요",
    "stopped": "생성을 중단했습니다",
    "request_failed": "요청이 실패했습니다",
    "cancelled": "이번 답변이 취소되었습니다.",
    "retry_later": "잠시 후 다시 시도하세요.",
    "empty_response": "답변 내용이 없습니다",
    "thinking": "사고 과정",
    "unsupported_type": "지원하지 않는 콘텐츠 유형입니다: {{type}}"
  },
  "form_select": {
    "title": "계속하기 전에 다음 정보를 입력하세요:",
    "approval_title": "위 작업을 실행할지 확인하세요:",
    "busi_group": "비즈니스 그룹",
    "datasource": "데이터 소스",
    "team": "팀",
    "skill_scope": "공개 범위",
    "placeholder_select": "선택하세요",
    "confirm": "확인"
  },
  "alert_rule": {
    "title": "알림 규칙",
    "copy": "복사",
    "copied": "규칙 ID를 복사했습니다",
    "duration_seconds": "{{seconds}}초 동안 지속",
    "field": {
      "id": "규칙 ID",
      "name": "규칙 이름",
      "group": "비즈니스 그룹",
      "datasource": "데이터 소스",
      "cate": "데이터 소스 유형",
      "severity": "알림 등급",
      "metric": "모니터링 지표",
      "condition": "발생 조건",
      "note": "알림 내용"
    },
    "severity": {
      "critical": "Critical",
      "warning": "Warning",
      "info": "Info"
    }
  },
  "dashboard": {
    "title": "대시보드",
    "copied": "대시보드 ID를 복사했습니다",
    "field": {
      "id": "대시보드 ID",
      "name": "이름",
      "group": "비즈니스 그룹",
      "datasource": "기본 데이터 소스",
      "panels_count": "패널 수",
      "variables_count": "변수 수",
      "tags": "레이블"
    }
  },
  "empty": {
    "greeting_prefix": "안녕하세요, 저는"
  },
  panel: {
    open: 'AI로 쿼리 생성',
    untitled: 'AI 생성',
    intro: '보고 싶은 것을 편하게 적어 주세요. 이 데이터 소스에서 확인한 뒤 위 입력창에 넣어 실행합니다。',
    based_on: '{{name}} 기준',
    running: '생성 중',
    adopted: '적용됨',
    failed: '결과 없음',
    close: '닫기',
    step: {
      command: '명령 {{count}}회 실행',
      read_file: '파일 {{count}}개 읽음',
      edit_file: '파일 {{count}}개 씀',
      separator: ' · ',
    },
    written_back: '위 입력란에 반영하고 실행했습니다',
    undo: '실행 취소',
    regenerate: '다시 생성',
    send: '보내기',
    follow_up_placeholder: '이어서 말하세요, 예: "pod별로 집계"',
    answer_below: '아래에 답하면 계속합니다',
    needs_answer: '답변 필요',
    error_detail: '오류 세부 정보',
    nothing_delivered: '사용할 수 있는 식이 없습니다',
    failed_title: "Generation failed",
    failed_hint: "Try again; if it keeps failing, check the AI model configuration.",
    retry: "Retry",
    stop: "Stop",
    refill: "Fill in again",
    restored: "Your original content is back",
    understanding: "Reading your question…",
    verified_by: "Checked by: {{detail}}",
    first_placeholder: "What do you want to see?",
    answer_placeholder: "Answer the question above…",
    timeout: '시간이 초과되었습니다. 다시 시도하세요',
    stopped: "Stopped",
    stopped_hint: "Stopped. The field above is unchanged.",
    copy: "Copy",
    field_changed: "The field has been edited",
    timeout_title: "{{minutes}} minutes with no result",
    unreachable_title: "Cannot reach the AI service",
    unreachable_hint: "Check the network and try again.",
    no_model_hint: "No AI model is available. Ask an administrator to add or enable one.",
    example_fallback: "CPU usage per host",
    unchanged: "Same as what the field already held — nothing changed",
    no_context: "Select a data source first",

  },
};

export default ko_KR;
