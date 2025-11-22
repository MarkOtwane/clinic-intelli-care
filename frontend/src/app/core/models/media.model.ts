export interface MediaFile {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  publicId?: string;
  folder?: string;
  type: MediaType;
  description?: string;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
}

export enum MediaType {
  AVATAR = 'AVATAR',
  MEDICAL_REPORT = 'MEDICAL_REPORT',
  BLOG_IMAGE = 'BLOG_IMAGE',
  PRESCRIPTION_IMAGE = 'PRESCRIPTION_IMAGE',
  GENERAL = 'GENERAL'
}

export interface UploadResponse {
  url: string;
  publicId: string;
  secureUrl: string;
}

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
  transformation?: any;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset?: string;
}