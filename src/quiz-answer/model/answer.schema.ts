import { Prop, Schema } from '@nestjs/mongoose';

@Schema({
  versionKey: true,
})
export class Answer {

  @Prop({ required: true })
  questionId: string;

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
    type: [ Number ],
  })
  answerArrInt: number[];
}
