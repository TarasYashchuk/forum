import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserSearchDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  firstName?: string;

  @Expose()
  lastName?: string;

  @Expose()
  avatarUrl?: string;

  @Expose()
  bio?: string;
}
