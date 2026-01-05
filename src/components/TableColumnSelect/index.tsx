import React, { useState, useMemo } from 'react';
import { Button, Checkbox, Input, Dropdown } from 'antd';
import { SettingOutlined, HolderOutlined, SearchOutlined } from '@ant-design/icons';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import './index.less';

export interface ColumnOption {
  label: string;
  value: string;
  order?: number;
}

interface IProps {
  showDropdown?: boolean;
  /** 所有可选列 */
  options: ColumnOption[];
  /** 当前选中的列值 */
  value: string[];
  /** 选择改变回调，返回按顺序排列的选中项 */
  onChange: (selectedValues: string[], orderedOptions: ColumnOption[]) => void;
  /** 按钮文本 */
  buttonText?: string;
  /** 搜索框占位符 */
  searchPlaceholder?: string;
  /** 最大下拉高度 */
  maxHeight?: number;
  /** 是否支持拖拽排序 */
  sortable?: boolean;
  /** 是否显示全选 */
  showAll?: boolean;
}

// 可拖拽的选项项
function SortableItem({ option, onToggle, sortable }: { option: ColumnOption; onToggle: () => void; sortable: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: option.value,
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className='table-column-select-item sortable'>
      <Checkbox checked={true} onChange={onToggle}>
        {option.label}
      </Checkbox>
      {sortable && (
        <div className='drag-handle' {...attributes} {...listeners}>
          <HolderOutlined />
        </div>
      )}
    </div>
  );
}

// 普通选项项
function NormalItem({ option, onToggle, checked = false }: { option: ColumnOption; onToggle: () => void; checked?: boolean }) {
  return (
    <div className='table-column-select-item'>
      <Checkbox checked={checked} onChange={onToggle}>
        {option.label}
      </Checkbox>
    </div>
  );
}

