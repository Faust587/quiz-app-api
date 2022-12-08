import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { QuestionType } from './question-type.schema';

export type QuestionDocument = HydratedDocument<Question>;

@Schema()
export class Question {
  @Prop()
  id: string;

  @Prop({
    type: Types.ObjectId,
    ref: QuestionType.name,
    required: true,
  })
  questionType: QuestionType;

  @Prop({
    required: true,
  })
  value: string[];

  @Prop()
  isRequired: boolean;

  @Prop()
  name: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
