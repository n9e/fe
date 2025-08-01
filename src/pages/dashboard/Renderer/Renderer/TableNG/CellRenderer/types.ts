export interface TextObject {
  stat: number;
  value: string | number;
  unit?: string;
  color: string;
  text: string;
  valueDomain: [number, number];
}
