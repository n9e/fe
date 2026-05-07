import React, { useState, useEffect } from 'react';
import { Modal, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';

interface IProps {
  queries: any[];
  add: (query: any) => void;
}

function EnhancedModal(props: ModalWrapProps & IProps) {
  const { t } = useTranslation('alertRules');
  const { visible, destroy, queries, add } = props;
  const [selectedRef, setSelectedRef] = useState<string | undefined>();

  // 查询统计里只有一条查询条件时，直接克隆，不弹窗选择
  useEffect(() => {
    if (queries.length === 1) {
      const queryWithoutRef = _.omit(queries[0], 'ref');
      add(queryWithoutRef);
      destroy();
    }
  }, []);
  const queryOptions = _.map(queries, (item) => ({
    label: item?.ref,
    value: item?.ref,
  }));

  const handleOk = () => {
    if (!selectedRef) {
      // 选择为空，新增一个空 enrich_query
      add({
        interval_unit: 'min',
        interval: 1,
        date_field: '@timestamp',
        value: { func: 'rawData' },
      });
    } else {
      const selectedQuery = _.find(queries, ['ref', selectedRef]);
      if (selectedQuery) {
        // 去掉 ref 属性后添加
        const queryWithoutRef = _.omit(selectedQuery, 'ref');
        add(queryWithoutRef);
      }
    }
    destroy();
  };

  return (
    <Modal title={t('enrich.select_tip')} visible={visible} onCancel={destroy} onOk={handleOk}>
      <Select className='w-full' options={queryOptions} onChange={setSelectedRef} allowClear />
    </Modal>
  );
}

export default ModalHOC<IProps>(EnhancedModal);
