import { IsQuestionId } from '../../quiz-answer/question-id.decorator';
import { IsNumber } from 'class-validator';

export class ChangeQuestionOrderDto {
  @IsQuestionId({ message: 'quiz id is not valid' })
  quizId: string;

  @IsQuestionId({ message: 'question id is not valid' })
  questionId: string;

  @IsNumber()
  questionNewIndex: number;
}
