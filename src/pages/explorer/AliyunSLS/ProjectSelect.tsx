import React, { useEffect, useState } from 'react';
import { AutoComplete, Tooltip, Form } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { DatasourceCateEnum } from '@/utils/constant';
import { getSLSProject } from '@/services/metric';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

interface IProps {
  datasourceCate: DatasourceCateEnum.aliyunSLS;
  datasourceName: string;
  prefixField?: any;
  prefixName?: (string | number)[];
  width?: number | string;
  layout?: 'horizontal' | 'vertical';
}

export default function ProjectSelect(props: IProps) {
  const { datasourceCate, datasourceName, prefixField = {}, prefixName = [], width = 180, layout = 'horizontal' } = props;
  const [options, setOptions] = useState<{ label; value }[]>([]);
  const label = (
    <span>
      项目{' '}
      <Tooltip
        title={
          <div>
            项目是日志服务的资源管理单元，是进行多用户隔离与访问控制的主要边界。更多信息，请参见
            <a href='https://help.aliyun.com/document_detail/48873.htm' target='_blank' style={{ color: '#c6b2fd' }}>
              项目
            </a>
          </div>
        }
      >
        <QuestionCircleOutlined />
      </Tooltip>
    </span>
  );

  useEffect(() => {
    if (datasourceName) {
      getSLSProject({
        cate: datasourceCate,
        cluster: datasourceName,
      }).then((res) => {
        setOptions(
          _.map(res, (item) => {
            return {
              label: item,
              value: item,
            };
          }),
        );
      });
    }
  }, [datasourceName]);

  if (layout === 'vertical') {
    return (
      <Form.Item
        {...prefixField}
        label={label}
        name={[...prefixName, 'project']}
        rules={[
          {
            required: true,
            message: '请输入项目',
          },
        ]}
        style={{ width }}
      >
        <AutoComplete options={options} />
      </Form.Item>
    );
  }
  return (
    <InputGroupWithFormItem label={label} labelWidth={84}>
      <Form.Item
        {...prefixField}
        name={[...prefixName, 'project']}
        rules={[
          {
            required: true,
            message: '请输入项目',
          },
        ]}
        style={{ width }}
      >
        <AutoComplete options={options} />
      </Form.Item>
    </InputGroupWithFormItem>
  );
}
