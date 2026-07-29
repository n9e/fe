/**
 * 采集组件目录：向导的全部组件均由这份数据驱动，新增组件 = 加一条数据。
 *
 * 两种形态：
 * - 带 fields 的组件渲染结构化表单（多实例），由 buildToml 生成配置；
 * - 不带 fields 的组件进入模板编辑模式，初始内容取
 *   public/n9e-collect-templates/<name>.toml（scripts/sync_collect_templates.sh
 *   从 categraf 源码同步，目录必须是它产出文件的子集，否则运行时 404）。
 */

export type CollectCategory = 'db' | 'middleware' | 'web' | 'net' | 'host' | 'other';

export const COLLECT_CATEGORIES: CollectCategory[] = ['db', 'middleware', 'web', 'net', 'host', 'other'];

export interface CollectField {
  /** [[instances]] 内的 toml 键名；label 取 i18n collect.fields.<key>，缺省回退 key 本身 */
  key: string;
  type: 'string' | 'password' | 'number' | 'boolean' | 'stringArray';
  required?: boolean;
  /** 地址类示例不翻译，直接写字面量 */
  placeholder?: string;
  /** i18n 后缀：collect.tips.<tip> */
  tip?: string;
  default?: string | number | boolean;
}

export interface CollectComponent {
  /** categraf 插件名，同时是 conf/input.<name>/ 目录名与模板文件名 */
  name: string;
  /** 展示名（品牌名，不翻译） */
  label: string;
  category: CollectCategory;
  /** 集成中心组件 ident（/api/n9e/builtin-components），用于解析 logo；解析不到回退分类图标 */
  builtinIdent?: string;
  /** 有 fields 即结构化表单，否则模板编辑模式 */
  fields?: CollectField[];
  /** 这些字段至少填一个（如 procstat 的多种进程匹配方式） */
  atLeastOne?: string[];
  /** 每个 instance 固定附加的键值（如 mongodb 的 collect_all） */
  instanceStatics?: Record<string, string | number | boolean>;
  /**
   * 验证指标名前缀，缺省取 name；null 表示无法用固定指标验证（exec 自定义脚本、
   * prometheus 抓取保留原名等），验证步骤降级为跳转即时查询
   */
  metricPrefix?: string | null;
  /**
   * 验证用的代表性指标（精确名，如 mysql_up）。有值时检测查询用精确匹配，
   * 代价远低于 __name__ 前缀正则展开全部序列；未定义则回退前缀正则。
   * 只填从 categraf 源码/内置仪表盘确认过、插件每轮必推的指标。
   */
  verifyMetric?: string;
}

/** 组件卡片上的模板文件地址（public 目录运行时 fetch，与 DocumentDrawer 同一套路） */
export function getTemplateUrl(name: string): string {
  return `/n9e-collect-templates/${name}.toml`;
}

const instanceLabelField: CollectField = { key: 'labels.instance', type: 'string', tip: 'instance_label', placeholder: 'myapp-10.1.1.1:3306' };

