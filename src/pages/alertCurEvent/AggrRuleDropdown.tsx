import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Form, Modal, Switch, message, Dropdown, Button, Menu } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

import { getAggrAlerts, AddAggrAlerts, updateAggrAlerts, deleteAggrAlerts } from '@/services/warning';
import { CommonStateContext } from '@/App';

import './index.less';
import { CardType } from './AlertCard';

interface Props {
  onRefreshRule: (rule: string) => void;
  cardList: CardType[];
}

export interface CardAlertType {
  id: number;
  name: string;
  rule: string;
  cate: number;
  create_at: number;
  create_by: number;
  update_at: number;
}

export default function AggrRuleDropdown(props: Props) {
  const { onRefreshRule, cardList } = props;
  const { t } = useTranslation('AlertCurEvents');
  const [form] = Form.useForm();
  const [alertList, setAlertList] = useState<CardAlertType[]>();
  const [editForm, setEditForm] = useState<CardAlertType>();
  const localSelectId = localStorage.getItem('selectedAlertRule');
  const [activeId, setActiveId] = useState<number>(localSelectId ? Number(localSelectId) : 0);
  const { profile } = useContext(CommonStateContext);
  const [selectedAlert, setSelectedAlert] = useState<CardAlertType>();
  const [visibleDropdown, setVisibleDropdown] = useState(false);
  const [visibleAggrRuleModal, setVisibleAggrRuleModal] = useState(false);

  useEffect(() => {
    getList(true).then((res) => {
      if (activeId && res && res.length > 0) {
        const currentAlert = res?.find((item) => item.id === activeId) as CardAlertType;
        if (currentAlert) {
          onRefreshRule(currentAlert.rule);
        } else {
          saveActiveId(res[0].id);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (activeId && alertList && alertList.length > 0) {
      const currentAlert = alertList?.find((item) => item.id === activeId) as CardAlertType;
      if (currentAlert) {
        onRefreshRule(currentAlert.rule);
      } else {
        saveActiveId(alertList[0].id);
      }
    }
  }, [activeId]);

  function saveActiveId(id: number) {
    if (!id) return;
    setActiveId(id);
    localStorage.setItem('selectedAlertRule', String(id));
  }

  const getList = (selectTheFirst = false) => {
    return getAggrAlerts().then((res) => {
      const sortedList = res.dat.sort((a: CardAlertType, b: CardAlertType) => a.cate - b.cate);
      setAlertList(sortedList);
      selectTheFirst && sortedList.length > 0 && !sortedList.find((item) => item.id === activeId) && saveActiveId(sortedList[0].id);
      return sortedList;
    });
  };

  const handleOk = async () => {
    await form.validateFields();
    const func = editForm ? updateAggrAlerts : AddAggrAlerts;
    const values = form.getFieldsValue();
    const cur = await func({
      ...values,
      cate: values.cate ? 0 : 1,
    });
    setVisibleAggrRuleModal(false);
    await getList();
    saveActiveId(editForm ? editForm.id : cur.dat.id);
    editForm && onRefreshRule(values.rule + ' ');
  };

  const handleCancel = () => {
    setVisibleAggrRuleModal(false);
    setEditForm(undefined);
  };

  const handleDelete = (alert) => {
    Modal.confirm({
      title: t('common:confirm.delete'),
      onOk: async () => {
        await deleteAggrAlerts([alert.id]);
        message.success(t('common:success.delete'));
        getList(true);
      },
      onCancel: () => {},
    });
  };

  const dropdownMenu = (
    <Menu className='min-w-[220px] max-h-[300px] overflow-auto bg-var(--fc-fill-1)'>
      {(alertList || []).map((alert) => (
        <Menu.Item
          onClick={() => {
            saveActiveId(alert.id);
            setSelectedAlert(alert);
            setVisibleDropdown(false);
          }}
          className='p-0 m-0'
          key={alert.id}
        >
          <div className={`px-2 py-1 flex items-center justify-between ${alert.id === activeId ? ' is-active' : ''}`}>
            <div>{alert.name}</div>
            {(alert.cate === 1 || profile.admin) && (
              <div className='flex gap-2'>
                <EditOutlined
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditForm(alert);
                    setVisibleAggrRuleModal(true);
                    form.setFieldsValue({
                      ...alert,
                      cate: alert.cate === 0,
                    });
                    onRefreshRule(alert.rule);
                  }}
                />
                <DeleteOutlined
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(alert);
                  }}
                />
              </div>
            )}
          </div>
        </Menu.Item>
      ))}
      <Menu.Item key='add-rule' className='bg-transparent text-right p-0 m-0 border-top'>
        <Button
          type='link'
          onClick={() => {
            setVisibleDropdown(false);
            setVisibleAggrRuleModal(true);
          }}
        >
          + 新增规则
        </Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className='flex items-center gap-2'>
      <Dropdown overlay={dropdownMenu} trigger={['click']} visible={visibleDropdown} onVisibleChange={setVisibleDropdown}>
        <Input
          addonBefore={t('aggregate_rule')}
          value={selectedAlert ? selectedAlert.name + (selectedAlert.cate === 0 || profile.admin ? ' 公开' : '') : ''}
          placeholder={t('aggregate_rule_mgs')}
          readOnly
          onClick={() => setVisibleDropdown(true)}
          style={{ width: 340 }}
        />
      </Dropdown>

      <div className=' text-[var(--fc-text-4)]'>
        {cardList?.length} {t('aggr_result')}
      </div>
      <Modal title={editForm ? t('common:btn.edit') : t('common:btn.add')} visible={visibleAggrRuleModal} onOk={handleOk} onCancel={handleCancel} destroyOnClose>
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
          <Form.Item label={t('aggregate_rule')} name='rule' rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {profile.admin && (
            <Form.Item label={t('isPublic')} name='cate' rules={[{ required: true }]} valuePropName='checked'>
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
