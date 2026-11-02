import React from 'react';
import { Input } from 'antd';
import type { InputProps, InputRef, PasswordProps, TextAreaProps } from 'antd/lib/input';

type Field = HTMLInputElement | HTMLTextAreaElement;

/**
 * Drop-in replacements for antd Input / TextArea / Password that strip leading and trailing
 * whitespace when the field loses focus (and on Enter for single-line inputs).
 * Trimming on change would make inner spaces impossible to type, so it is deferred to blur.
 * Use for names, URLs, keys and identifiers — not for free text, queries or separators.
 * Use inside Form.Item or with a controlled `value`: the trimmed value is reported through onChange.
 */
function trim<T extends Field>(e: React.SyntheticEvent<T>, onChange?: (e: React.ChangeEvent<T>) => void) {
  const el = e.target as T;
  const trimmed = el.value.trim();
  if (trimmed === el.value) return;
  el.value = trimmed;
  onChange?.(e as unknown as React.ChangeEvent<T>);
}

/**
 * Form.Item `normalize` for controls that cannot take TrimInput (AutoComplete). It trims on every
 * change, so only use it for identifiers that never contain spaces (table, index, topic names).
 */
export const trimNormalize = (value?: string) => (typeof value === 'string' ? value.trim() : value);

/** Single-line inputs also trim on Enter, which runs before an implicit form submit. */
function withTrim<P extends InputProps>(props: P): P {
  return {
    ...props,
    onBlur: (e) => {
      trim(e, props.onChange);
      props.onBlur?.(e);
    },
    onPressEnter: (e) => {
      trim(e, props.onChange);
      props.onPressEnter?.(e);
    },
  };
}

const TrimInputBase = React.forwardRef<InputRef, InputProps>((props, ref) => <Input {...withTrim(props)} ref={ref} />);

const Password = React.forwardRef<InputRef, PasswordProps>((props, ref) => <Input.Password {...withTrim(props)} ref={ref} />);

const TextArea = React.forwardRef<React.ElementRef<typeof Input.TextArea>, TextAreaProps>((props, ref) => (
  <Input.TextArea
    {...props}
    ref={ref}
    onBlur={(e) => {
      trim(e, props.onChange);
      props.onBlur?.(e);
    }}
  />
));

const TrimInput = Object.assign(TrimInputBase, { Password, TextArea });

export default TrimInput;
