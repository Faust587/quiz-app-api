import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { IJwtPayload } from '../auth/jwt-payload.interface';
import { RefreshToken, RefreshTokenDocument } from './model/token.schema';
import { InjectModel } from '@nestjs/mongoose';
import { TTokensPair } from './types/tokens-pair.type';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    private jwtService: JwtService,
  ) {}

  public generateTokensPair(payload: IJwtPayload): TTokensPair {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: 99999999999,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: 30000,
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  public async isRefreshTokenExists(token: string): Promise<boolean> {
    const foundToken = await this.refreshTokenModel.findOne({ token });
    return !!foundToken;
  }

  public async deleteRefreshTokenByToken(token: string): Promise<void> {
    await this.refreshTokenModel.findOneAndDelete({ token });
  }

  public checkRefreshToken(token: string): void {
    try {
      this.jwtService.verify(token, { secret: process.env.JWT_SECRET_KEY });
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  public getPayloadFromToken(token: string): IJwtPayload {
    const { id, activated } = this.jwtService.decode(token) as IJwtPayload;
    return {
      id,
      activated,
    };
  }

  public async saveUserRefreshToken(token: string, userId: string) {
    return await this.refreshTokenModel.create({
      token,
      user: userId,
    });
  }

  public checkAccessToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
    } catch (e) {
      throw new UnauthorizedException('token is not valid');
    }
  }
}
