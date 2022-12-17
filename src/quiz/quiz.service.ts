import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz, QuizDocument } from './quiz.schema';
import { CreateQuizDto } from './DTO/create-quiz.dto';
import { CodeGeneratorService } from './code-generator.service';
import { QuestionDto } from '../question/question.dto';
import { Question, QuestionDocument } from '../question/question.schema';
import { QuestionService } from '../question/question.service';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    private codeGeneratorService: CodeGeneratorService,
    private questionService: QuestionService,
  ) {}

  public async createQuiz(createQuizDto: CreateQuizDto, authorId: string) {
    const {
      name,
      onlyAuthUsers,
    } = createQuizDto;
    const code = await this.codeGeneratorService.getCode(6);
    return await this.quizModel.create({
      name,
      code,
      author: authorId,
      closed: false,
      onlyAuthUsers,
    });
  }

  public async refreshQuizCode(quizCode: string) {
    const code = await this.codeGeneratorService.getCode(6);
    return this.quizModel.findOneAndUpdate({ code: quizCode }, { code }, { new: true })
      .select([ '_id', 'name', 'onlyAuthUsers', 'code', 'closed' ]);
  }

  public async updateQuizParameters(quizCode: string, onlyAuthUsers?: boolean, closed?: boolean, name?: string) {
    return this.quizModel.findOneAndUpdate({ code: quizCode }, {
      onlyAuthUsers,
      closed,
      name
    }, { new: true })
      .select([ '_id', 'name', 'onlyAuthUsers', 'code', 'closed' ]);
  }

  /**
   * Create questions and add their id's to quiz
   * @param code quiz code
   * @param questions questions data
   */
  public async addQuestionToQuiz(code: string, questions: QuestionDto[]) {
    const questionsIds: string[] = await this.questionService.createQuestions(questions);
    return this.quizModel.findOneAndUpdate(
      { code },
      { questions: questionsIds },
      { new: true },
    );
  }

  public async deleteQuizByCode(code: string) {
    return this.quizModel.deleteOne({ code });
  }

  public async getAllQuizzesByAuthor(authorId: string) {
    return this.quizModel.find({ author: authorId }).select([ '_id', 'name', 'onlyAuthUsers', 'code', 'closed' ]);
  }

  public async getQuizByCode(code: string) {
    const quiz = await this.quizModel.findOne({ code });
    if (!quiz) throw new BadRequestException('quiz with this code is not exists');
    const questionIds = quiz.questions;
    const questions = await this.questionService.getQuestionsByIds(questionIds);
    return {
      id: quiz.id,
      name: quiz.name,
      closed: quiz.closed,
      onlyAuthUsers: quiz.onlyAuthUsers,
      code: quiz.code,
      author: quiz.author,
      questions,
    };
  }
}
