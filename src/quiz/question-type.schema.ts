import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type QuestionTypeDocument = HydratedDocument<QuestionType>;

@Schema()
export class QuestionType {
  @Prop()
  id: string;

  @Prop()
  name: string;
}

export const QuestionTypeSchema = SchemaFactory.createForClass(QuestionType);
