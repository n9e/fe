import { QueryResult, TableData } from '../types';

export function isTableData(result: QueryResult): result is TableData {
  return (result as TableData).rows !== undefined;
}

export function isTableDataArray(data: QueryResult[]): data is TableData[] {
  return data.every((table) => 'columns' in table && 'rows' in table);
}
