import i18next from 'i18next';

import { getProdOptions as getN9eProdOptions } from '@/pages/alertRules/Form/components/ProdSelect';
import { IS_ENT } from '@/utils/constant';

export default function getProdOptions(feats) {
  let prodOptions = getN9eProdOptions(feats);

  if (IS_ENT) {
    prodOptions = [
      ...prodOptions,
      {
        label: i18next.t('AlertHisEvents:rule_prod.firemap'),
        value: 'firemap',
        pro: false,
      },
      {
        label: i18next.t('AlertHisEvents:rule_prod.northstar'),
        value: 'northstar',
        pro: false,
      },
    ];
  }

  return prodOptions;
}
