import _ from 'lodash';
import moment from 'moment';

import { uplotsMap } from '../index';

let hoveringUplotID = '';

function renderTooltipItem(seriesItem, value, options) {
  // value = seriesItem.value(u, value, seriesIndex + 1, idx);
  const { stroke, label } = seriesItem;
  const color = stroke();
  const point = {
    color,
    label,
    n9e_internal: seriesItem.n9e_internal,
  };
  const liNode = document.createElement('li');
  liNode.className = 'n9e-uplot-tooltip-item';

  if (color) {
    const symbolNode = document.createElement('span');
    symbolNode.className = 'n9e-uplot-tooltip-item-symbol';
    symbolNode.style.background = color;
    liNode.appendChild(symbolNode);
  }

  let formatName = label;
  if (typeof options.pointNameformatter === 'function') {
    formatName = options.pointNameformatter(label, point);
  }
  if (formatName) {
    const nameNode = document.createElement('span');
    nameNode.className = 'n9e-uplot-tooltip-item-name';
    const nameTextNode = document.createTextNode(formatName);

    nameNode.appendChild(nameTextNode);
    liNode.appendChild(nameNode);
  }

  if (value !== undefined && value !== null) {
    const valueNode = document.createElement('span');
    valueNode.className = 'n9e-uplot-tooltip-item-value';

    let formatedValue = _.toString(value);

    if (typeof options.pointValueformatter === 'function') {
      formatedValue = options.pointValueformatter(value, point);
    }

    // formatValue += filledNull ? '(空值填补,仅限看图使用)' : '';

    const valueTextNode = document.createTextNode(formatedValue);
    valueNode.appendChild(valueTextNode);
    liNode.appendChild(valueNode);
  }

  return liNode;
}

