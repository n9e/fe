import React, { useMemo } from 'react';
import { CopyOutlined } from '@ant-design/icons';
import { Dropdown, Empty, Menu, Space, Table, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';

import NavigableDrawer from '@/components/NavigableDrawer';
import { copy2ClipBoard } from '@/utils';

import { ROW_DETAIL_IGNORE_CLICK_AWAY_CLASS, serializeRowDetail, serializeRowDetailValue } from './rowDetailUtils';
import type { RowDetailData } from './rowDetailUtils';

interface Props {
  visible: boolean;
  rows: RowDetailData[];
  currentIndex: number;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}

export default function RowDetailDrawer(props: Props) {
  const { t } = useTranslation('dashboard');
  const { visible, rows, currentIndex, onClose, onChangeIndex } = props;
  const currentRow = rows[currentIndex];
  const jsonValue = currentRow ? serializeRowDetail(currentRow) : '';
  const dataSource = useMemo(
    () =>
      Object.entries(currentRow || {}).map(([field, value]) => ({
        field,
        value,
      })),
    [currentRow],
  );

  return (
    <NavigableDrawer
      className={`n9e-dashboard-panel-table-ng-row-detail-drawer ${ROW_DETAIL_IGNORE_CLICK_AWAY_CLASS}`}
      title={t('panel.custom.tableNG.rowDetail.title')}
      placement='right'
      onClose={onClose}
      hasPrev={currentIndex > 0}
      hasNext={currentIndex > -1 && currentIndex < rows.length - 1}
      onPrev={() => onChangeIndex(currentIndex - 1)}
      onNext={() => onChangeIndex(currentIndex + 1)}
      visible={visible}
      destroyOnClose
    >
      {currentRow ? (
        <div className='n9e-dashboard-panel-table-ng-row-detail'>
          <Tabs
            className='min-h-0 flex flex-col'
            size='small'
            tabBarExtraContent={
              <Space
                className='cursor-pointer'
                onClick={() => {
                  copy2ClipBoard(jsonValue);
                }}
              >
                <CopyOutlined />
                {t('panel.custom.tableNG.rowDetail.copyRow')}
              </Space>
            }
          >
            <Tabs.TabPane tab={t('panel.custom.tableNG.rowDetail.tableTab')} key='table'>
              <div className='h-full overflow-auto'>
                <Table
                  showHeader={false}
                  rowKey='field'
                  tableLayout='fixed'
                  dataSource={dataSource}
                  columns={[
                    {
                      title: t('panel.custom.tableNG.rowDetail.field'),
                      dataIndex: 'field',
                      key: 'field',
                      width: '35%',
                      render: (field) => <span className='text-hint break-all'>{field}</span>,
                    },
                    {
                      title: t('panel.custom.tableNG.rowDetail.value'),
                      dataIndex: 'value',
                      key: 'value',
                      render: (value, record) => {
                        const serializedValue = serializeRowDetailValue(value);
                        return (
                          <Dropdown
                            trigger={['click']}
                            overlayClassName={ROW_DETAIL_IGNORE_CLICK_AWAY_CLASS}
                            overlay={
                              <Menu>
                                <Menu.Item
                                  key='copy-field-and-value'
                                  icon={<CopyOutlined />}
                                  onClick={({ domEvent }) => {
                                    domEvent.stopPropagation();
                                    copy2ClipBoard(`${record.field}:${serializedValue}`);
                                  }}
                                >
                                  {t('panel.custom.tableNG.rowDetail.copyFieldAndValue')}
                                </Menu.Item>
                                <Menu.Item
                                  key='copy-field-value'
                                  icon={<CopyOutlined />}
                                  onClick={({ domEvent }) => {
                                    domEvent.stopPropagation();
                                    copy2ClipBoard(serializedValue);
                                  }}
                                >
                                  {t('panel.custom.tableNG.rowDetail.copyFieldValue')}
                                </Menu.Item>
                              </Menu>
                            }
                          >
                            <div className='n9e-dashboard-panel-table-ng-row-detail-value break-all whitespace-pre-wrap'>{serializedValue}</div>
                          </Dropdown>
                        );
                      },
                    },
                  ]}
                  size='small'
                  pagination={false}
                />
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab={t('panel.custom.tableNG.rowDetail.jsonTab')} key='json'>
              <pre className='n9e-dashboard-panel-table-ng-row-detail-json'>{jsonValue}</pre>
            </Tabs.TabPane>
          </Tabs>
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </NavigableDrawer>
  );
}
