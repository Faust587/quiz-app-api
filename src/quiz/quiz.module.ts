import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionType, QuestionTypeSchema } from './question-type.schema';
import { AuthModule } from '../auth/auth.module';
import { CodeGeneratorService } from './code-generator.service';
import { Quiz, QuizSchema } from './quiz.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: QuestionType.name,
        schema: QuestionTypeSchema,
      },
      {
        name: Quiz.name,
        schema: QuizSchema,
      },
    ]),
    AuthModule,
  ],
  providers: [ QuizService, CodeGeneratorService ],
  controllers: [ QuizController ],
})
export class QuizModule {
}
