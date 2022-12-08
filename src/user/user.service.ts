import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { Model } from 'mongoose';
import { genSalt, hash } from 'bcrypt';
import { RegistrationUserDto } from '../auth/DTO/registration-user.dto';
import { CreateUserDto } from './DTO/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async createUser(registrationUserDto: RegistrationUserDto) {
    const {username, password, email} = registrationUserDto;

    const errors: string[] = [];

    const isUsernameExists = await this.checkUsernameExists(username);
    if (isUsernameExists) errors.push('This username is busy');

    const isEmailExists = await this.checkEmailExists(email);
    if (isEmailExists) errors.push('This email is busy');

    if (errors.length) {
      throw new ConflictException({ error: errors });
    }

    const salt = await genSalt();
    const hashedPassword = await this.hashPassword(password, salt);
    const createUserDTO = new CreateUserDto(username, email, hashedPassword, salt);

    return await this.userModel.create(createUserDTO);
  }

  public async getUserById(id: string) {
    return this.userModel.findById(id);
  }

  public async getUserByUsername(username: string) {
    return this.userModel.findOne({username})
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return await hash(password, salt);
  }

  private async checkUsernameExists(username: string): Promise<boolean> {
    return !!await this.userModel.findOne({ username });
  }

  private async checkEmailExists(email: string): Promise<boolean> {
    return !!await this.userModel.findOne({ email });
  }
}
