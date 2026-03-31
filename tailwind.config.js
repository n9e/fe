function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

module.exports = {
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
          50: withOpacityValue('--fc-fill-1-rgb'),
          100: withOpacityValue('--fc-fill-2-rgb'),
          150: withOpacityValue('--fc-fill-2-5-rgb'),
          200: withOpacityValue('--fc-fill-3-rgb'),
          300: withOpacityValue('--fc-fill-4-rgb'),
          400: withOpacityValue('--fc-fill-5-rgb'),
          500: withOpacityValue('--fc-fill-6-rgb'),
          600: withOpacityValue('--fc-fill-7-rgb'),
          violet: {
            100: 'var(--fc-violet-1)',
            200: 'var(--fc-violet-2)',
            300: 'var(--fc-violet-3)',
            400: 'var(--fc-violet-4)',
            500: 'var(--fc-violet-5)',
            600: 'var(--fc-violet-6)',
            700: 'var(--fc-violet-7)',
            800: 'var(--fc-violet-8)',
            900: withOpacityValue('--fc-violet-9-rgb'),
            1000: withOpacityValue('--fc-violet-10-rgb'),
            1100: withOpacityValue('--fc-violet-11-rgb'),
            1200: withOpacityValue('--fc-violet-12-rgb'),
          },
          indigo: {
            100: 'var(--fc-indigo-1)',
            200: 'var(--fc-indigo-2)',
            300: 'var(--fc-indigo-3)',
            400: 'var(--fc-indigo-4)',
            500: 'var(--fc-indigo-5)',
            600: 'var(--fc-indigo-6)',
            700: 'var(--fc-indigo-7)',
            800: 'var(--fc-indigo-8)',
            900: withOpacityValue('--fc-indigo-9-rgb'),
            1000: withOpacityValue('--fc-indigo-10-rgb'),
            1100: withOpacityValue('--fc-indigo-11-rgb'),
            1200: withOpacityValue('--fc-indigo-12-rgb'),
          },
          red: {
            100: 'var(--fc-red-1)',
            200: 'var(--fc-red-2)',
            300: 'var(--fc-red-3)',
            400: 'var(--fc-red-4)',
            500: 'var(--fc-red-5)',
            600: 'var(--fc-red-6)',
            700: 'var(--fc-red-7)',
            800: 'var(--fc-red-8)',
            900: withOpacityValue('--fc-red-9-rgb'),
            1000: withOpacityValue('--fc-red-10-rgb'),
            1100: withOpacityValue('--fc-red-11-rgb'),
            1200: withOpacityValue('--fc-red-12-rgb'),
          },
          orange: {
            100: 'var(--fc-orange-1)',
            200: 'var(--fc-orange-2)',
            300: 'var(--fc-orange-3)',
            400: 'var(--fc-orange-4)',
            500: 'var(--fc-orange-5)',
            600: 'var(--fc-orange-6)',
            700: 'var(--fc-orange-7)',
            800: 'var(--fc-orange-8)',
            900: withOpacityValue('--fc-orange-9-rgb'),
            1000: withOpacityValue('--fc-orange-10-rgb'),
            1100: withOpacityValue('--fc-orange-11-rgb'),
            1200: withOpacityValue('--fc-orange-12-rgb'),
          },
          yellow: {
            100: 'var(--fc-yellow-1)',
            200: 'var(--fc-yellow-2)',
            300: 'var(--fc-yellow-3)',
            400: 'var(--fc-yellow-4)',
            500: 'var(--fc-yellow-5)',
            600: 'var(--fc-yellow-6)',
            700: 'var(--fc-yellow-7)',
            800: 'var(--fc-yellow-8)',
            900: withOpacityValue('--fc-yellow-9-rgb'),
            1000: withOpacityValue('--fc-yellow-10-rgb'),
            1100: withOpacityValue('--fc-yellow-11-rgb'),
            1200: withOpacityValue('--fc-yellow-12-rgb'),
          },
          green: {
            100: 'var(--fc-green-1)',
            200: 'var(--fc-green-2)',
            300: 'var(--fc-green-3)',
            400: 'var(--fc-green-4)',
            500: 'var(--fc-green-5)',
            600: 'var(--fc-green-6)',
            700: 'var(--fc-green-7)',
            800: 'var(--fc-green-8)',
            900: withOpacityValue('--fc-green-9-rgb'),
            1000: withOpacityValue('--fc-green-10-rgb'),
            1100: withOpacityValue('--fc-green-11-rgb'),
            1200: withOpacityValue('--fc-green-12-rgb'),
          },
        },
        primary: withOpacityValue('--fc-fill-primary-rgb'),
        success: withOpacityValue('--fc-fill-success-rgb'),
        warning: withOpacityValue('--fc-fill-warning-rgb'),
        alert: withOpacityValue('--fc-fill-alert-rgb'),
        error: withOpacityValue('--fc-fill-error-rgb'),
        antd: 'var(--fc-antd-border-color)',
        // use for background
        'primary-pale': '#F0ECF9',
        // use for border
        'primary-light': '#DAC7FF',
        ant: '#D9D9D9',
        'card-border': 'var(--fc-card-border)',
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
        default: ['Inter', 'PingFangSC-Regular', 'microsoft yahei ui', 'microsoft yahei', 'simsun', 'sans-serif'],
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
