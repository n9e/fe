import { IVariable } from '../types';

export interface Props {
  item: IVariable;
  variableValueFixed: boolean;
  value: IVariable['value'];
  setValue: React.Dispatch<React.SetStateAction<IVariable['value']>>;
}
