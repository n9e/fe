import { FormValues } from './types';

export type MCPTemplateCategory = 'observability' | 'devtools' | 'pm' | 'deploy' | 'cloud' | 'data' | 'docs';

export interface MCPTemplate {
  /** 稳定的唯一标识，用于渲染 key 和选中态 */
  key: string;
  /** 模板展示名称（专有名词，不做多语言） */
  name: string;
  /** 卡片上展示的简短英文描述（技术描述，不做多语言） */
  description: string;
  /** 官方品牌 logo 的本地路径（随前端打包，离线可用）；无官方图标时留空，回退到 icon */
  logo?: string;
  /** 无 logo 时的 emoji 兜底图标 */
  icon?: string;
  /** 分类 key，通过 `template.category.<category>` 映射为多语言标签 */
  category: MCPTemplateCategory;
  /** 鉴权方式；OAuth-only 的服务标 'oauth'，选中后表单预置为 OAuth 授权流程 */
  authMode?: 'oauth';
  /** 选中模板后回填到新增表单的字段值 */
  values: Pick<FormValues, 'name' | 'description' | 'url' | 'headers'>;
}

export const MCP_TEMPLATE_CATEGORIES: MCPTemplateCategory[] = ['observability', 'devtools', 'pm', 'deploy', 'cloud', 'data', 'docs'];

const LOGO = (name: string) => `/image/logos/mcp/${name}.svg`;

