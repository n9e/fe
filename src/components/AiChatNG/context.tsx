import React from 'react';

type AiChatCallbackParams = Record<string, unknown>;

interface IAiChatContextValue {
  visible: boolean;
  datasourceCate?: string;
  datasourceValue?: number;
  callbackParams?: AiChatCallbackParams;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setDatasourceCate: React.Dispatch<React.SetStateAction<string | undefined>>;
  setDatasourceValue: React.Dispatch<React.SetStateAction<number | undefined>>;
  setCallbackParams: React.Dispatch<React.SetStateAction<AiChatCallbackParams | undefined>>;
  openAiChat: (options?: { datasourceCate?: string; datasourceValue?: number; callbackParams?: AiChatCallbackParams }) => void;
  closeAiChat: () => void;
}

interface IAiChatProviderProps {
  children: React.ReactNode;
}

const noop = () => undefined;

export const AiChatContext = React.createContext<IAiChatContextValue>({
  visible: false,
  datasourceCate: undefined,
  datasourceValue: undefined,
  callbackParams: undefined,
  setVisible: noop as React.Dispatch<React.SetStateAction<boolean>>,
  setDatasourceCate: noop as React.Dispatch<React.SetStateAction<string | undefined>>,
  setDatasourceValue: noop as React.Dispatch<React.SetStateAction<number | undefined>>,
  setCallbackParams: noop as React.Dispatch<React.SetStateAction<AiChatCallbackParams | undefined>>,
  openAiChat: noop,
  closeAiChat: noop,
});

export function AiChatProvider(props: IAiChatProviderProps) {
  const { children } = props;
  const [visible, setVisible] = React.useState(false);
  const [datasourceCate, setDatasourceCate] = React.useState<string | undefined>(undefined);
  const [datasourceValue, setDatasourceValue] = React.useState<number | undefined>(undefined);
  const [callbackParams, setCallbackParams] = React.useState<AiChatCallbackParams | undefined>(undefined);

  const openAiChat = React.useCallback((options?: { datasourceCate?: string; datasourceValue?: number; callbackParams?: AiChatCallbackParams }) => {
    if (options?.datasourceCate !== undefined) {
      setDatasourceCate(options.datasourceCate);
    }
    if (options?.datasourceValue !== undefined) {
      setDatasourceValue(options.datasourceValue);
    }
    if (options?.callbackParams !== undefined) {
      setCallbackParams(options.callbackParams);
    }
    setVisible(true);
  }, []);

  const closeAiChat = React.useCallback(() => {
    setVisible(false);
  }, []);

  const value = React.useMemo(
    () => ({
      visible,
      datasourceCate,
      datasourceValue,
      callbackParams,
      setVisible,
      setDatasourceCate,
      setDatasourceValue,
      setCallbackParams,
      openAiChat,
      closeAiChat,
    }),
    [visible, datasourceCate, datasourceValue, callbackParams, openAiChat, closeAiChat],
  );

  return <AiChatContext.Provider value={value}>{children}</AiChatContext.Provider>;
}

export function useAiChatContext() {
  return React.useContext(AiChatContext);
}
