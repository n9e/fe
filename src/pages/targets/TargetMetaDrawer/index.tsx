import React, { useState } from 'react';
import { Drawer, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { Tooltip, Space } from 'antd';
import { DownOutlined, RightOutlined, CopyOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { copyToClipBoard } from '@/utils';
import { getTargetInformationByIdent } from '../services';
import './style.less';

interface IProps {
  ident: string;
}

function bytesToSize(bytes, precision) {
  bytes = parseInt(bytes);
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  let posttxt = 0;
  if (bytes == 0) return '0.00';
  while (bytes >= 1000) {
    posttxt++;
    bytes = bytes / 1000;
  }
  return bytes.toFixed(precision) + ' ' + sizes[posttxt];
}

function RenderInterfaces({ value }) {
  const { t } = useTranslation('targets');
  const [expand, setExpand] = useState(false);

  return (
    <div>
      <div
        style={{
          cursor: 'pointer',
          color: 'rgba(28, 43, 52, .68)',
        }}
        onClick={() => {
          setExpand(!expand);
        }}
      >
        {expand ? (
          <span>
            {t('meta_collapse')} <DownOutlined />
          </span>
        ) : (
          <span>
            {t('meta_expand')} <RightOutlined />
          </span>
        )}
      </div>
      {expand &&
        _.map(value, (item, index) => {
          return (
            <div key={index} className='target-information-interface'>
              {_.map(item, (v, k) => {
                return (
                  <div key={k} className='target-information-interface-item'>
                    <div className='target-information-interface-item-key'>{k}</div>
                    <div className='target-information-interface-item-value'>
                      <Tooltip title={t('meta_value_click_to_copy')} placement='right'>
                        <Tag
                          color='#f4f4f5'
                          onClick={() => {
                            copyToClipBoard(v, t);
                          }}
                        >
                          {v}
                        </Tag>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
    </div>
  );
}

function RenderFilesystem({ value }) {
  return (
    <>
      {_.map(value, (item, index) => {
        return (
          <div key={index} className='target-information-filesystem'>
            <div key={index} className='target-information-filesystem-name'>
              {item.name}
            </div>
            <div className='target-information-filesystem-mounted_on'>mounted on</div>
            <div className='target-information-filesystem-mounted_on-value'>
              <Tag color='#f4f4f5'>{item.mounted_on}</Tag>
            </div>
            <div className='target-information-filesystem-kb_size'>{bytesToSize(item.kb_size * 1000, 2)}</div>
          </div>
        );
      })}
    </>
  );
}

function Group({ name, data }) {
  const { t } = useTranslation('targets');
  const [expand, setExpand] = useState(true);

  return (
    <div key={name} className='target-information-group'>
      <div className='target-information-group-header'>
        <Space>
          <Space
            onClick={() => {
              setExpand(!expand);
            }}
            style={{
              cursor: 'pointer',
            }}
          >
            {expand ? <DownOutlined /> : <RightOutlined />}
            <span className='target-information-group-header-title'>{_.toUpper(name)}</span>
          </Space>
          {data && (
            <CopyOutlined
              onClick={() => {
                copyToClipBoard(JSON.stringify(data), t);
              }}
            />
          )}
        </Space>
      </div>
      {!data && <div className='target-information-group-content'>{t('meta_no_data')}</div>}
      {expand && (
        <div className='target-information-group-content'>
          {name === 'filesystem' ? (
            <RenderFilesystem value={data} />
          ) : (
            _.map(data, (value, key) => {
              let val = value;
              if (name === 'memory' && _.includes(['total', 'swap_total'], key)) {
                val = bytesToSize(value, 2);
              }
              return (
                <div key={key} className='target-information-group-content-item'>
                  <div className='target-information-group-content-item-key'>{key}</div>
                  {_.isString(value) && (
                    <div className='target-information-group-content-item-value'>
                      <Tooltip title={t('meta_value_click_to_copy')} placement='right'>
                        <Tag
                          color='#f4f4f5'
                          onClick={() => {
                            copyToClipBoard(value, t);
                          }}
                        >
                          {val}
                        </Tag>
                      </Tooltip>
                    </div>
                  )}
                  {_.isArray(value) && key === 'interfaces' && <RenderInterfaces value={value} />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function TargetMetaDrawer(props: IProps) {
  const { t } = useTranslation('targets');
  let { ident } = props;
  const [visible, setVisible] = useState(false);
  const groupsName = ['platform', 'cpu', 'memory', 'network', 'filesystem'];
  const [information, setInformation] = useState({});

  return (
    <>
      <Tooltip title={t('meta_tip')}>
        <a
          onClick={() => {
            setVisible(true);
            getTargetInformationByIdent(ident).then((res) => {
              setInformation(res);
            });
          }}
        >
          {ident}
        </a>
      </Tooltip>
      <Drawer
        destroyOnClose
        title={t('meta_title')}
        width={800}
        placement='right'
        onClose={() => {
          setVisible(false);
        }}
        visible={visible}
      >
        {_.map(groupsName, (groupName) => {
          return <Group key={groupName} name={groupName} data={information[groupName]} />;
        })}
      </Drawer>
    </>
  );
}