// 前端硬编码的 MCP Server 模板列表。仅收录「远程 MCP Server」，与表单能力保持一致。
// 每个 URL / 鉴权头均来自各家官方文档核实（详见 PR 说明），非猜测：
//   - OAuth-only 的服务不预填静态鉴权头（如 Notion / Asana / Miro / Vercel 等）；
//   - 自托管 / 分区域 / 分账号的服务用 <YOUR_xxx> 占位，需用户改成真实值；
//   - 带 <YOUR_TOKEN> 等占位的 header 需用户填入真实凭据。
// 新增或调整模板时，直接编辑本数组即可。
export const MCP_TEMPLATES: MCPTemplate[] = [
  // ---------- Observability ----------
  {
    key: 'grafana',
    name: 'Grafana',
    description: 'Query Grafana dashboards, datasources, alerts and incidents.',
    logo: LOGO('grafana'),
    category: 'observability',
    authMode: 'oauth',
    values: {
      name: 'Grafana',
      description: 'Grafana Cloud hosted MCP server (OAuth-only; pick your stack during authorization)',
      url: 'https://mcp.grafana.com/mcp',
    },
  },
  {
    key: 'sentry',
    name: 'Sentry',
    description: 'Query Sentry issues, errors, traces and releases.',
    logo: LOGO('sentry'),
    category: 'observability',
    values: {
      name: 'Sentry',
      description: 'Sentry hosted MCP server (static tokens use the Sentry-Bearer scheme; plain Bearer is reserved for OAuth)',
      url: 'https://mcp.sentry.dev/mcp',
      headers: [{ key: 'Authorization', value: 'Sentry-Bearer <YOUR_SENTRY_TOKEN>' }],
    },
  },
  {
    key: 'datadog',
    name: 'Datadog',
    description: 'Query Datadog metrics, monitors, logs, APM traces and incidents.',
    logo: LOGO('datadog'),
    category: 'observability',
    values: {
      name: 'Datadog',
      description: 'Datadog hosted MCP server (US1; EU: mcp.datadoghq.eu). Alt: Authorization: Bearer <personal access token>',
      url: 'https://mcp.datadoghq.com/v1/mcp',
      headers: [
        { key: 'DD_API_KEY', value: '<YOUR_DD_API_KEY>' },
        { key: 'DD_APPLICATION_KEY', value: '<YOUR_DD_APP_KEY>' },
      ],
    },
  },
  {
    key: 'newrelic',
    name: 'New Relic',
    description: 'Query New Relic APM, logs, metrics and account telemetry.',
    logo: LOGO('newrelic'),
    category: 'observability',
    values: {
      name: 'New Relic',
      description: 'New Relic hosted MCP server (US region; EU: mcp.eu.newrelic.com)',
      url: 'https://mcp.newrelic.com/mcp/',
      headers: [{ key: 'Api-Key', value: '<YOUR_NEWRELIC_USER_KEY>' }],
    },
  },
  {
    key: 'dynatrace',
    name: 'Dynatrace',
    description: 'Query Dynatrace Davis problems, logs, metrics and traces.',
    logo: LOGO('dynatrace'),
    category: 'observability',
    values: {
      name: 'Dynatrace',
      description: 'Dynatrace MCP gateway — replace <YOUR_ENV_ID> with your environment id',
      url: 'https://<YOUR_ENV_ID>.apps.dynatrace.com/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_PLATFORM_TOKEN>' }],
    },
  },
  {
    key: 'honeycomb',
    name: 'Honeycomb',
    description: 'Query Honeycomb events, queries, boards and alerts.',
    icon: '🍯',
    category: 'observability',
    values: {
      name: 'Honeycomb',
      description: 'Honeycomb hosted MCP server (US region; EU: mcp.eu1.honeycomb.io)',
      url: 'https://mcp.honeycomb.io/mcp',
      headers: [{ key: 'Authorization', value: 'Bearer <KEY_ID>:<SECRET_KEY>' }],
    },
  },
  {
    key: 'polarsignals',
    name: 'Polar Signals',
    description: 'Analyze continuous-profiling data (CPU / memory) from Polar Signals.',
    icon: '🔬',
    category: 'observability',
    values: {
      name: 'Polar Signals',
      description: 'Polar Signals Cloud hosted MCP server',
      url: 'https://api.polarsignals.com/api/mcp/',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_TOKEN>' }],
    },
  },
  {
    key: 'embrace',
    name: 'Embrace',
    description: 'Query Embrace mobile/web crash, performance and user telemetry.',
    icon: '📱',
    category: 'observability',
    values: {
      name: 'Embrace',
      description: 'Embrace hosted MCP server (service-account bearer token)',
      url: 'https://mcp.embrace.io/mcp',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_TOKEN>' }],
    },
  },

  // ---------- Development & code ----------
  {
    key: 'github',
    name: 'GitHub',
    description: 'Read and act on repositories, issues, pull requests and Actions.',
    logo: LOGO('github'),
    category: 'devtools',
    values: {
      name: 'GitHub',
      description: 'GitHub hosted remote MCP server',
      url: 'https://api.githubcopilot.com/mcp/',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_GITHUB_PAT>' }],
    },
  },
  {
    key: 'gitlab',
    name: 'GitLab',
    description: 'Query and act on merge requests, issues and pipelines.',
    logo: LOGO('gitlab'),
    category: 'devtools',
    authMode: 'oauth',
    values: {
      name: 'GitLab',
      description: 'GitLab MCP server (OAuth-only; Beta, Premium/Ultimate. Self-managed: replace the host)',
      url: 'https://gitlab.com/api/v4/mcp',
    },
  },
  {
    key: 'atlassian',
    name: 'Atlassian (Rovo)',
    description: 'Search and update Jira issues and Confluence pages.',
    logo: LOGO('atlassian'),
    category: 'devtools',
    authMode: 'oauth',
    values: {
      name: 'Atlassian',
      description: 'Atlassian Rovo hosted MCP server (OAuth; API-token auth also available if org-enabled)',
      url: 'https://mcp.atlassian.com/v1/mcp',
    },
  },
  {
    key: 'postman',
    name: 'Postman',
    description: 'Build and run API workflows over your Postman collections and specs.',
    logo: LOGO('postman'),
    category: 'devtools',
    values: {
      name: 'Postman',
      description: 'Postman hosted MCP server (EU region: mcp.eu.postman.com)',
      url: 'https://mcp.postman.com/mcp',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_POSTMAN_API_KEY>' }],
    },
  },
  {
    key: 'buildkite',
    name: 'Buildkite',
    description: 'Inspect CI/CD pipelines, builds, jobs and logs.',
    logo: LOGO('buildkite'),
    category: 'devtools',
    values: {
      name: 'Buildkite',
      description: 'Buildkite hosted MCP server (token endpoint; OAuth endpoint: /mcp)',
      url: 'https://mcp.buildkite.com/direct',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_BUILDKITE_TOKEN>' }],
    },
  },
  {
    key: 'jenkins',
    name: 'Jenkins',
    description: 'Trigger and inspect Jenkins jobs and builds.',
    logo: LOGO('jenkins'),
    category: 'devtools',
    values: {
      name: 'Jenkins',
      description: 'Self-hosted Jenkins MCP Server plugin — replace <YOUR_JENKINS_HOST> (needs Jenkins 2.533+)',
      url: 'https://<YOUR_JENKINS_HOST>/mcp-server/mcp',
      headers: [{ key: 'Authorization', value: 'Basic <base64(user:api_token)>' }],
    },
  },
  {
    key: 'semgrep',
    name: 'Semgrep',
    description: 'Scan code for security issues with Semgrep static analysis.',
    icon: '🔍',
    category: 'devtools',
    authMode: 'oauth',
    values: {
      name: 'Semgrep',
      description: 'Semgrep hosted MCP server (OAuth login; officially flagged experimental)',
      url: 'https://mcp.semgrep.ai/mcp',
    },
  },

  // ---------- Project management & collaboration ----------
  {
    key: 'linear',
    name: 'Linear',
    description: 'Find, create and update Linear issues, projects and comments.',
    logo: LOGO('linear'),
    category: 'pm',
    values: {
      name: 'Linear',
      description: 'Linear hosted MCP server',
      url: 'https://mcp.linear.app/mcp',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_LINEAR_API_KEY>' }],
    },
  },
  {
    key: 'notion',
    name: 'Notion',
    description: 'Search, read and write pages and databases in Notion.',
    logo: LOGO('notion'),
    category: 'pm',
    authMode: 'oauth',
    values: {
      name: 'Notion',
      description: 'Notion hosted MCP server (OAuth-only; login in your MCP client)',
      url: 'https://mcp.notion.com/mcp',
    },
  },
  {
    key: 'asana',
    name: 'Asana',
    description: 'Read and act on Asana tasks, projects and workspace data.',
    logo: LOGO('asana'),
    category: 'pm',
    authMode: 'oauth',
    values: {
      name: 'Asana',
      description: 'Asana hosted MCP server v2 (OAuth-only; login in your MCP client)',
      url: 'https://mcp.asana.com/v2/mcp',
    },
  },
  {
    key: 'airtable',
    name: 'Airtable',
    description: 'Read and write records, tables and bases in Airtable.',
    logo: LOGO('airtable'),
    category: 'pm',
    values: {
      name: 'Airtable',
      description: 'Airtable hosted MCP server',
      url: 'https://mcp.airtable.com/mcp',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_AIRTABLE_PAT>' }],
    },
  },
  {
    key: 'miro',
    name: 'Miro',
    description: 'Read, search and create content on Miro boards.',
    logo: LOGO('miro'),
    category: 'pm',
    authMode: 'oauth',
    values: {
      name: 'Miro',
      description: 'Miro hosted MCP server (OAuth-only; login in your MCP client)',
      url: 'https://mcp.miro.com/',
    },
  },
  {
    key: 'monday',
    name: 'monday.com',
    description: 'Read and update boards, items and data in monday.com.',
    icon: '📋',
    category: 'pm',
    values: {
      name: 'monday.com',
      description: 'monday.com hosted MCP server',
      url: 'https://mcp.monday.com/mcp',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_MONDAY_API_TOKEN>' }],
    },
  },

  // ---------- Deployment & infrastructure ----------
  {
    key: 'vercel',
    name: 'Vercel',
    description: 'Access Vercel docs, deployments, logs, projects and teams.',
    logo: LOGO('vercel'),
    category: 'deploy',
    authMode: 'oauth',
    values: {
      name: 'Vercel',
      description: 'Vercel hosted MCP server (OAuth-only; login in your MCP client)',
      url: 'https://mcp.vercel.com',
    },
  },
  {
    key: 'netlify',
    name: 'Netlify',
    description: 'Manage and deploy Netlify sites, deploys and env variables.',
    logo: LOGO('netlify'),
    category: 'deploy',
    authMode: 'oauth',
    values: {
      name: 'Netlify',
      description: 'Netlify hosted MCP server (OAuth-only; login in your MCP client)',
      url: 'https://netlify-mcp.netlify.app/mcp',
    },
  },
  {
    key: 'cloudflare',
    name: 'Cloudflare Docs',
    description: 'Fetch up-to-date Cloudflare product documentation.',
    logo: LOGO('cloudflare'),
    category: 'deploy',
    values: {
      name: 'Cloudflare Docs',
      description: 'Cloudflare Documentation MCP server (no auth). Other CF servers: observability, radar, bindings',
      url: 'https://docs.mcp.cloudflare.com/mcp',
    },
  },
  {
    key: 'railway',
    name: 'Railway',
    description: 'Manage Railway projects, services, deployments and variables.',
    logo: LOGO('railway'),
    category: 'deploy',
    authMode: 'oauth',
    values: {
      name: 'Railway',
      description: 'Railway hosted MCP server (OAuth-only; login in your MCP client)',
      url: 'https://mcp.railway.com',
    },
  },
  {
    key: 'render',
    name: 'Render',
    description: 'Manage Render services, databases, deploys and logs.',
    logo: LOGO('render'),
    category: 'deploy',
    values: {
      name: 'Render',
      description: 'Render hosted MCP server',
      url: 'https://mcp.render.com/mcp',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_RENDER_API_KEY>' }],
    },
  },
  {
    key: 'pulumi',
    name: 'Pulumi',
    description: 'Manage Pulumi IaC stacks, resources and Registry lookups.',
    logo: LOGO('pulumi'),
    category: 'deploy',
    authMode: 'oauth',
    values: {
      name: 'Pulumi',
      description: 'Pulumi hosted MCP server (OAuth-only; login in your MCP client)',
      url: 'https://mcp.ai.pulumi.com/mcp',
    },
  },
  {
    key: 'port',
    name: 'Port',
    description: 'Query your Port developer portal catalog, scorecards and actions.',
    icon: '🚢',
    category: 'deploy',
    values: {
      name: 'Port',
      description: 'Port hosted MCP server (EU region; US: mcp.us.port.io/v1)',
      url: 'https://mcp.port.io/v1',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_PORT_ACCESS_TOKEN>' }],
    },
  },

  // ---------- Public cloud (resource / OpenAPI management) ----------
  {
    key: 'tencent-cloud',
    name: 'Tencent Cloud (CVM)',
    description: 'Manage Tencent Cloud CVM servers and related VPC / COS resources.',
    logo: '/image/logos/tencentcloud.png',
    category: 'cloud',
    values: {
      name: 'Tencent Cloud',
      description: 'CVM resource MCP — generate a per-account SSE URL in the Tencent Cloud MCP marketplace (the token is embedded in the URL path)',
      url: 'https://mcp-api.tencent-cloud.com/sse/<YOUR_TOKEN>',
    },
  },
  {
    key: 'azure',
    name: 'Azure Resource Manager',
    description: 'Query Azure resources (VMs, VNets, Storage) and deploy ARM templates.',
    icon: '🔷',
    category: 'cloud',
    authMode: 'oauth',
    values: {
      name: 'Azure Resource Manager',
      description: 'Microsoft-hosted ARM MCP (public preview). Entra ID OAuth — the bearer token is short-lived',
      url: 'https://mcp.management.azure.com',
    },
  },
  {
    key: 'gcp',
    name: 'Google Cloud',
    description: 'Manage Compute Engine, Cloud Monitoring, Storage and VPC resources.',
    logo: LOGO('googlecloud'),
    category: 'cloud',
    authMode: 'oauth',
    values: {
      name: 'Google Cloud',
      description: 'Compute Engine MCP (OAuth/IAM only — rejects API keys). Others: monitoring/networkmanagement .googleapis.com/mcp; storage.googleapis.com/storage/mcp',
      url: 'https://compute.googleapis.com/mcp',
    },
  },

  // ---------- Data & database ----------
  {
    key: 'clickhouse',
    name: 'ClickHouse',
    description: 'Run SQL and explore databases on ClickHouse Cloud.',
    logo: LOGO('clickhouse'),
    category: 'data',
    authMode: 'oauth',
    values: {
      name: 'ClickHouse',
      description: 'ClickHouse Cloud hosted MCP server (OAuth-only; login in your MCP client)',
      url: 'https://mcp.clickhouse.cloud/mcp',
    },
  },
  {
    key: 'elasticsearch',
    name: 'Elasticsearch',
    description: 'Search and query Elasticsearch indices via Elastic Agent Builder.',
    logo: LOGO('elasticsearch'),
    category: 'data',
    values: {
      name: 'Elasticsearch',
      description: 'Self-hosted Elastic Agent Builder MCP endpoint — replace <YOUR_KIBANA_URL> (Elastic 9.2+)',
      url: 'https://<YOUR_KIBANA_URL>/api/agent_builder/mcp',
      headers: [{ key: 'Authorization', value: 'ApiKey <YOUR_ELASTIC_API_KEY>' }],
    },
  },
  {
    key: 'snowflake',
    name: 'Snowflake',
    description: 'Query a Snowflake account via Cortex Analyst, Search and Agents.',
    logo: LOGO('snowflake'),
    category: 'data',
    authMode: 'oauth',
    values: {
      name: 'Snowflake',
      description: 'Snowflake managed MCP server (OAuth). Replace account/database/schema/name in the URL',
      url: 'https://<YOUR_ACCOUNT_URL>/api/v2/databases/<database>/schemas/<schema>/mcp-servers/<name>',
    },
  },
  {
    key: 'mongodb',
    name: 'MongoDB',
    description: 'Query and manage MongoDB databases and Atlas clusters.',
    logo: LOGO('mongodb'),
    category: 'data',
    values: {
      name: 'MongoDB',
      description: 'Self-hosted MongoDB MCP server over HTTP — replace <YOUR_HOST>:<PORT> (default transport is stdio)',
      url: 'http://<YOUR_HOST>:<PORT>/mcp',
    },
  },

  // ---------- Docs & knowledge ----------
  {
    key: 'context7',
    name: 'Context7',
    description: 'Fetch up-to-date, version-specific library documentation.',
    icon: '📚',
    category: 'docs',
    values: {
      name: 'Context7',
      description: 'Context7 hosted MCP server (works without a key; API key raises rate limits)',
      url: 'https://mcp.context7.com/mcp',
    },
  },
  {
    key: 'deepwiki',
    name: 'DeepWiki',
    description: 'Ask questions about the docs of any public GitHub repository.',
    icon: '🧭',
    category: 'docs',
    values: {
      name: 'DeepWiki',
      description: 'DeepWiki hosted MCP server (public repos, no auth)',
      url: 'https://mcp.deepwiki.com/mcp',
    },
  },
];
