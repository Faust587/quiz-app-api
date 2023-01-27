import { IsArray, IsBoolean, IsString } from 'class-validator';
import { IsQuestionType } from '../question-type.decorator';
import { QuestionValue } from '../question-value.decorator';
import { IsQuestionId } from '../../quiz-answer/question-id.decorator';

export class EditQuestionDto {
  @IsQuestionId({ message: 'question id is not valid' })
  questionId: string;

  @IsQuestionId({ message: 'quiz id is not valid' })
  quizId: string;

  @IsString()
  name: string;

  @IsQuestionType({
    message: 'This question type is not exists',
  })
  type: string;

  @IsArray()
  @QuestionValue('type', {
    message: 'Question with this type must have a value',
  })
  @IsString({ each: true })
  value: string[];

  @IsBoolean()
  isRequired: boolean;
}
