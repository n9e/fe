import React, { useState, useEffect, useMemo, useContext } from 'react';
import { AllCommunityModule, ModuleRegistry, themeBalham, CellClickedEvent, DomLayoutType } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { AG_GRID_LOCALE_CN, AG_GRID_LOCALE_HK, AG_GRID_LOCALE_EN, AG_GRID_LOCALE_JP } from '@ag-grid-community/locale';
import _ from 'lodash';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import getFontFamily from '@/utils/getFontFamily';
import { useGlobalState } from '@/pages/dashboard/globalState';
import localeCompare from '@/pages/dashboard/Renderer/utils/localeCompare';

import { IPanel } from '../../../types';
import { DARK_PARAMS, LIGHT_PARAMS } from './constants';
import getFormattedRowData from './utils/getFormattedRowData';
import normalizeData from './utils/normalizeData';
import CellRenderer from './CellRenderer';
import { TextObject } from './CellRenderer/types';
import CustomColumnFilter, { doesFilterPass } from './CustomColumnFilter';
import Links, { cellClickCallback } from './Links';

import './style.less';

const i18nAgGrid = {
  zh_CN: AG_GRID_LOCALE_CN,
  zh_HK: AG_GRID_LOCALE_HK,
  en_US: AG_GRID_LOCALE_EN,
  ja_JP: AG_GRID_LOCALE_JP,
  ru_RU: AG_GRID_LOCALE_EN,
};

ModuleRegistry.registerModules([AllCommunityModule]);

interface Props {
  themeMode?: 'dark';
  isPreview?: boolean;
  values: IPanel;
  series: any[];
  rangeMode?: 'lcro' | 'lcrc';
  ajustColumns?: (columns: string[]) => string[];
  themes?: {
    dark: { [key: string]: string | number | boolean | object };
    light: { [key: string]: string | number | boolean | object };
  };
  headerHeight?: number;
  rowHeight?: number;
  showUnderline?: boolean;
  onCellClick?: (
    cellEvent: CellClickedEvent<
      {
        [key: string]: TextObject;
      },
      any,
      any
    >,
  ) => void;
  domLayout?: DomLayoutType;
}

