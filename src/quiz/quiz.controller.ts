import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotAcceptableException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { CreateQuizDto } from './DTO/create-quiz.dto';
import { QuizService } from './quiz.service';
import { Request } from 'express';
import { IJwtPayload } from '../auth/jwt-payload.interface';
import { AddQuestionsDto } from './DTO/add-questions.dto';
import { QuizAuthorGuard } from './quiz-author.guard';
import { TokenService } from '../token/token.service';
import { UpdateQuizParametersDto } from './DTO/update-quiz-parameters.dto';
import { QuizIconService } from '../quiz-icon/quiz-icon.service';

@Controller('quiz')
export class QuizController {
  constructor(
    private quizService: QuizService,
    private tokenService: TokenService,
    private quizIconService: QuizIconService,
  ) {}

  @Post('/create')
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  async createQuiz(@Body() createQuizDto: CreateQuizDto, @Req() req: Request) {
    const { id } = req.user as IJwtPayload;
    const { host } = req.headers;
    if (!host) throw new InternalServerErrorException('HOST IS UNDEFINED');
    const { iconURL } = createQuizDto;
    const iconsList = await this.quizIconService.getIconsList(host);
    const isIconUrlExists = !!iconsList.filter((value) => value === iconURL)
      .length;
    if (!isIconUrlExists)
      throw new BadRequestException('This icons is not exists');
    return await this.quizService.createQuiz(createQuizDto, id);
  }

  @Put('update-quiz-parameters')
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  async updateQuizParametersById(
    @Body() updateQuizParametersDto: UpdateQuizParametersDto,
    @Req() req: Request,
  ) {
    const { quizId, onlyAuthUsers, closed, name } = updateQuizParametersDto;
    const quiz = await this.quizService.getQuizById(quizId);
    const { id } = req.user as IJwtPayload;
    if (quiz.author !== id)
      throw new NotAcceptableException('You are not the author of this quiz');
    return this.quizService.updateQuizParameters(
      quizId,
      onlyAuthUsers,
      closed,
      name,
    );
  }

  @Get('/refresh-quiz-code')
  @UseGuards(QuizAuthorGuard)
  @UseGuards(AuthGuard())
  async generateNewQuizCode(@Query('code') code: string) {
    if (!code) throw new BadRequestException(['Code is undefined']);
    return this.quizService.refreshQuizCode(code);
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

  @Get()
  @UsePipes(ValidationPipe)
  async getQuizByCode(@Req() req: Request, @Query('code') code: string) {
    const quiz = await this.quizService.getQuizByCode(code);
    if (!quiz)
      throw new BadRequestException('quiz with this code is not exists');

    if (quiz.onlyAuthUsers) {
      const { authorization } = req.headers;
      if (!authorization)
        throw new UnauthorizedException('This quiz only for registered users');
      const accessToken = authorization.split('Bearer ')[1];
      this.tokenService.checkAccessToken(accessToken);
    }
    if (quiz.closed)
      throw new NotAcceptableException('This quiz is closed by author');
    return quiz;
  }
  /**
   * When user want to edit his own quiz
   * @param req User Request
   * @param quizId quiz id which user want to get for editing
   */
  @Get('constructor/:id')
  async getQuizById(@Req() req: Request, @Param('id') quizId: string) {
    if (!Types.ObjectId.isValid(quizId))
      throw new BadRequestException('quiz id is not correct...');
    const quiz = await this.quizService.getQuizById(quizId);
    if (!quiz)
      throw new BadRequestException('quiz with this id does not exists');
    const { authorization } = req.headers;
    if (!authorization)
      throw new UnauthorizedException(
        'You must login to your account to edit your quiz',
      );
    const accessToken = authorization.split('Bearer ')[1];
    const { id } = this.tokenService.getPayloadFromToken(accessToken);
    if (quiz.author === id) return quiz;
    throw new NotAcceptableException('You are not the author of this quiz');
  }
}
