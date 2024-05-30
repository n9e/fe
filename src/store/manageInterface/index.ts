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

export interface Contacts {
  key: string;
  value: string;
}
export interface User {
  id: string;
  username: string;
  nickname: string;
  phone: string;
  email: string;
  portrait: string;
  status: number;
  role: string;
  contacts: Contacts[];
  create_at: number;
  create_by: number;
  update_at: number;
  update_by: number;
  last_active_time: number;
}
export interface Team {
  id: string;
  name: string;
  note: string;
  create_at: number;
  create_by: string;
  update_at: number;
  update_by: string;
}
export interface UserList {
  list: Array<User>;
  total: number;
}
export interface TeamList {
  list: Array<Team>;
  total: number;
}
export enum UserType {
  User = '用户',
  Team = '团队',
}
export interface TeamInfo {
  user_groups?: Team;
  user_group?: Team;
  users: Array<User>;
}
export enum ActionType {
  CreateUser = '创建用户',
  CreateTeam = '创建团队',
  CreateBusiness = '创建业务组',
  AddBusinessMember = '添加业务组成员',
  EditBusiness = '编辑业务组',
  EditUser = '编辑用户信息',
  EditTeam = '编辑团队信息',
  Reset = '重置密码',
  Disable = '禁用',
  Undisable = '启用',
  AddUser = '添加成员',
}
export enum RoleType {
  Admin = '管理员',
  Standard = '普通用户',
  Guest = '游客',
}
export interface Title {
  create: string;
  edit: string;
  disabled: string;
  reset: string;
}
export type TitleKey = keyof Title;

export interface ModalProps {
  visible: boolean;
  userType?: string;
  onClose?: any;
  action: ActionType;
  userId?: string;
  teamId?: string;
  memberId?: string;
  onSearch?: any;
  width?: number;
}
export interface TeamProps {
  onClose?: any;
  teamId?: string;
  businessId?: string;
  onSelect?: any;
  action?: ActionType;
}
export interface UserAndPasswordFormProps {
  userId?: string;
}
export interface ContactsItem {
  key: string;
  label: string;
}
export interface PopoverProps {
  userId?: string;
  teamId?: string;
  memberId?: string;
  onClose: any;
  userType: string;
  isIcon?: boolean;
}
