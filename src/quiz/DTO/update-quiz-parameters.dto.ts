import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateQuizParametersDto {
  @IsOptional()
  @IsBoolean()
  closed: boolean;

  @IsOptional()
  @IsBoolean()
  onlyAuthUsers: boolean;

  @IsOptional()
  @IsString()
  name: string;
}
