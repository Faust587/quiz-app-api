import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Answer } from './answer.schema';

export type QuizAnswerDocument = HydratedDocument<QuizAnswer>;

@Schema({
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
    },
  },
  toObject: {
    transform: (doc, ret) => {
      ret.id = ret._id.toHexString();
      delete ret._id;
    },
  },
  versionKey: false,
})
export class QuizAnswer {
  @Prop({ required: true })
  quizId: string;

  @Prop({ required: false })
  authorId: string;

  @Prop({ required: true })
  answers: Answer[];
}

export const QuizAnswerSchema = SchemaFactory.createForClass(QuizAnswer);
