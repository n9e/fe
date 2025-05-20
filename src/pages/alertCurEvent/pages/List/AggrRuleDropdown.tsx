import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Form, Modal, Switch, message, Dropdown, Button, Menu, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, CloseCircleOutlined } from '@ant-design/icons';

import { getAggrAlerts, AddAggrAlerts, updateAggrAlerts, deleteAggrAlerts } from '@/services/warning';
import { CommonStateContext } from '@/App';

import { NS } from '../../constants';

interface Props {
  cardNum: number;
  onSelectAggrGroupId: (aggrGroupId: number | undefined) => void;
  onClearCardNum?: () => void;
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
  const { cardNum, onSelectAggrGroupId, onClearCardNum } = props;
  const { t } = useTranslation(NS);
  const [form] = Form.useForm();
  const [alertList, setAlertList] = useState<CardAlertType[]>();
  const [editForm, setEditForm] = useState<CardAlertType>();
  const localSelectId = Number(localStorage.getItem('selectedAlertRule'));
  const { profile } = useContext(CommonStateContext);
  const [selectedAlert, setSelectedAlert] = useState<CardAlertType>();
  const [visibleDropdown, setVisibleDropdown] = useState(false);
  const [visibleAggrRuleModal, setVisibleAggrRuleModal] = useState(false);

  useEffect(() => {
    getList().then((res) => {
      let initAlert: CardAlertType | undefined;
      if (localSelectId && res.length > 0) {
        initAlert = res.find((item) => item.id === localSelectId);
      }
      if (initAlert) {
        setSelectedAlert(initAlert);
        onSelectAggrGroupId(initAlert.id);
        localStorage.setItem('selectedAlertRule', String(initAlert.id));
      }
    });
  }, []);

  const getList = (selectTheFirst = false) => {
    return getAggrAlerts().then((res) => {
      const sortedList = res.dat.sort((a: CardAlertType, b: CardAlertType) => a.cate - b.cate);
      setAlertList(sortedList);
      selectTheFirst && sortedList.length > 0 && !sortedList.find((item) => item.id === localSelectId) && localStorage.setItem('selectedAlertRule', String(sortedList[0].id));
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
    localStorage.setItem('selectedAlertRule', String(editForm ? editForm.id : cur.dat.id));
    editForm && onSelectAggrGroupId(values.id);
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

  const handleSelect = (alert: CardAlertType) => {
    setSelectedAlert(alert);
    onSelectAggrGroupId(alert.id);
    localStorage.setItem('selectedAlertRule', String(alert.id));
    setVisibleDropdown(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAlert(undefined);
    onSelectAggrGroupId(undefined);
    localStorage.removeItem('selectedAlertRule');
    setVisibleDropdown(false);
    onClearCardNum?.();
  };

  const dropdownMenu = (
    <Menu className='min-w-[220px] max-h-[300px] overflow-auto bg-var(--fc-fill-1)'>
      {(alertList || []).map((alert) => (
        <Menu.Item onClick={() => handleSelect(alert)} className='p-0 m-0' key={alert.id}>
          <div className={`px-2 py-2 flex items-center justify-between ${alert.id === selectedAlert?.id ? ' is-active' : ''}`}>
            <div>{alert.name}</div>
            <Space>
              <Tag style={{ border: 'none', borderRadius: '4px' }} color='default'>
                {alert.cate === 0 || profile.admin ? ' 公开' : ''}
              </Tag>

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
            </Space>
          </div>
        </Menu.Item>
      ))}
      <Menu.Item key='add-rule' className='p-0'>
        <div className='text-right bg-transparent m-0 p-0' style={{ borderTop: '1px solid var(--fc-border-color)' }}>
          <Button
            type='link'
            onClick={() => {
              setVisibleDropdown(false);
              setVisibleAggrRuleModal(true);
            }}
          >
            + 新增规则
          </Button>
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className='flex items-center gap-2'>
      <Dropdown overlay={dropdownMenu} trigger={['click']} visible={visibleDropdown} onVisibleChange={setVisibleDropdown}>
        <Input
          addonBefore={t('aggregate_rule')}
          value={selectedAlert ? selectedAlert.name : ''}
          placeholder={t('aggregate_rule_mgs')}
          readOnly
          onClick={() => setVisibleDropdown(true)}
          style={{ width: 340 }}
          suffix={selectedAlert && <CloseCircleOutlined onClick={handleClear} style={{ cursor: 'pointer' }} />}
        />
      </Dropdown>

      <div className=' text-[var(--fc-text-4)]'>
        {cardNum} {t('aggr_result')}
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
