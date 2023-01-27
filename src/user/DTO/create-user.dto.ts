export class CreateUserDto {
  constructor(
    public username: string,
    public email: string,
    public password: string,
    public salt: string,
  ) {}
}
