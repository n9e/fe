import { DatasourceCateEnum } from '@/utils/constant';

export const NAME_SPACE = DatasourceCateEnum.victorialogs;
export const STYLE_NAME_SPACE = `n9e-${NAME_SPACE}`;
export const DEFAULT_DISPLAY_FIELD = '_msg';
export const UNGROUPED_VALUE = '__ungrouped__';
export const GROUP_DEFAULT_SETTINGS = {
  group_by_field: '_stream',
  display_fields: [DEFAULT_DISPLAY_FIELD],
  display_default_field_changed: false, // 默认字段是否被修改过，如果没有修改则 row-fileds 不选中默认字段，否则需要选中默认字段
  date_format: 'YYYY-MM-DD HH:mm:ss.SSS',
};
export const TABLE_DEFAULT_SETTINGS = {
  customize_columns: undefined, // all
};
