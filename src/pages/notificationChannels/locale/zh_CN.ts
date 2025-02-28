const zh_CN = {
  title: '通知媒介',
  basic_configuration: '基础配置',
  ident_tip: '系统中用于识别该通知媒介的标识码，一般为英文、数字或下划线组合，不可重复',
  note_tip: '可填写对该通知媒介的补充说明或使用场景，方便后续维护或协作时查看',
  enable_tip: '是否启用此通知媒介的配置。关闭后，该配置将暂时失效，不会再发送通知，通知规则的媒介选择中，也会隐藏此通知媒介',
  variable_configuration: {
    title: '变量配置',
    contact_key: '联系方式',
    contact_key_tip: '选择通知发送的目标类型，如“Phone”表示通过电话、短信等方式进行发送，可以到联系方式管理页面添加新的联系方式',
    params: {
      title: '参数配置',
      title_tip:
        '可在此处设置该通知媒介所需的自定义参数（如钉钉机器人 Token、API Key 等），并为其指定别名。这样就能让同一个通知媒介模板在不同通知规则中使用不同的参数值（例如不同的钉钉机器人 Token），实现灵活发送到不同接收对象或场景',
      key: '参数标识',
      key_required: '参数标识不能为空',
      cname: '别名',
      cname_required: '别名不能为空',
    },
  },
  request_configuration: {
    http: 'HTTP 配置',
    smtp: 'SMTP 配置',
    script: '脚本配置',
    flashduty: 'FlashDuty 配置',
  },
  request_type: '发送类型',
  http_request_config: {
    title: 'HTTP',
    url: 'URL',
    url_tip: '接收通知请求的目标地址，例如 Webhook 地址或自建服务接口',
    method: '请求方法',
    header: '请求头',
    header_tip: '需要在请求中附带的自定义 Header 参数，如认证信息或数据格式声明',
    header_key: '参数名',
    header_value: '参数值',
    timeout: '超时时间 (单位: 毫秒)',
    concurrency: '并发数',
    concurrency_tip: '同时发起的最大并行请求数。适当增大可提高发送效率，但需注意目标服务的处理能力',
    retry_times: '重试次数',
    retry_interval: '重试间隔 (单位: 毫秒)',
    insecure_skip_verify: '跳过证书验证',
    proxy: '代理',
    proxy_tip: '当系统需要通过特定代理服务器进行外部 HTTP 请求时，可在此处填写代理地址和端口',
    params: '请求参数',
    params_key: '参数名',
    params_value: '参数值',
    body: '请求体',
  },
  smtp_request_config: {
    title: 'SMTP',
    host: '服务器',
    host_tip: '填写 SMTP 服务器的域名或 IP 地址，例如 smtp.example.com，用于发送邮件',
    port: '端口',
    port_tip: 'SMTP 服务器的端口号。常见端口如 25、465（SSL）、587（STARTTLS）；请与提供方确认正确端口',
    username: '用户名',
    username_tip: '登录 SMTP 服务器所需的用户名，通常是邮箱地址或账号',
    password: '密码',
    password_tip: '对应 SMTP 用户名的登录密码或授权码，建议使用授权码以增强安全性',
    from: '发件人',
    from_tip: '邮件中显示的发件人名称或邮箱别名，可以让收件人更好识别邮件来源',
    insecure_skip_verify: '跳过证书验证',
    insecure_skip_verify_tip: '若启用，则忽略对 SMTP 服务器 SSL 证书的校验，多用于测试或自签名证书环境；生产环境建议关闭',
    batch: '批量发送',
    batch_tip: '在通知时，可同时发送的邮件最大数量，避免单次发送过多导致延迟或被服务器拒绝',
  },
  script_request_config: {
    title: '脚本',
    script: {
      option: '使用脚本',
      label: '脚本内容',
    },
    path: {
      option: '使用路径',
      label: '文件路径',
    },
    timeout: '超时时间 (单位: 毫秒)',
  },
  flashduty_request_config: {
    title: 'FlashDuty',
    integration_url: 'URL',
    integration_url_tip: '此处填写的是 Flashduty 集成中心创建的集成地址，可以到 https://console.flashcat.cloud/settings/source/alert/add/n9e 去创建',
    proxy: '代理',
    proxy_tip: '当发送给 duty 消息时，需要通过特定代理服务器进行外部 HTTP 请求时，可在此处填写代理地址和端口',
  },
};
export default zh_CN;
