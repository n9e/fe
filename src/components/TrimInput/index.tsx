import React from 'react';
import { AutoComplete as AntdAutoComplete, Input } from 'antd';
import type { AutoCompleteProps } from 'antd/lib/auto-complete';
import type { InputProps, InputRef, PasswordProps, TextAreaProps } from 'antd/lib/input';

type Field = HTMLInputElement | HTMLTextAreaElement;

/**
 * Drop-in replacements for antd Input / TextArea / Password / AutoComplete that strip leading and trailing
 * whitespace when the field loses focus (Input and Password also trim on Enter).
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

/**
 * Trims the selected/typed value on blur and reports it through onChange, so Form.Item updates the
 * store and forwards the trimmed value to the caller's own onChange (a Form.Item `normalize` would
 * only change the store). Search keywords are trimmed as typed.
 */
const AutoComplete = React.forwardRef<React.ElementRef<typeof AntdAutoComplete>, AutoCompleteProps>((props, ref) => (
  <AntdAutoComplete
    {...props}
    ref={ref}
    onSearch={props.onSearch && ((value) => props.onSearch?.(value.trim()))}
    onBlur={(e) => {
      const { value } = props;
      if (typeof value === 'string' && value !== value.trim()) props.onChange?.(value.trim(), []);
      props.onBlur?.(e);
    }}
  />
));

const TrimInput = Object.assign(TrimInputBase, { Password, TextArea, AutoComplete });

export default TrimInput;
