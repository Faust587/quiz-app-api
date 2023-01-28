import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizAnswer, QuizAnswerDocument } from './model/quiz-answer.schema';
import { AnswerDto } from './DTO/answer.dto';
import { QuizService } from '../quiz/quiz.service';
import { QuestionType } from '../question/enum/question-type';

type TFullAnswerWithQuestion = {
  id: string;
  type: QuestionType;
  value?: string[];
  isRequired: boolean;
  name: string;
  answerText?: string;
  answerInt?: number;
  answerArrInt?: number[];
};

@Injectable()
export class QuizAnswerService {
  constructor(
    @InjectModel(QuizAnswer.name)
    private quizAnswerModel: Model<QuizAnswerDocument>,
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
    console.log(answers);
  }
}
