import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  InternalServerErrorException,
  NotAcceptableException,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CreateQuestionDto } from './DTO/create-question.dto';
import { IJwtPayload } from '../auth/jwt-payload.interface';
import { QuizService } from '../quiz/quiz.service';
import { QuestionService } from './question.service';
import { EditQuestionDto } from './DTO/edit-question.dto';
import { DeleteQuestionDto } from './DTO/delete-question.dto';
import { ChangeQuestionOrderDto } from './DTO/change-question-order.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';

@Controller('question')
export class QuestionController {
  constructor(
    private quizService: QuizService,
    private questionService: QuestionService,
  ) {}

  @Post('upload/:questionId')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('questionId') questionId: string,
  ) {
    const question = this.questionService.getQuestionById(questionId);
    const fileExtension = file.originalname.split('.').pop();
    const stream = fs.createWriteStream(
      `src/data/${questionId}.${fileExtension}`,
    );
    try {
      stream.once('open', () => {
        stream.write(file.buffer);
        stream.end();
      });
    } catch (e) {
      throw new InternalServerErrorException(
        `Can not upload file ${file.originalname}`,
      );
    }
    return 'OK';
  }

  @Post()
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  async createQuestion(
    @Req() req: Request,
    @Body() createQuestionDTO: CreateQuestionDto,
  ) {
    const { quizId } = createQuestionDTO;
    const { id } = req.user as IJwtPayload;
    const quiz = await this.quizService.getQuizById(quizId);
    if (quiz.author !== id)
      throw new NotAcceptableException('You are not the author of this quiz');
    const question = await this.questionService.createQuestion(
      createQuestionDTO,
      quiz.questions.length,
    );
    await this.quizService.addQuestionIdToQuiz(quizId, question.id);
    return question;
  }

  @Patch('/change-order')
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  async changeQuestionOrder(
    @Req() req: Request,
    @Body() changeQuestionOrderDto: ChangeQuestionOrderDto,
  ) {
    const { quizId, questionId, questionNewIndex } = changeQuestionOrderDto;
    const { id } = req.user as IJwtPayload;
    const quiz = await this.quizService.getQuizById(quizId);
    if (quiz.author !== id)
      throw new NotAcceptableException('You are not the author of this quiz');
    const isExists = quiz.questions.find((value) => value.id === questionId);
    if (!isExists)
      throw new BadRequestException(
        'This question does not exists in this quiz',
      );
    await this.questionService.changeQuestionOrder(
      questionId,
      quizId,
      questionNewIndex,
      quiz.questions,
    );
    const { questions } = await this.quizService.getQuizById(quizId);
    return questions;
  }

  @Patch()
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  async editQuestionById(
    @Body() editQuestionDto: EditQuestionDto,
    @Req() req: Request,
  ) {
    const { quizId, questionId } = editQuestionDto;
    const { id } = req.user as IJwtPayload;
    const quiz = await this.quizService.getQuizById(quizId);
    if (quiz.author !== id)
      throw new NotAcceptableException('You are not the author of this quiz');
    const isExists = quiz.questions.find((value) => value.id === questionId);
    if (!isExists)
      throw new BadRequestException(
        'This question does not exists in this quiz',
      );
    return await this.questionService.editQuestionById(editQuestionDto);
  }

  @Delete()
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  async deleteQuestionById(
    @Body() deleteQuestionDto: DeleteQuestionDto,
    @Req() req: Request,
  ) {
    const { questionId, quizId } = deleteQuestionDto;
    const { id } = req.user as IJwtPayload;
    const quiz = await this.quizService.getQuizById(quizId);
    if (quiz.author !== id)
      throw new NotAcceptableException('You are not the author of this quiz');
    const isExists = quiz.questions.find((value) => value.id === questionId);
    if (!isExists)
      throw new BadRequestException(
        'This question does not exists in this quiz',
      );
    await this.quizService.deleteQuestionFromQuiz(quizId, questionId);
    return await this.questionService.deleteQuestionById(
      questionId,
      quiz.questions,
    );
  }
}
