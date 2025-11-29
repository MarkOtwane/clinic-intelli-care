export interface Blog {
  id: string;
  title: string;
  content: string;
  imageIds?: string[];
  published: boolean;
  authorId: string;
  authorName?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
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
