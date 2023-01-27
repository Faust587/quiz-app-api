import {
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { IsQuestionId } from 'src/quiz-answer/question-id.decorator';

export class UpdateQuizParametersDto {
  @IsQuestionId({ message: 'quiz id is not valid' })
  quizId: string;

  @IsOptional()
  @IsBoolean()
  closed: boolean;

  @IsOptional()
  @IsBoolean()
  onlyAuthUsers: boolean;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(15)
  name: string;
}
