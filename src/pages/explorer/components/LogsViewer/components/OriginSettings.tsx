/**
 * 日志展示相关选项的组件
 * 包括：是否显示时间字段、是否折行显示、字段展示和顺序等
 */

import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Space, Switch, Dropdown, Menu, Modal, Row, Col, Form, Radio, InputNumber, Tooltip } from 'antd';
import _ from 'lodash';
import { SettingOutlined, EyeInvisibleOutlined, PlusSquareOutlined, CloseSquareOutlined } from '@ant-design/icons';

import { OptionsType } from '../types';

export default function OriginSettings({
  options,
  updateOptions,
  fields,
  showDateField,
}: {
  options: OptionsType;
  updateOptions: (options: any, reload?: boolean) => void;
  fields: string[];
  showDateField?: boolean;
}) {
  const { t } = useTranslation('explorer');
  const [organizeFieldsModalVisible, setOrganizeFieldsModalVisible] = useState(false);
  const [organizeFields, setOrganizeFields] = useState(options.organizeFields);

  const [jsonSettingsModalVisible, setJsonSettingsModalVisible] = useState(false);
  const [jsonSettings, setJsonSettings] = useState({
    jsonDisplaType: options.jsonDisplaType,
    jsonExpandLevel: options.jsonExpandLevel,
  });

  const [pageLoadModeModalVisible, setPageLoadModeModalVisible] = useState(false);
  const [pageLoadMode, setPageLoadMode] = useState(options.pageLoadMode || 'pagination');

  useEffect(() => {
    setJsonSettings({
      jsonDisplaType: options.jsonDisplaType,
      jsonExpandLevel: options.jsonExpandLevel,
    });
    setOrganizeFields(options.organizeFields);
  }, [JSON.stringify(options)]);

  return (
    <>
      <Space>
        {options.logMode === 'origin' && (
          <div>
            {t('logs.settings.breakLine')}{' '}
            <Switch
              size='small'
              checked={options.lineBreak === 'true'}
              onChange={(val) => {
                updateOptions({
                  lineBreak: val ? 'true' : 'false',
                });
              }}
            />
          </div>
        )}
        <div>
          {t('logs.settings.lines')}{' '}
          <Switch
            size='small'
            checked={options.lines === 'true'}
            onChange={(val) => {
              updateOptions({
                lines: val ? 'true' : 'false',
              });
            }}
          />
        </div>
        {showDateField && (
          <div>
            {t('logs.settings.time')}{' '}
            <Switch
              size='small'
              checked={options.time === 'true'}
              onChange={(val) => {
                updateOptions({
                  time: val ? 'true' : 'false',
                });
              }}
            />
          </div>
        )}
        <Dropdown
          overlay={
            <Menu
              items={[
                {
                  key: 'organizeFieldsBtn',
                  label: (
                    <a
                      onClick={() => {
                        setOrganizeFieldsModalVisible(true);
                      }}
                    >
                      {t('logs.settings.organizeFields.title')}
                    </a>
                  ),
                },
                {
                  key: 'pageLoadMode',
                  label: (
                    <a
                      onClick={() => {
                        setPageLoadModeModalVisible(true);
                      }}
                    >
                      {t('logs.settings.pageLoadMode.title')}
                    </a>
                  ),
                },
                // {
                //   key: 'jsonSettingsBtn',
                //   label: (
                //     <a
                //       onClick={() => {
                //         setJsonSettingsModalVisible(true);
                //       }}
                //     >
                //       {t('logs.settings.jsonSettings.title')}
                //     </a>
                //   ),
                // },
              ]}
            />
          }
          trigger={['click']}
        >
          <SettingOutlined />
        </Dropdown>
        {!_.isEmpty(options.organizeFields) && (
          <Tooltip title={`当前只显示字段 ${_.join(options.organizeFields, '、')}，可点击设置图标设置显示所有字段`}>
            <EyeInvisibleOutlined
              style={{
                color: '#999',
              }}
            />
          </Tooltip>
        )}
      </Space>
      <Modal
        title={t('logs.settings.organizeFields.title')}
        visible={organizeFieldsModalVisible}
        onOk={() => {
          updateOptions({
            organizeFields,
          });
          setOrganizeFieldsModalVisible(false);
        }}
        onCancel={() => {
          setOrganizeFieldsModalVisible(false);
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <div>
              <div
                style={{
                  borderStyle: 'solid',
                  borderWidth: '1px',
                  borderBottom: '0 none',
                  padding: '8px 16px',
                }}
                className='n9e-border-color'
              >
                <h3 style={{ margin: 0 }}>{t('logs.settings.organizeFields.allFields')}</h3>
              </div>
              <div style={{ borderStyle: 'solid', borderWidth: '1px', padding: 16, overflowY: 'auto', height: 450 }} className='n9e-border-color'>
                {_.map(_.xor(fields, organizeFields), (field: string) => {
                  return (
                    <div
                      key={field}
                      onClick={() => {
                        setOrganizeFields([...organizeFields, field]);
                      }}
                      style={{ cursor: 'pointer', marginBottom: 8 }}
                    >
                      <Space>
                        <PlusSquareOutlined />
                        {field}
                      </Space>
                    </div>
                  );
                })}
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div>
              <div
                style={{
                  borderStyle: 'solid',
                  borderWidth: '1px',
                  borderBottom: '0 none',
                  padding: '8px 16px',
                }}
                className='n9e-border-color'
              >
                <h3 style={{ margin: 0 }}>{t('logs.settings.organizeFields.showFields')}</h3>
              </div>
              <div style={{ borderStyle: 'solid', borderWidth: '1px', padding: 16, overflowY: 'auto', height: 450 }} className='n9e-border-color'>
                {_.isEmpty(organizeFields) && <div style={{ color: '#999' }}>{t('logs.settings.organizeFields.showFields_empty')}</div>}
                {_.map(organizeFields, (field) => {
                  return (
                    <div
                      key={field}
                      onClick={() => {
                        setOrganizeFields(_.filter(organizeFields, (item) => item !== field));
                      }}
                      style={{ cursor: 'pointer', marginBottom: 8 }}
                    >
                      <Space>
                        <CloseSquareOutlined />
                        {field}
                      </Space>
                    </div>
                  );
                })}
              </div>
            </div>
          </Col>
        </Row>
      </Modal>
      <Modal
        title={t('logs.settings.jsonSettings.title')}
        visible={jsonSettingsModalVisible}
        onOk={() => {
          updateOptions(jsonSettings);
          setJsonSettingsModalVisible(false);
        }}
        onCancel={() => {
          setJsonSettingsModalVisible(false);
        }}
      >
        <Form>
          <Form.Item label={t('logs.settings.jsonSettings.displayMode')}>
            <Radio.Group
              buttonStyle='solid'
              value={jsonSettings.jsonDisplaType}
              onChange={(e) => {
                setJsonSettings({
                  ...jsonSettings,
                  jsonDisplaType: e.target.value,
                });
              }}
            >
              <Radio value='tree'>{t('logs.settings.jsonSettings.displayMode_tree')}</Radio>
              <Radio value='string'>{t('logs.settings.jsonSettings.displayMode_string')}</Radio>
            </Radio.Group>
          </Form.Item>
          {jsonSettings.jsonDisplaType === 'tree' && (
            <Form.Item label={t('logs.settings.jsonSettings.expandLevel')}>
              <InputNumber
                min={1}
                value={jsonSettings.jsonExpandLevel}
                onChange={(val) => {
                  setJsonSettings({
                    ...jsonSettings,
                    jsonExpandLevel: val,
                  });
                }}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
      <Modal
        title={t('logs.settings.pageLoadMode.title')}
        visible={pageLoadModeModalVisible}
        onOk={() => {
          updateOptions(
            {
              pageLoadMode,
            },
            true,
          );
          setPageLoadModeModalVisible(false);
        }}
        onCancel={() => {
          setPageLoadModeModalVisible(false);
        }}
      >
        <Form>
          <Form.Item>
            <Radio.Group
              buttonStyle='solid'
              value={pageLoadMode}
              onChange={(e) => {
                setPageLoadMode(e.target.value);
              }}
            >
              <Radio value='pagination'>{t('logs.settings.pageLoadMode.pagination')}</Radio>
              <Radio value='infiniteScroll'>{t('logs.settings.pageLoadMode.infiniteScroll')}</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
