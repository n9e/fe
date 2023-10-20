export interface VariableConfig {
  ckey: string;
  cval: string;
  note: string;
  encrypted: 0 | 1;
}

export interface RASConfig {
  OpenRSA: boolean;
  RSAPublicKey: string;
}
