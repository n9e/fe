import React, { useEffect, useRef, useState } from 'react';
import Markdown from '@/components/Document/Markdown';
import { IMessageResponse } from '../../store';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

interface IPorps {
  response: IMessageResponse;
  isCancel: boolean;
  maybeScrollToBottom: () => void;
}

export default function MarkdownContainer(props: IPorps) {
  const { t, i18n } = useTranslation('aiChat');

  const { response, isCancel, maybeScrollToBottom } = props;

  const abortControllerRef = useRef<AbortController | null>(null);

  const [content, setContent] = useState<string>('');

  useEffect(() => {
    if (!response?.is_finish && response.stream_id) {
      getStream(response.stream_id);
    } else {
      setContent(response?.content);
    }
  }, [response?.is_finish, response?.stream_id]);

  useEffect(() => {
    if (isCancel && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [isCancel]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    maybeScrollToBottom();
  }, [content]);

  const getStream = (streamId: string) => {
    // 如果已有请求在进行中，先取消它
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();

    const headers = {
      Accept: 'text/event-stream',
      Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
      'FC-WORKSPACE-ID': `${sessionStorage.getItem('spaceId') || localStorage.getItem('spaceId') || 0}`,
      'X-Language': i18n.language,
    };
    if (!headers['X-Cluster']) {
      headers['X-Cluster'] = localStorage.getItem('curCluster') || '';
    }

    if (localStorage.getItem('userName')) {
      headers['User-Name'] = localStorage.getItem('userName');
    }
    const data = {
      stream_id: streamId,
    };

    fetchEventSource('/api/fc-model/stream', {
      method: 'POST',
      headers: headers,
      // responseType: 'stream',
      body: JSON.stringify(data),
      openWhenHidden: true,
      signal: abortControllerRef.current.signal, // 添加 signal 支持取消
      onmessage(ev) {
        if (ev?.data != 'null') {
          const data = JSON.parse(ev?.data);
          // console.log('data', data, content);

          setContent((old) => old + data?.v);
        }
      },
      onerror(err) {
        console.error('Stream error:', err);
        // 如果是取消请求导致的错误，不需要特殊处理
        if (err.name === 'AbortError') {
          console.log('Stream request was cancelled');
          return;
        }
      },
    });
  };

  return (
    <>
      <Markdown content={content} />
    </>
  );
}
