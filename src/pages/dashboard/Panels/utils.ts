/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import _ from 'lodash';
import { IPanel, IDashboardConfig } from '../types';
import { IVariable } from '../Variables/types';

/** 布局变更会持久化到仪表盘，因此必须同时具备权限且处于可编辑状态。 */
export function canEditPanelLayout(editable: boolean, isAuthorized: boolean) {
  return editable && isAuthorized;
}

export function buildLayout(panels: IPanel[], disableResize = false) {
  return _.map(panels, (item: IPanel) => {
    const repeatedByRow = item.repeatedByRow || (item.type === 'row' && !!item.repeatPanelId);
    return {
      ...item.layout,
      i: _.toString(item.layout.i),
      isResizable: !disableResize && item.type !== 'row' && !repeatedByRow,
      ...(repeatedByRow ? { isDraggable: false } : {}),
    };
  });
}

export function sortPanelsByGridLayout(panels: IPanel[]) {
  return panels.sort((panelA, panelB) => {
    if (panelA.layout.y === panelB.layout.y) {
      return panelA.layout.x - panelB.layout.x;
    } else {
      return panelA.layout.y - panelB.layout.y;
    }
  });
}

export function updatePanelsLayout(panels: IPanel[], newLayout: Array<{ i: string; h: number; w: number; x: number; y: number }>) {
  return _.map(panels, (panel: IPanel) => {
    const newPanel = { ...panel };
    const findedLayout = _.find(newLayout, { i: newPanel.layout.i });
    if (findedLayout) {
      // newLayout 可能是 ReactGridLayout.onLayoutChange 中的参数，掺杂了其他属性
      newPanel.layout = _.pick(findedLayout, ['h', 'w', 'x', 'y', 'i', 'isResizable']) as IPanel['layout'];
    }
    return newPanel;
  });
}

export function getRowIndex(panels: IPanel[], id: string) {
  return _.findIndex(panels, { id });
}

export function getRowPanels(panels: IPanel[], rowId: string): IPanel[] {
  const rowIndex = getRowIndex(panels, rowId);
  const rowPanels: IPanel[] = [];
  // Row 仅支持顶层分段；下一个 row 是当前分组的边界，而不是嵌套子项。
  for (let index = rowIndex + 1; index < panels.length; index++) {
    const panel = panels[index];
    if (panel.type === 'row') {
      break;
    }
    rowPanels.push(panel);
  }
  return rowPanels;
}

export function getNextRow(panels: IPanel[], rowId: string): IPanel | undefined {
  const rowIndex = getRowIndex(panels, rowId);
  let row: IPanel | undefined = undefined;
  for (let index = rowIndex + 1; index < panels.length; index++) {
    const panel = panels[index];
    if (panel.type === 'row') {
      row = panel;
      break;
    }
  }
  return row;
}

