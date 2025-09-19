import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Space, Switch, Dropdown, Menu, Modal, Row, Col, Form, Radio, InputNumber, Tooltip } from 'antd';
import _ from 'lodash';
import { SettingOutlined, EyeInvisibleOutlined, PlusSquareOutlined, CloseSquareOutlined } from '@ant-design/icons';

import { NAME_SPACE } from '../../constants';

export default function OriginSettings({
  options,
  setOptions,
  fields,
  showDateField,
}: {
  options: any;
  setOptions: (options: any) => void;
  fields: string[];
  showDateField?: boolean;
}) {
  const { t } = useTranslation(NAME_SPACE);
  const [organizeFieldsModalVisible, setOrganizeFieldsModalVisible] = useState(false);
  const [jsonSettingsModalVisible, setJsonSettingsModalVisible] = useState(false);
  const [jsonSettings, setJsonSettings] = useState({
    jsonDisplaType: options.jsonDisplaType,
    jsonExpandLevel: options.jsonExpandLevel,
  });
  const [organizeFields, setOrganizeFields] = useState(options.organizeFields);

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
                setOptions({
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
              setOptions({
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
                setOptions({
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
          setOptions({
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
          setOptions(jsonSettings);
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
    </>
  );
}
