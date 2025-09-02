import React, { useRef } from 'react';
import DataGrid, { Column, DataGridHandle } from 'react-data-grid';
import { useTranslation } from 'react-i18next';
import './style.css';
import classNames from 'classnames';

interface IProps {
  dataSource: any[];
  columns: Column<any>[];
  height?: number | string;
  headerRowHeight?: number;
  customClassName?: string;
}

/**
 * 此列表的columns和dataSource与antd的表格组件有差异, 需重新组织columns和dataSource
 * https://www.npmjs.com/package/react-data-grid/v/7.0.0-beta.16 注意版本(此版本支持react 17)
 * @param props
 * @returns
 */
export default function VirtualTable(props: IProps) {
  const { t } = useTranslation();
  const { height, columns, dataSource, headerRowHeight = 46, customClassName } = props;
  const gridRef = useRef<DataGridHandle>(null);

  return (
    <DataGrid
      ref={gridRef}
      style={{ height: height, maxHeight: height }}
      columns={columns}
      rows={dataSource}
      className={classNames('fill-grid', customClassName)}
      headerRowHeight={headerRowHeight}
    />
  );
}