export function getRowPanelsMaxY(panels: IPanel[], rowId: string) {
  const rowPanels = getRowPanels(panels, rowId);
  const rowPanel = _.find(panels, { id: rowId })!;
  let maxY = rowPanel.layout.y + rowPanel.layout.h;
  _.forEach(rowPanels, (panel) => {
    if (panel.layout.y + panel.layout.h > maxY) {
      maxY = panel.layout.y + panel.layout.h;
    }
  });
  return maxY;
}
export function getRowCollapsedPanels(panels: IPanel[], row: IPanel) {
  let newPanels = _.cloneDeep(panels);
  const curRowPanels = getRowPanels(newPanels, row.id);
  if (curRowPanels.length > 0) {
    newPanels = _.filter(newPanels, (panel) => {
      return !_.find(curRowPanels, { id: panel.id });
    });
    const curRow = _.find(newPanels, { id: row.id })!;
    curRow.panels = curRowPanels;
  }
  return newPanels;
}
export function getRowUnCollapsedPanels(panels: IPanel[], row: IPanel) {
  let newPanels = _.cloneDeep(panels);
  const rowIndex = getRowIndex(newPanels, row.id);
  const cacheRowPanels = newPanels[rowIndex].panels;
  if (cacheRowPanels && cacheRowPanels.length > 0) {
    const firstPanelYPos = cacheRowPanels[0].layout.y ?? row.layout.y;
    const yDiff = firstPanelYPos - (row.layout.y + row.layout.h);
    let insertPos = rowIndex + 1;
    let yMax = row.layout.y;
    for (const panel of cacheRowPanels) {
      panel.layout.y ?? (panel.layout.y = row.layout.y);
      panel.layout.y -= yDiff;
      newPanels.splice(insertPos, 0, panel);
      insertPos += 1;
      yMax = Math.max(yMax, panel.layout.y + panel.layout.h);
    }
    const pushDownAmount = yMax - row.layout.y - row.layout.h;
    for (let panelIndex = insertPos; panelIndex < newPanels.length; panelIndex++) {
      newPanels[panelIndex].layout.y += pushDownAmount;
    }
    newPanels = _.unionBy(newPanels, 'id');
    const curRow = _.find(newPanels, { id: row.id })!;
    curRow.panels = [];
  }
  return newPanels;
}
/**
 * 处理 Row 组件切换时需要更新的 panels，返回更新后的 panels
 * 收起 row 时，需要把 row 下面的 rowPanels 删除掉，并且缓存被删除的 panels
 * 展开 row 时，需要把 row 下面的缓存的 rowPanels 添加到 panels 中
 */
export function handleRowToggle(collapsed: boolean, panels: IPanel[], row: IPanel): IPanel[] {
  let newPanels = _.cloneDeep(panels);
  if (collapsed) {
    newPanels = getRowCollapsedPanels(newPanels, row);
  } else {
    newPanels = getRowUnCollapsedPanels(newPanels, row);
  }
  const curRow = _.find(newPanels, { id: row.id })!;
  curRow.collapsed = collapsed;
  return newPanels;
}

export function updatePanelsWithNewPanel(panels: IPanel[], newPanel: IPanel) {
  return _.map(panels, (panel: IPanel) => {
    if (panel.id === newPanel.id) {
      return newPanel;
    }
    return panel;
  });
}

export function updatePanelsInsertNewPanel(panels: IPanel[], newPanel: IPanel) {
  return _.concat(panels, newPanel);
}

export function isValidPanelConfig(value: string) {
  if (!value) {
    return false;
  }
  try {
    const parsed = JSON.parse(value) as IPanel;
    return !!parsed && typeof parsed === 'object' && !Array.isArray(parsed) && !!parsed.type;
  } catch {
    return false;
  }
}

// 新增面板的宽高初始值
const PANEL_W = 12;
const PANEL_H = 4;

// 新增 panel 到全局
export function updatePanelsInsertNewPanelToGlobal(panels: IPanel[], panel: IPanel, type: 'row' | 'chart', useDefaultSize = true) {
  const w = type === 'row' ? 24 : useDefaultSize ? PANEL_W : panel.layout.w ?? PANEL_W;
  const h = type === 'row' ? 1 : useDefaultSize ? PANEL_H : panel.layout.h ?? PANEL_H;
  const maxItem = _.maxBy(panels, (item: IPanel) => {
    return item.layout.y + item.layout.h;
  });
  const newPanel = {
    ...panel,
    layout: {
      x: 0,
      y: maxItem ? maxItem.layout.y + maxItem.layout.h : 0,
      w,
      h,
      i: panel.id,
    },
  };
  return _.concat([...panels], newPanel);
}

