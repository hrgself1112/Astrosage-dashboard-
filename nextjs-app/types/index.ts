// Document types
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
  id?: string;
  email: string;
  details?: {
    [language: string]: {
      uniqueFindingKey: string;
      uniqueKey: string;
      [key: string]: any;
    };
  } | Record<string, any>;
}

// Admin Panel Types
export type UserRole = 'admin' | 'editor' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastActiveAt: string;
  createdBy?: string;
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

// Background Removal Types
export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  result?: string;
  error?: string;
  progress?: number;
}

export interface BackgroundRemovalResult {
  id: string;
  filename: string;
  originalUrl: string;
  processedUrl: string;
  model: string;
  processingTime: number;
  fileSize: number;
}

// Next.js 16+ Types
export interface PageProps<T = {}> {
  params?: Promise<T>;
  searchParams?: Promise<Record<string, string | string[]>>;
}

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// UI Component Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

// Firebase Types
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Server Actions Types
export interface ServerActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// React Query Types
export interface UseQueryOptions<T = any> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

// Component Library Types
export interface ComponentVariants<T extends Record<string, any>> {
  base: string;
  variants: T;
  defaultVariants?: Partial<T>;
}

// Animation Types
export interface AnimationProps {
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  whileHover?: any;
  whileTap?: any;
}

// Form Types (for React Hook Form)
export interface FormFieldProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Chart Types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

// Table Types
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string | number;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

// Export all types for easy importing
export type {
  // React types
  ReactNode,
  ReactElement,
  ComponentType,
  FC,
  PropsWithChildren,
} from 'react';