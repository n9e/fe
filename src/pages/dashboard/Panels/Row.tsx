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
import React, { useState } from 'react';
import { Space, Modal, Button, Mentions, Dropdown, Menu, Select } from 'antd';
import { CaretRightOutlined, CaretDownOutlined, HolderOutlined, SettingOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import { useReplaceTemplateVariables } from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';

import { AddPanelIcon } from '../config';
import { useGlobalState } from '../globalState';
import type { IPanel } from '../types';

interface IProps {
  isAuthorized: boolean;
  name: string;
  row: IPanel;
  onToggle: () => void;
  onAddClick: () => void;
  onPasteClick: () => void;
  onEditClick: (row: IPanel) => void;
  onDeleteClick: (mode: 'self' | 'withPanels') => void;
}

/** 渲染仪表盘行标题及其操作，并从所属仪表盘运行时读取可插入的变量。 */
export default function Row(props: IProps) {
  const { t } = useTranslation('dashboard');
  const replaceTemplateVariables = useReplaceTemplateVariables();
  const [variablesWithOptions] = useGlobalState('variablesWithOptions');
  const { isAuthorized, name, row, onToggle, onAddClick, onPasteClick, onEditClick, onDeleteClick } = props;
  const [editVisble, setEditVisble] = useState(false);
  const [newName, setNewName] = useState<string>();
  const [newRepeat, setNewRepeat] = useState<string>();
  const [deleteVisible, setDeleteVisible] = useState(false);
  const canEdit = isAuthorized && !row.repeatPanelId;
  const rowPanels = row.panels?.length ?? 0;
  const closeEditor = () => {
    setEditVisble(false);
    setNewName(undefined);
    setNewRepeat(undefined);
  };
  const submitEditor = () => {
    onEditClick({ ...row, name: newName || row.name, repeat: newRepeat });
    closeEditor();
  };

  return (
    <div
      className={classNames('dashboards-panels-row', {
        'dashboards-panels-row-expanded': !row.collapsed,
      })}
    >
      <div className='dashboards-panels-row-name'>
        <span
          className='cursor-pointer'
          onClick={() => {
            onToggle();
          }}
        >
          {row.collapsed ? <CaretRightOutlined /> : <CaretDownOutlined />}
          <span className='pl-2'>
            <span>{replaceTemplateVariables(name, { scopedVars: row.scopedVars })}</span>
            {row.collapsed && (
              <span className='ml-4 dashboards-panels-row-name-panels-count'>
                (
                {rowPanels > 1
                  ? t('row.panels_plural', {
                      count: rowPanels,
                    })
                  : t('row.panels', {
                      count: rowPanels,
                    })}
                )
              </span>
            )}
          </span>
        </span>
        {canEdit && (
          <Space className='text-[12px] ml-4'>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  <Menu.Item
                    key='paste'
                    onClick={() => {
                      if (row.collapsed) {
                        onToggle();
                      }
                      onPasteClick();
                    }}
                  >
                    {t('visualizations.importPanel')}
                  </Menu.Item>
                  <Menu.Item
                    key='add'
                    onClick={() => {
                      if (row.collapsed) {
                        onToggle();
                      }
                      onAddClick();
                    }}
                  >
                    {t('add_panel')}
                  </Menu.Item>
                </Menu>
              }
            >
              <AddPanelIcon />
            </Dropdown>
            <SettingOutlined
              onClick={() => {
                setEditVisble(true);
                setNewName(name);
                setNewRepeat(row.repeat);
              }}
            />
            <DeleteOutlined
              onClick={() => {
                setDeleteVisible(true);
              }}
            />
          </Space>
        )}
      </div>
      {canEdit && row.collapsed && (
        <Space>
          <HolderOutlined className='dashboards-panels-item-drag-handle' />
        </Space>
      )}
      <Modal title={t('row.edit_title')} visible={editVisble} onCancel={closeEditor} onOk={submitEditor}>
        <div>
          {t('row.name')}
          <Mentions
            prefix='$'
            split=''
            value={newName}
            onChange={(val) => {
              setNewName(val);
            }}
            onPressEnter={submitEditor}
          >
            {_.map(variablesWithOptions, (item) => {
              return (
                <Mentions.Option key={item.name} value={item.name}>
                  {item.name}
                </Mentions.Option>
              );
            })}
          </Mentions>
        </div>
        <div className='mt-4'>
          <div>{t('row.repeat')}</div>
          <Select
            className='w-full'
            aria-label={t('row.repeat')}
            allowClear
            value={newRepeat}
            onChange={setNewRepeat}
            options={variablesWithOptions.map((variable) => ({ label: variable.name, value: variable.name }))}
          />
          <div className='text-hint mt-1'>{t('row.repeat_tip')}</div>
        </div>
      </Modal>
      <Modal
        closable={false}
        visible={deleteVisible}
        onCancel={() => {
          setDeleteVisible(false);
        }}
        footer={[
          <Button
            key='cancel'
            onClick={() => {
              setDeleteVisible(false);
            }}
          >
            {t('row.cancel')}
          </Button>,
          <Button
            key='ok'
            type='primary'
            onClick={() => {
              onDeleteClick('self');
              setDeleteVisible(false);
            }}
          >
            {t('row.ok2')}
          </Button>,
          <Button
            key='all'
            type='primary'
            danger
            onClick={() => {
              onDeleteClick('withPanels');
              setDeleteVisible(false);
            }}
          >
            {t('row.ok')}
          </Button>,
        ]}
      >
        <div>
          <h3 style={{ fontSize: 16 }}>
            <InfoCircleOutlined style={{ color: '#faad14', marginRight: 10, fontSize: 22, position: 'relative', top: 4 }} /> {t('row.delete_title')}
          </h3>
          <div style={{ marginLeft: 38, fontSize: 14 }}>{t('row.delete_confirm')}</div>
        </div>
      </Modal>
    </div>
  );
}
