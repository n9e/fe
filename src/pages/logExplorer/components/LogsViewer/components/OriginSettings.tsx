/**
 * 日志展示相关选项的组件
 * 包括：是否显示时间字段、是否折行显示、字段展示和顺序等
 */

import React from 'react';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { Space, Switch, Dropdown, Menu, Modal, Form, Radio, InputNumber, Tooltip } from 'antd';
import _ from 'lodash';
import { SettingOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

import TableColumnSelect from '@/components/TableColumnSelect';

import { NAME_SPACE } from '../../../constants';
import { OptionsType } from '../types';

export default forwardRef(function OriginSettings(
  props: {
    options: OptionsType;
    updateOptions: (options: any, reload?: boolean) => void;
    fields: string[];
    showDateField?: boolean;
    showPageLoadMode?: boolean;
    organizeFields?: string[];
    setOrganizeFields?: (value?: string[]) => void;
  },
  ref,
) {
  const { t } = useTranslation(NAME_SPACE);
  const { options, updateOptions, fields, showDateField, showPageLoadMode } = props;

  const [organizeFieldsModalVisible, setOrganizeFieldsModalVisible] = useState(false);
  const [organizeFields, setOrganizeFields] = useState<string[] | undefined>(props.organizeFields);

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
  }, [JSON.stringify(options)]);

  useEffect(() => {
    setOrganizeFields(props.organizeFields);
  }, [props.organizeFields]);

  useImperativeHandle(
    ref,
    () => {
      return {
        setOrganizeFieldsModalVisible(newVisible: boolean) {
          setOrganizeFieldsModalVisible(newVisible);
        },
      };
    },
    [],
  );

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
              items={_.concat(
                [
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
                ],
                showPageLoadMode
                  ? [
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
                    ]
                  : [],
              )}
            />
          }
          trigger={['click']}
        >
          <SettingOutlined />
        </Dropdown>
        {!_.isEmpty(organizeFields) && (
          <Tooltip title={`当前只显示字段 ${_.join(organizeFields, '、')}，可点击设置图标设置显示所有字段`}>
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
          props.setOrganizeFields?.(organizeFields);
          setOrganizeFieldsModalVisible(false);
        }}
        onCancel={() => {
          setOrganizeFields(props.organizeFields);
          setOrganizeFieldsModalVisible(false);
        }}
      >
        <TableColumnSelect
          options={_.map(fields, (item) => {
            return {
              label: item,
              value: item,
            };
          })}
          value={organizeFields ?? []}
          onChange={(value) => {
            setOrganizeFields(value);
          }}
          sortable={true}
          showDropdown={false}
          maxHeight={400}
        />
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
});
