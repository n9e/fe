import React, { useEffect, useState } from 'react';
import { Form, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { getDashboards } from '../../services/knowledgeBase';
import { ILabelName } from './index';

interface IProps {
  fieldName: number;
}

export default function DashboardSelect(props: IProps) {
  const { t } = useTranslation('aiChat');
  const { fieldName } = props;

  const form = Form.useFormInstance();
  const businessId = Form.useWatch(['dashboard', fieldName, 'business_id'], form);

  const [boards, setBoards] = useState<ILabelName[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getBoardList();
  }, [businessId]);

  const getBoardList = () => {
    if (businessId) {
      setLoading(true);
      getDashboards(businessId)
        .then((res) => {
          setBoards(res);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setBoards([]);
    }
  };

  return (
    <>
      <Form.Item name={[fieldName, 'dashboard_id']} rules={[{ required: true, message: t('knowledgeBase.form.dashboardPlaceholder') }]}>
        <Select placeholder={t('knowledgeBase.form.dashboardPlaceholder')} showSearch optionFilterProp='children' loading={loading}>
          {boards?.map((el) => {
            return (
              <Select.Option value={el.id} key={el.id}>
                {el.name}
              </Select.Option>
            );
          })}
        </Select>
      </Form.Item>
    </>
  );
}
