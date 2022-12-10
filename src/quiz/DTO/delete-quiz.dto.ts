import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteQuizDto {
  @IsNotEmpty()
  @IsString()
  quizId: string;
}