export default function TableColumnSelect(props: IProps) {
  const { t } = useTranslation('tableColumnSelect');
  const {
    options,
    value,
    onChange,
    buttonText = t('displayColumns'),
    searchPlaceholder = t('searchColumns'),
    maxHeight,
    sortable = true,
    showDropdown = true,
    showAll = false,
  } = props;

  // 根据 showDropdown 和用户传入的 maxHeight 来决定最终的高度
  const finalMaxHeight = maxHeight !== undefined ? maxHeight : showDropdown ? 400 : undefined;

  const [searchValue, setSearchValue] = useState('');
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // 根据value和options生成有序的选中项和未选中项
  const { selectedOptions, unselectedOptions } = useMemo(() => {
    const selectedSet = new Set(value);
    const selected: ColumnOption[] = [];
    const unselected: ColumnOption[] = [];

    // 首先按照value的顺序添加已选中的项
    value.forEach((val) => {
      const option = options.find((opt) => opt.value === val);
      if (option) {
        selected.push({ ...option, order: selected.length });
      }
    });

    // 添加未选中的项
    options.forEach((option) => {
      if (!selectedSet.has(option.value)) {
        unselected.push(option);
      }
    });

    return { selectedOptions: selected, unselectedOptions: unselected };
  }, [options, value]);

  // 搜索过滤
  const filteredSelected = useMemo(() => {
    if (!searchValue) return selectedOptions;
    return selectedOptions.filter((opt) => opt.label.toLowerCase().includes(searchValue.toLowerCase()));
  }, [selectedOptions, searchValue]);

  const filteredUnselected = useMemo(() => {
    if (!searchValue) return unselectedOptions;
    return unselectedOptions.filter((opt) => opt.label.toLowerCase().includes(searchValue.toLowerCase()));
  }, [unselectedOptions, searchValue]);

  // 全选状态计算
  const selectAllState = useMemo(() => {
    const totalCount = options.length;
    const selectedCount = value.length;

    if (selectedCount === 0) {
      return { checked: false, indeterminate: false };
    } else if (selectedCount === totalCount) {
      return { checked: true, indeterminate: false };
    } else {
      return { checked: false, indeterminate: true };
    }
  }, [options.length, value.length]);

  // 传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // 切换选中状态
  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue];

    const newSelectedOptions = newValue.map((val, index) => {
      const option = options.find((opt) => opt.value === val);
      return { ...option!, order: index };
    });

    onChange(newValue, newSelectedOptions);
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectAllState.checked || selectAllState.indeterminate) {
      // 取消全选
      onChange([], []);
    } else {
      // 全选
      const allValues = options.map((opt) => opt.value);
      const allSelectedOptions = options.map((opt, index) => ({ ...opt, order: index }));
      onChange(allValues, allSelectedOptions);
    }
  };

  // 拖拽开始
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // 拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = selectedOptions.findIndex((opt) => opt.value === active.id);
    const newIndex = selectedOptions.findIndex((opt) => opt.value === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // 手动实现 arrayMove
    const newArray = [...selectedOptions];
    const [movedItem] = newArray.splice(oldIndex, 1);
    newArray.splice(newIndex, 0, movedItem);

    // 更新order
    const reorderedOptions = newArray.map((opt, index) => ({ ...opt, order: index }));
    const newValue = reorderedOptions.map((opt) => opt.value);

    onChange(newValue, reorderedOptions);
  };

  const dropdownContent = (
    <div className={classNames('table-column-select-dropdown', { 'show-dropdown-only': !showDropdown })}>
      {/* 搜索框 */}
      <div className='table-column-select-search'>
        <Input size='small' placeholder={searchPlaceholder} value={searchValue} onChange={(e) => setSearchValue(e.target.value)} prefix={<SearchOutlined />} />
      </div>

      {/* 选项列表 */}
      <div className='table-column-select-options best-looking-scroll' style={{ maxHeight: finalMaxHeight }}>
        {/* 全选选项 */}
        {showAll && (
          <div className='table-column-select-all-wrapper'>
            <div className='table-column-select-item select-all-item'>
              <Checkbox checked={selectAllState.checked} indeterminate={selectAllState.indeterminate} onChange={handleSelectAll}>
                {t('selectAll')}
              </Checkbox>
            </div>
          </div>
        )}

        {/* 已选中项 - 可拖拽排序 */}
        {filteredSelected.length > 0 && sortable && !searchValue && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredSelected.map((opt) => opt.value)} strategy={verticalListSortingStrategy}>
              <div className='table-column-select-group'>
                {filteredSelected.map((option) => (
                  <SortableItem key={option.value} option={option} onToggle={() => handleToggle(option.value)} sortable={sortable} />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <div className='table-column-select-item sortable dragging'>
                  <Checkbox checked={true}>{selectedOptions.find((opt) => opt.value === activeId)?.label}</Checkbox>
                  <div className='drag-handle'>
                    <HolderOutlined />
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* 已选中项 - 不支持拖拽 */}
        {filteredSelected.length > 0 && (!sortable || searchValue) && (
          <div className='table-column-select-group'>
            {filteredSelected.map((option) => (
              <NormalItem key={option.value} option={option} onToggle={() => handleToggle(option.value)} checked={true} />
            ))}
          </div>
        )}

        {/* 分隔线 */}
        {filteredSelected.length > 0 && filteredUnselected.length > 0 && <div className='table-column-select-divider' />}

        {/* 未选中项 */}
        {filteredUnselected.length > 0 && (
          <div className='table-column-select-group'>
            {filteredUnselected.map((option) => (
              <NormalItem key={option.value} option={option} onToggle={() => handleToggle(option.value)} />
            ))}
          </div>
        )}

        {/* 空状态 */}
        {filteredSelected.length === 0 && filteredUnselected.length === 0 && <div className='table-column-select-empty'>{t('noData')}</div>}
      </div>
    </div>
  );

  if (!showDropdown) {
    return dropdownContent;
  }

  return (
    <Dropdown visible={open} onVisibleChange={setOpen} trigger={['click']} overlay={dropdownContent} placement='bottomRight' overlayClassName='table-column-select-overlay'>
      <Button size='small' icon={<SettingOutlined />}>
        {buttonText}
      </Button>
    </Dropdown>
  );
}
