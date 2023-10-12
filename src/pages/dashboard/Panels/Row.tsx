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
import { Space, Modal, Button, Mentions, Select, Form } from 'antd';
import { CaretRightOutlined, CaretDownOutlined, HolderOutlined, SettingOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { AddPanelIcon } from '../config';
import { useGlobalState } from '../globalState';
import replaceFieldWithVariable from '../Renderer/utils/replaceFieldWithVariable';

interface IProps {
  isPreview?: boolean;
  name: string;
  row: any;
  onToggle: () => void;
  onAddClick: () => void;
  onEditClick: (row: any) => void;
  onDeleteClick: (mode: 'self' | 'withPanels') => void;
}

export default function Row(props: IProps) {
  const { t } = useTranslation('dashboard');
  const { isPreview, name, row, onToggle, onAddClick, onEditClick, onDeleteClick } = props;
  const [editVisble, setEditVisble] = useState(false);
  const [newName, setNewName] = useState<string>();
  const [repeat, setRepeat] = useState<string>();
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [dashboardMeta] = useGlobalState('dashboardMeta');

  return (
    <div
      className={classNames('dashboards-panels-row', {
        'dashboards-panels-row-collapsed': row.collapsed,
      })}
    >
      <div
        className='dashboards-panels-row-name'
        onClick={() => {
          onToggle();
        }}
      >
        <Space>
          <span style={{ paddingRight: 6 }}>{replaceFieldWithVariable(dashboardMeta.dashboardId, name, dashboardMeta.variableConfigWithOptions, row.scopedVars)}</span>
          {row.collapsed ? <CaretDownOutlined /> : <CaretRightOutlined />}
          {!isPreview && !row.repeatPanelId && (
            <Space>
              <AddPanelIcon
                onClick={(e) => {
                  e.stopPropagation();
                  onAddClick();
                }}
              />
              <SettingOutlined
                onClick={(e) => {
                  e.stopPropagation();
                  setEditVisble(true);
                  setNewName(name);
                  setRepeat(row.repeat);
                }}
              />
              <DeleteOutlined
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteVisible(true);
                }}
              />
            </Space>
          )}
        </Space>
      </div>
      {!isPreview && row.collapsed === false && !row.repeatPanelId && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <HolderOutlined className='dashboards-panels-item-drag-handle' />
        </div>
      )}
      <Modal
        title={t('row.edit_title')}
        visible={editVisble}
        onCancel={() => {
          setEditVisble(false);
        }}
        onOk={() => {
          onEditClick({
            ...row,
            name: newName,
            repeat,
          });
          setEditVisble(false);
        }}
      >
        <Form layout='vertical'>
          <Form.Item label={t('row.name')}>
            <Mentions
              prefix='$'
              split=''
              value={newName}
              onChange={(val) => {
                setNewName(val);
              }}
              onPressEnter={() => {
                onEditClick({
                  ...row,
                  name: newName,
                  repeat,
                });
                setEditVisble(false);
              }}
            >
              {_.map(dashboardMeta.variableConfigWithOptions, (item) => {
                return (
                  <Mentions.Option key={item.name} value={item.name}>
                    {item.name}
                  </Mentions.Option>
                );
              })}
            </Mentions>
          </Form.Item>
          <Form.Item label={t('row.repeatFor')}>
            <Select
              value={repeat}
              onChange={(val) => {
                setRepeat(val);
              }}
              allowClear
              options={_.map(dashboardMeta.variableConfigWithOptions, (item) => {
                return {
                  label: item.name,
                  value: item.name,
                };
              })}
            ></Select>
          </Form.Item>
        </Form>
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
