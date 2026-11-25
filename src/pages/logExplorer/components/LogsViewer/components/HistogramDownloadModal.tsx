import React from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import DownloadModal from 'plus:/components/LogDownload/DownloadModal';
import HistogramActionButton from './HistogramActionButton';

type Props = Omit<React.ComponentProps<typeof DownloadModal>, 'renderTrigger'>;

/** Adapt supported data-source download dialogs to the shared histogram icon button. */
export default function HistogramDownloadModal(props: Props) {
  const { t } = useTranslation('explorer');
  return (
    <DownloadModal
      {...props}
      renderTrigger={(open, disabled?: boolean, disabledReason?: string) => (
        <HistogramActionButton
          title={disabled && disabledReason ? disabledReason : t('log.log_download.title')}
          icon={<Download size={14} strokeWidth={1.5} />}
          disabled={disabled}
          onClick={open}
        />
      )}
    />
  );
}
