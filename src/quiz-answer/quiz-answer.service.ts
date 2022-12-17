import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizAnswer, QuizAnswerDocument } from './model/quiz-answer.schema';
import { AnswerDto } from './DTO/answer.dto';
import { QuizService } from '../quiz/quiz.service';
import { difference, forEach } from 'lodash';
import { QuestionType } from '../question/enum/question-type';

type TFullAnswerWithQuestion = {
  id: string,
  type: QuestionType,
  value?: string[],
  isRequired: boolean,
  name: string,
  answerText?: string,
  answerInt?: number,
  answerArrInt?: number[]
}

@Injectable()
export class QuizAnswerService {
  constructor(
    @InjectModel(QuizAnswer.name) private quizAnswerModel: Model<QuizAnswerDocument>,
    private quizService: QuizService,
  ) {}

  public async getAnswersListByQuizCode(quizCode: string) {
    const { id } = await this.quizService.getQuizByCode(quizCode);
    const answers = await this.quizAnswerModel.find({ quizId: id });
    if (!answers)
      throw new InternalServerErrorException("can not get answers");
    return answers;
  }

  public async createQuizAnswer(answers: AnswerDto[], quizCode: string, authorId?: string) {
    const quiz = await this.quizService.getQuizByCode(quizCode);
    if (!quiz)
      throw new BadRequestException('the answered questions do not match the original questions');
    const questions = quiz.questions;
    const quizId = quiz.id;
    const answersIds = answers.map(answer => answer.id);
    const questionIds = questions.map(question => question?.id);
    const isSame = !difference(answersIds, questionIds).length;
    if (!isSame)
      throw new BadRequestException('the answered questions do not match the original questions');
    const fullAnswerObj: TFullAnswerWithQuestion[] = [];
    for (let i = 0; i < answers.length; i++) {
      const question = questions.find(question => question.id === answers[i].id);
      if (!question)
        throw new InternalServerErrorException();
      fullAnswerObj.push(
        {
          ...answers[i],
          type: question.type,
          value: question.value,
          isRequired: question.isRequired,
          name: question.name,
        },
      );
    }
    fullAnswerObj.forEach((answer, index) => {
      const {
        type,
        isRequired,
      } = answer;
      switch (type) {
        case QuestionType.TEXT: {
          if (!answer.answerText && isRequired)
            throw new BadRequestException(`answer for question [${ index }] is required`);
          break;
        }
        case QuestionType.OPTION: {
          if (!answer.answerInt && isRequired)
            throw new BadRequestException(`answer for question [${ index }] is required`);
          break;
        }
        case QuestionType.FLAG: {
          if (!answer.answerArrInt?.length && isRequired)
            throw new BadRequestException(`answer for question [${ index }] is required`);
          break;
        }
        case QuestionType.SELECT: {
          if (!answer.answerText?.length && isRequired)
            throw new BadRequestException(`answer for question [${ index }] is required`);
        }
      }
    });

    const answersData = fullAnswerObj.map((answer) => {
      const {
        answerText,
        answerInt,
        answerArrInt,
        id,
      } = answer;
      return {
        id,
        answerText,
        answerInt,
        answerArrInt,
      };
    });

    return await this.quizAnswerModel.create({
      quizId,
      authorId: authorId,
      answers: answersData,
    });
  }
}
