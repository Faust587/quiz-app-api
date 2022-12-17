import { registerDecorator, ValidationOptions } from 'class-validator';
import { QuestionType } from './enum/question-type';

export function IsQuestionType(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsQuestionType',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): boolean {
          return typeof value === 'string' && Object.values(QuestionType).includes(value as QuestionType);
        },
      },
    });
  };
}
