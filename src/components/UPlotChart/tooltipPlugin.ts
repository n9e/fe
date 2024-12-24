import _ from 'lodash';
import moment from 'moment';

import { uplotsMap } from './index';

let hoveringUplotID = '';

function renderTooltipItem(seriesItem, value, options) {
  // value = serie.value(u, value, seriesIndex + 1, idx);
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
  graphTooltip?: 'default' | 'sharedCrosshair' | 'sharedTooltip';
  pointNameformatter?: (label: string, point: any) => string;
  pointValueformatter?: (value: number, point: any) => string;
}) {
  const { id, graphTooltip } = options;
  let over, bLeft, bTop;

  const tooltipID = `${id}-tooltip`;
  let overlay = document.getElementById(tooltipID);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = tooltipID;
    overlay.className = 'n9e-uplot-tooltip-container';
    overlay.style.display = 'none';
    overlay.style.position = 'absolute';
    document.body.appendChild(overlay);
  }

  return {
    hooks: {
      init: (u) => {
        if (overlay === null) return;
        over = u.over;
        overlay.style.display = 'none';
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
      },
      setSize: () => {
        let bbox = over.getBoundingClientRect();
        bLeft = bbox.left;
        bTop = bbox.top;
      },
      setCursor: (u) => {
        if (overlay === null) return;
        const { data, series } = u;
        const timeData = data[0];
        let valuesData: {
          values: number[];
          seriesIndex: number;
          seriesItem: any;
        }[] = _.slice(
          _.map(data, (item, idx: number) => {
            return {
              values: item,
              seriesIndex: idx,
              seriesItem: series[idx],
            };
          }),
          1,
        );
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
          const x = u.valToPos(timeData[idx], 'x');
          const y = u.valToPos(item.values[idx], 'y');
          const dist = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));
          if (dist < minDist) {
            minDist = dist;
            closestSeriesIdx = item.seriesIndex;
          }
        });

        // 绘制 DOM 元素
        overlay!.innerHTML = '';
        const wrapEle = document.createElement('div');
        const renderToHeight = window.innerHeight / 1.5;

        // 最大可显示的行数，超出最大行数就在中位隐藏超出数量的行
        // 18: padding + border
        // 100: 缓冲区域
        // 15: 每行高度
        // + 1: 标题栏高度
        const maxLength = (renderToHeight - 18 - 100) / 15;
        let overflow = false;

        if (valuesData.length > maxLength) {
          valuesData = _.slice(valuesData, 0, maxLength);
          overflow = true;
        }

        wrapEle.className = 'n9e-uplot-tooltip';
        overlay!.appendChild(wrapEle);

        const frag = document.createDocumentFragment();
        const ulNode = document.createElement('ul');
        const headerNode = document.createElement('li');
        headerNode.className = 'n9e-uplot-tooltip-header';
        const headerText = timeData[idx] ? moment.unix(timeData[idx]).format('YYYY-MM-DD HH:mm:ss') : 'Invalid Time';
        const headerTextNode = document.createTextNode(headerText);

        headerNode.appendChild(headerTextNode);
        ulNode.style.maxWidth = `${window.innerWidth / 1.5}px`; // 宽度最大值
        ulNode.appendChild(headerNode);
        frag.appendChild(ulNode);

        if (options.mode === 'single') {
          const seriesItem = series[closestSeriesIdx];
          const value = valuesData[closestSeriesIdx - 1]?.values?.[idx];
          const liNode = renderTooltipItem(seriesItem, value, options);
          liNode.className = 'n9e-uplot-tooltip-item n9e-uplot-tooltip-item-closest';
          ulNode.appendChild(liNode);
        } else {
          _.forEach(valuesData, (item) => {
            const seriesItem = item.seriesItem;
            const value = item.values[idx];
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

        wrapEle.appendChild(frag);
      },
      destroy: () => {
        overlay!.style.display = 'none';
      },
    },
  };
}
