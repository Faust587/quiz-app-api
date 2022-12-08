import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../user/user.schema';
import { Question } from './question.schema';

export type QuizDocument = HydratedDocument<Quiz>;

@Schema()
export class Quiz {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
  })
  author: string;

  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
  })
  code: string;

  @Prop({
    type: Types.ObjectId,
    ref: Question.name,
    required: false,
  })
  questions: Question[];
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
