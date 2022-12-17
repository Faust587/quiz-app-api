import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from './question.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Question.name,
        schema: QuestionSchema,
      },
    ]),
  ],
  providers: [ QuestionService ],
  exports: [ QuestionService ],
})
export class QuestionModule {
}
