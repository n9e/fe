export interface EmbeddedProductParams {
  id: number;
  name: string;
  url: string;
  is_private: boolean;
  team_ids: number[];
  weight: number;
}
export interface EmbeddedProductResponse {
  id: number;
  name: string;
  url: string;
  is_private: boolean;
  team_ids: number[];
  weight: number;
  create_at: number;
  update_at: number;
  create_by: string;
  update_by: string;
}
