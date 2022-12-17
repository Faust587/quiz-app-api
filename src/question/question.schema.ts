import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type QuestionDocument = HydratedDocument<Question>;

@Schema()
export class Question {
  @Prop({
    required: true,
  })
  type: string;

  @Prop({
    required: false,
  })
  value: string[];

  @Prop({
    default: false,
  })
  isRequired: boolean;

  @Prop({
    required: true,
  })
  name: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
