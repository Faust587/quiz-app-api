import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from './question.schema';
import { QuestionDto } from './DTO/question.dto';
import { QuestionType } from './enum/question-type';
import { CreateQuestionDto } from './DTO/create-question.dto';
import { EditQuestionDto } from './DTO/edit-question.dto';
import { Quiz, QuizDocument } from '../quiz/quiz.schema';
import { QuizService } from '../quiz/quiz.service';

type TQuestion = {
  id: string;
  name: string;
  type: QuestionType;
  index: number;
  value?: string[];
  isRequired: boolean;
};

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
  ) {}

  public async createQuestion(question: CreateQuestionDto, index: number) {
    const { name, isRequired, value, type } = question;
    switch (type) {
      case QuestionType.TEXT:
        return await this.createTextQuestion(name, isRequired, index);
      case QuestionType.FLAG:
        return await this.createFlagQuestion(name, isRequired, value, index);
      case QuestionType.OPTION:
        return await this.createOptionQuestion(name, isRequired, value, index);
      case QuestionType.SELECT:
        return await this.createSelectQuestion(name, isRequired, value, index);
      default:
        throw new BadRequestException(`Type {${type}} is not exists`);
    }
  }

  /**
   * Create questions and return array of their id's
   * @param questions
   */
  public createQuestions(questions: QuestionDto[]) {
    return Promise.all(
      questions.map<Promise<string>>(async (question) => {
        const { name, type, isRequired, value, index } = question;
        switch (type) {
          case QuestionType.TEXT:
            const textQuestion = await this.createTextQuestion(
              name,
              isRequired,
              index,
            );
            return textQuestion.id;
          case QuestionType.FLAG:
            const flagQuestion = await this.createFlagQuestion(
              name,
              isRequired,
              value,
              index,
            );
            return flagQuestion.id;
          case QuestionType.OPTION:
            const optionQuestion = await this.createOptionQuestion(
              name,
              isRequired,
              value,
              index,
            );
            return optionQuestion.id;
          case QuestionType.SELECT:
            const selectQuestion = await this.createSelectQuestion(
              name,
              isRequired,
              value,
              index,
            );
            return selectQuestion.id;
          default:
            throw new BadRequestException(`Type {${type}} is not exists`);
        }
      }),
    );
  }

  public async editQuestionById(question: EditQuestionDto) {
    const { questionId, type, isRequired, value, name } = question;
    return this.questionModel.findByIdAndUpdate(
      questionId,
      {
        name,
        isRequired,
        value,
        type,
      },
      { new: true },
    );
  }

  public async deleteQuestionById(questionId: string, questions: TQuestion[]) {
    const questionForDelete = questions.find(
      (value) => value.id === questionId,
    );

    if (!questionForDelete) {
      throw new BadRequestException('Question does not exists');
    }

    const deletingId = questionForDelete.index;
    const data = await this.questionModel.deleteOne({ _id: questionId });

    const questionsForUpdate = questions.filter((value) => {
      return value.index > deletingId;
    });

    questionsForUpdate.forEach(async (value) => {
      const newIndex = value.index - 1;
      await this.questionModel.findByIdAndUpdate(
        value.id,
        {
          index: newIndex,
        },
        { new: true },
      );
    });

    return data;
  }

  public async getQuestionById(id: string) {
    const question = await this.questionModel.findById(id);
    if (!question)
      throw new BadRequestException(`question with id ${id} does not exists`);
    return {
      id: question.id,
      type: question.type,
      value: question.value,
      isRequired: question.isRequired,
      isFileUploaded: question.isFileUploaded,
      name: question.name,
      index: question.index,
    };
  }

  public async getQuestionsByIds(ids: string[]): Promise<TQuestion[]> {
    const questionsData = await Promise.all(
      ids.map(async (id) => {
        return this.questionModel
          .findById(id)
          .select(['_id', 'type', 'value', 'isRequired', 'name', 'index']);
      }),
    );
    return questionsData.map((question) => {
      if (
        !question?._id ||
        !question?.type ||
        question?.isRequired === null ||
        !question?.name
      )
        throw new InternalServerErrorException();
      return {
        id: question._id.toString(),
        type: question.type as QuestionType,
        value: question?.value,
        isRequired: question.isRequired,
        name: question.name,
        index: question.index,
      };
    });
  }

  public async changeQuestionOrder(
    questionId: string,
    quizId: string,
    newOrder: number,
    quizQuestions: TQuestion[],
  ) {
    const question = await this.questionModel.findById(questionId);
    if (!question) throw new BadRequestException('Question does not exists');

    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) throw new BadRequestException('Quiz does not exists');
    const isExists = quiz.questions.find((value) => value === questionId);
    if (!isExists)
      throw new BadRequestException(
        'This question does not exists in this quiz',
      );
    const currentIndex = question.index;
    if (newOrder > currentIndex) {
      const questionsIds: { id: string; oldIndex: number }[] = [];
      for (let x = 0; x < quiz.questions.length; x++) {
        if (x <= newOrder && x > currentIndex) {
          const question = quizQuestions.find((value) => value.index === x);
          if (!question)
            throw new BadRequestException(`Question ${x} does not exists`);
          questionsIds.push({ id: question.id, oldIndex: question.index - 1 });
        }
      }
      for (const question of questionsIds) {
        await this.questionModel.findByIdAndUpdate(question.id, {
          index: question.oldIndex,
        });
      }
    } else if (newOrder < currentIndex) {
      const questionsIds: { id: string; oldIndex: number }[] = [];
      for (let x = 0; x < quiz.questions.length; x++) {
        if (x < currentIndex && x >= newOrder) {
          const question = quizQuestions.find((value) => value.index === x);
          if (!question)
            throw new BadRequestException(`Question ${x} does not exists`);
          questionsIds.push({ id: question.id, oldIndex: question.index + 1 });
        }
      }
      for (const question of questionsIds) {
        await this.questionModel.findByIdAndUpdate(question.id, {
          index: question.oldIndex,
        });
      }
    } else {
      throw new BadRequestException('Orders are the same');
    }
    await this.questionModel.findByIdAndUpdate(questionId, { index: newOrder });
  }

  /**
   * Get data about question and add it to the database, returns question id
   * @param name
   * @param isRequired
   * @param index
   * @private
   */
  private async createTextQuestion(
    name: string,
    isRequired: boolean,
    index: number,
  ) {
    return await this.questionModel.create({
      name,
      type: QuestionType.TEXT,
      isRequired,
      index,
    });
  }

  private async createFlagQuestion(
    name: string,
    isRequired: boolean,
    value: string[],
    index: number,
  ) {
    return await this.questionModel.create({
      name,
      type: QuestionType.FLAG,
      isRequired,
      value,
      index,
    });
  }

  private async createOptionQuestion(
    name: string,
    isRequired: boolean,
    value: string[],
    index: number,
  ) {
    return await this.questionModel.create({
      name,
      type: QuestionType.OPTION,
      isRequired,
      value,
      index,
    });
  }

  private async createSelectQuestion(
    name: string,
    isRequired: boolean,
    value: string[],
    index: number,
  ) {
    return await this.questionModel.create({
      name,
      type: QuestionType.SELECT,
      isRequired,
      value,
      index,
    });
  }
}
