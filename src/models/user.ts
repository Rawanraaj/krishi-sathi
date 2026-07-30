export type UserRole = 'farmer' | 'buyer';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  createdAt: string;
}
