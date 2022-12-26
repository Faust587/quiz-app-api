import { Module } from '@nestjs/common';
import { QuizIconController } from './quiz-icon.controller';
import { QuizIconService } from './quiz-icon.service';

@Module({
  controllers: [QuizIconController],
  providers: [QuizIconService]
})
export class QuizIconModule {}
