import React, { useEffect, useState } from 'react';
import { CheckOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';

import { getAlertCards, getCardDetail } from '@/services/warning';

import { SeverityColor } from './index';
import './index.less';

interface Props {
  filter: any;
  refreshFlag: string;
  onUpdateAlertEventIds: (eventIds: number[]) => void;
  onUpdateCardNum: (cardNum: number) => void;
}

export interface CardType {
  severity: number;
  title: string;
  total: number;
  event_ids: number[];
}

const AlertCard = (props: Props) => {
  const { filter, refreshFlag, onUpdateAlertEventIds, onUpdateCardNum } = props;
  const [cardList, setCardList] = useState<CardType[]>();
  const [selectedCardId, setSelectedCardId] = useState<string>();

  useEffect(() => {
    reloadCard();
  }, [filter.rule_id, refreshFlag, filter.my_groups]);

  const { run: reloadCard } = useDebounceFn(
    () => {
      getAlertCards({ view_id: filter.rule_id, my_groups: String(filter.my_groups) === 'true' }).then((res) => {
        setCardList(res.dat);
        onUpdateCardNum(res.dat.length);
      });
    },
    {
      wait: 500,
    },
  );

  console.log(filter.my_groups);

  return (
    <div className='w-full overflow-y-auto pt-2 max-h-[172px] gap-4 items-start'>
      {cardList?.map((card, i) => (
        <div
          key={i}
          className={`py-1 px-2 event-card-new cursor-pointer items-center mr-3 mb-2  inline-flex justify-between gap-2 border-radius-[2px] ${SeverityColor[card.severity - 1]}`}
          onClick={() => {
            if (selectedCardId === card.title) {
              setSelectedCardId(undefined);
              onUpdateAlertEventIds([]);
            } else {
              setSelectedCardId(card.title);
              onUpdateAlertEventIds(card.event_ids);
            }
          }}
        >
          {selectedCardId === card.title && <CheckOutlined className='font-bold' />}
          <div className='truncate' style={{ color: 'inherit' }}>
            {card.title}
          </div>
          <span className={`event-card-circle ${SeverityColor[card.severity - 1]} flex items-center justify-center w-[20px] h-[18px] rounded-lg `}>{card.total}</span>
        </div>
      ))}
    </div>
  );
};

export default AlertCard;
