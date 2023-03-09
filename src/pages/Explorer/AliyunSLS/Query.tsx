import React from 'react';
import { Tooltip, Form, Input } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import Markdown from '@/components/Markdown';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

interface IProps {
  prefixField?: any;
  prefixName?: (string | number)[];
  width?: number | string;
  layout?: 'horizontal' | 'vertical';
}

const content = `
场景举例  
查询日志原文:  
- 查询GET、POST请求成功的日志：(request_method:GET or request_method:POST) and status in [200 299]
- 查询GET、POST请求失败的日志：(request_method:GET or request_method:POST) and status in [200 299]
- 查询request_uri字段值以/request开头的日志：request_uri:/request*  

查询时序值:  
- 查询GET、POST请求成功的日志条数，有两种查询方式，如果对展示的时间样式没有特殊要求，可以不写 [time_series](https://help.aliyun.com/document_detail/63451.htm)
  - (request_method:GET or request_method:POST) and status in [200 299]|count(1) as count
  - (request_method:GET or request_method:POST) and status in [200 299]|count(1) as count, select time_series(__time__, '1m', '%H:%i:%s' ,'0') as Time group by Time order by Time limit 100

详细文档：
- [查询语法](https://help.aliyun.com/document_detail/29060.htm) 
- [分析语法](https://help.aliyun.com/document_detail/53608.html)
- [函数概览](https://help.aliyun.com/document_detail/321454.html)`;

export default function QueryInput(props: IProps) {
  const { prefixField = {}, prefixName = [], width = 84, layout = 'horizontal' } = props;
  const label = (
    <span>
      查询条件{' '}
      <Tooltip overlayClassName='sls-discover-tooltips' placement='right' title={<Markdown content={content} />}>
        <QuestionCircleOutlined />
      </Tooltip>
    </span>
  );

  if (layout === 'vertical') {
    return (
      <Form.Item {...prefixField} label={label} name={[...prefixName, 'query']}>
        <Input />
      </Form.Item>
    );
  }
  return (
    <InputGroupWithFormItem label={label}>
      <Form.Item {...prefixField} name={[...prefixName, 'query']} style={{ width }}>
        <Input />
      </Form.Item>
    </InputGroupWithFormItem>
  );
}
