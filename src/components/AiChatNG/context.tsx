import React from 'react';

import { AiChatMode, AiChatExecuteQueryForQueryContent, IAiChatPageInfo, IAiChatAction } from './types';
import { buildPageFrom } from './recommend';

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
  promptList?: string[];
  onExecuteQueryForQueryContent?: AiChatExecuteQueryForQueryContent;
  queryPageFrom?: IAiChatPageInfo;
  queryAction?: IAiChatAction;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setMode: React.Dispatch<React.SetStateAction<AiChatMode>>;
  setPromptList: React.Dispatch<React.SetStateAction<string[] | undefined>>;
  setOnExecuteQueryForQueryContent: React.Dispatch<React.SetStateAction<AiChatExecuteQueryForQueryContent | undefined>>;
  setQueryPageFrom: React.Dispatch<React.SetStateAction<IAiChatPageInfo | undefined>>;
  setQueryAction: React.Dispatch<React.SetStateAction<IAiChatAction | undefined>>;
  openAiChat: (options?: {
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
  promptList: undefined,
  onExecuteQueryForQueryContent: undefined,
  queryPageFrom: undefined,
  queryAction: undefined,
  setVisible: noop as React.Dispatch<React.SetStateAction<boolean>>,
  setMode: noop as React.Dispatch<React.SetStateAction<AiChatMode>>,
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
      mode?: AiChatMode;
      promptList?: string[];
      onExecuteQueryForQueryContent?: AiChatExecuteQueryForQueryContent;
      queryPageFrom?: IAiChatPageInfo;
      queryAction?: IAiChatAction;
    }) => {
      const ensuredPageFrom = options?.queryPageFrom?.url ? options.queryPageFrom : buildPageFrom();
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
    [setMode, setOnExecuteQueryForQueryContent, setQueryPageFrom, setQueryAction, setPromptList, setVisible],
  );

  const closeAiChat = React.useCallback(() => {
    setVisible(false);
  }, []);

  const value = React.useMemo(
    () => ({
      visible,
      mode,
      promptList,
      onExecuteQueryForQueryContent,
      queryPageFrom,
      queryAction,
      setVisible,
      setMode,
      setPromptList,
      setOnExecuteQueryForQueryContent,
      setQueryPageFrom,
      setQueryAction,
      openAiChat,
      closeAiChat,
    }),
    [visible, mode, promptList, onExecuteQueryForQueryContent, queryPageFrom, queryAction, openAiChat, closeAiChat],
  );

  return <AiChatContext.Provider value={value}>{children}</AiChatContext.Provider>;
}

export function useAiChatContext() {
  return React.useContext(AiChatContext);
}
