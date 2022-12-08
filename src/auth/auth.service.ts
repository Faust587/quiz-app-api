import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegistrationUserDto } from './DTO/registration-user.dto';
import { UserLoginDto } from './DTO/user-login.dto';
import { IJwtPayload } from './jwt-payload.interface';
import { compare } from 'bcrypt';
import { TokenService } from '../token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
  ) {}

  async userRegistration(registrationUserDto: RegistrationUserDto) {
    const user = await this.userService.createUser(registrationUserDto);
    const payload: IJwtPayload = {
      id: user._id.toString(),
      activated: false,
    };

    const {
      accessToken,
      refreshToken,
    } = this.tokenService.generateTokensPair(payload);

    await this.tokenService.saveUserRefreshToken(refreshToken, user);

    return {
      refreshToken,
      accessToken,
      user,
    };
  }

  async userLogin(userLoginDto: UserLoginDto) {
    const {
      username,
      password,
    } = userLoginDto;
    const user = await this.userService.getUserByUsername(username);
    if (!user) throw new NotFoundException('Username is not exists');
    const hashedPassword = user.password;
    const compareResult = await compare(password, hashedPassword);
    if (!compareResult) throw new ForbiddenException('Password is not correct');

    const payload: IJwtPayload = {
      id: user._id.toString(),
      activated: false,
    };

    const {
      accessToken,
      refreshToken,
    } = this.tokenService.generateTokensPair(payload);

    await this.tokenService.saveUserRefreshToken(refreshToken, user);

    return {
      refreshToken,
      accessToken,
      user,
    };
  }

  async refreshToken(token: string) {
    const isTokenExistsInDb = await this.tokenService.isRefreshTokenExists(token);
    if (!isTokenExistsInDb) throw new UnauthorizedException("Token is not exists in db");
    await this.tokenService.deleteRefreshTokenByToken(token);
    const payload = this.tokenService.getPayloadFromToken(token);
    const user = await this.userService.getUserById(payload.id);
    if (!user) throw new NotFoundException('This user is not exists');
    const tokensPair = this.tokenService.generateTokensPair(payload);
    await this.tokenService.saveUserRefreshToken(tokensPair.refreshToken, user);
    return tokensPair;
  }
}
