export interface BlogImage {
  id: string;
  url: string;
  publicId: string;
}

export interface BlogAuthor {
  id: string;
  name?: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  imageIds?: string[];
  images?: BlogImage[];
  published: boolean;
  authorId: string;
  author?: BlogAuthor;
  createdAt: string | Date;
  updatedAt: string | Date;
  publishedAt?: string | Date;
}

export interface CreateBlogDto {
  title: string;
  content: string;
  imageIds?: string[];
  published?: boolean;
}

export interface UpdateBlogDto extends Partial<CreateBlogDto> {
  published?: boolean;
}
