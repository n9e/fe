import { IVariable } from '../types';

export interface Props {
  item: IVariable;
  onChange: (update: { [key: string]: any }) => void;
  data: Record<string, any>;
  formatedReg?: string;
  formatedRegex?: string;
  variableValueFixed: boolean;
  value: IVariable['value'];
  setValue: React.Dispatch<React.SetStateAction<IVariable['value']>>;
}
