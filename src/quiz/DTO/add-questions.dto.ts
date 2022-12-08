import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { QuestionDto } from './question.dto';
import { Type } from 'class-transformer';

export class AddQuestionsDto {
  @IsNotEmpty()
  @IsString()
  quizId: string;

  @ValidateNested()
  @IsArray()
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}
