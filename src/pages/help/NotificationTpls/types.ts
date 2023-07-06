export interface NotifyTplsType {
  id: number;
  name: string;
  channel: string;
  content?: string;
  contact_key: string;
  contact_key_name: string;
  hide_contact: 0 | 1;
  hide_channel: 0 | 1;
  built_in: boolean;
}
