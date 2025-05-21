import React from 'react';
import { CheckOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { Space } from 'antd';

import { SEVERITY_COLORS } from '../../constants';
import { FilterType, CardType } from '../../types';

interface Props {
  cardList?: CardType[];
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
}

function isEqualEventIds(arr1?: number[], arr2?: number[]) {
  if (!arr1 || !arr2) {
    return false;
  }
  return _.isEqual(_.sortBy(arr1), _.sortBy(arr2));
}

const AlertCard = (props: Props) => {
  const { filter, setFilter, cardList } = props;

  if (_.isEmpty(cardList)) return null;

  return (
    <div className='w-full overflow-y-auto pt-2 max-h-[172px]'>
      <Space wrap>
        {_.map(cardList, (card, i) => {
          return (
            <div
              key={i}
              className={`py-1 px-2 event-card-new cursor-pointer items-center inline-flex justify-between gap-2 rounded-[4px] ${SEVERITY_COLORS[card.severity - 1]} ${
                isEqualEventIds(filter.event_ids, card.event_ids) ? 'selected' : ''
              }`}
              onClick={() => {
                if (isEqualEventIds(filter.event_ids, card.event_ids)) {
                  setFilter({
                    ...filter,
                    event_ids: [],
                  });
                } else {
                  setFilter({
                    ...filter,
                    event_ids: card.event_ids,
                  });
                }
              }}
            >
              {isEqualEventIds(filter.event_ids, card.event_ids) && <CheckOutlined className='font-bold' style={{ stroke: 'currentColor', strokeWidth: '50' }} />}
              <div className='truncate' style={{ color: 'inherit' }}>
                {card.title}
              </div>
              <span className={`event-card-circle ${SEVERITY_COLORS[card.severity - 1]} flex items-center justify-center w-[20px] h-[18px] rounded-lg `}>{card.total}</span>
            </div>
          );
        })}
      </Space>
    </div>
  );
};

export default AlertCard;
