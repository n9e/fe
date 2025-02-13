/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { message } from 'antd';
import React, { ReactNode, Component } from 'react';
import { useLocation } from 'react-router-dom';
import i18next from 'i18next';
import { JSEncrypt } from 'js-encrypt';
import { IStore } from '@/store/common';
export { getDefaultDatasourceValue, setDefaultDatasourceValue } from './datasource';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const isPromise = (obj) => {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
};

export const download = function (stringList: Array<string> | string, name: string = 'download.txt') {
  const element = document.createElement('a');
  const file = new Blob([Array.isArray(stringList) ? stringList.join('\r\n') : stringList], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = name;
  document.body.appendChild(element);
  element.click();
};

/**
 * 将文本添加到剪贴板
 */
export const copyToClipBoard = (text: string, spliter?: string): boolean => {
  const fakeElem = document.createElement('textarea');
  fakeElem.style.border = '0';
  fakeElem.style.padding = '0';
  fakeElem.style.margin = '0';
  fakeElem.style.position = 'absolute';
  fakeElem.style.left = '-9999px';
  const yPosition = window.pageYOffset || document.documentElement.scrollTop;
  fakeElem.style.top = `${yPosition}px`;
  fakeElem.setAttribute('readonly', '');
  fakeElem.value = text;

  document.body.appendChild(fakeElem);
  fakeElem.select();
  let succeeded;
  try {
    succeeded = document.execCommand('copy');
    if (spliter && text.includes(spliter)) {
      message.success(`${i18next.t('复制')}${text.split('\n').length}${i18next.t('条数据到剪贴板')}`);
    } else {
      message.success(i18next.t('复制到剪贴板'));
    }
  } catch (err) {
    message.error(i18next.t('复制失败'));
    succeeded = false;
  }
  if (succeeded) {
    document.body.removeChild(fakeElem);
  }
  return succeeded;
};

export const copy2ClipBoard = (text: string, silent = false): boolean => {
  const fakeElem = document.createElement('textarea');
  fakeElem.style.border = '0';
  fakeElem.style.padding = '0';
  fakeElem.style.margin = '0';
  fakeElem.style.position = 'absolute';
  fakeElem.style.left = '-9999px';
  const yPosition = window.pageYOffset || document.documentElement.scrollTop;
  fakeElem.style.top = `${yPosition}px`;
  fakeElem.setAttribute('readonly', '');
  fakeElem.value = text;

  document.body.appendChild(fakeElem);
  fakeElem.select();
  let succeeded;
  try {
    succeeded = document.execCommand('copy');
    !silent && message.success(i18next.t('common:copyToClipboard'));
  } catch (err) {
    message.error(i18next.t('common:copyToClipboardFailed'));
    succeeded = false;
  }
  if (succeeded) {
    document.body.removeChild(fakeElem);
  }
  return succeeded;
};

export function formatTrim(s: string) {
  out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
    switch (s[i]) {
      case '.':
        i0 = i1 = i;
        break;

      case '0':
        if (i0 === 0) i0 = i;
        i1 = i;
        break;

      default:
        if (i0 > 0) {
          if (!+s[i]) break out;
          i0 = 0;
        }
        break;
    }
  }
  return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
}
interface Route {
  path: string;
  component: JSX.Element | Component;
}
export interface Entry {
  menu?: {
    weight?: number;
    content: ReactNode;
  };
  routes: Route[];
  module?: IStore<any>;
}

export const dynamicPackages = (): Entry[] => {
  const Packages = import.meta.globEager('../Packages/*/entry.tsx');
  return Object.values(Packages).map((obj) => obj.default);
};

export const dynamicPages = (): Entry[] => {
  const Packages = import.meta.globEager('../pages/*/entry.tsx');
  return Object.values(Packages).map((obj) => obj.default);
};

export const generateID = (): string => {
  return `_${Math.random().toString(36).substr(2, 9)}`;
};

// https://github.com/n9e/fe-v5/issues/72 修改 withByte 默认为 false
export const sizeFormatter = (
  val,
  fixedCount = 2,
  { withUnit = true, withByte = false, trimZero = false, convertNum = 1024 } = {
    withUnit: true,
    withByte: false,
    trimZero: false,
    convertNum: 1024 | 1000,
  },
) => {
  const size = val ? Number(val) : 0;
  let result;
  let unit = '';

  if (size < 0) {
    result = 0;
  } else if (size < convertNum) {
    result = size.toFixed(fixedCount);
  } else if (size < convertNum * convertNum) {
    result = (size / convertNum).toFixed(fixedCount);
    unit = 'K';
  } else if (size < convertNum * convertNum * convertNum) {
    result = (size / convertNum / convertNum).toFixed(fixedCount);
    unit = 'M';
  } else if (size < convertNum * convertNum * convertNum * convertNum) {
    result = (size / convertNum / convertNum / convertNum).toFixed(fixedCount);
    unit = 'G';
  } else if (size < convertNum * convertNum * convertNum * convertNum * convertNum) {
    result = (size / convertNum / convertNum / convertNum / convertNum).toFixed(fixedCount);
    unit = 'T';
  }

  trimZero && (result = parseFloat(result));
  withUnit && (result = `${result}${unit}`);
  withByte && (result = `${result}B`);
  return result;
};

export function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export function warning(message: string) {
  // Support uglify
  if (process.env.NODE_ENV !== 'production' && console !== undefined) {
    console.error(`Warning: ${message}`);
  }
}

export const scrollToFirstError = () => {
  setTimeout(() => {
    document.querySelector('.ant-form-item-has-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 200);
};

export const RSAEncrypt = (str: string): string => {
  if (!str) return '';
  var encrypt = new JSEncrypt();
  let result: string | boolean = '';
  encrypt.setPublicKey(`-----BEGIN PUBLIC KEY-----
  MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoEyQB7GhjPdmHZ7gpvG7
  QMuI224WL3L+CGEtl6E0ypxp1czaLV2TN8POSmRZmjsmaHthkIHiZg2uRvijYX+F
  2a7XrRh3xZ+s51dtxrbhufYhMvYQFmXpAkYUjMrKn3hGzssONBoOxauJyec3bIFj
  lcz2nnTRT/xW+mqCoFPoAx2fwOhVurRQSvP2d4mBEDjmCt+frDTj1EW1HjA1QujX
  XX55KvL+VUmqjU8auj4Pm/4yn8tL8mkv2wCOrYOwylwEYNx1oc2Rczze4B6Rup6B
  wAQBLBZ/TQPFtUDBF/b3i+nWrR77onffeDplXrzXgfmOE5TclMFfhELBRCoiTvSY
  YQIDAQAB
  -----END PUBLIC KEY-----`);
  result = encrypt.encrypt(str);
  if (result === false) {
    message.error('密码过长，加密失败, 最长64位');
    throw new Error('密码过长，加密失败');
  }
  return encrypt.encrypt(str);
};

interface IData {
  sheetName: string;
  columns: { header: string; key: string; width?: number }[];
  list: any[];
}

export async function downloadExcel(fileName: string = 'download.xlsx', data: IData[]) {
  try {
    const workbook = new ExcelJS.Workbook();
    for (let i = 0; i < data.length; i++) {
      const el = data[i];
      const workSheet = workbook.addWorksheet(el.sheetName);
      workSheet.columns = el.columns;
      workSheet.columns.forEach((column) => {
        column.width = column.header?.length! < 15 ? 15 : column.header?.length;
      });
      workSheet.addRows(el.list);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'text/plain;charset=utf-8' }), fileName);
  } catch (error) {
    throw new Error('下载错误: ' + error);
  }
}
