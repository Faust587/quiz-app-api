import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type QuestionDocument = HydratedDocument<Question>;

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

  @Prop({
    required: true,
  })
  index: number;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
