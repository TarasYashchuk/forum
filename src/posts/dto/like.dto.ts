import { Expose } from 'class-transformer';

export class LikeDto {
  @Expose()
  userId: number;
}
