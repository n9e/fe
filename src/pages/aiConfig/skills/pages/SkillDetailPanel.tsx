import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Collapse, Dropdown, Menu, Modal, Space, Switch, Table, Tag, Upload } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import _ from 'lodash';

import { NS } from '../constants';
import { Item } from '../types';

interface Props {
  item: Item;
  onToggleEnabled: () => void;
  onEdit: () => void;
  onImport: (file: File) => void;
  onDelete: () => void;
}

export default function SkillDetailPanel(props: Props) {
  const { t } = useTranslation(NS);
  const { item, onToggleEnabled, onEdit, onImport, onDelete } = props;

  return (
    <div className='w-full min-w-0 best-looking-scroll pr-2'>
      <div className='flex justify-between fc-toolbar mb-2'>
        <div className='text-title text-l2'>{item.name}</div>
        <Space>
          <Switch size='small' checked={item.enabled} onChange={onToggleEnabled} />
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key='manual' onClick={onEdit}>
                  {t('edite_menu_1')}
                </Menu.Item>
                <Menu.Item key='upload'>
                  <Upload
                    name='file'
                    showUploadList={false}
                    accept='.zip,.tar.gz,.tgz'
                    customRequest={(options) => {
                      onImport(options.file as File);
                    }}
                  >
                    {t('edite_menu_2')}
                  </Upload>
                </Menu.Item>
              </Menu>
            }
          >
            <Button size='small' icon={<EditOutlined />} />
          </Dropdown>
          <Button
            size='small'
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: t('common:confirm.delete'),
                onOk: onDelete,
              });
            }}
          />
        </Space>
      </div>
      {item.description && <div className='text-hint'>{item.description}</div>}
      <div className='skills-section-divider my-4' />
      <Collapse ghost className='skills-form-collapse skills-form-collapse-compact'>
        <Collapse.Panel key='advanced' header={<div className='text-main text-l1'>{t('form.advanced_settings')}</div>}>
          <Table
            size='small'
            showHeader={false}
            rowKey='name'
            pagination={false}
            bordered={false}
            dataSource={[
              {
                name: 'license',
                value: item.license,
              },
              {
                name: 'compatibility',
                value: item.compatibility,
              },
              {
                name: 'allowed_tools',
                value: item.allowed_tools,
              },
            ]}
            columns={[
              {
                dataIndex: 'name',
                key: 'name',
                width: 120,
                render: (name) => {
                  if (name === 'license') {
                    return t('form.license');
                  }
                  if (name === 'compatibility') {
                    return t('form.compatibility');
                  }
                  if (name === 'allowed_tools') {
                    return t('form.allowed_tools');
                  }
                  return name;
                },
              },
              {
                dataIndex: 'value',
                key: 'value',
                render: (value, record) => {
                  if (_.isEmpty(value)) {
                    return '-';
                  }
                  if (record.name === 'allowed_tools' && _.includes(value, ' ')) {
                    return _.map(_.split(value, ' '), (tool) => {
                      return <Tag key={tool}>{tool}</Tag>;
                    });
                  }
                  return value;
                },
              },
            ]}
          />
        </Collapse.Panel>
      </Collapse>
    </div>
  );
}