// 新增 panel 到分组
export function updatePanelsInsertNewPanelToRow(panels: IPanel[], rowId: string, panel: IPanel, useDefaultSize = true) {
  const nextRow = getNextRow(panels, rowId);
  let nextRowIdx: number | undefined;
  if (nextRow?.id) {
    nextRowIdx = getRowIndex(panels, nextRow?.id);
  }
  const maxY = getRowPanelsMaxY(panels, rowId);
  const w = useDefaultSize ? PANEL_W : panel.layout.w ?? PANEL_W;
  const h = useDefaultSize ? PANEL_H : panel.layout.h ?? PANEL_H;
  const newPanel = {
    ...panel,
    layout: {
      x: 0,
      y: maxY,
      w,
      h,
      i: panel.id,
    },
  };
  const newPanels = _.map(panels, (item, idx) => {
    if (nextRowIdx !== undefined && idx >= nextRowIdx) {
      return {
        ...item,
        layout: {
          ...item.layout,
          y: item.layout.y + h,
        },
      };
    }
    return item;
  });
  return _.concat(newPanel, newPanels);
}

/**
 * Builds the persisted dashboard config for a panel change.
 *
 * Repeat instances and scoped variables belong to the current runtime only, so
 * they are removed from a cloned panel list before the caller stores the config.
 * The input config is never mutated because it may still be rendered by React.
 */
export function mergePanelsToConfig(configs: IDashboardConfig, panels: IPanel[]): IDashboardConfig {
  const persistedPanels = _.cloneDeep(panels);
  cleanUpRepeats(persistedPanels);
  return {
    ...configs,
    panels: persistedPanels,
  };
}

/** 将 overrides 写回 repeat 链的根源面板及其所有运行时副本（含折叠 row 的 panels 缓存）。 */
export function updateRepeatGroupOverrides(panels: IPanel[], panelId: string, overrides: IPanel['overrides']): IPanel[] {
  const panelMap = new Map<string, IPanel>();
  for (const panel of panels) {
    panelMap.set(panel.id, panel);
    for (const child of panel.panels ?? []) panelMap.set(child.id, child);
  }
  const getRootId = (id: string) => {
    let rootId = id;
    const visited = new Set<string>();
    let current = panelMap.get(rootId);
    while (current?.repeatPanelId && !visited.has(rootId)) {
      visited.add(rootId);
      rootId = current.repeatPanelId;
      current = panelMap.get(rootId);
    }
    return rootId;
  };
  const sourceRootId = getRootId(panelId);
  const update = (panel: IPanel): IPanel => {
    const next = panel.type !== 'row' && getRootId(panel.id) === sourceRootId ? { ...panel, overrides } : panel;
    return next.panels?.length ? { ...next, panels: next.panels.map(update) } : next;
  };
  return panels.map(update);
}

