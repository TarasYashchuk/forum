import { Expose } from 'class-transformer';

export class FollowerDto {
  @Expose()
  id: number;

  @Expose()
  username: string;
}
