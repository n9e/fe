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
import { PRIMARY_COLOR } from '@/utils/constant';

export const statHexPalette = [PRIMARY_COLOR, '#3FC453', '#FF6A00', '#FF656B'];
export const hexPalette = [
  '#7EB26D',
  '#EAB839',
  '#6ED0E0',
  '#EF843C',
  '#E24D42',
  '#1F78C1',
  '#BA43A9',
  '#705DA0',
  '#508642',
  '#CCA300',
  '#447EBC',
  '#C15C17',
  '#890F02',
  '#0A437C',
  '#6D1F62',
  '#584477',
  '#B7DBAB',
  '#F4D598',
  '#70DBED',
  '#F9BA8F',
  '#F29191',
  '#82B5D8',
  '#E5A8E2',
  '#AEA2E0',
  '#629E51',
  '#E5AC0E',
  '#64B0C8',
  '#E0752D',
  '#BF1B00',
  '#0A50A1',
  '#962D82',
  '#614D93',
  '#9AC48A',
  '#F2C96D',
  '#65C5DB',
  '#F9934E',
  '#EA6460',
  '#5195CE',
  '#D683CE',
  '#806EB7',
  '#3F6833',
  '#967302',
  '#2F575E',
  '#99440A',
  '#58140C',
  '#052B51',
  '#511749',
  '#3F2B5B',
  '#E0F9D7',
  '#FCEACA',
  '#CFFAFF',
  '#F9E2D2',
  '#FCE2DE',
  '#BADFF4',
  '#F9D9F9',
  '#DEDAF7',
];
export const AddPanelSvg = () => (
  <svg viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' width='1em' height='1em'>
    <path
      d='M810.666667 426.666667h-170.666667V128a42.666667 42.666667 0 0 0-42.666667-42.666667H384a42.666667 42.666667 0 0 0-42.666667 42.666667v213.333333H170.666667a42.666667 42.666667 0 0 0-42.666667 42.666667v512a42.666667 42.666667 0 0 0 42.666667 42.666667h640a42.666667 42.666667 0 0 0 42.666666-42.666667V469.333333a42.666667 42.666667 0 0 0-42.666666-42.666666zM341.333333 853.333333H213.333333V426.666667h128v426.666666z m213.333334 0h-128V170.666667h128v682.666666z m213.333333 0h-128v-341.333333h128v341.333333z m170.666667-682.666666h-42.666667V128a42.666667 42.666667 0 1 0-85.333333 0v42.666667h-42.666667a42.666667 42.666667 0 0 0 0 85.333333h42.666667v42.666667a42.666667 42.666667 0 0 0 85.333333 0V256h42.666667a42.666667 42.666667 0 1 0 0-85.333333z'
      fill='currentColor'
    ></path>
  </svg>
);

export const AddPanelIcon = (props) => <Icon component={AddPanelSvg} {...props} className='anticon-addpanel' />;
