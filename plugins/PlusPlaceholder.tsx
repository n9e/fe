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
/** 专业版采集配置服务：开源版没有这条路，调用方一律用 IS_PLUS 挡住，这里只为让打包能解析到符号 */
function postCollect() {
  return Promise.reject(new Error('not available in open-source edition'));
}

export {
  AlertRule,
  postCollect,
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
