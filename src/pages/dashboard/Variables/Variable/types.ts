import { IVariable } from '../types';

export interface Props {
  disabled: boolean;
  hide: boolean;
  item: IVariable;
  variableValueFixed: boolean;
  value: IVariable['value'];
  setValue: React.Dispatch<React.SetStateAction<IVariable['value']>>;
}
