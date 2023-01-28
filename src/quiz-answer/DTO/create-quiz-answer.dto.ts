import { AnswerDto } from './answer.dto';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuizAnswerDto {
  @ValidateNested()
  @IsArray()
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
