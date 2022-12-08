import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class QuestionDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsArray()
  @IsString({ each: true })
  value: string[];

  @IsBoolean()
  isRequired: boolean;
}
