import React, { useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Popover, Progress, Space, Spin } from 'antd';
import Icon, { PlusCircleOutlined, CloseCircleOutlined, CalendarOutlined, QuestionOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import { getFieldLabel } from '../../Elasticsearch/utils';
import { dslBuilder } from '../../Elasticsearch/utils';
import { getFieldValues, typeMap } from '../../Elasticsearch/services';
import { Field as FieldType, Filter } from '../services';

interface Props {
  item: string;
  record: FieldType;
  type: 'selected' | 'available';
  fieldConfig?: any;
  params?: any;
  onSelect?: (field: string) => void;
  onRemove?: (field: string) => void;
  filters?: Filter[];
  onValueFilter?: (Filter) => void;
}

const operIconMap = {
  selected: <CloseCircleOutlined />,
  available: <PlusCircleOutlined />,
};

const FieldBooleanSvg = () => (
  <svg width='1em' height='1em' fill='currentColor' viewBox='0 0 76 76'>
    <path d='M 36,23L 30,23L 30,40L 25,40L 25,23L 19,23L 19,19L 36,19L 36,23 Z M 57,40L 50,40L 50,45L 56,45L 56,49L 50,49L 50,57L 45,57L 45,36L 57,36L 57,40 Z M 44,19L 48.5,19L 32.5,57L 28,57L 44,19 Z ' />
  </svg>
);

const FieldBooleanIcon = (props: Partial<CustomIconComponentProps>) => <Icon component={FieldBooleanSvg} {...props} />;

export const typeIconMap = {
  string: (
    <span className='es-discover-fields-item-field' style={{ color: '#4a7194' }}>
      t
    </span>
  ),
  number: (
    <span className='es-discover-fields-item-field' style={{ color: '#387765' }}>
      #
    </span>
  ),
  date: <CalendarOutlined style={{ color: '#7b705a' }} />,
  boolean: <FieldBooleanIcon style={{ color: '#996130', fontSize: 18 }} />,
};

export default function Field(props: Props) {
  const { t } = useTranslation('explorer');
  const { item, record, type, fieldConfig, params, onSelect, onRemove, filters, onValueFilter } = props;
  const { form, timesRef, datasourceValue, order, limit } = params;
  const [top5Visible, setTop5Visible] = useState<boolean>(false);
  const [top5Data, setTop5Data] = useState<any[]>([]);
  const [top5Loading, setTop5Loading] = useState<boolean>(false);
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
          <strong>{t('log.fieldValues_topn')}</strong>
          <Spin spinning={top5Loading}>
            <div className='es-discover-field-values-topn-list'>
              {_.isEmpty(top5Data) && t('log.fieldValues_topnNoData')}
              {_.map(top5Data, (item) => {
                const percent = _.floor(item.value * 100, 2);
                return (
                  <div key={item.label} className='es-discover-field-values-topn-item'>
                    <div style={{ width: 'calc(100% - 40px)' }}>
                      <div className='es-discover-field-values-topn-item-content'>
                        <div className='es-discover-field-values-topn-item-label'>{item.label || '(empty)'}</div>
                        <div className='es-discover-field-values-topn-item-percent'>{percent}%</div>
                      </div>
                      <Progress percent={percent} size='small' showInfo={false} strokeColor='#6c53b1' />
                    </div>
                    <div style={{ width: 32 }}>
                      <Space>
                        <PlusCircleOutlined
                          onClick={() => {
                            if (onValueFilter) {
                              onValueFilter({
                                key: record.name,
                                value: item.label,
                                operator: 'is',
                              });
                              setTop5Visible(false);
                            }
                          }}
                        />
                        <MinusCircleOutlined
                          onClick={() => {
                            if (onValueFilter) {
                              onValueFilter({
                                key: record.name,
                                value: item.label,
                                operator: 'is not',
                              });
                              setTop5Visible(false);
                            }
                          }}
                        />
                      </Space>
                    </div>
                  </div>
                );
              })}
            </div>
          </Spin>
        </div>
      }
      onVisibleChange={(visible) => {
        setTop5Visible(visible);
        if (visible) {
          setTop5Loading(true);
          const values = form.getFieldsValue();
          getFieldValues(
            datasourceValue,
            dslBuilder({
              index: values.query.index,
              date_field: values.query.date_field,
              ...timesRef.current,
              filters,
              query_string: values.query.filter,
              limit,
              order,
              orderField: values.query.date_field,
              fields: [item],
            }),
            item,
          )
            .then((res) => {
              setTop5Data(res);
            })
            .finally(() => {
              setTop5Loading(false);
            });
        } else {
          setTop5Data([]);
        }
      }}
    >
      <div className='es-discover-fields-item' key={item}>
        <span className='es-discover-fields-item-icon'>{typeIconMap[typeMap[record.type]] || <QuestionOutlined />}</span>
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
