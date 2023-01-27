import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';
import { IsQuestionType } from '../question-type.decorator';
import { QuestionValue } from '../question-value.decorator';

export class QuestionDto {
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
}
