import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Answer } from './answer.schema';
import { Quiz } from '../../quiz/quiz.schema';
import { User } from '../../user/model/user.schema';

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
  @Prop({ required: true, ref: Quiz.name })
  quizId: string;

  @Prop({ required: false, ref: User.name })
  authorId: string;

  @Prop({ required: true, ref: Answer.name })
  answers: string[];

  @Prop({
    required: true,
    type: Number,
  })
  answeredAt: number;
}

export const QuizAnswerSchema = SchemaFactory.createForClass(QuizAnswer);
