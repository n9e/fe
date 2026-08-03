import React from 'react';
import { Tooltip } from 'antd';

type ElementWithChildren = React.ReactElement<{
  children?: React.ReactNode;
  className?: string;
}>;

function hasClassName(node: React.ReactNode, className: string): node is ElementWithChildren {
  if (!React.isValidElement(node)) return false;
  const value = (node.props as ElementWithChildren['props']).className;
  return typeof value === 'string' && value.split(/\s+/).includes(className);
}

/**
 * antd v4 wraps the complete sortable header with its Tooltip. Move that same
 * Tooltip onto the sorter icon so custom tooltips inside the title do not open
 * at the same time. Keeping the original element also preserves locale text and
 * any table/column-level showSorterTooltip props.
 */
export function moveSorterTooltipToIcon(node: React.ReactNode): React.ReactNode {
  if (!React.isValidElement(node)) return node;

  const element = node as ElementWithChildren;
  const child = element.props.children;

  if (element.type === Tooltip && hasClassName(child, 'ant-table-column-sorters')) {
    let sorterIconFound = false;
    const nextChildren = React.Children.map(child.props.children, (containerChild) => {
      if (!hasClassName(containerChild, 'ant-table-column-sorter')) return containerChild;
      sorterIconFound = true;
      return React.cloneElement(element, undefined, containerChild);
    });

    if (sorterIconFound) {
      return React.cloneElement(child, undefined, nextChildren);
    }
  }

  if (child === undefined) return node;
  let childChanged = false;
  const nextChildren = React.Children.map(child, (currentChild) => {
    const nextChild = moveSorterTooltipToIcon(currentChild);
    childChanged ||= nextChild !== currentChild;
    return nextChild;
  });

  return childChanged ? React.cloneElement(element, undefined, nextChildren) : node;
}
