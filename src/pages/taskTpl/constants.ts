// 自愈脚本模块的页面级常量：文档地址、告警变量清单、脚本骨架与内置模板库。
// 脚本正文用 Vite 的 ?raw 以纯文本导入，避免在 JS 里对 shell 的 ${} 反复转义。
import SCRIPT_SKELETON from './scriptTemplates/_skeleton.sh?raw';
import t1 from './scriptTemplates/t1_snapshot.sh?raw';
import t2 from './scriptTemplates/t2_disk_usage.sh?raw';
import t3 from './scriptTemplates/t3_proc_port.sh?raw';
import t4 from './scriptTemplates/t4_disk_clean.sh?raw';
import t5 from './scriptTemplates/t5_service_restart.sh?raw';
import t6 from './scriptTemplates/t6_log_truncate.sh?raw';
import t7 from './scriptTemplates/t7_jvm_dump.sh?raw';
import t8 from './scriptTemplates/t8_nginx_reload.sh?raw';

export { SCRIPT_SKELETON };

export const DOC_URL = 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/self-healing/self-healing-script/';

// 脚本模板库暂未开放：入口先隐藏，后续支持时置为 true 即可（组件、模板、脚本均已就位）
export const SCRIPT_TEMPLATES_ENABLED = false;

// 告警上下文变量：alert_* 三个固定注入字段一定有，事件标签（ident 等）因规则而异。
// 说明文案走 i18n（var_panel.desc.<name>）。
export interface AlertVar {
  /** 字段名 */
  name: string;
  /** 面板里展示的示例值 */
  example: string;
  /** 是否一定存在（固定注入字段 = true，事件标签 = false 需脚本兜底） */
  always: boolean;
}

export const ALERT_VARS: AlertVar[] = [
  { name: 'alert_severity', example: '2', always: true },
  { name: 'alert_trigger_value', example: '93.5', always: true },
  { name: 'is_recovered', example: 'false', always: true },
  { name: 'ident', example: 'host-prod-01', always: false },
  { name: '__name__', example: 'cpu_usage_idle', always: false },
];

export type TemplateCategory = 'diagnostic' | 'remediation';
export type TemplateRisk = 'none' | 'medium' | 'high' | 'critical';

export interface ScriptTemplate {
  /** 模板 key，同时是 i18n 前缀 templates.<key>.{title,desc,deps} */
  key: string;
  category: TemplateCategory;
  risk: TemplateRisk;
  /** 完整脚本 = 骨架 + 正文，可直接跑 */
  script: string;
  /** 默认参数（双逗号分隔），留空表示无 */
  args: string;
  /** 默认单机超时（秒） */
  timeout: number;
}

// 拼接：骨架已以「在下面写你的自愈逻辑」注释收尾，正文直接接在后面
const compose = (body: string) => `${SCRIPT_SKELETON}\n${body}`;

export const SCRIPT_TEMPLATES: ScriptTemplate[] = [
  { key: 'snapshot', category: 'diagnostic', risk: 'none', script: compose(t1), args: '', timeout: 60 },
  { key: 'disk_usage', category: 'diagnostic', risk: 'none', script: compose(t2), args: '/', timeout: 120 },
  { key: 'proc_port', category: 'diagnostic', risk: 'none', script: compose(t3), args: '', timeout: 30 },
  { key: 'disk_clean', category: 'remediation', risk: 'medium', script: compose(t4), args: '/var/log,,7,,1', timeout: 120 },
  { key: 'service_restart', category: 'remediation', risk: 'high', script: compose(t5), args: '', timeout: 60 },
  { key: 'log_truncate', category: 'remediation', risk: 'medium', script: compose(t6), args: '/var/log,,1024,,1', timeout: 60 },
  { key: 'jvm_dump', category: 'remediation', risk: 'critical', script: compose(t7), args: ',,/tmp', timeout: 300 },
  { key: 'nginx_reload', category: 'remediation', risk: 'medium', script: compose(t8), args: 'nginx', timeout: 30 },
];
