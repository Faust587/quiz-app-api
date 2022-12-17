import { registerDecorator, ValidationOptions } from 'class-validator';
import { Types } from 'mongoose';

export function IsQuestionId(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsQuestionId',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): boolean {
          return typeof value === 'string' && Types.ObjectId.isValid(value);
        },
      },
    });
  };
}
