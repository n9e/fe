import React, { useState, useMemo, useRef } from 'react';
import { Input, Select, Dropdown, Button, Menu, Space, Tag, Spin, Modal, message, Tooltip } from 'antd';
import { PlusOutlined, SaveOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';
import _ from 'lodash';

import { View, getViews, updateView, deleteView, postViewFavorite, deleteViewFavorite } from './services';
import { ModalStat } from './types';
import FormModal from './FormModal';
import DropdownTrigger from './DropdownTrigger';

import './style.less';

interface Props<FilterValues> {
  disabled?: boolean;
  page: string;
  getFilterValues: () => FilterValues;
  renderOptionExtra: (filterValues: FilterValues) => React.ReactNode;
  onSelect?: (filterValues: FilterValues) => void;

  oldFilterValues?: FilterValues;
  adjustOldFilterValues?: (values: any) => any;

  placeholder?: string;
}

const VERSION = '1.0.0';

export default function index<FilterValues>(props: Props<FilterValues>) {
  const { t } = useTranslation('viewSelect');
  const { disabled, page, renderOptionExtra, onSelect, oldFilterValues, adjustOldFilterValues, placeholder } = props;
  const selectDropdownContainer = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const [filters, setFilters] = useState<{ searchText: string; publicCate?: number }>({ searchText: '', publicCate: undefined });
  const [modalStat, setModalState] = useState<ModalStat>({
    visible: false,
  });

  const service = () => {
    return getViews(page).then((res) => {
      return _.map(res, (item) => {
        let filterValues = {} as any;
        try {
          filterValues = JSON.parse(item.filter);
        } catch (e) {
          console.warn('parse filter error', e);
        }
        if (filterValues.__version__ === undefined) {
          /**
           * 迁移最初版本的视图数据
           * filterValues.query.mode 改成 filterValues.query.syntax
           * 如果 filterValues.query.submode 存在，filterValues.query.submode 改成 filterValues.query.sqlVizType
           * filterValues.query.sqlVizType 的值， raw 改成 table，timeSeries 改成 timeseries
           * 设置 filterValues.query.navMode 值为 fields
           * 如果 filterValues.query.syntax 值为 sql，设置 filterValues.query.sql = filterValues.query.query, 删除 filterValues.query.query
           */
          if ((item.page === '/log/explorer-ng' || item.page === '/log/explorer') && filterValues.datasourceCate === 'doris') {
            if (filterValues.query) {
              if (filterValues.query.mode) {
                filterValues.query.syntax = filterValues.query.mode;
                delete filterValues.query.mode;
              }
              if (filterValues.query.submode) {
                if (filterValues.query.submode === 'raw') {
                  filterValues.query.sqlVizType = 'table';
                } else if (filterValues.query.submode === 'timeSeries') {
                  filterValues.query.sqlVizType = 'timeseries';
                } else {
                  filterValues.query.sqlVizType = 'table';
                }
                delete filterValues.query.submode;
              }
              filterValues.query.navMode = 'fields';
              if (filterValues.query.syntax === 'sql') {
                filterValues.query.sql = filterValues.query.query;
                delete filterValues.query.query;
              }
            }
          }
        }
        return {
          ...item,
          filter: JSON.stringify(_.omit(filterValues, '__version__')),
        };
      });
    });
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

  const filterValues = useMemo(() => {
    if (selected) {
      const finded = _.find(views, { id: selected });
      if (finded) {
        try {
          return JSON.parse(finded.filter);
        } catch (e) {
          console.warn('parse filter error', e);
        }
      }
    }
    return {} as FilterValues;
  }, [selected, views]);

  // getFilterValues 用于保存数据前，这里包装一层，添加 __version__ 字段
  const getFilterValues = () => {
    const filterValues = props.getFilterValues();
    return {
      ...filterValues,
      __version__: VERSION,
    };
  };

  return (
    <Tooltip title={disabled ? t('tip') : undefined}>
      <Input.Group compact className='input-group-with-form-item'>
        <div className='input-group-with-form-item-content'>
          <Select
            allowClear
            disabled={disabled}
            placeholder={placeholder ?? t('placeholder')}
            className='w-full n9e-view-select'
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
                  <div key={item.id} className='group/option'>
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex-1 min-w-0 flex items-center gap-2 group/icon'>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.is_favorite) {
                              deleteViewFavorite(item.id).then(() => {
                                message.success(t('delete_favorite'));
                                run();
                              });
                            } else {
                              postViewFavorite(item.id).then(() => {
                                message.success(t('post_favorite'));
                                run();
                              });
                            }
                          }}
                        >
                          {item.is_favorite ? (
                            <StarFilled className='text-amber-400 group-hover/icon:text-amber-500' />
                          ) : (
                            <StarOutlined className='group-hover/icon:text-amber-400' />
                          )}
                        </span>
                        <span className='flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap'>{item.name}</span>
                      </div>
                      <Space className='flex-shrink-0'>
                        <Tag className='m-0'>{t(`public_cate_${item.public_cate}`)}</Tag>
                        <Space className='invisible group-hover/option:visible'>
                          <EditOutlined
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalState({
                                visible: true,
                                action: 'edit',
                                values: item,
                              });
                            }}
                          />
                          <DeleteOutlined
                            onClick={(e) => {
                              e.stopPropagation();
                              Modal.confirm({
                                title: t('confirm_delete'),
                                onOk: () => {
                                  deleteView(item.id).then(() => {
                                    message.success(t('common:success.delete'));
                                    run();
                                    if (selected === item.id) {
                                      setSelected(undefined);
                                    }
                                  });
                                },
                              });
                            }}
                          />
                        </Space>
                      </Space>
                    </div>
                    {renderOptionExtra(_.omit(filterValues as any, '__version__'))}
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
                onSelect(_.omit(filterValues as any, '__version__'));
              }
            }}
          />
        </div>
        <Dropdown
          disabled={disabled}
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
                {
                  label: (
                    <Tooltip title={t('reset_tip')} placement='right'>
                      <Space>
                        <ReloadOutlined />
                        <span>{t('reset')}</span>
                      </Space>
                    </Tooltip>
                  ),
                  key: 'reset',
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
                    const filterValues = getFilterValues();
                    updateView(finded.id, {
                      ...finded,
                      filter: JSON.stringify(filterValues),
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
                          setSelected(undefined);
                        });
                      }
                    },
                  });
                } else if (key === 'reset') {
                  if (onSelect) {
                    let filterValues: FilterValues = {} as FilterValues;
                    const finded = _.find(views, { id: selected });
                    if (finded) {
                      try {
                        filterValues = JSON.parse(finded.filter);
                      } catch (e) {
                        console.warn('parse filter error', e);
                      }
                    }
                    onSelect(filterValues);
                  }
                }
              }}
            />
          }
          placement='topLeft'
        >
          <DropdownTrigger disabled={disabled} filterValues={filterValues} oldFilterValues={oldFilterValues} adjustOldFilterValues={adjustOldFilterValues} />
        </Dropdown>
      </Input.Group>
      <FormModal page={page} modalStat={modalStat} setModalState={setModalState} getFilterValues={getFilterValues} run={run} setSelected={setSelected} />
    </Tooltip>
  );
}
