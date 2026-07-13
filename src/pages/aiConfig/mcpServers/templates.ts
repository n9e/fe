import { FormValues } from './types';

export type MCPTemplateCategory = 'observability' | 'code' | 'kb' | 'cicd' | 'cloud' | 'data';

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

export const MCP_TEMPLATE_CATEGORIES: MCPTemplateCategory[] = ['code', 'kb', 'cicd', 'cloud', 'data', 'observability'];

const LOGO = (name: string) => `/image/logos/mcp/${name}.svg`;

// 前端硬编码的 MCP Server 模板列表。仅收录「远程 MCP Server」，与表单能力保持一致。
// 每个 URL / 鉴权头均来自各家官方文档核实（详见 PR 说明），非猜测：
//   - OAuth-only 的服务不预填静态鉴权头（如 Notion / Asana / Miro / Vercel 等）；
//   - 自托管 / 分区域 / 分账号的服务用 <YOUR_xxx> 占位，需用户改成真实值；
//   - 带 <YOUR_TOKEN> 等占位的 header 需用户填入真实凭据。
// 新增或调整模板时，直接编辑本数组即可。
export const MCP_TEMPLATES: MCPTemplate[] = [
  // ---------- Code repositories ----------
  {
    key: 'github',
    name: 'GitHub',
    description: 'Read and act on repositories, issues, pull requests and Actions.',
    logo: LOGO('github'),
    category: 'code',
    values: {
      name: 'GitHub',
      description: 'GitHub hosted remote MCP server (GA; PAT or OAuth 2.1 + PKCE)',
      url: 'https://api.githubcopilot.com/mcp/',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_GITHUB_PAT>' }],
    },
  },
  {
    key: 'gitlab',
    name: 'GitLab',
    description: 'Query and act on merge requests, issues and pipelines.',
    logo: LOGO('gitlab'),
    category: 'code',
    authMode: 'oauth',
    values: {
      name: 'GitLab',
      description: 'GitLab MCP server (OAuth 2.1 with DCR; Beta. Self-managed: replace the host)',
      url: 'https://gitlab.com/api/v4/mcp',
    },
  },
  {
    key: 'bitbucket',
    name: 'Bitbucket',
    description: 'Read and act on Bitbucket repositories, pull requests and pipelines.',
    logo: LOGO('bitbucket'),
    category: 'code',
    values: {
      name: 'Bitbucket',
      description: 'Atlassian Rovo hosted MCP server — Bitbucket tools are API-token only (scoped token; workspace must be linked to an Atlassian org)',
      url: 'https://mcp.atlassian.com/v1/mcp/authv2',
      headers: [{ key: 'Authorization', value: 'Basic <base64(email:api_token)>' }],
    },
  },
  {
    key: 'azure-devops',
    name: 'Azure DevOps',
    description: 'Query work items, repos, pipelines and builds in Azure DevOps.',
    logo: LOGO('azuredevops'),
    category: 'code',
    authMode: 'oauth',
    values: {
      name: 'Azure DevOps',
      description: 'Azure DevOps hosted MCP server (public preview; Entra ID OAuth) — replace <YOUR_ORG> with your organization name',
      url: 'https://mcp.dev.azure.com/<YOUR_ORG>',
    },
  },
  {
    key: 'gitee',
    name: 'Gitee',
    description: 'Manage Gitee repositories, issues and pull requests.',
    logo: LOGO('gitee'),
    category: 'code',
    values: {
      name: 'Gitee',
      description: 'Gitee hosted MCP server — create a personal access token (私人令牌) at gitee.com/profile/personal_access_tokens',
      url: 'https://api.gitee.com/mcp',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_GITEE_TOKEN>' }],
    },
  },
  {
    key: 'alibaba-codeup',
    name: 'Alibaba Cloud Codeup',
    description: 'Manage Codeup repositories, merge requests and Yunxiao work items.',
    logo: LOGO('alibabacloud'),
    category: 'code',
    values: {
      name: 'Alibaba Cloud Codeup',
      description: 'Alibaba Cloud Yunxiao (云效) hosted MCP server — use a Yunxiao personal access token',
      url: 'https://openapi-rdc.aliyuncs.com/ai/mcp',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_YUNXIAO_TOKEN>' }],
    },
  },

  // ---------- Knowledge base ----------
  {
    key: 'feishu',
    name: 'Feishu / Lark',
    description: 'Read and edit Feishu (Lark) cloud docs via the official remote MCP.',
    logo: '/image/logos/feishu.png',
    category: 'kb',
    values: {
      name: 'Feishu',
      description: 'Feishu official remote MCP (Streamable HTTP) — generate a dedicated URL on the Feishu Open Platform; the URL itself is the credential (valid 7 days, re-authorize to renew; cloud-docs only for now)',
      url: 'https://<YOUR_GENERATED_FEISHU_MCP_URL>',
    },
  },
  {
    key: 'dingtalk',
    name: 'DingTalk',
    description: 'Access DingTalk docs, calendar, todo and AI tables via official MCP.',
    logo: '/image/logos/dingtalk.png',
    category: 'kb',
    values: {
      name: 'DingTalk',
      description: 'DingTalk official MCP (streamable-http) — generate a per-service endpoint in the DingTalk MCP marketplace (mcp.dingtalk.com): Docs, Calendar, Contacts, Todo, Group chat, AI Table',
      url: 'https://mcp-gw.dingtalk.com/mserver/<YOUR_SERVER_PATH>',
    },
  },
  {
    key: 'tencent-docs',
    name: 'Tencent Docs',
    description: 'Create, search and edit Tencent Docs online documents.',
    logo: '/image/logos/mcp/tencentdocs.png',
    category: 'kb',
    values: {
      name: 'Tencent Docs',
      description: 'Tencent Docs hosted MCP server — get a per-workspace MCP token (valid 1 year) from the space list page; put the raw token in Authorization (no Bearer prefix)',
      url: 'https://docs.qq.com/openapi/mcp',
      headers: [{ key: 'Authorization', value: '<YOUR_MCP_TOKEN>' }],
    },
  },
  {
    key: 'confluence',
    name: 'Confluence',
    description: 'Search and update Confluence pages and spaces.',
    logo: LOGO('confluence'),
    category: 'kb',
    authMode: 'oauth',
    values: {
      name: 'Confluence',
      description: 'Atlassian Rovo hosted MCP server (OAuth 2.1; legacy SSE endpoint: /v1/sse)',
      url: 'https://mcp.atlassian.com/v1/mcp',
    },
  },
  {
    key: 'notion',
    name: 'Notion',
    description: 'Search, read and write pages and databases in Notion.',
    logo: LOGO('notion'),
    category: 'kb',
    authMode: 'oauth',
    values: {
      name: 'Notion',
      description: 'Notion hosted MCP server (OAuth-only; legacy SSE endpoint: /sse)',
      url: 'https://mcp.notion.com/mcp',
    },
  },
  {
    key: 'microsoft-workiq',
    name: 'Microsoft 365 (Work IQ)',
    description: 'Access SharePoint, OneDrive and M365 content via Work IQ MCP.',
    logo: LOGO('microsoft'),
    category: 'kb',
    authMode: 'oauth',
    values: {
      name: 'Microsoft 365 (Work IQ)',
      description: 'Work IQ SharePoint MCP (preview; Entra ID, needs an M365 Copilot license). Other servers: mcp_OneDriveTools / mcp_WordTools / mcp_M365Copilot',
      url: 'https://agent365.svc.cloud.microsoft/agents/tenants/<YOUR_TENANT_ID>/servers/mcp_SharePointTools',
    },
  },
  {
    key: 'google-drive',
    name: 'Google Drive',
    description: 'Search, read and create files in Google Drive.',
    logo: LOGO('googledrive'),
    category: 'kb',
    authMode: 'oauth',
    values: {
      name: 'Google Drive',
      description: 'Google Workspace hosted MCP server (Developer Preview; OAuth). Gmail / Calendar / Chat / People each have a separate hosted MCP',
      url: 'https://drivemcp.googleapis.com/mcp/v1',
    },
  },
  {
    key: 'guru',
    name: 'Guru',
    description: 'Search and read verified knowledge cards in Guru.',
    logo: '/image/logos/mcp/guru.png',
    category: 'kb',
    values: {
      name: 'Guru',
      description: 'Guru hosted MCP server (HTTP Stream, no SSE; OAuth also supported) — API token uses Basic auth',
      url: 'https://mcp.api.getguru.com/mcp',
      headers: [{ key: 'Authorization', value: 'Basic <base64(email:api_token)>' }],
    },
  },
  {
    key: 'slite',
    name: 'Slite',
    description: 'Search, read and write notes and collections in Slite.',
    logo: '/image/logos/mcp/slite.png',
    category: 'kb',
    authMode: 'oauth',
    values: {
      name: 'Slite',
      description: 'Slite hosted MCP server (OAuth-only; login in your MCP client)',
      url: 'https://api.slite.com/mcp',
    },
  },
  {
    key: 'document360',
    name: 'Document360',
    description: 'Query and manage Document360 knowledge base articles.',
    logo: '/image/logos/mcp/document360.png',
    category: 'kb',
    authMode: 'oauth',
    values: {
      name: 'Document360',
      description: 'Document360 hosted MCP server (OAuth; US: mcp.us.document360.io, Canada: mcp.ca.document360.io)',
      url: 'https://mcp.document360.io/mcp',
    },
  },
  {
    key: 'clickup',
    name: 'ClickUp',
    description: 'Read and act on ClickUp docs, tasks, lists and spaces.',
    logo: LOGO('clickup'),
    category: 'kb',
    authMode: 'oauth',
    values: {
      name: 'ClickUp',
      description: 'ClickUp hosted MCP server (public beta, all plans; OAuth-only, usage limits vary by plan)',
      url: 'https://mcp.clickup.com/mcp',
    },
  },
  {
    key: 'gitbook',
    name: 'GitBook',
    description: 'Query the content of published GitBook docs sites.',
    logo: LOGO('gitbook'),
    category: 'kb',
    values: {
      name: 'GitBook',
      description: 'Every published GitBook site exposes an MCP endpoint at <site URL>/~gitbook/mcp (HTTP transport; no auth for public sites)',
      url: 'https://<YOUR_DOCS_SITE>/~gitbook/mcp',
    },
  },
  {
    key: 'box',
    name: 'Box',
    description: 'Search, read and manage files and metadata in Box.',
    logo: LOGO('box'),
    category: 'kb',
    authMode: 'oauth',
    values: {
      name: 'Box',
      description: 'Box hosted MCP server (OAuth; document management, works as a knowledge-base backend)',
      url: 'https://mcp.box.com',
    },
  },

  // ---------- CI/CD & change ----------
  {
    key: 'jenkins',
    name: 'Jenkins',
    description: 'Trigger and inspect Jenkins jobs and builds.',
    logo: LOGO('jenkins'),
    category: 'cicd',
    values: {
      name: 'Jenkins',
      description: 'Self-hosted Jenkins MCP Server plugin — replace <YOUR_JENKINS_HOST> (needs Jenkins 2.533+)',
      url: 'https://<YOUR_JENKINS_HOST>/mcp-server/mcp',
      headers: [{ key: 'Authorization', value: 'Basic <base64(user:api_token)>' }],
    },
  },
  {
    key: 'argocd',
    name: 'Argo CD',
    description: 'Inspect and manage Argo CD applications, syncs and resources.',
    logo: LOGO('argocd'),
    category: 'cicd',
    values: {
      name: 'Argo CD',
      description: 'Self-hosted argocd-mcp server (default port 3000) — pass your Argo CD instance URL and API token via headers',
      url: 'http://<YOUR_MCP_HOST>:3000/mcp',
      headers: [
        { key: 'x-argocd-base-url', value: 'https://<YOUR_ARGOCD_HOST>' },
        { key: 'x-argocd-api-token', value: '<YOUR_ARGOCD_API_TOKEN>' },
      ],
    },
  },
  {
    key: 'buildkite',
    name: 'Buildkite',
    description: 'Inspect CI/CD pipelines, builds, jobs and logs.',
    logo: LOGO('buildkite'),
    category: 'cicd',
    values: {
      name: 'Buildkite',
      description: 'Buildkite hosted MCP server (token endpoint; OAuth endpoint: /mcp)',
      url: 'https://mcp.buildkite.com/direct',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_BUILDKITE_TOKEN>' }],
    },
  },
  {
    key: 'pulumi',
    name: 'Pulumi',
    description: 'Manage Pulumi IaC stacks, resources and Registry lookups.',
    logo: LOGO('pulumi'),
    category: 'cicd',
    authMode: 'oauth',
    values: {
      name: 'Pulumi',
      description: 'Pulumi hosted MCP server (OAuth-only; login in your MCP client)',
      url: 'https://mcp.ai.pulumi.com/mcp',
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
    logo: LOGO('azure'),
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
  {
    key: 'alibaba-openapi',
    name: 'Alibaba Cloud OpenAPI',
    description: 'Manage Alibaba Cloud resources (ECS, RDS, SLS...) via OpenAPI MCP.',
    logo: LOGO('alibabacloud'),
    category: 'cloud',
    authMode: 'oauth',
    values: {
      name: 'Alibaba Cloud OpenAPI',
      description: 'Alibaba Cloud OpenAPI MCP Server — copy the Streamable HTTP endpoint from the MCP console (api.aliyun.com/mcp); OAuth by default, AK env credentials for automation',
      url: 'https://<YOUR_ENDPOINT_FROM_MCP_CONSOLE>',
    },
  },
  {
    key: 'aws-knowledge',
    name: 'AWS Knowledge',
    description: 'Query up-to-date AWS docs, code samples and Well-Architected guidance.',
    logo: LOGO('aws'),
    category: 'cloud',
    values: {
      name: 'AWS Knowledge',
      description: 'AWS-managed Knowledge MCP server (no auth, rate-limited; resource-management APIs need the separate AWS MCP Server with SigV4)',
      url: 'https://knowledge-mcp.global.api.aws',
    },
  },
  {
    key: 'alibaba-maxcompute',
    name: 'Alibaba Cloud MaxCompute',
    description: 'Run SQL and query MaxCompute projects, tables and jobs on Alibaba Cloud.',
    logo: LOGO('alibabacloud'),
    category: 'cloud',
    authMode: 'oauth',
    values: {
      name: 'Alibaba Cloud MaxCompute',
      description: 'MaxCompute remote MCP server (OAuth-only; cn-hangzhou public network. VPC host / other regions differ)',
      url: 'https://mcp.cn-hangzhou.maxcompute.aliyun.com/mcp',
    },
  },

  // ---------- Data & database ----------
  // 夜莺已内置数据源插件的引擎（ClickHouse / ES / MySQL / PG 等）不再收录，避免与数据源能力重复。
  {
    key: 'databricks',
    name: 'Databricks',
    description: 'Query data via Databricks Genie spaces and Unity Catalog tools.',
    logo: LOGO('databricks'),
    category: 'data',
    values: {
      name: 'Databricks',
      description: 'Databricks managed MCP server (Genie) — replace workspace host and Genie space id; other endpoints: /api/2.0/mcp/functions/{catalog}/{schema}, vector-search',
      url: 'https://<YOUR_WORKSPACE_HOST>/api/2.0/mcp/genie/<YOUR_GENIE_SPACE_ID>',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_DATABRICKS_PAT>' }],
    },
  },
  {
    key: 'bigquery',
    name: 'BigQuery',
    description: 'Run SQL and browse datasets and tables in Google BigQuery.',
    logo: LOGO('bigquery'),
    category: 'data',
    authMode: 'oauth',
    values: {
      name: 'BigQuery',
      description: 'Google-managed BigQuery MCP server (OAuth 2.0 / IAM only — rejects API keys; available once the BigQuery API is enabled)',
      url: 'https://bigquery.googleapis.com/mcp',
    },
  },
  {
    key: 'supabase',
    name: 'Supabase',
    description: 'Manage Supabase projects, run SQL and inspect logs.',
    logo: LOGO('supabase'),
    category: 'data',
    authMode: 'oauth',
    values: {
      name: 'Supabase',
      description: 'Supabase hosted MCP server (OAuth 2.1 with DCR; PAT header also supported for non-browser clients)',
      url: 'https://mcp.supabase.com/mcp',
    },
  },
  {
    key: 'neon',
    name: 'Neon',
    description: 'Manage Neon Postgres projects and branches, and run SQL.',
    logo: LOGO('neon'),
    category: 'data',
    values: {
      name: 'Neon',
      description: 'Neon hosted MCP server (OAuth also supported; SSE endpoint: /sse)',
      url: 'https://mcp.neon.tech/mcp',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_NEON_API_KEY>' }],
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
  // ---------- Observability & incident ----------
  {
    key: 'flashduty',
    name: 'FlashDuty',
    description: 'Query and act on FlashDuty incidents, alerts, schedules and channels.',
    logo: '/image/logos/flashduty.png',
    category: 'observability',
    values: {
      name: 'FlashDuty',
      description: 'FlashDuty hosted MCP server — create an APP key in your FlashDuty account settings',
      url: 'https://mcp.flashcat.cloud/mcp',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_FLASHDUTY_APP_KEY>' }],
    },
  },
  {
    key: 'pagerduty',
    name: 'PagerDuty',
    description: 'Read and act on PagerDuty incidents, services, schedules and on-calls.',
    logo: '/image/logos/pagerduty.png',
    category: 'observability',
    values: {
      name: 'PagerDuty',
      description: 'PagerDuty hosted MCP server (EU: mcp.eu.pagerduty.com/mcp; OAuth also supported) — User API token uses the REST-API scheme',
      url: 'https://mcp.pagerduty.com/mcp',
      headers: [{ key: 'Authorization', value: 'Token token=<YOUR_API_TOKEN>' }],
    },
  },
  {
    key: 'incidentio',
    name: 'incident.io',
    description: 'Manage incident.io incidents, severities, roles and follow-ups.',
    logo: '/image/logos/mcp/incidentio.png',
    category: 'observability',
    values: {
      name: 'incident.io',
      description: 'incident.io hosted MCP server (OAuth also supported) — API keys act as a service actor and never expire',
      url: 'https://mcp.incident.io/mcp',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_INCIDENTIO_API_KEY>' }],
    },
  },
  {
    key: 'rootly',
    name: 'Rootly',
    description: 'Query and act on Rootly incidents, alerts and retrospectives.',
    logo: LOGO('rootly'),
    category: 'observability',
    values: {
      name: 'Rootly',
      description: 'Rootly hosted MCP server (slim tool profile by default; SSE endpoint: /sse; OAuth also supported)',
      url: 'https://mcp.rootly.com/mcp',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_ROOTLY_API_TOKEN>' }],
    },
  },
  {
    key: 'jsm',
    name: 'Jira Service Management',
    description: 'Search and act on JSM requests, incidents and on-call schedules.',
    logo: '/image/logos/jira.png',
    category: 'observability',
    authMode: 'oauth',
    values: {
      name: 'Jira Service Management',
      description: 'Atlassian Rovo hosted MCP server (OAuth 2.1) — the same endpoint also serves Jira and Confluence tools',
      url: 'https://mcp.atlassian.com/v1/mcp',
    },
  },

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
    logo: '/image/logos/mcp/honeycomb.png',
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
    logo: LOGO('polarsignals'),
    category: 'observability',
    values: {
      name: 'Polar Signals',
      description: 'Polar Signals Cloud hosted MCP server',
      url: 'https://api.polarsignals.com/api/mcp/',
      headers: [{ key: 'Authorization', value: 'Bearer <YOUR_TOKEN>' }],
    },
  },
];
