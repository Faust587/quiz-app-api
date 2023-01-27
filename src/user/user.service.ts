import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './model/user.schema';
import { Model } from 'mongoose';
import { genSalt, hash } from 'bcrypt';
import { RegistrationUserDto } from '../auth/DTO/registration-user.dto';
import { CreateUserDto } from './DTO/create-user.dto';
import { TUser } from './user.type';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async createUser(
    registrationUserDto: RegistrationUserDto,
  ): Promise<TUser> {
    const { username, password, email } = registrationUserDto;

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
    const createUserDTO = new CreateUserDto(
      username,
      email,
      hashedPassword,
      salt,
    );

    const user = await this.userModel.create(createUserDTO);
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      activated: user.activated,
    };
  }

  public async getUserById(id: string): Promise<TUser> {
    const user = await this.userModel.findById(id);
    if (!user) throw new BadRequestException('user is not exists');
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      activated: user.activated,
    };
  }

  public async getUserByUsername(username: string): Promise<TUser> {
    const user = await this.userModel.findOne({ username });
    if (!user) throw new BadRequestException('user is not exists');
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      activated: user.activated,
    };
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return await hash(password, salt);
  }

  private async checkUsernameExists(username: string): Promise<boolean> {
    return !!(await this.userModel.findOne({ username }));
  }

  private async checkEmailExists(email: string): Promise<boolean> {
    return !!(await this.userModel.findOne({ email }));
  }
}
