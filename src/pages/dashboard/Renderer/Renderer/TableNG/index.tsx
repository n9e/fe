import React, { useState, useEffect, useMemo } from 'react';
import { AllCommunityModule, ModuleRegistry, themeBalham } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import _ from 'lodash';
import { Select, Space } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { FONT_FAMILY } from '@/utils/constant';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import useOnClickOutside from '@/components/useOnClickOutside';
import { useGlobalState } from '@/pages/dashboard/globalState';

import { IPanel } from '../../../types';
import { DARK_PARAMS, LIGHT_PARAMS } from './constants';
import getFormattedRowData from './utils/getFormattedRowData';
import normalizeData from './utils/normalizeData';
import CellRenderer from './CellRenderer';

import './style.less';

ModuleRegistry.registerModules([AllCommunityModule]);

interface Props {
  themeMode?: 'dark';
  time: IRawTimeRange;
  isPreview?: boolean;
  values: IPanel;
  series: any[];
}

export default function index(props: Props) {
  const { t } = useTranslation('dashboard');
  const { themeMode, time, isPreview, values, series } = props;
  const { transformationsNG: transformations, custom, options, overrides } = values;
  const { showHeader = true, cellOptions } = custom || {};
  const linksPopverRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [, setSeries] = useGlobalState('series');
  const [, setTableFields] = useGlobalState('tableFields');
  const { data, rowData, formattedData } = useMemo(() => {
    const data = normalizeData(series, transformations);
    const columns = _.uniq(_.flatMap(data, 'columns'));
    setTableFields(columns);

    const activeData = data[activeIndex];
    const rowData = activeData?.rows || [];
    const formattedData = getFormattedRowData(activeData, { cellOptions, options, overrides });

    return {
      data,
      rowData,
      formattedData,
    };
  }, [JSON.stringify(series), JSON.stringify(values)]); // TODO : 依赖项可能需要更精确的控制，不然会导致不必要的重新渲染

  const theme = useMemo(() => {
    if (themeMode === 'dark') {
      return themeBalham.withParams(DARK_PARAMS);
    }
    return themeBalham.withParams(LIGHT_PARAMS);
  }, [themeMode]);

  useEffect(() => {
    if (isPreview) {
      setSeries(series);
    }
  }, [JSON.stringify(series)]);

  useOnClickOutside(linksPopverRef, () => {
    if (linksPopverRef.current) {
      linksPopverRef.current.style.display = 'none';
    }
  });

  return (
    <div className={`n9e-dashboard-panel-table-ng ${showHeader ? '' : 'n9e-dashboard-panel-table-ng-hide-header'} p-2 w-full h-full flex flex-col gap-2`}>
      <AgGridReact
        headerHeight={showHeader ? 27 : 0}
        enableCellTextSelection
        suppressMovableColumns
        suppressColumnVirtualisation
        animateRows={false}
        theme={theme}
        rowData={rowData}
        columnDefs={_.map(data[activeIndex]?.columns, (item) => {
          return {
            field: item,
            headerName: item,
            cellStyle: {
              padding: 0,
            },
            cellClassRules: {
              'n9e-dashboard-panel-table-ng-cell-link': () => (options.links ? options.links.length === 1 : false),
              'n9e-dashboard-panel-table-ng-cell-links': () => (options.links ? options.links.length > 1 : false),
            },
            cellRenderer: (params) => {
              if (params.value === undefined) return null;
              const rowIndex = params.node?.rowIndex;
              const formattedValue = formattedData[rowIndex]?.[item];
              if (rowIndex === undefined || formattedValue === undefined) return params.value;
              return <CellRenderer formattedData={formattedData} formattedValue={formattedValue} field={item} params={params} panelParams={{ cellOptions, options, overrides }} />;
            },
          };
        })}
        defaultColDef={{
          flex: 1,
          resizable: false,
          cellStyle: {
            fontFamily: FONT_FAMILY,
            // 开启换行后，设置单元格文本的行高
            ...(cellOptions.wrapText ? { display: 'flex', alignItems: 'center', whiteSpace: 'normal', lineHeight: '1.5' } : {}),
          },
          wrapText: cellOptions.wrapText, // 用于单元格换行
          suppressSizeToFit: cellOptions.wrapText, // 用于单元格换行
          autoHeight: cellOptions.wrapText, // 用于单元格换行
        }}
        onCellClicked={(cellEvent) => {
          if (_.isEmpty(options.links)) return;
          if (options.links?.length === 1) {
            const link = options.links[0];
            window.open(link.url, link.targetBlank ? '_blank' : '_self');
          } else {
            const event = cellEvent.event as any;
            const { x: left, y: top } = event || {};
            if (linksPopverRef.current && left !== undefined && top !== undefined) {
              linksPopverRef.current.style.display = 'block';
              (window as any).placement(
                linksPopverRef.current,
                {
                  left,
                  top,
                },
                'right',
                'start',
                { bound: document.body },
              );
            }
          }
        }}
      />
      {_.isArray(_.compact(_.map(data, 'id'))) && _.compact(_.map(data, 'id')).length > 1 && (
        <Select
          className='w-full'
          showSearch
          options={_.map(_.compact(_.map(data, 'id')), (item, index) => {
            return {
              label: item,
              value: index,
            };
          })}
          value={activeIndex}
          onChange={(val) => {
            setActiveIndex(val);
          }}
        />
      )}
      <div className='n9e-dashboard-panel-table-ng-links-popover n9e-fill-color-3 pb-2 min-w-[120px] max-w-[400px] rounded n9e-base-shadow' ref={linksPopverRef}>
        <div className='p-2'>{t('panel.options.links.label')}</div>
        <div>
          {_.map(options.links, (link, index) => {
            return (
              <div key={index} className='py-1.5 px-2 n9e-dashboard-panel-table-ng-links-item'>
                <a href={link.url} target={link.targetBlank ? '_blank' : '_self'} rel='noopener noreferrer'>
                  <Space>
                    <LinkOutlined />
                    {link.title}
                  </Space>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
