import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz, QuizDocument } from './quiz.schema';

@Injectable()
export class CodeGeneratorService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
  ) {}

  private SYMBOLS = [ ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890' ];

  public async getCode(size: number) {
    let code = this.generateCode(size);
    let isUnique = await this.checkCodeIsUnique(code);

    while (!isUnique) {
      console.log(isUnique);
      code = this.generateCode(size);
      isUnique = await this.checkCodeIsUnique(code);
    }

    return code;
  }

  private generateCode(size: number): string {
    let code = '';
    for (let x = 0; x < size; x++) {
      const index = this.getRandomInteger();
      code += this.SYMBOLS[index];
    }
    return code;
  }

  private async checkCodeIsUnique(code: string) {
    return !await this.quizModel.findOne({ code });
  }

  private getRandomInteger() {
    let rand = Math.random() * ( this.SYMBOLS.length );
    return Math.floor(rand);
  }


}
