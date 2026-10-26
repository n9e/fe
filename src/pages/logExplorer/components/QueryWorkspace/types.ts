import type React from 'react';

export interface GeneratedQuery<Metadata> {
  statement: string;
  metadata: Metadata;
}

/** Data-source operations stay outside the workspace, including form validation and result mapping. */
export interface QueryWorkspaceAdapter<Metadata> {
  build: () => Promise<GeneratedQuery<Metadata>>;
  applyGenerated: (result: GeneratedQuery<Metadata>) => void;
  resetBuilder: () => void;
  clearStatement: () => void;
  execute: () => void | Promise<void>;
}

export interface QueryWorkspaceController<Metadata> {
  assistEnabled: boolean;
  preview?: GeneratedQuery<Metadata>;
  dirty: boolean;
  generating: boolean;
  error?: unknown;
  setAssistEnabled: (enabled: boolean) => void;
  enterManual: () => void;
  markDirty: () => void;
  reset: () => void;
  /** Drops the builder configuration and its preview without touching the statement or the assist switch. */
  resetBuilder: () => void;
  convert: () => Promise<void>;
  run: () => Promise<void>;
  continueWriting: () => void;
}

export interface QueryWorkspaceProps {
  assistEnabled: boolean;
  preview?: string;
  dirty: boolean;
  generating: boolean;
  executeLoading?: boolean;
  error?: React.ReactNode;
  languageLabel?: string;
  builderTitle?: React.ReactNode;
  previewTitle?: React.ReactNode;
  darkMode?: boolean;
  builder: React.ReactNode;
  editor: React.ReactNode;
  /** AI triggers, history, and notices can be supplied without coupling the workspace to them. */
  previewExtra?: React.ReactNode;
  previewRef?: React.Ref<HTMLDivElement>;
  below?: React.ReactNode;
  queryButtonRef?: React.Ref<HTMLButtonElement>;
  onAssistChange: (enabled: boolean) => void;
  onReset: () => void;
  onConvert: () => void;
  onExecute: () => void;
  onContinueWriting: () => void;
}
