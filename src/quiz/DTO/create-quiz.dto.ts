import { IsBoolean, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateQuizDto {
  @IsString()
  @MinLength(3)
  @MaxLength(15)
  name: string;

  @IsBoolean()
  onlyAuthUsers: boolean;
}
