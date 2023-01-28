import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz, QuizDocument } from './quiz.schema';
import { CreateQuizDto } from './DTO/create-quiz.dto';
import { CodeGeneratorService } from './code-generator.service';
import { QuestionDto } from '../question/DTO/question.dto';
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
    const { name, onlyAuthUsers, iconURL } = createQuizDto;
    const utc = this.getCurrentUTC();
    const code = await this.codeGeneratorService.getCode(6);
    return await this.quizModel.create({
      name,
      code,
      author: authorId,
      iconURL,
      closed: false,
      onlyAuthUsers,
      lastUpdated: utc,
      questions: [],
    });
  }

  public async refreshQuizCode(quizCode: string) {
    const code = await this.codeGeneratorService.getCode(6);
    const utc = this.getCurrentUTC();
    return this.quizModel
      .findOneAndUpdate(
        { code: quizCode, lastUpdated: utc },
        { code },
        { new: true },
      )
      .select([
        '_id',
        'name',
        'onlyAuthUsers',
        'code',
        'closed',
        'questions',
        'author',
      ]);
  }

  public async updateQuizParameters(
    quizId: string,
    onlyAuthUsers?: boolean,
    closed?: boolean,
    name?: string,
  ) {
    const utc = this.getCurrentUTC();
    const quiz = await this.quizModel.findByIdAndUpdate(
      quizId,
      {
        onlyAuthUsers,
        closed,
        name,
        lastUpdated: utc,
      },
      { new: true },
    );
    if (!quiz) throw new BadRequestException('quiz does not exists');
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

  /**
   * @deprecated The method should not be used
   * Create questions and add their id's to quiz
   * @param code quiz code
   * @param questions questions data
   */
  public async addQuestionToQuiz(code: string, questions: QuestionDto[]) {
    const questionsIds: string[] = await this.questionService.createQuestions(
      questions,
    );
    return this.quizModel.findOneAndUpdate(
      { code },
      { questions: questionsIds },
      { new: true },
    );
  }

  public async deleteQuestionFromQuiz(quizId: string, questionId: string) {
    const quiz = await this.getQuizById(quizId);
    const utc = this.getCurrentUTC();
    const isExists = !!quiz.questions.find(
      (question) => question.id === questionId,
    );

    if (!isExists)
      throw new BadRequestException('This question does not exists');
    await this.quizModel.findByIdAndUpdate(quizId, {
      lastUpdated: utc,
      $pull: {
        questions: questionId,
      },
    });
  }

  public async deleteQuizByCode(code: string) {
    return this.quizModel.deleteOne({ code });
  }

  public async getAllQuizzesByAuthor(authorId: string) {
    return this.quizModel
      .find({ author: authorId })
      .select(['_id', 'name', 'onlyAuthUsers', 'code', 'closed', 'iconURL']);
  }

  public async getQuizByCode(code: string) {
    const quiz = await this.quizModel.findOne({ code });
    if (!quiz)
      throw new BadRequestException('quiz with this code is not exists');
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

  public async getQuizById(id: string) {
    const quiz = await this.quizModel.findById(id);
    if (!quiz) throw new BadRequestException('quiz does not exists');
    const questionIds = quiz.questions;
    const questions = await this.questionService.getQuestionsByIds(questionIds);
    return {
      id: quiz.id,
      name: quiz.name,
      closed: quiz.closed,
      onlyAuthUsers: quiz.onlyAuthUsers,
      code: quiz.code,
      author: quiz.author,
      lastUpdated: quiz.lastUpdated,
      questions,
    };
  }

  public async addQuestionIdToQuiz(quizId: string, questionId: string) {
    const quiz = await this.getQuizById(quizId);
    const utc = this.getCurrentUTC();
    const isExists = !!quiz.questions.find(
      (question) => question.id === questionId,
    );

    if (isExists)
      throw new BadRequestException('This question has been already added');
    await this.quizModel.findByIdAndUpdate(quizId, {
      lastUpdated: utc,
      $push: {
        questions: questionId,
      },
    });
    return this.getQuizById(quizId);
  }
  public getCurrentUTC() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return Date.UTC(year, month, day, hours, minutes);
  }
}
