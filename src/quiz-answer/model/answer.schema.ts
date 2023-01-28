import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AnswerDocument = HydratedDocument<Answer>;

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
})
export class Answer {
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

  @Prop({
    required: true,
  })
  index: number;

  @Prop({
    required: false,
    type: String,
  })
  answerText: string;

  @Prop({
    required: false,
    type: Number,
  })
  answerInt: number;

  @Prop({
    required: false,
    type: [Number],
  })
  answerArrInt: number[];
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);
