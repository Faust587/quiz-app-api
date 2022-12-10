import { Body, Controller, Delete, Get, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuestionType, QuestionTypeDocument } from './question-type.schema';
import { AuthGuard } from '@nestjs/passport';
import { CreateQuizDto } from './DTO/create-quiz.dto';
import { QuizService } from './quiz.service';
import { Request } from 'express';
import { IJwtPayload } from '../auth/jwt-payload.interface';
import { AddQuestionsDto } from './DTO/add-questions.dto';
import { QuizAuthorGuard } from './quiz-author.guard';
import { DeleteQuizDto } from './DTO/delete-quiz.dto';

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
    return await this.quizService.createQuiz(createQuizDto, id);
  }


  @Post('/add-question')
  @UseGuards(QuizAuthorGuard)
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  async addQuestionToQuiz(@Req() req: Request, @Body() addQuestionDto: AddQuestionsDto) {
    const {
      quizId,
      questions,
    } = addQuestionDto;

    return await this.quizService.addQuestionToQuiz(quizId, questions);
  }

  @Delete()
  @UseGuards(QuizAuthorGuard)
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  async deleteQuiz(@Body() deleteQuizDto: DeleteQuizDto) {
    const { quizId } = deleteQuizDto;

    return await this.quizService.deleteQuizById(quizId);
  }

  @Get('/list')
  @UseGuards(AuthGuard())
  async getQuizzes(@Req() req: Request) {
    const { id } = req.user as IJwtPayload;
    return await this.quizService.getAllQuizzesByAuthor(id);
  }
}
