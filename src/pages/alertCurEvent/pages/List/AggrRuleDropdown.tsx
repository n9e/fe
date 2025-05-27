import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Form, Modal, Switch, message, Button, Space, Tag, Select, Divider } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import _ from 'lodash';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { getAggrAlerts as getAggrRules, AddAggrAlerts, updateAggrAlerts, deleteAggrAlerts } from '@/services/warning';
import { CommonStateContext } from '@/App';
import Markdown from '@/components/Markdown';

import { NS } from '../../constants';
import { AggrRuleType, CardType, FilterType } from '../../types';

interface Props {
  cardList?: CardType[];
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  reloadRuleCards: () => void;
}

export default function AggrRuleDropdown(props: Props) {
  const { t } = useTranslation(NS);
  const { profile } = useContext(CommonStateContext);
  const { cardList, filter, setFilter, reloadRuleCards } = props;
  const [form] = Form.useForm();
  const [aggrRuleList, setAggrRuleList] = useState<AggrRuleType[]>();
  const [editForm, setEditForm] = useState<AggrRuleType>();
  const [visibleAggrRuleModal, setVisibleAggrRuleModal] = useState(false);
  const getList = () => {
    return getAggrRules().then((res) => {
      const sortedList = _.sortBy(res.dat, 'cate');
      setAggrRuleList(sortedList);

      // 如果当前选中的规则不在列表中，则默认选中第一个规则
      if (sortedList.length > 0 && !_.find(sortedList, (item) => item.id === filter.aggr_rule_id)) {
        setFilter({
          ...filter,
          aggr_rule_id: sortedList[0].id,
          event_ids: undefined,
        });
      }
    });
  };

  useEffect(() => {
    getList();
  }, []);

  return (
    <>
      <Space>
        <InputGroupWithFormItem label={t('aggregate_rule')}>
          <Select
            allowClear
            showSearch
            style={{ width: 300 }}
            placeholder={t('aggregate_rule_mgs')}
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: 0 }} />
                <div className='text-right bg-transparent m-0 p-0'>
                  <Button
                    type='link'
                    onClick={() => {
                      setVisibleAggrRuleModal(true);
                    }}
                  >
                    + {t('add_rule')}
                  </Button>
                </div>
              </>
            )}
            options={_.map(aggrRuleList, (item) => {
              return {
                label: (
                  <div className={'flex items-center justify-between'}>
                    <div>{item.name}</div>
                    <Space>
                      <Tag style={{ border: 'none', borderRadius: '4px' }} color='default'>
                        {item.cate === 0 ? t('common:public') : t('common:private')}
                      </Tag>

                      {(item.cate === 1 || profile.admin) && (
                        <div className='flex gap-2'>
                          <EditOutlined
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditForm(item);
                              setVisibleAggrRuleModal(true);
                              form.setFieldsValue({
                                ...item,
                                cate: item.cate === 0,
                              });
                            }}
                          />
                          <DeleteOutlined
                            onClick={(e) => {
                              e.stopPropagation();
                              Modal.confirm({
                                title: t('common:confirm.delete'),
                                onOk: async () => {
                                  deleteAggrAlerts([item.id]).then(() => {
                                    message.success(t('common:success.delete'));
                                    getList();
                                  });
                                },
                                onCancel: () => {},
                              });
                            }}
                          />
                        </div>
                      )}
                    </Space>
                  </div>
                ),
                originLabel: item.name,
                value: item.id,
              };
            })}
            optionLabelProp='originLabel'
            optionFilterProp='originLabel'
            value={filter.aggr_rule_id}
            onChange={(value) => {
              setFilter({
                ...filter,
                aggr_rule_id: value,
                event_ids: undefined,
              });
            }}
          />
        </InputGroupWithFormItem>
        {filter.aggr_rule_id && (
          <div className=' text-[var(--fc-text-4)]'>
            {cardList?.length} {t('aggr_result')}
          </div>
        )}
      </Space>
      <Modal
        title={editForm ? t('common:btn.edit') : t('common:btn.add')}
        visible={visibleAggrRuleModal}
        onOk={async () => {
          form.validateFields().then((values) => {
            const func = editForm ? updateAggrAlerts : AddAggrAlerts;
            func({
              ...values,
              cate: values.cate ? 0 : 1,
            }).then((addRes) => {
              setVisibleAggrRuleModal(false);
              setEditForm(undefined);
              getList();
              setFilter({
                ...filter,
                aggr_rule_id: editForm ? editForm.id : addRes.dat.id,
                event_ids: editForm ? filter.event_ids : undefined,
              });
              if (editForm) {
                reloadRuleCards();
              }
            });
          });
        }}
        onCancel={() => {
          setVisibleAggrRuleModal(false);
          setEditForm(undefined);
        }}
        destroyOnClose
      >
        <Form
          form={form}
          layout='vertical'
          preserve={false}
          initialValues={{
            cate: false,
          }}
        >
          <Form.Item label={t('aggregate_rule_name')} name='name' rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name='id' hidden>
            <Input />
          </Form.Item>
          <Form.Item
            label={t('aggregate_rule')}
            name='rule'
            tooltip={{
              title: <Markdown content={t('aggregate_rule_tip', { interpolation: { skipOnVariables: true } })} darkMode />,
              overlayClassName: 'ant-tooltip-auto-width',
            }}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          {profile.admin && (
            <Form.Item label={t('isPublic')} name='cate' rules={[{ required: true }]} valuePropName='checked'>
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}
