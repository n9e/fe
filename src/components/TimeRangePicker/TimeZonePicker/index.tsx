import React, { useMemo } from 'react';
import _, { find, toLower, isEmpty } from 'lodash';
import { Select, Space } from 'antd';

import { TimeZone, InternalTimeZones } from '@/utils/datetime/types';
import { TimeZoneInfo, getTimeZoneGroups, getTimeZoneInfo } from '@/utils/datetime/timezones';
import { dateTimeFormat } from '@/utils/datetime/formatter';

interface SelectableZoneGroup {
  label?: string;
  value?: TimeZone;
  searchIndex?: string;
  options?: SelectableZone[];
}

export interface GroupedTimeZones {
  name: string;
  zones: TimeZone[];
}

type SelectableZone = {
  label: string;
  value: TimeZone;
  searchIndex: string;
};

export const useTimeZones = (includeInternal: boolean | InternalTimeZones[]): SelectableZoneGroup[] => {
  const now = Date.now();

  const timeZoneGroups = getTimeZoneGroups(includeInternal).map((group: GroupedTimeZones) => {
    const options = group.zones.reduce((options: SelectableZone[], zone) => {
      const info = getTimeZoneInfo(zone, now);

      if (!info) {
        return options;
      }

      options.push({
        label: info.name,
        value: info.zone,
        searchIndex: getSearchIndex(info, now),
      });

      return options;
    }, []);

    return {
      label: group.name,
      options,
    };
  });

  return timeZoneGroups;
};

export const useSelectedTimeZone = (groups: SelectableZoneGroup[], timeZone: TimeZone | undefined): SelectableZone | undefined => {
  return useMemo(() => {
    if (timeZone === undefined) {
      return undefined;
    }

    const tz = toLower(timeZone);

    const group = groups.find((group) => {
      if (!group.label) {
        return isInternal(tz);
      }
      return tz.startsWith(toLower(group.label));
    });

    return find(group?.options, (option) => {
      if (isEmpty(tz)) {
        return option.value === InternalTimeZones.default;
      }
      return toLower(option.value) === tz;
    });
  }, [groups, timeZone]);
};

export const useDescription = (info?: TimeZoneInfo): string => {
  return useMemo(() => {
    const parts: string[] = [];

    if (!info) {
      return '';
    }

    if (info.countries.length > 0) {
      const country = info.countries[0];
      parts.push(country.name);
    }

    if (info.abbreviation) {
      parts.push(info.abbreviation);
    }

    return parts.join(', ');
  }, [info]);
};

const isInternal = (timeZone: TimeZone): boolean => {
  switch (timeZone) {
    case InternalTimeZones.default:
    case InternalTimeZones.localBrowserTime:
    case InternalTimeZones.utc:
      return true;

    default:
      return false;
  }
};

const getSearchIndex = (info: TimeZoneInfo, timestamp: number): string => {
  const parts: string[] = [toLower(info.name), toLower(info.abbreviation), toLower(formatUtcOffset(info.zone, timestamp))];

  for (const country of info.countries) {
    parts.push(toLower(country.name));
    parts.push(toLower(country.code));
  }

  return parts.join('|');
};

export const formatUtcOffset = (timeZone: TimeZone, timestamp: number): string => {
  const offset = dateTimeFormat(timestamp, {
    timeZone,
    format: 'Z',
  });

  return `UTC${offset}`;
};

function TimeZoneOption({ zone, timestamp }: { zone: TimeZone; timestamp: number }) {
  const timeZoneInfo = getTimeZoneInfo(zone, timestamp);
  const description = useDescription(timeZoneInfo);
  const offset = formatUtcOffset(zone, timestamp);

  return (
    <div className='flex justify-between items-center'>
      <Space>
        <span>{timeZoneInfo?.name}</span>
        <span style={{ color: '#999' }}>{description}</span>
      </Space>
      <span style={{ color: '#999' }}>{offset}</span>
    </div>
  );
}

export default function TimeZonePicker(props: { value?: TimeZone; onChange?: (value: TimeZone) => void }) {
  const { value, onChange } = props;
  const groupedTimeZones = useTimeZones(true);
  const timestamp = Date.now();

  return (
    <Select
      style={{ width: '100%' }}
      showSearch
      optionFilterProp='searchIndex'
      options={_.map(groupedTimeZones, (item) => {
        return {
          label: item.label || 'Normal',
          options: _.map(item?.options, (option) => {
            return {
              label: <TimeZoneOption zone={option.value} timestamp={timestamp} />,
              value: option.value,
              searchIndex: option.searchIndex,
            };
          }),
        };
      })}
      value={value}
      onChange={onChange}
    />
  );
}
