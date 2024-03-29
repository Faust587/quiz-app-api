import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsQuestionId } from '../question-id.decorator';
export class AnswerDto {
  @IsQuestionId()
  questionId: string;

  @IsOptional()
  @IsString()
  answerText: string;

  @IsOptional()
  @IsNumber()
  answerInt: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  answerArrInt: number[];
}
