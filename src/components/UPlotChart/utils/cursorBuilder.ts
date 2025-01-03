import { Cursor } from 'uplot';
import _ from 'lodash';
import Color from 'color';

interface Props {
  x?: boolean;
  y?: boolean;
  sync?: Cursor.Sync;
}

export default function cursorBuider(props: Props): Cursor {
  const { x = true, y = true, sync } = props;

  return {
    x,
    y,
    sync,
    points: {
      size: (u, seriesIdx) => {
        const size = u.series[seriesIdx].points?.size;
        if (size) {
          return size * 2;
        }
        return 6;
      },
      width: (u, seriesIdx, size) => size / 4,
      stroke: (u, seriesIdx) => {
        const stroke = u.series[seriesIdx].points?.stroke;
        if (typeof stroke === 'function') {
          const color = stroke(u, seriesIdx);
          return Color(color).alpha(0.4).rgb().string();
        }
        return 'blue';
      },
      fill: (u, seriesIdx) => {
        const stroke = u.series[seriesIdx].points?.stroke;
        if (typeof stroke === 'function') {
          const color = stroke(u, seriesIdx);
          return color;
        }
        return 'blue';
      },
    },
    bind: {
      dblclick: (u) => () => {
        // 关闭默认的双击重置缩放行为
        return null;
      },
    },
  };
}
