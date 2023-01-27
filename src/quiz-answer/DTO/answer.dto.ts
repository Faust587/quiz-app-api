import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsQuestionId } from '../question-id.decorator';
import { IsQuestionType } from '../../question/question-type.decorator';
import { QuestionValue } from '../../question/question-value.decorator';

export class AnswerDto {
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

  @IsNumber()
  index: number;

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
