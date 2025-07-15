/**
 * tsGraph 使用
 */
export const tsGraphThemeColor = {
  xAxis: {
    lineColor: {
      light: '#ccc',
      dark: 'rgba(204, 204, 220, 0.2)',
    },
    tickColor: {
      light: '#ccc',
      dark: 'rgba(204, 204, 220, 0.2)',
    },
  },
  yAxis: {
    /**
     * 跟随 "--fc-fill-2" 及时更新
     */
    backgroundColor: {
      light: '#fff',
      dark: 'rgb(24 27 31)',
    },
    gridLineColor: {
      light: 'rgb(243,244,246)',
      dark: 'rgba(153, 153, 165, 0.08)',
    },
  },
};

/**
 * 灭火图首页气泡 特殊处理
 */
export const bubbleIcon = {
  bubbleImage: {
    red: {
      light: '/image/outfire/status-bubble/red_bubble_light.png',
      dark: '/image/outfire/status-bubble/red_bubble_dark.png',
    },
    green: {
      light: '/image/outfire/status-bubble/green_bubble_light.png',
      dark: '/image/outfire/status-bubble/green_bubble_dark.png',
    },
    nodata: {
      light: '/image/outfire/status-bubble/nodata_bubble_light.png',
      dark: '/image/outfire/status-bubble/nodata_bubble_dark.png',
    },
  },
};

/**
 * 灭火图首页自定义图标状态颜色
 */
export const firemapLevel1Icon = {
  red: {
    light: '#E33639',
    dark: '#F65B5D',
  },
  green: {
    light: '#51C061',
    dark: '#6EDB7D',
  },
  nodata: {
    light: '#9793A9',
    dark: '#B0ACC2',
  },
};
