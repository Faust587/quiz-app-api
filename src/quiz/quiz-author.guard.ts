import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IJwtPayload } from '../auth/jwt-payload.interface';
import { QuizService } from './quiz.service';

@Injectable()
export class QuizAuthorGuard implements CanActivate {
  constructor(
    private quizService: QuizService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { id } = request.user as IJwtPayload;
    const { code } = request.query;
    const quiz = await this.quizService.getQuizByCode(code);
    if (quiz === null)
      throw new NotFoundException(`Quiz with code: ${ code } is not exists`);
    if (quiz.author !== id)
      throw new ForbiddenException('You are not the author of this quiz');
    return true;
  }
}
