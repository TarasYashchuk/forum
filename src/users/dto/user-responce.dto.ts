import { Exclude, Expose, Type } from 'class-transformer';
import { PostDto } from 'src/posts/dto/post/post.dto';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Exclude()
  password?: string;

  @Expose()
  firstName?: string;

  @Expose()
  lastName?: string;

  @Expose()
  avatarUrl?: string;

  @Expose()
  bio?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  roleId: number;

  @Expose()
  @Type(() => PostDto)
  posts?: PostDto[];
}
