import { BadRequestException, Controller, Get, InternalServerErrorException, Param, Req, Res } from '@nestjs/common';
import {readFile, readdir} from 'fs';
import { Request, Response } from 'express';

@Controller('quiz-icon')
export class QuizIconController {
  constructor() {}

  @Get('/list')
  async getIconsList(@Req() req: Request, @Res() res: Response) {
    const { host } = req.headers;
    readdir('./src/data/images/', (err, files) => {
      if (err) throw new InternalServerErrorException('Server error');
      const iconsURL = files.map(icon => `http://${ host }/quiz-icon/${ icon }`);
      res.json({ icons: iconsURL });
    });
  }

  @Get('/:iconName')
  async getIconByName(@Res() res: Response, @Param('iconName') iconName: string) {
    readFile(`./src/data/images/${ iconName }`, { encoding: 'utf8' }, (err, data) => {
      if (err) res.send(new BadRequestException('Icon name is not valid'));
      res.send(data);
    });
  }
}
