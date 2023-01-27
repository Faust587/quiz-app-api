import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { readdir } from 'fs';

@Injectable()
export class QuizIconService {
  public async getIconsList(host: string): Promise<string[]> {
    return new Promise((resolve) => {
      readdir('./public', (err, files) => {
        if (err) throw new InternalServerErrorException('Server error');
        const icons = files.map((icon) => `http://${host}/public/${icon}`);
        resolve(icons);
      });
    });
  }
}
