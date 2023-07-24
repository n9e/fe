import React, { useState } from 'react';
import _ from 'lodash';
import { Popover, Progress } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getFieldLabel } from '../../Elasticsearch/utils';
import { normalizeFieldValuesQueryRequestBody } from '../../Elasticsearch/utils';
import { getFieldValues } from '../../Elasticsearch/services';

interface Props {
  item: string;
  type: 'selected' | 'available';
  onSelect?: (field: string) => void;
  onRemove?: (field: string) => void;
  fieldConfig?: any;
  params?: any;
}

const operIconMap = {
  selected: <CloseCircleOutlined />,
  available: <PlusCircleOutlined />,
};

export default function Field(props: Props) {
  const { item, type, onSelect, onRemove, fieldConfig, params } = props;
  const { form, timesRef, datasourceValue } = params;
  const [top5Visible, setTop5Visible] = useState<boolean>(false);
  const [top5Data, setTop5Data] = useState<any[]>([]);
  const fieldLabel = getFieldLabel(item, fieldConfig);

  return (
    <Popover
      placement='right'
      trigger={['click']}
      overlayInnerStyle={{
        width: 240,
        height: 240,
      }}
      visible={top5Visible}
      title={fieldLabel}
      content={
        <div className='es-discover-field-values-topn'>
          <strong>前 5 个值</strong>
          <div className='es-discover-field-values-topn-list'>
            {_.map(top5Data, (item) => {
              const percent = _.floor(item.value * 100, 2);
              return (
                <div key={item.label} className='es-discover-field-values-topn-item'>
                  <div className='es-discover-field-values-topn-item-content'>
                    <div className='es-discover-field-values-topn-item-label'>{item.label}</div>
                    <div className='es-discover-field-values-topn-item-percent'>{percent}%</div>
                  </div>
                  <Progress percent={percent} size='small' showInfo={false} strokeColor='#6c53b1' />
                </div>
              );
            })}
          </div>
        </div>
      }
      onVisibleChange={(visible) => {
        setTop5Visible(visible);
        if (visible) {
          const values = form.getFieldsValue();
          getFieldValues(
            datasourceValue,
            normalizeFieldValuesQueryRequestBody(
              {
                ...timesRef.current,
                index: values.query.index,
                filter: values.query.filter,
                date_field: values.query.date_field,
                limit: 500,
                order: 'desc',
              },
              item,
            ),
            item,
          ).then((res) => {
            setTop5Data(res);
          });
        } else {
          setTop5Data([]);
        }
      }}
    >
      <div className='es-discover-fields-item' key={item} onClick={() => {}}>
        <span className='es-discover-fields-item-content'>{fieldLabel}</span>
        <span
          className='es-discover-fields-item-oper'
          onClick={() => {
            if (type === 'selected' && onRemove) {
              onRemove(item);
            } else if (type === 'available' && onSelect) {
              onSelect(item);
            }
          }}
        >
          {operIconMap[type]}
        </span>
      </div>
    </Popover>
  );
}
