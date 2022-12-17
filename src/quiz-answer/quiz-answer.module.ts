import { Module } from '@nestjs/common';
import { QuizAnswerService } from './quiz-answer.service';
import { QuizAnswerController } from './quiz-answer.controller';
import { TokenModule } from '../token/token.module';
import { QuizModule } from '../quiz/quiz.module';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizAnswer, QuizAnswerSchema } from './model/quiz-answer.schema';
import { QuestionModule } from '../question/question.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: QuizAnswer.name,
        schema: QuizAnswerSchema,
      },
    ]),
    QuizModule,
    TokenModule,
    QuestionModule,
    AuthModule
  ],
  providers: [ QuizAnswerService ],
  controllers: [ QuizAnswerController ],
})
export class QuizAnswerModule {
}
