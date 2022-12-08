import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    UserModule,
    TokenModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
    }),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  providers: [ AuthService, JwtStrategy, JwtService ],
  controllers: [ AuthController ],
  exports: [ JwtStrategy, PassportModule ],
})
export class AuthModule {
}
