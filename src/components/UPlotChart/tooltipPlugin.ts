import _ from 'lodash';
import moment from 'moment';

export default function tooltipPlugin(options: {
  id: string;
  pointNameformatter?: (label: string, point: any) => string;
  pointValueformatter?: (value: number, point: any) => string;
  sharedSortDirection?: 'asc' | 'desc';
}) {
  const { id } = options;
  let over, bLeft, bTop;

  function syncBounds() {
    let bbox = over.getBoundingClientRect();
    bLeft = bbox.left;
    bTop = bbox.top;
  }

  let overlay = document.getElementById(id);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = id;
    overlay.className = 'n9e-uplot-tooltip-container';
    overlay.style.display = 'none';
    overlay.style.position = 'absolute';
    document.body.appendChild(overlay);
  }

  return {
    hooks: {
      init: (u) => {
        over = u.over;
        overlay.style.display = 'none';
        over.onmouseenter = () => {
          overlay.style.display = 'block';
        };
        over.onmouseleave = () => {
          overlay.style.display = 'none';
        };
      },
      setSize: () => {
        syncBounds();
      },
      setCursor: (u) => {
        const { data, series } = u;
        const timeData = data[0];
        let valuesData: number[][] = _.slice(data, 1);
        const { left, top, idx } = u.cursor;
        if (idx === null) return;
        const anchor = { left: left + bLeft, top: top + bTop };
        (window as any).placement(overlay, anchor, 'right', 'start', { bound: document.body });

        // tooltip 排序
        if (options.sharedSortDirection) {
          _.orderBy(
            valuesData,
            (item) => {
              return item[idx];
            },
            options.sharedSortDirection,
          );
        }

        // 获取鼠标位置
        const mouseX = u.cursor.left;
        const mouseY = u.cursor.top;

        // 初始化最小距离和最近点的索引
        let minDist = Infinity;
        let closestIdx = idx;
        let closestSeriesIdx = -1;

        // 遍历所有数据点，找到距离最近的点
        _.forEach(valuesData, (seriesData, seriesIdx) => {
          const x = u.valToPos(timeData[idx], 'x');
          const y = u.valToPos(seriesData[idx], 'y');
          const dist = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));
          if (dist < minDist) {
            minDist = dist;
            closestIdx = idx;
            closestSeriesIdx = seriesIdx;
          }
        });

        // 绘制 DOM 元素
        overlay.innerHTML = '';
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
        overlay.appendChild(wrapEle);

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

        _.forEach(valuesData, (item, seriesIndex) => {
          const serie = series[seriesIndex + 1];
          const value = item[idx];
          // value = serie.value(u, value, seriesIndex + 1, idx);
          const { stroke, label } = serie;
          const color = stroke();
          const point = {
            color,
            label,
            n9e_internal: serie.n9e_internal,
          };
          const liNode = document.createElement('li');
          liNode.className = 'n9e-uplot-tooltip-item';

          if (closestSeriesIdx === seriesIndex) {
            liNode.className = 'n9e-uplot-tooltip-item n9e-uplot-tooltip-item-closest';
          }

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

          ulNode.appendChild(liNode);
        });

        if (overflow) {
          const overflowLiNode = document.createElement('li');
          const overflowLiTextNode = document.createTextNode('......');

          overflowLiNode.appendChild(overflowLiTextNode);
          ulNode.appendChild(overflowLiNode);
        }

        wrapEle.appendChild(frag);
      },
    },
  };
}
