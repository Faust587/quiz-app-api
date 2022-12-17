import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from './question.schema';
import { QuestionDto } from './question.dto';
import { QuestionType } from './enum/question-type';

type TQuestion = {
  id: string;
  name: string,
  type: QuestionType;
  value?: string[];
  isRequired: boolean;
}

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}


  /**
   * Create questions and return array of their id's
   * @param questions
   */
  public createQuestions(questions: QuestionDto[]) {
    return Promise.all(questions.map<Promise<string>>(async (question) => {
      const {
        name,
        type,
        isRequired,
        value,
      } = question;
      switch (type) {
        case QuestionType.TEXT:
          return await this.createTextQuestion(name, isRequired);
        case QuestionType.FLAG:
          return await this.createFlagQuestion(name, isRequired, value);
        case QuestionType.OPTION:
          return await this.createOptionQuestion(name, isRequired, value);
        case QuestionType.SELECT:
          return await this.createSelectQuestion(name, isRequired, value);
        default:
          throw new BadRequestException(`Type {${ type }} is not exists`);
      }
    }));
  }

  public async getQuestionsByIds(ids: string[]): Promise<TQuestion[]> {
    const questionsData = await Promise.all(ids.map(async id => {
      return this.questionModel.findById(id).select(['_id', 'type', 'value', 'isRequired', 'name']);
    }));

    return questionsData.map((question) => {
      if (!question?._id || !question?.type || question?.isRequired === null || !question?.name )
        throw new InternalServerErrorException();
      return {
        id: question._id.toString(),
        type: question.type as QuestionType,
        value: question?.value,
        isRequired: question.isRequired,
        name: question.name
      }
    })
  }

  /**
   * Get data about question and add it to the database, returns question id
   * @param name
   * @param isRequired
   * @private
   */
  private async createTextQuestion(name: string, isRequired: boolean): Promise<string> {
    const { id } = await this.questionModel.create({
      name,
      type: QuestionType.TEXT,
      isRequired,
    });
    return id;
  }

  private async createFlagQuestion(name: string, isRequired: boolean, value: string[]) {
    const { id } = await this.questionModel.create({
      name,
      type: QuestionType.FLAG,
      isRequired,
      value,
    });
    return id;
  }

  private async createOptionQuestion(name: string, isRequired: boolean, value: string[]) {
    const { id } = await this.questionModel.create({
      name,
      type: QuestionType.OPTION,
      isRequired,
      value,
    });
    return id;
  }

  private async createSelectQuestion(name: string, isRequired: boolean, value: string[]) {
    const { id } = await this.questionModel.create({
      name,
      type: QuestionType.SELECT,
      isRequired,
      value,
    });
    return id;
  }
}
