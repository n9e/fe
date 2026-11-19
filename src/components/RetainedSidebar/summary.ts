import { RefObject, useEffect, useState } from 'react';

/** Read the displayed labels rather than serialized IDs, including enterprise datasource selects. */
export function readControlSummary(root: HTMLElement, viewLabel: string) {
  const summaries: string[] = [];
  root.querySelectorAll<HTMLElement>('.ant-select').forEach((select) => {
    if (select.closest('.ant-form-item-hidden')) return;
    const items = Array.from(select.querySelectorAll<HTMLElement>('.ant-select-selection-item'));
    const values = items.map((item) => item.getAttribute('title') || item.textContent?.trim()).filter(Boolean);
    if (!values.length && select.classList.contains('ant-select-auto-complete')) {
      const value = select.querySelector<HTMLInputElement>('input')?.value.trim();
      if (value) values.push(value);
    }
    if (!values.length) return;
    const label =
      select.closest('.outlined-select-wrapper, .outlined-autocomplete-wrapper')?.querySelector('label')?.textContent?.trim() ||
      select.closest('.ant-form-item')?.querySelector('.ant-form-item-label')?.textContent?.trim() ||
      (select.classList.contains('n9e-view-select') ? viewLabel : '');
    summaries.push(`${label ? `${label}: ` : ''}${values.join(', ')}`);
  });
  root.querySelectorAll<HTMLElement>('.n9e-metric-views-list-content-item.active .name').forEach((item) => {
    if (item.textContent?.trim()) summaries.push(item.textContent.trim());
  });
  return Array.from(new Set(summaries)).join(' / ');
}

export function useControlSummary(rootRef: RefObject<HTMLDivElement>, enabled: boolean, viewLabel: string) {
  const [summary, setSummary] = useState('');
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;
    const update = () => setSummary(readControlSummary(root, viewLabel));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class', 'title', 'value'] });
    root.addEventListener('input', update);
    root.addEventListener('change', update);
    return () => {
      observer.disconnect();
      root.removeEventListener('input', update);
      root.removeEventListener('change', update);
    };
  }, [rootRef, enabled, viewLabel]);
  return summary;
}
