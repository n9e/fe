const zh_CN = {
  title: '数据源管理',
  search_placeholder: '请输入搜索关键字',
  chooseDataSourceType: '选择数据源类型',
  name: '数据源名称',
  id: '数据源ID',
  description: '备注',
  type: '数据源类型',
  enable: '启用',
  disable: '停用',
  confirm: {
    enable: '确定启用该数据源吗？',
    disable: '确定禁用该数据源吗？',
  },
  success: {
    enable: '启用成功',
    disable: '禁用成功',
  },
  add_title: '创建数据源',
  edit_title: '修改数据源',
  rename_title: '修改数据源名称',
  type_btn_add: '添加',
  default: '设置为默认数据源',
  default_msg: '该数据源类型下的默认集群，网络探测功能采集的时序数据，会上报到此数据源中',
  default_tip: '网络探测功能采集的时序数据，会上报到此数据源中',
  auth: {
    name: '授权',
    'not-support': '暂不支持',
  },
  status: {
    title: '状态',
    enabled: '启用中',
    disabled: '停用中',
  },
  form: {
    other: '其他',
    name: '名称',
    name_msg: '请输入字母/数字/下划线，必须以字母开头',
    name_msg2: '最少输入三位',
    timeout: '超时(单位:ms)',
    auth: '授权',
    username: '用户名',
    password: '密码',
    skip_ssl_verify: '跳过SSL验证',
    yes: '是',
    no: '否',
    headers: '自定义HTTP标头',
    description: '备注',
    cluster: '关联告警引擎集群',
    cluster_tip: '在多个机房的架构下，有时会部署多个告警引擎集群，对应边缘机房的数据源，需要关联相应机房的告警引擎集群，如果只有一个集群，保持默认即可',
    cluster_confirm: '发现您的数据源没有关联告警引擎集群，将无法用来做告警，是否去关联下告警引擎集群？',
    cluster_confirm_ok: '不做关联',
    cluster_confirm_cancel: '去做关联',
    url_no_spaces_msg: 'URL不能包含空格',
    prom: {
      write_addr_tip: '记录规则产生的数据的回写地址，常见时序数据库配置示例',
      read_addr: '时序库内网地址',
      read_addr_tip: '通常用于边缘机房下沉部署告警引擎的场景，如果该字段不为空，n9e-edge 会使用该地址访问时序库，如果该字段为空，n9e-edge 会使用上面的 URL 访问时序库',
      url_tip: '常见时序数据库配置示例（兼容 Prometheus 查询 API）：',
      help_content: '没有部署时序库？可参考 <a>安装手册</a> 安装部署',
      prom_installation_title: '安装手册',
      prom_installation: '到夜莺部署的机器上，执行如下命令，安装 Prometheus 时序库，生产环境，建议部署集群版的 VictoriaMetrics，可参考 <a>官方文档</a>',
    },
    es: {
      version: '版本',
      max_shard: '最大并发分片请求数',
      min_interval: '最小时间间隔(s)',
      min_interval_tip: '按时间间隔自动分组的下限。建议设置为写入频率，例如，如果数据每分钟写入一次，则为1m。',
    },
    jaeger: {
      version: '版本',
    },
    ck: {
      title: '数据库基本信息',
      addr: '数据库地址',
    },
    sls: {
      title: '服务入口',
      endpoint: '访问域名（私网域名/公网域名/跨域域名）',
      access: '授权',
      endpoint_link: '配置说明',
    },
    os: {
      title: 'OpenSearch 详情',
      enable_write_title: '写配置',
      enable_write: '允许写入',
    },
  },
};
export default zh_CN;
