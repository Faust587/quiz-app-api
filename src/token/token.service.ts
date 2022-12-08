import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { IJwtPayload } from '../auth/jwt-payload.interface';
import { RefreshToken, RefreshTokenDocument } from './token.schema';
import { User } from '../user/user.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshTokenDocument>,
    private jwtService: JwtService,
  ) {}

  public generateTokensPair(payload: IJwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: 1200,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: 2400,
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  public async isRefreshTokenExists(token: string) {
    return !!await this.refreshTokenModel.findOne({ token });
  }

  public async deleteRefreshTokenByToken(token: string) {
    await this.refreshTokenModel.findOneAndDelete({ token });
  }

  public getPayloadFromToken(token: string) {
    const {
      id,
      activated,
    } = this.jwtService.decode(token) as IJwtPayload;
    return {
      id,
      activated,
    };
  }

  public async saveUserRefreshToken(token: string, user: User) {
    return await this.refreshTokenModel.create({
      token,
      user,
    });
  }
}
