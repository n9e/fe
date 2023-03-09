import React, { useState, useRef, useContext } from 'react';
import { Table, Tag, Tooltip, Space, Input, Dropdown, Menu, Button, Modal, message } from 'antd';
import { SearchOutlined, DownOutlined, ReloadOutlined, CopyOutlined } from '@ant-design/icons';
import { useAntdTable } from 'ahooks';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { BusiGroupItem } from '@/store/commonInterface';
import { getMonObjectList } from '@/services/monObjectManage';
import clipboard from './clipboard';
import { CommonStateContext } from '@/App';

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
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const { curBusiId, setSelectedIdents, selectedRowKeys, setSelectedRowKeys, refreshFlag, setRefreshFlag, setOperateType } = props;
  const isAddTagToQueryInput = useRef(false);
  const [searchVal, setSearchVal] = useState('');
  const [tableQueryContent, setTableQueryContent] = useState<string>('');
  const columns = [
    {
      title: t('datasource'),
      dataIndex: 'datasource_id',
      render: (val) => {
        const datasource = _.find(groupedDatasourceList.prometheus, { id: val });
        return datasource ? datasource.name : '';
      },
    },
    {
      title: (
        <span>
          {t('common:table.ident')}{' '}
          <CopyOutlined
            style={{
              cursor: 'pointer',
            }}
            onClick={() => {
              const tobeCopy = _.map(tableProps.dataSource, (item) => item.ident);
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
          />
        </span>
      ),
      dataIndex: 'ident',
    },
    {
      title: t('common:table.tag'),
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
                  setTableQueryContent(tableQueryContent ? `${tableQueryContent.trim()} ${item}` : item);
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
    },
    {
      title: t('common:business_group'),
      dataIndex: 'group_obj',
      render(groupObj: BusiGroupItem | null) {
        return groupObj ? groupObj.name : t('not_grouped');
      },
    },
    {
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
    },
    {
      title: t('load_per_core'),
      width: 100,
      dataIndex: 'load_per_core',
      sorter: (a, b) => a.load_per_core - b.load_per_core,
      render(text) {
        let backgroundColor = GREEN_COLOR;
        if (text > 2) {
          backgroundColor = YELLOW_COLOR;
        }
        if (text > 4) {
          backgroundColor = RED_COLOR;
        }
        return (
          <div
            className='table-td-fullBG'
            style={{
              backgroundColor: backgroundColor,
            }}
          >
            {_.floor(text, 1)}
          </div>
        );
      },
    },
    {
      title: t('mem_util'),
      width: 100,
      dataIndex: 'mem_util',
      sorter: (a, b) => a.mem_util - b.mem_util,
      render(text) {
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
    },
    {
      title: t('disk_util'),
      width: 100,
      dataIndex: 'disk_util',
      sorter: (a, b) => a.disk_util - b.disk_util,
      render(text) {
        if (text === undefined) return '';
        let backgroundColor = GREEN_COLOR;
        if (text > 85) {
          backgroundColor = YELLOW_COLOR;
        }
        if (text > 95) {
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
    },
    {
      title: t('offset'),
      width: 100,
      dataIndex: 'offset',
      sorter: (a, b) => a.offset - b.offset,
      render: (val) => {
        return `${val}ms`;
      },
    },
    {
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
    },
  ];
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
