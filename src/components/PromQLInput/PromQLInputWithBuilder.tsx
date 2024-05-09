import React from 'react';
import { Row, Col, Button, Input } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import PromQueryBuilderModal from '@/components/PromQueryBuilder/PromQueryBuilderModal';
import BuiltinMetrics from './BuiltinMetrics';
import PromQLInput, { CMExpressionInputProps } from './index';
import './locale';

export function PromQLInputWithBuilder(props: CMExpressionInputProps & { datasourceValue: number; showBuiltinMetrics?: boolean; showBuilder?: boolean }) {
  const { t } = useTranslation('promQLInput');
  const inputProps: any = { ...props };

  if (inputProps.id) {
    inputProps.key = inputProps.id;
  }

  return (
    <Row gutter={8}>
      <Col flex='auto'>
        <div className='promql-input-group-container'>
          <Input.Group>
            {props.showBuiltinMetrics && (
              <BuiltinMetrics
                mode='dropdown'
                onSelect={(newValue) => {
                  inputProps?.onChange?.(newValue);
                }}
              />
            )}
            <span className='ant-input-affix-wrapper'>
              <PromQLInput {...inputProps} />
            </span>
          </Input.Group>
        </div>
      </Col>
      {props.showBuilder === false ? null : (
        <Col flex='74px'>
          <Button
            onClick={() => {
              PromQueryBuilderModal({
                // TODO: PromQL 默认是最近12小时，这块应该从使用组件的环境获取实际的时间范围
                range: {
                  start: 'now-12h',
                  end: 'now',
                },
                datasourceValue: props.datasourceValue,
                value: props.value,
                onChange: (val) => {
                  props.onChange && props.onChange(val);
                },
              });
            }}
            disabled={props.readonly}
          >
            {t('builder_btn')}
          </Button>
        </Col>
      )}
    </Row>
  );
}
