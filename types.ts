export interface Author {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Document {
  id?: string;
  title: string;
  seoTitle?: string;
  snippet: string;
  status: 'READY TO PUBLISH' | 'DRAFT';
  visibility: 'PRIVATE' | 'PUBLIC';
  lastUpdated: string;
  content?: string;
  url?: string;
  keywords?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  h1?: string;
  authorId?: string;
  faqRaw?: string;
  faqHtml?: string;
  ownerId: string;
  accessList: string[];
}

export interface Panelist {
  id?: string; // This will be the Firebase Auth UID
  email: string;
  // Password is not stored in Firestore, it's handled by Firebase Auth
  details?: {
    [language: string]: {
      uniqueFindingKey: string;
      uniqueKey: string;
      [key: string]: any; // for other properties like profilename, profileUrl etc.
    };
  } | Record<string, any>;
}

// Admin Panel Types
export type UserRole = 'admin' | 'editor' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string; // Firebase Auth UID
  email: string;
  displayName?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastActiveAt: string;
  createdBy?: string; // admin user ID who created this user
  permissions?: RolePermissions;
}

export interface RolePermissions {
  canManageUsers: boolean;
  canManageDocuments: boolean;
  canManagePanelists: boolean;
  canViewAuditLogs: boolean;
  canManageSystem: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface UserFilters {
  search: string;
  role: UserRole | 'all';
  status: UserStatus | 'all';
  sortBy: 'name' | 'email' | 'role' | 'status' | 'createdAt' | 'lastActiveAt';
  sortOrder: 'asc' | 'desc';
}

export interface AuditLogFilters {
  userId?: string;
  action: string;
  dateRange: {
    start: string;
    end: string;
  };
  searchTerm: string;
}