export function cleanUpRepeats(panels: IPanel[]) {
  sortPanelsByGridLayout(panels);
  const isRepeat = (panel: IPanel) => !!((!panel.repeat || panel.repeatedByRow) && panel.repeatPanelId);
  const adoptedPanels = new Map<string, { panel: IPanel; sourceId: string; rowY: number; offsetY: number }>();
  for (const row of panels) {
    if (row.type !== 'row' || !row.repeatPanelId) continue;
    const sourceId = row.repeatPanelId;
    const collectOriginals = (children: IPanel[], originY: number) => {
      for (const panel of children) {
        if (!isRepeat(panel)) adoptedPanels.set(panel.id, { panel, sourceId, rowY: row.layout.y, offsetY: panel.layout.y - originY });
      }
    };
    if (!row.collapsed) collectOriginals(getRowPanels(panels, row.id), row.layout.y);
    if (row.panels?.length) {
      const firstChildY = Math.min(...row.panels.map((panel) => panel.layout.y));
      collectOriginals(row.panels, firstChildY - row.layout.h);
    }
  }
  // 删除副本占据的纵向区间，避免每次重新计算时累加下推量。
  // 按当前可见高度计算，因此副本独立折叠、RGL 压缩之后也能还原。
  const repeatRanges: Array<{ start: number; end: number; sourceY: number }> = [];
  for (const panel of panels) {
    if (panel.type === 'row' && panel.repeatPanelId) {
      const source = panels.find((item) => item.id === panel.repeatPanelId);
      repeatRanges.push({
        start: panel.layout.y,
        end: panel.layout.y + getRowRepeatHeight(panel, getRowPanels(panels, panel.id)),
        sourceY: source?.layout.y ?? panel.layout.y,
      });
    } else if (panel.type !== 'row' && panel.repeat && !isRepeat(panel) && !adoptedPanels.has(panel.id)) {
      const copies = panels.filter((item) => item.repeatPanelId === panel.id && !item.repeatedByRow);
      const start = panel.layout.y + panel.layout.h;
      const end = Math.max(start, ...copies.map((copy) => copy.layout.y + copy.layout.h));
      if (end > start) repeatRanges.push({ start, end, sourceY: panel.layout.y });
    }
  }
  repeatRanges.sort((a, b) => a.start - b.start);
  const restoreY = (y: number): number => {
    const containingRange = repeatRanges.find((range) => y >= range.start && y < range.end && range.sourceY < range.start);
    if (containingRange) {
      // 普通面板拖入副本区域后，映射回源分组的相对位置。
      return restoreY(containingRange.sourceY + y - containingRange.start);
    }
    return y - repeatRanges.reduce((offset, range) => offset + (y >= range.end ? range.end - range.start : 0), 0);
  };
  _.pull(panels, ...panels.filter((panel) => isRepeat(panel) || adoptedPanels.has(panel.id)));
  for (const panel of panels) {
    panel.layout.y = restoreY(panel.layout.y);
    if (panel.repeatSourceLayout) {
      Object.assign(panel.layout, panel.repeatSourceLayout);
      delete panel.repeatSourceLayout;
    }
    delete panel.scopedVars;
    delete panel.repeatedByRow;
    if (panel.panels) cleanUpRepeats(panel.panels);
  }
  sortPanelsByGridLayout(panels);
  // 副本里可能混入用户拖入的原始面板。清理副本前先收集它们，再纳入源 row，
  // 包括已折叠在副本 panels 缓存里的原始面板，防止下一次重算或保存时丢失。
  const originalsBySource = new Map<string, Array<{ panel: IPanel; offsetY: number }>>();
  for (const { panel, sourceId, rowY, offsetY } of adoptedPanels.values()) {
    cleanUpRepeats([panel]);
    const source = panels.find((item) => item.id === sourceId && item.type === 'row');
    if (source) {
      const originals = originalsBySource.get(sourceId) ?? [];
      originals.push({ panel, offsetY });
      originalsBySource.set(sourceId, originals);
    } else {
      // 源 row 已删除时仍保留原始面板，不能随运行时副本一起丢弃。
      panel.layout.y = restoreY(rowY) + Math.max(1, offsetY);
      panels.push(panel);
    }
  }
  for (const source of panels.filter((item) => item.type === 'row' && originalsBySource.has(item.id))) {
    const sourceId = source.id;
    const originals = originalsBySource.get(sourceId)!.map(({ panel, offsetY }) => {
      panel.layout.y = source.layout.y + Math.max(source.layout.h, offsetY);
      return panel;
    });
    if (source.collapsed) {
      const cached = source.panels ?? [];
      const cacheOffset = cached.length ? Math.min(...cached.map((panel) => panel.layout.y)) - source.layout.y - source.layout.h : 0;
      for (const panel of cached) panel.layout.y -= cacheOffset;
      source.panels = sortPanelsByGridLayout(_.unionBy([...cached, ...originals], 'id'));
    } else {
      const children = getRowPanels(panels, sourceId);
      const insertIndex = getRowIndex(panels, sourceId) + 1 + children.length;
      const nextRow = getNextRow(panels, sourceId);
      const bottom = Math.max(...[...children, ...originals].map((panel) => panel.layout.y + panel.layout.h));
      const pushDown = nextRow ? Math.max(0, bottom - nextRow.layout.y) : 0;
      for (const panel of panels.slice(insertIndex)) panel.layout.y += pushDown;
      panels.splice(insertIndex, 0, ...originals);
    }
  }
  sortPanelsByGridLayout(panels);
}

