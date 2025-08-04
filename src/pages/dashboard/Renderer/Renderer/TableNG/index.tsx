import React, { useState, useEffect, useMemo } from 'react';
import { AllCommunityModule, ModuleRegistry, themeBalham } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import _ from 'lodash';
import { Select } from 'antd';

import { IRawTimeRange } from '@/components/TimeRangePicker';
import { useGlobalState } from '@/pages/dashboard/globalState';

import { IPanel } from '../../../types';
import getFormattedRowData from './utils/getFormattedRowData';
import { DARK_PARAMS, LIGHT_PARAMS } from './constants';
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
  const { themeMode, time, isPreview, values, series } = props;
  const { transformationsNG: transformations, custom, options, overrides } = values;
  const { showHeader = true, cellOptions } = custom || {};
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [, setSeries] = useGlobalState('series');
  const [, setTableFields] = useGlobalState('tableFields');

  const { data, rowData, formattedData } = useMemo(() => {
    const data = normalizeData(series, transformations);
    const columns = _.uniq(_.flatMap(data, 'columns'));
    setTableFields(columns);

    const rowData = data[activeIndex]?.rows || [];
    const formattedData = getFormattedRowData(rowData, { cellOptions, options, overrides });

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

  return (
    <div className={`n9e-dashboard-panel-table-ng ${showHeader ? '' : 'n9e-dashboard-panel-table-ng-hide-header'} p-2 w-full h-full flex flex-col gap-2`}>
      <AgGridReact
        headerHeight={showHeader ? 27 : 0}
        enableCellTextSelection
        suppressMovableColumns
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
    </div>
  );
}
