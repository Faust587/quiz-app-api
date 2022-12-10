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
    type: String
  })
  name: string;

  @Prop({
    required: true,
    type: Boolean
  })
  closed: boolean;

  @Prop({
    required: true,
    type: Boolean
  })
  onlyAuthUsers: boolean;

  @Prop({
    required: true,
    type: String,
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
