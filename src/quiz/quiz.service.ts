import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz, QuizDocument } from './quiz.schema';
import { CreateQuizDto } from './DTO/create-quiz.dto';
import { CodeGeneratorService } from './code-generator.service';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    private codeGeneratorService: CodeGeneratorService,
  ) {}

  public async createQuiz(createQuizDto: CreateQuizDto, authorId: string) {
    const { name } = createQuizDto;
    const code = await this.codeGeneratorService.getCode(6);
    const quiz = await this.quizModel.create({
      name: name,
      code: code,
      author: authorId,
    });

    return quiz;
  }
}
