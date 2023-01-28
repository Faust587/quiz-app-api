import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { QuizService } from '../quiz/quiz.service';
import { TokenService } from '../token/token.service';

@Injectable()
export class QuizAccessGuard implements CanActivate {
  constructor(
    private quizService: QuizService,
    private tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;
    if (authorization) {
      const token = authorization.split(' ')[1];
      this.tokenService.checkAccessToken(token);
      request.user = this.tokenService.getPayloadFromToken(token);
    }
    const { code } = request.query;
    if (!code) throw new BadRequestException('Code is undefined');
    const { onlyAuthUsers, closed } = await this.quizService.getQuizByCode(
      code,
    );
    if (closed) return false;
    if (!onlyAuthUsers) return true;
    return authorization;
  }
}
