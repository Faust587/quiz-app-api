import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotAcceptableException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CreateQuestionDto } from './DTO/create-question.dto';
import { IJwtPayload } from '../auth/jwt-payload.interface';
import { QuizService } from '../quiz/quiz.service';
import { QuestionService } from './question.service';
import { EditQuestionDto } from './DTO/edit-question.dto';
import { DeleteQuestionDto } from './DTO/delete-question.dto';
import { ChangeQuestionOrderDto } from './DTO/change-question-order.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { TokenService } from 'src/token/token.service';

@Controller('question')
export class QuestionController {
  constructor(
    private quizService: QuizService,
    private questionService: QuestionService,
    private tokenService: TokenService,
  ) {}

  @Post('upload/:quizId/:questionId')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('questionId') questionId: string,
    @Param('quizId') quizId: string,
    @Req() req: Request,
  ) {
    const { id } = req.user as IJwtPayload;
    const quiz = await this.quizService.getQuizById(quizId);
    const isExists = !!quiz.questions.find((value) => value.id === questionId);
    if (!isExists) {
      throw new BadRequestException("Question don't exists on this quiz");
    }
    if (quiz.author !== id)
      throw new NotAcceptableException('You are not the author of this quiz');
    await this.questionService.getQuestionById(questionId);
    const question = await this.questionService.addQuestionAttachment(
      questionId,
      file,
    );
    return question;
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

  @Get('attachment/:quizId/:questionId')
  async downloadAttachment(
    @Res() res: Response,
    @Req() req: Request,
    @Param('questionId') questionId: string,
    @Param('quizId') quizId: string,
  ) {
    const { authorization } = req.headers;
    const quiz = await this.quizService.getQuizById(quizId);
    const isExists = !!quiz.questions.find((value) => value.id === questionId);
    if (!isExists) {
      throw new BadRequestException("Question don't exists on this quiz");
    }
    if (quiz.onlyAuthUsers) {
      if (!authorization)
        throw new UnauthorizedException('This quiz only for registered users');
      const accessToken = authorization.split('Bearer ')[1];
      const { id } = this.tokenService.checkAccessToken(
        accessToken,
      ) as IJwtPayload;
      if (!id) throw new UnauthorizedException('Only for authorized users');
    }
    if (quiz.closed) {
      if (!authorization)
        throw new UnauthorizedException('This quiz only for registered users');
      const accessToken = authorization.split('Bearer ')[1];
      const { id } = this.tokenService.checkAccessToken(
        accessToken,
      ) as IJwtPayload;
      if (quiz.author !== id)
        throw new NotAcceptableException('Quiz is closed');
    }
    const question = await this.questionService.getQuestionById(questionId);
    if (!question)
      throw new BadRequestException('This question does not exists');
    if (!question.attachmentName)
      throw new BadRequestException('This question does not have attachment');
    const fileName = await this.questionService.downloadAttachment(questionId);
    const fileExtension = this.questionService.getFileExtensionFromString(
      question.attachmentName,
    );
    const file = `./src/data/${fileName}.${fileExtension}`;
    res.download(file);
  }

  @Delete('attachment/:quizId/:questionId')
  @UseGuards(AuthGuard())
  async deleteQuestionAttachment(
    @Req() req: Request,
    @Param('questionId') questionId: string,
    @Param('quizId') quizId: string,
  ) {
    const { id } = req.user as IJwtPayload;
    const quiz = await this.quizService.getQuizById(quizId);
    const isExists = !!quiz.questions.find((value) => value.id === questionId);
    if (!isExists) {
      throw new BadRequestException("Question don't exists on this quiz");
    }
    if (quiz.author !== id)
      throw new NotAcceptableException('You are not the author of this quiz');
    return this.questionService.deleteQuestionAttachmentById(questionId);
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
