export class PostDto {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: number;
}
