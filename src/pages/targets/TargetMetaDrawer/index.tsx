import React, { useContext, useEffect, useState } from 'react';
import { Drawer, Tabs, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { Tooltip, Space } from 'antd';
import { DownOutlined, RightOutlined, CopyOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { copyToClipBoard } from '@/utils';
import { CommonStateContext } from '@/App';
import { getTargetInformationByIdent } from '../services';
import './style.less';

interface IProps {
  ident: string;
  targetNode?: React.ReactNode;
  /** 仅渲染抽屉，由父组件控制开关（如表格整行点击打开元信息） */
  drawerOnly?: boolean;
  drawerOpen?: boolean;
  onDrawerOpenChange?: (open: boolean) => void;
  /**
   * 抽屉顶部的出口。这里过去只有元信息、一个链接都没有 —— 用户点开一台机器，
   * 看完一堆键值对就没有然后了。具体给哪些出口由调用方决定：机器列表能给「这台机器的
   * 采集配置」，是因为那个抽屉在 plus 里，本组件不该知道它的存在。
   */
  extraActions?: React.ReactNode;
  /**
   * 额外的页签。不传时抽屉与过去渲染得一模一样（不套 Tabs），
   * 传了才把现有的元信息收成「概览」页签、其余接在后面。
   *
   * 与 extraActions 同一个道理：具体有哪些页签由调用方决定。机器列表能给
   * 「这台机器的拓扑」，是因为那个视图在 plus 里，本组件不该知道它的存在。
   */
  extraTabs?: { key: string; label: React.ReactNode; children: React.ReactNode }[];
}

function bytesToSize(bytes, precision) {
  bytes = parseInt(bytes);
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  let posttxt = 0;
  if (bytes == 0) return '0.00';
  while (bytes >= 1024) {
    posttxt++;
    bytes = bytes / 1024;
  }
  return bytes.toFixed(precision) + ' ' + sizes[posttxt];
}

function RenderInterfaces({ value }) {
  const { darkMode } = useContext(CommonStateContext);
  const { t } = useTranslation('targets');
  const [expand, setExpand] = useState(false);

  return (
    <div>
      <div
        className='cursor-pointer text-hint'
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
                          color={darkMode ? 'rgb(50 53 69)' : '#f4f4f5'}
                          onClick={() => {
                            copyToClipBoard(v);
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
  const { darkMode } = useContext(CommonStateContext);
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
              <Tag color={darkMode ? 'rgb(50 53 69)' : '#f4f4f5'}>{item.mounted_on}</Tag>
            </div>
            <div className='target-information-filesystem-kb_size'>{bytesToSize(item.kb_size * 1024, 2)}</div>
          </div>
        );
      })}
    </>
  );
}

function Group({ name, data }) {
  const { t } = useTranslation('targets');
  const [expand, setExpand] = useState(true);
  const { darkMode } = useContext(CommonStateContext);

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
                copyToClipBoard(JSON.stringify(data));
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
                          color={darkMode ? 'rgb(50 53 69)' : '#f4f4f5'}
                          onClick={() => {
                            copyToClipBoard(value);
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
  const { ident, targetNode, drawerOnly, drawerOpen, onDrawerOpenChange, extraActions, extraTabs } = props;
  const [visible, setVisible] = useState(false);
  const groupsName = ['platform', 'cpu', 'memory', 'network', 'filesystem'];
  const [information, setInformation] = useState({});

  const drawerVisible = drawerOnly ? !!drawerOpen : visible;

  useEffect(() => {
    if (!drawerOnly || !drawerOpen || !ident) return;
    getTargetInformationByIdent(ident).then((res) => {
      setInformation(res);
    });
  }, [drawerOnly, drawerOpen, ident]);

  const handleClose = () => {
    if (drawerOnly) {
      onDrawerOpenChange?.(false);
    } else {
      setVisible(false);
    }
  };

  const handleTriggerClick = () => {
    setVisible(true);
    getTargetInformationByIdent(ident).then((res) => {
      setInformation(res);
    });
  };

  // 元信息本体。抽成变量是为了让它既能直接渲染（没有额外页签时），
  // 又能作为「概览」页签的内容，两条路径共用同一段。
  const meta = _.map(groupsName, (groupName) => <Group key={groupName} name={groupName} data={information[groupName]} />);

  return (
    <>
      {!drawerOnly && (
        <Tooltip title={t('meta_tip')} placement='left'>
          {targetNode ? <span onClick={handleTriggerClick}>{targetNode}</span> : <a onClick={handleTriggerClick}>{ident}</a>}
        </Tooltip>
      )}
      <Drawer destroyOnClose title={t('meta_title')} width={800} placement='right' onClose={handleClose} visible={drawerVisible} className='n9e-antd-drawer'>
        {extraActions && <div className='mb-3 flex flex-wrap items-center gap-3'>{extraActions}</div>}
        {/* 没有额外页签时不套 Tabs：抽屉要和过去长得一模一样，开源构建下
            plus 的页签解析成空，走的就是这条分支。
            用 TabPane 子元素而不是 items：本仓库的 antd 版本还不支持 items，
            网设详情抽屉也是这个写法 */}
        {_.isEmpty(extraTabs) ? (
          meta
        ) : (
          <Tabs destroyInactiveTabPane>
            <Tabs.TabPane key='meta' tab={t('meta_tab_overview')}>
              {meta}
            </Tabs.TabPane>
            {_.map(extraTabs, (tab) => (
              <Tabs.TabPane key={tab.key} tab={tab.label}>
                {tab.children}
              </Tabs.TabPane>
            ))}
          </Tabs>
        )}
      </Drawer>
    </>
  );
}
