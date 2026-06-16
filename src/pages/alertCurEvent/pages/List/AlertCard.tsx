import React from 'react';
import { CheckOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { Space } from 'antd';

import { SEVERITY_COLORS } from '../../constants';
import { FilterType, CardType, CardDimension } from '../../types';

interface Props {
  cardList?: CardType[];
  filter: FilterType;
  setFilter: (patch: Partial<FilterType>) => void;
}

// 维度数组顺序由聚合规则决定且稳定，可直接深比较来判断是否同一张卡片
export function isSameDimensions(a?: CardDimension[], b?: CardDimension[]) {
  if (!a || !b) {
    return false;
  }
  return _.isEqual(a, b);
}

const AlertCard = (props: Props) => {
  const { filter, setFilter, cardList } = props;
  const selectedDimensions = filter.selections?.[0]?.dimensions;

  if (_.isEmpty(cardList)) return null;

  return (
    <div className='w-full overflow-y-auto pt-2 max-h-[172px]'>
      <Space wrap>
        {_.map(cardList, (card, i) => {
          const selected = isSameDimensions(selectedDimensions, card.dimensions);
          return (
            <div
              key={i}
              className={`py-1 px-2 event-card-new cursor-pointer items-center inline-flex justify-between gap-2 rounded-[4px] ${SEVERITY_COLORS[card.severity - 1]} ${
                selected ? 'selected' : ''
              }`}
              onClick={() => {
                if (selected) {
                  setFilter({ selections: [] });
                } else {
                  setFilter({ selections: [{ view_id: filter.aggr_rule_id as number, dimensions: card.dimensions }] });
                }
              }}
            >
              {selected && <CheckOutlined className='font-bold' style={{ stroke: 'currentColor', strokeWidth: '50' }} />}
              <div className='truncate' style={{ color: 'inherit' }}>
                {card.title}
              </div>
              <span className={`event-card-circle ${SEVERITY_COLORS[card.severity - 1]} flex items-center justify-center min-w-[20px] h-[18px] px-1 rounded-lg `}>
                {card.total}
              </span>
            </div>
          );
        })}
      </Space>
    </div>
  );
};

export default AlertCard;
