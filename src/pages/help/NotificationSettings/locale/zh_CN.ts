const zh_CN = {
  title: '通知设置',
  webhooks: {
    title: '回调地址',
    enable: '启用',
    note: '备注',
    url: 'URL',
    timeout: '超时 (单位: s)',
    basic_auth_user: '用户名 (Basic Auth)',
    basic_auth_password: '密码 (Basic Auth)',
    skip_verify: '跳过 SSL 验证',
    add: '添加',
    help: `
      尊敬的夜莺老铁，您好，如果您想把夜莺告警事件全部转发到另一个平台处理，可以通过这里的全局回调地址来实现。
      <br />
      <br />
      近期快猫团队提供的事件OnCall产品FlashDuty也开始公测了，欢迎体验，把各个监控系统的告警事件统一推给FlashDuty，享受告警聚合降噪、排班、认领、升级、协同处理一站式体验。
      <br />
      <br />
      <a href='https://console.flashcat.cloud/?from=n9e' target='_blank'>
        免费体验地址
      </a>
    `,
  },
  script: {
    title: '通知脚本',
    enable: '启用',
    timeout: '超时 (单位: s)',
    type: ['使用脚本', '使用路径'],
    path: '文件路径',
    content: '脚本内容',
  },
  channels: {
    title: '通知媒介',
    name: '名称',
    ident: '标识',
    ident_msg1: '标识只能包含字母、数字、下划线和中划线',
    ident_msg2: '标识已存在',
    hide: '隐藏',
    add: '添加',
    add_title: '添加通知媒介',
    edit_title: '编辑通知媒介',
  },
  contacts: {
    title: '联系方式',
    add_title: '添加联系方式',
    edit_title: '编辑联系方式',
  },
  smtp: {
    title: 'SMTP 设置',
  },
  ibex: {
    title: '自愈配置',
  },
};
export default zh_CN;
