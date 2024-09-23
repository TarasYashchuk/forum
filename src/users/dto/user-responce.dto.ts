import { Exclude, Expose } from 'class-transformer';

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
}
