import {
  CheckCircle,
  Copy,
  ExternalLink,
  Eye,
  Link as LinkIcon,
  Network,
  Pencil,
  Play,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';

import type { RowAction } from './types';

export const actionIconMap = {
  default: CheckCircle,
  edit: Pencil,
  view: Eye,
  settings: Settings,
  access: Network,
  permission: ShieldCheck,
  copy: Copy,
  delete: Trash2,
  run: Play,
  create: Plus,
  search: Search,
  open: ExternalLink,
  link: LinkIcon,
  ai: Sparkles,
};

export type ActionIconName = keyof typeof actionIconMap;

// Fallback icon by action key, used for inline actions that don't set `icon` explicitly.
const fallbackInlineIconMap: Record<string, ActionIconName> = {
  query: 'search',
  trace: 'search',
  executions: 'view',
  execRecord: 'view',
  create: 'create',
  config: 'settings',
  execute: 'run',
  exec: 'run',
  fire: 'run',
  'ai-inspection': 'ai',
};

export function resolveActionIcon(action: RowAction, fallbackToKey = false) {
  const iconName = action.icon ?? (fallbackToKey && action.key ? fallbackInlineIconMap[action.key] : undefined);
  if (iconName) return actionIconMap[iconName];
  return fallbackToKey ? actionIconMap.default : undefined;
}
