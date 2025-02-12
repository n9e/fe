/**
 * tsGraph 使用
 */
export const tsGraphThemeColor = {
  xAxis: {
    lineColor: {
      light: '#ccc',
      dark: 'rgba(255,255,255,0.2)',
    },
    tickColor: {
      light: '#ccc',
      dark: 'rgba(255,255,255,0.2)',
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
      light: '#f6f6f6',
      dark: '#4f5263',
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