export function getPanelRepeatClone(sourcePanel: IPanel, valueIndex: number, sourcePanelIndex: number, panels: IPanel[]) {
  // 源面板直接返回
  if (valueIndex === 0) {
    return sourcePanel;
  }

  const clone = _.cloneDeep(sourcePanel);
  clone.id = `${sourcePanel.id}__repeat_${valueIndex}`;

  // 在源面板后面插入
  panels.splice(sourcePanelIndex + valueIndex, 0, clone);

  clone.repeatPanelId = sourcePanel.id;
  clone.repeat = undefined;

  return clone;
}

export function getSelectedRepeatOptions(variable: IVariable): Array<string | number> {
  let selectedOptions = variable.value;

  if (typeof selectedOptions === 'number') {
    return [];
  }
  if (!selectedOptions) {
    selectedOptions = [];
  }
  if (typeof selectedOptions === 'string') {
    selectedOptions = [selectedOptions];
  }
  if (_.isEqual(selectedOptions, ['all'])) {
    selectedOptions = _.map(variable.options, 'value') || [];
  }
  return selectedOptions;
}

export function repeatPanel(panel: IPanel, panelIndex: number, panels: IPanel[], variables: IVariable[]) {
  const variable = variables.find((item) => item.name === panel.repeat);
  if (!variable) return;
  const row = panels
    .slice(0, panelIndex)
    .reverse()
    .find((item) => item.type === 'row');
  const rowValue = row?.scopedVars?.[variable.name]?.value;
  // row 已分配的变量取值优先；其他变量仍允许在每个 row 实例内独立重复。
  const selectedOptions = rowValue === undefined ? getSelectedRepeatOptions(variable) : Array.isArray(rowValue) ? rowValue : [rowValue];
  if (selectedOptions.length === 0) return;
  panel.repeatSourceLayout ??= _.pick(panel.layout, ['x', 'w']);

  const maxPerRow = panel.maxPerRow || 4;
  let xPos = 0;
  let yPos = panel.layout.y;

  for (let index = 0; index < selectedOptions.length; index++) {
    const option = selectedOptions[index];
    let copy;

    copy = getPanelRepeatClone(panel, index, panelIndex, panels);
    copy.scopedVars ??= {};
    copy.scopedVars[variable.name] = { value: option };

    // repeat 的面板默认占据整行
    copy.layout.w = Math.max(24 / selectedOptions.length, 24 / maxPerRow);
    copy.layout.x = xPos;
    copy.layout.y = yPos;
    copy.layout.i = copy.id;

    xPos += copy.layout.w;

    // 水平溢出的话就换行；小数宽度累加有浮点误差，需留容差
    if (xPos + copy.layout.w > 24 + 1e-9) {
      xPos = 0;
      yPos += copy.layout.h;
    }
  }

  // 更新后面 panel 的布局
  const yOffset = Math.floor((selectedOptions.length - 1) / maxPerRow) * panel.layout.h;
  if (yOffset > 0) {
    const panelBelowIndex = panelIndex + selectedOptions.length;
    for (const curPanel of panels.slice(panelBelowIndex)) {
      curPanel.layout.y += yOffset;
    }
  }
}

export function getRowRepeatHeight(row: IPanel, rowChildren: IPanel[]) {
  if (row.collapsed) return Math.max(1, row.layout.h);
  return Math.max(1, row.layout.h, ...rowChildren.map((panel) => panel.layout.y + panel.layout.h - row.layout.y));
}

