import React, { useEffect } from 'react';
import { MinusCircleTwoTone, PlusCircleTwoTone, SearchOutlined } from '@ant-design/icons';
import { Button, Space, Table, message } from 'antd';
import '../../style.less';
import _ from 'lodash';
interface IProps {
  showTags: boolean;
  tags: object;
  log: string;
  addQueryLabel: (key: string, value: string, operator: string) => void;
}
const keys = ['traceID', 'traceId', 'TraceId', 'TraceID', 'traceid', 'trace_id'];
export function ValueTagsCont(props: IProps) {
  const { showTags, tags, addQueryLabel, log } = props;
  useEffect(() => {
    try {
      const parsedJson = JSON.parse(log);
      const keys = ['traceID', 'traceId', 'TraceId', 'TraceID', 'traceid', 'trace_id'];
      keys.forEach((key) => {
        if (_.has(parsedJson, key)) {
          tags[key] = parsedJson[key];
        }
      });
    } catch (error) {
      // 不是JSON字符串，保持原样
    }
  }, [log]);
  if (showTags) {
    const sortedTags = _.sortBy(_.toPairs(tags), ([key, value]) => key);
    // console.log('sortedTags', sortedTags);
    return (
      <div className='value-tags-container'>
        <Table
          showHeader={false}
          dataSource={sortedTags.map(([key, value]) => {
            return {
              key: key,
              value: value,
            };
          })}
          columns={[
            {
              dataIndex: 'key',
              key: 'key',
              render: (text: string, record) => {
                return (
                  <Space>
                    <span
                      onClick={() => {
                        addQueryLabel(record.key, record.value, '=');
                      }}
                    >
                      <PlusCircleTwoTone twoToneColor='6C53B1' />
                    </span>
                    <span
                      onClick={() => {
                        addQueryLabel(record.key, record.value, '!=');
                      }}
                    >
                      <MinusCircleTwoTone twoToneColor='6C53B1' />
                    </span>
                    {text}
                  </Space>
                );
              },
            },
            {
              dataIndex: 'value',
              key: 'value',
              render: (text: string, record) => {
                if (_.includes(keys, record.key)) {
                  return (
                    <Space>
                      <div>{text}</div>
                      <Button
                        size='small'
                        type='primary'
                        style={{ borderRadius: 4, width: 50 }}
                        icon={<SearchOutlined />}
                        onClick={() => {
                          message.info('TODO!');
                          // TODO: 跳转到Trace页面,这里等Trace上线在看怎么搞吧
                        }}
                      ></Button>
                    </Space>
                  );
                }
                return <div>{text}</div>;
              },
            },
          ]}
          size='small'
          pagination={false}
        />
      </div>
    );
  }
  return null;
}
