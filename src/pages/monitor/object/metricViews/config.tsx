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
import React from 'react';
import Icon from '@ant-design/icons';

export const HexbinSvg = () => (
  <svg className='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='1269' width='1em' height='1em' fill='currentColor'>
    <path
      d='M85.333333 85.333333h85.333334v768h768v85.333334H85.333333V85.333333m512 533.333334L512 768H338.773333l-86.186666-149.333333L338.773333 469.333333H512l85.333333 149.333334m3.413334-341.333334L514.56 426.666667H341.333333L256 277.333333 341.333333 128h173.226667l86.186667 149.333333m305.92 170.666667L820.48 597.333333h-172.373333l-86.186667-149.333333L648.106667 298.666667h172.373333l86.186667 149.333333z'
      fill=''
      p-id='1270'
    ></path>
  </svg>
);

export const HexbinIcon = (props) => <Icon component={HexbinSvg} {...props} />;

export const units = [
  {
    label: 'SI prefixes',
    value: 'default',
  },
  {
    label: 'none',
    value: 'none',
  },
  {
    label: 'bits(SI)',
    value: 'bitsSI',
  },
  {
    label: 'bytes(SI)',
    value: 'bytesSI',
  },
  {
    label: 'bits(IEC)',
    value: 'bitsIEC',
  },
  {
    label: 'bytes(IEC)',
    value: 'bytesIEC',
  },
  {
    label: '百分比(0-100)',
    value: 'percent',
  },
  {
    label: '百分比(0.0-1.0)',
    value: 'percentUnit',
  },
  {
    label: 'seconds',
    value: 'seconds',
  },
  {
    label: 'milliseconds',
    value: 'milliseconds',
  },
  {
    label: 'humanize(seconds)',
    value: 'humantimeSeconds',
  },
  {
    label: 'humanize(milliseconds)',
    value: 'humantimeMilliseconds',
  },
];
