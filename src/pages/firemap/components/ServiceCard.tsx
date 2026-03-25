import React from 'react';
import { Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ServiceCardProps {
  name: string;
  score: number;
  cards: number;
  groups: number;
  statusCounts?: { ok: number; warn: number; error: number };
}

const ICON_SIZE = 22;

function ServiceIcon({ name, color }: { name: string; color: string }) {
  // TODO: i18n — icon matching currently uses hardcoded Chinese names
  if (['电商', '网约车', '地图', '直播'].includes(name)) {
    return (
      <span className='text-[13px] font-bold tracking-wide' style={{ color }}>
        API
      </span>
    );
  }
  if (name === '服务模块') {
    return (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox='0 0 24 24' fill='none'>
        <path d='M6 19c0 1.1 2.7 2 6 2s6-.9 6-2v-2c0 1.1-2.7 2-6 2s-6-.9-6-2v2z' fill={color} opacity='0.6' />
        <path d='M6 15c0 1.1 2.7 2 6 2s6-.9 6-2V9c0 1.1-2.7 2-6 2S6 10.1 6 9v6z' fill={color} opacity='0.8' />
        <path d='M12 10c3.3 0 6-.9 6-2s-2.7-2-6-2-6 .9-6 2 2.7 2 6 2z' fill={color} />
      </svg>
    );
  }
  if (name === '容器服务') {
    return (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox='0 0 24 24' fill='none'>
        <circle cx='12' cy='12' r='10' stroke={color} strokeWidth='1.5' fill='none' />
        <circle cx='12' cy='12' r='3' fill={color} opacity='0.3' />
        <line x1='12' y1='2' x2='12' y2='7' stroke={color} strokeWidth='1.5' />
        <line x1='12' y1='17' x2='12' y2='22' stroke={color} strokeWidth='1.5' />
        <line x1='3.3' y1='7' x2='7.6' y2='9.5' stroke={color} strokeWidth='1.5' />
        <line x1='16.4' y1='14.5' x2='20.7' y2='17' stroke={color} strokeWidth='1.5' />
        <line x1='3.3' y1='17' x2='7.6' y2='14.5' stroke={color} strokeWidth='1.5' />
        <line x1='16.4' y1='9.5' x2='20.7' y2='7' stroke={color} strokeWidth='1.5' />
      </svg>
    );
  }
  if (name === 'MySQL-by-rule') {
    return (
      <span className='text-[10px] font-bold' style={{ color }}>
        MySQL
      </span>
    );
  }
  if (name === 'Redis-by-rule') {
    return (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox='0 0 24 24' fill='none'>
        <path d='M12 3L3 8l9 5 9-5-9-5z' fill={color} opacity='0.8' />
        <path d='M3 12l9 5 9-5' stroke={color} strokeWidth='1.5' fill='none' />
        <path d='M3 16l9 5 9-5' stroke={color} strokeWidth='1.5' fill='none' />
      </svg>
    );
  }
  return (
    <span className='text-sm font-bold' style={{ color }}>
      ?
    </span>
  );
}

function getStatusColor(score: number, isNoData: boolean) {
  if (isNoData) return 'var(--fc-text-3)';
  if (score === 100) return 'rgb(var(--fc-fill-success-rgb))';
  return 'rgb(var(--fc-fill-error-rgb))';
}

function getStatusBg(score: number, isNoData: boolean) {
  if (isNoData) return 'var(--fc-fill-3)';
  if (score === 100) return 'var(--fc-status-success-bg)';
  return 'var(--fc-status-error-bg)';
}

export function ServiceCard({ name, score, cards, groups, statusCounts }: ServiceCardProps) {
  const { t } = useTranslation('firemap');
  const isHealthy = score === 100;
  const isNoData = false;
  const circleSize = 56;
  const color = getStatusColor(score, isNoData);
  const bg = getStatusBg(score, isNoData);

  return (
    <div className='bg-fc-100 rounded-lg border border-fc-300 p-4 cursor-pointer hover:shadow-mf transition-shadow'>
      {/* Header */}
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-sm font-medium text-title'>{name}</h3>
        <button className='text-hint/40 hover:text-hint transition-colors'>
          <Settings2 className='w-4 h-4' strokeWidth={1.5} />
        </button>
      </div>

      {/* Body */}
      <div className='flex items-center gap-4'>
        {/* Circle icon */}
        <div className='shrink-0 rounded-full flex items-center justify-center' style={{ width: circleSize, height: circleSize, background: bg, border: `2px solid ${color}40` }}>
          <ServiceIcon name={name} color={color} />
        </div>

        {/* Stats */}
        <div className='flex-1 space-y-1'>
          <div className={`text-l3 font-semibold ${isHealthy ? 'text-success' : 'text-error'}`}>
            {score}
            <span className='text-sm font-normal text-hint'>{t('score_unit')}</span>
          </div>

          <div className='flex items-center gap-2 text-sm text-hint'>
            {statusCounts ? (
              <span>
                {t('cards')} {cards} · {t('groups')} {groups}
              </span>
            ) : (
              <>
                <span>{t('cards')}</span>
                <span className='text-main font-medium'>{cards}</span>
                <span>{t('groups')}</span>
                <span className='text-main font-medium'>{groups}</span>
              </>
            )}
          </div>

          {statusCounts && (
            <div className='flex items-center gap-0.5 text-sm font-medium'>
              <span className='text-error'>{statusCounts.error}</span>
              <span className='text-hint/50'> / </span>
              <span className='text-warning'>{statusCounts.warn}</span>
              <span className='text-hint/50'> / </span>
              <span className='text-success'>{statusCounts.ok}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
