import React, { useEffect, useState } from 'react';
import { CheckOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';

import { getAlertCards, getCardDetail } from '@/services/warning';

import { SeverityColor } from './index';
import './index.less';

interface Props {
  filter: any;
  onUpdateAlertEventIds: (eventIds: number[]) => void;
  refreshFlag: string;
}

export interface CardType {
  severity: number;
  title: string;
  total: number;
  event_ids: number[];
}

function Card(props: Props, ref) {
  const { filter, refreshFlag, onUpdateAlertEventIds } = props;
  const [cardList, setCardList] = useState<CardType[]>();
  const [drawerList, setDrawerList] = useState<any>();
  const [selectedCardId, setSelectedCardId] = useState<string>();

  useEffect(() => {
    console.log('filter', filter);
    reloadCard();
  }, [filter.rule_id, refreshFlag]);

  const { run: reloadCard } = useDebounceFn(
    () => {
      if (!filter.rule_id) return;
      console.log('filter.rule_id', filter.rule_id);
      getAlertCards({ view_id: filter.rule_id }).then((res) => {
        setCardList(res.dat);
      });
    },
    {
      wait: 500,
    },
  );

  const fetchCardDetail = (card: CardType) => {
    onUpdateAlertEventIds(card.event_ids);
    getCardDetail(card.event_ids).then((res) => {
      setDrawerList(res.dat);
    });
  };
  console.log(drawerList);

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
              fetchCardDetail(card);
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
}

export default React.forwardRef(Card);
