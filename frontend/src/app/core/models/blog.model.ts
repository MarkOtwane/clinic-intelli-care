export interface BlogPost {
  id: string;
  authorId: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  featuredImage?: string;
  status: BlogStatus;
  category: BlogCategory;
  views: number;
  likes: number;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    specialty?: string;
  };
}

export enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum BlogCategory {
  HEALTH_TIPS = 'HEALTH_TIPS',
  DISEASE_AWARENESS = 'DISEASE_AWARENESS',
  PREVENTION = 'PREVENTION',
  TREATMENT = 'TREATMENT',
  LIFESTYLE = 'LIFESTYLE',
  MEDICAL_NEWS = 'MEDICAL_NEWS'
}

export interface CreateBlogPostRequest {
  title: string;
  content: string;
  excerpt?: string;
  tags: string[];
  category: BlogCategory;
  featuredImage?: string;
}

export interface Comment {
  id: string;
  blogPostId: string;
  authorId: string;
  content: string;
  isApproved: boolean;
  parentId?: string;
  replies?: Comment[];
  createdAt: Date;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface CreateCommentRequest {
  blogPostId: string;
  content: string;
  parentId?: string;
}