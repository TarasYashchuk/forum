import { Exclude, Expose, Type } from 'class-transformer';
import { LikeDto } from './like.dto';

export class PostDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  imageUrl?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  authorId: number;

  @Expose()
  @Type(() => LikeDto)
  likes: LikeDto[];
}
