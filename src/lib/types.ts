
import { Timestamp } from 'firebase/firestore';

export interface Site {
  id: string;
  region: string;
  regionType: '주거' | '상업' | '공업' | '민감' | string;
  siteName: string;
  phase: string | string[]; // Array to support multiple selections, string kept for backward compatibility
  completedCount: number;
  inProgressCount: number;
  mainContent: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  order: number;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  name?: string;
  role: 'admin' | 'manager';
  approved: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
