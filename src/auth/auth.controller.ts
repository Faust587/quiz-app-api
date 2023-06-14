import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrationUserDto } from './DTO/registration-user.dto';
import { Request, Response } from 'express';
import { UserLoginDto } from './DTO/user-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  @UsePipes(ValidationPipe)
  async registration(
    @Res() res: Response,
    @Body() registrationUserDto: RegistrationUserDto,
  ) {
    const { refreshToken, accessToken, user } =
      await this.authService.userRegistration(registrationUserDto);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
    });
    res.json({
      user,
      accessToken,
    });
  }

  @Post('/login')
  @UsePipes(ValidationPipe)
  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Body() userLoginDto: UserLoginDto,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.userLogin(userLoginDto);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
    });
    res.json({
      user,
      accessToken,
    });
  }

  @Get('/refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    console.log(1);
    const { refreshToken } = req.cookies;
    if (!refreshToken)
      throw new UnauthorizedException('There is no refresh token in cookies');

    const tokensPair = await this.authService.refreshToken(refreshToken);
    res.clearCookie('refreshToken');
    res.cookie('refreshToken', tokensPair.refreshToken, {
      httpOnly: true,
    });
    res.json({ accessToken: tokensPair.accessToken });
  }
}