export const CATALOG: CollectComponent[] = [
  // ------------------------------------------------------------ 数据库 -----
  {
    name: 'mysql',
    label: 'MySQL',
    category: 'db',
    builtinIdent: 'MySQL',
    verifyMetric: 'mysql_up',
    fields: [
      { key: 'address', type: 'string', required: true, placeholder: '127.0.0.1:3306' },
      { key: 'username', type: 'string', placeholder: 'root' },
      { key: 'password', type: 'password' },
      { key: 'extra_status_metrics', type: 'boolean', default: true },
      instanceLabelField,
    ],
  },
  {
    name: 'redis',
    label: 'Redis',
    category: 'db',
    builtinIdent: 'Redis',
    verifyMetric: 'redis_up',
    fields: [
      { key: 'address', type: 'string', required: true, placeholder: '127.0.0.1:6379' },
      { key: 'username', type: 'string' },
      { key: 'password', type: 'password' },
      instanceLabelField,
    ],
  },
  {
    name: 'postgresql',
    label: 'PostgreSQL',
    category: 'db',
    builtinIdent: 'PostgreSQL',
    verifyMetric: 'postgresql_up',
    fields: [
      { key: 'address', type: 'string', required: true, placeholder: 'host=127.0.0.1 port=5432 user=postgres password=*** sslmode=disable', tip: 'postgresql_address' },
      instanceLabelField,
    ],
  },
  {
    name: 'mongodb',
    label: 'MongoDB',
    category: 'db',
    builtinIdent: 'MongoDB',
    verifyMetric: 'mongodb_up',
    fields: [
      { key: 'mongodb_uri', type: 'string', required: true, placeholder: 'mongodb://127.0.0.1:27017' },
      { key: 'username', type: 'string' },
      { key: 'password', type: 'password' },
      { key: 'labels.instance', type: 'string', required: true, tip: 'instance_label', placeholder: 'mongo-cluster-01' },
    ],
    instanceStatics: { collect_all: true, compatible_mode: true },
  },
  {
    name: 'elasticsearch',
    label: 'Elasticsearch',
    category: 'db',
    builtinIdent: 'Elasticsearch',
    verifyMetric: 'elasticsearch_up',
    fields: [
      { key: 'servers', type: 'stringArray', required: true, placeholder: 'http://127.0.0.1:9200' },
      { key: 'username', type: 'string', placeholder: 'elastic' },
      { key: 'password', type: 'password' },
      instanceLabelField,
    ],
    instanceStatics: { cluster_health: true, cluster_stats: true, all_nodes: true, http_timeout: '10s' },
  },
  { name: 'clickhouse', label: 'ClickHouse', category: 'db', builtinIdent: 'ClickHouse', verifyMetric: 'clickhouse_asynchronous_metrics_uptime' },
  { name: 'sqlserver', label: 'SQL Server', category: 'db', builtinIdent: 'SQLServer', verifyMetric: 'sqlserver_up' },
  { name: 'influxdb', label: 'InfluxDB', category: 'db', verifyMetric: 'influxdb_up' },
  { name: 'greenplum', label: 'Greenplum', category: 'db', builtinIdent: 'Greenplum' },
  { name: 'redis_sentinel', label: 'Redis Sentinel', category: 'db', builtinIdent: 'Redis', verifyMetric: 'redis_sentinel_sentinel_masters' },

  // ------------------------------------------------------------ 中间件 -----
  {
    name: 'kafka',
    label: 'Kafka',
    category: 'middleware',
    builtinIdent: 'Kafka',
    verifyMetric: 'kafka_brokers',
    fields: [
      { key: 'kafka_uris', type: 'stringArray', required: true, placeholder: '127.0.0.1:9092' },
      { key: 'use_sasl', type: 'boolean' },
      { key: 'sasl_username', type: 'string' },
      { key: 'sasl_password', type: 'password' },
      { key: 'labels.cluster', type: 'string', tip: 'cluster_label', placeholder: 'kafka-cluster-01' },
    ],
  },
  {
    name: 'rabbitmq',
    label: 'RabbitMQ',
    category: 'middleware',
    builtinIdent: 'RabbitMQ',
    verifyMetric: 'rabbitmq_scrape_use_seconds',
    fields: [
      { key: 'url', type: 'string', required: true, placeholder: 'http://127.0.0.1:15672', tip: 'rabbitmq_url' },
      { key: 'username', type: 'string', placeholder: 'guest' },
      { key: 'password', type: 'password' },
      instanceLabelField,
    ],
  },
  {
    name: 'zookeeper',
    label: 'ZooKeeper',
    category: 'middleware',
    builtinIdent: 'ZooKeeper',
    metricPrefix: 'zk',
    verifyMetric: 'zk_up',
    fields: [
      { key: 'addresses', type: 'string', required: true, placeholder: '127.0.0.1:2181,127.0.0.1:2182', tip: 'zookeeper_addresses' },
      { key: 'cluster_name', type: 'string', placeholder: 'dev-zk-cluster' },
      instanceLabelField,
    ],
  },
  { name: 'rocketmq_offset', label: 'RocketMQ Offset', category: 'middleware', builtinIdent: 'RocketMQ', verifyMetric: 'rocketmq_offset_diffTopic' },
  { name: 'nats', label: 'NATS', category: 'middleware', verifyMetric: 'nats_connections' },
  { name: 'nsq', label: 'NSQ', category: 'middleware', builtinIdent: 'NSQ', verifyMetric: 'nsq_server_topic_count' },
  { name: 'consul', label: 'Consul', category: 'middleware', builtinIdent: 'Consul', verifyMetric: 'consul_up' },
  { name: 'logstash', label: 'Logstash', category: 'middleware', builtinIdent: 'Logstash', verifyMetric: 'logstash_process_cpu_percent' },

  // ----------------------------------------------------------- Web 服务 ----
  {
    name: 'nginx',
    label: 'Nginx',
    category: 'web',
    builtinIdent: 'Nginx',
    verifyMetric: 'nginx_up',
    fields: [{ key: 'urls', type: 'stringArray', required: true, placeholder: 'http://127.0.0.1/nginx_status', tip: 'nginx_urls' }],
  },
  {
    name: 'tomcat',
    label: 'Tomcat',
    category: 'web',
    builtinIdent: 'Tomcat',
    verifyMetric: 'tomcat_up',
    fields: [
      { key: 'url', type: 'string', required: true, placeholder: 'http://127.0.0.1:8080/manager/status/all?XML=true', tip: 'tomcat_url' },
      { key: 'username', type: 'string', placeholder: 'tomcat' },
      { key: 'password', type: 'password' },
      instanceLabelField,
    ],
  },
  { name: 'apache', label: 'Apache', category: 'web', builtinIdent: 'Apache', verifyMetric: 'apache_up' },
  { name: 'tengine', label: 'Tengine', category: 'web', verifyMetric: 'tengine_req_total' },
  { name: 'nginx_upstream_check', label: 'Nginx Upstream Check', category: 'web', builtinIdent: 'Nginx', verifyMetric: 'nginx_upstream_check_status_code' },
  { name: 'phpfpm', label: 'PHP-FPM', category: 'web', builtinIdent: 'PHP', verifyMetric: 'phpfpm_accepted_conn' },
  { name: 'haproxy', label: 'HAProxy', category: 'web', builtinIdent: 'HAProxy', verifyMetric: 'haproxy_scrape_use_seconds' },
  { name: 'traffic_server', label: 'Traffic Server', category: 'web' },
  { name: 'jenkins', label: 'Jenkins', category: 'web', builtinIdent: 'Jenkins', verifyMetric: 'jenkins_up' },

  // ----------------------------------------------------------- 网络探测 ----
  {
    name: 'ping',
    label: 'Ping',
    category: 'net',
    builtinIdent: 'Ping',
    verifyMetric: 'ping_result_code',
    fields: [{ key: 'targets', type: 'stringArray', required: true, placeholder: '10.4.5.6' }],
  },
  {
    name: 'net_response',
    label: 'TCP/UDP Probe',
    category: 'net',
    builtinIdent: 'Net_Response',
    verifyMetric: 'net_response_result_code',
    fields: [
      { key: 'targets', type: 'stringArray', required: true, placeholder: '127.0.0.1:22' },
      { key: 'timeout', type: 'string', placeholder: '1s' },
    ],
  },
  {
    name: 'http_response',
    label: 'HTTP Probe',
    category: 'net',
    builtinIdent: 'HTTP_Response',
    verifyMetric: 'http_response_result_code',
    fields: [
      { key: 'targets', type: 'stringArray', required: true, placeholder: 'https://www.example.com' },
      { key: 'expect_response_status_codes', type: 'string', placeholder: '200|301', tip: 'expect_status_codes' },
    ],
  },
  {
    name: 'dns_query',
    label: 'DNS Query',
    category: 'net',
    builtinIdent: 'Dns_Query',
    verifyMetric: 'dns_query_result_code',
    fields: [
      { key: 'servers', type: 'stringArray', required: true, placeholder: '8.8.8.8' },
      { key: 'domains', type: 'stringArray', placeholder: 'www.example.com' },
      { key: 'record_type', type: 'string', placeholder: 'A' },
    ],
  },
  { name: 'x509_cert', label: 'TLS Cert', category: 'net', verifyMetric: 'x509_cert_verification_code' },
  { name: 'whois', label: 'Whois', category: 'net', builtinIdent: 'Whois', verifyMetric: 'whois_domain_expirationdate' },
  { name: 'ldap', label: 'LDAP', category: 'net', builtinIdent: 'Ldap', metricPrefix: null },
  { name: 'bind', label: 'BIND DNS', category: 'net', builtinIdent: 'Bind' },

  // ---------------------------------------------------------- 主机进程 -----
  {
    name: 'procstat',
    label: 'Process',
    category: 'host',
    builtinIdent: 'Procstat',
    verifyMetric: 'procstat_lookup_count',
    atLeastOne: ['search_exec_substring', 'search_cmdline_substring'],
    fields: [
      { key: 'search_exec_substring', type: 'string', placeholder: 'nginx', tip: 'procstat_exec' },
      { key: 'search_cmdline_substring', type: 'string', placeholder: 'n9e server', tip: 'procstat_cmdline' },
      { key: 'search_user', type: 'string' },
    ],
    instanceStatics: { gather_total: true },
  },
  {
    name: 'exec',
    label: 'Exec Scripts',
    category: 'host',
    builtinIdent: 'Exec',
    metricPrefix: null,
    fields: [
      { key: 'commands', type: 'stringArray', required: true, placeholder: '/opt/categraf/scripts/*.sh', tip: 'exec_commands' },
      { key: 'timeout', type: 'number', placeholder: '5' },
      { key: 'data_format', type: 'string', default: 'influx', tip: 'exec_data_format' },
    ],
  },
  { name: 'docker', label: 'Docker', category: 'host', builtinIdent: 'Docker', verifyMetric: 'docker_up' },
  { name: 'cadvisor', label: 'cAdvisor', category: 'host', builtinIdent: 'cAdvisor', metricPrefix: 'container' },
  { name: 'kubernetes', label: 'Kubelet', category: 'host', builtinIdent: 'Kubernetes', metricPrefix: null },
  { name: 'systemd', label: 'Systemd', category: 'host', builtinIdent: 'Systemd', verifyMetric: 'systemd_system_running' },
  { name: 'supervisor', label: 'Supervisor', category: 'host' },
  { name: 'filecount', label: 'File Count', category: 'host', builtinIdent: 'Filecount', verifyMetric: 'filecount_count' },
  { name: 'iptables', label: 'iptables', category: 'host' },
  { name: 'ethtool', label: 'ethtool', category: 'host' },
  { name: 'nfsclient', label: 'NFS Client', category: 'host', builtinIdent: 'NFSClient' },
  { name: 'smart', label: 'Disk SMART', category: 'host', builtinIdent: 'SMART' },
  { name: 'nvidia_smi', label: 'NVIDIA GPU', category: 'host', builtinIdent: 'NVIDIA', verifyMetric: 'nvidia_smi_scraper_up' },
  { name: 'netstat_filter', label: 'Netstat Filter', category: 'host', builtinIdent: 'Netstat_Filter', verifyMetric: 'netstat_filter_tcp_established' },
  { name: 'arp_packet', label: 'ARP Packet', category: 'host' },
  { name: 'keepalived', label: 'Keepalived', category: 'host', verifyMetric: 'keepalived_up' },
  { name: 'chrony', label: 'Chrony', category: 'host' },
  { name: 'ntp', label: 'NTP', category: 'host', verifyMetric: 'ntp_offset_ms' },
  { name: 'mtail', label: 'mtail', category: 'host', builtinIdent: 'Mtail', metricPrefix: null },

  // ------------------------------------------------------------- 其他 ------
  { name: 'prometheus', label: 'Prometheus Scrape', category: 'other', builtinIdent: 'Prometheus', metricPrefix: null },
];
