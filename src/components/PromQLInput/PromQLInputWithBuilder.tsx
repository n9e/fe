import React from 'react';
import { Row, Col, Button } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import PromQueryBuilderModal from '@/components/PromQueryBuilder/PromQueryBuilderModal';
import PromQLInput, { CMExpressionInputProps } from './index';
import './locale';

export function PromQLInputWithBuilder(props: CMExpressionInputProps & { datasourceValue: number }) {
  const { t } = useTranslation('promQLInput');
  return (
    <Row gutter={8}>
      <Col flex='auto'>
        <PromQLInput {...props} />
      </Col>
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
        >
          {t('builder_btn')}
        </Button>
      </Col>
    </Row>
  );
}
