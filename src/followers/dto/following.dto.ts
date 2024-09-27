import { Expose } from 'class-transformer';

export class FollowingDto {
  @Expose()
  id: number;

  @Expose()
  username: string;
}
