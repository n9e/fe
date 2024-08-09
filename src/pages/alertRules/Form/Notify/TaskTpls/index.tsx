import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Col, Form, Row, Space } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import request from '@/utils/request';
import TplSettings from './TplSettings';

function getTpls(gids: string | undefined) {
  if (gids) {
    return request(`/api/n9e/busi-groups/task-tpls?gids=${gids}&limit=5000&p=1`).then((res) => {
      return { list: res.dat.list, total: res.dat.total };
    });
  }
  return Promise.resolve({ list: [], total: 0 });
}

export default function TaskTpls() {
  const { t } = useTranslation('alertRules');
  const group_id = Form.useWatch('group_id');
  const [tpls, setTpls] = useState<any[]>([]);

  useEffect(() => {
    getTpls(group_id).then((res) => {
      setTpls(res.list);
    });
  }, [group_id]);

  return (
    <Form.List name={['rule_config', 'task_tpls']}>
      {(fields, { add, remove }) => (
        <>
          <Space align='baseline'>
            {t('task_tpls.title')}
            <PlusCircleOutlined className='control-icon-normal' onClick={() => add()} />
            {fields.length > 0 && (
              <Link target='_blank' to='/job-tpls/add'>
                {t('task_tpls.add_btn')}
              </Link>
            )}
          </Space>
          {fields.map((field) => (
            <Row gutter={16} key={field.key}>
              <Col flex='auto'>
                <TplSettings field={field} tpls={tpls} />
              </Col>
              <Col flex='40px'>
                <MinusCircleOutlined className='control-icon-normal' onClick={() => remove(field.name)} />
              </Col>
            </Row>
          ))}
        </>
      )}
    </Form.List>
  );
}
