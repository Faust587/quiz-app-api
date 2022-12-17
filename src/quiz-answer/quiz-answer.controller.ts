import { Body, Controller, Get, Post, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { QuizAnswerService } from './quiz-answer.service';
import { CreateQuizAnswerDto } from './DTO/create-quiz-answer.dto';
import { Request } from 'express';
import { QuizAccessGuard } from './quiz-access.guard';
import { IJwtPayload } from '../auth/jwt-payload.interface';
import { QuizAuthorGuard } from '../quiz/quiz-author.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('quiz-answer')
export class QuizAnswerController {
  constructor(
    private quizAnswerService: QuizAnswerService,
  ) {}

  @Post()
  @UseGuards(QuizAccessGuard)
  @UsePipes(ValidationPipe)
  async createQuizAnswer(
    @Query('code') code: string,
    @Req() req: Request,
    @Body() createQuizAnswerDto: CreateQuizAnswerDto,
  ) {
    const { answers } = createQuizAnswerDto;
    const id = (req.user as IJwtPayload)?.id;
    console.log(id);
    return await this.quizAnswerService.createQuizAnswer(answers, code, id);
  }

  @Get('/list')
  @UseGuards(QuizAuthorGuard)
  @UseGuards(AuthGuard())
  async getAnswersListToQuiz(
    @Query('code') code: string,
  ) {
    return await this.quizAnswerService.getAnswersListByQuizCode(code);
  }
}
