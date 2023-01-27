import { forwardRef, Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { CodeGeneratorService } from './code-generator.service';
import { Quiz, QuizSchema } from './quiz.schema';
import { TokenModule } from '../token/token.module';
import { Question, QuestionSchema } from '../question/question.schema';
import { QuestionModule } from '../question/question.module';
import { QuizIconModule } from '../quiz-icon/quiz-icon.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Quiz.name,
        schema: QuizSchema,
      },
      {
        name: Question.name,
        schema: QuestionSchema,
      },
    ]),
    AuthModule,
    TokenModule,
    QuizIconModule,
    forwardRef(() => QuestionModule),
  ],
  providers: [QuizService, CodeGeneratorService],
  controllers: [QuizController],
  exports: [QuizService],
})
export class QuizModule {}
