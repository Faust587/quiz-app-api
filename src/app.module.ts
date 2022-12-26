import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { QuizModule } from './quiz/quiz.module';
import { QuizAnswerModule } from './quiz-answer/quiz-answer.module';
import { QuestionModule } from './question/question.module';
import { QuizIconModule } from './quiz-icon/quiz-icon.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    MongooseModule.forRoot(`${ process?.env.MONGO_DB_URI }`),
    AuthModule,
    TokenModule,
    QuizModule,
    QuizAnswerModule,
    QuestionModule,
    QuizIconModule,
  ],
})
export class AppModule {
}
