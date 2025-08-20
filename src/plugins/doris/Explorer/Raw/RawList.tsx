import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Space, Switch, Dropdown, Menu, Modal, Form, Radio, Row, Col, Table, InputNumber, Tooltip, Popover } from 'antd';
import {
  CaretDownOutlined,
  SettingOutlined,
  PlusSquareOutlined,
  CloseSquareOutlined,
  CaretRightOutlined,
  LeftOutlined,
  RightOutlined,
  EyeInvisibleOutlined,
  DownOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import CodeMirror from '@/components/CodeMirror';
import { EditorView } from '@codemirror/view';
import { foldGutter } from '@codemirror/fold';
import { json } from '@codemirror/lang-json';
import { defaultHighlightStyle } from '@codemirror/highlight';
import { NAME_SPACE } from '../../constants';
import LogView from './LogView';
import { filteredFields } from '../utils';

interface Props {
  data: {
    [index: string]: string;
  }[];
  options: any;
  onReverseChange: (reverse: string) => void;
  onValueFilter: (parmas: { key: string; value: string; operator: 'AND' | 'NOT' }) => void;
}

export function FieldValueWithFilter({ name, value, onValueFilter }) {
  const { t } = useTranslation(NAME_SPACE);
  const [popoverVisible, setPopoverVisible] = useState(false);
  return (
    <Popover
      visible={popoverVisible}
      onVisibleChange={(visible) => {
        setPopoverVisible(visible);
      }}
      trigger={['click']}
      overlayClassName='explorer-origin-field-val-popover'
      content={
        <ul className='ant-dropdown-menu ant-dropdown-menu-root ant-dropdown-menu-vertical ant-dropdown-menu-light'>
          <li
            className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
            onClick={() => {
              setPopoverVisible(false);
              onValueFilter({
                key: name,
                value,
                operator: 'AND',
              });
            }}
          >
            <Space>
              <PlusCircleOutlined />
              {t('logs.filterAnd')}
            </Space>
          </li>
          <li
            className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
            onClick={() => {
              setPopoverVisible(false);
              onValueFilter({
                key: name,
                value,
                operator: 'NOT',
              });
            }}
          >
            <Space>
              <MinusCircleOutlined />
              {t('logs.filterNot')}
            </Space>
          </li>
        </ul>
      }
    >
      <div className='explorer-origin-field-val'>{value}</div>
    </Popover>
  );
}

function RenderValue({ name, value, onValueFilter }) {
  const { t } = useTranslation(NAME_SPACE);
  const [expand, setExpand] = useState(false);

  if (typeof value === 'string' && value.indexOf('\n') > -1) {
    const lines = !expand ? _.slice(value.split('\n'), 0, 18) : value.split('\n');
    return (
      <div className='explorer-origin-field-val'>
        {_.map(lines, (v, idx) => {
          return (
            <div key={idx}>
              {v}
              {idx === lines.length - 1 && (
                <a
                  onClick={() => {
                    setExpand(!expand);
                  }}
                  style={{
                    marginLeft: 8,
                  }}
                >
                  {expand ? t('logs.collapse') : t('logs.expand')}
                  {expand ? <LeftOutlined /> : <RightOutlined />}
                </a>
              )}

              <br />
            </div>
          );
        })}
      </div>
    );
  }

  return <FieldValueWithFilter name={name} value={value} onValueFilter={onValueFilter} />;
}

function SubJSON({ label, subJSON, options, currentExpandLevel, onValueFilter }) {
  const [expand, setExpand] = useState(currentExpandLevel <= options.jsonExpandLevel);

  useEffect(() => {
    setExpand(currentExpandLevel <= options.jsonExpandLevel);
  }, [options.jsonExpandLevel]);

  if (options.jsonDisplaType === 'tree') {
    return (
      <li className='explorer-origin-li'>
        <div className='explorer-origin-field-subjson'>
          <div
            onClick={() => {
              setExpand(!expand);
            }}
            className='explorer-origin-field-subjson-key'
          >
            {expand ? <CaretDownOutlined /> : <CaretRightOutlined />}
            <span
              className='explorer-origin-field-key'
              style={{
                marginLeft: '2px',
              }}
            >
              {label}
            </span>
          </div>
          <div className='explorer-origin-field-json-symbol'>{`{}`}</div>
        </div>
        {expand && (
          <ul>
            {_.map(subJSON, (v, k) => {
              if (_.isPlainObject(v) || _.isArray(v)) {
                return (
                  <ul className='explorer-origin-ul'>
                    {_.isEmpty(v) ? (
                      <>
                        <div className='explorer-origin-field-key'>{k}</div>:<div className='explorer-origin-field-val'>{`[]`}</div>
                      </>
                    ) : (
                      _.map(_.isArray(v) ? v : [v], (item, idx) => {
                        return <SubJSON key={idx} label={k} subJSON={item} options={options} currentExpandLevel={currentExpandLevel + 1} onValueFilter={onValueFilter} />;
                      })
                    )}
                  </ul>
                );
              }
              return (
                <li key={k}>
                  <div className='explorer-origin-field-key'>{k}</div>:<RenderValue name={k} value={v} onValueFilter={onValueFilter} />
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  }
  if (options.jsonDisplaType === 'string') {
    return (
      <li className='explorer-origin-li'>
        <div className='explorer-origin-field-key'>{label}</div>:<div className='explorer-origin-field-val'>{JSON.stringify(subJSON)}</div>
      </li>
    );
  }
  return null;
}

export default function RawList(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { data, options, onReverseChange, onValueFilter } = props;
  const columns: any[] = [
    {
      title: t('logs.title'),
      render: (item) => {
        let fields = filteredFields(_.keys(item), options.organizeFields);
        fields = !_.isEmpty(options.organizeFields) ? _.intersection(fields, options.organizeFields) : fields;

        return (
          <div
            style={{
              flex: 1,
              width: '100%',
            }}
          >
            {_.map(fields, (key) => {
              const val = item[key];
              if (key === 'content') {
                return (
                  <div
                    key={key}
                    className={classNames({
                      'explorer-origin-inline-cell': options.lineBreak !== 'true',
                      'explorer-origin-break-cell': options.lineBreak === 'true',
                      'explorer-origin-cell-content': true,
                    })}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 8,
                    }}
                  >
                    <div
                      className='explorer-origin-field-key'
                      style={{
                        color: 'var(--fc-fill-alert)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {key}:
                    </div>
                    <div
                      style={{
                        position: 'relative',
                        top: -4,
                      }}
                    >
                      <CodeMirror
                        value={val}
                        height='auto'
                        basicSetup={false}
                        editable={false}
                        extensions={[defaultHighlightStyle.fallback, json(), foldGutter(), EditorView.lineWrapping]}
                      />
                    </div>
                  </div>
                );
              }
              const valToObj = val;
              const subJSON = _.isArray(valToObj) ? valToObj : [valToObj];
              return (
                <div
                  key={key}
                  className={classNames({
                    'explorer-origin-inline-cell': options.lineBreak !== 'true',
                    'explorer-origin-break-cell': options.lineBreak === 'true',
                  })}
                >
                  {_.isPlainObject(valToObj) || _.isArray(valToObj) ? (
                    <ul className='explorer-origin-ul'>
                      {_.isEmpty(subJSON) ? (
                        <>
                          <div className='explorer-origin-field-key'>{key}</div>: <div className='explorer-origin-field-val'>{`[]`}</div>
                        </>
                      ) : (
                        _.map(_.isArray(valToObj) ? valToObj : [valToObj], (item, idx) => {
                          return <SubJSON key={idx} label={key} subJSON={item} options={options} currentExpandLevel={1} onValueFilter={onValueFilter} />;
                        })
                      )}
                    </ul>
                  ) : (
                    <>
                      <div className='explorer-origin-field-key'>{key}</div>: <RenderValue name={key} value={val} onValueFilter={onValueFilter} />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        );
      },
    },
  ];

  if (options.lines === 'true') {
    columns.unshift({
      title: t('logs.settings.lines'),
      width: 50,
      render: (_record, _row, index) => {
        return index + 1;
      },
    });
  }

  return (
    <Table
      className='n9e-event-logs-table'
      rowKey='___id___'
      size='small'
      pagination={false}
      expandable={{
        expandedRowRender: (record) => {
          return <LogView value={record} onValueFilter={onValueFilter} />;
        },
        expandIcon: ({ expanded, onExpand, record }) => (expanded ? <DownOutlined onClick={(e) => onExpand(record, e)} /> : <RightOutlined onClick={(e) => onExpand(record, e)} />),
      }}
      scroll={{ y: 'calc(100% - 40px)' }}
      dataSource={data}
      columns={columns}
    />
  );
}

export function OriginSettings({ options, setOptions, fields, onReverseChange }) {
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
