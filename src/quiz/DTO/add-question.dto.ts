export class AddQuestionDto {
  questions: {
    name: string;
    type: string;
    value: string[];
    isRequired: boolean;
  }[];
}


