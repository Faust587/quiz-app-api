import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotAcceptableException,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateQuizDto } from './DTO/create-quiz.dto';
import { QuizService } from './quiz.service';
import { Request } from 'express';
import { IJwtPayload } from '../auth/jwt-payload.interface';
import { AddQuestionsDto } from './DTO/add-questions.dto';
import { QuizAuthorGuard } from './quiz-author.guard';
import { TokenService } from '../token/token.service';
import { QuestionService } from '../question/question.service';
import { UpdateQuizParametersDto } from './DTO/update-quiz-parameters.dto';

@Controller('quiz')
export class QuizController {
  constructor(
    private quizService: QuizService,
    private tokenService: TokenService,
    private questionService: QuestionService,
  ) {}

  @Post('/create')
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  async createQuiz(@Body() createQuizDto: CreateQuizDto, @Req() req: Request) {
    const { id } = req.user as IJwtPayload;
    return await this.quizService.createQuiz(createQuizDto, id);
  }

  @Put('update-quiz-parameters')
  @UseGuards(QuizAuthorGuard)
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  async updateQuizParameters(
    @Query('code') code: string,
    @Body() updateQuizParametersDto: UpdateQuizParametersDto,
  ) {
    if (!code) throw new BadRequestException('Code is undefined');
    const {
      onlyAuthUsers,
      closed,
      name
    } = updateQuizParametersDto;
    return this.quizService.updateQuizParameters(code, onlyAuthUsers, closed, name);
  }

  @Get('/refresh-quiz-code')
  @UseGuards(QuizAuthorGuard)
  @UseGuards(AuthGuard())
  async generateNewQuizCode(
    @Query('code') code: string,
  ) {
    if (!code) throw new BadRequestException('Code is undefined');
    return this.quizService.refreshQuizCode(code);
  }

  @Post('/add-questions')
  @UseGuards(QuizAuthorGuard)
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  async addQuestionToQuiz(
    @Req() req: Request,
    @Query('code') code: string,
    @Body() addQuestionDto: AddQuestionsDto,
  ) {
    const { questions } = addQuestionDto;
    return await this.quizService.addQuestionToQuiz(code, questions);
  }

  @Delete()
  @UseGuards(QuizAuthorGuard)
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  async deleteQuiz(@Query('code') code: string) {
    return await this.quizService.deleteQuizByCode(code);
  }

  @Get('/list')
  @UseGuards(AuthGuard())
  async getQuizzes(@Req() req: Request) {
    const { id } = req.user as IJwtPayload;
    return await this.quizService.getAllQuizzesByAuthor(id);
  }

  @Post('/test')
  @UseGuards(QuizAuthorGuard)
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  async test(
    @Query('code') code: string,
    @Body() addQuestionDto: AddQuestionsDto,
  ) {
    const { questions } = addQuestionDto;
    return this.questionService.createQuestions(questions);
  }

  @Get()
  @UsePipes(ValidationPipe)
  async getQuiz(
    @Req() req: Request,
    @Query('code') code: string,
  ) {
    const quiz = await this.quizService.getQuizByCode(code);
    if (!quiz) throw new BadRequestException('quiz with this code is not exists');
    if (!quiz.onlyAuthUsers) return quiz;


    const { authorization } = req.headers;
    if (!authorization) throw new UnauthorizedException('This quiz only for registered users');
    const accessToken = authorization.split('Bearer ')[1];
    this.tokenService.checkAccessToken(accessToken);
    const { id } = this.tokenService.getPayloadFromToken(accessToken);
    if (quiz.author === id) return quiz;

    if (quiz.closed) throw new NotAcceptableException('This quiz is closed by author');

    return quiz;
  }
}
