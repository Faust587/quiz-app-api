import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz, QuizDocument } from './quiz.schema';
import { CreateQuizDto } from './DTO/create-quiz.dto';
import { CodeGeneratorService } from './code-generator.service';
import { QuestionDto } from './DTO/question.dto';

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

  public async addQuestionToQuiz(quizId: string, questions: QuestionDto[]) {
    return await this.quizModel.findByIdAndUpdate(quizId, { questions }).catch(e => {
      if (e.kind === 'ObjectId') {
        throw new BadRequestException('quizId is not exists');
      }
      throw new InternalServerErrorException();
    });
  }

  public async checkQuizAuthor(quizId: string, authorId: string) {
    const quiz = await this.quizModel.findById(quizId);

    if (!quiz) throw new BadRequestException('quiz id is not exists');
    if (quiz.author !== authorId) throw new ForbiddenException('this quiz is not yours');
  }

  public async deleteQuiz(quizId: string) {

  }
}