function index(props: Props) {
  const { t, i18n } = useTranslation('dashboard');
  const { siteInfo } = useContext(CommonStateContext);
  const {
    themeMode,
    isPreview,
    values,
    series,
    rangeMode,
    ajustColumns,
    themes = {
      dark: {},
      light: {},
    },
    headerHeight = 27,
    rowHeight = 27,
    showUnderline = false,
    onCellClick,
    domLayout,
  } = props;

  const { transformationsNG: transformations, custom, options, overrides } = values;
  const { showHeader = true, cellOptions = {}, filterable, sortColumn, sortOrder } = custom || {};
  const linksRef = React.useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [, setSeries] = useGlobalState('series');
  const [, setTableFields] = useGlobalState('tableFields');
  const { data, rowData, columns, formattedData } = useMemo(() => {
    const data = normalizeData(series, transformations);
    console.log(data, series);
    const columns = _.uniq(_.flatMap(data, 'columns'));
    setTableFields(columns);

    const activeData = data[activeIndex];
    const formattedData = getFormattedRowData(activeData, { cellOptions, options, overrides, rangeMode });

    return {
      data,
      rowData: formattedData,
      columns: activeData?.columns || [],
      formattedData,
    };
  }, [activeIndex, JSON.stringify(_.map(series, 'id')), JSON.stringify(transformations), JSON.stringify(cellOptions), JSON.stringify(options), JSON.stringify(overrides)]); // TODO : 依赖项可能需要更精确的控制，不然会导致不必要的重新渲染

  const theme = useMemo(() => {
    if (themeMode === 'dark') {
      return themeBalham.withParams({
        ...DARK_PARAMS,
        ...themes.dark,
      });
    }
    return themeBalham.withParams({
      ...LIGHT_PARAMS,
      ...themes.light,
    });
  }, [themeMode, JSON.stringify(themes)]);

  useEffect(() => {
    if (isPreview) {
      setSeries(series);
    }
  }, [JSON.stringify(_.map(series, 'id'))]);

  return (
    <div className={`n9e-dashboard-panel-table-ng ${showHeader ? '' : 'n9e-dashboard-panel-table-ng-hide-header'} p-2 h-full w-full flex flex-col gap-2`}>
      <AgGridReact
        headerHeight={showHeader ? headerHeight : 0}
        enableCellTextSelection
        suppressMovableColumns
        suppressColumnVirtualisation
        animateRows={false}
        theme={theme}
        enableFilterHandlers={true}
        domLayout={domLayout}
        localeText={{
          ...(i18nAgGrid[i18n.language] || AG_GRID_LOCALE_EN || {}),
          noRowsToShow: t('common:nodata'),
        }}
        rowData={rowData}
        columnDefs={_.map(ajustColumns ? ajustColumns(columns) : columns, (item) => {
          return {
            field: item,
            unSortIcon: true,
            headerName: item,
            cellStyle: {
              padding: 0,
            },
            cellClassRules: {
              'n9e-dashboard-panel-table-ng-cell-link': () => (options.links ? options.links.length === 1 : showUnderline),
              'n9e-dashboard-panel-table-ng-cell-links': () => (options.links ? options.links.length > 1 : false),
            },
            comparator: (value1, value2, node1, node2) => {
              // 手动获取字段值，解决字段名包含"点"时无法正确获取的问题
              const fieldValue1 = node1.data?.[item];
              const fieldValue2 = node2.data?.[item];
              const date1Number = fieldValue1?.value ?? null;
              const date2Number = fieldValue2?.value ?? null;
              if (date1Number === null && date2Number === null) {
                return 0;
              }
              if (date1Number === null) {
                return -1;
              }
              if (date2Number === null) {
                return 1;
              }
              if (_.isNumber(date1Number) && _.isNumber(date2Number)) {
                return date1Number - date2Number;
              }
              return localeCompare(date1Number, date2Number);
            },
            cellRenderer: (params) => {
              const field = params.colDef?.field;
              const fieldValue = params.data?.[field];

              if (fieldValue === undefined) return '';

              return (
                <CellRenderer
                  formattedData={formattedData}
                  formattedValue={fieldValue}
                  field={item}
                  panelParams={{ cellOptions, options, overrides }}
                  rangeMode={rangeMode}
                  rowHeight={rowHeight}
                />
              );
            },
          };
        })}
        defaultColDef={{
          flex: 1,
          resizable: false,
          minWidth: 100,
          sortable: true, // 启用排序功能
          cellStyle: {
            fontFamily: getFontFamily(siteInfo?.font_family),
            // 开启换行后，设置单元格文本的行高
            ...(cellOptions.wrapText ? { display: 'flex', alignItems: 'center', whiteSpace: 'normal', lineHeight: '1.5' } : {}),
          },
          filter: filterable
            ? {
                component: CustomColumnFilter,
                doesFilterPass,
              }
            : false,
          filterParams: filterable ? {} : undefined,
          wrapText: cellOptions.wrapText, // 用于单元格换行
          suppressSizeToFit: cellOptions.wrapText, // 用于单元格换行
          autoHeight: cellOptions.wrapText, // 用于单元格换行
          headerStyle: {
            fontFamily: getFontFamily(siteInfo?.font_family),
          },
        }}
        onGridReady={(params) => {
          // 列的默认排序
          if (sortColumn && sortOrder) {
            params.api.applyColumnState({
              state: [
                {
                  colId: sortColumn,
                  sort: sortOrder === 'ascend' ? 'asc' : 'desc',
                },
              ],
            });
          }
        }}
        onCellClicked={(cellEvent) => {
          if (onCellClick) {
            onCellClick(cellEvent);
          } else {
            cellClickCallback(cellEvent, { links: options.links, linksRef });
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
      <Links ref={linksRef} links={options.links} />
    </div>
  );
}

export default React.memo(index, (prevProps, nextProps) => {
  const omitKeys = ['series'];
  const otherPropsEqual = _.isEqual(_.omit(prevProps, omitKeys), _.omit(nextProps, omitKeys));
  const seriesPropEqual = _.isEqual(_.map(prevProps.series, 'id'), _.map(nextProps.series, 'id'));
  return otherPropsEqual && seriesPropEqual;
});
