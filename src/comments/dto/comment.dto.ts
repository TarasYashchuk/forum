import { Expose, Type } from 'class-transformer';
import { UserDto } from 'src/users/dto/user-responce.dto';

export class CommentDto {
  @Expose()
  id: number;

  @Expose()
  content: string;

  @Type(() => UserDto)
  @Expose()
  user: UserDto;
}
