import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuestionType, QuestionTypeDocument } from './question-type.schema';
import { AuthGuard } from '@nestjs/passport';
import { CreateQuizDto } from './DTO/create-quiz.dto';
import { QuizService } from './quiz.service';
import { Request } from 'express';
import { IJwtPayload } from '../auth/jwt-payload.interface';
import { AddQuestionsDto } from './DTO/add-questions.dto';

@Controller('quiz')
export class QuizController {

  constructor(
    @InjectModel(QuestionType.name) private questionTypeModel: Model<QuestionTypeDocument>,
    private quizService: QuizService,
  ) {}

  @Get('/types')
  async getQuestionTypes() {
    return this.questionTypeModel.find();
  }

  @Post('/create')
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  async createQuiz(@Body() createQuizDto: CreateQuizDto, @Req() req: Request) {
    const { id } = req.user as IJwtPayload;
    const quiz = await this.quizService.createQuiz(createQuizDto, id);
    return quiz;
  }


  @Post('/add-question')
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  async addQuestionToQuiz(@Req() req: Request, @Body() addQuestionDto: AddQuestionsDto) {
    const { id } = req.user as IJwtPayload;
    const {
      quizId,
      questions,
    } = addQuestionDto;

    await this.quizService.checkQuizAuthor(quizId, id);
    return await this.quizService.addQuestionToQuiz(quizId, questions);
  }
}
