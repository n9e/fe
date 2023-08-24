import React, { useState } from 'react';
import { Modal } from 'antd';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import PromQueryBuilder, { PromVisualQuery, renderQuery, buildPromVisualQueryFromPromQL } from './index';
import './locale';

interface IProps {
  datasourceValue: number;
  range: IRawTimeRange;
  value?: string;
  onChange: (value: string) => void;
}

function PromQueryBuilderModal(props: ModalWrapProps & IProps) {
  const { t } = useTranslation('PromQueryBuilder');
  const { visible, datasourceValue, range, value = '', onChange } = props;
  const parsedRange = parseRange(range);
  const start = moment(parsedRange.start).unix();
  const end = moment(parsedRange.end).unix();
  const queryContext = buildPromVisualQueryFromPromQL(value);
  const [query, setQuery] = useState<PromVisualQuery>(queryContext.query);

  return (
    <Modal
      width={800}
      title={t('title')}
      visible={visible}
      closable={false}
      onOk={() => {
        onChange(renderQuery(query));
        props.destroy();
      }}
      onCancel={() => {
        props.destroy();
      }}
    >
      <PromQueryBuilder
        datasourceValue={datasourceValue}
        params={{
          start,
          end,
        }}
        value={query}
        onChange={(query) => {
          setQuery(query);
        }}
      />
    </Modal>
  );
}

export default ModalHOC<IProps>(PromQueryBuilderModal);