export default function tooltipPlugin(options: {
  id: string;
  mode: 'single' | 'all' | 'none';
  sort: 'asc' | 'desc' | 'none';
  pinningEnabled?: boolean;
  zIndex?: number;
  graphTooltip?: 'default' | 'sharedCrosshair' | 'sharedTooltip';
  renderFooter?: (domNode: HTMLDivElement, closeOverlay: () => void) => void;
  pointNameformatter?: (label: string, point: any) => string;
  pointValueformatter?: (value: number, point: any) => string;
}) {
  const { id, pinningEnabled, zIndex = 999, graphTooltip, renderFooter } = options;
  let uplot;
  let over;
  let isPinned = false;

  function closeOverlay() {
    if (overlay === null) return;
    isPinned = false;
    overlay.style.display = 'none';
    overlay.style.pointerEvents = 'none';
    overlay.className = 'n9e-uplot-tooltip-container';
    uplot.cursor._lock = false;
    // uplot.setCursor({ left: -10, top: -10 });
  }

  const tooltipID = `${id}-tooltip`;
  let overlay = document.getElementById(tooltipID);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = tooltipID;
    overlay.className = 'n9e-uplot-tooltip-container';
    overlay.style.zIndex = _.toString(zIndex);
    overlay.style.display = 'none';
    overlay.style.position = 'absolute';
    document.body.appendChild(overlay);

    const handleOutsideClick = (event: MouseEvent) => {
      if (isPinned) {
        if (overlay === null) return;
        if (!overlay.contains(event.target as Node)) {
          closeOverlay();
        }
      }
    };

    if (pinningEnabled) {
      document.addEventListener('mouseup', handleOutsideClick);
    }
  }

  return {
    hooks: {
      init: (u: uPlot) => {
        if (overlay === null) return;
        uplot = u;
        over = u.over;
        overlay.style.display = 'none';
        overlay.innerHTML = `
          <div class="n9e-uplot-tooltip">
            <div class="n9e-uplot-tooltip-header"></div>
            <div class="n9e-uplot-tooltip-main"></div>
            <div class="n9e-uplot-tooltip-footer"></div>
          </div>
        `;
        over.onmouseenter = () => {
          if (overlay === null) return;
          hoveringUplotID = id;
          overlay.style.display = 'block';
          if (graphTooltip === 'sharedTooltip') {
            // 同步其他图表的 tooltip 显示
            const { event } = u.cursor;
            if (event) {
              uplotsMap.forEach((uplot, id) => {
                if (uplot !== u) {
                  const curTooltipID = `${id}-tooltip`;
                  const curOverlay = document.getElementById(curTooltipID);
                  if (curOverlay) {
                    curOverlay.style.display = 'block';
                  }
                }
              });
            }
          }
        };
        over.onmouseleave = () => {
          if (overlay === null) return;
          if (isPinned) return;
          hoveringUplotID = '';
          overlay.style.display = 'none';
          // 同步其他图表的 tooltip 隐藏
          const { event } = u.cursor;
          if (event) {
            uplotsMap.forEach((uplot, id) => {
              if (uplot !== u) {
                const curTooltipID = `${id}-tooltip`;
                const curOverlay = document.getElementById(curTooltipID);
                if (curOverlay) {
                  curOverlay.style.display = 'none';
                }
              }
            });
          }
        };
        if (pinningEnabled) {
          let mouseDownX = 0;
          over.onmousedown = (e) => {
            mouseDownX = e.clientX;
          };
          over.onmouseup = (e) => {
            if (mouseDownX !== e.clientX) return;
            e.stopPropagation();
            if (overlay) {
              isPinned = !isPinned;
              if (isPinned) {
                // @ts-ignore
                u.cursor._lock = true;
                overlay.style.pointerEvents = 'unset';
                overlay.className = 'n9e-uplot-tooltip-container n9e-uplot-tooltip-container-pinned';
              } else {
                // @ts-ignore
                u.cursor._lock = false;
                overlay.style.pointerEvents = 'none';
                overlay.className = 'n9e-uplot-tooltip-container';
              }
            }
            mouseDownX = 0;
          };
          if (renderFooter) {
            const footerNode = overlay.querySelector('.n9e-uplot-tooltip-footer') as HTMLDivElement;
            if (footerNode) {
              renderFooter(footerNode, closeOverlay);
            }
          }
        }
      },
      setCursor: (u) => {
        if (overlay === null) return;
        if (isPinned) return;
        const { data, series } = u;
        const timeData = data[0];
        const originData = _.map(data, (item, idx: number) => {
          return {
            values: item,
            seriesIndex: idx,
            seriesItem: series[idx],
          };
        });
        let valuesData: {
          values: number[];
          seriesIndex: number;
          seriesItem: any;
        }[] = _.slice(originData, 1);
        valuesData = _.filter(valuesData, (item) => {
          return item.seriesItem.show !== false;
        });

        const { event, left, top, idx } = u.cursor;

        if (graphTooltip === 'sharedTooltip' || graphTooltip === 'sharedCrosshair') {
          if (event && hoveringUplotID === id) {
            uplotsMap.forEach((uplot) => {
              if (uplot !== u) {
                if (left === -10 && top === -10) {
                  uplot.setCursor({ left: -10, top: -10 });
                } else {
                  // 根据时间值对齐
                  const x = uplot.valToPos(timeData[idx], 'x');
                  // 根据 top 和 height 比例对齐
                  const y = (top / u.height) * uplot.height;
                  uplot.setCursor({ left: x, top: y });
                }
              }
            });
          }
        }
        if (options.mode === 'none' || idx === null || (left === -10 && top === -10)) return;
        const bbox = over.getBoundingClientRect();
        const bLeft = bbox.left;
        const bTop = bbox.top;
        const anchor = { left: left + bLeft, top: top + bTop };
        (window as any).placement(overlay, anchor, 'right', 'start', { bound: document.body });

        // tooltip 排序
        if (options.sort !== 'none') {
          valuesData = _.orderBy(
            valuesData,
            (item) => {
              return item.values[idx];
            },
            options.sort,
          );
        }

        // 获取鼠标位置
        const mouseX = u.cursor.left;
        const mouseY = u.cursor.top;

        // 初始化最小距离和最近点的索引
        let minDist = Infinity;
        let closestSeriesIdx = -1;

        // 遍历所有数据点，找到距离最近的点
        _.forEach(valuesData, (item) => {
          const { seriesItem } = item;
          const x = u.valToPos(timeData[idx], 'x');
          const y = u.valToPos(item.values[idx], seriesItem.scale);
          const dist = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));
          if (dist < minDist) {
            minDist = dist;
            closestSeriesIdx = item.seriesIndex;
          }
        });

        // 绘制 DOM 元素
        // overlay!.innerHTML = '';
        // const wrapEle = document.createElement('div');
        const renderToHeight = window.innerHeight / 1.5;

        // 最大可显示的行数，超出最大行数就在中位隐藏超出数量的行
        // 18: padding + border
        // 100: 缓冲区域
        // 15: 每行高度
        // + 1: 标题栏高度
        const maxLength = (renderToHeight - 18 - 100) / 15;
        let overflow = false;

        if (options.mode === 'all' && valuesData.length > maxLength) {
          valuesData = _.slice(valuesData, 0, maxLength);
          overflow = true;
        }

        const headerNode = overlay!.querySelector('.n9e-uplot-tooltip-header');
        if (headerNode) {
          headerNode.innerHTML = '';
          const headerText = timeData[idx] ? moment.unix(timeData[idx]).format('YYYY-MM-DD HH:mm:ss') : 'Invalid Time';
          const headerTextNode = document.createTextNode(headerText);
          headerNode.appendChild(headerTextNode);
          if (pinningEnabled) {
            const closeNode = document.createElement('div');
            closeNode.className = 'n9e-uplot-tooltip-header-close';
            closeNode.innerHTML = `<span role="img" aria-label="close" class="anticon anticon-close"><svg fill-rule="evenodd" viewBox="64 64 896 896" focusable="false" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.69-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z"></path></svg></span>`;
            closeNode.onclick = () => {
              closeOverlay();
            };
            headerNode.appendChild(closeNode);
          }
        }

        const mainNode = overlay!.querySelector('.n9e-uplot-tooltip-main');
        if (mainNode) {
          mainNode.innerHTML = '';
          const frag = document.createDocumentFragment();
          const ulNode = document.createElement('ul');
          ulNode.style.maxWidth = `${window.innerWidth / 1.5}px`; // 宽度最大值
          frag.appendChild(ulNode);

          if (options.mode === 'single') {
            const seriesItem = series[closestSeriesIdx];
            let value = originData[closestSeriesIdx]?.values?.[idx];
            if (seriesItem.n9e_internal?.values) {
              value = seriesItem.n9e_internal.values[idx];
            }
            const liNode = renderTooltipItem(seriesItem, value, options);
            liNode.className = 'n9e-uplot-tooltip-item n9e-uplot-tooltip-item-closest';
            ulNode.appendChild(liNode);
          } else {
            _.forEach(valuesData, (item) => {
              const seriesItem = item.seriesItem;
              let value = item.values[idx];
              if (seriesItem.n9e_internal?.values) {
                value = seriesItem.n9e_internal.values[idx];
              }
              const liNode = renderTooltipItem(seriesItem, value, options);
              if (item.seriesIndex === closestSeriesIdx) {
                liNode.className = 'n9e-uplot-tooltip-item n9e-uplot-tooltip-item-closest';
              }
              ulNode.appendChild(liNode);
            });
          }

          if (overflow) {
            const overflowLiNode = document.createElement('li');
            const overflowLiTextNode = document.createTextNode('......');

            overflowLiNode.appendChild(overflowLiTextNode);
            ulNode.appendChild(overflowLiNode);
          }

          mainNode.appendChild(frag);
        }
      },
      destroy: () => {
        overlay!.style.display = 'none';
      },
    },
  };
}
