import React, { useState, useEffect, useMemo, useContext, useImperativeHandle } from 'react';
import { AllCommunityModule, ModuleRegistry, themeBalham, CellClickedEvent, DomLayoutType, GridApi, ICellRendererParams, RowNode } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { AG_GRID_LOCALE_CN, AG_GRID_LOCALE_HK, AG_GRID_LOCALE_EN, AG_GRID_LOCALE_JP } from '@ag-grid-community/locale';
import _ from 'lodash';
import { Select, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { useClickAway } from 'ahooks';

import { CommonStateContext } from '@/App';
import getFontFamily from '@/utils/getFontFamily';
import { useGlobalState } from '@/pages/dashboard/globalState';
import localeCompare from '@/pages/dashboard/Renderer/utils/localeCompare';
import useStableValue from '@/pages/dashboard/hooks/useStableValue';

import { IOverride, IPanel } from '../../../types';
import type { CalculatedSeries } from '../../utils/getCalculatedValuesBySeries';
import { downloadCsv } from '../Table/utils';
import { DARK_PARAMS, LIGHT_PARAMS } from './constants';
import getFormattedRowData from './utils/getFormattedRowData';
import normalizeData from './utils/normalizeData';
import {
  getColumnWidthColDef,
  getResolvedColumnWidths,
  readCachedColumnWidths,
  removeCachedColumnWidth,
  TABLE_COLUMN_MIN_WIDTH,
  upsertColumnWidthOverride,
} from './utils/columnWidth';
import CellRenderer from './CellRenderer';
import { TextObject } from './CellRenderer/types';
import CustomColumnFilter, { doesFilterPass } from './CustomColumnFilter';
import Links, { cellClickCallback } from './Links';
import type { LinksHandle } from './Links';
import RowDetailDrawer from './RowDetailDrawer';
import TextSearchIcon from './TextSearchIcon';
import { getDisplayedRowDetails, shouldIgnoreRowDetailClickAway } from './rowDetailUtils';
import type { RowDetailData } from './rowDetailUtils';

import './style.less';

const i18nAgGrid = {
  zh_CN: AG_GRID_LOCALE_CN,
  zh_HK: AG_GRID_LOCALE_HK,
  en_US: AG_GRID_LOCALE_EN,
  ja_JP: AG_GRID_LOCALE_JP,
  ru_RU: AG_GRID_LOCALE_EN,
};

ModuleRegistry.registerModules([AllCommunityModule]);

const ROW_DETAIL_COLUMN_ID = '__table_ng_row_detail__';
type TableGridRow = Record<string, TextObject>;

interface Props {
  themeMode?: 'dark';
  isPreview?: boolean;
  id?: string; // dashboardID
  values: IPanel;
  series: CalculatedSeries[];
  rangeMode?: 'lcro' | 'lcrc';
  ajustColumns?: (columns: string[]) => string[];
  themes?: {
    dark: { [key: string]: string | number | boolean | object };
    light: { [key: string]: string | number | boolean | object };
  };
  headerHeight?: number;
  rowHeight?: number;
  showUnderline?: boolean;
  dataRevision?: number;
  onCellClick?: (
    cellEvent: CellClickedEvent<
      {
        [key: string]: TextObject;
      },
      TextObject,
      unknown
    >,
  ) => void;
  domLayout?: DomLayoutType;
  onOverridesChange?: (overrides: IOverride[]) => void;
}

function index(props: Props, ref: React.Ref<{ exportCsv: () => void }>) {
  const { t, i18n } = useTranslation('dashboard');
  const { siteInfo } = useContext(CommonStateContext);
  const {
    themeMode,
    isPreview,
    id: dashboardId,
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
    onOverridesChange,
  } = props;
  const dataDependency = props.dataRevision ?? series;

  // 列宽缓存 key：dashboardID + panelID
  const cacheKey = dashboardId && values?.id ? `tableNG_colWidths_${dashboardId}_${values.id}` : null;

  const { transformationsNG: transformations, custom, options, overrides } = values;
  const { showHeader = true, cellOptions = {}, filterable, sortColumn, sortOrder, enableRowDetail = false } = custom || {};
  const stableTransformations = useStableValue(transformations);
  const stableCellOptions = useStableValue(cellOptions);
  const stableOptions = useStableValue(options);
  const stableOverrides = useStableValue(overrides);
  const stableThemes = useStableValue(themes);
  // useRef 不支持懒初始化，在渲染时直接同步读取初始值
  const cachedColWidthsRef = React.useRef<Record<string, number>>(readCachedColumnWidths(cacheKey));
  const appliedColWidthsRef = React.useRef<Record<string, number>>({});
  const gridApiRef = React.useRef<GridApi<Record<string, TextObject>>>(null);
  const persistedColumnWidths = getResolvedColumnWidths(cachedColWidthsRef.current, overrides);
  const linksRef = React.useRef<LinksHandle>(null);
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [rowDetailState, setRowDetailState] = useState<{
    visible: boolean;
    rows: RowDetailData[];
    currentIndex: number;
  }>({
    visible: false,
    rows: [],
    currentIndex: -1,
  });
  const [, setSeries] = useGlobalState('series');
  const [, setTableFields] = useGlobalState('tableFields');
  const { data, rowData, columns, formattedData, sourceRowByFormattedRow } = useMemo(() => {
    const data = normalizeData(series, transformations);
    const columns = _.uniq(_.flatMap(data, 'columns'));

    const activeData = data[activeIndex];
    const formattedData = getFormattedRowData(activeData, { cellOptions, options, overrides, rangeMode });
    const sourceRowByFormattedRow = new WeakMap<object, RowDetailData>();
    _.forEach(formattedData, (formattedRow, index) => {
      const sourceRow = activeData?.rows[index];
      if (sourceRow) {
        sourceRowByFormattedRow.set(formattedRow, sourceRow);
      }
    });

    return {
      data,
      rowData: formattedData,
      columns: activeData?.columns || [],
      formattedData,
      sourceRowByFormattedRow,
    };
  }, [activeIndex, dataDependency, stableTransformations, stableCellOptions, stableOptions, stableOverrides]);

  useEffect(() => {
    setTableFields(columns);
  }, [columns, setTableFields]);

  useEffect(() => {
    setRowDetailState({
      visible: false,
      rows: [],
      currentIndex: -1,
    });
  }, [activeIndex, rowData, enableRowDetail]);

  useClickAway(
    (event) => {
      const target = (event && (event as Event).target) as HTMLElement | null;
      if (shouldIgnoreRowDetailClickAway(target)) {
        return;
      }
      if (rowDetailState.currentIndex > -1) {
        setRowDetailState({
          visible: false,
          rows: [],
          currentIndex: -1,
        });
      }
    },
    [tableContainerRef],
    ['click'],
  );

  useImperativeHandle(
    ref,
    () => ({
      exportCsv() {
        const csvData = [columns, ..._.map(formattedData, (row) => _.map(columns, (col) => row[col]?.text ?? ''))];
        downloadCsv(csvData, values.name);
      },
    }),
    [columns, formattedData, values.name],
  );

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
  }, [themeMode, stableThemes]);

  useEffect(() => {
    if (isPreview) {
      setSeries(series);
    }
  }, [dataDependency]);

  const applyPersistedColumnWidths = (api = gridApiRef.current) => {
    if (!api) return;
    const columnWidths = getResolvedColumnWidths(cachedColWidthsRef.current, overrides);
    const removedFields = _.difference(_.keys(appliedColWidthsRef.current), _.keys(columnWidths));
    const state = [..._.map(columnWidths, (width, colId) => ({ colId, width, flex: null })), ..._.map(removedFields, (colId) => ({ colId, flex: 1 }))];
    if (_.isEmpty(state)) return;

    api.applyColumnState({
      state,
    });
    appliedColWidthsRef.current = columnWidths;
  };

  // cacheKey 变化时（如面板切换）重新加载旧缓存。
  useEffect(() => {
    cachedColWidthsRef.current = readCachedColumnWidths(cacheKey);
    applyPersistedColumnWidths();
  }, [cacheKey]);

  // 编辑器表单或仪表盘状态更新 override 后，立即同步到当前网格。
  useEffect(() => {
    applyPersistedColumnWidths();
  }, [JSON.stringify(overrides)]);

  return (
    <div
      ref={tableContainerRef}
      className={`n9e-dashboard-panel-table-ng ${showHeader ? '' : 'n9e-dashboard-panel-table-ng-hide-header'} relative p-2 h-full w-full flex flex-col gap-2`}
    >
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
        columnDefs={[
          ...(enableRowDetail
            ? [
                {
                  colId: ROW_DETAIL_COLUMN_ID,
                  headerName: '',
                  width: 30,
                  minWidth: 30,
                  maxWidth: 30,
                  flex: 0,
                  pinned: 'left' as const,
                  lockPinned: true,
                  lockPosition: 'left' as const,
                  sortable: false,
                  filter: false,
                  resizable: false,
                  suppressSizeToFit: true,
                  suppressAutoSize: true,
                  suppressMovable: true,
                  suppressHeaderMenuButton: true,
                  cellStyle: {
                    padding: 0,
                  },
                  cellRenderer: (params: ICellRendererParams<TableGridRow>) => (
                    <Tooltip title={t('panel.custom.tableNG.rowDetail.triggerTip')}>
                      <div
                        className='absolute inset-0 flex items-center justify-center cursor-pointer'
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          const { rows, currentIndex } = getDisplayedRowDetails(params.api, sourceRowByFormattedRow, params.data);
                          if (currentIndex > -1) {
                            setRowDetailState({
                              visible: true,
                              rows,
                              currentIndex,
                            });
                          }
                        }}
                      >
                        <TextSearchIcon className='text-[14px]' />
                      </div>
                    </Tooltip>
                  ),
                },
              ]
            : []),
          ..._.map(ajustColumns ? ajustColumns(columns) : columns, (item) => {
            const persistedWidth = persistedColumnWidths[item];
            return {
              field: item,
              unSortIcon: true,
              headerName: item,
              // 重渲染首帧直接使用持久化宽度，避免 defaultColDef.flex 先回排再由 effect 修正造成闪动。
              ...getColumnWidthColDef(persistedWidth),
              cellStyle: {
                padding: 0,
              },
              cellClassRules: {
                'n9e-dashboard-panel-table-ng-cell-link': () => (options.links ? options.links.length === 1 : showUnderline),
                'n9e-dashboard-panel-table-ng-cell-links': () => (options.links ? options.links.length > 1 : false),
              },
              comparator: (_value1: TextObject | undefined, _value2: TextObject | undefined, node1: RowNode<TableGridRow>, node2: RowNode<TableGridRow>) => {
                // 手动获取字段值，解决字段名包含"点"时无法正确获取的问题
                const fieldValue1 = node1.data?.[item];
                const fieldValue2 = node2.data?.[item];
                const date1Number = fieldValue1?.stat ?? fieldValue1?.value ?? null;
                const date2Number = fieldValue2?.stat ?? fieldValue2?.value ?? null;
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
              cellRenderer: (params: ICellRendererParams<TableGridRow, TextObject>) => {
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
          }),
        ]}
        defaultColDef={{
          flex: 1,
          resizable: true,
          minWidth: TABLE_COLUMN_MIN_WIDTH,
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
        onColumnResized={(event) => {
          // 仅持久化用户完成的拖拽；初始化和 API 回放不会反向生成 override。
          if (!event.finished || event.source !== 'uiColumnResized' || !event.column || !onOverridesChange) return;
          const colId = event.column.getColId();
          const width = event.column.getActualWidth();
          const nextOverrides = upsertColumnWidthOverride(overrides, colId, width);
          onOverridesChange(nextOverrides);
          cachedColWidthsRef.current = removeCachedColumnWidth(cacheKey, colId);
        }}
        onGridReady={(params) => {
          gridApiRef.current = params.api;
          // override 优先，旧 localStorage 缓存只为尚未迁移的字段兜底。
          applyPersistedColumnWidths(params.api);
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
          if (cellEvent.column.getColId() === ROW_DETAIL_COLUMN_ID) {
            return;
          }
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
      <RowDetailDrawer
        visible={rowDetailState.visible}
        rows={rowDetailState.rows}
        currentIndex={rowDetailState.currentIndex}
        onClose={() => {
          setRowDetailState({
            visible: false,
            rows: [],
            currentIndex: -1,
          });
        }}
        onChangeIndex={(currentIndex) => {
          setRowDetailState((state) => ({
            ...state,
            currentIndex,
          }));
        }}
      />
    </div>
  );
}

export default React.memo(React.forwardRef(index), (prevProps, nextProps) => {
  const omitKeys = ['series'];
  const otherPropsEqual = _.isEqual(_.omit(prevProps, omitKeys), _.omit(nextProps, omitKeys));
  const seriesPropEqual = _.isEqual(_.map(prevProps.series, 'id'), _.map(nextProps.series, 'id'));
  return otherPropsEqual && seriesPropEqual;
});
