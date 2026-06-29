import React, { createContext, useContext } from 'react';
import { MinusCircleOutlined } from '@ant-design/icons';

import { cn } from '@/utils';
import { Button } from 'antd';

interface CardContainerContextValue {
  hasCloseButton: boolean;
}

const CardContainerContext = createContext<CardContainerContextValue>({ hasCloseButton: false });

interface IProps {
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function CardContainerHeader({ children }: { children: React.ReactNode }) {
  const { hasCloseButton } = useContext(CardContainerContext);
  return <div className={hasCloseButton ? 'min-w-0 flex-1' : 'w-full'}>{children}</div>;
}

function isCardContainerHeader(child: React.ReactNode): child is React.ReactElement {
  return React.isValidElement(child) && child.type === CardContainerHeader;
}

export default function CardContainer({ onClose, children, className }: IProps) {
  const childrenArray = React.Children.toArray(children);
  const headerIndex = childrenArray.findIndex(isCardContainerHeader);
  const header = headerIndex > -1 ? childrenArray[headerIndex] : null;
  const restChildren = headerIndex > -1 ? childrenArray.filter((_, index) => index !== headerIndex) : childrenArray;
  const closeButton = onClose && <Button type='text' icon={<MinusCircleOutlined />} onClick={onClose} />;

  return (
    <CardContainerContext.Provider value={{ hasCloseButton: !!onClose && !!header }}>
      <div className={cn('relative mb-2 fc-border rounded-lg p-4', className)} style={{ background: 'rgba(var(--fc-fill-2-5-rgb) / 0.5)' }}>
        {header ? (
          <div className='flex justify-between gap-2'>
            {header}
            {closeButton}
          </div>
        ) : (
          <>
            {closeButton && <div className='absolute right-2 top-2'>{closeButton}</div>}
            <div className={cn(onClose && 'pr-8')}>{children}</div>
          </>
        )}
        {header && restChildren}
      </div>
    </CardContainerContext.Provider>
  );
}
