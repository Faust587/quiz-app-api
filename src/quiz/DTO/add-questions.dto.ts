import { IsArray, ValidateNested } from 'class-validator';
import { QuestionDto } from '../../question/DTO/question.dto';
import { Type } from 'class-transformer';

export class AddQuestionsDto {
  @ValidateNested()
  @IsArray()
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}
