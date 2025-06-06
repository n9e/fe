import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Space, Switch, Dropdown, Menu, Modal, Form, Radio, Row, Col, Popover, InputNumber, Tooltip } from 'antd';
import {
  CaretUpOutlined,
  CaretDownOutlined,
  SettingOutlined,
  PlusSquareOutlined,
  CloseSquareOutlined,
  CaretRightOutlined,
  CopyOutlined,
  MoreOutlined,
  LeftOutlined,
  RightOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { copyToClipBoard } from '@/utils';

interface Props {
  data: {
    [index: string]: string | number;
  }[];
  options: any;
  paginationOptions: any;
  dateField?: string;
  timeField?: boolean;
}

function RenderValue({ value }) {
  const { t } = useTranslation('db_aliyunSLS');
  const [expand, setExpand] = useState(false);
  if (typeof value === 'string' && value.indexOf('\n') > -1) {
    const lines = !expand ? _.slice(value.split('\n'), 0, 18) : value.split('\n');
    return (
      <div className='sls-discover-origin-field-val'>
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
  return <div className='sls-discover-origin-field-val'>{value}</div>;
}

function SubJSON({ label, subJSON, options, currentExpandLevel }) {
  const [expand, setExpand] = useState(currentExpandLevel <= options.jsonExpandLevel);

  useEffect(() => {
    setExpand(currentExpandLevel <= options.jsonExpandLevel);
  }, [options.jsonExpandLevel]);

  if (options.jsonDisplaType === 'tree') {
    return (
      <li className='sls-discover-origin-li'>
        <div className='sls-discover-origin-field-subjson'>
          <div
            onClick={() => {
              setExpand(!expand);
            }}
            className='sls-discover-origin-field-subjson-key'
          >
            {expand ? <CaretDownOutlined /> : <CaretRightOutlined />}
            <span
              className='sls-discover-origin-field-key'
              style={{
                marginLeft: '2px',
              }}
            >
              {label}
            </span>
          </div>
          <div className='sls-discover-origin-field-json-symbol'>{`{}`}</div>
        </div>
        {expand && (
          <ul>
            {_.map(subJSON, (v, k) => {
              if (_.isPlainObject(v) || _.isArray(v)) {
                return (
                  <ul className='sls-discover-origin-ul'>
                    {_.isEmpty(v) ? (
                      <>
                        <div className='sls-discover-origin-field-key'>{k}</div>:<div className='sls-discover-origin-field-val'>{`[]`}</div>
                      </>
                    ) : (
                      _.map(_.isArray(v) ? v : [v], (item, idx) => {
                        return <SubJSON key={idx} label={k} subJSON={item} options={options} currentExpandLevel={currentExpandLevel + 1} />;
                      })
                    )}
                  </ul>
                );
              }
              return (
                <li key={k}>
                  <div className='sls-discover-origin-field-key'>{k}</div>:<RenderValue value={v} />
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
      <li className='sls-discover-origin-li'>
        <div className='sls-discover-origin-field-key'>{label}</div>:<div className='sls-discover-origin-field-val'>{JSON.stringify(subJSON)}</div>
      </li>
    );
  }
  return null;
}

export default function RawList(props: Props) {
  const { t } = useTranslation('db_aliyunSLS');
  const { data, options, paginationOptions, dateField = '__time__', timeField = true } = props;

  return (
    <div
      style={{
        overflowY: dateField ? 'visible' : 'auto',
        height: 'calc(100% - 144px)',
      }}
    >
      {_.map(data, (item, index) => {
        return (
          <div
            key={index}
            style={{
              display: 'flex',
              flexFlow: 'row nowrap',
              padding: 10,
              gap: 10,
            }}
          >
            <div>
              <Space>
                {paginationOptions.pageSize * (paginationOptions.current - 1) + index + 1}
                {timeField && <b>{_.isNumber(item[dateField]) ? moment.unix(_.toNumber(item[dateField])).format('MM-DD HH:mm:ss') : item[dateField]}</b>}
              </Space>
            </div>
            <div
              style={{
                flex: 1,
                width: '100%',
              }}
            >
              <div>
                <Space style={{ marginBottom: 4 }}>
                  <CopyOutlined
                    style={{
                      fontSize: 14,
                      color: '#999',
                    }}
                    onClick={() => {
                      copyToClipBoard(JSON.stringify(item));
                    }}
                  />
                  <Popover
                    trigger={['click']}
                    content={
                      <>
                        {_.map(
                          _.filter(_.keys(item), (key) => _.startsWith(key, '__') && _.endsWith(key, '__') && key !== dateField),
                          (key) => {
                            return (
                              <div key={key}>
                                <div className='sls-discover-origin-field-key'>{key}</div>:<div className='sls-discover-origin-field-val'>{item[key]}</div>
                              </div>
                            );
                          },
                        )}
                      </>
                    }
                    title={t('logs.tagsDetail')}
                  >
                    <div
                      style={{
                        border: '1px solid #d9d9d9',
                        borderRadius: 2,
                        padding: '2px 3px',
                        lineHeight: 1,
                        cursor: 'pointer',
                      }}
                    >
                      <MoreOutlined rotate={90} />
                    </div>
                  </Popover>
                  {item.__source__ && (
                    <div
                      style={{
                        border: '1px solid #d9d9d9',
                        borderRadius: 2,
                        padding: '2px 3px',
                        lineHeight: 1,
                        color: '#999',
                      }}
                    >
                      {item.__source__}
                    </div>
                  )}
                </Space>
              </div>
              {_.map(_.chain(item).toPairs().sortBy(0).fromPairs().value(), (val, key) => {
                if (_.startsWith(key, '__') && _.endsWith(key, '__')) {
                  return null;
                }
                if (!_.isEmpty(options.organizeFields) && !_.includes(options.organizeFields, key)) {
                  return null;
                }
                const valToObj = _.attempt(JSON.parse.bind(null, val));
                const subJSON = _.isArray(valToObj) ? valToObj : [valToObj];
                return (
                  <div
                    key={key}
                    className={classNames({
                      'sls-discover-origin-inline-cell': options.lineBreak !== 'true',
                      'sls-discover-origin-break-cell': options.lineBreak === 'true',
                    })}
                  >
                    {_.isPlainObject(valToObj) || _.isArray(valToObj) ? (
                      <ul className='sls-discover-origin-ul'>
                        {_.isEmpty(subJSON) ? (
                          <>
                            <div className='sls-discover-origin-field-key'>{key}</div>:<div className='sls-discover-origin-field-val'>{`[]`}</div>
                          </>
                        ) : (
                          _.map(_.isArray(valToObj) ? valToObj : [valToObj], (item, idx) => {
                            return <SubJSON key={idx} label={key} subJSON={item} options={options} currentExpandLevel={1} />;
                          })
                        )}
                      </ul>
                    ) : (
                      <>
                        <div className='sls-discover-origin-field-key'>{key}</div>:<RenderValue value={val} />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function getFields(logs, DateField = '__time__') {
  const fields: string[] = [];
  _.forEach(logs, (log) => {
    _.forEach(log, (_val, key) => {
      if (fields.indexOf(key) === -1 && key !== DateField) {
        fields.push(key);
      }
    });
  });
  return _.sortBy(fields);
}

export function OriginSettings({ options, setOptions, fields, onReverseChange }: { options: any; setOptions: any; fields: string[]; onReverseChange?: any }) {
  const { t } = useTranslation('db_aliyunSLS');
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
        {onReverseChange && (
          <div
            className='ant-table-column-sorters'
            style={{
              position: 'relative',
              cursor: 'pointer',
            }}
            onClick={() => {
              setOptions({
                reverse: options.reverse === 'true' ? 'false' : 'true',
              });
              onReverseChange(options.reverse === 'true' ? 'false' : 'true');
            }}
          >
            {t('logs.settings.reverse')}
            <span className='ant-table-column-sorter'>
              <span className='ant-table-column-sorter-inner'>
                <CaretUpOutlined
                  className={classNames({
                    'ant-table-column-sorter-up': true,
                    active: options.reverse === 'false',
                  })}
                />
                <CaretDownOutlined
                  className={classNames({
                    'ant-table-column-sorter-down': true,
                    active: options.reverse === 'true',
                  })}
                />
              </span>
            </span>
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
                  key: 'jsonSettingsBtn',
                  label: (
                    <a
                      onClick={() => {
                        setJsonSettingsModalVisible(true);
                      }}
                    >
                      {t('logs.settings.jsonSettings.title')}
                    </a>
                  ),
                },
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
                  border: '1px solid #efefef',
                  borderBottom: '0 none',
                  padding: '8px 16px',
                }}
              >
                <h3 style={{ margin: 0 }}>{t('logs.settings.organizeFields.allFields')}</h3>
              </div>
              <div style={{ border: '1px solid #efefef', padding: 16, overflowY: 'auto', height: 300 }}>
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
                  border: '1px solid #efefef',
                  borderBottom: '0 none',
                  padding: '8px 16px',
                }}
              >
                <h3 style={{ margin: 0 }}>{t('logs.settings.organizeFields.showFields')}</h3>
              </div>
              <div style={{ border: '1px solid #efefef', padding: 16, overflowY: 'auto', height: 450 }}>
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
