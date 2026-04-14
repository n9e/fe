export enum EMode {
  CurrentChat = 'current_chat',
  NewChat = 'new_chat',
  ChatHistory = 'chat_history',
  KnowledgeBase = 'knowledge_base',
  KnowledgeBaseAdd = 'knowledge_base_add',
  KnowledgeBaseEdit = 'knowledge_base_edit',
}

export enum EPageType {
  FiremapHomepage = 'firemap_homepage',
  FiremapLevel2 = 'firemap_level2',
  FiremapFunction = 'firemap_function',
  FiremapSystem = 'firemap_system',
  Dashboards = 'dashboards',
  AlertHistory = 'alert_history',
  AlertActive = 'active_alert',
  SloList = 'slo_list',
  SloDetail = 'slo_detail',
}

export const aiChatWhiteList = [
  { path: '/firemap', pageType: EPageType.FiremapHomepage },
  { path: '/firemap/:type/:id', pageType: EPageType.FiremapLevel2 },
  { path: '/firemap/n', pageType: EPageType.FiremapLevel2 },
  { path: '/dashboards', pageType: EPageType.Dashboards },
  { path: '/dashboards/:id', pageType: EPageType.Dashboards },
  { path: '/alert-his-events', pageType: EPageType.AlertHistory },
  { path: '/alert-his-events/:eventId', pageType: EPageType.AlertHistory },
  { path: '/alert-cur-events', pageType: EPageType.AlertActive },
  { path: '/firemap/slo', pageType: EPageType.SloList },
  { path: '/firemap/slo/detail/:id', pageType: EPageType.SloDetail },
];
