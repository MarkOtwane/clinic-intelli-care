import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MediaFile, MediaType, UploadResponse, UploadOptions } from '../models/media.model';

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  file?: MediaFile;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private readonly apiUrl = '/api/media';

  constructor(private http: HttpClient) {}

  /**
   * Upload a single file
   */
  uploadFile(file: File, type: MediaType, options?: UploadOptions): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    if (options?.folder) formData.append('folder', options.folder);
    if (options?.publicId) formData.append('publicId', options.publicId);
    if (options?.tags) formData.append('tags', JSON.stringify(options.tags));

    return this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = Math.round(100 * event.loaded / (event.total || 1));
            return { progress, status: 'uploading' as const };
            
          case HttpEventType.Response:
            const response = event.body;
            const mediaFile: MediaFile = {
              id: response.publicId,
              userId: '', // Will be set by backend
              fileName: file.name,
              originalName: file.name,
              mimeType: file.type,
              size: file.size,
              url: response.secureUrl,
              publicId: response.publicId,
              folder: options?.folder,
              type: type,
              tags: options?.tags || [],
              isPublic: false,
              createdAt: new Date()
            };
            return { progress: 100, status: 'completed' as const, file: mediaFile };
            
          default:
            return { progress: 0, status: 'uploading' as const };
        }
      })
    );
  }

  /**
   * Upload multiple files
   */
  uploadMultipleFiles(
    files: File[], 
    type: MediaType, 
    options?: UploadOptions
  ): Observable<UploadProgress[]> {
    const uploads = files.map(file => this.uploadFile(file, type, options));
    
    return new Observable(observer => {
      const results: UploadProgress[] = [];
      let completed = 0;
      
      uploads.forEach((upload, index) => {
        upload.subscribe({
          next: (progress) => {
            results[index] = progress;
            
            if (progress.status === 'completed' || progress.status === 'error') {
              completed++;
              if (completed === files.length) {
                observer.next(results);
                observer.complete();
              }
            }
          },
          error: (error) => {
            results[index] = { progress: 0, status: 'error', error: error.message };
            completed++;
            
            if (completed === files.length) {
              observer.next(results);
              observer.complete();
            }
          }
        });
      });
    });
  }

  /**
   * Delete a file
   */
  deleteFile(publicId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${publicId}`);
  }

  /**
   * Get file metadata
   */
  getFile(publicId: string): Observable<MediaFile> {
    return this.http.get<MediaFile>(`${this.apiUrl}/${publicId}`);
  }

  /**
   * List user files
   */
  getUserFiles(userId: string, type?: MediaType): Observable<MediaFile[]> {
    if (type) {
      return this.http.get<MediaFile[]>(`${this.apiUrl}/user/${userId}?type=${type}`);
    }
    return this.http.get<MediaFile[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Update file metadata
   */
  updateFile(publicId: string, updates: Partial<MediaFile>): Observable<MediaFile> {
    return this.http.patch<MediaFile>(`${this.apiUrl}/${publicId}`, updates);
  }

  /**
   * Generate thumbnail
   */
  generateThumbnail(publicId: string, width = 150, height = 150): string {
    // This would typically use Cloudinary's transformation URL
    // For now, return a basic URL structure
    return `https://res.cloudinary.com/demo/image/upload/c_thumb,w_${width},h_${height}/${publicId}`;
  }

  /**
   * Resize image
   */
  resizeImage(publicId: string, width: number, height: number): string {
    return `https://res.cloudinary.com/demo/image/upload/c_fill,w_${width},h_${height}/${publicId}`;
  }

  /**
   * Convert image format
   */
  convertImageFormat(publicId: string, format: 'jpg' | 'png' | 'webp'): string {
    return `https://res.cloudinary.com/demo/image/upload/f_${format}/${publicId}`;
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, type: MediaType): { isValid: boolean; error?: string } {
    // File size limits (in bytes)
    const sizeLimits = {
      [MediaType.AVATAR]: 5 * 1024 * 1024, // 5MB
      [MediaType.MEDICAL_REPORT]: 10 * 1024 * 1024, // 10MB
      [MediaType.BLOG_IMAGE]: 5 * 1024 * 1024, // 5MB
      [MediaType.PRESCRIPTION_IMAGE]: 5 * 1024 * 1024, // 5MB
      [MediaType.GENERAL]: 2 * 1024 * 1024 // 2MB
    };

    // Allowed MIME types
    const allowedTypes = {
      [MediaType.AVATAR]: ['image/jpeg', 'image/png', 'image/webp'],
      [MediaType.MEDICAL_REPORT]: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      [MediaType.BLOG_IMAGE]: ['image/jpeg', 'image/png', 'image/webp'],
      [MediaType.PRESCRIPTION_IMAGE]: ['image/jpeg', 'image/png', 'image/webp'],
      [MediaType.GENERAL]: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    };

    const maxSize = sizeLimits[type];
    const types = allowedTypes[type];

    if (file.size > maxSize) {
      return { 
        isValid: false, 
        error: `File size must be less than ${maxSize / (1024 * 1024)}MB` 
      };
    }

    if (!types.includes(file.type)) {
      return { 
        isValid: false, 
        error: 'File type not supported' 
      };
    }

    return { isValid: true };
  }

  /**
   * Get file extension from MIME type
   */
  getFileExtension(mimeType: string): string {
    const extensions: { [key: string]: string } = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'application/pdf': '.pdf'
    };
    return extensions[mimeType] || '';
  }

  /**
   * Compress image before upload
   */
  compressImage(file: File, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        }, file.type, quality);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}