import { forwardRef, Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from './question.schema';
import { QuestionController } from './question.controller';
import { QuizModule } from '../quiz/quiz.module';
import { AuthModule } from '../auth/auth.module';
import { Quiz, QuizSchema } from '../quiz/quiz.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Question.name,
        schema: QuestionSchema,
      },
      {
        name: Quiz.name,
        schema: QuizSchema,
      },
    ]),
    AuthModule,
    forwardRef(() => QuizModule),
  ],
  providers: [QuestionService],
  exports: [QuestionService],
  controllers: [QuestionController],
})
export class QuestionModule {}
