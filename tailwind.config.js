function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

module.exports = {
  important: '#tailwind',
  darkMode: 'class',
  important: true,
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  // 添加下面的代码,禁用 `清除浏览器默认样式`, 解决和antd的样式冲突
  // (这样 `@tailwind base` 就只会添加一些默认的 tw 变量.不会去清除浏览器默认样式了.)
  corePlugins: {
    preflight: false,
  },
  variants: {
    extend: {
      borderWidth: ['last'],
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant('children', '& > *');
      addVariant('children-icon', '& > svg'); // antd icon
      addVariant('children-icon2', '& > .anticon > svg'); // antd icon
    },
    require('tailwindcss-animate'),
  ],
  theme: {
    extend: {
      spacing: {
        4.5: '1.125rem',
        3.5: '0.875rem',
      },
      colors: {
        fc: {
          50: withOpacityValue('--fc-fill-1'),
          100: withOpacityValue('--fc-fill-2'),
          200: withOpacityValue('--fc-fill-3'),
          300: withOpacityValue('--fc-fill-4'),
          400: withOpacityValue('--fc-fill-5'),
          500: withOpacityValue('--fc-fill-6'),
          600: withOpacityValue('--fc-fill-7'),
        },
        primary: withOpacityValue('--fc-fill-primary'),
        success: withOpacityValue('--fc-fill-success'),
        warning: withOpacityValue('--fc-fill-warning'),
        alert: withOpacityValue('--fc-fill-alert'),
        error: withOpacityValue('--fc-fill-error'),
        // use for background
        'primary-pale': '#F0ECF9',
        // use for border
        'primary-light': '#DAC7FF',
        ant: '#D9D9D9',
      },
      backgroundImage: {
        'gradient-offer': 'linear-gradient(28deg, #7438d0 0%, #6437d0 36%, #6437ce 57%, #5148ce 100%)',
      },
      boxShadow: {
        mf: 'rgba(0, 0, 0, 0.09) 0px 3px 12px',
      },
      transitionProperty: {
        width: 'width',
        height: 'height',
        spacing: 'margin, padding',
      },
      fontFamily: {
        default: ['Inter UI', 'PingFangSC-Regular', 'microsoft yahei ui', 'microsoft yahei', 'simsun', 'sans-serif'],
        // 粗体需要使用 font-bolder 类名，而不是这里定义的 font-bold-family
        'bold-family': ['PingFangSC-Medium', 'Microsoft YaHei Bold'],
      },
    },
    textColor: (theme) => ({
      ...theme('colors'),
      title: 'var(--fc-text-1)',
      main: 'var(--fc-text-2)',
      hint: 'var(--fc-text-3)',
      soft: 'var(--fc-text-4)',
      disable: 'var(--fc-text-5)',
      link: 'var(--fc-text-link)',
      placeholder: 'var(--fc-text-placeholder)',
    }),
    screens: {
      xs: '320px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      xl2: '1440px',
      '2xl': '1536px',
      '3xl': '1680px',
      '4xl': '1920px',
    },
    fontSize: {
      sm: ['12px', '18px'],
      base: ['12px', '22px'],
      l1: ['14px', '22px'],
      l2: ['16px', '24px'],
      l3: ['18px', '28px'],
      l4: ['24px', '36px'],
      l5: ['28px', '42px'],
      l6: ['32px', '48px'],
      l7: ['36px', '54px'],
    },
  },
};
