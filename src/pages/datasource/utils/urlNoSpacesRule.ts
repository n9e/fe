import i18next from 'i18next';

/** URL fields use TrimInput, so only inner spaces can remain here — those are always invalid. */
export default function urlNoSpacesRule() {
  return {
    async validator(_rule: unknown, value?: string) {
      if (value?.includes(' ')) {
        throw new Error(i18next.t('datasourceManage:form.url_no_spaces_msg'));
      }
    },
  };
}