export function repeatRow(row: IPanel, rowIndex: number, panels: IPanel[], variables: IVariable[]) {
  const variable = variables.find((item) => item.name === row.repeat);
  if (!variable) return;
  const selectedOptions = getSelectedRepeatOptions(variable);
  if (selectedOptions.length === 0) return;
  const children = row.collapsed ? row.panels ?? [] : getRowPanels(panels, row.id);
  const height = getRowRepeatHeight(row, children);
  const insertIndex = rowIndex + 1 + (row.collapsed ? 0 : children.length);
  const yOffset = (selectedOptions.length - 1) * height;
  for (const panel of panels.slice(insertIndex)) panel.layout.y += yOffset;

  const instances: IPanel[] = [];
  for (let index = 0; index < selectedOptions.length; index++) {
    const scopedVars = { ...row.scopedVars, [variable.name]: { value: selectedOptions[index] } };
    const rowCopy = index === 0 ? row : _.cloneDeep(row);
    rowCopy.scopedVars = scopedVars;
    if (index > 0) {
      rowCopy.id = `${row.id}__row_repeat_${index}`;
      rowCopy.layout.i = rowCopy.id;
      rowCopy.layout.y += index * height;
      rowCopy.repeatPanelId = row.id;
      rowCopy.repeat = undefined;
      instances.push(rowCopy);
    }
    const childCopies = children.map((child) => {
      const copy = index === 0 ? child : _.cloneDeep(child);
      copy.scopedVars = { ...copy.scopedVars, ...scopedVars };
      if (index > 0) {
        copy.id = `${child.id}__row_repeat_${index}`;
        copy.layout.i = copy.id;
        copy.layout.y += index * height;
        copy.repeatPanelId = child.id;
        copy.repeatedByRow = true;
      }
      return copy;
    });
    if (row.collapsed) rowCopy.panels = childCopies;
    else if (index > 0) instances.push(...childCopies);
  }
  panels.splice(insertIndex, 0, ...instances);
}

export function repeatRowChildren(panels: IPanel[], rowId: string, variables: IVariable[]) {
  const result = _.cloneDeep(panels);
  const children = getRowPanels(result, rowId);
  for (const child of children) {
    if (child.repeat && !children.some((panel) => panel.repeatPanelId === child.id)) {
      repeatPanel(child, getRowIndex(result, child.id), result, variables);
    }
  }
  return sortPanelsByGridLayout(result);
}

/** 普通编辑保留各 row 实例的展开状态；变量取值变化时由调用方显式重置。 */
export function processRepeats(panels: IPanel[], variables: IVariable[], { preserveRowState = true }: { preserveRowState?: boolean } = {}) {
  const rowStates = preserveRowState ? new Map(panels.filter((panel) => panel.type === 'row').map((row) => [row.id, !!row.collapsed])) : undefined;
  const panelsClone = _.cloneDeep(panels);
  cleanUpRepeats(panelsClone);

  for (let i = 0; i < panelsClone.length; i++) {
    const panel = panelsClone[i];
    if (panel.repeat) {
      if (panel.type === 'row') repeatRow(panel, i, panelsClone, variables);
      else repeatPanel(panel, i, panelsClone, variables);
    }
  }

  let newPanels = sortPanelsByGridLayout(panelsClone);
  for (const [rowId, collapsed] of rowStates ?? []) {
    const row = newPanels.find((panel) => panel.id === rowId);
    if (!row || !!row.collapsed === collapsed) continue;
    const height = getRowRepeatHeight(row, getRowPanels(newPanels, rowId));
    newPanels = handleRowToggle(collapsed, newPanels, row);
    if (collapsed) {
      const nextIndex = getRowIndex(newPanels, rowId) + 1;
      for (const panel of newPanels.slice(nextIndex)) panel.layout.y -= height - row.layout.h;
    } else {
      newPanels = repeatRowChildren(newPanels, rowId, variables);
    }
  }
  return newPanels;
}

export function ajustPanels(panels: IPanel[]) {
  return _.map(panels, (panel) => {
    if (panel.type === 'table') {
      return {
        ...panel,
        custom: {
          ...panel.custom,
          tableLayout: panel.custom.tableLayout !== undefined ? panel.custom.tableLayout : 'fixed',
          nowrap: panel.custom.nowrap !== undefined ? panel.custom.nowrap : false,
        },
      };
    }
    return panel;
  });
}
