import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegistrationUserDto } from './DTO/registration-user.dto';
import { UserLoginDto } from './DTO/user-login.dto';
import { IJwtPayload } from './jwt-payload.interface';
import { compare } from 'bcrypt';
import { TokenService } from '../token/token.service';
import { TTokensPair } from '../token/types/tokens-pair.type';
import { TUserAuth } from './types/user-auth.type';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
  ) {}

  public async userRegistration(
    registrationUserDto: RegistrationUserDto,
  ): Promise<TUserAuth> {
    const user = await this.userService.createUser(registrationUserDto);
    const payload: IJwtPayload = {
      id: user.id.toString(),
      activated: false,
    };

    const { accessToken, refreshToken } =
      this.tokenService.generateTokensPair(payload);

    await this.tokenService.saveUserRefreshToken(refreshToken, user.id);

    return {
      refreshToken,
      accessToken,
      user,
    };
  }

  public async userLogin(userLoginDto: UserLoginDto): Promise<TUserAuth> {
    const { username, password } = userLoginDto;
    const user = await this.userService.getUserByUsername(username);
    if (!user) throw new NotFoundException('Username is not exists');
    const hashedPassword = user.password;
    const compareResult = await compare(password, hashedPassword);
    if (!compareResult) throw new ForbiddenException('Password is not correct');

    const payload: IJwtPayload = {
      id: user.id.toString(),
      activated: false,
    };

    const { accessToken, refreshToken } =
      this.tokenService.generateTokensPair(payload);
    await this.tokenService.saveUserRefreshToken(refreshToken, user.id);

    return {
      refreshToken,
      accessToken,
      user,
    };
  }

  public async refreshToken(token: string): Promise<TTokensPair> {
    this.tokenService.checkRefreshToken(token);
    const isTokenExistsInDb = await this.tokenService.isRefreshTokenExists(
      token,
    );
    if (!isTokenExistsInDb)
      throw new UnauthorizedException('Token is not exists in db');
    await this.tokenService.deleteRefreshTokenByToken(token);
    const payload = this.tokenService.getPayloadFromToken(token);
    const user = await this.userService.getUserById(payload.id);
    if (!user) throw new NotFoundException('This user is not exists');
    const tokensPair = this.tokenService.generateTokensPair(payload);
    await this.tokenService.saveUserRefreshToken(
      tokensPair.refreshToken,
      user.id,
    );
    return tokensPair;
  }
}
