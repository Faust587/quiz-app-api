import {
  Controller,
  Get,
  InternalServerErrorException,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QuizIconService } from './quiz-icon.service';

@Controller('quiz-icon')
export class QuizIconController {
  constructor(private quizIconService: QuizIconService) {}
  @Get('/list')
  async getIconsList(@Req() req: Request, @Res() res: Response) {
    const { host } = req.headers;
    if (!host) throw new InternalServerErrorException('HOST IS UNDEFINED');
    const icons = await this.quizIconService.getIconsList(host);
    res.json({ icons });
  }
}
