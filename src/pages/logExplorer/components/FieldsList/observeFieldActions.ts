const pending = new Set<HTMLElement>();
let frame: number | undefined;

// Read all rows before changing any style: interleaving these phases forces a
// document-wide style recalculation for each field in a large sidebar.
function flush() {
  frame = undefined;
  const measurements = Array.from(pending, (actions) => {
    const row = actions.parentElement;
    if (!row || !actions.isConnected) return undefined;
    const bounds = actions.getBoundingClientRect();
    const activeButtons = Array.from(actions.querySelectorAll('button[aria-pressed="true"]'));
    const activeWidth = activeButtons.length ? bounds.right - Math.min(...activeButtons.map((button) => button.getBoundingClientRect().left)) + 8 : 0;
    return { row, width: `${bounds.width + 8}px`, activeWidth: `${activeWidth}px` };
  });
  pending.clear();
  for (const measurement of measurements) {
    if (!measurement) continue;
    const { row, width, activeWidth } = measurement;
    if (row.style.getPropertyValue('--log-field-actions-width') !== width) row.style.setProperty('--log-field-actions-width', width);
    if (row.style.getPropertyValue('--log-field-active-width') !== activeWidth) row.style.setProperty('--log-field-active-width', activeWidth);
  }
}

export default function observeFieldActions(actions: HTMLElement) {
  let disposed = false;
  const schedule = () => {
    if (disposed) return;
    pending.add(actions);
    if (frame === undefined) frame = requestAnimationFrame(flush);
  };
  schedule();
  const resize = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(schedule);
  resize?.observe(actions);
  const mutations = new MutationObserver(schedule);
  mutations.observe(actions, { attributes: true, attributeFilter: ['aria-pressed'], childList: true, subtree: true });
  return () => {
    disposed = true;
    resize?.disconnect();
    mutations.disconnect();
    pending.delete(actions);
    if (pending.size === 0 && frame !== undefined) {
      cancelAnimationFrame(frame);
      frame = undefined;
    }
  };
}
