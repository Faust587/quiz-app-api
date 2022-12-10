import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IJwtPayload } from '../auth/jwt-payload.interface';
import { AddQuestionsDto } from './DTO/add-questions.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Quiz, QuizDocument } from './quiz.schema';
import { Model } from 'mongoose';
import { DeleteQuizDto } from './DTO/delete-quiz.dto';

@Injectable()
export class QuizAuthorGuard implements CanActivate {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { id } = request.user as IJwtPayload;
    const { quizId } = request.body as AddQuestionsDto | DeleteQuizDto;

    const quiz = await this.quizModel.findById(quizId).catch(e => {
      if (e.kind === 'ObjectId')
        throw new BadRequestException('quizId is not exists');
      throw new InternalServerErrorException("Database error");
    });
    if (!quiz) throw new BadRequestException('Quiz with this id does not exists');
    if (quiz.author !== id) throw new ForbiddenException('You are not the author of this quiz');
    return true;
  }
}
