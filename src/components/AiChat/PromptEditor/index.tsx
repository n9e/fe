import React from 'react';
import { Mentions } from 'antd';

export interface PromptReference {
  id: string;
  name: string;
  type: string;
  [key: string]: any;
}

export interface PromptEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  references?: PromptReference[];
  onReferencesChange?: (references: PromptReference[]) => void;
  variableNames: string[];
}

/** The enterprise integration replaces this component with FlashAI's reference editor. */
export default function PromptEditor({ value, onChange, variableNames }: PromptEditorProps) {
  return (
    <Mentions prefix='$' rows={3} value={value} onChange={onChange}>
      {variableNames.map((name) => (
        <Mentions.Option key={name} value={name}>
          {name}
        </Mentions.Option>
      ))}
    </Mentions>
  );
}
