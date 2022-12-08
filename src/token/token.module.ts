import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { RefreshTokenSchema, RefreshToken } from './token.schema';

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature([ {
      name: RefreshToken.name,
      schema: RefreshTokenSchema,
    } ]),
  ],
  providers: [ TokenService ],
  exports: [ TokenService ],
})
export class TokenModule {
}
