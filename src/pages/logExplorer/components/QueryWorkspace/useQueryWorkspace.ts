import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import type { GeneratedQuery, QueryWorkspaceAdapter, QueryWorkspaceController } from './types';

interface Options<Metadata> extends QueryWorkspaceAdapter<Metadata> {
  contextKey: string;
}

export default function useQueryWorkspace<Metadata>(options: Options<Metadata>): QueryWorkspaceController<Metadata> {
  const latest = useRef(options);
  latest.current = options;
  const [assistEnabled, setAssistState] = useState(false);
  const assistRef = useRef(false);
  const [preview, setPreview] = useState<GeneratedQuery<Metadata>>();
  const previewRef = useRef<GeneratedQuery<Metadata>>();
  const [dirty, setDirty] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<unknown>();
  const revision = useRef(0);
  const activeRequest = useRef<number>();
  const context = useRef(options.contextKey);

  const invalidate = useCallback(() => {
    revision.current += 1;
    activeRequest.current = undefined;
    setGenerating(false);
    setError(undefined);
  }, []);

  useLayoutEffect(() => {
    if (context.current !== options.contextKey) {
      context.current = options.contextKey;
      invalidate();
      latest.current.resetBuilder();
      previewRef.current = undefined;
      setPreview(undefined);
      setDirty(false);
    }
  }, [options.contextKey, invalidate]);

  useLayoutEffect(
    () => () => {
      revision.current += 1;
      activeRequest.current = undefined;
    },
    [],
  );

  const setAssistEnabled = useCallback(
    (enabled: boolean) => {
      if (assistRef.current === enabled) return;
      invalidate();
      if (!enabled) {
        // Leaving the builder for hand-written SQL: the conversion the preview showed no longer describes what
        // the panel holds, so it goes with the mode instead of greeting the next visit as still converted.
        previewRef.current = undefined;
        setPreview(undefined);
      }
      assistRef.current = enabled;
      setAssistState(enabled);
    },
    [invalidate],
  );

  const enterManual = useCallback(() => setAssistEnabled(false), [setAssistEnabled]);

  const markDirty = useCallback(() => {
    invalidate();
    setDirty(true);
  }, [invalidate]);

  const resetBuilder = useCallback(() => {
    invalidate();
    latest.current.resetBuilder();
    previewRef.current = undefined;
    setPreview(undefined);
    setDirty(false);
  }, [invalidate]);

  const reset = useCallback(() => {
    if (assistRef.current) {
      resetBuilder();
    } else {
      invalidate();
      latest.current.clearStatement();
    }
  }, [invalidate, resetBuilder]);

  const generate = useCallback(async (execute: boolean) => {
    if (activeRequest.current !== undefined || !assistRef.current) return;
    const requestRevision = ++revision.current;
    const requestContext = latest.current.contextKey;
    activeRequest.current = requestRevision;
    setGenerating(true);
    setError(undefined);
    const isCurrent = () => revision.current === requestRevision && latest.current.contextKey === requestContext && assistRef.current;
    let built = false;
    try {
      const result = await latest.current.build();
      built = true;
      if (!isCurrent()) return;
      latest.current.applyGenerated(result);
      previewRef.current = result;
      setPreview(result);
      setDirty(false);
      if (execute && isCurrent()) await latest.current.execute();
    } catch (err) {
      if (isCurrent()) {
        // A build that failed has nothing to preview: drop the statement it was about to replace. An execution
        // failure keeps the statement it just applied.
        if (!built) {
          previewRef.current = undefined;
          setPreview(undefined);
        }
        setError(err);
      }
    } finally {
      if (activeRequest.current === requestRevision) {
        activeRequest.current = undefined;
        setGenerating(false);
      }
    }
  }, []);

  const convert = useCallback(() => generate(false), [generate]);
  const run = useCallback(async () => {
    if (assistRef.current) await generate(true);
    else await latest.current.execute();
  }, [generate]);

  const continueWriting = useCallback(() => {
    if (!previewRef.current) return;
    latest.current.applyGenerated(previewRef.current);
    enterManual();
  }, [enterManual]);

  return { assistEnabled, preview, dirty, generating, error, setAssistEnabled, enterManual, markDirty, reset, resetBuilder, convert, run, continueWriting };
}
