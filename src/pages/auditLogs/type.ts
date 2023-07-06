export interface AuditLog {
  id: string;
  username: string;
  event: string;
  comment: string;
  create_at: number;
}