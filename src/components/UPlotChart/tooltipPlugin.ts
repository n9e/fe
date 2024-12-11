import _ from 'lodash';
import moment from 'moment';

export default function tooltipPlugin(options: {
  pointNameformatter?: (label: string, point: any) => string;
  pointValueformatter?: (value: number, point: any) => string;
  sharedSortDirection?: 'asc' | 'desc';
}) {
  let over, bLeft, bTop;

  function syncBounds() {
    let bbox = over.getBoundingClientRect();
    bLeft = bbox.left;
    bTop = bbox.top;
  }

  const overlay = document.createElement('div');
  overlay.className = 'n9e-uplot-tooltip-container';
  overlay.style.display = 'none';
  overlay.style.position = 'absolute';
  document.body.appendChild(overlay);

  return {
    hooks: {
      init: (u) => {
        over = u.over;
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
        const anchor = { left: left + bLeft, top: top + bTop };
        (window as any).placement(overlay, anchor, 'right', 'start', { bound: document.body });

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

        if (options.sharedSortDirection) {
          _.orderBy(
            valuesData,
            (item) => {
              return item[idx];
            },
            options.sharedSortDirection,
          );
        }

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
          let value = item[idx];
          value = serie.value(u, value, seriesIndex + 1, idx);
          const { stroke, label } = serie;
          const color = stroke();
          const point = {
            color,
            label,
          };
          const liNode = document.createElement('li');

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
            const nameTextNode = document.createTextNode(formatName);

            // if (nearestPoint?.name === label) {
            //   nameNode.style.fontWeight = 'bold';
            // }

            nameNode.appendChild(nameTextNode);
            liNode.appendChild(nameNode);
          }

          if (value !== undefined && value !== null) {
            const valueNode = document.createElement('span');

            // if (nearestPoint?.name === label) {
            //   valueNode.style.fontWeight = 'bold';
            // }

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
