import { IsQuestionId } from '../../quiz-answer/question-id.decorator';

export class DeleteQuestionDto {
  @IsQuestionId({ message: 'question id is not valid' })
  questionId: string;

  @IsQuestionId({ message: 'quiz id is not valid' })
  quizId: string;
}
