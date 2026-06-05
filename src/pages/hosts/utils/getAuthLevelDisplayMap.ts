export default function getAuthLevelDisplayMap(
  t,
  options?: {
    [index: number]: string;
  },
) {
  return {
    0: {
      text: options?.[0] ?? t('hosts:auth_level_0'),
      bgColor: 'var(--fc-fill-2-5)',
      fontColor: 'text-hint',
    },
    1: {
      text: options?.[1] ?? t('hosts:auth_level_1'),
      bgColor: 'rgb(59 130 246 / 0.2)',
      fontColor: 'rgb(59 130 246)',
    },
    2: {
      text: options?.[2] ?? t('hosts:auth_level_2'),
      bgColor: 'rgb(245 158 11 / 0.2)',
      fontColor: 'rgb(245 158 11)',
    },
    3: {
      text: options?.[3] ?? t('hosts:auth_level_3'),
      bgColor: 'rgb(244 63 94 / 0.2)',
      fontColor: 'rgb(244 63 94)',
    },
  };
}
