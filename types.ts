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