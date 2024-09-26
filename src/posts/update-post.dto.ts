import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  title?: string;

  @IsString()
  content?: string;

  @IsString()
  imageUrl?: string;
}
