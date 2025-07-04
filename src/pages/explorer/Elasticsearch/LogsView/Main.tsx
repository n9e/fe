import React from 'react';
import { Space, Spin, Pagination, Button } from 'antd';
import { ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { SIZE } from '@/utils/constant';

import Table from '../Table';
import { Props } from './types';

const MAX_RESULT_WINDOW = 10000; // ES 默认最大返回 10000 条数据，超过需要设置 index.max_result_window

export default function LogsView(
  props: Props & {
    viewModalVisible: boolean; // 查看模式是否可见
    setViewModalVisible: (visible: boolean) => void; // 设置查看模式可见性
  },
) {
  const { t } = useTranslation('explorer');
  const { loading, total, data, sorterRef, paginationOptions, setPaginationOptions, resetThenRefresh, getFields, selectedFields, viewModalVisible, setViewModalVisible } = props;

  return (
    <>
      <div className='px-2 pb-2 n9e-flex n9e-justify-between n9e-items-center'>
        <Space size={SIZE}>
          <Button
            size='small'
            icon={viewModalVisible ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
            onClick={() => {
              setViewModalVisible(!viewModalVisible);
            }}
          />
          <Spin spinning={loading} size='small' />
        </Space>
        <Pagination
          size='small'
          {...paginationOptions}
          total={total > MAX_RESULT_WINDOW ? MAX_RESULT_WINDOW : total}
          onChange={(current, pageSize) => {
            setPaginationOptions({
              ...paginationOptions,
              current,
              pageSize,
            });
          }}
          showTotal={(total) => {
            return t('common:table.total', { total });
          }}
        />
      </div>
      <Table
        data={data}
        onChange={(pagination, filters, sorter: any, extra) => {
          sorterRef.current = _.map(_.isArray(sorter) ? sorter : [sorter], (item) => {
            return {
              field: item.columnKey,
              order: item.order === 'ascend' ? 'asc' : 'desc',
            };
          });
          resetThenRefresh();
        }}
        getFields={getFields}
        selectedFields={selectedFields}
      />
    </>
  );
}
