import React, { useState, useMemo, useRef } from 'react';
import { Input, Select, Dropdown, Button, Menu, Space, Tag, Spin, Modal, Form, Radio, message } from 'antd';
import { PlusOutlined, SaveOutlined, EditOutlined, DeleteOutlined, MoreOutlined, SearchOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';
import _ from 'lodash';

import { View, getViews, updateView, deleteView } from './services';
import { ModalStat } from './types';
import FormModal from './FormModal';

interface Props<FilterValues> {
  page: string;
  getFilterValuesJSONString: () => string;
  renderOptionExtra: (filterValues: FilterValues) => React.ReactNode;
  onSelect?: (filterValues: FilterValues) => void;
}

export default function index<FilterValues>(props: Props<FilterValues>) {
  const { t } = useTranslation('viewSelect');
  const { page, getFilterValuesJSONString, renderOptionExtra, onSelect } = props;
  const selectDropdownContainer = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const [filters, setFilters] = useState<{ searchText: string; publicCate?: number }>({ searchText: '', publicCate: undefined });
  const [modalStat, setModalState] = useState<ModalStat>({
    visible: false,
  });

  const service = () => {
    return Promise.resolve([
      {
        id: 1,
        name: '示例视图',
        page: 'logs-explorer',
        filter: '{ "datasourceCate": "doris", "datasourceValue": 10049 }',
        public_cate: 0,
        is_favorite: false,
      },
      {
        id: 2,
        name: '示例视2',
        page: 'logs-explorer',
        filter: '{ "datasourceCate": "doris", "datasourceValue": 10049 }',
        public_cate: 1,
        is_favorite: true,
      },
      {
        id: 3,
        name: '示例视3示例视3示例视3示例视3示例视3示例视3',
        page: 'logs-explorer',
        filter: '{ "datasourceCate": "doris", "datasourceValue": 10049 }',
        public_cate: 2,
        is_favorite: true,
      },
      {
        id: 4,
        name: '示例视图',
        page: 'logs-explorer',
        filter: '{ "datasourceCate": "doris", "datasourceValue": 10049 }',
        public_cate: 0,
        is_favorite: false,
      },
      {
        id: 5,
        name: '示例视2',
        page: 'logs-explorer',
        filter: '{ "datasourceCate": "doris", "datasourceValue": 10049 }',
        public_cate: 1,
        is_favorite: true,
      },
      {
        id: 6,
        name: '示例视3示例视3示例视3示例视3示例视3示例视3',
        page: 'logs-explorer',
        filter: '{ "datasourceCate": "doris", "datasourceValue": 10049 }',
        public_cate: 2,
        is_favorite: true,
      },
      {
        id: 7,
        name: '示例视图',
        page: 'logs-explorer',
        filter: '{ "datasourceCate": "doris", "datasourceValue": 10049 }',
        public_cate: 0,
        is_favorite: false,
      },
      {
        id: 8,
        name: '示例视2',
        page: 'logs-explorer',
        filter: '{ "datasourceCate": "doris", "datasourceValue": 10049 }',
        public_cate: 1,
        is_favorite: true,
      },
      {
        id: 9,
        name: '示例视3示例视3示例视3示例视3示例视3示例视3',
        page: 'logs-explorer',
        filter: '{ "datasourceCate": "doris", "datasourceValue": 10049 }',
        public_cate: 2,
        is_favorite: true,
      },
    ] as View[]);
    return getViews(page);
  };
  const {
    data: views,
    loading,
    run,
  } = useRequest<View[], any[]>(service, {
    refreshDeps: [page],
  });

  const filteredViews = useMemo(() => {
    return _.filter(views, (item) => {
      let match = true;
      if (filters.searchText) {
        match = _.includes(_.upperCase(item.name), _.upperCase(filters.searchText));
      }
      if (match && _.isNumber(filters.publicCate)) {
        match = item.public_cate === filters.publicCate;
      }
      return match;
    });
  }, [_.map(_.sortBy(views, 'id'), 'id'), filters]);

  return (
    <>
      <Input.Group compact className='input-group-with-form-item'>
        <div className='input-group-with-form-item-content'>
          <Select
            placeholder={t('placeholder')}
            className='w-full max-w-[160px]'
            dropdownMatchSelectWidth={false}
            dropdownRender={(originNode) => {
              return (
                <Spin spinning={loading}>
                  <div className='w-[400px]' ref={selectDropdownContainer}>
                    <div className='p-4'>
                      <Button
                        className='w-full'
                        type='dashed'
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setModalState({
                            visible: true,
                            action: 'save_new',
                          });
                        }}
                      >
                        {t('save_new')}
                      </Button>
                    </div>
                    <div
                      className='p-4'
                      style={{
                        borderTop: '1px solid var(--fc-fill-3)',
                        borderBottom: '1px solid var(--fc-fill-3)',
                      }}
                    >
                      <div className='flex items-center gap-2'>
                        <Input
                          prefix={<SearchOutlined />}
                          placeholder={t('search_placeholder')}
                          value={filters.searchText}
                          onChange={(e) => {
                            setFilters({
                              ...filters,
                              searchText: e.target.value,
                            });
                          }}
                        />
                        <Select
                          allowClear
                          dropdownMatchSelectWidth={false}
                          placeholder={t('public_cate_placeholder')}
                          options={[
                            {
                              label: t('public_cate_2'),
                              value: 2,
                            },
                            {
                              label: t('public_cate_0'),
                              value: 0,
                            },
                            {
                              label: t('public_cate_1'),
                              value: 1,
                            },
                          ]}
                          value={filters.publicCate}
                          onChange={(val) => {
                            setFilters({
                              ...filters,
                              publicCate: val,
                            });
                          }}
                          onMouseDown={(e) => {
                            // 阻止事件冒泡，避免触发外层 Select 的关闭
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        />
                      </div>
                    </div>
                    <div className='p-4'>
                      <div>{originNode}</div>
                    </div>
                  </div>
                </Spin>
              );
            }}
            options={_.map(filteredViews, (item) => {
              let filterValues: FilterValues = {} as FilterValues;
              try {
                filterValues = JSON.parse(item.filter);
              } catch (e) {
                console.warn('parse filter error', e);
              }

              return {
                label: (
                  <div key={item.id} className='group'>
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex-1 min-w-0 flex items-center gap-2'>
                        {item.is_favorite ? (
                          <StarFilled
                            style={{
                              color: '#FAAD14',
                            }}
                          />
                        ) : (
                          <StarOutlined />
                        )}
                        <span className='flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap'>{item.name}</span>
                      </div>
                      <Space className='flex-shrink-0'>
                        <Tag className='m-0'>{t(`public_cate_${item.public_cate}`)}</Tag>
                        <Space className='invisible group-hover:visible'>
                          <EditOutlined />
                          <DeleteOutlined />
                        </Space>
                      </Space>
                    </div>
                    {renderOptionExtra(filterValues)}
                  </div>
                ),
                labelName: item.name,
                value: item.id,
              };
            })}
            optionLabelProp='labelName'
            value={selected}
            onChange={(val) => {
              setSelected(val);
              if (onSelect) {
                let filterValues: FilterValues = {} as FilterValues;
                const finded = _.find(views, { id: val });
                if (finded) {
                  try {
                    filterValues = JSON.parse(finded.filter);
                  } catch (e) {
                    console.warn('parse filter error', e);
                  }
                }
                onSelect(filterValues);
              }
            }}
          />
        </div>
        <Dropdown
          overlay={
            <Menu
              items={[
                {
                  label: (
                    <Space>
                      <PlusOutlined />
                      <span>{t('save_new')}</span>
                    </Space>
                  ),
                  key: 'save_new',
                },
                {
                  label: (
                    <Space>
                      <SaveOutlined />
                      <span>{t('save')}</span>
                    </Space>
                  ),
                  key: 'save',
                  disabled: selected === undefined,
                },
                {
                  label: (
                    <Space>
                      <EditOutlined />
                      <span>{t('edit')}</span>
                    </Space>
                  ),
                  key: 'edit',
                  disabled: selected === undefined,
                },
                {
                  label: (
                    <Space>
                      <DeleteOutlined />
                      <span>{t('delete')}</span>
                    </Space>
                  ),
                  key: 'delete',
                  disabled: selected === undefined,
                },
              ]}
              onClick={({ key }) => {
                if (key === 'save_new') {
                  setModalState({
                    visible: true,
                    action: 'save_new',
                  });
                } else if (key === 'save') {
                  const finded = _.find(views, { id: selected });
                  if (finded) {
                    const filterValuesJSONString = getFilterValuesJSONString();
                    updateView({
                      ...finded,
                      filter: filterValuesJSONString,
                    }).then(() => {
                      message.success(t('common:success.save'));
                      run();
                    });
                  }
                } else if (key === 'edit') {
                  const finded = _.find(views, { id: selected });
                  setModalState({
                    visible: true,
                    action: 'edit',
                    values: finded,
                  });
                } else if (key === 'delete') {
                  Modal.confirm({
                    title: t('confirm_delete'),
                    onOk: () => {
                      if (selected) {
                        deleteView(selected).then(() => {
                          message.success(t('common:success.delete'));
                          run();
                        });
                      }
                    },
                  });
                }
              }}
            />
          }
          placement='topLeft'
        >
          <Button icon={<MoreOutlined className='w-[32px]' />} />
        </Dropdown>
      </Input.Group>
      <FormModal modalStat={modalStat} setModalState={setModalState} getFilterValuesJSONString={getFilterValuesJSONString} run={run} />
    </>
  );
}
