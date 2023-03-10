import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizAnswer, QuizAnswerDocument } from './model/quiz-answer.schema';
import { AnswerDto } from './DTO/answer.dto';
import { QuizService } from '../quiz/quiz.service';
import { QuestionType } from '../question/enum/question-type';
import { isNumber } from 'lodash';
import { Answer, AnswerDocument } from './model/answer.schema';

@Injectable()
export class QuizAnswerService {
  constructor(
    @InjectModel(QuizAnswer.name)
    private quizAnswerModel: Model<QuizAnswerDocument>,
    @InjectModel(Answer.name)
    private answerModel: Model<AnswerDocument>,
    private quizService: QuizService,
  ) {}

  public async getAnswersListByQuizCode(quizCode: string) {
    const { id } = await this.quizService.getQuizByCode(quizCode);
    const answers = await this.quizAnswerModel.find({ quizId: id });
    if (!answers) throw new InternalServerErrorException('can not get answers');
    return answers;
  }

  public async createQuizAnswer(
    answers: AnswerDto[],
    quizCode: string,
    authorId?: string,
  ) {
    const { questions, id } = await this.quizService.getQuizByCode(quizCode);
    const answersIds: string[] = [];
    for (const question of questions) {
      const answer = answers.find(
        (answer) => answer.questionId === question.id,
      );
      if (!answer)
        throw new BadRequestException({
          type: 'NO_ANSWER',
          message: `THERE IS NO ANSWER TO QUESTION`,
        });
      if (question.isRequired) {
        switch (question.type) {
          case QuestionType.FLAG: {
            if (!answer.answerArrInt.length)
              throw new BadRequestException(
                `answer for question ${question.index} is required!`,
              );
            break;
          }
          case QuestionType.SELECT:
          case QuestionType.OPTION: {
            if (!isNumber(answer.answerInt) || answer.answerInt < 0)
              throw new BadRequestException(
                `answer for question ${question.index} is required!`,
              );
            break;
          }
          case QuestionType.TEXT: {
            if (answer.answerText.length === 0)
              throw new BadRequestException(
                `answer for question ${question.index} is required!`,
              );
            break;
          }
          default: {
            throw new BadRequestException(
              `type for this question does not exists`,
            );
          }
        }
      }
      const answerId = await this.createAnswer(
        question.name,
        question.type,
        question.isRequired,
        question.index,
        question.value,
        answer.answerText,
        answer.answerInt,
        answer.answerArrInt,
      );
      answersIds.push(answerId);
    }
    const utc = this.quizService.getCurrentUTC();
    return this.quizAnswerModel.create({
      quizId: id,
      authorId,
      answers: answersIds,
      answeredAt: utc,
    });
  }

  private async createAnswer(
    name: string,
    type: string,
    isRequired: boolean,
    index: number,
    value: string[] = [],
    answerText = '',
    answerInt: number | null = null,
    answerArrInt: number[] = [],
  ): Promise<string> {
    const answer = await this.answerModel.create({
      name,
      type,
      isRequired,
      index,
      value,
      answerText,
      answerInt,
      answerArrInt,
    });
    return answer.id;
  }
}
