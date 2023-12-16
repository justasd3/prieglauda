import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { AppService } from './user.service';

@Controller('api')
export class UserController {
  constructor(
    private readonly _appService: AppService,
    private _jwtService: JwtService,
  ) {}

  @Post('register')
  async register(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this._appService.create({
      name,
      email,
      password: hashedPassword,
    });

    delete user.password;

    return user;
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this._appService.findOne({ email });
    if (!user) {
      throw new BadRequestException('invalid credentials username');
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('invalid credentials pass');
    }

    const jwt = await this._jwtService.signAsync({ id: user.id });

    response.cookie('jwt', jwt, { httpOnly: true });

    return {
      message: 'success',
    };
  }

  @Get('user')
  async user(@Req() request: Request) {
    try {
      const cookie = request.cookies['jwt'];
      const data = await this._jwtService.verifyAsync(cookie);

      if (!data) {
        throw new UnauthorizedException();
      }

      const user = await this._appService.findOne({ id: data['id'] });

      const { password, ...result } = user;

      return result;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');

    return {
      message: 'success',
    };
  }
}
