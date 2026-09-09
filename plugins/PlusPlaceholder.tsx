import React from 'react';

export default function PlusePlaceholder() {
  return null;
}

function AlertRule() {
  return null;
}

function QueryBuilder() {
  return null;
}

function datasource() {}

function Event() {
  return null;
}

function EventLogs() {
  return null;
}

function EventPreview() {
  return null;
}

function Explorer() {
  return null;
}

function Jobs() {
  return null;
}

const MCPServerList = PlusePlaceholder;
const AiTaskPage = PlusePlaceholder;

const advancedCates = [];
const envCateMap = {};
enum AdvancedDatasourceCateEnum {}
const getLicense = async () => {
  return {};
};
const getN9eConfig = async () => {
  return {};
};
const getDefaultValuesByCate = () => {};
const autoDatasourcetype = [];
const AuthList = [];
const extraColumns = () => {};
// 主机拓扑（plus 功能）。命名导入必须在这里有对应物，否则开源构建缺符号。
// 调用点都由 IS_PLUS 守着，开源构建下这几个不会被真正用到。
const HostTopoViewSwitch = PlusePlaceholder;
const HostTopoGlobalGraph = PlusePlaceholder;
const HostTopoDrawerTab = PlusePlaceholder;
const HostTopoCenterSelect = PlusePlaceholder;
const HostTopoCollectSetup = PlusePlaceholder;
const readHostTopoViewMode = () => 'list';
const getNetworkDevices = () => {};
const getNetworkDevicesList = () => {};
const getNetworkDevicesTags = () => {};
const searchDrilldown = () => {};
const proDocumentPathMap = {};
const AckBtnDefault = () => {
  return null;
};
const getBrainLicense = null;
const options = [];
const esQueryBuilder = async () => {
  return {};
};
const getCLSLogset = async () => {
  return {};
};
const getCLSTopic = async () => {
  return {};
};
const getTLSProject = async () => {
  return {};
};
const getTLSTopic = async () => {
  return {};
};
const getProject = async () => {
  return {};
};
const getTopic = async () => {
  return {};
};
export {
  AlertRule,
  QueryBuilder,
  datasource,
  Event,
  EventLogs,
  EventPreview,
  Explorer,
  Jobs,
  MCPServerList,
  AiTaskPage,
  advancedCates,
  envCateMap,
  AdvancedDatasourceCateEnum,
  getLicense,
  getN9eConfig,
  getDefaultValuesByCate,
  autoDatasourcetype,
  AuthList,
  extraColumns,
  HostTopoViewSwitch,
  HostTopoGlobalGraph,
  HostTopoDrawerTab,
  HostTopoCenterSelect,
  HostTopoCollectSetup,
  readHostTopoViewMode,
  getNetworkDevices,
  getNetworkDevicesList,
  getNetworkDevicesTags,
  proDocumentPathMap,
  searchDrilldown,
  AckBtnDefault,
  getBrainLicense,
  options,
  esQueryBuilder,
  getCLSLogset,
  getCLSTopic,
  getTLSProject,
  getTLSTopic,
  getProject,
  getTopic,
};

// 开源版没有 Plus 变量扩展，公共注册表仍然有效。
export const dashboardVariablePlugins: Record<string, import('../src/pages/dashboard/Variables/pluginTypes').DashboardVariablePlugin> = {};
