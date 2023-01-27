import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { QuestionType } from './enum/question-type';

export function QuestionValue(
  property: string,
  validationOptions?: ValidationOptions,
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'QuestionValue',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          if (
            relatedValue === QuestionType.FLAG ||
            relatedValue === QuestionType.SELECT ||
            relatedValue === QuestionType.OPTION
          )
            return (value as string[]).length > 0;
          return true;
        },
      },
    });
  };
}
