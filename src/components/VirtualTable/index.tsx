import React, { useRef } from 'react';
import DataGrid, { Column, DataGridHandle } from 'react-data-grid';
import { useTranslation } from 'react-i18next';
import './style.css';
import classNames from 'classnames';

interface IProps {
  dataSource: any[];
  columns: Column<any>[];
  headerRowHeight?: number;
  customClassName?: string;
  customStyle?: React.CSSProperties;
}

/**
 * 此列表的columns和dataSource与antd的表格组件有差异, 需重新组织columns和dataSource
 * https://www.npmjs.com/package/react-data-grid/v/7.0.0-beta.16 注意版本(此版本支持react 17)
 * @param props
 * @returns
 */
export default function VirtualTable(props: IProps) {
  const { t } = useTranslation();
  const { columns, dataSource, headerRowHeight = 46, customClassName, customStyle } = props;
  const gridRef = useRef<DataGridHandle>(null);

  return (
    <DataGrid
      ref={gridRef}
      style={{ maxHeight: '100%', ...customStyle }}
      columns={columns}
      rows={dataSource}
      className={classNames('fill-grid', customClassName)}
      headerRowHeight={headerRowHeight}
    />
  );
}
