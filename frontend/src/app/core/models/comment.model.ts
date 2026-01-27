export interface Comment {
  id: string;
  content: string;
  blogPostId: string;
  authorId: string;
  author?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
  approved: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateCommentDto {
  content: string;
  blogPostId: string;
}

export interface UpdateCommentDto {
  content?: string;
}
