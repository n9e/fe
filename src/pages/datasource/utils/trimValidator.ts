import i18next from 'i18next';

export default function trimValidator() {
  return {
    async validator(_, value: string) {
      if (value && value.trim && value !== value.trim()) {
        return Promise.reject(new Error(i18next.t('common:trim_validator_msg')));
      }
      return Promise.resolve();
    },
  };
}
