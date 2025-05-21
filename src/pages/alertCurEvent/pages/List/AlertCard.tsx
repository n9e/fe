import React, { useEffect, useState } from 'react';
import { CheckOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';
import moment from 'moment';

import { getAlertCards } from '@/services/warning';
import { parseRange } from '@/components/TimeRangePicker';

import { SEVERITY_COLORS } from '../../constants';

interface Props {
  filterObj: any;
  selectedAggrGroupId: number | undefined;
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
  const { filterObj, selectedAggrGroupId, refreshFlag, onUpdateAlertEventIds, onUpdateCardNum } = props;
  const [cardList, setCardList] = useState<CardType[]>();
  const [selectedCardId, setSelectedCardId] = useState<string>();

  useEffect(() => {
    reloadCard();
  }, [selectedAggrGroupId, JSON.stringify(filterObj), refreshFlag]);

  const { run: reloadCard } = useDebounceFn(
    () => {
      if (!selectedAggrGroupId) {
        setCardList([]);
        return;
      }
      const params: any = {
        view_id: selectedAggrGroupId,
        my_groups: String(filterObj.my_groups) === 'true',
        event_ids: filterObj?.event_ids?.join(','),
        ..._.omit(filterObj, ['range', 'my_groups', 'event_ids']),
      };
      if (filterObj.range) {
        const parsedRange = parseRange(filterObj.range);
        params.stime = moment(parsedRange.start).unix();
        params.etime = moment(parsedRange.end).unix();
      }

      getAlertCards(params).then((res) => {
        setCardList(res.dat);
        onUpdateCardNum(res.dat.length);
      });
    },
    {
      wait: 500,
    },
  );

  return (
    <div className='w-full overflow-y-auto pt-2 max-h-[172px] gap-4 items-start'>
      {cardList?.map((card, i) => (
        <div
          key={i}
          className={`py-1 px-2 event-card-new cursor-pointer items-center mr-3 mb-2 inline-flex justify-between gap-2 border-radius-[2px] ${SEVERITY_COLORS[card.severity - 1]} ${
            selectedCardId === card.title ? 'selected' : ''
          }`}
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
          {selectedCardId === card.title && <CheckOutlined className='font-bold' style={{ stroke: 'currentColor', strokeWidth: '50' }} />}
          <div className='truncate' style={{ color: 'inherit' }}>
            {card.title}
          </div>
          <span className={`event-card-circle ${SEVERITY_COLORS[card.severity - 1]} flex items-center justify-center w-[20px] h-[18px] rounded-lg `}>{card.total}</span>
        </div>
      ))}
    </div>
  );
};

export default AlertCard;
