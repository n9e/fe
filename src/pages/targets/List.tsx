import React, { useState, useRef } from 'react';
import { Table, Tag, Tooltip, Space, Input, Dropdown, Menu, Button, Modal, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { SearchOutlined, DownOutlined, ReloadOutlined, CopyOutlined } from '@ant-design/icons';
import { useAntdTable } from 'ahooks';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { BusiGroupItem } from '@/store/commonInterface';
import { getMonObjectList } from '@/services/targets';
import { timeFormatter } from '@/pages/dashboard/Renderer/utils/valueFormatter';
import clipboard from './clipboard';
import OrganizeColumns from './OrganizeColumns';
import { getDefaultColumnsConfigs, setDefaultColumnsConfigs } from './utils';

export const pageSizeOptions = ['10', '20', '50', '100'];

enum OperateType {
  BindTag = 'bindTag',
  UnbindTag = 'unbindTag',
  UpdateBusi = 'updateBusi',
  RemoveBusi = 'removeBusi',
  UpdateNote = 'updateNote',
  Delete = 'delete',
  None = 'none',
}

interface ITargetProps {
  id: number;
  cluster: string;
  group_id: number;
  group_obj: object | null;
  ident: string;
  note: string;
  tags: string[];
  update_at: number;
}

interface IProps {
  curBusiId: number;
  selectedIdents: string[];
  setSelectedIdents: (selectedIdents: string[]) => void;
  selectedRowKeys: any[];
  setSelectedRowKeys: (selectedRowKeys: any[]) => void;
  refreshFlag: string;
  setRefreshFlag: (refreshFlag: string) => void;
  setOperateType: (operateType: OperateType) => void;
}

const GREEN_COLOR = '#3FC453';
const YELLOW_COLOR = '#FF9919';
const RED_COLOR = '#FF656B';

export default function List(props: IProps) {
  const { t } = useTranslation('targets');
  const { curBusiId, selectedIdents, setSelectedIdents, selectedRowKeys, setSelectedRowKeys, refreshFlag, setRefreshFlag, setOperateType } = props;
  const isAddTagToQueryInput = useRef(false);
  const [searchVal, setSearchVal] = useState('');
  const [tableQueryContent, setTableQueryContent] = useState<string>('');
  const [columnsConfigs, setColumnsConfigs] = useState<{ name: string; visible: boolean }[]>(getDefaultColumnsConfigs());
  const columns: ColumnsType<any> = [
    {
      title: (
        <Space>
          {t('common:table.ident')}
          <Dropdown
            trigger={['click']}
            overlay={
              <Menu
                onClick={async ({ key }) => {
                  let tobeCopy = _.map(tableProps.dataSource, (item) => item.ident);
                  if (key === 'all') {
                    try {
                      const result = await featchData({ current: 1, pageSize: tableProps.pagination.total });
                      tobeCopy = _.map(result.list, (item) => item.ident);
                    } catch (error) {
                      console.error(error);
                    }
                  } else if (key === 'selected') {
                    tobeCopy = selectedIdents;
                  }

                  if (_.isEmpty(tobeCopy)) {
                    message.warn(t('copy.no_data'));
                    return;
                  }

                  const tobeCopyStr = _.join(tobeCopy, '\n');
                  const copySucceeded = clipboard(tobeCopyStr);

                  if (copySucceeded) {
                    message.success(t('ident_copy_success', { num: tobeCopy.length }));
                  } else {
                    Modal.warning({
                      title: t('host.copy.error'),
                      content: <Input.TextArea defaultValue={tobeCopyStr} />,
                    });
                  }
                }}
              >
                <Menu.Item key='current_page'>{t('copy.current_page')}</Menu.Item>
                <Menu.Item key='all'>{t('copy.all')}</Menu.Item>
                <Menu.Item key='selected'>{t('copy.selected')}</Menu.Item>
              </Menu>
            }
          >
            <CopyOutlined
              style={{
                cursor: 'pointer',
              }}
            />
          </Dropdown>
        </Space>
      ),
      dataIndex: 'ident',
    },
  ];

  _.forEach(columnsConfigs, (item) => {
    if (!item.visible) return;
    if (item.name === 'tags') {
      columns.push({
        title: t('tags'),
        dataIndex: 'tags',
        ellipsis: {
          showTitle: false,
        },
        render(tagArr) {
          const content =
            tagArr &&
            tagArr.map((item) => (
              <Tag
                color='purple'
                key={item}
                onClick={(e) => {
                  if (!tableQueryContent.includes(item)) {
                    isAddTagToQueryInput.current = true;
                    const val = tableQueryContent ? `${tableQueryContent.trim()} ${item}` : item;
                    setTableQueryContent(val);
                    setSearchVal(val);
                  }
                }}
              >
                {item}
              </Tag>
            ));
          return (
            tagArr && (
              <Tooltip title={content} placement='topLeft' getPopupContainer={() => document.body} overlayClassName='mon-manage-table-tooltip'>
                {content}
              </Tooltip>
            )
          );
        },
      });
    }
    if (item.name === 'group_obj') {
      columns.push({
        title: t('group_obj'),
        dataIndex: 'group_obj',
        render(groupObj: BusiGroupItem | null) {
          return groupObj ? groupObj.name : t('not_grouped');
        },
      });
    }
    if (item.name === 'target_up') {
      columns.push({
        title: t('target_up'),
        width: 100,
        dataIndex: 'target_up',
        sorter: (a, b) => a.target_up - b.target_up,
        render(text) {
          if (text > 0) {
            return (
              <div
                className='table-td-fullBG'
                style={{
                  backgroundColor: GREEN_COLOR,
                }}
              >
                UP
              </div>
            );
          } else if (text < 1) {
            return (
              <div
                className='table-td-fullBG'
                style={{
                  backgroundColor: RED_COLOR,
                }}
              >
                DOWN
              </div>
            );
          }
          return null;
        },
      });
    }
    if (item.name === 'mem_util') {
      columns.push({
        title: t('mem_util'),
        width: 100,
        dataIndex: 'mem_util',
        sorter: (a, b) => a.mem_util - b.mem_util,
        render(text, reocrd) {
          if (reocrd.cpu_num === -1) return 'unknown';
          let backgroundColor = GREEN_COLOR;
          if (text > 70) {
            backgroundColor = YELLOW_COLOR;
          }
          if (text > 85) {
            backgroundColor = RED_COLOR;
          }
          return (
            <div
              className='table-td-fullBG'
              style={{
                backgroundColor: backgroundColor,
              }}
            >
              {_.floor(text, 1)}%
            </div>
          );
        },
      });
    }
    if (item.name === 'cpu_util') {
      columns.push({
        title: t('cpu_util'),
        width: 100,
        dataIndex: 'cpu_util',
        sorter: (a, b) => a.cpu_util - b.cpu_util,
        render(text, reocrd) {
          if (reocrd.cpu_num === -1) return 'unknown';
          let backgroundColor = GREEN_COLOR;
          if (text > 70) {
            backgroundColor = YELLOW_COLOR;
          }
          if (text > 85) {
            backgroundColor = RED_COLOR;
          }
          return (
            <div
              className='table-td-fullBG'
              style={{
                backgroundColor: backgroundColor,
              }}
            >
              {_.floor(text, 1)}%
            </div>
          );
        },
      });
    }
    if (item.name === 'cpu_num') {
      columns.push({
        title: t('cpu_num'),
        width: 100,
        dataIndex: 'cpu_num',
        sorter: (a, b) => a.cpu_num - b.cpu_num,
        render: (val, reocrd) => {
          if (reocrd.cpu_num === -1) return 'unknown';
          return val;
        },
      });
    }
    if (item.name === 'offset') {
      columns.push({
        title: t('offset'),
        width: 100,
        dataIndex: 'offset',
        sorter: (a, b) => a.offset - b.offset,
        render(text, reocrd) {
          if (reocrd.cpu_num === -1) return 'unknown';
          let backgroundColor = RED_COLOR;
          if (text < 2000) {
            backgroundColor = YELLOW_COLOR;
          }
          if (text < 1000) {
            backgroundColor = GREEN_COLOR;
          }
          return (
            <div
              className='table-td-fullBG'
              style={{
                backgroundColor: backgroundColor,
              }}
            >
              {timeFormatter(text, 'milliseconds', 2)?.text}
            </div>
          );
        },
      });
    }
    if (item.name === 'os') {
      columns.push({
        title: t('os'),
        width: 100,
        dataIndex: 'os',
        render: (val, reocrd) => {
          if (reocrd.cpu_num === -1) return 'unknown';
          return val;
        },
      });
    }
    if (item.name === 'arch') {
      columns.push({
        title: t('arch'),
        width: 100,
        dataIndex: 'arch',
        render: (val, reocrd) => {
          if (reocrd.cpu_num === -1) return 'unknown';
          return val;
        },
      });
    }
    if (item.name === 'note') {
      columns.push({
        title: t('common:table.note'),
        dataIndex: 'note',
        ellipsis: {
          showTitle: false,
        },
        render(note) {
          return (
            <Tooltip title={note} placement='topLeft' getPopupContainer={() => document.body}>
              {note}
            </Tooltip>
          );
        },
      });
    }
  });

  const featchData = ({ current, pageSize }): Promise<any> => {
    const query = {
      query: tableQueryContent,
      bgid: curBusiId,
      limit: pageSize,
      p: current,
    };
    return getMonObjectList(query).then((res) => {
      return {
        total: res.dat.total,
        list: res.dat.list,
      };
    });
  };

  const showTotal = (total: number) => {
    return t('common:table.total', { total });
  };

  const { tableProps } = useAntdTable(featchData, {
    refreshDeps: [tableQueryContent, curBusiId, refreshFlag],
    defaultPageSize: 30,
  });

  return (
    <div>
      <div className='table-operate-box'>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setRefreshFlag(_.uniqueId('refreshFlag_'));
            }}
          />
          <Input
            className='search-input'
            prefix={<SearchOutlined />}
            placeholder={t('search_placeholder')}
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onPressEnter={() => {
              setTableQueryContent(searchVal);
            }}
            onBlur={() => {
              setTableQueryContent(searchVal);
            }}
          />
        </Space>
        <Space>
          <Button
            onClick={() => {
              OrganizeColumns({
                value: columnsConfigs,
                onChange: (val) => {
                  setColumnsConfigs(val);
                  setDefaultColumnsConfigs(val);
                },
              });
            }}
          >
            {t('organize_columns.title')}
          </Button>
          <Dropdown
            trigger={['click']}
            overlay={
              <Menu
                onClick={({ key }) => {
                  setOperateType(key as OperateType);
                }}
              >
                <Menu.Item key={OperateType.BindTag}>{t('bind_tag.title')}</Menu.Item>
                <Menu.Item key={OperateType.UnbindTag}>{t('unbind_tag.title')}</Menu.Item>
                <Menu.Item key={OperateType.UpdateBusi}>{t('update_busi.title')}</Menu.Item>
                <Menu.Item key={OperateType.RemoveBusi}>{t('remove_busi.title')}</Menu.Item>
                <Menu.Item key={OperateType.UpdateNote}>{t('update_note.title')}</Menu.Item>
                <Menu.Item key={OperateType.Delete}>{t('batch_delete.title')}</Menu.Item>
              </Menu>
            }
          >
            <Button>
              {t('common:btn.batch_operations')} <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
      </div>
      <Table
        rowKey='id'
        columns={columns}
        size='small'
        {...tableProps}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectedRowKeys,
          onChange(selectedRowKeys, selectedRows: ITargetProps[]) {
            setSelectedRowKeys(selectedRowKeys);
            setSelectedIdents(selectedRows ? selectedRows.map(({ ident }) => ident) : []);
          },
        }}
        pagination={{
          ...tableProps.pagination,
          showTotal: showTotal,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: pageSizeOptions,
        }}
      />
    </div>
  );
}
