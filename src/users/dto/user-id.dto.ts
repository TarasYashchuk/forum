import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class UserIdDto {
  @Type(() => Number)
  @IsInt({ message: 'User ID must be an integer' })
  id: number;
}
