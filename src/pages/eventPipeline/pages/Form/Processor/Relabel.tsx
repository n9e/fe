import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Row, Col, Form, Select, Input } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';

import { SIZE } from '@/utils/constant';

import { NS, RELABEL_DEFAULT_SEPARATOR } from '../../../constants';

interface Props {
  field: FormListFieldData;
  namePath: (string | number)[];
  prefixNamePath?: (string | number)[];
}

/**
 * 字段标签：中文在前、Prometheus 原词在后。
 * 不能直接换成纯中文——文档和老用户都按 target_label / source_labels 这套术语交流；
 * 也不能只留英文，那是新人在这一屏最大的门槛。
 */
const fieldLabel = (label: string, original: string) => (
  <span>
    {label} <span className='text-soft font-normal'>{original}</span>
  </span>
);

export default function Relabel(props: Props) {
  // 提示文案历史上就放在 alertRules 命名空间，沿用；新增的字段名走 eventPipeline 自己的命名空间
  const { t } = useTranslation('alertRules');
  const { t: tp } = useTranslation(NS);
  const { field, namePath = [], prefixNamePath = [] } = props;
  const resetField = _.omit(field, ['name', 'key']);
  const action = Form.useWatch([...prefixNamePath, ...namePath, 'action']);

  return (
    <Row gutter={SIZE}>
      {action === 'replace' && (
        // 常驻一行说明，而不是折进 ? 里：这是新人看到这屏必然会问的问题
        <Col span={24}>
          <div className='mb-3 text-soft text-[12px]'>{tp('relabel_fields.replace_hint')}</div>
        </Col>
      )}
      <Col span={12}>
        <Form.Item {...resetField} name={[...namePath, 'action']} label={fieldLabel(tp('relabel_fields.action'), 'action')}>
          <Select
            options={_.map(['replace', 'labelkeep', 'labeldrop', 'labelmap'], (item) => {
              return { label: item, value: item };
            })}
          />
        </Form.Item>
      </Col>
      {action === 'replace' && (
        <>
          {/* <Col span={12}>
              <Form.Item {...resetField} name={[...namePath, 'if']} label='if' tooltip={t('relabel.if_tip')}>
                <Input />
              </Form.Item>
            </Col> */}
          <Col span={12}>
            {/* replace 分支唯一决定「这个处理器到底改了什么」的字段。留空等于整个处理器什么都不做，
                但这里刻意不加必填：本组件同时被告警规则页复用，而库里既有的 relabel 配置大多是空的，
                加必填会让用户改备注这类无关操作也被一个他没碰过的字段挡住。
                「留空不生效」这条信息改由上方常驻说明承担。 */}
            <Form.Item
              {...resetField}
              name={[...namePath, 'target_label']}
              label={fieldLabel(tp('relabel_fields.target_label'), 'target_label')}
              tooltip={t('relabel.target_label_tip')}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              {...resetField}
              name={[...namePath, 'replacement']}
              label={fieldLabel(tp('relabel_fields.replacement'), 'replacement')}
              tooltip={t('relabel.replacement_tip')}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              {...resetField}
              name={[...namePath, 'source_labels']}
              label={fieldLabel(tp('relabel_fields.source_labels'), 'source_labels')}
              tooltip={t('relabel.source_labels_tip')}
            >
              <Select mode='tags' tokenSeparators={[' ']} open={false} placeholder={t('relabel.source_labels_tip_placeholder')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            {/* 默认值走 constants 的常量，与 getDefaultProcessorConfig 同源，否则切换类型会误报「会清空配置」 */}
            <Form.Item
              {...resetField}
              name={[...namePath, 'separator']}
              label={fieldLabel(tp('relabel_fields.separator'), 'separator')}
              tooltip={t('relabel.separator_tip')}
              initialValue={RELABEL_DEFAULT_SEPARATOR}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item {...resetField} name={[...namePath, 'regex']} label={fieldLabel(tp('relabel_fields.regex'), 'regex')} tooltip={t('relabel.regex_tip')}>
              <Input />
            </Form.Item>
          </Col>
        </>
      )}
      {(action === 'labelkeep' || action === 'labeldrop') && (
        <Col span={12}>
          <Form.Item
            {...resetField}
            name={[...namePath, 'regex']}
            label='regex'
            rules={[
              {
                required: true,
              },
            ]}
            tooltip={t(`relabel.${action}.regex_tip`)}
          >
            <Input />
          </Form.Item>
        </Col>
      )}
      {action === 'labelmap' && (
        <>
          <Col span={6}>
            <Form.Item
              {...resetField}
              name={[...namePath, 'regex']}
              label='regex'
              rules={[
                {
                  required: true,
                },
              ]}
              tooltip={t('relabel.labelmap.regex_tip')}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item {...resetField} name={[...namePath, 'replacement']} label='replacement' tooltip={t('relabel.labelmap.replacement_tip')}>
              <Input />
            </Form.Item>
          </Col>
        </>
      )}
    </Row>
  );
}
