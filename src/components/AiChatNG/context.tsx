import React from 'react';

import { AiChatMode, AiChatExecuteQueryForQueryContent, IAiChatPageInfo, IAiChatAction } from './types';
import { buildPageFrom } from './recommend';

type AiChatCallbackParams = Record<string, unknown>;
const AI_CHAT_MODE_STORAGE_KEY = 'ai-chat-mode';

function getInitialMode(): AiChatMode {
  if (typeof window === 'undefined') {
    return 'drawer';
  }

  const cachedMode = window.localStorage.getItem(AI_CHAT_MODE_STORAGE_KEY);
  if (cachedMode === 'floating' || cachedMode === 'drawer') {
    return cachedMode;
  }

  return 'drawer';
}

interface IAiChatContextValue {
  visible: boolean;
  mode: AiChatMode;
  datasourceCate?: string;
  datasourceValue?: number;
  callbackParams?: AiChatCallbackParams;
  promptList?: string[];
  onExecuteQueryForQueryContent?: AiChatExecuteQueryForQueryContent;
  queryPageFrom?: IAiChatPageInfo;
  queryAction?: IAiChatAction;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setMode: React.Dispatch<React.SetStateAction<AiChatMode>>;
  setDatasourceCate: React.Dispatch<React.SetStateAction<string | undefined>>;
  setDatasourceValue: React.Dispatch<React.SetStateAction<number | undefined>>;
  setCallbackParams: React.Dispatch<React.SetStateAction<AiChatCallbackParams | undefined>>;
  setPromptList: React.Dispatch<React.SetStateAction<string[] | undefined>>;
  setOnExecuteQueryForQueryContent: React.Dispatch<React.SetStateAction<AiChatExecuteQueryForQueryContent | undefined>>;
  setQueryPageFrom: React.Dispatch<React.SetStateAction<IAiChatPageInfo | undefined>>;
  setQueryAction: React.Dispatch<React.SetStateAction<IAiChatAction | undefined>>;
  openAiChat: (options?: {
    datasourceCate?: string;
    datasourceValue?: number;
    callbackParams?: AiChatCallbackParams;
    mode?: AiChatMode;
    promptList?: string[];
    onExecuteQueryForQueryContent?: AiChatExecuteQueryForQueryContent;
    queryPageFrom?: IAiChatPageInfo;
    queryAction?: IAiChatAction;
  }) => void;
  closeAiChat: () => void;
}

interface IAiChatProviderProps {
  children: React.ReactNode;
}

const noop = () => undefined;

export const AiChatContext = React.createContext<IAiChatContextValue>({
  visible: false,
  mode: 'drawer',
  datasourceCate: undefined,
  datasourceValue: undefined,
  callbackParams: undefined,
  promptList: undefined,
  onExecuteQueryForQueryContent: undefined,
  queryPageFrom: undefined,
  queryAction: undefined,
  setVisible: noop as React.Dispatch<React.SetStateAction<boolean>>,
  setMode: noop as React.Dispatch<React.SetStateAction<AiChatMode>>,
  setDatasourceCate: noop as React.Dispatch<React.SetStateAction<string | undefined>>,
  setDatasourceValue: noop as React.Dispatch<React.SetStateAction<number | undefined>>,
  setCallbackParams: noop as React.Dispatch<React.SetStateAction<AiChatCallbackParams | undefined>>,
  setPromptList: noop as React.Dispatch<React.SetStateAction<string[] | undefined>>,
  setOnExecuteQueryForQueryContent: noop as React.Dispatch<React.SetStateAction<AiChatExecuteQueryForQueryContent | undefined>>,
  setQueryPageFrom: noop as React.Dispatch<React.SetStateAction<IAiChatPageInfo | undefined>>,
  setQueryAction: noop as React.Dispatch<React.SetStateAction<IAiChatAction | undefined>>,
  openAiChat: noop,
  closeAiChat: noop,
});

export function AiChatProvider(props: IAiChatProviderProps) {
  const { children } = props;
  const [visible, setVisible] = React.useState(false);
  const [mode, setMode] = React.useState<AiChatMode>(getInitialMode);
  const [datasourceCate, setDatasourceCate] = React.useState<string | undefined>(undefined);
  const [datasourceValue, setDatasourceValue] = React.useState<number | undefined>(undefined);
  const [callbackParams, setCallbackParams] = React.useState<AiChatCallbackParams | undefined>(undefined);
  const [promptList, setPromptList] = React.useState<string[] | undefined>(undefined);
  const [onExecuteQueryForQueryContent, setOnExecuteQueryForQueryContent] = React.useState<AiChatExecuteQueryForQueryContent | undefined>(undefined);
  const [queryPageFrom, setQueryPageFrom] = React.useState<IAiChatPageInfo | undefined>(undefined);
  const [queryAction, setQueryAction] = React.useState<IAiChatAction | undefined>(undefined);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(AI_CHAT_MODE_STORAGE_KEY, mode);
  }, [mode]);

  const openAiChat = React.useCallback(
    (options?: {
      datasourceCate?: string;
      datasourceValue?: number;
      callbackParams?: AiChatCallbackParams;
      mode?: AiChatMode;
      promptList?: string[];
      onExecuteQueryForQueryContent?: AiChatExecuteQueryForQueryContent;
      queryPageFrom?: IAiChatPageInfo;
      queryAction?: IAiChatAction;
    }) => {
      const ensuredPageFrom = options?.queryPageFrom?.url ? options.queryPageFrom : buildPageFrom();

      setDatasourceCate(options?.datasourceCate);
      setDatasourceValue(options?.datasourceValue);
      setCallbackParams(options?.callbackParams);
      if (options?.mode !== undefined) {
        setMode(options.mode);
      }
      if (options?.onExecuteQueryForQueryContent !== undefined) {
        setOnExecuteQueryForQueryContent(() => options.onExecuteQueryForQueryContent);
      } else {
        setOnExecuteQueryForQueryContent(undefined);
      }
      setQueryPageFrom(ensuredPageFrom);
      if (options?.queryAction !== undefined) {
        setQueryAction(options.queryAction);
      } else {
        setQueryAction(undefined);
      }
      setPromptList(options?.promptList);
      setVisible(true);
    },
    [],
  );

  const closeAiChat = React.useCallback(() => {
    setVisible(false);
  }, []);

  const value = React.useMemo(
    () => ({
      visible,
      mode,
      datasourceCate,
      datasourceValue,
      callbackParams,
      promptList,
      onExecuteQueryForQueryContent,
      queryPageFrom,
      queryAction,
      setVisible,
      setMode,
      setDatasourceCate,
      setDatasourceValue,
      setCallbackParams,
      setPromptList,
      setOnExecuteQueryForQueryContent,
      setQueryPageFrom,
      setQueryAction,
      openAiChat,
      closeAiChat,
    }),
    [visible, mode, datasourceCate, datasourceValue, callbackParams, promptList, onExecuteQueryForQueryContent, queryPageFrom, queryAction, openAiChat, closeAiChat],
  );

  return <AiChatContext.Provider value={value}>{children}</AiChatContext.Provider>;
}

export function useAiChatContext() {
  return React.useContext(AiChatContext);
}
