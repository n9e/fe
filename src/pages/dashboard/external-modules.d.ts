declare module 'semver' {
  interface SemverModule {
    coerce(version: string | undefined): string | null;
    gte(version: string, compareTo: string): boolean;
    lt(version: string, compareTo: string): boolean;
    valid(version: string | undefined): string | null;
    gt(version: string, compareTo: string): boolean;
    rcompare(v1: string, v2: string): number;
  }

  const semver: SemverModule;
  export default semver;
}

declare module 'react-beforeunload' {
  export function useBeforeunload(handler?: () => string | void): void;
}

declare module 'react-color' {
  import type { ComponentType } from 'react';

  export interface ColorResult {
    hex: string;
    rgb: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
  }

  export interface SketchPickerProps {
    disableAlpha?: boolean;
    color?: string;
    presetColors?: string[];
    onChange?: (color: ColorResult) => void;
  }

  export const SketchPicker: ComponentType<SketchPickerProps>;
}
